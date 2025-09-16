/**
 * OPPORTUNITY CONTEXT - MyImoMatePro
 * VERSÃO INTEGRADA com suporte completo para imóveis, visitas, ofertas e CPCV
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
    getConsultorOpportunityStats,
    // NOVO: Métodos para imóveis
    addPropertyToOpportunity,
    updatePropertyInOpportunity,
    addVisitToProperty,
    addOfferToProperty,
    addCPCVToProperty
} from '../services/opportunityService';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_STATES,
    TIMELINE_EVENT_TYPES,
    // NOVO: Estados adicionais
    VISIT_STATES,
    OFFER_STATES,
    PROPERTY_BUSINESS_STATES,
    INTEREST_LEVELS,
    createPropertySchema,
    createVisitSchema,
    createOfferSchema,
    createCPCVSchema
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

    // NOVO: Estados para gestão de imóveis
    currentProperty: null,
    currentVisit: null,
    currentOffer: null,
    currentCPCV: null,

    stats: {
        client: null,
        consultor: null,
        properties: null // NOVO: Estatísticas de imóveis
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
        clienteId: null,
        // NOVO: Filtros adicionais
        temVisitas: null,
        temOfertas: null,
        temCPCV: null
    },

    // Estados de loading
    loading: {
        list: false,
        create: false,
        update: false,
        delete: false,
        stats: false,
        // NOVO: Loading states adicionais
        property: false,
        visit: false,
        offer: false,
        cpcv: false
    },

    // Erros
    errors: {
        list: null,
        create: null,
        update: null,
        delete: null,
        stats: null,
        // NOVO: Erros adicionais
        property: null,
        visit: null,
        offer: null,
        cpcv: null
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

    // NOVO: Actions para imóveis
    SET_CURRENT_PROPERTY: 'SET_CURRENT_PROPERTY',
    ADD_PROPERTY: 'ADD_PROPERTY',
    UPDATE_PROPERTY: 'UPDATE_PROPERTY',
    REMOVE_PROPERTY: 'REMOVE_PROPERTY',

    // NOVO: Actions para visitas
    SET_CURRENT_VISIT: 'SET_CURRENT_VISIT',
    ADD_VISIT: 'ADD_VISIT',
    UPDATE_VISIT: 'UPDATE_VISIT',

    // NOVO: Actions para ofertas
    SET_CURRENT_OFFER: 'SET_CURRENT_OFFER',
    ADD_OFFER: 'ADD_OFFER',
    UPDATE_OFFER: 'UPDATE_OFFER',

    // NOVO: Actions para CPCV
    SET_CURRENT_CPCV: 'SET_CURRENT_CPCV',
    ADD_CPCV: 'ADD_CPCV',
    UPDATE_CPCV: 'UPDATE_CPCV',

    // Stats
    SET_CLIENT_STATS: 'SET_CLIENT_STATS',
    SET_CONSULTOR_STATS: 'SET_CONSULTOR_STATS',
    SET_PROPERTY_STATS: 'SET_PROPERTY_STATS', // NOVO

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
                    : state.currentOpportunity,
                // Atualizar também em clientOpportunities se existir
                clientOpportunities: Object.keys(state.clientOpportunities).reduce((acc, clientId) => {
                    acc[clientId] = state.clientOpportunities[clientId].map(opp =>
                        opp.id === action.payload.id ? action.payload : opp
                    );
                    return acc;
                }, {})
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

        // NOVO: Property Actions
        case ActionTypes.SET_CURRENT_PROPERTY:
            return {
                ...state,
                currentProperty: action.payload
            };

        case ActionTypes.ADD_PROPERTY:
            return {
                ...state,
                currentOpportunity: state.currentOpportunity ? {
                    ...state.currentOpportunity,
                    imoveis: [...(state.currentOpportunity.imoveis || []), action.payload]
                } : state.currentOpportunity
            };

        case ActionTypes.UPDATE_PROPERTY:
            return {
                ...state,
                currentOpportunity: state.currentOpportunity ? {
                    ...state.currentOpportunity,
                    imoveis: (state.currentOpportunity.imoveis || []).map(prop =>
                        prop.id === action.payload.id ? action.payload : prop
                    )
                } : state.currentOpportunity
            };

        case ActionTypes.REMOVE_PROPERTY:
            return {
                ...state,
                currentOpportunity: state.currentOpportunity ? {
                    ...state.currentOpportunity,
                    imoveis: (state.currentOpportunity.imoveis || []).filter(prop =>
                        prop.id !== action.payload
                    )
                } : state.currentOpportunity
            };

        // NOVO: Visit Actions
        case ActionTypes.SET_CURRENT_VISIT:
            return {
                ...state,
                currentVisit: action.payload
            };

        case ActionTypes.ADD_VISIT:
            return state;

        case ActionTypes.UPDATE_VISIT:
            return state;

        // NOVO: Offer Actions
        case ActionTypes.SET_CURRENT_OFFER:
            return {
                ...state,
                currentOffer: action.payload
            };

        case ActionTypes.ADD_OFFER:
            return state;

        case ActionTypes.UPDATE_OFFER:
            return state;

        // NOVO: CPCV Actions
        case ActionTypes.SET_CURRENT_CPCV:
            return {
                ...state,
                currentCPCV: action.payload
            };

        case ActionTypes.ADD_CPCV:
            return state;

        case ActionTypes.UPDATE_CPCV:
            return state;

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

        case ActionTypes.SET_PROPERTY_STATS:
            return {
                ...state,
                stats: {
                    ...state.stats,
                    properties: action.payload
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

    // ===== NOVO: PROPERTY OPERATIONS =====

    const addProperty = useCallback(async (clienteId, opportunityId, propertyData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('property', true);
        setError('property', null);

        try {
            const newProperty = await addPropertyToOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyData
            );

            dispatch({ type: ActionTypes.ADD_PROPERTY, payload: newProperty });

            // Adicionar evento à timeline
            await addEventToTimeline(clienteId, opportunityId, {
                tipo: TIMELINE_EVENT_TYPES.PROPERTY_ADDED,
                descricao: `Imóvel ${propertyData.referencia} adicionado`,
                dados: { propertyId: newProperty.id }
            });

            setLoading('property', false);
            return newProperty;

        } catch (error) {
            setError('property', error.message);
            setLoading('property', false);
            throw error;
        }
    }, [currentUser, setLoading, setError]);

    const updateProperty = useCallback(async (clienteId, opportunityId, propertyId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('property', true);
        setError('property', null);

        try {
            await updatePropertyInOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                updates
            );

            const updatedProperty = { ...state.currentProperty, ...updates, id: propertyId };
            dispatch({ type: ActionTypes.UPDATE_PROPERTY, payload: updatedProperty });

            setLoading('property', false);
            return updatedProperty;

        } catch (error) {
            setError('property', error.message);
            setLoading('property', false);
            throw error;
        }
    }, [currentUser, state.currentProperty, setLoading, setError]);

    // ===== NOVO: VISIT OPERATIONS =====

    const addVisit = useCallback(async (clienteId, opportunityId, propertyId, visitData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('visit', true);
        setError('visit', null);

        try {
            const newVisit = await addVisitToProperty(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                visitData
            );

            // Recarregar oportunidade para atualizar estado
            await fetchOpportunity(clienteId, opportunityId);

            // Adicionar evento à timeline
            await addEventToTimeline(clienteId, opportunityId, {
                tipo: visitData.estado === VISIT_STATES.COMPLETED
                    ? TIMELINE_EVENT_TYPES.VISIT_COMPLETED
                    : TIMELINE_EVENT_TYPES.VISIT_SCHEDULED,
                descricao: visitData.estado === VISIT_STATES.COMPLETED
                    ? `Visita realizada com interesse ${visitData.interesseNivel}`
                    : `Visita agendada para ${visitData.data}`,
                dados: { propertyId, visitId: newVisit.id }
            });

            setLoading('visit', false);
            return newVisit;

        } catch (error) {
            setError('visit', error.message);
            setLoading('visit', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, addEventToTimeline, setLoading, setError]);

    const updateVisit = useCallback(async (clienteId, opportunityId, propertyId, visitId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('visit', true);
        setError('visit', null);

        try {
            // Atualizar visita no imóvel
            const opportunity = await getOpportunity(currentUser.uid, clienteId, opportunityId);
            const property = opportunity.imoveis.find(p => p.id === propertyId);

            if (!property) {
                throw new Error('Imóvel não encontrado');
            }

            const updatedVisitas = property.visitas.map(v =>
                v.id === visitId ? { ...v, ...updates } : v
            );

            await updatePropertyInOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                { visitas: updatedVisitas }
            );

            // Recarregar oportunidade
            await fetchOpportunity(clienteId, opportunityId);

            setLoading('visit', false);
            return true;

        } catch (error) {
            setError('visit', error.message);
            setLoading('visit', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, setLoading, setError]);

    // ===== NOVO: OFFER OPERATIONS =====

    const addOffer = useCallback(async (clienteId, opportunityId, propertyId, offerData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('offer', true);
        setError('offer', null);

        try {
            const newOffer = await addOfferToProperty(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                offerData
            );

            // Recarregar oportunidade para atualizar estado
            await fetchOpportunity(clienteId, opportunityId);

            // Adicionar evento à timeline
            await addEventToTimeline(clienteId, opportunityId, {
                tipo: offerData.status === OFFER_STATES.ACCEPTED
                    ? TIMELINE_EVENT_TYPES.PROPOSAL_ACCEPTED
                    : TIMELINE_EVENT_TYPES.PROPOSAL_SENT,
                descricao: offerData.status === OFFER_STATES.ACCEPTED
                    ? `Proposta aceite: €${offerData.valor}`
                    : `Nova proposta: €${offerData.valor}`,
                dados: { propertyId, offerId: newOffer.id }
            });

            setLoading('offer', false);
            return newOffer;

        } catch (error) {
            setError('offer', error.message);
            setLoading('offer', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, addEventToTimeline, setLoading, setError]);

    const updateOffer = useCallback(async (clienteId, opportunityId, propertyId, offerId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('offer', true);
        setError('offer', null);

        try {
            // Atualizar oferta no imóvel
            const opportunity = await getOpportunity(currentUser.uid, clienteId, opportunityId);
            const property = opportunity.imoveis.find(p => p.id === propertyId);

            if (!property) {
                throw new Error('Imóvel não encontrado');
            }

            const updatedOfertas = property.ofertas.map(o =>
                o.id === offerId ? { ...o, ...updates } : o
            );

            await updatePropertyInOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                { ofertas: updatedOfertas }
            );

            // Recarregar oportunidade
            await fetchOpportunity(clienteId, opportunityId);

            // Se for contraproposta, adicionar evento
            if (updates.status === OFFER_STATES.COUNTER_OFFER) {
                await addEventToTimeline(clienteId, opportunityId, {
                    tipo: TIMELINE_EVENT_TYPES.COUNTER_OFFER,
                    descricao: `Contraproposta recebida: €${updates.valorContraproposta || updates.valor}`,
                    dados: { propertyId, offerId }
                });
            }

            setLoading('offer', false);
            return true;

        } catch (error) {
            setError('offer', error.message);
            setLoading('offer', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, addEventToTimeline, setLoading, setError]);

    // ===== NOVO: CPCV OPERATIONS =====

    const addCPCV = useCallback(async (clienteId, opportunityId, propertyId, cpcvData) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('cpcv', true);
        setError('cpcv', null);

        try {
            const newCPCV = await addCPCVToProperty(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                cpcvData
            );

            // Recarregar oportunidade para atualizar estado
            await fetchOpportunity(clienteId, opportunityId);

            // Adicionar evento à timeline
            await addEventToTimeline(clienteId, opportunityId, {
                tipo: TIMELINE_EVENT_TYPES.CPCV_CREATED,
                descricao: `CPCV criado: ${cpcvData.numeroContrato}`,
                dados: { propertyId, cpcv: newCPCV }
            });

            setLoading('cpcv', false);
            return newCPCV;

        } catch (error) {
            setError('cpcv', error.message);
            setLoading('cpcv', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, addEventToTimeline, setLoading, setError]);

    const updateCPCV = useCallback(async (clienteId, opportunityId, propertyId, updates) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('cpcv', true);
        setError('cpcv', null);

        try {
            // Atualizar CPCV no imóvel
            const opportunity = await getOpportunity(currentUser.uid, clienteId, opportunityId);
            const property = opportunity.imoveis.find(p => p.id === propertyId);

            if (!property || !property.cpcv) {
                throw new Error('CPCV não encontrado');
            }

            const updatedCPCV = { ...property.cpcv, ...updates };

            await updatePropertyInOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                propertyId,
                { cpcv: updatedCPCV }
            );

            // Recarregar oportunidade
            await fetchOpportunity(clienteId, opportunityId);

            // Adicionar evento se DIP emitido
            if (updates.dipEmitido && !property.cpcv.dipEmitido) {
                await addEventToTimeline(clienteId, opportunityId, {
                    tipo: TIMELINE_EVENT_TYPES.DIP_ISSUED,
                    descricao: `DIP emitido: ${updates.numeroDIP}`,
                    dados: { propertyId }
                });
            }

            setLoading('cpcv', false);
            return updatedCPCV;

        } catch (error) {
            setError('cpcv', error.message);
            setLoading('cpcv', false);
            throw error;
        }
    }, [currentUser, fetchOpportunity, addEventToTimeline, setLoading, setError]);

    // ===== EXISTING OPERATIONS (mantém igual) =====

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

    const removeProperty = useCallback(async (clienteId, opportunityId, propertyId) => {
        if (!currentUser?.uid) {
            throw new Error('Utilizador não autenticado');
        }

        setLoading('property', true);
        setError('property', null);

        try {
            const opportunity = await getOpportunity(currentUser.uid, clienteId, opportunityId);
            const updatedImoveis = opportunity.imoveis.filter(p => p.id !== propertyId);

            await updateOpportunity(
                currentUser.uid,
                clienteId,
                opportunityId,
                { imoveis: updatedImoveis }
            );

            dispatch({ type: ActionTypes.REMOVE_PROPERTY, payload: propertyId });

            await addEventToTimeline(clienteId, opportunityId, {
                tipo: TIMELINE_EVENT_TYPES.PROPERTY_REMOVED,
                descricao: 'Imóvel removido',
                dados: { propertyId }
            });

            setLoading('property', false);
            return { success: true };

        } catch (error) {
            setError('property', error.message);
            setLoading('property', false);
            throw error;
        }
    }, [currentUser, addEventToTimeline, setLoading, setError]);

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

    // ===== HELPERS =====

    const setCurrentProperty = useCallback((property) => {
        dispatch({ type: ActionTypes.SET_CURRENT_PROPERTY, payload: property });
    }, []);

    const setCurrentVisit = useCallback((visit) => {
        dispatch({ type: ActionTypes.SET_CURRENT_VISIT, payload: visit });
    }, []);

    const setCurrentOffer = useCallback((offer) => {
        dispatch({ type: ActionTypes.SET_CURRENT_OFFER, payload: offer });
    }, []);

    const setCurrentCPCV = useCallback((cpcv) => {
        dispatch({ type: ActionTypes.SET_CURRENT_CPCV, payload: cpcv });
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
        // NOVO: Estados adicionais
        VISIT_STATES,
        OFFER_STATES,
        PROPERTY_BUSINESS_STATES,
        INTEREST_LEVELS,

        // Create
        createNewOpportunity,
        // NOVO: Create para imóveis
        addProperty,
        addVisit,
        addOffer,
        addCPCV,

        // Read
        fetchOpportunity,
        fetchClientOpportunities,
        fetchAllOpportunities,

        // Update
        updateExistingOpportunity,
        changeOpportunityState,
        addEventToTimeline,
        batchUpdate,
        // NOVO: Update para imóveis
        updateProperty,
        updateVisit,
        updateOffer,
        updateCPCV,

        // Delete
        removeOpportunity,
        removeProperty,

        // Stats
        fetchClientStats,
        fetchConsultorStats,

        // Filters
        setFilters,
        resetFilters,
        setPagination,

        // NOVO: Helpers
        setCurrentProperty,
        setCurrentVisit,
        setCurrentOffer,
        setCurrentCPCV,

        // Schema helpers
        createPropertySchema,
        createVisitSchema,
        createOfferSchema,
        createCPCVSchema,

        // Reset
        resetState
    };

    return (
        <OpportunityContext.Provider value={value}>
            {children}
        </OpportunityContext.Provider>
    );
}