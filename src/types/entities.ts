// types/entities.ts - CORRIGIDO para modelo individual

export interface Tenant {
  id: string; // = userId do consultor
  // Dados pessoais do consultor
  consultorName: string;
  consultorEmail: string;
  consultorPhone: string;
  // Dados profissionais
  licenseNumber?: string; // AMI ou similar
  companyName?: string; // Se trabalha para imobiliária
  isIndependent: boolean; // Consultor independente vs empregado
  // Plano e billing individual
  plan: 'basic' | 'pro' | 'unlimited';
  planLimits: {
    maxClients: number;
    maxActiveDeals: number;
    storageGB: number;
    features: string[];
  };
  subscription: {
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    trialEndsAt: Date;
    nextBillingDate: Date;
    monthlyAmount: number;
  };
  // Configurações pessoais
  settings: {
    currency: 'EUR';
    timezone: 'Europe/Lisbon';
    language: 'pt-PT';
    avatar?: string;
    workingHours?: {
      start: string;
      end: string;
      days: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

// User não existe mais - Tenant = User
export interface UserContext {
  tenantId: string; // = próprio userId
  isAuthenticated: boolean;
  permissions: {
    // Todos sempre true para owner
    canManageClients: true;
    canManageDeals: true;
    canAccessReports: true;
    canManageSettings: true;
    canExportData: true;
  };
  profile: {
    avatar?: string;
    bio?: string;
    specializations: string[];
    workExperience: string;
  };
  stats: {
    totalClients: number;
    activeDeals: number;
    closedDealsThisYear: number;
    totalCommissionThisYear: number;
    averageDealTime: number;
  };
  createdAt: Date;
  lastLoginAt: Date;
}

// Cliente mantém-se igual mas sempre linked ao tenantId
export interface Client {
  id: string;
  tenantId: string; // SEMPRE = userId do consultor dono
  // ... resto mantém-se igual
  name: string;
  email: string;
  phone: string;
  // ... todos os outros campos mantêm-se
  
  // Adicionar campo de privacy
  privacySettings: {
    allowDataSharing: boolean; // Para deals plenos
    allowReferrals: boolean;   // Para indicações
  };
}

// Deal com colaboração opcional
export interface Deal {
  id: string;
  tenantId: string; // Dono principal do deal
  type: 'buyer' | 'seller' | 'investor_hold' | 'investor_rent' | 'investor_flip' | 'landlord' | 'tenant';
  
  // Colaboração opcional (deals plenos)
  collaboration?: {
    partnerTenantId: string; // Outro consultor
    partnerRole: 'buyer' | 'seller' | 'landlord' | 'tenant';
    commissionSplit: number; // % para cada um
    sharedTimeline: boolean;
  };
  
  // ... resto dos campos mantém-se igual
}
