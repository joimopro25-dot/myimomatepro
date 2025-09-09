/**
 * LEAD DETAIL PAGE - MyImoMatePro
 * Página de detalhes completos da lead simplificada
 * Mostra cliente PROSPECT com toda a qualificação
 * 
 * Caminho: src/pages/LeadDetail.jsx
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../contexts/LeadContext';
import {
    LEAD_TYPE_LABELS,
    LEAD_SOURCE_LABELS,
    LEAD_FUNNEL_LABELS,
    LEAD_FUNNEL_COLORS,
    formatCurrency,
    getFunnelProgress,
    getRelativeTime,
    getNextAction
} from '../models/leadModel';
import Layout from '../components/Layout';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CurrencyEuroIcon,
    HomeIcon,
    TagIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    DocumentTextIcon,
    FunnelIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const LeadDetailPage = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const {
        currentLead,
        loading,
        errors,
        fetchLead,
        updateLead,
        deleteLead,
        convertLead,
        clearCurrentLead
    } = useLeads();

    // Estados locais
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showConvertConfirm, setShowConvertConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Carregar lead ao montar
    useEffect(() => {
        if (leadId) {
            loadLead();
        }

        return () => {
            clearCurrentLead();
        };
    }, [leadId]);

    const loadLead = async () => {
        try {
            await fetchLead(leadId);
        } catch (error) {
            console.error('Erro ao carregar lead:', error);
            setErrorMessage('Erro ao carregar lead');
        }
    };

    // Handlers de ações
    const handleEdit = () => {
        navigate(`/leads/${leadId}/edit`);
    };

    const handleDeleteConfirm = async () => {
        setIsProcessing(true);
        try {
            await deleteLead(leadId);
            setSuccessMessage('Lead excluída com sucesso');
            setTimeout(() => {
                navigate('/leads');
            }, 1500);
        } catch (error) {
            console.error('Erro ao deletar lead:', error);
            setErrorMessage('Erro ao excluir lead');
        } finally {
            setIsProcessing(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleConvertConfirm = async () => {
        setIsProcessing(true);
        try {
            await convertLead(leadId);
            setSuccessMessage('Lead convertida com sucesso!');
            setTimeout(() => {
                loadLead(); // Recarregar para mostrar estado atualizado
            }, 1500);
        } catch (error) {
            console.error('Erro ao converter lead:', error);
            setErrorMessage('Erro ao converter lead');
        } finally {
            setIsProcessing(false);
            setShowConvertConfirm(false);
        }
    };

    const handleAdvanceFunnel = async () => {
        if (!currentLead) return;

        const nextState = currentLead.funnelState === 'entrada'
            ? 'qualificando'
            : currentLead.funnelState === 'qualificando'
                ? 'convertido'
                : null;

        if (!nextState) return;

        setIsProcessing(true);
        try {
            if (nextState === 'convertido') {
                await convertLead(leadId);
                setSuccessMessage('Lead convertida com sucesso!');
            } else {
                await updateLead(leadId, { funnelState: nextState });
                setSuccessMessage('Estado do funil atualizado');
            }
            setTimeout(() => {
                loadLead();
            }, 1000);
        } catch (error) {
            console.error('Erro ao avançar funil:', error);
            setErrorMessage('Erro ao atualizar estado');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading.fetch) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <ClockIcon className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Carregando lead...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!currentLead) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <p className="text-gray-600">Lead não encontrada</p>
                        <button
                            onClick={() => navigate('/leads')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Voltar para Leads
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/leads')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Voltar para Leads
                    </button>

                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {currentLead.client?.name || 'Cliente não encontrado'}
                                </h1>
                                <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                                    PROSPECT
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${LEAD_FUNNEL_COLORS[currentLead.funnelState]
                                    }`}>
                                    {LEAD_FUNNEL_LABELS[currentLead.funnelState]}
                                </span>
                            </div>
                            <p className="text-gray-600">
                                {LEAD_TYPE_LABELS[currentLead.type]} • {LEAD_SOURCE_LABELS[currentLead.source]}
                            </p>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <PencilIcon className="w-4 h-4 mr-2" />
                                Editar
                            </button>

                            {currentLead.funnelState !== 'convertido' && (
                                <button
                                    onClick={() => setShowConvertConfirm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    Converter
                                </button>
                            )}

                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mensagens de feedback */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-red-800">{errorMessage}</p>
                    </div>
                )}

                {/* Grid de informações */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progresso do Funil */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FunnelIcon className="w-5 h-5 mr-2" />
                                    Estado do Funil
                                </h2>
                                {currentLead.funnelState !== 'convertido' && (
                                    <button
                                        onClick={handleAdvanceFunnel}
                                        disabled={isProcessing}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                    >
                                        Avançar
                                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                                    </button>
                                )}
                            </div>

                            {/* Barra de progresso */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Progresso: {getFunnelProgress(currentLead.funnelState)}%
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${LEAD_FUNNEL_COLORS[currentLead.funnelState]
                                        }`}>
                                        {LEAD_FUNNEL_LABELS[currentLead.funnelState]}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${getFunnelProgress(currentLead.funnelState)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Estados do funil */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className={`text-center p-3 rounded-lg ${currentLead.funnelState === 'entrada'
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : getFunnelProgress(currentLead.funnelState) > 33
                                            ? 'bg-green-50'
                                            : 'bg-gray-50'
                                    }`}>
                                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${getFunnelProgress(currentLead.funnelState) >= 33
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        1
                                    </div>
                                    <p className="text-sm font-medium">Entrada</p>
                                </div>

                                <div className={`text-center p-3 rounded-lg ${currentLead.funnelState === 'qualificando'
                                        ? 'bg-blue-50 border-2 border-blue-500'
                                        : getFunnelProgress(currentLead.funnelState) > 66
                                            ? 'bg-green-50'
                                            : 'bg-gray-50'
                                    }`}>
                                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${getFunnelProgress(currentLead.funnelState) >= 66
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        2
                                    </div>
                                    <p className="text-sm font-medium">Qualificando</p>
                                </div>

                                <div className={`text-center p-3 rounded-lg ${currentLead.funnelState === 'convertido'
                                        ? 'bg-green-50 border-2 border-green-500'
                                        : 'bg-gray-50'
                                    }`}>
                                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${getFunnelProgress(currentLead.funnelState) >= 100
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        3
                                    </div>
                                    <p className="text-sm font-medium">Convertido</p>
                                </div>
                            </div>

                            {/* Próxima ação recomendada */}
                            {currentLead.funnelState !== 'convertido' && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <SparklesIcon className="w-4 h-4 inline mr-1" />
                                        <strong>Próxima ação:</strong> {getNextAction(currentLead)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Informações de Qualificação */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <DocumentTextIcon className="w-5 h-5 mr-2" />
                                Qualificação
                            </h2>

                            <div className="space-y-4">
                                {/* Campos específicos por tipo */}
                                {(currentLead.type === 'comprador' || currentLead.type === 'inquilino') && (
                                    <>
                                        {currentLead.qualification?.budget && (
                                            <div className="flex items-start">
                                                <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Orçamento</p>
                                                    <p className="text-gray-900">
                                                        {formatCurrency(currentLead.qualification.budget)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {currentLead.qualification?.propertyReference && (
                                            <div className="flex items-start">
                                                <HomeIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Referência do Imóvel</p>
                                                    <p className="text-gray-900">
                                                        {currentLead.qualification.propertyReference}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {(currentLead.type === 'vendedor' || currentLead.type === 'senhorio') && (
                                    <>
                                        {currentLead.qualification?.propertyLocation && (
                                            <div className="flex items-start">
                                                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Localização do Imóvel</p>
                                                    <p className="text-gray-900">
                                                        {currentLead.qualification.propertyLocation}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {currentLead.qualification?.askingPrice && (
                                            <div className="flex items-start">
                                                <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Valor Pretendido</p>
                                                    <p className="text-gray-900">
                                                        {formatCurrency(currentLead.qualification.askingPrice)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {currentLead.type === 'investidor' && (
                                    <>
                                        {currentLead.qualification?.investmentLocation && (
                                            <div className="flex items-start">
                                                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Local de Investimento</p>
                                                    <p className="text-gray-900">
                                                        {currentLead.qualification.investmentLocation}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {currentLead.qualification?.investmentBudget && (
                                            <div className="flex items-start">
                                                <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">Orçamento de Investimento</p>
                                                    <p className="text-gray-900">
                                                        {formatCurrency(currentLead.qualification.investmentBudget)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Notas de qualificação */}
                                {currentLead.qualification?.qualificationNotes && (
                                    <div className="flex items-start">
                                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Notas de Qualificação</p>
                                            <p className="text-gray-900 whitespace-pre-wrap">
                                                {currentLead.qualification.qualificationNotes}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Coluna lateral */}
                    <div className="space-y-6">
                        {/* Informações do Cliente */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <UserIcon className="w-5 h-5 mr-2" />
                                Dados do Cliente
                            </h2>

                            <div className="space-y-3">
                                {currentLead.client?.email && (
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                                        <a
                                            href={`mailto:${currentLead.client.email}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            {currentLead.client.email}
                                        </a>
                                    </div>
                                )}

                                {currentLead.client?.phone && (
                                    <div className="flex items-center">
                                        <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                                        <a
                                            href={`tel:${currentLead.client.phone}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            {currentLead.client.phone}
                                        </a>
                                    </div>
                                )}

                                {currentLead.client?.address && (
                                    <div className="flex items-start">
                                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                                        <p className="text-sm text-gray-600">
                                            {currentLead.client.address}
                                            {currentLead.client.city && `, ${currentLead.client.city}`}
                                            {currentLead.client.postalCode && ` ${currentLead.client.postalCode}`}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-3 mt-3 border-t">
                                    <button
                                        onClick={() => navigate(`/clients/${currentLead.clientId}`)}
                                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Ver perfil completo do cliente →
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Informações da Lead */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2" />
                                Informações da Lead
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Tipo</p>
                                    <p className="text-gray-900">{LEAD_TYPE_LABELS[currentLead.type]}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Fonte</p>
                                    <p className="text-gray-900">{LEAD_SOURCE_LABELS[currentLead.source]}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Estado</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${LEAD_FUNNEL_COLORS[currentLead.funnelState]
                                        }`}>
                                        {LEAD_FUNNEL_LABELS[currentLead.funnelState]}
                                    </span>
                                </div>

                                <div className="pt-3 border-t">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CalendarIcon className="w-4 h-4 mr-1" />
                                        Criada {getRelativeTime(currentLead.createdAt)}
                                    </div>
                                    {currentLead.updatedAt && currentLead.updatedAt !== currentLead.createdAt && (
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            Atualizada {getRelativeTime(currentLead.updatedAt)}
                                        </div>
                                    )}
                                    {currentLead.convertedAt && (
                                        <div className="flex items-center text-sm text-green-600 mt-1">
                                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                                            Convertida {getRelativeTime(currentLead.convertedAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de confirmação de exclusão */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Confirmar Exclusão
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tem certeza que deseja excluir a lead de <strong>{currentLead.client?.name}</strong>?
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Excluindo...' : 'Excluir'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmação de conversão */}
                {showConvertConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Converter Lead
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Converter a lead de <strong>{currentLead.client?.name}</strong> em cliente ativo?
                                O badge PROSPECT será removido e a lead será marcada como convertida.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConvertConfirm(false)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConvertConfirm}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Convertendo...' : 'Converter'}
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