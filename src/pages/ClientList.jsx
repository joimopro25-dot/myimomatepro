/**
 * CLIENT SERVICE - MyImoMatePro CORRIGIDO
 * CRUD completo para gestão de clientes no Firestore
 * CORREÇÃO: Problema dos IDs null nos clientes listados
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

// ===== CONFIGURAÇÕES =====
const COLLECTION_NAME = 'clientes';
const CONSULTOR_COLLECTION = 'consultores';
const DEFAULT_PAGE_SIZE = 20;

// ===== HELPER FUNCTIONS =====
const getClientCollection = (consultorId) => {
    return collection(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME);
};

const getClientDoc = (consultorId, clientId) => {
    return doc(db, CONSULTOR_COLLECTION, consultorId, COLLECTION_NAME, clientId);
};

// ===== CREATE OPERATIONS =====

/**
 * Criar novo cliente
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
        clientSchema.isActive = true;

        // Calcular rendimento total do agregado se tiver rendimentos
        if (clientSchema.financial.monthlyIncome || clientSchema.financial.spouseMonthlyIncome) {
            const monthly = parseFloat(clientSchema.financial.monthlyIncome) || 0;
            const spouseMonthly = parseFloat(clientSchema.financial.spouseMonthlyIncome) || 0;
            clientSchema.financial.totalHouseholdIncome = (monthly + spouseMonthly).toString();
        }

        // Adicionar ao Firestore na estrutura correta
        const clientRef = await addDoc(getClientCollection(consultorId), clientSchema);

        // Buscar cliente criado para retornar dados completos
        const createdClient = await getDoc(clientRef);
        const clientWithId = {
            id: createdClient.id,
            ...createdClient.data()
        };

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
 * ✅ FUNÇÃO CORRIGIDA: Listar todos os clientes do consultor com paginação
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

        // ✅ CORREÇÃO: Construir query de forma mais simples
        let clientQuery;

        try {
            // Query base simples
            clientQuery = query(
                getClientCollection(consultorId),
                where('isActive', '==', true)
            );

            // ✅ CORREÇÃO: Aplicar orderBy somente se não houver filtros conflituosos
            const hasComplexFilters = (filters.tag && filters.tag !== 'all') ||
                (filters.maritalStatus && filters.maritalStatus !== 'all');

            if (!hasComplexFilters) {
                clientQuery = query(clientQuery, orderBy(orderField, orderDirection));
            }

            // Aplicar limite
            clientQuery = query(clientQuery, limit(pageSize));

            // Paginação (apenas se tiver orderBy)
            if (lastDoc && !hasComplexFilters) {
                clientQuery = query(clientQuery, startAfter(lastDoc));
            }

            console.log('📋 ClientService: Query construída com sucesso');

        } catch (queryError) {
            console.error('❌ ClientService: Erro ao construir query:', queryError);
            // Query de fallback sem orderBy
            clientQuery = query(
                getClientCollection(consultorId),
                where('isActive', '==', true),
                limit(pageSize)
            );
            console.log('📋 ClientService: Usando query de fallback simples');
        }

        // Executar query
        const snapshot = await getDocs(clientQuery);

        // ✅ CORREÇÃO: Mapeamento com debug detalhado
        console.log('📋 ClientService: Snapshot recebido', {
            size: snapshot.size,
            empty: snapshot.empty
        });

        const clients = [];

        snapshot.forEach((doc) => {
            // ✅ DEBUG: Verificar cada documento individualmente
            const docId = doc.id;
            const docData = doc.data();

            console.log('📋 ClientService: Processando documento', {
                docId,
                hasData: !!docData,
                dataKeys: Object.keys(docData || {})
            });

            if (docId && docData) {
                const client = {
                    id: docId,
                    ...docData
                };

                // ✅ VERIFICAÇÃO FINAL: Garantir que o ID existe
                if (client.id) {
                    clients.push(client);
                    console.log('✅ ClientService: Cliente adicionado', {
                        id: client.id,
                        name: client.name
                    });
                } else {
                    console.error('❌ ClientService: Cliente sem ID válido', client);
                }
            } else {
                console.error('❌ ClientService: Documento inválido', { docId, hasData: !!docData });
            }
        });

        // ✅ APLICAR FILTROS MANUALMENTE (após buscar dados)
        let filteredClients = clients;

        if (filters.tag && filters.tag !== 'all') {
            filteredClients = filteredClients.filter(client =>
                client.tags && client.tags.includes(filters.tag)
            );
        }

        if (filters.maritalStatus && filters.maritalStatus !== 'all') {
            filteredClients = filteredClients.filter(client =>
                client.maritalStatus === filters.maritalStatus
            );
        }

        if (filters.hasEmail && filters.hasEmail !== 'all') {
            const hasEmailFilter = filters.hasEmail === 'true';
            filteredClients = filteredClients.filter(client =>
                hasEmailFilter ? !!client.email : !client.email
            );
        }

        if (filters.hasFinancialInfo && filters.hasFinancialInfo !== 'all') {
            const hasFinancialFilter = filters.hasFinancialInfo === 'true';
            filteredClients = filteredClients.filter(client =>
                hasFinancialFilter ? !!(client.financial && client.financial.monthlyIncome) :
                    !(client.financial && client.financial.monthlyIncome)
            );
        }

        // Ordenar manualmente se necessário
        if (hasComplexFilters && orderField) {
            filteredClients.sort((a, b) => {
                const aValue = a[orderField];
                const bValue = b[orderField];

                if (!aValue && !bValue) return 0;
                if (!aValue) return 1;
                if (!bValue) return -1;

                if (orderDirection === 'desc') {
                    return bValue > aValue ? 1 : -1;
                } else {
                    return aValue > bValue ? 1 : -1;
                }
            });
        }

        const hasMore = snapshot.docs.length === pageSize;
        const lastDocument = snapshot.docs[snapshot.docs.length - 1];

        console.log('✅ ClientService: Clientes listados', {
            totalFromQuery: clients.length,
            filteredCount: filteredClients.length,
            hasMore,
            allIdsValid: filteredClients.every(c => !!c.id)
        });

        // ✅ VERIFICAÇÃO FINAL: Garantir que todos os clientes têm ID
        const validClients = filteredClients.filter(client => client.id);

        if (validClients.length !== filteredClients.length) {
            console.error('❌ ClientService: Alguns clientes sem ID foram filtrados', {
                original: filteredClients.length,
                valid: validClients.length
            });
        }

        return {
            clients: validClients,
            pagination: {
                page,
                pageSize,
                hasMore,
                lastDoc: lastDocument,
                total: null
            }
        };

    } catch (error) {
        console.error('❌ ClientService: Erro ao listar clientes:', error);
        throw new Error(`Erro ao listar clientes: ${error.message}`);
    }
};

/**
 * Buscar clientes por texto (nome, email, telefone)
 */
export const searchClients = async (consultorId, searchTerm, maxResults = 10) => {
    try {
        console.log('🔎 ClientService: Buscando clientes por termo...', { consultorId, searchTerm });

        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const searchTermLower = searchTerm.toLowerCase().trim();

        // Buscar todos os clientes ativos e filtrar manualmente
        const allClientsQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            limit(50) // Limite razoável para busca
        );

        const snapshot = await getDocs(allClientsQuery);

        const clients = [];
        snapshot.forEach((doc) => {
            if (doc.id && doc.data()) {
                clients.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

        // Filtrar resultados que contenham o termo de busca
        const results = clients
            .filter(client => {
                const name = (client.name || '').toLowerCase();
                const email = (client.email || '').toLowerCase();
                const phone = (client.phone || '').toLowerCase();
                const nif = (client.nif || '').toLowerCase();

                return name.includes(searchTermLower) ||
                    email.includes(searchTermLower) ||
                    phone.includes(searchTermLower) ||
                    nif.includes(searchTermLower);
            })
            .slice(0, maxResults);

        console.log('✅ ClientService: Busca concluída', {
            totalResults: results.length,
            allIdsValid: results.every(c => !!c.id)
        });

        return results;

    } catch (error) {
        console.error('❌ ClientService: Erro na busca:', error);
        throw new Error(`Erro na busca: ${error.message}`);
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar cliente
 */
export const updateClient = async (consultorId, clientId, updates) => {
    try {
        console.log('📝 ClientService: Atualizando cliente...', { consultorId, clientId });

        const updateData = {
            ...updates,
            updatedAt: Timestamp.now()
        };

        await updateDoc(getClientDoc(consultorId, clientId), updateData);

        console.log('✅ ClientService: Cliente atualizado com sucesso');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao atualizar cliente:', error);
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }
};

/**
 * Atualizar tags do cliente
 */
export const updateClientTags = async (consultorId, clientId, tags) => {
    try {
        console.log('🏷️ ClientService: Atualizando tags...', { consultorId, clientId, tags });

        await updateDoc(getClientDoc(consultorId, clientId), {
            tags,
            updatedAt: Timestamp.now()
        });

        console.log('✅ ClientService: Tags atualizadas com sucesso');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao atualizar tags:', error);
        throw new Error(`Erro ao atualizar tags: ${error.message}`);
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Desativar cliente (soft delete)
 */
export const deactivateClient = async (consultorId, clientId) => {
    try {
        console.log('❌ ClientService: Desativando cliente...', { consultorId, clientId });

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
 * Deletar cliente permanentemente
 */
export const deleteClient = async (consultorId, clientId) => {
    try {
        console.log('🔥 ClientService: DELETANDO cliente permanentemente...', { consultorId, clientId });

        await deleteDoc(getClientDoc(consultorId, clientId));

        console.log('✅ ClientService: Cliente deletado permanentemente');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro ao deletar cliente:', error);
        throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
};

// ===== STATISTICS =====

/**
 * ✅ FUNÇÃO CORRIGIDA: Calcular estatísticas dos clientes
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

        const activeClients = [];
        activeSnapshot.forEach((doc) => {
            if (doc.id && doc.data()) {
                activeClients.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });

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

        console.log('✅ ClientService: Estatísticas calculadas', {
            total: stats.total,
            withValidIds: activeClients.every(c => !!c.id)
        });

        return stats;

    } catch (error) {
        console.error('❌ ClientService: Erro ao calcular estatísticas:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Operações em lote para múltiplos clientes
 */
export const batchUpdateClients = async (consultorId, updates) => {
    try {
        console.log('📦 ClientService: Iniciando operação em lote...', {
            consultorId,
            operationsCount: updates.length
        });

        const batch = writeBatch(db);

        updates.forEach(({ clientId, data }) => {
            const clientRef = getClientDoc(consultorId, clientId);
            batch.update(clientRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();

        console.log('✅ ClientService: Operação em lote concluída');
        return true;

    } catch (error) {
        console.error('❌ ClientService: Erro na operação em lote:', error);
        throw new Error(`Erro na operação em lote: ${error.message}`);
    }
};