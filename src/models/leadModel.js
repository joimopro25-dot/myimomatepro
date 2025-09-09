/**
 * LEAD MODEL MELHORADO - MyImoMatePro
 * Modelo de dados, validações e constantes para leads
 * 
 * Caminho: src/models/leadModel.js
 */

import { Timestamp } from 'firebase/firestore';
import { validateClientData } from './clientModel';

// ===== CONSTANTES =====
export const LEAD_SOURCES = {
    WEBSITE: 'website',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    RECOMENDACAO: 'recomendacao',
    PORTAL: 'portal',
    PUBLICIDADE: 'publicidade',
    RADIO: 'radio',
    JORNAL: 'jornal',
    COLD_CALL: 'cold_call',
    NETWORKING: 'networking',
    OUTRO: 'outro'
};

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.GOOGLE]: 'Google',
    [LEAD_SOURCES.FACEBOOK]: 'Facebook',
    [LEAD_SOURCES.INSTAGRAM]: 'Instagram',
    [LEAD_SOURCES.RECOMENDACAO]: 'Recomendação',
    [LEAD_SOURCES.PORTAL]: 'Portal Imobiliário',
    [LEAD_SOURCES.PUBLICIDADE]: 'Publicidade Exterior',
    [LEAD_SOURCES.RADIO]: 'Rádio',
    [LEAD_SOURCES.JORNAL]: 'Jornal',
    [LEAD_SOURCES.COLD_CALL]: 'Cold Call',
    [LEAD_SOURCES.NETWORKING]: 'Networking',
    [LEAD_SOURCES.OUTRO]: 'Outro'
};

export const LEAD_INTERESTS = {
    COMPRAR: 'comprar',
    VENDER: 'vender',
    ARRENDAR: 'arrendar',
    INVESTIR: 'investir',
    AVALIAR: 'avaliar'
};

export const LEAD_INTEREST_LABELS = {
    [LEAD_INTERESTS.COMPRAR]: 'Comprar Imóvel',
    [LEAD_INTERESTS.VENDER]: 'Vender Imóvel',
    [LEAD_INTERESTS.ARRENDAR]: 'Arrendar Imóvel',
    [LEAD_INTERESTS.INVESTIR]: 'Investimento Imobiliário',
    [LEAD_INTERESTS.AVALIAR]: 'Avaliar Imóvel'
};

export const LEAD_STATUS = {
    NOVO: 'novo',
    CONTACTADO: 'contactado',
    QUALIFICADO: 'qualificado',
    EM_PROCESSO: 'em_processo',
    CONVERTIDO: 'convertido',
    PERDIDO: 'perdido',
    DESQUALIFICADO: 'desqualificado'
};

export const LEAD_TEMPERATURES = {
    QUENTE: 'quente',
    MORNO: 'morno',
    FRIO: 'frio'
};

// ===== NOVOS: TIPOS DE TASKS/INTERAÇÕES =====
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

// ===== SCHEMA PRINCIPAL DA LEAD MELHORADO =====
export const createLeadSchema = (leadData) => {
    return {
        id: null,
        consultorId: null,

        // ===== DADOS PESSOAIS BÁSICOS =====
        name: leadData.name?.trim() || '',
        phone: leadData.phone?.trim() || '',
        email: leadData.email?.trim() || '', // AGORA OPCIONAL

        // ===== CLASSIFICAÇÃO DA LEAD =====
        leadSource: leadData.leadSource || LEAD_SOURCES.WEBSITE,
        interesse: leadData.interesse || LEAD_INTERESTS.COMPRAR,

        // ===== NOVOS CAMPOS DE QUALIFICAÇÃO =====
        urgencia: leadData.urgencia || 'media',
        orcamentoEstimado: leadData.orcamentoEstimado ? parseFloat(leadData.orcamentoEstimado) : null,
        zonaInteresse: leadData.zonaInteresse?.trim() || '',
        tipologiaInteresse: leadData.tipologiaInteresse || '',
        melhorHorario: leadData.melhorHorario || '',
        contactPreference: leadData.contactPreference || 'phone',
        statusQualificacao: leadData.statusQualificacao || 'por_qualificar',

        // ===== DESCRIÇÃO DETALHADA (AGORA OBRIGATÓRIA) =====
        descricao: leadData.descricao?.trim() || '',
        consultorObservations: leadData.consultorObservations?.trim() || '',

        // ===== TIMESTAMPS COM HORA =====
        criadaEm: Timestamp.now(),
        atualizadaEm: Timestamp.now(),
        proximoContacto: leadData.proximoContacto ?
            Timestamp.fromDate(new Date(leadData.proximoContacto)) : null,

        // ===== STATUS E QUALIFICAÇÃO =====
        status: LEAD_STATUS.NOVO,
        temperatura: LEAD_TEMPERATURES.MORNO,
        score: 50, // Score inicial padrão

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

        // ===== TAGS E CATEGORIZAÇÃO =====
        tags: leadData.tags || [],
        categoria: 'lead', // Sempre 'lead'

        // ===== ESTATÍSTICAS CALCULADAS =====
        stats: {
            diasSemContacto: 0,
            tempoMedioResposta: 0,
            taxaResposta: 0,
            ultimaAcao: null
        }
    };
};

// ===== SCHEMA PARA TASK/INTERAÇÃO =====
export const createTaskSchema = (taskData) => {
    return {
        id: null,
        leadId: taskData.leadId,
        consultorId: taskData.consultorId,

        // Dados da task
        tipo: taskData.tipo || TASK_TYPES.CALL,
        titulo: taskData.titulo?.trim() || '',
        descricao: taskData.descricao?.trim() || '',

        // ===== AGENDAMENTO COM HORA =====
        agendadaPara: taskData.agendadaPara ?
            Timestamp.fromDate(new Date(taskData.agendadaPara)) : null,
        duracaoEstimada: taskData.duracaoEstimada || null, // Em minutos

        // Status e execução
        status: TASK_STATUS.PENDENTE,
        executadaEm: null,
        duracaoReal: null, // Em minutos
        resultado: '',
        notas: '',

        // ===== TIMESTAMPS =====
        criadaEm: Timestamp.now(),
        atualizadaEm: Timestamp.now(),

        // Próxima ação sugerida
        proximaAcao: {
            sugerida: false,
            tipo: null,
            prazo: null,
            descricao: ''
        }
    };
};

// ===== VALIDAÇÕES MELHORADAS =====
export const validateLeadData = (leadData) => {
    // Validar dados básicos de cliente (Nome + Telefone obrigatórios)
    const clientValidation = validateClientData(leadData);
    const errors = { ...clientValidation.errors };

    // Validações específicas de lead
    if (!leadData.leadSource || !Object.values(LEAD_SOURCES).includes(leadData.leadSource)) {
        errors.leadSource = 'Fonte da lead é obrigatória e deve ser válida';
    }

    if (!leadData.interesse || !Object.values(LEAD_INTERESTS).includes(leadData.interesse)) {
        errors.interesse = 'Interesse é obrigatório e deve ser válido';
    }

    // ===== DESCRIÇÃO AGORA OBRIGATÓRIA =====
    if (!leadData.descricao || leadData.descricao.trim().length < 10) {
        errors.descricao = 'Descrição é obrigatória (mínimo 10 caracteres)';
    }

    if (leadData.descricao && leadData.descricao.length > 1000) {
        errors.descricao = 'Descrição não pode ter mais de 1000 caracteres';
    }

    // Validar orçamento se preenchido
    if (leadData.orcamentoEstimado && (leadData.orcamentoEstimado < 0 || leadData.orcamentoEstimado > 10000000)) {
        errors.orcamentoEstimado = 'Orçamento deve estar entre 0 e 10.000.000€';
    }

    // Validar data de próximo contacto
    if (leadData.proximoContacto) {
        const dataContacto = new Date(leadData.proximoContacto);
        const agora = new Date();
        if (dataContacto < agora) {
            errors.proximoContacto = 'Data do próximo contacto deve ser futura';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== VALIDAÇÃO DE TASK =====
export const validateTaskData = (taskData) => {
    const errors = {};

    if (!taskData.leadId) {
        errors.leadId = 'ID da lead é obrigatório';
    }

    if (!taskData.tipo || !Object.values(TASK_TYPES).includes(taskData.tipo)) {
        errors.tipo = 'Tipo de tarefa é obrigatório e deve ser válido';
    }

    if (!taskData.titulo || taskData.titulo.trim().length < 3) {
        errors.titulo = 'Título é obrigatório (mínimo 3 caracteres)';
    }

    if (taskData.agendadaPara) {
        const dataAgendamento = new Date(taskData.agendadaPara);
        const agora = new Date();
        if (dataAgendamento < agora) {
            errors.agendadaPara = 'Data de agendamento deve ser futura';
        }
    }

    if (taskData.duracaoEstimada && (taskData.duracaoEstimada < 1 || taskData.duracaoEstimada > 480)) {
        errors.duracaoEstimada = 'Duração deve estar entre 1 e 480 minutos';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== FUNÇÕES DE CÁLCULO =====
export const calculateLeadTemperature = (ultimoContacto) => {
    if (!ultimoContacto) return LEAD_TEMPERATURES.FRIO;

    const agora = new Date();
    const ultimaAtividade = ultimoContacto.toDate ? ultimoContacto.toDate() : new Date(ultimoContacto);
    const diasSemContacto = Math.floor((agora - ultimaAtividade) / (1000 * 60 * 60 * 24));

    if (diasSemContacto <= 2) return LEAD_TEMPERATURES.QUENTE;
    if (diasSemContacto <= 7) return LEAD_TEMPERATURES.MORNO;
    return LEAD_TEMPERATURES.FRIO;
};

export const calculateLeadScore = (leadData) => {
    let score = 0;

    // Score base por interesse
    const interesseScores = {
        [LEAD_INTERESTS.COMPRAR]: 30,
        [LEAD_INTERESTS.VENDER]: 35,
        [LEAD_INTERESTS.INVESTIR]: 40,
        [LEAD_INTERESTS.ARRENDAR]: 25,
        [LEAD_INTERESTS.AVALIAR]: 15
    };
    score += interesseScores[leadData.interesse] || 20;

    // Score por urgência
    const urgenciaScores = {
        'imediata': 25,
        'alta': 20,
        'media': 15,
        'baixa': 10
    };
    score += urgenciaScores[leadData.urgencia] || 15;

    // Score por orçamento
    if (leadData.orcamentoEstimado) {
        if (leadData.orcamentoEstimado >= 500000) score += 20;
        else if (leadData.orcamentoEstimado >= 300000) score += 15;
        else if (leadData.orcamentoEstimado >= 150000) score += 10;
        else score += 5;
    }

    // Score por qualidade da descrição
    if (leadData.descricao) {
        if (leadData.descricao.length >= 200) score += 10;
        else if (leadData.descricao.length >= 100) score += 7;
        else if (leadData.descricao.length >= 50) score += 5;
    }

    // Score por dados de contacto
    if (leadData.email && leadData.phone) score += 10;
    else if (leadData.phone) score += 5;

    return Math.min(score, 100); // Máximo de 100
};

export const getNextRecommendedAction = (leadData) => {
    const agora = new Date();
    const criadaEm = leadData.criadaEm?.toDate() || agora;
    const horasDesdeEm = (agora - criadaEm) / (1000 * 60 * 60);

    // Recommendations based on lead age and status
    if (horasDesdeEm < 1) {
        return {
            tipo: TASK_TYPES.CALL,
            prazo: 'imediato',
            descricao: 'Contacto inicial imediato - lead recente'
        };
    }

    if (horasDesdeEm < 24 && leadData.status === LEAD_STATUS.NOVO) {
        return {
            tipo: TASK_TYPES.CALL,
            prazo: '2_horas',
            descricao: 'Follow-up de primeiro contacto'
        };
    }

    if (leadData.temperatura === LEAD_TEMPERATURES.FRIO) {
        return {
            tipo: TASK_TYPES.EMAIL,
            prazo: '1_semana',
            descricao: 'Reativar lead fria com conteúdo de valor'
        };
    }

    return null;
};