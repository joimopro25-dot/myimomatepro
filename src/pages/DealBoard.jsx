// pages/DealBoard.jsx - COMPLETE WITH OFFER SUPPORT
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../contexts/DealContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import DealFormModal from '../components/DealFormModal';
import ViewingFormModal from '../components/ViewingFormModal';
import ViewingHistory from '../components/ViewingHistory';
import OfferTimeline from '../components/OfferTimeline';
import MakeOfferModal from '../components/MakeOfferModal';
import RespondOfferModal from '../components/RespondOfferModal';
import TransactionTimeline from '../components/TransactionTimeline';
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
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BUYER_DEAL_STAGES, INTEREST_LEVELS, OFFER_STATUS } from '../models/buyerDealModel';

const DealBoard = () => {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getClient } = useClients();
  const { getOpportunity } = useOpportunities();
  const { 
    loadDeals, 
    deals, 
    moveDealStage, 
    loading, 
    error,
    createPropertyDeal,
    updatePropertyDeal,
    deletePropertyDeal,
    addDealViewing,
    loadDealViewings
  } = useDeal();

  const [client, setClient] = useState(null);
  const [opportunity, setOpportunity] = useState(null);
  const [dealsByStage, setDealsByStage] = useState({});
  const [draggedDeal, setDraggedDeal] = useState(null);
  
  // Modal states
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDealForEdit, setSelectedDealForEdit] = useState(null);

  // Viewing data
  const [dealViewings, setDealViewings] = useState({});
  const [selectedViewingToEdit, setSelectedViewingToEdit] = useState(null);
  const [viewingMode, setViewingMode] = useState('record'); // 'schedule' | 'record' | 'complete'

  // Load initial data
  const loadInitialData = async () => {
    try {
      // CRITICAL: Wait for authentication
      if (!currentUser?.uid) {
        console.log('Waiting for authentication...');
        return;
      }

      console.log('=== LOADING DEAL BOARD DATA ===');
      console.log('Consultant ID:', currentUser.uid);
      console.log('Client ID:', clientId);
      console.log('Opportunity ID:', opportunityId);

      const [clientData, opportunityData] = await Promise.all([
        getClient(clientId),
        getOpportunity(clientId, opportunityId)
      ]);
      
      console.log('Client loaded:', clientData?.name);
      console.log('Opportunity loaded:', opportunityData?.title);
      
      setClient(clientData);
      setOpportunity(opportunityData);
      
      // Load deals
      console.log('Loading deals...');
      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  // Load initial data when authentication is ready
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log('No user authenticated yet, waiting...');
      return;
    }
    
    loadInitialData();
  }, [clientId, opportunityId, currentUser?.uid]);

  // Organize deals by stage
  useEffect(() => {
    organizeDealsByStage();
  }, [deals]);

  const organizeDealsByStage = () => {
    const organized = {};
    BUYER_DEAL_STAGES.forEach(stage => {
      organized[stage.value] = [];
    });

    deals.forEach(deal => {
      if (organized[deal.stage]) {
        organized[deal.stage].push(deal);
      }
    });

    console.log('Deals organized by stage:', organized);
    setDealsByStage(organized);
  };

  // Load viewings for a specific deal
  const loadViewingsForDeal = async (dealId) => {
    try {
      const viewings = await loadDealViewings(clientId, opportunityId, dealId);
      setDealViewings(prev => ({
        ...prev,
        [dealId]: viewings
      }));
      return viewings;
    } catch (err) {
      console.error('Error loading viewings:', err);
      return [];
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== newStage) {
      try {
        await moveDealStage(clientId, opportunityId, draggedDeal.id, newStage);
        await loadDeals(clientId, opportunityId);
      } catch (err) {
        console.error('Error moving deal:', err);
      }
    }
    setDraggedDeal(null);
  };

  // Deal handlers
  const handleSaveDeal = async (dealData) => {
    try {
      if (selectedDealForEdit) {
        await updatePropertyDeal(clientId, opportunityId, selectedDealForEdit.id, dealData);
      } else {
        await createPropertyDeal(clientId, opportunityId, dealData);
      }
      await loadDeals(clientId, opportunityId);
      setIsDealModalOpen(false);
      setSelectedDealForEdit(null);
    } catch (err) {
      console.error('Error saving deal:', err);
      alert('Erro ao guardar negócio');
    }
  };

  const handleEditDeal = (deal) => {
    setSelectedDealForEdit(deal);
    setIsDealModalOpen(true);
  };

  const handleDeleteDeal = async (deal) => {
    if (window.confirm(`Tem certeza que deseja eliminar o negócio "${deal.property?.address}"?`)) {
      try {
        await deletePropertyDeal(clientId, opportunityId, deal.id);
        await loadDeals(clientId, opportunityId);
        setSelectedDeal(null);
      } catch (err) {
        console.error('Error deleting deal:', err);
        alert('Erro ao eliminar negócio');
      }
    }
  };

  // Viewing handlers
  const handleAddViewing = async (deal) => {
    setViewingDeal(deal);
    setSelectedViewingToEdit(null);
    // Load existing viewings for this deal
    await loadViewingsForDeal(deal.id);
    setShowViewingModal(true);
  };

  // Schedule a new visit (basic info only)
  const handleScheduleViewing = (deal) => {
    setViewingDeal(deal);
    setViewingMode('schedule');
    setSelectedViewingToEdit(null);
    setShowViewingModal(true);
  };

  // Record a completed visit (full form)
  const handleRecordViewing = (deal) => {
    setViewingDeal(deal);
    setViewingMode('record');
    setSelectedViewingToEdit(null);
    setShowViewingModal(true);
  };

  // Complete a scheduled visit (add feedback)
  const handleCompleteViewing = (deal, viewing) => {
    setViewingDeal(deal);
    setViewingMode('complete');
    setSelectedViewingToEdit(viewing);
    setShowViewingModal(true);
  };

  // Edit existing viewing
  const handleEditViewing = async (deal, viewing) => {
    setViewingDeal(deal);
    setViewingMode(viewing?.status === 'scheduled' ? 'schedule' : 'record');
    setSelectedViewingToEdit(viewing);
    setShowViewingModal(true);
  };

  const handleSaveViewing = async (viewingData) => {
    try {
      await addDealViewing(clientId, opportunityId, viewingDeal.id, viewingData);
      // Reload deals and viewings
      await loadDeals(clientId, opportunityId);
      await loadViewingsForDeal(viewingDeal.id);

      setShowViewingModal(false);
      setViewingDeal(null);
      setSelectedViewingToEdit(null);
      setViewingMode('record');

      if (selectedDeal && selectedDeal.id === viewingDeal.id) {
        const updatedViewings = await loadViewingsForDeal(viewingDeal.id);
        setSelectedDeal(prev => ({
          ...prev,
          viewings: updatedViewings
        }));
      }
    } catch (err) {
      console.error('Error saving viewing:', err);
      alert('Erro ao guardar visita');
    }
  };

  const handleViewDealDetails = async (deal) => {
    // Load viewings for this deal
    const viewings = await loadViewingsForDeal(deal.id);
    setSelectedDeal({
      ...deal,
      viewings: viewings || []
    });
  };

  const getUrgencyColor = (deal) => {
    if (deal.urgency === 'urgent') return 'red';
    if (deal.urgency === 'high') return 'orange';
    if (deal.urgency === 'normal') return 'blue';
    return 'gray';
  };

  // Show loading while waiting for auth or initial data
  if (!currentUser?.uid || (loading && !client)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pipeline de Negócios</h1>
              <p className="text-gray-600 mt-1">
                {client?.name} - {opportunity?.title}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedDealForEdit(null);
                setIsDealModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Novo Negócio
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {BUYER_DEAL_STAGES.map(stage => (
            <div
              key={stage.value}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.value)}
            >
              {/* Stage Header */}
              <div className={`bg-${stage.color}-100 border-2 border-${stage.color}-300 rounded-lg p-3 mb-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${stage.color}-200 text-${stage.color}-800`}>
                    {dealsByStage[stage.value]?.length || 0}
                  </span>
                </div>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3 min-h-[200px]">
                {dealsByStage[stage.value]?.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDragStart={handleDragStart}
                    onClick={() => handleViewDealDetails(deal)}
                    onSchedule={() => handleScheduleViewing(deal)}
                    onRecord={() => handleRecordViewing(deal)}
                    urgencyColor={getUrgencyColor(deal)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Deal Details Modal */}
        {selectedDeal && (
          <DealDetailsModal
            deal={selectedDeal}
            client={client}
            opportunity={opportunity}
            onClose={() => setSelectedDeal(null)}
            onAddViewing={() => handleAddViewing(selectedDeal)}
            onEditViewing={(viewing) => handleEditViewing(selectedDeal, viewing)}
            onCompleteViewing={(viewing) => handleCompleteViewing(selectedDeal, viewing)}
            onUpdate={async () => {
              const viewings = await loadViewingsForDeal(selectedDeal.id);
              await loadDeals(clientId, opportunityId);
              setSelectedDeal(prev => ({
                ...prev,
                viewings
              }));
            }}
            footer={
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteDeal(selectedDeal)}
                  className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
                <button
                  onClick={() => handleEditDeal(selectedDeal)}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Editar
                </button>
              </div>
            }
          />
        )}

        {/* Viewing Form Modal */}
        {showViewingModal && viewingDeal && (
          <ViewingFormModal
            isOpen={showViewingModal}
            onClose={() => {
              setShowViewingModal(false);
              setViewingDeal(null);
              setSelectedViewingToEdit(null);
              setViewingMode('record');
            }}
            onSave={handleSaveViewing}
            deal={viewingDeal}
            client={client}
            existingViewing={selectedViewingToEdit}
            mode={viewingMode}
          />
        )}

        {/* Deal Form Modal */}
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
            existingDeal={selectedDealForEdit}
          />
        )}
      </div>
    </Layout>
  );
};

// Deal Card Component - UPDATED WITH TRANSACTION BADGE
const DealCard = ({ deal, onDragStart, onClick, onSchedule, onRecord, urgencyColor }) => {
  const interestLevel = INTEREST_LEVELS.find(l => l.value === deal.scoring?.buyerInterestLevel);
  const viewingCount = deal.viewings?.length || 0;
  const offerCount = deal.offerCount || 0;
  const latestOfferStatus = deal.latestOfferStatus;
  
  // Get offer status config for color coding
  const getOfferStatusConfig = () => {
    if (!latestOfferStatus) return null;
    return OFFER_STATUS.find(s => s.value === latestOfferStatus);
  };

  const offerStatusConfig = getOfferStatusConfig();

  const getTransactionBadgeColor = (stage) => {
    const map = {
      offer_accepted: 'bg-green-100 text-green-800 border-green-200',
      cpcv_signed: 'bg-purple-100 text-purple-800 border-purple-200',
      escritura_scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return map[stage] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  const getStageLabel = (stage) => {
    const labels = {
      offer_accepted: 'Proposta Aceite',
      cpcv_signed: 'CPCV Assinado',
      escritura_scheduled: 'Escritura Agendada',
      completed: 'Concluído'
    };
    return labels[stage] || stage;
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 cursor-move hover:shadow-lg hover:border-indigo-300 transition-all"
    >
      <div onClick={onClick} className="cursor-pointer">
        {/* Property Address */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 flex-1 line-clamp-2">
            {deal.property?.address || 'Sem endereço'}
          </h4>
          {deal.urgency && (
            <span className={`ml-2 flex-shrink-0 w-3 h-3 rounded-full bg-${urgencyColor}-500`} />
          )}
        </div>

        {/* Price */}
        <div className="flex items-center text-lg font-bold text-indigo-600 mb-2">
          <CurrencyEuroIcon className="w-5 h-5 mr-1" />
          {deal.pricing?.askingPrice?.toLocaleString('pt-PT') || '0'}
        </div>

        {/* Property Details */}
        <div className="flex items-center text-sm text-gray-600 space-x-3 mb-2">
          <span>{deal.property?.bedrooms || 0} 🛏️</span>
          <span>{deal.property?.bathrooms || 0} 🚿</span>
          <span>{deal.property?.area || 0}m²</span>
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Interest Level */}
          {interestLevel && (
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span className={`text-xs font-medium text-${interestLevel.color}-700`}>
                {interestLevel.label}
              </span>
            </div>
          )}

          {/* Viewing Count */}
          {viewingCount > 0 && (
            <div className="flex items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
              <EyeIcon className="w-4 h-4 mr-1" />
              {viewingCount} {viewingCount === 1 ? 'visita' : 'visitas'}
            </div>
          )}

          {/* Offer Count Badge - NEW */}
          {offerCount > 0 && (
            <div className="flex items-center text-xs font-medium text-purple-800 bg-purple-100 rounded px-2 py-1 border border-purple-200">
              <DocumentTextIcon className="w-4 h-4 mr-1" />
              {offerCount} {offerCount === 1 ? 'proposta' : 'propostas'}
            </div>
          )}

          {/* Latest Offer Status Badge - NEW */}
          {offerStatusConfig && (
            <span className={`text-xs font-medium px-2 py-1 rounded border bg-${offerStatusConfig.color}-100 text-${offerStatusConfig.color}-800 border-${offerStatusConfig.color}-200`}>
              {offerStatusConfig.label}
            </span>
          )}
        </div>

        {/* Transaction Badge - NEW */}
        {deal.transaction?.stage && (
          <div className={`inline-flex items-center text-xs font-medium rounded px-2 py-1 border ${getTransactionBadgeColor(deal.transaction.stage)}`}>
            {getStageLabel(deal.transaction.stage)}
          </div>
        )}
      </div>

      {/* Two Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSchedule();
          }}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          <CalendarIcon className="w-4 h-4 mr-1" />
          Agendar
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRecord();
          }}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Registar
        </button>
      </div>
    </div>
  );
};

// Deal Details Modal Component - UPDATED WITH TRANSACTION TAB
const DealDetailsModal = ({ deal, client, opportunity, onClose, onAddViewing, onEditViewing, onCompleteViewing, onUpdate, footer }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Offer modal states
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);
  const [showRespondOfferModal, setShowRespondOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerAction, setOfferAction] = useState(null);

  const { updateTransaction } = useDeal();

  const handleMakeOffer = (offer = null) => {
    setSelectedOffer(offer);
    setShowMakeOfferModal(true);
  };

  const handleRespondOffer = (offer, action) => {
    setSelectedOffer(offer);
    setOfferAction(action);
    setShowRespondOfferModal(true);
  };

  const handleOfferSuccess = () => {
    // Reload deal data to get updated offers
    if (onUpdate) {
      onUpdate();
    }
    setShowMakeOfferModal(false);
    setShowRespondOfferModal(false);
    setSelectedOffer(null);
    setOfferAction(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
            <div>
              <h2 className="text-xl font-semibold">{deal.property?.address}</h2>
              <p className="text-sm text-gray-600 mt-1">{client?.name}</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">
                €{deal.pricing?.askingPrice?.toLocaleString('pt-PT')}
              </p>
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
                onClick={() => setActiveTab('propostas')}
                className={`py-3 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'propostas'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="w-4 h-4 mr-1" />
                Propostas ({deal.offerCount || 0})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Notas
              </button>
              {deal.transaction && (
                <button
                  onClick={() => setActiveTab('transaction')}
                  className={`py-3 border-b-2 font-medium text-sm ${
                    activeTab === 'transaction'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transação
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detalhes do Imóvel</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Tipo</dt>
                      <dd className="text-sm font-medium">{deal.property?.type || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Quartos</dt>
                      <dd className="text-sm font-medium">{deal.property?.bedrooms || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Casas de Banho</dt>
                      <dd className="text-sm font-medium">{deal.property?.bathrooms || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Área</dt>
                      <dd className="text-sm font-medium">{deal.property?.area || 0}m²</dd>
                    </div>
                  </dl>
                </div>

                {/* Agent Info */}
                {deal.propertyAgent?.name && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Agente do Imóvel</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600">Nome</dt>
                        <dd className="text-sm font-medium">{deal.propertyAgent.name}</dd>
                      </div>
                      {deal.propertyAgent.agency && (
                        <div>
                          <dt className="text-sm text-gray-600">Agência</dt>
                          <dd className="text-sm font-medium">{deal.propertyAgent.agency}</dd>
                        </div>
                      )}
                      {deal.propertyAgent.phone && (
                        <div>
                          <dt className="text-sm text-gray-600">Telefone</dt>
                          <dd className="text-sm font-medium">{deal.propertyAgent.phone}</dd>
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
                <ViewingHistory
                  viewings={deal.viewings || []}
                  onEdit={(viewing) => onEditViewing(viewing)}
                  onComplete={(viewing) => onCompleteViewing(viewing)}
                />
              </div>
            )}

            {activeTab === 'propostas' && (
              <OfferTimeline
                clientId={client.id}
                opportunityId={opportunity.id}
                dealId={deal.id}
                onMakeOffer={handleMakeOffer}
                onRespondOffer={handleRespondOffer}
              />
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                {deal.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notas Gerais</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {deal.notes}
                    </p>
                  </div>
                )}
                {deal.internalNotes && (
                  <div>
                    <h3 className="font-medium mb-2">Notas Internas</h3>
                    <p className="text-gray-700 whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      {deal.internalNotes}
                    </p>
                  </div>
                )}
                {!deal.notes && !deal.internalNotes && (
                  <p className="text-gray-500 text-center py-8">Sem notas</p>
                )}
              </div>
            )}

            {activeTab === 'transaction' && deal.transaction && (
              <TransactionTimeline
                transaction={deal.transaction}
                onUpdateTransaction={async (updated) => {
                  await updateTransaction(client.id, opportunity.id, deal.id, updated);
                  if (onUpdate) onUpdate();
                }}
              />
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modals */}
      {showMakeOfferModal && (
        <MakeOfferModal
          isOpen={showMakeOfferModal}
          onClose={() => {
            setShowMakeOfferModal(false);
            setSelectedOffer(null);
          }}
          clientId={client.id}
          opportunityId={opportunity.id}
          dealId={deal.id}
          propertyPrice={deal.pricing?.askingPrice}
          existingOffer={selectedOffer}
          onSuccess={handleOfferSuccess}
        />
      )}

      {showRespondOfferModal && selectedOffer && (
        <RespondOfferModal
          isOpen={showRespondOfferModal}
          onClose={() => {
            setShowRespondOfferModal(false);
            setSelectedOffer(null);
            setOfferAction(null);
          }}
          clientId={client.id}
          opportunityId={opportunity.id}
          dealId={deal.id}
          offer={selectedOffer}
          action={offerAction}
          onSuccess={handleOfferSuccess}
        />
      )}
    </>
  );
};

export default DealBoard;