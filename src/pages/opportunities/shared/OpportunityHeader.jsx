
/**
 * OPPORTUNITY HEADER - Componente partilhado
 * Caminho: src/pages/opportunities/shared/OpportunityHeader.jsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const OpportunityHeader = ({
    clientId,
    opportunityId,
    currentClient,
    successMessage,
    validationErrors
}) => {
    const navigate = useNavigate();

    return (
        <div className="mb-8">
            <button
                onClick={() => navigate(`/clients/${clientId}`)}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Voltar ao cliente
            </button>

            <h1 className="text-3xl font-bold text-gray-900">
                {opportunityId ? 'Editar Oportunidade' : 'Nova Oportunidade'}
            </h1>

            {currentClient && (
                <p className="mt-2 text-gray-600">
                    Cliente: <span className="font-semibold">{currentClient.name}</span>
                </p>
            )}

            {/* Mensagem de Sucesso */}
            {successMessage && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            {/* Mensagem de Erro */}
            {validationErrors?.geral && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                        <p className="text-red-800">{validationErrors.geral}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpportunityHeader;