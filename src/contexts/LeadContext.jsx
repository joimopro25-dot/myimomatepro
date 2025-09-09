/**
 * LEAD CONTEXT - MyImoMatePro
 * Estado global para gestão de leads com React Context
 * 
 * Caminho: src/contexts/LeadContext.jsx
 * Estrutura: consultores/{consultorId}/leads/{leadId}
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    createLead,
    getLead,
    listLeads,
    updateLead,
    deleteLead,
    createTask,
    getLeadTasks,
    completeTask,
    addContact,
    getLeadContacts,
    convertLeadToClient,
    searchLeads,
    getLeadStats,
    getLeadsNeedingAlert
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
    leadTasks: [],
    leadContacts: [],
    stats: null,
    alertLeads: [],

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
        fonte: 'all',
        interesse: 'all',
        temperatura: 'all'
    },
    searchTerm: '',
    searchResults: [],

    // Estados de loading
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        current: false,
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
                    lead.id === action.lead.id ? { ...lead, ...action.lead } : lead
                ),
                currentLead: state.currentLead?.id === action.lead.id
                    ? { ...state.currentLead, ...action.lead }
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
                currentLead: state.currentLead?.id === action.leadId ? null : state.currentLead,
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
                    current: false
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
                leadTasks: [action.task, ...state.leadTasks],
                loading: {
                    ...state.loading,
                    tasks: false
                }
            };

        case ACTIONS.UPDATE_TASK:
            return {
                ...state,
                leadTasks: state.leadTasks.map(task =>
                    task.id === action.task.id ? { ...task, ...action.task } : task
                )
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
                pagination: {
                    ...initialState.pagination
                }
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
                filters: { ...initialState.filters }
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
    const handleCreateLead = useCallback(async (leadData) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('create');
            clearError('create');

            // 1. Criar lead no Firestore
            const newLead = await createLead(currentUser.uid, leadData);

            // 2. Adicionar ao estado local
            dispatch({ type: ACTIONS.ADD_LEAD, lead: newLead });

            // 3. ✅ NOVA: Atualizar estatísticas imediatamente
            try {
                const updatedStats = await getLeadStats(currentUser.uid);
                dispatch({ type: ACTIONS.SET_STATS, stats: updatedStats });
            } catch (statsError) {
                console.warn('Erro ao atualizar estatísticas:', statsError);
                // Não falhar a criação por causa das estatísticas
            }

            return newLead;
        } catch (error) {
            setError('create', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Obter lead
    const handleFetchLead = useCallback(async (leadId) => {
        if (!currentUser || !leadId) return;

        try {
            setLoading('current');
            clearError('current');

            const lead = await getLead(currentUser.uid, leadId);

            dispatch({ type: ACTIONS.SET_CURRENT_LEAD, lead });

            return lead;
        } catch (error) {
            setError('current', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Listar leads
    const handleFetchLeads = useCallback(async (options = {}) => {
        if (!currentUser) return;

        try {
            setLoading('list');
            clearError('list');

            const {
                resetPagination = false,
                ...listOptions
            } = options;

            if (resetPagination) {
                dispatch({ type: ACTIONS.RESET_PAGINATION });
            }

            const finalOptions = {
                ...listOptions,
                ...state.filters,
                pageSize: state.pagination.pageSize,
                lastDoc: resetPagination ? null : state.pagination.lastDoc
            };

            const result = await listLeads(currentUser.uid, finalOptions);

            if (resetPagination) {
                dispatch({ type: ACTIONS.SET_LEADS, leads: result.leads });
            } else {
                dispatch({
                    type: ACTIONS.SET_LEADS,
                    leads: [...state.leads, ...result.leads]
                });
            }

            dispatch({
                type: ACTIONS.SET_PAGINATION,
                pagination: {
                    hasMore: result.hasMore,
                    lastDoc: result.lastDoc,
                    page: resetPagination ? 1 : state.pagination.page + 1
                }
            });

            return result;
        } catch (error) {
            setError('list', error);
            throw error;
        }
    }, [currentUser, state.filters, state.pagination, state.leads, setLoading, setError, clearError]);

    // Atualizar lead
    const handleUpdateLead = useCallback(async (leadId, updateData) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('update');
            clearError('update');

            const updatedLead = await updateLead(currentUser.uid, leadId, updateData);

            dispatch({ type: ACTIONS.UPDATE_LEAD, lead: updatedLead });

            return updatedLead;
        } catch (error) {
            setError('update', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Eliminar lead
    const handleDeleteLead = useCallback(async (leadId) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('delete');
            clearError('delete');

            await deleteLead(currentUser.uid, leadId);

            dispatch({ type: ACTIONS.DELETE_LEAD, leadId });

            return true;
        } catch (error) {
            setError('delete', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // ===== TASK OPERATIONS =====

    // Criar tarefa
    const handleCreateTask = useCallback(async (leadId, taskData) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('tasks');
            clearError('tasks');

            const newTask = await createTask(currentUser.uid, leadId, taskData);

            dispatch({ type: ACTIONS.ADD_TASK, task: newTask });

            return newTask;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Obter tarefas da lead
    const handleFetchLeadTasks = useCallback(async (leadId, status = 'all') => {
        if (!currentUser || !leadId) return;

        try {
            setLoading('tasks');
            clearError('tasks');

            const tasks = await getLeadTasks(currentUser.uid, leadId, status);

            dispatch({ type: ACTIONS.SET_LEAD_TASKS, tasks });

            return tasks;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Completar tarefa
    const handleCompleteTask = useCallback(async (leadId, taskId, resultado) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            await completeTask(currentUser.uid, leadId, taskId, resultado);

            dispatch({
                type: ACTIONS.UPDATE_TASK,
                task: {
                    id: taskId,
                    status: 'concluida',
                    resultado
                }
            });

            return true;
        } catch (error) {
            setError('tasks', error);
            throw error;
        }
    }, [currentUser, setError]);

    // ===== CONTACT OPERATIONS =====

    // Adicionar contacto
    const handleAddContact = useCallback(async (leadId, contactData) => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('contacts');
            clearError('contacts');

            const newContact = await addContact(currentUser.uid, leadId, contactData);

            dispatch({ type: ACTIONS.ADD_CONTACT, contact: newContact });

            // Atualizar lead com último contacto
            if (state.currentLead?.id === leadId) {
                dispatch({
                    type: ACTIONS.UPDATE_LEAD,
                    lead: {
                        id: leadId,
                        ultimoContacto: new Date(),
                        temperatura: 'quente'
                    }
                });
            }

            return newContact;
        } catch (error) {
            setError('contacts', error);
            throw error;
        }
    }, [currentUser, state.currentLead, setLoading, setError, clearError]);

    // Obter contactos da lead
    const handleFetchLeadContacts = useCallback(async (leadId) => {
        if (!currentUser || !leadId) return;

        try {
            setLoading('contacts');
            clearError('contacts');

            const contacts = await getLeadContacts(currentUser.uid, leadId);

            dispatch({ type: ACTIONS.SET_LEAD_CONTACTS, contacts });

            return contacts;
        } catch (error) {
            setError('contacts', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // ===== CONVERSION =====

    // Converter lead para cliente
    const handleConvertLead = useCallback(async (leadId, notes = '') => {
        if (!currentUser) {
            throw new Error('Utilizador não autenticado');
        }

        try {
            setLoading('convert');
            clearError('convert');

            const result = await convertLeadToClient(currentUser.uid, leadId, notes);

            // Atualizar lead como convertida
            dispatch({
                type: ACTIONS.UPDATE_LEAD,
                lead: {
                    id: leadId,
                    status: 'convertida',
                    'conversao.convertida': true,
                    'conversao.clienteId': result.clientId
                }
            });

            return result;
        } catch (error) {
            setError('convert', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // ===== SEARCH OPERATIONS =====

    // Pesquisar leads
    const handleSearchLeads = useCallback(async (searchTerm) => {
        if (!currentUser || !searchTerm.trim()) {
            dispatch({ type: ACTIONS.CLEAR_SEARCH });
            return;
        }

        try {
            setLoading('search');
            clearError('search');

            const results = await searchLeads(currentUser.uid, searchTerm);

            dispatch({ type: ACTIONS.SET_SEARCH_TERM, term: searchTerm });
            dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, results });

            return results;
        } catch (error) {
            setError('search', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // ===== ANALYTICS =====

    // Obter estatísticas
    const handleFetchStats = useCallback(async () => {
        if (!currentUser) return;

        try {
            setLoading('stats');
            clearError('stats');

            const stats = await getLeadStats(currentUser.uid);

            dispatch({ type: ACTIONS.SET_STATS, stats });

            return stats;
        } catch (error) {
            setError('stats', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // Obter leads com alerta
    const handleFetchAlertLeads = useCallback(async () => {
        if (!currentUser) return;

        try {
            setLoading('alerts');
            clearError('alerts');

            const alertLeads = await getLeadsNeedingAlert(currentUser.uid);

            dispatch({ type: ACTIONS.SET_ALERT_LEADS, leads: alertLeads });

            return alertLeads;
        } catch (error) {
            setError('alerts', error);
            throw error;
        }
    }, [currentUser, setLoading, setError, clearError]);

    // ===== FILTER OPERATIONS =====

    // Definir filtros
    const handleSetFilters = useCallback((filters) => {
        dispatch({ type: ACTIONS.SET_FILTERS, filters });
    }, []);

    // Reset filtros
    const handleResetFilters = useCallback(() => {
        dispatch({ type: ACTIONS.RESET_FILTERS });
    }, []);

    // ===== UTILITY FUNCTIONS =====

    // Limpar lead atual
    const handleClearCurrentLead = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_CURRENT_LEAD });
    }, []);

    // Limpar pesquisa
    const handleClearSearch = useCallback(() => {
        dispatch({ type: ACTIONS.CLEAR_SEARCH });
    }, []);

    // ===== AUTO-LOAD STATS ON MOUNT =====
    useEffect(() => {
        if (currentUser) {
            handleFetchStats();
            handleFetchAlertLeads();
        }
    }, [currentUser, handleFetchStats, handleFetchAlertLeads]);

    // ===== CONTEXT VALUE =====
    const value = {
        // Estado
        ...state,

        // CRUD operations
        createLead: handleCreateLead,
        fetchLead: handleFetchLead,
        fetchLeads: handleFetchLeads,
        updateLead: handleUpdateLead,
        deleteLead: handleDeleteLead,

        // Task operations
        createTask: handleCreateTask,
        fetchLeadTasks: handleFetchLeadTasks,
        completeTask: handleCompleteTask,

        // Contact operations
        addContact: handleAddContact,
        fetchLeadContacts: handleFetchLeadContacts,

        // Conversion
        convertLead: handleConvertLead,

        // Search
        searchLeads: handleSearchLeads,
        clearSearch: handleClearSearch,

        // Analytics
        fetchStats: handleFetchStats,
        fetchAlertLeads: handleFetchAlertLeads,

        // Filters
        setFilters: handleSetFilters,
        resetFilters: handleResetFilters,

        // Utility
        clearCurrentLead: handleClearCurrentLead,
        clearError
    };

    return (
        <LeadContext.Provider value={value}>
            {children}
        </LeadContext.Provider>
    );
}

export default LeadProvider;