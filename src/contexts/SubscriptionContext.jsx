/**
 * SUBSCRIPTION CONTEXT - RealEstateCRM Pro
 * Complete subscription management with client and volume limits
 * Multi-tenant architecture support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { 
  PLANS, 
  createSubscriptionData, 
  checkLimits,
  getTrialDaysRemaining,
  getDaysUntilPayment,
  canPerformOperation 
} from '../models/subscriptionModel';
import { formatCurrency } from '../utils/validation';

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDeals: 0,
    businessVolume: 0
  });
  const [limitWarnings, setLimitWarnings] = useState([]);

  const { currentUser } = useAuth();

  // Create initial subscription
  async function createSubscription(planName, paymentMethod = 'pending') {
    if (!currentUser) return null;
    
    try {
      const subscriptionData = createSubscriptionData(
        planName, 
        currentUser.uid, 
        paymentMethod
      );
      
      await setDoc(
        doc(db, 'subscriptions', currentUser.uid), 
        subscriptionData
      );
      
      return subscriptionData;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Update payment method
  async function updatePaymentMethod(paymentMethod) {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        paymentMethod,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Cancel subscription
  async function cancelSubscription(reason = '') {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Change billing cycle
  async function changeBillingCycle(cycle) {
    if (!currentUser || !subscription) return;
    
    try {
      const newPrice = cycle === 'annual' 
        ? subscription.annualPrice 
        : subscription.price;
      
      const nextPayment = cycle === 'annual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        cycle,
        nextPayment,
        currentPrice: newPrice,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error changing billing cycle:', error);
      throw error;
    }
  }

  // Change plan
  async function changePlan(newPlanName) {
    if (!currentUser) return;
    
    try {
      const newPlan = PLANS[newPlanName.toUpperCase()];
      if (!newPlan) {
        throw new Error('Invalid plan');
      }

      // Check if downgrading and validate current usage
      if (subscription) {
        const currentPlan = PLANS[subscription.planId?.toUpperCase()];
        
        // Check client limit on downgrade
        if (newPlan.clientLimit !== 'unlimited' && 
            stats.totalClients > newPlan.clientLimit) {
          throw new Error(`Cannot downgrade: You have ${stats.totalClients} clients but the ${newPlan.name} plan only allows ${newPlan.clientLimit}`);
        }
        
        // Check volume limit on downgrade
        if (newPlan.volumeLimit !== 'unlimited' && 
            stats.businessVolume > newPlan.volumeLimit) {
          throw new Error(`Cannot downgrade: Your business volume (${formatCurrency(stats.businessVolume)}) exceeds the ${newPlan.name} plan limit (${formatCurrency(newPlan.volumeLimit)})`);
        }
      }

      await updateDoc(doc(db, 'subscriptions', currentUser.uid), {
        plan: newPlan.name,
        planId: newPlan.id,
        price: newPlan.price,
        annualPrice: newPlan.annualPrice,
        clientLimit: newPlan.clientLimit,
        volumeLimit: newPlan.volumeLimit,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error changing plan:', error);
      throw error;
    }
  }

  // Load statistics
  async function loadStats() {
    if (!currentUser) return;
    
    try {
      // Get total clients
      const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');
      const clientsSnapshot = await getDocs(
        query(clientsRef, where('isDeleted', '==', false))
      );
      const totalClients = clientsSnapshot.size;

      // Get total deals and volume (placeholder for now)
      // TODO: Implement when deals module is ready
      const totalDeals = 0;
      const businessVolume = 0;

      const newStats = {
        totalClients,
        totalDeals,
        businessVolume
      };

      setStats(newStats);

      // Update usage in subscription
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
      console.error('Error loading stats:', error);
      setStats({
        totalClients: 0,
        totalDeals: 0,
        businessVolume: 0
      });
    }
  }

  // Check if client limit is reached
  function isClientLimitReached() {
    if (!subscription || subscription.clientLimit === 'unlimited') return false;
    return stats.totalClients >= subscription.clientLimit;
  }

  // Check if volume limit is reached
  function isVolumeLimitReached() {
    if (!subscription || subscription.volumeLimit === 'unlimited') return false;
    return stats.businessVolume >= subscription.volumeLimit;
  }

  // Check if any limit is reached
  function isAnyLimitReached() {
    return isClientLimitReached() || isVolumeLimitReached();
  }

  // Get client usage percentage
  function getClientUsagePercentage() {
    if (!subscription || subscription.clientLimit === 'unlimited') return 0;
    return Math.min(100, (stats.totalClients / subscription.clientLimit) * 100);
  }

  // Get volume usage percentage
  function getVolumeUsagePercentage() {
    if (!subscription || subscription.volumeLimit === 'unlimited') return 0;
    return Math.min(100, (stats.businessVolume / subscription.volumeLimit) * 100);
  }

  // Get trial days left
  function getTrialDaysLeft() {
    if (!subscription) return 0;
    return getTrialDaysRemaining(subscription);
  }

  // Get days until next payment
  function getDaysUntilNextPayment() {
    if (!subscription) return null;
    return getDaysUntilPayment(subscription);
  }

  // Check if can add client
  function canAddClient() {
    if (!subscription) return false;
    return canPerformOperation(subscription, 'addClient');
  }

  // Check if can add volume
  function canAddVolume(amount) {
    if (!subscription) return false;
    return canPerformOperation(subscription, 'addVolume', amount);
  }

  // Update limit warnings
  useEffect(() => {
    if (subscription && stats) {
      const warnings = checkLimits({
        ...subscription,
        currentUsage: {
          clients: stats.totalClients,
          volume: stats.businessVolume,
          deals: stats.totalDeals
        }
      });
      setLimitWarnings(warnings);
    }
  }, [subscription, stats]);

  // Subscribe to subscription changes
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
          const data = docSnap.data();
          setSubscription({ 
            id: docSnap.id, 
            ...data,
            // Ensure dates are properly formatted
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            nextPayment: data.nextPayment?.toDate?.() || data.nextPayment,
            trialEnd: data.trialEnd?.toDate?.() || data.trialEnd
          });
        } else {
          // No subscription found, create trial
          createSubscription('Professional');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subscription:', error);
        setLoading(false);
      }
    );

    // Load initial stats
    loadStats();

    return unsubscribe;
  }, [currentUser]);

  // Reload stats when subscription changes
  useEffect(() => {
    if (subscription) {
      loadStats();
    }
  }, [subscription?.planId]);

  const value = {
    // State
    subscription,
    stats,
    loading,
    limitWarnings,
    
    // Actions
    createSubscription,
    updatePaymentMethod,
    cancelSubscription,
    changeBillingCycle,
    changePlan,
    loadStats,
    
    // Limit checks
    isClientLimitReached,
    isVolumeLimitReached,
    isAnyLimitReached,
    getClientUsagePercentage,
    getVolumeUsagePercentage,
    canAddClient,
    canAddVolume,
    
    // Helpers
    getTrialDaysLeft,
    getDaysUntilNextPayment,
    formatCurrency,
    
    // Plan data
    plans: PLANS,
    currentPlan: subscription ? PLANS[subscription.planId?.toUpperCase()] : null
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}