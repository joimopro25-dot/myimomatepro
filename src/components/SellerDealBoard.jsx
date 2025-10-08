import React, { useState } from 'react';
import { 
  Home, Euro, Calendar, Eye, FileText, ChevronDown, ChevronUp, MapPin,
  CheckCircle, Clock, AlertCircle, TrendingUp, ChevronRight 
} from 'lucide-react';
import SellerDealDetailModal from './SellerDealDetailModal';
import { createTransactionData } from '../models/transactionModel';

// Updated Pipeline stages to match transaction flow
const SELLER_PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: '#94a3b8' },
  { value: 'em_avaliacao', label: 'Em Avaliação', color: '#60a5fa' },
  { value: 'em_preparacao', label: 'Em Preparação', color: '#a78bfa' },
  { value: 'ativo', label: 'Ativo', color: '#34d399' },
  { value: 'visitas_agendadas', label: 'Visitas Agendadas', color: '#fbbf24' },
  { value: 'proposta_recebida', label: 'Proposta Recebida', color: '#fb923c' },
  { value: 'em_negociacao', label: 'Em Negociação', color: '#f472b6' },
  { value: 'proposta_aceite', label: 'Proposta Aceite', color: '#22c55e' },
  
  // NEW TRANSACTION STAGES
  { value: 'cpcv_preparation', label: 'CPCV em Preparação', color: '#10b981' },
  { value: 'cpcv_signed', label: 'CPCV Assinado', color: '#059669' },
  { value: 'escritura_scheduled', label: 'Escritura Agendada', color: '#06b6d4' },
  { value: 'completed', label: 'Concluído', color: '#065f46' }
];

// Mock data for demo - Updated with transaction data
const MOCK_OPPORTUNITIES = [
  {
    id: 'opp_1',
    propertyId: 'PROP_m123n3_abc123',
    property: {
      address: 'Rua Poça do Pisco, 265, 1350-252 Lisboa',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      typology: 'T2'
    },
    pricing: {
      askingPrice: 180000,
      minimumPrice: 170000,
      pricePerM2: 2769
    },
    stage: 'lead',
    seller: {
      name: 'João Silva',
      phone: '912345678',
      email: 'joao.silva@email.com'
    },
    sellerScore: 7,
    sellerQualification: 'medium',
    stats: {
      viewingsScheduled: 0,
      offersReceived: 0,
      daysOnMarket: 5
    },
    offers: [],
    acceptedOffer: null,
    transaction: null
  },
  {
    id: 'opp_2',
    propertyId: 'PROP_m123n4_xyz789',
    property: {
      address: 'Av. da Liberdade, 123, 1250-096 Lisboa',
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 95,
      typology: 'T3'
    },
    pricing: {
      askingPrice: 350000,
      minimumPrice: 330000,
      pricePerM2: 3684
    },
    stage: 'em_avaliacao',
    seller: {
      name: 'Maria Santos',
      phone: '913456789',
      email: 'maria.santos@email.com'
    },
    sellerScore: 9,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 0,
      offersReceived: 0,
      daysOnMarket: 12
    },
    offers: [],
    acceptedOffer: null,
    transaction: null
  },
  {
    id: 'opp_3',
    propertyId: 'PROP_m123n5_def456',
    property: {
      address: 'Rua do Ouro, 45, 1100-060 Lisboa',
      type: 'commercial',
      bedrooms: 0,
      bathrooms: 1,
      area: 120,
      typology: 'Loja'
    },
    pricing: {
      askingPrice: 280000,
      minimumPrice: 260000,
      pricePerM2: 2333
    },
    stage: 'ativo',
    seller: {
      name: 'Pedro Costa',
      phone: '914567890',
      email: 'pedro.costa@email.com'
    },
    sellerScore: 6,
    sellerQualification: 'medium',
    stats: {
      viewingsScheduled: 3,
      offersReceived: 0,
      daysOnMarket: 18
    },
    offers: [],
    acceptedOffer: null,
    transaction: null
  },
  // Example with accepted offer in CPCV preparation
  {
    id: 'opp_7',
    propertyId: 'PROP_m123n9_pqr678',
    property: {
      address: 'Rua Augusta, 89, 1100-053 Lisboa',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      area: 72,
      typology: 'T2'
    },
    pricing: {
      askingPrice: 195000,
      minimumPrice: 185000,
      pricePerM2: 2708
    },
    stage: 'cpcv_preparation',
    seller: {
      name: 'Ana Ferreira',
      phone: '915678901',
      email: 'ana.ferreira@email.com'
    },
    sellerScore: 8,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 6,
      offersReceived: 2,
      daysOnMarket: 28
    },
    offers: [
      {
        id: 'offer_1',
        buyer: { name: 'Carlos Mendes', agent: 'ReMax' },
        amount: 190000,
        status: 'accepted',
        terms: { financingStatus: 'pre_approved' }
      }
    ],
    acceptedOffer: {
      id: 'offer_1',
      buyer: { name: 'Carlos Mendes', agent: 'ReMax' },
      amount: 190000,
      status: 'accepted',
      terms: { financingStatus: 'pre_approved' }
    },
    transaction: {
      stage: 'offer_accepted',
      acceptedOffer: { amount: 190000 },
      cpcv: {
        status: 'pending',
        scheduledDate: '2024-12-20',
        signalAmount: 19000,
        location: 'Lisboa'
      },
      escritura: { status: 'pending' }
    }
  },
  // Example with CPCV signed
  {
    id: 'opp_8',
    propertyId: 'PROP_m123n10_stu901',
    property: {
      address: 'Praça Marquês de Pombal, 12, 1250-162 Lisboa',
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      typology: 'T3'
    },
    pricing: {
      askingPrice: 420000,
      minimumPrice: 400000,
      pricePerM2: 3818
    },
    stage: 'cpcv_signed',
    seller: {
      name: 'Rui Oliveira',
      phone: '916789012',
      email: 'rui.oliveira@email.com'
    },
    sellerScore: 10,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 10,
      offersReceived: 4,
      daysOnMarket: 35
    },
    offers: [],
    acceptedOffer: {
      id: 'offer_2',
      buyer: { name: 'Sofia Rodrigues', agent: 'ERA' },
      amount: 410000,
      status: 'accepted',
      terms: { financingStatus: 'cash' }
    },
    transaction: {
      stage: 'cpcv_signed',
      acceptedOffer: { amount: 410000 },
      cpcv: {
        status: 'signed',
        signedDate: '2024-12-15',
        signalAmount: 41000,
        location: 'Lisboa'
      },
      escritura: {
        status: 'pending',
        scheduledDate: '2025-01-15'
      }
    }
  }
];

// Property Card Component - Updated with transaction indicators
function PropertyCard({ opportunity, onClick, isDragging }) {
  const getQualificationColor = (qual) => {
    const colors = {
      high: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[qual] || colors.low;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getPropertyTypeLabel = (type) => {
    const types = {
      apartment: 'Apartamento',
      house: 'Moradia',
      commercial: 'Comercial',
      land: 'Terreno'
    };
    return types[type] || type;
  };

  // Check if in transaction phase
  const isInTransaction = ['cpcv_preparation', 'cpcv_signed', 'escritura_scheduled'].includes(opportunity.stage);
  const hasAcceptedOffer = opportunity.acceptedOffer !== null;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border-2 p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group ${
        isDragging ? 'opacity-50' : ''
      } ${isInTransaction ? 'border-purple-300' : 'border-slate-200'}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('opportunity', JSON.stringify(opportunity));
      }}
    >
      {/* Property Image Placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center relative">
        <Home className="text-slate-400" size={48} />
        {isInTransaction && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Em Transação
          </div>
        )}
      </div>

      {/* Address */}
      <div className="mb-2">
        <div className="flex items-start gap-1 mb-1">
          <MapPin className="text-slate-400 mt-0.5 flex-shrink-0" size={14} />
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight">
            {opportunity.property.address}
          </h3>
        </div>
      </div>

      {/* Property Details */}
      <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
        <span className="font-medium">{getPropertyTypeLabel(opportunity.property.type)}</span>
        {opportunity.property.bedrooms > 0 && (
          <>
            <span>•</span>
            <span>T{opportunity.property.bedrooms}</span>
          </>
        )}
        <span>•</span>
        <span>{opportunity.property.area}m²</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 mb-3">
        <Euro className="text-green-600" size={16} />
        <span className="text-lg font-bold text-slate-800">
          {formatPrice(opportunity.pricing.askingPrice)}
        </span>
        {hasAcceptedOffer && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-auto">
            Aceite: {formatPrice(opportunity.acceptedOffer.amount)}
          </span>
        )}
      </div>

      {/* Transaction Status - NEW */}
      {isInTransaction && opportunity.transaction && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">
              {opportunity.stage === 'cpcv_preparation' && 'CPCV em Preparação'}
              {opportunity.stage === 'cpcv_signed' && 'CPCV Assinado'}
              {opportunity.stage === 'escritura_scheduled' && 'Escritura Agendada'}
            </span>
          </div>
          {opportunity.transaction.cpcv?.scheduledDate && (
            <p className="text-xs text-purple-600 mt-1">
              Data: {new Date(opportunity.transaction.cpcv.scheduledDate).toLocaleDateString('pt-PT')}
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-600 mb-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <Eye size={14} />
          <span>{opportunity.stats.viewingsScheduled} visitas</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={14} />
          <span>{opportunity.stats.offersReceived} propostas</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={`px-2 py-1 rounded-full border text-xs font-semibold ${getQualificationColor(opportunity.sellerQualification)}`}>
          Score: {opportunity.sellerScore}/10
        </div>
        <div className="text-xs text-slate-500">
          {opportunity.stats.daysOnMarket}d no mercado
        </div>
      </div>

      {/* Seller Name - NEW */}
      {opportunity.seller?.name && (
        <div className="mt-2 pt-2 border-t text-xs text-slate-600">
          <span className="font-medium">{opportunity.seller.name}</span>
        </div>
      )}
    </div>
  );
}

// Stage Column Component - Updated with drag and drop
function StageColumn({ stage, opportunities, onCardClick, isCollapsed, onToggleCollapse, onDrop, onUpdateDeal }) {
  const opportunityCount = opportunities.length;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('opportunity');
    if (data) {
      const opportunity = JSON.parse(data);
      onDrop(opportunity, stage.value);
    }
  };

  return (
    <div 
      className="flex-shrink-0 w-80"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div 
        className="sticky top-0 z-10 mb-4 pb-3 border-b-2 cursor-pointer"
        style={{ borderColor: stage.color }}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <h2 className="text-sm font-bold text-slate-800">
              {stage.label}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {opportunityCount}
            </span>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Cards */}
      {!isCollapsed && (
        <div className={`space-y-3 min-h-[200px] ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-2' : ''}`}>
          {opportunityCount === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              Sem oportunidades
            </div>
          ) : (
            opportunities.map((opportunity) => (
              <PropertyCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={() => onCardClick(opportunity)}
              />
            ))
          )}
        </div>
      )}

      {isCollapsed && opportunityCount > 0 && (
        <div className="text-center py-4 text-xs text-slate-400">
          {opportunityCount} {opportunityCount === 1 ? 'oportunidade' : 'oportunidades'}
        </div>
      )}
    </div>
  );
}

// Main Board Component - Updated with transaction management
export default function SellerDealBoard({ onUpdateDeal, onDeleteDeal, onAddDeal }) {
  const [opportunities, setOpportunities] = useState(MOCK_OPPORTUNITIES);
  const [collapsedStages, setCollapsedStages] = useState({});
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleCardClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetailModal(true);
  };

  const toggleStageCollapse = (stageValue) => {
    setCollapsedStages(prev => ({
      ...prev,
      [stageValue]: !prev[stageValue]
    }));
  };

  const getOpportunitiesByStage = (stageValue) => {
    return opportunities.filter(opp => opp.stage === stageValue);
  };

  // Handle drag and drop with validation
  const handleDrop = async (opportunity, newStage) => {
    if (opportunity.stage === newStage) return;

    // Validation for transaction stages
    const transactionStages = ['cpcv_preparation', 'cpcv_signed', 'escritura_scheduled', 'completed'];
    
    if (transactionStages.includes(newStage) && !opportunity.acceptedOffer) {
      alert('É necessário ter uma proposta aceite para avançar para a fase de transação');
      return;
    }

    // Auto-create transaction when moving to proposta_aceite with an accepted offer
    let updatedOpportunity = { ...opportunity, stage: newStage };
    
    if (newStage === 'proposta_aceite' && opportunity.acceptedOffer && !opportunity.transaction) {
      updatedOpportunity.transaction = createTransactionData(opportunity.acceptedOffer);
    }

    // Update the opportunity
    setOpportunities(prev => 
      prev.map(opp => opp.id === opportunity.id ? updatedOpportunity : opp)
    );

    // Call the parent update function if provided
    if (onUpdateDeal) {
      onUpdateDeal(updatedOpportunity);
    }
  };

  // Handle opportunity update from detail modal
  const handleUpdateOpportunity = async (updatedOpp) => {
    setOpportunities(prev => 
      prev.map(opp => opp.id === updatedOpp.id ? updatedOpp : opp)
    );
    setSelectedOpportunity(updatedOpp);
    
    if (onUpdateDeal) {
      onUpdateDeal(updatedOpp);
    }
  };

  // Handle opportunity deletion
  const handleDeleteOpportunity = async (oppId) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== oppId));
    setShowDetailModal(false);
    setSelectedOpportunity(null);
    
    if (onDeleteDeal) {
      onDeleteDeal(oppId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Oportunidades de Venda
              </h1>
              <p className="text-slate-600 mt-1">
                Pipeline de Vendedores com Gestão de Transações
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total de Oportunidades</div>
                <div className="text-2xl font-bold text-slate-800">
                  {opportunities.length}
                </div>
              </div>
              <button 
                onClick={onAddDeal}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                + Nova Oportunidade
              </button>
            </div>
          </div>
          
          {/* Transaction Summary Bar - NEW */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-slate-600">Em CPCV: </span>
              <span className="font-bold text-purple-600">
                {opportunities.filter(o => o.stage === 'cpcv_preparation' || o.stage === 'cpcv_signed').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-600 rounded-full"></div>
              <span className="text-slate-600">Escritura Agendada: </span>
              <span className="font-bold text-cyan-600">
                {opportunities.filter(o => o.stage === 'escritura_scheduled').length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-slate-600">Concluídos: </span>
              <span className="font-bold text-green-600">
                {opportunities.filter(o => o.stage === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-8">
        <div className="flex gap-6 overflow-x-auto pb-8">
          {SELLER_PIPELINE_STAGES.map((stage) => (
            <StageColumn
              key={stage.value}
              stage={stage}
              opportunities={getOpportunitiesByStage(stage.value)}
              onCardClick={handleCardClick}
              isCollapsed={collapsedStages[stage.value]}
              onToggleCollapse={() => toggleStageCollapse(stage.value)}
              onDrop={handleDrop}
              onUpdateDeal={handleUpdateOpportunity}
            />
          ))}
        </div>
      </div>

      {/* Seller Deal Detail Modal */}
      {showDetailModal && selectedOpportunity && (
        <SellerDealDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOpportunity(null);
          }}
          deal={selectedOpportunity}
          onUpdateDeal={handleUpdateOpportunity}
          onDeleteDeal={handleDeleteOpportunity}
        />
      )}
    </div>
  );
}