/**
 * LEAD MODEL - MyImoMatePro
 * Modelo de dados para Leads (Qualificações de Clientes PROSPECT)
 * As Leads são qualificações associadas a Clientes com badge PROSPECT
 * 
 * Caminho: src/models/leadModel.js
 */

// ===== TIPOS DE LEAD (INTERESSE DO CLIENTE) =====
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
    IMOBILIARIA_VIRTUAL: 'imobiliaria_virtual',
    TELEFONE: 'telefone',
    WALK_IN: 'walk_in',
    PARCEIRO: 'parceiro',
    PUBLICIDADE: 'publicidade',
    EVENTO: 'evento',
    OUTRO: 'outro'
};

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.REDES_SOCIAIS]: 'Redes Sociais',
    [LEAD_SOURCES.REFERENCIA]: 'Referência',
    [LEAD_SOURCES.IMOBILIARIA_VIRTUAL]: 'Imobiliária Virtual',
    [LEAD_SOURCES.TELEFONE]: 'Telefone',
    [LEAD_SOURCES.WALK_IN]: 'Walk-in (Loja)',
    [LEAD_SOURCES.PARCEIRO]: 'Parceiro',
    [LEAD_SOURCES.PUBLICIDADE]: 'Publicidade',
    [LEAD_SOURCES.EVENTO]: 'Evento',
    [LEAD_SOURCES.OUTRO]: 'Outro'
};

// ===== ESTADOS DO FUNIL =====
export const LEAD_FUNNEL_STATES = {
    ENTRADA: 'entrada',
    QUALIFICANDO: 'qualificando',
    QUALIFICADO: 'qualificado',
    CONVERTIDO: 'convertido',
    PERDIDO: 'perdido'
};

export const LEAD_FUNNEL_LABELS = {
    [LEAD_FUNNEL_STATES.ENTRADA]: 'Entrada',
    [LEAD_FUNNEL_STATES.QUALIFICANDO]: 'Em Qualificação',
    [LEAD_FUNNEL_STATES.QUALIFICADO]: 'Qualificado',
    [LEAD_FUNNEL_STATES.CONVERTIDO]: 'Convertido',
    [LEAD_FUNNEL_STATES.PERDIDO]: 'Perdido'
};

// ===== TEMPERATURA DA LEAD =====
export const LEAD_TEMPERATURES = {
    FRIO: 'frio',
    MORNO: 'morno',
    QUENTE: 'quente'
};

export const LEAD_TEMPERATURE_LABELS = {
    [LEAD_TEMPERATURES.FRIO]: '❄️ Frio',
    [LEAD_TEMPERATURES.MORNO]: '🌡️ Morno',
    [LEAD_TEMPERATURES.QUENTE]: '🔥 Quente'
};

// ===== ESTRUTURA DA LEAD =====
export class Lead {
    constructor(data = {}) {
        // ID e referência ao cliente
        this.id = data.id || null;
        this.clientId = data.clientId || null; // Referência ao Cliente PROSPECT

        // Informações básicas
        this.type = data.type || LEAD_TYPES.COMPRADOR;
        this.source = data.source || LEAD_SOURCES.WEBSITE;
        this.funnelState = data.funnelState || LEAD_FUNNEL_STATES.ENTRADA;
        this.temperature = data.temperature || LEAD_TEMPERATURES.MORNO;

        // Pontuação e qualificação
        this.score = data.score || 0; // 0-100
        this.qualificationDate = data.qualificationDate || null;
        this.conversionDate = data.conversionDate || null;

        // Campos específicos por tipo
        this.specificFields = this.initSpecificFields(data.type, data.specificFields);

        // Tracking
        this.nextContactDate = data.nextContactDate || null;
        this.lastContactDate = data.lastContactDate || null;
        this.contactAttempts = data.contactAttempts || 0;

        // Notas e observações
        this.internalNotes = data.internalNotes || '';

        // Metadados
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.createdBy = data.createdBy || null;
        this.assignedTo = data.assignedTo || null;

        // Status
        this.active = data.active !== undefined ? data.active : true;
    }

    // Inicializar campos específicos baseado no tipo
    initSpecificFields(type, fields = {}) {
        const baseFields = {
            qualificationText: fields.qualificationText || '' // Campo comum a todos
        };

        switch (type) {
            case LEAD_TYPES.COMPRADOR:
                return {
                    ...baseFields,
                    budget: fields.budget || null,
                    propertyReference: fields.propertyReference || '',
                    financingNeeded: fields.financingNeeded || false,
                    urgency: fields.urgency || 'media' // baixa, media, alta
                };

            case LEAD_TYPES.VENDEDOR:
                return {
                    ...baseFields,
                    propertyLocation: fields.propertyLocation || '',
                    expectedValue: fields.expectedValue || null,
                    reasonToSell: fields.reasonToSell || '',
                    propertyType: fields.propertyType || '' // apartamento, moradia, terreno, etc
                };

            case LEAD_TYPES.INQUILINO:
                return {
                    ...baseFields,
                    monthlyBudget: fields.monthlyBudget || null,
                    propertyReference: fields.propertyReference || '',
                    moveInDate: fields.moveInDate || null,
                    guarantor: fields.guarantor || false
                };

            case LEAD_TYPES.SENHORIO:
                return {
                    ...baseFields,
                    propertyLocation: fields.propertyLocation || '',
                    expectedRent: fields.expectedRent || null,
                    availableFrom: fields.availableFrom || null,
                    furnished: fields.furnished || false
                };

            case LEAD_TYPES.INVESTIDOR:
                return {
                    ...baseFields,
                    investmentBudget: fields.investmentBudget || null,
                    investmentLocation: fields.investmentLocation || '',
                    investmentType: fields.investmentType || '', // buy-to-let, flip, development
                    expectedROI: fields.expectedROI || null
                };

            default:
                return baseFields;
        }
    }
}

// ===== FUNÇÕES DE CÁLCULO =====

/**
 * Calcular score de qualificação baseado em múltiplos fatores
 */
export function calculateLeadScore(lead) {
    let score = 0;

    // Pontuação base por estado do funil (30 pontos)
    switch (lead.funnelState) {
        case LEAD_FUNNEL_STATES.ENTRADA:
            score += 10;
            break;
        case LEAD_FUNNEL_STATES.QUALIFICANDO:
            score += 20;
            break;
        case LEAD_FUNNEL_STATES.QUALIFICADO:
            score += 30;
            break;
    }

    // Pontuação por temperatura (20 pontos)
    switch (lead.temperature) {
        case LEAD_TEMPERATURES.FRIO:
            score += 5;
            break;
        case LEAD_TEMPERATURES.MORNO:
            score += 10;
            break;
        case LEAD_TEMPERATURES.QUENTE:
            score += 20;
            break;
    }

    // Pontuação por fonte (15 pontos)
    const highValueSources = [LEAD_SOURCES.REFERENCIA, LEAD_SOURCES.WALK_IN];
    const mediumValueSources = [LEAD_SOURCES.WEBSITE, LEAD_SOURCES.TELEFONE];

    if (highValueSources.includes(lead.source)) {
        score += 15;
    } else if (mediumValueSources.includes(lead.source)) {
        score += 10;
    } else {
        score += 5;
    }

    // Pontuação por completude de informações (20 pontos)
    const fields = lead.specificFields || {};
    const filledFields = Object.values(fields).filter(v => v !== null && v !== '' && v !== false).length;
    const totalFields = Object.keys(fields).length;
    if (totalFields > 0) {
        score += Math.round((filledFields / totalFields) * 20);
    }

    // Pontuação por interação recente (15 pontos)
    if (lead.lastContactDate) {
        const daysSinceContact = Math.floor(
            (new Date() - new Date(lead.lastContactDate)) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceContact <= 1) score += 15;
        else if (daysSinceContact <= 3) score += 10;
        else if (daysSinceContact <= 7) score += 5;
    }

    return Math.min(100, Math.max(0, score));
}

/**
 * Calcular temperatura baseado em interações
 */
export function calculateTemperature(lead) {
    const score = lead.score || calculateLeadScore(lead);

    if (score >= 70) return LEAD_TEMPERATURES.QUENTE;
    if (score >= 40) return LEAD_TEMPERATURES.MORNO;
    return LEAD_TEMPERATURES.FRIO;
}

/**
 * Verificar se lead precisa de follow-up
 */
export function needsFollowUp(lead) {
    if (!lead.active) return false;
    if (lead.funnelState === LEAD_FUNNEL_STATES.CONVERTIDO) return false;
    if (lead.funnelState === LEAD_FUNNEL_STATES.PERDIDO) return false;

    // Se tem data de próximo contacto
    if (lead.nextContactDate) {
        return new Date(lead.nextContactDate) <= new Date();
    }

    // Se não teve contacto nos últimos 3 dias
    if (lead.lastContactDate) {
        const daysSinceContact = Math.floor(
            (new Date() - new Date(lead.lastContactDate)) / (1000 * 60 * 60 * 24)
        );
        return daysSinceContact > 3;
    }

    // Lead nova sem contacto
    return true;
}

// ===== VALIDAÇÃO =====

/**
 * Validar dados da lead
 */
export function validateLeadData(lead) {
    const errors = {};

    // Validações básicas
    if (!lead.clientId) {
        errors.clientId = 'Cliente é obrigatório';
    }

    if (!lead.type) {
        errors.type = 'Tipo de lead é obrigatório';
    }

    if (!lead.source) {
        errors.source = 'Fonte da lead é obrigatória';
    }

    // Validações específicas por tipo
    const fields = lead.specificFields || {};

    switch (lead.type) {
        case LEAD_TYPES.COMPRADOR:
            if (!fields.budget || fields.budget <= 0) {
                errors.budget = 'Orçamento é obrigatório para compradores';
            }
            break;

        case LEAD_TYPES.VENDEDOR:
            if (!fields.propertyLocation) {
                errors.propertyLocation = 'Localização do imóvel é obrigatória';
            }
            if (!fields.expectedValue || fields.expectedValue <= 0) {
                errors.expectedValue = 'Valor pretendido é obrigatório';
            }
            break;

        case LEAD_TYPES.INQUILINO:
            if (!fields.monthlyBudget || fields.monthlyBudget <= 0) {
                errors.monthlyBudget = 'Orçamento mensal é obrigatório';
            }
            break;

        case LEAD_TYPES.SENHORIO:
            if (!fields.propertyLocation) {
                errors.propertyLocation = 'Localização do imóvel é obrigatória';
            }
            if (!fields.expectedRent || fields.expectedRent <= 0) {
                errors.expectedRent = 'Valor de renda é obrigatório';
            }
            break;

        case LEAD_TYPES.INVESTIDOR:
            if (!fields.investmentBudget || fields.investmentBudget <= 0) {
                errors.investmentBudget = 'Orçamento de investimento é obrigatório';
            }
            if (!fields.investmentLocation) {
                errors.investmentLocation = 'Localização pretendida é obrigatória';
            }
            break;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ===== HELPERS DE FORMATAÇÃO =====

/**
 * Obter label amigável do estado do funil
 */
export function getFunnelStateLabel(state) {
    return LEAD_FUNNEL_LABELS[state] || state;
}

/**
 * Obter cor para o estado do funil
 */
export function getFunnelStateColor(state) {
    switch (state) {
        case LEAD_FUNNEL_STATES.ENTRADA:
            return 'bg-gray-100 text-gray-800';
        case LEAD_FUNNEL_STATES.QUALIFICANDO:
            return 'bg-blue-100 text-blue-800';
        case LEAD_FUNNEL_STATES.QUALIFICADO:
            return 'bg-green-100 text-green-800';
        case LEAD_FUNNEL_STATES.CONVERTIDO:
            return 'bg-purple-100 text-purple-800';
        case LEAD_FUNNEL_STATES.PERDIDO:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Obter ícone para temperatura
 */
export function getTemperatureIcon(temperature) {
    switch (temperature) {
        case LEAD_TEMPERATURES.FRIO:
            return '❄️';
        case LEAD_TEMPERATURES.MORNO:
            return '🌡️';
        case LEAD_TEMPERATURES.QUENTE:
            return '🔥';
        default:
            return '🌡️';
    }
}

/**
 * Formatar data relativa
 */
export function getRelativeTime(date) {
    if (!date) return '';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'agora mesmo';
    if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

    return then.toLocaleDateString('pt-PT');
}

// ===== EXPORT DEFAULT =====
export default {
    Lead,
    LEAD_TYPES,
    LEAD_TYPE_LABELS,
    LEAD_SOURCES,
    LEAD_SOURCE_LABELS,
    LEAD_FUNNEL_STATES,
    LEAD_FUNNEL_LABELS,
    LEAD_TEMPERATURES,
    LEAD_TEMPERATURE_LABELS,
    calculateLeadScore,
    calculateTemperature,
    needsFollowUp,
    validateLeadData,
    getFunnelStateLabel,
    getFunnelStateColor,
    getTemperatureIcon,
    getRelativeTime
};