/**
 * LEAD FORM PAGE - MyImoMatePro
 * Formulário para criar/editar leads
 * Reutiliza ClientForm com campos específicos de lead
 * 
 * Caminho: src/pages/LeadForm.jsx
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    validateLeadData,
    LEAD_SOURCES,
    LEAD_INTERESTS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentArrowUpIcon,
    InformationCircleIcon,
    TagIcon,
    ClockIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

const LeadFormPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(leadId);

    // Context de leads
    const {
        currentLead,
        loading,
        errors: contextErrors,
        createLead,
        fetchLead,
        updateLead,
        clearCurrentLead,
        clearError
    } = useLeads();

    // Estados locais
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;
    const [formData, setFormData] = useState(getInitialFormData());
    const [validationErrors, setValidationErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Função para dados iniciais
    function getInitialFormData() {
        return {
            // ===== DADOS PESSOAIS (MESMO ESQUEMA DO CLIENTE) =====
            name: '',
            phone: '',
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
                birthPlace: '',
                parish: '',
                municipality: '',
                district: ''
            },

            // Morada
            address: {
                street: '',
                number: '',
                floor: '',
                postalCode: '',
                city: '',
                parish: '',
                municipality: '',
                district: ''
            },

            // Financeiro
            financial: {
                monthlyIncome: '',
                spouseMonthlyIncome: '',
                availableCapital: '',
                creditSituation: 'no_credit',
                relationshipBank: '',
                hasPreApproval: false,
                bankApprovalWhere: '',
                bankApprovalAmount: '',
                bankApprovalConditions: ''
            },

            // Documentação
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

            // Tags e observações (do cliente)
            tags: [],
            consultorObservations: '',
            nextContactDate: '',
            gdprConsent: false,
            marketingConsent: false,

            // ===== CAMPOS ESPECÍFICOS DE LEAD =====
            leadSource: LEAD_SOURCES.WEBSITE,
            interesse: LEAD_INTERESTS.COMPRAR,
            descricao: '',
            proximoContacto: ''
        };
    }

    // Carregar lead para edição
    useEffect(() => {
        if (isEditMode && leadId) {
            fetchLead(leadId);
        } else {
            clearCurrentLead();
        }

        return () => {
            clearCurrentLead();
        };
    }, [isEditMode, leadId, fetchLead, clearCurrentLead]);

    // Preencher formulário com dados da lead
    useEffect(() => {
        if (isEditMode && currentLead) {
            setFormData({
                // Dados do cliente (reutilizados)
                name: currentLead.name || '',
                phone: currentLead.phone || '',
                email: currentLead.email || '',
                contactPreference: currentLead.contactPreference || 'phone',
                bestContactTime: currentLead.bestContactTime || '',
                cc: currentLead.cc || '',
                ccValidity: currentLead.ccValidity || '',
                nif: currentLead.nif || '',
                birthDate: currentLead.birthDate || '',
                birthPlace: currentLead.birthPlace || '',
                parish: currentLead.parish || '',
                municipality: currentLead.municipality || '',
                district: currentLead.district || '',
                profession: currentLead.profession || '',
                maritalStatus: currentLead.maritalStatus || 'single',
                marriageRegime: currentLead.marriageRegime || '',

                spouse: {
                    name: currentLead.spouse?.name || '',
                    phone: currentLead.spouse?.phone || '',
                    email: currentLead.spouse?.email || '',
                    cc: currentLead.spouse?.cc || '',
                    ccValidity: currentLead.spouse?.ccValidity || '',
                    profession: currentLead.spouse?.profession || '',
                    nif: currentLead.spouse?.nif || '',
                    birthPlace: currentLead.spouse?.birthPlace || '',
                    parish: currentLead.spouse?.parish || '',
                    municipality: currentLead.spouse?.municipality || '',
                    district: currentLead.spouse?.district || ''
                },

                address: {
                    street: currentLead.address?.street || '',
                    number: currentLead.address?.number || '',
                    floor: currentLead.address?.floor || '',
                    postalCode: currentLead.address?.postalCode || '',
                    city: currentLead.address?.city || '',
                    parish: currentLead.address?.parish || '',
                    municipality: currentLead.address?.municipality || '',
                    district: currentLead.address?.district || ''
                },

                financial: {
                    monthlyIncome: currentLead.financial?.monthlyIncome || '',
                    spouseMonthlyIncome: currentLead.financial?.spouseMonthlyIncome || '',
                    availableCapital: currentLead.financial?.availableCapital || '',
                    creditSituation: currentLead.financial?.creditSituation || 'no_credit',
                    relationshipBank: currentLead.financial?.relationshipBank || '',
                    hasPreApproval: currentLead.financial?.hasPreApproval || false,
                    bankApprovalWhere: currentLead.financial?.bankApprovalWhere || '',
                    bankApprovalAmount: currentLead.financial?.bankApprovalAmount || '',
                    bankApprovalConditions: currentLead.financial?.bankApprovalConditions || ''
                },

                documents: {
                    ccFront: currentLead.documents?.ccFront || false,
                    ccBack: currentLead.documents?.ccBack || false,
                    ibanProof: currentLead.documents?.ibanProof || false,
                    irsDeclaration: currentLead.documents?.irsDeclaration || false,
                    salaryReceipts: currentLead.documents?.salaryReceipts || false,
                    birthCertificate: currentLead.documents?.birthCertificate || false,
                    marriageCertificate: currentLead.documents?.marriageCertificate || false,
                    propertyRegistry: currentLead.documents?.propertyRegistry || false,
                    residenceCertificate: currentLead.documents?.residenceCertificate || false,
                    workContract: currentLead.documents?.workContract || false
                },

                tags: currentLead.tags || [],
                consultorObservations: currentLead.consultorObservations || '',
                nextContactDate: currentLead.nextContactDate ?
                    currentLead.nextContactDate.toDate?.()?.toISOString().split('T')[0] : '',
                gdprConsent: currentLead.gdprConsent || false,
                marketingConsent: currentLead.marketingConsent || false,

                // Campos específicos de lead
                leadSource: currentLead.leadSource || LEAD_SOURCES.WEBSITE,
                interesse: currentLead.interesse || LEAD_INTERESTS.COMPRAR,
                descricao: currentLead.descricao || '',
                proximoContacto: currentLead.proximoContacto ?
                    currentLead.proximoContacto.toDate?.()?.toISOString().split('T')[0] : ''
            });
        }
    }, [isEditMode, currentLead]);

    // Validação em tempo real
    const validateForm = useCallback(() => {
        const validation = validateLeadData(formData);
        setValidationErrors(validation.errors);
        return validation.isValid;
    }, [formData]);

    useEffect(() => {
        validateForm();
    }, [validateForm]);

    // Atualizar campo
    const updateField = useCallback((fieldPath, value) => {
        setFormData(prev => {
            const newData = { ...prev };

            if (fieldPath.includes('.')) {
                const [parent, child] = fieldPath.split('.');
                newData[parent] = {
                    ...newData[parent],
                    [child]: value
                };
            } else {
                newData[fieldPath] = value;
            }

            return newData;
        });

        setTouched(prev => ({
            ...prev,
            [fieldPath]: true
        }));
    }, []);

    // Próximo passo
    const handleNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Passo anterior
    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Submissão
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setCurrentStep(1); // Voltar ao primeiro passo se houver erros
            return;
        }

        try {
            if (isEditMode) {
                await updateLead(leadId, formData);
            } else {
                await createLead(formData);
            }

            navigate('/leads');
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
        }
    };

    // Renderizar dados pessoais (igual ao cliente, mas com badge PROSPECT)
    const renderPersonalData = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Dados Pessoais</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                        PROSPECT
                    </span>
                </div>
                <p className="text-gray-600">Informações básicas do prospect</p>
            </div>

            {/* Campos obrigatórios */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Informações Obrigatórias</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Nome completo do prospect"
                        />
                        {validationErrors.name && touched.name && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                        )}
                    </div>

                    {/* Telefone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="9XX XXX XXX"
                        />
                        {validationErrors.phone && touched.phone && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="email@exemplo.com"
                        />
                        {validationErrors.email && touched.email && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Dados pessoais opcionais - Igual ao ClientForm */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <InformationCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Dados Complementares</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profissão */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profissão
                        </label>
                        <input
                            type="text"
                            value={formData.profession}
                            onChange={(e) => updateField('profession', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Profissão atual"
                        />
                    </div>

                    {/* Estado Civil */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Civil
                        </label>
                        <select
                            value={formData.maritalStatus}
                            onChange={(e) => updateField('maritalStatus', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="single">Solteiro(a)</option>
                            <option value="married">Casado(a)</option>
                            <option value="divorced">Divorciado(a)</option>
                            <option value="widowed">Viúvo(a)</option>
                            <option value="union">União de Facto</option>
                        </select>
                    </div>

                    {/* Preferência de Contacto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferência de Contacto
                        </label>
                        <select
                            value={formData.contactPreference}
                            onChange={(e) => updateField('contactPreference', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="phone">Telefone</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>

                    {/* Melhor Horário */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Melhor Horário de Contacto
                        </label>
                        <input
                            type="text"
                            value={formData.bestContactTime}
                            onChange={(e) => updateField('bestContactTime', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 9h-18h, Manhãs, Tardes"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar informações de lead específicas
    const renderLeadInfo = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Informações do Lead</h2>
                <p className="text-gray-600 mt-2">Dados específicos do prospect imobiliário</p>
            </div>

            {/* Informações específicas da lead */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <TagIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Dados do Prospect</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fonte da Lead */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fonte da Lead *
                        </label>
                        <select
                            value={formData.leadSource}
                            onChange={(e) => updateField('leadSource', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.leadSource && touched.leadSource ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        {validationErrors.leadSource && touched.leadSource && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.leadSource}</p>
                        )}
                    </div>

                    {/* O que procura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            O que procura *
                        </label>
                        <select
                            value={formData.interesse}
                            onChange={(e) => updateField('interesse', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.interesse && touched.interesse ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            {Object.entries(LEAD_INTEREST_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        {validationErrors.interesse && touched.interesse && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.interesse}</p>
                        )}
                    </div>
                </div>

                {/* Descrição do Prospect */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição do Prospect
                    </label>
                    <textarea
                        value={formData.descricao}
                        onChange={(e) => updateField('descricao', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descreva as necessidades, preferências e situação específica do prospect..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Esta informação ajudará na qualificação e seguimento da lead
                    </p>
                </div>
            </div>

            {/* Follow-up */}
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Agendamento de Follow-up</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data do próximo contacto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Próximo Contacto
                        </label>
                        <input
                            type="date"
                            value={formData.proximoContacto}
                            onChange={(e) => updateField('proximoContacto', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Observações do consultor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações do Consultor
                        </label>
                        <textarea
                            value={formData.consultorObservations}
                            onChange={(e) => updateField('consultorObservations', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Notas internas sobre o prospect..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar consentimentos
    const renderConsents = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Consentimentos</h2>
                <p className="text-gray-600 mt-2">Autorizações legais obrigatórias</p>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Consentimentos GDPR</h3>
                </div>

                <div className="space-y-4">
                    {/* GDPR Obrigatório */}
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="gdprConsent"
                            checked={formData.gdprConsent}
                            onChange={(e) => updateField('gdprConsent', e.target.checked)}
                            className="mt-1 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="gdprConsent" className="text-sm text-gray-700">
                            <span className="font-medium text-red-600">*</span> Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários, conforme descrito na Política de Privacidade.
                        </label>
                    </div>
                    {validationErrors.gdprConsent && touched.gdprConsent && (
                        <p className="text-red-600 text-sm">{validationErrors.gdprConsent}</p>
                    )}

                    {/* Marketing Opcional */}
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="marketingConsent"
                            checked={formData.marketingConsent}
                            onChange={(e) => updateField('marketingConsent', e.target.checked)}
                            className="mt-1 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                            Consinto em receber comunicações promocionais e de marketing por email, SMS ou telefone sobre novos imóveis e serviços.
                        </label>
                    </div>
                </div>
            </div>

            {/* Resumo final */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo da Lead</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-600">Nome:</span> {formData.name || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Interesse:</span> {LEAD_INTEREST_LABELS[formData.interesse] || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Fonte:</span> {LEAD_SOURCE_LABELS[formData.leadSource] || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Contacto:</span> {formData.phone || formData.email || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar passo atual
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalData();
            case 2:
                return renderLeadInfo();
            case 3:
                return renderConsents();
            default:
                return renderPersonalData();
        }
    };

    // Loading state para edição
    if (isEditMode && loading.current) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dados da lead...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/leads')}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? 'Editar Lead' : 'Nova Lead'}
                            </h1>
                            <p className="text-gray-600">
                                {isEditMode ? 'Atualizar informações do prospect' : 'Registar novo prospect'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <nav aria-label="Progress">
                        <ol className="flex items-center">
                            {[1, 2, 3].map((step, index) => (
                                <li key={step} className={`relative ${index !== 2 ? 'pr-8 sm:pr-20' : ''}`}>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        {index !== 2 && (
                                            <div className={`h-0.5 w-full ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                    <div
                                        className={`relative w-8 h-8 flex items-center justify-center rounded-full ${step < currentStep
                                                ? 'bg-blue-600 text-white'
                                                : step === currentStep
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {step < currentStep ? (
                                            <CheckCircleIcon className="w-5 h-5" />
                                        ) : (
                                            <span className="text-sm font-medium">{step}</span>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <span className={`text-xs font-medium ${step <= currentStep ? 'text-blue-600' : 'text-gray-500'
                                            }`}>
                                            {step === 1 ? 'Dados Pessoais' : step === 2 ? 'Info. Lead' : 'Consentimentos'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit}>
                    {renderCurrentStep()}

                    {/* Botões de Navegação */}
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/leads')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={currentStep === 1 && (!formData.name || (!formData.phone && !formData.email))}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próximo
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading.create || loading.update || !formData.gdprConsent}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading.create || loading.update ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Salvando...
                                        </>
                                    ) : (
                                        isEditMode ? 'Atualizar Lead' : 'Criar Lead'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {/* Mensagens de erro */}
                {(contextErrors.create || contextErrors.update) && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800">
                                    {contextErrors.create || contextErrors.update}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => clearError(isEditMode ? 'update' : 'create')}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeadFormPage;