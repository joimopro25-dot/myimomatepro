// components/ViewingHistory.jsx
import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon as StarOutline,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const ViewingHistory = ({ viewings = [] }) => {
  const getImpressionEmoji = (impression) => {
    const map = {
      loved: '❤️',
      liked: '😊',
      neutral: '😐',
      disliked: '😕'
    };
    return map[impression] || '😐';
  };

  const getImpressionLabel = (impression) => {
    const map = {
      loved: 'Adorou',
      liked: 'Gostou',
      neutral: 'Neutro',
      disliked: 'Não Gostou'
    };
    return map[impression] || impression;
  };

  const getImpressionColor = (impression) => {
    const map = {
      loved: 'green',
      liked: 'blue',
      neutral: 'yellow',
      disliked: 'red'
    };
    return map[impression] || 'gray';
  };

  const getTypeLabel = (type) => {
    const map = {
      first_visit: 'Primeira Visita',
      second_visit: 'Segunda Visita',
      technical_inspection: 'Inspeção Técnica',
      final_visit: 'Visita Final'
    };
    return map[type] || type;
  };

  const getNextStepLabel = (step) => {
    const map = {
      another_viewing: 'Quer Ver Novamente',
      time_to_think: 'Precisa Pensar',
      make_offer: 'Quer Fazer Proposta',
      not_interested: 'Não Interessado'
    };
    return map[step] || step;
  };

  const getNextStepColor = (step) => {
    const map = {
      another_viewing: 'blue',
      time_to_think: 'yellow',
      make_offer: 'green',
      not_interested: 'red'
    };
    return map[step] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || '';
  };

  if (viewings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Nenhuma visita registada ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewings.map((viewing, index) => {
        const impressionColor = getImpressionColor(viewing.feedback?.overallImpression);
        const nextStepColor = getNextStepColor(viewing.followUp?.clientWants);
        
        return (
          <div
            key={viewing.id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full bg-${impressionColor}-100 flex items-center justify-center text-2xl`}>
                  {getImpressionEmoji(viewing.feedback?.overallImpression)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {getTypeLabel(viewing.type)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-${impressionColor}-100 text-${impressionColor}-800`}>
                      {getImpressionLabel(viewing.feedback?.overallImpression)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(viewing.date)}</span>
                    <ClockIcon className="w-4 h-4 ml-2" />
                    <span>{formatTime(viewing.time)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{viewing.duration} min</span>
                  </div>
                </div>
              </div>

              {/* Interest Stars */}
              <div className="flex flex-col items-end">
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    i < (viewing.feedback?.interestLevel || 0) ? (
                      <StarSolid key={i} className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <StarOutline key={i} className="w-4 h-4 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-xs text-gray-600 mt-1">
                  Interesse: {viewing.feedback?.interestLevel || 0}/10
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              {/* Positives */}
              {viewing.feedback?.positives?.length > 0 && (
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                    Pontos Positivos
                  </div>
                  <ul className="space-y-1">
                    {viewing.feedback.positives.map((positive, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-600 mr-1">✓</span>
                        {positive}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negatives */}
              {viewing.feedback?.negatives?.length > 0 && (
                <div>
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <XCircleIcon className="w-4 h-4 mr-1 text-red-600" />
                    Pontos Negativos
                  </div>
                  <ul className="space-y-1">
                    {viewing.feedback.negatives.map((negative, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-red-600 mr-1">✗</span>
                        {negative}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Questions */}
            {viewing.feedback?.questions?.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1 text-blue-600" />
                  Questões Levantadas
                </div>
                <ul className="space-y-1">
                  {viewing.feedback.questions.map((question, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-600 mr-1">?</span>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Aspect Ratings */}
            {(viewing.feedback?.layout || viewing.feedback?.condition || viewing.feedback?.location || viewing.feedback?.price) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {viewing.feedback.layout && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Layout: {viewing.feedback.layout}
                  </span>
                )}
                {viewing.feedback.condition && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Estado: {viewing.feedback.condition}
                  </span>
                )}
                {viewing.feedback.location && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Localização: {viewing.feedback.location}
                  </span>
                )}
                {viewing.feedback.price && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Preço: {viewing.feedback.price}
                  </span>
                )}
              </div>
            )}

            {/* Follow-up */}
            {viewing.followUp?.clientWants && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowRightIcon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Próximo Passo:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs bg-${nextStepColor}-100 text-${nextStepColor}-800`}>
                      {getNextStepLabel(viewing.followUp.clientWants)}
                    </span>
                  </div>
                  {viewing.followUp.scheduledFor && (
                    <span className="text-xs text-gray-600">
                      Agendado: {formatDate(viewing.followUp.scheduledFor)}
                    </span>
                  )}
                </div>
                {viewing.followUp.nextSteps && (
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    {viewing.followUp.nextSteps}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            {viewing.notes && (
              <div className="border-t pt-3 mt-3">
                <p className="text-sm text-gray-600 italic">{viewing.notes}</p>
              </div>
            )}

            {/* Attendees Footer */}
            <div className="flex items-center text-xs text-gray-500 mt-3 pt-3 border-t">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              {viewing.attendees?.agentPresent && <span className="mr-2">Agente presente</span>}
              {viewing.attendees?.sellerPresent && <span className="mr-2">Vendedor presente</span>}
              {viewing.attendees?.buyers?.length > 0 && (
                <span>Compradores: {viewing.attendees.buyers.join(', ')}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ViewingHistory;