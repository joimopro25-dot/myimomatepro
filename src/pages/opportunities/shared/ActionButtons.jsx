/**
 * ACTION BUTTONS - Componente partilhado
 * Caminho: src/pages/opportunities/shared/ActionButtons.jsx
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({
    clientId,
    isSubmitting,
    isEditing,
    onSubmit
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-end space-x-4">
            <button
                type="button"
                onClick={() => navigate(`/clients/${clientId}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? 'A guardar...' : (isEditing ? 'Atualizar' : 'Criar Oportunidade')}
            </button>
        </div>
    );
};

export default ActionButtons;