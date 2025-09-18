/**
 * NEGOCIO PLENO BADGE - MyImoMatePro
 * Componente badge para indicar quando uma oportunidade está linkada
 * 
 * Caminho: src/components/negocioPleno/NegocioPlenoBadge.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNegociosPlenos } from '../../contexts/NegocioPlenoContext';
import {
    LinkIcon,
    CheckBadgeIcon,
    ArrowRightIcon,
    ArrowTopRightOnSquareIcon,
    CurrencyEuroIcon,
    ShoppingCartIcon,
    HomeIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ClockIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_PLENO_STATE_LABELS,
    getStateColor
} from '../../models/negocioPlenoModel';

const NegocioPlenoBadge = ({
    opportunity,
    variant = 'full', // 'full', 'compact', 'minimal', 'detailed'
    showActions = true,
    showTooltip = true,
    onClick = null,
    className = ''
}) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        findNegocioPlenoByOpportunity,
        loadNegocioPleno,
        unlinkOpportunities
    } = useNegociosPlenos();

    const [negocioPleno, setNegocioPleno] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [unlinking, setUnlinking] = useState(false);

    // Carregar dados do negócio pleno se existir
    useEffect(() => {
        if (opportunity?.isNegocioPleno && opportunity?.negocioPlenoId) {
            loadNegocioPlenoData();
        } else if (opportunity?.isNegocioPleno) {
            // Se está marcado como negócio pleno mas não tem ID, buscar
            findNegocioPleno();
        }
    }, [opportunity]);

    /**
     * Carregar dados do negócio pleno
     */
    const loadNegocioPlenoData = async () => {
        if (!opportunity?.negocioPlenoId || !currentUser?.uid) return;

        setLoading(true);
        try {
            const result = await loadNegocioPleno(opportunity.negocioPlenoId);
            setNegocioPleno(result);
        } catch (error) {
            console.error('Erro ao carregar negócio pleno:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Buscar negócio pleno por oportunidade
     */
    const findNegocioPleno = async () => {
        if (!opportunity?.id || !currentUser?.uid) return;

        setLoading(true);
        try {
            const result = await findNegocioPlenoByOpportunity(opportunity.id);
            setNegocioPleno(result);
        } catch (error) {
            console.error('Erro ao buscar negócio pleno:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Navegar para página do negócio pleno
     */
    const handleNavigate = () => {
        if (onClick) {
            onClick(negocioPleno);
        } else if (negocioPleno?.id) {
            navigate(`/negocios-plenos/${negocioPleno.id}`);
        }
    };

    /**
     * Deslinkar oportunidades
     */
    const handleUnlink = async () => {
        if (!negocioPleno?.id || !window.confirm('Tem certeza que deseja deslinkar estas oportunidades?')) {
            return;
        }

        setUnlinking(true);
        try {
            const success = await unlinkOpportunities(negocioPleno.id);
            if (success) {
                setNegocioPleno(null);
                // Recarregar página ou notificar pai
                window.location.reload();
            }
        } catch (error) {
            console.error('Erro ao deslinkar:', error);
        } finally {
            setUnlinking(false);
        }
    };

    // Não mostrar badge se não for negócio pleno
    if (!opportunity?.isNegocioPleno) {
        return null;
    }

    // Determinar tipo e ícone da oportunidade linkada
    const getLinkedInfo = () => {
        if (!negocioPleno) return null;

        const isVendedor = opportunity.tipo === 'vendedor' || opportunity.tipo === 'senhorio';
        const linkedOpp = isVendedor
            ? negocioPleno.oportunidades?.compradora
            : negocioPleno.oportunidades?.vendedora;

        const linkedType = isVendedor ? 'comprador' : 'vendedor';
        const LinkedIcon = isVendedor
            ? (opportunity.tipo === 'vendedor' ? ShoppingCartIcon : UserGroupIcon)
            : (opportunity.linkedType === 'vendedor_para_comprador' ? CurrencyEuroIcon : HomeIcon);

        return {
            linkedOpp,
            linkedType,
            LinkedIcon,
            isVendedor
        };
    };

    const linkedInfo = getLinkedInfo();

    // Obter cor do estado
    const stateColor = negocioPleno ? getStateColor(negocioPleno.estado) : 'blue';

    // Classes de cor baseadas no estado
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

    const badgeColorClass = colorClasses[stateColor] || colorClasses.blue;

    // Renderização baseada na variante
    if (variant === 'minimal') {
        return (
            <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColorClass} ${className}`}
                onClick={handleNavigate}
                style={{ cursor: negocioPleno ? 'pointer' : 'default' }}
            >
                <LinkIcon className="w-3 h-3" />
                <span>Negócio Pleno</span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`inline-flex items-center gap-2 ${className}`}>
                <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${badgeColorClass} border cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={handleNavigate}
                >
                    <LinkIcon className="w-4 h-4" />
                    <span>Negócio Pleno</span>
                    {negocioPleno && (
                        <>
                            <span className="text-xs opacity-75">•</span>
                            <span className="text-xs">
                                {NEGOCIO_PLENO_STATE_LABELS[negocioPleno.estado] || negocioPleno.estado}
                            </span>
                        </>
                    )}
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                </div>
            </div>
        );
    }

    // Variante 'full' e 'detailed'
    return (
        <div className={`${className}`}>
            {/* Badge Principal */}
            <div className={`
                relative p-4 rounded-lg border-2 ${badgeColorClass}
                ${loading ? 'animate-pulse' : ''}
            `}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${badgeColorClass}`}>
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900">
                                Negócio Pleno
                                {negocioPleno?.numeroNegocio && (
                                    <span className="text-sm text-gray-600 ml-2">
                                        #{negocioPleno.numeroNegocio}
                                    </span>
                                )}
                            </h4>
                            {negocioPleno && (
                                <p className="text-sm text-gray-600">
                                    Estado: {NEGOCIO_PLENO_STATE_LABELS[negocioPleno.estado]}
                                </p>
                            )}
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex items-center gap-1">
                            {variant === 'detailed' && (
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="p-1.5 rounded hover:bg-white/50 transition-colors"
                                    title="Ver detalhes"
                                >
                                    <InformationCircleIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={handleNavigate}
                                className="p-1.5 rounded hover:bg-white/50 transition-colors"
                                title="Abrir negócio pleno"
                            >
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleUnlink}
                                disabled={unlinking}
                                className="p-1.5 rounded hover:bg-red-100 transition-colors text-red-600"
                                title="Deslinkar oportunidades"
                            >
                                {unlinking ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                                ) : (
                                    <XMarkIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Informação da ligação */}
                {linkedInfo && !loading && (
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">
                                {linkedInfo.isVendedor ? 'Esta oportunidade (Vendedor)' : 'Esta oportunidade (Comprador)'}
                            </p>
                            <p className="font-medium text-sm">
                                {opportunity.titulo || 'Sem título'}
                            </p>
                        </div>

                        <div className="px-3">
                            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="flex-1 text-right">
                            <p className="text-xs text-gray-600 mb-1">
                                Linkada com ({linkedInfo.isVendedor ? 'Comprador' : 'Vendedor'})
                            </p>
                            <div className="flex items-center justify-end gap-2">
                                <linkedInfo.LinkedIcon className="w-4 h-4" />
                                <div className="text-right">
                                    <p className="font-medium text-sm">
                                        {linkedInfo.linkedOpp?.clienteNome || opportunity.linkedOpportunityClientName || 'Cliente'}
                                    </p>
                                    {linkedInfo.linkedOpp?.titulo && (
                                        <p className="text-xs text-gray-600">
                                            {linkedInfo.linkedOpp.titulo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Valores (se disponível) */}
                {negocioPleno?.valores && variant === 'detailed' && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        {negocioPleno.valores.valorAcordado > 0 && (
                            <div className="text-center p-2 bg-white/50 rounded">
                                <p className="text-xs text-gray-600">Valor Acordado</p>
                                <p className="font-semibold text-sm">
                                    €{negocioPleno.valores.valorAcordado.toLocaleString('pt-PT')}
                                </p>
                            </div>
                        )}
                        {negocioPleno.comissoes?.valorTotal > 0 && (
                            <div className="text-center p-2 bg-white/50 rounded">
                                <p className="text-xs text-gray-600">Comissão</p>
                                <p className="font-semibold text-sm">
                                    €{negocioPleno.comissoes.valorTotal.toLocaleString('pt-PT')}
                                </p>
                            </div>
                        )}
                        {negocioPleno.valores.sinal > 0 && (
                            <div className="text-center p-2 bg-white/50 rounded">
                                <p className="text-xs text-gray-600">Sinal</p>
                                <p className="font-semibold text-sm">
                                    €{negocioPleno.valores.sinal.toLocaleString('pt-PT')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Detalhes expandidos */}
                {showDetails && variant === 'detailed' && negocioPleno && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        {/* Timeline resumida */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-900 mb-2">Progresso</h5>
                            <div className="space-y-2">
                                {/* Estados principais */}
                                <div className="flex items-center gap-2">
                                    <CheckBadgeIcon className={`w-4 h-4 ${['proposta', 'negociacao', 'contraproposta'].includes(negocioPleno.estado) ||
                                            negocioPleno.estado.includes('cpcv') ||
                                            negocioPleno.estado.includes('escritura') ||
                                            negocioPleno.estado === 'concluido'
                                            ? 'text-green-500' : 'text-gray-300'
                                        }`} />
                                    <span className="text-sm">Proposta</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckBadgeIcon className={`w-4 h-4 ${negocioPleno.estado.includes('cpcv') ||
                                            negocioPleno.estado.includes('escritura') ||
                                            negocioPleno.estado === 'concluido'
                                            ? 'text-green-500' : 'text-gray-300'
                                        }`} />
                                    <span className="text-sm">CPCV</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckBadgeIcon className={`w-4 h-4 ${negocioPleno.estado.includes('escritura') ||
                                            negocioPleno.estado === 'concluido'
                                            ? 'text-green-500' : 'text-gray-300'
                                        }`} />
                                    <span className="text-sm">Escritura</span>
                                </div>
                            </div>
                        </div>

                        {/* Datas importantes */}
                        {negocioPleno.prazos && (
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">Prazos</h5>
                                <div className="space-y-1">
                                    {negocioPleno.prazos.prazoAssinaturaCPCV && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                CPCV: {new Date(negocioPleno.prazos.prazoAssinaturaCPCV).toLocaleDateString('pt-PT')}
                                            </span>
                                        </div>
                                    )}
                                    {negocioPleno.prazos.prazoEscritura && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                Escritura: {new Date(negocioPleno.prazos.prazoEscritura).toLocaleDateString('pt-PT')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Checklist resumido */}
                        {negocioPleno.checklist && (
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-2">Checklist</h5>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-sm">
                                        <span className={negocioPleno.checklist.documentacaoVendedorCompleta ? 'text-green-600' : 'text-gray-400'}>
                                            {negocioPleno.checklist.documentacaoVendedorCompleta ? '✓' : '○'} Doc. Vendedor
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className={negocioPleno.checklist.documentacaoCompradorCompleta ? 'text-green-600' : 'text-gray-400'}>
                                            {negocioPleno.checklist.documentacaoCompradorCompleta ? '✓' : '○'} Doc. Comprador
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className={negocioPleno.checklist.creditoAprovado ? 'text-green-600' : 'text-gray-400'}>
                                            {negocioPleno.checklist.creditoAprovado ? '✓' : '○'} Crédito
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className={negocioPleno.checklist.escrituraAgendada ? 'text-green-600' : 'text-gray-400'}>
                                            {negocioPleno.checklist.escrituraAgendada ? '✓' : '○'} Escritura
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botão para ver detalhes completos */}
                        <div className="pt-3">
                            <button
                                onClick={handleNavigate}
                                className="w-full px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                            >
                                Ver Negócio Pleno Completo
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            {/* Alert para oportunidades vendedoras não linkadas */}
            {!opportunity.isNegocioPleno && (opportunity.tipo === 'vendedor' || opportunity.tipo === 'senhorio') && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800">Oportunidade não linkada</p>
                            <p className="text-yellow-700 mt-1">
                                Esta oportunidade vendedora pode ser linkada a uma oportunidade compradora para criar um negócio pleno.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NegocioPlenoBadge;