// pages/DealBoard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../contexts/DealContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import DealFormModal from '../components/DealFormModal';
import ViewingFormModal from '../components/ViewingFormModal';
import ViewingHistory from '../components/ViewingHistory';
import {
  HomeModernIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  PhoneIcon,
  UserIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  ArrowPathIcon,
  XMarkIcon,
  EyeIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon // ADD THIS
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
    createPropertyDeal,
    updatePropertyDeal, // ADD THIS
    deletePropertyDeal, // ADD THIS
    addDealViewing 
  } = useDeal();

  const [client, setClient] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [dealsByStage, setDealsByStage] = useState({});
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [selectedDealForEdit, setSelectedDealForEdit] = useState(null); // ADD THIS
  const [isDealModalOpen, setIsDealModalOpen] = useState(false); // if not present

  useEffect(() => {
    if (clientId && opportunityId) {
      loadData();
    }
  }, [clientId, opportunityId]);

  const loadData = async () => {
    try {
      const clientData = await getClient(clientId);
      setClient(clientData);

      const oppData = await getOpportunity(clientId, opportunityId);
      setOpportunity(oppData);

      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

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
        await loadDeals(clientId, opportunityId);
      } catch (err) {
        console.error('Error moving deal:', err);
      }
    }

    setDraggedDeal(null);
    return false;
  };

  const handleCreateDeal = async (propertyData) => {
    try {
      await createPropertyDeal(opportunity, propertyData);
      setShowNewDealModal(false);
      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error creating deal:', err);
    }
  };

  const handleAddViewing = (deal) => {
    setViewingDeal(deal);
    setShowViewingModal(true);
  };

  const handleSaveViewing = async (viewingData) => {
    try {
      await addDealViewing(clientId, opportunityId, viewingDeal.id, viewingData);
      setShowViewingModal(false);
      setViewingDeal(null);
      await loadDeals(clientId, opportunityId);
      
      // If deal details modal is open, reload it
      if (selectedDeal && selectedDeal.id === viewingDeal.id) {
        const updatedDeal = deals.find(d => d.id === viewingDeal.id);
        setSelectedDeal(updatedDeal);
      }
    } catch (err) {
      console.error('Error adding viewing:', err);
      alert('Erro ao guardar visita: ' + err.message);
    }
  };

  const getStageStats = (stage) => {
    const stageDeals = dealsByStage[stage] || [];
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.pricing?.askingPrice || 0), 0);
    return {
      count: stageDeals.length,
      value: totalValue
    };
  };

  const getUrgencyColor = (deal) => {
    if (deal.competition?.otherOffers > 0) return 'red';
    if (deal.scoring?.urgencyLevel === 'urgent') return 'orange';
    if (deal.scoring?.urgencyLevel === 'high') return 'yellow';
    return 'gray';
  };

  // Create/Update handler
  const handleSaveDeal = async (formData, dealId = null) => {
    try {
      if (dealId) {
        // UPDATE existing deal
        await updatePropertyDeal(opportunity, dealId, formData);
      } else {
        // CREATE new deal - pass the complete formData
        await createPropertyDeal(opportunity, formData);
      }
      
      // Reload deals to get fresh data
      await loadDeals(clientId, opportunityId);
      
      // Close modals and clear state
      setIsDealModalOpen(false);
      setSelectedDealForEdit(null);
      setShowNewDealModal(false);
    } catch (e) {
      console.error('Error saving deal:', e);
      alert('Erro ao guardar negócio: ' + e.message);
    }
  };

  // Delete handler
  const handleDeleteDeal = async (deal) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar o negócio "${deal.property?.address}"?`)) {
      return;
    }
    
    try {
      await deletePropertyDeal(clientId, opportunityId, deal.id);
      await loadDeals(clientId, opportunityId);
      setSelectedDeal(null);
    } catch (e) {
      console.error('Error deleting deal:', e);
      alert('Erro ao eliminar negócio: ' + e.message);
    }
  };

  const getDealKey = (deal) => {
    return `${deal.property?.address}-${deal.stage}`;
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
                      onAddViewing={() => handleAddViewing(deal)}
                      urgencyColor={getUrgencyColor(deal)}
                    />
                  ))}
                  
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

        {/* Modals */}
        {showNewDealModal && (
          <DealFormModal
            isOpen={showNewDealModal}
            onClose={() => setShowNewDealModal(false)}
            onSave={handleCreateDeal}
            opportunity={opportunity}
            client={client}
          />
        )}

        {selectedDeal && (
          <DealDetailsModal
            deal={selectedDeal}
            client={client}
            onClose={() => setSelectedDeal(null)}
            onAddViewing={() => {
              setViewingDeal(selectedDeal);
              setShowViewingModal(true);
            }}
            onUpdate={loadData}
            footer={
              <div className="flex justify-between items-center w-full">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                  onClick={() => handleDeleteDeal(selectedDeal)}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                  onClick={() => handleEditDeal(selectedDeal)}
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
              </div>
            }
          />
        )}

        {showViewingModal && viewingDeal && (
          <ViewingFormModal
            isOpen={showViewingModal}
            onClose={() => {
              setShowViewingModal(false);
              setViewingDeal(null);
            }}
            onSave={handleSaveViewing}
            deal={viewingDeal}
            client={client}
          />
        )}

        {isDealModalOpen && (
          <DealFormModal
            isOpen={isDealModalOpen}
            onClose={() => {
              setIsDealModalOpen(false);
              setSelectedDealForEdit(null);
            }}
            onSave={handleSaveDeal}
            opportunity={opportunity}
            client={client}
            agents={agents}
            existingDeal={selectedDealForEdit}
          />
        )}
      </div>
    </Layout>
  );
};

// Deal Card Component
const DealCard = ({ deal, onDragStart, onClick, onAddViewing, urgencyColor }) => {
  const interestLevel = INTEREST_LEVELS.find(l => l.value === deal.scoring?.buyerInterestLevel);
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <div onClick={onClick} className="cursor-pointer">
        {/* Property Address */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-900 flex-1">
            {deal.property?.address}
          </h4>
          {deal.competition?.otherOffers > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex-shrink-0">
              {deal.competition.otherOffers} propostas
            </span>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center text-xs text-gray-600 space-x-3 mb-2">
          <span className="flex items-center">
            <HomeModernIcon className="w-4 h-4 mr-1" />
            {deal.property?.bedrooms}Q
          </span>
          {deal.property?.area && (
            <span>{deal.property.area}m²</span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">
            €{(deal.pricing?.askingPrice || 0).toLocaleString('pt-PT')}
          </span>
          {interestLevel && (
            <span className={`px-2 py-1 bg-${interestLevel.color}-100 text-${interestLevel.color}-800 text-xs rounded-full`}>
              {interestLevel.emoji} {deal.scoring?.buyerInterestLevel}/10
            </span>
          )}
        </div>

        {/* Agent */}
        {deal.propertyAgent?.name && (
          <div className="text-xs text-gray-600 mb-2 flex items-center">
            <UserIcon className="w-3 h-3 mr-1" />
            {deal.propertyAgent.name}
          </div>
        )}

        {/* Viewings Count */}
        {deal.totalViewings > 0 && (
          <div className="text-xs text-gray-600 flex items-center mb-2">
            <EyeIcon className="w-3 h-3 mr-1" />
            {deal.totalViewings} {deal.totalViewings === 1 ? 'visita' : 'visitas'}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddViewing();
          }}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <PlusIcon className="w-3 h-3 mr-1" />
          Visita
        </button>
        <button
          onClick={onClick}
          className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
        >
          Detalhes
          <ChevronRightIcon className="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>
  );
};

// Deal Details Modal
const DealDetailsModal = ({ deal, client, onClose, onAddViewing, onUpdate, footer }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">{deal.property?.address}</h2>
            <p className="text-sm text-gray-600 mt-1">{client?.name}</p>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b flex-shrink-0">
          <div className="flex space-x-6 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('viewings')}
              className={`py-3 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'viewings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Visitas ({deal.viewings?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4 mr-1 inline" />
              Notas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
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
                    <dt className="text-sm text-gray-600">Casas de Banho</dt>
                    <dd className="font-medium">{deal.property?.bathrooms}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Área</dt>
                    <dd className="font-medium">{deal.property?.area}m²</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium mb-3">Preços</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600">Preço Pedido</dt>
                    <dd className="font-medium">€{deal.pricing?.askingPrice?.toLocaleString('pt-PT')}</dd>
                  </div>
                  {deal.pricing?.marketValue && (
                    <div>
                      <dt className="text-sm text-gray-600">Valor de Mercado</dt>
                      <dd className="font-medium">€{deal.pricing.marketValue.toLocaleString('pt-PT')}</dd>
                    </div>
                  )}
                  {deal.pricing?.currentOffer && (
                    <div>
                      <dt className="text-sm text-gray-600">Proposta Atual</dt>
                      <dd className="font-medium text-green-600">€{deal.pricing.currentOffer.toLocaleString('pt-PT')}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {deal.propertyAgent?.name && (
                <div className="col-span-2">
                  <h3 className="font-medium mb-3">Agente do Imóvel</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-600">Nome</dt>
                      <dd className="font-medium">{deal.propertyAgent.name}</dd>
                    </div>
                    {deal.propertyAgent.agency && (
                      <div>
                        <dt className="text-sm text-gray-600">Agência</dt>
                        <dd className="font-medium">{deal.propertyAgent.agency}</dd>
                      </div>
                    )}
                    {deal.propertyAgent.phone && (
                      <div>
                        <dt className="text-sm text-gray-600">Telefone</dt>
                        <dd className="font-medium">{deal.propertyAgent.phone}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          )}

          {activeTab === 'viewings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Histórico de Visitas</h3>
                <button
                  onClick={onAddViewing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Adicionar Visita
                </button>
              </div>
              <ViewingHistory viewings={deal.viewings || []} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {deal.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notas Gerais</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}
              {deal.internalNotes && (
                <div>
                  <h3 className="font-medium mb-2">Notas Internas</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-3 rounded-lg">
                    {deal.internalNotes}
                  </p>
                </div>
              )}
              {!deal.notes && !deal.internalNotes && (
                <p className="text-gray-500 text-center py-8">Sem notas</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealBoard;