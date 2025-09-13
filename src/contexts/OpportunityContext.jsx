/**
 * OPPORTUNITY CONTEXT - MyImoMatePro
 * Estado global para gestão de oportunidades com React Context
 * 
 * Caminho: src/contexts/OpportunityContext.jsx
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    createOpportunity,
    getOpportunity,
    listOpportunities,
    getOpportunitiesByType,
    updateOpportunity,
    changeOpportunityPhase,
    updateOpportunityStatus,
    deleteOpportunity,
    getOpportunityStats,
    batchUpdateOpportunities
} from '../services/opportunityService';

// ===== CONTEXTO =====
const OpportunityContext = createContext();

// ===== HOOK PERSONALIZADO =====
export function useOpportunities() {
    const context = useContext(OpportunityContext);
    if (!context) {
        throw new Error('useOpportunities deve ser usado dentro de OpportunityProvider');
    }
    return context;
}

// ===== ESTADO INICIAL =====
const initialState = {
    // Dados
    opportunities: [],
    currentOpportunity: null,
    stats: null,

    // Organização por tipo
    opportunitiesByType: {
        comprador: [],
        vendedor: [],
        investidor: [],
        senhorio: [],
        inquilino: []
    },

    // Paginação
    pagination: {
        page: 1,
        pageSize: 20,
        hasMore: false,
        lastDoc: null,
        total: null
    },

    // Filtros
    filters: {
        tipo: 'all',
        status: 'all',
        fase: 'all',
        clienteId: null,
        probabilidadeMin: 0
    },

    // View mode
    viewMode: 'cards', // cards, list, pipeline

    // Estados de loading
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        stats: false,
        current: false
    },

    // Gestão de erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        stats: null,
        current: null
    }
};

// ===== ACTIONS =====
const OpportunityActionTypes = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // CRUD operations
    SET_OPPORTUNITIES: 'SET_OPPORTUNITIES',
    ADD_OPPORTUNITY: 'ADD_OPPORTUNITY',
    UPDATE_OPPORTUNITY: 'UPDATE_OPPORTUNITY',
    REMOVE_OPPORTUNITY: 'REMOVE_OPPORTUNITY',
    SET_CURRENT_OPPORTUNITY: 'SET_CURRENT_OPPORTUNITY',
    CLEAR_CURRENT_OPPORTUNITY: 'CLEAR_CURRENT_OPPORTUNITY',

    // Organization
    SET_OPPORTUNITIES_BY_TYPE: 'SET_OPPORTUNITIES_BY_TYPE',
    UPDATE_TYPE_GROUP: 'UPDATE_TYPE_GROUP',

    // Filters and view
    SET_FILTERS: 'SET_FILTERS',
    SET_VIEW_MODE: 'SET_VIEW_MODE',

    // Pagination
    SET_PAGINATION: 'SET_PAGINATION',
    APPEND_OPPORTUNITIES: 'APPEND_OPPORTUNITIES',

    // Statistics
    SET_STATS: 'SET_STATS'
};

// ===== REDUCER =====
function opportunityReducer(state, action) {
    switch (action.type) {
        case OpportunityActionTypes.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.operation]: action.isLoading
                }
            };

        case OpportunityActionTypes.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.operation]: action.error
                }
            };

        case OpportunityActionTypes.CLEAR_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.operation]: null
                }
            };

        case OpportunityActionTypes.SET_OPPORTUNITIES:
            return {
                ...state,
                opportunities: action.opportunities
            };

        case OpportunityActionTypes.ADD_OPPORTUNITY:
            return {
                ...state,
                opportunities: [action.opportunity, ...state.opportunities],
                opportunitiesByType: {
                    ...state.opportunitiesByType,
                    [action.opportunity.tipo]: [
                        action.opportunity,
                        ...(state.opportunitiesByType[action.opportunity.tipo] || [])
                    ]
                }
            };

        case OpportunityActionTypes.UPDATE_OPPORTUNITY:
            return {
                ...state,
                opportunities: state.opportunities.map(opp =>
                    opp.id === action.opportunity.id ? action.opportunity : opp
                ),
                opportunitiesByType: {
                    ...state.opportunitiesByType,
                    [action.opportunity.tipo]: state.opportunitiesByType[action.opportunity.tipo]?.map(opp =>
                        opp.id === action.opportunity.id ? action.opportunity : opp
                    ) || []
                },
                currentOpportunity: state.currentOpportunity?.id === action.opportunity.id
                    ? action.opportunity
                    : state.currentOpportunity
            };

        case OpportunityActionTypes.REMOVE_OPPORTUNITY:
            const removedOpp = state.opportunities.find(o => o.id === action.opportunityId);
            return {
                ...state,
                opportunities: state.opportunities.filter(opp => opp.id !== action.opportunityId),
                opportunitiesByType: removedOpp ? {
                    ...state.opportunitiesByType,
                    [removedOpp.tipo]: state.opportunitiesByType[removedOpp.tipo]?.filter(
                        opp => opp.id !== action.opportunityId
                    ) || []
                } : state.opportunitiesByType
            };

        case OpportunityActionTypes.SET_CURRENT_OPPORTUNITY:
            return {
                ...state,
                currentOpportunity: action.opportunity
            };

        case OpportunityActionTypes.CLEAR_CURRENT_OPPORTUNITY:
            return {
                ...state,
                currentOpportunity: null
            };

        case OpportunityActionTypes.SET_OPPORTUNITIES_BY_TYPE:
            return {
                ...state,
                opportunitiesByType: action.opportunitiesByType
            };

        case OpportunityActionTypes.UPDATE_TYPE_GROUP:
            return {
                ...state,
                opportunitiesByType: {
                    ...state.opportunitiesByType,
                    [action.tipo]: action.opportunities
                }
            };

        case OpportunityActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.filters
                }
            };

        case OpportunityActionTypes.SET_VIEW_MODE:
            return {
                ...state,
                viewMode: action.viewMode
            };

        case OpportunityActionTypes.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.pagination
                }
            };

        case OpportunityActionTypes.APPEND_OPPORTUNITIES:
            return {
                ...state,
                opportunities: [...state.opportunities, ...action.opportunities]
            };

        case OpportunityActionTypes.SET_STATS:
            return {
                ...state,
                stats: action.stats
            };

        default:
            return state;
    }
}

// ===== PROVIDER COMPONENT =====
export function OpportunityProvider({ children }) {
    const [state, dispatch] = useReducer(opportunityReducer, initialState);
    const { currentUser } = useAuth();

    // ===== HELPER FUNCTIONS =====

    const setLoading = (operation, isLoading) => {
        dispatch({ type: OpportunityActionTypes.SET_LOADING, operation, isLoading });
    };

    const setError = (operation, error) => {
        dispatch({ type: OpportunityActionTypes.SET_ERROR, operation, error });
    };

    const clearError = (operation) => {
        dispatch({ type: OpportunityActionTypes.CLEAR_ERROR, operation });
    };

    // ===== CRUD OPERATIONS =====

    /**
     * Criar nova oportunidade
     */
    const createNewOpportunity = useCallback(async (opportunityData) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('create', true);
        clearError('create');

        try {
            const result = await createOpportunity(currentUser.uid, opportunityData);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.ADD_OPPORTUNITY,
                    opportunity: result.data
                });
            } else {
                setError('create', result.error);
            }

            return result;
        } catch (error) {
            setError('create', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('create', false);
        }
    }, [currentUser]);

    /**
     * Buscar oportunidade por ID
     */
    const fetchOpportunity = useCallback(async (opportunityId) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('current', true);
        clearError('current');

        try {
            const result = await getOpportunity(currentUser.uid, opportunityId);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.SET_CURRENT_OPPORTUNITY,
                    opportunity: result.data
                });
            } else {
                setError('current', result.error);
            }

            return result;
        } catch (error) {
            setError('current', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('current', false);
        }
    }, [currentUser]);

    /**
     * Listar oportunidades
     */
    const fetchOpportunities = useCallback(async (filters = {}, append = false) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('list', true);
        clearError('list');

        try {
            const result = await listOpportunities(
                currentUser.uid,
                { ...state.filters, ...filters },
                state.pagination
            );

            if (result.success) {
                if (append) {
                    dispatch({
                        type: OpportunityActionTypes.APPEND_OPPORTUNITIES,
                        opportunities: result.data
                    });
                } else {
                    dispatch({
                        type: OpportunityActionTypes.SET_OPPORTUNITIES,
                        opportunities: result.data
                    });
                }

                // Atualizar paginação
                dispatch({
                    type: OpportunityActionTypes.SET_PAGINATION,
                    pagination: {
                        hasMore: result.hasMore,
                        lastDoc: result.lastDoc
                    }
                });

                // Organizar por tipo
                const byType = {
                    comprador: [],
                    vendedor: [],
                    investidor: [],
                    senhorio: [],
                    inquilino: []
                };

                result.data.forEach(opp => {
                    if (byType[opp.tipo]) {
                        byType[opp.tipo].push(opp);
                    }
                });

                dispatch({
                    type: OpportunityActionTypes.SET_OPPORTUNITIES_BY_TYPE,
                    opportunitiesByType: byType
                });
            } else {
                setError('list', result.error);
            }

            return result;
        } catch (error) {
            setError('list', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('list', false);
        }
    }, [currentUser, state.filters, state.pagination]);

    /**
     * Buscar oportunidades por tipo
     */
    const fetchOpportunitiesByType = useCallback(async (tipo) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('list', true);
        clearError('list');

        try {
            const result = await getOpportunitiesByType(currentUser.uid, tipo);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.UPDATE_TYPE_GROUP,
                    tipo,
                    opportunities: result.data
                });
            } else {
                setError('list', result.error);
            }

            return result;
        } catch (error) {
            setError('list', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('list', false);
        }
    }, [currentUser]);

    /**
     * Atualizar oportunidade
     */
    const updateExistingOpportunity = useCallback(async (opportunityId, updateData) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('update', true);
        clearError('update');

        try {
            const result = await updateOpportunity(currentUser.uid, opportunityId, updateData);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.UPDATE_OPPORTUNITY,
                    opportunity: result.data
                });
            } else {
                setError('update', result.error);
            }

            return result;
        } catch (error) {
            setError('update', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('update', false);
        }
    }, [currentUser]);

    /**
     * Mudar fase da oportunidade
     */
    const changePhase = useCallback(async (opportunityId, novaFase, notas = '') => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('update', true);
        clearError('update');

        try {
            const result = await changeOpportunityPhase(
                currentUser.uid,
                opportunityId,
                novaFase,
                notas
            );

            if (result.success) {
                // Recarregar oportunidade atualizada
                await fetchOpportunity(opportunityId);
            } else {
                setError('update', result.error);
            }

            return result;
        } catch (error) {
            setError('update', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('update', false);
        }
    }, [currentUser, fetchOpportunity]);

    /**
     * Atualizar status da oportunidade
     */
    const changeStatus = useCallback(async (opportunityId, novoStatus, motivoPerda = '') => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('update', true);
        clearError('update');

        try {
            const result = await updateOpportunityStatus(
                currentUser.uid,
                opportunityId,
                novoStatus,
                motivoPerda
            );

            if (result.success) {
                // Recarregar oportunidade atualizada
                await fetchOpportunity(opportunityId);
            } else {
                setError('update', result.error);
            }

            return result;
        } catch (error) {
            setError('update', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('update', false);
        }
    }, [currentUser, fetchOpportunity]);

    /**
     * Deletar oportunidade
     */
    const deleteExistingOpportunity = useCallback(async (opportunityId) => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('delete', true);
        clearError('delete');

        try {
            const result = await deleteOpportunity(currentUser.uid, opportunityId);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.REMOVE_OPPORTUNITY,
                    opportunityId
                });
            } else {
                setError('delete', result.error);
            }

            return result;
        } catch (error) {
            setError('delete', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('delete', false);
        }
    }, [currentUser]);

    /**
     * Buscar estatísticas
     */
    const fetchStats = useCallback(async () => {
        if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

        setLoading('stats', true);
        clearError('stats');

        try {
            const result = await getOpportunityStats(currentUser.uid);

            if (result.success) {
                dispatch({
                    type: OpportunityActionTypes.SET_STATS,
                    stats: result.data
                });
            } else {
                setError('stats', result.error);
            }

            return result;
        } catch (error) {
            setError('stats', error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading('stats', false);
        }
    }, [currentUser]);

    // ===== FILTER AND VIEW OPERATIONS =====

    /**
     * Aplicar filtros
     */
    const applyFilters = useCallback((newFilters) => {
        dispatch({
            type: OpportunityActionTypes.SET_FILTERS,
            filters: newFilters
        });
    }, []);

    /**
     * Mudar modo de visualização
     */
    const setViewMode = useCallback((mode) => {
        dispatch({
            type: OpportunityActionTypes.SET_VIEW_MODE,
            viewMode: mode
        });
    }, []);

    /**
     * Limpar oportunidade atual
     */
    const clearCurrentOpportunity = useCallback(() => {
        dispatch({
            type: OpportunityActionTypes.CLEAR_CURRENT_OPPORTUNITY
        });
    }, []);

    // ===== EFFECTS =====

    // Carregar oportunidades quando usuário mudar
    useEffect(() => {
        if (currentUser) {
            fetchOpportunities();
            fetchStats();
        }
    }, [currentUser]);

    // ===== CONTEXT VALUE =====
    const value = {
        // Estado
        ...state,

        // Operações CRUD
        createOpportunity: createNewOpportunity,
        fetchOpportunity,
        fetchOpportunities,
        fetchOpportunitiesByType,
        updateOpportunity: updateExistingOpportunity,
        changePhase,
        changeStatus,
        deleteOpportunity: deleteExistingOpportunity,

        // Estatísticas
        fetchStats,

        // Filtros e visualização
        applyFilters,
        setViewMode,

        // Utilitários
        clearCurrentOpportunity,
        clearError
    };

    return (
        <OpportunityContext.Provider value={value}>
            {children}
        </OpportunityContext.Provider>
    );
}