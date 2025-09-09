/**
 * LEAD LIST PAGE - MyImoMatePro
 * Página de listagem de leads com filtros e ações
 * 
 * Caminho: src/pages/LeadList.jsx
 * ✅ CORREÇÃO: Sincronização automática e detecção de mudanças
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation(); // ✅ ADICIONADO: Para detectar mudanças de navegação
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
    const [lastFilterChange, setLastFilterChange] = useState(Date.now()); // ✅ ADICIONADO: Controle de filtros

    // ✅ MELHORADO: useEffect principal - carregamento inicial e detecção de mudanças
    useEffect(() => {
        console.log('🔄 LeadList: Componente montado/atualizado');

        // Verificar se veio do formulário
        const fromForm = location.state?.fromForm;
        const action = location.state?.action;

        if (fromForm) {
            console.log(`✅ Voltou do formulário - Ação: ${action}`);

            // Limpar o state para não recarregar desnecessariamente
            navigate(location.pathname, { replace: true, state: {} });

            // Força recarregamento completo
            setTimeout(() => {
                console.log('🔄 Recarregando dados após voltar do formulário...');
                fetchLeads({ resetPagination: true });
                fetchStats();
            }, 100);
        } else {
            // Carregamento normal na montagem
            console.log('📊 Carregamento inicial de leads e estatísticas...');
            fetchLeads({ resetPagination: true });
        }

    }, [location.pathname, location.state?.fromForm]); // ✅ CORRIGIDO: Dependências específicas

    // ✅ MELHORADO: useEffect para mudanças nos filtros (com debounce)
    useEffect(() => {
        // Evitar recarregamento imediato na primeira montagem
        const timeSinceLastChange = Date.now() - lastFilterChange;
        if (timeSinceLastChange < 100) return;

        console.log('🔍 Filtros mudaram - recarregando leads...', filters);

        const timeoutId = setTimeout(() => {
            fetchLeads({ resetPagination: true });
        }, 300); // ✅ ADICIONADO: Debounce de 300ms

        return () => clearTimeout(timeoutId);
    }, [filters, fetchLeads]); // ✅ CORRIGIDO: Dependências adequadas

    // ✅ NOVO: useEffect para debug e feedback visual
    useEffect(() => {
        if (leads.length > 0) {
            console.log(`✅ Lista atualizada: ${leads.length} leads carregadas`);
        } else if (!loading.list && !loading.stats) {
            console.log('📭 Nenhuma lead encontrada');
        }
    }, [leads.length, loading.list, loading.stats]);

    // ✅ NOVO: useEffect para sincronização automática das estatísticas
    useEffect(() => {
        // Sincronizar estatísticas a cada 30 segundos (quando não está carregando)
        const statsInterval = setInterval(() => {
            if (!loading.stats && !loading.list && !document.hidden) {
                console.log('🔄 Sincronização automática de estatísticas...');
                fetchStats();
            }
        }, 30000); // 30 segundos

        // Cleanup
        return () => clearInterval(statsInterval);
    }, [loading.stats, loading.list, fetchStats]);

    // ✅ NOVO: useEffect para detectar quando há erro de carregamento
    useEffect(() => {
        if (errors.list) {
            console.error('❌ Erro ao carregar leads:', errors.list);

            // Tentar recarregar após 3 segundos em caso de erro
            const retryTimeout = setTimeout(() => {
                console.log('🔄 Tentando recarregar após erro...');
                clearError('list');
                fetchLeads({ resetPagination: true });
            }, 3000);

            return () => clearTimeout(retryTimeout);
        }
    }, [errors.list, clearError, fetchLeads]);

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

    // ✅ MELHORADO: Aplicar filtros com controle de timing
    const handleFilterChange = (key, value) => {
        setLastFilterChange(Date.now());
        setFilters({ [key]: value });
    };

    // Reset filtros
    const handleResetFilters = () => {
        setLastFilterChange(Date.now());
        resetFilters();
        setLocalSearchTerm('');
        clearSearch();
    };

    // ✅ MELHORADO: Refresh dados com limpeza de erros
    const handleRefresh = useCallback(() => {
        console.log('🔄 Refresh manual de dados...');

        // Limpar todos os erros
        Object.keys(errors).forEach(key => clearError(key));

        // Recarregar tudo
        fetchLeads({ resetPagination: true });
        fetchStats();
        fetchAlertLeads();
    }, [errors, clearError, fetchLeads, fetchStats, fetchAlertLeads]);

    // Obter badge de temperatura
    const getTemperatureBadge = (temperatura) => {
        const badges = {
            quente: {
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: FireIcon,
                label: 'Quente'
            },
            morna: {
                color: 'bg-orange-100 text-orange-700 border-orange-200',
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
        const IconComponent = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.color}`}>
                <IconComponent className="h-3 w-3" />
                {badge.label}
            </span>
        );
    };

    // Obter badge de status
    const getStatusBadge = (status) => {
        const badges = {
            novo: 'bg-green-100 text-green-700 border-green-200',
            contactado: 'bg-blue-100 text-blue-700 border-blue-200',
            qualificado: 'bg-purple-100 text-purple-700 border-purple-200',
            em_processo: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            convertido: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            perdido: 'bg-red-100 text-red-700 border-red-200',
            desqualificado: 'bg-gray-100 text-gray-700 border-gray-200'
        };

        const colorClass = badges[status] || badges.novo;

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
                {LEAD_STATUS_LABELS[status] || 'Novo'}
            </span>
        );
    };

    // Determinar quais leads mostrar
    const displayLeads = searchTerm ? searchResults : leads;

    // ✅ NOVO: Debug global para troubleshooting
    if (typeof window !== 'undefined') {
        window.debugLeadList = () => {
            console.log('🔍 Lead List Debug:', {
                leads: leads.length,
                displayLeads: displayLeads.length,
                stats,
                filters,
                loading,
                errors,
                pagination,
                searchTerm,
                location: location.pathname,
                locationState: location.state
            });
        };
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            {stats ? `${stats.total} leads total` : 'Carregando...'}
                            {/* ✅ ADICIONADO: Indicador de sincronização */}
                            {loading.stats && (
                                <span className="ml-2 text-xs text-blue-600">
                                    (sincronizando...)
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading.list || loading.stats}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            title="Atualizar dados" // ✅ ADICIONADO: Tooltip
                        >
                            <ArrowPathIcon className={`h-4 w-4 ${(loading.list || loading.stats) ? 'animate-spin' : ''}`} />
                            Atualizar
                        </button>
                        <button
                            onClick={() => navigate('/leads/new')}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Nova Lead
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserPlusIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Novas</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.novas || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <PhoneIcon className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Contactadas</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.contactadas || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Qualificadas</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.qualificadas || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-6 w-6 text-green-400">✓</div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Convertidas</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stats.convertidas || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alertas */}
                {alertLeads && alertLeads.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <BellAlertIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Alertas ({alertLeads.length})
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <button
                                        onClick={() => setShowAlerts(!showAlerts)}
                                        className="underline hover:text-yellow-900"
                                    >
                                        {showAlerts ? 'Ocultar' : 'Ver'} leads que precisam de atenção
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Barra de pesquisa e filtros */}
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Pesquisa */}
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Pesquisar por nome, email, telefone..."
                                        value={localSearchTerm}
                                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                                    />
                                    {localSearchTerm && (
                                        <button
                                            onClick={() => {
                                                setLocalSearchTerm('');
                                                clearSearch();
                                            }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Botão de filtros */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FunnelIcon className="h-4 w-4" />
                                Filtros
                            </button>
                        </div>

                        {/* Painel de filtros */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Filtro de Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        >
                                            <option value="all">Todos os status</option>
                                            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro de Fonte */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Fonte</label>
                                        <select
                                            value={filters.fonte}
                                            onChange={(e) => handleFilterChange('fonte', e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        >
                                            <option value="all">Todas as fontes</option>
                                            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro de Interesse */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Interesse</label>
                                        <select
                                            value={filters.interesse}
                                            onChange={(e) => handleFilterChange('interesse', e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        >
                                            <option value="all">Todos os interesses</option>
                                            {Object.entries(LEAD_INTEREST_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Filtro de Temperatura */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Temperatura</label>
                                        <select
                                            value={filters.temperatura}
                                            onChange={(e) => handleFilterChange('temperatura', e.target.value)}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        >
                                            <option value="all">Todas as temperaturas</option>
                                            <option value="quente">Quente</option>
                                            <option value="morna">Morna</option>
                                            <option value="fria">Fria</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Estado de carregamento */}
                {loading.list && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600">Carregando leads...</span>
                        </div>
                    </div>
                )}

                {/* Erro no carregamento */}
                {errors.list && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Erro ao carregar leads
                                </h3>
                                <p className="mt-2 text-sm text-red-700">{errors.list}</p>
                                <button
                                    onClick={() => {
                                        clearError('list');
                                        handleRefresh();
                                    }}
                                    className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de leads */}
                {!loading.list && displayLeads.length === 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="text-center py-12">
                            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? 'Nenhuma lead encontrada' : 'Ainda não há leads'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm
                                    ? 'Tente ajustar os critérios de pesquisa ou filtros.'
                                    : 'Comece por criar a sua primeira lead'
                                }
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/leads/new')}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Criar Primeira Lead
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Grid de leads */}
                {!loading.list && displayLeads.length > 0 && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {displayLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="focus:outline-none">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {lead.name || 'Nome não informado'}
                                                    </p>
                                                    {getTemperatureBadge(lead.temperatura)}
                                                </div>
                                                <div className="mt-2">
                                                    {getStatusBadge(lead.status)}
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                                    {lead.phone && (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                            <span className="truncate">{lead.phone}</span>
                                                        </div>
                                                    )}
                                                    {lead.email && (
                                                        <div className="flex items-center">
                                                            <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                            <span className="truncate">{lead.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        Score: {lead.score || 0}/100
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => navigate(`/leads/${lead.id}`)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Ver detalhes"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                                                            className="text-gray-600 hover:text-gray-900"
                                                            title="Editar lead"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load more */}
                            {pagination.hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading.list}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        Carregar mais
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeadListPage;