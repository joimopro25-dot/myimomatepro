/**
 * CLIENT LIST PAGE - MyImoMatePro
 * Página principal de listagem e gestão de clientes
 * Integração completa com ClientContext e SubscriptionContext
 * CORREÇÃO: Adicionado import e uso do SubscriptionContext
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
// CORREÇÃO: Adicionado import do SubscriptionContext
import { useSubscription } from '../contexts/SubscriptionContext';
import { CLIENT_AVAILABLE_TAGS, CLIENT_MARITAL_STATUS } from '../models/clientModel';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    FunnelIcon,
    XMarkIcon,
    PhoneIcon,
    EnvelopeIcon,
    TagIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ChevronDownIcon,
    UserGroupIcon,
    HeartIcon,
    CurrencyEuroIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import {
    UserIcon as UserIconSolid,
    HeartIcon as HeartIconSolid,
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

const ClientListPage = () => {
    const navigate = useNavigate();

    // Context do Cliente
    const {
        // Estado
        clients,
        stats,
        loading,
        errors,
        pagination,
        filters,
        searchTerm,
        searchResults,
        isSearching,
        hasSearchResults,

        // Actions
        fetchClients,
        fetchStats,
        setSearchTerm,
        setFilters,
        clearSearch,
        updateClientTags,
        deactivateClient,
        clearError
    } = useClients();

    // CORREÇÃO: Context da Subscrição
    const {
        subscription,
        isClientLimitReached
    } = useSubscription();

    // Estados locais da interface
    const [showFilters, setShowFilters] = useState(false);
    const [selectedClients, setSelectedClients] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // Carregar dados iniciais
    useEffect(() => {
        fetchStats().catch(console.error);
    }, [fetchStats]);

    // Lista de clientes a mostrar (busca ou lista normal)
    const displayClients = useMemo(() => {
        if (isSearching && hasSearchResults) {
            return searchResults;
        }
        return clients;
    }, [isSearching, hasSearchResults, searchResults, clients]);

    // Filtros aplicados
    const activeFiltersCount = useMemo(() => {
        return Object.values(filters).filter(value => value !== 'all').length;
    }, [filters]);

    // Handlers
    const handleSelectClient = (clientId) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const handleSelectAll = () => {
        if (selectedClients.length === displayClients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(displayClients.map(client => client.id));
        }
    };

    const handleDeactivateClient = async (clientId) => {
        if (window.confirm('Tem a certeza que deseja desativar este cliente?')) {
            try {
                await deactivateClient(clientId);
                setSelectedClients(prev => prev.filter(id => id !== clientId));
            } catch (error) {
                console.error('Erro ao desativar cliente:', error);
            }
        }
    };

    const handleUpdateTags = async (clientId, newTags) => {
        try {
            await updateClientTags(clientId, newTags);
        } catch (error) {
            console.error('Erro ao atualizar tags:', error);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setSelectedClients([]);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setSelectedClients([]);
    };

    // CORREÇÃO: Verificar se pode adicionar cliente
    const canAddClient = !subscription || !isClientLimitReached();

    // Component para renderizar cliente
    const ClientCard = ({ client }) => (
        <div key={client.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Header do cartão */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIconSolid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {client.phone && (
                                <div className="flex items-center space-x-1">
                                    <PhoneIcon className="w-4 h-4" />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                            {client.email && (
                                <div className="flex items-center space-x-1">
                                    <EnvelopeIcon className="w-4 h-4" />
                                    <span>{client.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Checkbox de seleção */}
                <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleSelectClient(client.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
            </div>

            {/* Estado Civil e Documentos */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    {client.maritalStatus === 'married' && (
                        <HeartIconSolid className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600 capitalize">
                        {CLIENT_MARITAL_STATUS[client.maritalStatus] || client.maritalStatus}
                    </span>
                </div>

                {client.documents?.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <DocumentIcon className="w-4 h-4" />
                        <span>{client.documents.length} docs</span>
                    </div>
                )}
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {client.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className={`px-2 py-1 text-xs font-medium rounded-full ${tag === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                                    tag === 'Urgente' ? 'bg-red-100 text-red-800' :
                                        tag === 'Investidor' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {tag}
                        </span>
                    ))}
                    {client.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            +{client.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Informações Financeiras */}
            {client.financial?.totalHouseholdIncome && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <CurrencyEuroIcon className="w-4 h-4" />
                    <span>Rendimento: €{parseFloat(client.financial.totalHouseholdIncome).toLocaleString()}/mês</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Criado em {new Date(client.createdAt?.toDate()).toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeactivateClient(client.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Desativar"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Loading state
    if (loading.list && clients.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                            <p className="text-gray-600">Gerir a sua carteira de clientes</p>
                        </div>

                        {/* Botão Adicionar Cliente */}
                        {canAddClient ? (
                            <Link
                                to="/clients/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Novo Cliente
                            </Link>
                        ) : (
                            <div className="text-right">
                                <p className="text-sm text-red-600 font-medium">
                                    Limite de clientes atingido
                                </p>
                                <p className="text-xs text-gray-500">
                                    {stats?.totalClientes || 0}/{subscription?.limiteClientes || 0} clientes
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Barra de Busca e Filtros */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Busca */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar clientes..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            handleSearch('');
                                            clearSearch();
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${showFilters || activeFiltersCount > 0
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <FunnelIcon className="w-4 h-4" />
                                <span>Filtros</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Painel de Filtros */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Filtro por Tag */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                                    <select
                                        value={filters.tag}
                                        onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">Todas as tags</option>
                                        {CLIENT_AVAILABLE_TAGS.map((tag) => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Estado Civil */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                                    <select
                                        value={filters.maritalStatus}
                                        onChange={(e) => handleFilterChange({ ...filters, maritalStatus: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">Todos</option>
                                        {Object.entries(CLIENT_MARITAL_STATUS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <select
                                        value={filters.hasEmail}
                                        onChange={(e) => handleFilterChange({ ...filters, hasEmail: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="yes">Com email</option>
                                        <option value="no">Sem email</option>
                                    </select>
                                </div>

                                {/* Filtro por Info Financeira */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Info. Financeira</label>
                                    <select
                                        value={filters.hasFinancialInfo}
                                        onChange={(e) => handleFilterChange({ ...filters, hasFinancialInfo: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="yes">Com info financeira</option>
                                        <option value="no">Sem info financeira</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botão Limpar Filtros */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => handleFilterChange({
                                            tag: 'all',
                                            maritalStatus: 'all',
                                            hasEmail: 'all',
                                            hasFinancialInfo: 'all'
                                        })}
                                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                                    >
                                        Limpar todos os filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Estatísticas e Cabeçalho da Lista */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {isSearching ? 'Resultados da Busca' : 'Todos os Clientes'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {isSearching
                                        ? `${searchResults.length} resultado(s) para "${searchTerm}"`
                                        : `${displayClients.length} cliente(s) encontrado(s)`
                                    }
                                </p>
                            </div>

                            {selectedClients.length > 0 && (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600">
                                        {selectedClients.length} selecionado(s)
                                    </span>
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        {selectedClients.length === displayClients.length ? 'Deselecionar Todos' : 'Selecionar Todos'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid de Clientes */}
                    <div className="p-6">
                        {displayClients.length === 0 ? (
                            <div className="text-center py-12">
                                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {isSearching ? 'Nenhum resultado encontrado' : 'Nenhum cliente encontrado'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {isSearching
                                        ? 'Tente ajustar os termos de busca ou filtros'
                                        : 'Comece por adicionar o seu primeiro cliente'
                                    }
                                </p>
                                {!isSearching && (
                                    <div>
                                        {canAddClient ? (
                                            <Link
                                                to="/clients/new"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                Adicionar Primeiro Cliente
                                            </Link>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-red-600 mb-4 font-medium">
                                                    Limite de clientes atingido ({stats?.totalClientes || 0}/{subscription?.limiteClientes || 0})
                                                </p>
                                                <button
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                                                    onClick={() => alert('Redirecionamento para upgrade de plano em breve!')}
                                                >
                                                    Fazer Upgrade do Plano
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayClients.map((client) => (
                                    <ClientCard key={client.id} client={client} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Paginação */}
                    {pagination.hasMore && (
                        <div className="p-6 border-t border-gray-100 text-center">
                            <button
                                onClick={() => fetchClients({ loadMore: true })}
                                disabled={loading.list}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.list ? 'Carregando...' : 'Carregar Mais'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientListPage;