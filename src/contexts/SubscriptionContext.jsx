import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,      // Changed from 'totalClientes'
        totalDeals: 0,        // Changed from 'totalNegocios'
        businessVolume: 0     // Changed from 'valorNegocios'
    });

    const { currentUser } = useAuth();

    // Create subscription
    async function createSubscription(planData, paymentMethod = 'pending') {
        if (!currentUser) return;

        const subscriptionData = {
            plan: planData.name,
            price: planData.price,
            annualPrice: planData.annualPrice,
            clientLimit: planData.clientLimit,
            volumeLimit: planData.volumeLimit,
            cycle: 'monthly',                  // Changed from 'mensal'
            status: 'active',
            createdAt: new Date(),
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastPayment: {
                date: new Date(),
                amount: planData.price,
                status: 'pending'
            },
            paymentMethod: paymentMethod,
            trial: true,
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        };

        await setDoc(doc(db, 'subscriptions', currentUser.uid), subscriptionData);
        return subscriptionData;
    }

    // Update payment method
    async function updatePaymentMethod(paymentMethod) {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            paymentMethod,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Cancel subscription
    async function cancelSubscription() {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            status: 'cancelled',
            cancelledAt: new Date(),           // Changed from 'canceladoEm'
            updatedAt: new Date()
        }, { merge: true });
    }

    // Change billing cycle
    async function changeBillingCycle(cycle) {
        if (!currentUser || !subscription) return;

        const newPrice = cycle === 'annual' ? subscription.annualPrice : subscription.price;
        const nextPayment = cycle === 'annual'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            cycle,
            nextPayment,
            currentPrice: newPrice,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Upgrade/Downgrade plan
    async function changePlan(newPlan) {
        if (!currentUser) return;

        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            plan: newPlan.name,
            price: newPlan.price,
            annualPrice: newPlan.annualPrice,
            clientLimit: newPlan.clientLimit,
            volumeLimit: newPlan.volumeLimit,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Load statistics
    async function loadStats() {
        if (!currentUser) return;

        try {
            // For now, using default values
            // When implementing new modules, we'll fetch from Firestore
            setStats({
                totalClients: 0,
                totalDeals: 0,
                businessVolume: 0
            });

        } catch (error) {
            console.error('Error loading statistics:', error);
            setStats({
                totalClients: 0,
                totalDeals: 0,
                businessVolume: 0
            });
        }
    }

    // Check if client limit reached
    function isClientLimitReached() {
        if (!subscription || subscription.clientLimit === 'unlimited') return false;
        return stats.totalClients >= subscription.clientLimit;
    }

    // Check if volume limit reached
    function isVolumeLimitReached() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return false;
        return stats.businessVolume >= subscription.volumeLimit;
    }

    // Check if any limit reached
    function isAnyLimitReached() {
        return isClientLimitReached() || isVolumeLimitReached();
    }

    // Get client usage percentage
    function getClientUsagePercentage() {
        if (!subscription || subscription.clientLimit === 'unlimited') return 0;
        return Math.round((stats.totalClients / subscription.clientLimit) * 100);
    }

    // Get volume usage percentage
    function getVolumeUsagePercentage() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return 0;
        return Math.round((stats.businessVolume / subscription.volumeLimit) * 100);
    }

    // Get trial days left
    function getTrialDaysLeft() {
        if (!subscription || !subscription.trial) return 0;
        const today = new Date();
        const trialEnd = new Date(subscription.trialEnd);
        const daysLeft = Math.ceil((trialEnd - today) / (1000 * 60 * 60 * 24));
        return daysLeft > 0 ? daysLeft : 0;
    }

    // Get days until next payment
    function getDaysUntilNextPayment() {
        if (!subscription) return 0;
        const today = new Date();
        const nextPayment = new Date(subscription.nextPayment);
        return Math.ceil((nextPayment - today) / (1000 * 60 * 60 * 24));
    }

    // Format currency values
    function formatCurrency(value) {
        if (value === 'unlimited') return 'Unlimited';
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
                console.error('Error loading subscription:', error);
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