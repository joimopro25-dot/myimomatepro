/**
 * OPPORTUNITY LIST - MyImoMatePro
 * Dashboard view to see all opportunities across all clients
 * Read-only list with filters and quick navigation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '../contexts/OpportunityContext';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import Layout from '../components/Layout';
import {
  ShoppingCartIcon,
  HomeModernIcon,
  HomeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  OPPORTUNITY_STATUS,
  BUYER_SCORE_CRITERIA,
  URGENCY_LEVELS,
  PROPERTY_TYPES,
  formatPriceRange,
  getStatusColor,
  getScoreColor
} from '../models/opportunityModel';

const OpportunityList = () => {
  const navigate = useNavigate();
  const { getAllOpportunities, loading: contextLoading, error: contextError } = useOpportunities();
  
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load opportunities on mount
  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!auth.currentUser) {
        throw new Error('Utilizador não autenticado. Por favor, faça login novamente.');
      }
      
      const allOpps = [];
      const currentUserId = auth.currentUser.uid;
      
      // Strategy 1: Try to get all clients first
      let clientsMap = new Map();
      try {
        const clientsSnapshot = await getDocs(collection(db, 'clients'));
        clientsSnapshot.forEach(doc => {
          clientsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        console.log(`Loaded ${clientsMap.size} clients`);
      } catch (err) {
        console.log('Could not load clients collection, will try alternative approach');
      }
      
      // If no clients loaded, try with consultant filter
      if (clientsMap.size === 0) {
        try {
          const clientsQuery = query(
            collection(db, 'clients'),
            where('consultantId', '==', currentUserId)
          );
          const clientsSnapshot = await getDocs(clientsQuery);
          clientsSnapshot.forEach(doc => {
            clientsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
          console.log(`Loaded ${clientsMap.size} clients for consultant ${currentUserId}`);
        } catch (err) {
          console.log('Could not load filtered clients either');
        }
      }
      
      // Strategy 2: If still no clients, try to load opportunities directly from known client IDs
      // This handles the case where we can read subcollections but not parent collections
      const knownClientIds = ['lpRiBqqtTnBK4tuBiFAZ']; // Add known client IDs here
      
      if (clientsMap.size === 0) {
        // Try to load client data individually
        for (const clientId of knownClientIds) {
          try {
            const clientDoc = await getDoc(doc(db, 'clients', clientId));
            if (clientDoc.exists()) {
              clientsMap.set(clientId, { id: clientId, ...clientDoc.data() });
            }
          } catch (err) {
            console.log(`Could not load client ${clientId}:`, err.message);
          }
        }
      }
      
      // Load opportunities from all known clients
      const clientIdsToCheck = clientsMap.size > 0 
        ? Array.from(clientsMap.keys())
        : knownClientIds;
      
      for (const clientId of clientIdsToCheck) {
        try {
          const oppsSnapshot = await getDocs(
            collection(db, 'clients', clientId, 'opportunities')
          );
          
          const clientData = clientsMap.get(clientId) || {};
          
          oppsSnapshot.docs.forEach(oppDoc => {
            const oppData = oppDoc.data();
            const opportunity = {
              id: oppDoc.id,
              ...oppData,
              clientId: clientId,
              clientName: clientData.name || 'Cliente',
              clientPhone: clientData.phone || '',
              clientEmail: clientData.email || '',
              // Ensure dates are properly handled
              createdAt: oppData.createdAt?.toDate ? oppData.createdAt.toDate() : 
                        (oppData.createdAt ? new Date(oppData.createdAt) : new Date()),
              updatedAt: oppData.updatedAt?.toDate ? oppData.updatedAt.toDate() : 
                        (oppData.updatedAt ? new Date(oppData.updatedAt) : null),
              lastActivityAt: oppData.lastActivityAt?.toDate ? oppData.lastActivityAt.toDate() : 
                             (oppData.lastActivityAt ? new Date(oppData.lastActivityAt) : null)
            };
            allOpps.push(opportunity);
          });
        } catch (err) {
          console.error(`Error loading opportunities for client ${clientId}:`, err);
        }
      }
      
      console.log(`Total opportunities loaded: ${allOpps.length}`);
      setOpportunities(allOpps);
      setFilteredOpportunities(allOpps);
      
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError(err.message || 'Erro ao carregar oportunidades');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterStatus, filterScore, filterUrgency, sortBy, sortOrder, opportunities]);

  const applyFilters = () => {
    let filtered = [...opportunities];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.clientName?.toLowerCase().includes(search) ||
        opp.clientPhone?.includes(search) ||
        opp.qualification?.requirements?.preferredLocations?.some(loc => 
          loc.toLowerCase().includes(search)
        )
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(opp => opp.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(opp => opp.status === filterStatus);
    }

    // Score filter
    if (filterScore !== 'all') {
      filtered = filtered.filter(opp => opp.buyerScore === filterScore);
    }

    // Urgency filter
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(opp => 
        opp.qualification?.timeline?.urgency === filterUrgency
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = ['immediate', '1_month', '3_months', '6_months', 'flexible'];
          aValue = urgencyOrder.indexOf(a.qualification?.timeline?.urgency || 'flexible');
          bValue = urgencyOrder.indexOf(b.qualification?.timeline?.urgency || 'flexible');
          break;
          
        case 'score':
          const scoreOrder = ['A', 'B', 'C'];
          aValue = scoreOrder.indexOf(a.buyerScore || 'C');
          bValue = scoreOrder.indexOf(b.buyerScore || 'C');
          break;
          
        case 'price':
          aValue = parseInt(a.qualification?.budget?.maxPrice) || 0;
          bValue = parseInt(b.qualification?.budget?.maxPrice) || 0;
          break;
          
        case 'createdAt':
        default:
          aValue = a.createdAt || new Date(0);
          bValue = b.createdAt || new Date(0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOpportunities(filtered);
  };

  // Stats calculation
  const stats = {
    total: filteredOpportunities.length,
    buyers: filteredOpportunities.filter(o => o.type === 'buyer').length,
    sellers: filteredOpportunities.filter(o => o.type === 'seller').length,
    active: filteredOpportunities.filter(o => o.status === 'active').length,
    scoreA: filteredOpportunities.filter(o => o.buyerScore === 'A').length,
    urgent: filteredOpportunities.filter(o => o.qualification?.timeline?.urgency === 'immediate').length
  };

  const handleOpportunityClick = (opp) => {
    navigate(`/clients/${opp.clientId}/opportunities/${opp.id}`);
  };

  const renderOpportunityCard = (opp) => {
    const status = OPPORTUNITY_STATUS.find(s => s.value === opp.status);
    const score = opp.buyerScore && BUYER_SCORE_CRITERIA[opp.buyerScore];
    const urgency = URGENCY_LEVELS.find(u => u.value === opp.qualification?.timeline?.urgency);

    return (
      <div
        key={opp.id}
        onClick={() => handleOpportunityClick(opp)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            {opp.type === 'buyer' ? (
              <ShoppingCartIcon className="w-8 h-8 text-green-600 mr-3" />
            ) : (
              <HomeModernIcon className="w-8 h-8 text-blue-600 mr-3" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {opp.clientName}
              </h3>
              <p className="text-sm text-gray-600">
                {opp.type === 'buyer' ? 'Comprador' : 'Vendedor'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status ? `bg-${status.color}-100 text-${status.color}-800` : 'bg-gray-100 text-gray-800'
            }`}>
              {status?.label || 'Ativo'}
            </span>
            {score && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${score.color}-100 text-${score.color}-800`}>
                Score {opp.buyerScore}
              </span>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="space-y-2 mb-4">
          {opp.clientName && (
            <div className="flex items-center text-sm text-gray-600">
              <UserIcon className="w-4 h-4 mr-2" />
              {opp.clientName}
            </div>
          )}
          {opp.clientPhone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 mr-2" />
              {opp.clientPhone}
            </div>
          )}
        </div>

        {/* Qualification Summary */}
        {opp.type === 'buyer' && opp.qualification && (
          <div className="space-y-3 border-t pt-4">
            {/* Budget */}
            {opp.qualification.budget && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyEuroIcon className="w-4 h-4 mr-2" />
                  Orçamento
                </div>
                <span className="font-medium text-sm">
                  {opp.qualification.budget.maxPrice 
                    ? `Até ${parseInt(opp.qualification.budget.maxPrice).toLocaleString('pt-PT')} €`
                    : 'A definir'
                  }
                </span>
              </div>
            )}

            {/* Locations */}
            {opp.qualification.requirements?.preferredLocations?.length > 0 && (
              <div className="flex items-start justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  Localização
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                  {opp.qualification.requirements.preferredLocations.slice(0, 3).map((loc, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {loc}
                    </span>
                  ))}
                  {opp.qualification.requirements.preferredLocations.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{opp.qualification.requirements.preferredLocations.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Urgency */}
            {urgency && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Urgência
                </div>
                <span className={`text-xs px-2 py-1 rounded-full bg-${urgency.color}-100 text-${urgency.color}-800`}>
                  {urgency.label}
                </span>
              </div>
            )}

            {/* Property Type */}
            {opp.qualification.requirements?.propertyTypes?.length > 0 && (
              <div className="flex items-start justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <HomeModernIcon className="w-4 h-4 mr-2" />
                  Tipo
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-700">
                    {opp.qualification.requirements.propertyTypes[0] === 'house' ? 'Moradia' : 
                     opp.qualification.requirements.propertyTypes[0] === 'apartment' ? 'Apartamento' :
                     opp.qualification.requirements.propertyTypes[0]}
                  </span>
                </div>
              </div>
            )}

            {/* Bedrooms */}
            {opp.qualification.requirements?.bedrooms?.min && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Quartos
                </div>
                <span className="text-sm text-gray-700">
                  {opp.qualification.requirements.bedrooms.min}
                  {opp.qualification.requirements.bedrooms.max && 
                    opp.qualification.requirements.bedrooms.max !== opp.qualification.requirements.bedrooms.min &&
                    `-${opp.qualification.requirements.bedrooms.max}`
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
          <span>
            Criado {opp.createdAt ? new Date(opp.createdAt).toLocaleDateString('pt-PT') : 'N/A'}
          </span>
          <div className="flex items-center space-x-4">
            <span>{opp.stats?.totalDeals || 0} negócios</span>
            <span>{opp.stats?.propertiesViewed || 0} visitas</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Oportunidades</h1>
          <p className="text-gray-600 mt-2">Gestão de todas as oportunidades de compra e venda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.buyers}</p>
            <p className="text-sm text-gray-600">Compradores</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.sellers}</p>
            <p className="text-sm text-gray-600">Vendedores</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
            <p className="text-sm text-gray-600">Ativos</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-purple-600">{stats.scoreA}</p>
            <p className="text-sm text-gray-600">Score A</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            <p className="text-sm text-gray-600">Urgentes</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome, telefone ou localização..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtros
              <ChevronDownIcon className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Data de Criação</option>
                <option value="urgency">Urgência</option>
                <option value="score">Score</option>
                <option value="price">Preço</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowTrendingUpIcon className={`w-5 h-5 transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Reload Button */}
            <button
              onClick={loadOpportunities}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recarregar
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="buyer">Compradores</option>
                  <option value="seller">Vendedores</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  {OPPORTUNITY_STATUS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="A">Score A</option>
                  <option value="B">Score B</option>
                  <option value="C">Score C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                <select
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  {URGENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterStatus('all');
                    setFilterScore('all');
                    setFilterUrgency('all');
                    setSearchTerm('');
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-gray-900 mb-2">Erro ao carregar oportunidades</p>
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={loadOpportunities}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-900 mb-2">Nenhuma oportunidade encontrada</p>
            <p className="text-sm text-gray-600">
              {searchTerm || showFilters 
                ? 'Tente ajustar os filtros ou termo de pesquisa'
                : 'Crie oportunidades a partir das fichas de clientes'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map(renderOpportunityCard)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OpportunityList;