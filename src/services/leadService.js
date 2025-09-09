/**
 * LEAD SERVICE - MyImoMatePro
 * CRUD completo para gestão de leads no Firestore
 * 
 * Caminho: src/services/leadService.js
 * Estrutura: consultores/{consultorId}/leads/{leadId}
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
        if (updateData.leadSource || updateData.interesse || updateData.phone || updateData.email) {
            updatePayload.score = calculateLeadScore({
                ...updateData,
                ultimoContacto: updateData.ultimoContacto
            });
        }

        // Recalcular temperatura
        if (updateData.ultimoContacto) {
            updatePayload.temperatura = calculateLeadTemperature(updateData.ultimoContacto);
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
        const batch = writeBatch(db);

        // Eliminar todas as tarefas da lead
        const tasksQuery = query(getTaskCollection(consultorId, leadId));
        const tasksSnapshot = await getDocs(tasksQuery);
        tasksSnapshot.forEach((taskDoc) => {
            batch.delete(taskDoc.ref);
        });

        // Eliminar todos os contactos da lead
        const contactsQuery = query(getContactCollection(consultorId, leadId));
        const contactsSnapshot = await getDocs(contactsQuery);
        contactsSnapshot.forEach((contactDoc) => {
            batch.delete(contactDoc.ref);
        });

        // Eliminar a lead
        batch.delete(getLeadDoc(consultorId, leadId));

        await batch.commit();
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
        const validation = validateTaskData({
            ...taskData,
            leadId,
            consultorId
        });

        if (!validation.isValid) {
            throw new Error(`Dados da tarefa inválidos: ${JSON.stringify(validation.errors)}`);
        }

        const taskSchema = createTaskSchema({
            ...taskData,
            leadId,
            consultorId
        });

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
 * Listar tarefas de uma lead
 */
export const getLeadTasks = async (consultorId, leadId, status = 'all') => {
    try {
        let tasksQuery = query(
            getTaskCollection(consultorId, leadId),
            orderBy('agendadaPara', 'asc')
        );

        if (status !== 'all') {
            tasksQuery = query(tasksQuery, where('status', '==', status));
        }

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
 * Marcar tarefa como concluída
 */
export const completeTask = async (consultorId, leadId, taskId, resultado) => {
    try {
        const taskRef = doc(getTaskCollection(consultorId, leadId), taskId);

        await updateDoc(taskRef, {
            status: TASK_STATUS.CONCLUIDA,
            executadaEm: Timestamp.now(),
            resultado: resultado || '',
            atualizadaEm: Timestamp.now()
        });

        return true;
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        throw error;
    }
};

// ===== CONTACT OPERATIONS =====

/**
 * Registar contacto com lead
 */
export const addContact = async (consultorId, leadId, contactData) => {
    try {
        const contactSchema = createContactoSchema({
            ...contactData,
            leadId,
            consultorId
        });

        // Criar contacto
        const contactRef = await addDoc(getContactCollection(consultorId, leadId), contactSchema);

        // Atualizar lead com último contacto
        const leadRef = getLeadDoc(consultorId, leadId);
        const updateData = {
            ultimoContacto: Timestamp.now(),
            atualizadoEm: Timestamp.now()
        };

        // Incrementar contador de contactos
        const leadDoc = await getDoc(leadRef);
        if (leadDoc.exists()) {
            const leadData = leadDoc.data();
            updateData['stats.totalContactos'] = (leadData.stats?.totalContactos || 0) + 1;

            // Recalcular temperatura
            updateData.temperatura = calculateLeadTemperature(Timestamp.now());
        }

        await updateDoc(leadRef, updateData);

        // Criar próxima tarefa se sugerida
        if (contactData.agendarProximo && contactData.proximoContactoData) {
            await createTask(consultorId, leadId, {
                tipo: contactData.proximoContactoTipo || 'call',
                titulo: 'Follow-up agendado',
                descricao: 'Contacto de seguimento agendado automaticamente',
                agendadaPara: contactData.proximoContactoData
            });
        }

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
 * Obter histórico de contactos de uma lead
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
export const convertLeadToClient = async (consultorId, leadId, conversionNotes = '') => {
    try {
        // Obter dados da lead
        const leadDoc = await getDoc(getLeadDoc(consultorId, leadId));
        if (!leadDoc.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadDoc.data();

        // Preparar dados do cliente (remover campos específicos de lead)
        const {
            leadStatus,
            leadSource,
            interesse,
            descricao,
            status,
            score,
            temperatura,
            tarefas,
            contactos,
            alertas,
            conversao,
            stats,
            ...clientData
        } = leadData;

        // Usar o createClient do clientService
        const { createClient } = await import('./clientService');
        const newClient = await createClient(consultorId, clientData);

        // Marcar lead como convertida
        await updateDoc(getLeadDoc(consultorId, leadId), {
            status: LEAD_STATUS.CONVERTIDA,
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
            where('status', 'in', [LEAD_STATUS.NOVA, LEAD_STATUS.CONTACTADA, LEAD_STATUS.QUALIFICADA]),
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

        const stats = {
            total: 0,
            novas: 0,
            contactadas: 0,
            qualificadas: 0,
            convertidas: 0,
            perdidas: 0,
            quentes: 0,
            mornas: 0,
            frias: 0,
            scoresMedios: {
                geral: 0,
                convertidas: 0
            },
            fontes: {},
            interesses: {},
            conversaoRate: 0
        };

        const leads = [];

        snapshot.forEach((doc) => {
            const leadData = {
                id: doc.id,
                ...doc.data()
            };
            leads.push(leadData);
        });

        stats.total = leads.length;

        if (stats.total === 0) {
            return stats;
        }

        // Contar por status
        leads.forEach(lead => {
            switch (lead.status) {
                case LEAD_STATUS.NOVA:
                    stats.novas++;
                    break;
                case LEAD_STATUS.CONTACTADA:
                    stats.contactadas++;
                    break;
                case LEAD_STATUS.QUALIFICADA:
                    stats.qualificadas++;
                    break;
                case LEAD_STATUS.CONVERTIDA:
                    stats.convertidas++;
                    break;
                case LEAD_STATUS.PERDIDA:
                    stats.perdidas++;
                    break;
            }

            // Contar por temperatura
            const temperatura = calculateLeadTemperature(lead.ultimoContacto);
            switch (temperatura) {
                case 'quente':
                    stats.quentes++;
                    break;
                case 'morna':
                    stats.mornas++;
                    break;
                case 'fria':
                    stats.frias++;
                    break;
            }

            // Contar por fonte
            stats.fontes[lead.leadSource] = (stats.fontes[lead.leadSource] || 0) + 1;

            // Contar por interesse
            stats.interesses[lead.interesse] = (stats.interesses[lead.interesse] || 0) + 1;
        });

        // Calcular scores médios
        const scoresGerais = leads.map(lead => lead.score || 0);
        stats.scoresMedios.geral = scoresGerais.length > 0 ?
            scoresGerais.reduce((a, b) => a + b, 0) / scoresGerais.length : 0;

        const leadsConvertidas = leads.filter(lead => lead.status === LEAD_STATUS.CONVERTIDA);
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
 */
export const getLeadsNeedingAlert = async (consultorId) => {
    try {
        const leadsQuery = query(
            getLeadCollection(consultorId),
            where('status', 'in', [LEAD_STATUS.NOVA, LEAD_STATUS.CONTACTADA, LEAD_STATUS.QUALIFICADA]),
            orderBy('ultimoContacto', 'asc')
        );

        const snapshot = await getDocs(leadsQuery);
        const leadsWithAlerts = [];

        snapshot.forEach((doc) => {
            const leadData = {
                id: doc.id,
                ...doc.data()
            };

            if (needsAlert(leadData)) {
                leadData.temperatura = calculateLeadTemperature(leadData.ultimoContacto);
                leadData.nextAction = getNextRecommendedAction(leadData);
                leadsWithAlerts.push(leadData);
            }
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