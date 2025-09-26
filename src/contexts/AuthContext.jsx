import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);

    // Register new user
    async function signup(email, password, userData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user display name
        await updateProfile(user, {
            displayName: userData.name
        });

        // Create user profile in Firestore
        await setDoc(doc(db, 'consultants', user.uid), {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            company: userData.company,
            plan: userData.plan,
            createdAt: new Date(),
            active: true
        });

        // Create initial subscription
        const planData = getPlanData(userData.plan);
        await createInitialSubscription(user.uid, planData);

        return userCredential;
    }

    // Get plan data based on plan name
    function getPlanData(planName) {
        const plans = {
            'Rookie': {
                name: 'Rookie',
                price: 5,
                annualPrice: 50,
                clientLimit: 50,
                volumeLimit: 25000
            },
            'Professional': {
                name: 'Professional',
                price: 9,
                annualPrice: 90,
                clientLimit: 200,
                volumeLimit: 100000
            },
            'Shark': {
                name: 'Shark',
                price: 25,
                annualPrice: 250,
                clientLimit: 'unlimited',
                volumeLimit: 'unlimited'
            }
        };

        return plans[planName] || plans['Professional'];
    }

    // Create initial subscription
    async function createInitialSubscription(userId, planData) {
        const subscriptionData = {
            plan: planData.name,
            price: planData.price,
            annualPrice: planData.annualPrice,
            clientLimit: planData.clientLimit,
            volumeLimit: planData.volumeLimit,
            cycle: 'monthly',
            status: 'active',
            createdAt: new Date(),
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastPayment: {
                date: new Date(),
                amount: planData.price,
                status: 'pending'
            },
            paymentMethod: 'pending',
            trial: true,
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        };

        await setDoc(doc(db, 'subscriptions', userId), subscriptionData);
    }

    // Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout
    function logout() {
        return signOut(auth);
    }

    // Load user profile
    async function loadUserProfile(uid) {
        try {
            const docRef = doc(db, 'consultants', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                await loadUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}