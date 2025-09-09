/**
 * LEAD LIST PAGE - MyImoMatePro
 * Página de listagem de leads com filtros e ações
 * 
 * Caminho: src/pages/LeadList.jsx
 * Sem dados mock - apenas dados reais do Firestore
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_STATUS_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS
} from '../models/leadModel';
import Layout from '../components/Layout';

import {
    ArrowLeftIcon,
    PencilIcon,
    UserPlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FireIcon,
    PlusIcon,
    EyeIcon,
    DocumentTextIcon,
    TagIcon,
    BanknotesIcon,
    HomeIcon,
    IdentificationIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

const LeadListPage = () => {
    const navigate = useNavigate();
    const {
        leads,
        loading,
        errors,
        filters,
        searchTerm,
        searchResults,
        pagination,
        stats,
        alertLeads,
        fetchLeads,
        searchLeads,
        setFilters,
        resetFilters,
        clearSearch,
        clearError,
        fetchStats,
        fetchAlertLeads
    } = useLeads();

    // Estados locais
    const [showFilters, setShowFilters] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    // Carregar leads inicial
    useEffect(() => {
        fetchLeads({ resetPagination: true });
    }, [filters]);

    // Função de pesquisa com debounce
    const handleSearch = useCallback((term) => {
        setLocalSearchTerm(term);
        if (term.trim()) {
            searchLeads(term);
        } else {
            clearSearch();
        }
    }, [searchLeads, clearSearch]);

    // Debounce da pesquisa
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (localSearchTerm !== searchTerm) {
                handleSearch(localSearchTerm);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [localSearchTerm, searchTerm, handleSearch]);

    // Carregar mais leads
    const handleLoadMore = () => {
        if (!loading.list && pagination.hasMore) {
            fetchLeads();
        }
    };

    // Aplicar filtros
    const handleFilterChange = (key, value) => {
        setFilters({ [key]: value });
    };

    // Reset filtros
    const handleResetFilters = () => {
        resetFilters();
        setLocalSearchTerm('');
        clearSearch();
    };

    // Refresh dados
    const handleRefresh = () => {
        fetchLeads({ resetPagination: true });
        fetchStats();
        fetchAlertLeads();
    };

    // Obter badge de temperatura
    const getTemperatureBadge = (temperatura) => {
        const badges = {
            quente: {
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: FireIcon,
                label: 'Quente'
            },
            morna: {
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: ClockIcon,
                label: 'Morna'
            },
            fria: {
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: SnowflakeIcon,
                label: 'Fria'
            }
        };

        const badge = badges[temperatura] || badges.fria;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    // Obter badge de status
    const getStatusBadge = (status) => {
        const badges = {
            nova: 'bg-green-100 text-green-700 border-green-200',
            contactada: 'bg-blue-100 text-blue-700 border-blue-200',
            qualificada: 'bg-purple-100 text-purple-700 border-purple-200',
            convertida: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            perdida: 'bg-gray-100 text-gray-700 border-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badges[status] || badges.nova}`}>
                {LEAD_STATUS_LABELS[status] || status}
            </span>
        );
    };

    // Dados para exibição
    const displayLeads = searchTerm ? searchResults : leads;
    const isSearching = !!searchTerm;

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="text-gray-600 mt-1">
                            Gerir prospects e oportunidades de negócio
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Botão Alertas */}
                        {alertLeads && alertLeads.length > 0 && (
                            <button
                                onClick={() => setShowAlerts(!showAlerts)}
                                className="relative inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                <BellAlertIcon className="w-5 h-5 mr-2" />
                                Alertas
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {alertLeads.length}
                                </span>
                            </button>
                        )}

                        {/* Refresh */}
                        <button
                            onClick={handleRefresh}
                            disabled={loading.list}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading.list ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors ${showFilters
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                        >
                            <FunnelIcon className="w-5 h-5 mr-2" />
                            Filtros
                        </button>

                        {/* Nova Lead */}
                        <button
                            onClick={() => navigate('/leads/new')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nova Lead
                        </button>
                    </div>
                </div>

                {/* Alertas em destaque */}
                {showAlerts && alertLeads && alertLeads.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-red-800">
                                Leads que precisam de atenção
                            </h3>
                            <button
                                onClick={() => setShowAlerts(false)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {alertLeads.slice(0, 5).map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">{lead.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {lead.nextAction?.motivo || 'Sem contacto há vários dias'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getTemperatureBadge(lead.temperatura)}
                                        <button
                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                        >
                                            Ver Lead
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Leads</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.qualificadas}</div>
                            <div className="text-sm text-gray-600">Qualificadas</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.convertidas}</div>
                            <div className="text-sm text-gray-600">Convertidas</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.quentes}</div>
                            <div className="text-sm text-gray-600">Quentes</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.conversaoRate ? `${stats.conversaoRate.toFixed(1)}%` : '0%'}
                            </div>
                            <div className="text-sm text-gray-600">Taxa Conversão</div>
                        </div>
                    </div>
                )}

                {/* Barra de Pesquisa */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar leads..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {(searchTerm || localSearchTerm) && (
                            <button
                                onClick={() => {
                                    setLocalSearchTerm('');
                                    clearSearch();
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {isSearching && (
                        <p className="mt-2 text-sm text-gray-600">
                            {loading.search ? 'Pesquisando...' : `${searchResults.length} resultados encontrados`}
                        </p>
                    )}
                </div>

                {/* Painel de Filtros */}
                {showFilters && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todos</option>
                                    <option value="nova">Nova</option>
                                    <option value="contactada">Contactada</option>
                                    <option value="qualificada">Qualificada</option>
                                    <option value="convertida">Convertida</option>
                                    <option value="perdida">Perdida</option>
                                </select>
                            </div>

                            {/* Fonte */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fonte
                                </label>
                                <select
                                    value={filters.fonte}
                                    onChange={(e) => handleFilterChange('fonte', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todas</option>
                                    {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Interesse */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interesse
                                </label>
                                <select
                                    value={filters.interesse}
                                    onChange={(e) => handleFilterChange('interesse', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todos</option>
                                    {Object.entries(LEAD_INTEREST_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Temperatura */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Temperatura
                                </label>
                                <select
                                    value={filters.temperatura}
                                    onChange={(e) => handleFilterChange('temperatura', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todas</option>
                                    <option value="quente">Quente</option>
                                    <option value="morna">Morna</option>
                                    <option value="fria">Fria</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {displayLeads.length} leads encontradas
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Leads */}
                <div className="space-y-4">
                    {loading.list && displayLeads.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando leads...</p>
                        </div>
                    ) : displayLeads.length === 0 ? (
                        <div className="text-center py-12">
                            <UserPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {isSearching ? 'Nenhuma lead encontrada' : 'Ainda não há leads'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {isSearching
                                    ? 'Tente ajustar os termos de pesquisa ou filtros'
                                    : 'Comece por criar a sua primeira lead'
                                }
                            </p>
                            {!isSearching && (
                                <button
                                    onClick={() => navigate('/leads/new')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Criar Primeira Lead
                                </button>
                            )}
                        </div>
                    ) : (
                        displayLeads.map((lead) => (
                            <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Header da Lead */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {lead.name}
                                                    </h3>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                        PROSPECT
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    {lead.phone && (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="w-4 h-4 mr-1" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                    {lead.email && (
                                                        <div className="flex items-center">
                                                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                                                            {lead.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(lead.status)}
                                                {getTemperatureBadge(lead.temperatura)}
                                            </div>
                                        </div>

                                        {/* Informações da Lead */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interesse</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {LEAD_INTEREST_LABELS[lead.interesse] || lead.interesse}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fonte</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {LEAD_SOURCE_LABELS[lead.leadSource] || lead.leadSource}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Score</p>
                                                <div className="flex items-center">
                                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${lead.score || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {lead.score || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        {lead.descricao && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                                    {lead.descricao.length > 150
                                                        ? `${lead.descricao.substring(0, 150)}...`
                                                        : lead.descricao
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {/* Datas */}
                                        <div className="flex items-center space-x-6 text-xs text-gray-500">
                                            <div>
                                                Criada: {lead.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                                            </div>
                                            {lead.ultimoContacto && (
                                                <div>
                                                    Último contacto: {lead.ultimoContacto.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                                                </div>
                                            )}
                                            {lead.proximoContacto && (
                                                <div className="text-orange-600 font-medium">
                                                    Próximo: {lead.proximoContacto.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Ver detalhes"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                            title="Editar lead"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        {lead.status === 'qualificada' && (
                                            <button
                                                onClick={() => navigate(`/leads/${lead.id}/convert`)}
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Converter para cliente"
                                            >
                                                <UserPlusIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Botão Carregar Mais */}
                    {!isSearching && pagination.hasMore && (
                        <div className="text-center py-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading.list}
                                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
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

export default LeadListPage;