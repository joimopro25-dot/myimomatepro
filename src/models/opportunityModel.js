/**
 * OPPORTUNITY MODEL - MyImoMatePro
 * VERSÃO SIMPLIFICADA com referência a Negócio Pleno separado
 * 
 * Caminho: src/models/opportunityModel.js
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}/oportunidades/{oportunidadeId}
 * 
 * Tipos de Oportunidade:
 * - COMPRADOR: Cliente interessado em comprar imóvel
 * - VENDEDOR: Cliente que quer vender imóvel
 * - SENHORIO: Cliente que quer arrendar seu imóvel
 * - INQUILINO: Cliente que procura imóvel para arrendar
 * - INVESTIDOR: Cliente interessado em investimentos imobiliários
 * 
 * ATUALIZAÇÃO: Negócio Pleno agora é gerido em entidade separada
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

export const OPPORTUNITY_PRIORITY_LABELS = {
    [OPPORTUNITY_PRIORITIES.LOW]: 'Baixa',
    [OPPORTUNITY_PRIORITIES.MEDIUM]: 'Média',
    [OPPORTUNITY_PRIORITIES.HIGH]: 'Alta',
    [OPPORTUNITY_PRIORITIES.URGENT]: 'Urgente'
};

// ===== ESTADOS PARA VISITAS =====

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

// ===== ESTADOS PARA OFERTAS =====

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

// ===== ESTADOS DE NEGÓCIO DO IMÓVEL =====

export const PROPERTY_BUSINESS_STATES = {
    PROSPECTING: 'prospeção',
    VISITED: 'visitado',
    PROPOSAL: 'proposta',
    NEGOTIATION: 'negociação',
    ACCEPTED: 'aceite',
    CPCV: 'cpcv',
    DEED: 'escritura'
};

export const PROPERTY_BUSINESS_STATE_LABELS = {
    [PROPERTY_BUSINESS_STATES.PROSPECTING]: 'Prospeção',
    [PROPERTY_BUSINESS_STATES.VISITED]: 'Visitado',
    [PROPERTY_BUSINESS_STATES.PROPOSAL]: 'Proposta',
    [PROPERTY_BUSINESS_STATES.NEGOTIATION]: 'Negociação',
    [PROPERTY_BUSINESS_STATES.ACCEPTED]: 'Aceite',
    [PROPERTY_BUSINESS_STATES.CPCV]: 'CPCV',
    [PROPERTY_BUSINESS_STATES.DEED]: 'Escritura'
};

// ===== NÍVEIS DE INTERESSE =====

export const INTEREST_LEVELS = {
    NO_INTEREST: 'sem_interesse',
    LOW: 'baixo',
    MEDIUM: 'medio',
    HIGH: 'alto',
    VERY_HIGH: 'muito_alto'
};

export const INTEREST_LEVEL_LABELS = {
    [INTEREST_LEVELS.NO_INTEREST]: '😐 Sem Interesse',
    [INTEREST_LEVELS.LOW]: '😔 Baixo',
    [INTEREST_LEVELS.MEDIUM]: '🙂 Médio',
    [INTEREST_LEVELS.HIGH]: '😊 Alto',
    [INTEREST_LEVELS.VERY_HIGH]: '🤩 Muito Alto'
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

// ===== SCHEMA PARA VISITA =====

export const createVisitSchema = (visitData = {}) => {
    return {
        id: visitData.id || Date.now().toString(),
        data: visitData.data || '',
        hora: visitData.hora || '',
        estado: visitData.estado || VISIT_STATES.SCHEDULED,
        notas: visitData.notas || '',
        feedback: visitData.feedback || '',
        interesseNivel: visitData.interesseNivel || INTEREST_LEVELS.MEDIUM,
        pontosPositivos: visitData.pontosPositivos || '',
        pontosNegativos: visitData.pontosNegativos || '',
        proximosPassos: visitData.proximosPassos || '',
        createdAt: visitData.createdAt || new Date().toISOString(),
        updatedAt: visitData.updatedAt || new Date().toISOString()
    };
};

// ===== SCHEMA PARA OFERTA =====

export const createOfferSchema = (offerData = {}) => {
    return {
        id: offerData.id || Date.now().toString(),
        valor: offerData.valor || '',
        data: offerData.data || '',
        condicoes: offerData.condicoes || '',
        status: offerData.status || OFFER_STATES.DRAFT,
        notas: offerData.notas || '',
        // Campos para contraproposta
        isContraproposta: offerData.isContraproposta || false,
        valorContraproposta: offerData.valorContraproposta || '',
        condicoesContraproposta: offerData.condicoesContraproposta || '',
        justificacao: offerData.justificacao || '',
        createdAt: offerData.createdAt || new Date().toISOString(),
        updatedAt: offerData.updatedAt || new Date().toISOString()
    };
};

// ===== SCHEMA PARA CPCV =====

export const createCPCVSchema = (cpcvData = {}) => {
    return {
        numeroContrato: cpcvData.numeroContrato || '',
        dataAssinatura: cpcvData.dataAssinatura || '',
        valorVenda: cpcvData.valorVenda || '',
        sinal: cpcvData.sinal || '',
        sinalPercentagem: cpcvData.sinalPercentagem || 10,
        dataEscritura: cpcvData.dataEscritura || '',
        financiamento: cpcvData.financiamento || false,
        banco: cpcvData.banco || '',
        valorCredito: cpcvData.valorCredito || '',
        dipEmitido: cpcvData.dipEmitido || false,
        numeroDIP: cpcvData.numeroDIP || '',
        createdAt: cpcvData.createdAt || new Date().toISOString(),
        updatedAt: cpcvData.updatedAt || new Date().toISOString()
    };
};

// ===== SCHEMA PARA IMÓVEL =====

export const createPropertySchema = (propertyData = {}) => {
    return {
        id: propertyData.id || Date.now().toString(),
        referencia: propertyData.referencia || '',
        tipologia: propertyData.tipologia || 'T2',
        area: propertyData.area || '',
        casasBanho: propertyData.casasBanho || 1,
        temSuite: propertyData.temSuite || false,
        numeroSuites: propertyData.numeroSuites || 0,
        url: propertyData.url || '',
        localizacao: propertyData.localizacao || '',
        valorAnunciado: propertyData.valorAnunciado || '',
        // Dados do agente
        agenteNome: propertyData.agenteNome || '',
        agenteTelefone: propertyData.agenteTelefone || '',
        agenteEmail: propertyData.agenteEmail || '',
        agenteAgencia: propertyData.agenteAgencia || '',
        // Notas e estado
        notas: propertyData.notas || '',
        estadoNegocio: propertyData.estadoNegocio || PROPERTY_BUSINESS_STATES.PROSPECTING,
        // Arrays para gestão
        visitas: propertyData.visitas || [],
        ofertas: propertyData.ofertas || [],
        cpcv: propertyData.cpcv || null,
        createdAt: propertyData.createdAt || new Date().toISOString(),
        updatedAt: propertyData.updatedAt || new Date().toISOString()
    };
};

// ===== SCHEMA BASE DA OPORTUNIDADE (SIMPLIFICADO) =====

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
        tipoComissao: opportunityData.tipoComissao || 'percentual',
        valorComissaoFixo: opportunityData.valorComissaoFixo || 0,
        minhaPercentagem: opportunityData.minhaPercentagem || 100,
        comissaoPaga: opportunityData.comissaoPaga || false,

        // ===== REFERÊNCIA AO NEGÓCIO PLENO (SIMPLIFICADO) =====
        isNegocioPleno: opportunityData.isNegocioPleno || false,
        negocioPlenoId: opportunityData.negocioPlenoId || null,
        // Campos temporários para compatibilidade (serão removidos em futura versão)
        linkedOpportunityId: opportunityData.linkedOpportunityId || null,
        linkedOpportunityClientId: opportunityData.linkedOpportunityClientId || null,
        linkedOpportunityClientName: opportunityData.linkedOpportunityClientName || null,
        linkedType: opportunityData.linkedType || null,

        // ===== DATAS IMPORTANTES =====
        dataContactoInicial: opportunityData.dataContactoInicial || Timestamp.now(),
        dataProximoContacto: opportunityData.dataProximoContacto || null,
        dataFechoPrevisto: opportunityData.dataFechoPrevisto || null,
        dataFechoReal: opportunityData.dataFechoReal || null,

        // ===== ARRAY DE IMÓVEIS (para compradores) =====
        imoveis: opportunityData.imoveis || [],

        // ===== IMÓVEL PARA VENDA (para vendedores) =====
        imovelVenda: opportunityData.imovelVenda || null,

        // ===== PROPRIEDADE RELACIONADA (LEGACY - mantido para compatibilidade) =====
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
            visitasRealizadas: opportunityData.metricas?.visitasRealizadas || 0,
            numeroPropostas: opportunityData.metricas?.numeroPropostas || 0,
            propostasAceites: opportunityData.metricas?.propostasAceites || 0,
            numeroCPCVs: opportunityData.metricas?.numeroCPCVs || 0,
            diasEmPipeline: opportunityData.metricas?.diasEmPipeline || 0,
            taxaConversao: opportunityData.metricas?.taxaConversao || 0
        }
    };

    // Processar imóveis para garantir estrutura completa
    if (opportunityData.imoveis && opportunityData.imoveis.length > 0) {
        baseSchema.imoveis = opportunityData.imoveis.map(imovel => createPropertySchema(imovel));
    }

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
                    tipoCompra: data.comprador?.tipoCompra || 'habitacao_propria',
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
                    caucao: data.senhorio?.caucao || 2,
                    incluiDespesas: data.senhorio?.incluiDespesas || false,
                    permitePets: data.senhorio?.permitePets || false,
                    mobiliado: data.senhorio?.mobiliado || false,
                    disponibilidade: data.senhorio?.disponibilidade || 'imediata',
                    tipoInquilino: data.senhorio?.tipoInquilino || []
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
                    tipoInvestimento: data.investidor?.tipoInvestimento || [],
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

// ===== VALIDAÇÃO DE DADOS (SIMPLIFICADA) =====

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

    // Validação de imóveis
    if (data.imoveis && data.imoveis.length > 0) {
        data.imoveis.forEach((imovel, index) => {
            if (!imovel.referencia) {
                errors[`imovel_${index}_referencia`] = `Referência do imóvel ${index + 1} é obrigatória`;
            }

            // Validar visitas
            if (imovel.visitas) {
                imovel.visitas.forEach((visita, vIndex) => {
                    if (!visita.data || !visita.hora) {
                        errors[`visita_${index}_${vIndex}`] = 'Data e hora da visita são obrigatórias';
                    }
                });
            }

            // Validar ofertas
            if (imovel.ofertas) {
                imovel.ofertas.forEach((oferta, oIndex) => {
                    if (!oferta.valor || oferta.valor <= 0) {
                        errors[`oferta_${index}_${oIndex}`] = 'Valor da oferta deve ser maior que zero';
                    }
                });
            }
        });
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
    VISIT_CANCELLED: 'visita_cancelada',
    VISIT_FEEDBACK: 'feedback_visita',
    PROPOSAL_SENT: 'proposta_enviada',
    PROPOSAL_ACCEPTED: 'proposta_aceita',
    PROPOSAL_REJECTED: 'proposta_rejeitada',
    COUNTER_OFFER: 'contraproposta',
    CPCV_CREATED: 'cpcv_criado',
    CPCV_SIGNED: 'cpcv_assinado',
    DIP_ISSUED: 'dip_emitido',
    DEED_SCHEDULED: 'escritura_agendada',
    DOCUMENT_ADDED: 'documento_adicionado',
    NOTE_ADDED: 'nota_adicionada',
    TASK_CREATED: 'tarefa_criada',
    TASK_COMPLETED: 'tarefa_concluida',
    PROPERTY_ADDED: 'imovel_adicionado',
    PROPERTY_REMOVED: 'imovel_removido',
    // Eventos relacionados com Negócio Pleno (agora geridos externamente)
    LINKED_TO_BUSINESS: 'linkado_a_negocio_pleno',
    UNLINKED_FROM_BUSINESS: 'deslinkado_de_negocio_pleno'
};

// ===== HELPERS PARA CÁLCULOS =====

export const calculateCommission = (opportunity) => {
    // Cálculo base para oportunidades individuais
    if (opportunity.tipoComissao === 'percentual') {
        const valor = opportunity.valorEstimado || 0;
        const percentual = opportunity.percentualComissao || 0;
        const minhaPercentagem = opportunity.minhaPercentagem || 100;

        return (valor * percentual / 100) * (minhaPercentagem / 100);
    } else {
        const valorFixo = opportunity.valorComissaoFixo || 0;
        const minhaPercentagem = opportunity.minhaPercentagem || 100;

        return valorFixo * (minhaPercentagem / 100);
    }
};

export const calculateDaysInPipeline = (createdAt) => {
    const created = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
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

// ===== HELPERS PARA IMÓVEIS =====

export const getPropertyBusinessProgress = (estadoNegocio) => {
    const progressMap = {
        [PROPERTY_BUSINESS_STATES.PROSPECTING]: 10,
        [PROPERTY_BUSINESS_STATES.VISITED]: 25,
        [PROPERTY_BUSINESS_STATES.PROPOSAL]: 40,
        [PROPERTY_BUSINESS_STATES.NEGOTIATION]: 60,
        [PROPERTY_BUSINESS_STATES.ACCEPTED]: 75,
        [PROPERTY_BUSINESS_STATES.CPCV]: 90,
        [PROPERTY_BUSINESS_STATES.DEED]: 100
    };
    return progressMap[estadoNegocio] || 0;
};

export const calculateVisitConversionRate = (visitas) => {
    if (!visitas || visitas.length === 0) return 0;

    const completed = visitas.filter(v => v.estado === VISIT_STATES.COMPLETED);
    const withHighInterest = completed.filter(v =>
        v.interesseNivel === INTEREST_LEVELS.HIGH ||
        v.interesseNivel === INTEREST_LEVELS.VERY_HIGH
    );

    return completed.length > 0
        ? Math.round((withHighInterest.length / completed.length) * 100)
        : 0;
};

export const calculateOfferSuccessRate = (ofertas) => {
    if (!ofertas || ofertas.length === 0) return 0;

    const submitted = ofertas.filter(o => o.status !== OFFER_STATES.DRAFT);
    const accepted = ofertas.filter(o => o.status === OFFER_STATES.ACCEPTED);

    return submitted.length > 0
        ? Math.round((accepted.length / submitted.length) * 100)
        : 0;
};

// ===== HELPERS PARA ESTATÍSTICAS DE IMÓVEIS =====

export const getPropertyStatistics = (imoveis) => {
    if (!imoveis || imoveis.length === 0) {
        return {
            total: 0,
            totalVisitas: 0,
            visitasEfetuadas: 0,
            totalOfertas: 0,
            ofertasAceites: 0,
            totalCPCVs: 0,
            valorMedioAnunciado: 0,
            taxaConversaoVisitas: 0,
            taxaSucessoOfertas: 0
        };
    }

    const stats = {
        total: imoveis.length,
        totalVisitas: 0,
        visitasEfetuadas: 0,
        totalOfertas: 0,
        ofertasAceites: 0,
        totalCPCVs: 0,
        valorTotalAnunciado: 0
    };

    imoveis.forEach(imovel => {
        // Visitas
        if (imovel.visitas) {
            stats.totalVisitas += imovel.visitas.length;
            stats.visitasEfetuadas += imovel.visitas.filter(v =>
                v.estado === VISIT_STATES.COMPLETED
            ).length;
        }

        // Ofertas
        if (imovel.ofertas) {
            stats.totalOfertas += imovel.ofertas.length;
            stats.ofertasAceites += imovel.ofertas.filter(o =>
                o.status === OFFER_STATES.ACCEPTED
            ).length;
        }

        // CPCV
        if (imovel.cpcv) {
            stats.totalCPCVs++;
        }

        // Valor
        if (imovel.valorAnunciado) {
            stats.valorTotalAnunciado += parseFloat(imovel.valorAnunciado) || 0;
        }
    });

    // Calcular médias e taxas
    stats.valorMedioAnunciado = stats.total > 0
        ? Math.round(stats.valorTotalAnunciado / stats.total)
        : 0;

    stats.taxaConversaoVisitas = stats.totalVisitas > 0
        ? Math.round((stats.totalOfertas / stats.totalVisitas) * 100)
        : 0;

    stats.taxaSucessoOfertas = stats.totalOfertas > 0
        ? Math.round((stats.ofertasAceites / stats.totalOfertas) * 100)
        : 0;

    return stats;
};

// ===== HELPER PARA FORMATAR MOEDA =====

export const formatCurrency = (value) => {
    if (!value) return '€0';
    const number = parseFloat(value);
    return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR'
    }).format(number);
};