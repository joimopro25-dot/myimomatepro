/**
 * LEAD MODEL - MyImoMatePro
 * Modelo simplificado de dados para Leads 
 * Lead = Cliente com badge PROSPECT + Qualificação básica
 * 
 * Caminho: src/models/leadModel.js
 */

// ===== TIPOS DE LEAD (Por interesse do cliente) =====
export const LEAD_TYPES = {
    COMPRADOR: 'comprador',
    VENDEDOR: 'vendedor',
    INQUILINO: 'inquilino',
    SENHORIO: 'senhorio',
    INVESTIDOR: 'investidor'
};

export const LEAD_TYPE_LABELS = {
    [LEAD_TYPES.COMPRADOR]: 'Cliente Comprador',
    [LEAD_TYPES.VENDEDOR]: 'Cliente Vendedor',
    [LEAD_TYPES.INQUILINO]: 'Inquilino',
    [LEAD_TYPES.SENHORIO]: 'Senhorio',
    [LEAD_TYPES.INVESTIDOR]: 'Investidor'
};

// ===== FONTES DA LEAD =====
export const LEAD_SOURCES = {
    WEBSITE: 'website',
    REDES_SOCIAIS: 'redes_sociais',
    REFERENCIA: 'referencia',
    PORTAL_IMOBILIARIO: 'portal_imobiliario',
    TELEFONE: 'telefone',
    LOJA: 'loja',
    PARCEIRO: 'parceiro',
    PUBLICIDADE: 'publicidade',
    EVENTO: 'evento',
    OUTRO: 'outro'
};

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.REDES_SOCIAIS]: 'Redes Sociais',
    [LEAD_SOURCES.REFERENCIA]: 'Referência',
    [LEAD_SOURCES.PORTAL_IMOBILIARIO]: 'Portal Imobiliário',
    [LEAD_SOURCES.TELEFONE]: 'Telefone',
    [LEAD_SOURCES.LOJA]: 'Loja',
    [LEAD_SOURCES.PARCEIRO]: 'Parceiro',
    [LEAD_SOURCES.PUBLICIDADE]: 'Publicidade',
    [LEAD_SOURCES.EVENTO]: 'Evento',
    [LEAD_SOURCES.OUTRO]: 'Outro'
};

// ===== ESTADOS DO FUNIL (Simples: Entra -> Qualifica -> Converte) =====
export const LEAD_FUNNEL_STATES = {
    ENTRADA: 'entrada',
    QUALIFICANDO: 'qualificando',
    CONVERTIDO: 'convertido'
};

export const LEAD_FUNNEL_LABELS = {
    [LEAD_FUNNEL_STATES.ENTRADA]: 'Entrada',
    [LEAD_FUNNEL_STATES.QUALIFICANDO]: 'Em Qualificação',
    [LEAD_FUNNEL_STATES.CONVERTIDO]: 'Convertido'
};

// Cores para os estados do funil
export const LEAD_FUNNEL_COLORS = {
    [LEAD_FUNNEL_STATES.ENTRADA]: 'bg-gray-100 text-gray-800',
    [LEAD_FUNNEL_STATES.QUALIFICANDO]: 'bg-blue-100 text-blue-800',
    [LEAD_FUNNEL_STATES.CONVERTIDO]: 'bg-green-100 text-green-800'
};

// ===== ESTRUTURA DA LEAD =====
export class Lead {
    constructor(data = {}) {
        // Identificação
        this.id = data.id || null;
        this.clientId = data.clientId || null; // Referência ao cliente

        // Tipo e Fonte
        this.type = data.type || LEAD_TYPES.COMPRADOR;
        this.source = data.source || LEAD_SOURCES.WEBSITE;

        // Estado do Funil
        this.funnelState = data.funnelState || LEAD_FUNNEL_STATES.ENTRADA;

        // Qualificação específica por tipo
        this.qualification = {
            // Campos comuns
            qualificationNotes: data.qualification?.qualificationNotes || '',

            // Cliente Comprador / Inquilino
            budget: data.qualification?.budget || null,
            propertyReference: data.qualification?.propertyReference || '',

            // Cliente Vendedor / Senhorio
            propertyLocation: data.qualification?.propertyLocation || '',
            askingPrice: data.qualification?.askingPrice || null,

            // Investidor
            investmentLocation: data.qualification?.investmentLocation || '',
            investmentBudget: data.qualification?.investmentBudget || null
        };

        // Tracking
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.convertedAt = data.convertedAt || null;

        // User tracking
        this.createdBy = data.createdBy || null;
        this.assignedTo = data.assignedTo || null;
    }
}

// ===== FUNÇÕES AUXILIARES =====

/**
 * Valida dados de uma lead
 */
export function validateLeadData(data) {
    const errors = {};

    // Cliente é obrigatório
    if (!data.clientId) {
        errors.clientId = 'Cliente é obrigatório';
    }

    // Tipo é obrigatório
    if (!data.type) {
        errors.type = 'Tipo de lead é obrigatório';
    }

    // Fonte é obrigatória
    if (!data.source) {
        errors.source = 'Fonte da lead é obrigatória';
    }

    // Validações específicas por tipo
    if (data.type === LEAD_TYPES.COMPRADOR || data.type === LEAD_TYPES.INQUILINO) {
        if (!data.qualification?.budget) {
            errors.budget = 'Orçamento é obrigatório';
        }
    }

    if (data.type === LEAD_TYPES.VENDEDOR || data.type === LEAD_TYPES.SENHORIO) {
        if (!data.qualification?.propertyLocation) {
            errors.propertyLocation = 'Localização do imóvel é obrigatória';
        }
        if (!data.qualification?.askingPrice) {
            errors.askingPrice = 'Valor pretendido é obrigatório';
        }
    }

    if (data.type === LEAD_TYPES.INVESTIDOR) {
        if (!data.qualification?.investmentBudget) {
            errors.investmentBudget = 'Orçamento de investimento é obrigatório';
        }
        if (!data.qualification?.investmentLocation) {
            errors.investmentLocation = 'Local de investimento é obrigatório';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Obtém os campos de qualificação necessários por tipo
 */
export function getQualificationFieldsByType(type) {
    const baseFields = ['qualificationNotes'];

    switch (type) {
        case LEAD_TYPES.COMPRADOR:
            return [...baseFields, 'budget', 'propertyReference'];

        case LEAD_TYPES.VENDEDOR:
            return [...baseFields, 'propertyLocation', 'askingPrice'];

        case LEAD_TYPES.INQUILINO:
            return [...baseFields, 'budget', 'propertyReference'];

        case LEAD_TYPES.SENHORIO:
            return [...baseFields, 'propertyLocation', 'askingPrice'];

        case LEAD_TYPES.INVESTIDOR:
            return [...baseFields, 'investmentBudget', 'investmentLocation'];

        default:
            return baseFields;
    }
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value) {
    if (!value) return '€0';
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

/**
 * Calcula progresso no funil
 */
export function getFunnelProgress(state) {
    switch (state) {
        case LEAD_FUNNEL_STATES.ENTRADA:
            return 33;
        case LEAD_FUNNEL_STATES.QUALIFICANDO:
            return 66;
        case LEAD_FUNNEL_STATES.CONVERTIDO:
            return 100;
        default:
            return 0;
    }
}

/**
 * Obtém próxima ação recomendada
 */
export function getNextAction(lead) {
    switch (lead.funnelState) {
        case LEAD_FUNNEL_STATES.ENTRADA:
            return 'Contactar cliente para qualificação inicial';
        case LEAD_FUNNEL_STATES.QUALIFICANDO:
            return 'Completar qualificação e converter em oportunidade';
        case LEAD_FUNNEL_STATES.CONVERTIDO:
            return 'Lead convertida - acompanhar oportunidade';
        default:
            return 'Verificar estado da lead';
    }
}

/**
 * Formata data relativa
 */
export function getRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `há ${diffMins} minutos`;
    if (diffHours < 24) return `há ${diffHours} horas`;
    if (diffDays < 30) return `há ${diffDays} dias`;

    return then.toLocaleDateString('pt-PT');
}