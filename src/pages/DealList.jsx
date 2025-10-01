/**
 * DEAL LIST PAGE - MyImoMatePro
 * Shows all deals across all opportunities and clients
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Layout from '../components/Layout';
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BUYER_DEAL_STAGES } from '../models/buyerDealModel';

const DealList = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAllDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, filterStage]);

  const loadAllDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!auth.currentUser) {
        throw new Error('Utilizador não autenticado');
      }

      const allDeals = [];

      // Get all clients
      const clientsRef = collection(db, 'consultants', auth.currentUser.uid, 'clients');
      const clientsSnapshot = await getDocs(clientsRef);

      // For each client, get opportunities
      for (const clientDoc of clientsSnapshot.docs) {
        const clientData = clientDoc.data();
        
        const opportunitiesRef = collection(
          db,
          'consultants',
          auth.currentUser.uid,
          'clients',
          clientDoc.id,
          'opportunities'
        );
        const opportunitiesSnapshot = await getDocs(opportunitiesRef);

        // For each opportunity, get deals
        for (const oppDoc of opportunitiesSnapshot.docs) {
          const oppData = oppDoc.data();
          
          const dealsRef = collection(
            db,
            'consultants',
            auth.currentUser.uid,
            'clients',
            clientDoc.id,
            'opportunities',
            oppDoc.id,
            'deals'
          );
          const dealsSnapshot = await getDocs(dealsRef);

          dealsSnapshot.docs.forEach(dealDoc => {
            allDeals.push({
              id: dealDoc.id,
              clientId: clientDoc.id,
              clientName: clientData.name,
              opportunityId: oppDoc.id,
              opportunityType: oppData.type,
              ...dealDoc.data()
            });
          });
        }
      }

      console.log(`Loaded ${allDeals.length} deals`);
      setDeals(allDeals);
      setFilteredDeals(allDeals);
    } catch (err) {
      console.error('Error loading deals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = [...deals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Stage filter
    if (filterStage !== 'all') {
      filtered = filtered.filter(deal => deal.stage === filterStage);
    }

    setFilteredDeals(filtered);
  };

  const handleDealClick = (deal) => {
    navigate(`/clients/${deal.clientId}/opportunities/${deal.opportunityId}/deals`);
  };

  const getStageInfo = (stage) => {
    const stageData = BUYER_DEAL_STAGES.find(s => s.value === stage);
    return stageData || { value: stage, label: stage, color: 'gray' };
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `€${price.toLocaleString('pt-PT')}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return d.toLocaleDateString('pt-PT');
  };

  // Group deals by stage
  const dealsByStage = BUYER_DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.value] = filteredDeals.filter(d => d.stage === stage.value);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">A carregar negócios...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Erro ao carregar negócios</p>
            <p className="text-gray-600 text-sm mt-2">{error}</p>
            <button
              onClick={loadAllDeals}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Tentar novamente
            </button>
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ShoppingBagIcon className="w-8 h-8 mr-3 text-indigo-600" />
                Pipeline de Negócios
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredDeals.length} {filteredDeals.length === 1 ? 'negócio' : 'negócios'}
                {searchTerm && ' encontrado(s)'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {BUYER_DEAL_STAGES.slice(0, 4).map(stage => {
            const count = dealsByStage[stage.value]?.length || 0;
            return (
              <div key={stage.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stage.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${stage.color}-100 flex items-center justify-center`}>
                    <ShoppingBagIcon className={`w-6 h-6 text-${stage.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por morada ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtros
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fase
                  </label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Todas as fases</option>
                    {BUYER_DEAL_STAGES.map(stage => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label} ({dealsByStage[stage.value]?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deals Grid */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nenhum negócio encontrado</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Crie oportunidades para começar a gerir negócios'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map(deal => {
              const stageInfo = getStageInfo(deal.stage);
              
              return (
                <div
                  key={deal.id}
                  onClick={() => handleDealClick(deal)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {deal.property?.address || 'Sem morada'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {deal.property?.type || 'N/A'} • {deal.property?.bedrooms || 0}Q
                      </p>
                    </div>
                    {deal.scoring?.propertyMatchScore && (
                      <div className="ml-2 flex items-center">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 text-sm font-medium">
                          {deal.scoring.propertyMatchScore}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <UserIcon className="w-4 h-4 mr-1" />
                    {deal.clientName}
                  </div>

                  {/* Price */}
                  {deal.pricing?.askingPrice > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center text-lg font-bold text-gray-900">
                        <CurrencyEuroIcon className="w-5 h-5 mr-1" />
                        {formatPrice(deal.pricing.askingPrice)}
                      </div>
                    </div>
                  )}

                  {/* Stage Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${stageInfo.color}-100 text-${stageInfo.color}-800`}>
                      {stageInfo.label}
                    </span>
                    
                    {/* Viewings count */}
                    {deal.viewings && deal.viewings.length > 0 && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {deal.viewings.length} visita{deal.viewings.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Last update */}
                  {deal.updatedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      Atualizado: {formatDate(deal.updatedAt)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default DealList;