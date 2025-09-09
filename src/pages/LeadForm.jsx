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

    // Função para dados iniciais MELHORADA
    function getInitialFormData() {
        return {
            // ===== DADOS PESSOAIS BÁSICOS =====
            name: '',
            phone: '',
            email: '', // AGORA OPCIONAL

            // ===== CAMPOS DE QUALIFICAÇÃO =====
            leadSource: LEAD_SOURCES.WEBSITE,
            interesse: LEAD_INTERESTS.COMPRAR,
            urgencia: 'media',
            orcamentoEstimado: '',
            zonaInteresse: '',
            tipologiaInteresse: '',
            melhorHorario: '',
            contactPreference: 'phone',
            statusQualificacao: 'por_qualificar',

            // ===== DESCRIÇÃO E OBSERVAÇÕES =====
            descricao: '', // AGORA OBRIGATÓRIO
            consultorObservations: '',

            // ===== AGENDAMENTO COM HORA =====
            proximoContacto: '', // datetime-local format

            // ===== CONSENTIMENTOS =====
            gdprConsent: false,
            marketingConsent: false,

            // ===== CAMPOS HERDADOS DO CLIENTE (OPCIONAIS) =====
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

            // Tags e observações extras
            tags: [],
            nextContactDate: ''
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

    // Preencher dados quando carregar lead para edição MELHORADO
    useEffect(() => {
        if (isEditMode && currentLead) {
            setFormData({
                // Dados pessoais básicos
                name: currentLead.name || '',
                phone: currentLead.phone || '',
                email: currentLead.email || '',

                // ===== NOVOS CAMPOS DE QUALIFICAÇÃO =====
                leadSource: currentLead.leadSource || LEAD_SOURCES.WEBSITE,
                interesse: currentLead.interesse || LEAD_INTERESTS.COMPRAR,
                urgencia: currentLead.urgencia || 'media',
                orcamentoEstimado: currentLead.orcamentoEstimado || '',
                zonaInteresse: currentLead.zonaInteresse || '',
                tipologiaInteresse: currentLead.tipologiaInteresse || '',
                melhorHorario: currentLead.melhorHorario || '',
                contactPreference: currentLead.contactPreference || 'phone',
                statusQualificacao: currentLead.statusQualificacao || 'por_qualificar',

                // Descrição e observações
                descricao: currentLead.descricao || '',
                consultorObservations: currentLead.consultorObservations || '',

                // ===== AGENDAMENTO COM DATETIME-LOCAL =====
                proximoContacto: currentLead.proximoContacto ?
                    new Date(currentLead.proximoContacto.toDate()).toISOString().slice(0, 16) : '',

                // Consentimentos
                gdprConsent: currentLead.gdprConsent || false,
                marketingConsent: currentLead.marketingConsent || false,

                // Resto dos campos (herdados do cliente)
                cc: currentLead.cc || '',
                ccValidity: currentLead.ccValidity || '',
                nif: currentLead.nif || '',
                birthDate: currentLead.birthDate ?
                    currentLead.birthDate.toDate?.()?.toISOString().split('T')[0] : '',
                birthPlace: currentLead.birthPlace || '',
                parish: currentLead.parish || '',
                municipality: currentLead.municipality || '',
                district: currentLead.district || '',
                profession: currentLead.profession || '',
                maritalStatus: currentLead.maritalStatus || 'single',
                marriageRegime: currentLead.marriageRegime || '',

                // Dados do cônjuge
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

                // Morada
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

                // Financeiro
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

                // Documentação
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

                // Tags e observações
                tags: currentLead.tags || [],
                nextContactDate: currentLead.nextContactDate ?
                    currentLead.nextContactDate.toDate?.()?.toISOString().split('T')[0] : ''
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

    // ===== SUBMISSÃO CORRIGIDA =====
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

            // Navegar para a lista de leads após sucesso
            navigate('/leads');
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            // O erro já será mostrado pelo contexto através de contextErrors
        }
    };

    // Renderizar dados pessoais (com campos obrigatórios corrigidos)
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.name && touched.name
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
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
                            Telefone *
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.phone && touched.phone
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                }`}
                            placeholder="911234567"
                        />
                        {validationErrors.phone && touched.phone && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                        )}
                    </div>

                    {/* Email - AGORA OPCIONAL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.email && touched.email
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                }`}
                            placeholder="exemplo@email.com (opcional)"
                        />
                        {validationErrors.email && touched.email && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar informações da lead com campos MELHORADOS
    const renderLeadInfo = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Qualificação do Prospect</h2>
                <p className="text-gray-600">Informações para qualificar e classificar a lead</p>
            </div>

            {/* Seção 1: Classificação Básica */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <TagIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Classificação da Lead</h3>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Interesse Principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interesse Principal *
                        </label>
                        <select
                            value={formData.interesse}
                            onChange={(e) => updateField('interesse', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {Object.entries(LEAD_INTEREST_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Novo: Urgência */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgência
                        </label>
                        <select
                            value={formData.urgencia || 'media'}
                            onChange={(e) => updateField('urgencia', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="baixa">Baixa - Mais de 6 meses</option>
                            <option value="media">Média - 3-6 meses</option>
                            <option value="alta">Alta - 1-3 meses</option>
                            <option value="imediata">Imediata - Menos de 1 mês</option>
                        </select>
                    </div>

                    {/* Novo: Orçamento Estimado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orçamento Estimado (€)
                        </label>
                        <input
                            type="number"
                            value={formData.orcamentoEstimado || ''}
                            onChange={(e) => updateField('orcamentoEstimado', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ex: 300000"
                        />
                    </div>

                    {/* Novo: Zona de Interesse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zona de Interesse
                        </label>
                        <input
                            type="text"
                            value={formData.zonaInteresse || ''}
                            onChange={(e) => updateField('zonaInteresse', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ex: Centro do Porto, Matosinhos..."
                        />
                    </div>

                    {/* Novo: Tipologia Interesse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipologia de Interesse
                        </label>
                        <select
                            value={formData.tipologiaInteresse || ''}
                            onChange={(e) => updateField('tipologiaInteresse', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecionar...</option>
                            <option value="T0">T0 - Estúdio</option>
                            <option value="T1">T1 - 1 Quarto</option>
                            <option value="T2">T2 - 2 Quartos</option>
                            <option value="T3">T3 - 3 Quartos</option>
                            <option value="T4">T4 - 4 Quartos</option>
                            <option value="T5+">T5+ - 5 ou mais quartos</option>
                            <option value="moradia">Moradia</option>
                            <option value="terreno">Terreno</option>
                            <option value="comercial">Espaço Comercial</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção 2: Agendamento e Follow-up */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Agendamento e Follow-up</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Próximo Contacto - AGORA COM HORA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Próximo Contacto (Data e Hora)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.proximoContacto || ''}
                            onChange={(e) => updateField('proximoContacto', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    {/* Melhor horário para contacto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Melhor Horário para Contacto
                        </label>
                        <select
                            value={formData.melhorHorario || ''}
                            onChange={(e) => updateField('melhorHorario', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecionar...</option>
                            <option value="manha">Manhã (9h-12h)</option>
                            <option value="tarde">Tarde (14h-17h)</option>
                            <option value="final_tarde">Final da Tarde (17h-20h)</option>
                            <option value="flexivel">Horário Flexível</option>
                        </select>
                    </div>

                    {/* Tipo de contacto preferido */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                            Contacto Preferido
                        </label>
                        <select
                            value={formData.contactPreference}
                            onChange={(e) => updateField('contactPreference', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="phone">Telefone</option>
                            <option value="email">Email</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="presencial">Presencial</option>
                        </select>
                    </div>

                    {/* Status da qualificação */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status da Qualificação
                        </label>
                        <select
                            value={formData.statusQualificacao || 'por_qualificar'}
                            onChange={(e) => updateField('statusQualificacao', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="por_qualificar">Por Qualificar</option>
                            <option value="qualificada">Qualificada</option>
                            <option value="desqualificada">Desqualificada</option>
                            <option value="em_processo">Em Processo</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção 3: Descrição Detalhada */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <InformationCircleIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Descrição da Lead</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição Detalhada *
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => updateField('descricao', e.target.value)}
                            rows={6}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${validationErrors.descricao && touched.descricao
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                }`}
                            placeholder="Descreva detalhadamente:
• Como o prospect chegou até si?
• Qual é a situação atual?
• Quais são as necessidades específicas?
• Que informações foram partilhadas?
• Contexto da conversa inicial..."
                        />
                        {validationErrors.descricao && touched.descricao && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.descricao}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                            {formData.descricao?.length || 0}/1000 caracteres
                        </p>
                    </div>

                    {/* Campo adicional para observações do consultor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações do Consultor
                        </label>
                        <textarea
                            value={formData.consultorObservations}
                            onChange={(e) => updateField('consultorObservations', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Notas pessoais, impressões, estratégia de abordagem..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Renderizar consentimentos ATUALIZADO
    const renderConsents = () => (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Consentimentos</h2>
                <p className="text-gray-600">Autorizações GDPR necessárias</p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <DocumentArrowUpIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 ml-3">Autorizações GDPR</h3>
                </div>

                <div className="space-y-4">
                    {/* GDPR Obrigatório */}
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            checked={formData.gdprConsent}
                            onChange={(e) => updateField('gdprConsent', e.target.checked)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                        />
                        <label className="ml-3 text-sm text-gray-700">
                            <span className="font-medium text-red-600">* Obrigatório:</span> Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários, conforme descrito na Política de Privacidade.
                        </label>
                    </div>

                    {/* Marketing Opcional */}
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            checked={formData.marketingConsent}
                            onChange={(e) => updateField('marketingConsent', e.target.checked)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                        />
                        <label className="ml-3 text-sm text-gray-700">
                            Consinto em receber comunicações promocionais e de marketing por email, SMS ou telefone sobre novos imóveis e serviços.
                        </label>
                    </div>
                </div>
            </div>

            {/* Resumo final MELHORADO */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo da Lead</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-600">Nome:</span> {formData.name || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Telefone:</span> {formData.phone || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Interesse:</span> {LEAD_INTEREST_LABELS[formData.interesse] || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Fonte:</span> {LEAD_SOURCE_LABELS[formData.leadSource] || 'N/A'}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Urgência:</span> {
                            {
                                'baixa': 'Baixa',
                                'media': 'Média',
                                'alta': 'Alta',
                                'imediata': 'Imediata'
                            }[formData.urgencia] || 'N/A'
                        }
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">Orçamento:</span> {formData.orcamentoEstimado ? `${formData.orcamentoEstimado}€` : 'N/A'}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Zona:</span> {formData.zonaInteresse || 'N/A'}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Próximo Contacto:</span> {
                            formData.proximoContacto ?
                                new Date(formData.proximoContacto).toLocaleString('pt-PT') :
                                'Não agendado'
                        }
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
                                {isEditMode ?
                                    'Altere os dados da lead conforme necessário' :
                                    'Registe um novo prospect qualificado'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <nav>
                        <ol className="flex items-center justify-center space-x-8">
                            {[1, 2, 3].map((step) => (
                                <li key={step} className="flex items-center">
                                    <div className={`flex items-center ${step < 3 ? 'mr-8' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step <= currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                            }`}>
                                            {step}
                                        </div>
                                        <span className={`ml-3 text-sm font-medium ${step <= currentStep ? 'text-blue-600' : 'text-gray-500'
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

                    {/* Botões de Navegação CORRIGIDOS */}
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
                                    disabled={
                                        // VALIDAÇÃO CORRIGIDA - só Nome + Telefone obrigatórios
                                        (currentStep === 1 && (!formData.name || !formData.phone)) ||
                                        (currentStep === 2 && (!formData.name || !formData.phone || !formData.descricao || formData.descricao.length < 10))
                                    }
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
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
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