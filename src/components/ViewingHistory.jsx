// components/ViewingHistory.jsx - ENHANCED VERSION
import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon as StarOutline,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const ViewingHistory = ({ viewings = [], onEditViewing = null }) => {
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

  const getNextStepIcon = (step) => {
    const map = {
      another_viewing: '🔄',
      time_to_think: '🤔',
      make_offer: '💰',
      not_interested: '❌'
    };
    return map[step] || '';
  };

  const getAspectEmoji = (rating) => {
    const map = {
      perfect: '✨',
      good: '👍',
      acceptable: '👌',
      poor: '👎'
    };
    return map[rating] || '';
  };

  const getAspectLabel = (rating) => {
    const map = {
      perfect: 'Perfeito',
      good: 'Bom',
      acceptable: 'Aceitável',
      poor: 'Fraco'
    };
    return map[rating] || rating;
  };

  const getPriceEmoji = (rating) => {
    const map = {
      great_value: '💎',
      fair: '👌',
      expensive: '💰',
      overpriced: '🚫'
    };
    return map[rating] || '';
  };

  const getPriceLabel = (rating) => {
    const map = {
      great_value: 'Excelente Negócio',
      fair: 'Justo',
      expensive: 'Caro',
      overpriced: 'Sobrevalorizado'
    };
    return map[rating] || rating;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || '';
  };

  const renderStars = (level) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <span key={value}>
            {value <= level ? (
              <StarSolid className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarOutline className="w-4 h-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {level}/10
        </span>
      </div>
    );
  };

  if (viewings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
        <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">Nenhuma visita registada ainda</p>
        <p className="text-sm mt-2">As visitas aparecerão aqui quando forem adicionadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewings.map((viewing, index) => {
        const impressionColor = getImpressionColor(viewing.feedback?.overallImpression);
        const nextStepColor = getNextStepColor(viewing.followUp?.clientWants);
        
        return (
          <div
            key={viewing.id || index}
            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-indigo-300"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r from-${impressionColor}-50 to-${impressionColor}-100 p-4 border-b border-${impressionColor}-200`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`p-3 bg-${impressionColor}-500 rounded-xl text-white`}>
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getImpressionEmoji(viewing.feedback?.overallImpression)}</span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {getImpressionLabel(viewing.feedback?.overallImpression)}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {formatDate(viewing.date)}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {formatTime(viewing.time)} ({viewing.duration || 30} min)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${impressionColor}-100 text-${impressionColor}-800`}>
                    {getTypeLabel(viewing.type)}
                  </span>
                  {onEditViewing && (
                    <button
                      onClick={() => onEditViewing(viewing)}
                      className="ml-2 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Interest Level */}
              <div className="pb-4 border-b">
                <p className="text-sm font-medium text-gray-700 mb-2">Nível de Interesse</p>
                {renderStars(viewing.feedback?.interestLevel || 0)}
              </div>

              {/* Feedback Lists */}
              {(viewing.feedback?.positives?.length > 0 || 
                viewing.feedback?.negatives?.length > 0 || 
                viewing.feedback?.questions?.length > 0) && (
                <div className="space-y-3">
                  {/* Positives */}
                  {viewing.feedback?.positives?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                        Pontos Positivos
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewing.feedback.positives.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                          >
                            ✅ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negatives */}
                  {viewing.feedback?.negatives?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <XCircleIcon className="w-4 h-4 mr-1 text-red-600" />
                        Preocupações
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewing.feedback.negatives.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                          >
                            ❌ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {viewing.feedback?.questions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1 text-blue-600" />
                        Questões Levantadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewing.feedback.questions.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            ❓ {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aspect Ratings */}
              {(viewing.feedback?.layout || viewing.feedback?.condition || 
                viewing.feedback?.location || viewing.feedback?.price) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Avaliação por Aspeto</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewing.feedback?.layout && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Layout:</span>
                        <span className="text-sm font-medium">
                          {getAspectEmoji(viewing.feedback.layout)} {getAspectLabel(viewing.feedback.layout)}
                        </span>
                      </div>
                    )}
                    {viewing.feedback?.condition && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className="text-sm font-medium">
                          {getAspectEmoji(viewing.feedback.condition)} {getAspectLabel(viewing.feedback.condition)}
                        </span>
                      </div>
                    )}
                    {viewing.feedback?.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Localização:</span>
                        <span className="text-sm font-medium">
                          {getAspectEmoji(viewing.feedback.location)} {getAspectLabel(viewing.feedback.location)}
                        </span>
                      </div>
                    )}
                    {viewing.feedback?.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Preço/Valor:</span>
                        <span className="text-sm font-medium">
                          {getPriceEmoji(viewing.feedback.price)} {getPriceLabel(viewing.feedback.price)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {viewing.followUp?.clientWants && (
                <div className={`bg-${nextStepColor}-50 border-2 border-${nextStepColor}-200 rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 flex items-center">
                      <ArrowRightIcon className="w-4 h-4 mr-1" />
                      Próximo Passo
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${nextStepColor}-100 text-${nextStepColor}-800`}>
                      <span className="mr-1">{getNextStepIcon(viewing.followUp.clientWants)}</span>
                      {getNextStepLabel(viewing.followUp.clientWants)}
                    </span>
                  </div>
                  {viewing.followUp.scheduledFor && (
                    <p className="text-xs text-gray-600 mt-1">
                      📅 Agendado para: {formatDate(viewing.followUp.scheduledFor)}
                    </p>
                  )}
                  {viewing.followUp.nextSteps && (
                    <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border">
                      {viewing.followUp.nextSteps}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewing.notes && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">📝 Notas: </span>
                    {viewing.notes}
                  </p>
                </div>
              )}

              {/* Attendees Footer */}
              <div className="flex items-center text-xs text-gray-500 pt-3 border-t">
                <UserGroupIcon className="w-4 h-4 mr-1" />
                <div className="flex flex-wrap gap-2">
                  {viewing.attendees?.buyers?.map((buyer, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                      👤 {buyer}
                    </span>
                  ))}
                  {viewing.attendees?.agentPresent && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                      🏢 Agente
                    </span>
                  )}
                  {viewing.attendees?.sellerPresent && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      🤝 Vendedor
                    </span>
                  )}
                  {viewing.attendees?.others?.map((person, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                      👥 {person}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ViewingHistory;