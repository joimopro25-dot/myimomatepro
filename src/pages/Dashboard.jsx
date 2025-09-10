/**
 * DASHBOARD - MyImoMatePro
 * Dashboard principal limpo
 * 
 * Caminho: src/pages/Dashboard.jsx
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import {
    UserGroupIcon,
    CurrencyEuroIcon,
    ChartBarIcon,
    CalendarIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { subscription } = useSubscription();
    const { clients, fetchClients } = useClients();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            await fetchClients();
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            name: 'Total de Clientes',
            value: clients?.length || 0,
            icon: UserGroupIcon,
            color: 'bg-blue-500',
            href: '/clients'
        },
        {
            name: 'Negócios Ativos',
            value: 0,
            icon: ChartBarIcon,
            color: 'bg-green-500',
            href: '#'
        },
        {
            name: 'Faturação Mensal',
            value: '€0',
            icon: CurrencyEuroIcon,
            color: 'bg-purple-500',
            href: '#'
        },
        {
            name: 'Agendamentos',
            value: 0,
            icon: CalendarIcon,
            color: 'bg-yellow-500',
            href: '#'
        }
    ];

    const quickActions = [
        {
            name: 'Novo Cliente',
            description: 'Adicionar um novo cliente ao sistema',
            icon: UserGroupIcon,
            href: '/clients/new',
            color: 'bg-blue-600'
        }
    ];

    return (
        <Layout>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Bem-vindo, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Aqui está um resumo da sua atividade
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {stats.map((stat) => (
                        <div
                            key={stat.name}
                            onClick={() => stat.href !== '#' && navigate(stat.href)}
                            className={`bg-white overflow-hidden shadow rounded-lg ${stat.href !== '#' ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {stat.name}
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {stat.value}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.name}
                                onClick={() => navigate(action.href)}
                                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-all"
                            >
                                <div className={`flex-shrink-0 ${action.color} rounded-lg p-3`}>
                                    <action.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-sm font-medium text-gray-900">{action.name}</p>
                                    <p className="text-sm text-gray-500">{action.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Atividade Recente
                        </h3>
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : clients?.length > 0 ? (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {clients.slice(0, 5).map((client, idx) => (
                                        <li key={client.id}>
                                            <div className="relative pb-8">
                                                {idx !== Math.min(4, clients.length - 1) && (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                            <UserGroupIcon className="h-5 w-5 text-white" />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Novo cliente adicionado:{' '}
                                                                <button
                                                                    onClick={() => navigate(`/clients/${client.id}`)}
                                                                    className="font-medium text-gray-900 hover:text-blue-600"
                                                                >
                                                                    {client.name}
                                                                </button>
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {new Date(client.createdAt).toLocaleDateString('pt-PT')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sem atividade</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comece por adicionar o seu primeiro cliente
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => navigate('/clients/new')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Novo Cliente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscription Alert */}
                {subscription?.status === 'trial' && subscription?.daysRemaining <= 7 && (
                    <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CalendarIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    O seu período de teste termina em{' '}
                                    <span className="font-medium">{subscription.daysRemaining} dias</span>.{' '}
                                    <button
                                        onClick={() => navigate('/account')}
                                        className="font-medium underline text-yellow-700 hover:text-yellow-600"
                                    >
                                        Atualizar plano
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;