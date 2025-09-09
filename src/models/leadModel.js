/**
 * LEAD MODEL - MyImoMatePro
 * Modelo de dados, validações e lógica de negócio para leads
 * 
 * Caminho: src/models/leadModel.js
 */

import { Timestamp } from 'firebase/firestore';

// ===== CONSTANTES E ENUMS =====

// Status da Lead
export const LEAD_STATUS = {
    NOVO: 'novo',
    CONTACTADO: 'contactado',
    QUALIFICADO: 'qualificado',
    PROPOSTA: 'proposta',
    NEGOCIACAO: 'negociacao',
    GANHO: 'ganho',
    PERDIDO: 'perdido',
    STANDBY: 'standby'
};

export const LEAD_STATUS_LABELS = {
    [LEAD_STATUS.NOVO]: 'Nova',
    [LEAD_STATUS.CONTACTADO]: 'Contactado',
    [LEAD_STATUS.QUALIFICADO]: 'Qualificado',
    [LEAD_STATUS.PROPOSTA]: 'Proposta Enviada',
    [LEAD_STATUS.NEGOCIACAO]: 'Em Negociação',
    [LEAD_STATUS.GANHO]: 'Ganho',
    [LEAD_STATUS.PERDIDO]: 'Perdido',
    [LEAD_STATUS.STANDBY]: 'Stand-by'
};

// Fontes de Lead
export const LEAD_SOURCES = {
    WEBSITE: 'website',
    REFERENCIA: 'referencia',
    REDES_SOCIAIS: 'redes_sociais',
    EMAIL_MARKETING: 'email_marketing',
    TELEFONE: 'telefone',
    EVENTO: 'evento',
    PUBLICIDADE: 'publicidade',
    PARCEIRO: 'parceiro',
    DIRETO: 'direto',
    OUTRO: 'outro'
};

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.REFERENCIA]: 'Referência',
    [LEAD_SOURCES.REDES_SOCIAIS]: 'Redes Sociais',
    [LEAD_SOURCES.EMAIL_MARKETING]: 'Email Marketing',
    [LEAD_SOURCES.TELEFONE]: 'Telefone',
    [LEAD_SOURCES.EVENTO]: 'Evento',
    [LEAD_SOURCES.PUBLICIDADE]: 'Publicidade',
    [LEAD_SOURCES.PARCEIRO]: 'Parceiro',
    [LEAD_SOURCES.DIRETO]: 'Direto',
    [LEAD_SOURCES.OUTRO]: 'Outro'
};

// Interesses da Lead
export const LEAD_INTERESTS = {
    COMPRAR: 'comprar',
    VENDER: 'vender',
    ARRENDAR: 'arrendar',
    ALUGAR: 'alugar',
    INVESTIR: 'investir',
    AVALIAR: 'avaliar',
    OUTRO: 'outro'
};

export const LEAD_INTEREST_LABELS = {
    [LEAD_INTERESTS.COMPRAR]: 'Comprar',
    [LEAD_INTERESTS.VENDER]: 'Vender',
    [LEAD_INTERESTS.ARRENDAR]: 'Arrendar',
    [LEAD_INTERESTS.ALUGAR]: 'Alugar',
    [LEAD_INTERESTS.INVESTIR]: 'Investir',
    [LEAD_INTERESTS.AVALIAR]: 'Avaliar',
    [LEAD_INTERESTS.OUTRO]: 'Outro'
};

// Temperatura da Lead
export const LEAD_TEMPERATURES = {
    FRIO: 'frio',
    MORNO: 'morno',
    QUENTE: 'quente'
};

export const LEAD_TEMPERATURE_LABELS = {
    [LEAD_TEMPERATURES.FRIO]: 'Frio',
    [LEAD_TEMPERATURES.MORNO]: 'Morno',
    [LEAD_TEMPERATURES.QUENTE]: 'Quente'
};

// Tipos de Tarefas
export const TASK_TYPES = {
    CALL: 'call',
    EMAIL: 'email',
    WHATSAPP: 'whatsapp',
    MEETING: 'meeting',
    VISIT: 'visit',
    FOLLOW_UP: 'follow_up',
    CONFIRMATION: 'confirmation',
    PRESENTATION: 'presentation',
    DOCUMENTATION: 'documentation',
    NEGOTIATION: 'negotiation'
};

export const TASK_TYPE_LABELS = {
    [TASK_TYPES.CALL]: 'Chamada Telefónica',
    [TASK_TYPES.EMAIL]: 'Email',
    [TASK_TYPES.WHATSAPP]: 'WhatsApp',
    [TASK_TYPES.MEETING]: 'Reunião',
    [TASK_TYPES.VISIT]: 'Visita',
    [TASK_TYPES.FOLLOW_UP]: 'Follow-up',
    [TASK_TYPES.CONFIRMATION]: 'Confirmar Interesse',
    [TASK_TYPES.PRESENTATION]: 'Apresentação',
    [TASK_TYPES.DOCUMENTATION]: 'Documentação',
    [TASK_TYPES.NEGOTIATION]: 'Negociação'
};

export const TASK_STATUS = {
    PENDENTE: 'pendente',
    EM_ANDAMENTO: 'em_andamento',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada',
    REAGENDADA: 'reagendada'
};

export const TASK_STATUS_LABELS = {
    [TASK_STATUS.PENDENTE]: 'Pendente',
    [TASK_STATUS.EM_ANDAMENTO]: 'Em Andamento',
    [TASK_STATUS.CONCLUIDA]: 'Concluída',
    [TASK_STATUS.CANCELADA]: 'Cancelada',
    [TASK_STATUS.REAGENDADA]: 'Reagendada'
};

// ===== SCHEMA PRINCIPAL DA LEAD =====
export const createLeadSchema = (leadData) => {
    const now = Timestamp.now();

    return {
        id: null,
        consultorId: null,

        // ===== DADOS PESSOAIS BÁSICOS =====
        name: leadData.name?.trim() || '',
        phone: leadData.phone?.trim() || '',
        email: leadData.email?.trim() || '',

        // ===== CLASSIFICAÇÃO DA LEAD =====
        leadSource: leadData.leadSource || LEAD_SOURCES.WEBSITE,
        interesse: leadData.interesse || LEAD_INTERESTS.COMPRAR,

        // ===== CAMPOS DE QUALIFICAÇÃO =====
        urgencia: leadData.urgencia || 'media',
        orcamentoEstimado: leadData.orcamentoEstimado ? parseFloat(leadData.orcamentoEstimado) : null,
        zonaInteresse: leadData.zonaInteresse?.trim() || '',
        tipologiaInteresse: leadData.tipologiaInteresse || '',
        melhorHorario: leadData.melhorHorario || '',
        contactPreference: leadData.contactPreference || 'phone',
        statusQualificacao: leadData.statusQualificacao || 'por_qualificar',

        // ===== DESCRIÇÃO DETALHADA =====
        descricao: leadData.descricao?.trim() || '',
        consultorObservations: leadData.consultorObservations?.trim() || '',

        // ===== TIMESTAMPS COM HORA =====
        criadaEm: now,
        atualizadaEm: now,
        proximoContacto: leadData.proximoContacto ?
            Timestamp.fromDate(new Date(leadData.proximoContacto)) : null,

        // ===== STATUS E QUALIFICAÇÃO =====
        status: LEAD_STATUS.NOVO,
        temperatura: LEAD_TEMPERATURES.MORNO,
        score: 50,

        // ===== HISTÓRICO DE ATIVIDADES =====
        ultimoContacto: null,
        totalContactos: 0,
        totalTasks: 0,
        tasksCompletas: 0,

        // ===== CONSENTIMENTOS =====
        gdprConsent: leadData.gdprConsent || false,
        marketingConsent: leadData.marketingConsent || false,

        // ===== CONVERSÃO =====
        convertidaEm: null,
        clienteId: null,
        motivoPerda: '',

        // ===== TAGS =====
        tags: leadData.tags || [],
        categoria: 'lead',

        // ===== ESTATÍSTICAS =====
        stats: {
            diasSemContacto: 0,
            tempoMedioResposta: 0,
            taxaResposta: 0,
            ultimaAcao: null
        }
    };
};

// ===== SCHEMA PARA TASK =====
export const createTaskSchema = (taskData) => {
    const now = Timestamp.now();

    return {
        id: null,
        leadId: taskData.leadId,
        consultorId: taskData.consultorId,

        // Dados da task
        tipo: taskData.tipo || TASK_TYPES.CALL,
        titulo: taskData.titulo?.trim() || '',
        descricao: taskData.descricao?.trim() || '',

        // Agendamento
        agendadaPara: taskData.agendadaPara ?
            Timestamp.fromDate(new Date(taskData.agendadaPara)) : null,
        duracaoEstimada: taskData.duracaoEstimada || null,

        // Status
        status: TASK_STATUS.PENDENTE,
        executadaEm: null,
        duracaoReal: null,
        resultado: '',
        notas: '',

        // Timestamps
        criadaEm: now,
        atualizadaEm: now,

        // Próxima ação
        proximaAcao: {
            sugerida: false,
            tipo: null,
            prazo: null,
            descricao: ''
        }
    };
};

// ===== SCHEMA PARA CONTACTO =====
export const createContactoSchema = (contactoData) => {
    const now = Timestamp.now();

    return {
        id: null,
        leadId: contactoData.leadId,
        consultorId: contactoData.consultorId,

        // Dados do contacto
        tipo: contactoData.tipo || TASK_TYPES.CALL,
        dataContacto: now,
        duracao: contactoData.duracao || null,

        // Conteúdo
        resumo: contactoData.resumo?.trim() || '',
        notas: contactoData.notas?.trim() || '',
        resultado: contactoData.resultado || '',

        // Follow-up
        agendarProximo: contactoData.agendarProximo || false,
        proximoContactoData: contactoData.proximoContactoData || null,
        proximoContactoTipo: contactoData.proximoContactoTipo || null,

        // Qualificação
        interesseConfirmado: contactoData.interesseConfirmado || false,
        orcamentoDiscutido: contactoData.orcamentoDiscutido || false,
        tempoDecisao: contactoData.tempoDecisao || '',

        // Timestamps
        criadoEm: now,
        atualizadoEm: now
    };
};

// ===== VALIDAÇÕES =====

/**
 * Valida dados da lead
 */
export const validateLeadData = (leadData) => {
    const errors = {};

    // Nome obrigatório
    if (!leadData.name?.trim()) {
        errors.name = 'Nome é obrigatório';
    }

    // Telefone obrigatório e formato válido
    if (!leadData.phone?.trim()) {
        errors.phone = 'Telefone é obrigatório';
    } else if (!/^[0-9+\-\s()]+$/.test(leadData.phone)) {
        errors.phone = 'Formato de telefone inválido';
    }

    // Email opcional mas se fornecido deve ser válido
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
        errors.email = 'Email inválido';
    }

    // Orçamento deve ser positivo se fornecido
    if (leadData.orcamentoEstimado && leadData.orcamentoEstimado < 0) {
        errors.orcamentoEstimado = 'Orçamento deve ser positivo';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Valida dados de task
 */
export const validateTaskData = (taskData) => {
    const errors = {};

    if (!taskData.titulo?.trim()) {
        errors.titulo = 'Título é obrigatório';
    }

    if (!taskData.tipo) {
        errors.tipo = 'Tipo de tarefa é obrigatório';
    }

    if (!taskData.leadId) {
        errors.leadId = 'Lead ID é obrigatório';
    }

    if (!taskData.consultorId) {
        errors.consultorId = 'Consultor ID é obrigatório';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== FUNÇÕES DE CÁLCULO =====

/**
 * Calcula temperatura da lead baseado no último contacto
 */
export const calculateLeadTemperature = (ultimoContacto) => {
    if (!ultimoContacto) return LEAD_TEMPERATURES.FRIO;

    const diasSemContacto = Math.floor(
        (Date.now() - ultimoContacto.toDate().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diasSemContacto <= 3) return LEAD_TEMPERATURES.QUENTE;
    if (diasSemContacto <= 7) return LEAD_TEMPERATURES.MORNO;
    return LEAD_TEMPERATURES.FRIO;
};

/**
 * Calcula score da lead baseado em múltiplos fatores
 */
export const calculateLeadScore = (leadData) => {
    let score = 0;

    // Fonte da lead (20 pontos)
    const highValueSources = [LEAD_SOURCES.REFERENCIA, LEAD_SOURCES.DIRETO];
    if (highValueSources.includes(leadData.leadSource)) {
        score += 20;
    } else {
        score += 10;
    }

    // Interesse (20 pontos)
    const highValueInterests = [LEAD_INTERESTS.COMPRAR, LEAD_INTERESTS.INVESTIR];
    if (highValueInterests.includes(leadData.interesse)) {
        score += 20;
    } else {
        score += 10;
    }

    // Urgência (20 pontos)
    if (leadData.urgencia === 'alta') score += 20;
    else if (leadData.urgencia === 'media') score += 10;
    else score += 5;

    // Orçamento (20 pontos)
    if (leadData.orcamentoEstimado) {
        if (leadData.orcamentoEstimado >= 500000) score += 20;
        else if (leadData.orcamentoEstimado >= 250000) score += 15;
        else if (leadData.orcamentoEstimado >= 100000) score += 10;
        else score += 5;
    }

    // Engajamento (20 pontos)
    if (leadData.totalContactos > 5) score += 20;
    else if (leadData.totalContactos > 2) score += 10;
    else if (leadData.totalContactos > 0) score += 5;

    return Math.min(100, score);
};

/**
 * Determina próxima ação recomendada
 */
export const getNextRecommendedAction = (leadData) => {
    // Lead nova
    if (leadData.status === LEAD_STATUS.NOVO) {
        return {
            type: TASK_TYPES.CALL,
            label: 'Primeiro Contacto',
            description: 'Fazer primeira chamada de apresentação'
        };
    }

    // Lead contactada mas não qualificada
    if (leadData.status === LEAD_STATUS.CONTACTADO &&
        leadData.statusQualificacao === 'por_qualificar') {
        return {
            type: TASK_TYPES.MEETING,
            label: 'Reunião de Qualificação',
            description: 'Agendar reunião para qualificar necessidades'
        };
    }

    // Lead qualificada
    if (leadData.status === LEAD_STATUS.QUALIFICADO) {
        return {
            type: TASK_TYPES.PRESENTATION,
            label: 'Apresentação de Proposta',
            description: 'Preparar e apresentar proposta comercial'
        };
    }

    // Lead em negociação
    if (leadData.status === LEAD_STATUS.NEGOCIACAO) {
        return {
            type: TASK_TYPES.NEGOTIATION,
            label: 'Negociação',
            description: 'Finalizar termos e fechar negócio'
        };
    }

    // Default: follow-up
    return {
        type: TASK_TYPES.FOLLOW_UP,
        label: 'Follow-up',
        description: 'Fazer acompanhamento da lead'
    };
};

/**
 * Verifica se lead precisa de alerta
 */
export const needsAlert = (leadData) => {
    const alerts = [];

    // Alerta de lead fria
    if (leadData.temperatura === LEAD_TEMPERATURES.FRIO) {
        alerts.push({
            type: 'temperature',
            message: 'Lead está fria - necessita contacto urgente',
            severity: 'high'
        });
    }

    // Alerta de tempo sem contacto
    if (leadData.ultimoContacto) {
        const diasSemContacto = Math.floor(
            (Date.now() - leadData.ultimoContacto.toDate().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasSemContacto > 7) {
            alerts.push({
                type: 'no_contact',
                message: `${diasSemContacto} dias sem contacto`,
                severity: 'medium'
            });
        }
    }

    // Alerta de próximo contacto vencido
    if (leadData.proximoContacto) {
        const now = Date.now();
        const proximoContacto = leadData.proximoContacto.toDate().getTime();

        if (proximoContacto < now) {
            alerts.push({
                type: 'overdue',
                message: 'Contacto agendado está em atraso',
                severity: 'high'
            });
        }
    }

    // Alerta de alta prioridade
    if (leadData.urgencia === 'alta' && leadData.status === LEAD_STATUS.NOVO) {
        alerts.push({
            type: 'priority',
            message: 'Lead de alta prioridade aguarda primeiro contacto',
            severity: 'high'
        });
    }

    return alerts;
};

// ===== HELPERS =====

/**
 * Formata número de telefone
 */
export const formatPhone = (phone) => {
    if (!phone) return '';

    // Remove espaços e caracteres especiais
    const cleaned = phone.replace(/\D/g, '');

    // Formato português
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return phone;
};

/**
 * Calcula dias desde data
 */
export const getDaysSince = (date) => {
    if (!date) return null;

    const dateObj = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Formata data relativa
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    const days = getDaysSince(date);

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    if (days < 30) return `${Math.floor(days / 7)} semanas atrás`;
    if (days < 365) return `${Math.floor(days / 30)} meses atrás`;

    return `${Math.floor(days / 365)} anos atrás`;
};