// src/hooks/useTenant.ts
import { useContext } from 'react';
import { TenantContext } from '../contexts/TenantContext';

export const useTenant = () => {
 const context = useContext(TenantContext);
 
 if (!context) {
   throw new Error('useTenant must be used within TenantProvider');
 }
 
 const {
   tenant,
   loading,
   error,
   updateTenant,
   refreshTenant,
   isTrialExpired,
   isSubscriptionActive,
   planLimits,
   usage
 } = context;
 
 // Helper functions for plan management
 const canAddClient = () => {
   if (planLimits.maxClients === -1) return true; // Unlimited plan
   return usage.clients < planLimits.maxClients;
 };
 
 const canCreateDeal = () => {
   if (planLimits.maxActiveDeals === -1) return true; // Unlimited plan
   return usage.activeDeals < planLimits.maxActiveDeals;
 };
 
 const getStorageUsagePercentage = () => {
   if (planLimits.storageGB === -1) return 0; // Unlimited
   return Math.round((usage.storageUsedGB / planLimits.storageGB) * 100);
 };
 
 const hasFeature = (feature: string) => {
   return planLimits.features.includes(feature);
 };
 
 const getDaysUntilTrialExpires = () => {
   if (!tenant || tenant.subscription.status !== 'trial') return null;
   
   const now = new Date();
   const trialEnd = new Date(tenant.subscription.trialEndsAt);
   const diffTime = trialEnd.getTime() - now.getTime();
   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   
   return Math.max(0, diffDays);
 };
 
 return {
   // Core tenant data
   tenant,
   loading,
   error,
   
   // Actions
   updateTenant,
   refreshTenant,
   
   // Status checks
   isTrialExpired,
   isSubscriptionActive,
   
   // Plan and usage data
   planLimits,
   usage,
   
   // Helper functions
   canAddClient,
   canCreateDeal,
   getStorageUsagePercentage,
   hasFeature,
   getDaysUntilTrialExpires,
   
   // Quick access to common data
   consultorName: tenant?.consultorName || '',
   plan: tenant?.plan || 'basic',
   isIndependent: tenant?.isIndependent || false,
   settings: tenant?.settings || {}
 };
};

// Specialized hooks for specific tenant aspects
export const useTenantSettings = () => {
 const { tenant, updateTenant } = useTenant();
 
 const updateSettings = async (newSettings: Partial<typeof tenant.settings>) => {
   if (!tenant) return;
   
   await updateTenant({
     settings: {
       ...tenant.settings,
       ...newSettings
     }
   });
 };
 
 return {
   settings: tenant?.settings,
   updateSettings
 };
};

export const useTenantPlan = () => {
 const { 
   tenant, 
   planLimits, 
   usage, 
   canAddClient, 
   canCreateDeal, 
   hasFeature 
 } = useTenant();
 
 return {
   currentPlan: tenant?.plan,
   limits: planLimits,
   usage,
   canAddClient,
   canCreateDeal,
   hasFeature
 };
};
