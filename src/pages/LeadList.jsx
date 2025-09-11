/**
 * LEAD LIST PAGE - MyImoMatePro
 * Lista de leads com filtros e busca
 * 
 * Caminho: src/pages/LeadList.jsx
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_STATUS,
    QUALIFICATION_TYPES,
    LEAD_SOURCES,
    URGENCY_LEVELS
} from '../models/leadModel';
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    ChevronRightIcon,
    FunnelIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    PencilIcon,
    TrashIcon,
    HomeIcon,
    CurrencyEuroIcon,
    KeyIcon,
    BuildingOfficeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

function LeadList() {
    const navigate = useNavigate();
    const {
        leads,
        loading,
        filters,
        searchTerm,
        stats,
        fetchLeads,
        searchLeads,
        applyFilters,
        changeLeadStatus,
        deleteLead
    } = useLeads();

    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);

    // Buscar leads ao montar o componente
    useEffect(() => {
        fetchLeads();
    }, [filters]);

    // Debounce para a busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearchTerm !== searchTerm) {
                searchLeads(localSearchTerm);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearchTerm]);

    // Função para obter cor do status
    const getStatusColor = (status) => {
        const colors = {
            nova: 'bg-blue-100 text-blue-800',
            qualificada: 'bg-yellow-100 text-yellow-800',
            emNegociacao: 'bg-purple-100 text-purple-800',
            convertida: 'bg-green-100 text-green-800',
            perdida: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Função para obter cor da urgência
    const getUrgencyColor = (urgency) => {
        const colors = {
            baixa: 'text-gray-500',
            normal: 'text-blue-500',
            alta: 'text-orange-500',
            urgente: 'text-red-500'
        };
        return colors[urgency] || 'text-gray-500';
    };

    // Função para obter ícone do tipo
    const getTypeIcon = (type) => {
        switch (type) {
            case 'comprador':
                return <HomeIcon className="h-5 w-5 text-blue-500" />;
            case 'vendedor':
                return <CurrencyEuroIcon className="h-5 w-5 text-green-500" />;
            case 'senhorio':
                return <KeyIcon className="h-5 w-5 text-purple-500" />;
            case 'inquilino':
                return <BuildingOfficeIcon className="h-5 w-5 text-orange-500" />;
            case 'investidor':
                return <ChartBarIcon className="h-5 w-5 text-indigo-500" />;
            default:
                return <UserPlusIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    // Handler para deletar lead
    const handleDeleteClick = (e, lead) => {
        e.stopPropagation();
        setLeadToDelete(lead);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (leadToDelete) {
            try {
                await deleteLead(leadToDelete.id);
                setShowDeleteModal(false);
                setLeadToDelete(null);
                fetchLeads();
            } catch (error) {
                console.error('Erro ao deletar lead:', error);
            }
        }
    };

    const handleEditClick = (e, leadId) => {
        e.stopPropagation();
        navigate(`/leads/${leadId}/edit`);
    };

    // Lidar com mudanças nos filtros
    const handleFilterChange = (filterName, value) => {
        applyFilters({
            ...filters,
            [filterName]: value
        });
    };

    // Formatar data
    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-PT');
    };

    // Determinar leads a mostrar
    const displayLeads = localSearchTerm ? searchLeads : leads;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Gestão de Leads
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {stats?.total || 0} leads no total
                            </p>
                        </div>
                        <Link
                            to="/leads/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Nova Lead
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Total de Leads
                                            </dt>
                                            <dd className="text-lg font-semibold text-gray-900">
                                                {stats.total}
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
                                        <ClockIcon className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Qualificadas
                                            </dt>
                                            <dd className="text-lg font-semibold text-gray-900">
                                                {stats.byStatus?.qualificada || 0}
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
                                        <CheckCircleIcon className="h-6 w-6 text-green-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Convertidas
                                            </dt>
                                            <dd className="text-lg font-semibold text-gray-900">
                                                {stats.byStatus?.convertida || 0}
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
                                        <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                Taxa Conversão
                                            </dt>
                                            <dd className="text-lg font-semibold text-gray-900">
                                                {stats.conversionRate?.toFixed(1) || 0}%
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={localSearchTerm}
                                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Buscar por nome, telefone ou email..."
                                    />
                                </div>
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                                Filtros
                            </button>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="all">Todos</option>
                                        {LEAD_STATUS.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tipo
                                    </label>
                                    <select
                                        value={filters.qualificationType}
                                        onChange={(e) => handleFilterChange('qualificationType', e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="all">Todos</option>
                                        {QUALIFICATION_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Origem
                                    </label>
                                    <select
                                        value={filters.source}
                                        onChange={(e) => handleFilterChange('source', e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="all">Todas</option>
                                        {LEAD_SOURCES.map(source => (
                                            <option key={source.value} value={source.value}>
                                                {source.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Urgência
                                    </label>
                                    <select
                                        value={filters.urgency}
                                        onChange={(e) => handleFilterChange('urgency', e.target.value)}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="all">Todas</option>
                                        {URGENCY_LEVELS.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
                {loading.list ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : displayLeads.length === 0 ? (
                    <div className="bg-white shadow rounded-lg">
                        <div className="text-center py-12">
                            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                Sem leads
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comece adicionando uma nova lead ao sistema.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/leads/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                    Nova Lead
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {displayLeads.map((lead) => (
                                <li key={lead.id}>
                                    <div
                                        onClick={() => navigate(`/leads/${lead.id}`)}
                                        className="block hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        {getTypeIcon(lead.qualification?.type)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {lead.prospect?.name}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <PhoneIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            <span className="text-sm text-gray-500">
                                                                {lead.prospect?.phone}
                                                            </span>
                                                            {lead.prospect?.email && (
                                                                <>
                                                                    <EnvelopeIcon className="flex-shrink-0 ml-3 mr-1.5 h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-500">
                                                                        {lead.prospect?.email}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="mr-4 text-right">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                                            {LEAD_STATUS.find(s => s.value === lead.status)?.label}
                                                        </span>
                                                        <div className="mt-1 flex items-center text-sm text-gray-500">
                                                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            {formatDate(lead.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={(e) => handleEditClick(e, lead.id)}
                                                            className="text-gray-400 hover:text-indigo-600"
                                                            title="Editar"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteClick(e, lead)}
                                                            className="text-gray-400 hover:text-red-600"
                                                            title="Apagar"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Additional Info */}
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="inline-flex items-center">
                                                    Origem: {LEAD_SOURCES.find(s => s.value === lead.source?.origin)?.label}
                                                </span>
                                                {lead.qualification?.buyer?.urgency && (
                                                    <span className={`ml-4 inline-flex items-center ${getUrgencyColor(lead.qualification.buyer.urgency)}`}>
                                                        Urgência: {URGENCY_LEVELS.find(u => u.value === lead.qualification.buyer.urgency)?.label}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Delete */}
            {showDeleteModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Apagar Lead
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Tem certeza que deseja apagar a lead <strong>{leadToDelete?.prospect?.name}</strong>?
                                                Esta ação não pode ser desfeita.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    onClick={handleConfirmDelete}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Apagar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
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
    );
}

export default LeadList;