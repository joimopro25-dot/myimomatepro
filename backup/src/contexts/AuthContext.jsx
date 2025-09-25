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

    // Registar novo utilizador
    async function signup(email, password, userData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Atualizar nome do utilizador
        await updateProfile(user, {
            displayName: userData.nome
        });

        // Criar perfil do utilizador no Firestore
        await setDoc(doc(db, 'consultores', user.uid), {
            nome: userData.nome,
            email: userData.email,
            telefone: userData.telefone,
            empresa: userData.empresa,
            plano: userData.plano,
            criadoEm: new Date(),
            ativo: true
        });

        // Criar subscrição inicial
        const planoData = getPlanoData(userData.plano);
        await createInitialSubscription(user.uid, planoData);

        return userCredential;
    }

    // Obter dados do plano baseado no nome
    function getPlanoData(nomePlano) {
        const planos = {
            'Rookie': {
                nome: 'Rookie',
                preco: '5',
                precoAnual: '50',
                limiteClientes: 50,
                limiteVolumeNegocios: 25000
            },
            'Professional': {
                nome: 'Professional',
                preco: '9',
                precoAnual: '90',
                limiteClientes: 200,
                limiteVolumeNegocios: 100000
            },
            'Shark': {
                nome: 'Shark',
                preco: '25',
                precoAnual: '250',
                limiteClientes: 'unlimited',
                limiteVolumeNegocios: 'unlimited'
            }
        };

        return planos[nomePlano] || planos['Professional'];
    }

    // Criar subscrição inicial
    async function createInitialSubscription(userId, planoData) {
        const subscriptionData = {
            plano: planoData.nome,
            preco: planoData.preco,
            precoAnual: planoData.precoAnual,
            limiteClientes: planoData.limiteClientes,
            limiteVolumeNegocios: planoData.limiteVolumeNegocios,
            ciclo: 'mensal',
            status: 'active',
            criadoEm: new Date(),
            proximoPagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ultimoPagamento: {
                data: new Date(),
                valor: planoData.preco,
                status: 'pending'
            },
            metodoPagamento: 'pending',
            trial: true,
            trialFim: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
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

    // Carregar perfil do utilizador
    async function loadUserProfile(uid) {
        try {
            const docRef = doc(db, 'consultores', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
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