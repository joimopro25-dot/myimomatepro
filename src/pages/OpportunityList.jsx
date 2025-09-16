{/* Teste simples */ }
<div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
    <p className="text-sm mb-2">Teste de navegação:</p>
    <button
        onClick={() => {
            const testUrl = `/clients/${clientId}/opportunities/${opportunities[0]?.id}/edit`;
            console.log('Test navigation to:', testUrl);
            navigate(testUrl);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
        Testar Navegação para 1ª Oportunidade
    </button>
</div>/**
 * OPPORTUNITY LIST PAGE - MyImoMatePro
 * Página para listar oportunidades de um cliente com ações
 * VERSÃO CORRIGIDA - Sem dependências problemáticas
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
    ExclamationTriangleIcon
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

    // Filtros
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

            console.log('Loaded opportunities:', filteredOpps);

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
                                Oportunidades de {currentClient?.name || 'Cliente'}
                            </h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span>{stats.total} oportunidades</span>
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

                {/* Teste simples */}
                {opportunities.length > 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm mb-2">Debug - Teste de navegação:</p>
                        <button
                            onClick={() => {
                                const firstOpp = opportunities[0];
                                const testUrl = `/clients/${clientId}/opportunities/${firstOpp.id}/edit`;
                                console.log('Test button - navigating to:', testUrl);
                                console.log('First opportunity:', firstOpp);
                                navigate(testUrl);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                        >
                            Testar Editar 1ª Oportunidade
                        </button>
                        <span className="text-xs text-gray-600">
                            ID: {opportunities[0]?.id || 'N/A'}
                        </span>
                    </div>
                )}

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
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 group"
                                        title="Clique para editar"
                                    >
                                        <div className="flex items-start justify-between">
                                            {/* Info principal */}
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    {/* Ícone do tipo */}
                                                    <div className={`p-2 rounded-lg ${getTypeColorClasses(opportunity.tipo)}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>

                                                    {/* Detalhes */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {opportunity.titulo || 'Sem título'}
                                                            </h3>
                                                            {/* Indicador de clicável - aparece no hover */}
                                                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                (Clique para editar)
                                                            </span>
                                                            {/* Aviso se ID temporário */}
                                                            {opportunity.id?.startsWith('temp-') && (
                                                                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                                    Dados incompletos
                                                                </span>
                                                            )}
                                                            {/* Prioridade */}
                                                            {opportunity.prioridade && opportunity.prioridade !== 'baixa' && (
                                                                <ExclamationTriangleIcon
                                                                    className={`w-4 h-4 ${getPriorityColorClasses(opportunity.prioridade)}`}
                                                                    title={PRIORITY_LABELS[opportunity.prioridade]}
                                                                />
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {opportunity.descricao || 'Sem descrição'}
                                                        </p>

                                                        {/* Badges e info */}
                                                        <div className="flex flex-wrap items-center gap-3 text-sm">
                                                            {/* Tipo */}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColorClasses(opportunity.tipo)}`}>
                                                                {OPPORTUNITY_TYPE_LABELS[opportunity.tipo] || opportunity.tipo}
                                                            </span>

                                                            {/* Estado */}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColorClasses(opportunity.estado)}`}>
                                                                {OPPORTUNITY_STATE_LABELS[opportunity.estado] || opportunity.estado}
                                                            </span>

                                                            {/* Valor */}
                                                            {opportunity.valorEstimado > 0 && (
                                                                <span className="text-gray-700 font-medium">
                                                                    {formatCurrency(opportunity.valorEstimado)}
                                                                </span>
                                                            )}

                                                            {/* Data criação */}
                                                            <span className="text-gray-500">
                                                                Criada em {formatDate(opportunity.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Ações */}
                                            <div className="flex items-center gap-2 ml-4">
                                                {/* Ver detalhes */}
                                                {opportunity.id && !opportunity.id.startsWith('temp-') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('View button clicked');
                                                            navigate(`/clients/${clientId}/opportunities/${opportunity.id}`);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative z-10"
                                                        title="Ver detalhes"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Eliminar */}
                                                {opportunity.id && !opportunity.id.startsWith('temp-') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Delete button clicked');
                                                            setDeleteConfirm(opportunity.id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors relative z-10"
                                                        title="Eliminar"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Modal de confirmação de eliminação */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Confirmar eliminação
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tem certeza que deseja eliminar esta oportunidade? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OpportunityList;