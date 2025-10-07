/**
 * CROSS-LINKING FIREBASE UTILITIES - MyImoMatePro
 * Connect buyers and sellers, track commissions
 */

import {
  collection,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { calculateMatchScore } from '../models/crossLinkingModels'; // FIXED PATH

// ============================================================================
// LINK BUYER DEAL TO SELLER OPPORTUNITY
// ============================================================================
export const linkBuyerToSeller = async (
  db, 
  consultantId,
  buyerClientId,
  dealId,
  sellerClientId,
  sellerOpportunityId
) => {
  try {
    // Get seller opportunity details
    const sellerOppRef = doc(
      db, 
      'consultants', consultantId, 
      'clients', sellerClientId, 
      'opportunities', sellerOpportunityId
    );
    const sellerOppSnap = await getDoc(sellerOppRef);
    
    if (!sellerOppSnap.exists()) {
      throw new Error('Seller opportunity not found');
    }
    
    const sellerOpp = sellerOppSnap.data();
    
    // Update buyer deal with link
    const dealRef = doc(
      db,
      'consultants', consultantId,
      'clients', buyerClientId,
      'deals', dealId
    );
    
    await updateDoc(dealRef, {
      linkedProperty: {
        sellerOpportunityId,
        sellerClientId,
        sellerName: sellerOpp.clientName || '',
        propertyAddress: sellerOpp.property?.address || ''
      },
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error linking buyer to seller:', error);
    throw error;
  }
};

// ============================================================================
// CREATE OFFER WITH BUYER LINK
// ============================================================================
export const createLinkedOffer = async (
  db,
  consultantId,
  sellerClientId,
  sellerOpportunityId,
  offerData,
  buyerInfo = null // { buyerClientId, buyerDealId, buyerName }
) => {
  try {
    // Get seller opportunity
    const oppRef = doc(
      db,
      'consultants', consultantId,
      'clients', sellerClientId,
      'opportunities', sellerOpportunityId
    );
    const oppSnap = await getDoc(oppRef);
    const oppData = oppSnap.data();
    
    // Create offer with buyer link
    const newOffer = {
      id: `offer_${Date.now()}`,
      ...offerData,
      status: 'pending',
      receivedDate: new Date().toISOString(),
      // Link to buyer if provided
      ...(buyerInfo && {
        linkedBuyer: {
          clientId: buyerInfo.buyerClientId,
          dealId: buyerInfo.buyerDealId,
          name: buyerInfo.buyerName
        }
      })
    };
    
    // Add offer to seller opportunity
    const updatedOffers = [...(oppData.offers || []), newOffer];
    await updateDoc(oppRef, {
      offers: updatedOffers,
      'stats.offersReceived': (oppData.stats?.offersReceived || 0) + 1,
      updatedAt: serverTimestamp()
    });
    
    // If buyer is linked, update their deal
    if (buyerInfo?.buyerDealId) {
      const buyerDealRef = doc(
        db,
        'consultants', consultantId,
        'clients', buyerInfo.buyerClientId,
        'deals', buyerInfo.buyerDealId
      );
      
      const dealSnap = await getDoc(buyerDealRef);
      const dealData = dealSnap.data();
      
      const offerRecord = {
        offerId: newOffer.id,
        amount: offerData.amount,
        status: 'pending',
        date: new Date().toISOString()
      };
      
      await updateDoc(buyerDealRef, {
        offersMade: [...(dealData.offersMade || []), offerRecord],
        updatedAt: serverTimestamp()
      });
    }
    
    return newOffer.id;
  } catch (error) {
    console.error('Error creating linked offer:', error);
    throw error;
  }
};

// ============================================================================
// PROPERTY MATCHING - Find buyers for a property
// ============================================================================
export const findMatchingBuyers = async (db, consultantId, sellerOpportunity) => {
  try {
    const matches = [];
    
    // Get all clients
    const clientsRef = collection(db, 'consultants', consultantId, 'clients');
    const clientsSnap = await getDocs(clientsRef);
    
    // Check each client's buyer opportunities
    for (const clientDoc of clientsSnap.docs) {
      const clientData = clientDoc.data();
      
      // Get buyer opportunities for this client
      const oppsRef = collection(
        db,
        'consultants', consultantId,
        'clients', clientDoc.id,
        'opportunities'
      );
      const buyerOppsQuery = query(oppsRef, where('type', '==', 'buyer'));
      const buyerOppsSnap = await getDocs(buyerOppsQuery);
      
      for (const buyerOpp of buyerOppsSnap.docs) {
        const buyerData = buyerOpp.data();
        
        // Only match active buyers
        if (buyerData.status !== 'active') continue;
        
        // Calculate match score
        const matchScore = calculateMatchScore(
          buyerData.requirements || {},
          sellerOpportunity
        );
        
        // Only include good matches (>60%)
        if (matchScore > 60) {
          matches.push({
            clientId: clientDoc.id,
            clientName: clientData.name,
            opportunityId: buyerOpp.id,
            requirements: buyerData.requirements,
            matchScore,
            budget: buyerData.requirements?.maxBudget,
            motivation: buyerData.motivation
          });
        }
      }
    }
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches;
  } catch (error) {
    console.error('Error finding matching buyers:', error);
    throw error;
  }
};

// ============================================================================
// PROPERTY MATCHING - Find properties for a buyer
// ============================================================================
export const findMatchingProperties = async (db, consultantId, buyerRequirements) => {
  try {
    const matches = [];
    
    // Get all clients
    const clientsRef = collection(db, 'consultants', consultantId, 'clients');
    const clientsSnap = await getDocs(clientsRef);
    
    // Check each client's seller opportunities
    for (const clientDoc of clientsSnap.docs) {
      const clientData = clientDoc.data();
      
      // Get seller opportunities
      const oppsRef = collection(
        db,
        'consultants', consultantId,
        'clients', clientDoc.id,
        'opportunities'
      );
      const sellerOppsQuery = query(oppsRef, where('type', '==', 'seller'));
      const sellerOppsSnap = await getDocs(sellerOppsQuery);
      
      for (const sellerOpp of sellerOppsSnap.docs) {
        const sellerData = sellerOpp.data();
        
        // Only match active properties
        if (sellerData.stage === 'vendido' || sellerData.stage === 'cancelado') continue;
        
        // Calculate match score
        const matchScore = calculateMatchScore(buyerRequirements, sellerData);
        
        // Only include good matches (>50%)
        if (matchScore > 50) {
          matches.push({
            clientId: clientDoc.id,
            clientName: clientData.name,
            opportunityId: sellerOpp.id,
            property: sellerData.property,
            pricing: sellerData.pricing,
            matchScore,
            stage: sellerData.stage,
            daysOnMarket: sellerData.stats?.daysOnMarket || 0
          });
        }
      }
    }
    
    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches;
  } catch (error) {
    console.error('Error finding matching properties:', error);
    throw error;
  }
};

// ============================================================================
// COMMISSION TRACKING
// ============================================================================
export const updateDealCommission = async (
  db,
  consultantId,
  clientId,
  dealId,
  commissionData
) => {
  try {
    const dealRef = doc(
      db,
      'consultants', consultantId,
      'clients', clientId,
      'deals', dealId
    );
    
    await updateDoc(dealRef, {
      commission: commissionData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating commission:', error);
    throw error;
  }
};

// ============================================================================
// TRANSACTION TRACKING
// ============================================================================
export const updateTransactionStatus = async (
  db,
  consultantId,
  updates // Array of updates for both sides
) => {
  try {
    const updatePromises = [];
    
    for (const update of updates) {
      if (update.type === 'deal') {
        // Update buyer deal
        const dealRef = doc(
          db,
          'consultants', consultantId,
          'clients', update.clientId,
          'deals', update.documentId
        );
        updatePromises.push(
          updateDoc(dealRef, {
            status: update.status,
            lastActivity: new Date().toISOString(),
            updatedAt: serverTimestamp()
          })
        );
      } else if (update.type === 'opportunity') {
        // Update seller opportunity
        const oppRef = doc(
          db,
          'consultants', consultantId,
          'clients', update.clientId,
          'opportunities', update.documentId
        );
        updatePromises.push(
          updateDoc(oppRef, {
            stage: update.stage,
            lastActivity: new Date().toISOString(),
            updatedAt: serverTimestamp()
          })
        );
      }
    }
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

// ============================================================================
// GET LINKED TRANSACTION DETAILS
// ============================================================================
export const getLinkedTransaction = async (
  db,
  consultantId,
  buyerClientId,
  dealId
) => {
  try {
    // Get buyer deal
    const dealRef = doc(
      db,
      'consultants', consultantId,
      'clients', buyerClientId,
      'deals', dealId
    );
    const dealSnap = await getDoc(dealRef);
    
    if (!dealSnap.exists()) {
      throw new Error('Deal not found');
    }
    
    const deal = { id: dealSnap.id, ...dealSnap.data() };
    
    // If linked to seller, get seller opportunity
    if (deal.linkedProperty?.sellerOpportunityId) {
      const sellerOppRef = doc(
        db,
        'consultants', consultantId,
        'clients', deal.linkedProperty.sellerClientId,
        'opportunities', deal.linkedProperty.sellerOpportunityId
      );
      const sellerOppSnap = await getDoc(sellerOppRef);
      
      if (sellerOppSnap.exists()) {
        const sellerOpp = { id: sellerOppSnap.id, ...sellerOppSnap.data() };
        
        return {
          buyerSide: {
            clientId: buyerClientId,
            deal
          },
          sellerSide: {
            clientId: deal.linkedProperty.sellerClientId,
            opportunity: sellerOpp
          },
          isLinked: true
        };
      }
    }
    
    return {
      buyerSide: {
        clientId: buyerClientId,
        deal
      },
      sellerSide: null,
      isLinked: false
    };
  } catch (error) {
    console.error('Error getting linked transaction:', error);
    throw error;
  }
};