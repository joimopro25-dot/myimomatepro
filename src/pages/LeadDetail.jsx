/**
 * LEAD DETAIL PAGE - MyImoMatePro
 * Página de detalhes completos da lead
 * Inclui timeline, tarefas, contactos e ações
 * 
 * Caminho: src/pages/LeadDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_STATUS_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_INTEREST_LABELS,
    TASK_TYPES,
    calculateLeadTemperature,
    getNextRecommendedAction
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    PencilIcon,
    UserPlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FireIcon,
    SnowflakeIcon,
    PlusIcon,
    EyeIcon,
    DocumentTextIcon,
    TagIcon,
    BanknotesIcon,
    HomeIcon,
    IdentificationIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const LeadDetailPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();

    const {
        currentLead,
        leadTasks,
        leadContacts,
        loading,
        errors,
        fetchLead,
        fetchLeadTasks,
        fetchLeadContacts,
        createTask,
        addContact,
        completeTask,
        convertLead,
        clearCurrentLead,
        clearError
    } = useLeads();

    // Estados locais
    const [activeTab, setActiveTab] = useState('info');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [taskForm, setTaskForm] = useState({
        tipo: 'call',
        titulo: '',
        descricao: '',
        agendadaPara: ''
    });
    const [contactForm, setContactForm] = useState({
        tipo: 'call',
        resumo: '',
        notas: '',
        resultado: 'positivo',
        agendarProximo: false,
        proximoContactoData: '',
        proximoContactoTipo: 'call'
    });
    const [convertNotes, setConvertNotes] = useState('');

    // Carregar dados da lead
    useEffect(() => {
        if (leadId) {
            fetchLead(leadId);
            fetchLeadTasks(leadId);
            fetchLeadContacts(leadId);
        }

        return () => {
            clearCurrentLead();
        };
    }, [leadId, fetchLead, fetchLeadTasks, fetchLeadContacts, clearCurrentLead]);

    // Criar tarefa
    const handleCreateTask = async (e) => {
        e.preventDefault();

        try {
            await createTask(leadId, taskForm);
            setShowTaskModal(false);
            setTaskForm({
                tipo: 'call',
                titulo: '',
                descricao: '',
                agendadaPara: ''
            });
            fetchLeadTasks(leadId);
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
    };

    // Adicionar contacto
    const handleAddContact = async (e) => {
        e.preventDefault();

        try {
            await addContact(leadId, contactForm);
            setShowContactModal(false);
            setContactForm({
                tipo: 'call',
                resumo: '',
                notas: '',
                resultado: 'positivo',
                agendarProximo: false,
                proximoContactoData: '',
                proximoContactoTipo: 'call'
            });
            fetchLeadContacts(leadId);
            fetchLead(leadId); // Atualizar lead com último contacto
        } catch (error) {
            console.error('Erro ao adicionar contacto:', error);
        }
    };

    // Completar tarefa
    const handleCompleteTask = async (taskId, resultado) => {
        try {
            await completeTask(leadId, taskId, resultado);
            fetchLeadTasks(leadId);
        } catch (error) {
            console.error('Erro ao completar tarefa:', error);
        }
    };

    // Converter lead
    const handleConvertLead = async () => {
        try {
            const result = await convertLead(leadId, convertNotes);
            setShowConvertModal(false);
            navigate(`/clients/${result.clientId}`);
        } catch (error) {
            console.error('Erro ao converter lead:', error);
        }
    };

    // Obter badge de temperatura
    const getTemperatureBadge = (temperatura) => {
        const badges = {
            quente: {
                color: 'bg-red-100 text-red-700 border-red-200',
                icon: FireIcon,
                label: 'Quente'
            },
            morna: {
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                icon: ClockIcon,
                label: 'Morna'
            },
            fria: {
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: SnowflakeIcon,
                label: 'Fria'
            }
        };

        const badge = badges[temperatura] || badges.fria;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
                <Icon className="w-4 h-4 mr-2" />
                {badge.label}
            </span>
        );
    };

    // Obter badge de status
    const getStatusBadge = (status) => {
        const badges = {
            nova: 'bg-green-100 text-green-700 border-green-200',
            contactada: 'bg-blue-100 text-blue-700 border-blue-200',
            qualificada: 'bg-purple-100 text-purple-700 border-purple-200',
            convertida: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            perdida: 'bg-gray-100 text-gray-700 border-gray-200'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badges[status] || badges.nova}`}>
                {LEAD_STATUS_LABELS[status] || status}
            </span>
        );
    };

    // Obter ícone do tipo de contacto/tarefa
    const getTypeIcon = (tipo) => {
        const icons = {
            call: PhoneIcon,
            email: EnvelopeIcon,
            whatsapp: ChatBubbleLeftIcon,
            meeting: CalendarIcon,
            follow_up: ClockIcon
        };
        return icons[tipo] || PhoneIcon;
    };

    if (loading.current) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando detalhes da lead...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentLead) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lead não encontrada</h3>
                    <p className="text-gray-600 mb-6">A lead que está procurando não existe ou foi removida.</p>
                    <button
                        onClick={() => navigate('/leads')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para Leads
                    </button>
                </div>
            </Layout>
        );
    }

    const temperatura = calculateLeadTemperature(currentLead.ultimoContacto);
    const nextAction = getNextRecommendedAction(currentLead);

    return (
        <Layout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/leads')}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentLead.name}
                                </h1>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                                    PROSPECT
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {getStatusBadge(currentLead.status)}
                                {getTemperatureBadge(temperatura)}
                                <div className="flex items-center text-sm text-gray-600">
                                    <TagIcon className="w-4 h-4 mr-1" />
                                    Score: {currentLead.score || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Ações Rápidas */}
                        <button
                            onClick={() => setShowContactModal(true)}
                            className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            Contactar
                        </button>

                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Tarefa
                        </button>

                        <button
                            onClick={() => navigate(`/leads/${leadId}/edit`)}
                            className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar
                        </button>

                        {currentLead.status === 'qualificada' && (
                            <button
                                onClick={() => setShowConvertModal(true)}
                                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Converter
                            </button>
                        )}
                    </div>
                </div>

                {/* Alertas e Sugestões */}
                {nextAction && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                            <div>
                                <p className="font-medium text-orange-800">Ação Recomendada</p>
                                <p className="text-sm text-orange-700">{nextAction.motivo}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setTaskForm({
                                        tipo: nextAction.tipo,
                                        titulo: 'Ação sugerida automaticamente',
                                        descricao: nextAction.motivo,
                                        agendadaPara: nextAction.prazo.toISOString().split('T')[0]
                                    });
                                    setShowTaskModal(true);
                                }}
                                className="ml-auto px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                            >
                                Agendar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'info', label: 'Informações', icon: IdentificationIcon },
                            { id: 'tasks', label: 'Tarefas', icon: CheckCircleIcon },
                            { id: 'contacts', label: 'Contactos', icon: PhoneIcon },
                            { id: 'timeline', label: 'Timeline', icon: ClockIcon }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Conteúdo dos Tabs */}
                <div className="space-y-6">
                    {/* Tab: Informações */}
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Informações Básicas */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <PhoneIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{currentLead.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{currentLead.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <BanknotesIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{currentLead.profession || 'N/A'}</span>
                                    </div>
                                    {currentLead.address?.city && (
                                        <div className="flex items-center space-x-3">
                                            <HomeIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">
                                                {currentLead.address.city}, {currentLead.address.municipality}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informações da Lead */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Prospect</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Interesse</p>
                                        <p className="font-medium text-gray-900">
                                            {LEAD_INTEREST_LABELS[currentLead.interesse] || currentLead.interesse}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Fonte</p>
                                        <p className="font-medium text-gray-900">
                                            {LEAD_SOURCE_LABELS[currentLead.leadSource] || currentLead.leadSource}
                                        </p>
                                    </div>
                                    {currentLead.descricao && (
                                        <div>
                                            <p className="text-sm text-gray-500">Descrição</p>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                {currentLead.descricao}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Datas Importantes */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas Importantes</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Criada em</p>
                                        <p className="font-medium text-gray-900">
                                            {currentLead.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                                        </p>
                                    </div>
                                    {currentLead.ultimoContacto && (
                                        <div>
                                            <p className="text-sm text-gray-500">Último contacto</p>
                                            <p className="font-medium text-gray-900">
                                                {currentLead.ultimoContacto.toDate?.()?.toLocaleDateString('pt-PT')}
                                            </p>
                                        </div>
                                    )}
                                    {currentLead.proximoContacto && (
                                        <div>
                                            <p className="text-sm text-gray-500">Próximo contacto</p>
                                            <p className="font-medium text-orange-600">
                                                {currentLead.proximoContacto.toDate?.()?.toLocaleDateString('pt-PT')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Observações */}
                            {currentLead.consultorObservations && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações do Consultor</h3>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {currentLead.consultorObservations}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Tarefas */}
                    {activeTab === 'tasks' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Tarefas</h3>
                                    <button
                                        onClick={() => setShowTaskModal(true)}
                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Nova Tarefa
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {loading.tasks ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Carregando tarefas...</p>
                                    </div>
                                ) : leadTasks.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">Nenhuma tarefa criada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {leadTasks.map((task) => {
                                            const Icon = getTypeIcon(task.tipo);
                                            const isOverdue = task.agendadaPara &&
                                                task.agendadaPara.toDate() < new Date() &&
                                                task.status === 'pendente';

                                            return (
                                                <div key={task.id} className={`p-4 rounded-lg border ${task.status === 'concluida'
                                                        ? 'bg-green-50 border-green-200'
                                                        : isOverdue
                                                            ? 'bg-red-50 border-red-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-3">
                                                            <Icon className={`w-5 h-5 mt-1 ${task.status === 'concluida'
                                                                    ? 'text-green-600'
                                                                    : isOverdue
                                                                        ? 'text-red-600'
                                                                        : 'text-blue-600'
                                                                }`} />
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{task.titulo}</h4>
                                                                {task.descricao && (
                                                                    <p className="text-sm text-gray-600 mt-1">{task.descricao}</p>
                                                                )}
                                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                    {task.agendadaPara && (
                                                                        <span>
                                                                            Agendada: {task.agendadaPara.toDate().toLocaleDateString('pt-PT')}
                                                                        </span>
                                                                    )}
                                                                    <span className={`px-2 py-1 rounded-full ${task.status === 'concluida'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-yellow-100 text-yellow-700'
                                                                        }`}>
                                                                        {task.status === 'concluida' ? 'Concluída' : 'Pendente'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {task.status === 'pendente' && (
                                                            <button
                                                                onClick={() => handleCompleteTask(task.id, 'Tarefa concluída')}
                                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                            >
                                                                Concluir
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Contactos */}
                    {activeTab === 'contacts' && (
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Histórico de Contactos</h3>
                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Registar Contacto
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {loading.contacts ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Carregando contactos...</p>
                                    </div>
                                ) : leadContacts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <PhoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-600">Nenhum contacto registado</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {leadContacts.map((contact) => {
                                            const Icon = getTypeIcon(contact.tipo);

                                            return (
                                                <div key={contact.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <div className="flex items-start space-x-3">
                                                        <Icon className="w-5 h-5 mt-1 text-blue-600" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium text-gray-900">{contact.resumo}</h4>
                                                                <span className="text-xs text-gray-500">
                                                                    {contact.dataContacto.toDate().toLocaleDateString('pt-PT')}
                                                                </span>
                                                            </div>
                                                            {contact.notas && (
                                                                <p className="text-sm text-gray-600 mt-1">{contact.notas}</p>
                                                            )}
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <span className={`px-2 py-1 text-xs rounded-full ${contact.resultado === 'positivo'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : contact.resultado === 'neutro'
                                                                            ? 'bg-yellow-100 text-yellow-700'
                                                                            : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {contact.resultado}
                                                                </span>
                                                                {contact.duracao && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {contact.duracao} min
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab: Timeline */}
                    {activeTab === 'timeline' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline da Lead</h3>

                            <div className="space-y-4">
                                {/* Eventos combinados (tarefas + contactos) ordenados por data */}
                                {[...leadTasks, ...leadContacts]
                                    .sort((a, b) => {
                                        const dateA = a.dataContacto || a.criadaEm || a.agendadaPara;
                                        const dateB = b.dataContacto || b.criadaEm || b.agendadaPara;
                                        return dateB.toDate() - dateA.toDate();
                                    })
                                    .map((item, index) => {
                                        const isContact = !!item.dataContacto;
                                        const Icon = getTypeIcon(item.tipo);
                                        const date = item.dataContacto || item.criadaEm || item.agendadaPara;

                                        return (
                                            <div key={`${isContact ? 'contact' : 'task'}-${item.id}`} className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isContact ? 'bg-green-100' : 'bg-blue-100'
                                                        }`}>
                                                        <Icon className={`w-4 h-4 ${isContact ? 'text-green-600' : 'text-blue-600'
                                                            }`} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {isContact ? item.resumo : item.titulo}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {date.toDate().toLocaleDateString('pt-PT')}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {isContact ? 'Contacto registado' : 'Tarefa criada'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                {/* Evento de criação da lead */}
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <UserPlusIcon className="w-4 h-4 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">Lead criada</p>
                                            <p className="text-xs text-gray-500">
                                                {currentLead.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT')}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Prospect registado no sistema
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal: Nova Tarefa */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Nova Tarefa</h3>
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={taskForm.tipo}
                                            onChange={(e) => setTaskForm(prev => ({ ...prev, tipo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="call">Chamada</option>
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="meeting">Reunião</option>
                                            <option value="follow_up">Follow-up</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            value={taskForm.titulo}
                                            onChange={(e) => setTaskForm(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Ligar para prospect"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descrição
                                        </label>
                                        <textarea
                                            value={taskForm.descricao}
                                            onChange={(e) => setTaskForm(prev => ({ ...prev, descricao: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Detalhes da tarefa..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Agendar para
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={taskForm.agendadaPara}
                                            onChange={(e) => setTaskForm(prev => ({ ...prev, agendadaPara: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading.tasks}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading.tasks ? 'Criando...' : 'Criar Tarefa'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Registar Contacto */}
                {showContactModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Registar Contacto</h3>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddContact}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Contacto
                                        </label>
                                        <select
                                            value={contactForm.tipo}
                                            onChange={(e) => setContactForm(prev => ({ ...prev, tipo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="call">Chamada</option>
                                            <option value="email">Email</option>
                                            <option value="whatsapp">WhatsApp</option>
                                            <option value="meeting">Reunião</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Resumo
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.resumo}
                                            onChange={(e) => setContactForm(prev => ({ ...prev, resumo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Contacto inicial - interesse confirmado"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Resultado
                                        </label>
                                        <select
                                            value={contactForm.resultado}
                                            onChange={(e) => setContactForm(prev => ({ ...prev, resultado: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="positivo">Positivo</option>
                                            <option value="neutro">Neutro</option>
                                            <option value="negativo">Negativo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notas
                                        </label>
                                        <textarea
                                            value={contactForm.notas}
                                            onChange={(e) => setContactForm(prev => ({ ...prev, notas: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Detalhes do contacto..."
                                        />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="agendarProximo"
                                            checked={contactForm.agendarProximo}
                                            onChange={(e) => setContactForm(prev => ({ ...prev, agendarProximo: e.target.checked }))}
                                            className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label htmlFor="agendarProximo" className="text-sm text-gray-700">
                                            Agendar próximo contacto
                                        </label>
                                    </div>

                                    {contactForm.agendarProximo && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Data do próximo contacto
                                            </label>
                                            <input
                                                type="date"
                                                value={contactForm.proximoContactoData}
                                                onChange={(e) => setContactForm(prev => ({ ...prev, proximoContactoData: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowContactModal(false)}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading.contacts}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading.contacts ? 'Salvando...' : 'Registar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Converter Lead */}
                {showConvertModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Converter Lead</h3>
                                <button
                                    onClick={() => setShowConvertModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Esta ação irá converter a lead <strong>{currentLead.name}</strong> em cliente.
                                    Todos os dados serão transferidos e a lead será marcada como convertida.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notas da conversão (opcional)
                                </label>
                                <textarea
                                    value={convertNotes}
                                    onChange={(e) => setConvertNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Motivo da conversão, condições especiais..."
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConvertModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConvertLead}
                                    disabled={loading.convert}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {loading.convert ? 'Convertendo...' : 'Converter para Cliente'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensagens de erro */}
                {Object.keys(errors).map(key => errors[key] && (
                    <div key={key} className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-red-800">{errors[key]}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => clearError(key)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default LeadDetailPage;