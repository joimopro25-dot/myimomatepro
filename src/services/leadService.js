/**
 * LEAD SERVICE - MyImoMatePro
 * CRUD completo para gestão de leads no Firestore
 * Atualizado com suporte para data e hora em follow-ups
 * 
 * Caminho: src/services/leadService.js
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
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { createLeadSchema, validateLeadData } from '../models/leadModel';

// ===== CONFIGURAÇÕES =====
const COLLECTION_NAME = 'leads';
const CONSULTOR_COLLECTION = 'consultores';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====
const getLeadCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getLeadDoc = (consultorId, leadId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, leadId);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova lead
 */
export const createLead = async (consultorId, leadData) => {
    try {
        // Validar dados antes de criar
        const validation = validateLeadData(leadData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema com consultorId
        const leadSchema = createLeadSchema(leadData);
        leadSchema.consultorId = consultorId;
        leadSchema.createdAt = Timestamp.now();
        leadSchema.updatedAt = Timestamp.now();

        // Remover qualquer campo "id" que venha no payload para não sobrescrever o id autogerado
        if ('id' in leadSchema) {
            delete leadSchema.id;
        }

        // DEBUG: mostrar exatamente o objeto que será gravado
        console.log('Lead schema a ser salvo:', leadSchema);

        // Adicionar ao Firestore
        const leadRef = await addDoc(getLeadCollection(consultorId), leadSchema);

        // Atualizar o documento no Firestore com o campo id = leadRef.id
        await updateDoc(leadRef, { id: leadRef.id });

        // Buscar o documento salvo e retornar os dados reais persistidos
        const savedSnap = await getDoc(leadRef);
        const savedLead = savedSnap.exists() ? { ...savedSnap.data(), id: savedSnap.id } : { ...leadSchema, id: leadRef.id };

        console.log('Lead salva no Firestore:', savedLead);
        return savedLead;

    } catch (error) {
        console.error('LeadService: Erro ao criar lead:', error);
        throw new Error(`Erro ao criar lead: ${error.message}`);
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar lead por ID
 */
export const getLead = async (consultorId, leadId) => {
    try {
        const leadDoc = await getDoc(getLeadDoc(consultorId, leadId));

        if (!leadDoc.exists()) {
            throw new Error('Lead não encontrada');
        }

        return {
            ...leadDoc.data(),
            id: leadDoc.id
        };

    } catch (error) {
        console.error('LeadService: Erro ao buscar lead:', error);
        throw new Error(`Erro ao buscar lead: ${error.message}`);
    }
};

/**
 * Listar leads com filtros e paginação
 */
export const listLeads = async (consultorId, options = {}) => {
    try {
        const {
            pageSize = DEFAULT_PAGE_SIZE,
            filters = {},
            orderByField = 'createdAt',
            orderDirection = 'desc',
            lastDoc = null
        } = options;

        let q = query(
            getLeadCollection(consultorId),
            orderBy(orderByField, orderDirection),
            limit(pageSize)
        );

        // Aplicar filtros
        if (filters.status && filters.status !== 'all') {
            q = query(q, where('status', '==', filters.status));
        }

        if (filters.qualificationType && filters.qualificationType !== 'all') {
            q = query(q, where('qualification.type', '==', filters.qualificationType));
        }

        if (filters.source && filters.source !== 'all') {
            q = query(q, where('source', '==', filters.source));
        }

        if (filters.urgency && filters.urgency !== 'all') {
            q = query(q, where('urgency', '==', filters.urgency));
        }

        // Paginação
        if (lastDoc) {
            // Aceita: DocumentSnapshot, string (leadId) ou objeto { id: '...' }
            let startAfterDoc = lastDoc;

            // Se for string, buscar snapshot do documento
            if (typeof lastDoc === 'string') {
                const snap = await getDoc(getLeadDoc(consultorId, lastDoc));
                startAfterDoc = snap.exists() ? snap : null;
            }

            // Se for objeto simples com id (não um DocumentSnapshot), buscar snapshot
            if (
                startAfterDoc &&
                typeof startAfterDoc === 'object' &&
                typeof startAfterDoc.data !== 'function' &&
                startAfterDoc.id
            ) {
                const snap = await getDoc(getLeadDoc(consultorId, startAfterDoc.id));
                startAfterDoc = snap.exists() ? snap : null;
            }

            // Se for DocumentSnapshot válido, aplicar startAfter
            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }
        }

        const snapshot = await getDocs(q);

        const leads = [];
        snapshot.forEach((doc) => {
            leads.push({
                ...doc.data(),
                id: doc.id
            });
        });

        return {
            leads,
            hasMore: snapshot.docs.length === pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };

    } catch (error) {
        console.error('LeadService: Erro ao listar leads:', error);
        throw new Error(`Erro ao listar leads: ${error.message}`);
    }
};

/**
 * Buscar leads por termo
 */
export const searchLeads = async (consultorId, searchTerm) => {
    try {
        const collectionRef = getLeadCollection(consultorId);
        const snapshot = await getDocs(collectionRef);

        const leads = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const searchLower = searchTerm.toLowerCase();

            // Buscar em nome, telefone e email
            if (
                data.prospect?.name?.toLowerCase().includes(searchLower) ||
                data.prospect?.phone?.includes(searchTerm) ||
                data.prospect?.email?.toLowerCase().includes(searchLower)
            ) {
                leads.push({
                    ...data,
                    id: doc.id
                });
            }
        });

        return leads;

    } catch (error) {
        console.error('LeadService: Erro ao buscar leads:', error);
        throw new Error(`Erro ao buscar leads: ${error.message}`);
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar lead
 */
export const updateLead = async (consultorId, leadId, updateData) => {
    try {
        const leadRef = getLeadDoc(consultorId, leadId);

        // Adicionar timestamp de atualização
        const dataToUpdate = {
            ...updateData,
            updatedAt: Timestamp.now()
        };

        await updateDoc(leadRef, dataToUpdate);

        // Retornar lead atualizada
        const updatedLead = await getLead(consultorId, leadId);
        return updatedLead;

    } catch (error) {
        console.error('LeadService: Erro ao atualizar lead:', error);
        throw new Error(`Erro ao atualizar lead: ${error.message}`);
    }
};

/**
 * Adicionar follow-up com data e hora
 * @param {string} consultorId - ID do consultor
 * @param {string} leadId - ID da lead
 * @param {object} followUpData - Dados do follow-up incluindo scheduledDateTime
 */
export const addFollowUp = async (consultorId, leadId, followUpData) => {
    try {
        const lead = await getLead(consultorId, leadId);

        // Processar data e hora
        let scheduledDateTime;

        if (followUpData.scheduledDateTime) {
            // Se já vem como datetime completo, usar diretamente
            scheduledDateTime = followUpData.scheduledDateTime instanceof Date
                ? Timestamp.fromDate(followUpData.scheduledDateTime)
                : Timestamp.fromDate(new Date(followUpData.scheduledDateTime));
        } else if (followUpData.scheduledFor && followUpData.scheduledTime) {
            // Se vem separado, combinar data e hora
            const dateTimeString = `${followUpData.scheduledFor}T${followUpData.scheduledTime}:00`;
            scheduledDateTime = Timestamp.fromDate(new Date(dateTimeString));
        } else if (followUpData.date) {
            // Compatibilidade com formato antigo
            scheduledDateTime = followUpData.date instanceof Timestamp
                ? followUpData.date
                : Timestamp.fromDate(new Date(followUpData.date));
        } else {
            // Fallback para data atual se não fornecido
            scheduledDateTime = Timestamp.now();
        }

        const newFollowUp = {
            id: Date.now().toString(), // ID único baseado em timestamp
            scheduledDateTime: scheduledDateTime, // Data e hora combinados
            type: followUpData.type || 'call',
            description: followUpData.description || '',
            notes: followUpData.notes || '',
            status: 'pending', // pending, completed, cancelled
            createdAt: Timestamp.now(),
            createdBy: consultorId,

            // Campos adicionais para compatibilidade e futuras funcionalidades
            reminder: followUpData.reminder || false, // Se deve gerar lembrete
            reminderMinutesBefore: followUpData.reminderMinutesBefore || 30, // Minutos antes para lembrete
            priority: followUpData.priority || 'normal', // low, normal, high, urgent

            // Campos legacy para compatibilidade
            date: scheduledDateTime, // Mantém campo date para compatibilidade
            scheduledFor: followUpData.scheduledFor, // Data original
            scheduledTime: followUpData.scheduledTime // Hora original
        };

        const updatedFollowUps = [...(lead.followUps || []), newFollowUp];

        // Ordenar follow-ups por data/hora (mais recentes primeiro)
        updatedFollowUps.sort((a, b) => {
            const dateA = a.scheduledDateTime?.toDate() || a.date?.toDate() || new Date(0);
            const dateB = b.scheduledDateTime?.toDate() || b.date?.toDate() || new Date(0);
            return dateB - dateA;
        });

        await updateLead(consultorId, leadId, {
            followUps: updatedFollowUps,
            lastFollowUpAt: scheduledDateTime,
            nextFollowUp: getNextPendingFollowUp(updatedFollowUps)
        });

        return newFollowUp;

    } catch (error) {
        console.error('LeadService: Erro ao adicionar follow-up:', error);
        throw new Error(`Erro ao adicionar follow-up: ${error.message}`);
    }
};

/**
 * Obter próximo follow-up pendente
 * @private
 */
const getNextPendingFollowUp = (followUps) => {
    const now = new Date();

    const pendingFollowUps = followUps
        .filter(f => f.status !== 'completed' && f.status !== 'cancelled')
        .filter(f => {
            const followUpDate = f.scheduledDateTime?.toDate() || f.date?.toDate();
            return followUpDate && followUpDate > now;
        })
        .sort((a, b) => {
            const dateA = a.scheduledDateTime?.toDate() || a.date?.toDate();
            const dateB = b.scheduledDateTime?.toDate() || b.date?.toDate();
            return dateA - dateB;
        });

    if (pendingFollowUps.length > 0) {
        const next = pendingFollowUps[0];
        return {
            id: next.id,
            type: next.type,
            scheduledDateTime: next.scheduledDateTime || next.date,
            description: next.description
        };
    }

    return null;
};

/**
 * Marcar follow-up como completo
 * @param {string} consultorId - ID do consultor
 * @param {string} leadId - ID da lead
 * @param {string} followUpId - ID do follow-up
 */
export const completeFollowUp = async (consultorId, leadId, followUpId) => {
    try {
        const lead = await getLead(consultorId, leadId);

        const updatedFollowUps = lead.followUps.map(f => {
            if (f.id === followUpId) {
                return {
                    ...f,
                    status: 'completed',
                    completedAt: Timestamp.now(),
                    completedBy: consultorId
                };
            }
            return f;
        });

        await updateLead(consultorId, leadId, {
            followUps: updatedFollowUps,
            nextFollowUp: getNextPendingFollowUp(updatedFollowUps)
        });

        return true;

    } catch (error) {
        console.error('LeadService: Erro ao completar follow-up:', error);
        throw new Error(`Erro ao completar follow-up: ${error.message}`);
    }
};

/**
 * Obter follow-ups por período
 * @param {string} consultorId - ID do consultor  
 * @param {Date} startDate - Data início
 * @param {Date} endDate - Data fim
 */
export const getFollowUpsByPeriod = async (consultorId, startDate, endDate) => {
    try {
        const leadsRef = getLeadCollection(consultorId);
        const q = query(leadsRef, where('status', '!=', 'convertida'));
        const snapshot = await getDocs(q);

        const allFollowUps = [];

        snapshot.forEach(doc => {
            const lead = { id: doc.id, ...doc.data() };
            const followUps = lead.followUps || [];

            followUps.forEach(followUp => {
                const followUpDate = followUp.scheduledDateTime?.toDate() || followUp.date?.toDate();

                if (followUpDate && followUpDate >= startDate && followUpDate <= endDate) {
                    allFollowUps.push({
                        ...followUp,
                        leadId: lead.id,
                        leadName: lead.prospect?.name || 'Sem nome',
                        leadPhone: lead.prospect?.phone || ''
                    });
                }
            });
        });

        // Ordenar por data/hora
        allFollowUps.sort((a, b) => {
            const dateA = a.scheduledDateTime?.toDate() || a.date?.toDate();
            const dateB = b.scheduledDateTime?.toDate() || b.date?.toDate();
            return dateA - dateB;
        });

        return allFollowUps;

    } catch (error) {
        console.error('LeadService: Erro ao buscar follow-ups por período:', error);
        throw new Error(`Erro ao buscar follow-ups: ${error.message}`);
    }
};

/**
 * Obter follow-ups do dia
 * @param {string} consultorId - ID do consultor
 */
export const getTodayFollowUps = async (consultorId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return getFollowUpsByPeriod(consultorId, today, tomorrow);
};

/**
 * Obter follow-ups atrasados
 * @param {string} consultorId - ID do consultor
 */
export const getOverdueFollowUps = async (consultorId) => {
    const now = new Date();
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const allFollowUps = await getFollowUpsByPeriod(consultorId, yearAgo, now);

    return allFollowUps.filter(f =>
        f.status !== 'completed' &&
        f.status !== 'cancelled'
    );
};

/**
 * Converter lead em cliente
 */
export const convertLeadToClient = async (consultorId, leadId, clientData) => {
    try {
        // Importar função de criar cliente dinamicamente para evitar dependência circular
        const { createClient } = await import('./clientService');

        // Criar o cliente
        const newClient = await createClient(consultorId, clientData);

        // Atualizar o status da lead
        await updateLead(consultorId, leadId, {
            status: 'convertida',
            conversion: {
                converted: true,
                convertedAt: Timestamp.now(),
                clientId: newClient.id
            }
        });

        return {
            clientId: newClient.id,
            client: newClient
        };

    } catch (error) {
        console.error('LeadService: Erro ao converter lead:', error);
        throw new Error(`Erro ao converter lead: ${error.message}`);
    }
};

/**
 * Atualizar status da lead
 */
export const updateLeadStatus = async (consultorId, leadId, newStatus) => {
    try {
        await updateLead(consultorId, leadId, {
            status: newStatus
        });

        return true;

    } catch (error) {
        console.error('LeadService: Erro ao atualizar status:', error);
        throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Deletar lead
 */
export const deleteLead = async (consultorId, leadId) => {
    try {
        await deleteDoc(getLeadDoc(consultorId, leadId));
        return true;

    } catch (error) {
        console.error('LeadService: Erro ao deletar lead:', error);
        throw new Error(`Erro ao deletar lead: ${error.message}`);
    }
};

// ===== STATISTICS =====

/**
 * Obter estatísticas de leads
 */
export const getLeadStats = async (consultorId) => {
    try {
        if (!consultorId) {
            return {
                total: 0,
                byStatus: {
                    nova: 0,
                    qualificada: 0,
                    emNegociacao: 0,
                    convertida: 0,
                    perdida: 0
                },
                bySource: {},
                byQualification: {},
                conversionRate: 0,
                followUpsToday: 0,
                followUpsOverdue: 0
            };
        }

        const collectionRef = getLeadCollection(consultorId);
        const snapshot = await getDocs(collectionRef);

        const stats = {
            total: 0,
            byStatus: {
                nova: 0,
                qualificada: 0,
                emNegociacao: 0,
                convertida: 0,
                perdida: 0
            },
            bySource: {},
            byQualification: {},
            conversionRate: 0,
            followUpsToday: 0,
            followUpsOverdue: 0
        };

        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        snapshot.forEach((doc) => {
            const data = doc.data();
            stats.total++;

            // Por status
            if (data.status && stats.byStatus.hasOwnProperty(data.status)) {
                stats.byStatus[data.status]++;
            }

            // Por fonte
            if (data.source) {
                stats.bySource[data.source] = (stats.bySource[data.source] || 0) + 1;
            }

            // Por qualificação
            if (data.qualification?.type) {
                stats.byQualification[data.qualification.type] =
                    (stats.byQualification[data.qualification.type] || 0) + 1;
            }

            // Contar follow-ups
            if (data.followUps) {
                data.followUps.forEach(followUp => {
                    const followUpDate = followUp.scheduledDateTime?.toDate() || followUp.date?.toDate();

                    if (followUpDate && followUp.status !== 'completed' && followUp.status !== 'cancelled') {
                        // Follow-ups de hoje
                        if (followUpDate >= todayStart && followUpDate <= todayEnd) {
                            stats.followUpsToday++;
                        }
                        // Follow-ups atrasados
                        else if (followUpDate < now) {
                            stats.followUpsOverdue++;
                        }
                    }
                });
            }
        });

        // Taxa de conversão
        if (stats.total > 0) {
            stats.conversionRate = (stats.byStatus.convertida / stats.total) * 100;
        }

        return stats;

    } catch (error) {
        console.error('LeadService: Erro ao obter estatísticas:', error);
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Atualizar múltiplas leads
 */
export const batchUpdateLeads = async (consultorId, leadIds, updateData) => {
    try {
        const batch = writeBatch(db);

        for (const leadId of leadIds) {
            const leadRef = getLeadDoc(consultorId, leadId);
            batch.update(leadRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });
        }

        await batch.commit();
        return true;

    } catch (error) {
        console.error('LeadService: Erro ao atualizar leads em lote:', error);
        throw new Error(`Erro ao atualizar leads em lote: ${error.message}`);
    }
};

// ===== EXPORT ALL =====
export default {
    createLead,
    getLead,
    listLeads,
    searchLeads,
    updateLead,
    addFollowUp,
    completeFollowUp,
    getFollowUpsByPeriod,
    getTodayFollowUps,
    getOverdueFollowUps,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    getLeadStats,
    batchUpdateLeads
};