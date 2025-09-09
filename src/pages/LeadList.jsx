/**
 * LEAD LIST PAGE - MyImoMatePro
 * Lista simplificada de leads com filtros e ações
 * Mostra clientes com badge PROSPECT
 * 
 * Caminho: src/pages/LeadList.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_TYPE_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_FUNNEL_LABELS,
    LEAD_FUNNEL_COLORS,
    formatCurrency,
    getFunnelProgress,
    getRelativeTime
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserIcon,
    TagIcon,
    ArrowRightIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChartBarIcon,
    DocumentTextIcon,
    HomeIcon,
    CurrencyEuroIcon,
    MapPinIcon,
    AdjustmentsHorizontalIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const LeadListPage = () => {
    const navigate = useNavigate();
    const {
        leads,
        loading,
        errors,
        filters,
        searchTerm,
        stats,
        fetchLeads,
        searchLeads,
        setFilters,
        resetFilters,
        deleteLead,
        convertLead,
        fetchStats
    } = useLeads();

    // Estados locais
    const [showFilters, setShowFilters] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [showConvertConfirm, setShowConvertConfirm] = useState(false);
    const [leadToConvert, setLeadToConvert] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Carregar dados ao montar
    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        await fetchLeads({ reset: true });
        await fetchStats();
    };

    // Pesquisar leads
    const handleSearch = (e) => {
        e.preventDefault();
        searchLeads(localSearchTerm);
    };

    // Limpar pesquisa
    const handleClearSearch = () => {
        setLocalSearchTerm('');
        searchLeads('');
    };

    // Aplicar filtro
    const handleFilterChange = (filterType, value) => {
        setFilters({
            ...filters,
            [filterType]: value === 'all' ? null : value
        });
    };

    // Limpar filtros
    const handleResetFilters = () => {
        resetFilters();
        setShowFilters(false);
    };

    // Confirmar exclusão
    const handleDeleteClick = (lead) => {
        setLeadToDelete(lead);
        setShowDeleteConfirm(true);
    };

    // Deletar lead
    const handleDeleteConfirm = async () => {
        if (!leadToDelete) return;

        try {
            await deleteLead(leadToDelete.id);
            setSuccessMessage('Lead excluída com sucesso');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao deletar lead:', error);
        } finally {
            setShowDeleteConfirm(false);
            setLeadToDelete(null);
        }
    };

    // Confirmar conversão
    const handleConvertClick = (lead) => {
        setLeadToConvert(lead);
        setShowConvertConfirm(true);
    };

    // Converter lead
    const handleConvertConfirm = async () => {
        if (!leadToConvert) return;

        try {
            await convertLead(leadToConvert.id);
            setSuccessMessage('Lead convertida com sucesso');
            setTimeout(() => setSuccessMessage(''), 3000);
            loadData();
        } catch (error) {
            console.error('Erro ao converter lead:', error);
        } finally {
            setShowConvertConfirm(false);
            setLeadToConvert(null);
        }
    };

    // Obter cor do badge por tipo
    const getTypeBadgeColor = (type) => {
        const colors = {
            comprador: 'bg-blue-100 text-blue-800',
            vendedor: 'bg-green-100 text-green-800',
            inquilino: 'bg-purple-100 text-purple-800',
            senhorio: 'bg-orange-100 text-orange-800',
            investidor: 'bg-yellow-100 text-yellow-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gestão de clientes prospect e qualificações
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/leads/new')}
                        className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nova Lead
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <ChartBarIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-xl font-semibold">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FunnelIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Entrada</p>
                                <p className="text-xl font-semibold">{stats.byFunnelState?.entrada || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Qualificando</p>
                                <p className="text-xl font-semibold">{stats.byFunnelState?.qualificando || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Convertidas</p>
                                <p className="text-xl font-semibold">{stats.byFunnelState?.convertido || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <ChartBarIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">Taxa Conv.</p>
                                <p className="text-xl font-semibold">{stats.conversionRate?.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensagem de sucesso */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {successMessage}
                    </div>
                )}

                {/* Barra de pesquisa e filtros */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={localSearchTerm}
                                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                                        placeholder="Pesquisar por nome, email, telefone..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    {localSearchTerm && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-3 top-2.5"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </form>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                                Filtros
                                {(filters.type || filters.source || filters.funnelState) && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        {Object.values(filters).filter(v => v).length}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={loadData}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${loading.list ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Filtros expandidos */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Lead
                                        </label>
                                        <select
                                            value={filters.type || 'all'}
                                            onChange={(e) => handleFilterChange('type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="all">Todos</option>
                                            {Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fonte
                                        </label>
                                        <select
                                            value={filters.source || 'all'}
                                            onChange={(e) => handleFilterChange('source', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="all">Todas</option>
                                            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estado do Funil
                                        </label>
                                        <select
                                            value={filters.funnelState || 'all'}
                                            onChange={(e) => handleFilterChange('funnelState', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="all">Todos</option>
                                            {Object.entries(LEAD_FUNNEL_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de leads */}
                    {loading.list ? (
                        <div className="p-8 text-center">
                            <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Carregando leads...</p>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="p-8 text-center">
                            <FunnelIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">Nenhuma lead encontrada</p>
                            <p className="text-sm text-gray-500">
                                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece criando sua primeira lead'}
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/leads/new')}
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-5 h-5 mr-2" />
                                    Criar Lead
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {leads.map((lead) => (
                                <div key={lead.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Cliente com badge PROSPECT */}
                                            <div className="flex items-center mb-2">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {lead.client?.name || 'Cliente não encontrado'}
                                                </h3>
                                                <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                                    PROSPECT
                                                </span>
                                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(lead.type)}`}>
                                                    {LEAD_TYPE_LABELS[lead.type]}
                                                </span>
                                            </div>

                                            {/* Contatos do cliente */}
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                {lead.client?.email && (
                                                    <div className="flex items-center">
                                                        <EnvelopeIcon className="w-4 h-4 mr-1" />
                                                        {lead.client.email}
                                                    </div>
                                                )}
                                                {lead.client?.phone && (
                                                    <div className="flex items-center">
                                                        <PhoneIcon className="w-4 h-4 mr-1" />
                                                        {lead.client.phone}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Informações de qualificação */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                {/* Fonte */}
                                                <div className="flex items-center text-gray-600">
                                                    <TagIcon className="w-4 h-4 mr-1" />
                                                    <span className="font-medium mr-1">Fonte:</span>
                                                    {LEAD_SOURCE_LABELS[lead.source]}
                                                </div>

                                                {/* Campos específicos por tipo */}
                                                {(lead.type === 'comprador' || lead.type === 'inquilino') && lead.qualification?.budget && (
                                                    <div className="flex items-center text-gray-600">
                                                        <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                                                        <span className="font-medium mr-1">Orçamento:</span>
                                                        {formatCurrency(lead.qualification.budget)}
                                                    </div>
                                                )}

                                                {(lead.type === 'vendedor' || lead.type === 'senhorio') && (
                                                    <>
                                                        {lead.qualification?.propertyLocation && (
                                                            <div className="flex items-center text-gray-600">
                                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                                <span className="font-medium mr-1">Local:</span>
                                                                {lead.qualification.propertyLocation}
                                                            </div>
                                                        )}
                                                        {lead.qualification?.askingPrice && (
                                                            <div className="flex items-center text-gray-600">
                                                                <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                                                                <span className="font-medium mr-1">Valor:</span>
                                                                {formatCurrency(lead.qualification.askingPrice)}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {lead.type === 'investidor' && (
                                                    <>
                                                        {lead.qualification?.investmentLocation && (
                                                            <div className="flex items-center text-gray-600">
                                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                                <span className="font-medium mr-1">Local:</span>
                                                                {lead.qualification.investmentLocation}
                                                            </div>
                                                        )}
                                                        {lead.qualification?.investmentBudget && (
                                                            <div className="flex items-center text-gray-600">
                                                                <CurrencyEuroIcon className="w-4 h-4 mr-1" />
                                                                <span className="font-medium mr-1">Investimento:</span>
                                                                {formatCurrency(lead.qualification.investmentBudget)}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Estado do funil */}
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${LEAD_FUNNEL_COLORS[lead.funnelState]}`}>
                                                        {LEAD_FUNNEL_LABELS[lead.funnelState]}
                                                    </span>
                                                    <div className="flex-1 max-w-xs">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${getFunnelProgress(lead.funnelState)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {getRelativeTime(lead.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => navigate(`/leads/${lead.id}/edit`)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>

                                            {lead.funnelState !== 'convertido' && (
                                                <button
                                                    onClick={() => handleConvertClick(lead)}
                                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                                    title="Converter"
                                                >
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteClick(lead)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                                title="Excluir"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal de confirmação de exclusão */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Confirmar Exclusão
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tem certeza que deseja excluir a lead de <strong>{leadToDelete?.client?.name}</strong>?
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setLeadToDelete(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmação de conversão */}
                {showConvertConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Converter Lead
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Converter a lead de <strong>{leadToConvert?.client?.name}</strong> em cliente ativo?
                                O badge PROSPECT será removido e a lead será marcada como convertida.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowConvertConfirm(false);
                                        setLeadToConvert(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConvertConfirm}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Converter
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