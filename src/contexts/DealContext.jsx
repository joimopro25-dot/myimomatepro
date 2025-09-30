/**
 * DEAL CONTEXT - MyImoMatePro
 * React Context for managing deals and agents
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  saveAgent,
  getAgents,
  getAgent,
  logAgentInteraction,
  createDeal,
  updateDealStage,
  addViewing,
  submitOffer,
  getDeals,
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
   * Load deals for an opportunity
   */
  const loadDeals = async (clientId, opportunityId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const dealList = await getDeals(clientId, opportunityId, filters);
      
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
   * Create a new deal from a property
   */
  const createPropertyDeal = async (opportunity, property, agent = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create deal data
      const dealData = createNewDeal(opportunity, property, agent);
      
      // Calculate initial match score
      if (opportunity.qualification) {
        dealData.scoring.propertyMatchScore = calculateMatchScore(
          dealData,
          opportunity.qualification
        );
      }
      
      // Validate deal
      const errors = validateDeal(dealData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      // Save to Firestore
      const dealId = await createDeal(
        opportunity.id,
        opportunity.clientId,
        dealData
      );
      
      // Reload deals
      await loadDeals(opportunity.clientId, opportunity.id);
      
      return dealId;
    } catch (err) {
      console.error('Error creating deal:', err);
      setError(err.message || 'Erro ao criar negócio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Move deal to next stage
   */
  const moveDealStage = async (clientId, opportunityId, dealId, newStage, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      await updateDealStage(clientId, opportunityId, dealId, newStage, notes);
      
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
   * Add viewing to deal
   */
  const addDealViewing = async (clientId, opportunityId, dealId, viewingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const viewingId = await addViewing(clientId, opportunityId, dealId, viewingData);
      
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
   * Submit offer for deal
   */
  const submitDealOffer = async (clientId, opportunityId, dealId, offerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const offerId = await submitOffer(clientId, opportunityId, dealId, offerData);
      
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
    moveDealStage,
    addDealViewing,
    submitDealOffer,
    
    // Dashboard
    loadDashboardStats,
    
    // Utilities
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