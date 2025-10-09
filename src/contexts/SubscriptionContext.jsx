import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
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

    // Load statistics
    async function loadStats() {
      if (!currentUser) return;
      
      try {
        console.log('📊 Loading statistics...');
        
        // Get all clients (we'll filter isDeleted in memory to handle missing field)
        const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');
        const clientsSnapshot = await getDocs(clientsRef);
        
        // Filter out deleted clients in memory (handles missing isDeleted field)
        const activeClients = clientsSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.isDeleted !== true; // Only exclude if explicitly true
        });
        
        const totalClients = activeClients.length;
        
        console.log(`✅ Found ${totalClients} clients`);

        // Count opportunities and deals across all clients
        let totalOpportunities = 0;
        let totalDeals = 0;
        let businessVolume = 0;

        // Iterate through each active client to count their opportunities and deals
        for (const clientDoc of activeClients) {
          // Count opportunities for this client
          const opportunitiesRef = collection(
            db,
            'consultants',
            currentUser.uid,
            'clients',
            clientDoc.id,
            'opportunities'
          );
          const opportunitiesSnapshot = await getDocs(opportunitiesRef);
          
          // Filter out deleted opportunities
          const activeOpportunities = opportunitiesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.isDeleted !== true;
          });
          
          totalOpportunities += activeOpportunities.length;

          // Count deals for each opportunity of this client
          for (const oppDoc of activeOpportunities) {
            const dealsRef = collection(
              db,
              'consultants',
              currentUser.uid,
              'clients',
              clientDoc.id,
              'opportunities',
              oppDoc.id,
              'deals'
            );
            const dealsSnapshot = await getDocs(dealsRef);
            
            // Filter out deleted deals
            const activeDeals = dealsSnapshot.docs.filter(doc => {
              const data = doc.data();
              return data.isDeleted !== true;
            });
            
            totalDeals += activeDeals.length;

            // Calculate business volume from deals
            activeDeals.forEach(dealDoc => {
              const dealData = dealDoc.data();
              if (dealData.value && typeof dealData.value === 'number') {
                businessVolume += dealData.value;
              }
            });
          }
        }

        console.log(`✅ Statistics loaded:`, {
          totalClients,
          totalOpportunities,
          totalDeals,
          businessVolume
        });

        const newStats = {
          totalClients,
          totalOpportunities,
          totalDeals,
          businessVolume
        };

        setStats(newStats);

        // Update usage in subscription document
        if (subscription) {
          await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
            'currentUsage.clients': totalClients,
            'currentUsage.deals': totalDeals,
            'currentUsage.volume': businessVolume,
            updatedAt: new Date()
          });
        }

        return newStats;
      } catch (error) {
        console.error('❌ Error loading stats:', error);
        setStats({
          totalClients: 0,
          totalOpportunities: 0,
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