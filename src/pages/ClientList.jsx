/**
 * CLIENT LIST PAGE - MyImoMatePro
 * Displays all clients for the authenticated consultant
 * Features: Search, filters, quick actions, activity logging
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  UserGroupIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatPhone, calculateAge, ACTIVITY_TYPES } from '../models/clientModel';

export default function ClientList() {
  const navigate = useNavigate();
  const { 
    clients, 
    stats, 
    loading, 
    error, 
    deleteClient, 
    logActivity,
    clearError 
  } = useClients();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Quick activity logging state
  const [quickActivity, setQuickActivity] = useState({ clientId: null, type: null });

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.phone?.includes(term) ||
        client.nif?.includes(term) ||
        client.city?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(client => client.status === filterStatus);
    }

    // Tag filter
    if (filterTag !== 'all') {
      result = result.filter(client => client.tags?.includes(filterTag));
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'nextContact':
          const dateA = a.nextContactDate ? new Date(a.nextContactDate) : new Date('2099-12-31');
          const dateB = b.nextContactDate ? new Date(b.nextContactDate) : new Date('2099-12-31');
          return dateA - dateB;
        default:
          return 0;
      }
    });

    return result;
  }, [clients, searchTerm, filterStatus, filterTag, sortBy]);

  // Handle delete
  const handleDelete = async (clientId) => {
    try {
      await deleteClient(clientId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Quick activity logging
  const handleQuickActivity = async (clientId, type) => {
    try {
      await logActivity(clientId, type, `Quick ${ACTIVITY_TYPES[type].label}`);
      setQuickActivity({ clientId, type });
      
      // Show success feedback for 2 seconds
      setTimeout(() => {
        setQuickActivity({ clientId: null, type: null });
      }, 2000);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Open WhatsApp
  const openWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800'
    };
    return styles[status] || styles.inactive;
  };

  // Get tag badge style
  const getTagBadge = (tag) => {
    if (tag === 'Hot Lead') return 'bg-red-100 text-red-800';
    if (tag === 'Investor') return 'bg-purple-100 text-purple-800';
    if (tag === 'First-time Buyer') return 'bg-blue-100 text-blue-800';
    if (tag === 'Cash Buyer') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Check if contact is due
  const isContactDue = (nextContactDate) => {
    if (!nextContactDate) return false;
    const next = new Date(nextContactDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return next <= today;
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600 mt-1">
                Gerir a sua carteira de clientes
              </p>
            </div>
            <Link
              to="/clients/new"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Novo Cliente</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clientes Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Leads Quentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.hotLeads}</p>
              </div>
              <FireIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Novos este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyNewClients}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-500" />
            </div>
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
                  placeholder="Pesquisar por nome, email, telefone ou NIF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filtros</span>
              {(filterStatus !== 'all' || filterTag !== 'all') && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Activos
                </span>
              )}
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inativos</option>
                  <option value="archived">Arquivados</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="Hot Lead">Leads Quentes</option>
                  <option value="Investor">Investidores</option>
                  <option value="First-time Buyer">Primeira Casa</option>
                  <option value="Cash Buyer">Comprador Cash</option>
                  <option value="Pre-approved">Pré-aprovado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="name">Nome A-Z</option>
                  <option value="nextContact">Próximo Contacto</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">A carregar clientes...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' || filterTag !== 'all'
                  ? 'Nenhum cliente encontrado com os filtros aplicados'
                  : 'Ainda não tem clientes'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterTag === 'all' && (
                <Link
                  to="/clients/new"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar Primeiro Cliente
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próximo Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações Rápidas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            NIF: {client.nif || 'N/A'}
                          </div>
                          {client.spouse?.name && (
                            <div className="text-xs text-gray-400 mt-1">
                              Cônjuge: {client.spouse.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{formatPhone(client.phone)}</div>
                          {client.email && (
                            <div className="text-gray-500">{client.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(client.status || 'active')}`}>
                          {client.status === 'active' ? 'Activo' : 
                           client.status === 'inactive' ? 'Inativo' : 'Arquivado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {client.tags?.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTagBadge(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {client.tags?.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              +{client.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.nextContactDate ? (
                          <div className={`text-sm ${isContactDue(client.nextContactDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {new Date(client.nextContactDate).toLocaleDateString('pt-PT')}
                            {isContactDue(client.nextContactDate) && (
                              <span className="block text-xs">Atrasado</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuickActivity(client.id, 'call')}
                            className={`p-1.5 rounded-lg transition-all ${
                              quickActivity.clientId === client.id && quickActivity.type === 'call'
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Registar Chamada"
                          >
                            <PhoneIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickActivity(client.id, 'email')}
                            className={`p-1.5 rounded-lg transition-all ${
                              quickActivity.clientId === client.id && quickActivity.type === 'email'
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title="Registar Email"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openWhatsApp(client.phone)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                            title="Abrir WhatsApp"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/clients/${client.id}`}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                            title="Ver Detalhes"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/clients/${client.id}/edit`}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                            title="Editar"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(client.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}