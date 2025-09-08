/**
 * CLIENT SERVICE - MyImoMatePro CORRIGIDO
 * CRUD completo para gestão de clientes no Firestore
 * ESTRUTURA CORRETA: consultores/{consultorId}/clientes/{clienteId}
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
import { createClientSchema, validateClientData } from '../models/clientModel';

// ===== CONFIGURAÇÕES CORRIGIDAS =====
const COLLECTION_NAME = 'clientes';
const CONSULTOR_COLLECTION = 'consultores';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS CORRIGIDAS =====
const getClientCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getClientDoc = (consultorId, clientId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, clientId);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar novo cliente
 * @param {string} consultorId - ID do consultor
 * @param {Object} clientData - Dados do cliente
 * @returns {Promise<Object>} Cliente criado com ID
 */
export const createClient = async (consultorId, clientData) => {
    try {
        console.log('🆕 ClientService: Criando cliente...', { consultorId, clientName: clientData.name });

        // Validar dados antes de criar
        const validation = validateClientData(clientData);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
        }

        // Criar schema com consultorId
        const clientSchema = createClientSchema(clientData);
        clientSchema.consultorId = consultorId;

        // ✅ CORREÇÃO CRÍTICA: FORÇAR isActive = true
        clientSchema.isActive = true;

        // Calcular rendimento total do agregado se tiver rendimentos
        if (clientSchema.financial.monthlyIncome || clientSchema.financial.spouseMonthlyIncome) {
            const monthly = parseFloat(clientSchema.financial.monthlyIncome) || 0;
            const spouseMonthly = parseFloat(clientSchema.financial.spouseMonthlyIncome) || 0;
            clientSchema.financial.totalHouseholdIncome = (monthly + spouseMonthly).toString();
        }

        // ✅ DEBUG: Log do schema antes de gravar
        console.log('🔍 DEBUG - Schema a ser gravado:', {
            id: 'será_gerado_pelo_firestore',
            name: clientSchema.name,
            isActive: clientSchema.isActive,
            consultorId: clientSchema.consultorId,
            createdAt: clientSchema.createdAt
        });

        // Adicionar ao Firestore na estrutura correta
        const clientRef = await addDoc(getClientCollection(consultorId), clientSchema);

        // Buscar cliente criado para retornar dados completos
        const createdClient = await getDoc(clientRef);
        const clientWithId = {
            id: createdClient.id,
            ...createdClient.data()
        };

        // ✅ DEBUG: Log do cliente criado
        console.log('✅ Cliente criado - Verificação:', {
            id: clientWithId.id,
            name: clientWithId.name,
            isActive: clientWithId.isActive,
            consultorId: clientWithId.consultorId
        });

        console.log('✅ ClientService: Cliente criado com sucesso', { clientId: clientWithId.id });
        return clientWithId;

    } catch (error) {
        console.error('❌ ClientService: Erro ao criar cliente:', error);
        throw new Error(`Erro ao criar cliente: ${error.message}`);
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar cliente por ID
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @returns {Promise<Object|null>} Cliente ou null se não encontrado
 */
export const getClient = async (consultorId, clientId) => {
    try {
        console.log('🔍 ClientService: Buscando cliente...', { consultorId, clientId });

        const clientDoc = await getDoc(getClientDoc(consultorId, clientId));

        if (!clientDoc.exists()) {
            console.log('⚠️ ClientService: Cliente não encontrado');
            return null;
        }

        const client = {
            id: clientDoc.id,
            ...clientDoc.data()
        };

        console.log('✅ ClientService: Cliente encontrado', { clientId: client.id, clientName: client.name });
        return client;

    } catch (error) {
        console.error('❌ ClientService: Erro ao buscar cliente:', error);
        throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
};

/**
 * Listar todos os clientes do consultor com paginação
 * @param {string} consultorId - ID do consultor
 * @param {Object} options - Opções de busca (page, pageSize, orderBy, filters)
 * @returns {Promise<Object>} Lista de clientes com metadados de paginação
 */
export const listClients = async (consultorId, options = {}) => {
    try {
        const {
            page = 1,
            pageSize = DEFAULT_PAGE_SIZE,
            orderField = 'createdAt',
            orderDirection = 'desc',
            lastDoc = null,
            filters = {}
        } = options;

        console.log('📋 ClientService: Listando clientes...', {
            consultorId,
            page,
            pageSize,
            orderField,
            filters
        });

        let clientQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            orderBy(orderField, orderDirection),
            limit(pageSize)
        );

        // Aplicar filtros adicionais
        if (filters.tag && filters.tag !== 'all') {
            clientQuery = query(
                clientQuery,
                where('tags', 'array-contains', filters.tag)
            );
        }

        if (filters.maritalStatus && filters.maritalStatus !== 'all') {
            clientQuery = query(
                clientQuery,
                where('maritalStatus', '==', filters.maritalStatus)
            );
        }

        // Paginação
        if (lastDoc) {
            clientQuery = query(clientQuery, startAfter(lastDoc));
        }

        const snapshot = await getDocs(clientQuery);

        const clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const hasMore = snapshot.docs.length === pageSize;
        const lastDocument = snapshot.docs[snapshot.docs.length - 1];

        console.log('✅ ClientService: Clientes listados', {
            count: clients.length,
            hasMore
        });

        return {
            clients,
            pagination: {
                page,
                pageSize,
                hasMore,
                lastDoc: lastDocument,
                total: null // Seria necessário uma query separada para contar total
            }
        };

    } catch (error) {
        console.error('❌ ClientService: Erro ao listar clientes:', error);
        throw new Error(`Erro ao listar clientes: ${error.message}`);
    }
};

/**
 * Buscar clientes por texto (nome, email, telefone)
 * @param {string} consultorId - ID do consultor
 * @param {string} searchTerm - Termo de busca
 * @param {number} maxResults - Máximo de resultados
 * @returns {Promise<Array>} Lista de clientes encontrados
 */
export const searchClients = async (consultorId, searchTerm, maxResults = 10) => {
    try {
        console.log('🔎 ClientService: Buscando clientes por termo...', { consultorId, searchTerm });

        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const searchTermLower = searchTerm.toLowerCase().trim();

        // Buscar por nome (aproximado)
        const nameQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            orderBy('name'),
            limit(maxResults)
        );

        const snapshot = await getDocs(nameQuery);

        // Filtrar resultados que contenham o termo de busca
        const clients = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(client => {
                const name = (client.name || '').toLowerCase();
                const email = (client.email || '').toLowerCase();
                const phone = (client.phone || '').replace(/\s/g, '');
                const searchPhone = searchTermLower.replace(/\s/g, '');

                return name.includes(searchTermLower) ||
                    email.includes(searchTermLower) ||
                    phone.includes(searchPhone);
            })
            .slice(0, maxResults);

        console.log('✅ ClientService: Busca concluída', { found: clients.length });
        return clients;

    } catch (error) {
        console.error('❌ ClientService: Erro na busca de clientes:', error);
        throw new Error(`Erro na busca: ${error.message}`);
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar cliente existente
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @param {Object} updateData - Dados para atualizar
 * @returns {Promise<Object>} Cliente atualizado
 */
export const updateClient = async (consultorId, clientId, updateData) => {
    try {
        console.log('✏️ ClientService: Atualizando cliente...', { consultorId, clientId });

        // Validar dados se fornecidos campos críticos
        if (updateData.name || updateData.phone || updateData.email) {
            const validation = validateClientData({ ...updateData });
            if (!validation.isValid) {
                throw new Error(`Dados inválidos: ${JSON.stringify(validation.errors)}`);
            }
        }

        // Preparar dados de atualização
        const updatePayload = {
            ...updateData,
            updatedAt: Timestamp.now()
        };

        // Recalcular rendimento total se necessário
        if (updateData.financial?.monthlyIncome !== undefined ||
            updateData.financial?.spouseMonthlyIncome !== undefined) {

            // Buscar dados atuais para calcular
            const currentClient = await getClient(consultorId, clientId);
            if (currentClient) {
                const monthly = parseFloat(updateData.financial?.monthlyIncome ?? currentClient.financial?.monthlyIncome ?? 0);
                const spouseMonthly = parseFloat(updateData.financial?.spouseMonthlyIncome ?? currentClient.financial?.spouseMonthlyIncome ?? 0);

                if (!updatePayload.financial) updatePayload.financial = {};
                updatePayload.financial.totalHouseholdIncome = (monthly + spouseMonthly).toString();
            }
        }

        // Atualizar no Firestore
        await updateDoc(getClientDoc(consultorId, clientId), updatePayload);

        // Buscar cliente atualizado
        const updatedClient = await getClient(consultorId, clientId);

        console.log('✅ ClientService: Cliente atualizado com sucesso');
        return updatedClient;

    } catch (error) {
        console.error('❌ ClientService: Erro ao atualizar cliente:', error);
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }
};

/**
 * Atualizar apenas tags do cliente
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @param {Array} tags - Nova lista de tags
 * @returns {Promise<Object>} Cliente atualizado
 */
export const updateClientTags = async (consultorId, clientId, tags) => {
    try {
        console.log('🏷️ ClientService: Atualizando tags do cliente...', { clientId, tags });

        await updateDoc(getClientDoc(consultorId, clientId), {
            tags: tags || [],
            updatedAt: Timestamp.now()
        });

        const updatedClient = await getClient(consultorId, clientId);
        console.log('✅ ClientService: Tags atualizadas com sucesso');
        return updatedClient;

    } catch (error) {
        console.error('❌ ClientService: Erro ao atualizar tags:', error);
        throw new Error(`Erro ao atualizar tags: ${error.message}`);
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Desativar cliente (soft delete)
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @returns {Promise<boolean>} Sucesso da operação
 */
export const deactivateClient = async (consultorId, clientId) => {
    try {
        console.log('🗑️ ClientService: Desativando cliente...', { consultorId, clientId });

        await updateDoc(getClientDoc(consultorId, clientId), {
            isActive: false,
            deactivatedAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        console.log('✅ ClientService: Cliente desativado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao desativar cliente:', error);
        throw new Error(`Erro ao desativar cliente: ${error.message}`);
    }
};

/**
 * Reativar cliente
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @returns {Promise<boolean>} Sucesso da operação
 */
export const reactivateClient = async (consultorId, clientId) => {
    try {
        console.log('♻️ ClientService: Reativando cliente...', { consultorId, clientId });

        await updateDoc(getClientDoc(consultorId, clientId), {
            isActive: true,
            deactivatedAt: null,
            updatedAt: Timestamp.now()
        });

        console.log('✅ ClientService: Cliente reativado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao reativar cliente:', error);
        throw new Error(`Erro ao reativar cliente: ${error.message}`);
    }
};

/**
 * Deletar cliente permanentemente (use com cuidado)
 * @param {string} consultorId - ID do consultor
 * @param {string} clientId - ID do cliente
 * @returns {Promise<boolean>} Sucesso da operação
 */
export const deleteClient = async (consultorId, clientId) => {
    try {
        console.log('🔥 ClientService: DELETANDO cliente permanentemente...', { consultorId, clientId });

        // TODO: Verificar se cliente tem leads/oportunidades antes de deletar
        // TODO: Implementar cascade delete para subcoleções

        await deleteDoc(getClientDoc(consultorId, clientId));

        console.log('✅ ClientService: Cliente deletado permanentemente');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao deletar cliente:', error);
        throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Operações em lote para múltiplos clientes
 * @param {string} consultorId - ID do consultor
 * @param {Array} operations - Lista de operações [{type, clientId, data}]
 * @returns {Promise<boolean>} Sucesso da operação
 */
export const batchUpdateClients = async (consultorId, operations) => {
    try {
        console.log('📦 ClientService: Executando operações em lote...', {
            consultorId,
            operationCount: operations.length
        });

        const batch = writeBatch(db);

        operations.forEach(operation => {
            const { type, clientId, data } = operation;
            const clientRef = getClientDoc(consultorId, clientId);

            switch (type) {
                case 'update':
                    batch.update(clientRef, { ...data, updatedAt: Timestamp.now() });
                    break;
                case 'deactivate':
                    batch.update(clientRef, {
                        isActive: false,
                        deactivatedAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    });
                    break;
                case 'reactivate':
                    batch.update(clientRef, {
                        isActive: true,
                        deactivatedAt: null,
                        updatedAt: Timestamp.now()
                    });
                    break;
                default:
                    console.warn('⚠️ Tipo de operação não reconhecido:', type);
            }
        });

        await batch.commit();

        console.log('✅ ClientService: Operações em lote executadas com sucesso');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro nas operações em lote:', error);
        throw new Error(`Erro nas operações em lote: ${error.message}`);
    }
};

// ===== STATISTICS =====

/**
 * Buscar estatísticas dos clientes do consultor
 * @param {string} consultorId - ID do consultor
 * @returns {Promise<Object>} Estatísticas dos clientes
 */
export const getClientStats = async (consultorId) => {
    try {
        console.log('📊 ClientService: Calculando estatísticas...', { consultorId });

        // Buscar todos os clientes ativos
        const activeQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true)
        );

        const activeSnapshot = await getDocs(activeQuery);
        const activeClients = activeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calcular estatísticas
        const stats = {
            total: activeClients.length,
            withEmail: activeClients.filter(c => c.email).length,
            withFinancialInfo: activeClients.filter(c => c.financial?.monthlyIncome).length,
            married: activeClients.filter(c => ['married', 'union'].includes(c.maritalStatus)).length,
            vipClients: activeClients.filter(c => c.tags?.includes('VIP')).length,
            urgentClients: activeClients.filter(c => c.tags?.includes('Urgente')).length,
            byContactPreference: {
                phone: activeClients.filter(c => c.contactPreference === 'phone').length,
                email: activeClients.filter(c => c.contactPreference === 'email').length,
                whatsapp: activeClients.filter(c => c.contactPreference === 'whatsapp').length,
                any: activeClients.filter(c => c.contactPreference === 'any').length
            },
            byMaritalStatus: {
                single: activeClients.filter(c => c.maritalStatus === 'single').length,
                married: activeClients.filter(c => c.maritalStatus === 'married').length,
                union: activeClients.filter(c => c.maritalStatus === 'union').length,
                divorced: activeClients.filter(c => c.maritalStatus === 'divorced').length,
                widowed: activeClients.filter(c => c.maritalStatus === 'widowed').length
            }
        };

        console.log('✅ ClientService: Estatísticas calculadas', stats);
        return stats;

    } catch (error) {
        console.error('❌ ClientService: Erro ao calcular estatísticas:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};