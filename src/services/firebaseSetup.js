/**
 * FIREBASE SETUP - MyImoMatePro
 * Database structure and helper functions for Deals and Agents
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion // added
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * FIRESTORE COLLECTIONS STRUCTURE
 * 
 * /agents (global collection of all agents)
 *   /{agentId}
 * 
 * /clients
 *   /{clientId}
 *     /opportunities
 *       /{opportunityId}
 *         /deals (subcollection for buyer opportunities)
 *           /{dealId}
 *             /activities (deal activity log)
 *               /{activityId}
 *             /viewings (viewing records)
 *               /{viewingId}
 *             /offers (offer history)
 *               /{offerId}
 * 
 * /properties (your property inventory)
 *   /{propertyId}
 * 
 * /consultants
 *   /{consultantId}
 *     /agent_relationships (consultant's view of agents)
 *       /{agentId}
 */

// ============================================
// AGENT MANAGEMENT
// ============================================

/**
 * Create or update an agent
 */
export const saveAgent = async (agentData) => {
  try {
    const agentRef = doc(db, 'agents', agentData.id || doc(collection(db, 'agents')).id);
    
    const dataToSave = {
      ...agentData,
      updatedAt: serverTimestamp(),
      createdAt: agentData.createdAt || serverTimestamp()
    };
    
    await setDoc(agentRef, dataToSave, { merge: true });
    
    // Also create/update consultant's relationship view
    if (agentData.consultantId) {
      const relationshipRef = doc(
        db, 
        'consultants', 
        agentData.consultantId, 
        'agent_relationships', 
        agentRef.id
      );
      
      await setDoc(relationshipRef, {
        agentId: agentRef.id,
        relationshipQuality: agentData.relationship?.quality,
        lastInteraction: agentData.relationship?.lastContactDate,
        notes: agentData.relationship?.notes,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    return agentRef.id;
  } catch (error) {
    console.error('Error saving agent:', error);
    throw error;
  }
};

/**
 * Get all agents (with optional filtering)
 */
export const getAgents = async (filters = {}) => {
  try {
    let q = collection(db, 'agents');
    
    // Apply filters
    const constraints = [];
    
    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.consultantId) {
      constraints.push(where('consultantId', '==', filters.consultantId));
    }
    
    // Add ordering
    constraints.push(orderBy('name'));
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting agents:', error);
    throw error;
  }
};

/**
 * Get single agent by ID
 */
export const getAgent = async (agentId) => {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    return { id: agentDoc.id, ...agentDoc.data() };
  } catch (error) {
    console.error('Error getting agent:', error);
    throw error;
  }
};

/**
 * Log interaction with an agent
 */
export const logAgentInteraction = async (agentId, interaction) => {
  try {
    const batch = writeBatch(db);
    
    // Update agent's last contact date and add to interactions array
    const agentRef = doc(db, 'agents', agentId);
    batch.update(agentRef, {
      'relationship.lastContactDate': serverTimestamp(),
      'relationship.totalInteractions': increment(1),
      interactions: arrayUnion({
        ...interaction,
        id: `interaction_${Date.now()}`,
        date: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error logging agent interaction:', error);
    throw error;
  }
};

// ============================================
// DEAL MANAGEMENT
// ============================================

/**
 * Create a new deal for a buyer opportunity
 */
export const createDeal = async (opportunityId, clientId, dealData) => {
  try {
    const dealRef = doc(
      collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals')
    );
    
    const dataToSave = {
      ...dealData,
      id: dealRef.id,
      opportunityId,
      clientId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Initialize counters
      'scoring.propertyMatchScore': dealData.scoring?.propertyMatchScore || 0,
      'scoring.buyerInterestLevel': dealData.scoring?.buyerInterestLevel || 0,
      'scoring.dealProbability': dealData.scoring?.dealProbability || 0,
      
      // Set initial timeline
      'timeline.firstContactDate': serverTimestamp()
    };
    
    await setDoc(dealRef, dataToSave);
    
    // Update opportunity stats
    await updateOpportunityStats(clientId, opportunityId, {
      totalDeals: increment(1),
      activeDeals: increment(1)
    });
    
    // Log activity
    await logDealActivity(clientId, opportunityId, dealRef.id, {
      type: 'deal_created',
      description: 'Nova negociação iniciada',
      stage: dealData.stage
    });
    
    return dealRef.id;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

/**
 * Update deal stage
 */
export const updateDealStage = async (clientId, opportunityId, dealId, newStage, notes = '') => {
  try {
    const dealRef = doc(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId);
    
    // Get current deal data
    const dealDoc = await getDoc(dealRef);
    const currentData = dealDoc.data();
    const oldStage = currentData.stage;
    
    // Update deal
    await updateDoc(dealRef, {
      stage: newStage,
      updatedAt: serverTimestamp(),
      'timeline.lastStageChange': serverTimestamp()
    });
    
    // Log activity
    await logDealActivity(clientId, opportunityId, dealId, {
      type: 'stage_change',
      description: `Fase alterada de ${oldStage} para ${newStage}`,
      oldValue: oldStage,
      newValue: newStage,
      notes
    });
    
    // Update opportunity stats if deal is won or lost
    if (newStage === 'completed') {
      await updateOpportunityStats(clientId, opportunityId, {
        activeDeals: increment(-1),
        wonDeals: increment(1)
      });
    } else if (newStage === 'lost') {
      await updateOpportunityStats(clientId, opportunityId, {
        activeDeals: increment(-1),
        lostDeals: increment(1)
      });
    }
  } catch (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }
};

/**
 * Add viewing to deal
 */
export const addViewing = async (clientId, opportunityId, dealId, viewingData) => {
  try {
    const viewingRef = doc(
      collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId, 'viewings')
    );
    
    await setDoc(viewingRef, {
      ...viewingData,
      id: viewingRef.id,
      createdAt: serverTimestamp()
    });
    
    // Update deal
    const dealRef = doc(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId);
    await updateDoc(dealRef, {
      totalViewings: increment(1),
      lastViewingDate: viewingData.date,
      'scoring.buyerInterestLevel': viewingData.feedback?.interestLevel || 0,
      updatedAt: serverTimestamp()
    });
    
    // Log activity
    await logDealActivity(clientId, opportunityId, dealId, {
      type: 'viewing',
      description: `Visita realizada - Interest: ${viewingData.feedback?.interestLevel}/10`,
      viewingId: viewingRef.id
    });
    
    // Update opportunity stats
    await updateOpportunityStats(clientId, opportunityId, {
      propertiesViewed: increment(1)
    });
    
    return viewingRef.id;
  } catch (error) {
    console.error('Error adding viewing:', error);
    throw error;
  }
};

/**
 * Submit offer for a deal
 */
export const submitOffer = async (clientId, opportunityId, dealId, offerData) => {
  try {
    const offerRef = doc(
      collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId, 'offers')
    );
    
    // Get current offers count
    const offersSnapshot = await getDocs(
      collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId, 'offers')
    );
    const offerNumber = offersSnapshot.size + 1;
    
    await setDoc(offerRef, {
      ...offerData,
      id: offerRef.id,
      offerNumber,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    // Update deal
    const dealRef = doc(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId);
    await updateDoc(dealRef, {
      stage: 'offer_submitted',
      'pricing.currentOffer': offerData.amount,
      'pricing.highestOffer': increment(0), // Will use field transforms to get max
      'timeline.offerDate': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Log activity
    await logDealActivity(clientId, opportunityId, dealId, {
      type: 'offer_submitted',
      description: `Proposta #${offerNumber} enviada: €${offerData.amount.toLocaleString('pt-PT')}`,
      offerId: offerRef.id,
      amount: offerData.amount
    });
    
    // Update opportunity stats
    await updateOpportunityStats(clientId, opportunityId, {
      offersMade: increment(1)
    });
    
    return offerRef.id;
  } catch (error) {
    console.error('Error submitting offer:', error);
    throw error;
  }
};

/**
 * Get all deals for an opportunity
 */
export const getDeals = async (clientId, opportunityId, filters = {}) => {
  try {
    let q = collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals');
    
    const constraints = [];
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    if (filters.stage) {
      constraints.push(where('stage', '==', filters.stage));
    }
    
    // Default ordering
    constraints.push(orderBy('createdAt', 'desc'));
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting deals:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update opportunity statistics
 */
const updateOpportunityStats = async (clientId, opportunityId, stats) => {
  try {
    const oppRef = doc(db, 'clients', clientId, 'opportunities', opportunityId);
    await updateDoc(oppRef, {
      stats,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating opportunity stats:', error);
    // Don't throw - stats update is not critical
  }
};

/**
 * Log deal activity
 */
const logDealActivity = async (clientId, opportunityId, dealId, activity) => {
  try {
    const activityRef = doc(
      collection(db, 'clients', clientId, 'opportunities', opportunityId, 'deals', dealId, 'activities')
    );
    
    await setDoc(activityRef, {
      ...activity,
      id: activityRef.id,
      timestamp: serverTimestamp(),
      createdBy: activity.createdBy || 'system'
    });
  } catch (error) {
    console.error('Error logging deal activity:', error);
    // Don't throw - logging is not critical
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (consultantId) => {
  try {
    const stats = {
      totalDeals: 0,
      activeDeals: 0,
      dealsWon: 0,
      dealsInNegotiation: 0,
      viewingsThisWeek: 0,
      offersSubmitted: 0
    };
    
    // Get all clients for consultant
    const clientsQuery = query(
      collection(db, 'clients'),
      where('consultantId', '==', consultantId)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    
    // Iterate through clients and their opportunities
    for (const clientDoc of clientsSnapshot.docs) {
      const oppsSnapshot = await getDocs(
        collection(db, 'clients', clientDoc.id, 'opportunities')
      );
      
      for (const oppDoc of oppsSnapshot.docs) {
        const oppData = oppDoc.data();
        stats.totalDeals += oppData.stats?.totalDeals || 0;
        stats.activeDeals += oppData.stats?.activeDeals || 0;
        stats.dealsWon += oppData.stats?.wonDeals || 0;
        stats.offersSubmitted += oppData.stats?.offersMade || 0;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
};