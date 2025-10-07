/**
 * VIEW VISIT MODAL - MyImoMatePro
 * Modal for viewing complete visit details with ALL information
 */

import React from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  ArrowRightIcon,
  EyeIcon,
  EnvelopeIcon,
  UserGroupIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function ViewVisitModal({ isOpen, onClose, visit }) {
  if (!isOpen || !visit) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Agendada' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluída' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelada' },
      no_show: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Não Compareceu' }
    };
    const badge = badges[status] || badges.scheduled;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-sm font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  // Get interest level badge
  const getInterestBadge = (level) => {
    const levels = {
      high: { bg: 'bg-green-100', text: 'text-green-700', label: 'Alto Interesse' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Interesse Médio' },
      low: { bg: 'bg-red-100', text: 'text-red-700', label: 'Baixo Interesse' }
    };
    const badge = levels[level];
    if (!badge) return null;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-sm font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-6 h-6 text-red-600" />;
      case 'no_show':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />;
      default:
        return <CalendarIcon className="w-6 h-6 text-blue-600" />;
    }
  };

  // Get approval status display
  const getApprovalStatus = () => {
    if (visit.ownerApproved && visit.buyerApproved) {
      return { text: 'Totalmente Confirmado', color: 'text-green-600 bg-green-50' };
    } else if (visit.ownerApproved && !visit.buyerApproved) {
      return { text: 'Aprovado pelo Proprietário', color: 'text-blue-600 bg-blue-50' };
    } else if (!visit.ownerApproved && visit.buyerApproved) {
      return { text: 'Aprovado pelo Comprador', color: 'text-indigo-600 bg-indigo-50' };
    } else {
      return { text: 'Pendente Aprovações', color: 'text-gray-600 bg-gray-50' };
    }
  };

  // Get reminder label
  const getReminderLabel = (value) => {
    const labels = {
      '1h': '1 hora antes',
      '2h': '2 horas antes',
      '1d': '1 dia antes',
      '2d': '2 dias antes',
      'custom': 'personalizado',
      'none': 'Sem lembrete'
    };
    return labels[value] || value;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(visit.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhes da Visita
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: {visit.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status and Date Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                  {getStatusBadge(visit.status)}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Data e Hora</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{formatDate(visit.scheduledDate || visit.createdAt)}</span>
                    {visit.scheduledTime && (
                      <>
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{visit.scheduledTime}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estado de Aprovação</label>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatus().color} inline-block`}>
                    {getApprovalStatus().text}
                  </div>
                </div>
              </div>
              
              {/* Individual Approval Status */}
              {(visit.ownerApproved || visit.buyerApproved) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {visit.ownerApproved && (
                      <div className="flex items-center text-sm text-green-600">
                        <HomeIcon className="w-4 h-4 mr-1" />
                        Proprietário Aprovado
                      </div>
                    )}
                    {visit.buyerApproved && (
                      <div className="flex items-center text-sm text-green-600">
                        <UserIcon className="w-4 h-4 mr-1" />
                        Comprador Aprovado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visitor Information */}
            {(visit.visitorName || visit.visitorPhone || visit.visitorEmail) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Informações do Comprador
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visit.visitorName && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                        <p className="text-gray-900 font-medium">{visit.visitorName}</p>
                      </div>
                    )}
                    {visit.visitorPhone && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Telefone</label>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{visit.visitorPhone}</p>
                        </div>
                      </div>
                    )}
                    {visit.visitorEmail && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{visit.visitorEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Buyer's Agent Information */}
            {visit.buyerAgent && (visit.buyerAgent.name || visit.buyerAgent.phone || visit.buyerAgent.email) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Consultor do Comprador
                </h4>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visit.buyerAgent.name && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Consultor</label>
                        <p className="text-gray-900 font-medium">{visit.buyerAgent.name}</p>
                      </div>
                    )}
                    {visit.buyerAgent.phone && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{visit.buyerAgent.phone}</p>
                        </div>
                      </div>
                    )}
                    {visit.buyerAgent.email && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                        <div className="flex items-center space-x-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-900 font-medium">{visit.buyerAgent.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {visit.notes && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-2" />
                  Notas da Visita
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{visit.notes}"</p>
                </div>
              </div>
            )}

            {/* Communication Status */}
            {visit.communications && Object.values(visit.communications).some(v => v) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-2" />
                  Comunicações Enviadas
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {visit.communications.buyerWhatsApp && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        WhatsApp enviado ao comprador
                      </div>
                    )}
                    {visit.communications.buyerEmail && (
                      <div className="flex items-center text-sm text-blue-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Email enviado ao comprador
                      </div>
                    )}
                    {visit.communications.buyerSMS && (
                      <div className="flex items-center text-sm text-purple-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        SMS enviado ao comprador
                      </div>
                    )}
                    {visit.communications.agentWhatsApp && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        WhatsApp enviado ao consultor
                      </div>
                    )}
                    {visit.communications.agentEmail && (
                      <div className="flex items-center text-sm text-blue-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Email enviado ao consultor
                      </div>
                    )}
                    {visit.communications.agentSMS && (
                      <div className="flex items-center text-sm text-purple-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        SMS enviado ao consultor
                      </div>
                    )}
                    {visit.communications.ownerWhatsApp && (
                      <div className="flex items-center text-sm text-green-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        WhatsApp enviado ao proprietário
                      </div>
                    )}
                    {visit.communications.ownerEmail && (
                      <div className="flex items-center text-sm text-blue-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Email enviado ao proprietário
                      </div>
                    )}
                    {visit.communications.ownerSMS && (
                      <div className="flex items-center text-sm text-purple-600">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        SMS enviado ao proprietário
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reminders Configuration */}
            {visit.reminders && (visit.reminders.owner !== 'none' || visit.reminders.buyer !== 'none' || visit.reminders.agent !== 'none') && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <BellIcon className="w-4 h-4 mr-2" />
                  Lembretes Configurados
                </h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="space-y-2">
                    {visit.reminders.owner && visit.reminders.owner !== 'none' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <BellIcon className="w-4 h-4 mr-2 text-yellow-600" />
                        <HomeIcon className="w-4 h-4 mr-1 text-gray-500" />
                        Proprietário: lembrete {getReminderLabel(visit.reminders.owner)}
                      </div>
                    )}
                    {visit.reminders.buyer && visit.reminders.buyer !== 'none' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <BellIcon className="w-4 h-4 mr-2 text-yellow-600" />
                        <UserIcon className="w-4 h-4 mr-1 text-gray-500" />
                        Comprador: lembrete {getReminderLabel(visit.reminders.buyer)}
                      </div>
                    )}
                    {visit.reminders.agent && visit.reminders.agent !== 'none' && (
                      <div className="flex items-center text-sm text-gray-700">
                        <BellIcon className="w-4 h-4 mr-2 text-yellow-600" />
                        <UserGroupIcon className="w-4 h-4 mr-1 text-gray-500" />
                        Consultor: lembrete {getReminderLabel(visit.reminders.agent)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section (for completed visits) */}
            {visit.status === 'completed' && visit.feedback && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Feedback da Visita
                </h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                  {/* Interest Level */}
                  {visit.feedback.interestLevel && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">Nível de Interesse</label>
                      {getInterestBadge(visit.feedback.interestLevel)}
                    </div>
                  )}

                  {/* Feedback Comments */}
                  {visit.feedback.feedback && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Comentários</label>
                      <p className="text-gray-700">{visit.feedback.feedback}</p>
                    </div>
                  )}

                  {/* Two Column Layout for Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Willing to Pay */}
                    {visit.feedback.willingToPay && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Disposto a Pagar</label>
                        <div className="flex items-center space-x-2">
                          <CurrencyEuroIcon className="w-4 h-4 text-green-600" />
                          <p className="text-gray-900 font-semibold">{visit.feedback.willingToPay}</p>
                        </div>
                      </div>
                    )}

                    {/* Follow-up Date */}
                    {visit.feedback.followUpDate && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Data de Follow-up</label>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                          <p className="text-gray-900 font-medium">
                            {new Date(visit.feedback.followUpDate).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Concerns */}
                  {visit.feedback.concerns && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Preocupações</label>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-gray-700 text-sm">{visit.feedback.concerns}</p>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {visit.feedback.nextSteps && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center">
                        <ArrowRightIcon className="w-3 h-3 mr-1" />
                        Próximos Passos
                      </label>
                      <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
                        <p className="text-gray-700 font-medium">{visit.feedback.nextSteps}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Criada em: {new Date(visit.createdAt || visit.id.split('_')[1]).toLocaleString('pt-PT')}
                </span>
                {visit.updatedAt && (
                  <span>
                    Última atualização: {new Date(visit.updatedAt).toLocaleString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}