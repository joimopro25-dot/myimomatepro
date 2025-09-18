/**
 * BADGE DE NEGÓCIO PLENO
 * Componente para mostrar quando uma oportunidade está em Negócio Pleno
 * Aparece tanto em oportunidades vendedoras quanto compradoras
 * Caminho: src/components/opportunities/NegocioPlenoBadge.jsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, LinkIcon } from '@heroicons/react/24/solid';
//import { formatCurrency } from '../../models/negocioPlenoModel';

// Função auxiliar para formatar valores
const formatCurrency = (value) => {
    return (value || 0).toLocaleString('pt-PT');
};

const NegocioPlenoBadge = ({ opportunity, size = 'normal', showDetails = false }) => {
    const navigate = useNavigate();

    // Verificar se tem negócio pleno
    if (!opportunity?.isNegocioPleno && !opportunity?.negocioPlenoId) {
        return null;
    }

    // Versão compacta (para listas)
    if (size === 'small') {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/negocio-pleno/${opportunity.negocioPlenoId}`);
                }}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-full cursor-pointer hover:from-purple-600 hover:to-indigo-700 transition-colors shadow-md"
                title="Negócio Pleno - Clique para ver detalhes"
            >
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>NEGÓCIO PLENO</span>
            </div>
        );
    }

    // Versão normal (para cards)
    if (size === 'normal') {
        return (
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/negocio-pleno/${opportunity.negocioPlenoId}`);
                }}
                className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg cursor-pointer hover:from-purple-100 hover:to-indigo-100 transition-colors"
            >
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                    <div>
                        <p className="text-sm font-bold text-purple-900">NEGÓCIO PLENO</p>
                        {showDetails && opportunity.linkedOpportunityClientName && (
                            <p className="text-xs text-purple-700">
                                {opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer'
                                    ? `Vendedor: ${opportunity.linkedOpportunityClientName}`
                                    : `Comprador: ${opportunity.linkedOpportunityClientName}`
                                }
                            </p>
                        )}
                    </div>
                </div>
                <LinkIcon className="w-4 h-4 text-purple-500" />
            </div>
        );
    }

    // Versão grande (para página de detalhe)
    return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">NEGÓCIO PLENO</h2>
                            {opportunity.negocioPlenoStatus && (
                                <p className="text-purple-100 text-sm">
                                    {opportunity.negocioPlenoStatus.replace(/_/g, ' ').toUpperCase()}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/negocio-pleno/${opportunity.negocioPlenoId}`)}
                        className="px-6 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2"
                    >
                        <span>Ver Negócio Completo</span>
                        <LinkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Informações do Link */}
                {showDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <p className="text-purple-200 text-sm">
                                {opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer'
                                    ? 'Vendedor'
                                    : 'Comprador'
                                }
                            </p>
                            <p className="text-white font-semibold mt-1">
                                {opportunity.linkedOpportunityClientName || 'N/A'}
                            </p>
                        </div>

                        {opportunity.valores?.valorAcordado && (
                            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                <p className="text-purple-200 text-sm">Valor Acordado</p>
                                <p className="text-white font-semibold mt-1 text-xl">
                                    €{formatCurrency(opportunity.valores.valorAcordado)}
                                </p>
                            </div>
                        )}

                        {opportunity.metricas?.diasDesdeLink && (
                            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                                <p className="text-purple-200 text-sm">Tempo de Negócio</p>
                                <p className="text-white font-semibold mt-1">
                                    {opportunity.metricas.diasDesdeLink} dias
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Alerta Visual */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2">
                <p className="text-center text-sm font-medium text-white">
                    ⚡ Este negócio está a ser gerido de forma unificada
                </p>
            </div>
        </div>
    );
};

export default NegocioPlenoBadge;