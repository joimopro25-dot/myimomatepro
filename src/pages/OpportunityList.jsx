/**
 * OPPORTUNITY LIST PAGE - MyImoMatePro
 * Página para listar oportunidades de um cliente com ações
 * VERSÃO CORRIGIDA - Com filtro de tipo funcional
 * 
 * Caminho: src/pages/OpportunityList.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../contexts/ClientContext';
import {
    listClientOpportunities,
    deleteOpportunity,
    deactivateOpportunity
} from '../services/opportunityService';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_PRIORITIES
} from '../models/opportunityModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    PlusIcon,
    ChartBarIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

// Labels de prioridade locais (caso não existam no modelo)
const PRIORITY_LABELS = {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
    'urgente': 'Urgente'
};

// Ícones por tipo de oportunidade
const getOpportunityIcon = (tipo) => {
    const icons = {
        'comprador': ShoppingCartIcon,
        'vendedor': CurrencyEuroIcon,
        'senhorio': HomeIcon,
        'inquilino': UserGroupIcon,
        'investidor': ChartBarIcon
    };
    return icons[tipo] || ChartBarIcon;
};

// Cores por tipo
const getTypeColorClasses = (tipo) => {
    const colors = {
        'comprador': 'bg-blue-100 text-blue-800 border-blue-200',
        'vendedor': 'bg-green-100 text-green-800 border-green-200',
        'senhorio': 'bg-purple-100 text-purple-800 border-purple-200',
        'inquilino': 'bg-orange-100 text-orange-800 border-orange-200',
        'investidor': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Cores por estado
const getStateColorClasses = (estado) => {
    const colors = {
        'lead': 'bg-gray-100 text-gray-700',
        'qualificado': 'bg-blue-100 text-blue-700',
        'proposta': 'bg-yellow-100 text-yellow-700',
        'negociacao': 'bg-orange-100 text-orange-700',
        'fechado_ganho': 'bg-green-100 text-green-700',
        'fechado_perdido': 'bg-red-100 text-red-700',
        'em_espera': 'bg-purple-100 text-purple-700'
    };
    return colors[estado] || 'bg-gray-100 text-gray-700';
};

// Cores por prioridade
const getPriorityColorClasses = (prioridade) => {
    const colors = {
        'baixa': 'text-gray-500',
        'media': 'text-yellow-500',
        'alta': 'text-orange-500',
        'urgente': 'text-red-500'
    };
    return colors[prioridade] || 'text-gray-500';
};

const OpportunityList = () => {
    const navigate = useNavigate();
    const { clientId } = useParams();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { currentClient, fetchClient } = useClients();

    // Estados
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filtros - IMPORTANTE: Capturar o tipo do URL
    const [filters, setFilters] = useState({
        tipo: searchParams.get('tipo') || '',
        estado: '',
        prioridade: ''
    });

    // Carregar dados do cliente
    useEffect(() => {
        if (clientId && currentUser?.uid) {
            console.log('Loading data for client:', clientId);
            fetchClient(clientId);
            loadOpportunities();
        }
    }, [clientId, currentUser]);

    // Recarregar quando filtros mudarem
    useEffect(() => {
        if (clientId && currentUser?.uid) {
            loadOpportunities();
        }
    }, [filters]);

    // Carregar oportunidades
    const loadOpportunities = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listClientOpportunities(
                currentUser.uid,
                clientId,
                {
                    tipo: filters.tipo || null,
                    estado: filters.estado || null,
                    pageSize: 100
                }
            );

            let filteredOpps = result.opportunities || [];

            // Garantir que cada oportunidade tem um ID único
            filteredOpps = filteredOpps.map((opp, index) => ({
                ...opp,
                id: opp.id || `temp-${index}-${Date.now()}`
            }));

            // Debug: verificar IDs duplicados
            const ids = filteredOpps.map(o => o.id);
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
            if (duplicates.length > 0) {
                console.warn('IDs duplicados encontrados:', duplicates);
            }

            console.log('Loaded opportunities with filter tipo:', filters.tipo);
            console.log('Total opportunities:', filteredOpps.length);

            // Filtrar por prioridade em memória
            if (filters.prioridade) {
                filteredOpps = filteredOpps.filter(opp => opp.prioridade === filters.prioridade);
            }

            // Filtrar por termo de pesquisa
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredOpps = filteredOpps.filter(opp =>
                    opp.titulo?.toLowerCase().includes(term) ||
                    opp.descricao?.toLowerCase().includes(term)
                );
            }

            setOpportunities(filteredOpps);
        } catch (err) {
            console.error('Erro ao carregar oportunidades:', err);
            setError('Erro ao carregar oportunidades');
            setOpportunities([]);
        } finally {
            setLoading(false);
        }
    };

    // Formatar data
    const formatDate = (date) => {
        if (!date) return 'N/A';

        try {
            let dateObj;
            if (date?.seconds) {
                dateObj = new Date(date.seconds * 1000);
            } else if (typeof date === 'string') {
                dateObj = new Date(date);
            } else {
                dateObj = date;
            }

            return dateObj.toLocaleDateString('pt-PT');
        } catch {
            return 'N/A';
        }
    };

    // Formatar valor
    const formatCurrency = (value) => {
        if (!value) return '€0';
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Handler para clique na oportunidade - SIMPLIFICADO
    const handleOpportunityClick = (opportunity) => {
        console.log('Click handler called');
        console.log('Opportunity:', opportunity);

        if (!opportunity || !opportunity.id || opportunity.id.startsWith('temp-')) {
            console.log('Invalid opportunity or ID');
            return;
        }

        const editUrl = `/clients/${clientId}/opportunities/${opportunity.id}/edit`;
        console.log('Navigating to:', editUrl);

        // Força navegação
        window.location.href = `#${editUrl}`;
        setTimeout(() => {
            navigate(editUrl);
        }, 100);
    };

    // Eliminar oportunidade
    const handleDelete = async (opportunityId) => {
        try {
            await deleteOpportunity(currentUser.uid, clientId, opportunityId);
            setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Erro ao eliminar oportunidade:', error);
            alert('Erro ao eliminar oportunidade');
        }
    };

    // Limpar filtros
    const clearFilters = () => {
        setFilters({
            tipo: '',
            estado: '',
            prioridade: ''
        });
        setSearchTerm('');
    };

    // Contadores para estatísticas
    const stats = {
        total: opportunities.length,
        abertas: opportunities.filter(o =>
            o.estado !== 'fechado_ganho' &&
            o.estado !== 'fechado_perdido'
        ).length,
        valorTotal: opportunities.reduce((sum, o) => sum + (o.valorEstimado || 0), 0)
    };

    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/clients/${clientId}`)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar ao cliente
                    </button>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {filters.tipo ? (
                                    <>
                                        Oportunidades de {OPPORTUNITY_TYPE_LABELS[filters.tipo]} - {currentClient?.name || 'Cliente'}
                                    </>
                                ) : (
                                    <>
                                        Oportunidades de {currentClient?.name || 'Cliente'}
                                    </>
                                )}
                            </h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span>{stats.total} {filters.tipo ? `de ${OPPORTUNITY_TYPE_LABELS[filters.tipo]}` : 'oportunidades'}</span>
                                <span className="text-green-600">{stats.abertas} abertas</span>
                                <span className="font-semibold">{formatCurrency(stats.valorTotal)}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/clients/${clientId}/opportunities/new`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Nova Oportunidade
                        </button>
                    </div>
                </div>

                {/* Barra de pesquisa e filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Pesquisa */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Pesquisar oportunidades..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-2">
                            {/* Tipo */}
                            <select
                                value={filters.tipo}
                                onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos os tipos</option>
                                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
                                    <option key={`tipo-${value}`} value={value}>{label}</option>
                                ))}
                            </select>

                            {/* Estado */}
                            <select
                                value={filters.estado}
                                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos os estados</option>
                                {Object.entries(OPPORTUNITY_STATE_LABELS).map(([value, label]) => (
                                    <option key={`estado-${value}`} value={value}>{label}</option>
                                ))}
                            </select>

                            {/* Prioridade */}
                            <select
                                value={filters.prioridade}
                                onChange={(e) => setFilters(prev => ({ ...prev, prioridade: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todas as prioridades</option>
                                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                    <option key={`prioridade-${value}`} value={value}>{label}</option>
                                ))}
                            </select>

                            {/* Limpar filtros */}
                            {(filters.tipo || filters.estado || filters.prioridade || searchTerm) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de oportunidades */}
                {opportunities.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {filters.tipo || filters.estado || filters.prioridade || searchTerm
                                ? 'Nenhuma oportunidade encontrada'
                                : 'Ainda não há oportunidades'
                            }
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {filters.tipo || filters.estado || filters.prioridade || searchTerm
                                ? 'Tente ajustar os filtros'
                                : 'Comece criando a primeira oportunidade para este cliente'
                            }
                        </p>
                        {(filters.tipo || filters.estado || filters.prioridade || searchTerm) && (
                            <button
                                onClick={clearFilters}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Instrução */}
                        <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Clique em qualquer oportunidade para editar</span>
                        </div>

                        {/* Lista */}
                        <div className="space-y-3">
                            {opportunities.map((opportunity, index) => {
                                const Icon = getOpportunityIcon(opportunity.tipo);
                                const uniqueKey = opportunity.id || `fallback-${index}-${opportunity.tipo}-${opportunity.titulo || 'notitle'}`;

                                return (
                                    <div
                                        key={uniqueKey}
                                        onClick={() => {
                                            if (opportunity.id && !opportunity.id.startsWith('temp-')) {
                                                navigate(`/clients/${clientId}/opportunities/${opportunity.id}/edit`);
                                            }
                                        }}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                                    >
                                        {/* Cabeçalho da oportunidade */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${getTypeColorClasses(opportunity.tipo)}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {opportunity.titulo || 'Sem título'}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className={`text-sm px-2 py-0.5 rounded-full ${getTypeColorClasses(opportunity.tipo)}`}>
                                                            {OPPORTUNITY_TYPE_LABELS[opportunity.tipo] || opportunity.tipo}
                                                        </span>
                                                        <span className={`text-sm px-2 py-0.5 rounded-full ${getStateColorClasses(opportunity.estado)}`}>
                                                            {OPPORTUNITY_STATE_LABELS[opportunity.estado] || opportunity.estado}
                                                        </span>
                                                        {opportunity.prioridade && (
                                                            <span className={`text-sm font-medium ${getPriorityColorClasses(opportunity.prioridade)}`}>
                                                                {PRIORITY_LABELS[opportunity.prioridade] || opportunity.prioridade}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Valor e ações */}
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {formatCurrency(opportunity.valorEstimado)}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Criada em {formatDate(opportunity.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        {opportunity.descricao && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {opportunity.descricao}
                                            </p>
                                        )}

                                        {/* Estatísticas */}
                                        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                                            {/* Mostrar imóveis apenas para compradores */}
                                            {opportunity.tipo === 'comprador' && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <HomeIcon className="w-4 h-4" />
                                                    <span>{opportunity.totalImoveis || 0} imóveis</span>
                                                </div>
                                            )}

                                            {/* Visitas - sempre mostrar */}
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <EyeIcon className="w-4 h-4" />
                                                <span>{opportunity.totalVisitas || 0} visitas</span>
                                            </div>

                                            {/* Propostas - mostrar para vendedores e compradores */}
                                            {(opportunity.tipo === 'vendedor' || opportunity.tipo === 'comprador') && (
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                    <span>{opportunity.totalPropostas || 0} propostas</span>
                                                </div>
                                            )}

                                            {/* CPCV */}
                                            {opportunity.temCPCV && (
                                                <span className="text-sm text-green-600 font-medium">
                                                    ✓ CPCV
                                                </span>
                                            )}

                                            {/* Escritura */}
                                            {opportunity.temEscritura && (
                                                <span className="text-sm text-blue-600 font-medium">
                                                    ✓ Escritura
                                                </span>
                                            )}
                                        </div>

                                        {/* Botão de ações no canto */}
                                        <div className="flex justify-end mt-3 gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Tem certeza que deseja eliminar esta oportunidade?')) {
                                                        handleDelete(opportunity.id);
                                                    }
                                                }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default OpportunityList;