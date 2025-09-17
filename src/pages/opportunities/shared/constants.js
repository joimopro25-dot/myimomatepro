/**
 * CONSTANTES PARTILHADAS - Sistema de Oportunidades
 * Caminho: src/pages/opportunities/shared/constants.js
 */

// Estados de Visita
export const VISIT_STATES = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'efetuada',
    CANCELLED: 'cancelada',
    NO_SHOW: 'nao_compareceu'
};

export const VISIT_STATE_LABELS = {
    [VISIT_STATES.SCHEDULED]: '📅 Agendada',
    [VISIT_STATES.CONFIRMED]: '✅ Confirmada',
    [VISIT_STATES.COMPLETED]: '✔️ Efetuada',
    [VISIT_STATES.CANCELLED]: '❌ Cancelada',
    [VISIT_STATES.NO_SHOW]: '⚠️ Não Compareceu'
};

// Estados de Oferta
export const OFFER_STATES = {
    DRAFT: 'rascunho',
    SUBMITTED: 'submetida',
    NEGOTIATION: 'negociacao',
    COUNTER_OFFER: 'contraproposta',
    ACCEPTED: 'aceite',
    REJECTED: 'rejeitada'
};

export const OFFER_STATE_LABELS = {
    [OFFER_STATES.DRAFT]: '📝 Rascunho',
    [OFFER_STATES.SUBMITTED]: '📤 Submetida',
    [OFFER_STATES.NEGOTIATION]: '🤝 Negociação',
    [OFFER_STATES.COUNTER_OFFER]: '↔️ Contraproposta',
    [OFFER_STATES.ACCEPTED]: '✅ Aceite',
    [OFFER_STATES.REJECTED]: '❌ Rejeitada'
};

// Estados de Negócio para Imóveis
export const PROPERTY_BUSINESS_STATES = {
    PROSPECTING: 'prospeção',
    VISITED: 'visitado',
    PROPOSAL: 'proposta',
    NEGOTIATION: 'negociação',
    ACCEPTED: 'aceite',
    CPCV: 'cpcv',
    DEED: 'escritura'
};

// Badge colors para estados
export const getStatusBadge = (status) => {
    const badges = {
        [PROPERTY_BUSINESS_STATES.PROSPECTING]: {
            color: 'bg-gray-100 text-gray-700',
            label: 'Prospeção'
        },
        [PROPERTY_BUSINESS_STATES.VISITED]: {
            color: 'bg-blue-100 text-blue-700',
            label: 'Visitado'
        },
        [PROPERTY_BUSINESS_STATES.PROPOSAL]: {
            color: 'bg-yellow-100 text-yellow-700',
            label: 'Proposta'
        },
        [PROPERTY_BUSINESS_STATES.NEGOTIATION]: {
            color: 'bg-orange-100 text-orange-700',
            label: 'Negociação'
        },
        [PROPERTY_BUSINESS_STATES.ACCEPTED]: {
            color: 'bg-green-100 text-green-700',
            label: 'Aceite'
        },
        [PROPERTY_BUSINESS_STATES.CPCV]: {
            color: 'bg-purple-100 text-purple-700',
            label: 'CPCV'
        },
        [PROPERTY_BUSINESS_STATES.DEED]: {
            color: 'bg-indigo-100 text-indigo-700',
            label: 'Escritura'
        }
    };
    return badges[status] || badges[PROPERTY_BUSINESS_STATES.PROSPECTING];
};

// Estados específicos para Vendedores
export const SELLER_PROPERTY_STATUS = {
    EVALUATION: 'avaliacao',
    PREPARING: 'preparacao',
    MARKETING: 'marketing',
    ACTIVE: 'ativo',
    RESERVED: 'reservado',
    SOLD: 'vendido',
    SUSPENDED: 'suspenso',
    CANCELLED: 'cancelado'
};

export const SELLER_PROPERTY_STATUS_LABELS = {
    [SELLER_PROPERTY_STATUS.EVALUATION]: '🔍 Em Avaliação',
    [SELLER_PROPERTY_STATUS.PREPARING]: '🔧 Em Preparação',
    [SELLER_PROPERTY_STATUS.MARKETING]: '📣 Em Marketing',
    [SELLER_PROPERTY_STATUS.ACTIVE]: '✅ Ativo no Mercado',
    [SELLER_PROPERTY_STATUS.RESERVED]: '🔒 Reservado',
    [SELLER_PROPERTY_STATUS.SOLD]: '💰 Vendido',
    [SELLER_PROPERTY_STATUS.SUSPENDED]: '⏸️ Suspenso',
    [SELLER_PROPERTY_STATUS.CANCELLED]: '❌ Cancelado'
};

// Tipos de documentos para upload
export const DOCUMENT_TYPES = {
    PROPERTY_DEED: 'escritura',
    ENERGY_CERT: 'certificado_energetico',
    LICENSE: 'licenca_habitacao',
    FLOOR_PLAN: 'planta',
    PHOTOS: 'fotografias',
    TAX_DOC: 'caderneta_predial',
    CONDO_DOCS: 'documentos_condominio',
    OTHER: 'outros'
};

export const DOCUMENT_TYPE_LABELS = {
    [DOCUMENT_TYPES.PROPERTY_DEED]: '📋 Escritura',
    [DOCUMENT_TYPES.ENERGY_CERT]: '⚡ Certificado Energético',
    [DOCUMENT_TYPES.LICENSE]: '🏛️ Licença de Habitação',
    [DOCUMENT_TYPES.FLOOR_PLAN]: '📐 Planta',
    [DOCUMENT_TYPES.PHOTOS]: '📸 Fotografias',
    [DOCUMENT_TYPES.TAX_DOC]: '📄 Caderneta Predial',
    [DOCUMENT_TYPES.CONDO_DOCS]: '🏢 Documentos do Condomínio',
    [DOCUMENT_TYPES.OTHER]: '📎 Outros'
};

// Tipos de Marketing para Vendedores
export const MARKETING_CHANNELS = {
    PORTAL_IMOBILIARIO: 'portal_imobiliario',
    IDEALISTA: 'idealista',
    OLX: 'olx',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    WEBSITE_AGENCIA: 'website_agencia',
    PRESENCIAL: 'presencial',
    CARTAZES: 'cartazes',
    JORNAIS: 'jornais',
    OUTROS: 'outros'
};

export const MARKETING_CHANNEL_LABELS = {
    [MARKETING_CHANNELS.PORTAL_IMOBILIARIO]: '🌐 Portal Imobiliário',
    [MARKETING_CHANNELS.IDEALISTA]: '🏠 Idealista',
    [MARKETING_CHANNELS.OLX]: '🛒 OLX',
    [MARKETING_CHANNELS.FACEBOOK]: '📘 Facebook',
    [MARKETING_CHANNELS.INSTAGRAM]: '📸 Instagram',
    [MARKETING_CHANNELS.WEBSITE_AGENCIA]: '🖥️ Website da Agência',
    [MARKETING_CHANNELS.PRESENCIAL]: '🤝 Presencial',
    [MARKETING_CHANNELS.CARTAZES]: '📋 Cartazes',
    [MARKETING_CHANNELS.JORNAIS]: '📰 Jornais',
    [MARKETING_CHANNELS.OUTROS]: '📌 Outros'
};

// Estados de interesse para visitas (usado em vários tipos)
export const INTEREST_LEVELS = {
    NO_INTEREST: 'sem_interesse',
    LOW: 'baixo',
    MEDIUM: 'medio',
    HIGH: 'alto',
    VERY_HIGH: 'muito_alto'
};

export const INTEREST_LEVEL_LABELS = {
    [INTEREST_LEVELS.NO_INTEREST]: '😐 Sem Interesse',
    [INTEREST_LEVELS.LOW]: '😔 Baixo Interesse',
    [INTEREST_LEVELS.MEDIUM]: '🙂 Médio Interesse',
    [INTEREST_LEVELS.HIGH]: '😊 Alto Interesse',
    [INTEREST_LEVELS.VERY_HIGH]: '🤩 Muito Alto Interesse'
};

// Tipologias de imóveis (partilhado entre vários tipos)
export const PROPERTY_TYPOLOGIES = {
    T0: 'T0',
    T1: 'T1',
    T2: 'T2',
    T3: 'T3',
    T4: 'T4',
    T5_PLUS: 'T5+',
    HOUSE: 'Moradia',
    VILLA: 'Villa',
    APARTMENT: 'Apartamento',
    DUPLEX: 'Duplex',
    PENTHOUSE: 'Penthouse',
    STUDIO: 'Estúdio',
    LOFT: 'Loft',
    LAND: 'Terreno',
    WAREHOUSE: 'Armazém',
    OFFICE: 'Escritório',
    SHOP: 'Loja',
    GARAGE: 'Garagem',
    OTHER: 'Outro'
};

// Helpers para cálculos
export const calculateCommission = (formData) => {
    const valor = parseFloat(formData.valorEstimado) || 0;
    let comissaoTotal = 0;

    if (formData.tipoComissao === 'percentual') {
        comissaoTotal = valor * (formData.percentualComissao / 100);
    } else {
        comissaoTotal = parseFloat(formData.valorComissaoFixo) || 0;
    }

    const minhaComissao = comissaoTotal * (formData.minhaPercentagem / 100);

    return {
        total: comissaoTotal,
        minha: minhaComissao
    };
};

// Validações partilhadas
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9;
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
};

export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-PT');
};