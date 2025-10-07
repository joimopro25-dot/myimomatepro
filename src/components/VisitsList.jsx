/**
 * VISITS LIST COMPONENT - MyImoMatePro
 * Enhanced with Edit functionality
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
  ExclamationCircleIcon,
  EyeIcon,
  ChevronRightIcon,
  PencilIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

export default function VisitsList({ 
  viewings = [], 
  onComplete, 
  onCancel, 
  onReschedule,
  onViewDetails,
  onEditVisit // New prop for editing visits
}) {
  const [showActionMenu, setShowActionMenu] = React.useState(null);

  // Sort visits by date (newest first)
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

  const getInterestBadge = (level) => {
    const badges = {
      high: { color: 'text-green-600', label: 'Alto' },
      medium: { color: 'text-yellow-600', label: 'Médio' },
      low: { color: 'text-red-600', label: 'Baixo' }
    };
    const badge = badges[level];
    return badge ? (
      <span className={`font-semibold ${badge.color}`}>{badge.label}</span>
    ) : null;
  };

  const getApprovalStatus = (viewing) => {
    if (viewing.ownerApproved && viewing.buyerApproved) {
      return (
        <span className="text-xs text-green-600 font-medium flex items-center">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Totalmente Confirmado
        </span>
      );
    } else if (viewing.ownerApproved) {
      return (
        <span className="text-xs text-blue-600 font-medium">
          ✓ Proprietário Confirmou
        </span>
      );
    } else if (viewing.buyerApproved) {
      return (
        <span className="text-xs text-indigo-600 font-medium">
          ✓ Comprador Confirmou
        </span>
      );
    }
    return null;
  };

  const ActionMenu = ({ viewing, position }) => {
    const isUpcoming = viewing.status === 'scheduled' && 
      new Date(viewing.scheduledDate || viewing.createdAt) >= new Date();

    return (
      <div 
        className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
        style={{ 
          position: 'absolute',
          right: position === 'top' ? '0' : 'auto',
          top: position === 'top' ? '32px' : 'auto',
          bottom: position === 'bottom' ? '32px' : 'auto'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails && onViewDetails(viewing);
            setShowActionMenu(null);
          }}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          Ver Detalhes
        </button>
        
        {onEditVisit && viewing.status === 'scheduled' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditVisit(viewing);
              setShowActionMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Editar Visita
          </button>
        )}

        {isUpcoming && onComplete && (
          <>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(viewing.id);
                setShowActionMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Marcar Concluída
            </button>
          </>
        )}

        {isUpcoming && onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(viewing.id);
              setShowActionMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <XCircleIcon className="w-4 h-4 mr-2" />
            Cancelar Visita
          </button>
        )}
      </div>
    );
  };

  const ViewingCard = ({ viewing, index }) => {
    const needsFeedback = viewing.status === 'scheduled' && 
      new Date(viewing.scheduledDate || viewing.createdAt) < new Date();
    
    const isMenuOpen = showActionMenu === viewing.id;
    const cardPosition = index < 2 ? 'top' : 'bottom';

    return (
      <div 
        className={`
          bg-white rounded-lg p-4 border transition-all cursor-pointer relative
          ${viewing.status === 'cancelled' ? 'border-gray-200 bg-gray-50' :
            viewing.status === 'completed' ? 'border-green-200 hover:border-green-300' :
            needsFeedback ? 'border-yellow-200 hover:border-yellow-300' :
            'border-gray-200 hover:border-blue-300'}
          hover:shadow-md
        `}
      >
        {/* Main card content - clickable area */}
        <div onClick={() => onViewDetails && onViewDetails(viewing)}>
          {/* Header with Date and Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${
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
              <div className="flex-1">
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
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(viewing.status, viewing.scheduledDate || viewing.createdAt)}
                  {getApprovalStatus(viewing)}
                </div>
              </div>
            </div>

            {/* Action Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionMenu(isMenuOpen ? null : viewing.id);
              }}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            </button>

            {/* Action Menu Dropdown */}
            {isMenuOpen && (
              <ActionMenu viewing={viewing} position={cardPosition} />
            )}
          </div>

          {/* Visitor and Agent Info */}
          <div className="space-y-2 pl-11">
            {/* Buyer Info */}
            {viewing.visitorName && (
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center text-gray-600">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium">Comprador:</span> {viewing.visitorName}
                </span>
                {viewing.visitorPhone && (
                  <span className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    {viewing.visitorPhone}
                  </span>
                )}
              </div>
            )}

            {/* Agent Info */}
            {viewing.buyerAgent?.name && (
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center text-gray-600">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span className="font-medium">Consultor:</span> {viewing.buyerAgent.name}
                </span>
                {viewing.buyerAgent.phone && (
                  <span className="flex items-center text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-1" />
                    {viewing.buyerAgent.phone}
                  </span>
                )}
              </div>
            )}

            {/* Notes Preview */}
            {viewing.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 italic truncate">"{viewing.notes}"</p>
              </div>
            )}

            {/* Feedback Preview (for completed visits) */}
            {viewing.status === 'completed' && viewing.feedback && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                {viewing.feedback.interestLevel && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Interesse:</span>
                    {getInterestBadge(viewing.feedback.interestLevel)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions for Past Visits Needing Feedback */}
        {needsFeedback && (
          <div className="mt-3 pl-11 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 font-medium">
                  Adicionar Feedback
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(viewing.id);
                  }}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Completar
                </button>
                {onEditVisit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditVisit(viewing);
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
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

  // Click outside to close menu
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showActionMenu) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActionMenu]);

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
          {groupedViewings.upcoming.map((viewing, index) => (
            <ViewingCard key={viewing.id} viewing={viewing} index={index} />
          ))}
        </div>
      )}

      {/* Past visits needing feedback */}
      {groupedViewings.past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider">
            ⚠️ Pendente Feedback ({groupedViewings.past.length})
          </h3>
          {groupedViewings.past.map((viewing, index) => (
            <ViewingCard key={viewing.id} viewing={viewing} index={index + groupedViewings.upcoming.length} />
          ))}
        </div>
      )}

      {/* Completed Visits */}
      {groupedViewings.completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Histórico de Visitas Concluídas ({groupedViewings.completed.length})
          </h3>
          {groupedViewings.completed.map((viewing, index) => (
            <ViewingCard key={viewing.id} viewing={viewing} index={index + groupedViewings.upcoming.length + groupedViewings.past.length} />
          ))}
        </div>
      )}

      {/* Cancelled/No-Show Visits */}
      {(groupedViewings.cancelled.length > 0 || groupedViewings.noShow.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Outras ({groupedViewings.cancelled.length + groupedViewings.noShow.length})
          </h3>
          {[...groupedViewings.cancelled, ...groupedViewings.noShow].map((viewing, index) => (
            <ViewingCard key={viewing.id} viewing={viewing} index={index + stats.total - groupedViewings.cancelled.length - groupedViewings.noShow.length} />
          ))}
        </div>
      )}
    </div>
  );
}