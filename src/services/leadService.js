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
        console.log('📝 Criando nova lead para consultor:', consultorId);

        const collectionRef = getLeadCollection(consultorId);

        // Adicionar timestamps
        const dataToSave = {
            ...leadData,
            consultorId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Criar documento no Firestore
        const docRef = await addDoc(collectionRef, dataToSave);

        console.log('✅ Lead criada com ID:', docRef.id);

        // IMPORTANTE: Retornar a lead COM o ID
        return {
            id: docRef.id,  // ← CRÍTICO: Incluir o ID!
            ...dataToSave
        };

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
            id: leadDoc.id,
            ...leadDoc.data()
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
            lastDoc = null,
            filters = {},
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        const collectionRef = getLeadCollection(consultorId);
        let q = query(collectionRef);

        // Aplicar filtros
        if (filters.status && filters.status !== 'all') {
            q = query(q, where('status', '==', filters.status));
        }

        if (filters.qualificationType && filters.qualificationType !== 'all') {
            q = query(q, where('qualification.type', '==', filters.qualificationType));
        }

        if (filters.source && filters.source !== 'all') {
            q = query(q, where('source.origin', '==', filters.source));
        }

        if (filters.urgency && filters.urgency !== 'all') {
            // Filtro de urgência específico por tipo
            if (filters.qualificationType === 'comprador') {
                q = query(q, where('qualification.buyer.urgency', '==', filters.urgency));
            } else if (filters.qualificationType === 'vendedor') {
                q = query(q, where('qualification.seller.urgency', '==', filters.urgency));
            }
            // ... adicionar outros tipos conforme necessário
        }

        // Aplicar ordenação
        q = query(q, orderBy(sortBy, sortOrder));

        // Aplicar limite
        q = query(q, limit(pageSize));

        // Aplicar paginação
        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        const leads = [];
        snapshot.forEach((doc) => {
            leads.push({
                id: doc.id,
                ...doc.data()
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
                    id: doc.id,
                    ...data
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
export const convertLeadToClient = async (consultorId, leadId, clientId) => {
    try {
        await updateLead(consultorId, leadId, {
            status: 'convertida',
            conversion: {
                converted: true,
                convertedAt: Timestamp.now(),
                clientId: clientId
            }
        });

        return true;

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
                byQualificationType: {
                    comprador: 0,
                    vendedor: 0,
                    senhorio: 0,
                    inquilino: 0,
                    investidor: 0
                },
                bySource: {},
                byUrgency: {
                    baixa: 0,
                    normal: 0,
                    alta: 0,
                    urgente: 0
                },
                conversionRate: 0,
                lastUpdated: new Date().toISOString()
            };
        }

        const collectionRef = getLeadCollection(consultorId);
        const snapshot = await getDocs(collectionRef);

        const leads = [];
        snapshot.forEach((doc) => {
            leads.push(doc.data());
        });

        const stats = {
            total: leads.length,
            byStatus: {
                nova: 0,
                qualificada: 0,
                emNegociacao: 0,
                convertida: 0,
                perdida: 0
            },
            byQualificationType: {
                comprador: 0,
                vendedor: 0,
                senhorio: 0,
                inquilino: 0,
                investidor: 0
            },
            bySource: {},
            byUrgency: {
                baixa: 0,
                normal: 0,
                alta: 0,
                urgente: 0
            },
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
        };

        // Calcular estatísticas
        leads.forEach(lead => {
            // Por status
            if (lead.status) {
                stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
            }

            // Por tipo de qualificação
            if (lead.qualification?.type) {
                stats.byQualificationType[lead.qualification.type] =
                    (stats.byQualificationType[lead.qualification.type] || 0) + 1;
            }

            // Por fonte
            if (lead.source?.origin) {
                stats.bySource[lead.source.origin] =
                    (stats.bySource[lead.source.origin] || 0) + 1;
            }

            // Por urgência (baseado no tipo)
            const type = lead.qualification?.type;
            let urgency = null;

            if (type === 'comprador') {
                urgency = lead.qualification?.buyer?.urgency;
            } else if (type === 'vendedor') {
                urgency = lead.qualification?.seller?.urgency;
            } else if (type === 'inquilino') {
                urgency = lead.qualification?.tenant?.urgency;
            } else if (type === 'senhorio') {
                urgency = lead.qualification?.landlord?.urgency;
            }

            if (urgency) {
                stats.byUrgency[urgency] = (stats.byUrgency[urgency] || 0) + 1;
            }
        });

        // Calcular taxa de conversão
        if (stats.total > 0) {
            stats.conversionRate = (stats.byStatus.convertida / stats.total) * 100;
        }

        return stats;

    } catch (error) {
        console.error('LeadService: Erro ao calcular estatísticas:', error);
        // Retornar estatísticas vazias ao invés de lançar erro
        return {
            total: 0,
            byStatus: {
                nova: 0,
                qualificada: 0,
                emNegociacao: 0,
                convertida: 0,
                perdida: 0
            },
            byQualificationType: {
                comprador: 0,
                vendedor: 0,
                senhorio: 0,
                inquilino: 0,
                investidor: 0
            },
            bySource: {},
            byUrgency: {
                baixa: 0,
                normal: 0,
                alta: 0,
                urgente: 0
            },
            conversionRate: 0,
            lastUpdated: new Date().toISOString()
        };
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Operações em lote para múltiplas leads
 */
export const batchUpdateLeads = async (consultorId, updates) => {
    try {
        const batch = writeBatch(db);

        updates.forEach(({ leadId, data }) => {
            const leadRef = getLeadDoc(consultorId, leadId);
            batch.update(leadRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();
        return true;

    } catch (error) {
        console.error('LeadService: Erro na operação em lote:', error);
        throw new Error(`Erro na operação em lote: ${error.message}`);
    }
};