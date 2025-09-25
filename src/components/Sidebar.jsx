/**
 * SIDEBAR COMPONENT - RealEstateCRM Pro
 * Navegação lateral unificada para todo o CRM
 * Versão limpa - Pronta para novos módulos
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
    HomeIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    CogIcon as CogIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { subscription } = useSubscription();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Itens de navegação - Dashboard apenas por agora
    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
            description: 'Visão geral do sistema'
        }
        // Novos módulos serão adicionados aqui
    ];

    const isActiveRoute = (href) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'
            }`}>
            {/* Header da Sidebar */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    RealEstateCRM
                                </h1>
                                <p className="text-xs text-slate-400">Professional Edition</p>
                            </div>
                        </div>
                    )}

                    {/* Botão Toggle */}
                    <button
                        onClick={onToggleCollapse}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                        title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronLeftIcon className="w-5 h-5 text-slate-400" />
                        )}
                    </button>
                </div>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = isActive ? item.iconSolid : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                                    : 'hover:bg-slate-700/30 hover:shadow-md'
                                }`}
                            title={isCollapsed ? item.description : ''}
                        >
                            <div className="flex items-center justify-center w-6 h-6">
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                                    }`} />
                            </div>

                            {!isCollapsed && (
                                <div className="ml-3 flex-1">
                                    <p className={`font-medium ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                        }`}>
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-slate-500 group-hover:text-slate-400">
                                        {item.description}
                                    </p>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Informações da Subscrição */}
            {!isCollapsed && subscription && (
                <div className="p-4 border-t border-slate-700/50">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-300">Plano Atual</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                subscription.plano === 'Shark' ? 'bg-purple-500/20 text-purple-300' :
                                subscription.plano === 'Professional' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-green-500/20 text-green-300'
                            }`}>
                                {subscription.plano}
                            </span>
                        </div>

                        {subscription.trial && (
                            <div className="mt-2 text-xs text-amber-400">
                                Trial Ativo
                            </div>
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
                        title={isCollapsed ? currentUser?.displayName || currentUser?.email : ''}
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-5 h-5 text-white" />
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 text-left">
                                <p className="font-medium text-white text-sm">
                                    {currentUser?.displayName || 'Utilizador'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {currentUser?.email}
                                </p>
                            </div>
                        )}
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && !isCollapsed && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700/50 py-2">
                            <Link
                                to="/account"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center space-x-3 px-4 py-2 hover:bg-slate-700/50 transition-colors"
                            >
                                <CogIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">Configurações</span>
                            </Link>

                            <hr className="my-2 border-slate-700/50" />

                            <button
                                onClick={() => {
                                    setShowUserMenu(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-500/10 transition-colors text-red-400 hover:text-red-300"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                <span className="text-sm">Terminar Sessão</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;