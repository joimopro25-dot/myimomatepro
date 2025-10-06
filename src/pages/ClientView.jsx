/**
 * CLIENT VIEW PAGE - MyImoMatePro
 * Display client details with activity timeline and opportunities
 * Read-only view with quick actions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useAuth } from '../contexts/AuthContext'; // ADD
import Layout from '../components/Layout';
import BuyerOpportunityForm from './BuyerOpportunityForm';
import SellerQualificationForm from "../components/SellerQualificationForm";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  TagIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  UsersIcon,
  ShoppingCartIcon,
  HomeModernIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { formatPhone, calculateAge, ACTIVITY_TYPES } from '../models/clientModel';
import { createSellerOpportunity } from '../utils/sellerOpportunityFirebase'; // ADD THIS
import { db } from '../firebase/config'; // ADD THIS

export default function ClientView() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const {
    getClient,
    deleteClient,
    logActivity,
    getClientActivities,
    loading,
    error
  } = useClients();
  
  const {
    getClientOpportunities,
    loading: oppLoading
  } = useOpportunities();

  const { currentUser } = useAuth();              // ADD
  const consultantId = currentUser?.uid;          // ADD

  const [client, setClient] = useState(null);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityNote, setActivityNote] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('note');
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showBuyerOpportunityForm, setShowBuyerOpportunityForm] = useState(false);
  const [showSellerOpportunityForm, setShowSellerOpportunityForm] = useState(false); // ADD THIS

  // Load client data
  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      const clientData = await getClient(clientId);
      setClient(clientData);
      
      // Load activities
      const clientActivities = await getClientActivities(clientId);
      setActivities(clientActivities);
      
      // Load opportunities
      const clientOpportunities = await getClientOpportunities(clientId);
      setOpportunities(clientOpportunities);
    } catch (err) {
      console.error('Error loading client:', err);
      navigate('/clients');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteClient(clientId);
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Log new activity
  const handleLogActivity = async () => {
    if (!activityNote.trim()) return;
    
    try {
      await logActivity(clientId, selectedActivityType, activityNote);
      setActivityNote('');
      setShowActivityForm(false);
      
      // Reload activities
      const updatedActivities = await getClientActivities(clientId);
      setActivities(updatedActivities);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Quick activity
  const handleQuickActivity = async (type) => {
    try {
      await logActivity(clientId, type, `Quick ${ACTIVITY_TYPES[type].label}`);
      // Reload activities
      const updatedActivities = await getClientActivities(clientId);
      setActivities(updatedActivities);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Handle opportunity form completion
  const handleOpportunityCreated = async (opportunityId) => {
    setShowBuyerOpportunityForm(false);
    // Reload opportunities
    const clientOpportunities = await getClientOpportunities(clientId);
    setOpportunities(clientOpportunities);
    // Navigate to the opportunity view
    navigate(`/clients/${clientId}/opportunities/${opportunityId}`);
  };

  // Open WhatsApp
  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-PT');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || oppLoading || !client) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar cliente...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const age = calculateAge(client.birthDate);
  const spouseAge = calculateAge(client.spouse?.birthDate);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/clients"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-600">NIF: {client.nif || 'N/A'}</span>
                  {client.tags?.includes('Hot Lead') && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Lead Quente
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/clients/${clientId}/edit`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.location.href = `tel:${client.phone}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Ligar</span>
            </button>
            <button
              onClick={() => openWhatsApp(client.phone)}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center space-x-2"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            {client.email && (
              <button
                onClick={() => window.location.href = `mailto:${client.email}`}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center space-x-2"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Email</span>
              </button>
            )}
            <button
              onClick={() => setShowActivityForm(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <DocumentTextIcon className="w-4 h-4" />
              <span>Registar Actividade</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunities Section - UPDATED FOR BUYER + SELLER */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Oportunidades ({opportunities.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBuyerOpportunityForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    <span>Comprador</span>
                  </button>
                  <button
                    onClick={() => setShowSellerOpportunityForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <HomeModernIcon className="w-4 h-4" />
                    <span>Vendedor</span>
                  </button>
                </div>
              </div>

              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opportunity) => (
                    <div key={opportunity.id} className={`border-2 ${
                      opportunity.type === 'buyer'
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    } rounded-lg p-4 transition-all`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {opportunity.type === 'buyer' ? (
                            <ShoppingCartIcon className="w-6 h-6 text-green-600 mr-2" />
                          ) : (
                            <HomeModernIcon className="w-6 h-6 text-blue-600 mr-2" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {opportunity.type === 'buyer' ? 'Comprador' : 'Vendedor'}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {opportunity.type === 'buyer' ? 'Procura imóvel' : 'Vende imóvel'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {opportunity.type === 'buyer' && (
                          <>
                            {opportunity.buyerScore && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Score:</span>
                                <span className="font-medium">{opportunity.buyerScore}</span>
                              </div>
                            )}
                            {opportunity.qualification?.budget?.maxPrice && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Orçamento:</span>
                                <span className="font-medium">
                                  até €{opportunity.qualification.budget.maxPrice.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {opportunity.type === 'seller' && (
                          <>
                            {opportunity.property?.address && (
                              <div className="text-xs">
                                <span className="text-gray-600">Imóvel:</span>
                                <p className="font-medium">{opportunity.property.address}</p>
                              </div>
                            )}
                            {opportunity.pricing?.askingPrice && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Preço:</span>
                                <span className="font-medium">
                                  €{opportunity.pricing.askingPrice.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {opportunity.sellerScore && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Score:</span>
                                <span className="font-medium">{opportunity.sellerScore}/10</span>
                              </div>
                            )}
                          </>
                        )}

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Stage:</span>
                          <span className="font-medium">{opportunity.stage}</span>
                        </div>

                        <Link
                          to={
                            opportunity.type === 'buyer'
                              ? `/clients/${clientId}/opportunities/${opportunity.id}`
                              : `/clients/${clientId}/seller-opportunities/${opportunity.id}`
                          }
                          className="mt-3 w-full inline-flex justify-center items-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma oportunidade criada</p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={() => setShowBuyerOpportunityForm(true)}
                      className="inline-flex items-center px-4 py-2 border-2 border-dashed border-green-300 text-green-700 rounded-lg hover:border-green-500 transition-colors"
                    >
                      <ShoppingCartIcon className="w-4 h-4 mr-2" />
                      Comprador
                    </button>
                    <button
                      onClick={() => setShowSellerOpportunityForm(true)}
                      className="inline-flex items-center px-4 py-2 border-2 border-dashed border-blue-300 text-blue-700 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <HomeModernIcon className="w-4 h-4 mr-2" />
                      Vendedor
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{formatPhone(client.phone)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{client.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Preferência de Contacto</p>
                  <p className="font-medium">{client.contactPreference}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Melhor Hora</p>
                  <p className="font-medium">{client.bestContactTime || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Data de Nascimento</p>
                  <p className="font-medium">
                    {client.birthDate ? `${formatDate(client.birthDate)} (${age} anos)` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Naturalidade</p>
                  <p className="font-medium">{client.birthPlace || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cartão Cidadão</p>
                  <p className="font-medium">{client.cc || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Validade CC</p>
                  <p className="font-medium">{formatDate(client.ccValidity)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIF</p>
                  <p className="font-medium">{client.nif || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profissão</p>
                  <p className="font-medium">{client.profession || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado Civil</p>
                  <p className="font-medium">{client.maritalStatus}</p>
                </div>
                {client.marriageRegime && (
                  <div>
                    <p className="text-sm text-gray-600">Regime de Casamento</p>
                    <p className="font-medium">{client.marriageRegime}</p>
                  </div>
                )}
              </div>
              
              {client.address?.street && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Morada</p>
                  <p className="font-medium">
                    {client.address.street}<br />
                    {client.address.postalCode} {client.address.city}
                  </p>
                </div>
              )}
            </div>

            {/* Spouse Information */}
            {client.spouse?.name && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2 text-pink-600" />
                  Dados do Cônjuge
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{client.spouse.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{client.spouse.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{client.spouse.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">NIF</p>
                    <p className="font-medium">{client.spouse.nif || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CC</p>
                    <p className="font-medium">{client.spouse.cc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Validade CC</p>
                    <p className="font-medium">{formatDate(client.spouse.ccValidity)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data de Nascimento</p>
                    <p className="font-medium">
                      {client.spouse.birthDate ? `${formatDate(client.spouse.birthDate)} (${spouseAge} anos)` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Naturalidade</p>
                    <p className="font-medium">{client.spouse.birthPlace || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Profissão</p>
                    <p className="font-medium">{client.spouse.profession || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
                Qualificação Financeira
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Rendimento Mensal</p>
                  <p className="font-medium">€{client.financial?.monthlyIncome || 0}</p>
                </div>
                {client.spouse?.name && (
                  <div>
                    <p className="text-sm text-gray-600">Rendimento Cônjuge</p>
                    <p className="font-medium">€{client.financial?.spouseMonthlyIncome || 0}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Rendimento Total Agregado</p>
                  <p className="font-medium text-lg">€{client.financial?.totalHousehold || 0}</p>
                </div>
                {client.financial?.hasLoans && (
                  <div>
                    <p className="text-sm text-gray-600">Prestações Mensais</p>
                    <p className="font-medium text-red-600">€{client.financial?.monthlyLoanPayments || 0}</p>
                  </div>
                )}
                {client.financial?.hasPreApproval && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Banco Pré-aprovação</p>
                      <p className="font-medium">{client.financial?.preApprovalBank}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Montante Aprovado</p>
                      <p className="font-medium text-green-600">€{client.financial?.preApprovalAmount || 0}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Management Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestão</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Origem</p>
                  <p className="font-medium">{client.leadSource}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Próximo Contacto</p>
                  <p className="font-medium">
                    {client.nextContactDate ? formatDate(client.nextContactDate) : 'Não agendado'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.tags?.length > 0 ? (
                      client.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Sem tags</span>
                    )}
                  </div>
                </div>

                {client.internalNotes && (
                  <div>
                    <p className="text-sm text-gray-600">Notas Internas</p>
                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{client.internalNotes}</p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">GDPR</p>
                  <p className="font-medium">
                    {client.gdprConsent ? (
                      <span className="text-green-600 flex items-center">
                        <CheckBadgeIcon className="w-4 h-4 mr-1" />
                        Consentimento dado
                      </span>
                    ) : (
                      <span className="text-red-600">Sem consentimento</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Atividades</h2>
              
              {activities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activities.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl">
                        {ACTIVITY_TYPES[activity.type]?.icon || '📝'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {ACTIVITY_TYPES[activity.type]?.label || activity.type}
                        </p>
                        {activity.note && (
                          <p className="text-sm text-gray-600">{activity.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Sem atividades registadas</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity Form Modal */}
        {showActivityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Registar Atividade
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Atividade
                  </label>
                  <select
                    value={selectedActivityType}
                    onChange={(e) => setSelectedActivityType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalhes da atividade..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowActivityForm(false);
                    setActivityNote('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Registar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Eliminação
              </h3>
              <p className="text-gray-600 mb-6">
                Tem a certeza que deseja eliminar este cliente? Esta ação não pode ser revertida.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
        
        {/* Buyer Opportunity Form Modal */}
        {showBuyerOpportunityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <BuyerOpportunityForm
                clientId={clientId}
                clientName={client.name}
                onComplete={handleOpportunityCreated}
                onCancel={() => setShowBuyerOpportunityForm(false)}
              />
            </div>
          </div>
        )}

        {/* Seller Opportunity Form Modal */}
        {showSellerOpportunityForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <SellerQualificationForm
                clientId={clientId}
                clientName={client.name}
                onSubmit={async (data) => {
                  if (!consultantId) {
                    console.error('Consultant not authenticated');
                    return;
                  }
                  await createSellerOpportunity(db, consultantId, clientId, data);
                  setShowSellerOpportunityForm(false);
                  loadClientData();
                }}
                onCancel={() => setShowSellerOpportunityForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}