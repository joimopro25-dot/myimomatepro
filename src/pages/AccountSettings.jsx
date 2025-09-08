/**
 * ACCOUNT SETTINGS PAGE - MyImoMatePro
 * Página de configurações da conta com layout unificado
 * MODIFICAÇÃO: Integrado com Layout component e Sidebar
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import Layout from '../components/Layout';
import {
    CreditCardIcon,
    CalendarIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    XCircleIcon,
    ChartBarIcon,
    UsersIcon,
    BriefcaseIcon,
    CurrencyEuroIcon
} from '@heroicons/react/24/outline';

const planos = [
    {
        nome: 'Rookie',
        preco: '5',
        precoAnual: '50',
        limiteClientes: 50,
        features: ['Até 50 clientes', 'Gestão básica de leads', '3 tipos de oportunidades', 'Relatórios básicos', 'Suporte por email']
    },
    {
        nome: 'Professional',
        preco: '9',
        precoAnual: '90',
        limiteClientes: 200,
        features: ['Até 200 clientes', 'Todos os tipos de oportunidades', 'Deals plenos', 'Automações avançadas', 'Relatórios completos', 'Suporte prioritário']
    },
    {
        nome: 'Shark',
        preco: '25',
        precoAnual: '250',
        limiteClientes: 'unlimited',
        features: ['Clientes ilimitados', 'Tudo do Professional', 'Multi-utilizador', 'API personalizada', 'Suporte dedicado', 'Formação personalizada']
    }
];

export default function AccountSettings() {
    const { currentUser } = useAuth();
    const {
        subscription,
        stats,
        updatePaymentMethod,
        cancelSubscription,
        changeBillingCycle,
        changePlan,
        getTrialDaysLeft,
        getDaysUntilNextPayment,
        getClientUsagePercentage,
        getVolumeUsagePercentage,
        formatCurrency
    } = useSubscription();

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCancelSubscription = async () => {
        setLoading(true);
        try {
            await cancelSubscription();
            setShowCancelModal(false);
        } catch (error) {
            console.error('Erro ao cancelar subscrição:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeBillingCycle = async (ciclo) => {
        setLoading(true);
        try {
            await changeBillingCycle(ciclo);
        } catch (error) {
            console.error('Erro ao alterar ciclo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePlan = async (plano) => {
        setLoading(true);
        try {
            await changePlan(plano);
        } catch (error) {
            console.error('Erro ao alterar plano:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!subscription) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sem subscrição ativa</h2>
                        <p className="text-gray-600">Por favor, selecione um plano para continuar.</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const trialDaysLeft = getTrialDaysLeft();
    const daysUntilPayment = getDaysUntilNextPayment();
    const isTrialActive = subscription.trial && trialDaysLeft > 0;

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Conta</h1>
                    <p className="text-gray-600">Gerir o seu plano e configurações de pagamento</p>
                </div>

                {/* Estatísticas e Limites */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Clientes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
                                    <p className="text-sm text-gray-500">
                                        {subscription.limiteClientes === 'unlimited' ? 'Clientes' : `de ${subscription.limiteClientes} clientes`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {subscription.limiteClientes !== 'unlimited' && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getClientUsagePercentage() > 90 ? 'bg-red-500' :
                                        getClientUsagePercentage() > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${getClientUsagePercentage()}%` }}
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Negócios */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <BriefcaseIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalNegocios}</p>
                                    <p className="text-sm text-gray-500">Negócios</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Volume de Negócios */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <CurrencyEuroIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">€{stats.valorNegocios.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">
                                        {subscription.limiteVolumeNegocios === 'unlimited' ? 'Volume' : `de ${formatCurrency(subscription.limiteVolumeNegocios)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {subscription.limiteVolumeNegocios !== 'unlimited' && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${getVolumeUsagePercentage() > 90 ? 'bg-red-500' :
                                        getVolumeUsagePercentage() > 75 ? 'bg-yellow-500' : 'bg-purple-500'
                                        }`}
                                    style={{ width: `${getVolumeUsagePercentage()}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alertas Trial e Limites */}
                {(isTrialActive || trialDaysLeft < 0) && (
                    <div className={`mb-8 p-4 rounded-lg border ${isTrialActive ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className={`w-5 h-5 ${isTrialActive ? 'text-blue-600' : 'text-red-600'} mr-3`} />
                            <div>
                                <h3 className={`font-medium ${isTrialActive ? 'text-blue-900' : 'text-red-900'}`}>
                                    {isTrialActive ? 'Trial Ativo' : 'Trial Expirado'}
                                </h3>
                                <p className={`text-sm ${isTrialActive ? 'text-blue-700' : 'text-red-700'}`}>
                                    {isTrialActive
                                        ? `Restam ${trialDaysLeft} dias do seu período de teste.`
                                        : 'O seu período de teste expirou. Por favor, selecione um plano.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Detalhes da Subscrição */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes da Subscrição</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plano Atual</span>
                                <span className="font-medium text-gray-900">{subscription.plano}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Preço</span>
                                <span className="font-medium text-gray-900">
                                    €{subscription.preco}/{subscription.ciclo === 'mensal' ? 'mês' : 'ano'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Próximo Pagamento</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(subscription.proximoPagamento.toDate()).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subscription.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                        subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {subscription.status === 'ativo' ? 'Ativo' :
                                        subscription.status === 'trial' ? 'Trial' : 'Inativo'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 mb-3">Opções de Faturação</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleChangeBillingCycle('mensal')}
                                    disabled={loading || subscription.ciclo === 'mensal'}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${subscription.ciclo === 'mensal'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>Faturação Mensal</span>
                                        {subscription.ciclo === 'mensal' && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleChangeBillingCycle('anual')}
                                    disabled={loading || subscription.ciclo === 'anual'}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${subscription.ciclo === 'anual'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>Faturação Anual</span>
                                        <span className="text-sm text-green-600 font-medium">
                                            2 meses grátis
                                        </span>
                                        {subscription.ciclo === 'anual' && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mudança de Plano */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Planos Disponíveis</h2>

                        <div className="space-y-4">
                            {planos.map((plano) => (
                                <div
                                    key={plano.nome}
                                    className={`p-4 rounded-lg border transition-colors ${subscription.plano === plano.nome
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{plano.nome}</h3>
                                            <p className="text-sm text-gray-600">
                                                €{subscription.ciclo === 'anual' ? plano.precoAnual : plano.preco}
                                                /{subscription.ciclo === 'anual' ? 'ano' : 'mês'}
                                            </p>
                                        </div>
                                        {subscription.plano === plano.nome ? (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <button
                                                onClick={() => handleChangePlan(plano.nome)}
                                                disabled={loading}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Selecionar'}
                                            </button>
                                        )}
                                    </div>

                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {plano.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <CheckCircleIcon className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gestão de Pagamento */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestão de Pagamento</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                            <CreditCardIcon className="w-5 h-5 text-gray-600" />
                            <span>Atualizar Método de Pagamento</span>
                        </button>

                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center justify-center space-x-2 p-4 border border-red-300 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
                        >
                            <XCircleIcon className="w-5 h-5" />
                            <span>Cancelar Subscrição</span>
                        </button>
                    </div>
                </div>

                {/* Modal Cancelar Subscrição */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancelar Subscrição</h3>
                            <p className="text-gray-600 mb-6">
                                Tem a certeza que deseja cancelar a sua subscrição? Esta ação não pode ser desfeita.
                            </p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Manter Subscrição
                                </button>
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" /> : 'Cancelar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Método de Pagamento */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Atualizar Método de Pagamento</h3>
                            <p className="text-gray-600 mb-6">
                                Esta funcionalidade estará disponível em breve. Por favor, contacte o suporte para atualizar o seu método de pagamento.
                            </p>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}