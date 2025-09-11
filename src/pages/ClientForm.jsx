/**
 * CLIENT FORM PAGE - MyImoMatePro - VERSÃO COMPLETA SEM PREFERÊNCIAS
 * Formulário completo para criar/editar clientes
 * MANTÉM: Toda a funcionalidade React + Context + Validação existente
 * REMOVE: Seção Preferências de Imóvel
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
    const totalSteps = 4;
    const [formData, setFormData] = useState(getInitialFormData());
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializar dados do formulário COMPLETO (SEM PREFERÊNCIAS)
    function getInitialFormData() {
        return {
            // ===== DADOS PESSOAIS (Obrigatórios) =====
            name: '',
            phone: '',

            // ===== DADOS PESSOAIS (Opcionais) =====
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

            // ===== DADOS DO CÔNJUGE (condicional) =====
            spouse: {
                name: '',
                phone: '',
                email: '',
                cc: '',
                ccValidity: '',
                profession: '',
                nif: '',
                birthDate: '',
                birthPlace: '',
                parish: '',
                municipality: '',
                district: ''
            },

            // ===== MORADA COMPLETA =====
            address: {
                street: '',
                number: '',
                floor: '',
                postalCode: '',
                city: '',
                parish: '',
                municipality: '',
                district: '',
                country: 'Portugal'
            },

            // ===== INFORMAÇÕES FINANCEIRAS COMPLETAS =====
            financial: {
                monthlyIncome: '',
                spouseMonthlyIncome: '',
                totalHouseholdIncome: '',
                availableCapital: '',

                // Situação de crédito detalhada
                credits: {
                    mortgage: { active: false, amount: '', entity: '', monthlyPayment: '' },
                    personal: { active: false, amount: '', entity: '', monthlyPayment: '' },
                    auto: { active: false, amount: '', entity: '', monthlyPayment: '' },
                    credit_card: { active: false, amount: '', entity: '', monthlyPayment: '' },
                    other: { active: false, amount: '', entity: '', monthlyPayment: '', description: '' }
                },

                relationshipBank: '',
                hasPreApproval: false,
                bankApprovalWhere: '',
                bankApprovalAmount: '',
                bankApprovalConditions: '',
                bankApprovalValidity: ''
            },

            // ===== DOCUMENTAÇÃO COMPLETA =====
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
                workContract: false,
                bankStatement: false,
                divorceDecree: false,
                pensionProof: false
            },

            // ===== GESTÃO DE RELACIONAMENTO =====
            tags: [],
            leadSource: 'website',
            referralSource: '',
            consultorObservations: '',
            nextContactDate: '',

            // ===== GDPR E CONSENTIMENTOS =====
            gdprConsent: false,
            marketingConsent: false,
            dataProcessingConsent: false,
            thirdPartyConsent: false
        };
    }

    // Constantes para os novos campos
    const creditTypes = [
        { key: 'mortgage', label: 'Crédito Habitação', icon: '🏠' },
        { key: 'personal', label: 'Crédito Pessoal', icon: '💤' },
        { key: 'auto', label: 'Crédito Automóvel', icon: '🚗' },
        { key: 'credit_card', label: 'Cartão de Crédito', icon: '💳' },
        { key: 'other', label: 'Outro Crédito', icon: '📋' }
    ];

    // Função para calcular rendimento total
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

    // Calcular rendimento quando os valores mudam
    useEffect(() => {
        calculateTotalHouseholdIncome();
    }, [calculateTotalHouseholdIncome]);

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

    // ===== RENDERIZAÇÃO DOS STEPS =====

    const renderPersonalData = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
                <p className="text-gray-600 mt-2">Informações básicas e documentação do cliente</p>
            </div>

            {/* Campos Obrigatórios */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 ml-3">Informações Obrigatórias</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="João Silva Santos"
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="+351 912 345 678"
                        />
                        {validationErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Contactos e Preferências */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="joao@email.com"
                        />
                        {validationErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferência de Contacto</label>
                        <select
                            value={formData.contactPreference}
                            onChange={(e) => handleFieldChange('contactPreference', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {CLIENT_CONTACT_PREFERENCES.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Melhor Horário de Contacto</label>
                        <input
                            type="text"
                            value={formData.bestContactTime}
                            onChange={(e) => handleFieldChange('bestContactTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 9h-12h, 14h-18h, Fins de semana"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cartão Cidadão</label>
                            <input
                                type="text"
                                value={formData.cc}
                                onChange={(e) => handleFieldChange('cc', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="12345678 9 ZZ0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Validade CC</label>
                            <input
                                type="date"
                                value={formData.ccValidity}
                                onChange={(e) => handleFieldChange('ccValidity', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NIF</label>
                        <input
                            type="text"
                            value={formData.nif}
                            onChange={(e) => handleFieldChange('nif', e.target.value)}
                            maxLength="9"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.nif ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="123456789"
                        />
                        {validationErrors.nif && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.nif}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                            <input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Naturalidade</label>
                            <input
                                type="text"
                                value={formData.birthPlace}
                                onChange={(e) => handleFieldChange('birthPlace', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Lisboa"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado Civil e Profissão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
                    <select
                        value={formData.maritalStatus}
                        onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Regime de Casamento</label>
                        <select
                            value={formData.marriageRegime}
                            onChange={(e) => handleFieldChange('marriageRegime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecione o regime...</option>
                            {CLIENT_MARRIAGE_REGIMES.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
                    <input
                        type="text"
                        value={formData.profession}
                        onChange={(e) => handleFieldChange('profession', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Engenheiro Civil"
                    />
                </div>
            </div>

            {/* Dados do Cônjuge (condicional) */}
            {(formData.maritalStatus === 'married' || formData.maritalStatus === 'union') && (
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-yellow-800 ml-3">Dados do Cônjuge</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cônjuge</label>
                            <input
                                type="text"
                                value={formData.spouse.name}
                                onChange={(e) => handleFieldChange('spouse.name', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Maria Silva Santos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone do Cônjuge</label>
                            <input
                                type="tel"
                                value={formData.spouse.phone}
                                onChange={(e) => handleFieldChange('spouse.phone', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="+351 913 456 789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email do Cônjuge</label>
                            <input
                                type="email"
                                value={formData.spouse.email}
                                onChange={(e) => handleFieldChange('spouse.email', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="maria@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profissão do Cônjuge</label>
                            <input
                                type="text"
                                value={formData.spouse.profession}
                                onChange={(e) => handleFieldChange('spouse.profession', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Professora"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CC do Cônjuge</label>
                            <input
                                type="text"
                                value={formData.spouse.cc}
                                onChange={(e) => handleFieldChange('spouse.cc', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="87654321 0 YY1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">NIF do Cônjuge</label>
                            <input
                                type="text"
                                value={formData.spouse.nif}
                                onChange={(e) => handleFieldChange('spouse.nif', e.target.value)}
                                maxLength="9"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="987654321"
                            />
                        </div>

                        {/* ✅ NOVOS CAMPOS: Data de Nascimento e Naturalidade do Cônjuge */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento do Cônjuge</label>
                            <input
                                type="date"
                                value={formData.spouse.birthDate}
                                onChange={(e) => handleFieldChange('spouse.birthDate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Naturalidade do Cônjuge</label>
                            <input
                                type="text"
                                value={formData.spouse.birthPlace}
                                onChange={(e) => handleFieldChange('spouse.birthPlace', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Porto"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Morada de Residência */}
            <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="m12 3 8 8v10H4V11l8-8z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Morada de Residência</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rua/Avenida</label>
                        <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleFieldChange('address.street', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Rua das Flores"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número/Andar</label>
                        <input
                            type="text"
                            value={formData.address.number}
                            onChange={(e) => handleFieldChange('address.number', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="123, 2º Dto"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                        <input
                            type="text"
                            value={formData.address.postalCode}
                            onChange={(e) => handleFieldChange('address.postalCode', e.target.value)}
                            maxLength="8"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1234-567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                        <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => handleFieldChange('address.city', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Lisboa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <select
                            value={formData.address.country}
                            onChange={(e) => handleFieldChange('address.country', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="Portugal">Portugal</option>
                            <option value="Brasil">Brasil</option>
                            <option value="Angola">Angola</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancialInfo = () => {
        const hasSpouse = ['married', 'union'].includes(formData.maritalStatus);

        return (
            <div className="space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Informações Financeiras</h2>
                    <p className="text-gray-600 mt-2">Rendimentos, situação creditícia e capacidade financeira</p>
                </div>

                {/* Rendimentos */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 ml-3">Rendimentos Mensais</h3>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-${hasSpouse ? '3' : '2'} gap-6`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rendimento Mensal (€)</label>
                            <input
                                type="number"
                                value={formData.financial.monthlyIncome}
                                onChange={(e) => handleFieldChange('financial.monthlyIncome', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="2500"
                            />
                        </div>

                        {hasSpouse && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rendimento do Cônjuge (€)</label>
                                <input
                                    type="number"
                                    value={formData.financial.spouseMonthlyIncome}
                                    onChange={(e) => handleFieldChange('financial.spouseMonthlyIncome', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="2000"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center">
                                    <span>Rendimento do Agregado (€)</span>
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Auto</span>
                                </span>
                            </label>
                            <input
                                type="number"
                                value={formData.financial.totalHouseholdIncome}
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-medium cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capital Disponível (€)</label>
                        <input
                            type="number"
                            value={formData.financial.availableCapital}
                            onChange={(e) => handleFieldChange('financial.availableCapital', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="50000"
                        />
                    </div>
                </div>

                {/* Situação de Crédito */}
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-orange-800 ml-3">Situação de Crédito</h3>
                    </div>

                    <div className="space-y-6">
                        {creditTypes.map(credit => (
                            <div key={credit.key} className={`credit-section bg-white p-4 rounded-lg border ${formData.financial.credits[credit.key].active ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                                <div className="flex items-center mb-3">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            checked={formData.financial.credits[credit.key].active}
                                            onChange={(e) => {
                                                const newCredits = {
                                                    ...formData.financial.credits,
                                                    [credit.key]: {
                                                        ...formData.financial.credits[credit.key],
                                                        active: e.target.checked
                                                    }
                                                };
                                                handleFieldChange('financial.credits', newCredits);
                                            }}
                                        />
                                        <span className="text-xl">{credit.icon}</span>
                                        <span className="text-sm font-medium text-gray-900">{credit.label}</span>
                                    </label>
                                </div>

                                {formData.financial.credits[credit.key].active && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Valor em Dívida (€)</label>
                                            <input
                                                type="number"
                                                value={formData.financial.credits[credit.key].amount}
                                                onChange={(e) => {
                                                    const newCredits = {
                                                        ...formData.financial.credits,
                                                        [credit.key]: {
                                                            ...formData.financial.credits[credit.key],
                                                            amount: e.target.value
                                                        }
                                                    };
                                                    handleFieldChange('financial.credits', newCredits);
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="150000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Prestação Mensal (€)</label>
                                            <input
                                                type="number"
                                                value={formData.financial.credits[credit.key].monthlyPayment}
                                                onChange={(e) => {
                                                    const newCredits = {
                                                        ...formData.financial.credits,
                                                        [credit.key]: {
                                                            ...formData.financial.credits[credit.key],
                                                            monthlyPayment: e.target.value
                                                        }
                                                    };
                                                    handleFieldChange('financial.credits', newCredits);
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="800"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Entidade Credora</label>
                                            <input
                                                type="text"
                                                value={formData.financial.credits[credit.key].entity}
                                                onChange={(e) => {
                                                    const newCredits = {
                                                        ...formData.financial.credits,
                                                        [credit.key]: {
                                                            ...formData.financial.credits[credit.key],
                                                            entity: e.target.value
                                                        }
                                                    };
                                                    handleFieldChange('financial.credits', newCredits);
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="Banco CGD"
                                            />
                                        </div>

                                        {credit.key === 'other' && (
                                            <div className="md:col-span-3">
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                                                <input
                                                    type="text"
                                                    value={formData.financial.credits[credit.key].description || ''}
                                                    onChange={(e) => {
                                                        const newCredits = {
                                                            ...formData.financial.credits,
                                                            [credit.key]: {
                                                                ...formData.financial.credits[credit.key],
                                                                description: e.target.value
                                                            }
                                                        };
                                                        handleFieldChange('financial.credits', newCredits);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="Crédito para obras da casa"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Banco de Relacionamento</label>
                        <input
                            type="text"
                            value={formData.financial.relationshipBank}
                            onChange={(e) => handleFieldChange('financial.relationshipBank', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Banco Millennium BCP"
                        />
                    </div>
                </div>

                {/* Pré-aprovação Bancária */}
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-purple-800 ml-3">Pré-aprovação Bancária</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                    checked={formData.financial.hasPreApproval}
                                    onChange={(e) => handleFieldChange('financial.hasPreApproval', e.target.checked)}
                                />
                                <span className="text-sm font-medium text-gray-700">Tem pré-aprovação bancária</span>
                            </label>
                        </div>

                        {formData.financial.hasPreApproval && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-purple-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Banco da Pré-aprovação</label>
                                    <input
                                        type="text"
                                        value={formData.financial.bankApprovalWhere}
                                        onChange={(e) => handleFieldChange('financial.bankApprovalWhere', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Banco Santander"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Montante Aprovado (€)</label>
                                    <input
                                        type="number"
                                        value={formData.financial.bankApprovalAmount}
                                        onChange={(e) => handleFieldChange('financial.bankApprovalAmount', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="300000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Condições</label>
                                    <input
                                        type="text"
                                        value={formData.financial.bankApprovalConditions}
                                        onChange={(e) => handleFieldChange('financial.bankApprovalConditions', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Taxa fixa 3.5%, 40 anos"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                                    <input
                                        type="date"
                                        value={formData.financial.bankApprovalValidity}
                                        onChange={(e) => handleFieldChange('financial.bankApprovalValidity', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderDocumentationAndTags = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Documentação e Tags</h2>
                <p className="text-gray-600 mt-2">Documentos disponíveis e categorização do cliente</p>
            </div>

            {/* Documentação Disponível */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Documentos Disponíveis</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries({
                        ccFront: 'CC Frente',
                        ccBack: 'CC Verso',
                        ibanProof: 'Comprovativo IBAN',
                        irsDeclaration: 'Declaração IRS',
                        salaryReceipts: 'Recibos Vencimento',
                        birthCertificate: 'Certidão Nascimento',
                        marriageCertificate: 'Certidão Casamento',
                        propertyRegistry: 'Caderneta Predial',
                        residenceCertificate: 'Cert. Permanência',
                        workContract: 'Contrato Trabalho',
                        bankStatement: 'Extrato Bancário',
                        divorceDecree: 'Certidão Divórcio',
                        pensionProof: 'Comp. Pensão'
                    }).map(([key, label]) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded-lg transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                                checked={formData.documents[key]}
                                onChange={(e) => handleFieldChange(`documents.${key}`, e.target.checked)}
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M5.25 2.25a3 3 0 00-3 3v4.318a3 3 0 00.879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 005.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 00-2.122-.879H5.25zM6.375 7.5a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800 ml-3">Tags do Cliente</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {CLIENT_AVAILABLE_TAGS.map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                const currentTags = formData.tags;
                                const newTags = currentTags.includes(tag)
                                    ? currentTags.filter(t => t !== tag)
                                    : [...currentTags, tag];
                                handleFieldChange('tags', newTags);
                            }}
                            className={`px-3 py-2 rounded-full text-sm transition-all duration-200 ${formData.tags.includes(tag)
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderRelationshipAndConsent = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Gestão de Relacionamento</h2>
                <p className="text-gray-600 mt-2">Origem do cliente, observações e consentimentos</p>
            </div>

            {/* Origem e Gestão */}
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800 ml-3">Origem do Cliente</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Como nos conheceu?</label>
                        <select
                            value={formData.leadSource}
                            onChange={(e) => handleFieldChange('leadSource', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                            {CLIENT_LEAD_SOURCES.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fonte da Recomendação</label>
                        <input
                            type="text"
                            value={formData.referralSource}
                            onChange={(e) => handleFieldChange('referralSource', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            placeholder="Nome do cliente que recomendou"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data do Próximo Contacto</label>
                        <input
                            type="datetime-local"
                            value={formData.nextContactDate}
                            onChange={(e) => handleFieldChange('nextContactDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Observações do Consultor */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Observações do Consultor</h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas Privadas do Consultor</label>
                    <textarea
                        value={formData.consultorObservations}
                        onChange={(e) => handleFieldChange('consultorObservations', e.target.value)}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        placeholder="Observações internas sobre o cliente, estratégia de abordagem, pontos importantes, histórico de contactos, preferências específicas..."
                    />
                </div>
            </div>

            {/* Consentimentos GDPR */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.814 3.051 10.77 7.608 13.566a.75.75 0 00.784 0C15.199 20.52 18.25 15.564 18.25 9.75a12.74 12.74 0 00-.635-4.055.75.75 0 00-.722-.515c-2.992 0-5.725-1.107-7.877-3.08zM15.75 9.75a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 ml-3">Consentimentos GDPR</h3>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 mt-1 text-red-600 rounded focus:ring-red-500"
                                checked={formData.gdprConsent}
                                onChange={(e) => handleFieldChange('gdprConsent', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block">
                                    Consentimento para Tratamento de Dados Pessoais *
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários, conforme descrito na Política de Privacidade.
                                </p>
                            </div>
                        </label>
                        {validationErrors.gdprConsent && (
                            <p className="mt-2 text-sm text-red-600 ml-8">{validationErrors.gdprConsent}</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 mt-1 text-gray-600 rounded focus:ring-gray-500"
                                checked={formData.marketingConsent}
                                onChange={(e) => handleFieldChange('marketingConsent', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block">
                                    Consentimento para Marketing e Comunicações
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Consinto em receber comunicações promocionais e de marketing por email, SMS ou telefone sobre novos imóveis e serviços.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 mt-1 text-gray-600 rounded focus:ring-gray-500"
                                checked={formData.dataProcessingConsent}
                                onChange={(e) => handleFieldChange('dataProcessingConsent', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block">
                                    Processamento de Dados para Análise
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Consinto no processamento dos meus dados para análise de perfil, estatísticas e melhoria dos serviços.
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 mt-1 text-gray-600 rounded focus:ring-gray-500"
                                checked={formData.thirdPartyConsent}
                                onChange={(e) => handleFieldChange('thirdPartyConsent', e.target.checked)}
                            />
                            <div>
                                <span className="text-sm font-semibold text-gray-700 block">
                                    Partilha com Parceiros
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                    Consinto na partilha dos meus dados com parceiros de confiança (bancos, seguradoras, construtoras) para facilitar o processo.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-blue-800">Direitos do Titular dos Dados</p>
                            <p className="text-xs text-blue-700 mt-1">
                                O cliente tem direito a aceder, retificar, eliminar, restringir o tratamento ou solicitar a portabilidade dos seus dados a qualquer momento, contactando-nos através dos meios disponibilizados.
                            </p>
                        </div>
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
                return renderDocumentationAndTags();
            case 4:
                return renderRelationshipAndConsent();
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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
                            </h1>
                            <p className="text-sm text-gray-600">Formulário completo de gestão de clientes</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/clients')}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className="flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${step === currentStep
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-200'
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
                                {step < 4 && (
                                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-200 ${step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-3">
                        <span className="text-sm text-gray-600 font-medium">Dados Pessoais</span>
                        <span className="text-sm text-gray-600 font-medium">Info. Financeiras</span>
                        <span className="text-sm text-gray-600 font-medium">Documentação</span>
                        <span className="text-sm text-gray-600 font-medium">Relacionamento</span>
                    </div>
                </div>

                {/* Conteúdo do Formulário */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {renderCurrentStep()}
                </div>

                {/* Navegação */}
                <div className="mt-8 flex justify-between">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 border rounded-lg transition-all duration-200 shadow-sm ${currentStep === 1
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
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg font-medium"
                            >
                                Próximo →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || loading.create || loading.update}
                                className="px-12 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-xl font-semibold text-lg disabled:opacity-50"
                            >
                                {isSubmitting || loading.create || loading.update
                                    ? 'Guardando...'
                                    : isEditMode
                                        ? '💾 Guardar Alterações'
                                        : '✨ Criar Cliente'
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