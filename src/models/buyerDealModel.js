/**
 * BUYER DEAL MODEL - MyImoMatePro
 * Manages deals (property pursuits) for buyer opportunities
 */

import { AGENT_TYPES } from './agentModel';

// Deal Stages Pipeline
export const BUYER_DEAL_STAGES = [
  { value: 'lead', label: 'Imóvel Identificado', color: 'gray', order: 1 },
  { value: 'contacted', label: 'Agente Contactado', color: 'blue', order: 2 },
  { value: 'viewing_scheduled', label: 'Visita Agendada', color: 'indigo', order: 3 },
  { value: 'viewed', label: 'Visitado', color: 'purple', order: 4 },
  { value: 'evaluating', label: 'Em Avaliação', color: 'yellow', order: 5 },
  { value: 'offer_preparation', label: 'Preparando Proposta', color: 'orange', order: 6 },
  { value: 'offer_submitted', label: 'Proposta Enviada', color: 'pink', order: 7 },
  { value: 'negotiating', label: 'Em Negociação', color: 'red', order: 8 },
  { value: 'offer_accepted', label: 'Proposta Aceita', color: 'green', order: 9 },
  { value: 'documentation', label: 'Documentação', color: 'teal', order: 10 },
  { value: 'financing', label: 'Financiamento', color: 'cyan', order: 11 },
  { value: 'closing', label: 'Escritura', color: 'emerald', order: 12 },
  { value: 'completed', label: 'Concluído', color: 'green', order: 13 },
  { value: 'lost', label: 'Perdido', color: 'red', order: 14 }
];

// Deal Status
export const DEAL_STATUS = {
  ACTIVE: { value: 'active', label: 'Ativo', color: 'green' },
  WON: { value: 'won', label: 'Ganho', color: 'emerald' },
  LOST: { value: 'lost', label: 'Perdido', color: 'red' },
  ON_HOLD: { value: 'on_hold', label: 'Em Espera', color: 'yellow' },
  WITHDRAWN: { value: 'withdrawn', label: 'Retirado', color: 'gray' }
};

// Interest Levels
export const INTEREST_LEVELS = [
  { value: 10, label: 'Adorou - Quer fazer proposta', color: 'green', emoji: '😍' },
  { value: 8, label: 'Muito Interessado', color: 'emerald', emoji: '😊' },
  { value: 6, label: 'Interessado', color: 'blue', emoji: '🙂' },
  { value: 4, label: 'Moderado', color: 'yellow', emoji: '😐' },
  { value: 2, label: 'Pouco Interessado', color: 'orange', emoji: '😕' },
  { value: 0, label: 'Sem Interesse', color: 'red', emoji: '😞' }
];

// Lost Reasons
export const LOST_REASONS = {
  PRICE: { value: 'price', label: 'Preço muito alto' },
  CONDITION: { value: 'condition', label: 'Estado do imóvel' },
  LOCATION: { value: 'location', label: 'Localização inadequada' },
  SIZE: { value: 'size', label: 'Tamanho inadequado' },
  ANOTHER_PROPERTY: { value: 'another_property', label: 'Escolheu outro imóvel' },
  FINANCING: { value: 'financing', label: 'Problemas de financiamento' },
  PERSONAL: { value: 'personal', label: 'Motivos pessoais' },
  SELLER_WITHDREW: { value: 'seller_withdrew', label: 'Vendedor retirou' },
  OTHER: { value: 'other', label: 'Outro motivo' }
};

// Representation Types
export const REPRESENTATION_TYPES = {
  BUYER_ONLY: { value: 'buyer_only', label: 'Representa Comprador' },
  DUAL_AGENCY: { value: 'dual_agency', label: 'Dupla Representação' },
  REFERRAL: { value: 'referral', label: 'Referência' }
};

/**
 * Buyer Deal Model Schema
 */
export const BuyerDealSchema = {
  // Core Relationships
  id: '',
  opportunityId: '', // Parent buyer opportunity
  clientId: '',      // Buyer client
  propertyId: '',    // Property being considered
  
  // Deal Tracking
  stage: 'lead',
  status: DEAL_STATUS.ACTIVE.value,
  priority: 'normal', // low, normal, high, urgent
  
  // Property Details Cache (for quick display)
  property: {
    address: '',
    type: '', // apartment, house, etc.
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    photos: [], // Main photos URLs
    listingUrl: '',
    reference: ''
  },
  
  // Pricing Information
  pricing: {
    askingPrice: 0,
    marketValue: 0, // Your assessment
    comparablePrice: 0, // Based on comparables
    
    // Offer History
    offers: [], // Array of offer records
    currentOffer: null,
    highestOffer: 0,
    finalPrice: null, // Agreed price if deal won
    
    // Negotiation room
    expectedNegotiation: 0, // % expected discount
    maxBudget: 0, // From buyer qualification
  },
  
  // Agent Information
  propertyAgent: {
    agentId: '', // Reference to agent collection
    agentType: AGENT_TYPES.EXTERNAL,
    name: '',
    agency: '',
    phone: '',
    email: '',
    whatsapp: '',
    responseQuality: '', // fast, normal, slow
    commission: {
      type: 'percentage', // percentage or fixed
      value: 2.5,
      splitAgreement: '50/50',
      notes: ''
    }
  },
  
  // Representation Details
  representation: {
    type: REPRESENTATION_TYPES.BUYER_ONLY.value,
    buyerAgentId: '', // You as buyer's agent
    sellerAgentId: '', // Property listing agent
    dualAgencyDisclosure: false,
    dualAgencyDisclosureDate: null,
    cooperationAgreement: '',
    commissionSplit: '50/50'
  },
  
  // Viewing Management
  viewings: [], // Array of viewing records
  nextViewing: null,
  totalViewings: 0,
  
  // Scoring & Assessment
  scoring: {
    propertyMatchScore: 0, // 0-100 how well it matches requirements
    buyerInterestLevel: 0, // 0-10 after viewing
    dealProbability: 0, // 0-100 likelihood of closing
    competitionLevel: 'low', // low, medium, high
    urgencyLevel: 'normal', // low, normal, high, urgent
  },
  
  // Competition Tracking
  competition: {
    otherInterested: 0, // Number of other interested buyers
    otherOffers: 0,
    expectedDecisionDate: null,
    notes: ''
  },
  
  // Property Access
  access: {
    keyLocation: '',
    keyboxCode: '',
    contactPerson: '',
    viewingInstructions: '',
    restrictions: '', // "No Sunday visits", etc.
    tenantInfo: {
      occupied: false,
      tenantName: '',
      tenantPhone: '',
      noticeRequired: 24, // hours
    }
  },
  
  // Agent Communication Log
  agentInteractions: [], // Array of interaction records
  lastAgentContact: null,
  nextFollowUp: null,
  
  // Documents
  documents: {
    propertyDocs: [], // Energy cert, floor plans, etc.
    offers: [], // Offer documents
    contracts: [], // CPCV, etc.
    inspections: [], // Inspection reports
    financing: [], // Pre-approval letters, etc.
  },
  
  // Important Dates
  timeline: {
    firstContactDate: null,
    firstViewingDate: null,
    offerDate: null,
    offerAcceptanceDate: null,
    inspectionDate: null,
    financingApprovalDate: null,
    closingDate: null, // Expected or actual
    possessionDate: null,
  },
  
  // Lost Deal Tracking
  lostDetails: {
    reason: null,
    reasonDetails: '',
    competitorWon: '', // Which agency/agent won
    lessonsLearned: '',
    wouldReconsider: false,
  },
  
  // Activity Tracking
  activities: [], // All activities related to this deal
  notes: '',
  internalNotes: '', // Not shared with client
  
  // Metadata
  createdAt: null,
  createdBy: '',
  updatedAt: null,
  updatedBy: '',
  consultantId: ''
};

/**
 * Viewing Record Schema
 */
export const ViewingSchema = {
  id: '',
  date: null,
  time: '',
  duration: 30, // minutes
  type: 'first_visit', // first_visit, second_visit, technical_inspection, final_visit
  
  attendees: {
    buyers: [], // Who attended from buyer side
    agentPresent: true,
    sellerPresent: false,
    others: [] // Inspector, family, etc.
  },
  
  feedback: {
    overallImpression: '', // loved, liked, neutral, disliked
    interestLevel: 0, // 0-10
    
    // Detailed feedback
    positives: [], // What they liked
    negatives: [], // Concerns
    questions: [], // Questions raised
    
    // Specific areas
    layout: '', // perfect, good, acceptable, poor
    condition: '', // excellent, good, needs_work, poor
    location: '', // perfect, good, acceptable, poor
    price: '', // great_value, fair, expensive, overpriced
  },
  
  followUp: {
    clientWants: '', // another_viewing, time_to_think, make_offer, not_interested
    nextSteps: '',
    scheduledFor: null
  },
  
  photos: [], // Photos taken during viewing
  notes: ''
};

/**
 * Offer Record Schema
 */
export const OfferSchema = {
  id: '',
  offerNumber: 1, // 1st offer, 2nd offer, etc.
  date: null,
  amount: 0,
  
  terms: {
    downPayment: 0,
    financingAmount: 0,
    closingDate: null,
    contingencies: [], // financing, inspection, appraisal, sale_of_property
    inclusions: [], // appliances, furniture, etc.
    exclusions: [],
    additionalTerms: ''
  },
  
  response: {
    status: '', // pending, accepted, rejected, countered
    responseDate: null,
    counterAmount: 0,
    counterTerms: '',
    sellerComments: ''
  },
  
  validity: {
    expiresAt: null,
    withdrawn: false,
    withdrawnDate: null,
    withdrawnReason: ''
  },
  
  documents: [], // Offer letter, pre-approval, etc.
  notes: ''
};

/**
 * Helper Functions
 */

// Calculate property match score
export const calculateMatchScore = (deal, buyerRequirements) => {
  let score = 100;
  const property = deal.property;
  const reqs = buyerRequirements;
  
  // Price match (30 points)
  if (deal.pricing.askingPrice > reqs.budget.maxPrice) {
    const overBudget = ((deal.pricing.askingPrice - reqs.budget.maxPrice) / reqs.budget.maxPrice) * 100;
    score -= Math.min(30, overBudget * 2);
  }
  
  // Location match (25 points)
  if (reqs.requirements.preferredLocations?.length > 0) {
    if (!reqs.requirements.preferredLocations.includes(property.location)) {
      score -= 25;
    }
  }
  
  // Bedrooms (15 points)
  if (property.bedrooms < reqs.requirements.bedrooms?.min) {
    score -= 15;
  }
  
  // Property type (15 points)
  if (reqs.requirements.propertyTypes?.length > 0) {
    if (!reqs.requirements.propertyTypes.includes(property.type)) {
      score -= 15;
    }
  }
  
  // Area (15 points)
  if (reqs.requirements.area?.min && property.area < reqs.requirements.area.min) {
    const underSize = ((reqs.requirements.area.min - property.area) / reqs.requirements.area.min) * 100;
    score -= Math.min(15, underSize);
  }
  
  return Math.max(0, Math.round(score));
};

// Calculate deal probability
export const calculateDealProbability = (deal) => {
  let probability = 50; // Start at 50%
  
  // Interest level impact (±30%)
  if (deal.scoring.buyerInterestLevel >= 8) probability += 30;
  else if (deal.scoring.buyerInterestLevel >= 6) probability += 15;
  else if (deal.scoring.buyerInterestLevel <= 4) probability -= 20;
  
  // Stage impact (±20%)
  if (['offer_submitted', 'negotiating', 'offer_accepted'].includes(deal.stage)) probability += 20;
  else if (['lead', 'contacted'].includes(deal.stage)) probability -= 10;
  
  // Competition impact (±15%)
  if (deal.competition.otherOffers > 2) probability -= 15;
  else if (deal.competition.otherOffers === 0) probability += 10;
  
  // Match score impact (±15%)
  if (deal.scoring.propertyMatchScore >= 80) probability += 15;
  else if (deal.scoring.propertyMatchScore < 50) probability -= 15;
  
  return Math.min(100, Math.max(0, Math.round(probability)));
};

// Get deal urgency
export const getDealUrgency = (deal) => {
  const daysSinceContact = deal.timeline.firstContactDate 
    ? Math.floor((new Date() - new Date(deal.timeline.firstContactDate)) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (deal.scoring.urgencyLevel === 'urgent') return 'urgent';
  if (deal.competition.otherOffers > 0) return 'high';
  if (daysSinceContact > 30 && deal.stage === 'evaluating') return 'high';
  if (deal.nextFollowUp && new Date(deal.nextFollowUp) < new Date()) return 'high';
  
  return 'normal';
};

// Get stage progress percentage
export const getStageProgress = (stage) => {
  const stageObj = BUYER_DEAL_STAGES.find(s => s.value === stage);
  if (!stageObj) return 0;
  
  return Math.round((stageObj.order / (BUYER_DEAL_STAGES.length - 1)) * 100);
};

// Get next logical stage
export const getNextStage = (currentStage) => {
  const currentIndex = BUYER_DEAL_STAGES.findIndex(s => s.value === currentStage);
  if (currentIndex === -1 || currentIndex === BUYER_DEAL_STAGES.length - 1) return null;
  
  return BUYER_DEAL_STAGES[currentIndex + 1].value;
};

// Format deal summary
export const formatDealSummary = (deal) => {
  const stage = BUYER_DEAL_STAGES.find(s => s.value === deal.stage);
  
  return {
    title: `${deal.property.address || 'Property'} - ${stage?.label}`,
    subtitle: `${deal.property.type} - ${deal.property.bedrooms}Q - €${deal.pricing.askingPrice?.toLocaleString('pt-PT')}`,
    status: deal.status,
    stage: deal.stage,
    progress: getStageProgress(deal.stage),
    urgency: getDealUrgency(deal),
    matchScore: deal.scoring.propertyMatchScore,
    interestLevel: deal.scoring.buyerInterestLevel,
    probability: calculateDealProbability(deal)
  };
};

// Check if action is needed
export const isDealActionNeeded = (deal) => {
  // Overdue follow-up
  if (deal.nextFollowUp && new Date(deal.nextFollowUp) < new Date()) return true;
  
  // No activity in 7 days for active deals
  if (deal.status === DEAL_STATUS.ACTIVE.value) {
    const lastActivity = deal.activities?.[0]?.date || deal.updatedAt;
    if (lastActivity) {
      const daysSinceActivity = Math.floor((new Date() - new Date(lastActivity)) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity > 7) return true;
    }
  }
  
  // Viewing scheduled for today or tomorrow
  if (deal.nextViewing) {
    const viewingDate = new Date(deal.nextViewing);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (viewingDate <= tomorrow) return true;
  }
  
  // High competition needs attention
  if (deal.competition.otherOffers > 0 && deal.stage === 'evaluating') return true;
  
  return false;
};

// Create new deal
export const createNewDeal = (opportunity, property, agent = null) => {
  const now = new Date();
  
  return {
    ...BuyerDealSchema,
    id: `deal_${Date.now()}`,
    opportunityId: opportunity.id,
    clientId: opportunity.clientId,
    propertyId: property.id || '',
    
    property: {
      address: property.address || '',
      type: property.type || '',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.area || 0,
      photos: property.photos || [],
      listingUrl: property.listingUrl || '',
      reference: property.reference || ''
    },
    
    pricing: {
      ...BuyerDealSchema.pricing,
      askingPrice: property.price || 0,
      maxBudget: opportunity.qualification?.budget?.maxPrice || 0
    },
    
    propertyAgent: agent ? {
      agentId: agent.id,
      agentType: agent.type,
      name: agent.name,
      agency: agent.agency,
      phone: agent.contactInfo?.phonePrimary || '',
      email: agent.contactInfo?.email || '',
      whatsapp: agent.contactInfo?.whatsapp || ''
    } : BuyerDealSchema.propertyAgent,
    
    timeline: {
      ...BuyerDealSchema.timeline,
      firstContactDate: now
    },
    
    createdAt: now,
    updatedAt: now,
    consultantId: opportunity.consultantId || ''
  };
};

// Validate deal data
export const validateDeal = (deal) => {
  const errors = [];
  
  if (!deal.opportunityId) errors.push('Oportunidade é obrigatória');
  if (!deal.clientId) errors.push('Cliente é obrigatório');
  
  if (deal.stage === 'offer_submitted' && !deal.pricing.currentOffer) {
    errors.push('Valor da proposta é obrigatório');
  }
  
  if (deal.status === DEAL_STATUS.LOST.value && !deal.lostDetails.reason) {
    errors.push('Motivo da perda é obrigatório');
  }
  
  return errors;
};