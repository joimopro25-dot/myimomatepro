/**
 * OPPORTUNITY FORM PAGE - MyImoMatePro
 * Formulário completo para criar e editar oportunidades
 * 
 * Caminho: src/pages/OpportunityForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';
import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    OPPORTUNITY_PRIORITIES,
    PROPERTY_TYPES,
    PROPERTY_TYPE_LABELS,
    validateOpportunityData
} from '../models/opportunityModel';
import {
    ArrowLeftIcon,
    HomeIcon,
    ShoppingCartIcon,
    CurrencyEuroIcon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const OpportunityForm = () => {
    const navigate = useNavigate();
    const { clientId, opportunityId } = useParams();
    const { currentUser } = useAuth();
    const {
        createNewOpportunity,
        updateExistingOpportunity,
        fetchOpportunity,
        loading,
        errors
    } = useOpportunities();
    const { currentClient, fetchClient } = useClients();

    // Estado do formulário
    const [formData, setFormData] = useState({
        // Dados principais
        tipo: OPPORTUNITY_TYPES.BUYER,
        estado: OPPORTUNITY_STATES.LEAD,
        prioridade: OPPORTUNITY_PRIORITIES.MEDIUM,
        titulo: '',
        descricao: '',

        // Valores
        valorEstimado: '',
        valorMinimo: '',
        valorMaximo: '',
        percentualComissao: 5,

        // Datas
        dataFechoPrevisto: '',
        dataProximoContacto: '',

        // Propriedade
        propriedade: {
            tipoImovel: PROPERTY_TYPES.APARTMENT,
            localizacao: '',
            distrito: '',
            concelho: '',
            freguesia: '',
            areaBruta: '',
            areaUtil: '',
            numeroQuartos: '',
            numeroCasasBanho: '',
            anoConstrucao: '',
            caracteristicas: []
        },

        // Campos específicos por tipo
        comprador: {
            tipoCompra: 'habitacao_propria',
            necessitaCredito: false,
            creditoAprovado: false,
            valorCredito: '',
            entradaDisponivel: '',
            prazoCompra: '3_meses',
            zonasPreferidas: [],
            requisitos: []
        },

        vendedor: {
            motivoVenda: '',
            temCredito: false,
            valorCredito: '',
            prazoVenda: '3_meses',
            aceitaPermuta: false,
            disponibilidadeVisitas: '',
            imovelOcupado: false,
            dataDesocupacao: ''
        },

        senhorio: {
            valorRenda: '',
            duracaoContrato: '1_ano',
            caucao: 2,
            incluiDespesas: false,
            permitePets: false,
            mobiliado: false,
            disponibilidade: 'imediata',
            tipoInquilino: []
        },

        inquilino: {
            rendaMaxima: '',
            duracaoDesejada: '1_ano',
            numeroOcupantes: 1,
            temPets: false,
            necessitaMobiliado: false,
            dataEntrada: '',
            temFiador: false,
            profissao: '',
            rendimentoMensal: ''
        },

        investidor: {
            tipoInvestimento: [],
            orcamentoTotal: '',
            retornoEsperado: '',
            prazoInvestimento: '1_ano',
            experienciaPrevia: false,
            necessitaFinanciamento: false,
            tipoPropriedades: [],
            zonasInteresse: []
        },

        // Notas
        notas: ''
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carregar dados do cliente
    useEffect(() => {
        if (clientId && currentUser?.uid) {
            fetchClient(clientId);
        }
    }, [clientId, currentUser]);

    // Carregar dados da oportunidade se for edição
    useEffect(() => {
        if (opportunityId && clientId && currentUser?.uid) {
            loadOpportunity();
        }
    }, [opportunityId, clientId, currentUser]);

    const loadOpportunity = async () => {
        try {
            const opportunity = await fetchOpportunity(clientId, opportunityId);
            if (opportunity) {
                setFormData({
                    ...formData,
                    ...opportunity,
                    valorEstimado: opportunity.valorEstimado?.toString() || '',
                    valorMinimo: opportunity.valorMinimo?.toString() || '',
                    valorMaximo: opportunity.valorMaximo?.toString() || ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar oportunidade:', error);
        }
    };

    // Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            // Campo nested (ex: propriedade.tipoImovel)
            const [parent, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Limpar erro do campo ao editar
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleTipoChange = (tipo) => {
        setFormData(prev => ({
            ...prev,
            tipo,
            titulo: generateTitle(tipo, currentClient?.name)
        }));
    };

    const generateTitle = (tipo, clientName) => {
        const date = new Date().toLocaleDateString('pt-PT');
        const typeLabel = OPPORTUNITY_TYPE_LABELS[tipo];
        return `${typeLabel} - ${clientName || 'Cliente'} - ${date}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setValidationErrors({});
        setSuccessMessage('');

        // Preparar dados para submissão
        const dataToSubmit = {
            ...formData,
            valorEstimado: parseFloat(formData.valorEstimado) || 0,
            valorMinimo: parseFloat(formData.valorMinimo) || 0,
            valorMaximo: parseFloat(formData.valorMaximo) || 0,
            comissaoEstimada: (parseFloat(formData.valorEstimado) || 0) * (formData.percentualComissao / 100)
        };

        // Validar dados
        const validation = validateOpportunityData(dataToSubmit);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            if (opportunityId) {
                // Atualizar oportunidade existente
                await updateExistingOpportunity(clientId, opportunityId, dataToSubmit);
                setSuccessMessage('Oportunidade atualizada com sucesso!');
            } else {
                // Criar nova oportunidade
                await createNewOpportunity(clientId, dataToSubmit);
                setSuccessMessage('Oportunidade criada com sucesso!');
            }

            // Redirecionar após 1 segundo
            setTimeout(() => {
                navigate(`/clients/${clientId}`);
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar oportunidade:', error);
            setValidationErrors({
                geral: 'Erro ao salvar oportunidade. Por favor, tente novamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderizar campos específicos por tipo
    const renderTypeSpecificFields = () => {
        switch (formData.tipo) {
            case OPPORTUNITY_TYPES.BUYER:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Informações do Comprador</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Compra
                                </label>
                                <select
                                    name="comprador.tipoCompra"
                                    value={formData.comprador.tipoCompra}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="habitacao_propria">Habitação Própria</option>
                                    <option value="investimento">Investimento</option>
                                    <option value="segunda_habitacao">Segunda Habitação</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prazo para Compra
                                </label>
                                <select
                                    name="comprador.prazoCompra"
                                    value={formData.comprador.prazoCompra}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="imediato">Imediato</option>
                                    <option value="1_mes">1 Mês</option>
                                    <option value="3_meses">3 Meses</option>
                                    <option value="6_meses">6 Meses</option>
                                    <option value="1_ano">1 Ano</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Entrada Disponível (€)
                                </label>
                                <input
                                    type="number"
                                    name="comprador.entradaDisponivel"
                                    value={formData.comprador.entradaDisponivel}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="comprador.necessitaCredito"
                                        checked={formData.comprador.necessitaCredito}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    Necessita Crédito
                                </label>

                                {formData.comprador.necessitaCredito && (
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="comprador.creditoAprovado"
                                            checked={formData.comprador.creditoAprovado}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                        />
                                        Crédito Aprovado
                                    </label>
                                )}
                            </div>

                            {formData.comprador.necessitaCredito && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Valor do Crédito (€)
                                    </label>
                                    <input
                                        type="number"
                                        name="comprador.valorCredito"
                                        value={formData.comprador.valorCredito}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case OPPORTUNITY_TYPES.SELLER:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Informações do Vendedor</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motivo da Venda
                                </label>
                                <input
                                    type="text"
                                    name="vendedor.motivoVenda"
                                    value={formData.vendedor.motivoVenda}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Mudança de cidade"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prazo para Venda
                                </label>
                                <select
                                    name="vendedor.prazoVenda"
                                    value={formData.vendedor.prazoVenda}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="urgente">Urgente</option>
                                    <option value="1_mes">1 Mês</option>
                                    <option value="3_meses">3 Meses</option>
                                    <option value="6_meses">6 Meses</option>
                                    <option value="sem_pressa">Sem Pressa</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="vendedor.temCredito"
                                        checked={formData.vendedor.temCredito}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    Tem Crédito
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="vendedor.aceitaPermuta"
                                        checked={formData.vendedor.aceitaPermuta}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    Aceita Permuta
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="vendedor.imovelOcupado"
                                        checked={formData.vendedor.imovelOcupado}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                    />
                                    Imóvel Ocupado
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
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

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
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
                </div>

                {/* Mensagens */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                            <p className="text-green-800">{successMessage}</p>
                        </div>
                    </div>
                )}

                {validationErrors.geral && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                            <p className="text-red-800">{validationErrors.geral}</p>
                        </div>
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Seleção do Tipo de Oportunidade */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Tipo de Oportunidade
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
                                const Icon = getTypeIcon(type);
                                const isSelected = formData.tipo === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTipoChange(type)}
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

                    {/* Informações Básicas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Informações Básicas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título da Oportunidade *
                                </label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validationErrors.titulo ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Ex: Compra de apartamento T3"
                                    required
                                />
                                {validationErrors.titulo && (
                                    <p className="mt-1 text-sm text-red-600">{validationErrors.titulo}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
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
                                        name="prioridade"
                                        value={formData.prioridade}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="baixa">Baixa</option>
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Detalhes sobre a oportunidade..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Valores e Orçamento */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Valores e Orçamento
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor Estimado (€)
                                </label>
                                <input
                                    type="number"
                                    name="valorEstimado"
                                    value={formData.valorEstimado}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor Mínimo (€)
                                </label>
                                <input
                                    type="number"
                                    name="valorMinimo"
                                    value={formData.valorMinimo}
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
                                    value={formData.valorMaximo}
                                    onChange={handleInputChange}
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
                                    name="percentualComissao"
                                    value={formData.percentualComissao}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {formData.valorEstimado && formData.percentualComissao && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Comissão Estimada
                                    </label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                                        <span className="font-semibold text-green-600">
                                            €{((parseFloat(formData.valorEstimado) || 0) * (formData.percentualComissao / 100)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Campos Específicos do Tipo */}
                    {renderTypeSpecificFields() && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            {renderTypeSpecificFields()}
                        </div>
                    )}

                    {/* Notas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Notas e Observações
                        </h2>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Informações adicionais sobre a oportunidade..."
                        />
                    </div>

                    {/* Botões de Ação */}
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
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'A guardar...' : (opportunityId ? 'Atualizar' : 'Criar Oportunidade')}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default OpportunityForm;