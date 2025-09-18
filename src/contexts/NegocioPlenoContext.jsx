/**
 * CONTEXT DO NEGÓCIO PLENO
 * Gestão de estado para negócios plenos
 * Caminho: src/contexts/NegocioPlenoContext.jsx
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';
import negocioPlenoService from '../services/negocioPlenoService';
import { linkOpportunities, unlinkOpportunities } from '../services/opportunityService';
import { NEGOCIO_PLENO_STATES } from '../models/negocioPlenoModel';

// ===== CONTEXT =====
const NegocioPlenoContext = createContext();

// ===== ESTADO INICIAL =====
const initialState = {
    // Lista de negócios plenos
    negociosPlenos: [],

    // Negócio pleno atual
    currentNegocioPleno: null,

    // Estados de carregamento
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        fetch: false,
        stats: false,
        tasks: false,
        documents: false
    },

    // Erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        fetch: null,
        stats: null,
        tasks: null,
        documents: null
    },

    // Estatísticas
    stats: {
        total: 0,
        porEstado: {},
        valorTotal: 0,
        comissaoTotal: 0,
        negociosConcluidos: 0,
        negociosAtivos: 0,
        taxaConversao: 0
    },

    // Filtros
    filters: {
        estado: null,
        consultorId: null,
        search: '',
        dataInicio: null,
        dataFim: null
    },

    // Paginação
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    }
};

// ===== TIPOS DE AÇÕES =====
const ActionTypes = {
    // Loading e Errors
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Negócios Plenos
    SET_NEGOCIOS_PLENOS: 'SET_NEGOCIOS_PLENOS',
    ADD_NEGOCIO_PLENO: 'ADD_NEGOCIO_PLENO',
    UPDATE_NEGOCIO_PLENO: 'UPDATE_NEGOCIO_PLENO',
    REMOVE_NEGOCIO_PLENO: 'REMOVE_NEGOCIO_PLENO',
    SET_CURRENT_NEGOCIO_PLENO: 'SET_CURRENT_NEGOCIO_PLENO',

    // Stats
    SET_STATS: 'SET_STATS',

    // Filters e Pagination
    SET_FILTERS: 'SET_FILTERS',
    SET_PAGINATION: 'SET_PAGINATION',
    RESET_FILTERS: 'RESET_FILTERS',

    // Timeline
    ADD_TIMELINE_EVENT: 'ADD_TIMELINE_EVENT',

    // Tasks
    ADD_TASK: 'ADD_TASK',
    UPDATE_TASK: 'UPDATE_TASK',

    // Documents
    ADD_DOCUMENT: 'ADD_DOCUMENT',

    // Reset
    RESET_STATE: 'RESET_STATE'
};

// ===== REDUCER =====
function negocioPlenoReducer(state, action) {
    switch (action.type) {
        // Loading e Errors
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.payload.type]: action.payload.value
                }
            };

        case ActionTypes.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.type]: action.payload.error
                }
            };

        case ActionTypes.CLEAR_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.type]: null
                }
            };

        // Negócios Plenos
        case ActionTypes.SET_NEGOCIOS_PLENOS:
            return {
                ...state,
                negociosPlenos: action.payload.negociosPlenos,
                pagination: action.payload.pagination || state.pagination
            };

        case ActionTypes.ADD_NEGOCIO_PLENO:
            return {
                ...state,
                negociosPlenos: [action.payload, ...state.negociosPlenos]
            };

        case ActionTypes.UPDATE_NEGOCIO_PLENO:
            return {
                ...state,
                negociosPlenos: state.negociosPlenos.map(np =>
                    np.id === action.payload.id ? action.payload : np
                ),
                currentNegocioPleno: state.currentNegocioPleno?.id === action.payload.id
                    ? action.payload
                    : state.currentNegocioPleno
            };

        case ActionTypes.REMOVE_NEGOCIO_PLENO:
            return {
                ...state,
                negociosPlenos: state.negociosPlenos.filter(np => np.id !== action.payload),
                currentNegocioPleno: state.currentNegocioPleno?.id === action.payload
                    ? null
                    : state.currentNegocioPleno
            };

        case ActionTypes.SET_CURRENT_NEGOCIO_PLENO:
            return {
                ...state,
                currentNegocioPleno: action.payload
            };

        // Stats
        case ActionTypes.SET_STATS:
            return {
                ...state,
                stats: action.payload
            };

        // Filters e Pagination
        case ActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };

        case ActionTypes.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.payload
                }
            };

        case ActionTypes.RESET_FILTERS:
            return {
                ...state,
                filters: initialState.filters
            };

        // Timeline
        case ActionTypes.ADD_TIMELINE_EVENT:
            if (!state.currentNegocioPleno) return state;
            return {
                ...state,
                currentNegocioPleno: {
                    ...state.currentNegocioPleno,
                    timeline: [
                        ...(state.currentNegocioPleno.timeline || []),
                        action.payload
                    ]
                }
            };

        // Tasks
        case ActionTypes.ADD_TASK:
            if (!state.currentNegocioPleno) return state;
            return {
                ...state,
                currentNegocioPleno: {
                    ...state.currentNegocioPleno,
                    tarefas: [
                        ...(state.currentNegocioPleno.tarefas || []),
                        action.payload
                    ]
                }
            };

        case ActionTypes.UPDATE_TASK:
            if (!state.currentNegocioPleno) return state;
            return {
                ...state,
                currentNegocioPleno: {
                    ...state.currentNegocioPleno,
                    tarefas: state.currentNegocioPleno.tarefas.map(task =>
                        task.id === action.payload.id ? action.payload : task
                    )
                }
            };

        // Documents
        case ActionTypes.ADD_DOCUMENT:
            if (!state.currentNegocioPleno) return state;
            return {
                ...state,
                currentNegocioPleno: {
                    ...state.currentNegocioPleno,
                    documentacao: {
                        ...state.currentNegocioPleno.documentacao,
                        outrosDocumentos: [
                            ...(state.currentNegocioPleno.documentacao?.outrosDocumentos || []),
                            action.payload
                        ]
                    }
                }
            };

        // Reset
        case ActionTypes.RESET_STATE:
            return initialState;

        default:
            return state;
    }
}

// ===== PROVIDER =====
export function NegocioPlenoProvider({ children }) {
    const [state, dispatch] = useReducer(negocioPlenoReducer, initialState);
    const { currentUser } = useAuth();

    // ===== HELPER FUNCTIONS =====
    const setLoading = useCallback((type, value) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { type, value } });
    }, []);

    const setError = useCallback((type, error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { type, error } });
    }, []);

    const clearError = useCallback((type) => {
        dispatch({ type: ActionTypes.CLEAR_ERROR, payload: { type } });
    }, []);

    // Helper function para labels de status
    const getStatusLabel = (status) => {
        const labels = {
            'linked': 'Linkado',
            'negotiation': 'Em Negociação',
            'proposal': 'Proposta',
            'accepted': 'Aceite',
            'cpcv_signed': 'CPCV Assinado',
            'deed_scheduled': 'Escritura Agendada',
            'completed': 'Concluído',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    };

    // ===== CRIAR NEGÓCIO PLENO =====
    const createNegocioPleno = useCallback(async (oportunidadeVendedora, oportunidadeCompradora) => {
        try {
            setLoading('create', true);
            clearError('create');

            const negocioPleno = await linkOpportunities(
                oportunidadeVendedora,
                oportunidadeCompradora,
                currentUser.uid
            );

            dispatch({ type: ActionTypes.ADD_NEGOCIO_PLENO, payload: negocioPleno });

            return negocioPleno;
        } catch (error) {
            console.error('Context: Erro ao criar negócio pleno:', error);
            setError('create', error.message);
            throw error;
        } finally {
            setLoading('create', false);
        }
    }, [currentUser]);

    // ===== BUSCAR NEGÓCIO PLENO =====
    const fetchNegocioPleno = useCallback(async (negocioPlenoId) => {
        try {
            setLoading('fetch', true);
            clearError('fetch');

            const negocioPleno = await negocioPlenoService.fetchNegocioPleno(negocioPlenoId);

            dispatch({
                type: ActionTypes.SET_CURRENT_NEGOCIO_PLENO,
                payload: negocioPleno
            });

            return negocioPleno;
        } catch (error) {
            console.error('Context: Erro ao buscar negócio pleno:', error);
            setError('fetch', error.message);
            throw error;
        } finally {
            setLoading('fetch', false);
        }
    }, []);

    // ===== BUSCAR NEGÓCIO PLENO POR OPORTUNIDADE =====
    const fetchNegocioPlenoByOpportunity = useCallback(async (opportunityId) => {
        try {
            setLoading('fetch', true);
            clearError('fetch');

            const negocioPleno = await negocioPlenoService.fetchNegocioPlenoByOpportunity(opportunityId);

            if (negocioPleno) {
                dispatch({
                    type: ActionTypes.SET_CURRENT_NEGOCIO_PLENO,
                    payload: negocioPleno
                });
            }

            return negocioPleno;
        } catch (error) {
            console.error('Context: Erro ao buscar negócio pleno por oportunidade:', error);
            setError('fetch', error.message);
            return null;
        } finally {
            setLoading('fetch', false);
        }
    }, []);

    // ===== LISTAR NEGÓCIOS PLENOS =====
    const fetchAllNegociosPlenos = useCallback(async (filters = {}) => {
        try {
            setLoading('list', true);
            clearError('list');

            const negociosPlenos = await negocioPlenoService.fetchAllNegociosPlenos({
                ...filters,
                consultorId: filters.consultorId || currentUser?.uid
            });

            dispatch({
                type: ActionTypes.SET_NEGOCIOS_PLENOS,
                payload: {
                    negociosPlenos,
                    pagination: {
                        total: negociosPlenos.length,
                        totalPages: Math.ceil(negociosPlenos.length / state.pagination.limit)
                    }
                }
            });

            return negociosPlenos;
        } catch (error) {
            console.error('Context: Erro ao listar negócios plenos:', error);
            setError('list', error.message);
            return [];
        } finally {
            setLoading('list', false);
        }
    }, [currentUser, state.pagination.limit]);

    // ===== BUSCAR ESTATÍSTICAS PARA O DASHBOARD =====
    const fetchNegocioPlenoStats = useCallback(async (consultorId) => {
        try {
            const userId = consultorId || currentUser?.uid;
            if (!userId) {
                return {
                    total: 0,
                    emProgresso: 0,
                    concluidos: 0,
                    valorTotal: 0,
                    taxaConversao: 0,
                    ultimosNegocios: []
                };
            }

            const stats = await negocioPlenoService.fetchNegocioPlenoStats(userId);

            // Buscar últimos 3 negócios para o dashboard
            const negocios = await negocioPlenoService.fetchAllNegociosPlenos({
                consultorId: userId
            });

            const ultimosNegocios = negocios.slice(0, 3).map(n => ({
                id: n.id,
                compradorNome: n.oportunidades?.compradora?.clienteNome || 'N/D',
                vendedorNome: n.oportunidades?.vendedora?.clienteNome || 'N/D',
                valorAcordado: n.valores?.valorAcordado || 0,
                status: n.estado || 'linked',
                statusLabel: getStatusLabel(n.estado)
            }));

            return {
                total: stats.total || 0,
                emProgresso: stats.negociosAtivos || 0,
                concluidos: stats.negociosConcluidos || 0,
                valorTotal: stats.valorTotal || 0,
                taxaConversao: stats.taxaConversao || 0,
                ultimosNegocios
            };
        } catch (error) {
            console.error('Erro ao buscar stats:', error);
            return {
                total: 0,
                emProgresso: 0,
                concluidos: 0,
                valorTotal: 0,
                taxaConversao: 0,
                ultimosNegocios: []
            };
        }
    }, [currentUser]);

    // ===== BUSCAR NEGÓCIOS PLENOS DE UM CLIENTE =====
    const fetchClientNegociosPlenos = useCallback(async (clienteId) => {
        try {
            if (!currentUser?.uid || !clienteId) {
                return [];
            }

            const negocios = await negocioPlenoService.fetchAllNegociosPlenos();

            // Filtrar por cliente
            return negocios.filter(n =>
                n.oportunidades?.compradora?.clienteId === clienteId ||
                n.oportunidades?.vendedora?.clienteId === clienteId
            ).map(n => ({
                id: n.id,
                tipo: n.oportunidades?.compradora?.clienteId === clienteId ? 'comprador' : 'vendedor',
                compradorNome: n.oportunidades?.compradora?.clienteNome || 'N/D',
                vendedorNome: n.oportunidades?.vendedora?.clienteNome || 'N/D',
                valores: n.valores || {},
                imovel: n.imovel || {},
                status: n.estado || 'linked',
                createdAt: n.createdAt
            }));
        } catch (error) {
            console.error('Erro ao buscar negócios do cliente:', error);
            return [];
        }
    }, [currentUser]);

    // ===== ATUALIZAR NEGÓCIO PLENO =====
    const updateNegocioPleno = useCallback(async (negocioPlenoId, updates) => {
        try {
            setLoading('update', true);
            clearError('update');

            const updatedNegocio = await negocioPlenoService.updateNegocioPleno(
                negocioPlenoId,
                updates,
                currentUser.uid
            );

            dispatch({
                type: ActionTypes.UPDATE_NEGOCIO_PLENO,
                payload: updatedNegocio
            });

            return updatedNegocio;
        } catch (error) {
            console.error('Context: Erro ao atualizar negócio pleno:', error);
            setError('update', error.message);
            throw error;
        } finally {
            setLoading('update', false);
        }
    }, [currentUser]);

    // ===== ATUALIZAR STATUS DO NEGÓCIO PLENO =====
    const updateNegocioPlenoStatus = useCallback(async (negocioPlenoId, newStatus, additionalData = {}) => {
        return updateNegocioPleno(negocioPlenoId, {
            estado: newStatus,
            ...additionalData
        });
    }, [updateNegocioPleno]);

    // ===== AVANÇAR ESTADO =====
    const advanceState = useCallback(async (negocioPlenoId, newState) => {
        try {
            setLoading('update', true);
            clearError('update');

            const updates = {
                estado: newState
            };

            // Adicionar dados específicos baseado no novo estado
            switch (newState) {
                case NEGOCIO_PLENO_STATES.CPCV_SIGNED:
                    if (!state.currentNegocioPleno?.valores?.sinal) {
                        throw new Error('Defina o valor do sinal antes de marcar CPCV como assinado');
                    }
                    updates.cpcv = {
                        ...state.currentNegocioPleno.cpcv,
                        estado: 'assinado',
                        dataAssinatura: new Date()
                    };
                    break;

                case NEGOCIO_PLENO_STATES.DEED_SCHEDULED:
                    if (!state.currentNegocioPleno?.escritura?.dataAgendada) {
                        throw new Error('Agende a escritura antes de avançar');
                    }
                    updates.escritura = {
                        ...state.currentNegocioPleno.escritura,
                        estado: 'agendada'
                    };
                    break;

                case NEGOCIO_PLENO_STATES.COMPLETED:
                    updates.escritura = {
                        ...state.currentNegocioPleno.escritura,
                        estado: 'realizada',
                        dataRealizada: new Date()
                    };
                    break;
            }

            return await updateNegocioPleno(negocioPlenoId, updates);
        } catch (error) {
            console.error('Context: Erro ao avançar estado:', error);
            setError('update', error.message);
            throw error;
        } finally {
            setLoading('update', false);
        }
    }, [state.currentNegocioPleno, updateNegocioPleno]);

    // ===== DESLINKAR NEGÓCIO PLENO =====
    const unlinkNegocioPleno = useCallback(async (negocioPlenoId, motivo = '') => {
        try {
            setLoading('delete', true);
            clearError('delete');

            await unlinkOpportunities(negocioPlenoId, currentUser.uid, motivo);

            dispatch({
                type: ActionTypes.REMOVE_NEGOCIO_PLENO,
                payload: negocioPlenoId
            });

            return true;
        } catch (error) {
            console.error('Context: Erro ao deslinkar negócio pleno:', error);
            setError('delete', error.message);
            throw error;
        } finally {
            setLoading('delete', false);
        }
    }, [currentUser]);

    // ===== ADICIONAR TAREFA =====
    const addTask = useCallback(async (negocioPlenoId, task) => {
        try {
            setLoading('tasks', true);
            clearError('tasks');

            const newTask = await negocioPlenoService.addTaskToNegocioPleno(
                negocioPlenoId,
                task,
                currentUser.uid
            );

            dispatch({
                type: ActionTypes.ADD_TASK,
                payload: newTask
            });

            return newTask;
        } catch (error) {
            console.error('Context: Erro ao adicionar tarefa:', error);
            setError('tasks', error.message);
            throw error;
        } finally {
            setLoading('tasks', false);
        }
    }, [currentUser]);

    // ===== ATUALIZAR TAREFA =====
    const updateTask = useCallback(async (negocioPlenoId, taskId, updates) => {
        try {
            setLoading('tasks', true);
            clearError('tasks');

            const updatedTask = await negocioPlenoService.updateTaskInNegocioPleno(
                negocioPlenoId,
                taskId,
                updates,
                currentUser.uid
            );

            dispatch({
                type: ActionTypes.UPDATE_TASK,
                payload: updatedTask
            });

            return updatedTask;
        } catch (error) {
            console.error('Context: Erro ao atualizar tarefa:', error);
            setError('tasks', error.message);
            throw error;
        } finally {
            setLoading('tasks', false);
        }
    }, [currentUser]);

    // ===== ADICIONAR DOCUMENTO =====
    const addDocument = useCallback(async (negocioPlenoId, documento) => {
        try {
            setLoading('documents', true);
            clearError('documents');

            const newDoc = await negocioPlenoService.addDocumentToNegocioPleno(
                negocioPlenoId,
                documento,
                currentUser.uid
            );

            dispatch({
                type: ActionTypes.ADD_DOCUMENT,
                payload: newDoc
            });

            return newDoc;
        } catch (error) {
            console.error('Context: Erro ao adicionar documento:', error);
            setError('documents', error.message);
            throw error;
        } finally {
            setLoading('documents', false);
        }
    }, [currentUser]);

    // ===== BUSCAR ESTATÍSTICAS =====
    const fetchStats = useCallback(async () => {
        try {
            setLoading('stats', true);
            clearError('stats');

            const stats = await negocioPlenoService.fetchNegocioPlenoStats(currentUser.uid);

            dispatch({
                type: ActionTypes.SET_STATS,
                payload: stats
            });

            return stats;
        } catch (error) {
            console.error('Context: Erro ao buscar estatísticas:', error);
            setError('stats', error.message);
            return null;
        } finally {
            setLoading('stats', false);
        }
    }, [currentUser]);

    // ===== SUBSCREVER A MUDANÇAS =====
    const subscribeToNegocioPleno = useCallback((negocioPlenoId) => {
        return negocioPlenoService.subscribeToNegocioPleno(negocioPlenoId, (negocioPleno, error) => {
            if (error) {
                setError('fetch', error.message);
            } else if (negocioPleno) {
                dispatch({
                    type: ActionTypes.UPDATE_NEGOCIO_PLENO,
                    payload: negocioPleno
                });
            }
        });
    }, []);

    // ===== FILTROS E PAGINAÇÃO =====
    const setFilters = useCallback((filters) => {
        dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    }, []);

    const setPagination = useCallback((pagination) => {
        dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination });
    }, []);

    const resetFilters = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_FILTERS });
    }, []);

    // ===== RESET =====
    const resetState = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_STATE });
    }, []);

    // ===== VALUE DO CONTEXT =====
    const value = {
        // Estado
        ...state,

        // Ações principais
        createNegocioPleno,
        fetchNegocioPleno,
        fetchNegocioPlenoByOpportunity,
        fetchAllNegociosPlenos,
        updateNegocioPleno,
        updateNegocioPlenoStatus,
        advanceState,
        unlinkNegocioPleno,

        // Funções para Dashboard e ClientDetail
        fetchNegocioPlenoStats,
        fetchClientNegociosPlenos,

        // Tarefas
        addTask,
        updateTask,

        // Documentos
        addDocument,

        // Estatísticas
        fetchStats,

        // Subscrição
        subscribeToNegocioPleno,

        // Filtros e Paginação
        setFilters,
        setPagination,
        resetFilters,

        // Utils
        resetState,
        clearError,
        getStatusLabel
    };

    return (
        <NegocioPlenoContext.Provider value={value}>
            {children}
        </NegocioPlenoContext.Provider>
    );
}

// ===== HOOK =====
export function useNegocioPleno() {
    const context = useContext(NegocioPlenoContext);

    if (!context) {
        throw new Error('useNegocioPleno deve ser usado dentro de NegocioPlenoProvider');
    }

    return context;
}

export default NegocioPlenoContext;