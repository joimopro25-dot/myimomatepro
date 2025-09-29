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
  onSnapshot
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

  // ===== GET CLIENT OPPORTUNITIES =====
  const getClientOpportunities = useCallback(async (clientId) => {
    if (!clientId) return [];

    setLoading(true);
    setError(null);

    try {
      const oppsQuery = query(
        collection(db, 'clients', clientId, 'opportunities'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(oppsQuery);
      const opps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return opps;
    } catch (err) {
      console.error('Error fetching client opportunities:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
      // If qualification is being updated, recalculate score
      let finalUpdates = { ...updates };
      if (updates.qualification) {
        const currentOpp = await getOpportunity(clientId, opportunityId);
        const mergedQualification = {
          ...currentOpp.qualification,
          ...updates.qualification
        };
        finalUpdates.buyerScore = calculateBuyerScore(mergedQualification);
      }

      const oppRef = doc(db, 'clients', clientId, 'opportunities', opportunityId);
      await updateDoc(oppRef, {
        ...finalUpdates,
        updatedAt: Timestamp.now()
      });

      // Update current opportunity if it's the one being edited
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
          updatedFields: Object.keys(updates)
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
  }, [currentOpportunity, getOpportunity]);

  // ===== GET ALL OPPORTUNITIES (for list view) =====
  const getAllOpportunities = useCallback(async () => {
    // Fix: Use uid as consultantId
    const consultantId = currentUser?.consultantId || currentUser?.uid;
    
    if (!consultantId) return [];

    setLoading(true);
    setError(null);

    try {
      // First get all clients for this consultant
      const clientsQuery = query(
        collection(db, 'clients'),
        where('consultantId', '==', consultantId)
      );
      
      const clientsSnapshot = await getDocs(clientsQuery);
      const allOpportunities = [];

      // For each client, get their opportunities
      for (const clientDoc of clientsSnapshot.docs) {
        const clientData = clientDoc.data();
        const oppsQuery = query(
          collection(db, 'clients', clientDoc.id, 'opportunities')
        );
        
        const oppsSnapshot = await getDocs(oppsQuery);
        
        oppsSnapshot.docs.forEach(oppDoc => {
          allOpportunities.push({
            id: oppDoc.id,
            ...oppDoc.data(),
            clientName: clientData.name,
            clientPhone: clientData.phone,
            clientEmail: clientData.email
          });
        });
      }

      // Sort by creation date
      allOpportunities.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setOpportunities(allOpportunities);
      return allOpportunities;
    } catch (err) {
      console.error('Error fetching all opportunities:', err);
      setError(err.message);
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