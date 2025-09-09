/**
 * LEAD SERVICE - MyImoMatePro
 * Serviço simplificado para gestão de Leads no Firebase
 * Lead = Cliente PROSPECT com qualificação
 * 
 * Caminho: src/services/leadService.js
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Lead, LEAD_FUNNEL_STATES } from '../models/leadModel';

const COLLECTION_NAME = 'leads';
const CLIENTS_COLLECTION = 'clients';

// ===== OPERAÇÕES CRUD =====

/**
 * Criar nova lead
 * Também atualiza o cliente para badge PROSPECT
 */
export async function createLead(leadData, userId) {
    try {
        // Validar se cliente existe
        const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            throw new Error('Cliente não encontrado');
        }

        const batch = writeBatch(db);

        // 1. Criar a lead
        const leadRef = doc(collection(db, COLLECTION_NAME));
        const newLead = {
            ...leadData,
            id: leadRef.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            assignedTo: userId,
            funnelState: LEAD_FUNNEL_STATES.ENTRADA
        };

        batch.set(leadRef, newLead);

        // 2. Atualizar cliente com badge PROSPECT
        batch.update(clientRef, {
            isProspect: true,
            hasLead: true,
            leadId: leadRef.id,
            updatedAt: serverTimestamp()
        });

        // Executar transação
        await batch.commit();

        return {
            id: leadRef.id,
            ...newLead,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Erro ao criar lead:', error);
        throw error;
    }
}

/**
 * Buscar lead por ID
 */
export async function getLeadById(leadId) {
    try {
        const leadRef = doc(db, COLLECTION_NAME, leadId);
        const leadSnap = await getDoc(leadRef);

        if (!leadSnap.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadSnap.data();

        // Buscar dados do cliente associado
        const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
        const clientSnap = await getDoc(clientRef);

        return {
            id: leadSnap.id,
            ...leadData,
            client: clientSnap.exists() ? { id: clientSnap.id, ...clientSnap.data() } : null,
            createdAt: leadData.createdAt?.toDate?.()?.toISOString() || leadData.createdAt,
            updatedAt: leadData.updatedAt?.toDate?.()?.toISOString() || leadData.updatedAt
        };
    } catch (error) {
        console.error('Erro ao buscar lead:', error);
        throw error;
    }
}

/**
 * Listar leads com filtros
 */
export async function getLeads(userId, filters = {}) {
    try {
        let q = query(
            collection(db, COLLECTION_NAME),
            where('createdBy', '==', userId)
        );

        // Aplicar filtros
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }

        if (filters.source) {
            q = query(q, where('source', '==', filters.source));
        }

        if (filters.funnelState) {
            q = query(q, where('funnelState', '==', filters.funnelState));
        }

        // Ordenação
        q = query(q, orderBy('createdAt', 'desc'));

        // Paginação
        if (filters.limit) {
            q = query(q, limit(filters.limit));
        }

        if (filters.startAfter) {
            q = query(q, startAfter(filters.startAfter));
        }

        const snapshot = await getDocs(q);
        const leads = [];

        // Buscar dados dos clientes associados
        const clientIds = [...new Set(snapshot.docs.map(doc => doc.data().clientId))];
        const clientsData = {};

        // Buscar clientes em batch
        for (const clientId of clientIds) {
            const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
            const clientSnap = await getDoc(clientRef);
            if (clientSnap.exists()) {
                clientsData[clientId] = { id: clientSnap.id, ...clientSnap.data() };
            }
        }

        // Montar lista de leads com dados dos clientes
        snapshot.forEach(doc => {
            const leadData = doc.data();
            leads.push({
                id: doc.id,
                ...leadData,
                client: clientsData[leadData.clientId] || null,
                createdAt: leadData.createdAt?.toDate?.()?.toISOString() || leadData.createdAt,
                updatedAt: leadData.updatedAt?.toDate?.()?.toISOString() || leadData.updatedAt
            });
        });

        return {
            leads,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
            hasMore: snapshot.docs.length === (filters.limit || 20)
        };
    } catch (error) {
        console.error('Erro ao buscar leads:', error);
        throw error;
    }
}

/**
 * Atualizar lead
 */
export async function updateLead(leadId, updates) {
    try {
        const leadRef = doc(db, COLLECTION_NAME, leadId);

        await updateDoc(leadRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        // Se mudou o estado do funil para CONVERTIDO
        if (updates.funnelState === LEAD_FUNNEL_STATES.CONVERTIDO) {
            const leadSnap = await getDoc(leadRef);
            const leadData = leadSnap.data();

            // Atualizar cliente removendo badge PROSPECT
            const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
            await updateDoc(clientRef, {
                isProspect: false,
                hasLead: false,
                leadConverted: true,
                leadConvertedAt: serverTimestamp()
            });
        }

        return { id: leadId, ...updates };
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
    }
}

/**
 * Deletar lead
 */
export async function deleteLead(leadId) {
    try {
        const leadRef = doc(db, COLLECTION_NAME, leadId);

        // Buscar lead para obter clientId
        const leadSnap = await getDoc(leadRef);
        if (!leadSnap.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadSnap.data();
        const batch = writeBatch(db);

        // 1. Deletar lead
        batch.delete(leadRef);

        // 2. Atualizar cliente removendo badge PROSPECT
        const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
        batch.update(clientRef, {
            isProspect: false,
            hasLead: false,
            leadId: null,
            updatedAt: serverTimestamp()
        });

        await batch.commit();

        return leadId;
    } catch (error) {
        console.error('Erro ao deletar lead:', error);
        throw error;
    }
}

// ===== OPERAÇÕES DE CONVERSÃO =====

/**
 * Converter lead em oportunidade
 */
export async function convertLead(leadId, opportunityData, userId) {
    try {
        const batch = writeBatch(db);

        // 1. Atualizar lead para CONVERTIDO
        const leadRef = doc(db, COLLECTION_NAME, leadId);
        batch.update(leadRef, {
            funnelState: LEAD_FUNNEL_STATES.CONVERTIDO,
            convertedAt: serverTimestamp(),
            opportunityId: opportunityData.id || null,
            updatedAt: serverTimestamp()
        });

        // 2. Buscar lead para obter clientId
        const leadSnap = await getDoc(leadRef);
        const leadData = leadSnap.data();

        // 3. Atualizar cliente
        const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
        batch.update(clientRef, {
            isProspect: false,
            hasLead: false,
            isActive: true,
            leadConverted: true,
            leadConvertedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 4. Criar oportunidade (se fornecida)
        if (opportunityData) {
            const opportunityRef = doc(collection(db, 'opportunities'));
            batch.set(opportunityRef, {
                ...opportunityData,
                clientId: leadData.clientId,
                leadId: leadId,
                createdAt: serverTimestamp(),
                createdBy: userId
            });
        }

        await batch.commit();

        return {
            leadId,
            clientId: leadData.clientId,
            opportunityId: opportunityData?.id || null
        };
    } catch (error) {
        console.error('Erro ao converter lead:', error);
        throw error;
    }
}

// ===== ESTATÍSTICAS =====

/**
 * Obter estatísticas de leads
 */
export async function getLeadStats(userId) {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('createdBy', '==', userId)
        );

        const snapshot = await getDocs(q);

        const stats = {
            total: 0,
            byFunnelState: {
                entrada: 0,
                qualificando: 0,
                convertido: 0
            },
            byType: {},
            bySource: {},
            conversionRate: 0
        };

        snapshot.forEach(doc => {
            const lead = doc.data();
            stats.total++;

            // Por estado do funil
            if (lead.funnelState) {
                stats.byFunnelState[lead.funnelState] = (stats.byFunnelState[lead.funnelState] || 0) + 1;
            }

            // Por tipo
            if (lead.type) {
                stats.byType[lead.type] = (stats.byType[lead.type] || 0) + 1;
            }

            // Por fonte
            if (lead.source) {
                stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
            }
        });

        // Calcular taxa de conversão
        if (stats.total > 0) {
            stats.conversionRate = (stats.byFunnelState.convertido / stats.total) * 100;
        }

        return stats;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}

// ===== PESQUISA =====

/**
 * Pesquisar leads
 */
export async function searchLeads(userId, searchTerm) {
    try {
        // Buscar todas as leads do usuário
        const q = query(
            collection(db, COLLECTION_NAME),
            where('createdBy', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const allLeads = [];

        // Buscar dados dos clientes
        const clientIds = [...new Set(snapshot.docs.map(doc => doc.data().clientId))];
        const clientsData = {};

        for (const clientId of clientIds) {
            const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
            const clientSnap = await getDoc(clientRef);
            if (clientSnap.exists()) {
                clientsData[clientId] = clientSnap.data();
            }
        }

        // Montar lista completa
        snapshot.forEach(doc => {
            const leadData = doc.data();
            const client = clientsData[leadData.clientId];

            allLeads.push({
                id: doc.id,
                ...leadData,
                client,
                searchableText: `${client?.name || ''} ${client?.email || ''} ${client?.phone || ''} ${leadData.qualification?.qualificationNotes || ''}`.toLowerCase()
            });
        });

        // Filtrar por termo de pesquisa
        const searchLower = searchTerm.toLowerCase();
        const filteredLeads = allLeads.filter(lead =>
            lead.searchableText.includes(searchLower)
        );

        return filteredLeads.map(lead => {
            const { searchableText, ...leadWithoutSearch } = lead;
            return leadWithoutSearch;
        });
    } catch (error) {
        console.error('Erro ao pesquisar leads:', error);
        throw error;
    }
}