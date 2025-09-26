/**
 * AUTH CONTEXT - RealEstateCRM Pro
 * Enhanced authentication with multi-tenant support
 * Includes password reset, email verification, and session management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { PLANS, createSubscriptionData } from '../models/subscriptionModel';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [sessionTimeout, setSessionTimeout] = useState(null);

    // Session timeout duration (30 minutes of inactivity)
    const SESSION_TIMEOUT = 30 * 60 * 1000;

    // Register new consultant
    async function signup(email, password, userData) {
        try {
            // Create auth user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update display name
            await updateProfile(user, {
                displayName: userData.name
            });

            // Send email verification
            await sendEmailVerification(user);

            // Create consultant profile in Firestore
            const consultantData = {
                uid: user.uid,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                company: userData.company || '',
                plan: userData.plan || 'Professional',
                emailVerified: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                active: true,
                settings: {
                    language: 'pt',
                    notifications: true,
                    theme: 'light'
                }
            };

            await setDoc(doc(db, 'consultants', user.uid), consultantData);

            // Create initial subscription
            const planData = PLANS[userData.plan?.toUpperCase() || 'PROFESSIONAL'];
            const subscriptionData = createSubscriptionData(
                planData.id,
                user.uid,
                'pending'
            );
            
            await setDoc(doc(db, 'subscriptions', user.uid), subscriptionData);

            // Log the registration
            await logActivity(user.uid, 'account_created', {
                plan: userData.plan,
                email: userData.email
            });

            return userCredential;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    // Login
    async function login(email, password, rememberMe = false) {
        try {
            // Set persistence based on remember me
            const persistence = rememberMe ? 'local' : 'session';
            await auth.setPersistence(persistence);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Update last login
            await updateDoc(doc(db, 'consultants', userCredential.user.uid), {
                lastLogin: serverTimestamp(),
                lastLoginIP: await getUserIP() // Optional: implement IP tracking
            });

            // Log the login
            await logActivity(userCredential.user.uid, 'login', {
                timestamp: new Date().toISOString()
            });

            // Start session timeout
            resetSessionTimeout();

            return userCredential;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout
    async function logout() {
        try {
            if (currentUser) {
                // Log the logout
                await logActivity(currentUser.uid, 'logout', {
                    timestamp: new Date().toISOString()
                });
            }

            // Clear session timeout
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }

            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Send password reset email
    async function resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            
            // Log password reset request
            const userDoc = await getUserByEmail(email);
            if (userDoc) {
                await logActivity(userDoc.uid, 'password_reset_requested', {
                    email,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    // Change password
    async function changePassword(currentPassword, newPassword) {
        if (!currentUser) throw new Error('No user logged in');

        try {
            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(currentUser, credential);

            // Update password
            await updatePassword(currentUser, newPassword);

            // Log password change
            await logActivity(currentUser.uid, 'password_changed', {
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    // Update profile
    async function updateUserProfile(updates) {
        if (!currentUser) throw new Error('No user logged in');

        try {
            // Update auth profile if display name changed
            if (updates.name && updates.name !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: updates.name
                });
            }

            // Update Firestore profile
            const profileUpdates = {
                ...updates,
                updatedAt: serverTimestamp()
            };
            
            await updateDoc(doc(db, 'consultants', currentUser.uid), profileUpdates);

            // Reload profile
            await loadUserProfile(currentUser.uid);

            // Log profile update
            await logActivity(currentUser.uid, 'profile_updated', {
                fields: Object.keys(updates)
            });
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Load user profile from Firestore
    async function loadUserProfile(uid) {
        try {
            const docRef = doc(db, 'consultants', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const profile = docSnap.data();
                setUserProfile(profile);
                return profile;
            }
            return null;
        } catch (error) {
            console.error('Error loading profile:', error);
            return null;
        }
    }

    // Get user by email (helper function)
    async function getUserByEmail(email) {
        try {
            const usersRef = collection(db, 'consultants');
            const q = query(usersRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
            }
            return null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    }

    // Log user activity
    async function logActivity(uid, action, metadata = {}) {
        try {
            const activityData = {
                uid,
                action,
                metadata,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };

            // Store in activity log collection
            await addDoc(collection(db, 'activity_logs'), activityData);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // Get user IP (optional implementation)
    async function getUserIP() {
        try {
            // You can use a service like ipapi.co or ipify
            // const response = await fetch('https://api.ipify.org?format=json');
            // const data = await response.json();
            // return data.ip;
            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    // Session timeout management
    function resetSessionTimeout() {
        // Clear existing timeout
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            console.log('Session expired due to inactivity');
            logout();
        }, SESSION_TIMEOUT);

        setSessionTimeout(timeout);
    }

    // Reset timeout on user activity
    useEffect(() => {
        if (currentUser) {
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
            
            const resetTimeout = () => {
                resetSessionTimeout();
            };

            events.forEach(event => {
                document.addEventListener(event, resetTimeout);
            });

            return () => {
                events.forEach(event => {
                    document.removeEventListener(event, resetTimeout);
                });
            };
        }
    }, [currentUser]);

    // Check email verification status
    async function checkEmailVerification() {
        if (!currentUser) return false;

        await currentUser.reload();
        
        if (currentUser.emailVerified && userProfile && !userProfile.emailVerified) {
            // Update profile if email is now verified
            await updateDoc(doc(db, 'consultants', currentUser.uid), {
                emailVerified: true,
                emailVerifiedAt: serverTimestamp()
            });
            
            await loadUserProfile(currentUser.uid);
        }
        
        return currentUser.emailVerified;
    }

    // Resend verification email
    async function resendVerificationEmail() {
        if (!currentUser) throw new Error('No user logged in');
        
        try {
            await sendEmailVerification(currentUser);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }

    // Auth state observer
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                // Load user profile
                await loadUserProfile(user.uid);
                
                // Start session timeout
                resetSessionTimeout();
                
                // Check email verification
                checkEmailVerification();
            } else {
                setUserProfile(null);
                
                // Clear session timeout
                if (sessionTimeout) {
                    clearTimeout(sessionTimeout);
                }
            }

            setLoading(false);
        });

        return () => {
            unsubscribe();
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
        };
    }, []);

    const value = {
        // User state
        currentUser,
        userProfile,
        loading,
        
        // Auth functions
        signup,
        login,
        logout,
        
        // Password functions
        resetPassword,
        changePassword,
        
        // Profile functions
        updateUserProfile,
        loadUserProfile,
        
        // Email verification
        checkEmailVerification,
        resendVerificationEmail,
        isEmailVerified: currentUser?.emailVerified || false,
        
        // Helpers
        isAuthenticated: !!currentUser,
        consultantId: currentUser?.uid,
        
        // Session management
        resetSessionTimeout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// HOC for protected components
export function withAuth(Component) {
    return function ProtectedComponent(props) {
        const { currentUser, loading } = useAuth();
        
        if (loading) {
            return <div>Loading...</div>;
        }
        
        if (!currentUser) {
            // Note: Navigate needs to be imported where this HOC is used
            window.location.href = '/login';
            return null;
        }
        
        return <Component {...props} />;
    };
}