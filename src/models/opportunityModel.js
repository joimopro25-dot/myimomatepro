/**
 * OPPORTUNITY MODEL - MyImoMatePro
 * Schema para Oportunidades de Negócio
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}/oportunidades/{oportunidadeId}
 * 
 * Tipos de Oportunidade:
 * - COMPRADOR: Cliente interessado em comprar imóvel
 * - VENDEDOR: Cliente que quer vender imóvel
 * - SENHORIO: Cliente que quer arrendar seu imóvel
 * - INQUILINO: Cliente que procura imóvel para arrendar
 * - INVESTIDOR: Cliente interessado em investimentos imobiliários
 */

import { Timestamp } from 'firebase/firestore';

// ===== ENUMS E CONSTANTES =====

export const OPPORTUNITY_TYPES = {
    BUYER: 'comprador',
    SELLER: 'vendedor',
    LANDLORD: 'senhorio',
    TENANT: 'inquilino',
    INVESTOR: 'investidor'
};

export const OPPORTUNITY_STATES = {
    LEAD: 'lead',
    QUALIFIED: 'qualificado',
    PROPOSAL: 'proposta',
    NEGOTIATION: 'negociacao',
    CLOSED_WON: 'fechado_ganho',
    CLOSED_LOST: 'fechado_perdido',
    ON_HOLD: 'em_espera'
};

export const PROPERTY_TYPES = {
    APARTMENT: 'apartamento',
    HOUSE: 'moradia',
    LAND: 'terreno',
    COMMERCIAL: 'comercial',
    INDUSTRIAL: 'industrial',
    RURAL: 'rural',
    GARAGE: 'garagem',
    OTHER: 'outro'
};

export const OPPORTUNITY_PRIORITIES = {
    LOW: 'baixa',
    MEDIUM: 'media',
    HIGH: 'alta',
    URGENT: 'urgente'
};

// ===== LABELS PARA UI =====

export const OPPORTUNITY_TYPE_LABELS = {
    [OPPORTUNITY_TYPES.BUYER]: 'Comprador',
    [OPPORTUNITY_TYPES.SELLER]: 'Vendedor',
    [OPPORTUNITY_TYPES.LANDLORD]: 'Senhorio',
    [OPPORTUNITY_TYPES.TENANT]: 'Inquilino',
    [OPPORTUNITY_TYPES.INVESTOR]: 'Investidor'
};

export const OPPORTUNITY_STATE_LABELS = {
    [OPPORTUNITY_STATES.LEAD]: 'Lead',
    [OPPORTUNITY_STATES.QUALIFIED]: 'Qualificado',
    [OPPORTUNITY_STATES.PROPOSAL]: 'Proposta',
    [OPPORTUNITY_STATES.NEGOTIATION]: 'Negociação',
    [OPPORTUNITY_STATES.CLOSED_WON]: 'Fechado (Ganho)',
    [OPPORTUNITY_STATES.CLOSED_LOST]: 'Fechado (Perdido)',
    [OPPORTUNITY_STATES.ON_HOLD]: 'Em Espera'
};

export const PROPERTY_TYPE_LABELS = {
    [PROPERTY_TYPES.APARTMENT]: 'Apartamento',
    [PROPERTY_TYPES.HOUSE]: 'Moradia',
    [PROPERTY_TYPES.LAND]: 'Terreno',
    [PROPERTY_TYPES.COMMERCIAL]: 'Comercial',
    [PROPERTY_TYPES.INDUSTRIAL]: 'Industrial',
    [PROPERTY_TYPES.RURAL]: 'Rural',
    [PROPERTY_TYPES.GARAGE]: 'Garagem',
    [PROPERTY_TYPES.OTHER]: 'Outro'
};

// ===== CORES PARA UI =====

export const OPPORTUNITY_TYPE_COLORS = {
    [OPPORTUNITY_TYPES.BUYER]: 'blue',
    [OPPORTUNITY_TYPES.SELLER]: 'green',
    [OPPORTUNITY_TYPES.LANDLORD]: 'purple',
    [OPPORTUNITY_TYPES.TENANT]: 'orange',
    [OPPORTUNITY_TYPES.INVESTOR]: 'yellow'
};

export const OPPORTUNITY_STATE_COLORS = {
    [OPPORTUNITY_STATES.LEAD]: 'gray',
    [OPPORTUNITY_STATES.QUALIFIED]: 'blue',
    [OPPORTUNITY_STATES.PROPOSAL]: 'indigo',
    [OPPORTUNITY_STATES.NEGOTIATION]: 'yellow',
    [OPPORTUNITY_STATES.CLOSED_WON]: 'green',
    [OPPORTUNITY_STATES.CLOSED_LOST]: 'red',
    [OPPORTUNITY_STATES.ON_HOLD]: 'orange'
};

// ===== SCHEMA BASE DA OPORTUNIDADE =====

export const createOpportunitySchema = (opportunityData) => {
    const baseSchema = {
        // ===== METADADOS =====
        id: null, // Será definido pelo Firestore
        clienteId: opportunityData.clienteId || null,
        consultorId: opportunityData.consultorId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,

        // ===== DADOS PRINCIPAIS =====
        tipo: opportunityData.tipo || OPPORTUNITY_TYPES.BUYER,
        estado: opportunityData.estado || OPPORTUNITY_STATES.LEAD,
        prioridade: opportunityData.prioridade || OPPORTUNITY_PRIORITIES.MEDIUM,
        titulo: opportunityData.titulo || '',
        descricao: opportunityData.descricao || '',

        // ===== VALORES E ORÇAMENTO =====
        valorEstimado: opportunityData.valorEstimado || 0,
        valorMinimo: opportunityData.valorMinimo || 0,
        valorMaximo: opportunityData.valorMaximo || 0,
        comissaoEstimada: opportunityData.comissaoEstimada || 0,
        percentualComissao: opportunityData.percentualComissao || 5, // Default 5%

        // ===== DATAS IMPORTANTES =====
        dataContactoInicial: opportunityData.dataContactoInicial || Timestamp.now(),
        dataProximoContacto: opportunityData.dataProximoContacto || null,
        dataFechoPrevisto: opportunityData.dataFechoPrevisto || null,
        dataFechoReal: opportunityData.dataFechoReal || null,

        // ===== PROPRIEDADE RELACIONADA =====
        propriedade: {
            tipoImovel: opportunityData.propriedade?.tipoImovel || '',
            localizacao: opportunityData.propriedade?.localizacao || '',
            distrito: opportunityData.propriedade?.distrito || '',
            concelho: opportunityData.propriedade?.concelho || '',
            freguesia: opportunityData.propriedade?.freguesia || '',
            areaBruta: opportunityData.propriedade?.areaBruta || 0,
            areaUtil: opportunityData.propriedade?.areaUtil || 0,
            numeroQuartos: opportunityData.propriedade?.numeroQuartos || 0,
            numeroCasasBanho: opportunityData.propriedade?.numeroCasasBanho || 0,
            anoConstrucao: opportunityData.propriedade?.anoConstrucao || null,
            referencia: opportunityData.propriedade?.referencia || '',
            caracteristicas: opportunityData.propriedade?.caracteristicas || []
        },

        // ===== TIMELINE DE EVENTOS =====
        timeline: opportunityData.timeline || [],

        // ===== DOCUMENTOS RELACIONADOS =====
        documentos: opportunityData.documentos || [],

        // ===== TAREFAS E FOLLOW-UPS =====
        tarefas: opportunityData.tarefas || [],

        // ===== NOTAS E OBSERVAÇÕES =====
        notas: opportunityData.notas || '',

        // ===== MÉTRICAS E ANALYTICS =====
        metricas: {
            numeroContactos: opportunityData.metricas?.numeroContactos || 0,
            numeroVisitas: opportunityData.metricas?.numeroVisitas || 0,
            numeroPropostas: opportunityData.metricas?.numeroPropostas || 0,
            diasEmPipeline: opportunityData.metricas?.diasEmPipeline || 0,
            taxaConversao: opportunityData.metricas?.taxaConversao || 0
        }
    };

    // Adicionar campos específicos baseados no tipo
    return addTypeSpecificFields(baseSchema, opportunityData);
};

// ===== CAMPOS ESPECÍFICOS POR TIPO =====

const addTypeSpecificFields = (schema, data) => {
    switch (schema.tipo) {
        case OPPORTUNITY_TYPES.BUYER:
            return {
                ...schema,
                comprador: {
                    tipoCompra: data.comprador?.tipoCompra || 'habitacao_propria', // habitacao_propria, investimento, segunda_habitacao
                    necessitaCredito: data.comprador?.necessitaCredito || false,
                    creditoAprovado: data.comprador?.creditoAprovado || false,
                    valorCredito: data.comprador?.valorCredito || 0,
                    entradaDisponivel: data.comprador?.entradaDisponivel || 0,
                    prazoCompra: data.comprador?.prazoCompra || '3_meses',
                    zonasPreferidas: data.comprador?.zonasPreferidas || [],
                    requisitos: data.comprador?.requisitos || []
                }
            };

        case OPPORTUNITY_TYPES.SELLER:
            return {
                ...schema,
                vendedor: {
                    motivoVenda: data.vendedor?.motivoVenda || '',
                    temCredito: data.vendedor?.temCredito || false,
                    valorCredito: data.vendedor?.valorCredito || 0,
                    prazoVenda: data.vendedor?.prazoVenda || '3_meses',
                    aceitaPermuta: data.vendedor?.aceitaPermuta || false,
                    disponibilidadeVisitas: data.vendedor?.disponibilidadeVisitas || '',
                    imovelOcupado: data.vendedor?.imovelOcupado || false,
                    dataDesocupacao: data.vendedor?.dataDesocupacao || null
                }
            };

        case OPPORTUNITY_TYPES.LANDLORD:
            return {
                ...schema,
                senhorio: {
                    valorRenda: data.senhorio?.valorRenda || 0,
                    duracaoContrato: data.senhorio?.duracaoContrato || '1_ano',
                    caucao: data.senhorio?.caucao || 2, // número de meses
                    incluiDespesas: data.senhorio?.incluiDespesas || false,
                    permitePets: data.senhorio?.permitePets || false,
                    mobiliado: data.senhorio?.mobiliado || false,
                    disponibilidade: data.senhorio?.disponibilidade || 'imediata',
                    tipoInquilino: data.senhorio?.tipoInquilino || [] // estudantes, familias, profissionais
                }
            };

        case OPPORTUNITY_TYPES.TENANT:
            return {
                ...schema,
                inquilino: {
                    rendaMaxima: data.inquilino?.rendaMaxima || 0,
                    duracaoDesejada: data.inquilino?.duracaoDesejada || '1_ano',
                    numeroOcupantes: data.inquilino?.numeroOcupantes || 1,
                    temPets: data.inquilino?.temPets || false,
                    necessitaMobiliado: data.inquilino?.necessitaMobiliado || false,
                    dataEntrada: data.inquilino?.dataEntrada || null,
                    temFiador: data.inquilino?.temFiador || false,
                    profissao: data.inquilino?.profissao || '',
                    rendimentoMensal: data.inquilino?.rendimentoMensal || 0
                }
            };

        case OPPORTUNITY_TYPES.INVESTOR:
            return {
                ...schema,
                investidor: {
                    tipoInvestimento: data.investidor?.tipoInvestimento || [], // reabilitacao, arrendamento, revenda
                    orcamentoTotal: data.investidor?.orcamentoTotal || 0,
                    retornoEsperado: data.investidor?.retornoEsperado || 0,
                    prazoInvestimento: data.investidor?.prazoInvestimento || '1_ano',
                    experienciaPrevia: data.investidor?.experienciaPrevia || false,
                    necessitaFinanciamento: data.investidor?.necessitaFinanciamento || false,
                    tipoPropriedades: data.investidor?.tipoPropriedades || [],
                    zonasInteresse: data.investidor?.zonasInteresse || []
                }
            };

        default:
            return schema;
    }
};

// ===== VALIDAÇÃO DE DADOS =====

export const validateOpportunityData = (data) => {
    const errors = {};

    // Validações obrigatórias
    if (!data.tipo || !Object.values(OPPORTUNITY_TYPES).includes(data.tipo)) {
        errors.tipo = 'Tipo de oportunidade é obrigatório e deve ser válido';
    }

    if (!data.titulo || data.titulo.trim().length < 3) {
        errors.titulo = 'Título é obrigatório (mínimo 3 caracteres)';
    }

    // Validações de valores
    if (data.valorEstimado && data.valorEstimado < 0) {
        errors.valorEstimado = 'Valor estimado não pode ser negativo';
    }

    if (data.valorMinimo && data.valorMaximo && data.valorMinimo > data.valorMaximo) {
        errors.valores = 'Valor mínimo não pode ser maior que o valor máximo';
    }

    // Validações específicas por tipo
    if (data.tipo === OPPORTUNITY_TYPES.BUYER && data.comprador) {
        if (data.comprador.necessitaCredito && !data.comprador.valorCredito) {
            errors.valorCredito = 'Valor do crédito é obrigatório quando necessita crédito';
        }
    }

    if (data.tipo === OPPORTUNITY_TYPES.LANDLORD && data.senhorio) {
        if (!data.senhorio.valorRenda || data.senhorio.valorRenda <= 0) {
            errors.valorRenda = 'Valor da renda é obrigatório e deve ser maior que zero';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS PARA TIMELINE =====

export const createTimelineEvent = (tipo, descricao, dados = {}) => {
    return {
        id: Date.now().toString(),
        tipo,
        descricao,
        dados,
        createdAt: Timestamp.now(),
        createdBy: dados.userId || null
    };
};

export const TIMELINE_EVENT_TYPES = {
    CREATED: 'criado',
    STATE_CHANGED: 'estado_alterado',
    VALUE_UPDATED: 'valor_atualizado',
    CONTACT_MADE: 'contacto_realizado',
    VISIT_SCHEDULED: 'visita_agendada',
    VISIT_COMPLETED: 'visita_realizada',
    PROPOSAL_SENT: 'proposta_enviada',
    PROPOSAL_ACCEPTED: 'proposta_aceita',
    PROPOSAL_REJECTED: 'proposta_rejeitada',
    DOCUMENT_ADDED: 'documento_adicionado',
    NOTE_ADDED: 'nota_adicionada',
    TASK_CREATED: 'tarefa_criada',
    TASK_COMPLETED: 'tarefa_concluida'
};

// ===== HELPERS PARA CÁLCULOS =====

export const calculateCommission = (valor, percentual = 5) => {
    return (valor * percentual) / 100;
};

export const calculateDaysInPipeline = (createdAt) => {
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getOpportunityProgress = (estado) => {
    const progressMap = {
        [OPPORTUNITY_STATES.LEAD]: 10,
        [OPPORTUNITY_STATES.QUALIFIED]: 25,
        [OPPORTUNITY_STATES.PROPOSAL]: 50,
        [OPPORTUNITY_STATES.NEGOTIATION]: 75,
        [OPPORTUNITY_STATES.CLOSED_WON]: 100,
        [OPPORTUNITY_STATES.CLOSED_LOST]: 0,
        [OPPORTUNITY_STATES.ON_HOLD]: 30
    };
    return progressMap[estado] || 0;
};