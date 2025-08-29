// services/tenantService.ts - CORRIGIDO para modelo individual
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Tenant } from '../types/entities';

export class TenantService {
  async createConsultorAccount(data: {
    userId: string; // = tenantId
    email: string;
    name: string;
    phone: string;
    selectedPlan: 'basic' | 'pro' | 'unlimited';
    licenseNumber?: string;
    companyName?: string;
    isIndependent: boolean;
  }): Promise<Tenant> {
    
    // CRUCIAL: tenantId = userId (consultor individual)
    const tenant: Tenant = {
      id: data.userId, // Tenant = User
      consultorName: data.name,
      consultorEmail: data.email,
      consultorPhone: data.phone,
      licenseNumber: data.licenseNumber,
      companyName: data.companyName,
      isIndependent: data.isIndependent,
      plan: data.selectedPlan,
      planLimits: this.getPlanLimits(data.selectedPlan),
      subscription: {
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        monthlyAmount: this.getPlanPrice(data.selectedPlan)
      },
      settings: {
        currency: 'EUR',
        timezone: 'Europe/Lisbon',
        language: 'pt-PT'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // UMA ÚNICA OPERAÇÃO: criar tenant que É o user
    await setDoc(doc(db, 'tenants', data.userId), tenant);
    
    return tenant;
  }
  
  async getConsultor(userId: string): Promise<Tenant | null> {
    // Direto: userId = tenantId
    const consultorDoc = await getDoc(doc(db, 'tenants', userId));
    return consultorDoc.exists() ? consultorDoc.data() as Tenant : null;
  }
  
  // Sem gestão de users - só existe o próprio consultor
  
  private getPlanLimits(plan: string) {
    const limits = {
      basic: { 
        maxClients: 50, 
        maxActiveDeals: 10, 
        storageGB: 1, 
        features: ['crm_basico', 'documentos_simples', 'email_support'] 
      },
      pro: { 
        maxClients: 150, 
        maxActiveDeals: 30, 
        storageGB: 5, 
        features: ['crm_completo', 'ai_assistant', 'relatorios_avancados', 'priority_support'] 
      },
      unlimited: { 
        maxClients: -1, 
        maxActiveDeals: -1, 
        storageGB: 20, 
        features: ['todas_funcionalidades', 'api_access', '24_7_support', 'integracoes_premium'] 
      }
    };
    return limits[plan as keyof typeof limits];
  }
  
  private getPlanPrice(plan: string): number {
    const prices = { basic: 29, pro: 59, unlimited: 99 };
    return prices[plan as keyof typeof prices];
  }
}

export const tenantService = new TenantService();
