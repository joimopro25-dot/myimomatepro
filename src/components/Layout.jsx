/**
 * LAYOUT - MyImoMatePro
 * Layout principal da aplicação
 * 
 * Caminho: src/components/Layout.jsx
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentUser } = useAuth();

    if (!currentUser) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header mobile */}
                <div className="lg:hidden bg-white shadow-sm">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold">MyImoMatePro</h1>
                        <div className="w-6" /> {/* Spacer for balance */}
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;