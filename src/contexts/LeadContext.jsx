/**
 * LEAD CONTEXT - MyImoMatePro
 * Context simplificado para gestão de Leads
 * Lead = Cliente PROSPECT com qualificação básica
 * 
 * Caminho: src/contexts/LeadContext.jsx
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as leadService from '../services/leadService';
import { LEAD_FUNNEL_STATES } from '../models/leadModel';

// ===== CONTEXT =====
const LeadContext = createContext();

export const useLeads = () => {
    const context = useContext(LeadContext);
    if (!context) {
        throw new Error('useLeads deve ser usado dentro de LeadProvider');
    }
    return context;
};

// ===== ESTADO INICIAL =====
const initialState = {
    // Dados principais
    leads: [],
    currentLead: null,

    // Filtros e pesquisa
    filters: {
        type: null,
        source: null,
        funnelState: null
    },
    searchTerm: '',

    // Paginação
    pagination: {
        hasMore: false,
        lastDoc: null,
        limit: 20
    },

    // Estatísticas
    stats: {
        total: 0,
        byFunnelState: {
            entrada: 0,
            qualificando: 0,
            convertido: 0
        },
        byType: {},
        bySource: {},
        conversionRate: 0
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
    errors: {}
};

// ===== ACTIONS =====
const ACTIONS = {
    // Loading
    SET_LOADING: 'SET_LOADING',
    CLEAR_LOADING: 'CLEAR_LOADING',

    // Errors
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',

    // Leads
    SET_LEADS: 'SET_LEADS',
    ADD_LEAD: 'ADD_LEAD',
    UPDATE_LEAD: 'UPDATE_LEAD',
    DELETE_LEAD: 'DELETE_LEAD',
    SET_CURRENT_LEAD: 'SET_CURRENT_LEAD',
    CLEAR_CURRENT_LEAD: 'CLEAR_CURRENT_LEAD',

    // Filtros e pesquisa
    SET_FILTERS: 'SET_FILTERS',
    RESET_FILTERS: 'RESET_FILTERS',
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',

    // Paginação
    SET_PAGINATION: 'SET_PAGINATION',

    // Estatísticas
    SET_STATS: 'SET_STATS'
};

// ===== REDUCER =====
function leadReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.key]: true
                }
            };

        case ACTIONS.CLEAR_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.key]: false
                }
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.key]: action.error
                }
            };

        case ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.key]: null
                }
            };

        case ACTIONS.SET_LEADS:
            return {
                ...state,
                leads: action.leads,
                loading: {
                    ...state.loading,
                    list: false
                }
            };

        case ACTIONS.ADD_LEAD:
            return {
                ...state,
                leads: [action.lead, ...state.leads],
                loading: {
                    ...state.loading,
                    create: false
                }
            };

        case ACTIONS.UPDATE_LEAD:
            return {
                ...state,
                leads: state.leads.map(lead =>
                    lead.id === action.lead.id ? action.lead : lead
                ),
                currentLead: state.currentLead?.id === action.lead.id
                    ? action.lead
                    : state.currentLead,
                loading: {
                    ...state.loading,
                    update: false
                }
            };

        case ACTIONS.DELETE_LEAD:
            return {
                ...state,
                leads: state.leads.filter(lead => lead.id !== action.leadId),
                currentLead: state.currentLead?.id === action.leadId
                    ? null
                    : state.currentLead,
                loading: {
                    ...state.loading,
                    delete: false
                }
            };

        case ACTIONS.SET_CURRENT_LEAD:
            return {
                ...state,
                currentLead: action.lead,
                loading: {
                    ...state.loading,
                    list: false
                }
            };

        case ACTIONS.CLEAR_CURRENT_LEAD:
            return {
                ...state,
                currentLead: null
            };

        case ACTIONS.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.filters
                }
            };

        case ACTIONS.RESET_FILTERS:
            return {
                ...state,
                filters: initialState.filters
            };

        case ACTIONS.SET_SEARCH_TERM:
            return {
                ...state,
                searchTerm: action.term
            };

        case ACTIONS.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.pagination
                }
            };

        case ACTIONS.SET_STATS:
            return {
                ...state,
                stats: action.stats,
                loading: {
                    ...state.loading,
                    stats: false
                }
            };

        default:
            return state;
    }
}

// ===== PROVIDER =====
export function LeadProvider({ children }) {
    const [state, dispatch] = useReducer(leadReducer, initialState);
    const { currentUser } = useAuth();

    // ===== HELPER FUNCTIONS =====

    const setLoading = useCallback((key, value) => {
        if (value) {
            dispatch({ type: ACTIONS.SET_LOADING, key });
        } else {
            dispatch({ type: ACTIONS.CLEAR_LOADING, key });
        }
    }, []);

    const setError = useCallback((key, error) => {
        dispatch({ type: ACTIONS.SET_ERROR, key, error: error.message });
        setLoading(key, false);
    }, [setLoading]);

    const clearError = useCallback((key) => {
        dispatch({ type: ACTIONS.CLEAR_ERROR, key });
    }, []);

    // ===== CRUD OPERATIONS =====

    // Criar lead
    const createLead = useCallback(async (leadData) => {
        setLoading('create', true);
        clearError('create');

        try {
            const newLead = await leadService.createLead(leadData, currentUser.uid);
            dispatch({ type: ACTIONS.ADD_LEAD, lead: newLead });

            // Atualizar estatísticas
            await fetchStats();

            return newLead;
        } catch (error) {
            setError('create', error);
            throw error;
        }
    }, [currentUser]);

    // Buscar lead por ID
    const fetchLead = useCallback(async (leadId) => {
        setLoading('list', true);
        clearError('list');

        try {
            const lead = await leadService.getLeadById(leadId);
            dispatch({ type: ACTIONS.SET_CURRENT_LEAD, lead });
            return lead;
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, []);

    // Listar leads
    const fetchLeads = useCallback(async (customFilters = {}) => {
        setLoading('list', true);
        clearError('list');

        try {
            const filters = {
                ...state.filters,
                ...customFilters,
                limit: state.pagination.limit
            };

            if (state.pagination.lastDoc && !customFilters.reset) {
                filters.startAfter = state.pagination.lastDoc;
            }

            const result = await leadService.getLeads(currentUser.uid, filters);

            dispatch({ type: ACTIONS.SET_LEADS, leads: result.leads });
            dispatch({
                type: ACTIONS.SET_PAGINATION,
                pagination: {
                    hasMore: result.hasMore,
                    lastDoc: result.lastDoc
                }
            });

            return result.leads;
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, [currentUser, state.filters, state.pagination]);

    // Atualizar lead
    const updateLead = useCallback(async (leadId, updates) => {
        setLoading('update', true);
        clearError('update');

        try {
            await leadService.updateLead(leadId, updates);

            // Buscar lead atualizada com dados do cliente
            const updatedLead = await leadService.getLeadById(leadId);
            dispatch({ type: ACTIONS.UPDATE_LEAD, lead: updatedLead });

            // Se mudou estado do funil, atualizar estatísticas
            if (updates.funnelState) {
                await fetchStats();
            }

            return updatedLead;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, []);

    // Deletar lead
    const deleteLead = useCallback(async (leadId) => {
        setLoading('delete', true);
        clearError('delete');

        try {
            await leadService.deleteLead(leadId);
            dispatch({ type: ACTIONS.DELETE_LEAD, leadId });

            // Atualizar estatísticas
            await fetchStats();

            return leadId;
        } catch (error) {
            setError('delete', error);
            throw error;
        }
    }, []);

    // ===== CONVERSÃO =====

    // Converter lead em oportunidade
    const convertLead = useCallback(async (leadId, opportunityData = null) => {
        setLoading('update', true);
        clearError('update');

        try {
            const result = await leadService.convertLead(leadId, opportunityData, currentUser.uid);

            // Atualizar lead no estado
            await updateLead(leadId, {
                funnelState: LEAD_FUNNEL_STATES.CONVERTIDO
            });

            return result;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, [currentUser, updateLead]);

    // ===== PESQUISA E FILTROS =====

    // Pesquisar leads
    const searchLeads = useCallback(async (searchTerm) => {
        dispatch({ type: ACTIONS.SET_SEARCH_TERM, term: searchTerm });

        if (!searchTerm) {
            return fetchLeads({ reset: true });
        }

        setLoading('list', true);
        clearError('list');

        try {
            const results = await leadService.searchLeads(currentUser.uid, searchTerm);
            dispatch({ type: ACTIONS.SET_LEADS, leads: results });
            return results;
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, [currentUser, fetchLeads]);

    // Definir filtros
    const setFilters = useCallback((filters) => {
        dispatch({ type: ACTIONS.SET_FILTERS, filters });
        // Reset paginação ao mudar filtros
        dispatch({
            type: ACTIONS.SET_PAGINATION,
            pagination: { ...initialState.pagination }
        });
    }, []);

    // Limpar filtros
    const resetFilters = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_FILTERS });
        dispatch({
            type: ACTIONS.SET_PAGINATION,
            pagination: { ...initialState.pagination }
        });
    }, []);

    // ===== ESTATÍSTICAS =====

    // Buscar estatísticas
    const fetchStats = useCallback(async () => {
        setLoading('stats', true);
        clearError('stats');

        try {
            const stats = await leadService.getLeadStats(currentUser.uid);
            dispatch({ type: ACTIONS.SET_STATS, stats });
            return stats;
        } catch (error) {
            setError('stats', error);
            throw error;
        }
    }, [currentUser]);

    // ===== UTILITÁRIOS =====

    const clearCurrentLead = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_CURRENT_LEAD });
    }, []);

    // ===== EFFECTS =====

    // Carregar dados iniciais
    useEffect(() => {
        if (currentUser) {
            fetchLeads({ reset: true });
            fetchStats();
        }
    }, [currentUser]);

    // ===== CONTEXT VALUE =====
    const value = {
        // Estado
        ...state,

        // CRUD
        createLead,
        fetchLead,
        fetchLeads,
        updateLead,
        deleteLead,

        // Conversão
        convertLead,

        // Pesquisa e filtros
        searchLeads,
        setFilters,
        resetFilters,

        // Estatísticas
        fetchStats,

        // Utilitários
        clearCurrentLead,
        clearError,
        setLoading
    };

    return (
        <LeadContext.Provider value={value}>
            {children}
        </LeadContext.Provider>
    );
}