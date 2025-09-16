/**
 * TASKS TAB - MyImoMatePro
 * Tab de gestão de tarefas e atividades
 * Organização de tarefas, prazos e checklist
 * 
 * Caminho: src/components/opportunities/tabs/TasksTab.jsx
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    FlagIcon,
    BellIcon,
    DocumentTextIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    CameraIcon,
    MapPinIcon,
    BanknotesIcon,
    DocumentDuplicateIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    TagIcon,
    ArrowPathIcon,
    CheckIcon,
    XMarkIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleSolid,
    FlagIcon as FlagSolid,
    ExclamationTriangleIcon as ExclamationSolid
} from '@heroicons/react/24/solid';

// Categorias de tarefas
const TASK_CATEGORIES = {
    'documentacao': {
        label: 'Documentação',
        icon: DocumentTextIcon,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300'
    },
    'visitas': {
        label: 'Visitas',
        icon: HomeIcon,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300'
    },
    'contactos': {
        label: 'Contactos',
        icon: PhoneIcon,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
    },
    'financeiro': {
        label: 'Financeiro',
        icon: BanknotesIcon,
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300'
    },
    'marketing': {
        label: 'Marketing',
        icon: CameraIcon,
        color: 'pink',
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-800',
        borderColor: 'border-pink-300'
    },
    'legal': {
        label: 'Legal',
        icon: DocumentDuplicateIcon,
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300'
    },
    'outro': {
        label: 'Outro',
        icon: TagIcon,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300'
    }
};

// Prioridades
const PRIORITIES = {
    'baixa': {
        label: 'Baixa',
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: FlagIcon
    },
    'media': {
        label: 'Média',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        icon: FlagIcon
    },
    'alta': {
        label: 'Alta',
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        icon: FlagSolid
    },
    'urgente': {
        label: 'Urgente',
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: ExclamationSolid
    }
};

// Templates de tarefas predefinidas
const TASK_TEMPLATES = {
    'comprador': [
        { titulo: 'Obter pré-aprovação de crédito', categoria: 'financeiro', prioridade: 'alta' },
        { titulo: 'Recolher documentos pessoais', categoria: 'documentacao', prioridade: 'alta' },
        { titulo: 'Agendar visitas aos imóveis', categoria: 'visitas', prioridade: 'media' },
        { titulo: 'Análise comparativa de imóveis', categoria: 'outro', prioridade: 'media' },
        { titulo: 'Negociar proposta', categoria: 'financeiro', prioridade: 'alta' },
        { titulo: 'Solicitar vistoria técnica', categoria: 'documentacao', prioridade: 'media' },
        { titulo: 'Revisar CPCV', categoria: 'legal', prioridade: 'alta' },
        { titulo: 'Agendar escritura', categoria: 'legal', prioridade: 'urgente' }
    ],
    'vendedor': [
        { titulo: 'Preparar documentação do imóvel', categoria: 'documentacao', prioridade: 'alta' },
        { titulo: 'Obter certificado energético', categoria: 'documentacao', prioridade: 'alta' },
        { titulo: 'Limpar e organizar imóvel', categoria: 'outro', prioridade: 'media' },
        { titulo: 'Tirar fotografias profissionais', categoria: 'marketing', prioridade: 'alta' },
        { titulo: 'Criar anúncio online', categoria: 'marketing', prioridade: 'alta' },
        { titulo: 'Agendar open house', categoria: 'visitas', prioridade: 'media' },
        { titulo: 'Responder a contactos', categoria: 'contactos', prioridade: 'alta' },
        { titulo: 'Preparar CPCV', categoria: 'legal', prioridade: 'urgente' }
    ]
};

// Componente de Card de Tarefa
const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
    const category = TASK_CATEGORIES[task.categoria];
    const priority = PRIORITIES[task.prioridade];
    const CategoryIcon = category.icon;
    const PriorityIcon = priority.icon;

    const isOverdue = () => {
        if (!task.dataLimite || task.concluida) return false;
        return new Date(task.dataLimite) < new Date();
    };

    const getDaysRemaining = () => {
        if (!task.dataLimite || task.concluida) return null;
        const diff = new Date(task.dataLimite) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) return `${Math.abs(days)} dias atrasado`;
        if (days === 0) return 'Hoje';
        if (days === 1) return 'Amanhã';
        return `${days} dias`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short'
        });
    };

    return (
        <div className={`bg-white rounded-lg border ${task.concluida ? 'border-gray-200 opacity-75' :
                isOverdue() ? 'border-red-300' : 'border-gray-200'
            } p-4 hover:shadow-md transition-all`}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={() => onToggle(task)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center
                              transition-colors ${task.concluida
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    {task.concluida && (
                        <CheckIcon className="w-3 h-3 text-white" />
                    )}
                </button>

                {/* Conteúdo */}
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className={`font-medium ${task.concluida ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                {task.titulo}
                            </h4>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {/* Categoria */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full 
                                                text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                                    <CategoryIcon className="w-3 h-3 mr-1" />
                                    {category.label}
                                </span>

                                {/* Prioridade */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full 
                                                text-xs font-medium ${priority.bgColor} ${priority.textColor}`}>
                                    <PriorityIcon className="w-3 h-3 mr-1" />
                                    {priority.label}
                                </span>

                                {/* Data */}
                                {task.dataLimite && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full 
                                                    text-xs font-medium ${isOverdue() ? 'bg-red-100 text-red-700' :
                                            getDaysRemaining() === 'Hoje' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {getDaysRemaining() || formatDate(task.dataLimite)}
                                    </span>
                                )}

                                {/* Responsável */}
                                {task.responsavel && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full 
                                                   text-xs font-medium bg-blue-100 text-blue-700">
                                        <UserIcon className="w-3 h-3 mr-1" />
                                        {task.responsavel}
                                    </span>
                                )}
                            </div>

                            {/* Descrição */}
                            {task.descricao && !task.concluida && (
                                <p className="text-sm text-gray-600 mt-2">
                                    {task.descricao}
                                </p>
                            )}

                            {/* Subtarefas */}
                            {task.subtarefas && task.subtarefas.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center text-xs text-gray-500 mb-1">
                                        <ClipboardDocumentListIcon className="w-3 h-3 mr-1" />
                                        Subtarefas ({task.subtarefas.filter(s => s.concluida).length}/{task.subtarefas.length})
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full transition-all"
                                            style={{
                                                width: `${(task.subtarefas.filter(s => s.concluida).length / task.subtarefas.length) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-1 ml-2">
                            <button
                                onClick={() => onEdit(task)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <PencilIcon className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                                onClick={() => onDelete(task)}
                                className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Principal
const TasksTab = ({ data = {}, onChange, opportunityType }) => {
    const { currentUser } = useAuth();

    // Estado
    const [tasks, setTasks] = useState(data.tasks || []);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority'); // priority, date, category
    const [showTemplates, setShowTemplates] = useState(false);

    // Formulário
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        categoria: 'outro',
        prioridade: 'media',
        dataLimite: '',
        responsavel: currentUser?.displayName || currentUser?.email || '',
        lembrete: true,
        lembreteAntecedencia: 24,
        subtarefas: [],
        notas: ''
    });

    const [newSubtask, setNewSubtask] = useState('');

    // Filtrar e ordenar tarefas
    const getFilteredTasks = () => {
        let filtered = [...tasks];

        // Filtro por estado
        if (filter === 'pending') {
            filtered = filtered.filter(t => !t.concluida);
        } else if (filter === 'completed') {
            filtered = filtered.filter(t => t.concluida);
        } else if (filter === 'overdue') {
            filtered = filtered.filter(t => {
                if (t.concluida || !t.dataLimite) return false;
                return new Date(t.dataLimite) < new Date();
            });
        }

        // Filtro por categoria
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(t => t.categoria === categoryFilter);
        }

        // Filtro por prioridade
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(t => t.prioridade === priorityFilter);
        }

        // Ordenar
        filtered.sort((a, b) => {
            // Tarefas concluídas vão para o fim
            if (a.concluida !== b.concluida) {
                return a.concluida ? 1 : -1;
            }

            if (sortBy === 'priority') {
                const priorityOrder = { 'urgente': 0, 'alta': 1, 'media': 2, 'baixa': 3 };
                return priorityOrder[a.prioridade] - priorityOrder[b.prioridade];
            } else if (sortBy === 'date') {
                if (!a.dataLimite) return 1;
                if (!b.dataLimite) return -1;
                return new Date(a.dataLimite) - new Date(b.dataLimite);
            } else if (sortBy === 'category') {
                return (a.categoria || '').localeCompare(b.categoria || '');
            }
            return 0;
        });

        return filtered;
    };

    // Estatísticas
    const getStats = () => {
        const stats = {
            total: tasks.length,
            pendentes: tasks.filter(t => !t.concluida).length,
            concluidas: tasks.filter(t => t.concluida).length,
            atrasadas: 0,
            hoje: 0,
            taxaConclusao: 0
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        tasks.forEach(task => {
            if (!task.concluida && task.dataLimite) {
                const taskDate = new Date(task.dataLimite);
                if (taskDate < today) {
                    stats.atrasadas++;
                } else if (taskDate >= today && taskDate < tomorrow) {
                    stats.hoje++;
                }
            }
        });

        if (stats.total > 0) {
            stats.taxaConclusao = Math.round((stats.concluidas / stats.total) * 100);
        }

        return stats;
    };

    // Handlers
    const handleToggleTask = async (task) => {
        const updatedTasks = tasks.map(t =>
            t.id === task.id
                ? { ...t, concluida: !t.concluida, concluidaEm: !t.concluida ? new Date().toISOString() : null }
                : t
        );

        setTasks(updatedTasks);
        onChange({
            ...data,
            tasks: updatedTasks
        });
    };

    const handleAddTask = async () => {
        if (!formData.titulo) {
            alert('Por favor adicione um título para a tarefa');
            return;
        }

        const newTask = {
            ...formData,
            id: Date.now().toString(),
            concluida: false,
            criadaEm: new Date().toISOString(),
            subtarefas: formData.subtarefas.map(s => ({
                id: Date.now().toString() + Math.random(),
                titulo: s,
                concluida: false
            }))
        };

        let updatedTasks;
        if (editingTask) {
            updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...newTask, id: editingTask.id } : t);
            setEditingTask(null);
        } else {
            updatedTasks = [...tasks, newTask];
        }

        setTasks(updatedTasks);
        onChange({
            ...data,
            tasks: updatedTasks
        });

        // Reset form
        setFormData({
            titulo: '',
            descricao: '',
            categoria: 'outro',
            prioridade: 'media',
            dataLimite: '',
            responsavel: currentUser?.displayName || currentUser?.email || '',
            lembrete: true,
            lembreteAntecedencia: 24,
            subtarefas: [],
            notas: ''
        });
        setShowAddForm(false);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setFormData({
            titulo: task.titulo,
            descricao: task.descricao || '',
            categoria: task.categoria,
            prioridade: task.prioridade,
            dataLimite: task.dataLimite || '',
            responsavel: task.responsavel || '',
            lembrete: task.lembrete !== false,
            lembreteAntecedencia: task.lembreteAntecedencia || 24,
            subtarefas: task.subtarefas?.map(s => s.titulo) || [],
            notas: task.notas || ''
        });
        setShowAddForm(true);
    };

    const handleDeleteTask = async (task) => {
        if (!confirm('Tem certeza que deseja eliminar esta tarefa?')) return;

        const updatedTasks = tasks.filter(t => t.id !== task.id);
        setTasks(updatedTasks);
        onChange({
            ...data,
            tasks: updatedTasks
        });
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setFormData({
                ...formData,
                subtarefas: [...formData.subtarefas, newSubtask.trim()]
            });
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (index) => {
        setFormData({
            ...formData,
            subtarefas: formData.subtarefas.filter((_, i) => i !== index)
        });
    };

    const handleLoadTemplate = () => {
        const template = opportunityType === 'comprador'
            ? TASK_TEMPLATES.comprador
            : TASK_TEMPLATES.vendedor;

        const templateTasks = template.map(t => ({
            ...t,
            id: Date.now().toString() + Math.random(),
            concluida: false,
            criadaEm: new Date().toISOString(),
            responsavel: currentUser?.displayName || currentUser?.email || '',
            subtarefas: []
        }));

        const updatedTasks = [...tasks, ...templateTasks];
        setTasks(updatedTasks);
        onChange({
            ...data,
            tasks: updatedTasks
        });
        setShowTemplates(false);
    };

    const stats = getStats();
    const filteredTasks = getFilteredTasks();

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                        Gestão de Tarefas
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowTemplates(!showTemplates)}
                            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 
                                     rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                            Templates
                        </button>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white 
                                     rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nova Tarefa
                        </button>
                    </div>
                </div>

                {/* Templates */}
                {showTemplates && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                            Carregar Template de Tarefas
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                            Adicione um conjunto de tarefas predefinidas baseado no tipo de oportunidade
                        </p>
                        <button
                            onClick={handleLoadTemplate}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Carregar Template {opportunityType === 'comprador' ? 'Comprador' : 'Vendedor'}
                        </button>
                    </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.pendentes}</div>
                        <div className="text-xs text-gray-500">Pendentes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.concluidas}</div>
                        <div className="text-xs text-gray-500">Concluídas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.atrasadas}</div>
                        <div className="text-xs text-gray-500">Atrasadas</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.hoje}</div>
                        <div className="text-xs text-gray-500">Hoje</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{stats.taxaConclusao}%</div>
                        <div className="text-xs text-gray-500">Conclusão</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex gap-4 items-center">
                    {/* Filtro de Estado */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === 'pending'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            Pendentes
                        </button>
                        <button
                            onClick={() => setFilter('overdue')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === 'overdue'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            Atrasadas
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                        >
                            Concluídas
                        </button>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                        {/* Categoria */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todas Categorias</option>
                            {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                                <option key={key} value={key}>{cat.label}</option>
                            ))}
                        </select>

                        {/* Prioridade */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Todas Prioridades</option>
                            {Object.entries(PRIORITIES).map(([key, pri]) => (
                                <option key={key} value={key}>{pri.label}</option>
                            ))}
                        </select>

                        {/* Ordenação */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="priority">Prioridade</option>
                            <option value="date">Data</option>
                            <option value="category">Categoria</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Tarefas */}
            {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                        Não há tarefas {filter !== 'all' ?
                            filter === 'pending' ? 'pendentes' :
                                filter === 'overdue' ? 'atrasadas' :
                                    'concluídas' : ''}
                    </p>
                    {filter === 'all' && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-blue-500 hover:text-blue-600 block w-full"
                            >
                                Criar primeira tarefa
                            </button>
                            <button
                                onClick={() => setShowTemplates(true)}
                                className="text-gray-500 hover:text-gray-600"
                            >
                                ou carregar template
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggle={handleToggleTask}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </div>
            )}

            {/* Modal Adicionar/Editar Tarefa */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h3>

                        <div className="space-y-4">
                            {/* Título */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Título da tarefa"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Descrição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    rows="2"
                                    placeholder="Detalhes da tarefa..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Categoria e Prioridade */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoria
                                    </label>
                                    <select
                                        value={formData.categoria}
                                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(TASK_CATEGORIES).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridade
                                    </label>
                                    <select
                                        value={formData.prioridade}
                                        onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {Object.entries(PRIORITIES).map(([key, pri]) => (
                                            <option key={key} value={key}>{pri.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Data Limite e Responsável */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data Limite
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dataLimite}
                                        onChange={(e) => setFormData({ ...formData, dataLimite: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Responsável
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.responsavel}
                                        onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                                        placeholder="Nome do responsável"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Subtarefas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subtarefas
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                        placeholder="Adicionar subtarefa..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSubtask}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                {formData.subtarefas.length > 0 && (
                                    <div className="space-y-1">
                                        {formData.subtarefas.map((subtask, index) => (
                                            <div key={index} className="flex items-center justify-between 
                                                                      bg-gray-50 px-2 py-1 rounded">
                                                <span className="text-sm">{subtask}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubtask(index)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lembrete */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="lembrete"
                                        checked={formData.lembrete}
                                        onChange={(e) => setFormData({ ...formData, lembrete: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-500 
                                                 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <label htmlFor="lembrete" className="text-sm text-gray-700">
                                        Enviar lembrete
                                    </label>
                                </div>

                                {formData.lembrete && formData.dataLimite && (
                                    <select
                                        value={formData.lembreteAntecedencia}
                                        onChange={(e) => setFormData({ ...formData, lembreteAntecedencia: e.target.value })}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="1">1 hora antes</option>
                                        <option value="24">1 dia antes</option>
                                        <option value="48">2 dias antes</option>
                                        <option value="168">1 semana antes</option>
                                    </select>
                                )}
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas
                                </label>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                                    rows="2"
                                    placeholder="Notas adicionais..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingTask(null);
                                    setFormData({
                                        titulo: '',
                                        descricao: '',
                                        categoria: 'outro',
                                        prioridade: 'media',
                                        dataLimite: '',
                                        responsavel: currentUser?.displayName || currentUser?.email || '',
                                        lembrete: true,
                                        lembreteAntecedencia: 24,
                                        subtarefas: [],
                                        notas: ''
                                    });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddTask}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                                         hover:bg-blue-600"
                            >
                                {editingTask ? 'Atualizar' : 'Criar Tarefa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksTab;