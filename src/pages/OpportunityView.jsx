/**
 * OPPORTUNITY VIEW - MyImoMatePro
 * Display detailed view of a buyer/seller opportunity
 * Shows qualification, status, and later will show deals
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import { useDeal } from '../contexts/DealContext';
import Layout from '../components/Layout'; // ADD THIS LINE
import DealFormModal from '../components/DealFormModal';
import DealDetailsModal from '../components/DealDetailsModal';
import ViewingFormModal from '../components/ViewingFormModal';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyEuroIcon,
  HomeIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  HomeModernIcon,
  ArrowRightIcon,
  PlusIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  formatPrice,
  formatPriceRange,
  getStatusColor,
  getScoreColor,
  OPPORTUNITY_STATUS,
  BUYER_SCORE_CRITERIA,
  PROPERTY_TYPES,
  PROPERTY_PURPOSE,
  URGENCY_LEVELS,
  CURRENT_SITUATION,
  PROPERTY_FEATURES
} from '../models/opportunityModel';
import {
  formatDealSummary,
  isDealActionNeeded,
  BUYER_DEAL_STAGES
} from '../models/buyerDealModel'; // ADD THIS LINE TOO

const OpportunityView = () => {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const { getOpportunity, updateOpportunityStatus, deleteOpportunity, loading, error } = useOpportunities();
  const { getClient } = useClients();
  const {
    loadDeals,
    createPropertyDeal,
    updatePropertyDeal,
    moveDealStage,
    deals,
    agents,
    loadAgents,
    loadDealViewings // ADD THIS
  } = useDeal();
  
  const [opportunity, setOpportunity] = useState(null);
  const [client, setClient] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [opportunityDeals, setOpportunityDeals] = useState([]);
  const [selectedDealForView, setSelectedDealForView] = useState(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDeal, setViewingDeal] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [clientId, opportunityId]);

  const loadData = async () => {
    try {
      // Load opportunity
      const oppData = await getOpportunity(clientId, opportunityId);
      if (oppData) {
        setOpportunity(oppData);
      }

      // Load client
      const clientData = await getClient(clientId);
      if (clientData) {
        setClient(clientData);
      }

      // Load deals for this opportunity
      if (oppData) {
        const dealsData = await loadDeals(clientId, opportunityId);
        setOpportunityDeals(dealsData || []);
      }

      // Load agents for the deal form
      await loadAgents();
    } catch (err) {
      console.error('Error loading data:', err);
      navigate(`/clients/${clientId}`);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      await updateOpportunityStatus(clientId, opportunityId, newStatus);
      setOpportunity(prev => ({ ...prev, status: newStatus }));
      setShowStatusMenu(false);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteOpportunity(clientId, opportunityId);
      navigate(`/clients/${clientId}`);
    } catch (err) {
      console.error('Error deleting opportunity:', err);
    }
  };

  // Handle creating new deal
  const handleCreateDeal = async (dealData) => {
    try {
      const property = {
        id: `prop_${Date.now()}`,
        address: dealData.property.address,
        type: dealData.property.type,
        bedrooms: dealData.property.bedrooms,
        bathrooms: dealData.property.bathrooms,
        area: dealData.property.area,
        price: dealData.pricing.askingPrice,
        listingUrl: dealData.property.listingUrl,
        reference: dealData.property.reference
      };

      let agent = null;
      if (dealData.propertyAgent.agentId) {
        agent = agents.find(a => a.id === dealData.propertyAgent.agentId);
      } else if (dealData.propertyAgent.name) {
        agent = {
          id: dealData.propertyAgent.agentId || `agent_${Date.now()}`,
          name: dealData.propertyAgent.name,
          agency: dealData.propertyAgent.agency,
          contactInfo: {
            phonePrimary: dealData.propertyAgent.phone,
            email: dealData.propertyAgent.email,
            whatsapp: dealData.propertyAgent.whatsapp
          },
          type: dealData.propertyAgent.agentId === 'self' ? 'self' : 'external'
        };
      }

      await createPropertyDeal(opportunity, property, agent);
      const updatedDeals = await loadDeals(clientId, opportunityId);
      setOpportunityDeals(updatedDeals || []);
      setIsDealModalOpen(false);
      setSelectedDeal(null);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Erro ao criar negócio: ' + error.message);
    }
  };

  // Edit deal (open modal pre-filled)
  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleViewDeal = async (deal) => {
    // Load full deal data including viewings
    try {
      const viewings = await loadDealViewings(clientId, opportunityId, deal.id);
      setSelectedDealForView({
        ...deal,
        viewings: viewings || []
      });
    } catch (e) {
      console.error('Erro ao carregar visitas do negócio:', e);
      setSelectedDealForView({
        ...deal,
        viewings: deal.viewings || []
      });
    }
  };

  // Move deal stage
  const handleMoveDealStage = async (dealId, newStage) => {
    try {
      await moveDealStage(clientId, opportunityId, dealId, newStage);
      await loadData();
    } catch (error) {
      console.error('Error moving deal stage:', error);
    }
  };

  // Replace old create handler with a unified save handler
  const handleSaveDeal = async (formData, dealId) => {
    try {
      if (dealId) {
        await updatePropertyDeal(opportunity, dealId, formData);
      } else {
        await createPropertyDeal(opportunity, formData); // FIXED
      }

      // Reload and update local state
      const updatedDeals = await loadDeals(opportunity.clientId, opportunity.id);
      setOpportunityDeals(updatedDeals || []); // ADD THIS LINE

      setIsDealModalOpen(false);
      setSelectedDeal(null);
    } catch (e) {
      console.error('Error saving deal:', e);
      alert('Erro ao guardar negócio: ' + e.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!opportunity || !client) {
    return (
      <Layout>
        <div className="text-center py-12">
          <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Oportunidade não encontrada</h3>
          <p className="mt-2 text-sm text-gray-500">A oportunidade solicitada não existe.</p>
          <Link
            to={`/clients/${clientId}`}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Voltar ao cliente
          </Link>
        </div>
      </Layout>
    );
  }

  const { qualification } = opportunity;
  const currentStatus = OPPORTUNITY_STATUS.find(s => s.value === opportunity.status);
  const buyerScore = BUYER_SCORE_CRITERIA[opportunity.buyerScore];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to={`/clients/${clientId}`}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Oportunidade de Compra
                  </h1>
                  {/* Status Badge */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      className={`px-3 py-1 rounded-full text-sm font-medium bg-${currentStatus?.color}-100 text-${currentStatus?.color}-800 hover:bg-${currentStatus?.color}-200 transition-colors`}
                    >
                      {currentStatus?.label}
                      <span className="ml-1">▼</span>
                    </button>
                    
                    {showStatusMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        {OPPORTUNITY_STATUS.map(status => (
                          <button
                            key={status.value}
                            onClick={() => handleStatusChange(status.value)}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                              status.value === opportunity.status ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            <span className={`inline-block w-2 h-2 rounded-full bg-${status.color}-500 mr-2`}></span>
                            {status.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Buyer Score */}
                  {buyerScore && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${buyerScore.color}-100 text-${buyerScore.color}-800`}>
                      {buyerScore.label}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Cliente: <Link to={`/clients/${clientId}`} className="font-medium text-blue-600 hover:text-blue-700">{client.name}</Link>
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/clients/${clientId}/opportunities/${opportunityId}/edit`)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Eliminação</h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja eliminar esta oportunidade? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Qualification Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Budget Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
                Orçamento e Financiamento
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Faixa de Preço</span>
                  <span className="font-semibold text-lg">
                    {formatPriceRange(qualification.budget.minPrice, qualification.budget.maxPrice)}
                  </span>
                </div>
                
                {qualification.budget.idealPrice > 0 && (
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-gray-600">Preço Ideal</span>
                    <span className="font-medium">{formatPrice(qualification.budget.idealPrice)}</span>
                  </div>
                )}
                
                {qualification.budget.hasFinancing && (
                  <>
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Financiamento</span>
                      <div className="text-right">
                        <span className="font-medium">{formatPrice(qualification.budget.financingAmount)}</span>
                        {qualification.budget.financingApproved && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Pré-aprovado
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {qualification.budget.bankName && (
                      <div className="flex items-center justify-between py-3 border-b">
                        <span className="text-gray-600">Banco</span>
                        <span className="font-medium">{qualification.budget.bankName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <span className="text-gray-600">Entrada Disponível</span>
                      <span className="font-medium">{formatPrice(qualification.budget.downPaymentAvailable)}</span>
                    </div>
                    
                    {qualification.budget.monthlyPaymentCapacity > 0 && (
                      <div className="flex items-center justify-between py-3 border-b">
                        <span className="text-gray-600">Capacidade Mensal</span>
                        <span className="font-medium">{formatPrice(qualification.budget.monthlyPaymentCapacity)}</span>
                      </div>
                    )}
                  </>
                )}
                
                {qualification.budget.needsSaleProceeds && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Depende da venda de outro imóvel
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="w-5 h-5 mr-2 text-blue-600" />
                Requisitos do Imóvel
              </h2>
              
              <div className="space-y-4">
                {/* Property Types */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tipos de Imóvel</p>
                  <div className="flex flex-wrap gap-2">
                    {qualification.requirements.propertyTypes.map(type => {
                      const propertyType = PROPERTY_TYPES.find(p => p.value === type);
                      return (
                        <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          <span className="mr-1">{propertyType?.icon}</span>
                          {propertyType?.label || type}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                {/* Purpose */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Finalidade</p>
                  <p className="font-medium">
                    {PROPERTY_PURPOSE.find(p => p.value === qualification.requirements.purpose)?.label || qualification.requirements.purpose}
                  </p>
                </div>
                
                {/* Size Requirements */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  {qualification.requirements.bedrooms.min && (
                    <div>
                      <p className="text-sm text-gray-600">Quartos</p>
                      <p className="font-medium">
                        {qualification.requirements.bedrooms.min}
                        {qualification.requirements.bedrooms.max && ` - ${qualification.requirements.bedrooms.max}`}
                      </p>
                    </div>
                  )}
                  
                  {qualification.requirements.bathrooms.min && (
                    <div>
                      <p className="text-sm text-gray-600">WCs</p>
                      <p className="font-medium">
                        {qualification.requirements.bathrooms.min}
                        {qualification.requirements.bathrooms.max && ` - ${qualification.requirements.bathrooms.max}`}
                      </p>
                    </div>
                  )}
                  
                  {(qualification.requirements.area.min || qualification.requirements.area.max) && (
                    <div>
                      <p className="text-sm text-gray-600">Área (m²)</p>
                      <p className="font-medium">
                        {qualification.requirements.area.min || '0'}
                        {qualification.requirements.area.max && ` - ${qualification.requirements.area.max}`}
                      </p>
                    </div>
                  )}
                  
                  {qualification.requirements.maxFloor && (
                    <div>
                      <p className="text-sm text-gray-600">Andar Máx</p>
                      <p className="font-medium">{qualification.requirements.maxFloor}º</p>
                    </div>
                  )}
                </div>
                
                {/* Renovation */}
                {qualification.requirements.renovationNeeded && qualification.requirements.renovationNeeded !== 'any' && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Aceita obras</p>
                    <p className="font-medium">
                      {qualification.requirements.renovationNeeded === 'yes' ? 'Sim, procura para renovar' : 'Não, só pronto a habitar'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Features Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-purple-600" />
                Localização e Características
              </h2>
              
              <div className="space-y-4">
                {/* Preferred Locations */}
                {qualification.requirements.preferredLocations.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Localizações Preferidas</p>
                    <div className="flex flex-wrap gap-2">
                      {qualification.requirements.preferredLocations.map((location, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Work Distance */}
                {qualification.requirements.workAddress && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Distância ao Trabalho</p>
                    <p className="font-medium">{qualification.requirements.workAddress}</p>
                    {qualification.requirements.maxDistanceToWork && (
                      <p className="text-sm text-gray-500">Máximo: {qualification.requirements.maxDistanceToWork}</p>
                    )}
                  </div>
                )}
                
                {/* Must Have Features */}
                {qualification.requirements.mustHaveFeatures.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Características Essenciais</p>
                    <div className="flex flex-wrap gap-2">
                      {qualification.requirements.mustHaveFeatures.map(feature => {
                        const feat = PROPERTY_FEATURES.find(f => f.value === feature);
                        return (
                          <span key={feature} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            {feat?.label || feature}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Nice to Have Features */}
                {qualification.requirements.niceToHaveFeatures.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Características Desejáveis</p>
                    <div className="flex flex-wrap gap-2">
                      {qualification.requirements.niceToHaveFeatures.map(feature => {
                        const feat = PROPERTY_FEATURES.find(f => f.value === feature);
                        return (
                          <span key={feature} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {feat?.label || feature}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
                Timeline e Motivação
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Urgência</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${
                    URGENCY_LEVELS.find(u => u.value === qualification.timeline.urgency)?.color || 'gray'
                  }-100 text-${
                    URGENCY_LEVELS.find(u => u.value === qualification.timeline.urgency)?.color || 'gray'
                  }-800`}>
                    {URGENCY_LEVELS.find(u => u.value === qualification.timeline.urgency)?.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Situação Atual</span>
                  <span className="font-medium">
                    {CURRENT_SITUATION.find(s => s.value === qualification.timeline.currentSituation)?.label}
                  </span>
                </div>
                
                {qualification.timeline.currentSituationDetails && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Detalhes da Situação</p>
                    <p className="text-gray-700">{qualification.timeline.currentSituationDetails}</p>
                  </div>
                )}
                
                {qualification.timeline.idealMoveDate && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">Data Ideal para Mudança</p>
                    <p className="font-medium">
                      {new Date(qualification.timeline.idealMoveDate).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}
                
                {qualification.timeline.motivationToBuy && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Motivação para Comprar</p>
                    <p className="text-gray-700">{qualification.timeline.motivationToBuy}</p>
                  </div>
                )}
                
                {qualification.timeline.viewingAvailability.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Disponibilidade para Visitas</p>
                    <div className="flex flex-wrap gap-2">
                      {qualification.timeline.viewingAvailability.map(time => (
                        <span key={time} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                          {time === 'weekdays' && 'Dias de semana'}
                          {time === 'weekends' && 'Fins de semana'}
                          {time === 'mornings' && 'Manhãs'}
                          {time === 'afternoons' && 'Tardes'}
                          {time === 'evenings' && 'Noites'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deals Section - interactive list */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Negócios ({opportunityDeals.length})
                </h2>
                <button 
                  onClick={() => setIsDealModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Negócio
                </button>
              </div>

              {opportunityDeals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Ainda não há negócios associados</p>
                  <p className="text-sm mt-2">
                    Adicione imóveis que o cliente está considerando
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunityDeals.map(deal => {
                    const summary = formatDealSummary(deal);
                    const stage = BUYER_DEAL_STAGES.find(s => s.value === deal.stage);
                    const needsAction = isDealActionNeeded(deal);

                    return (
                      <div 
                        key={deal.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                {deal.property?.address || 'Imóvel sem endereço'}
                              </h3>
                              {needsAction && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                  Ação necessária
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span>{deal.property?.type}</span>
                              <span>{deal.property?.bedrooms}Q</span>
                              <span>{deal.property?.bathrooms}WC</span>
                              <span>{deal.property?.area}m²</span>
                              <span className="font-semibold">
                                €{(deal.pricing?.askingPrice || 0).toLocaleString('pt-PT')}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 mt-2">
                              <span 
                                className={`px-2 py-1 text-xs rounded-full bg-${stage?.color || 'gray'}-100 text-${stage?.color || 'gray'}-700`}
                              >
                                {stage?.label}
                              </span>

                              {deal.scoring?.buyerInterestLevel > 0 && (
                                <div className="flex items-center">
                                  {[...Array(Math.min(5, Math.ceil((deal.scoring?.buyerInterestLevel || 0) / 2)))].map((_, i) => (
                                    <StarIcon key={i} className="w-4 h-4 text-yellow-500" />
                                  ))}
                                </div>
                              )}

                              {deal.competition?.otherOffers > 0 && (
                                <span className="text-xs text-red-600">
                                  {deal.competition.otherOffers} outras propostas
                                </span>
                              )}

                              {deal.propertyAgent?.name && (
                                <span className="text-xs text-gray-500">
                                  Agente: {deal.propertyAgent.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="ml-4 flex flex-col gap-2">
                            <button
                              onClick={() => navigate(`/clients/${clientId}/opportunities/${opportunityId}/deals`, {
                                state: { openDealId: deal.id }
                              })}
                              className="inline-flex items-center px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              <EyeIcon className="w-4 h-4 mr-1" />
                              Ver Negócio
                            </button>
                            
                            <button
                              onClick={() => handleEditDeal(deal)}
                              className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Editar Negócio
                            </button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-${stage?.color || 'gray'}-500 h-2 rounded-full`}
                              style={{ width: `${summary.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Notes */}
          <div className="space-y-6">
            {/* Client Quick Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                Informação do Cliente
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{client.name}</p>
                </div>
                
                {client.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <a href={`tel:${client.phone}`} className="font-medium text-blue-600 hover:text-blue-700 flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {client.phone}
                    </a>
                  </div>
                )}
                
                {client.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${client.email}`} className="font-medium text-blue-600 hover:text-blue-700 flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-1" />
                      {client.email}
                    </a>
                  </div>
                )}
              </div>
              
              <Link
                to={`/clients/${clientId}`}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Ver Ficha Completa
              </Link>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-gray-600" />
                Estatísticas
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{opportunity.stats?.totalDeals || 0}</p>
                  <p className="text-sm text-gray-600">Negócios</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{opportunity.stats?.propertiesViewed || 0}</p>
                  <p className="text-sm text-gray-600">Visitas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{opportunity.stats?.offersMade || 0}</p>
                  <p className="text-sm text-gray-600">Propostas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{opportunity.stats?.activeDeals || 0}</p>
                  <p className="text-sm text-gray-600">Ativos</p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {(opportunity.clientExpectations || opportunity.consultantStrategy || opportunity.internalNotes) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Notas e Estratégia
                </h3>
                
                <div className="space-y-4">
                  {opportunity.clientExpectations && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expectativas do Cliente</p>
                      <p className="text-gray-700 text-sm">{opportunity.clientExpectations}</p>
                    </div>
                  )}
                  
                  {opportunity.consultantStrategy && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Estratégia do Consultor</p>
                      <p className="text-gray-700 text-sm">{opportunity.consultantStrategy}</p>
                    </div>
                  )}
                  
                  {opportunity.internalNotes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-1">Notas Internas</p>
                      <p className="text-gray-700 text-sm">{opportunity.internalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  + Adicionar Negócio
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Agendar Visita
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  Registar Atividade
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Criado em:</span>
                  <span className="font-medium">
                    {opportunity.createdAt?.toDate ? 
                      new Date(opportunity.createdAt.toDate()).toLocaleDateString('pt-PT') :
                      new Date(opportunity.createdAt).toLocaleDateString('pt-PT')
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado em:</span>
                  <span className="font-medium">
                    {opportunity.updatedAt?.toDate ? 
                      new Date(opportunity.updatedAt.toDate()).toLocaleDateString('pt-PT') :
                      new Date(opportunity.updatedAt).toLocaleDateString('pt-PT')
                    }
                  </span>
                </div>
                {opportunity.nextFollowUpDate && (
                  <div className="flex justify-between">
                    <span>Próximo contacto:</span>
                    <span className="font-medium text-orange-600">
                      {new Date(opportunity.nextFollowUpDate).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deal Modal */}
        {isDealModalOpen && (
          <DealFormModal
            isOpen={isDealModalOpen}
            onClose={() => {
              setIsDealModalOpen(false);
              setSelectedDeal(null);
            }}
            onSave={handleSaveDeal}
            opportunity={opportunity}
            client={client}
            agents={agents}
            existingDeal={selectedDeal}
          />
        )}

        {/* View Deal Modal */}
        {selectedDealForView && (
          <DealDetailsModal
            deal={selectedDealForView}
            client={client}
            opportunity={opportunity}
            onClose={() => setSelectedDealForView(null)}
            onAddViewing={() => {
              setViewingDeal(selectedDealForView);
              setShowViewingModal(true);
            }}
            onEditViewing={(viewing) => {
              setViewingDeal(selectedDealForView);
              setShowViewingModal(true);
            }}
            onCompleteViewing={(viewing) => {
              setViewingDeal(selectedDealForView);
              setShowViewingModal(true);
            }}
            onUpdate={async () => {
              await loadData();
              if (selectedDealForView) {
                const viewings = await loadDealViewings(clientId, opportunityId, selectedDealForView.id);
                setSelectedDealForView(prev => ({
                  ...prev,
                  viewings
                }));
              }
            }}
            footer={
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditDeal(selectedDealForView)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
              </div>
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default OpportunityView;