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
    setDoc,
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
import { db } from '../firebase/config';
import { Lead, LEAD_FUNNEL_STATES } from '../models/leadModel';

const COLLECTION_NAME = 'leads';
const CLIENTS_COLLECTION = 'clients';
const CONSULTOR_COLLECTION = 'consultores';

// ===== OPERAÇÕES CRUD =====

/**
 * Criar nova lead
 */
export async function createLead(leadData, userId) {
    try {
        // Validar dados básicos
        if (!leadData.clientId) {
            throw new Error('ID do cliente é obrigatório');
        }

        // Criar a lead diretamente (sem verificar se cliente existe)
        const leadRef = doc(collection(db, COLLECTION_NAME));
        const newLead = {
            ...leadData,
            id: leadRef.id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId,
            assignedTo: userId,
            funnelState: leadData.funnelState || LEAD_FUNNEL_STATES.ENTRADA
        };

        await setDoc(leadRef, newLead);

        // Tentar atualizar o cliente (opcional)
        try {
            const clientRef = doc(db, CONSULTOR_COLLECTION, userId, CLIENTS_COLLECTION, leadData.clientId);
            await updateDoc(clientRef, {
                isProspect: true,
                hasLead: true,
                leadId: leadRef.id,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.warn('Aviso: Cliente não atualizado, mas lead criada:', err);
        }

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
 * Listar todas as leads
 */
export async function getLeads(filters = {}) {
    try {
        let q = collection(db, COLLECTION_NAME);

        // Aplicar filtros se fornecidos
        const constraints = [];

        if (filters.assignedTo) {
            constraints.push(where('assignedTo', '==', filters.assignedTo));
        }

        if (filters.funnelState) {
            constraints.push(where('funnelState', '==', filters.funnelState));
        }

        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }

        // Ordenar por data de criação
        constraints.push(orderBy('createdAt', 'desc'));

        // Aplicar limite se fornecido
        if (filters.limit) {
            constraints.push(limit(filters.limit));
        }

        // Aplicar paginação se fornecido
        if (filters.lastDoc) {
            constraints.push(startAfter(filters.lastDoc));
        }

        q = query(q, ...constraints);
        const snapshot = await getDocs(q);

        const leads = [];
        for (const docSnap of snapshot.docs) {
            const leadData = docSnap.data();

            // Buscar dados do cliente
            const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
            const clientSnap = await getDoc(clientRef);

            leads.push({
                id: docSnap.id,
                ...leadData,
                client: clientSnap.exists() ? { id: clientSnap.id, ...clientSnap.data() } : null,
                createdAt: leadData.createdAt?.toDate?.()?.toISOString() || leadData.createdAt,
                updatedAt: leadData.updatedAt?.toDate?.()?.toISOString() || leadData.updatedAt
            });
        }

        return {
            leads,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao listar leads:', error);
        throw error;
    }
}

/**
 * Atualizar lead
 */
export async function updateLead(leadId, updates) {
    try {
        const leadRef = doc(db, COLLECTION_NAME, leadId);

        // Verificar se lead existe
        const leadSnap = await getDoc(leadRef);
        if (!leadSnap.exists()) {
            throw new Error('Lead não encontrada');
        }

        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        await updateDoc(leadRef, updateData);

        return {
            id: leadId,
            ...updateData,
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
    }
}

/**
 * Mover lead no funil
 */
export async function moveLeadInFunnel(leadId, newState) {
    try {
        // Validar estado do funil
        if (!Object.values(LEAD_FUNNEL_STATES).includes(newState)) {
            throw new Error('Estado do funil inválido');
        }

        const leadRef = doc(db, COLLECTION_NAME, leadId);

        // Verificar se lead existe
        const leadSnap = await getDoc(leadRef);
        if (!leadSnap.exists()) {
            throw new Error('Lead não encontrada');
        }

        const updateData = {
            funnelState: newState,
            updatedAt: serverTimestamp()
        };

        // Se movendo para GANHO ou PERDIDO, atualizar status
        if (newState === LEAD_FUNNEL_STATES.GANHO) {
            updateData.status = 'won';
            updateData.wonAt = serverTimestamp();
        } else if (newState === LEAD_FUNNEL_STATES.PERDIDO) {
            updateData.status = 'lost';
            updateData.lostAt = serverTimestamp();
        }

        await updateDoc(leadRef, updateData);

        return {
            id: leadId,
            ...updateData,
            updatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Erro ao mover lead no funil:', error);
        throw error;
    }
}

/**
 * Eliminar lead
 * Também remove badge PROSPECT do cliente
 */
export async function deleteLead(leadId) {
    try {
        const leadRef = doc(db, COLLECTION_NAME, leadId);
        const leadSnap = await getDoc(leadRef);

        if (!leadSnap.exists()) {
            throw new Error('Lead não encontrada');
        }

        const leadData = leadSnap.data();
        const batch = writeBatch(db);

        // 1. Eliminar a lead
        batch.delete(leadRef);

        // 2. Remover badge PROSPECT do cliente
        if (leadData.clientId) {
            const clientRef = doc(db, CLIENTS_COLLECTION, leadData.clientId);
            batch.update(clientRef, {
                isProspect: false,
                hasLead: false,
                leadId: null,
                updatedAt: serverTimestamp()
            });
        }

        await batch.commit();

        return true;
    } catch (error) {
        console.error('Erro ao eliminar lead:', error);
        throw error;
    }
}

/**
 * Buscar estatísticas das leads
 */
export async function getLeadStats(userId) {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('assignedTo', '==', userId)
        );

        const snapshot = await getDocs(q);

        const stats = {
            total: 0,
            byFunnelState: {},
            byStatus: {
                active: 0,
                won: 0,
                lost: 0
            }
        };

        snapshot.forEach(doc => {
            const lead = doc.data();
            stats.total++;

            // Por estado do funil
            if (lead.funnelState) {
                stats.byFunnelState[lead.funnelState] =
                    (stats.byFunnelState[lead.funnelState] || 0) + 1;
            }

            // Por status
            if (lead.status) {
                stats.byStatus[lead.status] =
                    (stats.byStatus[lead.status] || 0) + 1;
            }
        });

        return stats;
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
    }
}

/**
 * Converter cliente em lead
 */
export async function convertClientToLead(clientId, leadData, userId) {
    try {
        // Verificar se cliente existe - usando estrutura correta
        const clientRef = doc(db, CONSULTOR_COLLECTION, userId, CLIENTS_COLLECTION, clientId);
        const clientSnap = await getDoc(clientRef);

        if (!clientSnap.exists()) {
            throw new Error('Cliente não encontrado');
        }

        const clientData = clientSnap.data();

        // Verificar se cliente já tem lead
        if (clientData.hasLead) {
            throw new Error('Cliente já possui uma lead ativa');
        }

        // Criar lead com dados do cliente
        const newLeadData = {
            ...leadData,
            clientId: clientId,
            clientName: clientData.name,
            clientEmail: clientData.email,
            clientPhone: clientData.phone
        };

        return await createLead(newLeadData, userId);
    } catch (error) {
        console.error('Erro ao converter cliente em lead:', error);
        throw error;
    }
}