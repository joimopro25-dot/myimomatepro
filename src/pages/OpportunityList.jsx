/**
 * OPPORTUNITY LIST PAGE - MyImoMatePro
 * Página placeholder para lista de oportunidades
 * 
 * Caminho: src/pages/OpportunityList.jsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const OpportunityList = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Lista de Oportunidades
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Esta funcionalidade está em desenvolvimento.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default OpportunityList;