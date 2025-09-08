/**
 * CLIENT SERVICE - MyImoMatePro CORRIGIDO
 * CRUD completo para gestão de clientes no Firestore
 * CORREÇÃO: Problema dos clientes não aparecerem na lista
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
 * PROBLEMA IDENTIFICADO: Query Firestore pode estar falhando
 * SOLUÇÃO: Debug completo + fallback para buscar todos os clientes
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

        // ✅ PRIMEIRA TENTATIVA: Query com where clause
        console.log('🔍 Tentativa 1: Query com isActive = true');
        let clientQuery = query(
            getClientCollection(consultorId),
            where('isActive', '==', true),
            limit(pageSize * 2) // Buscar mais para ter margem após filtros
        );

        let snapshot = await getDocs(clientQuery);
        console.log('📊 Snapshot results (isActive=true):', {
            empty: snapshot.empty,
            size: snapshot.size,
            docs: snapshot.docs.length
        });

        // ✅ SEGUNDA TENTATIVA: Se não encontrar, buscar TODOS os clientes
        if (snapshot.empty) {
            console.log('⚠️ Nenhum cliente encontrado com isActive=true. Buscando todos...');
            clientQuery = query(
                getClientCollection(consultorId),
                limit(pageSize * 2)
            );
            snapshot = await getDocs(clientQuery);
            console.log('📊 Snapshot results (todos):', {
                empty: snapshot.empty,
                size: snapshot.size,
                docs: snapshot.docs.length
            });
        }

        // ✅ TERCEIRA TENTATIVA: Debug da estrutura da coleção
        if (snapshot.empty) {
            console.log('⚠️ Ainda vazio. Verificando estrutura da coleção...');
            const collectionRef = getClientCollection(consultorId);
            console.log('📁 Collection path:', collectionRef.path);

            // Tentar buscar sem filtros
            const allDocsSnapshot = await getDocs(collectionRef);
            console.log('📊 All docs in collection:', {
                empty: allDocsSnapshot.empty,
                size: allDocsSnapshot.size
            });

            if (!allDocsSnapshot.empty) {
                console.log('📝 Sample documents:');
                allDocsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
                    const data = doc.data();
                    console.log(`Doc ${index + 1}:`, {
                        id: doc.id,
                        name: data.name,
                        isActive: data.isActive,
                        hasData: !!data
                    });
                });
            }
        }

        // ✅ MAPEAMENTO SEGURO DOS DOCUMENTOS - CORREÇÃO FINAL PARA IDs NULL
        const clients = [];

        snapshot.forEach((doc) => {
            const docId = doc.id;
            const docData = doc.data();

            console.log('🔍 Debug documento raw (VERSÃO CORRIGIDA):', {
                docId,
                docIdType: typeof docId,
                docIdLength: docId?.length,
                hasData: !!docData,
                dataKeys: docData ? Object.keys(docData) : [],
                name: docData?.name,
                originalDocRef: doc
            });

            if (docData && docId) {
                // ✅ CORREÇÃO CRÍTICA: Usar o ID real do documento do Firebase
                const client = {
                    id: docId, // Firebase sempre gera um ID válido
                    ...docData
                };

                // ✅ Debug APÓS o mapeamento
                console.log('👤 Cliente processado (VERSÃO CORRIGIDA):', {
                    id: client.id,
                    idType: typeof client.id,
                    name: client.name,
                    isActive: client.isActive,
                    hasValidId: !!client.id,
                    docIdOriginal: docId,
                    clientKeys: Object.keys(client)
                });

                // ✅ VERIFICAÇÃO FINAL: Só adicionar se ID existir
                if (client.id && client.id.length > 0) {
                    clients.push(client);
                    console.log('✅ Cliente adicionado à lista:', client.name);
                } else {
                    console.error('❌ Cliente rejeitado - ID inválido:', {
                        client,
                        docId,
                        hasClientId: !!client.id
                    });
                }
            } else {
                console.warn('⚠️ Documento inválido ignorado:', {
                    docId,
                    hasData: !!docData,
                    docIdValid: !!docId
                });
            }
        });

        console.log('📋 RESULTADO MAPEAMENTO - Total de clientes válidos:', {
            totalMapped: clients.length,
            clientNames: clients.map(c => c.name),
            allClientsHaveIds: clients.every(c => !!c.id && c.id.length > 0)
        });

        // ✅ APLICAR FILTROS MANUALMENTE (só para clientes ativos)
        let filteredClients = clients.filter(client => client.isActive !== false);

        console.log('🔍 Clientes após filtro isActive:', filteredClients.length);

        if (filters.tag && filters.tag !== 'all') {
            filteredClients = filteredClients.filter(client =>
                client.tags && client.tags.includes(filters.tag)
            );
            console.log(`🔍 Clientes após filtro tag (${filters.tag}):`, filteredClients.length);
        }

        if (filters.maritalStatus && filters.maritalStatus !== 'all') {
            filteredClients = filteredClients.filter(client =>
                client.maritalStatus === filters.maritalStatus
            );
            console.log(`🔍 Clientes após filtro maritalStatus (${filters.maritalStatus}):`, filteredClients.length);
        }

        if (filters.hasEmail && filters.hasEmail !== 'all') {
            const hasEmailFilter = filters.hasEmail === 'true';
            filteredClients = filteredClients.filter(client =>
                hasEmailFilter ? !!client.email : !client.email
            );
            console.log(`🔍 Clientes após filtro hasEmail (${filters.hasEmail}):`, filteredClients.length);
        }

        if (filters.hasFinancialInfo && filters.hasFinancialInfo !== 'all') {
            const hasFinancialFilter = filters.hasFinancialInfo === 'true';
            filteredClients = filteredClients.filter(client =>
                hasFinancialFilter ? !!(client.financial && client.financial.monthlyIncome) :
                    !(client.financial && client.financial.monthlyIncome)
            );
            console.log(`🔍 Clientes após filtro hasFinancialInfo (${filters.hasFinancialInfo}):`, filteredClients.length);
        }

        // Ordenar manualmente
        if (orderField && filteredClients.length > 0) {
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

        // Aplicar paginação manual
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedClients = filteredClients.slice(startIndex, endIndex);
        const hasMore = endIndex < filteredClients.length;

        console.log('✅ ClientService: Clientes listados - RESULTADO FINAL', {
            totalFound: clients.length,
            filteredCount: filteredClients.length,
            paginatedCount: paginatedClients.length,
            hasMore,
            allIdsValid: paginatedClients.every(c => !!c.id),
            clientNames: paginatedClients.map(c => c.name)
        });

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
        console.error('❌ ClientService: Erro ao listar clientes:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
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
        console.log('📊 Stats snapshot:', {
            empty: activeSnapshot.empty,
            size: activeSnapshot.size,
            docs: activeSnapshot.docs.length
        });

        const activeClients = [];
        activeSnapshot.forEach((doc) => {
            const docId = doc.id;
            const docData = doc.data();

            console.log('📊 Stats doc:', {
                docId,
                hasData: !!docData,
                name: docData?.name
            });

            if (docId && docData) {
                activeClients.push({
                    id: docId, // ✅ CORREÇÃO: Usar docId do Firebase
                    ...docData
                });
            }
        });

        console.log('📊 Active clients processados:', {
            count: activeClients.length,
            allHaveIds: activeClients.every(c => !!c.id),
            sampleIds: activeClients.slice(0, 3).map(c => ({ id: c.id, name: c.name }))
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