import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
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
        getDaysUntilNextPayment
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Sem subscrição ativa</h2>
                    <p className="text-gray-600">Por favor, selecione um plano para continuar.</p>
                </div>
            </div>
        );
    }

    const trialDaysLeft = getTrialDaysLeft();
    const daysUntilPayment = getDaysUntilNextPayment();
    const isTrialActive = subscription.trial && trialDaysLeft > 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Plano Atual */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Plano Atual</h2>

                            {isTrialActive && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                                        <span className="text-yellow-800 font-medium">
                                            Trial ativo - {trialDaysLeft} dias restantes
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{subscription.plano}</h3>
                                    <p className="text-gray-600">
                                        €{subscription.ciclo === 'anual' ? subscription.precoAnual : subscription.preco}
                                        /{subscription.ciclo === 'anual' ? 'ano' : 'mês'}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                                    subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {subscription.status === 'active' ? 'Ativo' :
                                        subscription.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                </div>
                            </div>

                            {/* Informações de Pagamento */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Próximo Pagamento</h4>
                                        <div className="flex items-center text-gray-600">
                                            <CalendarIcon className="w-4 h-4 mr-2" />
                                            <span>Em {daysUntilPayment} dias</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Último Pagamento</h4>
                                        <div className="flex items-center text-gray-600">
                                            <CreditCardIcon className="w-4 h-4 mr-2" />
                                            <span>
                                                €{subscription.ultimoPagamento?.valor || 0} -
                                                {subscription.ultimoPagamento?.status === 'paid' ? ' Pago' : ' Pendente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ciclo de Pagamento */}
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h4 className="font-medium text-gray-900 mb-4">Ciclo de Pagamento</h4>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleChangeBillingCycle('mensal')}
                                        disabled={loading || subscription.ciclo === 'mensal'}
                                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${subscription.ciclo === 'mensal'
                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Mensal
                                    </button>
                                    <button
                                        onClick={() => handleChangeBillingCycle('anual')}
                                        disabled={loading || subscription.ciclo === 'anual'}
                                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${subscription.ciclo === 'anual'
                                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Anual (2 meses grátis)
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Alterar Plano */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alterar Plano</h2>

                            <div className="space-y-4">
                                {planos.map((plano) => (
                                    <div
                                        key={plano.nome}
                                        className={`border rounded-lg p-4 transition-colors duration-200 ${subscription.plano === plano.nome
                                            ? 'border-primary-200 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{plano.nome}</h3>
                                                <p className="text-sm text-gray-600">
                                                    €{plano.preco}/mês ou €{plano.precoAnual}/ano
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {plano.limiteClientes === 'unlimited' ? 'Clientes ilimitados' : `Até ${plano.limiteClientes} clientes`}
                                                </p>
                                            </div>

                                            {subscription.plano === plano.nome ? (
                                                <CheckCircleIcon className="w-6 h-6 text-primary-500" />
                                            ) : (
                                                <button
                                                    onClick={() => handleChangePlan(plano)}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm"
                                                >
                                                    Alterar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Método de Pagamento */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pagamento</h3>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <CreditCardIcon className="w-5 h-5 text-gray-400 mr-2" />
                                    <span className="text-gray-600">
                                        {subscription.metodoPagamento === 'pending' ? 'Por configurar' : subscription.metodoPagamento}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPaymentModal(true)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors duration-200"
                            >
                                {subscription.metodoPagamento === 'pending' ? 'Adicionar' : 'Alterar'} Método
                            </button>
                        </div>

                        {/* Ações */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>

                            <div className="space-y-3">
                                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center">
                                    <ArrowPathIcon className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-700">Histórico de Pagamentos</span>
                                </button>

                                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center">
                                    <ChartBarIcon className="w-4 h-4 text-gray-400 mr-3" />
                                    <span className="text-gray-700">Relatório de Uso</span>
                                </button>

                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center text-red-600"
                                >
                                    <XCircleIcon className="w-4 h-4 mr-3" />
                                    <span>Cancelar Plano</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Cancelamento */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancelar Plano</h3>
                        <p className="text-gray-600 mb-6">
                            Tem a certeza que pretende cancelar o seu plano? Esta ação não pode ser desfeita.
                        </p>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Manter Plano
                            </button>
                            <button
                                onClick={handleCancelSubscription}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                {loading ? 'Cancelando...' : 'Cancelar Plano'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}