/**
 * SELLER DEAL MODEL - MyImoMatePro
 * Complete seller-side deal tracking with transaction stages
 */

// Deal stages for Seller Kanban board - now includes transaction stages
export const SELLER_DEAL_STAGES = [
  // Initial stages
  { value: 'lead', label: 'Lead', color: 'gray', order: 1 },
  { value: 'qualified', label: 'Qualificado', color: 'blue', order: 2 },
  { value: 'evaluation', label: 'Avaliação', color: 'indigo', order: 3 },
  { value: 'listing_prep', label: 'Preparação', color: 'purple', order: 4 },
  { value: 'active', label: 'Ativo', color: 'yellow', order: 5 },
  { value: 'showings', label: 'Visitas', color: 'orange', order: 6 },
  { value: 'offer_received', label: 'Proposta Recebida', color: 'amber', order: 7 },
  { value: 'negotiation', label: 'Negociação', color: 'lime', order: 8 },
  { value: 'accepted', label: 'Aceite', color: 'green', order: 9 },
  
  // NEW TRANSACTION STAGES (matching buyer flow)
  { value: 'cpcv_preparation', label: 'CPCV em Preparação', color: 'emerald', order: 10 },
  { value: 'cpcv_signed', label: 'CPCV Assinado', color: 'teal', order: 11 },
  { value: 'escritura_scheduled', label: 'Escritura Agendada', color: 'cyan', order: 12 },
  { value: 'completed', label: 'Concluído', color: 'green', order: 13 },
  
  // Final states
  { value: 'sold', label: 'Vendido', color: 'green', order: 14 },
  { value: 'lost', label: 'Perdido', color: 'red', order: 15 },
  { value: 'on_hold', label: 'Em Espera', color: 'gray', order: 16 }
];

// Property status
export const PROPERTY_STATUS = {
  PREPARING: 'preparing',
  AVAILABLE: 'available', 
  UNDER_OFFER: 'under_offer',
  RESERVED: 'reserved',
  SOLD: 'sold',
  WITHDRAWN: 'withdrawn'
};

// Listing types
export const LISTING_TYPES = {
  EXCLUSIVE: { value: 'exclusive', label: 'Exclusivo', color: 'green' },
  OPEN: { value: 'open', label: 'Aberto', color: 'blue' },
  POCKET: { value: 'pocket', label: 'Off-Market', color: 'purple' }
};

// Price strategy
export const PRICE_STRATEGY = {
  FIRM: { value: 'firm', label: 'Preço Firme', color: 'red' },
  NEGOTIABLE: { value: 'negotiable', label: 'Negociável', color: 'yellow' },
  BEST_OFFER: { value: 'best_offer', label: 'Melhor Oferta', color: 'green' }
};

// Marketing channels
export const MARKETING_CHANNELS = [
  { value: 'idealista', label: 'Idealista', icon: '🏠' },
  { value: 'imovirtual', label: 'Imovirtual', icon: '🏘️' },
  { value: 'sapo', label: 'SAPO', icon: '🐸' },
  { value: 'olx', label: 'OLX', icon: '📢' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'network', label: 'Rede Contactos', icon: '🤝' }
];

// Document checklist for sellers
export const SELLER_DOCUMENTS = {
  PROPERTY_DEED: { type: 'property_deed', label: 'Escritura', required: true },
  TAX_ID: { type: 'tax_id', label: 'Caderneta Predial', required: true },
  ENERGY_CERT: { type: 'energy_cert', label: 'Certificado Energético', required: true },
  LICENSE: { type: 'license', label: 'Licença de Utilização', required: true },
  IMI_RECEIPT: { type: 'imi_receipt', label: 'Último Recibo IMI', required: false },
  CONDOMINIUM: { type: 'condominium', label: 'Ata Condomínio', required: false },
  FLOOR_PLAN: { type: 'floor_plan', label: 'Planta', required: false }
};

// Offer response options
export const OFFER_RESPONSES = {
  ACCEPT: { value: 'accept', label: 'Aceitar', color: 'green' },
  COUNTER: { value: 'counter', label: 'Contraproposta', color: 'yellow' },
  REJECT: { value: 'reject', label: 'Rejeitar', color: 'red' },
  CONSIDER: { value: 'consider', label: 'Em Consideração', color: 'blue' }
};

// Seller motivations
export const SELLER_MOTIVATIONS = [
  { value: 'upgrade', label: 'Mudança para Maior' },
  { value: 'downsize', label: 'Mudança para Menor' },
  { value: 'relocation', label: 'Mudança de Cidade' },
  { value: 'financial', label: 'Necessidade Financeira' },
  { value: 'investment', label: 'Oportunidade Investimento' },
  { value: 'inheritance', label: 'Herança' },
  { value: 'divorce', label: 'Divórcio' },
  { value: 'other', label: 'Outro' }
];

// ============================================
// SELLER DEAL SCHEMA
// ============================================
export const SellerDealSchema = {
  id: '',
  opportunityId: '',
  clientId: '',
  
  // Property details
  property: {
    id: '',
    address: '',
    type: '', // apartment, house, land, commercial
    typology: '', // T0, T1, T2, etc.
    area: 0, // m²
    year: null,
    floor: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    features: [],
    condition: '', // new, good, needs_renovation
    energyRating: '' // A+, A, B, C, D, E, F, G
  },
  
  // Listing info
  listing: {
    type: 'open', // exclusive, open, pocket
    contractStart: null,
    contractEnd: null,
    exclusive: false,
    commission: 5, // percentage
    marketingChannels: [],
    photos: [],
    virtualTour: '',
    description: ''
  },
  
  // Pricing
  pricing: {
    askingPrice: 0,
    minimumPrice: 0,
    pricePerM2: 0,
    strategy: 'negotiable', // firm, negotiable, best_offer
    priceHistory: [] // Array of {date, price, reason}
  },
  
  // Documents
  documents: {
    checklist: [], // Based on SELLER_DOCUMENTS
    missingDocs: [],
    allDocsReady: false
  },
  
  // Marketing metrics
  marketing: {
    viewCount: 0,
    inquiryCount: 0,
    showingCount: 0,
    offerCount: 0,
    daysOnMarket: 0,
    lastActivity: null
  },
  
  // Offers received
  offers: [], // Array of offer objects
  acceptedOffer: null, // The accepted offer details
  
  // Transaction data (after offer acceptance)
  transaction: null, // Will use the same transaction model as buyers
  
  // Stage & Status
  stage: 'lead',
  status: PROPERTY_STATUS.PREPARING,
  priority: 'normal', // low, normal, high, urgent
  
  // Seller info
  seller: {
    name: '',
    phone: '',
    email: '',
    motivation: '',
    timeline: '',
    flexibility: 'medium' // low, medium, high
  },
  
  // Notes & Activity
  notes: '',
  lastActivity: null,
  nextFollowUp: null,
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  createdBy: '',
  assignedTo: ''
};

// ============================================
// OFFER RECEIVED SCHEMA
// ============================================
export const ReceivedOfferSchema = {
  id: '',
  dealId: '',
  offerNumber: 1, // Auto-increment
  
  // Buyer info
  buyer: {
    name: '',
    phone: '',
    email: '',
    agent: '',
    agency: ''
  },
  
  // Offer details
  amount: 0,
  proposedPrice: 0, // Initial offer
  currentPrice: 0, // After negotiations
  
  // Terms
  terms: {
    downPayment: 0,
    financingStatus: '', // cash, pre_approved, pending
    closingDate: null,
    conditions: [],
    contingencies: []
  },
  
  // Status
  status: 'pending', // pending, accepted, countered, rejected, expired
  response: '', // accept, counter, reject, consider
  responseDate: null,
  counterAmount: 0,
  counterTerms: '',
  
  // Validity
  receivedAt: null,
  expiresAt: null,
  
  // Notes
  buyerNotes: '',
  sellerNotes: '',
  internalNotes: '',
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  respondedBy: ''
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate days on market
export const calculateDaysOnMarket = (listingDate) => {
  if (!listingDate) return 0;
  const now = new Date();
  const listed = new Date(listingDate);
  const diffTime = Math.abs(now - listed);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate price per square meter
export const calculatePricePerM2 = (price, area) => {
  if (!price || !area) return 0;
  return Math.round(price / area);
};

// Get property value indicator
export const getValueIndicator = (pricePerM2, marketAverage) => {
  if (!pricePerM2 || !marketAverage) return 'unknown';
  const ratio = pricePerM2 / marketAverage;
  
  if (ratio < 0.9) return { label: 'Abaixo do Mercado', color: 'green' };
  if (ratio > 1.1) return { label: 'Acima do Mercado', color: 'red' };
  return { label: 'Preço de Mercado', color: 'blue' };
};

// Check if deal needs attention
export const dealNeedsAttention = (deal) => {
  const alerts = [];
  
  // Check for expired offers
  if (deal.offers?.some(o => o.status === 'pending' && new Date(o.expiresAt) < new Date())) {
    alerts.push({ type: 'urgent', message: 'Proposta expirada aguardando resposta' });
  }
  
  // Check for missing documents
  if (deal.documents?.missingDocs?.length > 0) {
    alerts.push({ type: 'warning', message: `${deal.documents.missingDocs.length} documentos em falta` });
  }
  
  // Check for long time on market
  if (deal.marketing?.daysOnMarket > 90) {
    alerts.push({ type: 'info', message: 'Mais de 90 dias no mercado' });
  }
  
  // Check for pending transaction steps
  if (deal.transaction && deal.stage === 'cpcv_preparation') {
    alerts.push({ type: 'action', message: 'CPCV aguarda preparação' });
  }
  
  return {
    hasAlerts: alerts.length > 0,
    alerts,
    priority: alerts.some(a => a.type === 'urgent') ? 'high' : 'normal'
  };
};

// Get stage progress percentage
export const getStageProgress = (stage) => {
  const stageIndex = SELLER_DEAL_STAGES.findIndex(s => s.value === stage);
  const totalStages = SELLER_DEAL_STAGES.filter(s => s.order <= 13).length; // Exclude final states
  return Math.round(((stageIndex + 1) / totalStages) * 100);
};

// Format deal summary
export const formatDealSummary = (deal) => {
  const parts = [];
  
  if (deal.property?.address) {
    parts.push(deal.property.address);
  }
  
  if (deal.property?.typology) {
    parts.push(deal.property.typology);
  }
  
  if (deal.pricing?.askingPrice) {
    parts.push(`€${deal.pricing.askingPrice.toLocaleString('pt-PT')}`);
  }
  
  return parts.join(' • ');
};

// Check if ready for transaction
export const isReadyForTransaction = (deal) => {
  return (
    deal.acceptedOffer !== null &&
    deal.documents?.allDocsReady &&
    deal.stage === 'accepted'
  );
};

// Get next action suggestion
export const getNextAction = (deal) => {
  switch (deal.stage) {
    case 'lead':
      return 'Agendar avaliação do imóvel';
    case 'evaluation':
      return 'Preparar análise de mercado (CMA)';
    case 'listing_prep':
      return 'Reunir documentação e tirar fotos';
    case 'active':
      return 'Promover em canais de marketing';
    case 'offer_received':
      return 'Analisar e responder à proposta';
    case 'accepted':
      return 'Iniciar processo de CPCV';
    case 'cpcv_preparation':
      return 'Preparar e agendar CPCV';
    case 'cpcv_signed':
      return 'Agendar escritura';
    case 'escritura_scheduled':
      return 'Preparar documentos finais';
    default:
      return 'Verificar próximos passos';
  }
};