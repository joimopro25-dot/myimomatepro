/**
 * CLIENT CONTEXT - MyImoMatePro CORRIGIDO
 * Estado global para gestão de clientes com React Context
 * ESTRUTURA CORRETA: consultores/{consultorId}/clientes/{clienteId}
 * CORREÇÃO: Resolvido erro "isActive is not defined" e completadas funções
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    createClient,
    getClient,
    listClients,
    searchClients,
    updateClient,
    updateClientTags,
    deactivateClient,
    reactivateClient,
    deleteClient,
    batchUpdateClients,
    getClientStats
} from '../services/clientService';

// ===== CONTEXTO =====
const ClientContext = createContext();

// ===== HOOK PERSONALIZADO =====
export function useClients() {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClients deve ser usado dentro de ClientProvider');
    }
    return context;
}

// ===== ESTADO INICIAL =====
const initialState = {
    // Dados
    clients: [],
    currentClient: null,
    stats: null,

    // Paginação
    pagination: {
        page: 1,
        pageSize: 20,
        hasMore: false,
        lastDoc: null,
        total: null
    },

    // Filtros e busca
    filters: {
        tag: 'all',
        maritalStatus: 'all',
        hasEmail: 'all',
        hasFinancialInfo: 'all'
    },
    searchTerm: '',
    searchResults: [],

    // Estados de loading
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        search: false,
        stats: false,
        current: false
    },

    // Gestão de erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        search: null,
        stats: null,
        current: null
    },

    // Cache
    cache: {
        lastFetch: null,
        invalidateAfter: 5 * 60 * 1000 // 5 minutos
    }
};

// ===== ACTIONS =====
const ClientActionTypes = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // CRUD operations
    SET_CLIENTS: 'SET_CLIENTS',
    ADD_CLIENT: 'ADD_CLIENT',
    UPDATE_CLIENT: 'UPDATE_CLIENT',
    REMOVE_CLIENT: 'REMOVE_CLIENT',
    SET_CURRENT_CLIENT: 'SET_CURRENT_CLIENT',
    CLEAR_CURRENT_CLIENT: 'CLEAR_CURRENT_CLIENT',

    // Search and filters
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    SET_FILTERS: 'SET_FILTERS',
    CLEAR_SEARCH: 'CLEAR_SEARCH',

    // Pagination
    SET_PAGINATION: 'SET_PAGINATION',
    APPEND_CLIENTS: 'APPEND_CLIENTS',

    // Statistics
    SET_STATS: 'SET_STATS',

    // Cache
    UPDATE_CACHE: 'UPDATE_CACHE',
    INVALIDATE_CACHE: 'INVALIDATE_CACHE'
};

// ===== REDUCER =====
function clientReducer(state, action) {
    switch (action.type) {
        case ClientActionTypes.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.operation]: action.isLoading
                }
            };

        case ClientActionTypes.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.operation]: action.error
                },
                loading: {
                    ...state.loading,
                    [action.operation]: false
                }
            };

        case ClientActionTypes.CLEAR_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.operation]: null
                }
            };

        case ClientActionTypes.SET_CLIENTS:
            return {
                ...state,
                clients: action.clients,
                pagination: action.pagination || state.pagination,
                loading: { ...state.loading, list: false },
                cache: { ...state.cache, lastFetch: Date.now() }
            };

        case ClientActionTypes.APPEND_CLIENTS:
            return {
                ...state,
                clients: [...state.clients, ...action.clients],
                pagination: action.pagination || state.pagination,
                loading: { ...state.loading, list: false }
            };

        case ClientActionTypes.ADD_CLIENT:
            return {
                ...state,
                clients: [action.client, ...state.clients],
                loading: { ...state.loading, create: false }
            };

        case ClientActionTypes.UPDATE_CLIENT:
            return {
                ...state,
                clients: state.clients.map(client =>
                    client.id === action.client.id ? action.client : client
                ),
                currentClient: state.currentClient?.id === action.client.id
                    ? action.client
                    : state.currentClient,
                loading: { ...state.loading, update: false }
            };

        case ClientActionTypes.REMOVE_CLIENT:
            return {
                ...state,
                clients: state.clients.filter(client => client.id !== action.clientId),
                currentClient: state.currentClient?.id === action.clientId
                    ? null
                    : state.currentClient,
                loading: { ...state.loading, delete: false }
            };

        case ClientActionTypes.SET_CURRENT_CLIENT:
            return {
                ...state,
                currentClient: action.client,
                loading: { ...state.loading, current: false }
            };

        case ClientActionTypes.CLEAR_CURRENT_CLIENT:
            return {
                ...state,
                currentClient: null
            };

        case ClientActionTypes.SET_SEARCH_TERM:
            return {
                ...state,
                searchTerm: action.term,
                searchResults: action.term === '' ? [] : state.searchResults
            };

        case ClientActionTypes.SET_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.results,
                loading: { ...state.loading, search: false }
            };

        case ClientActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.filters }
            };

        case ClientActionTypes.CLEAR_SEARCH:
            return {
                ...state,
                searchTerm: '',
                searchResults: []
            };

        case ClientActionTypes.SET_PAGINATION:
            return {
                ...state,
                pagination: { ...state.pagination, ...action.pagination }
            };

        case ClientActionTypes.SET_STATS:
            return {
                ...state,
                stats: action.stats,
                loading: { ...state.loading, stats: false }
            };

        case ClientActionTypes.UPDATE_CACHE:
            return {
                ...state,
                cache: { ...state.cache, lastFetch: Date.now() }
            };

        case ClientActionTypes.INVALIDATE_CACHE:
            return {
                ...state,
                cache: { ...state.cache, lastFetch: null }
            };

        default:
            return state;
    }
}

// ===== PROVIDER =====
export function ClientProvider({ children }) {
    const [state, dispatch] = useReducer(clientReducer, initialState);
    const { currentUser } = useAuth();

    // CORREÇÃO: Usar consultorId em vez de tenantId
    const consultorId = currentUser?.uid;

    // ===== HELPER FUNCTIONS =====
    const setLoading = useCallback((operation, isLoading) => {
        dispatch({ type: ClientActionTypes.SET_LOADING, operation, isLoading });
    }, []);

    const setError = useCallback((operation, error) => {
        dispatch({ type: ClientActionTypes.SET_ERROR, operation, error });
    }, []);

    const clearError = useCallback((operation) => {
        dispatch({ type: ClientActionTypes.CLEAR_ERROR, operation });
    }, []);

    // ===== DERIVED STATE =====
    const isSearching = state.searchTerm.length > 0;
    const hasSearchResults = state.searchResults.length > 0;

    // ===== CRUD ACTIONS =====

    /**
     * Criar novo cliente
     */
    const createNewClient = useCallback(async (clientData) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('create', true);
            clearError('create');

            console.log('ClientContext: Criando cliente...', { clientName: clientData.name });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const newClient = await createClient(consultorId, clientData);

            dispatch({ type: ClientActionTypes.ADD_CLIENT, client: newClient });

            // Invalidar cache de estatísticas
            dispatch({ type: ClientActionTypes.INVALIDATE_CACHE });

            console.log('ClientContext: Cliente criado com sucesso', { clientId: newClient.id });
            return newClient;

        } catch (error) {
            console.error('ClientContext: Erro ao criar cliente:', error);
            setError('create', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Buscar cliente por ID
     */
    const fetchClient = useCallback(async (clientId) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('current', true);
            clearError('current');

            console.log('ClientContext: Buscando cliente...', { clientId });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const client = await getClient(consultorId, clientId);

            dispatch({ type: ClientActionTypes.SET_CURRENT_CLIENT, client });

            console.log('ClientContext: Cliente carregado', { clientId: client?.id });
            return client;

        } catch (error) {
            console.error('ClientContext: Erro ao buscar cliente:', error);
            setError('current', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Listar clientes com filtros
     */
    const fetchClients = useCallback(async (options = {}) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            const shouldLoadMore = options.loadMore || false;

            if (!shouldLoadMore) {
                setLoading('list', true);
                clearError('list');
            }

            console.log('ClientContext: Listando clientes...', { options });

            const queryOptions = {
                page: shouldLoadMore ? state.pagination.page + 1 : 1,
                pageSize: state.pagination.pageSize,
                lastDoc: shouldLoadMore ? state.pagination.lastDoc : null,
                filters: state.filters,
                ...options
            };

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const result = await listClients(consultorId, queryOptions);

            if (shouldLoadMore) {
                dispatch({
                    type: ClientActionTypes.APPEND_CLIENTS,
                    clients: result.clients,
                    pagination: result.pagination
                });
            } else {
                dispatch({
                    type: ClientActionTypes.SET_CLIENTS,
                    clients: result.clients,
                    pagination: result.pagination
                });
            }

            console.log('ClientContext: Clientes carregados', {
                count: result.clients.length,
                hasMore: result.pagination.hasMore
            });

            return result;

        } catch (error) {
            console.error('ClientContext: Erro ao listar clientes:', error);
            setError('list', error.message);
            throw error;
        }
    }, [consultorId, state.pagination, state.filters, setLoading, clearError, setError]);

    /**
     * Buscar clientes
     */
    const searchClientsList = useCallback(async (searchTerm, options = {}) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        if (!searchTerm.trim()) {
            dispatch({ type: ClientActionTypes.CLEAR_SEARCH });
            return [];
        }

        try {
            setLoading('search', true);
            clearError('search');

            console.log('ClientContext: Buscando clientes...', { searchTerm });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const results = await searchClients(consultorId, searchTerm, options);

            dispatch({ type: ClientActionTypes.SET_SEARCH_RESULTS, results });

            console.log('ClientContext: Busca concluída', { found: results.length });
            return results;

        } catch (error) {
            console.error('ClientContext: Erro na busca:', error);
            setError('search', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Atualizar cliente
     */
    const updateExistingClient = useCallback(async (clientId, updateData) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('update', true);
            clearError('update');

            console.log('ClientContext: Atualizando cliente...', { clientId });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const updatedClient = await updateClient(consultorId, clientId, updateData);

            dispatch({ type: ClientActionTypes.UPDATE_CLIENT, client: updatedClient });

            console.log('ClientContext: Cliente atualizado', { clientId });
            return updatedClient;

        } catch (error) {
            console.error('ClientContext: Erro ao atualizar cliente:', error);
            setError('update', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Atualizar tags do cliente
     */
    const updateClientTagsList = useCallback(async (clientId, tags) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            console.log('ClientContext: Atualizando tags...', { clientId, tags });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const updatedClient = await updateClientTags(consultorId, clientId, tags);

            dispatch({ type: ClientActionTypes.UPDATE_CLIENT, client: updatedClient });

            console.log('ClientContext: Tags atualizadas', { clientId });
            return updatedClient;

        } catch (error) {
            console.error('ClientContext: Erro ao atualizar tags:', error);
            throw error;
        }
    }, [consultorId]);

    /**
     * Desativar cliente
     */
    const deactivateExistingClient = useCallback(async (clientId) => {
        if (!consultorId) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('delete', true);
            clearError('delete');

            console.log('ClientContext: Desativando cliente...', { clientId });

            // CORREÇÃO: Passar consultorId em vez de tenantId
            await deactivateClient(consultorId, clientId);

            dispatch({ type: ClientActionTypes.REMOVE_CLIENT, clientId });

            console.log('ClientContext: Cliente desativado', { clientId });
            return true;

        } catch (error) {
            console.error('ClientContext: Erro ao desativar cliente:', error);
            setError('delete', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Buscar estatísticas
     */
    const fetchClientStats = useCallback(async () => {
        if (!consultorId) {
            return null;
        }

        try {
            setLoading('stats', true);
            clearError('stats');

            console.log('ClientContext: Carregando estatísticas...');

            // CORREÇÃO: Passar consultorId em vez de tenantId
            const stats = await getClientStats(consultorId);

            dispatch({ type: ClientActionTypes.SET_STATS, stats });

            console.log('ClientContext: Estatísticas carregadas', { stats });
            return stats;

        } catch (error) {
            console.error('ClientContext: Erro ao carregar estatísticas:', error);
            setError('stats', error.message);
            throw error;
        }
    }, [consultorId, setLoading, clearError, setError]);

    /**
     * Definir termo de busca
     */
    const setSearchTerm = useCallback((term) => {
        dispatch({ type: ClientActionTypes.SET_SEARCH_TERM, term });

        // Auto-busca se tiver mais de 2 caracteres
        if (term.length > 2) {
            searchClientsList(term);
        } else if (term === '') {
            dispatch({ type: ClientActionTypes.CLEAR_SEARCH });
        }
    }, [searchClientsList]);

    /**
     * Definir filtros
     */
    const setFilters = useCallback((newFilters) => {
        dispatch({ type: ClientActionTypes.SET_FILTERS, filters: newFilters });

        // Recarregar lista se necessário
        if (state.clients.length > 0) {
            fetchClients({ reload: true });
        }
    }, [fetchClients, state.clients.length]);

    /**
     * Limpar busca
     */
    const clearSearch = useCallback(() => {
        dispatch({ type: ClientActionTypes.CLEAR_SEARCH });
    }, []);

    /**
     * Limpar cliente atual
     */
    const clearCurrentClient = useCallback(() => {
        dispatch({ type: ClientActionTypes.CLEAR_CURRENT_CLIENT });
    }, []);

    // ===== VALORES DO CONTEXTO =====
    const value = {
        // Estado
        clients: state.clients,
        currentClient: state.currentClient,
        stats: state.stats,
        loading: state.loading,
        errors: state.errors,
        pagination: state.pagination,
        filters: state.filters,
        searchTerm: state.searchTerm,
        searchResults: state.searchResults,

        // Estado derivado
        isSearching,
        hasSearchResults,

        // Actions
        createClient: createNewClient,
        fetchClient,
        fetchClients,
        searchClients: searchClientsList,
        updateClient: updateExistingClient,
        updateClientTags: updateClientTagsList,
        deactivateClient: deactivateExistingClient,
        fetchStats: fetchClientStats,
        setSearchTerm,
        setFilters,
        clearSearch,
        clearCurrentClient,
        clearError
    };

    return (
        <ClientContext.Provider value={value}>
            {children}
        </ClientContext.Provider>
    );
}