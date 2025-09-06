import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
    BuildingOfficeIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    UsersIcon,
    BriefcaseIcon,
    CogIcon,
    ChevronDownIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const { subscription, stats, getTrialDaysLeft, isAnyLimitReached, getClientUsagePercentage, getVolumeUsagePercentage } = useSubscription();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const trialDaysLeft = getTrialDaysLeft();
    const isTrialActive = subscription?.trial && trialDaysLeft > 0;
    const limitReached = isAnyLimitReached();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">MyImoMatePro</span>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium text-gray-900">
                                            {currentUser?.displayName || 'Utilizador'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {subscription?.plano || 'Sem plano'}
                                        </p>
                                    </div>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <Link
                                        to="/account"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <CogIcon className="w-4 h-4 mr-3" />
                                        Configurações da Conta
                                    </Link>

                                    <hr className="my-1" />

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Alertas */}
            {(isTrialActive || limitReached) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3" />
                            <div className="flex-1">
                                {isTrialActive && (
                                    <p className="text-yellow-800">
                                        <span className="font-medium">Trial ativo:</span> {trialDaysLeft} dias restantes
                                    </p>
                                )}
                                {limitReached && (
                                    <p className="text-yellow-800">
                                        <span className="font-medium">Atenção:</span> Atingiu os limites do seu plano
                                    </p>
                                )}
                            </div>
                            <Link
                                to="/account"
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                Gerir Plano
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao seu CRM, {currentUser?.displayName?.split(' ')[0] || 'Consultor'}!
                    </h1>
                    <p className="text-gray-600">
                        Gerir o seu negócio imobiliário nunca foi tão simples
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
                                    <p className="text-sm text-gray-500">
                                        {subscription?.limiteClientes === 'unlimited' ? 'Clientes' : `de ${subscription?.limiteClientes || 0}`}
                                    </p>
                                </div>
                            </div>
                            {subscription?.limiteClientes !== 'unlimited' && (
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                        style={{ width: `${getClientUsagePercentage()}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalNegocios}</p>
                                <p className="text-sm text-gray-500">Oportunidades</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <ChartBarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-900">€{stats.valorNegocios.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">
                                        {subscription?.limiteVolumeNegocios === 'unlimited' ? 'Volume' : `de €${(subscription?.limiteVolumeNegocios || 0).toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                            {subscription?.limiteVolumeNegocios !== 'unlimited' && (
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                                        style={{ width: `${getVolumeUsagePercentage()}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                <CogIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Tarefas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Adicionar Cliente</p>
                                <p className="text-sm text-gray-500">Criar novo cliente</p>
                            </div>
                        </button>

                        <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <BriefcaseIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Nova Oportunidade</p>
                                <p className="text-sm text-gray-500">Criar oportunidade</p>
                            </div>
                        </button>

                        <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Ver Relatórios</p>
                                <p className="text-sm text-gray-500">Análise de performance</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Getting Started */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
                    <h2 className="text-xl font-semibold mb-2">Começar a usar o MyImoMatePro</h2>
                    <p className="text-primary-100 mb-4">
                        Complete a configuração inicial para aproveitar ao máximo o seu CRM
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-primary-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">1</span>
                            </div>
                            <span>Adicione o seu primeiro cliente</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-primary-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">2</span>
                            </div>
                            <span>Configure os seus tipos de oportunidades</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-primary-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold">3</span>
                            </div>
                            <span>Personalize o seu dashboard</span>
                        </div>
                    </div>

                    <button className="mt-4 bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
                        Começar Configuração
                    </button>
                </div>
            </main>
        </div>
    );
}