/**
 * OPPORTUNITY SERVICE - MyImoMatePro
 * CRUD completo para gestão de oportunidades no Firestore
 * 
 * Caminho: src/services/opportunityService.js
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
    increment
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createOpportunitySchema,
    validateOpportunityData,
    getNextPhase,
    getPreviousPhase,
    calculateCommission
} from '../models/opportunityModel';

// ===== CONFIGURAÇÕES =====
const COLLECTION_NAME = 'oportunidades';
const CONSULTOR_COLLECTION = 'consultores';
const CLIENTE_COLLECTION = 'clientes';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====
const getOpportunityCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getOpportunityDoc = (consultorId, opportunityId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, opportunityId);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova oportunidade
 */
export const createOpportunity = async (consultorId, opportunityData) => {
    try {
        // Validar dados antes de criar
        const validation = validateOpportunityData(opportunityData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema com consultorId
        const opportunitySchema = createOpportunitySchema(opportunityData);
        opportunitySchema.consultorId = consultorId;
        opportunitySchema.createdAt = Timestamp.now();
        opportunitySchema.updatedAt = Timestamp.now();

        // Calcular valor da comissão
        if (opportunitySchema.valores.estimado && opportunitySchema.valores.comissao_percentagem) {
            opportunitySchema.valores.comissao_valor = calculateCommission(
                opportunitySchema.valores.estimado,
                opportunitySchema.valores.comissao_percentagem
            );
        }

        // Remover qualquer campo "id" que venha no payload
        if ('id' in opportunitySchema) {
            delete opportunitySchema.id;
        }

        // Adicionar ao Firestore
        const opportunityRef = await addDoc(getOpportunityCollection(consultorId), opportunitySchema);

        // Atualizar o documento com o ID
        await updateDoc(opportunityRef, { id: opportunityRef.id });

        // Atualizar contador no cliente
        if (opportunityData.clienteId) {
            const clientRef = doc(db, CONSULTOR_COLLECTION, consultorId, CLIENTE_COLLECTION, opportunityData.clienteId);
            await updateDoc(clientRef, {
                'stats.totalOportunidades': increment(1),
                updatedAt: Timestamp.now()
            });
        }

        // Buscar e retornar o documento criado
        const savedSnap = await getDoc(opportunityRef);
        const savedOpportunity = savedSnap.exists() ? { ...savedSnap.data(), id: savedSnap.id } : null;

        return {
            success: true,
            data: savedOpportunity,
            message: 'Oportunidade criada com sucesso'
        };
    } catch (error) {
        console.error('Erro ao criar oportunidade:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar oportunidade por ID
 */
export const getOpportunity = async (consultorId, opportunityId) => {
    try {
        const opportunityDoc = await getDoc(getOpportunityDoc(consultorId, opportunityId));

        if (!opportunityDoc.exists()) {
            return {
                success: false,
                error: 'Oportunidade não encontrada'
            };
        }

        return {
            success: true,
            data: {
                id: opportunityDoc.id,
                ...opportunityDoc.data()
            }
        };
    } catch (error) {
        console.error('Erro ao buscar oportunidade:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Listar oportunidades com filtros
 */
export const listOpportunities = async (consultorId, filters = {}, pagination = {}) => {
    try {
        let q = getOpportunityCollection(consultorId);
        const constraints = [];

        // Filtros
        if (filters.tipo) {
            constraints.push(where('tipo', '==', filters.tipo));
        }

        if (filters.status) {
            constraints.push(where('status', '==', filters.status));
        }

        if (filters.clienteId) {
            constraints.push(where('clienteId', '==', filters.clienteId));
        }

        if (filters.fase_atual) {
            constraints.push(where('fase_atual', '==', filters.fase_atual));
        }

        if (filters.probabilidade_min) {
            constraints.push(where('probabilidade', '>=', filters.probabilidade_min));
        }

        // Ordenação
        const orderField = filters.orderBy || 'createdAt';
        const orderDirection = filters.orderDirection || 'desc';
        constraints.push(orderBy(orderField, orderDirection));

        // Paginação
        const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;
        constraints.push(limit(pageSize));

        if (pagination.lastDoc) {
            constraints.push(startAfter(pagination.lastDoc));
        }

        // Executar query
        q = query(q, ...constraints);
        const snapshot = await getDocs(q);

        const opportunities = [];
        snapshot.forEach(doc => {
            opportunities.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            data: opportunities,
            hasMore: opportunities.length === pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
    } catch (error) {
        console.error('Erro ao listar oportunidades:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

/**
 * Buscar oportunidades por tipo
 */
export const getOpportunitiesByType = async (consultorId, tipo) => {
    try {
        const q = query(
            getOpportunityCollection(consultorId),
            where('tipo', '==', tipo),
            where('status', 'in', ['qualificacao', 'ativa']),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const opportunities = [];

        snapshot.forEach(doc => {
            opportunities.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return {
            success: true,
            data: opportunities
        };
    } catch (error) {
        console.error('Erro ao buscar oportunidades por tipo:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar oportunidade
 */
export const updateOpportunity = async (consultorId, opportunityId, updateData) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, opportunityId);

        // Verificar se existe
        const opportunityDoc = await getDoc(opportunityRef);
        if (!opportunityDoc.exists()) {
            return {
                success: false,
                error: 'Oportunidade não encontrada'
            };
        }

        // Preparar dados para atualização
        const dataToUpdate = {
            ...updateData,
            updatedAt: Timestamp.now()
        };

        // Recalcular comissão se valores mudaram
        if (updateData.valores) {
            const currentData = opportunityDoc.data();
            const estimado = updateData.valores.estimado || currentData.valores.estimado;
            const percentagem = updateData.valores.comissao_percentagem || currentData.valores.comissao_percentagem;

            dataToUpdate.valores = {
                ...currentData.valores,
                ...updateData.valores,
                comissao_valor: calculateCommission(estimado, percentagem)
            };
        }

        // Atualizar dias na fase se mudou de fase
        if (updateData.fase_atual && updateData.fase_atual !== opportunityDoc.data().fase_atual) {
            dataToUpdate['stats.dias_na_fase'] = 0;
            dataToUpdate['datas.ultima_atividade'] = Timestamp.now();
        }

        // Atualizar no Firestore
        await updateDoc(opportunityRef, dataToUpdate);

        // Buscar e retornar documento atualizado
        const updatedDoc = await getDoc(opportunityRef);

        return {
            success: true,
            data: {
                id: updatedDoc.id,
                ...updatedDoc.data()
            },
            message: 'Oportunidade atualizada com sucesso'
        };
    } catch (error) {
        console.error('Erro ao atualizar oportunidade:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Mudar fase da oportunidade
 */
export const changeOpportunityPhase = async (consultorId, opportunityId, novaFase, notas = '') => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, opportunityId);
        const opportunityDoc = await getDoc(opportunityRef);

        if (!opportunityDoc.exists()) {
            return {
                success: false,
                error: 'Oportunidade não encontrada'
            };
        }

        const currentData = opportunityDoc.data();

        // Atualizar fase e adicionar ao histórico
        const updateData = {
            fase_atual: novaFase,
            'stats.dias_na_fase': 0,
            'datas.ultima_atividade': Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        // Adicionar nota se fornecida
        if (notas) {
            updateData.notas = currentData.notas + '\n\n' +
                `[${new Date().toLocaleDateString()}] Mudança de fase: ${notas}`;
        }

        await updateDoc(opportunityRef, updateData);

        return {
            success: true,
            message: 'Fase atualizada com sucesso'
        };
    } catch (error) {
        console.error('Erro ao mudar fase:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Atualizar status da oportunidade
 */
export const updateOpportunityStatus = async (consultorId, opportunityId, novoStatus, motivoPerda = '') => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, opportunityId);

        const updateData = {
            status: novoStatus,
            updatedAt: Timestamp.now()
        };

        // Se foi perdida, adicionar motivo
        if (novoStatus === 'perdida' && motivoPerda) {
            updateData.motivo_perda = motivoPerda;
        }

        // Se foi ganha, atualizar data de fecho
        if (novoStatus === 'ganha') {
            updateData['datas.data_fecho'] = Timestamp.now();
        }

        await updateDoc(opportunityRef, updateData);

        return {
            success: true,
            message: `Status atualizado para ${novoStatus}`
        };
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Deletar oportunidade
 */
export const deleteOpportunity = async (consultorId, opportunityId) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, opportunityId);

        // Verificar se existe
        const opportunityDoc = await getDoc(opportunityRef);
        if (!opportunityDoc.exists()) {
            return {
                success: false,
                error: 'Oportunidade não encontrada'
            };
        }

        const opportunityData = opportunityDoc.data();

        // Deletar oportunidade
        await deleteDoc(opportunityRef);

        // Atualizar contador no cliente
        if (opportunityData.clienteId) {
            const clientRef = doc(db, CONSULTOR_COLLECTION, consultorId, CLIENTE_COLLECTION, opportunityData.clienteId);
            await updateDoc(clientRef, {
                'stats.totalOportunidades': increment(-1),
                updatedAt: Timestamp.now()
            });
        }

        return {
            success: true,
            message: 'Oportunidade deletada com sucesso'
        };
    } catch (error) {
        console.error('Erro ao deletar oportunidade:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ===== STATISTICS OPERATIONS =====

/**
 * Obter estatísticas de oportunidades
 */
export const getOpportunityStats = async (consultorId) => {
    try {
        const snapshot = await getDocs(getOpportunityCollection(consultorId));

        const stats = {
            total: 0,
            porTipo: {
                comprador: 0,
                vendedor: 0,
                investidor: 0,
                senhorio: 0,
                inquilino: 0
            },
            porStatus: {
                qualificacao: 0,
                ativa: 0,
                pausada: 0,
                ganha: 0,
                perdida: 0
            },
            valorTotal: 0,
            comissaoEstimada: 0,
            taxaConversao: 0
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            stats.total++;

            // Por tipo
            if (stats.porTipo[data.tipo] !== undefined) {
                stats.porTipo[data.tipo]++;
            }

            // Por status
            if (stats.porStatus[data.status] !== undefined) {
                stats.porStatus[data.status]++;
            }

            // Valores
            if (data.status === 'ativa' || data.status === 'qualificacao') {
                stats.valorTotal += data.valores?.estimado || 0;
                stats.comissaoEstimada += data.valores?.comissao_valor || 0;
            }
        });

        // Taxa de conversão
        if (stats.total > 0) {
            stats.taxaConversao = ((stats.porStatus.ganha / stats.total) * 100).toFixed(1);
        }

        return {
            success: true,
            data: stats
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Atualizar múltiplas oportunidades
 */
export const batchUpdateOpportunities = async (consultorId, updates) => {
    try {
        const batch = writeBatch(db);

        for (const update of updates) {
            const opportunityRef = getOpportunityDoc(consultorId, update.id);
            const updateData = {
                ...update.data,
                updatedAt: Timestamp.now()
            };
            batch.update(opportunityRef, updateData);
        }

        await batch.commit();

        return {
            success: true,
            message: `${updates.length} oportunidades atualizadas`
        };
    } catch (error) {
        console.error('Erro ao atualizar oportunidades em lote:', error);
        return {
            success: false,
            error: error.message
        };
    }
};