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
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    FireIcon,
    ClockIcon,
    UserPlusIcon,
    PencilIcon,
    EyeIcon,
    XMarkIcon,
    ArrowPathIcon,
    BellAlertIcon
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
                icon: Snowflake,
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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {isSearching ? (
                                `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`
                            ) : (
                                `${leads.length} lead${leads.length !== 1 ? 's' : ''} total`
                            )}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading.list || loading.stats}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowPathIcon className={`w-4 h-4 mr-2 ${(loading.list || loading.stats) ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                        <button
                            onClick={() => setShowAlerts(!showAlerts)}
                            className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
                        >
                            <BellAlertIcon className="w-4 h-4 mr-2" />
                            Alertas ({alertLeads?.length || 0})
                        </button>
                        <button
                            onClick={() => navigate('/leads/new')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nova Lead
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <UserPlusIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Novas</p>
                                    <p className="text-lg font-semibold text-gray-900">{stats.nova || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <PhoneIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Contactadas</p>
                                    <p className="text-lg font-semibold text-gray-900">{stats.contactada || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Qualificadas</p>
                                    <p className="text-lg font-semibold text-gray-900">{stats.qualificada || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <FireIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Convertidas</p>
                                    <p className="text-lg font-semibold text-gray-900">{stats.convertida || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alertas */}
                {showAlerts && alertLeads && alertLeads.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-orange-800">Leads que requerem atenção</h3>
                            <button
                                onClick={() => setShowAlerts(false)}
                                className="text-orange-600 hover:text-orange-800"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {alertLeads.map((lead) => (
                                <div key={lead.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-orange-200">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{lead.nome}</p>
                                        <p className="text-xs text-gray-600">
                                            {lead.alertReason === 'no_contact' && 'Sem contacto há mais de 7 dias'}
                                            {lead.alertReason === 'overdue_task' && 'Tarefa em atraso'}
                                            {lead.alertReason === 'scheduled_contact' && 'Contacto agendado para hoje'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Ver
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Barra de Pesquisa e Filtros */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Pesquisa */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por nome, email, telefone..."
                                    value={localSearchTerm}
                                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                {(searchTerm || localSearchTerm) && (
                                    <button
                                        onClick={() => {
                                            setLocalSearchTerm('');
                                            clearSearch();
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Botão de Filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters
                                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FunnelIcon className="w-4 h-4 mr-2" />
                            Filtros
                        </button>
                    </div>

                    {/* Painel de Filtros */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) => handleFilterChange('status', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="nova">Nova</option>
                                        <option value="contactada">Contactada</option>
                                        <option value="qualificada">Qualificada</option>
                                        <option value="convertida">Convertida</option>
                                        <option value="perdida">Perdida</option>
                                    </select>
                                </div>

                                {/* Temperatura */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Temperatura</label>
                                    <select
                                        value={filters.temperatura || ''}
                                        onChange={(e) => handleFilterChange('temperatura', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todas</option>
                                        <option value="quente">Quente</option>
                                        <option value="morna">Morna</option>
                                        <option value="fria">Fria</option>
                                    </select>
                                </div>

                                {/* Fonte */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fonte</label>
                                    <select
                                        value={filters.leadSource || ''}
                                        onChange={(e) => handleFilterChange('leadSource', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todas</option>
                                        <option value="website">Website</option>
                                        <option value="referral">Referência</option>
                                        <option value="social_media">Redes Sociais</option>
                                        <option value="advertising">Publicidade</option>
                                        <option value="cold_call">Cold Call</option>
                                        <option value="event">Evento</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>

                                {/* Interesse */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Interesse</label>
                                    <select
                                        value={filters.interesse || ''}
                                        onChange={(e) => handleFilterChange('interesse', e.target.value || null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="comprar">Comprar</option>
                                        <option value="vender">Vender</option>
                                        <option value="investir">Investir</option>
                                        <option value="arrendar">Arrendar</option>
                                        <option value="avaliar">Avaliar</option>
                                    </select>
                                </div>
                            </div>

                            {/* Ações dos Filtros */}
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Limpar
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de Leads */}
                <div className="space-y-4">
                    {loading.list ? (
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
                                                        {lead.nome}
                                                    </h3>
                                                    {lead.email && (
                                                        <a
                                                            href={`mailto:${lead.email}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <EnvelopeIcon className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {lead.telefone && (
                                                        <a
                                                            href={`tel:${lead.telefone}`}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            <PhoneIcon className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>

                                                {lead.email && (
                                                    <p className="text-sm text-gray-600 mb-1">{lead.email}</p>
                                                )}
                                                {lead.telefone && (
                                                    <p className="text-sm text-gray-600">{lead.telefone}</p>
                                                )}
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
                                    <div className="ml-6 flex flex-col space-y-2">
                                        <button
                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <EyeIcon className="w-4 h-4 mr-1" />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4 mr-1" />
                                            Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Load More */}
                    {!loading.list && !isSearching && pagination.hasMore && (
                        <div className="text-center pt-6">
                            <button
                                onClick={handleLoadMore}
                                className="inline-flex items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Carregar mais leads
                            </button>
                        </div>
                    )}
                </div>

                {/* Erros */}
                {errors.list && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800">Erro ao carregar leads</h3>
                                <p className="text-sm text-red-700 mt-1">{errors.list}</p>
                                <button
                                    onClick={() => clearError('list')}
                                    className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium"
                                >
                                    Dispensar
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