/**
 * SELLER OPPORTUNITY VIEW - MyImoMatePro
 * Detail view for seller opportunities
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { 
  getSellerOpportunity,
  updateSellerOpportunity,
  updateSellerStage 
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
  PencilIcon
} from '@heroicons/react/24/outline';

// Import your seller models
import { 
  SELLER_PIPELINE_STAGES,
  getQualificationColor 
} from '../models/sellerOpportunity';

export default function SellerOpportunityView() {
  const { clientId, opportunityId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const consultantId = currentUser?.uid;

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load opportunity data
  useEffect(() => {
    loadOpportunityData();
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    try {
      setLoading(true);
      const oppData = await getSellerOpportunity(db, consultantId, clientId, opportunityId);
      setOpportunity(oppData);
    } catch (err) {
      console.error('Error loading seller opportunity:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle stage change
  const handleStageChange = async (newStage) => {
    try {
      await updateSellerStage(db, consultantId, clientId, opportunityId, newStage);
      setOpportunity(prev => ({ ...prev, stage: newStage }));
    } catch (err) {
      console.error('Error updating stage:', err);
      alert('Erro ao atualizar etapa');
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-PT');
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
                  Oportunidade de Venda
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-gray-600">
                    ID: {opportunity.propertyId}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getQualificationColor(opportunity.sellerQualification)}`}>
                    Score: {opportunity.sellerScore}/10
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/clients/${clientId}/seller-opportunities/${opportunityId}/edit`)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stage Pipeline */}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
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

            {/* Pricing */}
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

            {/* Viewings Section - Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Visitas</h2>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  + Agendar Visita
                </button>
              </div>
              <p className="text-gray-500 text-sm">
                {opportunity.stats.viewingsScheduled} visitas agendadas, {opportunity.stats.viewingsCompleted} realizadas
              </p>
            </div>

            {/* Offers Section - Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Propostas</h2>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                {opportunity.stats.offersReceived} propostas recebidas
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dias no Mercado</span>
                  <span className="font-semibold">{opportunity.stats.daysOnMarket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitas Agendadas</span>
                  <span className="font-semibold">{opportunity.stats.viewingsScheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visitas Realizadas</span>
                  <span className="font-semibold">{opportunity.stats.viewingsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Propostas Recebidas</span>
                  <span className="font-semibold">{opportunity.stats.offersReceived}</span>
                </div>
              </div>
            </div>

            {/* Motivation */}
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
    </Layout>
  );
}