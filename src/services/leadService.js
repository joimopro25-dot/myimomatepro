/**
 * LEAD SERVICE - MyImoMatePro
 * CRUD completo para gestão de leads no Firestore
 * 
 * Caminho: src/services/leadService.js
 * Estrutura: consultores/{consultorId}/leads/{leadId}
 * 
 * ✅ CORREÇÃO: Removido orderBy com campos undefined que causavam erro Firebase
 * ✅ CORREÇÃO: Status corrigidos para usar LEAD_STATUS.NOVO em vez de LEAD_STATUS.NOVA
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    writeBatch,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
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
    TASK_STATUS
} from '../models/leadModel';

// ===== CONFIGURAÇÕES =====
const COLLECTION_NAME = 'leads';
const TASKS_COLLECTION = 'tasks';
const CONTACTS_COLLECTION = 'contacts';
const CONSULTOR_COLLECTION = 'consultores';
const CLIENTS_COLLECTION = 'clientes';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====
const getLeadCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getLeadDoc = (consultorId, leadId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId);
};

const getTaskCollection = (consultorId, leadId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId, TASKS_COLLECTION);
};

const getContactCollection = (consultorId, leadId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId, CONTACTS_COLLECTION);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova lead
 */
export const createLead = async (consultorId, leadData) => {
    try {
        // Validar dados
        const validation = validateLeadData(leadData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema da lead
        const leadSchema = createLeadSchema(leadData);
        leadSchema.consultorId = consultorId;

        // Calcular score automático
        leadSchema.score = calculateLeadScore(leadSchema);
        leadSchema.temperatura = calculateLeadTemperature(leadSchema.ultimoContacto);

        // Salvar no Firestore
        const leadRef = await addDoc(getLeadCollection(consultorId), leadSchema);

        // Criar primeira tarefa automática se não tiver último contacto
        if (!leadSchema.ultimoContacto) {
            const nextAction = getNextRecommendedAction(leadSchema);
            if (nextAction) {
                await createTask(consultorId, leadRef.id, {
                    tipo: nextAction.tipo,
                    titulo: 'Contacto inicial',
                    descricao: nextAction.motivo,
                    agendadaPara: nextAction.prazo
                });
            }
        }

        return {
            id: leadRef.id,
            ...leadSchema
        };
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        throw error;
    }
};

/**
 * Obter lead por ID
 */
export const getLead = async (consultorId, leadId) => {
    try {
        const leadDoc = await getDoc(getLeadDoc(consultorId, leadId));

        if (!leadDoc.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = {
            id: leadDoc.id,
            ...leadDoc.data()
        };

        // Carregar tarefas pendentes
        const tasksQuery = query(
            getTaskCollection(consultorId, leadId),
            where('status', '==', TASK_STATUS.PENDENTE),
            orderBy('agendadaPara', 'asc')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        leadData.tarefasPendentes = tasksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calcular temperatura atual
        leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);
        leadData.precisaAlerta = needsAlert(leadData);

        return leadData;
    } catch (error) {
        console.error('Erro ao obter lead:', error);
        throw error;
    }
};

/**
 * Listar leads com filtros e paginação
 */
export const listLeads = async (consultorId, options = {}) => {
    try {
        const {
            status = 'all',
            fonte = 'all',
            interesse = 'all',
            temperatura = 'all',
            pageSize = DEFAULT_PAGE_SIZE,
            lastDoc = null,
            orderField = 'criadoEm',
            orderDirection = 'desc'
        } = options;

        let leadQuery = query(getLeadCollection(consultorId));

        // Aplicar filtros
        if (status !== 'all') {
            leadQuery = query(leadQuery, where('status', '==', status));
        }

        if (fonte !== 'all') {
            leadQuery = query(leadQuery, where('leadSource', '==', fonte));
        }

        if (interesse !== 'all') {
            leadQuery = query(leadQuery, where('interesse', '==', interesse));
        }

        // Ordenação
        leadQuery = query(leadQuery, orderBy(orderField, orderDirection));

        // Paginação
        if (lastDoc) {
            leadQuery = query(leadQuery, startAfter(lastDoc));
        }

        leadQuery = query(leadQuery, limit(pageSize));

        const snapshot = await getDocs(leadQuery);
        const leads = [];

        snapshot.forEach((doc) => {
            const leadData = {
                id: doc.id,
                ...doc.data()
            };

            // Calcular temperatura atual
            leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);
            leadData.precisaAlerta = needsAlert(leadData);

            leads.push(leadData);
        });

        // Aplicar filtro de temperatura (manual, pois é calculado)
        let filteredLeads = leads;
        if (temperatura !== 'all') {
            filteredLeads = leads.filter(lead => lead.temperatura === temperatura);
        }

        return {
            leads: filteredLeads,
            hasMore: snapshot.docs.length === pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao listar leads:', error);
        throw error;
    }
};

/**
 * Atualizar lead
 */
export const updateLead = async (consultorId, leadId, updateData) => {
    try {
        // Validar dados de atualização
        const validation = validateLeadData(updateData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        const leadRef = getLeadDoc(consultorId, leadId);

        // Preparar dados de atualização
        const updatePayload = {
            ...updateData,
            atualizadoEm: Timestamp.now()
        };

        // Recalcular score se dados relevantes mudaram
        if (updateData.leadSource || updateData.interesse || updateData.ultimoContacto) {
            const currentLead = await getDoc(leadRef);
            if (currentLead.exists()) {
                const currentData = currentLead.data();
                const updatedData = { ...currentData, ...updateData };
                updatePayload.score = calculateLeadScore(updatedData);
                updatePayload.temperatura = calculateLeadTemperature(updatedData.ultimoContacto);
            }
        }

        await updateDoc(leadRef, updatePayload);

        return {
            id: leadId,
            ...updatePayload
        };
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
    }
};

/**
 * Eliminar lead
 */
export const deleteLead = async (consultorId, leadId) => {
    try {
        await deleteDoc(getLeadDoc(consultorId, leadId));
        return true;
    } catch (error) {
        console.error('Erro ao eliminar lead:', error);
        throw error;
    }
};

// ===== TASK OPERATIONS =====

/**
 * Criar tarefa para lead
 */
export const createTask = async (consultorId, leadId, taskData) => {
    try {
        // ✅ CORREÇÃO: Atribuir leadId aos dados ANTES da validação
        const taskDataWithLeadId = {
            ...taskData,
            leadId: leadId,
            consultorId: consultorId
        };

        // Validar dados (agora com leadId incluído)
        const validation = validateTaskData(taskDataWithLeadId);
        if (!validation.isValid) {
            throw new Error(`Dados da tarefa inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema da tarefa
        const taskSchema = createTaskSchema(taskDataWithLeadId);

        // Salvar no Firestore
        const taskRef = await addDoc(getTaskCollection(consultorId, leadId), taskSchema);

        return {
            id: taskRef.id,
            ...taskSchema
        };
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
    }
};

/**
 * Obter tarefas da lead
 */
export const getLeadTasks = async (consultorId, leadId, status = 'all') => {
    try {
        let tasksQuery = query(getTaskCollection(consultorId, leadId));

        if (status !== 'all') {
            tasksQuery = query(tasksQuery, where('status', '==', status));
        }

        tasksQuery = query(tasksQuery, orderBy('agendadaPara', 'asc'));

        const snapshot = await getDocs(tasksQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao obter tarefas da lead:', error);
        throw error;
    }
};

/**
 * Completar tarefa
 */
export const completeTask = async (consultorId, leadId, taskId, notes = '') => {
    try {
        const taskRef = doc(getTaskCollection(consultorId, leadId), taskId);

        await updateDoc(taskRef, {
            status: TASK_STATUS.CONCLUIDA,
            completedAt: Timestamp.now(),
            notes: notes
        });

        return true;
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        throw error;
    }
};

// ===== CONTACT OPERATIONS =====

/**
 * Adicionar contacto à lead
 */
export const addContact = async (consultorId, leadId, contactData) => {
    try {
        const contactSchema = createContactoSchema(contactData);
        contactSchema.leadId = leadId;

        // Adicionar contacto
        const contactRef = await addDoc(getContactCollection(consultorId, leadId), contactSchema);

        // Atualizar último contacto na lead
        await updateDoc(getLeadDoc(consultorId, leadId), {
            ultimoContacto: contactSchema.dataContacto,
            atualizadoEm: Timestamp.now()
        });

        return {
            id: contactRef.id,
            ...contactSchema
        };
    } catch (error) {
        console.error('Erro ao adicionar contacto:', error);
        throw error;
    }
};

/**
 * Obter contactos da lead
 */
export const getLeadContacts = async (consultorId, leadId) => {
    try {
        const contactsQuery = query(
            getContactCollection(consultorId, leadId),
            orderBy('dataContacto', 'desc')
        );

        const snapshot = await getDocs(contactsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Erro ao obter contactos da lead:', error);
        throw error;
    }
};

// ===== CONVERSION OPERATIONS =====

/**
 * Converter lead para cliente
 */
export const convertLeadToClient = async (consultorId, leadId, clientData, conversionNotes = '') => {
    try {
        // Importar createClient dinamicamente para evitar dependência circular
        const { createClient } = await import('./clientService');

        // Criar novo cliente
        const newClient = await createClient(consultorId, clientData);

        // Atualizar lead como convertida
        await updateDoc(getLeadDoc(consultorId, leadId), {
            status: LEAD_STATUS.CONVERTIDO,
            'conversao.convertida': true,
            'conversao.dataConversao': Timestamp.now(),
            'conversao.clienteId': newClient.id,
            'conversao.motivoConversao': conversionNotes,
            atualizadoEm: Timestamp.now()
        });

        return {
            clientId: newClient.id,
            leadId: leadId,
            convertedAt: new Date()
        };
    } catch (error) {
        console.error('Erro ao converter lead para cliente:', error);
        throw error;
    }
};

// ===== SEARCH OPERATIONS =====

/**
 * Pesquisar leads por texto
 */
export const searchLeads = async (consultorId, searchTerm, options = {}) => {
    try {
        const { limit: searchLimit = 50 } = options;

        // Obter todas as leads ativas (Firestore não suporta busca full-text nativa)
        const leadsQuery = query(
            getLeadCollection(consultorId),
            where('status', 'in', [LEAD_STATUS.NOVO, LEAD_STATUS.CONTACTADO, LEAD_STATUS.QUALIFICADO]),
            orderBy('criadoEm', 'desc'),
            limit(searchLimit)
        );

        const snapshot = await getDocs(leadsQuery);
        const leads = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filtrar por termo de pesquisa (busca simples)
        const searchTermLower = searchTerm.toLowerCase().trim();
        const filteredLeads = leads.filter(lead => {
            return (
                lead.name?.toLowerCase().includes(searchTermLower) ||
                lead.email?.toLowerCase().includes(searchTermLower) ||
                lead.phone?.includes(searchTerm) ||
                lead.descricao?.toLowerCase().includes(searchTermLower)
            );
        });

        // Calcular temperatura atual para cada lead
        return filteredLeads.map(lead => ({
            ...lead,
            temperatura: calculateLeadTemperature(lead.ultimoContacto),
            precisaAlerta: needsAlert(lead)
        }));
    } catch (error) {
        console.error('Erro ao pesquisar leads:', error);
        throw error;
    }
};

// ===== ANALYTICS OPERATIONS =====

/**
 * Obter estatísticas das leads
 */
export const getLeadStats = async (consultorId) => {
    try {
        const leadsQuery = query(getLeadCollection(consultorId));
        const snapshot = await getDocs(leadsQuery);

        const leads = snapshot.docs.map(doc => doc.data());

        const stats = {
            total: leads.length,
            novas: leads.filter(lead => lead.status === LEAD_STATUS.NOVO).length,
            contactadas: leads.filter(lead => lead.status === LEAD_STATUS.CONTACTADO).length,
            qualificadas: leads.filter(lead => lead.status === LEAD_STATUS.QUALIFICADO).length,
            convertidas: leads.filter(lead => lead.status === LEAD_STATUS.CONVERTIDO).length,
            perdidas: leads.filter(lead => lead.status === LEAD_STATUS.PERDIDO).length,
            scoresMedios: {
                geral: 0,
                convertidas: 0
            },
            conversaoRate: 0
        };

        // Calcular scores médios
        const scoresGerais = leads.map(lead => lead.score || 0);
        stats.scoresMedios.geral = scoresGerais.length > 0 ?
            scoresGerais.reduce((a, b) => a + b, 0) / scoresGerais.length : 0;

        const leadsConvertidas = leads.filter(lead => lead.status === LEAD_STATUS.CONVERTIDO);
        if (leadsConvertidas.length > 0) {
            const scoresConvertidas = leadsConvertidas.map(lead => lead.score || 0);
            stats.scoresMedios.convertidas = scoresConvertidas.reduce((a, b) => a + b, 0) / scoresConvertidas.length;
        }

        // Taxa de conversão
        stats.conversaoRate = stats.total > 0 ? (stats.convertidas / stats.total) * 100 : 0;

        return stats;
    } catch (error) {
        console.error('Erro ao obter estatísticas das leads:', error);
        throw error;
    }
};

/**
 * Obter leads que precisam de alerta
 * ✅ CORREÇÃO: Removido orderBy problemático que causava erro com campos undefined
 */
export const getLeadsNeedingAlert = async (consultorId) => {
    try {
        // ✅ Remover orderBy('ultimoContacto') que causava erro quando campo é undefined
        const leadsQuery = query(
            getLeadCollection(consultorId),
            where('status', 'in', [LEAD_STATUS.NOVO, LEAD_STATUS.CONTACTADO, LEAD_STATUS.QUALIFICADO])
        );

        const snapshot = await getDocs(leadsQuery);
        const leadsWithAlerts = [];

        snapshot.forEach((doc) => {
            const leadData = {
                id: doc.id,
                ...doc.data()
            };

            // Verificar se precisa de alerta usando função do model
            if (needsAlert(leadData)) {
                leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);
                leadData.nextAction = getNextRecommendedAction(leadData);
                leadsWithAlerts.push(leadData);
            }
        });

        // Ordenar manualmente por urgência (leads com ultimoContacto mais antigo primeiro)
        leadsWithAlerts.sort((a, b) => {
            const dateA = a.ultimoContacto?.toDate?.() || new Date(0);
            const dateB = b.ultimoContacto?.toDate?.() || new Date(0);
            return dateA - dateB;
        });

        return leadsWithAlerts;
    } catch (error) {
        console.error('Erro ao obter leads com alerta:', error);
        throw error;
    }
};

// ===== EXPORTS =====
export default {
    // CRUD básico
    createLead,
    getLead,
    listLeads,
    updateLead,
    deleteLead,

    // Tarefas
    createTask,
    getLeadTasks,
    completeTask,

    // Contactos
    addContact,
    getLeadContacts,

    // Conversão
    convertLeadToClient,

    // Pesquisa e analytics
    searchLeads,
    getLeadStats,
    getLeadsNeedingAlert
};