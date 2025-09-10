/**
 * SIDEBAR - MyImoMatePro
 * Componente de navegação lateral limpo
 * 
 * Caminho: src/components/Sidebar.jsx
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useClients } from '../contexts/ClientContext';
import {
    HomeIcon,
    UserGroupIcon,
    CogIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    CreditCardIcon,
    ChartBarIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { subscription } = useSubscription();
    const { clients } = useClients();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: HomeIcon,
            current: window.location.pathname === '/dashboard'
        },
        {
            name: 'Clientes',
            href: '/clients',
            icon: UserGroupIcon,
            current: window.location.pathname.includes('/clients'),
            badge: clients?.length || 0
        },
        {
            name: 'Relatórios',
            href: '/reports',
            icon: ChartBarIcon,
            current: window.location.pathname.includes('/reports'),
            disabled: true
        },
        {
            name: 'Documentos',
            href: '/documents',
            icon: DocumentDuplicateIcon,
            current: window.location.pathname.includes('/documents'),
            disabled: true
        }
    ];

    const bottomNavigation = [
        {
            name: 'Configurações',
            href: '/account',
            icon: CogIcon,
            current: window.location.pathname === '/account'
        }
    ];

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
                        <div>
                            <h2 className="text-xl font-bold text-white">MyImoMatePro</h2>
                            {subscription && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Plano: {subscription.plan}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* User info */}
                    <div className="px-4 py-4 border-b border-gray-800">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        {currentUser?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">
                                    {currentUser?.displayName || 'Utilizador'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={item.disabled ? (e) => e.preventDefault() : onClose}
                                className={({ isActive }) => `
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${item.disabled
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }
                `}
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-6 w-6 ${item.disabled ? 'text-gray-500' : ''
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-auto bg-gray-800 text-gray-300 py-0.5 px-2.5 rounded-full text-xs">
                                        {item.badge}
                                    </span>
                                )}
                                {item.disabled && (
                                    <span className="ml-auto text-xs text-gray-500">Em breve</span>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom section */}
                    <div className="border-t border-gray-800">
                        <nav className="px-2 py-4 space-y-1">
                            {bottomNavigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                  `}
                                >
                                    <item.icon
                                        className="mr-3 flex-shrink-0 h-6 w-6"
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </NavLink>
                            ))}

                            <button
                                onClick={handleLogout}
                                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <ArrowRightOnRectangleIcon
                                    className="mr-3 flex-shrink-0 h-6 w-6"
                                    aria-hidden="true"
                                />
                                Sair
                            </button>
                        </nav>

                        {/* Subscription alert */}
                        {subscription?.status === 'trial' && subscription?.daysRemaining <= 7 && (
                            <div className="px-4 pb-4">
                                <div className="bg-yellow-900 bg-opacity-50 rounded-lg p-3">
                                    <div className="flex">
                                        <CreditCardIcon className="h-5 w-5 text-yellow-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-400">
                                                {subscription.daysRemaining} dias restantes
                                            </p>
                                            <button
                                                onClick={() => navigate('/account')}
                                                className="text-xs text-yellow-300 hover:text-yellow-200 underline"
                                            >
                                                Atualizar plano
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;