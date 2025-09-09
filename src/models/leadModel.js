/**
 * LEAD MODEL - MyImoMatePro
 * Schema para Leads que estende o modelo de Cliente
 * Caminho: src/models/leadModel.js
 * 
 * Estrutura: consultores/{consultorId}/leads/{leadId}
 * Filosofia: Lead = Cliente + campos específicos de prospect
 */

import { Timestamp } from 'firebase/firestore';
import { createClientSchema, validateClientData } from './clientModel';

// ===== CONSTANTES ESPECÍFICAS DE LEADS =====

export const LEAD_STATUS = {
    NOVA: 'nova',
    CONTACTADA: 'contactada',
    QUALIFICADA: 'qualificada',
    CONVERTIDA: 'convertida',
    PERDIDA: 'perdida'
};

export const LEAD_SOURCES = {
    WEBSITE: 'website',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    RECOMENDACAO: 'recomendacao',
    PORTAL_IMOBILIARIO: 'portal_imobiliario',
    PUBLICIDADE: 'publicidade',
    RADIO: 'radio',
    JORNAL: 'jornal',
    COLD_CALL: 'cold_call',
    OUTRO: 'outro'
};

export const LEAD_INTERESTS = {
    COMPRAR: 'comprar',
    VENDER: 'vender',
    ARRENDAR: 'arrendar',          // Senhorio que quer arrendar
    PROCURAR_ARRENDAMENTO: 'procurar_arrendamento', // Inquilino que procura
    INVESTIR: 'investir'
};

export const TASK_TYPES = {
    CALL: 'call',
    EMAIL: 'email',
    WHATSAPP: 'whatsapp',
    MEETING: 'meeting',
    FOLLOW_UP: 'follow_up'
};

export const TASK_STATUS = {
    PENDENTE: 'pendente',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
};

// ===== LABELS PARA UI =====
export const LEAD_STATUS_LABELS = {
    [LEAD_STATUS.NOVA]: 'Nova',
    [LEAD_STATUS.CONTACTADA]: 'Contactada',
    [LEAD_STATUS.QUALIFICADA]: 'Qualificada',
    [LEAD_STATUS.CONVERTIDA]: 'Convertida',
    [LEAD_STATUS.PERDIDA]: 'Perdida'
};

export const LEAD_SOURCE_LABELS = {
    [LEAD_SOURCES.WEBSITE]: 'Website',
    [LEAD_SOURCES.GOOGLE]: 'Google',
    [LEAD_SOURCES.FACEBOOK]: 'Facebook',
    [LEAD_SOURCES.INSTAGRAM]: 'Instagram',
    [LEAD_SOURCES.RECOMENDACAO]: 'Recomendação',
    [LEAD_SOURCES.PORTAL_IMOBILIARIO]: 'Portal Imobiliário',
    [LEAD_SOURCES.PUBLICIDADE]: 'Publicidade',
    [LEAD_SOURCES.RADIO]: 'Rádio',
    [LEAD_SOURCES.JORNAL]: 'Jornal',
    [LEAD_SOURCES.COLD_CALL]: 'Cold Call',
    [LEAD_SOURCES.OUTRO]: 'Outro'
};

export const LEAD_INTEREST_LABELS = {
    [LEAD_INTERESTS.COMPRAR]: 'Comprar Imóvel',
    [LEAD_INTERESTS.VENDER]: 'Vender Imóvel',
    [LEAD_INTERESTS.ARRENDAR]: 'Arrendar Imóvel (Senhorio)',
    [LEAD_INTERESTS.PROCURAR_ARRENDAMENTO]: 'Procurar Arrendamento (Inquilino)',
    [LEAD_INTERESTS.INVESTIR]: 'Investimento Imobiliário'
};

// ===== SCHEMA PRINCIPAL DA LEAD =====
export const createLeadSchema = (leadData) => {
    // Reutilizar o schema de cliente como base
    const baseClientData = createClientSchema(leadData);

    return {
        ...baseClientData,

        // ===== METADADOS ESPECÍFICOS DE LEAD =====
        leadStatus: 'prospect', // Badge para UI

        // ===== CAMPOS ESPECÍFICOS DE LEAD =====
        leadSource: leadData.leadSource || LEAD_SOURCES.WEBSITE,
        interesse: leadData.interesse || LEAD_INTERESTS.COMPRAR,
        descricao: leadData.descricao || '',

        // ===== DATAS E TRACKING =====
        criadoEm: Timestamp.now(),
        atualizadoEm: Timestamp.now(),
        proximoContacto: leadData.proximoContacto ?
            Timestamp.fromDate(new Date(leadData.proximoContacto)) : null,
        ultimoContacto: leadData.ultimoContacto ?
            Timestamp.fromDate(new Date(leadData.ultimoContacto)) : null,

        // ===== STATUS E QUALIFICAÇÃO =====
        status: leadData.status || LEAD_STATUS.NOVA,
        score: leadData.score || 0, // 0-100 score de qualificação
        temperatura: leadData.temperatura || 'quente', // quente, morna, fria

        // ===== TAREFAS DE FOLLOW-UP =====
        tarefas: leadData.tarefas || [],

        // ===== HISTÓRICO DE CONTACTOS =====
        contactos: leadData.contactos || [],

        // ===== ALERTAS AUTOMÁTICOS =====
        alertas: {
            diasSemContacto: 0,
            proximoAlerta: null,
            alertasEnviados: []
        },

        // ===== CONVERSÃO =====
        conversao: {
            convertida: false,
            dataConversao: null,
            clienteId: null,
            oportunidadeId: null,
            motivoConversao: ''
        },

        // ===== ESTATÍSTICAS =====
        stats: {
            totalContactos: 0,
            totalTarefas: 0,
            tarefasConcluidas: 0,
            diasEntrePrimeiroEUltimoContacto: 0,
            tempoMedioResposta: null
        }
    };
};

// ===== SCHEMA PARA TAREFA =====
export const createTaskSchema = (taskData) => {
    return {
        id: null, // Será definido pelo Firestore
        leadId: taskData.leadId,
        consultorId: taskData.consultorId,

        // Dados da tarefa
        tipo: taskData.tipo || TASK_TYPES.CALL,
        titulo: taskData.titulo || '',
        descricao: taskData.descricao || '',

        // Agendamento
        agendadaPara: taskData.agendadaPara ?
            Timestamp.fromDate(new Date(taskData.agendadaPara)) : null,

        // Status
        status: TASK_STATUS.PENDENTE,

        // Execução
        executadaEm: null,
        resultado: '',
        notas: '',

        // Metadados
        criadaEm: Timestamp.now(),
        atualizadaEm: Timestamp.now(),

        // Próxima ação sugerida
        proximaAcao: {
            sugerida: false,
            tipo: null,
            prazo: null
        }
    };
};

// ===== SCHEMA PARA CONTACTO =====
export const createContactoSchema = (contactoData) => {
    return {
        id: null,
        leadId: contactoData.leadId,
        consultorId: contactoData.consultorId,

        // Dados do contacto
        tipo: contactoData.tipo || TASK_TYPES.CALL,
        dataContacto: Timestamp.now(),
        duracao: contactoData.duracao || null, // Em minutos

        // Conteúdo
        resumo: contactoData.resumo || '',
        notas: contactoData.notas || '',
        resultado: contactoData.resultado || '', // positivo, neutro, negativo

        // Follow-up
        agendarProximo: contactoData.agendarProximo || false,
        proximoContactoData: contactoData.proximoContactoData || null,
        proximoContactoTipo: contactoData.proximoContactoTipo || null,

        // Qualificação
        interesseConfirmado: contactoData.interesseConfirmado || false,
        orçamentoDiscutido: contactoData.orçamentoDiscutido || false,
        tempoDecisao: contactoData.tempoDecisao || null,

        // Metadados
        criadoEm: Timestamp.now()
    };
};

// ===== VALIDAÇÕES ESPECÍFICAS DE LEAD =====
export const validateLeadData = (leadData) => {
    // Primeiro validar como cliente
    const clientValidation = validateClientData(leadData);
    const errors = { ...clientValidation.errors };

    // Validações específicas de lead
    if (!leadData.leadSource || !Object.values(LEAD_SOURCES).includes(leadData.leadSource)) {
        errors.leadSource = 'Fonte da lead é obrigatória e deve ser válida';
    }

    if (!leadData.interesse || !Object.values(LEAD_INTERESTS).includes(leadData.interesse)) {
        errors.interesse = 'Interesse é obrigatório e deve ser válido';
    }

    if (leadData.descricao && leadData.descricao.length > 1000) {
        errors.descricao = 'Descrição não pode ter mais de 1000 caracteres';
    }

    if (leadData.proximoContacto) {
        const dataContacto = new Date(leadData.proximoContacto);
        if (dataContacto < new Date()) {
            errors.proximoContacto = 'Data do próximo contacto deve ser futura';
        }
    }

    if (leadData.score && (leadData.score < 0 || leadData.score > 100)) {
        errors.score = 'Score deve estar entre 0 e 100';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== VALIDAÇÃO DE TAREFA =====
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
        if (dataAgendamento < new Date()) {
            errors.agendadaPara = 'Data de agendamento deve ser futura';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== HELPER FUNCTIONS =====

// Calcular temperatura da lead baseada na última atividade
export const calculateLeadTemperature = (ultimoContacto) => {
    if (!ultimoContacto) return 'fria';

    const agora = new Date();
    const ultimaAtividade = ultimoContacto.toDate ? ultimoContacto.toDate() : new Date(ultimoContacto);
    const diasSemContacto = Math.floor((agora - ultimaAtividade) / (1000 * 60 * 60 * 24));

    if (diasSemContacto <= 3) return 'quente';
    if (diasSemContacto <= 7) return 'morna';
    return 'fria';
};

// Calcular score automático baseado em vários fatores
export const calculateLeadScore = (leadData) => {
    let score = 0;

    // Score baseado na fonte (mais confiáveis = score maior)
    const sourceScores = {
        [LEAD_SOURCES.RECOMENDACAO]: 30,
        [LEAD_SOURCES.WEBSITE]: 25,
        [LEAD_SOURCES.GOOGLE]: 20,
        [LEAD_SOURCES.PORTAL_IMOBILIARIO]: 20,
        [LEAD_SOURCES.FACEBOOK]: 15,
        [LEAD_SOURCES.INSTAGRAM]: 15,
        [LEAD_SOURCES.PUBLICIDADE]: 10,
        [LEAD_SOURCES.COLD_CALL]: 5
    };
    score += sourceScores[leadData.leadSource] || 0;

    // Score baseado na completude dos dados
    if (leadData.phone) score += 10;
    if (leadData.email) score += 10;
    if (leadData.descricao && leadData.descricao.length > 50) score += 10;

    // Score baseado no nível de interesse
    const interestScores = {
        [LEAD_INTERESTS.COMPRAR]: 25,
        [LEAD_INTERESTS.VENDER]: 20,
        [LEAD_INTERESTS.INVESTIR]: 20,
        [LEAD_INTERESTS.ARRENDAR]: 15,
        [LEAD_INTERESTS.PROCURAR_ARRENDAMENTO]: 15
    };
    score += interestScores[leadData.interesse] || 0;

    // Score baseado na atividade recente
    if (leadData.ultimoContacto) {
        const temperatura = calculateLeadTemperature(leadData.ultimoContacto);
        if (temperatura === 'quente') score += 15;
        else if (temperatura === 'morna') score += 5;
    }

    return Math.min(score, 100); // Máximo 100
};

// Determinar próxima ação recomendada
export const getNextRecommendedAction = (leadData) => {
    const agora = new Date();

    // Se nunca foi contactada
    if (!leadData.ultimoContacto) {
        return {
            tipo: TASK_TYPES.CALL,
            prazo: new Date(agora.getTime() + 24 * 60 * 60 * 1000), // 24h
            prioridade: 'alta',
            motivo: 'Lead nova - contacto inicial urgente'
        };
    }

    // Baseado na temperatura
    const temperatura = calculateLeadTemperature(leadData.ultimoContacto);
    const ultimaAtividade = leadData.ultimoContacto.toDate ?
        leadData.ultimoContacto.toDate() : new Date(leadData.ultimoContacto);

    switch (temperatura) {
        case 'fria':
            return {
                tipo: TASK_TYPES.EMAIL,
                prazo: new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias
                prioridade: 'baixa',
                motivo: 'Lead fria - reativar com email'
            };
        case 'morna':
            return {
                tipo: TASK_TYPES.WHATSAPP,
                prazo: new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias
                prioridade: 'media',
                motivo: 'Lead morna - follow-up necessário'
            };
        case 'quente':
            return {
                tipo: TASK_TYPES.CALL,
                prazo: new Date(agora.getTime() + 24 * 60 * 60 * 1000), // 24h
                prioridade: 'alta',
                motivo: 'Lead quente - manter momentum'
            };
        default:
            return null;
    }
};

// Verificar se lead precisa de alerta
export const needsAlert = (leadData) => {
    if (!leadData.ultimoContacto) {
        // Lead nova há mais de 24h sem contacto
        const criadaHa = (new Date() - leadData.criadoEm.toDate()) / (1000 * 60 * 60);
        return criadaHa > 24;
    }

    const diasSemContacto = Math.floor(
        (new Date() - leadData.ultimoContacto.toDate()) / (1000 * 60 * 60 * 24)
    );

    // Alertas escalonados
    return diasSemContacto >= 3; // Alerta após 3 dias
};

export default {
    createLeadSchema,
    createTaskSchema,
    createContactoSchema,
    validateLeadData,
    validateTaskData,
    calculateLeadTemperature,
    calculateLeadScore,
    getNextRecommendedAction,
    needsAlert,
    LEAD_STATUS,
    LEAD_SOURCES,
    LEAD_INTERESTS,
    TASK_TYPES,
    TASK_STATUS,
    LEAD_STATUS_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS
};