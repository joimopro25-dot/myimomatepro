/**
 * SELLER OPPORTUNITY - Placeholder temporário
 * Caminho: src/pages/opportunities/components/SellerOpportunity.jsx
 */

import React from 'react';

const SellerOpportunity = ({
    formData,
    updateFormData,
    handleInputChange,
    clientId,
    opportunityId
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    🏡 Módulo de Vendedor
                </h3>
                <p className="text-gray-500">
                    Funcionalidade em desenvolvimento...
                </p>
                <p className="text-sm text-gray-400 mt-4">
                    Esta secção irá permitir gerir:
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1">
                    <li>• Dados do imóvel a vender</li>
                    <li>• Avaliação e precificação</li>
                    <li>• Marketing e promoção</li>
                    <li>• Visitas de potenciais compradores</li>
                    <li>• Ofertas recebidas</li>
                </ul>
            </div>
        </div>
    );
};

export default SellerOpportunity;