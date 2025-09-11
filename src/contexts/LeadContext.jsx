/**
 * LEAD CONTEXT - MyImoMatePro
 * Estado global para gestão de leads com React Context
 * 
 * Caminho: src/contexts/LeadContext.jsx
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    createLead,
    getLead,
    listLeads,
    searchLeads,
    updateLead,
    addFollowUp,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    getLeadStats,
    batchUpdateLeads
} from '../services/leadService';

// ===== CONTEXTO =====
const LeadContext = createContext();

// ===== HOOK PERSONALIZADO =====
export function useLeads() {
    const context = useContext(LeadContext);
    if (!context) {
        throw new Error('useLeads deve ser usado dentro de LeadProvider');
    }
    return context;
}

// ===== ESTADO INICIAL =====
const initialState = {
    // Dados
    leads: [],
    currentLead: null,
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
        status: 'all',
        qualificationType: 'all',
        source: 'all',
        urgency: 'all'
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
        followUp: false,
        convert: false
    },

    // Erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        search: null,
        stats: null
    }
};

// ===== TIPOS DE AÇÃO =====
const ActionTypes = {
    // Loading states
    SET_LOADING: 'SET_LOADING',

    // Data operations
    SET_LEADS: 'SET_LEADS',
    ADD_LEAD: 'ADD_LEAD',
    UPDATE_LEAD: 'UPDATE_LEAD',
    DELETE_LEAD: 'DELETE_LEAD',
    SET_CURRENT_LEAD: 'SET_CURRENT_LEAD',

    // Follow-ups
    ADD_FOLLOWUP: 'ADD_FOLLOWUP',

    // Conversion
    CONVERT_LEAD: 'CONVERT_LEAD',

    // Search and filters
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    SET_FILTERS: 'SET_FILTERS',
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',

    // Pagination
    SET_PAGINATION: 'SET_PAGINATION',

    // Stats
    SET_STATS: 'SET_STATS',

    // Errors
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERRORS: 'CLEAR_ERRORS',

    // Reset
    RESET_STATE: 'RESET_STATE'
};

// ===== REDUCER =====
function leadReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.payload.key]: action.payload.value
                }
            };

        case ActionTypes.SET_LEADS:
            return {
                ...state,
                leads: action.payload,
                loading: { ...state.loading, list: false }
            };

        case ActionTypes.ADD_LEAD:
            // VERIFICAR se a lead tem ID antes de adicionar
            if (!action.payload.id) {
                console.error('⚠️ Tentando adicionar lead sem ID:', action.payload);
                return state;
            }

            return {
                ...state,
                leads: [action.payload, ...state.leads],  // Adiciona no início
                loading: { ...state.loading, create: false }
            };

        case ActionTypes.UPDATE_LEAD:
            return {
                ...state,
                leads: state.leads.map(lead =>
                    lead.id === action.payload.id ? action.payload : lead
                ),
                currentLead: state.currentLead?.id === action.payload.id
                    ? action.payload
                    : state.currentLead,
                loading: { ...state.loading, update: false }
            };

        case ActionTypes.DELETE_LEAD:
            return {
                ...state,
                leads: state.leads.filter(lead => lead.id !== action.payload),
                currentLead: state.currentLead?.id === action.payload
                    ? null
                    : state.currentLead,
                loading: { ...state.loading, delete: false }
            };

        case ActionTypes.SET_CURRENT_LEAD:
            return {
                ...state,
                currentLead: action.payload
            };

        case ActionTypes.ADD_FOLLOWUP:
            return {
                ...state,
                currentLead: state.currentLead?.id === action.payload.leadId
                    ? {
                        ...state.currentLead,
                        followUps: [...(state.currentLead.followUps || []), action.payload.followUp]
                    }
                    : state.currentLead,
                leads: state.leads.map(lead =>
                    lead.id === action.payload.leadId
                        ? {
                            ...lead,
                            followUps: [...(lead.followUps || []), action.payload.followUp]
                        }
                        : lead
                ),
                loading: { ...state.loading, followUp: false }
            };

        case ActionTypes.CONVERT_LEAD:
            return {
                ...state,
                leads: state.leads.map(lead =>
                    lead.id === action.payload.leadId
                        ? { ...lead, status: 'converted', clientId: action.payload.clientId }
                        : lead
                ),
                currentLead: state.currentLead?.id === action.payload.leadId
                    ? { ...state.currentLead, status: 'converted', clientId: action.payload.clientId }
                    : state.currentLead,
                loading: { ...state.loading, convert: false }
            };

        case ActionTypes.SET_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.payload,
                loading: { ...state.loading, search: false }
            };

        case ActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.payload }
            };

        case ActionTypes.SET_SEARCH_TERM:
            return {
                ...state,
                searchTerm: action.payload
            };

        case ActionTypes.SET_PAGINATION:
            return {
                ...state,
                pagination: { ...state.pagination, ...action.payload }
            };

        case ActionTypes.SET_STATS:
            return {
                ...state,
                stats: action.payload,
                loading: { ...state.loading, stats: false }
            };

        case ActionTypes.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.key]: action.payload.error
                },
                loading: {
                    ...state.loading,
                    [action.payload.key]: false
                }
            };

        case ActionTypes.CLEAR_ERRORS:
            return {
                ...state,
                errors: initialState.errors
            };

        case ActionTypes.RESET_STATE:
            return initialState;

        default:
            return state;
    }
}

// ===== PROVIDER COMPONENT =====
export function LeadProvider({ children }) {
    const [state, dispatch] = useReducer(leadReducer, initialState);
    const { currentUser } = useAuth();

    // ===== HELPER: Set Loading =====
    const setLoading = useCallback((key, value) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: { key, value } });
    }, []);

    // ===== HELPER: Set Error =====
    const setError = useCallback((key, error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: { key, error: error.message } });
    }, []);

    // ===== CREATE: Criar nova lead =====
    const createNewLead = useCallback(async (leadData) => {
        if (!currentUser) return null;

        setLoading('create', true);
        try {
            const newLead = await createLead(currentUser.uid, leadData);

            // IMPORTANTE: A nova lead DEVE ter ID
            if (!newLead.id) {
                console.error('⚠️ Lead criada sem ID!', newLead);
            }

            dispatch({ type: ActionTypes.ADD_LEAD, payload: newLead });

            return newLead;
        } catch (error) {
            setError('create', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== READ: Buscar lead por ID =====
    const fetchLead = useCallback(async (leadId) => {
        if (!currentUser) return null;

        try {
            const lead = await getLead(currentUser.uid, leadId);
            dispatch({ type: ActionTypes.SET_CURRENT_LEAD, payload: lead });
            return lead;
        } catch (error) {
            console.error('Erro ao buscar lead:', error);
            throw error;
        }
    }, [currentUser]);

    // ===== READ: Listar leads =====
    const fetchLeads = useCallback(async (options = {}) => {
        if (!currentUser) return;

        setLoading('list', true);
        try {
            const result = await listLeads(currentUser.uid, {
                ...options,
                filters: state.filters,
                pageSize: state.pagination.pageSize,
                lastDoc: options.loadMore ? state.pagination.lastDoc : null
            });

            if (options.loadMore) {
                dispatch({
                    type: ActionTypes.SET_LEADS,
                    payload: [...state.leads, ...result.leads]
                });
            } else {
                dispatch({ type: ActionTypes.SET_LEADS, payload: result.leads });
            }

            dispatch({
                type: ActionTypes.SET_PAGINATION,
                payload: {
                    hasMore: result.hasMore,
                    lastDoc: result.lastDoc,
                    page: options.loadMore ? state.pagination.page + 1 : 1,
                    total: result.total
                }
            });
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, [currentUser, state.filters, state.pagination, state.leads, setLoading, setError]);

    // ===== SEARCH: Buscar leads por termo =====
    const searchLeadsByTerm = useCallback(async (searchTerm) => {
        if (!currentUser || !searchTerm.trim()) {
            dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: [] });
            return [];
        }

        setLoading('search', true);
        try {
            const results = await searchLeads(currentUser.uid, searchTerm);
            dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results });
            return results;
        } catch (error) {
            setError('search', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== UPDATE: Atualizar lead =====
    const updateExistingLead = useCallback(async (leadId, updates) => {
        if (!currentUser) return null;

        setLoading('update', true);
        try {
            const updatedLead = await updateLead(currentUser.uid, leadId, updates);
            dispatch({ type: ActionTypes.UPDATE_LEAD, payload: updatedLead });
            return updatedLead;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== FOLLOWUP: Adicionar follow-up =====
    const addNewFollowUp = useCallback(async (leadId, followUpData) => {
        if (!currentUser) return null;

        setLoading('followUp', true);
        try {
            const followUp = await addFollowUp(currentUser.uid, leadId, followUpData);
            dispatch({
                type: ActionTypes.ADD_FOLLOWUP,
                payload: { leadId, followUp }
            });
            return followUp;
        } catch (error) {
            setError('followUp', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== CONVERT: Converter lead em cliente =====
    const convertLead = useCallback(async (leadId, clientData) => {
        if (!currentUser) return null;

        setLoading('convert', true);
        try {
            const result = await convertLeadToClient(currentUser.uid, leadId, clientData);
            dispatch({
                type: ActionTypes.CONVERT_LEAD,
                payload: { leadId, clientId: result.clientId }
            });
            return result;
        } catch (error) {
            setError('convert', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== STATUS: Alterar status da lead =====
    const changeLeadStatus = useCallback(async (leadId, newStatus) => {
        if (!currentUser) return null;

        try {
            await updateLeadStatus(currentUser.uid, leadId, newStatus);
            const updatedLead = state.leads.find(l => l.id === leadId);
            if (updatedLead) {
                dispatch({
                    type: ActionTypes.UPDATE_LEAD,
                    payload: { ...updatedLead, status: newStatus }
                });
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            throw error;
        }
    }, [currentUser, state.leads]);

    // ===== DELETE: Eliminar lead =====
    const deleteExistingLead = useCallback(async (leadId) => {
        if (!currentUser) return;

        setLoading('delete', true);
        try {
            await deleteLead(currentUser.uid, leadId);
            dispatch({ type: ActionTypes.DELETE_LEAD, payload: leadId });
        } catch (error) {
            setError('delete', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== STATS: Buscar estatísticas =====
    const fetchLeadStats = useCallback(async () => {
        if (!currentUser) return null;

        setLoading('stats', true);
        try {
            const stats = await getLeadStats(currentUser.uid);
            dispatch({ type: ActionTypes.SET_STATS, payload: stats });
            return stats;
        } catch (error) {
            setError('stats', error);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    // ===== FILTERS: Aplicar filtros =====
    const applyFilters = useCallback((newFilters) => {
        dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters });
    }, []);

    // ===== RESET: Limpar estado =====
    const resetState = useCallback(() => {
        dispatch({ type: ActionTypes.RESET_STATE });
    }, []);

    // ===== ERRORS: Limpar erros =====
    const clearErrors = useCallback(() => {
        dispatch({ type: ActionTypes.CLEAR_ERRORS });
    }, []);

    // ===== EFFECT: Carregar leads ao montar =====
    useEffect(() => {
        if (currentUser) {
            fetchLeads();
            fetchLeadStats();
        }
    }, [currentUser]); // Removido fetchLeads e fetchLeadStats para evitar loop

    // ===== CONTEXT VALUE =====
    const value = {
        // Estado
        ...state,

        // Ações
        createLead: createNewLead,
        fetchLead,
        fetchLeads,
        searchLeads: searchLeadsByTerm,
        updateLead: updateExistingLead,
        addFollowUp: addNewFollowUp,
        convertLead,
        changeLeadStatus,
        deleteLead: deleteExistingLead,
        fetchLeadStats,
        applyFilters,
        resetState,
        clearErrors
    };

    return (
        <LeadContext.Provider value={value}>
            {children}
        </LeadContext.Provider>
    );
}