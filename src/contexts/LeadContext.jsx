/**
 * LEAD CONTEXT - MyImoMatePro
 * Contexto React para gestão de estado das leads
 * 
 * Caminho: src/contexts/LeadContext.jsx
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as leadService from '../services/leadService';

// ===== CONTEXT =====
const LeadContext = createContext();

export const useLeads = () => {
    const context = useContext(LeadContext);
    if (!context) {
        throw new Error('useLeads deve ser usado dentro de LeadProvider');
    }
    return context;
};

// ===== INITIAL STATE =====
const initialState = {
    // Dados
    leads: [],
    currentLead: null,
    leadTasks: [],
    leadContacts: [],
    searchResults: [],
    alertLeads: [],
    stats: {
        total: 0,
        porStatus: {},
        porFonte: {},
        porInteresse: {},
        porTemperatura: {
            frio: 0,
            morno: 0,
            quente: 0
        },
        alertas: 0,
        taxaConversao: 0
    },

    // Filtros e pesquisa
    filters: {
        status: null,
        leadSource: null,
        interesse: null,
        temperatura: null
    },
    searchTerm: '',
    sortBy: 'criadaEm',
    sortOrder: 'desc',

    // Paginação
    pagination: {
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
        lastDoc: null
    },

    // Loading states
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        fetch: false,
        tasks: false,
        contacts: false,
        stats: false,
        alerts: false,
        search: false,
        convert: false
    },

    // Erros
    errors: {}
};

// ===== ACTIONS =====
const ACTIONS = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    CLEAR_LOADING: 'CLEAR_LOADING',

    // Error handling
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',

    // Leads
    SET_LEADS: 'SET_LEADS',
    ADD_LEAD: 'ADD_LEAD',
    UPDATE_LEAD: 'UPDATE_LEAD',
    DELETE_LEAD: 'DELETE_LEAD',
    SET_CURRENT_LEAD: 'SET_CURRENT_LEAD',
    CLEAR_CURRENT_LEAD: 'CLEAR_CURRENT_LEAD',

    // Tasks
    SET_LEAD_TASKS: 'SET_LEAD_TASKS',
    ADD_TASK: 'ADD_TASK',
    UPDATE_TASK: 'UPDATE_TASK',

    // Contacts
    SET_LEAD_CONTACTS: 'SET_LEAD_CONTACTS',
    ADD_CONTACT: 'ADD_CONTACT',

    // Pagination
    SET_PAGINATION: 'SET_PAGINATION',
    RESET_PAGINATION: 'RESET_PAGINATION',

    // Filters
    SET_FILTERS: 'SET_FILTERS',
    RESET_FILTERS: 'RESET_FILTERS',

    // Search
    SET_SEARCH_TERM: 'SET_SEARCH_TERM',
    SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
    CLEAR_SEARCH: 'CLEAR_SEARCH',

    // Stats and alerts
    SET_STATS: 'SET_STATS',
    SET_ALERT_LEADS: 'SET_ALERT_LEADS'
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
                },
                loading: {
                    ...state.loading,
                    [action.key]: false
                }
            };

        case ACTIONS.CLEAR_ERROR:
            const newErrors = { ...state.errors };
            delete newErrors[action.key];
            return {
                ...state,
                errors: newErrors
            };

        case ACTIONS.CLEAR_ALL_ERRORS:
            return {
                ...state,
                errors: {}
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
                    fetch: false
                }
            };

        case ACTIONS.CLEAR_CURRENT_LEAD:
            return {
                ...state,
                currentLead: null,
                leadTasks: [],
                leadContacts: []
            };

        case ACTIONS.SET_LEAD_TASKS:
            return {
                ...state,
                leadTasks: action.tasks,
                loading: {
                    ...state.loading,
                    tasks: false
                }
            };

        case ACTIONS.ADD_TASK:
            return {
                ...state,
                leadTasks: [...state.leadTasks, action.task],
                loading: {
                    ...state.loading,
                    tasks: false
                }
            };

        case ACTIONS.UPDATE_TASK:
            return {
                ...state,
                leadTasks: state.leadTasks.map(task =>
                    task.id === action.task.id ? action.task : task
                ),
                loading: {
                    ...state.loading,
                    tasks: false
                }
            };

        case ACTIONS.SET_LEAD_CONTACTS:
            return {
                ...state,
                leadContacts: action.contacts,
                loading: {
                    ...state.loading,
                    contacts: false
                }
            };

        case ACTIONS.ADD_CONTACT:
            return {
                ...state,
                leadContacts: [action.contact, ...state.leadContacts],
                loading: {
                    ...state.loading,
                    contacts: false
                }
            };

        case ACTIONS.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.pagination
                }
            };

        case ACTIONS.RESET_PAGINATION:
            return {
                ...state,
                pagination: initialState.pagination
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

        case ACTIONS.SET_SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.results,
                loading: {
                    ...state.loading,
                    search: false
                }
            };

        case ACTIONS.CLEAR_SEARCH:
            return {
                ...state,
                searchTerm: '',
                searchResults: []
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

        case ACTIONS.SET_ALERT_LEADS:
            return {
                ...state,
                alertLeads: action.leads,
                loading: {
                    ...state.loading,
                    alerts: false
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
    const setLoading = useCallback((key) => {
        dispatch({ type: ACTIONS.SET_LOADING, key });
    }, []);

    const clearLoading = useCallback((key) => {
        dispatch({ type: ACTIONS.CLEAR_LOADING, key });
    }, []);

    const setError = useCallback((key, error) => {
        console.error(`Erro em ${key}:`, error);
        dispatch({
            type: ACTIONS.SET_ERROR,
            key,
            error: error.message || 'Erro desconhecido'
        });
    }, []);

    const clearError = useCallback((key) => {
        dispatch({ type: ACTIONS.CLEAR_ERROR, key });
    }, []);

    // ===== CRUD OPERATIONS =====

    // Criar lead
    const createLead = useCallback(async (leadData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('create');
        clearError('create');

        try {
            const newLead = await leadService.createLead(currentUser.uid, leadData);
            dispatch({ type: ACTIONS.ADD_LEAD, lead: newLead });

            // Atualizar estatísticas
            await fetchStats();

            return newLead;
        } catch (error) {
            setError('create', error);
            throw error;
        }
    }, [currentUser]);

    // Buscar lead individual
    const fetchLead = useCallback(async (leadId) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('fetch');
        clearError('fetch');

        try {
            const lead = await leadService.getLead(currentUser.uid, leadId);
            dispatch({ type: ACTIONS.SET_CURRENT_LEAD, lead });
            return lead;
        } catch (error) {
            setError('fetch', error);
            throw error;
        }
    }, [currentUser]);

    // Listar leads
    const fetchLeads = useCallback(async (options = {}) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('list');
        clearError('list');

        try {
            const queryOptions = {
                ...state.filters,
                searchTerm: state.searchTerm,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
                pageSize: state.pagination.pageSize,
                lastDoc: state.pagination.lastDoc,
                ...options
            };

            const result = await leadService.getLeads(currentUser.uid, queryOptions);

            dispatch({ type: ACTIONS.SET_LEADS, leads: result.leads });
            dispatch({
                type: ACTIONS.SET_PAGINATION,
                pagination: {
                    hasMore: result.hasMore,
                    lastDoc: result.lastDoc
                }
            });

            return result;
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, [currentUser, state.filters, state.searchTerm, state.sortBy, state.sortOrder, state.pagination]);

    // Atualizar lead
    const updateLead = useCallback(async (leadId, updateData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('update');
        clearError('update');

        try {
            const updatedLead = await leadService.updateLead(
                currentUser.uid,
                leadId,
                updateData
            );
            dispatch({ type: ACTIONS.UPDATE_LEAD, lead: updatedLead });

            // Atualizar estatísticas
            await fetchStats();

            return updatedLead;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, [currentUser]);

    // Eliminar lead
    const deleteLead = useCallback(async (leadId) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('delete');
        clearError('delete');

        try {
            await leadService.deleteLead(currentUser.uid, leadId);
            dispatch({ type: ACTIONS.DELETE_LEAD, leadId });

            // Atualizar estatísticas
            await fetchStats();

            return true;
        } catch (error) {
            setError('delete', error);
            throw error;
        }
    }, [currentUser]);

    // ===== TASK OPERATIONS =====

    // Criar tarefa
    const createTask = useCallback(async (leadId, taskData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('tasks');
        clearError('tasks');

        try {
            const newTask = await leadService.createTask(
                currentUser.uid,
                leadId,
                taskData
            );
            dispatch({ type: ACTIONS.ADD_TASK, task: newTask });

            // Atualizar lead
            await fetchLead(leadId);

            return newTask;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser, fetchLead]);

    // Buscar tarefas da lead
    const fetchLeadTasks = useCallback(async (leadId) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('tasks');
        clearError('tasks');

        try {
            const tasks = await leadService.getLeadTasks(currentUser.uid, leadId);
            dispatch({ type: ACTIONS.SET_LEAD_TASKS, tasks });
            return tasks;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser]);

    // Completar tarefa
    const completeTask = useCallback(async (leadId, taskId, resultData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('tasks');
        clearError('tasks');

        try {
            await leadService.completeTask(
                currentUser.uid,
                leadId,
                taskId,
                resultData
            );

            // Atualizar tarefas e lead
            await fetchLeadTasks(leadId);
            await fetchLead(leadId);

            return true;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser, fetchLeadTasks, fetchLead]);

    // ===== CONTACT OPERATIONS =====

    // Adicionar contacto
    const addContact = useCallback(async (leadId, contactData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('contacts');
        clearError('contacts');

        try {
            const newContact = await leadService.addContact(
                currentUser.uid,
                leadId,
                contactData
            );
            dispatch({ type: ACTIONS.ADD_CONTACT, contact: newContact });

            // Atualizar lead
            await fetchLead(leadId);

            return newContact;
        } catch (error) {
            setError('contacts', error);
            throw error;
        }
    }, [currentUser, fetchLead]);

    // Buscar contactos da lead
    const fetchLeadContacts = useCallback(async (leadId) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('contacts');
        clearError('contacts');

        try {
            const contacts = await leadService.getLeadContacts(currentUser.uid, leadId);
            dispatch({ type: ACTIONS.SET_LEAD_CONTACTS, contacts });
            return contacts;
        } catch (error) {
            setError('contacts', error);
            throw error;
        }
    }, [currentUser]);

    // ===== CONVERSION OPERATIONS =====

    // Converter lead em cliente
    const convertLead = useCallback(async (leadId, clientData) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('convert');
        clearError('convert');

        try {
            const result = await leadService.convertLeadToClient(
                currentUser.uid,
                leadId,
                clientData
            );

            // Atualizar lead
            await fetchLead(leadId);

            // Atualizar estatísticas
            await fetchStats();

            return result;
        } catch (error) {
            setError('convert', error);
            throw error;
        }
    }, [currentUser, fetchLead]);

    // Marcar lead como perdida
    const markAsLost = useCallback(async (leadId, motivoPerda) => {
        if (!currentUser) throw new Error('Utilizador não autenticado');

        setLoading('update');
        clearError('update');

        try {
            await leadService.markLeadAsLost(currentUser.uid, leadId, motivoPerda);

            // Atualizar lead e estatísticas
            await fetchLead(leadId);
            await fetchStats();

            return true;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, [currentUser, fetchLead]);

    // ===== STATS & ALERTS =====

    // Buscar estatísticas
    const fetchStats = useCallback(async () => {
        if (!currentUser) return;

        setLoading('stats');
        clearError('stats');

        try {
            const stats = await leadService.getLeadsStats(currentUser.uid);
            dispatch({ type: ACTIONS.SET_STATS, stats });
            return stats;
        } catch (error) {
            setError('stats', error);
            throw error;
        }
    }, [currentUser]);

    // Buscar leads com alertas
    const fetchAlertLeads = useCallback(async () => {
        if (!currentUser) return;

        setLoading('alerts');
        clearError('alerts');

        try {
            const alertLeads = await leadService.getAlertLeads(currentUser.uid);
            dispatch({ type: ACTIONS.SET_ALERT_LEADS, leads: alertLeads });
            return alertLeads;
        } catch (error) {
            setError('alerts', error);
            throw error;
        }
    }, [currentUser]);

    // ===== SEARCH & FILTERS =====

    // Pesquisar leads
    const searchLeads = useCallback(async (searchTerm) => {
        dispatch({ type: ACTIONS.SET_SEARCH_TERM, term: searchTerm });

        if (!searchTerm) {
            dispatch({ type: ACTIONS.CLEAR_SEARCH });
            return;
        }

        await fetchLeads({ searchTerm });
    }, [fetchLeads]);

    // Definir filtros
    const setFilters = useCallback((filters) => {
        dispatch({ type: ACTIONS.SET_FILTERS, filters });
        dispatch({ type: ACTIONS.RESET_PAGINATION });
    }, []);

    // Limpar filtros
    const resetFilters = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_FILTERS });
        dispatch({ type: ACTIONS.RESET_PAGINATION });
    }, []);

    // Limpar pesquisa
    const clearSearch = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_SEARCH });
    }, []);

    // Limpar lead atual
    const clearCurrentLead = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_CURRENT_LEAD });
    }, []);

    // ===== EFFECTS =====

    // Carregar estatísticas ao montar
    useEffect(() => {
        if (currentUser) {
            fetchStats();
            fetchAlertLeads();
        }
    }, [currentUser]);

    // ===== CONTEXT VALUE =====
    const value = {
        // Estado
        ...state,

        // Operações CRUD
        createLead,
        fetchLead,
        fetchLeads,
        updateLead,
        deleteLead,

        // Operações de tarefas
        createTask,
        fetchLeadTasks,
        completeTask,

        // Operações de contactos
        addContact,
        fetchLeadContacts,

        // Operações de conversão
        convertLead,
        markAsLost,

        // Estatísticas e alertas
        fetchStats,
        fetchAlertLeads,

        // Pesquisa e filtros
        searchLeads,
        setFilters,
        resetFilters,
        clearSearch,

        // Utilitários
        clearCurrentLead,
        clearError,
        setLoading,
        clearLoading
    };

    return (
        <LeadContext.Provider value={value}>
            {children}
        </LeadContext.Provider>
    );
}