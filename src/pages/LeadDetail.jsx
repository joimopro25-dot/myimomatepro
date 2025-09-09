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
    PlusIcon,
    EyeIcon,
    DocumentTextIcon,
    TagIcon,
    BanknotesIcon,
    HomeIcon,
    IdentificationIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Snowflake } from 'lucide-react';

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
                icon: Snowflake,
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
                                    {currentLead.nome}
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

                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(`/leads/${leadId}/edit`)}
                            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Editar
                        </button>
                        <button
                            onClick={() => setShowConvertModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <UserPlusIcon className="w-4 h-4 mr-2" />
                            Converter em Cliente
                        </button>
                    </div>
                </div>

                {/* Próxima ação recomendada */}
                {nextAction && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-orange-800">Ação Recomendada</h3>
                                <p className="text-sm text-orange-700 mt-1">{nextAction}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'info', label: 'Informações', icon: EyeIcon },
                            { id: 'tasks', label: 'Tarefas', icon: DocumentTextIcon },
                            { id: 'contacts', label: 'Contactos', icon: PhoneIcon },
                            { id: 'timeline', label: 'Timeline', icon: ClockIcon }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.label}
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
                            {/* Contactos */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
                                <div className="space-y-3">
                                    {currentLead.telefone && (
                                        <div className="flex items-center space-x-3">
                                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{currentLead.telefone}</span>
                                        </div>
                                    )}
                                    {currentLead.email && (
                                        <div className="flex items-center space-x-3">
                                            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-900">{currentLead.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-3">
                                        <IdentificationIcon className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{currentLead.age || 'N/A'}</span>
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
                        </div>
                    )}

                    {/* Tab: Tarefas */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Tarefas</h3>
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Nova Tarefa
                                </button>
                            </div>

                            {leadTasks.length === 0 ? (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                    <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">Ainda não há tarefas para esta lead</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leadTasks.map((task) => {
                                        const TypeIcon = getTypeIcon(task.tipo);
                                        return (
                                            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <TypeIcon className="w-4 h-4 text-gray-400" />
                                                            <h4 className="font-medium text-gray-900">{task.titulo}</h4>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : task.status === 'overdue'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {task.status === 'completed' ? 'Concluída' :
                                                                    task.status === 'overdue' ? 'Em atraso' : 'Pendente'}
                                                            </span>
                                                        </div>
                                                        {task.descricao && (
                                                            <p className="text-sm text-gray-600 mb-2">{task.descricao}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500">
                                                            Agendada para: {task.agendadaPara?.toDate?.()?.toLocaleDateString('pt-PT')}
                                                        </p>
                                                    </div>
                                                    {task.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleCompleteTask(task.id, 'completed')}
                                                            className="ml-4 text-green-600 hover:text-green-800"
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Contactos */}
                    {activeTab === 'contacts' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Histórico de Contactos</h3>
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Registar Contacto
                                </button>
                            </div>

                            {leadContacts.length === 0 ? (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                    <PhoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">Ainda não há contactos registados</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leadContacts.map((contact) => {
                                        const TypeIcon = getTypeIcon(contact.tipo);
                                        return (
                                            <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start space-x-3">
                                                    <TypeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium text-gray-900">{contact.resumo}</h4>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${contact.resultado === 'positivo'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : contact.resultado === 'negativo'
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {contact.resultado}
                                                            </span>
                                                        </div>
                                                        {contact.notas && (
                                                            <p className="text-sm text-gray-600 mb-2">{contact.notas}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500">
                                                            {contact.criadoEm?.toDate?.()?.toLocaleDateString('pt-PT')} às {contact.criadoEm?.toDate?.()?.toLocaleTimeString('pt-PT')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Timeline */}
                    {activeTab === 'timeline' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline de Atividades</h3>

                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {/* Eventos combinados de contactos e tarefas */}
                                    {[...leadContacts, ...leadTasks]
                                        .sort((a, b) => (b.criadoEm || b.agendadaPara) - (a.criadoEm || a.agendadaPara))
                                        .map((item, index, array) => {
                                            const isContact = !!item.resumo;
                                            const TypeIcon = getTypeIcon(item.tipo);
                                            const date = isContact ? item.criadoEm : item.agendadaPara;

                                            return (
                                                <li key={`${isContact ? 'contact' : 'task'}-${item.id}`}>
                                                    <div className="relative pb-8">
                                                        {index !== array.length - 1 && (
                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                                                        )}
                                                        <div className="relative flex items-start space-x-3">
                                                            <div className="relative">
                                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center ring-8 ring-white">
                                                                    <TypeIcon className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-sm text-gray-900">
                                                                    <p className="font-medium">
                                                                        {isContact ? item.resumo : item.titulo}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {date?.toDate().toLocaleDateString('pt-PT')}
                                                                    </p>
                                                                </div>
                                                                <p className="text-sm text-gray-600">
                                                                    {isContact ? 'Contacto registado' : 'Tarefa criada'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}

                                    {/* Evento de criação da lead */}
                                    <li>
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
                                                    Lead criada no sistema
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modais */}
                {/* Modal de Criar Tarefa */}
                {showTaskModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Nova Tarefa</h3>
                                <button
                                    onClick={() => setShowTaskModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={taskForm.tipo}
                                        onChange={(e) => setTaskForm({ ...taskForm, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="call">Chamada</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="meeting">Reunião</option>
                                        <option value="follow_up">Follow-up</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={taskForm.titulo}
                                        onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Título da tarefa"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        value={taskForm.descricao}
                                        onChange={(e) => setTaskForm({ ...taskForm, descricao: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Descrição da tarefa"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agendada para</label>
                                    <input
                                        type="datetime-local"
                                        value={taskForm.agendadaPara}
                                        onChange={(e) => setTaskForm({ ...taskForm, agendadaPara: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowTaskModal(false)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                    >
                                        Criar Tarefa
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Registar Contacto */}
                {showContactModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Registar Contacto</h3>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddContact} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={contactForm.tipo}
                                        onChange={(e) => setContactForm({ ...contactForm, tipo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="call">Chamada</option>
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="meeting">Reunião</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                                    <input
                                        type="text"
                                        value={contactForm.resumo}
                                        onChange={(e) => setContactForm({ ...contactForm, resumo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Resumo do contacto"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
                                    <select
                                        value={contactForm.resultado}
                                        onChange={(e) => setContactForm({ ...contactForm, resultado: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="positivo">Positivo</option>
                                        <option value="neutro">Neutro</option>
                                        <option value="negativo">Negativo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                                    <textarea
                                        value={contactForm.notas}
                                        onChange={(e) => setContactForm({ ...contactForm, notas: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Notas do contacto"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowContactModal(false)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                    >
                                        Registar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Converter Lead */}
                {showConvertModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Converter em Cliente</h3>
                                <button
                                    onClick={() => setShowConvertModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    Converter esta lead em cliente irá criar um registo completo na secção de clientes.
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas de Conversão</label>
                                <textarea
                                    value={convertNotes}
                                    onChange={(e) => setConvertNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    placeholder="Notas sobre a conversão (opcional)"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConvertModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConvertLead}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                >
                                    Converter
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Erros */}
                {errors.current && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                                <p className="text-sm text-red-700 mt-1">{errors.current}</p>
                                <button
                                    onClick={() => clearError('current')}
                                    className="text-sm text-red-600 hover:text-red-800 mt-2 font-medium"
                                >
                                    Dispensar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default LeadDetailPage;