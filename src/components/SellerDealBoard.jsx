import React, { useState } from 'react';
import { Home, Euro, Calendar, Eye, FileText, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

// Pipeline stages
const SELLER_PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: '#94a3b8' },
  { value: 'em_avaliacao', label: 'Em Avaliação', color: '#60a5fa' },
  { value: 'em_preparacao', label: 'Em Preparação', color: '#a78bfa' },
  { value: 'ativo', label: 'Ativo', color: '#34d399' },
  { value: 'visitas_agendadas', label: 'Visitas Agendadas', color: '#fbbf24' },
  { value: 'proposta_recebida', label: 'Proposta Recebida', color: '#fb923c' },
  { value: 'em_negociacao', label: 'Em Negociação', color: '#f472b6' },
  { value: 'proposta_aceite', label: 'Proposta Aceite', color: '#22c55e' },
  { value: 'cpcv_assinado', label: 'CPCV Assinado', color: '#10b981' },
  { value: 'escritura_agendada', label: 'Escritura Agendada', color: '#06b6d4' },
  { value: 'concluido', label: 'Concluído', color: '#059669' }
];

// Mock data for demo
const MOCK_OPPORTUNITIES = [
  {
    id: 'opp_1',
    propertyId: 'PROP_m123n3_abc123',
    property: {
      address: 'Rua Poça do Pisco, 265, 1350-252 Lisboa',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      area: 65
    },
    pricing: {
      askingPrice: 180000
    },
    stage: 'lead',
    sellerScore: 7,
    sellerQualification: 'medium',
    stats: {
      viewingsScheduled: 0,
      offersReceived: 0,
      daysOnMarket: 5
    }
  },
  {
    id: 'opp_2',
    propertyId: 'PROP_m123n4_xyz789',
    property: {
      address: 'Av. da Liberdade, 123, 1250-096 Lisboa',
      type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 95
    },
    pricing: {
      askingPrice: 350000
    },
    stage: 'em_avaliacao',
    sellerScore: 9,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 0,
      offersReceived: 0,
      daysOnMarket: 12
    }
  },
  {
    id: 'opp_3',
    propertyId: 'PROP_m123n5_def456',
    property: {
      address: 'Rua do Ouro, 45, 1100-060 Lisboa',
      type: 'commercial',
      bedrooms: 0,
      bathrooms: 1,
      area: 120
    },
    pricing: {
      askingPrice: 280000
    },
    stage: 'ativo',
    sellerScore: 6,
    sellerQualification: 'medium',
    stats: {
      viewingsScheduled: 3,
      offersReceived: 0,
      daysOnMarket: 18
    }
  },
  {
    id: 'opp_4',
    propertyId: 'PROP_m123n6_ghi789',
    property: {
      address: 'Praça do Comércio, 78, 1100-148 Lisboa',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      area: 48
    },
    pricing: {
      askingPrice: 145000
    },
    stage: 'visitas_agendadas',
    sellerScore: 8,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 5,
      offersReceived: 0,
      daysOnMarket: 25
    }
  },
  {
    id: 'opp_5',
    propertyId: 'PROP_m123n7_jkl012',
    property: {
      address: 'Rua Garrett, 15, 1200-203 Lisboa',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 78
    },
    pricing: {
      askingPrice: 220000
    },
    stage: 'proposta_recebida',
    sellerScore: 9,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 8,
      offersReceived: 2,
      daysOnMarket: 32
    }
  },
  {
    id: 'opp_6',
    propertyId: 'PROP_m123n8_mno345',
    property: {
      address: 'Av. Almirante Reis, 234, 1000-055 Lisboa',
      type: 'house',
      bedrooms: 4,
      bathrooms: 3,
      area: 150
    },
    pricing: {
      askingPrice: 480000
    },
    stage: 'em_negociacao',
    sellerScore: 10,
    sellerQualification: 'high',
    stats: {
      viewingsScheduled: 12,
      offersReceived: 3,
      daysOnMarket: 40
    }
  }
];

// Property Card Component
function PropertyCard({ opportunity, onClick }) {
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 border-slate-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Property Image Placeholder */}
      <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
        <Home className="text-slate-400" size={48} />
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
      </div>

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
    </div>
  );
}

// Stage Column Component
function StageColumn({ stage, opportunities, onCardClick, isCollapsed, onToggleCollapse }) {
  const opportunityCount = opportunities.length;

  return (
    <div className="flex-shrink-0 w-80">
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
        <div className="space-y-3">
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

// Main Board Component
export default function SellerDealBoard() {
  const [opportunities] = useState(MOCK_OPPORTUNITIES);
  const [collapsedStages, setCollapsedStages] = useState({});
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const handleCardClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    console.log('Selected opportunity:', opportunity);
    // In real app, would open modal or navigate to detail view
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
                Pipeline de Vendedores
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-600">Total de Oportunidades</div>
                <div className="text-2xl font-bold text-slate-800">
                  {opportunities.length}
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl">
                + Nova Oportunidade
              </button>
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
            />
          ))}
        </div>
      </div>

      {/* Selected Opportunity Info (Simple Demo) */}
      {selectedOpportunity && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-6 max-w-md">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              Oportunidade Selecionada
            </h3>
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-600">ID: </span>
              <span className="font-mono text-xs">{selectedOpportunity.propertyId}</span>
            </div>
            <div>
              <span className="text-slate-600">Morada: </span>
              <span className="font-semibold">{selectedOpportunity.property.address}</span>
            </div>
            <div>
              <span className="text-slate-600">Score: </span>
              <span className="font-bold">{selectedOpportunity.sellerScore}/10</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedOpportunity(null)}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ver Detalhes Completos
          </button>
        </div>
      )}
    </div>
  );
}