/**
 * LEAD SERVICE - MyImoMatePro
 * CRUD completo para gestão de leads no Firestore
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

        // Adicionar ao Firestore
        const leadRef = await addDoc(getLeadCollection(consultorId), leadSchema);

        // IMPORTANTE: Retornar a lead criada COM ID
        const newLead = {
            id: leadRef.id,  // ← CRÍTICO: Incluir o ID!
            ...leadSchema
        };

        console.log('Lead criada com sucesso, ID:', leadRef.id);
        return newLead;

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
            q = query(q, startAfter(lastDoc));
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
 * Adicionar follow-up
 */
export const addFollowUp = async (consultorId, leadId, followUpData) => {
    try {
        const lead = await getLead(consultorId, leadId);

        const newFollowUp = {
            id: Date.now().toString(), // ID simples baseado em timestamp
            date: followUpData.date || Timestamp.now(),
            type: followUpData.type,
            notes: followUpData.notes || '',
            createdAt: Timestamp.now(),
            createdBy: consultorId
        };

        const updatedFollowUps = [...(lead.followUps || []), newFollowUp];

        await updateLead(consultorId, leadId, {
            followUps: updatedFollowUps
        });

        return newFollowUp;

    } catch (error) {
        console.error('LeadService: Erro ao adicionar follow-up:', error);
        throw new Error(`Erro ao adicionar follow-up: ${error.message}`);
    }
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
                conversionRate: 0
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
            conversionRate: 0
        };

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
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    getLeadStats,
    batchUpdateLeads
};