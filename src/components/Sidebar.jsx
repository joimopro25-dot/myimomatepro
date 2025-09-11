/**
 * SIDEBAR COMPONENT - MyImoMatePro
 * Navegação lateral com estatísticas em tempo real
 * ✅ VERSÃO COMPLETA E CORRIGIDA
 * 
 * Caminho: src/components/Sidebar.jsx
 */

import React, { useState } from 'react';
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
    ChartBarIcon,
    XMarkIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    UsersIcon as UsersIconSolid,
    FunnelIcon as FunnelIconSolid,
    CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { subscription } = useSubscription();
    const { stats: leadStats } = useLeads();
    const { clients } = useClients();
    const [isCollapsed, setIsCollapsed] = useState(false);
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

    const onToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Sidebar para mobile (overlay)
    const MobileSidebar = () => (
        <div className="lg:hidden">
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-900 bg-opacity-75 z-40"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                            <Link to="/dashboard" className="flex items-center space-x-2">
                                <SparklesIcon className="w-8 h-8 text-yellow-400" />
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                        MyImoMate
                                    </h1>
                                    <p className="text-xs text-slate-400">Pro CRM</p>
                                </div>
                            </Link>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <SidebarContent />
                    </div>
                </>
            )}
        </div>
    );

    // Sidebar para desktop
    const DesktopSidebar = () => (
        <div className={`hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
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
            <SidebarContent />
        </div>
    );

    // Conteúdo compartilhado da sidebar
    const SidebarContent = () => (
        <>
            {/* Menu de Navegação */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = isActive ? item.iconSolid : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30'
                                    : 'hover:bg-slate-700/30'
                                }`}
                            title={isCollapsed ? item.name : ''}
                            onClick={() => isOpen && onClose()}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                }`} />
                            {!isCollapsed && (
                                <>
                                    <span className={`ml-3 ${isActive ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'
                                        }`}>
                                        {item.name}
                                    </span>
                                    {item.subBadge && (
                                        <span className="ml-auto text-xs text-slate-400">
                                            {item.subBadge}
                                        </span>
                                    )}
                                </>
                            )}
                            {item.badge !== undefined && item.badge !== null && (
                                <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'
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
                    onClick={() => isOpen && onClose()}
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
                                                ? 'from-yellow-500 to-red-500'
                                                : 'from-green-500 to-emerald-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(
                                                (totalClients / subscription.limiteClientes) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Botão de upgrade se necessário */}
                        {subscription.plano !== 'Shark' && totalClients >= subscription.limiteClientes * 0.8 && (
                            <Link
                                to="/account"
                                className="block w-full text-center text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
                            >
                                Fazer Upgrade
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* User Menu e Logout */}
            {!isCollapsed && (
                <div className="p-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <UserCircleIcon className="w-8 h-8 text-slate-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {currentUser?.displayName || 'Utilizador'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Terminar sessão"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-slate-400 hover:text-white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <>
            <MobileSidebar />
            <DesktopSidebar />
        </>
    );
};

export default Sidebar;