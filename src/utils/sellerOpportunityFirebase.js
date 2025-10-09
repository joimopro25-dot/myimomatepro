// ============================================================================
// SELLER OPPORTUNITY - FIREBASE (UNIFIED opportunities COLLECTION)
// Now buyer & seller opportunities live in the SAME collection:
// consultants/{consultantId}/clients/{clientId}/opportunities
// Each doc has a `type`: 'buyer' | 'seller'
// ============================================================================

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { createTransactionData } from '../models/transactionModel'; // Added

// ============================================================================
// PATH HELPERS
// ============================================================================
export const getOpportunityPath = (consultantId, clientId) =>
  `consultants/${consultantId}/clients/${clientId}/opportunities`;

// ============================================================================
// CREATE
// ============================================================================
export const createSellerOpportunity = async (db, consultantId, clientId, opportunityData) => {
  try {
    const colPath = getOpportunityPath(consultantId, clientId);
    const ref = doc(collection(db, colPath));

    const dataToSave = {
      id: ref.id,
      clientId,
      consultantId,
      type: 'seller',
      stage: opportunityData.stage || 'lead',
      ...opportunityData,
      stats: {
        viewingsScheduled: 0,
        viewingsCompleted: 0,
        offersReceived: 0,
        daysOnMarket: 0,
        ...(opportunityData.stats || {})
      },
      viewings: [],
      offers: [],
      linkedBuyerDeals: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(ref, dataToSave);
    return ref.id;
  } catch (e) {
    console.error('Error creating seller opportunity', e);
    throw e;
  }
};

// ============================================================================
// READ
// ============================================================================
export const getSellerOpportunity = async (db, consultantId, clientId, opportunityId) => {
  const colPath = getOpportunityPath(consultantId, clientId);
  const ref = doc(db, colPath, opportunityId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Seller opportunity not found');
  const data = snap.data();
  if (data.type !== 'seller') throw new Error('Document is not a seller opportunity');
  return { id: snap.id, ...data };
};

export const getClientSellerOpportunities = async (db, consultantId, clientId) => {
  const colPath = getOpportunityPath(consultantId, clientId);
  const q = query(collection(db, colPath), where('type', '==', 'seller'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllConsultantSellerOpportunities = async (db, consultantId) => {
  const results = [];
  const clientsRef = collection(db, `consultants/${consultantId}/clients`);
  const clientsSnap = await getDocs(clientsRef);

  for (const clientDoc of clientsSnap.docs) {
    const oppsRef = collection(db, `consultants/${consultantId}/clients/${clientDoc.id}/opportunities`);
    const q = query(oppsRef, where('type', '==', 'seller'));
    const oppsSnap = await getDocs(q);
    oppsSnap.forEach(o =>
      results.push({
        id: o.id,
        clientId: clientDoc.id,
        ...o.data()
      })
    );
  }
  return results;
};

// ============================================================================
// UPDATE
// ============================================================================
export const updateSellerOpportunity = async (db, consultantId, clientId, opportunityId, updates) => {
  const colPath = getOpportunityPath(consultantId, clientId);
  const ref = doc(db, colPath, opportunityId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

export const updateSellerStage = async (db, consultantId, clientId, opportunityId, newStage) => {
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, { stage: newStage });
};

// ============================================================================
// VIEWINGS
// ============================================================================
export const addViewing = async (db, consultantId, clientId, opportunityId, viewingData) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const newViewing = {
    id: `view_${Date.now()}`,
    status: 'scheduled',
    ...viewingData,
    createdAt: new Date().toISOString()
  };
  const updated = [...(opp.viewings || []), newViewing];
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, {
    viewings: updated,
    stats: {
      ...opp.stats,
      viewingsScheduled: (opp.stats?.viewingsScheduled || 0) + 1
    }
  });
};

export const updateViewingStatus = async (db, consultantId, clientId, opportunityId, viewingId, status, feedback = {}) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const updatedViewings = (opp.viewings || []).map(v =>
    v.id === viewingId ? { ...v, status, feedback, updatedAt: new Date().toISOString() } : v
  );
  const stats = { ...opp.stats };
  if (status === 'completed')
    stats.viewingsCompleted = (stats.viewingsCompleted || 0) + 1;

  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, {
    viewings: updatedViewings,
    stats
  });
};

export const updateViewing = async (db, consultantId, clientId, opportunityId, viewingId, updates) => {
  const viewingsRef = collection(
    db,
    'consultants',
    consultantId,
    'clients',
    clientId,
    'opportunities',
    opportunityId,
    'viewings'
  );
  const viewingRef = doc(viewingsRef, viewingId);
  await updateDoc(viewingRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  return { id: viewingId, ...updates };
};

// ============================================================================
// OFFERS SECTION - WITH FIXES APPLIED
// ============================================================================
export const addOffer = async (db, consultantId, clientId, opportunityId, offerData) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const newOffer = {
    id: `offer_${Date.now()}`,
    status: 'pending',
    receivedDate: new Date().toISOString(),
    ...offerData
  };
  const updatedOffers = [...(opp.offers || []), newOffer];
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, {
    offers: updatedOffers,
    stats: {
      ...opp.stats,
      offersReceived: (opp.stats?.offersReceived || 0) + 1
    }
  });
};

// ✅ FIXED - updateOfferStatus with correct stage mapping
export const updateOfferStatus = async (db, consultantId, clientId, opportunityId, offerId, status, extra = {}) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const offer = opp.offers?.find(o => o.id === offerId);

  const updatedOffers = (opp.offers || []).map(o =>
    o.id === offerId ? { ...o, status, ...extra, updatedAt: new Date().toISOString() } : o
  );

  const updates = { offers: updatedOffers };

  if (status === 'accepted' && offer) {
    updates.acceptedOffer = {
      ...offer,
      status: 'accepted',
      ...extra
    };

    updates.transaction = createTransactionData({
      id: offer.id,
      amount: offer.amount || offer.offerAmount,
      buyer: offer.buyer || { name: offer.buyerName || 'Comprador' }
    });

    // ✅ FIX: Changed from 'proposta_aceite' to 'com_proposta'
    updates.stage = 'com_proposta';
  }

  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, updates);
};

// ✅ FIXED - updateSellerTransaction with correct stage mappings
export const updateSellerTransaction = async (db, consultantId, clientId, opportunityId, transactionData) => {
  const updates = {
    transaction: transactionData,
    updatedAt: serverTimestamp()
  };

  // ✅ FIX: Map transaction stages to correct pipeline stages
  if (transactionData.stage === 'cpcv_signed') {
    updates.stage = 'reservado';
  } else if (transactionData.stage === 'escritura_scheduled') {
    // stays 'reservado'
  } else if (transactionData.stage === 'completed') {
    updates.stage = 'vendido';
  }

  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, updates);
};

// ✅ NEW FUNCTION - Mark opportunity as lost/abandoned
export const markOpportunityAsLost = async (db, consultantId, clientId, opportunityId, reason = '') => {
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, {
    stage: 'perdido',
    lostReason: reason,
    lostAt: new Date().toISOString()
  });
};

// ============================================================================
// LINK BUYER DEAL
// ============================================================================
export const linkBuyerDeal = async (db, consultantId, clientId, opportunityId, buyerDealId) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const linked = new Set(opp.linkedBuyerDeals || []);
  linked.add(buyerDealId);
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, {
    linkedBuyerDeals: Array.from(linked)
  });
};

// ============================================================================
// DAYS ON MARKET
// ============================================================================
export const calculateDaysOnMarket = (opportunity) => {
  if (!opportunity.createdAt) return 0;
  const created = opportunity.createdAt.toDate
    ? opportunity.createdAt.toDate()
    : new Date(opportunity.createdAt);
  return Math.ceil((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
};

export const updateDaysOnMarket = async (db, consultantId, clientId, opportunityId) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const days = calculateDaysOnMarket(opp);
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, { 'stats.daysOnMarket': days });
};

// ============================================================================
// COMMISSION FUNCTIONS - NEW FUNCTIONS ADDED
// ============================================================================

/**
 * Save commission data when offer is accepted
 * Stores commission in subcollection: opportunities/{opportunityId}/commission/data
 */
export const saveCommissionData = async (
  db,
  consultantId,
  clientId,
  opportunityId,
  commissionData
) => {
  try {
    const commissionRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'commission',
      'data'
    );

    await setDoc(commissionRef, {
      ...commissionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Commission data saved successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving commission data:', error);
    throw error;
  }
};

/**
 * Update commission tracking (after escritura)
 * Updates payment status, amount received, dates, notes
 */
export const updateCommissionTracking = async (
  db,
  consultantId,
  clientId,
  opportunityId,
  trackingData
) => {
  try {
    const commissionRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'commission',
      'data'
    );

    await updateDoc(commissionRef, {
      ...trackingData,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Commission tracking updated');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating commission tracking:', error);
    throw error;
  }
};

/**
 * Get commission data for a specific opportunity
 * Returns commission object or null if not found
 */
export const getCommissionData = async (
  db,
  consultantId,
  clientId,
  opportunityId
) => {
  try {
    const commissionRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'commission',
      'data'
    );

    const commissionDoc = await getDoc(commissionRef);
    
    if (commissionDoc.exists()) {
      return { id: commissionDoc.id, ...commissionDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting commission data:', error);
    throw error;
  }
};

/**
 * Get all commissions for a consultant (for dashboard)
 * Queries all clients and their seller opportunities for commission data
 */
export const getAllCommissions = async (db, consultantId) => {
  try {
    const commissions = [];
    
    // Get all clients
    const clientsRef = collection(db, 'consultants', consultantId, 'clients');
    const clientsSnapshot = await getDocs(clientsRef);
    
    // For each client, get their opportunities
    for (const clientDoc of clientsSnapshot.docs) {
      const clientId = clientDoc.id;
      const clientData = clientDoc.data();
      
      const oppsRef = collection(
        db,
        'consultants',
        consultantId,
        'clients',
        clientId,
        'opportunities'
      );
      
      // Query for seller opportunities only
      const q = query(oppsRef, where('type', '==', 'seller'));
      const oppsSnapshot = await getDocs(q);
      
      // For each opportunity, get commission data
      for (const oppDoc of oppsSnapshot.docs) {
        const oppId = oppDoc.id;
        const oppData = oppDoc.data();
        
        const commissionRef = doc(
          db,
          'consultants',
          consultantId,
          'clients',
          clientId,
          'opportunities',
          oppId,
          'commission',
          'data'
        );
        
        const commissionDoc = await getDoc(commissionRef);
        
        if (commissionDoc.exists()) {
          commissions.push({
            id: commissionDoc.id,
            opportunityId: oppId,
            clientId: clientId,
            clientName: clientData.name,
            propertyAddress: oppData.propertyAddress,
            ...commissionDoc.data()
          });
        }
      }
    }
    
    return commissions;
  } catch (error) {
    console.error('❌ Error getting all commissions:', error);
    throw error;
  }
};

// ============================================================================
// NOTES
// ============================================================================
// Any existing code referencing getSellerOpportunityPath or sellerOpportunities
// must switch to getOpportunityPath and 'opportunities' collection.
// ============================================================================