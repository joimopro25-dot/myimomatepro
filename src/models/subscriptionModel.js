/**
 * SUBSCRIPTION MODEL - RealEstateCRM Pro
 * Complete subscription model with client limits and volume limits
 * Supports multi-tenant architecture with proper data isolation
 */

// Plan definitions with all limits
export const PLANS = {
  ROOKIE: {
    id: 'rookie',
    name: 'Rookie',
    price: 5,
    annualPrice: 50,
    clientLimit: 50,
    volumeLimit: 25000,
    features: [
      'Até 50 clientes',
      'Volume máximo: €25.000',
      'Suporte por email',
      'Dashboard completo',
      'Todos os tipos de oportunidades',
      'Deals plenos'
    ],
    color: 'gray'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 9,
    annualPrice: 90,
    clientLimit: 200,
    volumeLimit: 100000,
    features: [
      'Até 200 clientes',
      'Volume máximo: €100.000',
      'Suporte prioritário',
      'Relatórios avançados',
      'Automações completas',
      'Integrações incluídas'
    ],
    color: 'primary',
    popular: true
  },
  SHARK: {
    id: 'shark',
    name: 'Shark',
    price: 25,
    annualPrice: 250,
    clientLimit: 'unlimited',
    volumeLimit: 'unlimited',
    features: [
      'Clientes ilimitados',
      'Volume ilimitado',
      'Suporte dedicado',
      'API personalizada',
      'Formação personalizada',
      'Integrações custom'
    ],
    color: 'secondary'
  }
};

// Subscription statuses
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  SUSPENDED: 'suspended'
};

// Billing cycles
export const BILLING_CYCLE = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual'
};

// Create initial subscription data structure
export function createSubscriptionData(plan, consultantId, paymentMethod = 'pending') {
  const planData = typeof plan === 'string' ? PLANS[plan.toUpperCase()] : plan;
  
  if (!planData) {
    throw new Error('Invalid plan selected');
  }

  const now = new Date();
  const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days trial
  const nextPayment = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days for monthly

  return {
    // Plan details
    plan: planData.name,
    planId: planData.id,
    price: planData.price,
    annualPrice: planData.annualPrice,
    
    // Limits
    clientLimit: planData.clientLimit,
    volumeLimit: planData.volumeLimit,
    
    // Current usage (to be tracked)
    currentUsage: {
      clients: 0,
      volume: 0,
      deals: 0
    },
    
    // Billing
    cycle: BILLING_CYCLE.MONTHLY,
    status: SUBSCRIPTION_STATUS.TRIAL,
    paymentMethod: paymentMethod,
    
    // Dates
    createdAt: now,
    updatedAt: now,
    nextPayment: nextPayment,
    lastPayment: null,
    
    // Trial
    trial: true,
    trialEnd: trialEnd,
    trialExtended: false,
    
    // Cancellation info (if applicable)
    cancelledAt: null,
    cancellationReason: null,
    
    // Metadata
    consultantId: consultantId,
    notifications: {
      limitWarning75: false,
      limitWarning90: false,
      trialEndingSoon: false,
      paymentReminder: false
    }
  };
}

// Update subscription after payment
export function processPayment(subscription, amount) {
  return {
    ...subscription,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    trial: false,
    lastPayment: {
      date: new Date(),
      amount: amount,
      status: 'completed',
      method: subscription.paymentMethod
    },
    nextPayment: subscription.cycle === BILLING_CYCLE.ANNUAL
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  };
}

// Check if any limit is reached
export function checkLimits(subscription) {
  const warnings = [];
  
  // Check client limit
  if (subscription.clientLimit !== 'unlimited') {
    const clientUsage = (subscription.currentUsage.clients / subscription.clientLimit) * 100;
    
    if (clientUsage >= 100) {
      warnings.push({
        type: 'error',
        limit: 'clients',
        message: 'Limite de clientes atingido',
        usage: clientUsage
      });
    } else if (clientUsage >= 90) {
      warnings.push({
        type: 'warning',
        limit: 'clients',
        message: 'Próximo do limite de clientes (90%)',
        usage: clientUsage
      });
    } else if (clientUsage >= 75) {
      warnings.push({
        type: 'info',
        limit: 'clients',
        message: '75% do limite de clientes utilizado',
        usage: clientUsage
      });
    }
  }
  
  // Check volume limit
  if (subscription.volumeLimit !== 'unlimited') {
    const volumeUsage = (subscription.currentUsage.volume / subscription.volumeLimit) * 100;
    
    if (volumeUsage >= 100) {
      warnings.push({
        type: 'error',
        limit: 'volume',
        message: 'Limite de volume atingido',
        usage: volumeUsage
      });
    } else if (volumeUsage >= 90) {
      warnings.push({
        type: 'warning',
        limit: 'volume',
        message: 'Próximo do limite de volume (90%)',
        usage: volumeUsage
      });
    } else if (volumeUsage >= 75) {
      warnings.push({
        type: 'info',
        limit: 'volume',
        message: '75% do limite de volume utilizado',
        usage: volumeUsage
      });
    }
  }
  
  return warnings;
}

// Calculate days remaining in trial
export function getTrialDaysRemaining(subscription) {
  if (!subscription.trial || !subscription.trialEnd) return 0;
  
  const now = new Date();
  const trialEnd = new Date(subscription.trialEnd);
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Calculate days until next payment
export function getDaysUntilPayment(subscription) {
  if (!subscription.nextPayment) return null;
  
  const now = new Date();
  const nextPayment = new Date(subscription.nextPayment);
  const diffTime = nextPayment - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Get plan upgrade options
export function getUpgradeOptions(currentPlanId) {
  const planHierarchy = ['rookie', 'professional', 'shark'];
  const currentIndex = planHierarchy.indexOf(currentPlanId);
  
  if (currentIndex === -1 || currentIndex === planHierarchy.length - 1) {
    return []; // Invalid plan or already at highest tier
  }
  
  return planHierarchy
    .slice(currentIndex + 1)
    .map(planId => PLANS[planId.toUpperCase()]);
}

// Validate if operation is allowed based on limits
export function canPerformOperation(subscription, operation, value = 1) {
  const limits = {
    addClient: () => {
      if (subscription.clientLimit === 'unlimited') return true;
      return subscription.currentUsage.clients + value <= subscription.clientLimit;
    },
    addVolume: () => {
      if (subscription.volumeLimit === 'unlimited') return true;
      return subscription.currentUsage.volume + value <= subscription.volumeLimit;
    }
  };
  
  return limits[operation] ? limits[operation]() : true;
}

// Export all utility functions
export default {
  PLANS,
  SUBSCRIPTION_STATUS,
  BILLING_CYCLE,
  createSubscriptionData,
  processPayment,
  checkLimits,
  getTrialDaysRemaining,
  getDaysUntilPayment,
  getUpgradeOptions,
  canPerformOperation
};