/**
 * DASHBOARD PAGE - MyImoMatePro
 * Página principal do dashboard com layout unificado
 * VERSÃO ATUALIZADA - Com métricas de Negócios Plenos
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNegocioPleno } from '../contexts/NegocioPlenoContext';
import Layout from '../components/Layout';
import {
    ChartBarIcon,
    UsersIcon,
    BriefcaseIcon,
    CurrencyEuroIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    SparklesIcon,  // NOVO: Para Negócios Plenos
    LinkIcon,       // NOVO: Para indicar linking
    BoltIcon,       // NOVO: Para indicar ação rápida
    FireIcon        // NOVO: Para indicar hot deals
} from '@heroicons/react/24/outline';
import {
    SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const {
        subscription,
        stats,
        getTrialDaysLeft,
        isAnyLimitReached,
        getClientUsagePercentage,
        getVolumeUsagePercentage
    } = useSubscription();

    // NOVO: Contexto de Negócios Plenos
    const { fetchNegocioPlenoStats } = useNegocioPleno();
    const [negocioPlenoStats, setNegocioPlenoStats] = useState({
        total: 0,
        emProgresso: 0,
        concluidos: 0,
        valorTotal: 0,
        taxaConversao: 0,
        ultimosNegocios: []
    });

    // NOVO: Carregar estatísticas de Negócios Plenos
    useEffect(() => {
        loadNegocioPlenoStats();
    }, [currentUser]);

    const loadNegocioPlenoStats = async () => {
        if (currentUser?.uid && fetchNegocioPlenoStats) {
            try {
                const stats = await fetchNegocioPlenoStats(currentUser.uid);
                setNegocioPlenoStats(stats);
            } catch (error) {
                console.error('Erro ao carregar stats de Negócios Plenos:', error);
            }
        }
    };

    const trialDaysLeft = getTrialDaysLeft();
    const isTrialActive = subscription?.trial && trialDaysLeft > 0;
    const limitReached = isAnyLimitReached();

    // Estatísticas para os cards - ATUALIZADO com Negócio Pleno
    const dashboardStats = [
        {
            name: 'Total Clientes',
            value: stats?.totalClientes || 0,
            change: '+12%',
            changeType: 'positive',
            icon: UsersIcon,
            color: 'blue',
            limit: subscription?.limiteClientes,
            percentage: getClientUsagePercentage(),
            href: '/clients'
        },
        {
            name: 'Oportunidades',
            value: stats?.totalNegocios || 0,
            change: '+5%',
            changeType: 'positive',
            icon: BriefcaseIcon,
            color: 'green',
            href: '/clients'
        },
        // NOVO: Card de Negócios Plenos
        {
            name: 'Negócios Plenos',
            value: negocioPlenoStats?.total || 0,
            subValue: negocioPlenoStats?.emProgresso || 0,
            subLabel: 'em progresso',
            change: negocioPlenoStats?.taxaConversao ? `${negocioPlenoStats.taxaConversao}%` : '0%',
            changeLabel: 'taxa conversão',
            changeType: 'positive',
            icon: SparklesIcon,
            color: 'purple',
            isSpecial: true,
            href: '/negocio-pleno'
        },
        {
            name: 'Volume de Negócios',
            value: `€${(stats?.valorNegocios || 0).toLocaleString()}`,
            change: '+18%',
            changeType: 'positive',
            icon: CurrencyEuroIcon,
            color: 'orange',
            limit: subscription?.limiteVolumeNegocios,
            percentage: getVolumeUsagePercentage()
        }
    ];

    const getStatCardStyle = (color) => {
        const colors = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-indigo-600',  // Gradient especial para Negócios Plenos
            orange: 'from-orange-500 to-orange-600'
        };
        return colors[color] || colors.blue;
    };

    // NOVO: Função para obter status do Negócio Pleno
    const getNegocioPlenoStatusColor = (status) => {
        const colors = {
            'linked': 'bg-purple-100 text-purple-800',
            'negotiation': 'bg-yellow-100 text-yellow-800',
            'proposal': 'bg-orange-100 text-orange-800',
            'accepted': 'bg-green-100 text-green-800',
            'cpcv_signed': 'bg-blue-100 text-blue-800',
            'deed_scheduled': 'bg-indigo-100 text-indigo-800',
            'completed': 'bg-emerald-100 text-emerald-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="p-6">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bem-vindo de volta, {currentUser?.displayName?.split(' ')[0] || 'Consultor'}! 👋
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Aqui está um resumo da sua atividade de hoje
                    </p>
                </div>

                {/* NOVO: Alerta de Negócios Plenos em destaque */}
                {negocioPlenoStats?.emProgresso > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <SparklesIcon className="w-6 h-6 text-purple-600 mr-3" />
                                <div>
                                    <h3 className="font-medium text-purple-900">
                                        {negocioPlenoStats.emProgresso} Negócios Plenos em Progresso
                                    </h3>
                                    <p className="text-sm text-purple-700">
                                        Valor potencial: €{(negocioPlenoStats.valorTotal || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/negocio-pleno"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Ver Todos
                            </Link>
                        </div>
                    </div>
                )}

                {/* Alertas Existentes */}
                {isTrialActive && (
                    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mr-3" />
                            <div>
                                <h3 className="font-medium text-blue-900">
                                    Período de Teste Ativo
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Restam {trialDaysLeft} dias do seu período de teste gratuito.
                                    <Link to="/account" className="font-medium hover:underline ml-1">
                                        Escolha o seu plano →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {limitReached && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3" />
                            <div>
                                <h3 className="font-medium text-yellow-900">
                                    Limite Atingido
                                </h3>
                                <p className="text-sm text-yellow-700">
                                    Atingiu o limite do seu plano atual.
                                    <Link to="/account" className="font-medium hover:underline ml-1">
                                        Fazer upgrade →
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estatísticas Principais - ATUALIZADO */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {dashboardStats.map((stat) => {
                        const Icon = stat.icon;
                        const isClickable = stat.href;

                        const CardComponent = isClickable ? Link : 'div';
                        const cardProps = isClickable ? { to: stat.href } : {};

                        return (
                            <CardComponent
                                key={stat.name}
                                {...cardProps}
                                className={`bg-white rounded-xl p-6 shadow-sm border ${stat.isSpecial ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'
                                    } ${isClickable ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''
                                    } transition-all duration-200 relative overflow-hidden`}
                            >
                                {/* Badge especial para Negócios Plenos */}
                                {stat.isSpecial && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                                        HOT
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${getStatCardStyle(stat.color)} rounded-lg flex items-center justify-center ${stat.isSpecial ? 'shadow-lg' : ''
                                            }`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {stat.value}
                                                {stat.subValue !== undefined && (
                                                    <span className="text-sm font-normal text-purple-600 ml-2">
                                                        ({stat.subValue} {stat.subLabel})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500">{stat.name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de progresso para limites */}
                                {stat.limit && stat.limit !== 'unlimited' && stat.percentage !== undefined && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Utilização</span>
                                            <span>{stat.percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${getStatCardStyle(stat.color)}`}
                                                style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Indicador de mudança */}
                                {stat.change && (
                                    <div className="mt-2 flex items-center">
                                        <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            {stat.changeLabel || 'vs mês anterior'}
                                        </span>
                                    </div>
                                )}
                            </CardComponent>
                        );
                    })}
                </div>

                {/* NOVO: Seção de Negócios Plenos Recentes */}
                {negocioPlenoStats?.ultimosNegocios?.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <SparklesIconSolid className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Negócios Plenos Recentes
                                </h2>
                            </div>
                            <Link
                                to="/negocio-pleno"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                                Ver todos →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {negocioPlenoStats.ultimosNegocios.slice(0, 3).map((negocio) => (
                                <Link
                                    key={negocio.id}
                                    to={`/negocio-pleno/${negocio.id}`}
                                    className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNegocioPlenoStatusColor(negocio.status)
                                            }`}>
                                            {negocio.statusLabel}
                                        </span>
                                        <LinkIcon className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <p className="font-semibold text-gray-900 mb-1">
                                        {negocio.compradorNome} ↔ {negocio.vendedorNome}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        €{(negocio.valorAcordado || 0).toLocaleString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ações Rápidas - ATUALIZADO */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Getting Started - ATUALIZADO */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                        <h2 className="text-xl font-semibold mb-2">Começar a usar o MyImoMatePro</h2>
                        <p className="text-blue-100 mb-4">
                            Complete a configuração inicial para aproveitar ao máximo o seu CRM
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="w-3 h-3 font-bold text-white" />
                                </div>
                                <span className="text-sm">Conta criada e configurada</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <span className="text-sm">Adicione o seu primeiro cliente</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold">3</span>
                                </div>
                                <span className="text-sm">Crie o seu primeiro Negócio Pleno</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Link
                                to="/clients/new"
                                className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Adicionar Cliente
                            </Link>
                            {stats?.totalClientes > 0 && (
                                <Link
                                    to="/clients"
                                    className="inline-flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-800 transition-colors"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Criar Negócio Pleno
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Atividade Recente - ATUALIZADO */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h2>

                        <div className="space-y-4">
                            {/* Atividades de Negócios Plenos */}
                            {negocioPlenoStats?.ultimosNegocios?.length > 0 && (
                                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <SparklesIcon className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            Novo Negócio Pleno criado
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {negocioPlenoStats.ultimosNegocios[0]?.compradorNome}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        Recente
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UsersIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Sistema iniciado</p>
                                    <p className="text-xs text-gray-500">Bem-vindo ao MyImoMatePro</p>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    Agora
                                </div>
                            </div>

                            {stats?.totalClientes === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500 mb-3">
                                        Adicione o seu primeiro cliente para começar a ver atividade aqui
                                    </p>
                                    <Link
                                        to="/clients/new"
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Adicionar Cliente
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas - Links ATUALIZADO */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link
                            to="/clients/new"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                                <PlusIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Novo Cliente</p>
                                <p className="text-sm text-gray-500">Adicionar à carteira</p>
                            </div>
                        </Link>

                        <Link
                            to="/clients"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                                <UsersIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Ver Clientes</p>
                                <p className="text-sm text-gray-500">Gerir carteira</p>
                            </div>
                        </Link>

                        {/* NOVO: Link para Negócios Plenos */}
                        <Link
                            to="/negocio-pleno"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 rounded-lg flex items-center justify-center transition-colors">
                                <SparklesIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Negócios Plenos</p>
                                <p className="text-sm text-gray-500">Gerir negócios</p>
                            </div>
                        </Link>

                        <Link
                            to="/account"
                            className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Configurações</p>
                                <p className="text-sm text-gray-500">Gerir conta</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}