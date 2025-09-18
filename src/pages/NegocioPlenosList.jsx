/**
 * LISTA DE NEGÓCIOS PLENOS
 * Página para visualizar todos os negócios plenos
 * Caminho: src/pages/NegocioPlenosList.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNegocioPleno } from '../contexts/NegocioPlenoContext';
import Layout from '../components/Layout';
import {
    LinkIcon,
    HomeIcon,
    CurrencyEuroIcon,
    CalendarIcon,
    DocumentCheckIcon,
    ChartBarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PlusCircleIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_PLENO_STATE_LABELS,
    formatCurrency
} from '../models/negocioPlenoModel';

const NegocioPlenosList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        negociosPlenos,
        loading,
        errors,
        stats,
        filters,
        fetchAllNegociosPlenos,
        fetchStats,
        setFilters,
        resetFilters
    } = useNegocioPleno();

    // Estados locais
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEstado, setSelectedEstado] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Carregar dados ao montar
    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        await fetchAllNegociosPlenos(filters);
        await fetchStats();
    };

    // Filtrar negócios plenos baseado na busca
    const filteredNegociosPlenos = negociosPlenos.filter(np => {
        const matchesSearch = searchTerm === '' ||
            np.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            np.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            np.oportunidades?.vendedora?.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            np.oportunidades?.compradora?.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = selectedEstado === '' || np.estado === selectedEstado;

        return matchesSearch && matchesEstado;
    });

    // Renderizar badge de estado
    const renderEstadoBadge = (estado) => {
        const colors = {
            [NEGOCIO_PLENO_STATES.LINKED]: 'bg-blue-100 text-blue-700',
            [NEGOCIO_PLENO_STATES.NEGOTIATION]: 'bg-yellow-100 text-yellow-700',
            [NEGOCIO_PLENO_STATES.PROPOSAL]: 'bg-orange-100 text-orange-700',
            [NEGOCIO_PLENO_STATES.ACCEPTED]: 'bg-green-100 text-green-700',
            [NEGOCIO_PLENO_STATES.CPCV_DRAFT]: 'bg-purple-100 text-purple-700',
            [NEGOCIO_PLENO_STATES.CPCV_SIGNED]: 'bg-indigo-100 text-indigo-700',
            [NEGOCIO_PLENO_STATES.DEED_SCHEDULED]: 'bg-cyan-100 text-cyan-700',
            [NEGOCIO_PLENO_STATES.COMPLETED]: 'bg-green-200 text-green-800',
            [NEGOCIO_PLENO_STATES.CANCELLED]: 'bg-red-100 text-red-700'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[estado] || 'bg-gray-100 text-gray-700'}`}>
                {NEGOCIO_PLENO_STATE_LABELS[estado] || estado}
            </span>
        );
    };

    // Renderizar ícone de alerta
    const renderAlerts = (negocioPleno) => {
        const alerts = [];

        // Verificar documentação em falta
        if (negocioPleno.estado === NEGOCIO_PLENO_STATES.CPCV_DRAFT &&
            (!negocioPleno.documentacao?.caderneta?.existe ||
                !negocioPleno.documentacao?.licencaUtilizacao?.existe)) {
            alerts.push('docs');
        }

        // Verificar sinal não pago
        if (negocioPleno.cpcv?.estado === 'assinado' && !negocioPleno.valores?.sinalPago) {
            alerts.push('payment');
        }

        // Verificar prazo de escritura
        if (negocioPleno.metricas?.diasAteEscritura && negocioPleno.metricas.diasAteEscritura < 30) {
            alerts.push('deadline');
        }

        if (alerts.length === 0) return null;

        return (
            <div className="flex space-x-1">
                {alerts.includes('docs') && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" title="Documentação em falta" />
                )}
                {alerts.includes('payment') && (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" title="Sinal não pago" />
                )}
                {alerts.includes('deadline') && (
                    <ClockIcon className="w-5 h-5 text-orange-500" title="Prazo próximo" />
                )}
            </div>
        );
    };

    // Calcular progresso
    const calculateProgress = (negocioPleno) => {
        const stateOrder = [
            NEGOCIO_PLENO_STATES.LINKED,
            NEGOCIO_PLENO_STATES.NEGOTIATION,
            NEGOCIO_PLENO_STATES.PROPOSAL,
            NEGOCIO_PLENO_STATES.ACCEPTED,
            NEGOCIO_PLENO_STATES.CPCV_DRAFT,
            NEGOCIO_PLENO_STATES.CPCV_SIGNED,
            NEGOCIO_PLENO_STATES.DEED_SCHEDULED,
            NEGOCIO_PLENO_STATES.COMPLETED
        ];

        const currentIndex = stateOrder.indexOf(negocioPleno.estado);
        if (currentIndex === -1) return 0;

        return Math.round(((currentIndex + 1) / stateOrder.length) * 100);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Negócios Plenos</h1>
                            <p className="mt-2 text-gray-600">
                                Gestão unificada de negócios completos (vendedor + comprador)
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/opportunities')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            <span>Criar Negócio Pleno</span>
                        </button>
                    </div>
                </div>

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                                </div>
                                <LinkIcon className="w-8 h-8 text-indigo-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Valor Total</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        €{formatCurrency(stats.valorTotal || 0)}
                                    </p>
                                </div>
                                <CurrencyEuroIcon className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Taxa Conversão</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.taxaConversao || 0}%
                                    </p>
                                </div>
                                <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Concluídos</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.negociosConcluidos || 0}
                                    </p>
                                </div>
                                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar por número, título ou clientes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <select
                                    value={selectedEstado}
                                    onChange={(e) => setSelectedEstado(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Todos os Estados</option>
                                    {Object.entries(NEGOCIO_PLENO_STATE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                                >
                                    <FunnelIcon className="w-5 h-5" />
                                    <span>Filtros</span>
                                </button>

                                {(searchTerm || selectedEstado) && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedEstado('');
                                            resetFilters();
                                        }}
                                        className="px-4 py-2 text-red-600 hover:text-red-700"
                                    >
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </div>

                        {showFilters && (
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data Início
                                        </label>
                                        <input
                                            type="date"
                                            onChange={(e) => setFilters({ dataInicio: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data Fim
                                        </label>
                                        <input
                                            type="date"
                                            onChange={(e) => setFilters({ dataFim: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Consultor
                                        </label>
                                        <select
                                            onChange={(e) => setFilters({ consultorId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Todos</option>
                                            <option value={currentUser.uid}>Meus Negócios</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de Negócios Plenos */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading.list ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-gray-500">Carregando negócios plenos...</p>
                        </div>
                    ) : filteredNegociosPlenos.length === 0 ? (
                        <div className="p-8 text-center">
                            <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum negócio pleno</h3>
                            <p className="mt-1 text-gray-500">
                                Crie um negócio pleno linkando uma oportunidade de venda com uma de compra.
                            </p>
                            <button
                                onClick={() => navigate('/opportunities')}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Ver Oportunidades
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Número / Título
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendedor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comprador
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progresso
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Alertas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredNegociosPlenos.map((negocioPleno) => {
                                        const progress = calculateProgress(negocioPleno);

                                        return (
                                            <tr
                                                key={negocioPleno.id}
                                                onClick={() => navigate(`/negocio-pleno/${negocioPleno.id}`)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {negocioPleno.numero}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {negocioPleno.titulo}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {negocioPleno.oportunidades?.vendedora?.clienteNome || 'N/A'}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {negocioPleno.oportunidades?.vendedora?.titulo || ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {negocioPleno.oportunidades?.compradora?.clienteNome || 'N/A'}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {negocioPleno.oportunidades?.compradora?.titulo || ''}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            €{formatCurrency(negocioPleno.valores?.valorAcordado || 0)}
                                                        </div>
                                                        {negocioPleno.comissoes?.valorTotal > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                Com: €{formatCurrency(negocioPleno.comissoes.valorTotal)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderEstadoBadge(negocioPleno.estado)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'
                                                                }`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        {progress}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {renderAlerts(negocioPleno)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Erro */}
                {errors.list && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">Erro: {errors.list}</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NegocioPlenosList;