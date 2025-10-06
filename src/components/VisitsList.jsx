/**
 * VISITS LIST COMPONENT - MyImoMatePro
 * Works with array-based viewings structure
 */

import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function VisitsList({ viewings = [], onComplete, onCancel, onReschedule }) {
  // Sort visits by date (newest first), handling the ID format
  const sortedViewings = [...viewings].sort((a, b) => {
    const dateA = new Date(a.scheduledDate || a.createdAt);
    const dateB = new Date(b.scheduledDate || b.createdAt);
    return dateB - dateA;
  });

  // Group visits by status
  const groupedViewings = {
    upcoming: sortedViewings.filter(v => {
      const visitDate = new Date(v.scheduledDate || v.createdAt);
      return v.status === 'scheduled' && visitDate >= new Date();
    }),
    past: sortedViewings.filter(v => {
      const visitDate = new Date(v.scheduledDate || v.createdAt);
      return v.status === 'scheduled' && visitDate < new Date();
    }),
    completed: sortedViewings.filter(v => v.status === 'completed'),
    cancelled: sortedViewings.filter(v => v.status === 'cancelled'),
    noShow: sortedViewings.filter(v => v.status === 'no_show')
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getStatusBadge = (status, scheduledDate) => {
    const isPast = new Date(scheduledDate || new Date()) < new Date();
    
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Concluída
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Cancelada
          </span>
        );
      case 'no_show':
        return (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            Não Compareceu
          </span>
        );
      case 'scheduled':
        if (isPast) {
          return (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              Pendente Feedback
            </span>
          );
        }
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Agendada
          </span>
        );
      default:
        return null;
    }
  };

  const getInterestLevelBadge = (level) => {
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-red-100 text-red-700'
    };
    const labels = {
      high: 'Alto Interesse',
      medium: 'Interesse Médio',
      low: 'Baixo Interesse'
    };

    if (!level) return null;

    return (
      <span className={`px-2 py-1 ${colors[level] || colors.medium} text-xs font-medium rounded-full`}>
        {labels[level] || 'Interesse Médio'}
      </span>
    );
  };

  const ViewingCard = ({ viewing }) => {
    const visitDate = new Date(viewing.scheduledDate || viewing.createdAt);
    const isPast = visitDate < new Date();
    const needsFeedback = viewing.status === 'scheduled' && isPast;

    return (
      <div className={`border rounded-lg p-4 ${
        viewing.status === 'cancelled' ? 'bg-gray-50 opacity-75' :
        viewing.status === 'completed' ? 'bg-green-50' :
        needsFeedback ? 'bg-yellow-50 border-yellow-300' :
        'bg-white'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              viewing.status === 'completed' ? 'bg-green-100' :
              viewing.status === 'cancelled' ? 'bg-gray-100' :
              needsFeedback ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              <CalendarIcon className={`w-5 h-5 ${
                viewing.status === 'completed' ? 'text-green-600' :
                viewing.status === 'cancelled' ? 'text-gray-600' :
                needsFeedback ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-gray-900">
                  {formatDate(viewing.scheduledDate || viewing.createdAt)}
                </p>
                {viewing.scheduledTime && (
                  <span className="text-gray-600 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {formatTime(viewing.scheduledTime)}
                  </span>
                )}
              </div>
              {getStatusBadge(viewing.status, viewing.scheduledDate || viewing.createdAt)}
            </div>
          </div>
        </div>

        {/* Visitor Info */}
        {viewing.visitorName && (
          <div className="mb-3 pl-11">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-gray-600">
                <UserIcon className="w-4 h-4 mr-1" />
                {viewing.visitorName}
              </span>
              {viewing.visitorPhone && (
                <span className="flex items-center text-gray-600">
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  {viewing.visitorPhone}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {viewing.notes && (
          <div className="mb-3 pl-11">
            <p className="text-sm text-gray-600 italic">"{viewing.notes}"</p>
          </div>
        )}

        {/* Feedback Section (for completed visits) */}
        {viewing.status === 'completed' && viewing.feedback && (
          <div className="mt-3 pt-3 pl-11 border-t border-gray-200">
            <div className="space-y-2">
              {viewing.feedback.interestLevel && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Interesse:</span>
                  {getInterestLevelBadge(viewing.feedback.interestLevel)}
                </div>
              )}
              {viewing.feedback.feedback && (
                <div className="flex items-start space-x-2">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700">{viewing.feedback.feedback}</p>
                </div>
              )}
              {viewing.feedback.nextSteps && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Próximos passos:</span> {viewing.feedback.nextSteps}
                </div>
              )}
              {viewing.feedback.willingToPay && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Disposto a pagar:</span> {viewing.feedback.willingToPay}
                </div>
              )}
              {viewing.feedback.concerns && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Preocupações:</span> {viewing.feedback.concerns}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 pl-11">
          {viewing.status === 'scheduled' && !isPast && (
            <div className="flex space-x-2">
              <button
                onClick={() => onComplete(viewing.id)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Marcar como Concluída
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onCancel(viewing.id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cancelar
              </button>
            </div>
          )}
          {needsFeedback && (
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
              <button
                onClick={() => onComplete(viewing.id)}
                className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
              >
                Adicionar Feedback da Visita
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate statistics
  const stats = {
    total: sortedViewings.length,
    completed: groupedViewings.completed.length,
    upcoming: groupedViewings.upcoming.length,
    cancelled: groupedViewings.cancelled.length,
    noShow: groupedViewings.noShow.length
  };

  if (sortedViewings.length === 0) {
    return (
      <div className="text-center py-8">
        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Nenhuma visita agendada</p>
        <p className="text-sm text-gray-400 mt-1">
          Clique em "Agendar Visita" para adicionar a primeira
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Bar */}
      {stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              <p className="text-xs text-gray-600">Próximas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Concluídas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-xs text-gray-600">Canceladas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.noShow}</p>
              <p className="text-xs text-gray-600">Não Show</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Visits */}
      {groupedViewings.upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Próximas Visitas ({groupedViewings.upcoming.length})
          </h3>
          {groupedViewings.upcoming.map(viewing => (
            <ViewingCard key={viewing.id} viewing={viewing} />
          ))}
        </div>
      )}

      {/* Past visits needing feedback */}
      {groupedViewings.past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider">
            ⚠️ Pendente Feedback ({groupedViewings.past.length})
          </h3>
          {groupedViewings.past.map(viewing => (
            <ViewingCard key={viewing.id} viewing={viewing} />
          ))}
        </div>
      )}

      {/* Completed Visits */}
      {groupedViewings.completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Histórico de Visitas Concluídas ({groupedViewings.completed.length})
          </h3>
          {groupedViewings.completed.map(viewing => (
            <ViewingCard key={viewing.id} viewing={viewing} />
          ))}
        </div>
      )}

      {/* Cancelled/No-Show Visits */}
      {(groupedViewings.cancelled.length > 0 || groupedViewings.noShow.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Outras ({groupedViewings.cancelled.length + groupedViewings.noShow.length})
          </h3>
          {[...groupedViewings.cancelled, ...groupedViewings.noShow].map(viewing => (
            <ViewingCard key={viewing.id} viewing={viewing} />
          ))}
        </div>
      )}
    </div>
  );
}