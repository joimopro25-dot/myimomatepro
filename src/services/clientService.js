/**
 * CLIENT SERVICE - MyImoMatePro
 * CRUD completo para gestão de clientes no Firestore
 * ✅ VERSÃO LIMPA - Console logs de debug removidos
 * 
 * Caminho: src/services/clientService.js
 * Alteração: Limpeza completa dos logs de debug, mantendo apenas console.error
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

        return clientWithId;

    } catch (error) {
        console.error('ClientService: Erro ao criar cliente:', error);
        throw new Error(`Erro ao criar cliente: ${error.message}`);
    }
};

// ===== READ OPERATIONS =====

/**
 * Buscar cliente por ID
 */
export const getClient = async (consultorId, clientId) => {
    try {
        const clientDoc = await getDoc(getClientDoc(consultorId, clientId));

        if (!clientDoc.exists()) {
            return null;
        }

        const client = {
            id: clientDoc.id,
            ...clientDoc.data()
        };

        return client;

    } catch (error) {
        console.error('ClientService: Erro ao buscar cliente:', error);
        throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }
};

/**
 * Listar todos os clientes do consultor com paginação
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

        // Primeira tentativa: Query com where clause para clientes ativos
        let clientQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            limit(pageSize * 2)
        );

        let snapshot = await getDocs(clientQuery);

        // Segunda tentativa: Se não encontrar, buscar todos os clientes
        if (snapshot.empty) {
            clientQuery = query(
                getClientCollection(consultorId),
                limit(pageSize * 2)
            );
            snapshot = await getDocs(clientQuery);
        }

        // Terceira tentativa: Debug da estrutura da coleção
        if (snapshot.empty) {
            const collectionRef = getClientCollection(consultorId);
            const allDocsSnapshot = await getDocs(collectionRef);

            if (!allDocsSnapshot.empty) {
                console.warn('ClientService: Clientes encontrados mas sem campo isActive correto');
            }
        }

        // Mapeamento seguro dos documentos
        const clients = [];
        snapshot.forEach((doc) => {
            const docId = doc.id;
            const docData = doc.data();

            if (docData && docId) {
                // Separar docData de id para evitar sobrescrita
                const { id: docDataId, ...restOfDocData } = docData;

                const client = {
                    id: docId, // Sempre usar o ID do documento Firebase
                    ...restOfDocData
                };

                clients.push(client);
            }
        });

        // Aplicar filtros manuais se necessário
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
            filteredClients = filteredClients.filter(client => {
                const hasFinancial = !!(client.financial?.monthlyIncome ||
                    client.financial?.spouseMonthlyIncome ||
                    client.financial?.totalHouseholdIncome);
                return hasFinancialFilter ? hasFinancial : !hasFinancial;
            });
        }

        // Paginação manual
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedClients = filteredClients.slice(startIndex, endIndex);
        const hasMore = endIndex < filteredClients.length;

        return {
            clients: paginatedClients,
            pagination: {
                page,
                pageSize,
                hasMore,
                lastDoc: null,
                total: filteredClients.length
            }
        };

    } catch (error) {
        console.error('ClientService: Erro ao listar clientes:', error);
        throw new Error(`Erro ao listar clientes: ${error.message}`);
    }
};

/**
 * Buscar clientes por texto (nome, email, telefone)
 */
export const searchClients = async (consultorId, searchTerm, maxResults = 10) => {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const searchTermLower = searchTerm.toLowerCase().trim();

        // Buscar todos os clientes ativos e filtrar manualmente
        const allClientsQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            limit(50)
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

        return results;

    } catch (error) {
        console.error('ClientService: Erro na busca:', error);
        throw new Error(`Erro na busca: ${error.message}`);
    }
};

// ===== UPDATE OPERATIONS =====

/**
 * Atualizar cliente
 */
export const updateClient = async (consultorId, clientId, updates) => {
    try {
        const updateData = {
            ...updates,
            updatedAt: Timestamp.now()
        };

        await updateDoc(getClientDoc(consultorId, clientId), updateData);
        return true;

    } catch (error) {
        console.error('ClientService: Erro ao atualizar cliente:', error);
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }
};

/**
 * Atualizar tags do cliente
 */
export const updateClientTags = async (consultorId, clientId, tags) => {
    try {
        await updateDoc(getClientDoc(consultorId, clientId), {
            tags,
            updatedAt: Timestamp.now()
        });

        return true;

    } catch (error) {
        console.error('ClientService: Erro ao atualizar tags:', error);
        throw new Error(`Erro ao atualizar tags: ${error.message}`);
    }
};

// ===== DELETE OPERATIONS =====

/**
 * Desativar cliente (soft delete)
 */
export const deactivateClient = async (consultorId, clientId) => {
    try {
        await updateDoc(getClientDoc(consultorId, clientId), {
            isActive: false,
            deactivatedAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        return true;

    } catch (error) {
        console.error('ClientService: Erro ao desativar cliente:', error);
        throw new Error(`Erro ao desativar cliente: ${error.message}`);
    }
};

/**
 * Reativar cliente
 */
export const reactivateClient = async (consultorId, clientId) => {
    try {
        await updateDoc(getClientDoc(consultorId, clientId), {
            isActive: true,
            deactivatedAt: null,
            updatedAt: Timestamp.now()
        });

        return true;

    } catch (error) {
        console.error('ClientService: Erro ao reativar cliente:', error);
        throw new Error(`Erro ao reativar cliente: ${error.message}`);
    }
};

/**
 * Deletar cliente permanentemente
 */
export const deleteClient = async (consultorId, clientId) => {
    try {
        await deleteDoc(getClientDoc(consultorId, clientId));
        return true;

    } catch (error) {
        console.error('ClientService: Erro ao deletar cliente:', error);
        throw new Error(`Erro ao deletar cliente: ${error.message}`);
    }
};

// ===== STATISTICS =====

/**
 * Calcular estatísticas dos clientes
 */
export const getClientStats = async (consultorId) => {
    try {
        // Buscar todos os clientes ativos
        const activeQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true)
        );

        const activeSnapshot = await getDocs(activeQuery);

        const activeClients = [];
        activeSnapshot.forEach((doc) => {
            const docId = doc.id;
            const docData = doc.data();

            if (docId && docData) {
                activeClients.push({
                    id: docId,
                    ...docData
                });
            }
        });

        // Calcular estatísticas
        const stats = {
            total: activeClients.length,
            withEmail: activeClients.filter(c => !!c.email).length,
            withFinancialInfo: activeClients.filter(c =>
                !!(c.financial?.monthlyIncome || c.financial?.spouseMonthlyIncome)
            ).length,
            byMaritalStatus: {},
            byTag: {},
            avgAge: 0,
            lastUpdated: new Date().toISOString()
        };

        // Contar por estado civil
        activeClients.forEach(client => {
            const status = client.maritalStatus || 'não_especificado';
            stats.byMaritalStatus[status] = (stats.byMaritalStatus[status] || 0) + 1;
        });

        // Contar por tags
        activeClients.forEach(client => {
            if (client.tags && Array.isArray(client.tags)) {
                client.tags.forEach(tag => {
                    stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
                });
            }
        });

        // Calcular idade média
        const clientsWithAge = activeClients.filter(client => client.birthDate);
        if (clientsWithAge.length > 0) {
            const totalAge = clientsWithAge.reduce((sum, client) => {
                const age = new Date().getFullYear() - new Date(client.birthDate).getFullYear();
                return sum + age;
            }, 0);
            stats.avgAge = Math.round(totalAge / clientsWithAge.length);
        }

        return stats;

    } catch (error) {
        console.error('ClientService: Erro ao calcular estatísticas:', error);
        throw new Error(`Erro ao calcular estatísticas: ${error.message}`);
    }
};

// ===== BATCH OPERATIONS =====

/**
 * Operações em lote para múltiplos clientes
 */
export const batchUpdateClients = async (consultorId, updates) => {
    try {
        const batch = writeBatch(db);

        updates.forEach(({ clientId, data }) => {
            const clientRef = getClientDoc(consultorId, clientId);
            batch.update(clientRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
        });

        await batch.commit();
        return true;

    } catch (error) {
        console.error('ClientService: Erro na operação em lote:', error);
        throw new Error(`Erro na operação em lote: ${error.message}`);
    }
};