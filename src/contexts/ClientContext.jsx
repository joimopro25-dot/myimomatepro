/**
 * CLIENT CONTEXT - MyImoMatePro
 * Manages all client operations with data isolation per consultant
 * CRITICAL: Each consultant only accesses their own clients
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { createClientModel, validateClient, calculateTotalHousehold } from '../models/clientModel';

const ClientContext = createContext();

export function useClients() {
  return useContext(ClientContext);
}

export function ClientProvider({ children }) {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    hotLeads: 0,
    monthlyNewClients: 0
  });

  // CRITICAL: Get consultant ID for data isolation
  const consultantId = currentUser?.uid;

  // Helper: nested clients path for current consultant
  const getClientsPath = () => {
    if (!currentUser?.uid) return null;
    return `consultants/${currentUser.uid}/clients`;
  };

  // Create new client
  const createClient = async (clientData) => {
    try {
      setError(null);
      
      // CRITICAL: Ensure client belongs to current consultant
      if (!consultantId) {
        throw new Error('No authenticated consultant');
      }

      // Validate client data
      const validation = validateClient(clientData);
      if (!validation.isValid) {
        throw new Error('Validation failed: ' + Object.values(validation.errors).join(', '));
      }

      // Calculate total household income
      if (clientData.financial) {
        clientData.financial.totalHousehold = calculateTotalHousehold(
          clientData.financial.monthlyIncome,
          clientData.financial.spouseMonthlyIncome
        );
      }

      // Create client document with consultant ID
      const newClient = {
        ...createClientModel(consultantId),
        ...clientData,
        consultantId, // ENSURE consultant ownership
        gdprConsentDate: clientData.gdprConsent ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to Firestore - AS SUBCOLLECTION OF CONSULTANT
      const docRef = await addDoc(collection(db, 'consultants', consultantId, 'clients'), newClient);
      
      // Log activity
      await logActivity(docRef.id, 'created', 'Client profile created');
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error.message);
      throw error;
    }
  };

  // Get clients (nested under consultants/{uid}/clients)
  const getClients = async () => {
    try {
      setLoading(true);

      const path = getClientsPath();
      if (!path) {
        console.log('No user logged in, skipping client load');
        setClients([]);
        return [];
      }

      console.log('Fetching clients from path:', path);

      const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');
      const q = query(clientsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const clientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${clientsList.length} clients`);
      setClients(clientsList);
      return clientsList;
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add client (create under consultants/{uid}/clients)
  const addClient = async (clientData) => {
    try {
      setLoading(true);

      if (!currentUser?.uid) {
        throw new Error('Usuário não autenticado');
      }

      const clientsRef = collection(db, 'consultants', currentUser.uid, 'clients');

      const newClient = {
        ...clientData,
        consultantId: currentUser.uid, // keep for reference
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: clientData.status || 'active'
      };

      console.log('Creating client in path: consultants/' + currentUser.uid + '/clients');

      const docRef = await addDoc(clientsRef, newClient);
      console.log('Client created with ID:', docRef.id);

      // Reload clients after adding
      await getClients();

      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update client (nested path; prevent protected fields updates)
  const updateClient = async (clientId, updates) => {
    try {
      setLoading(true);

      if (!currentUser?.uid || !clientId) {
        throw new Error('Missing user or client ID');
      }

      const clientRef = doc(db, 'consultants', currentUser.uid, 'clients', clientId);

      // Remove protected fields
      const { consultantId: _ignore1, createdBy: _ignore2, createdAt: _ignore3, ...safeUpdates } = updates || {};

      await updateDoc(clientRef, {
        ...safeUpdates,
        updatedAt: serverTimestamp()
      });

      console.log('Client updated successfully');

      // Reload clients
      await getClients();

      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get single client (with ownership check)
  const getClient = async (clientId) => {
    try {
      setError(null);
      setLoading(true);

      const docRef = doc(db, 'consultants', consultantId, 'clients', clientId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Client not found');
      }

      const clientData = { id: docSnap.id, ...docSnap.data() };

      // CRITICAL: Verify ownership (double-check)
      if (clientData.consultantId !== consultantId) {
        throw new Error('Unauthorized access');
      }

      setCurrentClient(clientData);
      return clientData;
    } catch (error) {
      console.error('Error getting client:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete client (with ownership check) - IMPROVED
  const deleteClient = async (clientId) => {
    try {
      setError(null);
      setLoading(true);

      if (!consultantId) {
        throw new Error('No authenticated consultant');
      }
      if (!clientId) {
        throw new Error('Missing client ID');
      }

      // Verify ownership
      const docRef = doc(db, 'consultants', consultantId, 'clients', clientId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Client not found');
      }

      const clientData = docSnap.data();
      if (clientData.consultantId !== consultantId) {
        throw new Error('Unauthorized access');
      }

      // Delete activities subcollection first (optional order)
      const activitiesRef = collection(db, 'consultants', consultantId, 'clients', clientId, 'activities');
      const activitiesSnap = await getDocs(activitiesRef);
      const activityDeletePromises = activitiesSnap.docs.map(a => deleteDoc(a.ref));
      await Promise.all(activityDeletePromises);

      // Delete client document
      await deleteDoc(docRef);

      // Update local state
      setClients(prev => prev.filter(c => c.id !== clientId));
      if (currentClient?.id === clientId) {
        setCurrentClient(null);
      }

      console.log('Client deleted successfully:', clientId);
      return clientId;
    } catch (error) {
      console.error('Error deleting client:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search clients (only consultant's clients)
  const searchClients = async (searchTerm) => {
    try {
      setError(null);
      
      if (!consultantId) return [];

      // Create query for consultant's clients only - FROM SUBCOLLECTION
      const clientsRef = collection(db, 'consultants', consultantId, 'clients');
      const q = query(
        clientsRef,
        where('status', '!=', 'archived'),
        orderBy('status'),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by search term (client-side for flexibility)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(client => 
          client.name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.phone?.includes(term) ||
          client.nif?.includes(term)
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching clients:', error);
      setError(error.message);
      return [];
    }
  };

  // Log activity for a client
  const logActivity = async (clientId, type, note = '') => {
    try {
      if (!consultantId) {
        throw new Error('No authenticated consultant');
      }

      const activityData = {
        type,
        note,
        timestamp: serverTimestamp(),
        createdBy: consultantId
      };

      // Add to activities subcollection
      const activitiesRef = collection(db, 'consultants', consultantId, 'clients', clientId, 'activities');
      await addDoc(activitiesRef, activityData);
      
      // Update client's last contact
      await updateDoc(doc(db, 'consultants', consultantId, 'clients', clientId), {
        lastContact: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  };

  // Get client activities
  const getClientActivities = async (clientId, limitCount = 50) => {
    try {
      const activitiesRef = collection(db, 'consultants', consultantId, 'clients', clientId, 'activities');
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting activities:', error);
      return [];
    }
  };

  // Load all clients for consultant (real-time)
  useEffect(() => {
    if (!consultantId) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // CRITICAL: Query only this consultant's clients FROM SUBCOLLECTION
    const clientsRef = collection(db, 'consultants', consultantId, 'clients');
    const q = query(
      clientsRef,
      orderBy('createdAt', 'desc')
    );

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const clientsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setClients(clientsList);
        
        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        setStats({
          totalClients: clientsList.length,
          activeClients: clientsList.filter(c => c.status === 'active').length,
          hotLeads: clientsList.filter(c => c.tags?.includes('Hot Lead')).length,
          monthlyNewClients: clientsList.filter(c => {
            const created = c.createdAt?.toDate?.() || new Date(c.createdAt);
            return created >= startOfMonth;
          }).length
        });
        
        setLoading(false);
      },
      (error) => {
        console.error('Error loading clients:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [consultantId]);

  // Check for duplicate clients
  const checkDuplicate = async (field, value) => {
    try {
      if (!consultantId || !value) return false;

      const clientsRef = collection(db, 'consultants', consultantId, 'clients');
      const q = query(
        clientsRef,
        where(field, '==', value),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  };

  const value = {
    // Data
    clients,
    currentClient,
    stats,
    loading,
    error,

    // Operations
    createClient,
    addClient,
    getClients,
    updateClient,
    getClient,
    deleteClient,
    searchClients,
    checkDuplicate,

    // Activities
    logActivity,
    getClientActivities,

    // Utilities
    setCurrentClient,
    clearError: () => setError(null)
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}