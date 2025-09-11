/**
 * SIDEBAR COMPONENT - MyImoMatePro
 * Navegação lateral com sistema de Leads integrado
 * Mostra estatísticas em tempo real
 * 
 * Caminho: src/components/Sidebar.jsx
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useLeads } from '../contexts/LeadContext';
import { useClients } from '../contexts/ClientContext';
import {
    HomeIcon,
    UsersIcon,
    FunnelIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
    CreditCardIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    UsersIcon as UsersIconSolid,
    FunnelIcon as FunnelIconSolid,
    CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { subscription } = useSubscription();
    const { stats: leadStats } = useLeads();
    const { clients } = useClients();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Calcular estatísticas
    const totalClients = clients?.length || 0;
    const totalLeads = leadStats?.total || 0;
    const leadsInProgress = leadStats?.byFunnelState?.qualificando || 0;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Itens de navegação principal
    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
            description: 'Visão geral do negócio'
        },
        {
            name: 'Clientes',
            href: '/clients',
            icon: UsersIcon,
            iconSolid: UsersIconSolid,
            description: 'Gestão de clientes',
            badge: totalClients,
            badgeColor: 'bg-blue-500'
        },
        {
            name: 'Leads',
            href: '/leads',
            icon: FunnelIcon,
            iconSolid: FunnelIconSolid,
            description: 'Prospects e qualificações',
            badge: totalLeads,
            badgeColor: 'bg-orange-500',
            subBadge: leadsInProgress > 0 ? `${leadsInProgress} em qualificação` : null
        }
    ];

    // Verificar rota ativa
    const isActiveRoute = (href) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    // Obter cor do plano
    const getPlanColor = () => {
        switch (subscription?.plano) {
            case 'Shark':
                return 'from-purple-600 to-pink-600';
            case 'Professional':
                return 'from-blue-600 to-indigo-600';
            case 'Rookie':
            default:
                return 'from-green-600 to-teal-600';
        }
    };

    return (
        <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'
            } h-full`}>

            {/* Header com Logo */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        {!isCollapsed && (
                            <>
                                <SparklesIcon className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                        MyImoMate
                                    </h1>
                                    <p className="text-xs text-slate-400">Pro CRM</p>
                                </div>
                            </>
                        )}
                        {isCollapsed && (
                            <SparklesIcon className="w-8 h-8 text-yellow-400 mx-auto" />
                        )}
                    </Link>

                    {/* Botão de colapsar */}
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                        title={isCollapsed ? 'Expandir' : 'Colapsar'}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="w-5 h-5" />
                        ) : (
                            <ChevronLeftIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Menu de Navegação */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = isActive ? item.iconSolid : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30'
                                : 'hover:bg-slate-700/30 border border-transparent'
                                }`}
                            title={isCollapsed ? item.name : ''}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className={`w-6 h-6 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                                    }`} />
                                {!isCollapsed && (
                                    <div className="flex-1">
                                        <p className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'
                                            }`}>
                                            {item.name}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs text-slate-500">
                                                {item.description}
                                            </p>
                                        )}
                                        {item.subBadge && (
                                            <p className="text-xs text-orange-400 mt-1">
                                                {item.subBadge}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Badge com contagem */}
                            {item.badge !== undefined && (
                                <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : ''
                                    } px-2 py-1 text-xs font-bold text-white rounded-full ${item.badgeColor || 'bg-slate-600'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Separador */}
                <div className="my-4 border-t border-slate-700/50"></div>

                {/* Link para Configurações */}
                <Link
                    to="/account"
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${location.pathname === '/account'
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30'
                        : 'hover:bg-slate-700/30'
                        }`}
                    title={isCollapsed ? 'Configurações' : ''}
                >
                    <CogIcon className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    {!isCollapsed && (
                        <span className="ml-3 text-slate-300 group-hover:text-white">
                            Configurações
                        </span>
                    )}
                </Link>
            </nav>

            {/* Informações do Plano */}
            {!isCollapsed && subscription && (
                <div className="p-4 border-t border-slate-700/50">
                    <div className="bg-slate-800/50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400">Plano Atual</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${getPlanColor()} text-white`}>
                                {subscription.plano}
                            </span>
                        </div>

                        {/* Barra de uso de clientes */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Clientes</span>
                                <span className="text-slate-400">
                                    {totalClients}/{subscription.limiteClientes === 'unlimited' ? '∞' : subscription.limiteClientes}
                                </span>
                            </div>
                            {subscription.limiteClientes !== 'unlimited' && (
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${totalClients >= subscription.limiteClientes * 0.8
                                            ? 'from-orange-500 to-red-500'
                                            : 'from-blue-500 to-purple-500'
                                            }`}
                                        style={{
                                            width: `${Math.min((totalClients / subscription.limiteClientes) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Link para upgrade */}
                        {subscription.plano !== 'Shark' && (
                            <Link
                                to="/account"
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center mt-2"
                            >
                                <SparklesIcon className="w-3 h-3 mr-1" />
                                Fazer upgrade
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Menu do Utilizador */}
            <div className="p-4 border-t border-slate-700/50">
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors ${isCollapsed ? 'justify-center' : ''
                            }`}
                        title={isCollapsed ? currentUser?.email : ''}
                    >
                        <UserCircleIcon className="w-8 h-8 text-slate-400" />
                        {!isCollapsed && (
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white">
                                    {currentUser?.displayName || 'Utilizador'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        )}
                    </button>

                    {/* Dropdown do menu */}
                    {showUserMenu && (
                        <div className={`absolute bottom-full mb-2 ${isCollapsed ? 'left-0' : 'left-0 right-0'
                            } bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden`}>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400 mr-3" />
                                {!isCollapsed && (
                                    <span className="text-sm text-white">Terminar Sessão</span>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;