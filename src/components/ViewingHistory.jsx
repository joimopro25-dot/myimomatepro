// components/ViewingHistory.jsx - ENHANCED VERSION
import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { VIEWING_TYPES, IMPRESSION_OPTIONS, NEXT_STEPS } from '../models/buyerDealModel';

const ViewingHistory = ({ viewings = [], onEdit, onComplete }) => {
  if (!viewings || viewings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Ainda não há visitas registadas</p>
        <p className="text-sm mt-1">Agende ou registe a primeira visita</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.slice(0, 5);
  };

  const getViewingTypeLabel = (type) => {
    const viewingType = VIEWING_TYPES.find(t => t.value === type);
    return viewingType?.label || type;
  };

  const getImpressionData = (impression) => {
    return IMPRESSION_OPTIONS.find(opt => opt.value === impression);
  };

  const getNextStepData = (step) => {
    return NEXT_STEPS.find(s => s.value === step);
  };

  const sortedViewings = [...viewings].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedViewings.map((viewing) => {
        const isScheduled = viewing.status === 'scheduled';
        const impressionData = getImpressionData(viewing.feedback?.overallImpression);
        const nextStepData = getNextStepData(viewing.followUp?.clientWants);
        
        return (
          <div
            key={viewing.id}
            className={`border rounded-lg p-4 transition-all ${
              isScheduled
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {isScheduled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📅 Agendada
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Concluída
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {getViewingTypeLabel(viewing.type)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(viewing.date)}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTime(viewing.time)}
                  </div>
                  {viewing.duration && (
                    <span className="text-gray-400">
                      {viewing.duration} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {isScheduled && onComplete && (
                  <button
                    onClick={() => onComplete(viewing)}
                    className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Completar
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(viewing)}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>
            </div>

            {viewing.attendees && (
              <div className="mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  <div className="flex flex-wrap gap-2">
                    {viewing.attendees.buyers?.map((buyer, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {buyer}
                      </span>
                    ))}
                    {viewing.attendees.agentPresent && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                        Agente
                      </span>
                    )}
                    {viewing.attendees.sellerPresent && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                        Vendedor
                      </span>
                    )}
                    {viewing.attendees.others?.map((other, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {other}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isScheduled && viewing.feedback && (
              <div className="border-t pt-3 mt-3 space-y-3">
                {impressionData && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {impressionData.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Interesse:</span>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {viewing.feedback.interestLevel}/10
                      </span>
                    </div>
                  </div>
                )}

                {(viewing.feedback.layout || viewing.feedback.condition || 
                  viewing.feedback.location || viewing.feedback.price) && (
                  <div className="grid grid-cols-4 gap-2">
                    {viewing.feedback.layout && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Layout</div>
                        <div className="text-sm font-medium capitalize">
                          {viewing.feedback.layout}
                        </div>
                      </div>
                    )}
                    {viewing.feedback.condition && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Estado</div>
                        <div className="text-sm font-medium capitalize">
                          {viewing.feedback.condition}
                        </div>
                      </div>
                    )}
                    {viewing.feedback.location && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Local</div>
                        <div className="text-sm font-medium capitalize">
                          {viewing.feedback.location}
                        </div>
                      </div>
                    )}
                    {viewing.feedback.price && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Preço</div>
                        <div className="text-sm font-medium capitalize">
                          {viewing.feedback.price}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {viewing.feedback.positives?.length > 0 && (
                    <div>
                      <div className="font-medium text-green-700 mb-1">👍 Positivos</div>
                      <ul className="space-y-0.5">
                        {viewing.feedback.positives.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {viewing.feedback.negatives?.length > 0 && (
                    <div>
                      <div className="font-medium text-red-700 mb-1">👎 Negativos</div>
                      <ul className="space-y-0.5">
                        {viewing.feedback.negatives.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {viewing.feedback.questions?.length > 0 && (
                  <div>
                    <div className="font-medium text-gray-700 mb-1 text-sm">❓ Questões</div>
                    <ul className="space-y-0.5">
                      {viewing.feedback.questions.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {nextStepData && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {nextStepData.icon} {nextStepData.label}
                    </span>
                    {viewing.followUp?.scheduledFor && (
                      <span className="text-xs text-gray-500">
                        • {formatDate(viewing.followUp.scheduledFor)}
                      </span>
                    )}
                  </div>
                )}

                {viewing.followUp?.nextSteps && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {viewing.followUp.nextSteps}
                  </div>
                )}
              </div>
            )}

            {viewing.notes && (
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-1" />
                {viewing.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ViewingHistory;