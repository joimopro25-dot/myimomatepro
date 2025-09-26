/**
 * ACCOUNT SETTINGS PAGE - MyImoMatePro
 * Account settings page with unified layout
 * MODIFICATION: Integrated with Layout component and Sidebar
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

const plans = [
    {
        name: 'Rookie',
        price: 5,
        annualPrice: 50,
        clientLimit: 50,
        features: ['Até 50 clientes', 'Gestão básica de leads', '3 tipos de oportunidades', 'Relatórios básicos', 'Suporte por email']
    },
    {
        name: 'Professional',
        price: 9,
        annualPrice: 90,
        clientLimit: 200,
        features: ['Até 200 clientes', 'Todos os tipos de oportunidades', 'Deals plenos', 'Automações avançadas', 'Relatórios completos', 'Suporte prioritário']
    },
    {
        name: 'Shark',
        price: 25,
        annualPrice: 250,
        clientLimit: 'unlimited',
        features: ['Clientes ilimitados', 'Tudo do Professional', 'Multi-utilizador', 'API personalizada', 'Suporte dedicado', 'Formação personalizada']
    }
];

export default function AccountSettings() {
  const {
    subscription,
    stats,
    getTrialDaysLeft,
    getDaysUntilNextPayment,   // <-- added
    getVolumeUsagePercentage,
    isVolumeLimitReached,
    isAnyLimitReached,
    changePlan,
    changeBillingCycle,
    cancelSubscription,
    updatePaymentMethod,
    formatCurrency
  } = useSubscription(); // removed: getClientUsagePercentage, isClientLimitReached

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCancelSubscription = async () => {
        setLoading(true);
        try {
            await cancelSubscription();
            setShowCancelModal(false);
        } catch (error) {
            console.error('Error cancelling subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeBillingCycle = async (cycle) => {
        setLoading(true);
        try {
            await changeBillingCycle(cycle);
        } catch (error) {
            console.error('Error changing cycle:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePlan = async (plan) => {
        setLoading(true);
        try {
            await changePlan(plan);
        } catch (error) {
            console.error('Error changing plan:', error);
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
    const daysUntilPayment = getDaysUntilNextPayment(); // still available if you display it
    const isTrialActive = subscription.trial && trialDaysLeft > 0;

    // Helper to safely format Firestore Timestamp or Date
    function formatNextPayment(dt) {
      if (!dt) return '-';
      if (typeof dt.toDate === 'function') {
        return dt.toDate().toLocaleDateString();
      }
      if (dt instanceof Date) {
        return dt.toLocaleDateString();
      }
      return '-';
    }

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Conta</h1>
                    <p className="text-gray-600">Gerir o seu plano e configurações de pagamento</p>
                </div>

                {/* Statistics and Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Deals */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                    <BriefcaseIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
                                    <p className="text-sm text-gray-500">Negócios</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Volume */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <CurrencyEuroIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">€{stats.businessVolume.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">
                                        {subscription.volumeLimit === 'unlimited' ? 'Volume' : `de ${formatCurrency(subscription.volumeLimit)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {subscription.volumeLimit !== 'unlimited' && (
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

                {/* Trial and Limit Alerts */}
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
                    {/* Subscription Details */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes da Subscrição</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plano Atual</span>
                                <span className="font-medium text-gray-900">{subscription.plan}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Preço</span>
                                <span className="font-medium text-gray-900">
                                    €{subscription.price}/{subscription.cycle === 'monthly' ? 'mês' : 'ano'}
                                </span>
                            </div>

                            {/* Próximo Pagamento */}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Próximo Pagamento</span>
                                <span className="font-medium text-gray-900">
                                  {formatNextPayment(subscription.nextPayment)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                    subscription.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {subscription.status === 'active' ? 'Ativo' :
                                     subscription.status === 'trial' ? 'Trial' : 'Inativo'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900 mb-3">Opções de Faturação</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleChangeBillingCycle('monthly')}
                                    disabled={loading || subscription.cycle === 'monthly'}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        subscription.cycle === 'monthly'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>Faturação Mensal</span>
                                        {subscription.cycle === 'monthly' && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleChangeBillingCycle('annual')}
                                    disabled={loading || subscription.cycle === 'annual'}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        subscription.cycle === 'annual'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>Faturação Anual</span>
                                        <span className="text-sm text-green-600 font-medium">
                                            2 meses grátis
                                        </span>
                                        {subscription.cycle === 'annual' && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Change Plan */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Planos Disponíveis</h2>

                        <div className="space-y-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`p-4 rounded-lg border transition-colors ${
                                        subscription.plan === plan.name
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                €{subscription.cycle === 'annual' ? plan.annualPrice : plan.price}
                                                /{subscription.cycle === 'annual' ? 'ano' : 'mês'}
                                            </p>
                                        </div>
                                        {subscription.plan === plan.name ? (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <button
                                                onClick={() => handleChangePlan(plan)}
                                                disabled={loading}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Selecionar'}
                                            </button>
                                        )}
                                    </div>

                                    <ul className="text-xs text-gray-600 space-y-1">
                                        {plan.features.map((feature, index) => (
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

                {/* Payment Management */}
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

                {/* Cancel Subscription Modal */}
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

                {/* Payment Method Modal */}
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