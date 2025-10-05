// pages/DealBoard.jsx - WITH INDIVIDUAL COLLAPSIBLE COLUMNS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { BUYER_DEAL_STAGES, INTEREST_LEVELS, OFFER_STATUS } from '../models/buyerDealModel';

const DealBoard = () => {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  
  // Layout preferences
  const [collapsedStages, setCollapsedStages] = useState(new Set());
  
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
  const [viewingMode, setViewingMode] = useState('record');

  const loadInitialData = async () => {
    try {
      if (!currentUser?.uid) {
        console.log('Waiting for authentication...');
        return;
      }

      const [clientData, opportunityData] = await Promise.all([
        getClient(clientId),
        getOpportunity(clientId, opportunityId)
      ]);
      
      setClient(clientData);
      setOpportunity(opportunityData);
      
      await loadDeals(clientId, opportunityId);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;
    loadInitialData();
  }, [clientId, opportunityId, currentUser?.uid]);

  useEffect(() => {
    organizeDealsByStage();
    
    // Auto-collapse empty stages
    const newCollapsedStages = new Set();
    BUYER_DEAL_STAGES.forEach(stage => {
      if (!dealsByStage[stage.value]?.length) {
        newCollapsedStages.add(stage.value);
      }
    });
    setCollapsedStages(newCollapsedStages);
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

    setDealsByStage(organized);
  };

  const getVisibleStages = () => {
    return BUYER_DEAL_STAGES;
  };

  const isStageEmpty = (stage) => {
    return !dealsByStage[stage.value]?.length;
  };

  const toggleStageCollapse = (stageValue) => {
    setCollapsedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageValue)) {
        newSet.delete(stageValue);
      } else {
        newSet.add(stageValue);
      }
      return newSet;
    });
  };

  const isStageCollapsed = (stageValue) => {
    return collapsedStages.has(stageValue);
  };

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

  const handleScheduleViewing = (deal) => {
    setViewingDeal(deal);
    setViewingMode('schedule');
    setSelectedViewingToEdit(null);
    setShowViewingModal(true);
  };

  const handleRecordViewing = (deal) => {
    setViewingDeal(deal);
    setViewingMode('record');
    setSelectedViewingToEdit(null);
    setShowViewingModal(true);
  };

  const handleCompleteViewing = (deal, viewing) => {
    setViewingDeal(deal);
    setViewingMode('complete');
    setSelectedViewingToEdit(viewing);
    setShowViewingModal(true);
  };

  const handleEditViewing = async (deal, viewing) => {
    setViewingDeal(deal);
    setViewingMode(viewing?.status === 'scheduled' ? 'schedule' : 'record');
    setSelectedViewingToEdit(viewing);
    setShowViewingModal(true);
  };

  const handleSaveViewing = async (viewingData) => {
    try {
      await addDealViewing(clientId, opportunityId, viewingDeal.id, viewingData);
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

  useEffect(() => {
    if (location.state?.openDealId && deals.length > 0) {
      const dealToOpen = deals.find(d => d.id === location.state.openDealId);
      if (dealToOpen) {
        handleViewDealDetails(dealToOpen);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, deals]);

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

  const visibleStages = getVisibleStages();

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pipeline de Negócios</h1>
              <p className="text-gray-600 mt-1">
                {client?.name} - {opportunity?.title}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedDealForEdit(null);
                  setIsDealModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Novo Negócio
              </button>
            </div>
          </div>
        </div>

        {/* Simplified: always render horizontal (Kanban) view */}
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {visibleStages.map(stage => {
            const isCollapsed = isStageCollapsed(stage.value);

            return (
              <div
                key={stage.value}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isCollapsed ? 'w-16' : 'w-80'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.value)}
              >
                {isCollapsed ? (
                  <div 
                    className={`h-full min-h-[400px] bg-${stage.color}-100 border-2 border-${stage.color}-300 rounded-lg p-2 flex flex-col items-center justify-start cursor-pointer hover:bg-${stage.color}-200 transition-colors`}
                    onClick={() => toggleStageCollapse(stage.value)}
                    title={`${stage.label} - Clique para expandir`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStageCollapse(stage.value);
                      }}
                      className={`p-1 rounded hover:bg-${stage.color}-300 transition-colors mb-2`}
                    >
                      <ChevronRightIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${stage.color}-200 text-${stage.color}-800 mb-3`}>
                      {dealsByStage[stage.value]?.length || 0}
                    </span>
                    <div 
                      className="text-sm font-semibold text-gray-700"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {stage.label}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`bg-${stage.color}-100 border-2 border-${stage.color}-300 rounded-lg p-3 mb-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStageCollapse(stage.value)}
                            className={`p-1 rounded hover:bg-${stage.color}-300 transition-colors`}
                            title="Colapsar coluna"
                          >
                            <ChevronLeftIcon className="w-4 h-4 text-gray-700" />
                          </button>
                          <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${stage.color}-200 text-${stage.color}-800`}>
                          {dealsByStage[stage.value]?.length || 0}
                        </span>
                      </div>
                    </div>

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
                  </>
                )}
              </div>
            );
          })}
        </div>

        {selectedDeal && (
          <DealDetailsModal
            deal={selectedDeal}
            client={client}
            opportunity={opportunity}
            onClose={() => setSelectedDeal(null)}
            onAddViewing={() => {
              setViewingDeal(selectedDeal);
              setShowViewingModal(true);
            }}
            onScheduleViewing={() => handleScheduleViewing(selectedDeal)}
            onRecordViewing={() => handleRecordViewing(selectedDeal)}
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

const DealCard = ({ deal, onDragStart, onClick, onSchedule, onRecord, urgencyColor }) => {
  const interestLevel = INTEREST_LEVELS.find(l => l.value === deal.scoring?.buyerInterestLevel);
  const viewingCount = deal.viewings?.length || 0;
  const offerCount = deal.offerCount || 0;
  const latestOfferStatus = deal.latestOfferStatus;
  
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
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 flex-1 line-clamp-2">
            {deal.property?.address || 'Sem endereço'}
          </h4>
          {deal.urgency && (
            <span className={`ml-2 flex-shrink-0 w-3 h-3 rounded-full bg-${urgencyColor}-500`} />
          )}
        </div>

        <div className="flex items-center text-lg font-bold text-indigo-600 mb-2">
          <CurrencyEuroIcon className="w-5 h-5 mr-1" />
          {deal.pricing?.askingPrice?.toLocaleString('pt-PT') || '0'}
        </div>

        {/* Replaced emoji stats with Heroicons + inline SVGs */}
        <div className="flex items-center text-xs text-gray-500 space-x-3 mb-3 bg-gray-50 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <HomeModernIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{deal.property?.bedrooms || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            <span className="font-medium">{deal.property?.bathrooms || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <span className="font-medium">{deal.property?.area || 0}m²</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {interestLevel && (
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span className={`text-xs font-medium text-${interestLevel.color}-700`}>
                {interestLevel.label}
              </span>
            </div>
          )}

          {viewingCount > 0 && (
            <div className="flex items-center text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
              <EyeIcon className="w-4 h-4 mr-1" />
              {viewingCount} {viewingCount === 1 ? 'visita' : 'visitas'}
            </div>
          )}

          {offerCount > 0 && (
            <div className="flex items-center text-xs font-medium text-purple-800 bg-purple-100 rounded px-2 py-1 border border-purple-200">
              <DocumentTextIcon className="w-4 h-4 mr-1" />
              {offerCount} {offerCount === 1 ? 'proposta' : 'propostas'}
            </div>
          )}

          {offerStatusConfig && (
            <span className={`text-xs font-medium px-2 py-1 rounded border bg-${offerStatusConfig.color}-100 text-${offerStatusConfig.color}-800 border-${offerStatusConfig.color}-200`}>
              {offerStatusConfig.label}
            </span>
          )}
        </div>

        {deal.transaction?.stage && (
          <div className={`inline-flex items-center text-xs font-medium rounded px-2 py-1 border ${getTransactionBadgeColor(deal.transaction.stage)}`}>
            {getStageLabel(deal.transaction.stage)}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSchedule();
          }}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          <CalendarIcon className="w-4 h-4 mr-1" />
          Agendar Visita
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRecord();
          }}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Registar Visita
        </button>
      </div>
    </div>
  );
};

const DealDetailsModal = ({
  deal,
  client,
  opportunity,
  onClose,
  onAddViewing,
  onScheduleViewing,
  onRecordViewing,
  onEditViewing,
  onCompleteViewing,
  onUpdate,
  footer
}) => {
  const [activeTab, setActiveTab] = useState('overview');
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
    if (onUpdate) onUpdate();
    setShowMakeOfferModal(false);
    setShowRespondOfferModal(false);
    setSelectedOffer(null);
    setOfferAction(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
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

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
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
                  <div className="flex gap-2">
                    <button
                      onClick={onScheduleViewing}
                      className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Agendar Visita
                    </button>
                    <button
                      onClick={onRecordViewing || onAddViewing}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Registar Visita
                    </button>
                  </div>
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

          {footer && (
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

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