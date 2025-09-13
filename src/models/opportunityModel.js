/**
 * OPPORTUNITY MODEL - MyImoMatePro
 * Schema completo para sistema de Oportunidades
 * 5 Tipos: Comprador, Vendedor, Investidor, Senhorio, Inquilino
 * 
 * Caminho: src/models/opportunityModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== TIPOS DE OPORTUNIDADE =====
export const OPPORTUNITY_TYPES = [
    { value: 'comprador', label: 'Comprador', icon: '🏠', color: 'blue' },
    { value: 'vendedor', label: 'Vendedor', icon: '💰', color: 'green' },
    { value: 'investidor', label: 'Investidor', icon: '📈', color: 'purple' },
    { value: 'senhorio', label: 'Senhorio', icon: '🏘️', color: 'orange' },
    { value: 'inquilino', label: 'Inquilino', icon: '🔑', color: 'teal' }
];

// ===== STATUS DA OPORTUNIDADE =====
export const OPPORTUNITY_STATUS = [
    { value: 'qualificacao', label: 'Em Qualificação', color: 'gray' },
    { value: 'ativa', label: 'Ativa', color: 'green' },
    { value: 'pausada', label: 'Pausada', color: 'yellow' },
    { value: 'ganha', label: 'Ganha', color: 'blue' },
    { value: 'perdida', label: 'Perdida', color: 'red' }
];

// ===== NÍVEIS DE URGÊNCIA =====
export const URGENCY_LEVELS = [
    { value: 'baixa', label: 'Baixa', color: 'gray' },
    { value: 'media', label: 'Média', color: 'yellow' },
    { value: 'alta', label: 'Alta', color: 'orange' },
    { value: 'urgente', label: 'Urgente', color: 'red' }
];

// ===== ESTRATÉGIAS DE INVESTIDOR =====
export const INVESTOR_STRATEGIES = [
    { value: 'hold', label: 'Buy to Hold', description: 'Comprar para valorização' },
    { value: 'rent', label: 'Buy to Rent', description: 'Comprar para arrendar' },
    { value: 'flip', label: 'Fix and Flip', description: 'Comprar, reabilitar e vender' }
];

// ===== FASES POR TIPO DE OPORTUNIDADE =====
export const OPPORTUNITY_PHASES = {
    comprador: [
        { value: 'qualificacao', label: 'Qualificação', order: 1 },
        { value: 'pesquisa', label: 'Pesquisa de Imóveis', order: 2 },
        { value: 'visitas', label: 'Visitas', order: 3 },
        { value: 'proposta', label: 'Proposta', order: 4 },
        { value: 'negociacao', label: 'Negociação', order: 5 },
        { value: 'processo_compra', label: 'Processo de Compra', order: 6 }
    ],
    vendedor: [
        { value: 'avaliacao', label: 'Avaliação do Imóvel', order: 1 },
        { value: 'preparacao', label: 'Preparação e Marketing', order: 2 },
        { value: 'visitas', label: 'Visitas', order: 3 },
        { value: 'propostas', label: 'Análise de Propostas', order: 4 },
        { value: 'processo_venda', label: 'Processo de Venda', order: 5 }
    ],
    investidor: [
        { value: 'analise', label: 'Análise de Investimento', order: 1 },
        { value: 'negociacao', label: 'Negociação', order: 2 },
        { value: 'compra', label: 'Processo de Compra', order: 3 },
        { value: 'preparacao', label: 'Preparação', order: 4 },
        { value: 'execucao', label: 'Execução da Estratégia', order: 5 },
        { value: 'gestao', label: 'Gestão do Investimento', order: 6 },
        { value: 'saida', label: 'Saída/Venda', order: 7 }
    ],
    senhorio: [
        { value: 'preparacao', label: 'Preparação do Imóvel', order: 1 },
        { value: 'marketing', label: 'Marketing e Divulgação', order: 2 },
        { value: 'candidatos', label: 'Análise de Candidatos', order: 3 },
        { value: 'selecao', label: 'Seleção do Inquilino', order: 4 },
        { value: 'contrato', label: 'Contrato de Arrendamento', order: 5 }
    ],
    inquilino: [
        { value: 'pesquisa', label: 'Pesquisa de Imóveis', order: 1 },
        { value: 'visitas', label: 'Visitas', order: 2 },
        { value: 'candidatura', label: 'Candidaturas', order: 3 },
        { value: 'aprovacao', label: 'Aprovação', order: 4 },
        { value: 'contrato', label: 'Contrato', order: 5 }
    ]
};

// ===== SCHEMA PRINCIPAL DA OPORTUNIDADE =====
export const createOpportunitySchema = (opportunityData) => {
    const baseSchema = {
        // ===== METADADOS =====
        id: null, // Será definido pelo Firestore
        clienteId: opportunityData.clienteId || null,
        consultorId: null, // Será preenchido no service
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // ===== DADOS PRINCIPAIS =====
        tipo: opportunityData.tipo || 'comprador',
        status: opportunityData.status || 'qualificacao',
        fase_atual: opportunityData.fase_atual || OPPORTUNITY_PHASES[opportunityData.tipo || 'comprador'][0].value,
        probabilidade: opportunityData.probabilidade || 25,

        // ===== VALORES =====
        valores: {
            estimado: opportunityData.valores?.estimado || 0,
            minimo: opportunityData.valores?.minimo || 0,
            maximo: opportunityData.valores?.maximo || 0,
            comissao_percentagem: opportunityData.valores?.comissao_percentagem || 5,
            comissao_valor: opportunityData.valores?.comissao_valor || 0
        },

        // ===== DATAS IMPORTANTES =====
        datas: {
            prevista_fecho: opportunityData.datas?.prevista_fecho || null,
            ultima_atividade: opportunityData.datas?.ultima_atividade || Timestamp.now(),
            proxima_acao: opportunityData.datas?.proxima_acao || null
        },

        // ===== CONTADORES =====
        stats: {
            total_deals: 0,
            deals_ativos: 0,
            deals_ganhos: 0,
            deals_perdidos: 0,
            dias_na_fase: 0,
            dias_total: 0
        },

        // ===== TAGS E NOTAS =====
        tags: opportunityData.tags || [],
        notas: opportunityData.notas || '',
        motivo_perda: opportunityData.motivo_perda || ''
    };

    // ===== DADOS ESPECÍFICOS POR TIPO =====
    switch (opportunityData.tipo) {
        case 'comprador':
            return {
                ...baseSchema,
                comprador: {
                    orcamento_min: opportunityData.comprador?.orcamento_min || 0,
                    orcamento_max: opportunityData.comprador?.orcamento_max || 0,
                    financiamento_aprovado: opportunityData.comprador?.financiamento_aprovado || false,
                    banco: opportunityData.comprador?.banco || '',
                    montante_aprovado: opportunityData.comprador?.montante_aprovado || 0,
                    entrada_disponivel: opportunityData.comprador?.entrada_disponivel || 0,
                    urgencia: opportunityData.comprador?.urgencia || 'media',
                    motivacao: opportunityData.comprador?.motivacao || '',
                    // Preferências
                    preferencias: {
                        tipologia: opportunityData.comprador?.preferencias?.tipologia || [],
                        localizacao: opportunityData.comprador?.preferencias?.localizacao || [],
                        caracteristicas: opportunityData.comprador?.preferencias?.caracteristicas || [],
                        area_min: opportunityData.comprador?.preferencias?.area_min || 0,
                        area_max: opportunityData.comprador?.preferencias?.area_max || 0
                    }
                }
            };

        case 'vendedor':
            return {
                ...baseSchema,
                vendedor: {
                    // Dados do imóvel
                    imovel: {
                        tipo: opportunityData.vendedor?.imovel?.tipo || '',
                        tipologia: opportunityData.vendedor?.imovel?.tipologia || '',
                        area: opportunityData.vendedor?.imovel?.area || 0,
                        localizacao: opportunityData.vendedor?.imovel?.localizacao || '',
                        ano_construcao: opportunityData.vendedor?.imovel?.ano_construcao || '',
                        certificado_energetico: opportunityData.vendedor?.imovel?.certificado_energetico || ''
                    },
                    // Valores
                    preco_pretendido: opportunityData.vendedor?.preco_pretendido || 0,
                    preco_minimo: opportunityData.vendedor?.preco_minimo || 0,
                    preco_avaliado: opportunityData.vendedor?.preco_avaliado || 0,
                    // Condições
                    urgencia_venda: opportunityData.vendedor?.urgencia_venda || false,
                    motivacao: opportunityData.vendedor?.motivacao || '',
                    exclusividade: opportunityData.vendedor?.exclusividade || false,
                    aceita_permuta: opportunityData.vendedor?.aceita_permuta || false
                }
            };

        case 'investidor':
            return {
                ...baseSchema,
                investidor: {
                    estrategia: opportunityData.investidor?.estrategia || 'hold',
                    capital_disponivel: opportunityData.investidor?.capital_disponivel || 0,
                    financiamento_pre_aprovado: opportunityData.investidor?.financiamento_pre_aprovado || false,
                    experiencia: opportunityData.investidor?.experiencia || 'iniciante',
                    tem_parceiros: opportunityData.investidor?.tem_parceiros || false,
                    // Objetivos
                    objetivos: {
                        roi_minimo: opportunityData.investidor?.objetivos?.roi_minimo || 10,
                        prazo_recuperacao: opportunityData.investidor?.objetivos?.prazo_recuperacao || 60,
                        yield_minimo: opportunityData.investidor?.objetivos?.yield_minimo || 5,
                        valorização_anual: opportunityData.investidor?.objetivos?.valorizacao_anual || 3
                    },
                    // Preferências de investimento
                    preferencias: {
                        tipos_imovel: opportunityData.investidor?.preferencias?.tipos_imovel || [],
                        localizacoes: opportunityData.investidor?.preferencias?.localizacoes || [],
                        estado_conservacao: opportunityData.investidor?.preferencias?.estado_conservacao || [],
                        valor_min: opportunityData.investidor?.preferencias?.valor_min || 0,
                        valor_max: opportunityData.investidor?.preferencias?.valor_max || 0
                    }
                }
            };

        case 'senhorio':
            return {
                ...baseSchema,
                senhorio: {
                    // Imóveis para arrendar
                    imoveis: opportunityData.senhorio?.imoveis || [],
                    tipo_arrendamento: opportunityData.senhorio?.tipo_arrendamento || 'longa_duracao',
                    renda_pretendida: opportunityData.senhorio?.renda_pretendida || 0,
                    disponibilidade: opportunityData.senhorio?.disponibilidade || null,
                    // Condições
                    condicoes: {
                        caucao_meses: opportunityData.senhorio?.condicoes?.caucao_meses || 2,
                        exige_fiador: opportunityData.senhorio?.condicoes?.exige_fiador || false,
                        aceita_animais: opportunityData.senhorio?.condicoes?.aceita_animais || false,
                        mobiliado: opportunityData.senhorio?.condicoes?.mobiliado || false,
                        incluido_despesas: opportunityData.senhorio?.condicoes?.incluido_despesas || false
                    }
                }
            };

        case 'inquilino':
            return {
                ...baseSchema,
                inquilino: {
                    orcamento_mensal: opportunityData.inquilino?.orcamento_mensal || 0,
                    prazo_entrada: opportunityData.inquilino?.prazo_entrada || null,
                    duracao_pretendida: opportunityData.inquilino?.duracao_pretendida || '12_meses',
                    situacao: opportunityData.inquilino?.situacao || 'trabalhador',
                    // Procura
                    procura: {
                        tipologia: opportunityData.inquilino?.procura?.tipologia || [],
                        localizacao: opportunityData.inquilino?.procura?.localizacao || [],
                        caracteristicas: opportunityData.inquilino?.procura?.caracteristicas || []
                    },
                    // Garantias
                    garantias: {
                        tem_fiador: opportunityData.inquilino?.garantias?.tem_fiador || false,
                        caucao_disponivel: opportunityData.inquilino?.garantias?.caucao_disponivel || 0,
                        comprovativo_rendimentos: opportunityData.inquilino?.garantias?.comprovativo_rendimentos || false,
                        contrato_trabalho: opportunityData.inquilino?.garantias?.contrato_trabalho || false
                    }
                }
            };

        default:
            return baseSchema;
    }
};

// ===== VALIDAÇÃO DE DADOS =====
export const validateOpportunityData = (data) => {
    const errors = {};

    // Validações básicas
    if (!data.clienteId) {
        errors.clienteId = 'Cliente é obrigatório';
    }

    if (!data.tipo) {
        errors.tipo = 'Tipo de oportunidade é obrigatório';
    } else if (!OPPORTUNITY_TYPES.find(t => t.value === data.tipo)) {
        errors.tipo = 'Tipo de oportunidade inválido';
    }

    // Validações específicas por tipo
    switch (data.tipo) {
        case 'comprador':
            if (data.comprador?.orcamento_max && data.comprador?.orcamento_min) {
                if (data.comprador.orcamento_max < data.comprador.orcamento_min) {
                    errors.orcamento = 'Orçamento máximo deve ser maior que o mínimo';
                }
            }
            break;

        case 'vendedor':
            if (!data.vendedor?.imovel?.tipo) {
                errors.tipo_imovel = 'Tipo de imóvel é obrigatório';
            }
            if (!data.vendedor?.preco_pretendido || data.vendedor.preco_pretendido <= 0) {
                errors.preco = 'Preço pretendido é obrigatório';
            }
            break;

        case 'investidor':
            if (!data.investidor?.capital_disponivel || data.investidor.capital_disponivel <= 0) {
                errors.capital = 'Capital disponível é obrigatório';
            }
            if (!data.investidor?.estrategia) {
                errors.estrategia = 'Estratégia de investimento é obrigatória';
            }
            break;

        case 'senhorio':
            if (!data.senhorio?.renda_pretendida || data.senhorio.renda_pretendida <= 0) {
                errors.renda = 'Renda pretendida é obrigatória';
            }
            break;

        case 'inquilino':
            if (!data.inquilino?.orcamento_mensal || data.inquilino.orcamento_mensal <= 0) {
                errors.orcamento = 'Orçamento mensal é obrigatório';
            }
            break;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS PARA CÁLCULOS =====
export const calculateCommission = (valor, percentagem) => {
    return (valor * percentagem) / 100;
};

export const calculateROI = (investimento, retorno) => {
    if (investimento === 0) return 0;
    return ((retorno - investimento) / investimento) * 100;
};

export const calculateYield = (rendaMensal, valorImovel) => {
    if (valorImovel === 0) return 0;
    return ((rendaMensal * 12) / valorImovel) * 100;
};

// ===== HELPER PARA PROGRESSO DA OPORTUNIDADE =====
export const getOpportunityProgress = (tipo, faseAtual) => {
    const fases = OPPORTUNITY_PHASES[tipo];
    if (!fases) return 0;

    const faseIndex = fases.findIndex(f => f.value === faseAtual);
    if (faseIndex === -1) return 0;

    return ((faseIndex + 1) / fases.length) * 100;
};

// ===== HELPER PARA PRÓXIMA FASE =====
export const getNextPhase = (tipo, faseAtual) => {
    const fases = OPPORTUNITY_PHASES[tipo];
    if (!fases) return null;

    const faseIndex = fases.findIndex(f => f.value === faseAtual);
    if (faseIndex === -1 || faseIndex === fases.length - 1) return null;

    return fases[faseIndex + 1];
};

// ===== HELPER PARA FASE ANTERIOR =====
export const getPreviousPhase = (tipo, faseAtual) => {
    const fases = OPPORTUNITY_PHASES[tipo];
    if (!fases) return null;

    const faseIndex = fases.findIndex(f => f.value === faseAtual);
    if (faseIndex <= 0) return null;

    return fases[faseIndex - 1];
};