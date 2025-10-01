/**
 * FIREBASE DEALS OPERATIONS - MyImoMatePro
 * All CRUD operations for deals following the path:
 * /consultants/{consultantId}/clients/{clientId}/opportunities/{opportunityId}/deals/{dealId}
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
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * ===== DEAL CRUD OPERATIONS =====
 */

/**
 * CREATE - New deal
 */
export const createDeal = async (consultantId, clientId, opportunityId, dealData) => {
  try {
    if (!consultantId || !clientId || !opportunityId) {
      throw new Error('Missing required IDs: consultantId, clientId, or opportunityId');
    }

    // Create new deal document reference
    const dealRef = doc(
      collection(db, 'consultants', consultantId, 'clients', clientId, 'opportunities', opportunityId, 'deals')
    );

    // Prepare deal data with timestamps
    const dealToSave = {
      ...dealData,
      id: dealRef.id,
      consultantId,
      clientId,
      opportunityId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore
    await setDoc(dealRef, dealToSave);

    // Log activity
    await logDealActivity(consultantId, clientId, opportunityId, dealRef.id, {
      type: 'deal_created',
      description: `Negócio criado: ${dealData.property?.address || 'Novo imóvel'}`,
      date: new Date()
    });

    return dealRef.id;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

/**
 * READ - Get single deal by ID
 */
export const getDeal = async (consultantId, clientId, opportunityId, dealId) => {
  try {
    if (!consultantId || !clientId || !opportunityId || !dealId) {
      throw new Error('Missing required IDs');
    }

    const dealRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId
    );

    const dealDoc = await getDoc(dealRef);

    if (!dealDoc.exists()) {
      throw new Error('Deal not found');
    }

    const data = dealDoc.data();
    return {
      id: dealDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    };
  } catch (error) {
    console.error('Error getting deal:', error);
    throw error;
  }
};

/**
 * READ - Get all deals for an opportunity
 */
export const getDeals = async (consultantId, clientId, opportunityId, filters = {}) => {
  try {
    if (!consultantId || !clientId || !opportunityId) {
      throw new Error('Missing required IDs');
    }

    const dealsRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals'
    );

    // Build query with filters
    let q = query(dealsRef, orderBy('createdAt', 'desc'));

    // Apply filters if provided
    if (filters.stage) {
      q = query(dealsRef, where('stage', '==', filters.stage), orderBy('createdAt', 'desc'));
    }
    if (filters.status) {
      q = query(dealsRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    });
  } catch (error) {
    console.error('Error getting deals:', error);
    throw error;
  }
};

/**
 * UPDATE - Update existing deal
 */
export const updateDeal = async (consultantId, clientId, opportunityId, dealId, updates) => {
  try {
    if (!consultantId || !clientId || !opportunityId || !dealId) {
      throw new Error('Missing required IDs');
    }

    const dealRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId
    );

    // Check if deal exists
    const dealDoc = await getDoc(dealRef);
    if (!dealDoc.exists()) {
      throw new Error('Deal not found');
    }

    // Remove ID fields from updates to prevent overwriting
    const { id, consultantId: _, clientId: __, opportunityId: ___, ...safeUpdates } = updates;

    // Update with timestamp
    await updateDoc(dealRef, {
      ...safeUpdates,
      updatedAt: serverTimestamp()
    });

    // Log activity
    await logDealActivity(consultantId, clientId, opportunityId, dealId, {
      type: 'deal_updated',
      description: 'Negócio atualizado',
      date: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating deal:', error);
    throw error;
  }
};

/**
 * DELETE - Delete deal and all subcollections
 */
export const deleteDeal = async (consultantId, clientId, opportunityId, dealId) => {
  try {
    if (!consultantId || !clientId || !opportunityId || !dealId) {
      throw new Error('Missing required IDs');
    }

    const batch = writeBatch(db);

    // Delete all viewings
    const viewingsRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'viewings'
    );
    const viewingsSnapshot = await getDocs(viewingsRef);
    viewingsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all offers
    const offersRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers'
    );
    const offersSnapshot = await getDocs(offersRef);
    offersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete all activities
    const activitiesRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'activities'
    );
    const activitiesSnapshot = await getDocs(activitiesRef);
    activitiesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the deal itself
    const dealRef = doc(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId
    );
    batch.delete(dealRef);

    // Commit all deletions
    await batch.commit();

    return true;
  } catch (error) {
    console.error('Error deleting deal:', error);
    throw error;
  }
};

/**
 * UPDATE - Change deal stage
 */
export const updateDealStage = async (consultantId, clientId, opportunityId, dealId, newStage, notes = '') => {
  try {
    await updateDeal(consultantId, clientId, opportunityId, dealId, {
      stage: newStage
    });

    // Log stage change
    await logDealActivity(consultantId, clientId, opportunityId, dealId, {
      type: 'stage_changed',
      description: `Etapa alterada para: ${newStage}`,
      metadata: { newStage, notes },
      date: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error updating deal stage:', error);
    throw error;
  }
};

/**
 * ===== VIEWING OPERATIONS =====
 */

/**
 * CREATE - Add viewing to deal
 */
export const addViewing = async (consultantId, clientId, opportunityId, dealId, viewingData) => {
  try {
    const viewingRef = doc(
      collection(
        db,
        'consultants',
        consultantId,
        'clients',
        clientId,
        'opportunities',
        opportunityId,
        'deals',
        dealId,
        'viewings'
      )
    );

    const viewingToSave = {
      ...viewingData,
      id: viewingRef.id,
      dealId,
      createdAt: serverTimestamp()
    };

    await setDoc(viewingRef, viewingToSave);

    // Update deal with viewing info
    await updateDeal(consultantId, clientId, opportunityId, dealId, {
      'timeline.firstViewingDate': viewingData.date,
      stage: 'viewing'
    });

    // Log activity
    await logDealActivity(consultantId, clientId, opportunityId, dealId, {
      type: 'viewing_added',
      description: `Visita agendada para ${viewingData.date}`,
      date: new Date()
    });

    return viewingRef.id;
  } catch (error) {
    console.error('Error adding viewing:', error);
    throw error;
  }
};

/**
 * READ - Get all viewings for a deal
 */
export const getDealViewings = async (consultantId, clientId, opportunityId, dealId) => {
  try {
    const viewingsRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'viewings'
    );

    const q = query(viewingsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      };
    });
  } catch (error) {
    console.error('Error getting viewings:', error);
    throw error;
  }
};

/**
 * ===== OFFER OPERATIONS =====
 */

/**
 * CREATE - Submit offer
 */
export const submitOffer = async (consultantId, clientId, opportunityId, dealId, offerData) => {
  try {
    // Get existing offers to determine offer number
    const offersRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers'
    );
    const offersSnapshot = await getDocs(offersRef);
    const offerNumber = offersSnapshot.size + 1;

    // Create offer
    const offerRef = doc(offersRef);
    const offerToSave = {
      ...offerData,
      id: offerRef.id,
      dealId,
      offerNumber,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    await setDoc(offerRef, offerToSave);

    // Update deal
    await updateDeal(consultantId, clientId, opportunityId, dealId, {
      stage: 'offer_submitted',
      'pricing.currentOffer': offerData.amount,
      'timeline.offerSubmittedDate': offerData.date
    });

    // Log activity
    await logDealActivity(consultantId, clientId, opportunityId, dealId, {
      type: 'offer_submitted',
      description: `Proposta #${offerNumber} enviada: €${offerData.amount.toLocaleString('pt-PT')}`,
      date: new Date()
    });

    return offerRef.id;
  } catch (error) {
    console.error('Error submitting offer:', error);
    throw error;
  }
};

/**
 * READ - Get all offers for a deal
 */
export const getDealOffers = async (consultantId, clientId, opportunityId, dealId) => {
  try {
    const offersRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers'
    );

    const q = query(offersRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : data.date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      };
    });
  } catch (error) {
    console.error('Error getting offers:', error);
    throw error;
  }
};

/**
 * ===== ACTIVITY LOG =====
 */

/**
 * Log activity for a deal
 */
export const logDealActivity = async (consultantId, clientId, opportunityId, dealId, activity) => {
  try {
    const activityRef = doc(
      collection(
        db,
        'consultants',
        consultantId,
        'clients',
        clientId,
        'opportunities',
        opportunityId,
        'deals',
        dealId,
        'activities'
      )
    );

    const activityToSave = {
      ...activity,
      id: activityRef.id,
      dealId,
      date: activity.date ? Timestamp.fromDate(activity.date) : serverTimestamp(),
      createdBy: consultantId
    };

    await setDoc(activityRef, activityToSave);

    return activityRef.id;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging is non-critical
  }
};

/**
 * Get activity log for a deal
 */
export const getDealActivities = async (consultantId, clientId, opportunityId, dealId) => {
  try {
    const activitiesRef = collection(
      db,
      'consultants',
      consultantId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'activities'
    );

    const q = query(activitiesRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : data.date
      };
    });
  } catch (error) {
    console.error('Error getting activities:', error);
    throw error;
  }
};

/**
 * ===== UTILITY FUNCTION =====
 * Get deals with all related data (viewings, offers, activities)
 */
export const getDealsWithDetails = async (consultantId, clientId, opportunityId) => {
  try {
    const deals = await getDeals(consultantId, clientId, opportunityId);

    const dealsWithDetails = await Promise.all(
      deals.map(async (deal) => {
        const [viewings, offers, activities] = await Promise.all([
          getDealViewings(consultantId, clientId, opportunityId, deal.id),
          getDealOffers(consultantId, clientId, opportunityId, deal.id),
          getDealActivities(consultantId, clientId, opportunityId, deal.id)
        ]);

        return {
          ...deal,
          viewings,
          offers,
          activities,
          totalViewings: viewings.length,
          totalOffers: offers.length
        };
      })
    );

    return dealsWithDetails;
  } catch (error) {
    console.error('Error getting deals with details:', error);
    throw error;
  }
};