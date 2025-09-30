/**
 * DEAL BOARD - MyImoMatePro
 * Kanban board for managing property deals through stages
 * Drag & drop interface for buyer opportunity deals
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../contexts/DealContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import {
  HomeModernIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PhoneIcon,
  UserIcon,
  PlusIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BUYER_DEAL_STAGES, INTEREST_LEVELS, formatDealSummary } from '../models/buyerDealModel';

const DealBoard = () => {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const { getClient } = useClients();
  const { getOpportunity } = useOpportunities();
  const { 
    loadDeals, 
    deals, 
    moveDealStage, 
    loading, 
    error,
    createPropertyDeal 
  } = useDeal();

  const [client, setClient] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [dealsByStage, setDealsByStage] = useState({});
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Load data
  useEffect(() => {
    if (clientId && opportunityId) {
      loadData();
    }
  }, [clientId, opportunityId]);

  const loadData = async () => {
    try {
      // Load client
      const clientData = await getClient(clientId);
      setClient(clientData);

      // Load opportunity
      const oppData = await getOpportunity(clientId, opportunityId);
      setOpportunity(oppData);

      // Load deals
      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Organize deals by stage
  useEffect(() => {
    const organized = {};
    BUYER_DEAL_STAGES.forEach(stage => {
      organized[stage.value] = [];
    });

    deals.forEach(deal => {
      if (organized[deal.stage]) {
        organized[deal.stage].push(deal);
      }
    });

    setDealsByStage(organized);
  }, [deals]);

  // Drag and drop handlers
  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
  };

  const handleDrop = async (e, newStage) => {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (draggedDeal && draggedDeal.stage !== newStage) {
      try {
        await moveDealStage(clientId, opportunityId, draggedDeal.id, newStage);
        await loadDeals(clientId, opportunityId); // Reload deals
      } catch (err) {
        console.error('Error moving deal:', err);
      }
    }

    setDraggedDeal(null);
    return false;
  };

  // Create new deal
  const handleCreateDeal = async (propertyData) => {
    try {
      const newDeal = await createPropertyDeal(opportunity, propertyData);
      setShowNewDealModal(false);
      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error creating deal:', err);
    }
  };

  // Get stage statistics
  const getStageStats = (stage) => {
    const stageDeals = dealsByStage[stage] || [];
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.pricing?.askingPrice || 0), 0);
    return {
      count: stageDeals.length,
      value: totalValue
    };
  };

  // Get deal urgency color
  const getUrgencyColor = (deal) => {
    if (deal.competition?.otherOffers > 0) return 'red';
    if (deal.scoring?.urgencyLevel === 'urgent') return 'orange';
    if (deal.scoring?.urgencyLevel === 'high') return 'yellow';
    return 'gray';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pipeline de Negócios
              </h1>
              <p className="text-gray-600 mt-1">
                {client?.name} - {opportunity?.type === 'buyer' ? 'Comprador' : 'Vendedor'}
              </p>
            </div>
            <button
              onClick={() => setShowNewDealModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Novo Negócio</span>
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="flex overflow-x-auto gap-4 pb-4">
          {BUYER_DEAL_STAGES.map(stage => {
            const stats = getStageStats(stage.value);
            return (
              <div
                key={stage.value}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.value)}
              >
                {/* Stage Header */}
                <div className={`bg-${stage.color}-100 border-t-4 border-${stage.color}-500 rounded-t-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {stage.label}
                    </h3>
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                      {stats.count}
                    </span>
                  </div>
                  {stats.value > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Total: €{stats.value.toLocaleString('pt-PT')}
                    </p>
                  )}
                </div>

                {/* Stage Cards */}
                <div className="bg-gray-50 min-h-[400px] p-2 rounded-b-lg">
                  {(dealsByStage[stage.value] || []).map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onDragStart={handleDragStart}
                      onClick={() => setSelectedDeal(deal)}
                      urgencyColor={getUrgencyColor(deal)}
                    />
                  ))}
                  
                  {/* Empty state */}
                  {(!dealsByStage[stage.value] || dealsByStage[stage.value].length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <HomeModernIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Sem negócios</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* New Deal Modal */}
        {showNewDealModal && (
          <NewDealModal
            onClose={() => setShowNewDealModal(false)}
            onCreate={handleCreateDeal}
            opportunity={opportunity}
          />
        )}

        {/* Deal Details Modal */}
        {selectedDeal && (
          <DealDetailsModal
            deal={selectedDeal}
            onClose={() => setSelectedDeal(null)}
            onUpdate={loadData}
          />
        )}
      </div>
    </Layout>
  );
};

// Deal Card Component
const DealCard = ({ deal, onDragStart, onClick, urgencyColor }) => {
  const interestLevel = INTEREST_LEVELS.find(l => l.value === deal.scoring?.buyerInterestLevel);
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Property Address */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
          {deal.property?.address || 'Imóvel sem endereço'}
        </h4>
        <div className={`w-2 h-2 rounded-full bg-${urgencyColor}-500`} />
      </div>

      {/* Property Details */}
      <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
        <span>{deal.property?.type || 'N/A'}</span>
        <span>{deal.property?.bedrooms || 0}Q</span>
        <span>{deal.property?.area || 0}m²</span>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-sm">
          <CurrencyEuroIcon className="w-4 h-4 mr-1 text-gray-400" />
          <span className="font-semibold">
            €{(deal.pricing?.askingPrice || 0).toLocaleString('pt-PT')}
          </span>
        </div>
        {deal.pricing?.currentOffer && (
          <span className="text-xs text-green-600">
            Oferta: €{deal.pricing.currentOffer.toLocaleString('pt-PT')}
          </span>
        )}
      </div>

      {/* Match Score & Interest */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <ChartBarIcon className="w-3 h-3 mr-1 text-gray-400" />
            <span className="text-xs text-gray-600">
              {deal.scoring?.propertyMatchScore || 0}%
            </span>
          </div>
          {interestLevel && (
            <span className="text-lg" title={interestLevel.label}>
              {interestLevel.emoji}
            </span>
          )}
        </div>
        
        {/* Competition indicator */}
        {deal.competition?.otherOffers > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
            {deal.competition.otherOffers} ofertas
          </span>
        )}
      </div>

      {/* Agent */}
      {deal.propertyAgent?.name && (
        <div className="mt-2 pt-2 border-t flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <UserIcon className="w-3 h-3 mr-1" />
            <span className="line-clamp-1">{deal.propertyAgent.name}</span>
          </div>
          {deal.nextViewing && (
            <div className="flex items-center text-xs text-blue-600">
              <CalendarIcon className="w-3 h-3 mr-1" />
              Visita
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// New Deal Modal
const NewDealModal = ({ onClose, onCreate, opportunity }) => {
  const [formData, setFormData] = useState({
    address: '',
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    askingPrice: 0,
    listingUrl: '',
    agentName: '',
    agentPhone: '',
    agentEmail: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const propertyData = {
      property: {
        address: formData.address,
        type: formData.type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        area: formData.area,
        listingUrl: formData.listingUrl
      },
      pricing: {
        askingPrice: formData.askingPrice
      },
      propertyAgent: formData.agentName ? {
        name: formData.agentName,
        phone: formData.agentPhone,
        email: formData.agentEmail
      } : null
    };
    
    onCreate(propertyData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Adicionar Novo Imóvel ao Pipeline</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Property Info */}
          <div>
            <h3 className="font-medium mb-3">Informações do Imóvel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Moradia</option>
                  <option value="villa">Villa</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Preço Pedido €</label>
                <input
                  type="number"
                  value={formData.askingPrice}
                  onChange={(e) => setFormData({...formData, askingPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Quartos</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Área (m²)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div>
            <h3 className="font-medium mb-3">Agente do Imóvel</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Agente</label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => setFormData({...formData, agentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="tel"
                  value={formData.agentPhone}
                  onChange={(e) => setFormData({...formData, agentPhone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Adicionar ao Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Deal Details Modal (simplified)
const DealDetailsModal = ({ deal, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{deal.property?.address}</h2>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Detalhes do Imóvel</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Tipo</dt>
                  <dd className="font-medium">{deal.property?.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Quartos</dt>
                  <dd className="font-medium">{deal.property?.bedrooms}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Área</dt>
                  <dd className="font-medium">{deal.property?.area}m²</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Valores</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Preço Pedido</dt>
                  <dd className="font-medium">€{deal.pricing?.askingPrice?.toLocaleString('pt-PT')}</dd>
                </div>
                {deal.pricing?.currentOffer && (
                  <div>
                    <dt className="text-sm text-gray-600">Oferta Atual</dt>
                    <dd className="font-medium text-green-600">
                      €{deal.pricing.currentOffer.toLocaleString('pt-PT')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          {deal.propertyAgent && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Agente Responsável</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{deal.propertyAgent.name}</p>
                  <p className="text-sm text-gray-600">{deal.propertyAgent.agency}</p>
                </div>
                <div className="flex space-x-2">
                  {deal.propertyAgent.phone && (
                    <a
                      href={`tel:${deal.propertyAgent.phone}`}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                      <PhoneIcon className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealBoard;