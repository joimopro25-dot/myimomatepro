/**
 * BASIC INFO TAB - MyImoMatePro
 * Tab de informações básicas da oportunidade
 * 
 * Caminho: src/components/opportunities/tabs/BasicInfoTab.jsx
 */

import React from 'react';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_PRIORITIES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_LABELS
} from '../../../models/opportunityModel';
import {
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ChartBarIcon,
    MapPinIcon,
    Square3Stack3DIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const BasicInfoTab = ({ data = {}, onChange, opportunityType, errors }) => {

    // Handlers
    const handleFieldChange = (field, value) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    const handleNestedFieldChange = (parent, field, value) => {
        onChange({
            ...data,
            [parent]: {
                ...data[parent],
                [field]: value
            }
        });
    };

    // Ícones por tipo
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

    // Generate title suggestion
    const generateTitle = () => {
        const type = OPPORTUNITY_TYPE_LABELS[data.tipo];
        const date = new Date().toLocaleDateString('pt-PT');
        return `${type} - ${date}`;
    };

    return (
        <div className="space-y-6">
            {/* Tipo de Oportunidade */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Oportunidade *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
                        const Icon = getTypeIcon(type);
                        const isSelected = data.tipo === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => handleFieldChange('tipo', type)}
                                className={`
                                    flex flex-col items-center justify-center p-4 rounded-lg border-2 
                                    transition-all duration-200
                                    ${isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }
                                `}
                            >
                                <Icon className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Oportunidade *
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={data.titulo || ''}
                            onChange={(e) => handleFieldChange('titulo', e.target.value)}
                            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors?.titulo ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Ex: Compra de apartamento T3"
                        />
                        <button
                            type="button"
                            onClick={() => handleFieldChange('titulo', generateTitle())}
                            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Auto
                        </button>
                    </div>
                    {errors?.titulo && (
                        <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                    </label>
                    <select
                        value={data.estado || OPPORTUNITY_STATES.LEAD}
                        onChange={(e) => handleFieldChange('estado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        value={data.prioridade || 'media'}
                        onChange={(e) => handleFieldChange('prioridade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🟡 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="urgente">🔴 Urgente</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fecho Prevista
                    </label>
                    <input
                        type="date"
                        value={data.dataFechoPrevisto || ''}
                        onChange={(e) => handleFieldChange('dataFechoPrevisto', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                </label>
                <textarea
                    value={data.descricao || ''}
                    onChange={(e) => handleFieldChange('descricao', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalhes sobre a oportunidade..."
                />
            </div>

            {/* Valores e Orçamento */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    💰 Valores e Orçamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Mínimo (€)
                        </label>
                        <input
                            type="number"
                            value={data.valorMinimo || ''}
                            onChange={(e) => handleFieldChange('valorMinimo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Estimado (€)
                        </label>
                        <input
                            type="number"
                            value={data.valorEstimado || ''}
                            onChange={(e) => handleFieldChange('valorEstimado', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Máximo (€)
                        </label>
                        <input
                            type="number"
                            value={data.valorMaximo || ''}
                            onChange={(e) => handleFieldChange('valorMaximo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comissão (%)
                        </label>
                        <input
                            type="number"
                            value={data.percentualComissao || 5}
                            onChange={(e) => handleFieldChange('percentualComissao', e.target.value)}
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {data.valorEstimado && data.percentualComissao && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comissão Estimada
                            </label>
                            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <span className="font-semibold text-green-700">
                                    €{((parseFloat(data.valorEstimado) || 0) * (data.percentualComissao / 100)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Propriedade (se aplicável) */}
            {(data.tipo === OPPORTUNITY_TYPES.BUYER || data.tipo === OPPORTUNITY_TYPES.SELLER) && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        🏠 Detalhes do Imóvel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Imóvel
                            </label>
                            <select
                                value={data.propriedade?.tipoImovel || PROPERTY_TYPES.APARTMENT}
                                onChange={(e) => handleNestedFieldChange('propriedade', 'tipoImovel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.entries(PROPERTY_TYPE_LABELS).map(([type, label]) => (
                                    <option key={type} value={type}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Localização Preferida
                            </label>
                            <input
                                type="text"
                                value={data.propriedade?.localizacao || ''}
                                onChange={(e) => handleNestedFieldChange('propriedade', 'localizacao', e.target.value)}
                                placeholder="Ex: Centro da cidade"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nº Quartos
                            </label>
                            <select
                                value={data.propriedade?.numeroQuartos || ''}
                                onChange={(e) => handleNestedFieldChange('propriedade', 'numeroQuartos', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Indiferente</option>
                                <option value="0">T0</option>
                                <option value="1">T1</option>
                                <option value="2">T2</option>
                                <option value="3">T3</option>
                                <option value="4">T4</option>
                                <option value="5">T5+</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Área Mínima (m²)
                            </label>
                            <input
                                type="number"
                                value={data.propriedade?.areaMinima || ''}
                                onChange={(e) => handleNestedFieldChange('propriedade', 'areaMinima', e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Campos Específicos por Tipo */}
            {data.tipo === OPPORTUNITY_TYPES.BUYER && (
                <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        🛒 Informações do Comprador
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Compra
                            </label>
                            <select
                                value={data.comprador?.tipoCompra || 'habitacao_propria'}
                                onChange={(e) => handleNestedFieldChange('comprador', 'tipoCompra', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="habitacao_propria">Habitação Própria</option>
                                <option value="investimento">Investimento</option>
                                <option value="segunda_habitacao">Segunda Habitação</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Entrada Disponível (€)
                            </label>
                            <input
                                type="number"
                                value={data.comprador?.entradaDisponivel || ''}
                                onChange={(e) => handleNestedFieldChange('comprador', 'entradaDisponivel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.comprador?.necessitaCredito || false}
                                        onChange={(e) => handleNestedFieldChange('comprador', 'necessitaCredito', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    Necessita Crédito Habitação
                                </label>

                                {data.comprador?.necessitaCredito && (
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.comprador?.creditoAprovado || false}
                                            onChange={(e) => handleNestedFieldChange('comprador', 'creditoAprovado', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        Crédito Pré-Aprovado
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notas Gerais */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas e Observações
                </label>
                <textarea
                    value={data.notas || ''}
                    onChange={(e) => handleFieldChange('notas', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Informações adicionais sobre a oportunidade..."
                />
            </div>
        </div>
    );
};

export default BasicInfoTab;