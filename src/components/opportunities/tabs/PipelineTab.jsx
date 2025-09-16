/**
 * PIPELINE TAB - MyImoMatePro
 * Tab de gestão do pipeline de oportunidades
 * Visualização e movimentação entre fases do funil de vendas
 * 
 * Caminho: src/components/opportunities/tabs/PipelineTab.jsx
 */

import React, { useState, useEffect } from 'react';
import { useOpportunities } from '../../../contexts/OpportunityContext';
import {
    OPPORTUNITY_STATES,
    OPPORTUNITY_STATE_LABELS,
    TIMELINE_EVENT_TYPES
} from '../../../models/opportunityModel';
import {
    ChevronRightIcon,
    ChevronLeftIcon,
    CheckCircleIcon,
    ClockIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    CurrencyEuroIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    HomeIcon,
    MapPinIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

// Pipeline stages com cores e descrições
const PIPELINE_STAGES = {
    [OPPORTUNITY_STATES.LEAD]: {
        label: 'Lead',
        color: 'gray',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-700',
        description: 'Contacto inicial',
        icon: UserIcon,
        actions: ['Qualificar lead', 'Agendar reunião', 'Enviar informação'],
        requiredFields: ['nome', 'contacto', 'origem']
    },
    [OPPORTUNITY_STATES.QUALIFYING]: {
        label: 'Qualificação',
        color: 'blue',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700',
        description: 'A avaliar necessidades',
        icon: ClipboardDocumentCheckIcon,
        actions: ['Definir critérios', 'Avaliar budget', 'Identificar decisores'],
        requiredFields: ['tipoNegocio', 'valorEstimado', 'criterios']
    },
    [OPPORTUNITY_STATES.VIEWING]: {
        label: 'Visitas',
        color: 'indigo',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300',
        textColor: 'text-indigo-700',
        description: 'Em processo de visitas',
        icon: HomeIcon,
        actions: ['Agendar visita', 'Registar feedback', 'Enviar mais opções'],
        requiredFields: ['imoveis', 'visitasAgendadas']
    },
    [OPPORTUNITY_STATES.PROPOSAL]: {
        label: 'Proposta',
        color: 'purple',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-700',
        description: 'Proposta enviada',
        icon: DocumentTextIcon,
        actions: ['Preparar proposta', 'Negociar termos', 'Ajustar valor'],
        requiredFields: ['valorProposta', 'condicoesPropostas', 'dataEnvioProposta']
    },
    [OPPORTUNITY_STATES.NEGOTIATION]: {
        label: 'Negociação',
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-700',
        description: 'Em negociação',
        icon: CurrencyEuroIcon,
        actions: ['Contraproposta', 'Reunião decisão', 'Ajustar condições'],
        requiredFields: ['termosFinals', 'valorFinal']
    },
    [OPPORTUNITY_STATES.CLOSING]: {
        label: 'Fecho',
        color: 'green',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        textColor: 'text-green-700',
        description: 'A fechar negócio',
        icon: CheckCircleIcon,
        actions: ['Preparar CPCV', 'Agendar escritura', 'Confirmar documentos'],
        requiredFields: ['cpcvAssinado', 'dataEscritura', 'documentosCompletos']
    },
    [OPPORTUNITY_STATES.CLOSED_WON]: {
        label: 'Fechado ✓',
        color: 'green',
        bgColor: 'bg-green-500',
        borderColor: 'border-green-600',
        textColor: 'text-white',
        description: 'Negócio concluído',
        icon: CheckCircleSolid,
        actions: ['Arquivo', 'Follow-up', 'Pedir referências'],
        requiredFields: []
    },
    [OPPORTUNITY_STATES.CLOSED_LOST]: {
        label: 'Perdido ✗',
        color: 'red',
        bgColor: 'bg-red-500',
        borderColor: 'border-red-600',
        textColor: 'text-white',
        description: 'Negócio perdido',
        icon: XMarkIcon,
        actions: ['Registar motivo', 'Follow-up futuro', 'Análise perdas'],
        requiredFields: []
    }
};

const PipelineTab = ({ data = {}, onChange, opportunityType, errors }) => {
    const {
        changeOpportunityState,
        addEventToTimeline,
        OPPORTUNITY_STATES: STATES
    } = useOpportunities();

    const [currentStage, setCurrentStage] = useState(data.estado || OPPORTUNITY_STATES.LEAD);
    const [stageHistory, setStageHistory] = useState(data.stageHistory || []);
    const [lostReason, setLostReason] = useState('');
    const [showLostModal, setShowLostModal] = useState(false);
    const [notes, setNotes] = useState(data.pipelineNotes || '');
    const [stageProgress, setStageProgress] = useState({});
    const [estimatedDays, setEstimatedDays] = useState(data.estimatedDays || {
        [OPPORTUNITY_STATES.QUALIFYING]: 3,
        [OPPORTUNITY_STATES.VIEWING]: 7,
        [OPPORTUNITY_STATES.PROPOSAL]: 5,
        [OPPORTUNITY_STATES.NEGOTIATION]: 7,
        [OPPORTUNITY_STATES.CLOSING]: 14
    });

    // Calcular progresso de cada stage
    useEffect(() => {
        const calculateProgress = () => {
            const progress = {};
            Object.keys(PIPELINE_STAGES).forEach(stage => {
                const required = PIPELINE_STAGES[stage].requiredFields;
                if (required.length === 0) {
                    progress[stage] = 100;
                } else {
                    const completed = required.filter(field => {
                        // Verificar se o campo existe e tem valor
                        return data[field] &&
                            (Array.isArray(data[field]) ? data[field].length > 0 : true);
                    }).length;
                    progress[stage] = Math.round((completed / required.length) * 100);
                }
            });
            setStageProgress(progress);
        };

        calculateProgress();
    }, [data]);

    // Atualizar data quando muda o stage
    useEffect(() => {
        if (currentStage !== data.estado) {
            onChange({
                ...data,
                estado: currentStage,
                stageHistory,
                pipelineNotes: notes,
                estimatedDays
            });
        }
    }, [currentStage]);

    // Obter índice do stage atual
    const getStageIndex = (stage) => {
        const stages = Object.keys(PIPELINE_STAGES);
        return stages.indexOf(stage);
    };

    // Verificar se pode avançar para próximo stage
    const canMoveToStage = (targetStage) => {
        const currentIndex = getStageIndex(currentStage);
        const targetIndex = getStageIndex(targetStage);

        // Não pode pular stages (exceto para lost)
        if (targetStage !== OPPORTUNITY_STATES.CLOSED_LOST &&
            Math.abs(targetIndex - currentIndex) > 1) {
            return false;
        }

        // Verificar campos obrigatórios do stage atual
        const required = PIPELINE_STAGES[currentStage].requiredFields;
        const allFieldsComplete = required.every(field => {
            return data[field] &&
                (Array.isArray(data[field]) ? data[field].length > 0 : true);
        });

        return allFieldsComplete || targetStage === OPPORTUNITY_STATES.CLOSED_LOST;
    };

    // Mover para stage
    const moveToStage = (newStage) => {
        if (newStage === OPPORTUNITY_STATES.CLOSED_LOST) {
            setShowLostModal(true);
            return;
        }

        if (!canMoveToStage(newStage)) {
            alert('Complete todos os campos obrigatórios antes de avançar');
            return;
        }

        // Adicionar ao histórico
        const historyEntry = {
            from: currentStage,
            to: newStage,
            date: new Date().toISOString(),
            user: 'current_user', // Substituir com user real
            notes: notes
        };

        setStageHistory([...stageHistory, historyEntry]);
        setCurrentStage(newStage);
    };

    // Confirmar perda do negócio
    const confirmLost = () => {
        if (!lostReason) {
            alert('Por favor, indique o motivo da perda');
            return;
        }

        const historyEntry = {
            from: currentStage,
            to: OPPORTUNITY_STATES.CLOSED_LOST,
            date: new Date().toISOString(),
            user: 'current_user',
            reason: lostReason,
            notes: notes
        };

        setStageHistory([...stageHistory, historyEntry]);
        setCurrentStage(OPPORTUNITY_STATES.CLOSED_LOST);
        setShowLostModal(false);
    };

    // Calcular tempo em cada stage
    const calculateTimeInStage = (stage) => {
        const relevantHistory = stageHistory.filter(h => h.to === stage);
        if (relevantHistory.length === 0 && currentStage === stage) {
            // Stage atual - calcular desde criação ou último movimento
            const lastEntry = stageHistory[stageHistory.length - 1];
            const startDate = lastEntry ? new Date(lastEntry.date) : new Date(data.createdAt);
            const days = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
            return `${days} dias`;
        } else if (relevantHistory.length > 0) {
            const entry = relevantHistory[0];
            const nextEntry = stageHistory.find(h => h.from === stage);
            const endDate = nextEntry ? new Date(nextEntry.date) : new Date();
            const startDate = new Date(entry.date);
            const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
            return `${days} dias`;
        }
        return '-';
    };

    // Obter próximo stage
    const getNextStage = () => {
        const stages = Object.keys(PIPELINE_STAGES);
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex < stages.length - 3) { // Excluir closed_won e closed_lost
            return stages[currentIndex + 1];
        }
        return OPPORTUNITY_STATES.CLOSED_WON;
    };

    // Obter stage anterior
    const getPreviousStage = () => {
        const stages = Object.keys(PIPELINE_STAGES);
        const currentIndex = stages.indexOf(currentStage);
        if (currentIndex > 0 && currentStage !== OPPORTUNITY_STATES.CLOSED_WON &&
            currentStage !== OPPORTUNITY_STATES.CLOSED_LOST) {
            return stages[currentIndex - 1];
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Pipeline Visual */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ChevronRightIcon className="w-5 h-5 mr-2" />
                    Pipeline de Vendas
                </h3>

                {/* Stages */}
                <div className="flex items-center justify-between mb-6 overflow-x-auto">
                    {Object.entries(PIPELINE_STAGES).filter(([stage]) =>
                        stage !== OPPORTUNITY_STATES.CLOSED_LOST
                    ).map(([stage, config], index) => {
                        const isCurrent = stage === currentStage;
                        const isPast = getStageIndex(stage) < getStageIndex(currentStage);
                        const isLost = currentStage === OPPORTUNITY_STATES.CLOSED_LOST;
                        const Icon = config.icon;

                        return (
                            <React.Fragment key={stage}>
                                {/* Stage */}
                                <div
                                    className={`flex flex-col items-center cursor-pointer transition-all ${isLost ? 'opacity-50' : ''
                                        }`}
                                    onClick={() => !isLost && moveToStage(stage)}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center
                                        ${isCurrent ? config.bgColor :
                                            isPast ? 'bg-green-100' : 'bg-gray-100'}
                                        ${isCurrent ? config.borderColor :
                                            isPast ? 'border-green-300' : 'border-gray-300'}
                                        border-2 transition-all duration-200 hover:scale-110
                                    `}>
                                        <Icon className={`w-6 h-6 ${isCurrent ? config.textColor :
                                                isPast ? 'text-green-600' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${isCurrent ? config.textColor :
                                            isPast ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        {stageProgress[stage] || 0}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {calculateTimeInStage(stage)}
                                    </span>
                                </div>

                                {/* Connector */}
                                {index < Object.keys(PIPELINE_STAGES).length - 2 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${isPast || (isCurrent && index > 0) ?
                                            'bg-green-300' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Lost Indicator */}
                {currentStage === OPPORTUNITY_STATES.CLOSED_LOST && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                            <XMarkIcon className="w-5 h-5 text-red-500 mr-2" />
                            <span className="font-medium text-red-700">
                                Negócio Perdido
                            </span>
                        </div>
                        {stageHistory.find(h => h.to === OPPORTUNITY_STATES.CLOSED_LOST)?.reason && (
                            <p className="text-sm text-red-600 mt-2">
                                Motivo: {stageHistory.find(h => h.to === OPPORTUNITY_STATES.CLOSED_LOST).reason}
                            </p>
                        )}
                    </div>
                )}

                {/* Current Stage Details */}
                <div className={`rounded-lg p-4 ${PIPELINE_STAGES[currentStage].bgColor
                    }`}>
                    <h4 className={`font-medium mb-2 ${PIPELINE_STAGES[currentStage].textColor
                        }`}>
                        Fase Atual: {PIPELINE_STAGES[currentStage].label}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                        {PIPELINE_STAGES[currentStage].description}
                    </p>

                    {/* Actions for Current Stage */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">
                            Ações Recomendadas:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {PIPELINE_STAGES[currentStage].actions.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className="px-3 py-1 bg-white text-sm text-gray-700 rounded-md 
                                             border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Required Fields */}
                    {PIPELINE_STAGES[currentStage].requiredFields.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">
                                Campos Obrigatórios:
                            </h5>
                            <div className="space-y-1">
                                {PIPELINE_STAGES[currentStage].requiredFields.map(field => {
                                    const isComplete = data[field] &&
                                        (Array.isArray(data[field]) ? data[field].length > 0 : true);
                                    return (
                                        <div key={field} className="flex items-center text-sm">
                                            {isComplete ? (
                                                <CheckCircleSolid className="w-4 h-4 text-green-500 mr-2" />
                                            ) : (
                                                <ClockIcon className="w-4 h-4 text-yellow-500 mr-2" />
                                            )}
                                            <span className={isComplete ? 'text-green-700' : 'text-gray-600'}>
                                                {field}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        type="button"
                        onClick={() => getPreviousStage() && moveToStage(getPreviousStage())}
                        disabled={!getPreviousStage()}
                        className={`flex items-center px-4 py-2 rounded-lg border ${getPreviousStage()
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-2" />
                        Voltar
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => moveToStage(OPPORTUNITY_STATES.CLOSED_LOST)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg 
                                     hover:bg-red-600 transition-colors"
                        >
                            Marcar como Perdido
                        </button>

                        {currentStage !== OPPORTUNITY_STATES.CLOSED_WON && (
                            <button
                                type="button"
                                onClick={() => moveToStage(getNextStage())}
                                disabled={!canMoveToStage(getNextStage())}
                                className={`flex items-center px-4 py-2 rounded-lg ${canMoveToStage(getNextStage())
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Avançar
                                <ChevronRightIcon className="w-4 h-4 ml-2" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stage Statistics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Estatísticas do Pipeline
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {stageHistory.length}
                        </div>
                        <div className="text-sm text-gray-600">
                            Movimentos
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stageProgress[currentStage] || 0}%
                        </div>
                        <div className="text-sm text-gray-600">
                            Progresso Atual
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {calculateTimeInStage(currentStage)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Tempo na Fase
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {Object.values(estimatedDays).reduce((a, b) => a + b, 0)} dias
                        </div>
                        <div className="text-sm text-gray-600">
                            Duração Estimada
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Notas do Pipeline
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione notas sobre o progresso desta oportunidade..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Lost Reason Modal */}
            {showLostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            Marcar como Perdido
                        </h3>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motivo da Perda *
                        </label>
                        <select
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selecione um motivo</option>
                            <option value="Preço">Preço</option>
                            <option value="Concorrência">Concorrência</option>
                            <option value="Timing">Timing não adequado</option>
                            <option value="Requisitos mudaram">Requisitos mudaram</option>
                            <option value="Financiamento">Problemas de financiamento</option>
                            <option value="Desistência">Cliente desistiu</option>
                            <option value="Outro">Outro</option>
                        </select>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLostModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 
                                         rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLost}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg 
                                         hover:bg-red-600"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineTab;