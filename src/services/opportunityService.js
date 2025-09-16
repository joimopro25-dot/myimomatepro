/**
 * OPPORTUNITY SERVICE - MyImoMatePro
 * CRUD completo para gestão de oportunidades no Firestore
 * VERSÃO CORRIGIDA: Query simplificada para evitar erro de índice
 * 
 * Caminho: src/services/opportunityService.js
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}/oportunidades/{oportunidadeId}
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
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    createOpportunitySchema,
    validateOpportunityData,
    createTimelineEvent,
    TIMELINE_EVENT_TYPES,
    OPPORTUNITY_STATES,
    calculateDaysInPipeline
} from '../models/opportunityModel';

// ===== CONFIGURAÇÕES =====
const OPPORTUNITIES_COLLECTION = 'oportunidades';
const CLIENTS_COLLECTION = 'clientes';
const CONSULTOR_COLLECTION = 'consultores';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====

/**
 * Obter referência da coleção de oportunidades
 */
const getOpportunityCollection = (consultorId, clienteId) => {
    return collection(
        db,
        CONSULTOR_COLLECTION,
        consultorId,
        CLIENTS_COLLECTION,
        clienteId,
        OPPORTUNITIES_COLLECTION
    );
};

/**
 * Obter referência de um documento de oportunidade
 */
const getOpportunityDoc = (consultorId, clienteId, opportunityId) => {
    return doc(
        db,
        CONSULTOR_COLLECTION,
        consultorId,
        CLIENTS_COLLECTION,
        clienteId,
        OPPORTUNITIES_COLLECTION,
        opportunityId
    );
};

// ===== CREATE OPERATIONS =====

/**
 * Criar nova oportunidade para um cliente
 */
export const createOpportunity = async (consultorId, clienteId, opportunityData) => {
    try {
        // Validar dados
        const validation = validateOpportunityData(opportunityData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema com dados validados
        const opportunitySchema = createOpportunitySchema({
            ...opportunityData,
            consultorId,
            clienteId
        });

        // Adicionar evento de criação ao timeline
        opportunitySchema.timeline = [
            createTimelineEvent(
                TIMELINE_EVENT_TYPES.CREATED,
                `Oportunidade criada como ${opportunityData.tipo}`,
                { estado: opportunitySchema.estado }
            )
        ];

        // Adicionar ao Firestore
        const opportunityRef = await addDoc(
            getOpportunityCollection(consultorId, clienteId),
            opportunitySchema
        );

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, 1);

        // Buscar oportunidade criada para retornar com ID
        const createdOpportunity = await getDoc(opportunityRef);
        return {
            id: createdOpportunity.id,
            ...createdOpportunity.data()
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao criar oportunidade:', error);
        throw new Error(`Erro ao criar oportunidade: ${error.message}`);
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar oportunidade por ID
 */
export const getOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityDoc = await getDoc(
            getOpportunityDoc(consultorId, clienteId, opportunityId)
        );

        if (!opportunityDoc.exists()) {
            return null;
        }

        return {
            id: opportunityDoc.id,
            ...opportunityDoc.data()
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao buscar oportunidade:', error);
        throw new Error(`Erro ao buscar oportunidade: ${error.message}`);
    }
};

/**
 * Listar todas as oportunidades de um cliente (VERSÃO CORRIGIDA)
 * Query simplificada para evitar necessidade de índice composto
 */
export const listClientOpportunities = async (consultorId, clienteId, options = {}) => {
    try {
        const {
            tipo = null,
            estado = null,
            orderField = 'createdAt',
            orderDirection = 'desc',
            pageSize = DEFAULT_PAGE_SIZE,
            lastDoc = null
        } = options;

        // Query simplificada - apenas buscar documentos da coleção
        const opportunityQuery = query(
            getOpportunityCollection(consultorId, clienteId),
            limit(pageSize * 2) // Buscar mais para compensar filtros em memória
        );

        // Executar query
        const snapshot = await getDocs(opportunityQuery);

        let opportunities = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Verificar se está ativo (filtro em memória)
            if (data.isActive !== false) { // Incluir documentos sem o campo ou com true
                // Remover campo id dos dados se existir para evitar sobrescrita
                const { id: dataId, ...restData } = data;

                opportunities.push({
                    ...restData,
                    id: doc.id  // ID do documento SEMPRE por último
                });
            }
        });

        // Aplicar filtros em memória
        if (tipo) {
            opportunities = opportunities.filter(opp => opp.tipo === tipo);
        }

        if (estado) {
            opportunities = opportunities.filter(opp => opp.estado === estado);
        }

        // Ordenar em memória
        opportunities.sort((a, b) => {
            const aValue = a[orderField] || '';
            const bValue = b[orderField] || '';

            // Tratar Timestamps do Firestore
            const aDate = aValue?.seconds ? new Date(aValue.seconds * 1000) : new Date(aValue);
            const bDate = bValue?.seconds ? new Date(bValue.seconds * 1000) : new Date(bValue);

            if (orderDirection === 'desc') {
                return bDate - aDate;
            }
            return aDate - bDate;
        });

        // Paginar resultados
        const paginatedOpportunities = opportunities.slice(0, pageSize);

        // Calcular métricas adicionais
        const enrichedOpportunities = paginatedOpportunities.map(opp => ({
            ...opp,
            diasEmPipeline: calculateDaysInPipeline(opp.createdAt)
        }));

        return {
            opportunities: enrichedOpportunities,
            hasMore: opportunities.length > pageSize,
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao listar oportunidades:', error);

        // Se não houver oportunidades, retornar array vazio em vez de erro
        if (error.code === 'permission-denied' || error.message?.includes('index')) {
            return {
                opportunities: [],
                hasMore: false,
                lastDoc: null
            };
        }

        throw new Error(`Erro ao listar oportunidades: ${error.message}`);
    }
};

/**
 * Listar todas as oportunidades do consultor (todos os clientes)
 * VERSÃO SIMPLIFICADA
 */
export const listAllOpportunities = async (consultorId, options = {}) => {
    try {
        const {
            tipo = null,
            estado = null,
            prioridade = null,
            orderField = 'updatedAt',
            orderDirection = 'desc',
            pageSize = DEFAULT_PAGE_SIZE
        } = options;

        // Buscar todos os clientes primeiro
        const clientsRef = collection(db, CONSULTOR_COLLECTION, consultorId, CLIENTS_COLLECTION);
        const clientsSnapshot = await getDocs(clientsRef);

        const allOpportunities = [];

        // Para cada cliente, buscar suas oportunidades
        for (const clientDoc of clientsSnapshot.docs) {
            const clientId = clientDoc.id;
            const clientData = clientDoc.data();

            // Query simplificada sem where clause
            const oppQuery = query(
                getOpportunityCollection(consultorId, clientId)
            );

            const oppSnapshot = await getDocs(oppQuery);

            oppSnapshot.forEach((oppDoc) => {
                const oppData = oppDoc.data();

                // Aplicar filtros em memória
                if (oppData.isActive === false) return; // Skip inativos
                if (tipo && oppData.tipo !== tipo) return;
                if (estado && oppData.estado !== estado) return;
                if (prioridade && oppData.prioridade !== prioridade) return;

                allOpportunities.push({
                    id: oppDoc.id,
                    ...oppData,
                    clienteNome: clientData.name,
                    clienteEmail: clientData.email,
                    clienteTelefone: clientData.phone
                });
            });
        }

        // Ordenar resultados
        allOpportunities.sort((a, b) => {
            const aValue = a[orderField];
            const bValue = b[orderField];

            if (orderDirection === 'desc') {
                return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });

        // Paginar resultados
        const paginatedOpportunities = allOpportunities.slice(0, pageSize);

        return {
            opportunities: paginatedOpportunities,
            total: allOpportunities.length,
            hasMore: allOpportunities.length > pageSize
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao listar todas as oportunidades:', error);
        return {
            opportunities: [],
            total: 0,
            hasMore: false
        };
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar oportunidade
 */
export const updateOpportunity = async (consultorId, clienteId, opportunityId, updates) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

        // Buscar oportunidade atual
        const currentDoc = await getDoc(opportunityRef);
        if (!currentDoc.exists()) {
            throw new Error('Oportunidade não encontrada');
        }

        const currentData = currentDoc.data();

        // Preparar updates
        const updateData = {
            ...updates,
            updatedAt: serverTimestamp()
        };

        // Adicionar eventos ao timeline conforme necessário
        const newTimelineEvents = [];

        // Detectar mudança de estado
        if (updates.estado && updates.estado !== currentData.estado) {
            newTimelineEvents.push(
                createTimelineEvent(
                    TIMELINE_EVENT_TYPES.STATE_CHANGED,
                    `Estado alterado de ${currentData.estado} para ${updates.estado}`,
                    { estadoAnterior: currentData.estado, estadoNovo: updates.estado }
                )
            );

            // Se fechado com sucesso, registrar data de fecho
            if (updates.estado === OPPORTUNITY_STATES.CLOSED_WON) {
                updateData.dataFechoReal = Timestamp.now();
            }
        }

        // Detectar mudança de valor
        if (updates.valorEstimado && updates.valorEstimado !== currentData.valorEstimado) {
            newTimelineEvents.push(
                createTimelineEvent(
                    TIMELINE_EVENT_TYPES.VALUE_UPDATED,
                    `Valor atualizado de €${currentData.valorEstimado} para €${updates.valorEstimado}`,
                    { valorAnterior: currentData.valorEstimado, valorNovo: updates.valorEstimado }
                )
            );
        }

        // Adicionar novos eventos ao timeline existente
        if (newTimelineEvents.length > 0) {
            updateData.timeline = [...(currentData.timeline || []), ...newTimelineEvents];
        }

        // Atualizar métricas
        if (updateData.timeline) {
            updateData['metricas.numeroContactos'] = updateData.timeline.filter(
                e => e.tipo === TIMELINE_EVENT_TYPES.CONTACT_MADE
            ).length;
        }

        // Executar update
        await updateDoc(opportunityRef, updateData);

        // Retornar oportunidade atualizada
        const updatedDoc = await getDoc(opportunityRef);
        return {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };

    } catch (error) {
        console.error('OpportunityService: Erro ao atualizar oportunidade:', error);
        throw new Error(`Erro ao atualizar oportunidade: ${error.message}`);
    }
};

/**
 * Adicionar evento ao timeline
 */
export const addTimelineEvent = async (consultorId, clienteId, opportunityId, event) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

        const currentDoc = await getDoc(opportunityRef);
        if (!currentDoc.exists()) {
            throw new Error('Oportunidade não encontrada');
        }

        const currentData = currentDoc.data();
        const newEvent = createTimelineEvent(event.tipo, event.descricao, event.dados);

        await updateDoc(opportunityRef, {
            timeline: [...(currentData.timeline || []), newEvent],
            updatedAt: serverTimestamp()
        });

        return newEvent;

    } catch (error) {
        console.error('OpportunityService: Erro ao adicionar evento:', error);
        throw new Error(`Erro ao adicionar evento: ${error.message}`);
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Desativar oportunidade (soft delete)
 */
export const deactivateOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

        await updateDoc(opportunityRef, {
            isActive: false,
            deactivatedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, -1);

        return { success: true };

    } catch (error) {
        console.error('OpportunityService: Erro ao desativar oportunidade:', error);
        throw new Error(`Erro ao desativar oportunidade: ${error.message}`);
    }
};

/**
 * Deletar oportunidade permanentemente
 */
export const deleteOpportunity = async (consultorId, clienteId, opportunityId) => {
    try {
        const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);
        await deleteDoc(opportunityRef);

        // Atualizar contador no cliente
        await updateClientOpportunityCount(consultorId, clienteId, -1);

        return { success: true };

    } catch (error) {
        console.error('OpportunityService: Erro ao deletar oportunidade:', error);
        throw new Error(`Erro ao deletar oportunidade: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Atualizar múltiplas oportunidades
 */
export const batchUpdateOpportunities = async (consultorId, clienteId, updates) => {
    try {
        const batch = writeBatch(db);

        for (const update of updates) {
            const { opportunityId, ...updateData } = update;
            const opportunityRef = getOpportunityDoc(consultorId, clienteId, opportunityId);

            batch.update(opportunityRef, {
                ...updateData,
                updatedAt: serverTimestamp()
            });
        }

        await batch.commit();
        return { success: true, updatedCount: updates.length };

    } catch (error) {
        console.error('OpportunityService: Erro no batch update:', error);
        throw new Error(`Erro ao atualizar oportunidades: ${error.message}`);
    }
};

// ===== STATISTICS & ANALYTICS =====

/**
 * Obter estatísticas das oportunidades de um cliente
 */
export const getClientOpportunityStats = async (consultorId, clienteId) => {
    try {
        const { opportunities } = await listClientOpportunities(consultorId, clienteId, {
            pageSize: 1000 // Buscar todas
        });

        const stats = {
            total: opportunities.length,
            porTipo: {},
            porEstado: {},
            valorTotal: 0,
            comissaoEstimada: 0,
            taxaConversao: 0,
            tempoMedioPipeline: 0
        };

        // Calcular estatísticas
        opportunities.forEach(opp => {
            // Por tipo
            stats.porTipo[opp.tipo] = (stats.porTipo[opp.tipo] || 0) + 1;

            // Por estado
            stats.porEstado[opp.estado] = (stats.porEstado[opp.estado] || 0) + 1;

            // Valores
            stats.valorTotal += opp.valorEstimado || 0;
            stats.comissaoEstimada += opp.comissaoEstimada || 0;
        });

        // Taxa de conversão
        const fechadas = stats.porEstado[OPPORTUNITY_STATES.CLOSED_WON] || 0;
        const total = stats.total || 1;
        stats.taxaConversao = Math.round((fechadas / total) * 100);

        // Tempo médio no pipeline
        const tempoTotal = opportunities.reduce((acc, opp) => {
            return acc + (opp.diasEmPipeline || 0);
        }, 0);
        stats.tempoMedioPipeline = Math.round(tempoTotal / (total || 1));

        return stats;

    } catch (error) {
        console.error('OpportunityService: Erro ao calcular estatísticas:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

/**
 * Obter estatísticas globais do consultor
 */
export const getConsultorOpportunityStats = async (consultorId) => {
    try {
        const { opportunities } = await listAllOpportunities(consultorId, {
            pageSize: 1000 // Buscar todas
        });

        const stats = {
            total: opportunities.length,
            abertas: 0,
            fechadasGanhas: 0,
            fechadasPerdidas: 0,
            valorTotalPipeline: 0,
            valorTotalFechado: 0,
            comissaoEstimada: 0,
            comissaoRealizada: 0,
            taxaConversao: 0,
            oportunidadesPorCliente: {},
            topClientes: []
        };

        // Calcular estatísticas
        opportunities.forEach(opp => {
            // Estados
            if (opp.estado === OPPORTUNITY_STATES.CLOSED_WON) {
                stats.fechadasGanhas++;
                stats.valorTotalFechado += opp.valorEstimado || 0;
                stats.comissaoRealizada += opp.comissaoEstimada || 0;
            } else if (opp.estado === OPPORTUNITY_STATES.CLOSED_LOST) {
                stats.fechadasPerdidas++;
            } else {
                stats.abertas++;
                stats.valorTotalPipeline += opp.valorEstimado || 0;
                stats.comissaoEstimada += opp.comissaoEstimada || 0;
            }

            // Por cliente
            if (!stats.oportunidadesPorCliente[opp.clienteId]) {
                stats.oportunidadesPorCliente[opp.clienteId] = {
                    nome: opp.clienteNome,
                    total: 0,
                    valor: 0
                };
            }
            stats.oportunidadesPorCliente[opp.clienteId].total++;
            stats.oportunidadesPorCliente[opp.clienteId].valor += opp.valorEstimado || 0;
        });

        // Taxa de conversão
        const totalFechadas = stats.fechadasGanhas + stats.fechadasPerdidas;
        if (totalFechadas > 0) {
            stats.taxaConversao = Math.round((stats.fechadasGanhas / totalFechadas) * 100);
        }

        // Top clientes
        stats.topClientes = Object.values(stats.oportunidadesPorCliente)
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 5);

        return stats;

    } catch (error) {
        console.error('OpportunityService: Erro ao calcular estatísticas globais:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

// ===== HELPER FUNCTIONS PRIVADAS =====

/**
 * Atualizar contador de oportunidades no cliente
 */
const updateClientOpportunityCount = async (consultorId, clienteId, increment) => {
    try {
        const clientRef = doc(db, CONSULTOR_COLLECTION, consultorId, CLIENTS_COLLECTION, clienteId);
        const clientDoc = await getDoc(clientRef);

        if (clientDoc.exists()) {
            const currentCount = clientDoc.data().opportunityCount || 0;
            await updateDoc(clientRef, {
                opportunityCount: currentCount + increment,
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('OpportunityService: Erro ao atualizar contador do cliente:', error);
        // Não lançar erro para não interromper a operação principal
    }
};