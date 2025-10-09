/**
 * SIDEBAR COMPONENT - MyImoMatePro
 * FIXED: Full height sidebar from top to bottom
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
    HomeIcon,
    UsersIcon,
    BriefcaseIcon,
    ShoppingBagIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
    CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    UsersIcon as UsersIconSolid,
    BriefcaseIcon as BriefcaseIconSolid,
    ShoppingBagIcon as ShoppingBagIconSolid,
    CogIcon as CogIconSolid,
    CurrencyEuroIcon as CurrencyEuroIconSolid
} from '@heroicons/react/24/solid';
import { CalendarIcon as CalendarIconOutline } from '@heroicons/react/24/outline';
import { CalendarIcon as CalendarIconSolid } from '@heroicons/react/24/solid';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { subscription, stats } = useSubscription();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navigationItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            iconSolid: HomeIconSolid,
            description: 'Visão geral do seu negócio'
        },
        {
            name: 'Clientes',
            href: '/clients',
            icon: UsersIcon,
            iconSolid: UsersIconSolid,
            description: 'Gerir carteira de clientes',
            badge: stats?.totalClients || 0
        },
        {
            name: 'Oportunidades',
            href: '/opportunities',
            icon: BriefcaseIcon,
            iconSolid: BriefcaseIconSolid,
            description: 'Gestão de oportunidades',
            badge: stats?.totalOpportunities || 0
        },
        {
            name: 'Negócios',
            href: '/deals',
            icon: ShoppingBagIcon,
            iconSolid: ShoppingBagIconSolid,
            description: 'Pipeline de negócios',
            badge: stats?.totalDeals || 0
        },
        {
            name: 'Comissões',
            href: '/commissions',
            icon: CurrencyEuroIcon,
            iconSolid: CurrencyEuroIconSolid,
            description: 'Dashboard de comissões'
        },
        {
            name: 'Calendário',
            href: '/calendar',
            icon: CalendarIconOutline,
            iconSolid: CalendarIconSolid,
            description: 'Calendário de eventos'
        }
    ];

    const isActiveRoute = (href) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        if (href === '/deals') {
            return location.pathname === '/deals' ||
                   location.pathname.includes('/deals');
        }
        if (href === '/clients') {
            return location.pathname.startsWith('/clients') &&
                   !location.pathname.includes('/deals') &&
                   !location.pathname.includes('/seller-opportunities');
        }
        if (href === '/seller-opportunities') { // ✅ Updated matcher
            return location.pathname.startsWith('/seller-opportunities');
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className={`h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col ${
            isCollapsed ? 'w-16' : 'w-64'
        }`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    MyImoMatePro
                                </h1>
                                <p className="text-xs text-slate-400">CRM Imobiliário</p>
                            </div>
                        </div>
                    )}

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

            {/* Main Navigation - Scrollable if needed */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = isActive ? item.iconSolid : item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                                    : 'hover:bg-slate-700/30 hover:shadow-md'
                            }`}
                            title={isCollapsed ? item.description : ''}
                        >
                            <div className="flex items-center justify-center w-6 h-6">
                                <Icon className={`w-5 h-5 transition-colors ${
                                    isActive 
                                        ? 'text-blue-400' 
                                        : 'text-slate-400 group-hover:text-slate-200'
                                }`} />
                            </div>
                            
                            {!isCollapsed && (
                                <>
                                    <span className={`ml-3 font-medium transition-colors ${
                                        isActive 
                                            ? 'text-white' 
                                            : 'text-slate-300 group-hover:text-white'
                                    }`}>
                                        {item.name}
                                    </span>
                                    
                                    {item.badge !== undefined && (
                                        <span className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${
                                            isActive
                                                ? 'bg-blue-500/30 text-blue-200'
                                                : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                                        }`}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                            
                            {isCollapsed && item.badge !== undefined && (
                                <span className="absolute left-10 top-2 px-1.5 py-0.5 text-xs rounded-full font-medium bg-blue-500 text-white">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {!isCollapsed && (
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Em breve</p>
                        <div className="space-y-2 opacity-50">
                            <div className="flex items-center px-3 py-2 text-slate-500">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-dashed border-slate-600 rounded"></div>
                                </div>
                                <span className="ml-3 text-sm">Propriedades</span>
                            </div>
                            <div className="flex items-center px-3 py-2 text-slate-500">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-dashed border-slate-600 rounded"></div>
                                </div>
                                <span className="ml-3 text-sm">Relatórios</span>
                            </div>
                            <div className="flex items-center px-3 py-2 text-slate-500">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-dashed border-slate-600 rounded"></div>
                                </div>
                                <span className="ml-3 text-sm">Marketing</span>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* User Section at Bottom - Fixed */}
            <div className="border-t border-slate-700/50 p-4 flex-shrink-0">
                {!isCollapsed && subscription && (
                    <div className="mb-4 px-3 py-2 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400">Plano</p>
                                <p className="text-sm font-medium text-white">
                                    {subscription.plan === 'premium' ? 'Professional' : 
                                     subscription.plan === 'enterprise' ? 'Shark' : 'Rookie'}
                                </p>
                            </div>
                            <Link
                                to="/account"
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Gerir
                            </Link>
                        </div>
                    </div>
                )}

                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-700/50 transition-colors ${
                            isCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white truncate">
                                    {currentUser?.email?.split('@')[0] || 'Utilizador'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {currentUser?.email || ''}
                                </p>
                            </div>
                        )}
                    </button>

                    {showUserMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                            <Link
                                to="/account"
                                onClick={() => setShowUserMenu(false)}
                                className="flex items-center px-4 py-3 hover:bg-slate-700/50 transition-colors"
                            >
                                <CogIcon className="w-5 h-5 text-slate-400 mr-3" />
                                <span className="text-sm text-slate-200">Configurações</span>
                            </Link>
                            <button
                                onClick={() => {
                                    setShowUserMenu(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center px-4 py-3 hover:bg-slate-700/50 transition-colors text-red-400"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                <span className="text-sm">Sair</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;