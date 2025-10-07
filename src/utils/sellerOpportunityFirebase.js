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
    'sellerOpportunities',
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
// OFFERS
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

export const updateOfferStatus = async (db, consultantId, clientId, opportunityId, offerId, status, extra = {}) => {
  const opp = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
  const updatedOffers = (opp.offers || []).map(o =>
    o.id === offerId ? { ...o, status, ...extra, updatedAt: new Date().toISOString() } : o
  );
  await updateSellerOpportunity(db, consultantId, clientId, opportunityId, { offers: updatedOffers });
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
// NOTES
// ============================================================================
// Any existing code referencing getSellerOpportunityPath or sellerOpportunities
// must switch to getOpportunityPath and 'opportunities' collection.
// ============================================================================