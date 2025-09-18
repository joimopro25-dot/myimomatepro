/**
 * OPPORTUNITY DETAIL PAGE - MyImoMatePro
 * Página de detalhes de oportunidade com suporte para Negócios Plenos
 * ATUALIZADO: Integração com sistema de Negócios Plenos
 * 
 * Caminho: src/pages/OpportunityDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import Layout from '../components/Layout';
// NOVO: Imports dos componentes de Negócio Pleno
import LinkNegocioPlenoButton from '../components/opportunities/LinkNegocioPlenoButton';
import NegocioPlenoBadge from '../components/opportunities/NegocioPlenoBadge';
import {
    ArrowLeftIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    CalendarIcon,
    CurrencyEuroIcon,
    UserIcon,
    TagIcon,
    ClockIcon,
    MapPinIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../models/opportunityModel';

const OpportunityDetail = () => {
    const navigate = useNavigate();
    const { clientId, opportunityId } = useParams();
    const { currentUser } = useAuth();
    const { fetchOpportunity } = useOpportunities();

    // Estados
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carregar dados da oportunidade
    useEffect(() => {
        loadOpportunityData();
    }, [clientId, opportunityId]);

    const loadOpportunityData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOpportunity(currentUser.uid, clientId, opportunityId);
            setOpportunity(data);
        } catch (err) {
            console.error('Erro ao carregar oportunidade:', err);
            setError('Erro ao carregar dados da oportunidade');
        } finally {
            setLoading(false);
        }
    };

    // Função para recarregar após criar Negócio Pleno
    const handleNegocioPlenoCreated = () => {
        loadOpportunityData();
    };

    // Loading
    if (loading) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Erro ou não encontrado
    if (error || !opportunity) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || 'Oportunidade não encontrada'}
                        </h1>
                        <button
                            onClick={() => navigate(`/clients/${clientId}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            Voltar ao Cliente
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // Determinar cores baseadas no tipo
    const typeColors = {
        vendedor: 'bg-blue-100 text-blue-800 border-blue-200',
        seller: 'bg-blue-100 text-blue-800 border-blue-200',
        comprador: 'bg-green-100 text-green-800 border-green-200',
        buyer: 'bg-green-100 text-green-800 border-green-200',
        senhorio: 'bg-purple-100 text-purple-800 border-purple-200',
        landlord: 'bg-purple-100 text-purple-800 border-purple-200',
        inquilino: 'bg-orange-100 text-orange-800 border-orange-200',
        tenant: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    const typeLabels = {
        vendedor: 'Vendedor',
        seller: 'Vendedor',
        comprador: 'Comprador',
        buyer: 'Comprador',
        senhorio: 'Senhorio',
        landlord: 'Senhorio',
        inquilino: 'Inquilino',
        tenant: 'Inquilino'
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/clients/${clientId}`)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Voltar ao Cliente
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {opportunity.titulo || 'Oportunidade'}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${typeColors[opportunity.tipo] || 'bg-gray-100 text-gray-800'}`}>
                                    {typeLabels[opportunity.tipo] || opportunity.tipo}
                                </span>
                                <span className="text-gray-500">
                                    <UserIcon className="w-4 h-4 inline mr-1" />
                                    {opportunity.clienteName || 'Cliente'}
                                </span>
                                <span className="text-gray-500">
                                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                                    {opportunity.createdAt ? new Date(opportunity.createdAt.seconds * 1000).toLocaleDateString('pt-PT') : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/clients/${clientId}/opportunities/${opportunityId}/edit`)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== NOVO: Badge de Negócio Pleno (se já existir) ===== */}
                {opportunity.isNegocioPleno && (
                    <div className="mb-6">
                        <NegocioPlenoBadge
                            opportunity={opportunity}
                            size="large"
                            showDetails={true}
                        />
                    </div>
                )}

                {/* ===== NOVO: Botão para criar Negócio Pleno (apenas para compradores sem link) ===== */}
                {!opportunity.isNegocioPleno &&
                    (opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer') && (
                        <div className="mb-6">
                            <LinkNegocioPlenoButton
                                opportunity={opportunity}
                                onLinked={handleNegocioPlenoCreated}
                            />
                        </div>
                    )}

                {/* ===== NOVO: Aviso informativo para vendedores sem link ===== */}
                {!opportunity.isNegocioPleno &&
                    (opportunity.tipo === 'vendedor' || opportunity.tipo === 'seller') && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Oportunidade Vendedora
                                    </h3>
                                    <p className="mt-1 text-sm text-blue-700">
                                        Esta oportunidade pode ser linkada a um comprador para criar um Negócio Pleno.
                                        O comprador deverá iniciar o processo de linking.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Grid de informações principais */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card de Informações Básicas */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Informações Gerais
                            </h2>

                            <div className="space-y-4">
                                {opportunity.descricao && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                        <p className="mt-1 text-gray-900">{opportunity.descricao}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                                        <p className="mt-1">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                {opportunity.estado || 'lead'}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                                        <p className="mt-1">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {opportunity.prioridade || 'media'}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Dados específicos do tipo */}
                                {(opportunity.tipo === 'vendedor' || opportunity.tipo === 'seller') && opportunity.imovelVenda && (
                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium text-gray-900 mb-3">Imóvel à Venda</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {opportunity.imovelVenda.referencia && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Referência</label>
                                                    <p className="mt-1 text-gray-900">{opportunity.imovelVenda.referencia}</p>
                                                </div>
                                            )}
                                            {opportunity.imovelVenda.tipologia && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Tipologia</label>
                                                    <p className="mt-1 text-gray-900">{opportunity.imovelVenda.tipologia}</p>
                                                </div>
                                            )}
                                            {opportunity.imovelVenda.morada && (
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        <MapPinIcon className="w-4 h-4 inline mr-1" />
                                                        Morada
                                                    </label>
                                                    <p className="mt-1 text-gray-900">{opportunity.imovelVenda.morada}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer') && opportunity.imoveis && opportunity.imoveis.length > 0 && (
                                    <div className="pt-4 border-t">
                                        <h3 className="font-medium text-gray-900 mb-3">Imóveis de Interesse</h3>
                                        <div className="space-y-2">
                                            {opportunity.imoveis.map((imovel, index) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                    <p className="font-medium">{imovel.referencia || `Imóvel ${index + 1}`}</p>
                                                    {imovel.morada && (
                                                        <p className="text-sm text-gray-600 mt-1">{imovel.morada}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card de Timeline */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Timeline
                            </h2>

                            {opportunity.timeline && opportunity.timeline.length > 0 ? (
                                <div className="space-y-3">
                                    {opportunity.timeline.slice(-5).reverse().map((event, index) => (
                                        <div key={index} className="flex items-start space-x-3 text-sm">
                                            <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-gray-900">{event.titulo || event.tipo}</p>
                                                {event.descricao && (
                                                    <p className="text-gray-500">{event.descricao}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {event.data ? new Date(event.data).toLocaleString('pt-PT') : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Sem eventos registados</p>
                            )}
                        </div>
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">
                        {/* Card de Valores */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Valores
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor Estimado</label>
                                    <p className="mt-1 text-2xl font-bold text-green-600">
                                        €{formatCurrency(opportunity.valorEstimado || 0)}
                                    </p>
                                </div>

                                {opportunity.comissaoEstimada && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Comissão Estimada</label>
                                        <p className="mt-1 text-lg font-semibold text-indigo-600">
                                            €{formatCurrency(opportunity.comissaoEstimada)}
                                        </p>
                                    </div>
                                )}

                                {/* Valores específicos para vendedor */}
                                {(opportunity.tipo === 'vendedor' || opportunity.tipo === 'seller') && opportunity.vendedor?.valorPedido && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Valor Pedido</label>
                                        <p className="mt-1 text-lg font-semibold text-gray-900">
                                            €{formatCurrency(opportunity.vendedor.valorPedido)}
                                        </p>
                                    </div>
                                )}

                                {/* Valores específicos para comprador */}
                                {(opportunity.tipo === 'comprador' || opportunity.tipo === 'buyer') && opportunity.comprador && (
                                    <>
                                        {opportunity.comprador.valorMinimo && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Orçamento</label>
                                                <p className="mt-1 text-gray-900">
                                                    €{formatCurrency(opportunity.comprador.valorMinimo)} - €{formatCurrency(opportunity.comprador.valorMaximo || 0)}
                                                </p>
                                            </div>
                                        )}
                                        {opportunity.comprador.necessitaCredito && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Crédito</label>
                                                <p className="mt-1 text-gray-900">
                                                    €{formatCurrency(opportunity.comprador.valorCredito || 0)}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Card de Métricas */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Métricas
                            </h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Imóveis</span>
                                    <span className="font-semibold">{opportunity.totalImoveis || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Visitas</span>
                                    <span className="font-semibold">{opportunity.totalVisitas || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Total Ofertas</span>
                                    <span className="font-semibold">{opportunity.totalOfertas || 0}</span>
                                </div>
                                {opportunity.temCPCV && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">CPCV</span>
                                        <span className="text-green-600 font-semibold">✓ Sim</span>
                                    </div>
                                )}
                                {opportunity.temEscritura && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Escritura</span>
                                        <span className="text-green-600 font-semibold">✓ Sim</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card de Datas */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Datas Importantes
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <label className="block text-gray-600">Criada em</label>
                                    <p className="font-medium">
                                        {opportunity.createdAt
                                            ? new Date(opportunity.createdAt.seconds * 1000).toLocaleDateString('pt-PT')
                                            : 'N/A'}
                                    </p>
                                </div>
                                {opportunity.dataFechoEsperado && (
                                    <div>
                                        <label className="block text-gray-600">Fecho Esperado</label>
                                        <p className="font-medium">
                                            {new Date(opportunity.dataFechoEsperado).toLocaleDateString('pt-PT')}
                                        </p>
                                    </div>
                                )}
                                {opportunity.updatedAt && (
                                    <div>
                                        <label className="block text-gray-600">Última Atualização</label>
                                        <p className="font-medium">
                                            {new Date(opportunity.updatedAt.seconds * 1000).toLocaleDateString('pt-PT')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OpportunityDetail;