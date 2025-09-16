/**
 * OPPORTUNITY FORM COMPLETE - MyImoMatePro
 * Sistema completo de gestão de oportunidades com tabs
 * VERSÃO CORRIGIDA COM TODAS AS INTEGRAÇÕES
 * 
 * Caminho: src/pages/OpportunityFormComplete.jsx
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import Layout from '../components/Layout';

// Import dos componentes específicos
import BasicInfoTab from '../components/opportunities/tabs/BasicInfoTab';
import PropertiesTab from '../components/opportunities/tabs/PropertiesTab';
import PipelineTab from '../components/opportunities/tabs/PipelineTab';
import VisitsTab from '../components/opportunities/tabs/VisitsTab';
import OffersTab from '../components/opportunities/tabs/OffersTab';
import TasksTab from '../components/opportunities/tabs/TasksTab';
import DocumentsTab from '../components/opportunities/tabs/DocumentsTab';
import TimelineTab from '../components/opportunities/tabs/TimelineTab';

import {
    ArrowLeftIcon,
    InformationCircleIcon,
    HomeIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    CurrencyEuroIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const OpportunityFormComplete = () => {
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

    // Estado dos tabs - CORRIGIDO com imoveis
    const [activeTab, setActiveTab] = useState('basic');
    const [visitedTabs, setVisitedTabs] = useState(['basic']);
    const [tabsData, setTabsData] = useState({
        basic: {},
        imoveis: [], // ADICIONADO - Array de imóveis no nível raiz
        pipeline: {},
        visits: [],
        offers: [],
        tasks: [],
        documents: [],
        timeline: []
    });

    // Estado geral
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // Definição dos tabs - CORRIGIDO com PropertiesTab
    const tabs = [
        {
            id: 'basic',
            name: 'Informações',
            icon: InformationCircleIcon,
            component: BasicInfoTab,
            required: true
        },
        {
            id: 'imoveis', // ADICIONADO - Tab de imóveis
            name: 'Imóveis',
            icon: HomeIcon,
            component: PropertiesTab,
            badge: tabsData.imoveis?.length || 0
        },
        {
            id: 'pipeline',
            name: 'Pipeline',
            icon: ChartBarIcon,
            component: PipelineTab,
            badge: tabsData.pipeline?.stage
        },
        {
            id: 'visits',
            name: 'Visitas',
            icon: CalendarDaysIcon,
            component: VisitsTab,
            badge: tabsData.visits?.length || 0
        },
        {
            id: 'offers',
            name: 'Propostas',
            icon: CurrencyEuroIcon,
            component: OffersTab,
            badge: tabsData.offers?.length || 0
        },
        {
            id: 'tasks',
            name: 'Tarefas',
            icon: ClipboardDocumentListIcon,
            component: TasksTab,
            badge: tabsData.tasks?.filter(t => !t.completed)?.length || 0
        },
        {
            id: 'documents',
            name: 'Documentos',
            icon: DocumentTextIcon,
            component: DocumentsTab,
            badge: tabsData.documents?.length || 0
        },
        {
            id: 'timeline',
            name: 'Timeline',
            icon: ClockIcon,
            component: TimelineTab
        }
    ];

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

    // CORRIGIDO - loadOpportunity com estrutura de imóveis
    const loadOpportunity = async () => {
        try {
            const opportunity = await fetchOpportunity(clientId, opportunityId);
            if (opportunity) {
                // Distribuir dados pelos tabs - ESTRUTURA CORRIGIDA
                setTabsData({
                    basic: {
                        tipo: opportunity.tipo,
                        estado: opportunity.estado,
                        titulo: opportunity.titulo,
                        descricao: opportunity.descricao,
                        valorEstimado: opportunity.valorEstimado,
                        prioridade: opportunity.prioridade,
                        // Outros campos básicos, mas SEM imóveis
                    },
                    imoveis: opportunity.imoveis || [], // IMÓVEIS NO NÍVEL RAIZ
                    pipeline: {
                        stage: opportunity.pipelineStage || opportunity.estado,
                        history: opportunity.pipelineHistory || [],
                        pipelineNotes: opportunity.pipelineNotes || '',
                        stageHistory: opportunity.stageHistory || [],
                        estimatedDays: opportunity.estimatedDays || {}
                    },
                    visits: opportunity.visits || [],
                    offers: opportunity.offers || [],
                    tasks: opportunity.tasks || [],
                    documents: opportunity.documents || [],
                    timeline: opportunity.timeline || []
                });
            }
        } catch (error) {
            console.error('Erro ao carregar oportunidade:', error);
        }
    };

    // Handlers
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (!visitedTabs.includes(tabId)) {
            setVisitedTabs([...visitedTabs, tabId]);
        }
    };

    // CORRIGIDO - handleTabDataChange para lidar com imóveis
    const handleTabDataChange = (tabId, data) => {
        // Para o PropertiesTab, os dados vêm como array direto
        if (tabId === 'imoveis' && Array.isArray(data)) {
            setTabsData(prev => ({
                ...prev,
                imoveis: data
            }));
        }
        // Para VisitsTab e OffersTab, precisamos atualizar imóveis
        else if ((tabId === 'visits' || tabId === 'offers') && data.imoveis) {
            setTabsData(prev => ({
                ...prev,
                imoveis: data.imoveis,
                [tabId]: data[tabId] || []
            }));
        }
        // Para outros tabs, atualização normal
        else {
            setTabsData(prev => ({
                ...prev,
                [tabId]: data
            }));
        }
    };

    const validateAllTabs = () => {
        const errors = {};

        // Validar tab básico
        if (!tabsData.basic.titulo) {
            errors.basic = 'Título é obrigatório';
        }
        if (!tabsData.basic.tipo) {
            errors.basic = 'Tipo é obrigatório';
        }

        // Adicionar mais validações conforme necessário

        return errors;
    };

    // CORRIGIDO - handleSave com estrutura de imóveis
    const handleSave = async () => {
        setIsSubmitting(true);
        setValidationErrors({});

        // Validar todos os tabs
        const errors = validateAllTabs();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSubmitting(false);
            const firstErrorTab = Object.keys(errors)[0];
            setActiveTab(firstErrorTab);
            return;
        }

        // Compilar todos os dados - ESTRUTURA CORRIGIDA
        const opportunityData = {
            ...tabsData.basic,
            imoveis: tabsData.imoveis, // IMÓVEIS DO NÍVEL RAIZ
            estado: tabsData.pipeline.stage || tabsData.basic.estado,
            pipelineStage: tabsData.pipeline.stage,
            pipelineHistory: tabsData.pipeline.history,
            pipelineNotes: tabsData.pipeline.pipelineNotes,
            stageHistory: tabsData.pipeline.stageHistory,
            estimatedDays: tabsData.pipeline.estimatedDays,
            visits: tabsData.visits,
            offers: tabsData.offers,
            tasks: tabsData.tasks,
            documents: tabsData.documents,
            timeline: tabsData.timeline
        };

        try {
            if (opportunityId) {
                await updateExistingOpportunity(clientId, opportunityId, opportunityData);
                setSuccessMessage('Oportunidade atualizada com sucesso!');
            } else {
                await createNewOpportunity(clientId, opportunityData);
                setSuccessMessage('Oportunidade criada com sucesso!');
            }

            setTimeout(() => {
                navigate(`/clients/${clientId}`);
            }, 1000);

        } catch (error) {
            console.error('Erro ao guardar oportunidade:', error);
            setValidationErrors({
                geral: 'Erro ao guardar oportunidade. Por favor, tente novamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calcular progresso
    const calculateProgress = () => {
        const totalTabs = tabs.filter(t => t.required).length;
        const completedTabs = tabs.filter(t => {
            if (!t.required) return false;
            if (t.id === 'basic') {
                return tabsData.basic.titulo && tabsData.basic.tipo;
            }
            return true;
        }).length;

        return Math.round((completedTabs / totalTabs) * 100);
    };

    const progress = calculateProgress();

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/clients/${clientId}`)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar ao cliente
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {opportunityId ? 'Editar Oportunidade' : 'Nova Oportunidade'}
                            </h1>
                            {currentClient && (
                                <p className="mt-2 text-gray-600">
                                    Cliente: <span className="font-semibold">{currentClient.name}</span>
                                </p>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-48">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Progresso</span>
                                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
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

                {/* Tabs Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-1 px-6" aria-label="Tabs">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                const hasError = validationErrors[tab.id];
                                const isVisited = visitedTabs.includes(tab.id);

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`
                                            group relative py-4 px-4 flex items-center gap-2 text-sm font-medium 
                                            transition-colors border-b-2 -mb-px
                                            ${isActive
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.name}</span>

                                        {/* Badge */}
                                        {tab.badge !== undefined && tab.badge > 0 && (
                                            <span className={`
                                                ml-2 px-2 py-0.5 text-xs rounded-full
                                                ${isActive
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-600'
                                                }
                                            `}>
                                                {tab.badge}
                                            </span>
                                        )}

                                        {/* Error indicator */}
                                        {hasError && (
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                                        )}

                                        {/* Visited indicator */}
                                        {!isActive && isVisited && !hasError && (
                                            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content - CORRIGIDO */}
                    <div className="p-6">
                        {tabs.map((tab) => {
                            if (activeTab !== tab.id) return null;

                            const TabComponent = tab.component;

                            // Preparar dados específicos para cada tab
                            let tabData = tabsData[tab.id];

                            // CORREÇÃO: Para VisitsTab e OffersTab, passar também os imóveis
                            if (tab.id === 'visits') {
                                tabData = {
                                    imoveis: tabsData.imoveis, // PASSAR IMÓVEIS
                                    visits: tabsData.visits
                                };
                            } else if (tab.id === 'offers') {
                                tabData = {
                                    imoveis: tabsData.imoveis, // PASSAR IMÓVEIS
                                    offers: tabsData.offers
                                };
                            }

                            return (
                                <TabComponent
                                    key={tab.id}
                                    data={tabData}
                                    onChange={handleTabDataChange.bind(null, tab.id)}
                                    clientId={clientId}
                                    opportunityId={opportunityId}
                                    opportunityType={tabsData.basic.tipo}
                                    errors={validationErrors[tab.id]}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(`/clients/${clientId}`)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>

                    <div className="flex gap-3">
                        {activeTab !== 'basic' && (
                            <button
                                onClick={() => {
                                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                    if (currentIndex > 0) {
                                        handleTabChange(tabs[currentIndex - 1].id);
                                    }
                                }}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Anterior
                            </button>
                        )}

                        {activeTab !== 'timeline' && (
                            <button
                                onClick={() => {
                                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                    if (currentIndex < tabs.length - 1) {
                                        handleTabChange(tabs[currentIndex + 1].id);
                                    }
                                }}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Próximo
                            </button>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'A guardar...' : (opportunityId ? 'Atualizar' : 'Criar Oportunidade')}
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OpportunityFormComplete;