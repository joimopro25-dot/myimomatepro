/**
 * DEAL CONTEXT - MyImoMatePro
 * React Context for managing deals and agents
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  saveAgent,
  getAgents,
  logAgentInteraction,
  createDeal,
  updateDeal, // ADD THIS
  deleteDeal, // ADD THIS
  updateDealStage,
  addViewing,
  submitOffer,
  getDealsWithViewings,
  getDashboardStats
} from '../services/firebaseSetup';
import { 
  createNewAgent, 
  validateAgent, 
  calculateSuccessRate,
  getAgentRating 
} from '../models/agentModel';
import {
  createNewDeal,
  validateDeal,
  calculateMatchScore,
  calculateDealProbability,
  formatDealSummary
} from '../models/buyerDealModel';

const DealContext = createContext();

export const useDeal = () => {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};

export const DealProvider = ({ children }) => {
  const { currentUser } = useAuth(); // CHANGED from 'user' to 'currentUser'
  const [agents, setAgents] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // ========================================
  // AGENT OPERATIONS
  // ========================================

  /**
   * Load all agents
   */
  const loadAgents = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const agentList = await getAgents({
        ...filters,
        consultantId: currentUser?.uid // CHANGED from user?.uid
      });
      
      const enhancedAgents = agentList.map(agent => ({
        ...agent,
        successRate: calculateSuccessRate(agent),
        rating: getAgentRating(agent)
      }));
      
      setAgents(enhancedAgents);
      return enhancedAgents;
    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Erro ao carregar agentes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create or update an agent
   */
  const saveAgentData = async (agentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const errors = validateAgent(agentData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const dataToSave = {
        ...agentData,
        consultantId: currentUser?.uid // CHANGED from user?.uid
      };
      
      const agentId = await saveAgent(dataToSave);
      await loadAgents();
      return agentId;
    } catch (err) {
      console.error('Error saving agent:', err);
      setError(err.message || 'Erro ao guardar agente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log interaction with agent
   */
  const logInteraction = async (agentId, interaction) => {
    try {
      await logAgentInteraction(agentId, {
        ...interaction,
        consultantId: currentUser?.uid // CHANGED from user?.uid
      });
      
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? {
              ...agent,
              relationship: {
                ...agent.relationship,
                lastContactDate: new Date()
              }
            }
          : agent
      ));
    } catch (err) {
      console.error('Error logging interaction:', err);
      setError('Erro ao registar interação');
      throw err;
    }
  };

  // ========================================
  // DEAL OPERATIONS
  // ========================================

  /**
   * Load deals for an opportunity (WITH consultantId)
   */
  const loadDeals = async (clientId, opportunityId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Get consultantId from currentUser
      const consultantId = currentUser?.uid;
      if (!consultantId) {
        throw new Error('No authenticated user');
      }

      const dealList = await getDealsWithViewings(consultantId, clientId, opportunityId, filters);

      // Enhance deals with calculated fields
      const enhancedDeals = dealList.map(deal => ({
        ...deal,
        probability: calculateDealProbability(deal),
        summary: formatDealSummary(deal)
      }));
      
      setDeals(enhancedDeals);
      return enhancedDeals;
    } catch (err) {
      console.error('Error loading deals:', err);
      setError('Erro ao carregar negócios');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new deal from form data
   */
  const createPropertyDeal = async (opportunity, formData) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('No authenticated user');
      if (!opportunity?.id || !opportunity?.clientId) throw new Error('Invalid opportunity');

      // Build the complete deal data from form
      const dealData = createNewDeal({
        clientId: opportunity.clientId,
        opportunityId: opportunity.id,
        property: formData.property,
        pricing: formData.pricing,
        propertyAgent: formData.propertyAgent,
        representation: formData.representation,
        scoring: formData.scoring,
        competition: formData.competition,
        stage: formData.stage || 'lead',
        notes: formData.notes || '',
        internalNotes: formData.internalNotes || ''
      });

      // Create in Firebase
      const dealId = await createDeal(
        consultantId,
        opportunity.id,
        opportunity.clientId,
        dealData
      );

      // Add to local state immediately
      const newDeal = {
        ...dealData,
        id: dealId,
        probability: calculateDealProbability(dealData),
        summary: formatDealSummary(dealData),
        viewings: [],
        totalViewings: 0
      };
      
      setDeals(prev => [...prev, newDeal]);

      return dealId;
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Erro ao criar negócio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move deal to next stage (WITH consultantId)
   */
  const moveDealStage = async (clientId, opportunityId, dealId, newStage, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      // Get consultantId from currentUser
      const consultantId = currentUser?.uid;
      if (!consultantId) {
        throw new Error('No authenticated user');
      }

      await updateDealStage(consultantId, clientId, opportunityId, dealId, newStage, notes);

      // Update local state
      setDeals(prev => prev.map(deal =>
        deal.id === dealId
          ? { ...deal, stage: newStage, updatedAt: new Date() }
          : deal
      ));

      return true;
    } catch (err) {
      console.error('Error updating deal stage:', err);
      setError('Erro ao atualizar fase do negócio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add viewing to deal (WITH consultantId)
   */
  const addDealViewing = async (clientId, opportunityId, dealId, viewingData) => {
    try {
      setLoading(true);
      setError(null);

      // Get consultantId from currentUser
      const consultantId = currentUser?.uid;
      if (!consultantId) {
        throw new Error('No authenticated user');
      }

      const viewingId = await addViewing(consultantId, clientId, opportunityId, dealId, viewingData);

      // Update local state
      setDeals(prev => prev.map(deal =>
        deal.id === dealId
          ? {
              ...deal,
              totalViewings: (deal.totalViewings || 0) + 1,
              'scoring.buyerInterestLevel': viewingData.feedback?.interestLevel || deal.scoring?.buyerInterestLevel
            }
          : deal
      ));

      return viewingId;
    } catch (err) {
      console.error('Error adding viewing:', err);
      setError('Erro ao adicionar visita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit offer for deal (WITH consultantId)
   */
  const submitDealOffer = async (clientId, opportunityId, dealId, offerData) => {
    try {
      setLoading(true);
      setError(null);

      // Get consultantId from currentUser
      const consultantId = currentUser?.uid;
      if (!consultantId) {
        throw new Error('No authenticated user');
      }

      const offerId = await submitOffer(consultantId, clientId, opportunityId, dealId, offerData);

      // Update local state
      setDeals(prev => prev.map(deal =>
        deal.id === dealId
          ? {
              ...deal,
              stage: 'offer_submitted',
              'pricing.currentOffer': offerData.amount
            }
          : deal
      ));

      return offerId;
    } catch (err) {
      console.error('Error submitting offer:', err);
      setError('Erro ao enviar proposta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update an existing property deal (WITH consultantId)
   */
  const updatePropertyDeal = async (opportunity, dealId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('No authenticated user');
      if (!opportunity?.id || !opportunity?.clientId) throw new Error('Invalid opportunity');
      if (!dealId) throw new Error('Deal ID is required');

      await updateDeal(consultantId, opportunity.clientId, opportunity.id, dealId, updates);

      // Update local state with recalculated fields
      setDeals(prev =>
        prev.map(d =>
          d.id === dealId
            ? {
                ...d,
                ...updates,
                probability: calculateDealProbability({ ...d, ...updates }),
                summary: formatDealSummary({ ...d, ...updates }),
                updatedAt: new Date()
              }
            : d
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating deal:', err);
      setError('Erro ao atualizar negócio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a deal
   */
  const deletePropertyDeal = async (clientId, opportunityId, dealId) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('No authenticated user');

      await deleteDeal(consultantId, clientId, opportunityId, dealId);

      // Update local state
      setDeals(prev => prev.filter(d => d.id !== dealId));

      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError('Erro ao eliminar negócio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // DASHBOARD & STATS
  // ========================================

  /**
   * Load dashboard statistics
   */
  const loadDashboardStats = async () => {
    try {
      if (!currentUser?.uid) return; // CHANGED from user?.uid
      
      const dashboardStats = await getDashboardStats(currentUser.uid); // CHANGED
      setStats(dashboardStats);
      return dashboardStats;
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Erro ao carregar estatísticas');
      throw err;
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Get active deals across all opportunities
   */
  const getActiveDeals = () => {
    return deals.filter(deal => deal.status === 'active');
  };

  /**
   * Get deals needing attention
   */
  const getDealsNeedingAttention = () => {
    return deals.filter(deal => {
      // Overdue follow-up
      if (deal.nextFollowUp && new Date(deal.nextFollowUp) < new Date()) return true;
      
      // No activity in 7 days
      const lastActivity = deal.updatedAt || deal.createdAt;
      const daysSince = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSince > 7) return true;
      
      return false;
    });
  };

  /**
   * Get top performing agents
   */
  const getTopAgents = (limit = 5) => {
    return [...agents]
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, limit);
  };

  // Load initial data when user changes
  useEffect(() => {
    if (currentUser?.uid) { // CHANGED from user?.uid
      loadDashboardStats();
    }
  }, [currentUser?.uid]); // CHANGED from user?.uid

  const value = {
    // State
    agents,
    deals,
    loading,
    error,
    stats,

    // Agent operations
    loadAgents,
    saveAgentData,
    logInteraction,

    // Deal operations
    loadDeals,
    createPropertyDeal,
    updatePropertyDeal, // ADD THIS
    deletePropertyDeal, // ADD THIS
    moveDealStage,
    addDealViewing,
    submitDealOffer,
    loadDashboardStats,
    getActiveDeals,
    getDealsNeedingAttention,
    getTopAgents
  };

  return (
    <DealContext.Provider value={value}>
      {children}
    </DealContext.Provider>
  );
};

export default DealContext;