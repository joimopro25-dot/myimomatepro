import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    BuildingOfficeIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChartBarIcon,
    UsersIcon,
    BriefcaseIcon,
    CogIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const { currentUser, userProfile, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

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
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {currentUser?.displayName || userProfile?.nome || 'Utilizador'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {userProfile?.plano || 'Plano Básico'}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                <span className="hidden md:inline">Sair</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

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
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <UsersIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Clientes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Oportunidades</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">0</p>
                                <p className="text-sm text-gray-500">Deals Ativos</p>
                            </div>
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