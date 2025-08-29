// src/contexts/TenantContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Tenant } from '../types/entities';
import { tenantService } from '../services/tenantService';

interface TenantUsage {
 clients: number;
 activeDeals: number;
 storageUsedGB: number;
 documentsGenerated: number;
}

interface TenantContextType {
 tenant: Tenant | null;
 loading: boolean;
 error: string | null;
 updateTenant: (updates: Partial<Tenant>) => Promise<void>;
 refreshTenant: () => Promise<void>;
 isTrialExpired: boolean;
 isSubscriptionActive: boolean;
 planLimits: Tenant['planLimits'];
 usage: TenantUsage;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
 children: ReactNode;
 user: User | null;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children, user }) => {
 const [tenant, setTenant] = useState<Tenant | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [usage, setUsage] = useState<TenantUsage>({
   clients: 0,
   activeDeals: 0,
   storageUsedGB: 0,
   documentsGenerated: 0
 });

 // Load tenant data when user changes
 useEffect(() => {
   if (!user) {
     setTenant(null);
     setLoading(false);
     return;
   }

   loadTenantData(user.uid);
 }, [user]);

 const loadTenantData = async (userId: string) => {
   setLoading(true);
   setError(null);

   try {
     const tenantData = await tenantService.getConsultor(userId);
     
     if (tenantData) {
       setTenant(tenantData);
       await loadUsageData(userId);
     } else {
       setError('Consultor data not found');
     }
   } catch (err) {
     console.error('Error loading tenant data:', err);
     setError('Failed to load consultor data');
   } finally {
     setLoading(false);
   }
 };

 const loadUsageData = async (tenantId: string) => {
   try {
     // TODO: Implement actual usage calculation from Firestore
     // For now, using mock data
     setUsage({
       clients: 0,
       activeDeals: 0,
       storageUsedGB: 0,
       documentsGenerated: 0
     });
   } catch (err) {
     console.error('Error loading usage data:', err);
   }
 };

 const updateTenant = async (updates: Partial<Tenant>) => {
   if (!tenant || !user) return;

   try {
     const updatedTenant = { ...tenant, ...updates, updatedAt: new Date() };
     
     // Update in Firebase
     await tenantService.updateConsultor(user.uid, updates);
     
     // Update local state
     setTenant(updatedTenant);
     
     console.log('Tenant data updated successfully');
   } catch (err) {
     console.error('Error updating tenant:', err);
     setError('Failed to update consultor data');
     throw err;
   }
 };

 const refreshTenant = async () => {
   if (!user) return;
   await loadTenantData(user.uid);
 };

 // Check if trial is expired
 const isTrialExpired = React.useMemo(() => {
   if (!tenant || tenant.subscription.status !== 'trial') return false;
   return new Date() > new Date(tenant.subscription.trialEndsAt);
 }, [tenant]);

 // Check if subscription is active
 const isSubscriptionActive = React.useMemo(() => {
   if (!tenant) return false;
   return ['active', 'trial'].includes(tenant.subscription.status) && !isTrialExpired;
 }, [tenant, isTrialExpired]);

 // Get plan limits (default to basic if no tenant)
 const planLimits = React.useMemo(() => {
   if (!tenant) {
     return {
       maxClients: 50,
       maxActiveDeals: 10,
       storageGB: 1,
       features: ['crm_basico']
     };
   }
   return tenant.planLimits;
 }, [tenant]);

 const value: TenantContextType = {
   tenant,
   loading,
   error,
   updateTenant,
   refreshTenant,
   isTrialExpired,
   isSubscriptionActive,
   planLimits,
   usage
 };

 return (
   <TenantContext.Provider value={value}>
     {children}
   </TenantContext.Provider>
 );
};
