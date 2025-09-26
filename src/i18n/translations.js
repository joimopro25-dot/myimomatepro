// src/i18n/translations.js

export const translations = {
  pt: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      clients: 'Clientes',
      opportunities: 'Oportunidades',
      deals: 'Negócios',
      account: 'Conta',
      settings: 'Configurações',
      logout: 'Sair'
    },
    
    // Plans
    plans: {
      rookie: {
        name: 'Rookie',
        description: 'Perfeito para consultores iniciantes',
        features: [
          'Até 50 clientes',
          'Volume máximo: €25.000',
          'Suporte por email',
          'Dashboard completo',
          'Todos os tipos de oportunidades',
          'Deals plenos'
        ]
      },
      professional: {
        name: 'Professional',
        description: 'Ideal para consultores experientes',
        features: [
          'Até 200 clientes',
          'Volume máximo: €100.000',
          'Suporte prioritário',
          'Relatórios avançados',
          'Automações completas',
          'Integrações incluídas'
        ]
      },
      shark: {
        name: 'Shark',
        description: 'Para consultores de elite sem limites',
        features: [
          'Clientes ilimitados',
          'Volume ilimitado',
          'Suporte dedicado',
          'API personalizada',
          'Formação personalizada',
          'Integrações custom'
        ]
      }
    },
    
    // Forms
    forms: {
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      company: 'Empresa',
      password: 'Palavra-passe',
      confirmPassword: 'Confirmar palavra-passe',
      selectPlan: 'Escolher plano',
      submit: 'Submeter',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Atualizar'
    },
    
    // Account
    account: {
      subscription: 'Subscrição',
      billing: 'Faturação',
      paymentMethod: 'Método de pagamento',
      nextPayment: 'Próximo pagamento',
      cancelSubscription: 'Cancelar subscrição',
      changePlan: 'Alterar plano',
      billingCycle: 'Ciclo de faturação',
      monthly: 'Mensal',
      annual: 'Anual'
    },
    
    // Stats
    stats: {
      totalClients: 'Total de clientes',
      totalDeals: 'Total de negócios',
      businessVolume: 'Volume de negócios',
      usage: 'Utilização',
      limit: 'Limite'
    },
    
    // Messages
    messages: {
      welcome: 'Bem-vindo',
      success: 'Sucesso',
      error: 'Erro',
      loading: 'A carregar...',
      trialDays: 'dias de teste restantes',
      clientLimitReached: 'Limite de clientes atingido',
      volumeLimitReached: 'Limite de volume atingido'
    }
  },
  
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      clients: 'Clients',
      opportunities: 'Opportunities',
      deals: 'Deals',
      account: 'Account',
      settings: 'Settings',
      logout: 'Logout'
    },
    
    // Plans
    plans: {
      rookie: {
        name: 'Rookie',
        description: 'Perfect for beginner consultants',
        features: [
          'Up to 50 clients',
          'Maximum volume: €25,000',
          'Email support',
          'Complete dashboard',
          'All opportunity types',
          'Full deals'
        ]
      },
      professional: {
        name: 'Professional',
        description: 'Ideal for experienced consultants',
        features: [
          'Up to 200 clients',
          'Maximum volume: €100,000',
          'Priority support',
          'Advanced reports',
          'Complete automations',
          'Included integrations'
        ]
      },
      shark: {
        name: 'Shark',
        description: 'For elite consultants without limits',
        features: [
          'Unlimited clients',
          'Unlimited volume',
          'Dedicated support',
          'Custom API',
          'Personalized training',
          'Custom integrations'
        ]
      }
    },
    
    // Forms
    forms: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      password: 'Password',
      confirmPassword: 'Confirm password',
      selectPlan: 'Select plan',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update'
    },
    
    // Account
    account: {
      subscription: 'Subscription',
      billing: 'Billing',
      paymentMethod: 'Payment method',
      nextPayment: 'Next payment',
      cancelSubscription: 'Cancel subscription',
      changePlan: 'Change plan',
      billingCycle: 'Billing cycle',
      monthly: 'Monthly',
      annual: 'Annual'
    },
    
    // Stats
    stats: {
      totalClients: 'Total clients',
      totalDeals: 'Total deals',
      businessVolume: 'Business volume',
      usage: 'Usage',
      limit: 'Limit'
    },
    
    // Messages
    messages: {
      welcome: 'Welcome',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
      trialDays: 'trial days remaining',
      clientLimitReached: 'Client limit reached',
      volumeLimitReached: 'Volume limit reached'
    }
  }
};

// Helper function to get nested translation
export const t = (key, lang = 'pt') => {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

// Language detection
export const detectUserLanguage = () => {
  const saved = localStorage.getItem('language');
  if (saved) return saved;
  
  const browserLang = navigator.language.split('-')[0];
  return ['pt', 'en'].includes(browserLang) ? browserLang : 'pt';
};

// Language context hook
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(detectUserLanguage());
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  const translate = (key) => t(key, language);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);