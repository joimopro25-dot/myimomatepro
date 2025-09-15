/**
 * CLIENT LIST PAGE - MyImoMatePro
 * Página principal de listagem e gestão de clientes
 * ✅ ATUALIZADO: Adicionado suporte para OpportunityBadges
 * 
 * Caminho: src/pages/ClientList.jsx
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CLIENT_AVAILABLE_TAGS, CLIENT_MARITAL_STATUS } from '../models/clientModel';
import Layout from '../components/Layout';
import OpportunityBadges from '../components/opportunities/OpportunityBadges';
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
    DocumentIcon,
    CalendarIcon,
    IdentificationIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import {
    UserIcon as UserIconSolid,
    HeartIcon as HeartIconSolid,
    StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

const ClientListPage = () => {
    const navigate = useNavigate();

    // Controlar carregamento inicial dos dados
    const initialLoadRef = useRef(false);

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

    // Context da Subscrição
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

    // Carregar dados iniciais apenas uma vez
    useEffect(() => {
        const loadInitialData = async () => {
            if (initialLoadRef.current) return;

            initialLoadRef.current = true;

            try {
                await Promise.all([
                    fetchStats(),
                    fetchClients()
                ]);
            } catch (error) {
                console.error('ClientList: Erro ao carregar dados iniciais:', error);
            }
        };

        loadInitialData();
    }, []);

    // Lista de clientes a mostrar (busca ou lista normal)
    const displayClients = useMemo(() => {
        let result;
        if (isSearching && hasSearchResults) {
            result = searchResults || [];
        } else {
            result = clients || [];
        }

        return result;
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

    // Verificar se pode adicionar cliente
    const canAddClient = !subscription || !isClientLimitReached();

    // Função auxiliar para obter ícone do estado civil
    const getMaritalStatusIcon = (status) => {
        switch (status) {
            case 'single': return '👤';
            case 'married': return '👫';
            case 'divorced': return '💔';
            case 'widowed': return '🕊️';
            default: return '👤';
        }
    };

    // Função para obter iniciais do nome
    const getInitials = (name) => {
        if (!name) return 'NN';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Formatar data
    const formatDate = (date) => {
        if (!date) return 'N/A';
        if (date.seconds) {
            return new Date(date.seconds * 1000).toLocaleDateString('pt-PT');
        }
        return new Date(date).toLocaleDateString('pt-PT');
    };

    // Component para renderizar cliente ATUALIZADO
    const ClientCard = ({ client }) => {
        if (!client || !client.id) {
            return null;
        }

        return (
            <div
                onClick={() => navigate(`/clients/${client.id}`)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                    {/* Header do cartão */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                {getInitials(client.name)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {client.name}
                                </h3>
                                {client.email && (
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <EnvelopeIcon className="w-3 h-3" />
                                        {client.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Ações do cartão */}
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/clients/${client.id}`);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Ver detalhes"
                            >
                                <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/clients/${client.id}/edit`);
                                }}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeactivateClient(client.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Desativar"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Informações de contacto */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {client.phone || 'Sem telefone'}
                        </div>

                        {client.nif && (
                            <div className="flex items-center text-sm text-gray-600">
                                <IdentificationIcon className="w-4 h-4 mr-2 text-gray-400" />
                                NIF: {client.nif}
                            </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                            <HeartIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {getMaritalStatusIcon(client.maritalStatus)} {CLIENT_MARITAL_STATUS[client.maritalStatus] || 'N/A'}
                        </div>
                    </div>

                    {/* ===== SECÇÃO DE OPORTUNIDADES ===== */}
                    <div className="pt-4 border-t border-gray-100">
                        <OpportunityBadges
                            clientId={client.id}
                            variant="compact"
                            showEmpty={true}
                            onAddClick={(e) => {
                                if (e) e.stopPropagation();
                                navigate(`/clients/${client.id}/opportunities/new`);
                            }}
                            onOpportunityClick={(opportunity) => {
                                navigate(`/clients/${client.id}/opportunities/${opportunity.id}`);
                            }}
                        />
                    </div>

                    {/* Info financeira (se existir) */}
                    {client.financial?.monthlyIncome && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Rendimento mensal:</span>
                                <span className="font-semibold text-gray-900">
                                    €{parseFloat(client.financial.monthlyIncome).toLocaleString('pt-PT')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {client.tags.slice(0, 2).map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                >
                                    <TagIcon className="w-3 h-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                            {client.tags.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                    +{client.tags.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer do cartão */}
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>Cliente desde {formatDate(client.createdAt)}</span>
                        <div className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleSelectClient(client.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Estado de lista vazia
    const shouldShowEmptyState = !loading.list && displayClients.length === 0;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header da página */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                        <p className="mt-2 text-gray-600">
                            Gerir a sua base de clientes
                        </p>
                    </div>
                    {canAddClient && (
                        <Link
                            to="/clients/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Novo Cliente
                        </Link>
                    )}
                </div>

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserGroupIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <EnvelopeIcon className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Com Email</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withEmail || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CurrencyEuroIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Info Financeira</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withFinancialInfo || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <HeartIconSolid className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Idade Média</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.avgAge || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Área de busca e filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Campo de busca */}
                            <div className="relative flex-1 max-w-md">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome, email, telefone ou NIF..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Controles de filtros e visualização */}
                            <div className="flex items-center gap-4">
                                {/* Botão de filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeFiltersCount > 0
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    Filtros
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>

                                {/* Seleção em massa */}
                                {displayClients.length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        {selectedClients.length === displayClients.length ? 'Deselecionar' : 'Selecionar'} todos
                                    </button>
                                )}

                                {/* Alternador de visualização */}
                                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1 text-sm ${viewMode === 'grid'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Grade
                                    </button>
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`px-3 py-1 text-sm ${viewMode === 'table'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Tabela
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Painel de Filtros */}
                    {showFilters && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Filtro por Tag */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tag
                                    </label>
                                    <select
                                        value={filters.tag}
                                        onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todas</option>
                                        {CLIENT_AVAILABLE_TAGS.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Estado Civil */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado Civil
                                    </label>
                                    <select
                                        value={filters.maritalStatus}
                                        onChange={(e) => handleFilterChange({ ...filters, maritalStatus: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos</option>
                                        {Object.entries(CLIENT_MARITAL_STATUS).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <select
                                        value={filters.hasEmail}
                                        onChange={(e) => handleFilterChange({ ...filters, hasEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="true">Com Email</option>
                                        <option value="false">Sem Email</option>
                                    </select>
                                </div>

                                {/* Filtro por Info Financeira */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Info Financeira
                                    </label>
                                    <select
                                        value={filters.hasFinancialInfo}
                                        onChange={(e) => handleFilterChange({ ...filters, hasFinancialInfo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="true">Com Info</option>
                                        <option value="false">Sem Info</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botão para limpar filtros */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleFilterChange({
                                            tag: 'all',
                                            maritalStatus: 'all',
                                            hasEmail: 'all',
                                            hasFinancialInfo: 'all'
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conteúdo da lista */}
                    <div className="p-6">
                        {loading.list || loading.search ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : shouldShowEmptyState ? (
                            <div className="text-center py-12">
                                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {isSearching ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {isSearching
                                        ? 'Tente ajustar os termos de busca ou filtros.'
                                        : 'Comece adicionando o seu primeiro cliente.'}
                                </p>

                                {!isSearching && canAddClient && (
                                    <Link
                                        to="/clients/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        Adicionar Primeiro Cliente
                                    </Link>
                                )}

                                {!canAddClient && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                                        <p className="text-yellow-800 mb-2">
                                            Limite de clientes atingido
                                        </p>
                                        <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                                            Fazer Upgrade do Plano
                                        </button>
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
                    {pagination?.hasMore && (
                        <div className="p-6 border-t border-gray-100 text-center">
                            <button
                                onClick={() => fetchClients({ loadMore: true })}
                                disabled={loading.list}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.list ? 'A carregar...' : 'Carregar mais'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Mensagens de erro */}
                {errors.list && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <XMarkIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800">{errors.list}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => clearError('list')}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ClientListPage;