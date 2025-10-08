/**
 * SELLER OPPORTUNITY VIEW - MyImoMatePro
 * Detail view for seller opportunities
 * UPDATED: Added "Create Offer from Visit" functionality (Option 1 & 2)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { 
  getSellerOpportunity,
  updateSellerOpportunity,
  updateSellerStage,
  addViewing,
  updateViewingStatus,
  addOffer,
  updateOfferStatus,
  updateViewing,
  updateSellerTransaction,
  markOpportunityAsLost
} from '../utils/sellerOpportunityFirebase';
import { db } from '../firebase/config';
import {
  ArrowLeftIcon,
  HomeIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  EyeIcon,
  DocumentTextIcon,
  MapPinIcon,
  PencilIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircle, TrendingUp } from 'lucide-react';

import { 
  SELLER_PIPELINE_STAGES,
  getQualificationColor 
} from '../models/sellerOpportunity';

import ScheduleVisitModal from '../components/ScheduleVisitModal';
import VisitsList from '../components/VisitsList';
import CompleteVisitModal from '../components/CompleteVisitModal';
import AddOfferModal from '../components/AddOfferModal';
import OffersView from '../components/OffersView';
import RespondOfferModal from '../components/RespondOfferModal';
import PropertyMatching from '../components/PropertyMatching';
import ViewVisitModal from '../components/ViewVisitModal';
import TransactionTimeline from '../components/TransactionTimeline';

export default function SellerOpportunityView() {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const consultantId = currentUser?.uid;

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showScheduleVisitModal, setShowScheduleVisitModal] = useState(false);
  const [showCompleteVisitModal, setShowCompleteVisitModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editingVisit, setEditingVisit] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showRespondOfferModal, setShowRespondOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerAction, setOfferAction] = useState(null);
  const [showViewVisitModal, setShowViewVisitModal] = useState(false);
  const [selectedViewVisit, setSelectedViewVisit] = useState(null);
  
  // NEW: State for pre-filled offer data from visit (Option 1)
  const [offerFromVisit, setOfferFromVisit] = useState(null);

  useEffect(() => {
    fetchOpportunity();
  }, [opportunityId, consultantId]);

  const fetchOpportunity = async () => {
    if (!consultantId) return;
    try {
      setLoading(true);
      const oppData = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
      console.log('Opportunity data loaded:', oppData);
      setOpportunity(oppData);
    } catch (err) {
      console.error('Error loading seller opportunity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    try {
      await updateSellerStage(db, consultantId, clientId, opportunityId, newStage);
      setOpportunity(prev => ({ ...prev, stage: newStage }));
    } catch (err) {
      console.error('Error updating stage:', err);
      alert('Erro ao atualizar etapa');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-PT');
  };

  const handleScheduleVisit = async (visitData) => {
    try {
      if (editingVisit) {
        await updateViewing(
          db,
          consultantId,
          clientId,
          opportunityId,
          editingVisit.id,
          visitData
        );
      } else {
        await addViewing(
          db,
          consultantId,
          clientId,
          opportunityId,
          visitData
        );
      }
      await fetchOpportunity();
      setShowScheduleVisitModal(false);
      setEditingVisit(null);
    } catch (error) {
      console.error('Error saving visit:', error);
      alert(editingVisit ? 'Erro ao atualizar visita' : 'Erro ao agendar visita');
    }
  };

  const handleCompleteVisit = (visitId) => {
    const visit = opportunity?.viewings?.find(v => v.id === visitId);
    if (!visit) return;
    setSelectedVisit(visit);
    setShowCompleteVisitModal(true);
  };

  const handleCancelVisit = async (visitId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta visita?')) return;
    try {
      await updateViewingStatus(
        db,
        consultantId,
        clientId,
        opportunityId,
        visitId,
        'cancelled',
        {}
      );
      await fetchOpportunity();
    } catch (error) {
      console.error('Error cancelling visit:', error);
      alert('Erro ao cancelar visita');
    }
  };

  const handleSaveCompleteVisit = async (visitId, status, feedbackData) => {
    try {
      await updateViewingStatus(
        db,
        consultantId,
        clientId,
        opportunityId,
        visitId,
        status,
        feedbackData
      );
      await fetchOpportunity();
      setShowCompleteVisitModal(false);
      setSelectedVisit(null);
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Erro ao concluir visita');
    }
  };

  const handleViewVisitDetails = (visit) => {
    setSelectedViewVisit(visit);
    setShowViewVisitModal(true);
  };

  const handleEditVisit = (visit) => {
    console.log('Editing visit:', visit);
    setEditingVisit(visit);
    setIsEditMode(true);
    setShowScheduleVisitModal(true);
  };

  // NEW: Handler for creating offer from visit (Option 1)
  const handleCreateOfferFromVisit = (visit) => {
    console.log('Creating offer from visit:', visit);
    
    // Pre-fill offer data from visit
    const preFilledData = {
      // Buyer information from visit
      buyerName: visit.visitorName || '',
      buyerPhone: visit.visitorPhone || '',
      buyerEmail: visit.visitorEmail || '',
      
      // Buyer agent information if available
      buyerConsultant: visit.buyerAgent?.name || '',
      buyerConsultantPhone: visit.buyerAgent?.phone || '',
      buyerConsultantEmail: visit.buyerAgent?.email || '',
      
      // Offer amount from feedback
      amount: visit.feedback?.willingToPay || '',
      
      // Additional notes combining visit feedback
      notes: [
        visit.feedback?.feedback ? `Feedback da Visita: ${visit.feedback.feedback}` : '',
        visit.feedback?.concerns ? `Preocupações: ${visit.feedback.concerns}` : '',
        visit.feedback?.nextSteps ? `Próximos Passos: ${visit.feedback.nextSteps}` : '',
        visit.notes ? `Notas da Visita: ${visit.notes}` : ''
      ].filter(Boolean).join('\n\n'),
      
      // Interest level as buyer score
      buyerScore: visit.feedback?.interestLevel || 'medium',
      
      // Visit reference
      visitId: visit.id,
      visitDate: visit.scheduledDate
    };
    
    setOfferFromVisit(preFilledData);
    setShowViewVisitModal(false);
    setShowAddOfferModal(true);
  };

  const handleAddOffer = async (offerData) => {
    try {
      await addOffer(db, consultantId, clientId, opportunityId, offerData);
      await fetchOpportunity();
      setShowAddOfferModal(false);
      setOfferFromVisit(null); // Clear pre-filled data
    } catch (error) {
      console.error('Error adding offer:', error);
      alert('Erro ao adicionar proposta');
    }
  };

  // NEW: Updated close handler to clear pre-filled data
  const handleCloseAddOfferModal = () => {
    setShowAddOfferModal(false);
    setOfferFromVisit(null); // Clear pre-filled data when closing
  };

  const handleRespondOffer = (offerId, action) => {
    const offer = opportunity?.offers?.find(o => o.id === offerId);
    if (!offer) return;
    setSelectedOffer(offer);
    setOfferAction(action);
    setShowRespondOfferModal(true);
  };

  const handleAbandonSale = async () => {
    const reason = window.prompt(
      'Motivo da desistência da venda:\n\n( Opcional, mas recomendado para análise futura )',
      ''
    );
    if (reason === null) return;
    const confirmed = window.confirm(
      '⚠️ Tem certeza que deseja marcar esta oportunidade como PERDIDA?\n\n' +
      'Esta ação irá:\n' +
      '• Mover a oportunidade para o estágio "Perdido"\n' +
      '• Parar o acompanhamento ativo\n' +
      '• Registar a data de desistência\n\n' +
      'Confirmar?'
    );
    if (!confirmed) return;
    try {
      await markOpportunityAsLost(
        db,
        consultantId,
        clientId,
        opportunityId,
        reason.trim()
      );
      await fetchOpportunity();
      alert('✅ Oportunidade marcada como perdida');
    } catch (error) {
      console.error('Error marking opportunity as lost:', error);
      alert('❌ Erro ao marcar oportunidade como perdida');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !opportunity) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Erro ao carregar oportunidade: {error}</p>
            <button
              onClick={() => navigate(`/clients/${clientId}`)}
              className="mt-4 text-red-600 hover:text-red-800"
            >
              Voltar ao cliente
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStage = SELLER_PIPELINE_STAGES.find(s => s.value === opportunity.stage);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to={`/clients/${clientId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Oportunidade de Venda
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                ID: {opportunity.customPropertyId || opportunity.propertyId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {opportunity.stage !== 'perdido' && opportunity.stage !== 'vendido' && (
              <button
                onClick={handleAbandonSale}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
                Desistir da Venda
              </button>
            )}
            <Link
              to={`/clients/${clientId}/seller-opportunities/${opportunityId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </Link>
          </div>
        </div>

        {opportunity.stage === 'perdido' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Oportunidade Perdida</p>
                {opportunity.lostReason && (
                  <p className="text-sm text-red-700 mt-1">
                    Motivo: {opportunity.lostReason}
                  </p>
                )}
                {opportunity.lostAt && (
                  <p className="text-xs text-red-600 mt-1">
                    Data: {new Date(opportunity.lostAt).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline</h2>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {SELLER_PIPELINE_STAGES.map((stage, index) => (
              <React.Fragment key={stage.value}>
                <button
                  onClick={() => handleStageChange(stage.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                    opportunity.stage === stage.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: opportunity.stage === stage.value ? stage.color : undefined
                  }}
                >
                  <div className="text-sm">{stage.label}</div>
                </button>
                {index < SELLER_PIPELINE_STAGES.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-200 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HomeIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Detalhes do Imóvel</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Morada</p>
                      <p className="font-semibold text-gray-900">{opportunity.property.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {opportunity.property.type}
                    </p>
                  </div>
                  {opportunity.property.bedrooms && (
                    <div>
                      <p className="text-sm text-gray-600">Quartos</p>
                      <p className="font-medium text-gray-900">
                        {opportunity.property.bedrooms}
                      </p>
                    </div>
                  )}
                  {opportunity.property.bathrooms && (
                    <div>
                      <p className="text-sm text-gray-600">WC</p>
                      <p className="font-medium text-gray-900">
                        {opportunity.property.bathrooms}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Área</p>
                    <p className="font-medium text-gray-900">
                      {opportunity.property.area}m²
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Condição</p>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {opportunity.property.condition}
                  </span>
                </div>

                {opportunity.property.features && opportunity.property.features.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Características</p>
                    <div className="flex flex-wrap gap-2">
                      {opportunity.property.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Preços</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Preço Pedido</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(opportunity.pricing.askingPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preço Mínimo</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(opportunity.pricing.minimumPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Flexibilidade de Preço</p>
                <p className="font-medium text-gray-900 capitalize">
                  {opportunity.pricing.flexibility}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Visitas</h2>
                <button
                  onClick={() => {
                    setEditingVisit(null);
                    setIsEditMode(false);
                    setShowScheduleVisitModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Agendar Visita
                </button>
              </div>
              <VisitsList
                viewings={opportunity.viewings || []}
                onComplete={handleCompleteVisit}
                onCancel={handleCancelVisit}
                onViewDetails={handleViewVisitDetails}
                onEditVisit={handleEditVisit}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Propostas</h2>
                <button
                  onClick={() => setShowAddOfferModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Adicionar Proposta
                </button>
              </div>
              <OffersView
                offers={opportunity.offers || []}
                askingPrice={opportunity.pricing?.askingPrice}
                onRespond={handleRespondOffer}
              />
            </div>

            {opportunity.acceptedOffer && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Processo de Transação</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Proposta Aceite
                  </span>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        Proposta de {opportunity.acceptedOffer.buyer?.name || opportunity.acceptedOffer.buyerName || 'Comprador'} aceite!
                      </p>
                      <p className="text-green-700 mt-1">
                        Valor: €{(opportunity.acceptedOffer.amount || opportunity.acceptedOffer.offerAmount || 0).toLocaleString('pt-PT')}
                      </p>
                    </div>
                  </div>
                </div>

                {opportunity.transaction ? (
                  <TransactionTimeline
                    transaction={opportunity.transaction}
                    onUpdateTransaction={async (updatedTransaction) => {
                      await updateSellerTransaction(
                        db,
                        consultantId,
                        clientId,
                        opportunityId,
                        updatedTransaction
                      );
                      fetchOpportunity();
                    }}
                  />
                ) : (
                  <button
                    onClick={async () => {
                      const transactionData = {
                        stage: 'offer_accepted',
                        acceptedOffer: {
                          amount: opportunity.acceptedOffer.amount || opportunity.acceptedOffer.offerAmount,
                          id: opportunity.acceptedOffer.id
                        },
                        cpcv: {
                          status: 'pending',
                          scheduledDate: null,
                          signalAmount: 0,
                          location: '',
                          notes: '',
                          documentsChecklist: []
                        },
                        escritura: {
                          status: 'pending',
                          scheduledDate: null,
                          completedDate: null,
                          notaryName: '',
                          notaryLocation: '',
                          finalAmount: opportunity.acceptedOffer.amount || opportunity.acceptedOffer.offerAmount,
                          registrationNumber: '',
                          notes: ''
                        },
                        financing: {
                          required: false,
                          bankName: '',
                          approvalAmount: 0,
                          milestones: {}
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      await updateSellerTransaction(
                        db,
                        consultantId,
                        clientId,
                        opportunityId,
                        transactionData
                      );
                      fetchOpportunity();
                    }}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Iniciar Processo de Transação (CPCV → Escritura)
                  </button>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PropertyMatching 
                mode="seller"
                sourceData={opportunity}
                clientId={clientId}
                documentId={opportunityId}
                onLink={(match) => fetchOpportunity()}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dias no Mercado</span>
                  <span className="font-semibold">{opportunity.stats?.daysOnMarket ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitas Agendadas</span>
                  <span className="font-semibold">{(opportunity.viewings || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Propostas Recebidas</span>
                  <span className="font-semibold">{(opportunity.offers || []).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Motivação</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Motivo</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {opportunity.motivation.reason}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgência</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {opportunity.motivation.urgency}
                  </p>
                </div>
                {opportunity.motivation.idealDate && (
                  <div>
                    <p className="text-sm text-gray-600">Data Ideal</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(opportunity.motivation.idealDate)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Situação Atual</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {opportunity.motivation.currentSituation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ScheduleVisitModal
        isOpen={showScheduleVisitModal}
        onClose={() => {
          setShowScheduleVisitModal(false);
          setEditingVisit(null);
          setIsEditMode(false);
        }}
        onSave={handleScheduleVisit}
        opportunity={opportunity}
        existingVisit={editingVisit}
        isEditMode={isEditMode}
      />

      <CompleteVisitModal
        isOpen={showCompleteVisitModal}
        onClose={() => {
          setShowCompleteVisitModal(false);
          setSelectedVisit(null);
        }}
        onSave={handleSaveCompleteVisit}
        visit={selectedVisit}
      />

      {/* UPDATED: ViewVisitModal with onCreateOffer prop */}
      <ViewVisitModal
        isOpen={showViewVisitModal}
        onClose={() => {
          setShowViewVisitModal(false);
          setSelectedViewVisit(null);
        }}
        visit={selectedViewVisit}
        onCreateOffer={handleCreateOfferFromVisit}
      />

      {/* UPDATED: AddOfferModal with fromVisitData and allVisits props */}
      <AddOfferModal
        isOpen={showAddOfferModal}
        onClose={handleCloseAddOfferModal}
        onSave={handleAddOffer}
        fromVisitData={offerFromVisit}
        allVisits={opportunity?.viewings || []}
      />

      <RespondOfferModal
        isOpen={showRespondOfferModal}
        onClose={() => {
          setShowRespondOfferModal(false);
          setSelectedOffer(null);
          setOfferAction(null);
        }}
        clientId={clientId}              
        opportunityId={opportunityId}    
        onSuccess={fetchOpportunity}     
        offer={selectedOffer}
        action={offerAction}
      />
    </Layout>
  );
}