/**
 * NEGOCIO PLENO LIST - MyImoMatePro
 * Página para listar todos os negócios plenos ativos
 * 
 * Caminho: src/pages/negocioPleno/NegocioPlenoList.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNegociosPlenos } from '../../contexts/NegocioPlenoContext';
import Layout from '../../components/Layout';
import LinkOpportunitiesModal from '../../components/negocioPleno/LinkOpportunitiesModal';
import {
    LinkIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowRightIcon,
    HomeIcon,
    CurrencyEuroIcon,
    ShoppingCartIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    CalendarIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import {
    NEGOCIO_PLENO_STATE_LABELS,
    getStateColor
} from '../../models/negocioPlenoModel';

const NegocioPlenoList = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        negocios,
        loading,
        error,
        stats,
        filters,
        loadNegociosPlenos,
        setFilters,
        clearFilters,
        loadStats
    } = useNegociosPlenos();

    const [showLinkModal, setShowLinkModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterState, setFilterState] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Carregar negócios ao montar
    useEffect(() => {
        loadNegociosPlenos();
        loadStats();
    }, []);

    // Aplicar filtros
    useEffect(() => {
        const delayTimer = setTimeout(() => {
            setFilters({
                searchTerm,
                estado: filterState || null
            });
            loadNegociosPlenos();
        }, 500);

        return () => clearTimeout(delayTimer);
    }, [searchTerm, filterState]);

    // Filtrar negócios localmente
    const filteredNegocios = negocios.filter(negocio => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                negocio.numeroNegocio?.toLowerCase().includes(search) ||
                negocio.titulo?.toLowerCase().includes(search) ||
                negocio.oportunidades?.vendedora?.clienteNome?.toLowerCase().includes(search) ||
                negocio.oportunidades?.compradora?.clienteNome?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Agrupar por estado
    const negociosByState = filteredNegocios.reduce((acc, negocio) => {
        const state = negocio.estado;
        if (!acc[state]) {
            acc[state] = [];
        }
        acc[state].push(negocio);
        return acc;
    }, {});

    // Handler para sucesso ao linkar
    const handleLinkSuccess = (newNegocio) => {
        setShowLinkModal(false);
        if (newNegocio?.id) {
            navigate(`/negocios-plenos/${newNegocio.id}`);
        }
    };

    // Obter ícone do estado
    const getStateIcon = (estado) => {
        if (estado.includes('cpcv') || estado.includes('sinal')) {
            return DocumentTextIcon;
        }
        if (estado.includes('escritura')) {
            return HomeIcon;
        }
        if (estado === 'concluido') {
            return CheckCircleIcon;
        }
        if (estado === 'cancelado') {
            return XCircleIcon;
        }
        if (estado === 'suspenso') {
            return ExclamationCircleIcon;
        }
        return ClockIcon;
    };

    // Card de negócio pleno
    const NegocioPlenoCard = ({ negocio }) => {
        const stateColor = getStateColor(negocio.estado);
        const StateIcon = getStateIcon(negocio.estado);

        const colorClasses = {
            gray: 'bg-gray-100 text-gray-700 border-gray-200',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            red: 'bg-red-100 text-red-700 border-red-200'
        };

        const cardColorClass = colorClasses[stateColor] || colorClasses.gray;

        return (
            <div
                onClick={() => navigate(`/negocios-plenos/${negocio.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${cardColorClass}`}>
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {negocio.titulo || 'Negócio Pleno'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                #{negocio.numeroNegocio}
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cardColorClass}`}>
                        <StateIcon className="w-3 h-3" />
                        <span>{NEGOCIO_PLENO_STATE_LABELS[negocio.estado]}</span>
                    </div>
                </div>

                {/* Partes */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <CurrencyEuroIcon className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="text-xs text-gray-600">Vendedor</p>
                                <p className="font-medium text-sm">
                                    {negocio.oportunidades?.vendedora?.clienteNome || 'Não definido'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-3">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-right">
                                <p className="text-xs text-gray-600">Comprador</p>
                                <p className="font-medium text-sm">
                                    {negocio.oportunidades?.compradora?.clienteNome || 'Não definido'}
                                </p>
                            </div>
                            <ShoppingCartIcon className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {negocio.valores?.valorAcordado > 0 && (
                        <div className="text-center">
                            <p className="text-xs text-gray-600">Valor Acordado</p>
                            <p className="font-semibold text-sm">
                                €{negocio.valores.valorAcordado.toLocaleString('pt-PT')}
                            </p>
                        </div>
                    )}
                    {negocio.comissoes?.valorTotal > 0 && (
                        <div className="text-center">
                            <p className="text-xs text-gray-600">Comissão</p>
                            <p className="font-semibold text-sm">
                                €{negocio.comissoes.valorTotal.toLocaleString('pt-PT')}
                            </p>
                        </div>
                    )}
                    {negocio.valores?.sinal > 0 && (
                        <div className="text-center">
                            <p className="text-xs text-gray-600">Sinal</p>
                            <p className="font-semibold text-sm">
                                €{negocio.valores.sinal.toLocaleString('pt-PT')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Datas importantes */}
                {(negocio.prazos?.prazoEscritura || negocio.escritura?.dataAgendada) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                            Escritura: {new Date(
                                negocio.escritura?.dataAgendada || negocio.prazos?.prazoEscritura
                            ).toLocaleDateString('pt-PT')}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Negócios Plenos</h1>
                    <p className="mt-2 text-gray-600">
                        Gestão centralizada de negócios vendedor-comprador
                    </p>
                </div>

                {/* Estatísticas */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <LinkIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm text-gray-600">Total Negócios</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <BanknotesIcon className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        €{stats.valorTotal?.toLocaleString('pt-PT') || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Volume Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        €{stats.comissaoTotal?.toLocaleString('pt-PT') || 0}
                                    </p>
                                    <p className="text-sm text-gray-600">Comissões Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <ClockIcon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {Object.values(stats.porEstado || {})
                                            .filter((_, index) => {
                                                const states = Object.keys(stats.porEstado || {});
                                                return states[index]?.includes('cpcv') ||
                                                    states[index]?.includes('escritura');
                                            })
                                            .reduce((sum, count) => sum + count, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Em Progresso</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Barra de ações */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Busca */}
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por número, título ou cliente..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FunnelIcon className="w-5 h-5" />
                            <span>Filtros</span>
                        </button>

                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Novo Negócio Pleno</span>
                        </button>
                    </div>
                </div>

                {/* Painel de filtros */}
                {showFilters && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={filterState}
                                    onChange={(e) => setFilterState(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos</option>
                                    {Object.entries(NEGOCIO_PLENO_STATE_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setFilterState('');
                                        setSearchTerm('');
                                        clearFilters();
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de negócios */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : filteredNegocios.length > 0 ? (
                    filterState ? (
                        // Mostrar apenas do estado filtrado
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredNegocios.map(negocio => (
                                <NegocioPlenoCard key={negocio.id} negocio={negocio} />
                            ))}
                        </div>
                    ) : (
                        // Agrupar por estado
                        <div className="space-y-8">
                            {Object.entries(negociosByState).map(([state, negociosInState]) => (
                                <div key={state}>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        {React.createElement(getStateIcon(state), { className: 'w-5 h-5' })}
                                        {NEGOCIO_PLENO_STATE_LABELS[state]}
                                        <span className="text-sm text-gray-500">
                                            ({negociosInState.length})
                                        </span>
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {negociosInState.map(negocio => (
                                            <NegocioPlenoCard key={negocio.id} negocio={negocio} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-12">
                        <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum negócio pleno encontrado
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Crie um negócio pleno linkando uma oportunidade vendedora com uma compradora
                        </p>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Criar Primeiro Negócio Pleno</span>
                        </button>
                    </div>
                )}

                {/* Modal de Link */}
                <LinkOpportunitiesModal
                    isOpen={showLinkModal}
                    onClose={() => setShowLinkModal(false)}
                    onSuccess={handleLinkSuccess}
                />
            </div>
        </Layout>
    );
};

export default NegocioPlenoList;