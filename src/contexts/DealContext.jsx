/**
 * DEAL CONTEXT - MyImoMatePro
 * State management for deals and agents
 */

import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

// Deal operations
import {
  createDeal,
  getDeal,
  getDeals,
  updateDeal,
  deleteDeal,
  updateDealStage,
  addViewing,
  getDealViewings,
  submitOffer,
  getDealOffers,
  getDealActivities,
  getDealsWithDetails
} from '../services/firebaseDeals';

// Agent operations
import {
  saveAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  logAgentInteraction,
  getAgentInteractions
} from '../services/firebaseSetup';

// Models
import {
  createNewDeal,
  validateDeal,
  calculateDealProbability,
  formatDealSummary,
  getDealFlags,
  dealNeedsAttention
} from '../models/buyerDealModel';

import {
  createNewAgent,
  validateAgent,
  calculateSuccessRate,
  getAgentRating
} from '../models/agentModel';

const DealContext = createContext();

export const useDeal = () => {
  const context = useContext(DealContext);
  if (!context) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};

export const DealProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [deals, setDeals] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      const agentList = await getAgents({
        ...filters,
        consultantId
      });

      // Enhance agents with calculated fields
      const enhancedAgents = agentList.map(agent => ({
        ...agent,
        successRate: calculateSuccessRate(agent),
        rating: getAgentRating(agent)
      }));

      setAgents(enhancedAgents);
      return enhancedAgents;
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save agent (create or update)
   */
  const saveAgentData = async (agentData) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      // Validate
      const validationErrors = validateAgent(agentData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const dataToSave = {
        ...agentData,
        consultantId
      };

      const agentId = await saveAgent(dataToSave);

      // Reload agents
      await loadAgents();

      return agentId;
    } catch (err) {
      console.error('Error saving agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing agent
   */
  const updateAgentData = async (agentId, updates) => {
    try {
      setLoading(true);
      setError(null);

      await updateAgent(agentId, updates);

      // Update local state
      setAgents(prev =>
        prev.map(a =>
          a.id === agentId
            ? { ...a, ...updates, updatedAt: new Date() }
            : a
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating agent:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete agent
   */
  const deleteAgentData = async (agentId) => {
    try {
      setLoading(true);
      setError(null);

      await deleteAgent(agentId);

      // Remove from local state
      setAgents(prev => prev.filter(a => a.id !== agentId));

      return true;
    } catch (err) {
      console.error('Error deleting agent:', err);
      setError(err.message);
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
      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      await logAgentInteraction(agentId, {
        ...interaction,
        consultantId
      });

      // Update local state
      setAgents(prev =>
        prev.map(agent =>
          agent.id === agentId
            ? {
                ...agent,
                relationship: {
                  ...agent.relationship,
                  lastContactDate: new Date()
                }
              }
            : agent
        )
      );

      return true;
    } catch (err) {
      console.error('Error logging interaction:', err);
      setError(err.message);
      throw err;
    }
  };

  // ========================================
  // DEAL OPERATIONS
  // ========================================

  /**
   * Load all deals for an opportunity
   */
  const loadDeals = async (clientId, opportunityId, includeDetails = true) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) {
        throw new Error('User not authenticated');
      }

      let dealsList;
      if (includeDetails) {
        dealsList = await getDealsWithDetails(consultantId, clientId, opportunityId);
      } else {
        dealsList = await getDeals(consultantId, clientId, opportunityId);
      }

      // Enhance deals with calculated fields
      const enhancedDeals = dealsList.map(deal => ({
        ...deal,
        probability: calculateDealProbability(deal),
        summary: formatDealSummary(deal),
        needsAttention: dealNeedsAttention(deal)
      }));

      setDeals(enhancedDeals);
      return enhancedDeals;
    } catch (err) {
      console.error('Error loading deals:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new deal
   */
  const createPropertyDeal = async (opportunity, formData) => {
    try {
      setLoading(true);
      setError(null);

      // DEBUG LOGS
      console.log('=== CREATE PROPERTY DEAL START ===');
      console.log('1. formData received:', formData);
      console.log('2. formData.property:', formData?.property);
      console.log('3. formData.pricing:', formData?.pricing);
      console.log('4. opportunity:', opportunity);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');
      if (!opportunity?.id || !opportunity?.clientId) {
        throw new Error('Invalid opportunity data');
      }

      console.log('5. About to call createNewDeal with:', {
        consultantId,
        clientId: opportunity.clientId,
        opportunityId: opportunity.id,
        ...formData
      });

      // Build complete deal data
      const dealData = createNewDeal({
        consultantId,
        clientId: opportunity.clientId,
        opportunityId: opportunity.id,
        ...formData
      });

      console.log('6. dealData returned from createNewDeal:', dealData);
      console.log('7. dealData.property.address:', dealData?.property?.address);
      console.log('8. dealData.pricing.askingPrice:', dealData?.pricing?.askingPrice);

      // Validate
      const validationErrors = validateDeal(dealData);
      console.log('9. Validation errors:', validationErrors);

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Create in Firebase
      const dealId = await createDeal(
        consultantId,
        opportunity.clientId,
        opportunity.id,
        dealData
      );

      // Add to local state
      const newDeal = {
        ...dealData,
        id: dealId,
        probability: calculateDealProbability(dealData),
        summary: formatDealSummary(dealData),
        needsAttention: dealNeedsAttention(dealData),
        viewings: [],
        offers: [],
        activities: [],
        totalViewings: 0,
        totalOffers: 0
      };

      setDeals(prev => [...prev, newDeal]);

      return dealId;
    } catch (err) {
      console.error('Error creating deal:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing deal
   */
  const updatePropertyDeal = async (opportunity, dealId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');
      if (!opportunity?.id || !opportunity?.clientId) {
        throw new Error('Invalid opportunity data');
      }
      if (!dealId) throw new Error('Deal ID is required');

      // Update in Firebase
      await updateDeal(
        consultantId,
        opportunity.clientId,
        opportunity.id,
        dealId,
        updates
      );

      // Update local state
      setDeals(prev =>
        prev.map(d =>
          d.id === dealId
            ? {
                ...d,
                ...updates,
                probability: calculateDealProbability({ ...d, ...updates }),
                summary: formatDealSummary({ ...d, ...updates }),
                needsAttention: dealNeedsAttention({ ...d, ...updates }),
                updatedAt: new Date()
              }
            : d
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating deal:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete deal
   */
  const deletePropertyDeal = async (clientId, opportunityId, dealId) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      await deleteDeal(consultantId, clientId, opportunityId, dealId);

      // Remove from local state
      setDeals(prev => prev.filter(d => d.id !== dealId));

      return true;
    } catch (err) {
      console.error('Error deleting deal:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move deal to different stage
   */
  const moveDealStage = async (clientId, opportunityId, dealId, newStage, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      await updateDealStage(consultantId, clientId, opportunityId, dealId, newStage, notes);

      // Update local state
      setDeals(prev =>
        prev.map(deal =>
          deal.id === dealId
            ? {
                ...deal,
                stage: newStage,
                probability: calculateDealProbability({ ...deal, stage: newStage }),
                summary: formatDealSummary({ ...deal, stage: newStage }),
                updatedAt: new Date()
              }
            : deal
        )
      );

      return true;
    } catch (err) {
      console.error('Error moving deal stage:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VIEWING OPERATIONS
  // ========================================

  /**
   * Add viewing to deal
   */
  const addDealViewing = async (clientId, opportunityId, dealId, viewingData) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      const viewingId = await addViewing(
        consultantId,
        clientId,
        opportunityId,
        dealId,
        viewingData
      );

      // Reload deals to get updated data
      await loadDeals(clientId, opportunityId);

      return viewingId;
    } catch (err) {
      console.error('Error adding viewing:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get viewings for a deal
   */
  const loadDealViewings = async (clientId, opportunityId, dealId) => {
    try {
      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      return await getDealViewings(consultantId, clientId, opportunityId, dealId);
    } catch (err) {
      console.error('Error loading viewings:', err);
      throw err;
    }
  };

  // ========================================
  // OFFER OPERATIONS
  // ========================================

  /**
   * Submit offer for deal
   */
  const submitDealOffer = async (clientId, opportunityId, dealId, offerData) => {
    try {
      setLoading(true);
      setError(null);

      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      const offerId = await submitOffer(
        consultantId,
        clientId,
        opportunityId,
        dealId,
        offerData
      );

      // Reload deals to get updated data
      await loadDeals(clientId, opportunityId);

      return offerId;
    } catch (err) {
      console.error('Error submitting offer:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get offers for a deal
   */
  const loadDealOffers = async (clientId, opportunityId, dealId) => {
    try {
      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      return await getDealOffers(consultantId, clientId, opportunityId, dealId);
    } catch (err) {
      console.error('Error loading offers:', err);
      throw err;
    }
  };

  // ========================================
  // ACTIVITY OPERATIONS
  // ========================================

  /**
   * Get activities for a deal
   */
  const loadDealActivities = async (clientId, opportunityId, dealId) => {
    try {
      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('User not authenticated');

      return await getDealActivities(consultantId, clientId, opportunityId, dealId);
    } catch (err) {
      console.error('Error loading activities:', err);
      throw err;
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Get deals that need attention
   */
  const getDealsNeedingAttention = () => {
    return deals.filter(deal => deal.needsAttention?.status);
  };

  /**
   * Get deals by stage
   */
  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  /**
   * Get active deals
   */
  const getActiveDeals = () => {
    return deals.filter(deal => deal.status === 'active');
  };

  /**
   * Get top performing agents
   */
  const getTopAgents = (limit = 5) => {
    return [...agents]
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
      .slice(0, limit);
  };

  // Context value
  const value = {
    // State
    deals,
    agents,
    loading,
    error,

    // Agent operations
    loadAgents,
    saveAgentData,
    updateAgentData,
    deleteAgentData,
    logInteraction,

    // Deal operations
    loadDeals,
    createPropertyDeal,
    updatePropertyDeal,
    deletePropertyDeal,
    moveDealStage,

    // Viewing operations
    addDealViewing,
    loadDealViewings,

    // Offer operations
    submitDealOffer,
    loadDealOffers,

    // Activity operations
    loadDealActivities,

    // Utility functions
    getDealsNeedingAttention,
    getDealsByStage,
    getActiveDeals,
    getTopAgents
  };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};

export default DealContext;