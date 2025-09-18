/**
 * NEGOCIO PLENO DETAIL - MyImoMatePro
 * Página de detalhe completo do negócio pleno
 * 
 * Caminho: src/pages/negocioPleno/NegocioPlenoDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNegociosPlenos } from '../../contexts/NegocioPlenoContext';
import Layout from '../../components/Layout';
import {
    ArrowLeftIcon,
    LinkIcon,
    DocumentTextIcon,
    CurrencyEuroIcon,
    ShoppingCartIcon,
    HomeIcon,
    ClockIcon,
    CheckCircleIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    BanknotesIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ClipboardDocumentCheckIcon,
    DocumentArrowDownIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ArrowRightIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import {
    NEGOCIO_PLENO_STATES,
    NEGOCIO_PLENO_STATE_LABELS,
    getStateColor,
    getNextSteps,
    canTransitionToState
} from '../../models/negocioPlenoModel';

const NegocioPlenoDetail = () => {
    const { negocioPlenoId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const {
        currentNegocio,
        loadingCurrent,
        error,
        loadNegocioPleno,
        updateNegocio,
        changeNegocioState,
        updateChecklistItem,
        addTimelineEvent,
        unlinkOpportunities
    } = useNegociosPlenos();

    const [activeTab, setActiveTab] = useState('geral');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Carregar negócio ao montar
    useEffect(() => {
        if (negocioPlenoId) {
            loadNegocioPleno(negocioPlenoId);
        }
    }, [negocioPlenoId]);

    // Atualizar formData quando negócio carregar
    useEffect(() => {
        if (currentNegocio) {
            setFormData({
                titulo: currentNegocio.titulo || '',
                descricao: currentNegocio.descricao || '',
                valores: currentNegocio.valores || {},
                comissoes: currentNegocio.comissoes || {},
                prazos: currentNegocio.prazos || {}
            });
        }
    }, [currentNegocio]);

    // Salvar alterações
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateNegocio(negocioPlenoId, formData);
            setEditMode(false);
            await addTimelineEvent(negocioPlenoId, {
                tipo: 'nota_adicionada',
                descricao: 'Dados do negócio atualizados'
            });
        } catch (err) {
            console.error('Erro ao salvar:', err);
        } finally {
            setSaving(false);
        }
    };

    // Mudar estado
    const handleStateChange = async (newState) => {
        if (!canTransitionToState(currentNegocio.estado, newState)) {
            alert('Esta transição de estado não é permitida');
            return;
        }

        if (window.confirm(`Mudar estado para ${NEGOCIO_PLENO_STATE_LABELS[newState]}?`)) {
            await changeNegocioState(negocioPlenoId, newState);
        }
    };

    // Toggle checklist
    const handleChecklistToggle = async (item) => {
        const newValue = !currentNegocio.checklist[item];
        await updateChecklistItem(negocioPlenoId, item, newValue);
    };

    // Deslinkar
    const handleUnlink = async () => {
        if (window.confirm('Tem certeza que deseja deslinkar estas oportunidades?')) {
            const success = await unlinkOpportunities(negocioPlenoId);
            if (success) {
                navigate('/negocios-plenos');
            }
        }
    };

    if (loadingCurrent) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentNegocio) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-gray-600">Negócio pleno não encontrado</p>
                </div>
            </Layout>
        );
    }

    const stateColor = getStateColor(currentNegocio.estado);
    const colorClasses = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
        indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        red: 'bg-red-100 text-red-700 border-red-200'
    };
    const stateColorClass = colorClasses[stateColor] || colorClasses.gray;

    // Tabs
    const tabs = [
        { id: 'geral', label: 'Geral', icon: InformationCircleIcon },
        { id: 'valores', label: 'Valores', icon: BanknotesIcon },
        { id: 'documentacao', label: 'Documentação', icon: DocumentTextIcon },
        { id: 'checklist', label: 'Checklist', icon: ClipboardDocumentCheckIcon },
        { id: 'timeline', label: 'Timeline', icon: ClockIcon }
    ];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/negocios-plenos')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar à lista
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${stateColorClass}`}>
                                <LinkIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {currentNegocio.titulo || 'Negócio Pleno'}
                                </h1>
                                <p className="text-gray-500 mt-1">#{currentNegocio.numeroNegocio}</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stateColorClass} mt-2`}>
                                    {NEGOCIO_PLENO_STATE_LABELS[currentNegocio.estado]}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                    <span>Editar</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleUnlink}
                                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                            >
                                <XMarkIcon className="w-5 h-5" />
                                <span>Deslinkar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Partes envolvidas */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Partes Envolvidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vendedor */}
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                                <CurrencyEuroIcon className="w-5 h-5 text-green-600" />
                                <h3 className="font-medium text-gray-900">Vendedor</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">
                                        {currentNegocio.oportunidades?.vendedora?.clienteNome}
                                    </span>
                                </div>
                                {currentNegocio.oportunidades?.vendedora?.clienteContacto && (
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 text-sm">
                                            {currentNegocio.oportunidades.vendedora.clienteContacto}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate(`/clients/${currentNegocio.oportunidades?.vendedora?.clienteId}/opportunities/${currentNegocio.oportunidades?.vendedora?.id}`)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Ver oportunidade →
                                </button>
                            </div>
                        </div>

                        {/* Comprador */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                                <ShoppingCartIcon className="w-5 h-5 text-blue-600" />
                                <h3 className="font-medium text-gray-900">Comprador</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-700">
                                        {currentNegocio.oportunidades?.compradora?.clienteNome}
                                    </span>
                                </div>
                                {currentNegocio.oportunidades?.compradora?.clienteContacto && (
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600 text-sm">
                                            {currentNegocio.oportunidades.compradora.clienteContacto}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate(`/clients/${currentNegocio.oportunidades?.compradora?.clienteId}/opportunities/${currentNegocio.oportunidades?.compradora?.id}`)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Ver oportunidade →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm
                                        ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab Geral */}
                        {activeTab === 'geral' && (
                            <div className="space-y-6">
                                {/* Informações do imóvel */}
                                {currentNegocio.imovel && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Dados do Imóvel</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentNegocio.imovel.referencia && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Referência</p>
                                                    <p className="font-medium">{currentNegocio.imovel.referencia}</p>
                                                </div>
                                            )}
                                            {currentNegocio.imovel.tipologia && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Tipologia</p>
                                                    <p className="font-medium">{currentNegocio.imovel.tipologia}</p>
                                                </div>
                                            )}
                                            {currentNegocio.imovel.morada && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Morada</p>
                                                    <p className="font-medium">{currentNegocio.imovel.morada}</p>
                                                </div>
                                            )}
                                            {currentNegocio.imovel.areaBruta > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Área</p>
                                                    <p className="font-medium">{currentNegocio.imovel.areaBruta} m²</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Próximos passos */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Próximos Passos</h3>
                                    <div className="space-y-2">
                                        {getNextSteps(currentNegocio.estado).map((step, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <span className="text-gray-700">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ações de estado */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Mudar Estado</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.values(NEGOCIO_PLENO_STATES)
                                            .filter(state => canTransitionToState(currentNegocio.estado, state))
                                            .map(state => (
                                                <button
                                                    key={state}
                                                    onClick={() => handleStateChange(state)}
                                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                                                >
                                                    {NEGOCIO_PLENO_STATE_LABELS[state]}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Valores */}
                        {activeTab === 'valores' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Valores do negócio */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Valores do Negócio</h3>
                                        <div>
                                            <p className="text-sm text-gray-600">Valor Pedido</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                €{currentNegocio.valores?.valorPedido?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Valor Proposto</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                €{currentNegocio.valores?.valorProposto?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Valor Acordado</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                €{currentNegocio.valores?.valorAcordado?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sinal e reforços */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Sinal e Reforços</h3>
                                        <div>
                                            <p className="text-sm text-gray-600">Sinal ({currentNegocio.valores?.sinalPercentagem || 0}%)</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                €{currentNegocio.valores?.sinal?.toLocaleString('pt-PT') || 0}
                                            </p>
                                            {currentNegocio.valores?.sinalPago && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                                                    <CheckIcon className="w-3 h-3" />
                                                    Pago
                                                </span>
                                            )}
                                        </div>
                                        {currentNegocio.valores?.reforco > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-600">Reforço ({currentNegocio.valores?.reforcoPercentagem || 0}%)</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    €{currentNegocio.valores?.reforco?.toLocaleString('pt-PT') || 0}
                                                </p>
                                                {currentNegocio.valores?.reforcoPago && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                                                        <CheckIcon className="w-3 h-3" />
                                                        Pago
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Comissões */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Comissões</h3>
                                        <div>
                                            <p className="text-sm text-gray-600">Total ({currentNegocio.comissoes?.percentagemTotal || 0}%)</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                €{currentNegocio.comissoes?.valorTotal?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Vendedor ({currentNegocio.comissoes?.percentagemVendedor || 0}%)</p>
                                            <p className="font-medium">
                                                €{currentNegocio.comissoes?.comissaoVendedor?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Comprador ({currentNegocio.comissoes?.percentagemComprador || 0}%)</p>
                                            <p className="font-medium">
                                                €{currentNegocio.comissoes?.comissaoComprador?.toLocaleString('pt-PT') || 0}
                                            </p>
                                        </div>
                                        {currentNegocio.comissoes?.comissaoPaga && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                <CheckIcon className="w-3 h-3" />
                                                Comissão Paga
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Documentação */}
                        {activeTab === 'documentacao' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* CPCV */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">CPCV</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Número do Contrato</span>
                                                <span className="font-medium">
                                                    {currentNegocio.cpcv?.numeroContrato || 'Não definido'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Data de Assinatura</span>
                                                <span className="font-medium">
                                                    {currentNegocio.cpcv?.dataAssinatura
                                                        ? new Date(currentNegocio.cpcv.dataAssinatura).toLocaleDateString('pt-PT')
                                                        : 'Não agendada'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Estado</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentNegocio.cpcv?.estado === 'assinado'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {currentNegocio.cpcv?.estado || 'Pendente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Escritura */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Escritura</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Data Agendada</span>
                                                <span className="font-medium">
                                                    {currentNegocio.escritura?.dataAgendada
                                                        ? new Date(currentNegocio.escritura.dataAgendada).toLocaleDateString('pt-PT')
                                                        : 'Não agendada'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Local</span>
                                                <span className="font-medium">
                                                    {currentNegocio.escritura?.localEscritura || 'Não definido'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-700">Cartório</span>
                                                <span className="font-medium">
                                                    {currentNegocio.escritura?.cartorio || 'Não definido'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Documentos necessários */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Documentos</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries({
                                            'Caderneta': currentNegocio.documentacao?.caderneta,
                                            'Certidão Permanente': currentNegocio.documentacao?.certidaoPermanente,
                                            'Licença Utilização': currentNegocio.documentacao?.licencaUtilizacao,
                                            'Certificado Energético': currentNegocio.documentacao?.certificadoEnergetico,
                                            'Ficha Técnica': currentNegocio.documentacao?.fichaTecnica,
                                            'Docs Vendedor': currentNegocio.documentacao?.documentosVendedor,
                                            'Docs Comprador': currentNegocio.documentacao?.documentosComprador,
                                            'Crédito Aprovado': currentNegocio.documentacao?.aprovaçãoCredito
                                        }).map(([label, checked]) => (
                                            <div key={label} className="flex items-center gap-2">
                                                {checked ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <XMarkIcon className="w-5 h-5 text-gray-300" />
                                                )}
                                                <span className={checked ? 'text-gray-900' : 'text-gray-400'}>
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Checklist */}
                        {activeTab === 'checklist' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Fase Inicial */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Fase Inicial</h3>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                visitaRealizada: 'Visita Realizada',
                                                propostaApresentada: 'Proposta Apresentada',
                                                propostaAceite: 'Proposta Aceite'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentNegocio.checklist?.[key] || false}
                                                        onChange={() => handleChecklistToggle(key)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Documentação */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Documentação</h3>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                documentacaoVendedorCompleta: 'Documentação Vendedor Completa',
                                                documentacaoCompradorCompleta: 'Documentação Comprador Completa',
                                                documentacaoImovelCompleta: 'Documentação Imóvel Completa'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentNegocio.checklist?.[key] || false}
                                                        onChange={() => handleChecklistToggle(key)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CPCV */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">CPCV</h3>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                minutaElaborada: 'Minuta Elaborada',
                                                minutaRevisada: 'Minuta Revisada',
                                                cpcvAssinado: 'CPCV Assinado',
                                                sinalRecebido: 'Sinal Recebido'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentNegocio.checklist?.[key] || false}
                                                        onChange={() => handleChecklistToggle(key)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Finalização */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Finalização</h3>
                                        <div className="space-y-3">
                                            {Object.entries({
                                                creditoAprovado: 'Crédito Aprovado',
                                                dipEmitido: 'DIP Emitido',
                                                escrituraAgendada: 'Escritura Agendada',
                                                escrituraRealizada: 'Escritura Realizada',
                                                chavesEntregues: 'Chaves Entregues',
                                                comissoesPagas: 'Comissões Pagas'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentNegocio.checklist?.[key] || false}
                                                        onChange={() => handleChecklistToggle(key)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Timeline */}
                        {activeTab === 'timeline' && (
                            <div className="space-y-4">
                                {currentNegocio.timeline && currentNegocio.timeline.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {currentNegocio.timeline.map((event, index) => (
                                                <li key={event.id || index}>
                                                    <div className="relative pb-8">
                                                        {index !== currentNegocio.timeline.length - 1 && (
                                                            <span
                                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                aria-hidden="true"
                                                            />
                                                        )}
                                                        <div className="relative flex space-x-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                                <ClockIcon className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                <div>
                                                                    <p className="text-sm text-gray-900">
                                                                        {event.descricao}
                                                                    </p>
                                                                </div>
                                                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                                                    {event.createdAt?.toDate
                                                                        ? event.createdAt.toDate().toLocaleDateString('pt-PT')
                                                                        : new Date(event.createdAt).toLocaleDateString('pt-PT')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        <ClockIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>Nenhum evento na timeline ainda</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default NegocioPlenoDetail;