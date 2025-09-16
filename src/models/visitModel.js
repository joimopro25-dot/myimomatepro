/**
 * VISIT MODEL - MyImoMatePro
 * Schema para gestão de visitas
 * 
 * Caminho: src/models/visitModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ESTADOS DE VISITA =====
export const VISIT_STATES = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'efetuada',
    CANCELLED: 'cancelada',
    NO_SHOW: 'nao_compareceu',
    RESCHEDULED: 'reagendada'
};

export const VISIT_STATE_LABELS = {
    [VISIT_STATES.SCHEDULED]: 'Agendada',
    [VISIT_STATES.CONFIRMED]: 'Confirmada',
    [VISIT_STATES.COMPLETED]: 'Efetuada',
    [VISIT_STATES.CANCELLED]: 'Cancelada',
    [VISIT_STATES.NO_SHOW]: 'Não Compareceu',
    [VISIT_STATES.RESCHEDULED]: 'Reagendada'
};

// ===== TIPOS DE VISITA =====
export const VISIT_TYPES = {
    FIRST_VISIT: 'primeira_visita',
    SECOND_VISIT: 'segunda_visita',
    TECHNICAL_VISIT: 'visita_tecnica',
    FINAL_VISIT: 'visita_final',
    OPEN_HOUSE: 'open_house'
};

export const VISIT_TYPE_LABELS = {
    [VISIT_TYPES.FIRST_VISIT]: 'Primeira Visita',
    [VISIT_TYPES.SECOND_VISIT]: 'Segunda Visita',
    [VISIT_TYPES.TECHNICAL_VISIT]: 'Visita Técnica',
    [VISIT_TYPES.FINAL_VISIT]: 'Visita Final',
    [VISIT_TYPES.OPEN_HOUSE]: 'Open House'
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

// ===== FEEDBACK CATEGORIES =====
export const FEEDBACK_CATEGORIES = {
    PRICE: 'preco',
    LOCATION: 'localizacao',
    CONDITION: 'estado',
    SIZE: 'tamanho',
    FEATURES: 'caracteristicas',
    NEIGHBORHOOD: 'vizinhanca',
    DOCUMENTATION: 'documentacao',
    OTHER: 'outro'
};

export const FEEDBACK_CATEGORY_LABELS = {
    [FEEDBACK_CATEGORIES.PRICE]: 'Preço',
    [FEEDBACK_CATEGORIES.LOCATION]: 'Localização',
    [FEEDBACK_CATEGORIES.CONDITION]: 'Estado do Imóvel',
    [FEEDBACK_CATEGORIES.SIZE]: 'Tamanho',
    [FEEDBACK_CATEGORIES.FEATURES]: 'Características',
    [FEEDBACK_CATEGORIES.NEIGHBORHOOD]: 'Vizinhança',
    [FEEDBACK_CATEGORIES.DOCUMENTATION]: 'Documentação',
    [FEEDBACK_CATEGORIES.OTHER]: 'Outro'
};

// ===== SCHEMA DA VISITA =====
export const createVisitSchema = (visitData = {}) => {
    return {
        // Metadados
        id: null,
        opportunityId: visitData.opportunityId || null,
        propertyId: visitData.propertyId || null,
        clientId: visitData.clientId || null,
        consultorId: visitData.consultorId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // Informações da Visita
        tipo: visitData.tipo || VISIT_TYPES.FIRST_VISIT,
        estado: visitData.estado || VISIT_STATES.SCHEDULED,
        dataVisita: visitData.dataVisita || null,
        horaInicio: visitData.horaInicio || '',
        horaFim: visitData.horaFim || '',
        duracao: visitData.duracao || 30, // minutos

        // Dados do Imóvel
        imovelReferencia: visitData.imovelReferencia || '',
        imovelEndereco: visitData.imovelEndereco || '',
        imovelTipologia: visitData.imovelTipologia || '',

        // Participantes
        participantes: visitData.participantes || {
            cliente: {
                nome: visitData.participantes?.cliente?.nome || '',
                telefone: visitData.participantes?.cliente?.telefone || '',
                confirmado: visitData.participantes?.cliente?.confirmado || false
            },
            agente: {
                nome: visitData.participantes?.agente?.nome || '',
                telefone: visitData.participantes?.agente?.telefone || ''
            },
            acompanhantes: visitData.participantes?.acompanhantes || []
        },

        // Preparação
        preparacao: visitData.preparacao || {
            chavesRecolhidas: false,
            imovelPreparado: false,
            documentosImpressos: false,
            rotaPlanada: false,
            clienteConfirmado: false,
            lembreteEnviado: false
        },

        // Feedback (preenchido após a visita)
        feedback: visitData.feedback || {
            realizada: false,
            interesseNivel: null,
            pontosPositivos: [],
            pontosNegativos: [],
            objecoes: [],
            categoriasPrincipais: [],
            comentarioGeral: '',
            proximosPassos: '',
            probabilidadeCompra: 0, // 0-100%

            // Detalhes específicos
            precoAdequado: null, // true/false/null
            localizacaoAprovada: null,
            tamanhoAdequado: null,
            estadoAprovado: null,

            // Questões levantadas
            questoes: [],
            documentosSolicitados: []
        },

        // Follow-up
        followUp: visitData.followUp || {
            necessario: false,
            dataContacto: null,
            tipoContacto: '', // email, telefone, whatsapp
            notas: '',
            tarefasCriadas: []
        },

        // Cancelamento (se aplicável)
        cancelamento: visitData.cancelamento || {
            motivo: '',
            data: null,
            reagendada: false,
            novaData: null
        },

        // Observações
        observacoes: visitData.observacoes || '',
        notasPrivadas: visitData.notasPrivadas || '', // Notas internas não visíveis ao cliente

        // Anexos
        anexos: visitData.anexos || [],
        fotos: visitData.fotos || [],

        // Controle
        isActive: true
    };
};

// ===== VALIDAÇÃO =====
export const validateVisitData = (data) => {
    const errors = {};

    if (!data.dataVisita) {
        errors.dataVisita = 'Data da visita é obrigatória';
    }

    if (!data.horaInicio) {
        errors.horaInicio = 'Hora de início é obrigatória';
    }

    if (!data.imovelReferencia) {
        errors.imovelReferencia = 'Referência do imóvel é obrigatória';
    }

    if (!data.participantes?.cliente?.nome) {
        errors.clienteNome = 'Nome do cliente é obrigatório';
    }

    // Validação de datas futuras para visitas agendadas
    if (data.estado === VISIT_STATES.SCHEDULED) {
        const visitDate = new Date(data.dataVisita);
        const now = new Date();
        if (visitDate < now) {
            errors.dataVisita = 'Não é possível agendar visitas no passado';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS =====

// Calcular duração da visita
export const calculateVisitDuration = (horaInicio, horaFim) => {
    const [inicioHora, inicioMinuto] = horaInicio.split(':').map(Number);
    const [fimHora, fimMinuto] = horaFim.split(':').map(Number);

    const inicioEmMinutos = inicioHora * 60 + inicioMinuto;
    const fimEmMinutos = fimHora * 60 + fimMinuto;

    return fimEmMinutos - inicioEmMinutos;
};

// Formatar data e hora para exibição
export const formatVisitDateTime = (data, hora) => {
    if (!data) return '';

    const date = data.toDate ? data.toDate() : new Date(data);
    const formatted = date.toLocaleDateString('pt-PT');

    if (hora) {
        return `${formatted} às ${hora}`;
    }

    return formatted;
};

// Calcular taxa de conversão de visitas
export const calculateConversionRate = (visits) => {
    if (!visits || visits.length === 0) return 0;

    const completed = visits.filter(v => v.estado === VISIT_STATES.COMPLETED);
    const withHighInterest = completed.filter(v =>
        v.feedback?.interesseNivel === INTEREST_LEVELS.HIGH ||
        v.feedback?.interesseNivel === INTEREST_LEVELS.VERY_HIGH
    );

    return completed.length > 0
        ? Math.round((withHighInterest.length / completed.length) * 100)
        : 0;
};

// Gerar lembrete de visita
export const generateVisitReminder = (visit) => {
    const visitDate = formatVisitDateTime(visit.dataVisita, visit.horaInicio);

    return {
        titulo: `Visita agendada - ${visit.imovelReferencia}`,
        mensagem: `Lembrete: Visita ao imóvel ${visit.imovelReferencia} agendada para ${visitDate}`,
        tipo: 'visita',
        dados: {
            visitId: visit.id,
            clienteNome: visit.participantes?.cliente?.nome,
            imovelEndereco: visit.imovelEndereco
        }
    };
};

// Calcular próximas ações baseadas no feedback
export const suggestNextActions = (feedback) => {
    const actions = [];

    if (feedback.interesseNivel === INTEREST_LEVELS.VERY_HIGH) {
        actions.push('Preparar proposta');
        actions.push('Agendar segunda visita');
    } else if (feedback.interesseNivel === INTEREST_LEVELS.HIGH) {
        actions.push('Enviar mais informações');
        actions.push('Agendar visita a imóveis similares');
    } else if (feedback.interesseNivel === INTEREST_LEVELS.MEDIUM) {
        actions.push('Manter contacto regular');
        actions.push('Procurar alternativas');
    }

    if (feedback.objecoes?.includes('preco')) {
        actions.push('Negociar preço com proprietário');
    }

    if (feedback.documentosSolicitados?.length > 0) {
        actions.push('Providenciar documentos solicitados');
    }

    return actions;
};

// Status de preparação da visita
export const getVisitPreparationStatus = (preparacao) => {
    const total = Object.keys(preparacao).length;
    const completed = Object.values(preparacao).filter(v => v === true).length;

    return {
        percentage: Math.round((completed / total) * 100),
        completed,
        total,
        isReady: completed === total
    };
};

// Exportar helpers de estatísticas
export const getVisitStatistics = (visits) => {
    const stats = {
        total: visits.length,
        scheduled: visits.filter(v => v.estado === VISIT_STATES.SCHEDULED).length,
        completed: visits.filter(v => v.estado === VISIT_STATES.COMPLETED).length,
        cancelled: visits.filter(v => v.estado === VISIT_STATES.CANCELLED).length,
        conversionRate: calculateConversionRate(visits),
        averageInterest: 0
    };

    // Calcular interesse médio
    const completedWithFeedback = visits.filter(v =>
        v.estado === VISIT_STATES.COMPLETED && v.feedback?.interesseNivel
    );

    if (completedWithFeedback.length > 0) {
        const interestMap = {
            [INTEREST_LEVELS.NO_INTEREST]: 0,
            [INTEREST_LEVELS.LOW]: 25,
            [INTEREST_LEVELS.MEDIUM]: 50,
            [INTEREST_LEVELS.HIGH]: 75,
            [INTEREST_LEVELS.VERY_HIGH]: 100
        };

        const totalInterest = completedWithFeedback.reduce((sum, v) =>
            sum + (interestMap[v.feedback.interesseNivel] || 0), 0
        );

        stats.averageInterest = Math.round(totalInterest / completedWithFeedback.length);
    }

    return stats;
};