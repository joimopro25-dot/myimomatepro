/**
 * OPPORTUNITY CONTEXT - MyImoMatePro
 * State management for buyer/seller opportunities
 * Handles CRUD operations for opportunities linked to clients
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { createBuyerOpportunitySchema, validateBuyerOpportunity, calculateBuyerScore } from '../models/opportunityModel';

const OpportunityContext = createContext();

export const useOpportunities = () => {
  const context = useContext(OpportunityContext);
  if (!context) {
    throw new Error('useOpportunities must be used within OpportunityProvider');
  }
  return context;
};

export const OpportunityProvider = ({ children }) => {
  const { currentUser } = useAuth(); // Changed from 'user' to 'currentUser'
  const [opportunities, setOpportunities] = useState([]);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== CREATE BUYER OPPORTUNITY =====
  const createBuyerOpportunity = useCallback(async (clientId, opportunityData) => {
    // Fix: Use uid as consultantId
    const consultantId = currentUser?.consultantId || currentUser?.uid;
    
    if (!consultantId) {
      throw new Error('Utilizador não autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate data
      const validation = validateBuyerOpportunity(opportunityData);
      if (!validation.isValid) {
        throw new Error('Dados inválidos: ' + Object.values(validation.errors).join(', '));
      }

      // No longer checking for existing opportunities - allow multiple

      // Calculate buyer score
      const buyerScore = calculateBuyerScore(opportunityData.qualification);

      // Create opportunity document
      const opportunityRef = doc(collection(db, 'clients', clientId, 'opportunities'));
      const newOpportunity = createBuyerOpportunitySchema({
        ...opportunityData,
        clientId,
        consultantId: consultantId, // Use the fixed consultantId
        buyerScore
      });

      await setDoc(opportunityRef, {
        ...newOpportunity,
        id: opportunityRef.id
      });

      // Log activity on client
      await addClientActivity(clientId, {
        type: 'opportunity_created',
        description: 'Oportunidade de compra criada',
        metadata: {
          opportunityId: opportunityRef.id,
          buyerScore
        }
      });

      setCurrentOpportunity({
        ...newOpportunity,
        id: opportunityRef.id
      });

      return opportunityRef.id;
    } catch (err) {
      console.error('Error creating buyer opportunity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== CREATE OPPORTUNITY (generic) with ownership verification =====
  const createOpportunity = useCallback(async (clientId, opportunityData) => {
    try {
      setLoading(true);
      
      if (!currentUser?.uid) {
        throw new Error('Usuário não autenticado');
      }
      if (!clientId) {
        throw new Error('ID do cliente é obrigatório');
      }
      
      console.log('Creating opportunity for client:', clientId);
      
      // Verify the client exists and belongs to this consultant
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      if (!clientDoc.exists()) {
        throw new Error('Cliente não encontrado');
      }
      const clientData = clientDoc.data();
      console.log('Client data:', clientData);
      if (clientData.consultantId !== currentUser.uid) {
        throw new Error('Não tem permissão para criar oportunidades para este cliente');
      }
      
      // Create opportunity with required fields
      const newOpportunity = {
        ...opportunityData,
        consultantId: currentUser.uid,
        clientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        status: opportunityData.status || 'active',
        stats: {
          totalDeals: 0,
          activeDeals: 0,
          wonDeals: 0,
          lostDeals: 0,
          propertiesViewed: 0,
          offersMade: 0,
          ...opportunityData.stats
        }
      };
      
      // Correct subcollection path
      const opportunitiesRef = collection(db, 'clients', clientId, 'opportunities');
      console.log('Creating opportunity in path: /clients/' + clientId + '/opportunities');
      const docRef = await addDoc(opportunitiesRef, newOpportunity);
      console.log('Opportunity created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== GET CLIENT OPPORTUNITIES =====
  // FIX: Get opportunities for a specific client (with ownership check)
  const getClientOpportunities = useCallback(async (clientId) => {
    try {
      setLoading(true);
      
      if (!clientId) {
        console.error('Client ID is required');
        return [];
      }
      
      // Verify client belongs to consultant
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);
      if (!clientDoc.exists()) {
        throw new Error('Cliente não encontrado');
      }
      if (clientDoc.data().consultantId !== currentUser?.uid) {
        throw new Error('Não tem permissão para ver oportunidades deste cliente');
      }
      
      // Get opportunities from correct path
      const opportunitiesRef = collection(db, 'clients', clientId, 'opportunities');
      const snapshot = await getDocs(opportunitiesRef);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Found ${list.length} opportunities for client ${clientId}`);
      setOpportunities(list);
      return list;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== GET SINGLE OPPORTUNITY =====
  const getOpportunity = useCallback(async (clientId, opportunityId) => {
    if (!clientId || !opportunityId) return null;

    setLoading(true);
    setError(null);

    try {
      const oppRef = doc(db, 'clients', clientId, 'opportunities', opportunityId);
      const oppDoc = await getDoc(oppRef);

      if (!oppDoc.exists()) {
        throw new Error('Oportunidade não encontrada');
      }

      const opportunity = {
        id: oppDoc.id,
        ...oppDoc.data()
      };

      setCurrentOpportunity(opportunity);
      return opportunity;
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== UPDATE OPPORTUNITY =====
  const updateOpportunity = useCallback(async (clientId, opportunityId, updates) => {
    if (!clientId || !opportunityId) {
      throw new Error('Client ID and Opportunity ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      const consultantId = currentUser?.uid;
      if (!consultantId) throw new Error('Utilizador não autenticado');

      // Verify client ownership
      const clientRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientRef);

      if (!clientDoc.exists()) {
        throw new Error('Cliente não encontrado');
      }

      if (clientDoc.data().consultantId !== consultantId) {
        throw new Error('Não tem permissão para atualizar esta oportunidade');
      }

      // Prevent changing consultantId
      const { consultantId: _ignored, ...safeUpdates } = updates || {};

      // If qualification is being updated, recalculate score
      let finalUpdates = { ...safeUpdates };
      if (safeUpdates.qualification) {
        const currentOpp = await getOpportunity(clientId, opportunityId);
        const mergedQualification = {
          ...currentOpp?.qualification,
          ...safeUpdates.qualification
        };
        finalUpdates.buyerScore = calculateBuyerScore(mergedQualification);
      }

      const oppRef = doc(db, 'clients', clientId, 'opportunities', opportunityId);
      await updateDoc(oppRef, {
        ...finalUpdates,
        updatedAt: serverTimestamp()
      });

      // Update current opportunity state if needed
      if (currentOpportunity?.id === opportunityId) {
        setCurrentOpportunity(prev => ({
          ...prev,
          ...finalUpdates,
          updatedAt: Timestamp.now()
        }));
      }

      // Log activity
      await addClientActivity(clientId, {
        type: 'opportunity_updated',
        description: 'Oportunidade atualizada',
        metadata: {
          opportunityId,
          updatedFields: Object.keys(updates || {})
        }
      });

      return true;
    } catch (err) {
      console.error('Error updating opportunity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOpportunity, getOpportunity, currentUser]);

  // ===== GET ALL OPPORTUNITIES (for list view) =====
  // FIX: Get ALL opportunities across all clients for current consultant
  const getAllOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const allOpportunities = [];
      
      if (!currentUser?.uid) {
        console.log('No user logged in');
        return [];
      }
      
      // First get only the consultant's clients
      const clientsQuery = query(
        collection(db, 'clients'),
        where('consultantId', '==', currentUser.uid)
      );
      
      console.log('Fetching clients for consultant:', currentUser.uid);
      const clientsSnapshot = await getDocs(clientsQuery);
      console.log(`Found ${clientsSnapshot.size} clients`);
      
      // Then get opportunities for each client
      for (const clientDoc of clientsSnapshot.docs) {
        const clientData = clientDoc.data();
        console.log(`Checking opportunities for client: ${clientDoc.id} (${clientData.name})`);
        
        const opportunitiesRef = collection(db, 'clients', clientDoc.id, 'opportunities');
        const opportunitiesSnapshot = await getDocs(opportunitiesRef);
        
        console.log(`Found ${opportunitiesSnapshot.size} opportunities for client ${clientDoc.id}`);
        
        opportunitiesSnapshot.docs.forEach(doc => {
          allOpportunities.push({
            id: doc.id,
            clientId: clientDoc.id,
            clientName: clientData.name,
            clientPhone: clientData.phone,
            clientEmail: clientData.email,
            ...doc.data()
          });
        });
      }
      
      console.log(`Total opportunities found: ${allOpportunities.length}`);
      setOpportunities(allOpportunities);
      return allOpportunities;
    } catch (error) {
      console.error('Error fetching all opportunities:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== DELETE OPPORTUNITY =====
  const deleteOpportunity = useCallback(async (clientId, opportunityId) => {
    if (!clientId || !opportunityId) {
      throw new Error('Client ID and Opportunity ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      const oppRef = doc(db, 'clients', clientId, 'opportunities', opportunityId);
      await deleteDoc(oppRef);

      // Clear current opportunity if it's the one being deleted
      if (currentOpportunity?.id === opportunityId) {
        setCurrentOpportunity(null);
      }

      // Update local opportunities list
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));

      // Log activity
      await addClientActivity(clientId, {
        type: 'opportunity_deleted',
        description: 'Oportunidade removida'
      });

      return true;
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentOpportunity]);

  // ===== UPDATE OPPORTUNITY STATUS =====
  const updateOpportunityStatus = useCallback(async (clientId, opportunityId, newStatus) => {
    return updateOpportunity(clientId, opportunityId, {
      status: newStatus,
      lastActivityAt: Timestamp.now()
    });
  }, [updateOpportunity]);

  // ===== HELPER: Add activity to client =====
  const addClientActivity = async (clientId, activity) => {
    try {
      const activityRef = doc(collection(db, 'clients', clientId, 'activities'));
      await setDoc(activityRef, {
        ...activity,
        timestamp: Timestamp.now(),
        createdBy: currentUser?.uid || 'system'
      });
    } catch (err) {
      console.error('Error adding client activity:', err);
      // Don't throw - this is not critical
    }
  };

  // ===== CLEAR STATE =====
  const clearCurrentOpportunity = useCallback(() => {
    setCurrentOpportunity(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // State
    opportunities,
    currentOpportunity,
    loading,
    error,
    
    // Actions
    createBuyerOpportunity,
    createOpportunity,
    getClientOpportunities,
    getOpportunity,
    updateOpportunity,
    updateOpportunityStatus,
    getAllOpportunities,
    deleteOpportunity,
    clearCurrentOpportunity,
    clearError
  };

  return (
    <OpportunityContext.Provider value={value}>
      {children}
    </OpportunityContext.Provider>
  );
};

export default OpportunityContext;