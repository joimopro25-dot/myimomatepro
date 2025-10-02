/**
 * OPPORTUNITY CONTEXT - MyImoMatePro
 * State management for buyer/seller opportunities
 * Handles CRUD operations for opportunities linked to clients
 * UPDATED: Works with nested structure /consultants/{id}/clients/{id}/opportunities
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
  const { currentUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== CREATE BUYER OPPORTUNITY =====
  const createBuyerOpportunity = useCallback(async (clientId, opportunityData) => {
    const consultantId = currentUser?.uid;
    
    if (!consultantId) {
      throw new Error('Utilizador não autenticado');
    }
    
    if (!clientId) {
      throw new Error('Client ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate data
      const validation = validateBuyerOpportunity(opportunityData);
      if (!validation.isValid) {
        throw new Error('Dados inválidos: ' + Object.values(validation.errors).join(', '));
      }

      // Calculate buyer score
      const buyerScore = calculateBuyerScore(opportunityData.qualification);

      // Create opportunity in NESTED path
      const opportunityRef = doc(collection(db, 'consultants', consultantId, 'clients', clientId, 'opportunities'));
      
      const newOpportunity = createBuyerOpportunitySchema({
        ...opportunityData,
        clientId,  // CRITICAL: Ensure clientId is included
        consultantId: consultantId,
        buyerScore
      });

      // DIAGNOSTIC LOG
      console.log('=== CREATE OPPORTUNITY ===');
      console.log('Path:', `consultants/${consultantId}/clients/${clientId}/opportunities/${opportunityRef.id}`);
      console.log('Opportunity data:', {
        id: opportunityRef.id,
        clientId: clientId,
        consultantId: consultantId,
        ...newOpportunity
      });

      await setDoc(opportunityRef, {
        ...newOpportunity,
        id: opportunityRef.id,
        clientId: clientId,       // EXPLICITLY set clientId again
        consultantId: consultantId // EXPLICITLY set consultantId again
      });

      console.log('Opportunity created successfully');
      console.log('=== END CREATE OPPORTUNITY ===');

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
        id: opportunityRef.id,
        clientId: clientId,
        consultantId: consultantId
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

  // ===== CREATE OPPORTUNITY (generic) =====
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
      
      // Create opportunity with required fields
      const newOpportunity = {
        ...opportunityData,
        consultantId: currentUser.uid,
        clientId: clientId,  // EXPLICIT clientId
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
      
      // Use NESTED path
      const opportunitiesRef = collection(db, 'consultants', currentUser.uid, 'clients', clientId, 'opportunities');
      console.log('Creating opportunity in nested path: /consultants/' + currentUser.uid + '/clients/' + clientId + '/opportunities');
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

  // ===== GET CLIENT OPPORTUNITIES - SIMPLIFIED =====
  const getClientOpportunities = useCallback(async (clientId) => {
    try {
      setLoading(true);
      
      if (!currentUser?.uid || !clientId) {
        console.error('Missing IDs - User:', currentUser?.uid, 'Client:', clientId);
        setOpportunities([]);
        return [];
      }
      
      // Get opportunities from NESTED path - NO VERIFICATION NEEDED
      const opportunitiesRef = collection(
        db, 
        'consultants', 
        currentUser.uid, 
        'clients', 
        clientId, 
        'opportunities'
      );
      
      console.log('Fetching opportunities from nested path:', `consultants/${currentUser.uid}/clients/${clientId}/opportunities`);
      
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
      // Don't throw error, just return empty array
      setOpportunities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * GET SINGLE OPPORTUNITY (with diagnostics)
   */
  const getOpportunity = useCallback(async (clientId, opportunityId) => {
    if (!currentUser?.uid || !clientId || !opportunityId) {
      console.error('Missing IDs in getOpportunity:', { 
        consultantId: currentUser?.uid, 
        clientId, 
        opportunityId 
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Use NESTED path
      const oppRef = doc(db, 'consultants', currentUser.uid, 'clients', clientId, 'opportunities', opportunityId);
      
      console.log('=== LOADING OPPORTUNITY ===');
      console.log('Path:', `consultants/${currentUser.uid}/clients/${clientId}/opportunities/${opportunityId}`);
      
      const oppDoc = await getDoc(oppRef);

      if (!oppDoc.exists()) {
        throw new Error('Oportunidade não encontrada');
      }

      const docData = oppDoc.data();
      console.log('Document data from Firestore:', docData);

      const opportunity = {
        id: oppDoc.id,
        ...docData,
        // ENSURE clientId is present even if missing from doc
        clientId: docData.clientId || clientId,
        consultantId: docData.consultantId || currentUser.uid
      };

      console.log('Opportunity object created:', {
        id: opportunity.id,
        clientId: opportunity.clientId,
        consultantId: opportunity.consultantId,
        type: opportunity.type
      });
      console.log('=== END LOADING OPPORTUNITY ===');

      setCurrentOpportunity(opportunity);
      return opportunity;
    } catch (err) {
      console.error('Error fetching opportunity:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== UPDATE OPPORTUNITY =====
  const updateOpportunity = useCallback(async (clientId, opportunityId, updates) => {
    if (!currentUser?.uid || !clientId || !opportunityId) {
      throw new Error('Missing required IDs');
    }

    setLoading(true);
    setError(null);

    try {
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

      // Use NESTED path
      const oppRef = doc(db, 'consultants', currentUser.uid, 'clients', clientId, 'opportunities', opportunityId);
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

  // ===== UPDATE BUYER OPPORTUNITY (with validation & scoring) =====
  const updateBuyerOpportunity = useCallback(async (clientId, opportunityId, opportunityData) => {
    if (!currentUser?.uid || !clientId || !opportunityId) {
      throw new Error('Missing required IDs');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate data
      const validation = validateBuyerOpportunity(opportunityData);
      if (!validation.isValid) {
        throw new Error('Dados inválidos: ' + Object.values(validation.errors).join(', '));
      }

      // Recalculate buyer score
      const buyerScore = calculateBuyerScore(opportunityData.qualification);

      // Use NESTED path
      const oppRef = doc(db, 'consultants', currentUser.uid, 'clients', clientId, 'opportunities', opportunityId);

      await updateDoc(oppRef, {
        ...opportunityData,
        buyerScore,
        updatedAt: serverTimestamp(),
        clientId,
        consultantId: currentUser.uid
      });

      console.log('Buyer opportunity updated successfully');

      // Update current opportunity state
      setCurrentOpportunity(prev => ({
        ...prev,
        ...opportunityData,
        buyerScore,
        updatedAt: Timestamp.now()
      }));

      // Log activity
      await addClientActivity(clientId, {
        type: 'opportunity_updated',
        description: 'Oportunidade de compra atualizada',
        metadata: {
          opportunityId,
          buyerScore
        }
      });

      return true;
    } catch (err) {
      console.error('Error updating buyer opportunity:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // ===== GET ALL OPPORTUNITIES =====
  const getAllOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const allOpportunities = [];
      
      if (!currentUser?.uid) {
        console.log('No user logged in');
        return [];
      }
      
      // Get all clients from NESTED path
      const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');
      console.log('Fetching clients from nested path:', `consultants/${currentUser.uid}/clients`);
      
      const clientsSnapshot = await getDocs(clientsRef);
      console.log(`Found ${clientsSnapshot.size} clients`);
      
      // Then get opportunities for each client
      for (const clientDoc of clientsSnapshot.docs) {
        const clientData = clientDoc.data();
        console.log(`Checking opportunities for client: ${clientDoc.id}`);
        
        const opportunitiesRef = collection(
          db, 
          'consultants', 
          currentUser.uid, 
          'clients', 
          clientDoc.id, 
          'opportunities'
        );
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
    if (!currentUser?.uid || !clientId || !opportunityId) {
      throw new Error('Missing required IDs');
    }

    setLoading(true);
    setError(null);

    try {
      // Use NESTED path
      const oppRef = doc(db, 'consultants', currentUser.uid, 'clients', clientId, 'opportunities', opportunityId);
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
  }, [currentOpportunity, currentUser]);

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
      if (!currentUser?.uid) return;
      
      // Use NESTED path for activities
      const activityRef = doc(collection(db, 'consultants', currentUser.uid, 'clients', clientId, 'activities'));
      await setDoc(activityRef, {
        ...activity,
        timestamp: Timestamp.now(),
        createdBy: currentUser.uid
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
    updateBuyerOpportunity,  // added
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