/**
 * OPPORTUNITY CONTEXT - MyImoMatePro
 * Estado global para gestão de oportunidades com React Context
 * 
 * Caminho: src/contexts/OpportunityContext.jsx
 * Estrutura: consultores/{consultorId}/clientes/{clienteId}/oportunidades/{oportunidadeId}
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    createOpportunity,
    getOpportunity,
    listClientOpportunities,
    listAllOpportunities,
    updateOpportunity,
    deactivateOpportunity,
    deleteOpportunity,
    batchUpdateOpportunities,
    addTimelineEvent,
    getClientOpportunityStats,
    getConsultorOpportunityStats
} from '../services/opportunityService';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_STATES,
    TIMELINE_EVENT_TYPES
} from '../models/opportunityModel';

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
    clientOpportunities: {},
    stats: {
        client: null,
        consultor: null
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
        tipo: null,
        estado: null,
        prioridade: null,
        clienteId: null
    },

    // Estados de loading
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        stats: false
    },

    // Erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        stats: null
    }
};

// ===== ACTIONS =====
const ActionTypes = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',

    // Data operations
    SET_OPPORTUNITIES: 'SET_OPPORTUNITIES',
    ADD_OPPORTUNITY: 'ADD_OPPORTUNITY',
    UPDATE_OPPORTUNITY: 'UPDATE_OPPORTUNITY',
    REMOVE_OPPORTUNITY: 'REMOVE_OPPORTUNITY',
    SET_CURRENT_OPPORTUNITY: 'SET_CURRENT_OPPORTUNITY',

    // Client opportunities
    SET_CLIENT_OPPORTUNITIES: 'SET_CLIENT_OPPORTUNITIES',
    ADD_CLIENT_OPPORTUNITY: 'ADD_CLIENT_OPPORTUNITY',

    // Stats
    SET_CLIENT_STATS: 'SET_CLIENT_STATS',
    SET_CONSULTOR_STATS: 'SET_CONSULTOR_STATS',

    // Filters and pagination
    SET_FILTERS: 'SET_FILTERS',
    SET_PAGINATION: 'SET_PAGINATION',
    RESET_FILTERS: 'RESET_FILTERS',

    // Timeline
    ADD_TIMELINE_EVENT: 'ADD_TIMELINE_EVENT',

    // Reset
    RESET_STATE: 'RESET_STATE'
};

// ===== REDUCER =====
function opportunityReducer(state, action) {
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

        // Opportunities
        case ActionTypes.SET_OPPORTUNITIES:
            return {
                ...state,
                opportunities: action.payload.opportunities,
                pagination: {
                    ...state.pagination,
                    ...action.payload.pagination
                }
            };

        case ActionTypes.ADD_OPPORTUNITY:
            return {
                ...state,
                opportunities: [action.payload, ...state.opportunities]
            };

        case ActionTypes.UPDATE_OPPORTUNITY:
            return {
                ...state,
                opportunities: state.opportunities.map(opp =>
                    opp.id === action.payload.id ? action.payload : opp
                ),
                currentOpportunity: state.currentOpportunity?.id === action.payload.id
                    ? action.payload
                    : state.currentOpportunity
            };

        case ActionTypes.REMOVE_OPPORTUNITY:
            return {
                ...state,
                opportunities: state.opportunities.filter(opp => opp.id !== action.payload),
                currentOpportunity: state.currentOpportunity?.id === action.payload
                    ? null
                    : state.currentOpportunity
            };

        case ActionTypes.SET_CURRENT_OPPORTUNITY:
            return {
                ...state,
                currentOpportunity: action.payload
            };

        // Client Opportunities
        case ActionTypes.SET_CLIENT_OPPORTUNITIES:
            return {
                ...state,
                clientOpportunities: {
                    ...state.clientOpportunities,
                    [action.payload.clienteId]: action.payload.opportunities
                }
            };

        case ActionTypes.ADD_CLIENT_OPPORTUNITY:
            const clientId = action.payload.clienteId;
            const currentClientOpps = state.clientOpportunities[clientId] || [];
            return {
                ...state,
                clientOpportunities: {
                    ...state.clientOpportunities,
                    [clientId]: [action.payload, ...currentClientOpps]
                }
            };

        // Stats
        case ActionTypes.SET_CLIENT_STATS:
            return {
                ...state,
                stats: {
                    ...state.stats,
                    client: action.payload
                }
            };

        case ActionTypes.SET_CONSULTOR_STATS:
            return {
                ...state,
                stats: {
                    ...state.stats,
                    consultor: action.payload
                }
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
                filters: initialState.filters,
                pagination: initialState.pagination
            };

        // Timeline
        case ActionTypes.ADD_TIMELINE_EVENT:
            return {
                ...state,
                opportunities: state.opportunities.map(opp => {
                    if (opp.id === action.payload.opportunityId) {
                        return {
                            ...opp,
                            timeline: [...(opp.timeline || []), action.payload.event]
                        };
                    }
                    return opp;
                }),
                currentOpportunity: state.currentOpportunity?.id === action.payload.opportunityId
                    ? {
                        ...state.currentOpportunity,
                        timeline: [...(state.currentOpportunity.timeline || []), action.payload.event]
                    }
                    : state.currentOpportunity
            };

        // Reset
        case ActionTypes.RESET_STATE:
            return initialState;

        default:
            return state;
    }
}

// ===== PROVIDER COMPONENT =====
export function OpportunityProvider({ children }) {
    const [state, dispatch] = useReducer(opportunityReducer, initialState);
    const { currentUser } = useAuth();

    // ===== HELPER FUNCTIONS =====

    const setLoading = useCallback((type, value) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { type, value } });
    }, []);

    const setError = useCallback((type, error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { type, error } });
    }, []);

    // ===== CREATE OPERATIONS =====

    const createNewOpportunity = useCallback(async (clienteId, opportunityData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('create', true);
        setError('create', null);

        try {
            const newOpportunity = await createOpportunity(
                currentUser.uid,
                clienteId,
                opportunityData
            );

            dispatch({ type: ActionTypes.ADD_OPPORTUNITY, payload: newOpportunity });
            dispatch({
                type: ActionTypes.ADD_CLIENT_OPPORTUNITY,
                payload: { ...newOpportunity, clienteId }
            });

            setLoading('create', false);
            return newOpportunity;

        } catch (error) {
            setError('create', error.message);
            setLoading('create', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== READ OPERATIONS =====

    const fetchOpportunity = useCallback(async (clienteId, opportunityId) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('list', true);
        setError('list', null);

        try {
            const opportunity = await getOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId
            );

            dispatch({ type: ActionTypes.SET_CURRENT_OPPORTUNITY, payload: opportunity });
            setLoading('list', false);
            return opportunity;

        } catch (error) {
            setError('list', error.message);
            setLoading('list', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    const fetchClientOpportunities = useCallback(async (clienteId, options = {}) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('list', true);
        setError('list', null);

        try {
            const result = await listClientOpportunities(
                currentUser.uid,
                clienteId,
                {
                    ...options,
                    ...state.filters
                }
            );

            dispatch({
                type: ActionTypes.SET_CLIENT_OPPORTUNITIES,
                payload: {
                    clienteId,
                    opportunities: result.opportunities
                }
            });

            setLoading('list', false);
            return result;

        } catch (error) {
            setError('list', error.message);
            setLoading('list', false);
            throw error;
        }
    }, [currentUser, state.filters, setLoading, setError]);

    const fetchAllOpportunities = useCallback(async (options = {}) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('list', true);
        setError('list', null);

        try {
            const result = await listAllOpportunities(
                currentUser.uid,
                {
                    ...options,
                    ...state.filters
                }
            );

            dispatch({
                type: ActionTypes.SET_OPPORTUNITIES,
                payload: {
                    opportunities: result.opportunities,
                    pagination: {
                        total: result.total,
                        hasMore: result.hasMore
                    }
                }
            });

            setLoading('list', false);
            return result;

        } catch (error) {
            setError('list', error.message);
            setLoading('list', false);
            throw error;
        }
    }, [currentUser, state.filters, setLoading, setError]);

    // ===== UPDATE OPERATIONS =====

    const updateExistingOpportunity = useCallback(async (clienteId, opportunityId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('update', true);
        setError('update', null);

        try {
            const updatedOpportunity = await updateOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                updates
            );

            dispatch({ type: ActionTypes.UPDATE_OPPORTUNITY, payload: updatedOpportunity });
            setLoading('update', false);
            return updatedOpportunity;

        } catch (error) {
            setError('update', error.message);
            setLoading('update', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    const changeOpportunityState = useCallback(async (clienteId, opportunityId, newState) => {
        return updateExistingOpportunity(clienteId, opportunityId, { estado: newState });
    }, [updateExistingOpportunity]);

    const addEventToTimeline = useCallback(async (clienteId, opportunityId, eventData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            const newEvent = await addTimelineEvent(
                currentUser.uid,
                clienteId,
                opportunityId,
                eventData
            );

            dispatch({
                type: ActionTypes.ADD_TIMELINE_EVENT,
                payload: { opportunityId, event: newEvent }
            });

            return newEvent;

        } catch (error) {
            throw error;
        }
    }, [currentUser]);

    // ===== DELETE OPERATIONS =====

    const removeOpportunity = useCallback(async (clienteId, opportunityId, permanent = false) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('delete', true);
        setError('delete', null);

        try {
            if (permanent) {
                await deleteOpportunity(currentUser.uid, clienteId, opportunityId);
            } else {
                await deactivateOpportunity(currentUser.uid, clienteId, opportunityId);
            }

            dispatch({ type: ActionTypes.REMOVE_OPPORTUNITY, payload: opportunityId });
            setLoading('delete', false);
            return { success: true };

        } catch (error) {
            setError('delete', error.message);
            setLoading('delete', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== BATCH OPERATIONS =====

    const batchUpdate = useCallback(async (clienteId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('update', true);
        setError('update', null);

        try {
            const result = await batchUpdateOpportunities(
                currentUser.uid,
                clienteId,
                updates
            );

            // Recarregar oportunidades após batch update
            await fetchClientOpportunities(clienteId);

            setLoading('update', false);
            return result;

        } catch (error) {
            setError('update', error.message);
            setLoading('update', false);
            throw error;
        }
    }, [currentUser, fetchClientOpportunities, setLoading, setError]);

    // ===== STATISTICS =====

    const fetchClientStats = useCallback(async (clienteId) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('stats', true);
        setError('stats', null);

        try {
            const stats = await getClientOpportunityStats(currentUser.uid, clienteId);
            dispatch({ type: ActionTypes.SET_CLIENT_STATS, payload: stats });
            setLoading('stats', false);
            return stats;

        } catch (error) {
            setError('stats', error.message);
            setLoading('stats', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    const fetchConsultorStats = useCallback(async () => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('stats', true);
        setError('stats', null);

        try {
            const stats = await getConsultorOpportunityStats(currentUser.uid);
            dispatch({ type: ActionTypes.SET_CONSULTOR_STATS, payload: stats });
            setLoading('stats', false);
            return stats;

        } catch (error) {
            setError('stats', error.message);
            setLoading('stats', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== FILTERS & SEARCH =====

    const setFilters = useCallback((filters) => {
        dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    }, []);

    const resetFilters = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_FILTERS });
    }, []);

    const setPagination = useCallback((pagination) => {
        dispatch({ type: ActionTypes.SET_PAGINATION, payload: pagination });
    }, []);

    // ===== RESET =====

    const resetState = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_STATE });
    }, []);

    // ===== CONTEXT VALUE =====
    const value = {
        // State
        ...state,

        // Constants
        OPPORTUNITY_TYPES,
        OPPORTUNITY_STATES,
        TIMELINE_EVENT_TYPES,

        // Create
        createNewOpportunity,

        // Read
        fetchOpportunity,
        fetchClientOpportunities,
        fetchAllOpportunities,

        // Update
        updateExistingOpportunity,
        changeOpportunityState,
        addEventToTimeline,
        batchUpdate,

        // Delete
        removeOpportunity,

        // Stats
        fetchClientStats,
        fetchConsultorStats,

        // Filters
        setFilters,
        resetFilters,
        setPagination,

        // Reset
        resetState
    };

    return (
        <OpportunityContext.Provider value={value}>
            {children}
        </OpportunityContext.Provider>
    );
}