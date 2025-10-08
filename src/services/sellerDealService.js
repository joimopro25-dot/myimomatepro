/**
 * SELLER DEAL SERVICE - MyImoMatePro
 * Firebase service for managing seller deals and transactions
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createTransactionData, TRANSACTION_STAGES } from '../models/transactionModel';
import { SELLER_DEAL_STAGES } from '../models/sellerDealModel';

/**
 * Get all seller deals for a client
 */
export const getSellerDeals = async (userId, clientId) => {
  try {
    const dealsRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals'
    );
    
    const q = query(dealsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting seller deals:', error);
    throw error;
  }
};

/**
 * Get a single seller deal by ID
 */
export const getSellerDealById = async (userId, clientId, dealId) => {
  try {
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    const dealDoc = await getDoc(dealRef);
    
    if (dealDoc.exists()) {
      return { id: dealDoc.id, ...dealDoc.data() };
    } else {
      throw new Error('Deal not found');
    }
  } catch (error) {
    console.error('Error getting seller deal:', error);
    throw error;
  }
};

/**
 * Create new seller deal
 */
export const createSellerDeal = async (userId, clientId, dealData) => {
  try {
    const dealsRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals'
    );
    
    const newDeal = {
      ...dealData,
      clientId,
      stage: dealData.stage || 'lead',
      status: 'active',
      offers: [],
      acceptedOffer: null,
      transaction: null,
      documents: {
        checklist: initializeDocumentChecklist(),
        missingDocs: [],
        allDocsReady: false
      },
      marketing: {
        viewCount: 0,
        inquiryCount: 0,
        showingCount: 0,
        offerCount: 0,
        daysOnMarket: 0,
        lastActivity: serverTimestamp()
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    };
    
    const docRef = await addDoc(dealsRef, newDeal);
    
    // Log activity
    await logActivity(userId, clientId, docRef.id, {
      type: 'deal_created',
      description: 'Nova oportunidade de venda criada',
      stage: 'lead'
    });
    
    return { id: docRef.id, ...newDeal };
  } catch (error) {
    console.error('Error creating seller deal:', error);
    throw error;
  }
};

/**
 * Update seller deal
 */
export const updateSellerDeal = async (userId, clientId, dealId, updates) => {
  try {
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    // Get current deal for comparison
    const currentDeal = await getSellerDealById(userId, clientId, dealId);
    
    // Check for stage changes that require special handling
    if (updates.stage && updates.stage !== currentDeal.stage) {
      // Handle transition to transaction stages
      if (updates.stage === 'proposta_aceite' && updates.acceptedOffer && !updates.transaction) {
        updates.transaction = createTransactionData(updates.acceptedOffer);
      }
      
      // Log stage change
      await logActivity(userId, clientId, dealId, {
        type: 'stage_changed',
        description: `Fase alterada de ${currentDeal.stage} para ${updates.stage}`,
        fromStage: currentDeal.stage,
        toStage: updates.stage
      });
    }
    
    await updateDoc(dealRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { id: dealId, ...updates };
  } catch (error) {
    console.error('Error updating seller deal:', error);
    throw error;
  }
};

/**
 * Delete seller deal
 */
export const deleteSellerDeal = async (userId, clientId, dealId) => {
  try {
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    await deleteDoc(dealRef);
    
    return dealId;
  } catch (error) {
    console.error('Error deleting seller deal:', error);
    throw error;
  }
};

/**
 * Add offer to seller deal
 */
export const addOfferToSellerDeal = async (userId, clientId, dealId, offerData) => {
  try {
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    const offer = {
      id: `offer_${Date.now()}`,
      ...offerData,
      status: 'pending',
      receivedAt: serverTimestamp(),
      expiresAt: offerData.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours default
    };
    
    await updateDoc(dealRef, {
      offers: arrayUnion(offer),
      'marketing.offerCount': (await getSellerDealById(userId, clientId, dealId)).marketing.offerCount + 1,
      updatedAt: serverTimestamp()
    });
    
    // Log activity
    await logActivity(userId, clientId, dealId, {
      type: 'offer_received',
      description: `Nova proposta recebida: €${offerData.amount}`,
      offerId: offer.id
    });
    
    return offer;
  } catch (error) {
    console.error('Error adding offer:', error);
    throw error;
  }
};

/**
 * Respond to offer
 */
export const respondToOffer = async (userId, clientId, dealId, offerId, response, details = {}) => {
  try {
    const deal = await getSellerDealById(userId, clientId, dealId);
    const offer = deal.offers.find(o => o.id === offerId);
    
    if (!offer) {
      throw new Error('Offer not found');
    }
    
    const updatedOffer = {
      ...offer,
      status: response,
      response,
      responseDate: serverTimestamp(),
      ...details
    };
    
    const updatedOffers = deal.offers.map(o => 
      o.id === offerId ? updatedOffer : o
    );
    
    const updateData = {
      offers: updatedOffers,
      updatedAt: serverTimestamp()
    };
    
    // If offer is accepted, update deal accordingly
    if (response === 'accepted') {
      updateData.acceptedOffer = updatedOffer;
      updateData.stage = 'proposta_aceite';
      updateData.transaction = createTransactionData(updatedOffer);
    }
    
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    await updateDoc(dealRef, updateData);
    
    // Log activity
    await logActivity(userId, clientId, dealId, {
      type: 'offer_response',
      description: `Proposta ${response === 'accepted' ? 'aceite' : response === 'rejected' ? 'rejeitada' : 'contraproposta'}`,
      offerId,
      response
    });
    
    return updatedOffer;
  } catch (error) {
    console.error('Error responding to offer:', error);
    throw error;
  }
};

/**
 * Update transaction data
 */
export const updateSellerTransaction = async (userId, clientId, dealId, transactionData) => {
  try {
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    // Map transaction stage to deal stage
    let newStage = null;
    switch (transactionData.stage) {
      case TRANSACTION_STAGES.CPCV_SIGNED:
        newStage = 'cpcv_signed';
        break;
      case TRANSACTION_STAGES.ESCRITURA_SCHEDULED:
        newStage = 'escritura_scheduled';
        break;
      case TRANSACTION_STAGES.COMPLETED:
        newStage = 'completed';
        break;
      default:
        if (transactionData.stage === TRANSACTION_STAGES.OFFER_ACCEPTED) {
          newStage = 'cpcv_preparation';
        }
        break;
    }
    
    const updateData = {
      transaction: transactionData,
      updatedAt: serverTimestamp()
    };
    
    if (newStage) {
      updateData.stage = newStage;
    }
    
    await updateDoc(dealRef, updateData);
    
    // Log activity
    await logActivity(userId, clientId, dealId, {
      type: 'transaction_updated',
      description: `Transação atualizada: ${transactionData.stage}`,
      transactionStage: transactionData.stage
    });
    
    return { id: dealId, ...updateData };
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Schedule viewing for property
 */
export const scheduleViewing = async (userId, clientId, dealId, viewingData) => {
  try {
    const viewing = {
      id: `viewing_${Date.now()}`,
      ...viewingData,
      status: 'scheduled',
      createdAt: serverTimestamp()
    };
    
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    await updateDoc(dealRef, {
      viewings: arrayUnion(viewing),
      'marketing.showingCount': (await getSellerDealById(userId, clientId, dealId)).marketing.showingCount + 1,
      updatedAt: serverTimestamp()
    });
    
    // Log activity
    await logActivity(userId, clientId, dealId, {
      type: 'viewing_scheduled',
      description: `Visita agendada para ${new Date(viewingData.date).toLocaleDateString('pt-PT')}`,
      viewingId: viewing.id
    });
    
    return viewing;
  } catch (error) {
    console.error('Error scheduling viewing:', error);
    throw error;
  }
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (userId, clientId, dealId, documentType, status, notes = '') => {
  try {
    const deal = await getSellerDealById(userId, clientId, dealId);
    
    const updatedChecklist = deal.documents.checklist.map(doc => {
      if (doc.type === documentType) {
        return {
          ...doc,
          status,
          uploadedAt: status === 'received' || status === 'verified' ? serverTimestamp() : doc.uploadedAt,
          notes
        };
      }
      return doc;
    });
    
    // Check if all required documents are verified
    const allDocsReady = updatedChecklist
      .filter(doc => doc.required)
      .every(doc => doc.status === 'verified');
    
    const missingDocs = updatedChecklist
      .filter(doc => doc.required && doc.status === 'pending')
      .map(doc => doc.label);
    
    const dealRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId
    );
    
    await updateDoc(dealRef, {
      'documents.checklist': updatedChecklist,
      'documents.allDocsReady': allDocsReady,
      'documents.missingDocs': missingDocs,
      updatedAt: serverTimestamp()
    });
    
    return { checklist: updatedChecklist, allDocsReady, missingDocs };
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

/**
 * Get all seller deals across all clients for a consultant
 */
export const getAllSellerDeals = async (userId) => {
  try {
    const clientsRef = collection(db, 'consultants', userId, 'clients');
    const clientsSnapshot = await getDocs(clientsRef);
    
    const allDeals = [];
    
    for (const clientDoc of clientsSnapshot.docs) {
      const dealsRef = collection(clientDoc.ref, 'sellerDeals');
      const dealsSnapshot = await getDocs(dealsRef);
      
      dealsSnapshot.docs.forEach(dealDoc => {
        allDeals.push({
          id: dealDoc.id,
          clientId: clientDoc.id,
          clientName: clientDoc.data().name,
          ...dealDoc.data()
        });
      });
    }
    
    // Sort by creation date
    allDeals.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
    
    return allDeals;
  } catch (error) {
    console.error('Error getting all seller deals:', error);
    throw error;
  }
};

/**
 * Get seller deals by stage
 */
export const getSellerDealsByStage = async (userId, stage) => {
  try {
    const allDeals = await getAllSellerDeals(userId);
    return allDeals.filter(deal => deal.stage === stage);
  } catch (error) {
    console.error('Error getting deals by stage:', error);
    throw error;
  }
};

/**
 * Move deal to different stage
 */
export const moveDealToStage = async (userId, clientId, dealId, newStage) => {
  try {
    const validationError = validateStageTransition(userId, clientId, dealId, newStage);
    if (validationError) {
      throw new Error(validationError);
    }
    
    return await updateSellerDeal(userId, clientId, dealId, { stage: newStage });
  } catch (error) {
    console.error('Error moving deal to stage:', error);
    throw error;
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize document checklist for new deals
 */
function initializeDocumentChecklist() {
  const SELLER_DOCUMENTS = [
    { type: 'property_deed', label: 'Escritura', required: true },
    { type: 'tax_id', label: 'Caderneta Predial', required: true },
    { type: 'energy_cert', label: 'Certificado Energético', required: true },
    { type: 'license', label: 'Licença de Utilização', required: true },
    { type: 'imi_receipt', label: 'Último Recibo IMI', required: false },
    { type: 'condominium', label: 'Ata Condomínio', required: false },
    { type: 'floor_plan', label: 'Planta', required: false }
  ];
  
  return SELLER_DOCUMENTS.map(doc => ({
    ...doc,
    status: 'pending',
    uploadedAt: null,
    notes: ''
  }));
}

/**
 * Validate stage transition
 */
async function validateStageTransition(userId, clientId, dealId, newStage) {
  try {
    const deal = await getSellerDealById(userId, clientId, dealId);
    
    // Check if moving to transaction stages without accepted offer
    const transactionStages = ['cpcv_preparation', 'cpcv_signed', 'escritura_scheduled', 'completed'];
    
    if (transactionStages.includes(newStage) && !deal.acceptedOffer) {
      return 'É necessário ter uma proposta aceite para avançar para a fase de transação';
    }
    
    // Check if documents are ready for CPCV
    if (newStage === 'cpcv_signed' && !deal.documents?.allDocsReady) {
      return 'Todos os documentos obrigatórios devem estar verificados antes de assinar o CPCV';
    }
    
    return null; // No validation errors
  } catch (error) {
    console.error('Error validating stage transition:', error);
    return 'Erro ao validar mudança de fase';
  }
}

/**
 * Log activity for audit trail
 */
async function logActivity(userId, clientId, dealId, activityData) {
  try {
    const activitiesRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'sellerDeals',
      dealId,
      'activities'
    );
    
    await addDoc(activitiesRef, {
      ...activityData,
      createdAt: serverTimestamp(),
      createdBy: userId
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw, just log - activity logging shouldn't break main operations
  }
}

/**
 * Batch update multiple deals
 */
export const batchUpdateSellerDeals = async (userId, updates) => {
  try {
    const batch = writeBatch(db);
    
    for (const update of updates) {
      const { clientId, dealId, data } = update;
      const dealRef = doc(
        db,
        'consultants',
        userId,
        'clients',
        clientId,
        'sellerDeals',
        dealId
      );
      
      batch.update(dealRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};