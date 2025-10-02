// src/models/buyerDealModel.js
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  Timestamp,
  increment
} from 'firebase/firestore';

// ============================================
// BUYER DEAL SCHEMA
// ============================================
export const BuyerDealSchema = {
  id: '',
  opportunityId: '',
  
  // Property info - nested structure
  property: {
    address: '',
    type: 'apartment',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    listingUrl: '',
    reference: ''
  },
  
  // Pricing - nested structure  
  pricing: {
    askingPrice: 0,
    marketValue: 0,
    expectedNegotiation: 0
  },
  
  // Property agent
  propertyAgent: {
    name: '',
    agency: '',
    phone: '',
    email: ''
  },
  
  // Buyer info - keep flat for compatibility
  buyerName: '',
  buyerEmail: '',
  buyerPhone: '',
  
  // Deal info
  status: 'lead',
  stage: 'lead',
  priority: 'medium',
  probability: 50,
  
  // Scoring
  scoring: {
    propertyMatchScore: 0,
    buyerInterestLevel: 0,
    urgencyLevel: 'normal',
    competitionLevel: 'low'
  },
  
  // Competition
  competition: {
    otherInterested: 0,
    otherOffers: 0,
    notes: ''
  },
  
  // Representation
  representation: {
    type: 'buyer_only',
    commission: {
      type: 'percentage',
      value: 2.5
    }
  },
  
  // Viewings
  viewingCount: 0,
  lastViewingDate: null,
  nextViewingDate: null,
  
  // Offers
  offerCount: 0,
  latestOfferAmount: 0,
  latestOfferStatus: '',
  
  // Notes
  notes: '',
  internalNotes: '',
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  createdBy: ''
};

export const DEAL_STATUS = [
  { value: 'lead', label: 'Lead', color: 'gray' },
  { value: 'viewing_scheduled', label: 'Visita Agendada', color: 'blue' },
  { value: 'viewing_completed', label: 'Visita Realizada', color: 'cyan' },
  { value: 'offer_made', label: 'Proposta Feita', color: 'yellow' },
  { value: 'negotiation', label: 'Negociação', color: 'orange' },
  { value: 'accepted', label: 'Aceite', color: 'green' },
  { value: 'closed', label: 'Fechado', color: 'emerald' },
  { value: 'lost', label: 'Perdido', color: 'red' }
];

export const DEAL_PRIORITY = [
  { value: 'low', label: 'Baixa', color: 'gray' },
  { value: 'medium', label: 'Média', color: 'blue' },
  { value: 'high', label: 'Alta', color: 'red' }
];

// Deal stages for Kanban board
export const BUYER_DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: 'gray' },
  { value: 'viewing', label: 'A Visitar', color: 'blue' },
  { value: 'viewing_scheduled', label: 'Visita Agendada', color: 'blue' },
  { value: 'viewing_completed', label: 'Visita Realizada', color: 'cyan' },
  { value: 'evaluating', label: 'Em Avaliação', color: 'yellow' },
  { value: 'offer_made', label: 'Proposta Feita', color: 'yellow' },
  { value: 'offer_submitted', label: 'Proposta Enviada', color: 'orange' },
  { value: 'negotiating', label: 'Em Negociação', color: 'orange' },
  { value: 'negotiation', label: 'Negociação', color: 'orange' },
  { value: 'accepted', label: 'Aceite', color: 'green' },
  { value: 'closed_won', label: 'Fechado (Ganho)', color: 'green' },
  { value: 'lost', label: 'Perdido', color: 'red' },
  { value: 'closed_lost', label: 'Fechado (Perdido)', color: 'red' }
];

// Interest levels
export const INTEREST_LEVELS = [
  { value: 0, label: 'Sem Interesse', color: 'red' },
  { value: 3, label: 'Baixo', color: 'orange' },
  { value: 5, label: 'Médio', color: 'yellow' },
  { value: 7, label: 'Alto', color: 'blue' },
  { value: 9, label: 'Muito Alto', color: 'green' }
];

// Representation types
export const REPRESENTATION_TYPES = {
  BUYER_ONLY: { value: 'buyer_only', label: 'Representa Comprador' },
  DUAL_AGENCY: { value: 'dual_agency', label: 'Dupla Representação' },
  REFERRAL: { value: 'referral', label: 'Referência' }
};

// Urgency levels
export const URGENCY_LEVELS = {
  LOW: { value: 'low', label: 'Baixa', color: 'gray' },
  NORMAL: { value: 'normal', label: 'Normal', color: 'blue' },
  HIGH: { value: 'high', label: 'Alta', color: 'orange' },
  URGENT: { value: 'urgent', label: 'Urgente', color: 'red' }
};

// Competition levels
export const COMPETITION_LEVELS = {
  LOW: { value: 'low', label: 'Baixa', color: 'green' },
  MEDIUM: { value: 'medium', label: 'Média', color: 'yellow' },
  HIGH: { value: 'high', label: 'Alta', color: 'red' }
};

// ============================================
// VIEWING SCHEMA
// ============================================
export const ViewingSchema = {
  id: '',
  dealId: '',
  
  // Viewing details
  scheduledDate: null,
  duration: 60, // minutes
  location: '',
  
  // Status
  status: 'scheduled', // scheduled, completed, cancelled
  
  // Feedback (after viewing)
  buyerFeedback: '',
  interestLevel: '', // low, medium, high
  concerns: '',
  positives: '',
  
  // Metadata
  createdAt: null,
  completedAt: null,
  createdBy: ''
};

export const VIEWING_STATUS = [
  { value: 'scheduled', label: 'Agendada', color: 'blue' },
  { value: 'completed', label: 'Realizada', color: 'green' },
  { value: 'cancelled', label: 'Cancelada', color: 'red' }
];

export const VIEWING_TYPES = [
  { value: 'first_viewing', label: 'Primeira Visita' },
  { value: 'second_viewing', label: 'Segunda Visita' },
  { value: 'final_viewing', label: 'Visita Final' },
  { value: 'virtual', label: 'Visita Virtual' }
];

export const INTEREST_LEVEL = [
  { value: 'low', label: 'Baixo', color: 'red' },
  { value: 'medium', label: 'Médio', color: 'yellow' },
  { value: 'high', label: 'Alto', color: 'green' }
];

// Viewing feedback options
export const IMPRESSION_OPTIONS = [
  { value: 'loved', label: '😍 Adorou', color: 'green' },
  { value: 'liked', label: '👍 Gostou', color: 'blue' },
  { value: 'neutral', label: '😐 Neutro', color: 'gray' },
  { value: 'disliked', label: '👎 Não Gostou', color: 'red' }
];

export const RATING_OPTIONS = [
  { value: 'great', label: 'Excelente' },
  { value: 'good', label: 'Bom' },
  { value: 'acceptable', label: 'Aceitável' },
  { value: 'poor', label: 'Fraco' }
];

export const NEXT_STEPS = [
  { value: 'make_offer', label: 'Fazer Proposta', icon: '💰' },
  { value: 'another_viewing', label: 'Nova Visita', icon: '🏠' },
  { value: 'think_about_it', label: 'Pensar', icon: '🤔' },
  { value: 'not_interested', label: 'Não Interessado', icon: '❌' }
];

// ============================================
// OFFER SCHEMA - NEW
// ============================================
export const OfferSchema = {
  id: '',
  dealId: '',
  offerNumber: 1, // Auto-increment per deal
  
  // Amounts
  amount: 0,
  counterAmount: 0, // If seller counters
  
  // Status flow
  status: 'draft', // draft, sent, accepted, rejected, countered, expired, withdrawn
  
  // Approval tracking
  buyerApproved: false, // Agent checkbox
  
  // Timing
  createdAt: null,
  sentAt: null, // When marked as "sent"
  expiresAt: null, // sentAt + expiry hours
  expiryHours: 48, // Default 48h, editable
  respondedAt: null, // When seller responds
  
  // Terms
  terms: {
    downPayment: 0,
    financingAmount: 0,
    closingDate: null,
    conditions: '', // "Subject to financing", etc
    contingencies: '' // Inspection, appraisal, etc
  },
  
  // Notes
  notes: '', // Agent internal notes
  counterNotes: '', // Seller's reasoning for counter
  
  // Response tracking
  sellerResponse: '', // Text response from seller
  
  // Metadata
  createdBy: '',
  updatedAt: null
};

export const OFFER_STATUS = [
  { value: 'draft', label: 'Rascunho', color: 'gray' },
  { value: 'sent', label: 'Enviada', color: 'blue' },
  { value: 'accepted', label: 'Aceite', color: 'green' },
  { value: 'rejected', label: 'Recusada', color: 'red' },
  { value: 'countered', label: 'Contraproposta', color: 'yellow' },
  { value: 'expired', label: 'Expirada', color: 'orange' },
  { value: 'withdrawn', label: 'Retirada', color: 'purple' }
];

// ============================================
// BUYER DEAL CRUD OPERATIONS
// ============================================

// Create new buyer deal
export const createBuyerDeal = async (userId, clientId, opportunityId, dealData) => {
  try {
    const dealsRef = collection(
      db, 
      'consultants', 
      userId, 
      'clients', 
      clientId, 
      'opportunities', 
      opportunityId, 
      'deals'
    );
    
    const newDeal = {
      ...dealData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      opportunityId,
      viewingCount: 0,
      offerCount: 0,
      latestOfferAmount: 0,
      latestOfferStatus: ''
    };
    
    const docRef = await addDoc(dealsRef, newDeal);
    return { id: docRef.id, ...newDeal };
  } catch (error) {
    console.error('Error creating buyer deal:', error);
    throw error;
  }
};

// Get all deals for an opportunity
export const getBuyerDeals = async (userId, clientId, opportunityId) => {
  try {
    const dealsRef = collection(
      db, 
      'consultants', 
      userId, 
      'clients', 
      clientId, 
      'opportunities', 
      opportunityId, 
      'deals'
    );
    
    const q = query(dealsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting buyer deals:', error);
    throw error;
  }
};

// Update buyer deal
export const updateBuyerDeal = async (userId, clientId, opportunityId, dealId, updates) => {
  try {
    const dealRef = doc(
      db, 
      'consultants', 
      userId, 
      'clients', 
      clientId, 
      'opportunities', 
      opportunityId, 
      'deals', 
      dealId
    );
    
    await updateDoc(dealRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating buyer deal:', error);
    throw error;
  }
};

// Delete buyer deal
export const deleteBuyerDeal = async (userId, clientId, opportunityId, dealId) => {
  try {
    const dealRef = doc(
      db, 
      'consultants', 
      userId, 
      'clients', 
      clientId, 
      'opportunities', 
      opportunityId, 
      'deals', 
      dealId
    );
    
    await deleteDoc(dealRef);
    return true;
  } catch (error) {
    console.error('Error deleting buyer deal:', error);
    throw error;
  }
};

// ============================================
// VIEWING CRUD OPERATIONS
// ============================================

// Create viewing
export const createViewing = async (userId, clientId, opportunityId, dealId, viewingData) => {
  try {
    const viewingsRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'viewings'
    );
    
    const newViewing = {
      ...viewingData,
      dealId,
      createdAt: Timestamp.now(),
      createdBy: userId
    };
    
    const docRef = await addDoc(viewingsRef, newViewing);
    
    // Update deal's viewing count and next viewing date
    await updateBuyerDeal(userId, clientId, opportunityId, dealId, {
      viewingCount: increment(1),
      nextViewingDate: viewingData.scheduledDate,
      status: 'viewing_scheduled'
    });
    
    return { id: docRef.id, ...newViewing };
  } catch (error) {
    console.error('Error creating viewing:', error);
    throw error;
  }
};

// Get viewings for a deal
export const getViewings = async (userId, clientId, opportunityId, dealId) => {
  try {
    const viewingsRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'viewings'
    );
    
    const q = query(viewingsRef, orderBy('scheduledDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting viewings:', error);
    throw error;
  }
};

// Update viewing
export const updateViewing = async (userId, clientId, opportunityId, dealId, viewingId, updates) => {
  try {
    const viewingRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'viewings',
      viewingId
    );
    
    await updateDoc(viewingRef, updates);
    
    // If completing viewing, update deal
    if (updates.status === 'completed') {
      await updateBuyerDeal(userId, clientId, opportunityId, dealId, {
        lastViewingDate: updates.completedAt || Timestamp.now(),
        status: 'viewing_completed'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating viewing:', error);
    throw error;
  }
};

// ============================================
// OFFER CRUD OPERATIONS - NEW
// ============================================

// Create offer
export const createOffer = async (userId, clientId, opportunityId, dealId, offerData) => {
  try {
    const offersRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers'
    );
    
    // Get current offer count to determine offer number
    const offersSnapshot = await getDocs(offersRef);
    const offerNumber = offersSnapshot.size + 1;
    
    const newOffer = {
      ...offerData,
      dealId,
      offerNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: userId,
      status: offerData.status || 'draft'
    };
    
    const docRef = await addDoc(offersRef, newOffer);
    
    // Update deal's offer count
    await updateBuyerDeal(userId, clientId, opportunityId, dealId, {
      offerCount: increment(1),
      latestOfferAmount: offerData.amount,
      latestOfferStatus: newOffer.status
    });
    
    return { id: docRef.id, ...newOffer };
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

// Get offers for a deal
export const getOffers = async (userId, clientId, opportunityId, dealId) => {
  try {
    const offersRef = collection(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers'
    );
    
    const q = query(offersRef, orderBy('offerNumber', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting offers:', error);
    throw error;
  }
};

// Update offer
export const updateOffer = async (userId, clientId, opportunityId, dealId, offerId, updates) => {
  try {
    const offerRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers',
      offerId
    );
    
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    
    // If sending offer, set sentAt and calculate expiresAt
    if (updates.status === 'sent' && !updates.sentAt) {
      updateData.sentAt = Timestamp.now();
      const expiryHours = updates.expiryHours || 48;
      const expiryMs = expiryHours * 60 * 60 * 1000;
      updateData.expiresAt = Timestamp.fromMillis(Date.now() + expiryMs);
    }
    
    // If responding to offer, set respondedAt
    if (['accepted', 'rejected', 'countered'].includes(updates.status)) {
      updateData.respondedAt = Timestamp.now();
    }
    
    await updateDoc(offerRef, updateData);
    
    // Update deal's latest offer info
    await updateBuyerDeal(userId, clientId, opportunityId, dealId, {
      latestOfferStatus: updates.status,
      status: updates.status === 'accepted' ? 'accepted' : 
              updates.status === 'countered' ? 'negotiation' :
              updates.status === 'sent' ? 'offer_made' : undefined
    });
    
    return true;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

// Delete offer
export const deleteOffer = async (userId, clientId, opportunityId, dealId, offerId) => {
  try {
    const offerRef = doc(
      db,
      'consultants',
      userId,
      'clients',
      clientId,
      'opportunities',
      opportunityId,
      'deals',
      dealId,
      'offers',
      offerId
    );
    
    await deleteDoc(offerRef);
    
    // Update deal's offer count
    await updateBuyerDeal(userId, clientId, opportunityId, dealId, {
      offerCount: increment(-1)
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

// ============================================
// HELPER FUNCTIONS FOR DEALCONTEXT
// ============================================

// Create new deal object with all required fields
export const createNewDeal = (data) => {
  const now = Timestamp.now();
  
  return {
    id: data.id || '',
    opportunityId: data.opportunityId || '',
    
    // Property - nested structure
    property: {
      address: data.property?.address || '',
      type: data.property?.type || 'apartment',
      bedrooms: data.property?.bedrooms || 0,
      bathrooms: data.property?.bathrooms || 0,
      area: data.property?.area || 0,
      listingUrl: data.property?.listingUrl || '',
      reference: data.property?.reference || ''
    },
    
    // Pricing - nested structure
    pricing: {
      askingPrice: data.pricing?.askingPrice || 0,
      marketValue: data.pricing?.marketValue || 0,
      expectedNegotiation: data.pricing?.expectedNegotiation || 0
    },
    
    // Property agent
    propertyAgent: data.propertyAgent || {
      name: '',
      agency: '',
      phone: '',
      email: ''
    },
    
    // Buyer info
    buyerName: data.buyerName || '',
    buyerEmail: data.buyerEmail || '',
    buyerPhone: data.buyerPhone || '',
    
    // Deal info
    status: data.status || 'lead',
    stage: data.stage || 'lead',
    priority: data.priority || 'medium',
    probability: data.probability || 50,
    
    // Scoring
    scoring: data.scoring || {
      propertyMatchScore: 0,
      buyerInterestLevel: 0,
      urgencyLevel: 'normal',
      competitionLevel: 'low'
    },
    
    // Competition
    competition: data.competition || {
      otherInterested: 0,
      otherOffers: 0,
      notes: ''
    },
    
    // Representation
    representation: data.representation || {
      type: 'buyer_only',
      commission: {
        type: 'percentage',
        value: 2.5
      }
    },
    
    // Viewings
    viewingCount: 0,
    lastViewingDate: null,
    nextViewingDate: null,
    
    // Offers
    offerCount: 0,
    latestOfferAmount: 0,
    latestOfferStatus: '',
    
    // Notes
    notes: data.notes || '',
    internalNotes: data.internalNotes || '',
    
    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy || data.consultantId || ''
  };
};

// Validate deal data
export const validateDeal = (deal) => {
  const errors = [];
  
  if (!deal.propertyAddress) {
    errors.push('Property address is required');
  }
  
  if (!deal.propertyPrice || deal.propertyPrice <= 0) {
    errors.push('Valid property price is required');
  }
  
  if (!deal.buyerName) {
    errors.push('Buyer name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate deal probability (0-100%)
export const calculateDealProbability = (deal) => {
  if (!deal) return 50;
  
  let probability = 50; // Base probability
  
  // Adjust based on status
  const statusWeights = {
    'lead': 20,
    'viewing_scheduled': 40,
    'viewing_completed': 60,
    'offer_made': 75,
    'negotiation': 80,
    'accepted': 95,
    'closed': 100,
    'lost': 0
  };
  
  probability = statusWeights[deal.status] || probability;
  
  // Adjust based on viewing count
  if (deal.viewingCount > 0) {
    probability += Math.min(deal.viewingCount * 5, 15);
  }
  
  // Adjust based on offer status
  if (deal.latestOfferStatus === 'accepted') {
    probability = 95;
  } else if (deal.latestOfferStatus === 'countered') {
    probability += 10;
  }
  
  // Cap at 100
  return Math.min(probability, 100);
};

// Format deal summary
export const formatDealSummary = (deal) => {
  if (!deal) return '';
  
  const parts = [];
  
  if (deal.buyerName) {
    parts.push(deal.buyerName);
  }
  
  // Use nested property structure
  if (deal.property?.address) {
    parts.push(deal.property.address);
  }
  
  if (deal.pricing?.askingPrice) {
    parts.push(`€${deal.pricing.askingPrice.toLocaleString('pt-PT')}`);
  }
  
  return parts.join(' - ');
};

// Get deal flags
export const getDealFlags = (deal) => {
  const flags = [];
  
  if (deal.viewingCount === 0) {
    flags.push({ type: 'warning', message: 'No viewings scheduled' });
  }
  
  if (deal.offerCount === 0 && deal.viewingCount > 2) {
    flags.push({ type: 'info', message: 'Multiple viewings, no offer yet' });
  }
  
  if (deal.latestOfferStatus === 'rejected') {
    flags.push({ type: 'error', message: 'Offer rejected' });
  }
  
  if (deal.latestOfferStatus === 'expired') {
    flags.push({ type: 'warning', message: 'Offer expired' });
  }
  
  return flags;
};

// Check if deal needs attention
export const dealNeedsAttention = (deal) => {
  const flags = getDealFlags(deal);
  
  return {
    status: flags.length > 0,
    flags,
    priority: flags.some(f => f.type === 'error') ? 'high' : 'normal'
  };
};

// Alias for compatibility
export const isDealActionNeeded = dealNeedsAttention;