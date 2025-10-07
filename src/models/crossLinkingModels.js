/**
 * ENHANCED OPPORTUNITY MODELS - MyImoMatePro
 * With cross-linking and commission tracking
 */

// ============================================================================
// SELLER OPPORTUNITY ENHANCED
// ============================================================================
export const createSellerOpportunityData = (data) => ({
  // ... existing fields ...
  type: 'seller',
  
  // Enhanced Offers with buyer linking
  offers: [], // Each offer can now have: { buyerDealId, buyerClientId, buyerName }
  
  // Commission tracking
  commission: {
    percentage: data.commissionPercentage || 5, // Default 5%
    estimatedAmount: 0,
    finalAmount: 0,
    notes: ''
  },
  
  // Active matches (suggested buyers)
  propertyMatches: [], // Array of { buyerClientId, buyerName, matchScore, requirements }
});

// ============================================================================
// BUYER DEAL ENHANCED
// ============================================================================
export const createBuyerDealData = (data) => ({
  // ... existing fields ...
  
  // Link to seller opportunity if this deal is for a listed property
  linkedProperty: {
    sellerOpportunityId: null,
    sellerClientId: null,
    sellerName: '',
    propertyAddress: ''
  },
  
  // Offer tracking
  offersMade: [], // { offerId, amount, status, date }
  
  // Commission tracking
  commission: {
    buyerSide: {
      percentage: data.buyerCommission || 2.5,
      amount: 0
    },
    sellerSide: {
      percentage: data.sellerCommission || 2.5, 
      amount: 0
    },
    totalCommission: 0
  }
});

// ============================================================================
// COMMISSION CALCULATION HELPERS
// ============================================================================
export const calculateCommission = (salePrice, percentage) => {
  return (salePrice * percentage) / 100;
};

export const calculateTotalDealCommission = (deal) => {
  if (!deal.finalPrice) return 0;
  
  const buyerCommission = calculateCommission(
    deal.finalPrice, 
    deal.commission.buyerSide.percentage
  );
  
  const sellerCommission = calculateCommission(
    deal.finalPrice,
    deal.commission.sellerSide.percentage
  );
  
  return {
    buyerSide: buyerCommission,
    sellerSide: sellerCommission,
    total: buyerCommission + sellerCommission
  };
};

// ============================================================================
// PROPERTY MATCHING ALGORITHM
// ============================================================================
export const calculateMatchScore = (buyerRequirements, sellerProperty) => {
  let score = 0;
  let maxScore = 0;
  
  // Price match (40 points)
  maxScore += 40;
  if (sellerProperty.pricing.askingPrice <= buyerRequirements.maxBudget) {
    if (sellerProperty.pricing.askingPrice >= buyerRequirements.minBudget) {
      score += 40; // Perfect price match
    } else {
      // Under budget - still good but less ideal
      score += 30;
    }
  }
  
  // Location match (30 points)
  maxScore += 30;
  if (buyerRequirements.desiredLocations?.includes(sellerProperty.property.location)) {
    score += 30;
  } else if (buyerRequirements.desiredZones?.includes(sellerProperty.property.zone)) {
    score += 20;
  }
  
  // Property type match (10 points)
  maxScore += 10;
  if (buyerRequirements.propertyTypes?.includes(sellerProperty.property.type)) {
    score += 10;
  }
  
  // Bedrooms match (10 points)
  maxScore += 10;
  if (sellerProperty.property.bedrooms >= buyerRequirements.minBedrooms) {
    score += 10;
  }
  
  // Area match (10 points)
  maxScore += 10;
  if (sellerProperty.property.area >= buyerRequirements.minArea) {
    score += 10;
  }
  
  // Features match (bonus points)
  const requiredFeatures = buyerRequirements.requiredFeatures || [];
  const propertyFeatures = sellerProperty.property.features || [];
  const matchedFeatures = requiredFeatures.filter(f => 
    propertyFeatures.includes(f)
  ).length;
  
  if (requiredFeatures.length > 0) {
    maxScore += 20;
    score += (matchedFeatures / requiredFeatures.length) * 20;
  }
  
  // Return percentage match
  return Math.round((score / maxScore) * 100);
};

// ============================================================================
// TRANSACTION STATUS TRACKING
// ============================================================================
export const TRANSACTION_STATUS = {
  INITIAL_CONTACT: 'initial_contact',
  VIEWING_SCHEDULED: 'viewing_scheduled',
  VIEWING_COMPLETED: 'viewing_completed',
  OFFER_MADE: 'offer_made',
  NEGOTIATING: 'negotiating',
  OFFER_ACCEPTED: 'offer_accepted',
  DUE_DILIGENCE: 'due_diligence',
  CLOSING: 'closing',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

export const TRANSACTION_MILESTONES = [
  { status: TRANSACTION_STATUS.INITIAL_CONTACT, label: 'Contacto Inicial', icon: '📞' },
  { status: TRANSACTION_STATUS.VIEWING_SCHEDULED, label: 'Visita Agendada', icon: '📅' },
  { status: TRANSACTION_STATUS.VIEWING_COMPLETED, label: 'Visita Realizada', icon: '✅' },
  { status: TRANSACTION_STATUS.OFFER_MADE, label: 'Proposta Enviada', icon: '📝' },
  { status: TRANSACTION_STATUS.NEGOTIATING, label: 'Em Negociação', icon: '💬' },
  { status: TRANSACTION_STATUS.OFFER_ACCEPTED, label: 'Proposta Aceite', icon: '🤝' },
  { status: TRANSACTION_STATUS.DUE_DILIGENCE, label: 'Due Diligence', icon: '🔍' },
  { status: TRANSACTION_STATUS.CLOSING, label: 'Escritura', icon: '📄' },
  { status: TRANSACTION_STATUS.CLOSED, label: 'Fechado', icon: '🎉' }
];