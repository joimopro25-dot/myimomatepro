/**
 * CLIENT FORM PAGE - MyImoMatePro
 * Formulário completo para criar/editar clientes
 * CORREÇÃO: Fixed constants usage - arrays instead of Object.entries()
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { validateClientData, CLIENT_CONTACT_PREFERENCES, CLIENT_MARITAL_STATUS, CLIENT_MARRIAGE_REGIMES, CLIENT_CREDIT_TYPES, CLIENT_LEAD_SOURCES, CLIENT_AVAILABLE_TAGS } from '../models/clientModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentArrowUpIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const ClientFormPage = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(clientId);

    // Context do cliente
    const {
        currentClient,
        loading,
        errors: contextErrors,
        createClient,
        fetchClient,
        updateClient,
        clearCurrentClient,
        clearError
    } = useClients();

    // Estados locais
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [formData, setFormData] = useState(getInitialFormData());
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializar dados do formulário
    function getInitialFormData() {
        return {
            // Dados pessoais obrigatórios
            name: '',
            phone: '',

            // Dados pessoais opcionais
            email: '',
            contactPreference: 'phone',
            bestContactTime: '',
            cc: '',
            ccValidity: '',
            nif: '',
            birthDate: '',
            birthPlace: '',
            parish: '',
            municipality: '',
            district: '',
            profession: '',
            maritalStatus: 'single',
            marriageRegime: '',

            // Dados do cônjuge
            spouse: {
                name: '',
                phone: '',
                email: '',
                cc: '',
                ccValidity: '',
                profession: '',
                nif: '',
                birthPlace: ''
            },

            // Morada
            address: {
                street: '',
                number: '',
                floor: '',
                zipCode: '',
                city: '',
                parish: '',
                municipality: '',
                district: ''
            },

            // Informações financeiras
            financial: {
                profession: '',
                monthlyIncome: '',
                spouseProfession: '',
                spouseMonthlyIncome: '',
                availableCapital: '',
                creditSituation: 'no_credit',
                relationshipBank: '',
                hasPreApproval: false,
                preApprovalDetails: ''
            },

            // Documentação e observações
            availableDocuments: [],
            tags: [],
            leadSource: '',
            observations: '',
            nextContactDate: '',
            gdprConsent: false,
            marketingConsent: false
        };
    }

    // Carregar dados do cliente se estiver em modo edição
    useEffect(() => {
        if (isEditMode && clientId) {
            fetchClient(clientId).then(client => {
                if (client) {
                    setFormData({
                        ...getInitialFormData(),
                        ...client
                    });
                }
            }).catch(error => {
                console.error('Erro ao carregar cliente:', error);
            });
        }

        return () => {
            if (isEditMode) {
                clearCurrentClient();
            }
        };
    }, [isEditMode, clientId, fetchClient, clearCurrentClient]);

    // Validar formulário
    const validateForm = useCallback(() => {
        const validation = validateClientData(formData);
        setValidationErrors(validation.errors || {});
        return validation.isValid;
    }, [formData]);

    // Handlers
    const handleFieldChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }

        // Marcar campo como touched
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));

        // Limpar erro do campo específico
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            clearError(isEditMode ? 'update' : 'create');

            // Validar formulário
            if (!validateForm()) {
                setCurrentStep(1); // Voltar ao primeiro step se houver erros
                return;
            }

            if (isEditMode) {
                await updateClient(clientId, formData);
            } else {
                await createClient(formData);
            }

            // Sucesso - redirecionar
            navigate('/clients');

        } catch (error) {
            console.error('Erro ao submeter formulário:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderização dos steps
    const renderPersonalData = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados Pessoais</h2>

                {/* Campos obrigatórios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="João Silva"
                        />
                        {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="912345678"
                        />
                        {validationErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                    </div>
                </div>

                {/* Email e Preferências */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="joao@exemplo.pt"
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferência de Contacto
                        </label>
                        <select
                            value={formData.contactPreference}
                            onChange={(e) => handleFieldChange('contactPreference', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {CLIENT_CONTACT_PREFERENCES.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Estado Civil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Civil
                        </label>
                        <select
                            value={formData.maritalStatus}
                            onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {CLIENT_MARITAL_STATUS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(formData.maritalStatus === 'married' || formData.maritalStatus === 'union') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Regime de Casamento
                            </label>
                            <select
                                value={formData.marriageRegime}
                                onChange={(e) => handleFieldChange('marriageRegime', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Selecionar...</option>
                                {CLIENT_MARRIAGE_REGIMES.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFinancialInfo = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Financeiras</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profissão
                        </label>
                        <input
                            type="text"
                            value={formData.financial.profession}
                            onChange={(e) => handleFieldChange('financial.profession', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Engenheiro Civil"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rendimento Mensal (€)
                        </label>
                        <input
                            type="number"
                            value={formData.financial.monthlyIncome}
                            onChange={(e) => handleFieldChange('financial.monthlyIncome', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="2500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capital Disponível (€)
                        </label>
                        <input
                            type="number"
                            value={formData.financial.availableCapital}
                            onChange={(e) => handleFieldChange('financial.availableCapital', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="50000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banco de Relacionamento
                        </label>
                        <input
                            type="text"
                            value={formData.financial.relationshipBank}
                            onChange={(e) => handleFieldChange('financial.relationshipBank', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Banco Millennium"
                        />
                    </div>
                </div>

                {/* Pré-aprovação bancária */}
                <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={formData.financial.hasPreApproval}
                            onChange={(e) => handleFieldChange('financial.hasPreApproval', e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Tem pré-aprovação bancária
                        </span>
                    </label>

                    {formData.financial.hasPreApproval && (
                        <div className="ml-7 space-y-4">
                            <input
                                type="text"
                                value={formData.financial.preApprovalDetails}
                                onChange={(e) => handleFieldChange('financial.preApprovalDetails', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Detalhes da pré-aprovação..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDocumentationAndObservations = () => (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Documentação e Observações</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CLIENT_AVAILABLE_TAGS.map((tag) => (
                                <label key={tag} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.tags.includes(tag)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                handleFieldChange('tags', [...formData.tags, tag]);
                                            } else {
                                                handleFieldChange('tags', formData.tags.filter(t => t !== tag));
                                            }
                                        }}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Como nos conheceu?
                        </label>
                        <select
                            value={formData.leadSource}
                            onChange={(e) => handleFieldChange('leadSource', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecionar...</option>
                            {CLIENT_LEAD_SOURCES.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações do Consultor
                        </label>
                        <textarea
                            value={formData.observations}
                            onChange={(e) => handleFieldChange('observations', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notas importantes sobre o cliente..."
                        />
                    </div>

                    {/* Consentimentos GDPR */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900">Consentimentos</h3>

                        <label className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                checked={formData.gdprConsent}
                                onChange={(e) => handleFieldChange('gdprConsent', e.target.checked)}
                                className="form-checkbox h-4 w-4 text-blue-600 mt-1"
                            />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium">Consentimento para tratamento de dados *</p>
                                <p className="text-gray-600">
                                    Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários.
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                checked={formData.marketingConsent}
                                onChange={(e) => handleFieldChange('marketingConsent', e.target.checked)}
                                className="form-checkbox h-4 w-4 text-blue-600 mt-1"
                            />
                            <div className="text-sm text-gray-700">
                                <p className="font-medium">Comunicações promocionais</p>
                                <p className="text-gray-600">
                                    Consinto em receber comunicações promocionais por email, SMS ou telefone.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalData();
            case 2:
                return renderFinancialInfo();
            case 3:
                return renderDocumentationAndObservations();
            default:
                return renderPersonalData();
        }
    };

    // Loading state para carregamento inicial
    if (isEditMode && loading.current) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dados do cliente...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6">
                {/* Header com Navegação */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/clients')}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

                {/* Alertas de erro */}
                {(contextErrors.create || contextErrors.update) && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Erro ao guardar cliente</h3>
                                <p className="mt-1 text-sm text-red-700">
                                    {contextErrors.create || contextErrors.update}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progresso */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map(step => (
                            <div key={step} className="flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${step === currentStep
                                        ? 'bg-blue-600 text-white'
                                        : step < currentStep
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step < currentStep ? (
                                        <CheckCircleIcon className="w-6 h-6" />
                                    ) : (
                                        step
                                    )}
                                </div>
                                {step < 3 && (
                                    <div className={`flex-1 h-0.5 mx-4 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600 font-medium">Dados Pessoais</span>
                        <span className="text-sm text-gray-600 font-medium">Info. Financeiras</span>
                        <span className="text-sm text-gray-600 font-medium">Documentação</span>
                    </div>
                </div>

                {/* Conteúdo do Formulário */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                    {renderCurrentStep()}
                </div>

                {/* Navegação */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-2 border rounded-lg transition-colors ${currentStep === 1
                                ? 'invisible'
                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        ← Anterior
                    </button>

                    <div className="flex gap-4">
                        {currentStep < totalSteps ? (
                            <button
                                onClick={nextStep}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Próximo →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || loading.create || loading.update}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-medium disabled:opacity-50"
                            >
                                {isSubmitting || loading.create || loading.update
                                    ? 'Guardando...'
                                    : isEditMode
                                        ? 'Guardar Alterações'
                                        : 'Criar Cliente'
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ClientFormPage;