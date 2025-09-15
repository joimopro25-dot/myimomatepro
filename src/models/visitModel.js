/**
 * VISIT MODEL - MyImoMatePro
 * Schema para Gestão de Visitas a Imóveis
 * 
 * Caminho: src/models/visitModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== ENUMS E CONSTANTES =====

export const VISIT_STATUS = {
    SCHEDULED: 'agendada',
    CONFIRMED: 'confirmada',
    COMPLETED: 'realizada',
    CANCELLED: 'cancelada',
    NO_SHOW: 'nao_compareceu',
    RESCHEDULED: 'reagendada'
};

export const VISIT_TYPES = {
    FIRST_VISIT: 'primeira_visita',
    SECOND_VISIT: 'segunda_visita',
    TECHNICAL_VISIT: 'visita_tecnica',
    EVALUATION: 'avaliacao',
    VIRTUAL: 'virtual',
    WITH_FAMILY: 'com_familia',
    WITH_TECHNICIAN: 'com_tecnico'
};

export const FEEDBACK_RATING = {
    VERY_NEGATIVE: 1,
    NEGATIVE: 2,
    NEUTRAL: 3,
    POSITIVE: 4,
    VERY_POSITIVE: 5
};

export const VISIT_INTEREST_LEVEL = {
    NO_INTEREST: 'sem_interesse',
    LOW: 'baixo',
    MEDIUM: 'medio',
    HIGH: 'alto',
    VERY_HIGH: 'muito_alto',
    READY_TO_OFFER: 'pronto_para_oferta'
};

// ===== LABELS =====

export const VISIT_STATUS_LABELS = {
    [VISIT_STATUS.SCHEDULED]: 'Agendada',
    [VISIT_STATUS.CONFIRMED]: 'Confirmada',
    [VISIT_STATUS.COMPLETED]: 'Realizada',
    [VISIT_STATUS.CANCELLED]: 'Cancelada',
    [VISIT_STATUS.NO_SHOW]: 'Não Compareceu',
    [VISIT_STATUS.RESCHEDULED]: 'Reagendada'
};

export const VISIT_TYPE_LABELS = {
    [VISIT_TYPES.FIRST_VISIT]: 'Primeira Visita',
    [VISIT_TYPES.SECOND_VISIT]: 'Segunda Visita',
    [VISIT_TYPES.TECHNICAL_VISIT]: 'Visita Técnica',
    [VISIT_TYPES.EVALUATION]: 'Avaliação',
    [VISIT_TYPES.VIRTUAL]: 'Visita Virtual',
    [VISIT_TYPES.WITH_FAMILY]: 'Visita com Família',
    [VISIT_TYPES.WITH_TECHNICIAN]: 'Visita com Técnico'
};

export const INTEREST_LEVEL_LABELS = {
    [VISIT_INTEREST_LEVEL.NO_INTEREST]: 'Sem Interesse',
    [VISIT_INTEREST_LEVEL.LOW]: 'Baixo',
    [VISIT_INTEREST_LEVEL.MEDIUM]: 'Médio',
    [VISIT_INTEREST_LEVEL.HIGH]: 'Alto',
    [VISIT_INTEREST_LEVEL.VERY_HIGH]: 'Muito Alto',
    [VISIT_INTEREST_LEVEL.READY_TO_OFFER]: 'Pronto para Oferta'
};

// ===== SCHEMA DA VISITA =====

export const createVisitSchema = (visitData) => {
    return {
        // Metadados
        id: null,
        opportunityId: visitData.opportunityId || null,
        clienteId: visitData.clienteId || null,
        consultorId: visitData.consultorId || null,
        propertyId: visitData.propertyId || null, // Se houver sistema de imóveis
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),

        // Informações da Visita
        tipo: visitData.tipo || VISIT_TYPES.FIRST_VISIT,
        status: visitData.status || VISIT_STATUS.SCHEDULED,

        // Agendamento
        dataVisita: visitData.dataVisita || null,
        horaInicio: visitData.horaInicio || '',
        horaFim: visitData.horaFim || '',
        duracao: visitData.duracao || 30, // minutos

        // Local
        endereco: visitData.endereco || '',
        pontoEncontro: visitData.pontoEncontro || '', // Ex: "Na portaria do prédio"
        coordenadas: {
            latitude: visitData.coordenadas?.latitude || null,
            longitude: visitData.coordenadas?.longitude || null
        },

        // Participantes
        participantes: {
            cliente: {
                nome: visitData.participantes?.cliente?.nome || '',
                telefone: visitData.participantes?.cliente?.telefone || '',
                confirmado: visitData.participantes?.cliente?.confirmado || false
            },
            acompanhantes: visitData.participantes?.acompanhantes || [], // Array de pessoas
            agente: {
                nome: visitData.participantes?.agente?.nome || '',
                telefone: visitData.participantes?.agente?.telefone || '',
                agencia: visitData.participantes?.agente?.agencia || ''
            },
            proprietario: {
                presente: visitData.participantes?.proprietario?.presente || false,
                nome: visitData.participantes?.proprietario?.nome || '',
                telefone: visitData.participantes?.proprietario?.telefone || ''
            }
        },

        // Preparação
        preparacao: {
            chavesRecolhidas: visitData.preparacao?.chavesRecolhidas || false,
            localChaves: visitData.preparacao?.localChaves || '',
            documentosNecessarios: visitData.preparacao?.documentosNecessarios || [],
            instrucoesEspeciais: visitData.preparacao?.instrucoesEspeciais || ''
        },

        // Feedback (preenchido após a visita)
        feedback: {
            realizada: visitData.feedback?.realizada || false,
            rating: visitData.feedback?.rating || null,
            interesseNivel: visitData.feedback?.interesseNivel || '',

            // Pontos Positivos e Negativos
            pontosPositivos: visitData.feedback?.pontosPositivos || [],
            pontosNegativos: visitData.feedback?.pontosNegativos || [],

            // Questões do Cliente
            questoes: visitData.feedback?.questoes || [],
            objecoes: visitData.feedback?.objecoes || [],

            // Próximos Passos
            proximosPassos: visitData.feedback?.proximosPassos || '',
            necessitaSegundaVisita: visitData.feedback?.necessitaSegundaVisita || false,
            prontoParaOferta: visitData.feedback?.prontoParaOferta || false,

            // Comparação com outros imóveis
            comparacoes: visitData.feedback?.comparacoes || [],

            // Observações
            observacoes: visitData.feedback?.observacoes || ''
        },

        // Follow-up
        followUp: {
            necessario: visitData.followUp?.necessario || true,
            dataContacto: visitData.followUp?.dataContacto || null,
            metodoContacto: visitData.followUp?.metodoContacto || 'telefone', // telefone, email, whatsapp
            notas: visitData.followUp?.notas || '',
            realizado: visitData.followUp?.realizado || false,
            resultadoContacto: visitData.followUp?.resultadoContacto || ''
        },

        // Notificações e Lembretes
        notificacoes: {
            lembrete24h: visitData.notificacoes?.lembrete24h || true,
            lembrete2h: visitData.notificacoes?.lembrete2h || true,
            smsCliente: visitData.notificacoes?.smsCliente || false,
            emailCliente: visitData.notificacoes?.emailCliente || false
        },

        // Histórico de Alterações
        historico: visitData.historico || [],

        // Notas Gerais
        notas: visitData.notas || ''
    };
};

// ===== VALIDAÇÃO =====

export const validateVisitData = (data) => {
    const errors = {};

    // Validações obrigatórias
    if (!data.dataVisita) {
        errors.dataVisita = 'Data da visita é obrigatória';
    }

    if (!data.horaInicio) {
        errors.horaInicio = 'Hora de início é obrigatória';
    }

    if (!data.endereco && !data.propertyId) {
        errors.endereco = 'Endereço ou imóvel é obrigatório';
    }

    // Validar participantes
    if (!data.participantes?.cliente?.nome) {
        errors.clienteNome = 'Nome do cliente é obrigatório';
    }

    // Validar datas
    if (data.dataVisita) {
        const visitDate = new Date(data.dataVisita);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (visitDate < now) {
            errors.dataVisita = 'Data da visita não pode ser no passado';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPERS =====

export const calculateVisitDuration = (horaInicio, horaFim) => {
    if (!horaInicio || !horaFim) return 30; // default 30 minutos

    const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
    const [fimHoras, fimMinutos] = horaFim.split(':').map(Number);

    const inicioTotal = inicioHoras * 60 + inicioMinutos;
    const fimTotal = fimHoras * 60 + fimMinutos;

    return fimTotal - inicioTotal;
};

export const getVisitStatusColor = (status) => {
    const colors = {
        [VISIT_STATUS.SCHEDULED]: 'blue',
        [VISIT_STATUS.CONFIRMED]: 'green',
        [VISIT_STATUS.COMPLETED]: 'gray',
        [VISIT_STATUS.CANCELLED]: 'red',
        [VISIT_STATUS.NO_SHOW]: 'orange',
        [VISIT_STATUS.RESCHEDULED]: 'yellow'
    };
    return colors[status] || 'gray';
};

export const getInterestLevelColor = (level) => {
    const colors = {
        [VISIT_INTEREST_LEVEL.NO_INTEREST]: 'red',
        [VISIT_INTEREST_LEVEL.LOW]: 'orange',
        [VISIT_INTEREST_LEVEL.MEDIUM]: 'yellow',
        [VISIT_INTEREST_LEVEL.HIGH]: 'green',
        [VISIT_INTEREST_LEVEL.VERY_HIGH]: 'emerald',
        [VISIT_INTEREST_LEVEL.READY_TO_OFFER]: 'blue'
    };
    return colors[level] || 'gray';
};

// ===== TEMPLATES DE FEEDBACK =====

export const FEEDBACK_TEMPLATES = {
    pontosPositivos: [
        'Localização',
        'Luminosidade',
        'Área/Espaço',
        'Vista',
        'Estado de Conservação',
        'Acabamentos',
        'Garagem',
        'Varanda/Terraço',
        'Arrecadação',
        'Condomínio',
        'Transportes',
        'Comércio Próximo',
        'Escolas Próximas'
    ],

    pontosNegativos: [
        'Preço',
        'Necessita Obras',
        'Barulho',
        'Falta de Luz Natural',
        'Área Pequena',
        'Sem Garagem',
        'Sem Elevador',
        'Andar Baixo',
        'Orientação Solar',
        'Vizinhança',
        'Despesas Condomínio'
    ],

    objecoes: [
        'Preço acima do orçamento',
        'Necessita muitas obras',
        'Localização não ideal',
        'Área insuficiente',
        'Não gostou do prédio',
        'Preferência por outro tipo de imóvel',
        'Ainda não está decidido',
        'Quer ver mais opções',
        'Aguarda aprovação de crédito',
        'Precisa vender imóvel atual primeiro'
    ]
};

// ===== MENSAGENS AUTOMÁTICAS =====

export const VISIT_MESSAGES = {
    confirmacao: (visitData) =>
        `Confirmação de visita agendada para ${visitData.dataVisita} às ${visitData.horaInicio} no endereço ${visitData.endereco}.`,

    lembrete24h: (visitData) =>
        `Lembrete: Tem uma visita agendada amanhã às ${visitData.horaInicio} no endereço ${visitData.endereco}.`,

    lembrete2h: (visitData) =>
        `Sua visita está agendada para daqui a 2 horas às ${visitData.horaInicio}. Endereço: ${visitData.endereco}.`,

    followUp: (clientName) =>
        `Olá ${clientName}, como foi sua experiência na visita de hoje? Gostaria de agendar uma segunda visita ou tem alguma questão?`
};