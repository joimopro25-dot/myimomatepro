import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stats now exclude clients
    const [stats, setStats] = useState({
        totalDeals: 0,
        businessVolume: 0
    });

    const { currentUser } = useAuth();

    // Create initial subscription (removed clientLimit)
    async function createSubscription(planData, paymentMethod = 'pending') {
        if (!currentUser) return null;
        const subscriptionData = {
            plan: planData.name,
            price: planData.price,
            annualPrice: planData.annualPrice,
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
            paymentMethod,
            trial: true,
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        };
        await setDoc(doc(db, 'subscriptions', currentUser.uid), subscriptionData);
        return subscriptionData;
    }

    async function updatePaymentMethod(paymentMethod) {
        if (!currentUser) return;
        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            paymentMethod,
            updatedAt: new Date()
        }, { merge: true });
    }

    async function cancelSubscription() {
        if (!currentUser) return;
        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date()
        }, { merge: true });
    }

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

    async function changePlan(newPlan) {
        if (!currentUser) return;
        await setDoc(doc(db, 'subscriptions', currentUser.uid), {
            plan: newPlan.name,
            price: newPlan.price,
            annualPrice: newPlan.annualPrice,
            volumeLimit: newPlan.volumeLimit,
            updatedAt: new Date()
        }, { merge: true });
    }

    // Load stats (now just resets / future: fetch deals)
    async function loadStats() {
        if (!currentUser) return;
        try {
            setStats({
                totalDeals: 0,
                businessVolume: 0
            });
        } catch {
            setStats({
                totalDeals: 0,
                businessVolume: 0
            });
        }
    }

    function isVolumeLimitReached() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return false;
        return stats.businessVolume >= subscription.volumeLimit;
    }

    function isAnyLimitReached() {
        return isVolumeLimitReached();
    }

    function getVolumeUsagePercentage() {
        if (!subscription || subscription.volumeLimit === 'unlimited') return 0;
        return Math.min(100, (stats.businessVolume / subscription.volumeLimit) * 100);
    }

    function getTrialDaysLeft() {
        if (!subscription?.trial || !subscription?.trialEnd) return 0;
        const today = new Date();
        const trialEndDate = new Date(subscription.trialEnd);
        const diffTime = trialEndDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    function getDaysUntilNextPayment() {
        if (!subscription?.nextPayment) return 0;
        const today = new Date();
        const nextPaymentDate = new Date(subscription.nextPayment);
        const diffTime = nextPaymentDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    function formatCurrency(value) {
        if (value === 'unlimited') return 'Ilimitado';
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
            (docSnap) => {
                if (docSnap.exists()) {
                    setSubscription({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setSubscription(null);
                }
                setLoading(false);
            },
            () => {
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
        isVolumeLimitReached,
        isAnyLimitReached,
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