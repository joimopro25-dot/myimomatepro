/**
 * CLIENT LIST PAGE - MyImoMatePro
 * Página principal de listagem e gestão de clientes
 * Integração completa com ClientContext
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
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
    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    const handleClearSearch = () => {
        clearSearch();
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);

        // Recarregar lista com novos filtros
        fetchClients({ filters: newFilters });
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            tag: 'all',
            maritalStatus: 'all',
            hasEmail: 'all',
            hasFinancialInfo: 'all'
        };
        setFilters(clearedFilters);
        fetchClients({ filters: clearedFilters });
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && !loading.list) {
            fetchClients({ loadMore: true });
        }
    };

    const handleClientSelect = (clientId) => {
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

    const handleTagUpdate = async (clientId, newTags) => {
        try {
            await updateClientTags(clientId, newTags);
        } catch (error) {
            console.error('Erro ao atualizar tags:', error);
        }
    };

    const handleDeactivateClient = async (clientId) => {
        if (window.confirm('Tem certeza que deseja desativar este cliente?')) {
            try {
                await deactivateClient(clientId);
            } catch (error) {
                console.error('Erro ao desativar cliente:', error);
            }
        }
    };

    // Componente de estatísticas
    const StatsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <UserGroupIcon className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Com Email</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.withEmail || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                        <EnvelopeIcon className="w-6 h-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">VIP</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.vipClients || 0}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                        <StarIconSolid className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Casados</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.married || 0}</p>
                    </div>
                    <div className="p-3 bg-pink-100 rounded-lg">
                        <HeartIconSolid className="w-6 h-6 text-pink-600" />
                    </div>
                </div>
            </div>
        </div>
    );

    // Componente de busca e filtros
    const SearchAndFilters = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Busca */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchTerm && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    {/* Botão Filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${showFilters || activeFiltersCount > 0
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <FunnelIcon className="w-5 h-5" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Botão Novo Cliente */}
                    <Link
                        to="/clients/new"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Novo Cliente
                    </Link>
                </div>
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Filtro por Tag */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                            <select
                                value={filters.tag}
                                onChange={(e) => handleFilterChange('tag', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todas as tags</option>
                                {CLIENT_AVAILABLE_TAGS.map(tag => (
                                    <option key={tag} value={tag}>{tag}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Estado Civil */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                            <select
                                value={filters.maritalStatus}
                                onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos</option>
                                {CLIENT_MARITAL_STATUS.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <select
                                value={filters.hasEmail}
                                onChange={(e) => handleFilterChange('hasEmail', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Todos</option>
                                <option value="yes">Com email</option>
                                <option value="no">Sem email</option>
                            </select>
                        </div>

                        {/* Botão Limpar Filtros */}
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Componente de card do cliente
    const ClientCard = ({ client }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <UserIconSolid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500">
                            {client.maritalStatus === 'married' && (
                                <span className="inline-flex items-center">
                                    <HeartIcon className="w-4 h-4 mr-1" />
                                    Casado(a)
                                </span>
                            )}
                            {client.maritalStatus === 'single' && 'Solteiro(a)'}
                            {client.maritalStatus === 'union' && 'União de Facto'}
                            {client.maritalStatus === 'divorced' && 'Divorciado(a)'}
                            {client.maritalStatus === 'widowed' && 'Viúvo(a)'}
                        </p>
                    </div>
                </div>

                {/* Checkbox de seleção */}
                <input
                    type="checkbox"
                    checked={selectedClients.includes(client.id)}
                    onChange={() => handleClientSelect(client.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
            </div>

            {/* Informações de Contacto */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{client.phone}</span>
                </div>
                {client.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <EnvelopeIcon className="w-4 h-4" />
                        <span>{client.email}</span>
                    </div>
                )}
                {client.profession && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DocumentIcon className="w-4 h-4" />
                        <span>{client.profession}</span>
                    </div>
                )}
            </div>

            {/* Tags */}
            {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {client.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag}
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                            <p className="text-sm text-gray-600">
                                Gerir a sua carteira de clientes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Estatísticas */}
                {loading.stats ? (
                    <div className="mb-8">
                        <div className="animate-pulse grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="h-16 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <StatsCards />
                )}

                {/* Busca e Filtros */}
                <SearchAndFilters />

                {/* Resultados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {/* Header dos Resultados */}
                    <div className="p-6 border-b border-gray-200">
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
                                    <Link
                                        to="/clients/new"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        Adicionar Primeiro Cliente
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {displayClients.map(client => (
                                        <ClientCard key={client.id} client={client} />
                                    ))}
                                </div>

                                {/* Load More */}
                                {pagination.hasMore && !isSearching && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loading.list}
                                            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                        >
                                            {loading.list ? 'Carregando...' : 'Carregar Mais'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientListPage;