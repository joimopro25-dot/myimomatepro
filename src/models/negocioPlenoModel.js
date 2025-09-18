/**
 * NEGOCIO PLENO MODEL - MyImoMatePro
 * Schema para gestão de negócios plenos (ligação vendedor-comprador)
 * 
 * Caminho: src/models/negocioPlenoModel.js
 * 
 * Um Negócio Pleno é criado quando uma oportunidade vendedora
 * é ligada a uma oportunidade compradora, centralizando todos
 * os dados do negócio numa única entidade.
 */

import { Timestamp } from 'firebase/firestore';

// ===== ESTADOS DO NEGÓCIO PLENO =====
export const NEGOCIO_PLENO_STATES = {
    // Estados iniciais
    PROSPECTING: 'prospeccao',
    QUALIFIED: 'qualificado',

    // Estados de negociação
    PROPOSAL: 'proposta',
    NEGOTIATION: 'negociacao',
    COUNTER_OFFER: 'contraproposta',

    // Estados CPCV
    CPCV_PREPARATION: 'preparacao_cpcv',
    CPCV_PENDING: 'cpcv_pendente',
    CPCV_SIGNED: 'cpcv_assinado',
    DEPOSIT_PENDING: 'sinal_pendente',
    DEPOSIT_RECEIVED: 'sinal_recebido',

    // Estados de escritura
    DEED_PREPARATION: 'preparacao_escritura',
    DEED_SCHEDULED: 'escritura_agendada',
    DEED_COMPLETED: 'escritura_realizada',

    // Estados finais
    COMPLETED: 'concluido',
    CANCELLED: 'cancelado',
    SUSPENDED: 'suspenso'
};

export const NEGOCIO_PLENO_STATE_LABELS = {
    [NEGOCIO_PLENO_STATES.PROSPECTING]: 'Prospecção',
    [NEGOCIO_PLENO_STATES.QUALIFIED]: 'Qualificado',
    [NEGOCIO_PLENO_STATES.PROPOSAL]: 'Proposta',
    [NEGOCIO_PLENO_STATES.NEGOTIATION]: 'Negociação',
    [NEGOCIO_PLENO_STATES.COUNTER_OFFER]: 'Contraproposta',
    [NEGOCIO_PLENO_STATES.CPCV_PREPARATION]: 'Preparação CPCV',
    [NEGOCIO_PLENO_STATES.CPCV_PENDING]: 'CPCV Pendente',
    [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: 'CPCV Assinado',
    [NEGOCIO_PLENO_STATES.DEPOSIT_PENDING]: 'Sinal Pendente',
    [NEGOCIO_PLENO_STATES.DEPOSIT_RECEIVED]: 'Sinal Recebido',
    [NEGOCIO_PLENO_STATES.DEED_PREPARATION]: 'Preparação Escritura',
    [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: 'Escritura Agendada',
    [NEGOCIO_PLENO_STATES.DEED_COMPLETED]: 'Escritura Realizada',
    [NEGOCIO_PLENO_STATES.COMPLETED]: '✅ Concluído',
    [NEGOCIO_PLENO_STATES.CANCELLED]: '❌ Cancelado',
    [NEGOCIO_PLENO_STATES.SUSPENDED]: '⏸️ Suspenso'
};

// ===== TIPOS DE TIMELINE EVENTS =====
export const NEGOCIO_TIMELINE_EVENTS = {
    // Criação e ligação
    CREATED: 'negocio_criado',
    LINKED: 'oportunidades_linkadas',
    UNLINKED: 'oportunidades_deslinkadas',

    // Mudanças de estado
    STATE_CHANGED: 'estado_alterado',

    // Valores
    VALUE_UPDATED: 'valor_atualizado',
    COMMISSION_UPDATED: 'comissao_atualizada',

    // Propostas
    PROPOSAL_CREATED: 'proposta_criada',
    PROPOSAL_ACCEPTED: 'proposta_aceite',
    PROPOSAL_REJECTED: 'proposta_rejeitada',
    COUNTER_OFFER_MADE: 'contraproposta_feita',

    // CPCV
    CPCV_DRAFTED: 'cpcv_rascunhado',
    CPCV_SIGNED: 'cpcv_assinado',
    DEPOSIT_PAID: 'sinal_pago',
    REINFORCEMENT_PAID: 'reforco_pago',

    // Escritura
    DEED_SCHEDULED: 'escritura_agendada',
    DEED_RESCHEDULED: 'escritura_reagendada',
    DEED_COMPLETED: 'escritura_concluida',

    // Documentação
    DOCUMENT_ADDED: 'documento_adicionado',
    DOCUMENT_VALIDATED: 'documento_validado',

    // Notas
    NOTE_ADDED: 'nota_adicionada',
    ALERT_CREATED: 'alerta_criado'
};

// ===== SCHEMA DO NEGÓCIO PLENO =====
export const createNegocioPlenoSchema = (data = {}) => {
    return {
        // ===== METADADOS =====
        id: null, // Será definido pelo Firestore
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: data.createdBy || null,
        consultorId: data.consultorId || null,

        // ===== REFERÊNCIAS ÀS OPORTUNIDADES =====
        oportunidades: {
            vendedora: {
                id: data.oportunidades?.vendedora?.id || null,
                clienteId: data.oportunidades?.vendedora?.clienteId || null,
                clienteNome: data.oportunidades?.vendedora?.clienteNome || '',
                clienteContacto: data.oportunidades?.vendedora?.clienteContacto || '',
                titulo: data.oportunidades?.vendedora?.titulo || ''
            },
            compradora: {
                id: data.oportunidades?.compradora?.id || null,
                clienteId: data.oportunidades?.compradora?.clienteId || null,
                clienteNome: data.oportunidades?.compradora?.clienteNome || '',
                clienteContacto: data.oportunidades?.compradora?.clienteContacto || '',
                titulo: data.oportunidades?.compradora?.titulo || ''
            }
        },

        // ===== ESTADO E IDENTIFICAÇÃO =====
        estado: data.estado || NEGOCIO_PLENO_STATES.PROSPECTING,
        numeroNegocio: data.numeroNegocio || generateBusinessNumber(),
        titulo: data.titulo || 'Negócio Pleno',
        descricao: data.descricao || '',

        // ===== DADOS DO IMÓVEL =====
        imovel: {
            referencia: data.imovel?.referencia || '',
            tipo: data.imovel?.tipo || '',
            tipologia: data.imovel?.tipologia || '',
            morada: data.imovel?.morada || '',
            freguesia: data.imovel?.freguesia || '',
            concelho: data.imovel?.concelho || '',
            distrito: data.imovel?.distrito || '',
            codigoPostal: data.imovel?.codigoPostal || '',

            // Características
            areaBruta: data.imovel?.areaBruta || 0,
            areaUtil: data.imovel?.areaUtil || 0,
            areaTerreno: data.imovel?.areaTerreno || 0,
            anoConstrucao: data.imovel?.anoConstrucao || '',

            // Dados registrais
            numeroMatricula: data.imovel?.numeroMatricula || '',
            conservatoria: data.imovel?.conservatoria || '',
            numeroFiscal: data.imovel?.numeroFiscal || '',
            licencaUtilizacao: data.imovel?.licencaUtilizacao || '',

            // Certificados
            certificadoEnergetico: data.imovel?.certificadoEnergetico || '',
            classeEnergetica: data.imovel?.classeEnergetica || ''
        },

        // ===== VALORES DO NEGÓCIO =====
        valores: {
            // Valor inicial e acordado
            valorPedido: data.valores?.valorPedido || 0,
            valorProposto: data.valores?.valorProposto || 0,
            valorAcordado: data.valores?.valorAcordado || 0,

            // Sinal e reforços
            sinal: data.valores?.sinal || 0,
            sinalPercentagem: data.valores?.sinalPercentagem || 10,
            sinalPago: data.valores?.sinalPago || false,
            dataPagamentoSinal: data.valores?.dataPagamentoSinal || null,

            reforco: data.valores?.reforco || 0,
            reforcoPercentagem: data.valores?.reforcoPercentagem || 0,
            reforcoPago: data.valores?.reforcoPago || false,
            dataPagamentoReforco: data.valores?.dataPagamentoReforco || null,

            // Valor final e escritura
            valorEscritura: data.valores?.valorEscritura || 0,
            valorIMT: data.valores?.valorIMT || 0,
            valorImposto: data.valores?.valorImposto || 0,

            // Financiamento
            tipoFinanciamento: data.valores?.tipoFinanciamento || 'sem_financiamento',
            valorFinanciamento: data.valores?.valorFinanciamento || 0,
            entidadeFinanciadora: data.valores?.entidadeFinanciadora || '',
            estadoFinanciamento: data.valores?.estadoFinanciamento || ''
        },

        // ===== COMISSÕES =====
        comissoes: {
            // Comissão total
            percentagemTotal: data.comissoes?.percentagemTotal || 5,
            valorTotal: data.comissoes?.valorTotal || 0,

            // Divisão vendedor/comprador
            comissaoVendedor: data.comissoes?.comissaoVendedor || 0,
            percentagemVendedor: data.comissoes?.percentagemVendedor || 50,

            comissaoComprador: data.comissoes?.comissaoComprador || 0,
            percentagemComprador: data.comissoes?.percentagemComprador || 50,

            // Partilha com outras agências
            partilhaAgencia: data.comissoes?.partilhaAgencia || false,
            agenciaPartilha: data.comissoes?.agenciaPartilha || '',
            percentagemPartilha: data.comissoes?.percentagemPartilha || 0,
            valorPartilha: data.comissoes?.valorPartilha || 0,

            // Estado dos pagamentos
            comissaoPaga: data.comissoes?.comissaoPaga || false,
            dataPagamentoComissao: data.comissoes?.dataPagamentoComissao || null,
            observacoesComissao: data.comissoes?.observacoesComissao || ''
        },

        // ===== DADOS DO CPCV =====
        cpcv: {
            // Estado e datas
            estado: data.cpcv?.estado || null,
            numeroContrato: data.cpcv?.numeroContrato || '',
            dataAssinatura: data.cpcv?.dataAssinatura || null,
            localAssinatura: data.cpcv?.localAssinatura || '',

            // Cláusulas especiais
            clausulasEspeciais: data.cpcv?.clausulasEspeciais || [],
            condicoesResolutivas: data.cpcv?.condicoesResolutivas || [],

            // Documentos
            minutaCPCV: data.cpcv?.minutaCPCV || '',
            cpcvAssinado: data.cpcv?.cpcvAssinado || '',

            // Checklist
            documentacaoCompleta: data.cpcv?.documentacaoCompleta || false,
            verificacaoJuridica: data.cpcv?.verificacaoJuridica || false,
            verificacaoFiscal: data.cpcv?.verificacaoFiscal || false
        },

        // ===== DADOS DA ESCRITURA =====
        escritura: {
            // Estado e agendamento
            estado: data.escritura?.estado || null,
            dataAgendada: data.escritura?.dataAgendada || null,
            horaAgendada: data.escritura?.horaAgendada || '',
            localEscritura: data.escritura?.localEscritura || '',
            cartorio: data.escritura?.cartorio || '',
            notario: data.escritura?.notario || '',

            // Dados da realização
            dataRealizada: data.escritura?.dataRealizada || null,
            numeroEscritura: data.escritura?.numeroEscritura || '',

            // Valores finais
            valorDeclarado: data.escritura?.valorDeclarado || 0,
            valorIMTPago: data.escritura?.valorIMTPago || 0,
            valorImpostoPago: data.escritura?.valorImpostoPago || 0,

            // Documentos
            documentosNecessarios: data.escritura?.documentosNecessarios || [],
            documentosEntregues: data.escritura?.documentosEntregues || false,

            // Observações
            observacoes: data.escritura?.observacoes || ''
        },

        // ===== DOCUMENTAÇÃO =====
        documentacao: {
            // Documentos do imóvel
            caderneta: data.documentacao?.caderneta || false,
            certidaoPermanente: data.documentacao?.certidaoPermanente || false,
            licencaUtilizacao: data.documentacao?.licencaUtilizacao || false,
            certificadoEnergetico: data.documentacao?.certificadoEnergetico || false,
            fichaTecnica: data.documentacao?.fichaTecnica || false,

            // Documentos das partes
            documentosVendedor: data.documentacao?.documentosVendedor || false,
            documentosComprador: data.documentacao?.documentosComprador || false,

            // Documentos financeiros
            comprovativos: data.documentacao?.comprovativos || [],
            simulacaoCredito: data.documentacao?.simulacaoCredito || false,
            aprovaçãoCredito: data.documentacao?.aprovaçãoCredito || false,

            // Lista de anexos
            anexos: data.documentacao?.anexos || []
        },

        // ===== PRAZOS E DATAS IMPORTANTES =====
        prazos: {
            // Proposta
            dataProposta: data.prazos?.dataProposta || null,
            validadeProposta: data.prazos?.validadeProposta || null,

            // CPCV
            prazoAssinaturaCPCV: data.prazos?.prazoAssinaturaCPCV || null,
            prazoPagamentoSinal: data.prazos?.prazoPagamentoSinal || null,
            prazoPagamentoReforco: data.prazos?.prazoPagamentoReforco || null,

            // Escritura
            prazoEscritura: data.prazos?.prazoEscritura || null,
            prazoEntregaChaves: data.prazos?.prazoEntregaChaves || null,

            // Outros
            prazoFinanciamento: data.prazos?.prazoFinanciamento || null,
            prazoDocumentacao: data.prazos?.prazoDocumentacao || null
        },

        // ===== TAREFAS E CHECKLIST =====
        tarefas: data.tarefas || [],

        checklist: {
            // Fase inicial
            visitaRealizada: data.checklist?.visitaRealizada || false,
            propostaApresentada: data.checklist?.propostaApresentada || false,
            propostaAceite: data.checklist?.propostaAceite || false,

            // Documentação
            documentacaoVendedorCompleta: data.checklist?.documentacaoVendedorCompleta || false,
            documentacaoCompradorCompleta: data.checklist?.documentacaoCompradorCompleta || false,
            documentacaoImovelCompleta: data.checklist?.documentacaoImovelCompleta || false,

            // CPCV
            minutaElaborada: data.checklist?.minutaElaborada || false,
            minutaRevisada: data.checklist?.minutaRevisada || false,
            cpcvAssinado: data.checklist?.cpcvAssinado || false,
            sinalRecebido: data.checklist?.sinalRecebido || false,

            // Financiamento
            creditoSolicitado: data.checklist?.creditoSolicitado || false,
            creditoAprovado: data.checklist?.creditoAprovado || false,
            dipEmitido: data.checklist?.dipEmitido || false,

            // Escritura
            escrituraAgendada: data.checklist?.escrituraAgendada || false,
            documentosEscrituraCompletos: data.checklist?.documentosEscrituraCompletos || false,
            escrituraRealizada: data.checklist?.escrituraRealizada || false,
            chavesEntregues: data.checklist?.chavesEntregues || false,

            // Pagamentos
            comissoesPagas: data.checklist?.comissoesPagas || false,
            impostoPago: data.checklist?.impostoPago || false
        },

        // ===== TIMELINE E HISTÓRICO =====
        timeline: data.timeline || [],

        // ===== NOTAS E OBSERVAÇÕES =====
        notas: data.notas || '',
        notasInternas: data.notasInternas || '',
        alertas: data.alertas || [],

        // ===== CONTROLE =====
        isActive: true,
        isArchived: false,
        archivedAt: null,
        archivedBy: null
    };
};

// ===== VALIDAÇÃO =====
export const validateNegocioPlenoData = (data) => {
    const errors = {};

    // Validar oportunidades
    if (!data.oportunidades?.vendedora?.id || !data.oportunidades?.vendedora?.clienteId) {
        errors.vendedora = 'Dados da oportunidade vendedora são obrigatórios';
    }

    if (!data.oportunidades?.compradora?.id || !data.oportunidades?.compradora?.clienteId) {
        errors.compradora = 'Dados da oportunidade compradora são obrigatórios';
    }

    // Validar que são oportunidades diferentes
    if (data.oportunidades?.vendedora?.id === data.oportunidades?.compradora?.id) {
        errors.link = 'Não pode linkar a mesma oportunidade';
    }

    // Validar valores básicos
    if (data.valores?.valorAcordado && data.valores.valorAcordado < 0) {
        errors.valorAcordado = 'Valor acordado não pode ser negativo';
    }

    if (data.valores?.sinal && data.valores?.valorAcordado) {
        if (data.valores.sinal > data.valores.valorAcordado) {
            errors.sinal = 'Sinal não pode ser maior que o valor acordado';
        }
    }

    // Validar comissões
    if (data.comissoes?.percentagemTotal && data.comissoes.percentagemTotal > 100) {
        errors.comissao = 'Percentagem de comissão não pode ser maior que 100%';
    }

    // Validar datas
    const hoje = new Date();
    if (data.escritura?.dataAgendada && new Date(data.escritura.dataAgendada) < hoje) {
        // Permitir datas passadas se a escritura já foi realizada
        if (!data.escritura?.dataRealizada) {
            errors.dataEscritura = 'Data da escritura não pode ser no passado';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== FUNÇÕES AUXILIARES =====

// Gerar número único do negócio
export function generateBusinessNumber() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `NP-${year}${month}-${random}`;
}

// Calcular valores automáticos
export function calculateBusinessValues(valorAcordado, percentagemSinal = 10, percentagemReforco = 0) {
    const sinal = valorAcordado * (percentagemSinal / 100);
    const reforco = valorAcordado * (percentagemReforco / 100);
    const restante = valorAcordado - sinal - reforco;

    return {
        sinal: Math.round(sinal * 100) / 100,
        reforco: Math.round(reforco * 100) / 100,
        restante: Math.round(restante * 100) / 100,
        total: valorAcordado
    };
}

// Calcular comissões
export function calculateCommissions(valorAcordado, percentagemTotal = 5, divisao = { vendedor: 50, comprador: 50 }) {
    const valorTotal = valorAcordado * (percentagemTotal / 100);
    const comissaoVendedor = valorTotal * (divisao.vendedor / 100);
    const comissaoComprador = valorTotal * (divisao.comprador / 100);

    return {
        valorTotal: Math.round(valorTotal * 100) / 100,
        comissaoVendedor: Math.round(comissaoVendedor * 100) / 100,
        comissaoComprador: Math.round(comissaoComprador * 100) / 100,
        percentagemVendedor: divisao.vendedor,
        percentagemComprador: divisao.comprador
    };
}

// Verificar se pode transitar para próximo estado
export function canTransitionToState(currentState, newState) {
    const transitions = {
        [NEGOCIO_PLENO_STATES.PROSPECTING]: [
            NEGOCIO_PLENO_STATES.QUALIFIED,
            NEGOCIO_PLENO_STATES.PROPOSAL,
            NEGOCIO_PLENO_STATES.CANCELLED
        ],
        [NEGOCIO_PLENO_STATES.QUALIFIED]: [
            NEGOCIO_PLENO_STATES.PROPOSAL,
            NEGOCIO_PLENO_STATES.NEGOTIATION,
            NEGOCIO_PLENO_STATES.CANCELLED,
            NEGOCIO_PLENO_STATES.SUSPENDED
        ],
        [NEGOCIO_PLENO_STATES.PROPOSAL]: [
            NEGOCIO_PLENO_STATES.NEGOTIATION,
            NEGOCIO_PLENO_STATES.COUNTER_OFFER,
            NEGOCIO_PLENO_STATES.CPCV_PREPARATION,
            NEGOCIO_PLENO_STATES.CANCELLED,
            NEGOCIO_PLENO_STATES.SUSPENDED
        ],
        [NEGOCIO_PLENO_STATES.NEGOTIATION]: [
            NEGOCIO_PLENO_STATES.COUNTER_OFFER,
            NEGOCIO_PLENO_STATES.CPCV_PREPARATION,
            NEGOCIO_PLENO_STATES.CANCELLED,
            NEGOCIO_PLENO_STATES.SUSPENDED
        ],
        [NEGOCIO_PLENO_STATES.CPCV_PREPARATION]: [
            NEGOCIO_PLENO_STATES.CPCV_PENDING,
            NEGOCIO_PLENO_STATES.CANCELLED,
            NEGOCIO_PLENO_STATES.SUSPENDED
        ],
        [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: [
            NEGOCIO_PLENO_STATES.DEPOSIT_PENDING,
            NEGOCIO_PLENO_STATES.DEPOSIT_RECEIVED,
            NEGOCIO_PLENO_STATES.DEED_PREPARATION,
            NEGOCIO_PLENO_STATES.CANCELLED
        ],
        [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: [
            NEGOCIO_PLENO_STATES.DEED_COMPLETED,
            NEGOCIO_PLENO_STATES.CANCELLED
        ],
        [NEGOCIO_PLENO_STATES.DEED_COMPLETED]: [
            NEGOCIO_PLENO_STATES.COMPLETED
        ]
    };

    return transitions[currentState]?.includes(newState) || false;
}

// Criar evento de timeline
export function createTimelineEvent(tipo, descricao, dados = {}) {
    return {
        id: Date.now().toString(),
        tipo,
        descricao,
        dados,
        createdAt: Timestamp.now(),
        createdBy: dados.userId || null
    };
}

// Obter próximos passos baseado no estado
export function getNextSteps(estado) {
    const steps = {
        [NEGOCIO_PLENO_STATES.PROSPECTING]: [
            'Agendar visita ao imóvel',
            'Preparar análise de mercado',
            'Validar documentação básica'
        ],
        [NEGOCIO_PLENO_STATES.QUALIFIED]: [
            'Elaborar proposta de compra',
            'Confirmar condições de financiamento',
            'Verificar disponibilidade do vendedor'
        ],
        [NEGOCIO_PLENO_STATES.PROPOSAL]: [
            'Aguardar resposta do vendedor',
            'Preparar contra-argumentos',
            'Verificar margem de negociação'
        ],
        [NEGOCIO_PLENO_STATES.NEGOTIATION]: [
            'Negociar valor final',
            'Acordar condições de pagamento',
            'Definir prazos'
        ],
        [NEGOCIO_PLENO_STATES.CPCV_PREPARATION]: [
            'Reunir documentação completa',
            'Elaborar minuta do CPCV',
            'Agendar assinatura'
        ],
        [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: [
            'Confirmar pagamento do sinal',
            'Acompanhar processo de crédito',
            'Preparar documentação para escritura'
        ],
        [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: [
            'Confirmar documentação completa',
            'Verificar pagamento de impostos',
            'Coordenar presença das partes'
        ]
    };

    return steps[estado] || [];
}

// Calcular dias em cada fase
export function calculateDaysInPhase(createdAt, currentState) {
    const created = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Obter cor do estado para UI
export function getStateColor(estado) {
    const colors = {
        [NEGOCIO_PLENO_STATES.PROSPECTING]: 'gray',
        [NEGOCIO_PLENO_STATES.QUALIFIED]: 'blue',
        [NEGOCIO_PLENO_STATES.PROPOSAL]: 'yellow',
        [NEGOCIO_PLENO_STATES.NEGOTIATION]: 'orange',
        [NEGOCIO_PLENO_STATES.COUNTER_OFFER]: 'orange',
        [NEGOCIO_PLENO_STATES.CPCV_PREPARATION]: 'indigo',
        [NEGOCIO_PLENO_STATES.CPCV_PENDING]: 'indigo',
        [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: 'purple',
        [NEGOCIO_PLENO_STATES.DEPOSIT_PENDING]: 'purple',
        [NEGOCIO_PLENO_STATES.DEPOSIT_RECEIVED]: 'purple',
        [NEGOCIO_PLENO_STATES.DEED_PREPARATION]: 'green',
        [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: 'green',
        [NEGOCIO_PLENO_STATES.DEED_COMPLETED]: 'green',
        [NEGOCIO_PLENO_STATES.COMPLETED]: 'green',
        [NEGOCIO_PLENO_STATES.CANCELLED]: 'red',
        [NEGOCIO_PLENO_STATES.SUSPENDED]: 'gray'
    };

    return colors[estado] || 'gray';
}

// Verificar se negócio está ativo
export function isBusinessActive(estado) {
    return ![
        NEGOCIO_PLENO_STATES.COMPLETED,
        NEGOCIO_PLENO_STATES.CANCELLED
    ].includes(estado);
}

// Exportar todas as constantes e funções
export default {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_PLENO_STATE_LABELS,
    NEGOCIO_TIMELINE_EVENTS,
    createNegocioPlenoSchema,
    validateNegocioPlenoData,
    generateBusinessNumber,
    calculateBusinessValues,
    calculateCommissions,
    canTransitionToState,
    createTimelineEvent,
    getNextSteps,
    calculateDaysInPhase,
    getStateColor,
    isBusinessActive
};