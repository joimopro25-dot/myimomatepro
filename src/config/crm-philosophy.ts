// config/crm-philosophy.ts

/**
 * MyImoMatePro - Filosofia e Princípios do Sistema
 * 
 * CRM Individual para Consultores Imobiliários
 * Cada consultor é proprietário dos seus próprios dados
 */

export const CRM_PHILOSOPHY = {
  // ===== MODELO DE NEGÓCIO =====
  businessModel: {
    target: 'Consultores imobiliários individuais',
    approach: 'SaaS B2C - cada consultor paga a sua própria subscrição',
    ownership: 'Cada consultor é dono absoluto dos seus dados',
    isolation: 'Dados completamente isolados entre consultores',
    scale: 'Milhares de consultores independentes na mesma plataforma'
  },

  // ===== VALORES FUNDAMENTAIS =====
  coreValues: {
    individualOwnership: {
      description: 'Cada consultor é proprietário absoluto dos seus dados',
      implementation: [
        'Tenant = 1 consultor individual',
        'Isolamento total de dados entre consultores',
        'Controlo completo sobre os próprios clientes',
        'Export de dados sempre disponível',
        'Nenhuma partilha forçada com outros consultores'
      ],
      technicalApproach: [
        'TenantId = UserId do consultor',
        'Firestore rules: acesso apenas aos próprios dados',
        'Sem hierarquias ou permissões internas',
        'Backup individual por consultor'
      ]
    },
    
    consultorCentric: {
      description: 'Interface desenhada para consultor trabalhar sozinho',
      implementation: [
        'Sem gestão de equipas ou subordinados',
        'Workflows otimizados para trabalho individual',
        'Dashboard pessoal com métricas próprias',
        'Agenda e tarefas pessoais',
        'Relatórios de performance individual'
      ]
    },
    
    dataPrivacy: {
      description: 'Privacidade total dos dados de cada consultor',
      implementation: [
        'Impossível ver dados de outros consultores',
        'Logs de acesso individuais',
        'Conformidade GDPR por consultor',
        'Direito ao esquecimento respeitado',
        'Encriptação de dados sensíveis'
      ]
    },

    scalableIsolation: {
      description: 'Milhares de consultores com performance mantida',
      implementation: [
        'Particionamento eficiente na base de dados',
        'Índices otimizados por tenantId',
        'Cache individual por consultor',
        'Recursos escaláveis automaticamente'
      ]
    }
  },

  // ===== ESTRUTURA DE UTILIZADOR =====
  userStructure: {
    singleUser: {
      role: 'owner', // Único role possível
      permissions: [
        'Acesso total aos próprios dados',
        'Gestão completa de clientes',
        'Todos os tipos de deals',
        'Configurações pessoais',
        'Billing e subscrição própria',
        'Export/Import de dados',
        'Integrações externas'
      ]
    },
    
    noHierarchy: {
      description: 'Sem níveis hierárquicos ou gestão de equipas',
      rationale: 'Cada consultor trabalha de forma independente'
    },
    
    collaboration: {
      description: 'Colaboração opcional e controlada',
      methods: [
        'Referral tracking (quem indicou cliente)',
        'Deals plenos com outros consultores (opt-in)',
        'Partilha opcional de contactos (consentimento explícito)',
        'Network de parceiros (agências, recomendadores)'
      ]
    }
  },

  // ===== PLANOS DE SUBSCRIÇÃO =====
  subscriptionModel: {
    billing: 'Individual por consultor',
    plans: {
      basic: {
        price: 29,
        limits: {
          clients: 50,
          deals: 20,
          storage: '1GB',
          features: ['CRM básico', 'Documentos simples', 'Email support']
        }
      },
      pro: {
        price: 59,
        limits: {
          clients: 150,
          deals: 50,
          storage: '5GB',
          features: ['CRM completo', 'AI Assistant', 'Relatórios avançados', 'Priority support']
        }
      },
      unlimited: {
        price: 99,
        limits: {
          clients: -1,
          deals: -1,
          storage: '20GB',
          features: ['Todas as funcionalidades', 'API access', '24/7 support', 'Integrações premium']
        }
      }
    }
  },

  // ===== ARQUITETURA TÉCNICA CORRIGIDA =====
  technicalArchitecture: {
    multiTenancy: {
      model: 'Tenant per User',
      implementation: 'tenantId = userId do consultor',
      isolation: 'Row Level Security baseado em tenantId',
      scaling: 'Horizontal sharding por região'
    },
    
    dataStructure: {
      tenant: 'Consultor individual',
      collections: [
        'tenants/{consultorId}',
        'tenants/{consultorId}/clients',
        'tenants/{consultorId}/deals',
        'tenants/{consultorId}/documents'
      ]
    }
  },

  // ===== WORKFLOWS CORRIGIDOS =====
  workflowPhilosophy: {
    individualWorkflows: [
      'Comprador: consultor gere todo o processo sozinho',
      'Vendedor: consultor tem controlo total do marketing',
      'Investidor: análises privadas e carteira pessoal',
      'Arrendamento: gestão individual de senhorios/inquilinos'
    ],
    
    optionalCollaboration: [
      'Deals plenos: parceria entre 2 consultores independentes',
      'Referrals: tracking de indicações recebidas/dadas',
      'Network: rede de contactos profissionais'
    ]
  },

  // ===== SEGURANÇA E PRIVACIDADE =====
  security: {
    dataIsolation: [
      'Firestore rules: where tenantId == auth.uid',
      'Impossível acesso cruzado entre consultores',
      'Logs de auditoria individuais',
      'Backup segregado por consultor'
    ],
    
    compliance: [
      'GDPR: cada consultor é data controller dos seus dados',
      'Direito ao esquecimento por consultor',
      'Export de dados individual',
      'Consentimentos tracking por cliente'
    ]
  }
};

// ===== CONSTANTES CORRIGIDAS =====
export const SYSTEM_CONSTANTS = {
  TENANT_MODEL: 'single_user', // 1 tenant = 1 consultor
  MAX_COLLABORATORS_PER_DEAL: 2, // Deals plenos apenas
  DEFAULT_PRIVACY_LEVEL: 'private', // Tudo privado por defeito
  REFERRAL_TRACKING: true,
  TEAM_MANAGEMENT: false, // Não existe gestão de equipas
  HIERARCHY_LEVELS: 1, // Apenas owner
  
  // Resto das constantes mantém-se igual...
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  SUPPORTED_FILE_TYPES: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  DEFAULT_PAGINATION: 20
};
