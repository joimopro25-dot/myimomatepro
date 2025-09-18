/**
 * PÁGINA DE NEGÓCIO PLENO
 * Gestão completa de um negócio pleno específico
 * Caminho: src/pages/NegocioPlenoPage.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNegocioPleno } from '../contexts/NegocioPlenoContext';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    HomeIcon,
    UsersIcon,
    CurrencyEuroIcon,
    DocumentTextIcon,
    CalendarIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    PaperClipIcon,
    ClockIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowRightIcon,
    DocumentCheckIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';
import {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_PLENO_STATE_LABELS,
    formatCurrency,
    calculateCommissions,
    getNextStep,
    checkAlerts
} from '../models/negocioPlenoModel';

const NegocioPlenoPage = () => {
    const { negocioPlenoId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        currentNegocioPleno,
        loading,
        errors,
        fetchNegocioPleno,
        updateNegocioPleno,
        advanceState,
        addTask,
        updateTask,
        addDocument,
        unlinkNegocioPleno
    } = useNegocioPleno();

    // Estados locais
    const [activeTab, setActiveTab] = useState('geral');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [alerts, setAlerts] = useState([]);

    // Carregar dados ao montar
    useEffect(() => {
        if (negocioPlenoId) {
            fetchNegocioPleno(negocioPlenoId);
        }
    }, [negocioPlenoId]);

    // Atualizar alertas quando negócio pleno mudar
    useEffect(() => {
        if (currentNegocioPleno) {
            const negocioAlerts = checkAlerts(currentNegocioPleno);
            setAlerts(negocioAlerts);
            setFormData(currentNegocioPleno);
        }
    }, [currentNegocioPleno]);

    // Handlers
    const handleSave = async () => {
        try {
            await updateNegocioPleno(negocioPlenoId, formData);
            setEditMode(false);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        }
    };

    const handleAdvanceState = async () => {
        const nextStep = getNextStep(currentNegocioPleno);
        if (nextStep) {
            try {
                await advanceState(negocioPlenoId, nextStep.proximoEstado);
            } catch (error) {
                console.error('Erro ao avançar estado:', error);
            }
        }
    };

    const handleUnlink = async () => {
        if (window.confirm('Tem certeza que deseja deslinkar este negócio pleno? Esta ação não pode ser desfeita.')) {
            try {
                await unlinkNegocioPleno(negocioPlenoId, 'Deslinkado pelo utilizador');
                navigate('/negocios-plenos');
            } catch (error) {
                console.error('Erro ao deslinkar:', error);
            }
        }
    };

    if (loading.fetch) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (!currentNegocioPleno) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Negócio Pleno não encontrado</h2>
                        <button
                            onClick={() => navigate('/negocios-plenos')}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Voltar à Lista
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const nextStep = getNextStep(currentNegocioPleno);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/negocios-plenos')}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentNegocioPleno.numero}
                                </h1>
                                <p className="text-gray-600">{currentNegocioPleno.titulo}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentNegocioPleno.estado === NEGOCIO_PLENO_STATES.COMPLETED
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                {NEGOCIO_PLENO_STATE_LABELS[currentNegocioPleno.estado]}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {nextStep && (
                                <button
                                    onClick={handleAdvanceState}
                                    disabled={loading.update}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                >
                                    <ArrowRightIcon className="w-4 h-4" />
                                    <span>{nextStep.acao}</span>
                                </button>
                            )}
                            <button
                                onClick={handleUnlink}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Deslinkar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {alerts.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg flex items-start space-x-3 ${alert.nivel === 'danger'
                                        ? 'bg-red-50 border border-red-200'
                                        : 'bg-yellow-50 border border-yellow-200'
                                    }`}
                            >
                                <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${alert.nivel === 'danger' ? 'text-red-600' : 'text-yellow-600'
                                    }`} />
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${alert.nivel === 'danger' ? 'text-red-800' : 'text-yellow-800'
                                        }`}>
                                        {alert.mensagem}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cards das Oportunidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Vendedor */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Vendedor</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                Venda
                            </span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-gray-500">Cliente:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.vendedora?.clienteNome}
                                </span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-500">Oportunidade:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.vendedora?.titulo}
                                </span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-500">Consultor:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.vendedora?.consultorNome || 'N/A'}
                                </span>
                            </p>
                            {currentNegocioPleno.oportunidades?.vendedora?.motivoVenda && (
                                <p className="text-sm">
                                    <span className="text-gray-500">Motivo:</span>{' '}
                                    <span className="font-medium">
                                        {currentNegocioPleno.oportunidades.vendedora.motivoVenda}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Comprador */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Comprador</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                Compra
                            </span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="text-gray-500">Cliente:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.compradora?.clienteNome}
                                </span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-500">Oportunidade:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.compradora?.titulo}
                                </span>
                            </p>
                            <p className="text-sm">
                                <span className="text-gray-500">Consultor:</span>{' '}
                                <span className="font-medium">
                                    {currentNegocioPleno.oportunidades?.compradora?.consultorNome || 'N/A'}
                                </span>
                            </p>
                            {currentNegocioPleno.oportunidades?.compradora?.necessitaCredito && (
                                <p className="text-sm">
                                    <span className="text-gray-500">Crédito:</span>{' '}
                                    <span className="font-medium">
                                        €{formatCurrency(currentNegocioPleno.oportunidades.compradora.valorCreditoAprovado || 0)}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b">
                        <nav className="flex -mb-px">
                            {[
                                { id: 'geral', label: 'Geral', icon: HomeIcon },
                                { id: 'valores', label: 'Valores', icon: CurrencyEuroIcon },
                                { id: 'cpcv', label: 'CPCV', icon: DocumentTextIcon },
                                { id: 'escritura', label: 'Escritura', icon: DocumentCheckIcon },
                                { id: 'documentos', label: 'Documentos', icon: PaperClipIcon },
                                { id: 'tarefas', label: 'Tarefas', icon: ClipboardDocumentListIcon },
                                { id: 'timeline', label: 'Timeline', icon: ClockIcon }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab Geral */}
                        {activeTab === 'geral' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Imóvel</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Referência</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.imovel?.referencia || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipologia</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.imovel?.tipologia || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Área</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.imovel?.area || 0} m²
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quartos</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.imovel?.quartos || 0}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Morada</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.imovel?.morada || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Valores */}
                        {activeTab === 'valores' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Valores do Negócio */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Valores do Negócio</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Valor Pedido</label>
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        value={formData.valores?.valorPedido || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            valores: {
                                                                ...formData.valores,
                                                                valorPedido: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                ) : (
                                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                                        €{formatCurrency(currentNegocioPleno.valores?.valorPedido || 0)}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Valor Acordado</label>
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        value={formData.valores?.valorAcordado || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            valores: {
                                                                ...formData.valores,
                                                                valorAcordado: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                ) : (
                                                    <p className="mt-1 text-lg font-semibold text-green-600">
                                                        €{formatCurrency(currentNegocioPleno.valores?.valorAcordado || 0)}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Sinal</label>
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        value={formData.valores?.sinal || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            valores: {
                                                                ...formData.valores,
                                                                sinal: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="mt-1">
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            €{formatCurrency(currentNegocioPleno.valores?.sinal || 0)}
                                                        </p>
                                                        {currentNegocioPleno.valores?.sinalPago && (
                                                            <span className="text-xs text-green-600">✓ Pago</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Valor Escritura</label>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    €{formatCurrency(currentNegocioPleno.valores?.valorEscritura || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comissões */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comissões</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Comissão Total</label>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    €{formatCurrency(currentNegocioPleno.comissoes?.valorTotal || 0)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {currentNegocioPleno.comissoes?.percentagemTotal || 5}% do valor acordado
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Ag. Vendedora</label>
                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        €{formatCurrency(currentNegocioPleno.comissoes?.agenciaVendedora?.valor || 0)}
                                                    </p>
                                                    {currentNegocioPleno.comissoes?.agenciaVendedora?.paga && (
                                                        <span className="text-xs text-green-600">✓ Paga</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Ag. Compradora</label>
                                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                                        €{formatCurrency(currentNegocioPleno.comissoes?.agenciaCompradora?.valor || 0)}
                                                    </p>
                                                    {currentNegocioPleno.comissoes?.agenciaCompradora?.paga && (
                                                        <span className="text-xs text-green-600">✓ Paga</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de Ação */}
                                <div className="flex justify-end space-x-2 pt-4 border-t">
                                    {editMode ? (
                                        <>
                                            <button
                                                onClick={() => setEditMode(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={loading.update}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Salvar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                            <span>Editar Valores</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab CPCV */}
                        {activeTab === 'cpcv' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Contrato Promessa Compra e Venda
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                                            <p className="mt-1">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${currentNegocioPleno.cpcv?.estado === 'assinado'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {currentNegocioPleno.cpcv?.estado || 'Não iniciado'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Data Assinatura</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.cpcv?.dataAssinatura
                                                    ? new Date(currentNegocioPleno.cpcv.dataAssinatura).toLocaleDateString('pt-PT')
                                                    : 'Não definida'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-3">Checklist CPCV</h4>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'minutaRevisada', label: 'Minuta Revisada' },
                                                { key: 'documentacaoCompleta', label: 'Documentação Completa' },
                                                { key: 'sinalRecebido', label: 'Sinal Recebido' },
                                                { key: 'copiasEntregues', label: 'Cópias Entregues' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentNegocioPleno.cpcv?.checklist?.[item.key] || false}
                                                        onChange={() => {
                                                            updateNegocioPleno(negocioPlenoId, {
                                                                cpcv: {
                                                                    ...currentNegocioPleno.cpcv,
                                                                    checklist: {
                                                                        ...currentNegocioPleno.cpcv?.checklist,
                                                                        [item.key]: !currentNegocioPleno.cpcv?.checklist?.[item.key]
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="h-4 w-4 text-indigo-600 rounded"
                                                    />
                                                    <label className="text-sm text-gray-700">{item.label}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Escritura */}
                        {activeTab === 'escritura' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Escritura</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                                            <p className="mt-1">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${currentNegocioPleno.escritura?.estado === 'realizada'
                                                        ? 'bg-green-100 text-green-700'
                                                        : currentNegocioPleno.escritura?.estado === 'agendada'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {currentNegocioPleno.escritura?.estado || 'Não agendada'}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Data Agendada</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.escritura?.dataAgendada
                                                    ? new Date(currentNegocioPleno.escritura.dataAgendada).toLocaleDateString('pt-PT')
                                                    : 'Não definida'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Notário</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.escritura?.notario || 'Não definido'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Necessita Crédito</label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {currentNegocioPleno.escritura?.necessitaCredito ? 'Sim' : 'Não'}
                                            </p>
                                        </div>
                                    </div>

                                    {currentNegocioPleno.escritura?.necessitaCredito && (
                                        <div className="mt-6">
                                            <h4 className="text-md font-medium text-gray-900 mb-3">Informações de Crédito</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Banco</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        {currentNegocioPleno.escritura?.banco || 'Não definido'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Valor do Crédito</label>
                                                    <p className="mt-1 text-sm text-gray-900">
                                                        €{formatCurrency(currentNegocioPleno.escritura?.valorCredito || 0)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Crédito Aprovado</label>
                                                    <p className="mt-1">
                                                        {currentNegocioPleno.escritura?.creditoAprovado ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <ClockIcon className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">DIP Emitido</label>
                                                    <p className="mt-1">
                                                        {currentNegocioPleno.escritura?.dipEmitido ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <ClockIcon className="w-5 h-5 text-yellow-500" />
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab Timeline */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico do Negócio</h3>
                                {currentNegocioPleno.timeline && currentNegocioPleno.timeline.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {currentNegocioPleno.timeline.map((event, eventIdx) => (
                                                <li key={event.id || eventIdx}>
                                                    <div className="relative pb-8">
                                                        {eventIdx !== currentNegocioPleno.timeline.length - 1 ? (
                                                            <span
                                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                aria-hidden="true"
                                                            />
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.tipo === 'criacao'
                                                                        ? 'bg-green-500'
                                                                        : event.tipo === 'mudanca_estado'
                                                                            ? 'bg-blue-500'
                                                                            : event.tipo === 'valor_alterado'
                                                                                ? 'bg-yellow-500'
                                                                                : 'bg-gray-400'
                                                                    }`}>
                                                                    <CheckCircleIcon className="h-5 w-5 text-white" />
                                                                </span>
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {event.titulo}
                                                                    </p>
                                                                    {event.descricao && (
                                                                        <p className="text-sm text-gray-500">
                                                                            {event.descricao}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                                    {event.timestamp
                                                                        ? new Date(event.timestamp.seconds * 1000).toLocaleDateString('pt-PT')
                                                                        : 'Data não disponível'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Nenhum evento registado</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Erros */}
                {(errors.fetch || errors.update) && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">Erro: {errors.fetch || errors.update}</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NegocioPlenoPage;