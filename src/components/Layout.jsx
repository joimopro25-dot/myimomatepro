/**
 * LAYOUT COMPONENT - MyImoMatePro
 * Layout principal com Sidebar para todas as páginas do CRM
 * Inclui responsive design e controlo de colapso da sidebar
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, title, subtitle }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar tamanho da tela
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarCollapsed(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${isMobile && isSidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                }`}>
                <Sidebar
                    isCollapsed={isSidebarCollapsed && !isMobile}
                    onToggleCollapse={toggleSidebar}
                />
            </div>

            {/* Overlay para mobile */}
            {isMobile && !isSidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            {/* Área de Conteúdo Principal */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'
                }`}>
                {/* Header da Página (opcional) */}
                {(title || subtitle) && (
                    <div className="bg-white shadow-sm border-b border-gray-200">
                        <div className="px-6 py-4">
                            {/* Botão mobile menu */}
                            {isMobile && (
                                <button
                                    onClick={toggleSidebar}
                                    className="mb-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}

                            {title && (
                                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            )}
                            {subtitle && (
                                <p className="text-gray-600 mt-1">{subtitle}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Conteúdo da Página */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;