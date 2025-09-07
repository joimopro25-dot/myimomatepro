/**
 * CLIENT FORM PAGE - MyImoMatePro INTEGRADO
 * Formulário completo para criar/editar clientes - VERSÃO REAL
 * 
 * INTEGRAÇÃO COMPLETA:
 * - Remoção de funções mock
 * - Integração com ClientContext
 * - Serviços reais do Firebase
 * - Loading states e error handling robustos
 * - Navegação correta após operações
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { validateClientData, CLIENT_CONTACT_PREFERENCES, CLIENT_MARITAL_STATUS, CLIENT_MARRIAGE_REGIMES, CLIENT_CREDIT_TYPES, CLIENT_LEAD_SOURCES, CLIENT_AVAILABLE_TAGS } from '../models/clientModel';
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

    // Função para dados iniciais do formulário
    function getInitialFormData() {
        return {
            // DADOS PESSOAIS (Obrigatórios)
            name: '',
            phone: '',

            // DADOS PESSOAIS (Opcionais)
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

            // DADOS DO CÔNJUGE
            spouse: {
                name: '',
                phone: '',
                email: '',
                cc: '',
                ccValidity: '',
                profession: '',
                nif: '',
                birthPlace: '',
                parish: '',
                municipality: '',
                district: ''
            },

            // MORADA
            address: {
                street: '',
                number: '',
                postalCode: '',
                city: '',
                country: 'Portugal'
            },

            // NOTAS
            notes: '',
            attachedDocuments: [],

            // INFORMAÇÕES FINANCEIRAS
            financial: {
                monthlyIncome: '',
                spouseMonthlyIncome: '',
                totalHouseholdIncome: '',
                availableCapital: '',
                credits: {
                    mortgage: { active: false, amount: '', entity: '' },
                    personal: { active: false, amount: '', entity: '' },
                    auto: { active: false, amount: '', entity: '' },
                    credit_card: { active: false, amount: '', entity: '' },
                    other: { active: false, amount: '', entity: '', description: '' }
                },
                relationshipBank: '',
                hasBankApproval: false,
                bankApprovalWhere: '',
                bankApprovalAmount: '',
                bankApprovalNotes: ''
            },

            // DOCUMENTAÇÃO
            documents: {
                ccFront: false,
                ccBack: false,
                ibanProof: false,
                irsDeclaration: false,
                salaryReceipts: false,
                birthCertificate: false,
                marriageCertificate: false,
                propertyRegistry: false,
                residenceCertificate: false,
                workContract: false
            },

            // TAGS E OBSERVAÇÕES
            tags: [],
            consultorObservations: '',
            howDidYouFindUs: 'website',
            nextContactDate: '',

            // GDPR
            gdpr: {
                consent: false,
                marketingConsent: false
            }
        };
    }

    // Carregar cliente em modo edição
    useEffect(() => {
        if (isEditMode && clientId) {
            console.log('🔄 Carregando cliente para edição...', { clientId });
            fetchClient(clientId).catch(error => {
                console.error('Erro ao carregar cliente:', error);
                navigate('/clients');
            });
        }

        // Cleanup ao desmontar
        return () => {
            if (!isEditMode) {
                clearCurrentClient();
            }
        };
    }, [isEditMode, clientId, fetchClient, clearCurrentClient, navigate]);

    // Preencher formulário com dados do cliente carregado
    useEffect(() => {
        if (currentClient && isEditMode) {
            console.log('📝 Preenchendo formulário com dados do cliente...', { clientId: currentClient.id });

            setFormData({
                ...getInitialFormData(),
                ...currentClient,
                address: { ...getInitialFormData().address, ...currentClient.address },
                spouse: { ...getInitialFormData().spouse, ...currentClient.spouse },
                financial: { ...getInitialFormData().financial, ...currentClient.financial },
                documents: { ...getInitialFormData().documents, ...currentClient.documents },
                gdpr: { ...getInitialFormData().gdpr, ...currentClient.gdpr }
            });
        }
    }, [currentClient, isEditMode]);

    // Calcular rendimento total do agregado
    const calculateTotalHouseholdIncome = useCallback(() => {
        const monthly = parseFloat(formData.financial.monthlyIncome) || 0;
        const spouseMonthly = parseFloat(formData.financial.spouseMonthlyIncome) || 0;
        const total = monthly + spouseMonthly;

        setFormData(prev => ({
            ...prev,
            financial: {
                ...prev.financial,
                totalHouseholdIncome: total > 0 ? total.toString() : ''
            }
        }));
    }, [formData.financial.monthlyIncome, formData.financial.spouseMonthlyIncome]);

    // Recalcular quando rendimentos mudam
    useEffect(() => {
        calculateTotalHouseholdIncome();
    }, [formData.financial.monthlyIncome, formData.financial.spouseMonthlyIncome, calculateTotalHouseholdIncome]);

    // Validação de campo individual
    const validateField = useCallback((fieldName, value) => {
        const errors = { ...validationErrors };

        switch (fieldName) {
            case 'name':
                if (!value || value.trim().length < 2) {
                    errors.name = 'Nome deve ter pelo menos 2 caracteres';
                } else {
                    delete errors.name;
                }
                break;

            case 'phone':
                if (!value) {
                    errors.phone = 'Telefone é obrigatório';
                } else if (!/^[+]?[(]?[\d\s\-()]{9,}$/.test(value.replace(/\s/g, ''))) {
                    errors.phone = 'Formato de telefone inválido';
                } else {
                    delete errors.phone;
                }
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.email = 'Email inválido';
                } else {
                    delete errors.email;
                }
                break;

            case 'nif':
                if (value && !/^\d{9}$/.test(value.replace(/\s/g, ''))) {
                    errors.nif = 'NIF deve ter 9 dígitos';
                } else {
                    delete errors.nif;
                }
                break;

            case 'postalCode':
                if (value && !/^\d{4}-\d{3}$/.test(value)) {
                    errors.postalCode = 'Código postal inválido (ex: 1234-567)';
                } else {
                    delete errors.postalCode;
                }
                break;

            default:
                break;
        }

        setValidationErrors(errors);
    }, [validationErrors]);

    // Validação completa do formulário
    const validateForm = useCallback(() => {
        const validation = validateClientData(formData);
        setValidationErrors(validation.errors);
        return validation.isValid;
    }, [formData]);

    // Handler para mudanças nos campos
    const handleFieldChange = useCallback((fieldPath, value) => {
        setFormData(prev => {
            const newData = { ...prev };
            const pathArray = fieldPath.split('.');

            let current = newData;
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (!current[pathArray[i]]) {
                    current[pathArray[i]] = {};
                }
                current = current[pathArray[i]];
            }
            current[pathArray[pathArray.length - 1]] = value;

            return newData;
        });

        // Marcar campo como tocado
        setTouched(prev => ({ ...prev, [fieldPath]: true }));

        // Validar campo se foi tocado
        if (touched[fieldPath]) {
            validateField(fieldPath, value);
        }
    }, [touched, validateField]);

    // Navegação entre steps
    const nextStep = useCallback(() => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    }, [currentStep, totalSteps]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    // Ir para o primeiro step com erro
    const goToFirstErrorStep = useCallback(() => {
        const errorFields = Object.keys(validationErrors);

        // Step 1: Dados pessoais
        if (errorFields.some(field => ['name', 'phone', 'email', 'nif', 'postalCode'].includes(field))) {
            setCurrentStep(1);
            return;
        }

        // Step 3: GDPR
        if (errorFields.includes('gdprConsent')) {
            setCurrentStep(3);
            return;
        }
    }, [validationErrors]);

    // Submissão do formulário
    const handleSubmit = useCallback(async () => {
        console.log('💾 Iniciando submissão do formulário...', { isEditMode, clientId });

        // Validar formulário
        if (!validateForm()) {
            console.log('❌ Formulário inválido', validationErrors);
            goToFirstErrorStep();
            return;
        }

        setIsSubmitting(true);

        try {
            clearError(isEditMode ? 'update' : 'create');

            if (isEditMode) {
                console.log('✏️ Atualizando cliente...', { clientId });
                await updateClient(clientId, formData);
                console.log('✅ Cliente atualizado com sucesso');
            } else {
                console.log('🆕 Criando novo cliente...');
                const newClient = await createClient(formData);
                console.log('✅ Cliente criado com sucesso', { clientId: newClient.id });
            }

            // Navegar para lista após sucesso
            setTimeout(() => {
                navigate('/clients');
            }, 1500);

        } catch (error) {
            console.error('❌ Erro na submissão:', error);
            // Error é tratado pelo context
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, goToFirstErrorStep, isEditMode, clientId, updateClient, createClient, clearError, navigate]);

    // Renderização dos steps
    const renderPersonalData = () => {
        const showSpouseFields = ['married', 'union'].includes(formData.maritalStatus);

        return (
            <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>

                {/* Campos Obrigatórios */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-4">
                        <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-medium text-blue-900">Informações Obrigatórias</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome */}
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

                        {/* Telefone */}
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
                </div>

                {/* Email e Preferências */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="joao@email.com"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
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

                    {formData.maritalStatus === 'married' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Regime de Casamento
                            </label>
                            <select
                                value={formData.marriageRegime}
                                onChange={(e) => handleFieldChange('marriageRegime', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Selecione o regime...</option>
                                {CLIENT_MARRIAGE_REGIMES.map(regime => (
                                    <option key={regime.value} value={regime.value}>
                                        {regime.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Dados do Cônjuge */}
                {showSpouseFields && (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <h3 className="text-lg font-medium text-yellow-800 mb-4">Dados do Cônjuge</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome do Cônjuge
                                </label>
                                <input
                                    type="text"
                                    value={formData.spouse.name}
                                    onChange={(e) => handleFieldChange('spouse.name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Maria Silva"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Telefone do Cônjuge
                                </label>
                                <input
                                    type="tel"
                                    value={formData.spouse.phone}
                                    onChange={(e) => handleFieldChange('spouse.phone', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="913456789"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Morada */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Morada de Residência</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                            <input
                                type="text"
                                value={formData.address.street}
                                onChange={(e) => handleFieldChange('address.street', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Rua das Flores"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Número/Andar</label>
                            <input
                                type="text"
                                value={formData.address.number}
                                onChange={(e) => handleFieldChange('address.number', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="123, 2º Dto"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                            <input
                                type="text"
                                value={formData.address.postalCode}
                                onChange={(e) => handleFieldChange('address.postalCode', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="1234-567"
                                maxLength="8"
                            />
                            {validationErrors.postalCode && (
                                <p className="mt-1 text-sm text-red-600">{validationErrors.postalCode}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                            <input
                                type="text"
                                value={formData.address.city}
                                onChange={(e) => handleFieldChange('address.city', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Lisboa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                            <select
                                value={formData.address.country}
                                onChange={(e) => handleFieldChange('address.country', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="Portugal">Portugal</option>
                                <option value="Brasil">Brasil</option>
                                <option value="Angola">Angola</option>
                                <option value="Moçambique">Moçambique</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderFinancialInfo = () => {
        const hasSpouse = ['married', 'union'].includes(formData.maritalStatus);

        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informações Financeiras</h2>

                {/* Rendimentos */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Rendimentos</h3>

                    <div className={`grid grid-cols-1 gap-6 ${hasSpouse ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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

                        {hasSpouse && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rendimento Mensal do Cônjuge (€)
                                </label>
                                <input
                                    type="number"
                                    value={formData.financial.spouseMonthlyIncome}
                                    onChange={(e) => handleFieldChange('financial.spouseMonthlyIncome', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2000"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rendimento do Agregado (€)
                            </label>
                            <input
                                type="number"
                                value={formData.financial.totalHouseholdIncome}
                                className="w-full px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium cursor-not-allowed"
                                placeholder="Soma automática"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Situação de Crédito */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Situação de Crédito</h3>

                    <div className="space-y-4">
                        {CLIENT_CREDIT_TYPES.map(credit => (
                            <div
                                key={credit.key}
                                className={`bg-white p-4 rounded-lg border ${formData.financial.credits[credit.key].active
                                        ? 'border-blue-200 bg-blue-50'
                                        : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center mb-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.financial.credits[credit.key].active}
                                            onChange={(e) => handleFieldChange(`financial.credits.${credit.key}.active`, e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-lg">{credit.icon}</span>
                                        <span className="text-sm font-medium text-gray-900">{credit.label}</span>
                                    </label>
                                </div>

                                {formData.financial.credits[credit.key].active && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Valor em Dívida (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.financial.credits[credit.key].amount}
                                                onChange={(e) => handleFieldChange(`financial.credits.${credit.key}.amount`, e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: 150000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                Entidade Credora
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.financial.credits[credit.key].entity}
                                                onChange={(e) => handleFieldChange(`financial.credits.${credit.key}.entity`, e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: Banco CGD"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderDocumentationAndObservations = () => (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">Documentação e Observações</h2>

            {/* Tags */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {CLIENT_AVAILABLE_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                const currentTags = formData.tags || [];
                                const newTags = currentTags.includes(tag)
                                    ? currentTags.filter(t => t !== tag)
                                    : [...currentTags, tag];
                                handleFieldChange('tags', newTags);
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${formData.tags?.includes(tag)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Observações */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações do Consultor
                </label>
                <textarea
                    rows="4"
                    value={formData.consultorObservations}
                    onChange={(e) => handleFieldChange('consultorObservations', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações internas sobre o cliente..."
                />
            </div>

            {/* Como nos conheceu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Como nos conheceu?
                    </label>
                    <select
                        value={formData.howDidYouFindUs}
                        onChange={(e) => handleFieldChange('howDidYouFindUs', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {CLIENT_LEAD_SOURCES.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data do Próximo Contacto
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.nextContactDate}
                        onChange={(e) => handleFieldChange('nextContactDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* GDPR */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Consentimentos GDPR</h3>

                <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.gdpr.consent}
                                onChange={(e) => handleFieldChange('gdpr.consent', e.target.checked)}
                                className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Consentimento para Tratamento de Dados Pessoais *
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários.
                                </p>
                            </div>
                        </label>
                        {validationErrors.gdprConsent && (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.gdprConsent}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.gdpr.marketingConsent}
                                onChange={(e) => handleFieldChange('gdpr.marketingConsent', e.target.checked)}
                                className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-700">
                                    Consentimento para Marketing e Comunicações
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dados do cliente...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
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
                </div>
            </header>

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
        </div>
    );
};

export default ClientFormPage;