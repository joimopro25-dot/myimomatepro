/**
 * NEGOCIO PLENO CONTEXT - MyImoMatePro
 * Contexto React para gestão de negócios plenos
 * 
 * Caminho: src/contexts/NegocioPlenoContext.jsx
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    createNegocioPleno,
    getNegocioPleno,
    listNegociosPlenos,
    getNegocioPlenoByOpportunity,
    updateNegocioPleno,
    addTimelineEventToNegocio,
    updateChecklist,
    unlinkNegocioPleno,
    archiveNegocioPleno,
    getNegocioPlenoStats,
    migrateDataToNegocioPleno
} from '../services/negocioPlenoService';
import {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_TIMELINE_EVENTS,
    calculateBusinessValues,
    calculateCommissions,
    canTransitionToState,
    getNextSteps,
    getStateColor
} from '../models/negocioPlenoModel';

// ===== CONTEXTO =====
const NegocioPlenoContext = createContext();

// ===== HOOK PERSONALIZADO =====
export function useNegociosPlenos() {
    const context = useContext(NegocioPlenoContext);
    if (!context) {
        throw new Error('useNegociosPlenos deve ser usado dentro de NegocioPlenoProvider');
    }
    return context;
}

// ===== ACTION TYPES =====
const ActionTypes = {
    // Loading states
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',

    // Negócios Plenos
    SET_NEGOCIOS: 'SET_NEGOCIOS',
    ADD_NEGOCIO: 'ADD_NEGOCIO',
    UPDATE_NEGOCIO: 'UPDATE_NEGOCIO',
    REMOVE_NEGOCIO: 'REMOVE_NEGOCIO',

    // Current negócio
    SET_CURRENT_NEGOCIO: 'SET_CURRENT_NEGOCIO',
    UPDATE_CURRENT_NEGOCIO: 'UPDATE_CURRENT_NEGOCIO',
    CLEAR_CURRENT_NEGOCIO: 'CLEAR_CURRENT_NEGOCIO',

    // Timeline
    ADD_TIMELINE_EVENT: 'ADD_TIMELINE_EVENT',

    // Checklist
    UPDATE_CHECKLIST_ITEM: 'UPDATE_CHECKLIST_ITEM',

    // Stats
    SET_STATS: 'SET_STATS',

    // Filters
    SET_FILTERS: 'SET_FILTERS',
    CLEAR_FILTERS: 'CLEAR_FILTERS',

    // Pagination
    SET_PAGINATION: 'SET_PAGINATION',

    // UI States
    SET_MODAL_STATE: 'SET_MODAL_STATE',
    SET_SELECTED_TAB: 'SET_SELECTED_TAB'
};

// ===== ESTADO INICIAL =====
const initialState = {
    // Lista de negócios plenos
    negocios: [],

    // Negócio pleno atual
    currentNegocio: null,

    // Estados de loading
    loading: false,
    loadingCurrent: false,
    saving: false,
    error: null,

    // Estatísticas
    stats: {
        total: 0,
        porEstado: {},
        valorTotal: 0,
        comissaoTotal: 0,
        porMes: {}
    },

    // Filtros
    filters: {
        estado: null,
        clienteId: null,
        searchTerm: '',
        dateRange: null
    },

    // Paginação
    pagination: {
        lastDoc: null,
        hasMore: true,
        pageSize: 20
    },

    // UI States
    modalState: {
        isLinkModalOpen: false,
        isDetailsModalOpen: false,
        selectedOpportunities: null
    },

    selectedTab: 'geral'
};

// ===== REDUCER =====
function negocioPlenoReducer(state, action) {
    switch (action.type) {
        // Loading states
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };

        case ActionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                loading: false,
                saving: false
            };

        // Negócios Plenos
        case ActionTypes.SET_NEGOCIOS:
            return {
                ...state,
                negocios: action.payload,
                loading: false
            };

        case ActionTypes.ADD_NEGOCIO:
            return {
                ...state,
                negocios: [action.payload, ...state.negocios]
            };

        case ActionTypes.UPDATE_NEGOCIO:
            return {
                ...state,
                negocios: state.negocios.map(n =>
                    n.id === action.payload.id ? action.payload : n
                )
            };

        case ActionTypes.REMOVE_NEGOCIO:
            return {
                ...state,
                negocios: state.negocios.filter(n => n.id !== action.payload)
            };

        // Current negócio
        case ActionTypes.SET_CURRENT_NEGOCIO:
            return {
                ...state,
                currentNegocio: action.payload,
                loadingCurrent: false
            };

        case ActionTypes.UPDATE_CURRENT_NEGOCIO:
            return {
                ...state,
                currentNegocio: {
                    ...state.currentNegocio,
                    ...action.payload
                }
            };

        case ActionTypes.CLEAR_CURRENT_NEGOCIO:
            return {
                ...state,
                currentNegocio: null
            };

        // Timeline
        case ActionTypes.ADD_TIMELINE_EVENT:
            if (!state.currentNegocio) return state;
            return {
                ...state,
                currentNegocio: {
                    ...state.currentNegocio,
                    timeline: [...(state.currentNegocio.timeline || []), action.payload]
                }
            };

        // Checklist
        case ActionTypes.UPDATE_CHECKLIST_ITEM:
            if (!state.currentNegocio) return state;
            return {
                ...state,
                currentNegocio: {
                    ...state.currentNegocio,
                    checklist: {
                        ...state.currentNegocio.checklist,
                        [action.payload.item]: action.payload.value
                    }
                }
            };

        // Stats
        case ActionTypes.SET_STATS:
            return {
                ...state,
                stats: action.payload
            };

        // Filters
        case ActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: {
                    ...state.filters,
                    ...action.payload
                }
            };

        case ActionTypes.CLEAR_FILTERS:
            return {
                ...state,
                filters: initialState.filters
            };

        // Pagination
        case ActionTypes.SET_PAGINATION:
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    ...action.payload
                }
            };

        // UI States
        case ActionTypes.SET_MODAL_STATE:
            return {
                ...state,
                modalState: {
                    ...state.modalState,
                    ...action.payload
                }
            };

        case ActionTypes.SET_SELECTED_TAB:
            return {
                ...state,
                selectedTab: action.payload
            };

        default:
            return state;
    }
}

// ===== PROVIDER COMPONENT =====
export function NegocioPlenoProvider({ children }) {
    const { currentUser } = useAuth();
    const [state, dispatch] = useReducer(negocioPlenoReducer, initialState);

    // ===== HELPER FUNCTIONS =====

    const setLoading = useCallback((loading) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    }, []);

    const setError = useCallback((error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: null });
    }, []);

    // ===== NEGÓCIO PLENO OPERATIONS =====

    /**
     * Criar novo negócio pleno linkando duas oportunidades
     */
    const linkOpportunities = useCallback(async (linkData) => {
        if (!currentUser?.uid) {
            setError('Usuário não autenticado');
            return null;
        }

        setLoading(true);
        clearError();

        try {
            const negocioData = {
                ...linkData,
                userId: currentUser.uid
            };

            const result = await createNegocioPleno(currentUser.uid, negocioData);

            dispatch({ type: ActionTypes.ADD_NEGOCIO, payload: result });
            dispatch({ type: ActionTypes.SET_CURRENT_NEGOCIO, payload: result });

            return result;
        } catch (error) {
            console.error('Erro ao criar negócio pleno:', error);
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    /**
     * Carregar lista de negócios plenos
     */
    const loadNegociosPlenos = useCallback(async (filters = {}) => {
        if (!currentUser?.uid) {
            setError('Usuário não autenticado');
            return;
        }

        setLoading(true);
        clearError();

        try {
            const result = await listNegociosPlenos(currentUser.uid, {
                ...filters,
                ...state.filters
            });

            dispatch({ type: ActionTypes.SET_NEGOCIOS, payload: result.negociosPlenos });
            dispatch({
                type: ActionTypes.SET_PAGINATION,
                payload: {
                    lastDoc: result.lastDoc,
                    hasMore: result.hasMore
                }
            });
        } catch (error) {
            console.error('Erro ao carregar negócios plenos:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser, state.filters]);

    /**
     * Carregar negócio pleno específico
     */
    const loadNegocioPleno = useCallback(async (negocioPlenoId) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return null;
        }

        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        clearError();

        try {
            const result = await getNegocioPleno(currentUser.uid, negocioPlenoId);
            dispatch({ type: ActionTypes.SET_CURRENT_NEGOCIO, payload: result });
            return result;
        } catch (error) {
            console.error('Erro ao carregar negócio pleno:', error);
            setError(error.message);
            return null;
        } finally {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
    }, [currentUser]);

    /**
     * Buscar negócio pleno por oportunidade
     */
    const findNegocioPlenoByOpportunity = useCallback(async (opportunityId) => {
        if (!currentUser?.uid || !opportunityId) {
            return null;
        }

        try {
            const result = await getNegocioPlenoByOpportunity(currentUser.uid, opportunityId);
            return result;
        } catch (error) {
            console.error('Erro ao buscar negócio pleno:', error);
            return null;
        }
    }, [currentUser]);

    /**
     * Atualizar negócio pleno
     */
    const updateNegocio = useCallback(async (negocioPlenoId, updateData) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        clearError();

        try {
            const updatedData = {
                ...updateData,
                userId: currentUser.uid
            };

            const result = await updateNegocioPleno(currentUser.uid, negocioPlenoId, updatedData);

            dispatch({ type: ActionTypes.UPDATE_NEGOCIO, payload: result });

            if (state.currentNegocio?.id === negocioPlenoId) {
                dispatch({ type: ActionTypes.SET_CURRENT_NEGOCIO, payload: result });
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar negócio pleno:', error);
            setError(error.message);
            return false;
        } finally {
            dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
    }, [currentUser, state.currentNegocio]);

    /**
     * Mudar estado do negócio
     */
    const changeNegocioState = useCallback(async (negocioPlenoId, newState) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        // Verificar se pode transitar
        const currentNegocio = state.negocios.find(n => n.id === negocioPlenoId) || state.currentNegocio;
        if (currentNegocio && !canTransitionToState(currentNegocio.estado, newState)) {
            setError(`Não é possível mudar de ${currentNegocio.estado} para ${newState}`);
            return false;
        }

        return await updateNegocio(negocioPlenoId, { estado: newState });
    }, [currentUser, state.negocios, state.currentNegocio, updateNegocio]);

    /**
     * Adicionar evento à timeline
     */
    const addTimelineEvent = useCallback(async (negocioPlenoId, eventData) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        clearError();

        try {
            const event = await addTimelineEventToNegocio(currentUser.uid, negocioPlenoId, {
                ...eventData,
                dados: {
                    ...eventData.dados,
                    userId: currentUser.uid
                }
            });

            dispatch({ type: ActionTypes.ADD_TIMELINE_EVENT, payload: event });
            return true;
        } catch (error) {
            console.error('Erro ao adicionar evento:', error);
            setError(error.message);
            return false;
        }
    }, [currentUser]);

    /**
     * Atualizar item do checklist
     */
    const updateChecklistItem = useCallback(async (negocioPlenoId, item, value) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        clearError();

        try {
            await updateChecklist(currentUser.uid, negocioPlenoId, item, value);
            dispatch({
                type: ActionTypes.UPDATE_CHECKLIST_ITEM,
                payload: { item, value }
            });
            return true;
        } catch (error) {
            console.error('Erro ao atualizar checklist:', error);
            setError(error.message);
            return false;
        }
    }, [currentUser]);

    /**
     * Deslinkar oportunidades
     */
    const unlinkOpportunities = useCallback(async (negocioPlenoId) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            await unlinkNegocioPleno(currentUser.uid, negocioPlenoId);

            dispatch({ type: ActionTypes.REMOVE_NEGOCIO, payload: negocioPlenoId });

            if (state.currentNegocio?.id === negocioPlenoId) {
                dispatch({ type: ActionTypes.CLEAR_CURRENT_NEGOCIO });
            }

            return true;
        } catch (error) {
            console.error('Erro ao deslinkar oportunidades:', error);
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentUser, state.currentNegocio]);

    /**
     * Arquivar negócio pleno
     */
    const archiveNegocio = useCallback(async (negocioPlenoId) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        setLoading(true);
        clearError();

        try {
            await archiveNegocioPleno(currentUser.uid, negocioPlenoId, currentUser.uid);
            dispatch({ type: ActionTypes.REMOVE_NEGOCIO, payload: negocioPlenoId });
            return true;
        } catch (error) {
            console.error('Erro ao arquivar negócio pleno:', error);
            setError(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    /**
     * Carregar estatísticas
     */
    const loadStats = useCallback(async () => {
        if (!currentUser?.uid) return;

        try {
            const stats = await getNegocioPlenoStats(currentUser.uid);
            dispatch({ type: ActionTypes.SET_STATS, payload: stats });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }, [currentUser]);

    /**
     * Migrar dados existentes
     */
    const migrateData = useCallback(async (negocioPlenoId, sourceType, data) => {
        if (!currentUser?.uid || !negocioPlenoId) {
            setError('Dados inválidos');
            return false;
        }

        clearError();

        try {
            await migrateDataToNegocioPleno(currentUser.uid, negocioPlenoId, sourceType, data);

            // Recarregar negócio para obter dados atualizados
            await loadNegocioPleno(negocioPlenoId);

            return true;
        } catch (error) {
            console.error('Erro ao migrar dados:', error);
            setError(error.message);
            return false;
        }
    }, [currentUser, loadNegocioPleno]);

    // ===== FILTER OPERATIONS =====

    const setFilters = useCallback((filters) => {
        dispatch({ type: ActionTypes.SET_FILTERS, payload: filters });
    }, []);

    const clearFilters = useCallback(() => {
        dispatch({ type: ActionTypes.CLEAR_FILTERS });
    }, []);

    // ===== UI OPERATIONS =====

    const setModalState = useCallback((modalState) => {
        dispatch({ type: ActionTypes.SET_MODAL_STATE, payload: modalState });
    }, []);

    const setSelectedTab = useCallback((tab) => {
        dispatch({ type: ActionTypes.SET_SELECTED_TAB, payload: tab });
    }, []);

    // ===== UTILITY FUNCTIONS =====

    /**
     * Calcular valores do negócio
     */
    const calculateValues = useCallback((valorAcordado, sinalPercentagem = 10, reforcoPercentagem = 0) => {
        return calculateBusinessValues(valorAcordado, sinalPercentagem, reforcoPercentagem);
    }, []);

    /**
     * Calcular comissões
     */
    const calculateComissoes = useCallback((valorAcordado, percentagemTotal = 5, divisao = { vendedor: 50, comprador: 50 }) => {
        return calculateCommissions(valorAcordado, percentagemTotal, divisao);
    }, []);

    /**
     * Obter próximos passos
     */
    const getProximosPassos = useCallback((estado) => {
        return getNextSteps(estado);
    }, []);

    /**
     * Obter cor do estado
     */
    const getEstadoCor = useCallback((estado) => {
        return getStateColor(estado);
    }, []);

    // ===== AUTO-LOAD STATS =====
    useEffect(() => {
        if (currentUser?.uid) {
            loadStats();
        }
    }, [currentUser, loadStats]);

    // ===== CONTEXT VALUE =====
    const value = {
        // State
        ...state,

        // Actions - Negócios
        linkOpportunities,
        loadNegociosPlenos,
        loadNegocioPleno,
        findNegocioPlenoByOpportunity,
        updateNegocio,
        changeNegocioState,
        unlinkOpportunities,
        archiveNegocio,

        // Actions - Timeline & Checklist
        addTimelineEvent,
        updateChecklistItem,

        // Actions - Data
        migrateData,
        loadStats,

        // Actions - Filters
        setFilters,
        clearFilters,

        // Actions - UI
        setModalState,
        setSelectedTab,

        // Actions - Utilities
        clearError,
        calculateValues,
        calculateComissoes,
        getProximosPassos,
        getEstadoCor,

        // Constants
        NEGOCIO_PLENO_STATES,
        NEGOCIO_TIMELINE_EVENTS
    };

    return (
        <NegocioPlenoContext.Provider value={value}>
            {children}
        </NegocioPlenoContext.Provider>
    );
}

// ===== EXPORT =====
export default NegocioPlenoContext;