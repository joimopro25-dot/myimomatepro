/**
 * COMMISSION SECTION - Componente partilhado
 * Caminho: src/pages/opportunities/shared/CommissionSection.jsx
 */

import React from 'react';
import {
    DocumentArrowUpIcon,
    PaperClipIcon
} from '@heroicons/react/24/outline';
import { calculateCommission } from './constants';

const CommissionSection = ({
    formData,
    handleInputChange,
    title = "💰 Valores e Orçamento"
}) => {

    const comissoes = calculateCommission(formData);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {title}
            </h2>

            <div className="space-y-4">
                {/* Valor do Negócio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor Estimado do Negócio (€)
                        </label>
                        <input
                            type="number"
                            name="valorEstimado"
                            value={formData.valorEstimado || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>

                    {/* Tipo de Comissão */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Comissão
                        </label>
                        <select
                            name="tipoComissao"
                            value={formData.tipoComissao || 'percentual'}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="percentual">Percentual (%)</option>
                            <option value="fixo">Valor Fixo (€)</option>
                        </select>
                    </div>

                    {/* Valor ou Percentual da Comissão */}
                    {formData.tipoComissao === 'percentual' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Comissão (%)
                            </label>
                            <input
                                type="number"
                                name="percentualComissao"
                                value={formData.percentualComissao || 5}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                step="0.5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Fixo da Comissão (€)
                            </label>
                            <input
                                type="number"
                                name="valorComissaoFixo"
                                value={formData.valorComissaoFixo || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>

                {/* Valores mínimo e máximo (opcional) */}
                {formData.tipo === 'comprador' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Mínimo (€)
                            </label>
                            <input
                                type="number"
                                name="valorMinimo"
                                value={formData.valorMinimo || ''}
                                onChange={handleInputChange}
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
                                name="valorMaximo"
                                value={formData.valorMaximo || ''}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                    </div>
                )}

                {/* Linha de cálculo de comissões */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comissão Total Estimada
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="font-semibold text-gray-700">
                                €{comissoes.total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minha % da Comissão
                        </label>
                        <input
                            type="number"
                            name="minhaPercentagem"
                            value={formData.minhaPercentagem || 100}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minha Comissão a Receber
                        </label>
                        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <span className="font-semibold text-green-700">
                                €{comissoes.minha.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status do Pagamento
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="comissaoPaga"
                                checked={formData.comissaoPaga || false}
                                onChange={handleInputChange}
                                className="rounded border-gray-300 text-green-600 mr-2"
                            />
                            <span className={`text-sm ${formData.comissaoPaga ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                                {formData.comissaoPaga ? 'Comissão Paga' : 'Comissão Não Paga'}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Botões para anexar documentos de pagamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Documento de Pagamento da Comissão
                        </label>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <DocumentArrowUpIcon className="w-5 h-5" />
                            <span>Anexar Documento</span>
                        </button>
                        {formData.documentoPagamento && (
                            <p className="text-sm text-green-600 mt-2">✓ Documento anexado</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comprovante de Transferência
                        </label>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <PaperClipIcon className="w-5 h-5" />
                            <span>Anexar Comprovante</span>
                        </button>
                        {formData.comprovanteTransferencia && (
                            <p className="text-sm text-green-600 mt-2">✓ Comprovante anexado</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionSection;