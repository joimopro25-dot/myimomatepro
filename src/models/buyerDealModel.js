/**
 * BUYER DEAL MODEL - MyImoMatePro
 * Clean, simple schema for managing property deals
 * Path: /consultants/{id}/clients/{id}/opportunities/{id}/deals/{id}
 */

// ===== DEAL STAGES =====
export const BUYER_DEAL_STAGES = [
  { value: 'lead', label: 'Lead', order: 1, color: 'gray' },
  { value: 'viewing', label: 'A Visitar', order: 2, color: 'blue' },
  { value: 'evaluating', label: 'Em Avaliação', order: 3, color: 'yellow' },
  { value: 'offer_submitted', label: 'Proposta Enviada', order: 4, color: 'orange' },
  { value: 'negotiating', label: 'Em Negociação', order: 5, color: 'purple' },
  { value: 'accepted', label: 'Aceite', order: 6, color: 'green' },
  { value: 'closed_won', label: 'Fechado (Ganho)', order: 7, color: 'green' },
  { value: 'closed_lost', label: 'Fechado (Perdido)', order: 8, color: 'red' }
];

// ===== INTEREST LEVELS =====
export const INTEREST_LEVELS = [
  { value: 0, label: 'Sem Interesse', color: 'red' },
  { value: 3, label: 'Baixo', color: 'orange' },
  { value: 5, label: 'Médio', color: 'yellow' },
  { value: 7, label: 'Alto', color: 'blue' },
  { value: 9, label: 'Muito Alto', color: 'green' }
];

// ===== REPRESENTATION TYPES =====
export const REPRESENTATION_TYPES = {
  BUYER_ONLY: { value: 'buyer_only', label: 'Representa Comprador' },
  DUAL_AGENCY: { value: 'dual_agency', label: 'Dupla Representação' },
  REFERRAL: { value: 'referral', label: 'Referência' }
};

// ===== URGENCY LEVELS =====
export const URGENCY_LEVELS = {
  LOW: { value: 'low', label: 'Baixa', color: 'gray' },
  NORMAL: { value: 'normal', label: 'Normal', color: 'blue' },
  HIGH: { value: 'high', label: 'Alta', color: 'orange' },
  URGENT: { value: 'urgent', label: 'Urgente', color: 'red' }
};

// ===== COMPETITION LEVELS =====
export const COMPETITION_LEVELS = {
  LOW: { value: 'low', label: 'Baixa', color: 'green' },
  MEDIUM: { value: 'medium', label: 'Média', color: 'yellow' },
  HIGH: { value: 'high', label: 'Alta', color: 'red' }
};

/**
 * ===== MAIN DEAL SCHEMA =====
 * Clean structure with only essential fields
 */
export const BuyerDealSchema = {
  // IDs & Relationships
  id: '',
  consultantId: '',
  clientId: '',
  opportunityId: '',
  
  // Property Information
  property: {
    address: '',
    type: 'apartment', // apartment, house, villa, etc.
    bedrooms: 0,
    bathrooms: 0,
    area: 0, // m²
    listingUrl: '',
    reference: '', // Property reference number
    photos: [] // Array of photo URLs
  },
  
  // Pricing
  pricing: {
    askingPrice: 0,
    marketValue: 0, // Your assessment
    expectedNegotiation: 5, // percentage
    currentOffer: 0, // If offer submitted
    finalPrice: 0 // Closing price
  },
  
  // Property Agent (who represents the seller)
  propertyAgent: {
    agentId: '', // If agent exists in system
    name: '',
    agency: '',
    phone: '',
    email: '',
    whatsapp: '',
    lastContact: null, // Date of last communication
    nextFollowUp: null // Date for next follow-up
  },
  
  // Representation
  representation: {
    type: 'buyer_only', // buyer_only, dual_agency, referral
    commission: {
      type: 'percentage', // percentage or fixed
      value: 2.5
    }
  },
  
  // Deal Scoring & Assessment
  scoring: {
    propertyMatchScore: 0, // 0-10: How well property matches buyer needs
    buyerInterestLevel: 0, // 0-10: Buyer's interest level
    urgencyLevel: 'normal', // low, normal, high, urgent
    competitionLevel: 'low' // low, medium, high
  },
  
  // Competition Tracking
  competition: {
    otherInterested: 0, // Number of other buyers interested
    otherOffers: 0, // Number of other offers submitted
    notes: '' // Competition details
  },
  
  // Deal Stage & Status
  stage: 'lead', // Current stage in pipeline
  status: 'active', // active, won, lost
  
  // Follow-up Management
  nextFollowUpDate: null,
  followUpNote: '',
  
  // Documents (Links/References only - SIMPLE)
  documents: {
    energyCert: '', // URL
    floorPlan: '', // URL
    propertyDocs: '', // URL
    offerLetter: '', // URL
    contract: '', // URL
    other: [] // Array of {name, url}
  },
  
  // Important Dates
  timeline: {
    firstContactDate: null,
    firstViewingDate: null,
    offerSubmittedDate: null,
    offerAcceptedDate: null,
    closingDate: null
  },
  
  // Lost Deal Info (if status = lost)
  lostReason: '', // price, location, condition, another_property, financing, etc.
  lostDetails: '',
  competitorWon: '', // Which agency won
  
  // Notes
  notes: '', // General notes (visible to client)
  internalNotes: '', // Internal notes (not shared)
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  updatedBy: ''
};

/**
 * ===== VIEWING SCHEMA =====
 * Subcollection: deals/{dealId}/viewings/{viewingId}
 */
export const ViewingSchema = {
  id: '',
  dealId: '',

  // Workflow status
  status: 'scheduled', // 'scheduled' | 'completed'

  // Scheduling
  date: null,
  time: '',
  duration: 30, // minutes
  type: 'first_visit', // first_visit, second_visit, inspection, final_visit

  // Attendees
  attendees: {
    buyers: [],           // array of names
    agentPresent: true,
    sellerPresent: false,
    others: []            // array of names
  },

  // Feedback (for completed visits)
  feedback: {
    overallImpression: '', // loved, liked, neutral, disliked
    interestLevel: 5,      // 0-10
    positives: [],         // string[]
    negatives: [],         // string[]
    questions: [],         // string[]

    // Detailed ratings
    layout: '',            // great, good, acceptable, poor
    condition: '',         // excellent, good, needs_work, poor (use RATING_OPTIONS values)
    location: '',
    price: ''
  },

  // Follow-up
  followUp: {
    clientWants: '',       // make_offer, another_viewing, think_about_it, not_interested
    nextSteps: '',
    scheduledFor: null
  },

  notes: '',

  createdAt: null,
  createdBy: '',
  completedAt: null // when marked completed
};

// Optional helpers for UI
export const VIEWING_STATUS = [
  { value: 'scheduled', label: 'Agendada', color: 'yellow' },
  { value: 'completed', label: 'Concluída', color: 'green' }
];

export const VIEWING_TYPES = [
  { value: 'first_visit', label: 'Primeira Visita' },
  { value: 'second_visit', label: 'Segunda Visita' },
  { value: 'inspection', label: 'Inspeção' },
  { value: 'final_visit', label: 'Visita Final' }
];

// UI enums for ViewingFormModal
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

/**
 * ===== OFFER SCHEMA =====
 * Subcollection: deals/{dealId}/offers/{offerId}
 */
export const OfferSchema = {
  id: '',
  dealId: '',
  offerNumber: 1, // 1st offer, 2nd offer, etc.
  date: null,
  amount: 0,
  
  terms: {
    downPayment: 0,
    financingAmount: 0,
    closingDate: null,
    contingencies: '', // financing, inspection, etc.
    conditions: '' // Special conditions
  },
  
  status: 'pending', // pending, accepted, rejected, countered
  response: {
    date: null,
    counterAmount: 0,
    sellerNotes: ''
  },
  
  documents: {
    offerLetter: '', // URL
    preApproval: '', // URL
    other: []
  },
  
  notes: '',
  createdAt: null,
  createdBy: ''
};

/**
 * ===== ACTIVITY SCHEMA =====
 * Subcollection: deals/{dealId}/activities/{activityId}
 */
export const ActivitySchema = {
  id: '',
  dealId: '',
  type: '', // viewing_scheduled, offer_submitted, stage_changed, note_added, etc.
  description: '',
  date: null,
  createdBy: '',
  metadata: {} // Additional data specific to activity type
};

/**
 * ===== HELPER FUNCTIONS =====
 */

// Create new deal from form data
export const createNewDeal = (data) => {
  const now = new Date();
  
  // DON'T spread BuyerDealSchema first - build object from data
  const deal = {
    // IDs
    id: '',
    consultantId: data.consultantId || '',
    clientId: data.clientId || '',
    opportunityId: data.opportunityId || '',
    
    // Property - directly use data values
    property: {
      address: data.property?.address || '',
      type: data.property?.type || 'apartment',
      bedrooms: Number(data.property?.bedrooms) || 0,
      bathrooms: Number(data.property?.bathrooms) || 0,
      area: Number(data.property?.area) || 0,
      listingUrl: data.property?.listingUrl || '',
      reference: data.property?.reference || '',
      photos: data.property?.photos || []
    },
    
    // Pricing - directly use data values
    pricing: {
      askingPrice: Number(data.pricing?.askingPrice) || 0,
      marketValue: Number(data.pricing?.marketValue) || 0,
      expectedNegotiation: Number(data.pricing?.expectedNegotiation) || 5,
      currentOffer: 0,
      finalPrice: 0
    },
    
    // Property Agent
    propertyAgent: {
      agentId: data.propertyAgent?.agentId || '',
      name: data.propertyAgent?.name || '',
      agency: data.propertyAgent?.agency || '',
      phone: data.propertyAgent?.phone || '',
      email: data.propertyAgent?.email || '',
      whatsapp: data.propertyAgent?.whatsapp || '',
      lastContact: null,
      nextFollowUp: null
    },
    
    // Representation
    representation: {
      type: data.representation?.type || 'buyer_only',
      commission: {
        type: data.representation?.commission?.type || 'percentage',
        value: Number(data.representation?.commission?.value) || 2.5
      }
    },
    
    // Scoring
    scoring: {
      propertyMatchScore: Number(data.scoring?.propertyMatchScore) || 0,
      buyerInterestLevel: Number(data.scoring?.buyerInterestLevel) || 0,
      urgencyLevel: data.scoring?.urgencyLevel || 'normal',
      competitionLevel: data.scoring?.competitionLevel || 'low'
    },
    
    // Competition
    competition: {
      otherInterested: Number(data.competition?.otherInterested) || 0,
      otherOffers: Number(data.competition?.otherOffers) || 0,
      notes: data.competition?.notes || ''
    },
    
    // Stage & Status
    stage: data.stage || 'lead',
    status: 'active',
    
    // Follow-up
    nextFollowUpDate: data.nextFollowUpDate || null,
    followUpNote: data.followUpNote || '',
    
    // Documents
    documents: {
      energyCert: '',
      floorPlan: '',
      propertyDocs: '',
      offerLetter: '',
      contract: '',
      other: []
    },
    
    // Timeline
    timeline: {
      firstContactDate: now,
      firstViewingDate: null,
      offerSubmittedDate: null,
      offerAcceptedDate: null,
      closingDate: null
    },
    
    // Lost Deal Info
    lostReason: '',
    lostDetails: '',
    competitorWon: '',
    
    // Notes
    notes: data.notes || '',
    internalNotes: data.internalNotes || '',
    
    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy: data.consultantId || '',
    updatedBy: data.consultantId || ''
  };
  
  console.log('Created deal object:', deal); // DEBUG
  console.log('Address:', deal.property.address); // DEBUG
  console.log('Price:', deal.pricing.askingPrice); // DEBUG
  
  return deal;
};

// Calculate deal probability (0-100%)
export const calculateDealProbability = (deal) => {
  let probability = 0;
  
  // Base probability by stage
  const stageProbabilities = {
    lead: 10,
    viewing: 25,
    evaluating: 40,
    offer_submitted: 60,
    negotiating: 75,
    accepted: 90,
    closed_won: 100,
    closed_lost: 0
  };
  
  probability = stageProbabilities[deal.stage] || 0;
  
  // Adjust for interest level (+/- 10%)
  if (deal.scoring?.buyerInterestLevel >= 8) probability += 10;
  else if (deal.scoring?.buyerInterestLevel <= 3) probability -= 10;
  
  // Adjust for competition (-10% if high competition)
  if (deal.competition?.otherOffers > 0) probability -= 10;
  
  // Keep in bounds
  return Math.max(0, Math.min(100, probability));
};

// Check if deal needs attention
export const dealNeedsAttention = (deal) => {
  // Overdue follow-up
  if (deal.nextFollowUpDate && new Date(deal.nextFollowUpDate) < new Date()) {
    return { status: true, reason: 'Seguimento atrasado' };
  }
  
  // No activity in 7 days
  const daysSinceUpdate = Math.floor((new Date() - new Date(deal.updatedAt)) / (1000 * 60 * 60 * 24));
  if (deal.status === 'active' && daysSinceUpdate > 7) {
    return { status: true, reason: 'Sem atividade há 7+ dias' };
  }
  
  // High competition
  if (deal.competition?.otherOffers > 0 && deal.stage === 'evaluating') {
    return { status: true, reason: 'Competição alta' };
  }
  
  return { status: false, reason: '' };
};

// Check if deal is over budget
export const isOverBudget = (deal, opportunityMaxBudget) => {
  if (!opportunityMaxBudget) return false;
  return deal.pricing.askingPrice > opportunityMaxBudget;
};

// Get visual status flags
export const getDealFlags = (deal, opportunityMaxBudget = null) => {
  const flags = [];
  
  // 🔥 Hot deal
  if (deal.scoring?.buyerInterestLevel >= 8 && deal.scoring?.urgencyLevel === 'urgent') {
    flags.push({ icon: '🔥', label: 'Hot Deal', color: 'red' });
  }
  
  // ⚠️ Needs attention
  const attention = dealNeedsAttention(deal);
  if (attention.status) {
    flags.push({ icon: '⚠️', label: attention.reason, color: 'yellow' });
  }
  
  // 💰 Over budget
  if (isOverBudget(deal, opportunityMaxBudget)) {
    flags.push({ icon: '💰', label: 'Acima do orçamento', color: 'orange' });
  }
  
  // 🏆 Multiple offers
  if (deal.competition?.otherOffers > 0) {
    flags.push({ icon: '🏆', label: `${deal.competition.otherOffers} outras propostas`, color: 'purple' });
  }
  
  return flags;
};

// Format deal summary for display
export const formatDealSummary = (deal) => {
  const stage = BUYER_DEAL_STAGES.find(s => s.value === deal.stage);
  
  return {
    title: deal.property?.address || 'Sem endereço',
    subtitle: `${deal.property?.type} • ${deal.property?.bedrooms}Q • €${deal.pricing?.askingPrice?.toLocaleString('pt-PT')}`,
    stage: stage?.label || deal.stage,
    stageColor: stage?.color || 'gray',
    probability: calculateDealProbability(deal),
    interestLevel: deal.scoring?.buyerInterestLevel || 0
  };
};

// Validate deal data
export const validateDeal = (deal) => {
  const errors = [];
  
  if (!deal.property?.address) errors.push('Endereço é obrigatório');
  if (!deal.pricing?.askingPrice || deal.pricing.askingPrice <= 0) errors.push('Preço pedido é obrigatório');
  if (!deal.consultantId) errors.push('Consultant ID é obrigatório');
  if (!deal.clientId) errors.push('Client ID é obrigatório');
  if (!deal.opportunityId) errors.push('Opportunity ID é obrigatório');
  
  return errors;
};

// ===== BACKWARD COMPATIBILITY =====
// Alias for old function name
export const isDealActionNeeded = dealNeedsAttention;