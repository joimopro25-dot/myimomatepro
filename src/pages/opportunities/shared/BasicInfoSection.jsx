/**
 * BASIC INFO SECTION - Componente partilhado
 * Caminho: src/pages/opportunities/shared/BasicInfoSection.jsx
 */

import React from 'react';
import {
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_PRIORITIES
} from '../../../models/opportunityModel';

const BasicInfoSection = ({
    formData,
    handleInputChange,
    showDescription = true
}) => {

    const getPriorityLabel = (priority) => {
        const labels = {
            [OPPORTUNITY_PRIORITIES.LOW]: '🟢 Baixa',
            [OPPORTUNITY_PRIORITIES.MEDIUM]: '🟡 Média',
            [OPPORTUNITY_PRIORITIES.HIGH]: '🟠 Alta',
            [OPPORTUNITY_PRIORITIES.URGENT]: '🔴 Urgente'
        };
        return labels[priority] || '🟡 Média';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informações Básicas
            </h2>

            <div className="space-y-4">
                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                    </label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Compra de T3 no Centro"
                        required
                    />
                </div>

                {/* Estado e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            name="estado"
                            value={formData.estado || OPPORTUNITY_STATES.LEAD}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.entries(OPPORTUNITY_STATE_LABELS).map(([state, label]) => (
                                <option key={state} value={state}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridade
                        </label>
                        <select
                            name="prioridade"
                            value={formData.prioridade || OPPORTUNITY_PRIORITIES.MEDIUM}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {Object.values(OPPORTUNITY_PRIORITIES).map((priority) => (
                                <option key={priority} value={priority}>
                                    {getPriorityLabel(priority)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Descrição (opcional) */}
                {showDescription && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                        </label>
                        <textarea
                            name="descricao"
                            value={formData.descricao || ''}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Detalhes adicionais sobre esta oportunidade..."
                        />
                    </div>
                )}

                {/* Notas internas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Internas
                    </label>
                    <textarea
                        name="notas"
                        value={formData.notas || ''}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Notas privadas (não visíveis ao cliente)..."
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;