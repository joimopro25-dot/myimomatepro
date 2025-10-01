/**
 * FIREBASE SETUP - MyImoMatePro
 * Agent management functions
 * 
 * Structure:
 * /agents (global collection of all agents)
 *   /{agentId}
 * 
 * /consultants
 *   /{consultantId}
 *     /agent_relationships (consultant's view of agents)
 *       /{agentId}
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
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';

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
 * Update an existing agent
 */
export const updateAgent = async (agentId, updates) => {
  try {
    const agentRef = doc(db, 'agents', agentId);
    
    const agentDoc = await getDoc(agentRef);
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    await updateDoc(agentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    // Update consultant's relationship view if needed
    const agentData = agentDoc.data();
    if (agentData.consultantId && updates.relationship) {
      const relationshipRef = doc(
        db,
        'consultants',
        agentData.consultantId,
        'agent_relationships',
        agentId
      );
      
      await updateDoc(relationshipRef, {
        relationshipQuality: updates.relationship?.quality,
        lastInteraction: updates.relationship?.lastContactDate,
        notes: updates.relationship?.notes,
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

/**
 * Delete an agent
 */
export const deleteAgent = async (agentId) => {
  try {
    const agentRef = doc(db, 'agents', agentId);
    
    const agentDoc = await getDoc(agentRef);
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    const agentData = agentDoc.data();
    
    // Delete agent document
    await deleteDoc(agentRef);
    
    // Delete consultant's relationship view if exists
    if (agentData.consultantId) {
      const relationshipRef = doc(
        db,
        'consultants',
        agentData.consultantId,
        'agent_relationships',
        agentId
      );
      
      await deleteDoc(relationshipRef);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting agent:', error);
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
    
    return true;
  } catch (error) {
    console.error('Error logging agent interaction:', error);
    throw error;
  }
};

/**
 * Get agent's interaction history
 */
export const getAgentInteractions = async (agentId) => {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    const agentData = agentDoc.data();
    return agentData.interactions || [];
  } catch (error) {
    console.error('Error getting agent interactions:', error);
    throw error;
  }
};

/**
 * Get agents by consultant with relationship data
 */
export const getConsultantAgents = async (consultantId) => {
  try {
    // Get all agents for this consultant
    const agentsQuery = query(
      collection(db, 'agents'),
      where('consultantId', '==', consultantId),
      orderBy('name')
    );
    
    const snapshot = await getDocs(agentsQuery);
    const agents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return agents;
  } catch (error) {
    console.error('Error getting consultant agents:', error);
    throw error;
  }
};

/**
 * Search agents by name or agency
 */
export const searchAgents = async (consultantId, searchTerm) => {
  try {
    const agentsQuery = query(
      collection(db, 'agents'),
      where('consultantId', '==', consultantId),
      orderBy('name')
    );
    
    const snapshot = await getDocs(agentsQuery);
    
    // Filter results by search term (client-side filtering)
    const searchLower = searchTerm.toLowerCase();
    const filteredAgents = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(agent => 
        agent.name?.toLowerCase().includes(searchLower) ||
        agent.agency?.toLowerCase().includes(searchLower) ||
        agent.contactInfo?.email?.toLowerCase().includes(searchLower)
      );
    
    return filteredAgents;
  } catch (error) {
    console.error('Error searching agents:', error);
    throw error;
  }
};

/**
 * Get agent statistics
 */
export const getAgentStats = async (agentId) => {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    
    if (!agentDoc.exists()) {
      throw new Error('Agent not found');
    }
    
    const agentData = agentDoc.data();
    
    return {
      totalInteractions: agentData.relationship?.totalInteractions || 0,
      lastContactDate: agentData.relationship?.lastContactDate,
      relationshipQuality: agentData.relationship?.quality || 'unknown',
      totalDeals: agentData.stats?.totalDeals || 0,
      successfulDeals: agentData.stats?.successfulDeals || 0,
      successRate: agentData.stats?.totalDeals > 0 
        ? Math.round((agentData.stats?.successfulDeals / agentData.stats?.totalDeals) * 100)
        : 0
    };
  } catch (error) {
    console.error('Error getting agent stats:', error);
    throw error;
  }
};