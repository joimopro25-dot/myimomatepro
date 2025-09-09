/**
 * LEAD LIST PAGE - MyImoMatePro
 * Página de listagem de leads com filtros e ações
 * 
 * Caminho: src/pages/LeadList.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_STATUS_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS,
    LEAD_TEMPERATURE_LABELS,
    getRelativeTime
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
    BellAlertIcon,
    ChevronRightIcon,
    TrashIcon,
    CheckCircleIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

const LeadListPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        leads,
        loading,
        errors,
        filters,
        searchTerm,
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
        fetchAlertLeads,
        deleteLead
    } = useLeads();

    // Estados locais
    const [showFilters, setShowFilters] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);

    // Carregar dados ao montar e quando voltar do formulário
    useEffect(() => {
        const loadData = async () => {
            await fetchLeads();
            await fetchStats();
            await fetchAlertLeads();
        };

        loadData();

        // Verificar se veio do formulário
        if (location.state?.fromForm) {
            // Limpar o state para não recarregar novamente
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Pesquisa com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchTerm !== searchTerm) {
                searchLeads(localSearchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearchTerm, searchTerm, searchLeads]);

    // Aplicar filtros
    const handleFilterChange = useCallback((filterType, value) => {
        setFilters({ [filterType]: value });
        fetchLeads();
    }, [setFilters, fetchLeads]);

    // Limpar todos os filtros
    const handleResetFilters = useCallback(() => {
        resetFilters();
        setLocalSearchTerm('');
        clearSearch();
        fetchLeads();
    }, [resetFilters, clearSearch, fetchLeads]);

    // Navegar para criar nova lead
    const handleCreateLead = () => {
        navigate('/leads/new');
    };

    // Navegar para detalhes da lead
    const handleViewLead = (leadId) => {
        navigate(`/leads/${leadId}`);
    };

    // Navegar para editar lead
    const handleEditLead = (leadId, e) => {
        e.stopPropagation();
        navigate(`/leads/${leadId}/edit`);
    };

    // Confirmar exclusão
    const handleDeleteClick = (lead, e) => {
        e.stopPropagation();
        setLeadToDelete(lead);
        setShowDeleteConfirm(true);
    };

    // Excluir lead
    const handleDeleteConfirm = async () => {
        if (leadToDelete) {
            try {
                await deleteLead(leadToDelete.id);
                setShowDeleteConfirm(false);
                setLeadToDelete(null);

                // Recarregar lista
                await fetchLeads();
                await fetchStats();
            } catch (error) {
                console.error('Erro ao excluir lead:', error);
            }
        }
    };

    // Recarregar dados
    const handleRefresh = async () => {
        await fetchLeads();
        await fetchStats();
        await fetchAlertLeads();
    };

    // Componente de temperatura
    const TemperatureIcon = ({ temperatura }) => {
        switch (temperatura) {
            case 'quente':
                return <FireIcon className="h-5 w-5 text-red-500" />;
            case 'morno':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'frio':
                return <Snowflake className="h-5 w-5 text-blue-500" />;
            default:
                return null;
        }
    };

    // Componente de status badge
    const StatusBadge = ({ status }) => {
        const colors = {
            novo: 'bg-blue-100 text-blue-800',
            contactado: 'bg-yellow-100 text-yellow-800',
            qualificado: 'bg-green-100 text-green-800',
            proposta: 'bg-purple-100 text-purple-800',
            negociacao: 'bg-orange-100 text-orange-800',
            ganho: 'bg-green-500 text-white',
            perdido: 'bg-red-100 text-red-800',
            standby: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {LEAD_STATUS_LABELS[status] || status}
            </span>
        );
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gerir e acompanhar potenciais clientes
                        </p>
                    </div>
                    <button
                        onClick={handleCreateLead}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Nova Lead
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Leads
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.total || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FireIcon className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Leads Quentes
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.porTemperatura?.quente || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BellAlertIcon className="h-6 w-6 text-yellow-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Alertas
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.alertas || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Taxa Conversão
                                        </dt>
                                        <dd className="text-lg font-semibold text-gray-900">
                                            {stats.taxaConversao || 0}%
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {alertLeads.length > 0 && showAlerts && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-yellow-700">
                                    Existem {alertLeads.length} leads que necessitam atenção
                                </p>
                                <div className="mt-2 text-sm">
                                    {alertLeads.slice(0, 3).map(lead => (
                                        <div key={lead.id} className="mt-1">
                                            <button
                                                onClick={() => handleViewLead(lead.id)}
                                                className="text-yellow-700 hover:text-yellow-600 font-medium"
                                            >
                                                {lead.name}
                                            </button>
                                            <span className="text-yellow-600 ml-2">
                                                - {lead.alerts[0]?.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setShowAlerts(false)}
                                    className="text-yellow-400 hover:text-yellow-500"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex items-center space-x-4">
                                {/* Pesquisa */}
                                <div className="max-w-xs flex-1">
                                    <label htmlFor="search" className="sr-only">
                                        Pesquisar
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="search"
                                            id="search"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Pesquisar leads..."
                                            value={localSearchTerm}
                                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <FunnelIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                    Filtros
                                    {Object.values(filters).filter(v => v).length > 0 && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {Object.values(filters).filter(v => v).length}
                                        </span>
                                    )}
                                </button>

                                {/* Alertas Toggle */}
                                {alertLeads.length > 0 && (
                                    <button
                                        onClick={() => setShowAlerts(!showAlerts)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <BellAlertIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                        Alertas
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {alertLeads.length}
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Refresh */}
                            <button
                                onClick={handleRefresh}
                                disabled={loading.list}
                                className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`h-4 w-4 ${loading.list ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Filtros Expandidos */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value || null)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Todos</option>
                                            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fonte */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fonte
                                        </label>
                                        <select
                                            value={filters.leadSource || ''}
                                            onChange={(e) => handleFilterChange('leadSource', e.target.value || null)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Todas</option>
                                            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Interesse */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Interesse
                                        </label>
                                        <select
                                            value={filters.interesse || ''}
                                            onChange={(e) => handleFilterChange('interesse', e.target.value || null)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Todos</option>
                                            {Object.entries(LEAD_INTEREST_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Temperatura */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Temperatura
                                        </label>
                                        <select
                                            value={filters.temperatura || ''}
                                            onChange={(e) => handleFilterChange('temperatura', e.target.value || null)}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        >
                                            <option value="">Todas</option>
                                            {Object.entries(LEAD_TEMPERATURE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Limpar Filtros */}
                                {Object.values(filters).filter(v => v).length > 0 && (
                                    <div className="mt-3">
                                        <button
                                            onClick={handleResetFilters}
                                            className="text-sm text-indigo-600 hover:text-indigo-500"
                                        >
                                            Limpar todos os filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lista de Leads */}
                    <div className="overflow-hidden">
                        {loading.list ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="text-center py-12">
                                <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sem leads</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comece por adicionar uma nova lead.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={handleCreateLead}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Nova Lead
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lead
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contacto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fonte
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Temperatura
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Último Contacto
                                        </th>
                                        <th className="relative px-6 py-3">
                                            <span className="sr-only">Ações</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleViewLead(lead.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {lead.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {LEAD_INTEREST_LABELS[lead.interesse]}
                                                        </div>
                                                    </div>
                                                    {lead.alerts?.length > 0 && (
                                                        <ExclamationTriangleIcon className="ml-2 h-4 w-4 text-yellow-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        {lead.phone}
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center mt-1">
                                                            <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                            {lead.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={lead.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {LEAD_SOURCE_LABELS[lead.leadSource]}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <TemperatureIcon temperatura={lead.temperatura} />
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        {LEAD_TEMPERATURE_LABELS[lead.temperatura]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {lead.ultimoContacto ?
                                                    getRelativeTime(lead.ultimoContacto) :
                                                    'Nunca contactado'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => handleEditLead(lead.id, e)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Editar"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(lead, e)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Eliminar"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Paginação */}
                    {leads.length > 0 && pagination.hasMore && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    A mostrar <span className="font-medium">{leads.length}</span> leads
                                </div>
                                <button
                                    onClick={() => fetchLeads({ loadMore: true })}
                                    disabled={loading.list}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Carregar mais
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de Confirmação de Exclusão */}
                {showDeleteConfirm && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Eliminar Lead
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Tem a certeza que deseja eliminar a lead <strong>{leadToDelete?.name}</strong>?
                                                    Esta ação não pode ser revertida.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleDeleteConfirm}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Eliminar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setLeadToDelete(null);
                                        }}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeadListPage;