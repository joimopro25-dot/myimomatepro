import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { getClientStats } from '../services/clientService';

const SubscriptionContext = createContext();

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        totalDeals: 0,
        businessVolume: 0
    });

    const { currentUser } = useAuth();

    // Create initial subscription
    async function createSubscription(planData, paymentMethod = 'pending') {
        if (!currentUser) return;

        const subscriptionData = {
            plan: planData.name,                // Changed from plano and nome
            price: planData.price,              // Changed from preco
            annualPrice: planData.annualPrice,  // Changed from precoAnual
            clientLimit: planData.clientLimit,  // Changed from limiteClientes
            volumeLimit: planData.volumeLimit,  // Changed from limiteVolumeNegocios
            cycle: 'monthly',                    // Changed from 'mensal', // monthly or annual
            status: 'active',                    // active, cancelled, expired
            createdAt: new Date(),              // Changed from criadoEm
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Changed from proximoPagamento, +30 days
            lastPayment: {                      // Changed from ultimoPagamento
                date: new Date(),                // Changed from data
                amount: planData.price,          // Changed from valor
                status: 'pending'
            },
            paymentMethod: paymentMethod,       // Changed from metodoPagamento
            trial: true,
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Changed from trialFim, +14 days trial
        };

        await setDoc(doc(db, 'subscriptions', currentUser.uid), subscriptionData);
        return subscriptionData;
    }

    // Update payment method
    async function updatePaymentMethod(paymentMethod) {  // Changed parameter from metodoPagamento
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            paymentMethod,  // Changed from metodoPagamento
            updatedAt: new Date()
        }, { merge: true });
    }

    // Cancel subscription
    async function cancelSubscription() {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            status: 'cancelled',
            cancelledAt: new Date(),  // Changed from canceladoEm
            updatedAt: new Date()
        }, { merge: true });
    }

    // Change billing cycle
    async function changeBillingCycle(cycle) {  // Changed parameter from ciclo
        if (!currentUser || !subscription) return;

        const newPrice = cycle === 'annual' ? subscription.annualPrice : subscription.price;  // Changed from novoPreco, 'anual', precoAnual, preco
        const nextPayment = cycle === 'annual'  // Changed from proximoPagamento
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            cycle,  // Changed from ciclo
            nextPayment,  // Changed from proximoPagamento
            currentPrice: newPrice,  // Changed from precoAtual
            updatedAt: new Date()
        }, { merge: true });
    }

    // Upgrade/Downgrade plan
    async function changePlan(newPlan) {  // Changed parameter from novoPlano
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            plan: newPlan.name,                  // Changed from plano and nome
            price: newPlan.price,                // Changed from preco
            annualPrice: newPlan.annualPrice,    // Changed from precoAnual
            clientLimit: newPlan.clientLimit,    // Changed from limiteClientes
            volumeLimit: newPlan.volumeLimit,    // Changed from limiteVolumeNegocios
            updatedAt: new Date()
        }, { merge: true });
    }

    // Load statistics
    async function loadStats() {
        if (!currentUser) return;

        try {
            console.log('📊 SubscriptionContext: Loading real statistics...');  // Changed from 'Carregando estatísticas reais...'

            // ✅ FETCH REAL STATISTICS FROM FIRESTORE
            const clientStats = await getClientStats(currentUser.uid);

            setStats({
                totalClients: clientStats.total || 0,  // Changed from totalClientes
                totalDeals: 0,                         // Changed from totalNegocios, TODO: Implement when we have deals
                businessVolume: 0                      // Changed from valorNegocios, TODO: Implement when we have deals
            });

            console.log('✅ SubscriptionContext: Statistics loaded:',  // Changed from 'Estatísticas carregadas:'
                {
                    totalClients: clientStats.total || 0  // Changed from totalClientes
                });

        } catch (error) {
            console.error('❌ SubscriptionContext: Error loading statistics:', error);  // Changed from 'Erro ao carregar estatísticas:'
            // In case of error, keep values at zero
            setStats({
                totalClients: 0,    // Changed from totalClientes
                totalDeals: 0,      // Changed from totalNegocios
                businessVolume: 0   // Changed from valorNegocios
            });
        }
    }

    // Check if client limit is reached
    function isClientLimitReached() {
        if (!subscription || subscription.clientLimit === 'unlimited') return false;  // Changed from limiteClientes
        return stats.totalClients >= subscription.clientLimit;  // Changed from totalClientes and limiteClientes
    }

    // Check if business volume limit is reached
    function isVolumeLimitReached() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return false;  // Changed from limiteVolumeNegocios
        return stats.businessVolume >= subscription.volumeLimit;  // Changed from valorNegocios and limiteVolumeNegocios
    }

    // Check if any limit is reached
    function isAnyLimitReached() {
        return isClientLimitReached() || isVolumeLimitReached();
    }

    // Client usage percentage
    function getClientUsagePercentage() {
        if (!subscription || subscription.clientLimit === 'unlimited') return 0;  // Changed from limiteClientes
        return Math.min(100, (stats.totalClients / subscription.clientLimit) * 100);  // Changed from totalClientes and limiteClientes
    }

    // Volume usage percentage
    function getVolumeUsagePercentage() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return 0;  // Changed from limiteVolumeNegocios
        return Math.min(100, (stats.businessVolume / subscription.volumeLimit) * 100);  // Changed from valorNegocios and limiteVolumeNegocios
    }

    // Trial days remaining
    function getTrialDaysLeft() {
        if (!subscription?.trial || !subscription?.trialEnd) return 0;  // Changed from trialFim
        const today = new Date();  // Changed from hoje
        const trialEndDate = new Date(subscription.trialEnd);  // Changed from fimTrial and trialFim
        const diffTime = trialEndDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Days until next payment
    function getDaysUntilNextPayment() {
        if (!subscription?.nextPayment) return 0;  // Changed from proximoPagamento
        const today = new Date();  // Changed from hoje
        const nextPaymentDate = new Date(subscription.nextPayment);  // Changed from proximoPagamento
        const diffTime = nextPaymentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    // Currency formatting
    function formatCurrency(value) {
        if (value === 'unlimited') return 'Ilimitado';  // Keep Portuguese for user display
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    useEffect(() => {
        if (!currentUser) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'subscriptions', currentUser.uid),
            (doc) => {
                if (doc.exists()) {
                    setSubscription({ id: doc.id, ...doc.data() });
                } else {
                    setSubscription(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error('Error loading subscription:', error);  // Changed from 'Erro ao carregar subscrição:'
                setLoading(false);
            }
        );

        loadStats();

        return unsubscribe;
    }, [currentUser]);

    const value = {
        subscription,
        stats,
        loading,
        createSubscription,
        updatePaymentMethod,
        cancelSubscription,
        changeBillingCycle,
        changePlan,
        loadStats,
        isClientLimitReached,
        isVolumeLimitReached,
        isAnyLimitReached,
        getClientUsagePercentage,
        getVolumeUsagePercentage,
        getTrialDaysLeft,
        getDaysUntilNextPayment,
        formatCurrency
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}