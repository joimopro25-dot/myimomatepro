/**
 * OPPORTUNITY FORM ROUTER - Componente principal
 * Decide qual tipo de oportunidade renderizar
 * Caminho: src/pages/opportunities/OpportunityForm.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOpportunities } from '../../contexts/OpportunityContext';
import { useClients } from '../../contexts/ClientContext';
import Layout from '../../components/Layout';

// Componentes partilhados
import OpportunityHeader from './shared/OpportunityHeader';
import OpportunityTypeSelector from './shared/OpportunityTypeSelector';
import BasicInfoSection from './shared/BasicInfoSection';
import CommissionSection from './shared/CommissionSection';
import ActionButtons from './shared/ActionButtons';

// Componentes específicos por tipo
import BuyerOpportunity from './components/BuyerOpportunity';
import SellerOpportunity from './components/SellerOpportunity';
// import LandlordOpportunity from './components/LandlordOpportunity';
// import TenantOpportunity from './components/TenantOpportunity';
// import InvestorOpportunity from './components/InvestorOpportunity';

import {
    OPPORTUNITY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    OPPORTUNITY_STATES,
    OPPORTUNITY_PRIORITIES,
    validateOpportunityData
} from '../../models/opportunityModel';

const OpportunityForm = () => {
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

    // Estado principal do formulário
    const [formData, setFormData] = useState({
        // Dados principais
        tipo: OPPORTUNITY_TYPES.BUYER,
        estado: OPPORTUNITY_STATES.LEAD,
        prioridade: OPPORTUNITY_PRIORITIES.MEDIUM,
        titulo: '',
        descricao: '',

        // Valores e Comissões
        valorEstimado: '',
        valorMinimo: '',
        valorMaximo: '',
        tipoComissao: 'percentual',
        percentualComissao: 5,
        valorComissaoFixo: '',
        minhaPercentagem: 100,
        comissaoPaga: false,
        documentoPagamento: null,
        comprovanteTransferencia: null,

        // Dados específicos por tipo (serão adicionados pelos componentes)
        imoveis: [], // Para compradores
        imovelVenda: null, // Para vendedores
        imoveisArrendar: [], // Para senhorios
        requisitosArrendamento: null, // Para arrendatários
        portfolioInvestimento: null, // Para investidores

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

    // Carregar oportunidade existente
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
                    valorMaximo: opportunity.valorMaximo?.toString() || '',
                    valorComissaoFixo: opportunity.valorComissaoFixo?.toString() || ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar oportunidade:', error);
            setValidationErrors({
                geral: 'Erro ao carregar oportunidade. Por favor, tente novamente.'
            });
        }
    };

    // Handler para mudanças nos inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
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
    };

    // Handler para mudança de tipo
    const handleTipoChange = (tipo) => {
        if (!opportunityId) { // Só permite mudança se não estiver editando
            const date = new Date().toLocaleDateString('pt-PT');
            const typeLabel = OPPORTUNITY_TYPE_LABELS[tipo];
            setFormData(prev => ({
                ...prev,
                tipo,
                titulo: `${typeLabel} - ${currentClient?.name || 'Cliente'} - ${date}`
            }));
        }
    };

    // Handler para submissão do formulário
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
            valorComissaoFixo: parseFloat(formData.valorComissaoFixo) || 0
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
                await updateExistingOpportunity(clientId, opportunityId, dataToSubmit);
                setSuccessMessage('Oportunidade atualizada com sucesso!');
            } else {
                await createNewOpportunity(clientId, dataToSubmit);
                setSuccessMessage('Oportunidade criada com sucesso!');
            }

            // Redirecionar após sucesso
            setTimeout(() => {
                window.location.href = `/clients/${clientId}`;
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

    // Função para atualizar dados específicos do tipo
    const updateTypeSpecificData = (data) => {
        setFormData(prev => ({
            ...prev,
            ...data
        }));
    };

    // Renderizar componente específico baseado no tipo
    const renderTypeSpecificComponent = () => {
        switch (formData.tipo) {
            case OPPORTUNITY_TYPES.BUYER:
                return (
                    <BuyerOpportunity
                        formData={formData}
                        updateFormData={updateTypeSpecificData}
                        handleInputChange={handleInputChange}
                        clientId={clientId}
                        opportunityId={opportunityId}
                    />
                );

            case OPPORTUNITY_TYPES.SELLER:
                return (
                    <SellerOpportunity
                        formData={formData}
                        updateFormData={updateTypeSpecificData}
                        handleInputChange={handleInputChange}
                        clientId={clientId}
                        opportunityId={opportunityId}
                    />
                );

            case OPPORTUNITY_TYPES.LANDLORD:
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-500 text-center py-8">
                            Funcionalidade de Senhorio em desenvolvimento...
                        </p>
                    </div>
                );

            case OPPORTUNITY_TYPES.TENANT:
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-500 text-center py-8">
                            Funcionalidade de Arrendatário em desenvolvimento...
                        </p>
                    </div>
                );

            case OPPORTUNITY_TYPES.INVESTOR:
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <p className="text-gray-500 text-center py-8">
                            Funcionalidade de Investidor em desenvolvimento...
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <OpportunityHeader
                    clientId={clientId}
                    opportunityId={opportunityId}
                    currentClient={currentClient}
                    successMessage={successMessage}
                    validationErrors={validationErrors}
                />

                {/* Formulário Principal */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Seletor de Tipo */}
                    <OpportunityTypeSelector
                        selectedType={formData.tipo}
                        onTypeChange={handleTipoChange}
                        isEditing={!!opportunityId}
                    />

                    {/* Informações Básicas */}
                    <BasicInfoSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />

                    {/* Componente específico do tipo */}
                    {renderTypeSpecificComponent()}

                    {/* Seção de Comissões */}
                    <CommissionSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />

                    {/* Botões de Ação */}
                    <ActionButtons
                        clientId={clientId}
                        isSubmitting={isSubmitting}
                        isEditing={!!opportunityId}
                        onSubmit={handleSubmit}
                    />
                </form>
            </div>
        </Layout>
    );
};

export default OpportunityForm;