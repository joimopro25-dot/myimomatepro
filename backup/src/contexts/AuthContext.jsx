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
            displayName: userData.name  // Changed from userData.nome
        });

        // Create user profile in Firestore
        await setDoc(doc(db, 'consultants', user.uid), {
            name: userData.name,
            email: userData.email,  // Added email field
            phone: userData.phone,
            company: userData.company,
            plan: userData.plan,
            createdAt: new Date(),
            active: true
        });

        // Create initial subscription
        const planData = getPlanData(userData.plan);  // Changed from getPlanoData(userData.plano)
        await createInitialSubscription(user.uid, planData);

        return userCredential;
    }

    // Get plan data based on name
    function getPlanData(planName) {  // Changed from getPlanoData(nomePlano)
        const plans = {  // Changed from planos
            'Rookie': {
                name: 'Rookie',           // Changed from nome
                price: 5,                 // Changed from preco and converted to number
                annualPrice: 50,          // Changed from precoAnual and converted to number
                clientLimit: 50,          // Changed from limiteClientes
                volumeLimit: 25000        // Changed from limiteVolumeNegocios
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
            plan: planData.name,              // Changed from plano
            price: planData.price,            // Changed from preco
            annualPrice: planData.annualPrice, // Changed from precoAnual
            clientLimit: planData.clientLimit, // Changed from limiteClientes
            volumeLimit: planData.volumeLimit, // Changed from limiteVolumeNegocios
            cycle: 'monthly',                 // Changed from 'mensal'
            status: 'active',
            createdAt: new Date(),           // Changed from criadoEm
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Changed from proximoPagamento
            lastPayment: {                   // Changed from ultimoPagamento
                date: new Date(),             // Changed from data
                amount: planData.price,       // Changed from valor
                status: 'pending'
            },
            paymentMethod: 'pending',        // Changed from metodoPagamento
            trial: true,
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Changed from trialFim
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
            const docRef = doc(db, 'consultants', uid);  // Changed from 'consultores'
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Error loading profile:', error);  // Changed from 'Erro ao carregar perfil:'
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