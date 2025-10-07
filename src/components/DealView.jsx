/**
 * DEAL VIEW COMPONENT - MyImoMatePro
 * Individual deal details with property matching
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import PropertyMatching from '../components/PropertyMatching';
import {
  ArrowLeftIcon,
  HomeIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function DealView() {
  const { clientId, dealId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const consultantId = currentUser?.uid;

  const [deal, setDeal] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (consultantId && clientId && dealId) {
      fetchDealData();
    }
  }, [consultantId, clientId, dealId]);

  const fetchDealData = async () => {
    try {
      setLoading(true);
      
      // Try new structure first (direct under clients)
      let dealRef = doc(db, 'consultants', consultantId, 'clients', clientId, 'deals', dealId);
      let dealSnap = await getDoc(dealRef);
      
      // If not found, search in old structure (under opportunities)
      if (!dealSnap.exists()) {
        console.log('Deal not found in new structure, checking old structure...');
        
        const opportunitiesRef = collection(
          db,
          'consultants',
          consultantId,
            'clients',
          clientId,
          'opportunities'
        );
        const opportunitiesSnap = await getDocs(opportunitiesRef);
        
        for (const oppDoc of opportunitiesSnap.docs) {
          const oldDealRef = doc(
            db,
            'consultants', consultantId,
            'clients', clientId,
            'opportunities', oppDoc.id,
            'deals', dealId
          );
          const oldDealSnap = await getDoc(oldDealRef);
          
          if (oldDealSnap.exists()) {
            dealSnap = oldDealSnap;
            dealRef = oldDealRef;
            console.log('✅ Found deal in old structure under opportunity:', oppDoc.id);
            break;
          }
        }
      } else {
        console.log('✅ Found deal in new structure');
      }
      
      if (!dealSnap.exists()) {
        throw new Error('Deal not found in either structure');
      }
      
      const dealData = { id: dealSnap.id, ...dealSnap.data() };
      setDeal(dealData);
      
      // Get client data
      const clientRef = doc(db, 'consultants', consultantId, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        setClient({ id: clientSnap.id, ...clientSnap.data() });
      }
    } catch (error) {
      console.error('Error loading deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Firestore Timestamp (has seconds property)
    if (date && typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString('pt-PT');
    }
    
    // ISO or other date string
    if (typeof date === 'string') {
      const parsed = new Date(date);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('pt-PT');
      }
      return 'N/A';
    }
    
    // Native Date instance
    if (date instanceof Date) {
      return date.toLocaleDateString('pt-PT');
    }
    
    return 'N/A';
  };

  const handleStageChange = async (newStage) => {
    try {
      const dealRef = doc(db, 'consultants', consultantId, 'clients', clientId, 'deals', dealId);
      await updateDoc(dealRef, { 
        stage: newStage,
        updatedAt: new Date().toISOString() 
      });
      setDeal(prev => ({ ...prev, stage: newStage }));
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      lead: 'bg-gray-100 text-gray-700',
      visita_agendada: 'bg-blue-100 text-blue-700',
      visita_realizada: 'bg-purple-100 text-purple-700',
      proposta: 'bg-yellow-100 text-yellow-700',
      negociacao: 'bg-orange-100 text-orange-700',
      fechado: 'bg-green-100 text-green-700',
      perdido: 'bg-red-100 text-red-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
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

  if (!deal) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Negócio não encontrado</p>
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

  const stages = [
    { value: 'lead', label: 'Lead' },
    { value: 'visita_agendada', label: 'Visita Agendada' },
    { value: 'visita_realizada', label: 'Visita Realizada' },
    { value: 'proposta', label: 'Proposta' },
    { value: 'negociacao', label: 'Negociação' },
    { value: 'fechado', label: 'Fechado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to={`/clients/${clientId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {deal.propertyAddress || 'Negócio de Compra'}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-gray-600">
                    Cliente: {client?.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStageColor(deal.stage)}`}>
                    {stages.find(s => s.value === deal.stage)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline do Negócio</h2>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.value}>
                <button
                  onClick={() => handleStageChange(stage.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                    deal.stage === stage.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {stage.label}
                </button>
                {index < stages.length - 1 && (
                  <div className="w-4 h-0.5 bg-gray-200 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HomeIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Detalhes do Negócio</h2>
              </div>

              <div className="space-y-4">
                {deal.propertyAddress && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Imóvel de Interesse</p>
                      <p className="font-semibold text-gray-900">{deal.propertyAddress}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Preço</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(deal.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comissão Estimada</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency((deal.price || 0) * 0.025)}
                    </p>
                  </div>
                </div>

                {deal.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Notas</p>
                    <p className="text-gray-700">{deal.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Data de Criação</p>
                    <p className="text-gray-900">{formatDate(deal.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Atualização</p>
                    <p className="text-gray-900">{formatDate(deal.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Property Info */}
            {deal.linkedProperty?.sellerOpportunityId && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Imóvel Conectado</h2>
                  </div>
                  <Link
                    to={`/clients/${deal.linkedProperty.sellerClientId}/seller-opportunities/${deal.linkedProperty.sellerOpportunityId}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver Detalhes →
                  </Link>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Vendedor:</span> {deal.linkedProperty.sellerName}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Morada:</span> {deal.linkedProperty.propertyAddress}
                  </p>
                </div>
              </div>
            )}

            {/* Property Matching Section */}
            <PropertyMatching 
              mode="buyer"
              sourceData={{
                requirements: deal.requirements || {
                  maxBudget: deal.price || 300000,
                  minBudget: (deal.price || 300000) * 0.8,
                  propertyTypes: ['apartamento', 'moradia'],
                  minBedrooms: 2,
                  minArea: 80,
                  desiredLocations: [],
                  requiredFeatures: []
                }
              }}
              clientId={clientId}
              documentId={dealId}
              onLink={() => fetchDealData()}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requisitos do Cliente</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Orçamento</p>
                  <p className="font-semibold">
                    {formatCurrency(deal.requirements?.minBudget || 0)} - {formatCurrency(deal.requirements?.maxBudget || deal.price || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Imóvel</p>
                  <p className="font-semibold capitalize">
                    {(deal.requirements?.propertyTypes || ['Não especificado']).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quartos Mínimos</p>
                  <p className="font-semibold">{deal.requirements?.minBedrooms || 'Não especificado'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Área Mínima</p>
                  <p className="font-semibold">{deal.requirements?.minArea || 'Não especificado'} m²</p>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
              {deal.activities && deal.activities.length > 0 ? (
                <div className="space-y-2">
                  {deal.activities.slice(-5).map((activity, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem atividades registadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}