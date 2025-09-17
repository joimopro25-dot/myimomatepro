/**
 * OPPORTUNITY TYPE SELECTOR - Componente partilhado
 * Caminho: src/pages/opportunities/shared/OpportunityTypeSelector.jsx
 */

import React from 'react';
import {
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ChartBarIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS
} from '../../../models/opportunityModel';

const OpportunityTypeSelector = ({
    selectedType,
    onTypeChange,
    isEditing = false
}) => {

    const getTypeIcon = (tipo) => {
        const icons = {
            [OPPORTUNITY_TYPES.BUYER]: ShoppingCartIcon,
            [OPPORTUNITY_TYPES.SELLER]: CurrencyEuroIcon,
            [OPPORTUNITY_TYPES.LANDLORD]: HomeIcon,
            [OPPORTUNITY_TYPES.TENANT]: UserGroupIcon,
            [OPPORTUNITY_TYPES.INVESTOR]: ChartBarIcon
        };
        return icons[tipo] || HomeIcon;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Tipo de Oportunidade
                </h2>
                {isEditing && (
                    <span className="inline-flex items-center text-sm text-gray-500">
                        <LockClosedIcon className="w-4 h-4 mr-1" />
                        Não editável após criação
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
                    const Icon = getTypeIcon(type);
                    const isSelected = selectedType === type;

                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onTypeChange(type)}
                            disabled={isEditing}
                            className={`
                                flex flex-col items-center justify-center p-4 rounded-lg border-2 
                                transition-all duration-200
                                ${isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : isEditing
                                        ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }
                            `}
                        >
                            <Icon className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">{label}</span>
                            {isSelected && isEditing && (
                                <LockClosedIcon className="w-3 h-3 mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default OpportunityTypeSelector;