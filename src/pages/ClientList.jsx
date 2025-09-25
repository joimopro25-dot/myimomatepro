/**
 * CLIENT LIST PAGE - MyImoMatePro COM DEBUG EXTENSIVO
 * Página principal de listagem e gestão de clientes
 * ADICIONADO: Debug completo para identificar problema da lista vazia
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CLIENT_AVAILABLE_TAGS, CLIENT_MARITAL_STATUS } from '../models/clientModel';
import Layout from '../components/Layout';
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

    // ✅ CORREÇÃO: Variável para controlar se já carregamos os dados iniciais
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

    // ✅ CORREÇÃO: Carregar dados iniciais apenas UMA VEZ + DEBUG
    useEffect(() => {
        const loadInitialData = async () => {
            // Verificar se já carregamos os dados
            if (initialLoadRef.current) return;

            console.log('🔄 ClientList: Carregando dados iniciais...');
            initialLoadRef.current = true;

            try {
                // Carregar estatísticas e clientes
                await Promise.all([
                    fetchStats(),
                    fetchClients()
                ]);

                console.log('✅ ClientList: Dados iniciais carregados com sucesso');
            } catch (error) {
                console.error('❌ ClientList: Erro ao carregar dados iniciais:', error);
            }
        };

        loadInitialData();
    }, []); // ✅ DEPENDÊNCIAS VAZIAS - só executa no mount

    // ✅ ADICIONAR DEBUG PARA OS DADOS DO CONTEXTO
    useEffect(() => {
        console.log('🐛 ClientList DEBUG - Estado do contexto:', {
            clients: clients,
            clientsLength: clients?.length || 0,
            clientsArray: Array.isArray(clients),
            clientsUndefined: clients === undefined,
            clientsNull: clients === null,
            searchResults: searchResults,
            searchResultsLength: searchResults?.length || 0,
            isSearching,
            hasSearchResults,
            stats: stats,
            statsTotal: stats?.total,
            loading: loading,
            errors: errors
        });

        // Debug específico dos clientes
        if (clients && Array.isArray(clients)) {
            console.log('🐛 ClientList DEBUG - Primeiros 3 clientes:',
                clients.slice(0, 3).map(c => ({
                    id: c?.id,
                    name: c?.name,
                    hasValidId: !!c?.id
                }))
            );
        }
    }, [clients, searchResults, isSearching, hasSearchResults, stats, loading, errors]);

    // Lista de clientes a mostrar (busca ou lista normal) + DEBUG
    const displayClients = useMemo(() => {
        console.log('🐛 ClientList DEBUG - Calculando displayClients:', {
            isSearching,
            hasSearchResults,
            searchResults: searchResults?.length || 0,
            clients: clients?.length || 0,
            clientsType: typeof clients,
            clientsIsArray: Array.isArray(clients),
            clientsUndefined: clients === undefined,
            clientsNull: clients === null
        });

        let result;
        if (isSearching && hasSearchResults) {
            console.log('🐛 ClientList DEBUG - Usando searchResults:', searchResults);
            result = searchResults || [];
        } else {
            console.log('🐛 ClientList DEBUG - Usando clients:', clients);
            result = clients || [];
        }

        console.log('🐛 ClientList DEBUG - Resultado displayClients:', {
            length: result?.length || 0,
            isArray: Array.isArray(result),
            resultado: result
        });

        return result;
    }, [isSearching, hasSearchResults, searchResults, clients]);

    // ✅ ADICIONAR DEBUG PARA displayClients
    useEffect(() => {
        console.log('🐛 ClientList DEBUG - displayClients alterado:', {
            displayClients: displayClients,
            length: displayClients?.length || 0,
            isArray: Array.isArray(displayClients),
            isUndefined: displayClients === undefined,
            isNull: displayClients === null,
            firstThree: displayClients?.slice(0, 3)?.map(c => ({ id: c?.id, name: c?.name })) || []
        });
    }, [displayClients]);

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

    // ✅ CORREÇÃO: Component para renderizar cliente com key correta + DEBUG
    const ClientCard = ({ client }) => {
        // Verificar se client existe e tem ID válido
        if (!client || !client.id) {
            console.warn('🐛 ClientCard: Cliente inválido recebido:', client);
            return null;
        }

        console.log('🐛 ClientCard: Renderizando cliente válido:', { id: client.id, name: client.name });

        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                {/* Header do cartão */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIconSolid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{client.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {client.phone && (
                                    <div className="flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-1" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                                        <span>{client.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tags especiais */}
                    <div className="flex space-x-1">
                        {client.tags?.includes('VIP') && (
                            <StarIconSolid className="w-5 h-5 text-yellow-500" title="Cliente VIP" />
                        )}
                        {client.tags?.includes('Urgente') && (
                            <div className="w-3 h-3 bg-red-500 rounded-full" title="Urgente" />
                        )}
                        {['married', 'union'].includes(client.maritalStatus) && (
                            <HeartIconSolid className="w-5 h-5 text-pink-500" title="Casado/União de facto" />
                        )}
                    </div>
                </div>

                {/* Informações adicionais */}
                <div className="space-y-2 mb-4">
                    {client.profession && (
                        <div className="flex items-center text-sm text-gray-600">
                            <DocumentIcon className="w-4 h-4 mr-2" />
                            <span>{client.profession}</span>
                        </div>
                    )}
                    {client.financial?.monthlyIncome && (
                        <div className="flex items-center text-sm text-gray-600">
                            <CurrencyEuroIcon className="w-4 h-4 mr-2" />
                            <span>Rendimento: €{client.financial.monthlyIncome}</span>
                        </div>
                    )}
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {client.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={`${client.id}-tag-${index}`}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                                {CLIENT_AVAILABLE_TAGS[tag] || tag}
                            </span>
                        ))}
                        {client.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{client.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Ações do cartão */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Ver detalhes"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => handleDeactivateClient(client.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Desativar"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Loading state inicial
    if (loading.list && (!clients || clients.length === 0)) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando clientes...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // ✅ DEBUG DA RENDERIZAÇÃO CONDICIONAL
    const shouldShowEmptyState = displayClients?.length === 0;
    console.log('🐛 ClientList DEBUG - Renderização condicional:', {
        shouldShowEmptyState,
        displayClientsLength: displayClients?.length,
        displayClientsIsArray: Array.isArray(displayClients),
        displayClientsValue: displayClients
    });

    return (
        <Layout>
            <div className="p-6">
                {/* Header com Botão Adicionar Cliente */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                        <p className="text-gray-600">Gerir a sua carteira de clientes</p>
                    </div>

                    {/* Botão Adicionar Cliente */}
                    {canAddClient ? (
                        <Link
                            to="/clients/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Novo Cliente
                        </Link>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Limite de clientes atingido</p>
                            <button className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                                Fazer Upgrade
                            </button>
                        </div>
                    )}
                </div>

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <UserGroupIcon className="w-8 h-8 text-blue-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <EnvelopeIcon className="w-8 h-8 text-green-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Com Email</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.withEmail}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <HeartIcon className="w-8 h-8 text-purple-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Casados</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.married}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center">
                                <StarIconSolid className="w-8 h-8 text-yellow-500" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">VIP</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.vipClients}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Barra de busca e filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center space-x-4">
                        {/* Campo de busca */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar clientes por nome, email, telefone..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Botão filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${activeFiltersCount > 0
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FunnelIcon className="w-5 h-5" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Painel de filtros */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Filtro por Tag */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                                    <select
                                        value={filters.tag}
                                        onChange={(e) => handleFilterChange({ ...filters, tag: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todas as tags</option>
                                        {Object.entries(CLIENT_AVAILABLE_TAGS).map(([key, value]) => (
                                            <option key={key} value={key}>{value}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Estado Civil */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tem Email</label>
                                    <select
                                        value={filters.hasEmail}
                                        onChange={(e) => handleFilterChange({ ...filters, hasEmail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </select>
                                </div>

                                {/* Filtro por Info Financeira */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Info Financeira</label>
                                    <select
                                        value={filters.hasFinancialInfo}
                                        onChange={(e) => handleFilterChange({ ...filters, hasFinancialInfo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Todos</option>
                                        <option value="true">Sim</option>
                                        <option value="false">Não</option>
                                    </select>
                                </div>
                            </div>

                            {/* Botão limpar filtros */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleFilterChange({
                                            tag: 'all',
                                            maritalStatus: 'all',
                                            hasEmail: 'all',
                                            hasFinancialInfo: 'all'
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Limpar todos os filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lista de Clientes */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Controles da lista */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    {displayClients?.length || 0} {(displayClients?.length || 0) === 1 ? 'cliente' : 'clientes'}
                                    {isSearching && hasSearchResults && ` encontrado${(displayClients?.length || 0) === 1 ? '' : 's'}`}
                                </span>

                                {selectedClients.length > 0 && (
                                    <span className="text-sm text-blue-600 font-medium">
                                        {selectedClients.length} selecionado{selectedClients.length === 1 ? '' : 's'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Seleção múltipla */}
                                {displayClients?.length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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

                    {/* Conteúdo da lista - COM DEBUG EXTENSIVO */}
                    <div className="p-6">
                        {console.log('🐛 ClientList DEBUG - Antes da renderização condicional:', {
                            shouldShowEmptyState,
                            displayClients,
                            displayClientsLength: displayClients?.length
                        })}

                        {shouldShowEmptyState ? (
                            <div className="text-center py-12">
                                {console.log('🐛 ClientList DEBUG - Renderizando estado vazio')}
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
                                {console.log('🐛 ClientList DEBUG - Renderizando lista de clientes:', displayClients)}
                                {displayClients.map((client, index) => {
                                    console.log(`🐛 ClientList DEBUG - Renderizando cliente ${index}:`, client);
                                    return (
                                        <ClientCard key={client.id} client={client} />
                                    );
                                })}
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
                                {loading.list ? 'Carregando...' : 'Carregar Mais'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ClientListPage;