/**
 * OPPORTUNITY BADGES COMPONENT - MyImoMatePro
 * Mini cards/badges para mostrar oportunidades no card de cliente
 * VERSÃO ATUALIZADA - Com suporte para Negócios Plenos
 * 
 * Caminho: src/components/opportunities/OpportunityBadges.jsx
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { listClientOpportunities } from '../../services/opportunityService';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_TYPE_COLORS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_STATE_COLORS
} from '../../models/opportunityModel';
import {
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ChartBarIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    ExclamationCircleIcon,
    SparklesIcon,  // NOVO: Para indicar Negócio Pleno
    LinkIcon        // NOVO: Para indicar linking
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    ShoppingCartIcon as ShoppingCartIconSolid,
    CurrencyEuroIcon as CurrencyEuroIconSolid,
    UserGroupIcon as UserGroupIconSolid,
    ChartBarIcon as ChartBarIconSolid,
    SparklesIcon as SparklesIconSolid  // NOVO: Versão sólida
} from '@heroicons/react/24/solid';

// ===== ÍCONES POR TIPO =====
const getOpportunityIcon = (tipo, solid = false) => {
    const icons = {
        [OPPORTUNITY_TYPES.BUYER]: solid ? ShoppingCartIconSolid : ShoppingCartIcon,
        [OPPORTUNITY_TYPES.SELLER]: solid ? CurrencyEuroIconSolid : CurrencyEuroIcon,
        [OPPORTUNITY_TYPES.LANDLORD]: solid ? HomeIconSolid : HomeIcon,
        [OPPORTUNITY_TYPES.TENANT]: solid ? UserGroupIconSolid : UserGroupIcon,
        [OPPORTUNITY_TYPES.INVESTOR]: solid ? ChartBarIconSolid : ChartBarIcon
    };
    return icons[tipo] || HomeIcon;
};

// ===== CORES TAILWIND POR TIPO =====
const getColorClasses = (tipo, variant = 'default') => {
    const colorMap = {
        [OPPORTUNITY_TYPES.BUYER]: {
            default: 'bg-blue-100 text-blue-700 border-blue-200',
            hover: 'hover:bg-blue-200 hover:border-blue-300',
            solid: 'bg-blue-500 text-white',
            solidHover: 'hover:bg-blue-600',
            badge: 'bg-blue-500 text-white'
        },
        [OPPORTUNITY_TYPES.SELLER]: {
            default: 'bg-green-100 text-green-700 border-green-200',
            hover: 'hover:bg-green-200 hover:border-green-300',
            solid: 'bg-green-500 text-white',
            solidHover: 'hover:bg-green-600',
            badge: 'bg-green-500 text-white'
        },
        [OPPORTUNITY_TYPES.LANDLORD]: {
            default: 'bg-purple-100 text-purple-700 border-purple-200',
            hover: 'hover:bg-purple-200 hover:border-purple-300',
            solid: 'bg-purple-500 text-white',
            solidHover: 'hover:bg-purple-600',
            badge: 'bg-purple-500 text-white'
        },
        [OPPORTUNITY_TYPES.TENANT]: {
            default: 'bg-orange-100 text-orange-700 border-orange-200',
            hover: 'hover:bg-orange-200 hover:border-orange-300',
            solid: 'bg-orange-500 text-white',
            solidHover: 'hover:bg-orange-600',
            badge: 'bg-orange-500 text-white'
        },
        [OPPORTUNITY_TYPES.INVESTOR]: {
            default: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            hover: 'hover:bg-yellow-200 hover:border-yellow-300',
            solid: 'bg-yellow-500 text-white',
            solidHover: 'hover:bg-yellow-600',
            badge: 'bg-yellow-500 text-white'
        }
    };

    return colorMap[tipo]?.[variant] || colorMap[OPPORTUNITY_TYPES.BUYER][variant];
};

// ===== ESTADO DOT INDICATOR =====
const StateIndicator = ({ estado }) => {
    const getStateColor = (state) => {
        const colors = {
            [OPPORTUNITY_STATES.LEAD]: 'bg-gray-400',
            [OPPORTUNITY_STATES.QUALIFIED]: 'bg-blue-400',
            [OPPORTUNITY_STATES.PROPOSAL]: 'bg-indigo-400',
            [OPPORTUNITY_STATES.NEGOTIATION]: 'bg-yellow-400',
            [OPPORTUNITY_STATES.CLOSED_WON]: 'bg-green-400',
            [OPPORTUNITY_STATES.CLOSED_LOST]: 'bg-red-400',
            [OPPORTUNITY_STATES.ON_HOLD]: 'bg-orange-400'
        };
        return colors[state] || 'bg-gray-400';
    };

    return (
        <div className="relative">
            <div className={`w-2 h-2 rounded-full ${getStateColor(estado)}`} />
            {(estado === OPPORTUNITY_STATES.NEGOTIATION || estado === OPPORTUNITY_STATES.PROPOSAL) && (
                <div className={`absolute inset-0 w-2 h-2 rounded-full ${getStateColor(estado)} animate-ping`} />
            )}
        </div>
    );
};

// ===== NOVO: INDICADOR DE NEGÓCIO PLENO =====
const NegocioPlenoIndicator = ({ opportunity }) => {
    if (!opportunity.isNegocioPleno && !opportunity.negocioPlenoId) {
        return null;
    }

    return (
        <div className="absolute -top-1 -right-1 z-10">
            <div className="relative group">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-1 shadow-lg transform hover:scale-110 transition-transform">
                    <SparklesIcon className="w-3 h-3 text-white" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                        <div className="font-semibold">Negócio Pleno</div>
                        {opportunity.linkedOpportunityClientName && (
                            <div className="text-gray-300 text-[10px]">
                                {opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer'
                                    ? `Vendedor: ${opportunity.linkedOpportunityClientName}`
                                    : `Comprador: ${opportunity.linkedOpportunityClientName}`
                                }
                            </div>
                        )}
                        <div className="absolute bottom-0 right-2 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== MINI BADGE COMPONENT ATUALIZADO =====
const OpportunityBadge = ({ opportunity, onClick, compact = false }) => {
    const Icon = getOpportunityIcon(opportunity.tipo);
    const isNegocioPleno = opportunity.isNegocioPleno || opportunity.negocioPlenoId;

    // Ajustar cores se for Negócio Pleno
    const baseColorClasses = isNegocioPleno
        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-300'
        : getColorClasses(opportunity.tipo);

    const hoverClasses = isNegocioPleno
        ? 'hover:from-purple-200 hover:to-indigo-200 hover:border-purple-400'
        : getColorClasses(opportunity.tipo, 'hover');

    if (compact) {
        // Versão compacta para lista de clientes
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(opportunity);
                }}
                className={`
                    relative inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                    border transition-all duration-200 ${baseColorClasses} ${hoverClasses}
                    transform hover:scale-105 ${isNegocioPleno ? 'shadow-md' : ''}
                `}
                title={`${OPPORTUNITY_TYPE_LABELS[opportunity.tipo]} - ${OPPORTUNITY_STATE_LABELS[opportunity.estado]}${isNegocioPleno ? ' (Negócio Pleno)' : ''}`}
            >
                {isNegocioPleno && (
                    <SparklesIcon className="w-3.5 h-3.5 text-purple-600" />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{OPPORTUNITY_TYPE_LABELS[opportunity.tipo]}</span>
                <StateIndicator estado={opportunity.estado} />
            </button>
        );
    }

    // Versão expandida para detalhes
    return (
        <div
            onClick={() => onClick(opportunity)}
            className={`
                group cursor-pointer p-3 rounded-lg border transition-all duration-200
                ${baseColorClasses} ${hoverClasses}
                hover:shadow-md transform hover:-translate-y-0.5
                ${isNegocioPleno ? 'ring-2 ring-purple-200 ring-offset-1' : ''}
                relative
            `}
        >
            {/* Indicador de Negócio Pleno */}
            <NegocioPlenoIndicator opportunity={opportunity} />

            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isNegocioPleno
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                            : getColorClasses(opportunity.tipo, 'solid')
                        }`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="font-semibold text-sm">
                                {OPPORTUNITY_TYPE_LABELS[opportunity.tipo]}
                            </p>
                            {isNegocioPleno && (
                                <SparklesIcon className="w-3 h-3 text-purple-600" />
                            )}
                        </div>
                        <p className="text-xs opacity-75">
                            {OPPORTUNITY_STATE_LABELS[opportunity.estado]}
                        </p>
                    </div>
                </div>
                <StateIndicator estado={opportunity.estado} />
            </div>

            {/* Informação do Negócio Pleno */}
            {isNegocioPleno && opportunity.linkedOpportunityClientName && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                    <div className="flex items-center gap-1 text-xs">
                        <LinkIcon className="w-3 h-3 text-purple-600" />
                        <span className="text-purple-700 font-medium">
                            {opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer'
                                ? `V: ${opportunity.linkedOpportunityClientName}`
                                : `C: ${opportunity.linkedOpportunityClientName}`
                            }
                        </span>
                    </div>
                </div>
            )}

            {opportunity.valorEstimado > 0 && (
                <div className={`mt-2 pt-2 border-t ${isNegocioPleno ? 'border-purple-200' : 'border-current border-opacity-20'
                    }`}>
                    <p className="text-xs font-medium">
                        €{opportunity.valorEstimado.toLocaleString('pt-PT')}
                    </p>
                </div>
            )}

            <div className="mt-2 flex items-center justify-between">
                {isNegocioPleno && (
                    <span className="text-[10px] font-bold text-purple-600 uppercase">
                        Negócio Pleno
                    </span>
                )}
                <ArrowRightIcon className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity ml-auto" />
            </div>
        </div>
    );
};

// ===== GRUPO DE BADGES AGRUPADOS ATUALIZADO =====
const GroupedBadge = ({ tipo, count, opportunities, onClick }) => {
    const Icon = getOpportunityIcon(tipo);

    // Contar quantos são Negócios Plenos
    const negocioPlenoCount = opportunities.filter(o => o.isNegocioPleno || o.negocioPlenoId).length;
    const hasNegocioPleno = negocioPlenoCount > 0;

    const colorClasses = hasNegocioPleno
        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-300'
        : getColorClasses(tipo);

    const hoverClasses = hasNegocioPleno
        ? 'hover:from-purple-200 hover:to-indigo-200 hover:border-purple-400'
        : getColorClasses(tipo, 'hover');

    const badgeColor = hasNegocioPleno
        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
        : getColorClasses(tipo, 'badge');

    // Calcular estatísticas do grupo
    const stats = {
        total: count,
        abertas: opportunities.filter(o =>
            o.estado !== OPPORTUNITY_STATES.CLOSED_WON &&
            o.estado !== OPPORTUNITY_STATES.CLOSED_LOST
        ).length,
        valorTotal: opportunities.reduce((sum, o) => sum + (o.valorEstimado || 0), 0),
        negocioPleno: negocioPlenoCount
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick(tipo);
            }}
            className={`
                relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                border transition-all duration-200 ${colorClasses} ${hoverClasses}
                transform hover:scale-105 hover:shadow-md
                ${hasNegocioPleno ? 'ring-1 ring-purple-200' : ''}
            `}
            title={`${stats.total} ${OPPORTUNITY_TYPE_LABELS[tipo]}${hasNegocioPleno ? ` (${negocioPlenoCount} Negócios Plenos)` : ''}`}
        >
            {/* Ícone de Negócio Pleno se houver */}
            {hasNegocioPleno && (
                <SparklesIcon className="w-4 h-4 text-purple-600" />
            )}

            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">
                {OPPORTUNITY_TYPE_LABELS[tipo]}
            </span>

            {/* Badge com contador */}
            <span className={`
                inline-flex items-center justify-center px-1.5 py-0.5 rounded-full
                text-xs font-bold ${badgeColor} min-w-[20px]
            `}>
                {count}
            </span>

            {/* Badge secundário para Negócios Plenos */}
            {hasNegocioPleno && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                    {negocioPlenoCount}NP
                </span>
            )}

            {/* Indicador de oportunidades abertas */}
            {stats.abertas > 0 && (
                <div className="absolute -top-1 -right-1">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    </div>
                </div>
            )}
        </button>
    );
};

// ===== COMPONENTE PRINCIPAL =====
export default function OpportunityBadges({
    clientId,
    variant = 'compact',
    showEmpty = false,
    onOpportunityClick = null,
    onAddClick = null,
    maxVisible = 3
}) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);

    // Buscar oportunidades do cliente
    useEffect(() => {
        if (clientId && currentUser?.uid) {
            loadOpportunities();
        }
    }, [clientId, currentUser]);

    const loadOpportunities = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await listClientOpportunities(currentUser.uid, clientId, {
                pageSize: 100 // Buscar todas
            });
            setOpportunities(result.opportunities || []);
        } catch (err) {
            console.error('Erro ao carregar oportunidades:', err);
            // Se for erro de índice ou permissão, não mostrar erro ao usuário
            if (err.message?.includes('index') || err.message?.includes('permission')) {
                setOpportunities([]); // Assumir lista vazia
            } else {
                setError('Erro ao carregar oportunidades');
            }
        } finally {
            setLoading(false);
        }
    };

    // Agrupar oportunidades por tipo
    const groupedOpportunities = opportunities.reduce((acc, opp) => {
        if (!acc[opp.tipo]) {
            acc[opp.tipo] = [];
        }
        acc[opp.tipo].push(opp);
        return acc;
    }, {});

    // Contar Negócios Plenos
    const totalNegociosPlenos = opportunities.filter(o => o.isNegocioPleno || o.negocioPlenoId).length;

    // Handler para clique em oportunidade
    const handleOpportunityClick = (opportunity) => {
        // Se for Negócio Pleno, navegar para página específica
        if (opportunity.isNegocioPleno && opportunity.negocioPlenoId) {
            navigate(`/negocio-pleno/${opportunity.negocioPlenoId}`);
        } else if (onOpportunityClick) {
            onOpportunityClick(opportunity);
        } else {
            // Navegar para página da oportunidade
            navigate(`/clients/${clientId}/opportunities/${opportunity.id}`);
        }
    };

    // Handler para clique em grupo
    const handleGroupClick = (tipo) => {
        // Navegar para lista filtrada de oportunidades
        navigate(`/clients/${clientId}/opportunities?tipo=${tipo}`);
    };

    // Handler para adicionar nova oportunidade
    const handleAddClick = (e) => {
        if (onAddClick) {
            onAddClick(e);
        } else {
            navigate(`/clients/${clientId}/opportunities/new`);
        }
    };

    // Estados de loading e erro
    if (loading) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">A carregar oportunidades...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-1 text-red-500 text-xs">
                <ExclamationCircleIcon className="w-3.5 h-3.5" />
                <span>Erro ao carregar</span>
            </div>
        );
    }

    // Se não houver oportunidades
    if (opportunities.length === 0) {
        if (!showEmpty) return null;

        return (
            <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                         border-2 border-dashed border-gray-300 text-gray-500
                         hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                         transition-all duration-200"
            >
                <PlusCircleIcon className="w-3.5 h-3.5" />
                <span>Adicionar Oportunidade</span>
            </button>
        );
    }

    // Renderização para variante compacta (lista de clientes)
    if (variant === 'compact') {
        const visibleOpportunities = showAll
            ? opportunities
            : opportunities.slice(0, maxVisible);

        const remainingCount = opportunities.length - maxVisible;

        return (
            <div className="flex flex-wrap items-center gap-1.5">
                {/* Mostrar indicador especial se houver Negócios Plenos */}
                {totalNegociosPlenos > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold shadow-md">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>{totalNegociosPlenos} NP</span>
                    </div>
                )}

                {/* Mostrar badges agrupados por tipo */}
                {Object.entries(groupedOpportunities).map(([tipo, opps]) => (
                    <GroupedBadge
                        key={tipo}
                        tipo={tipo}
                        count={opps.length}
                        opportunities={opps}
                        onClick={handleGroupClick}
                    />
                ))}

                {/* Botão para adicionar nova */}
                <button
                    onClick={handleAddClick}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full
                             border-2 border-dashed border-gray-300 text-gray-500
                             hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                             transition-all duration-200"
                    title="Adicionar Nova Oportunidade"
                >
                    <PlusCircleIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    // Renderização para variante expandida (detalhes do cliente)
    if (variant === 'expanded') {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Oportunidades ({opportunities.length})
                        </h3>
                        {totalNegociosPlenos > 0 && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold">
                                <SparklesIcon className="w-3 h-3" />
                                <span>{totalNegociosPlenos} Negócios Plenos</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium
                                 flex items-center gap-1 transition-colors"
                    >
                        <PlusCircleIcon className="w-4 h-4" />
                        Nova
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {opportunities.map((opportunity) => (
                        <OpportunityBadge
                            key={opportunity.id}
                            opportunity={opportunity}
                            onClick={handleOpportunityClick}
                            compact={false}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Renderização padrão (lista simples)
    return (
        <div className="flex flex-wrap items-center gap-2">
            {opportunities.map((opportunity) => (
                <OpportunityBadge
                    key={opportunity.id}
                    opportunity={opportunity}
                    onClick={handleOpportunityClick}
                    compact={true}
                />
            ))}
        </div>
    );
}