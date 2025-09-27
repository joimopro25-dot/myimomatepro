/**
 * AUTH CONTEXT - RealEstateCRM Pro
 * Fixed for Firebase v12 compatibility
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import { app, db } from '../firebase';

// Initialize auth with the app instance
const auth = getAuth(app);

// Create context with default values to avoid errors
const AuthContext = createContext({
  currentUser: null,
  userProfile: null,
  loading: true,
  authError: null,
  isAuthenticated: false,
  isEmailVerified: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  resendVerificationEmail: async () => {},
  updateUserProfile: async () => {},
  changePassword: async () => {},
  loadUserProfile: async () => {},
  clearError: () => {}
});

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Provider Component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user profile from Firestore
  const loadUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return null;
    }

    try {
      const profileDoc = await getDoc(doc(db, 'consultants', user.uid));
      
      if (profileDoc.exists()) {
        const profile = {
          id: profileDoc.id,
          ...profileDoc.data()
        };
        setUserProfile(profile);
        return profile;
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          role: 'consultant',
          settings: {
            language: 'pt',
            theme: 'light',
            notifications: true
          }
        };

        await setDoc(doc(db, 'consultants', user.uid), newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthError(error.message);
      return null;
    }
  };

  // Sign up with email and password
  const signup = async (email, password, displayName = '') => {
    setAuthError(null);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Send verification email
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const profile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || '',
        photoURL: '',
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        role: 'consultant',
        subscriptionPlan: 'rookie', // Default plan
        settings: {
          language: 'pt',
          theme: 'light',
          notifications: true
        }
      };

      await setDoc(doc(db, 'consultants', user.uid), profile);
      
      // Load the profile
      await loadUserProfile(user);

      console.log('Signup successful:', user.email);
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Load user profile
      await loadUserProfile(user);

      // Update last login
      await updateDoc(doc(db, 'consultants', user.uid), {
        lastLoginAt: serverTimestamp()
      });

      console.log('Login successful:', user.email);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent to:', email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    setAuthError(null);
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await sendEmailVerification(currentUser);
      console.log('Verification email sent');
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    setAuthError(null);
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update Firebase Auth profile if display name or photo changed
      if (updates.displayName !== undefined || updates.photoURL !== undefined) {
        const authUpdates = {};
        if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
        if (updates.photoURL !== undefined) authUpdates.photoURL = updates.photoURL;
        
        await updateProfile(currentUser, authUpdates);
      }

      // Update Firestore profile
      await updateDoc(doc(db, 'consultants', currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Reload profile
      await loadUserProfile(currentUser);

      console.log('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    setAuthError(null);
    if (!currentUser || !currentUser.email) {
      throw new Error('No user logged in');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      console.log('Password changed successfully');
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      
      if (user) {
        setCurrentUser(user);
        await loadUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Context value
  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    authError,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false,
    
    // Methods
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    updateUserProfile,
    changePassword,
    loadUserProfile,
    
    // Clear error
    clearError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}