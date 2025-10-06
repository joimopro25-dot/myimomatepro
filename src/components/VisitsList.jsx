import { CalendarIcon, UserIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function VisitsList({ viewings = [], onComplete, onCancel }) {
  const scheduledVisits = viewings.filter(v => v.status === 'scheduled');
  const completedVisits = viewings.filter(v => v.status === 'completed');
  const cancelledVisits = viewings.filter(v => v.status === 'cancelled');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const VisitCard = ({ visit, showActions = false }) => {
    const getStatusBadge = (status) => {
      const styles = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
      };
      
      const labels = {
        scheduled: 'Agendada',
        completed: 'Concluída',
        cancelled: 'Cancelada'
      };

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
          {labels[status]}
        </span>
      );
    };

    const getInterestBadge = (level) => {
      const styles = {
        high: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-gray-100 text-gray-800'
      };
      
      const labels = {
        high: 'Alto Interesse',
        medium: 'Interesse Médio',
        low: 'Baixo Interesse'
      };

      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[level]}`}>
          {labels[level]}
        </span>
      );
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">
              {formatDate(visit.date)} às {visit.time}
            </span>
          </div>
          {getStatusBadge(visit.status)}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{visit.buyerName}</span>
          </div>
          
          {visit.buyerConsultant && (
            <div className="text-sm text-gray-600 pl-6">
              Consultor: {visit.buyerConsultant}
            </div>
          )}

          {visit.buyerDealId && (
            <div className="text-sm text-blue-600 pl-6">
              🔗 Vinculado ao negócio: {visit.buyerDealId}
            </div>
          )}

          {visit.notes && (
            <div className="text-sm text-gray-600 pl-6 italic">
              {visit.notes}
            </div>
          )}
        </div>

        {/* Feedback section for completed visits */}
        {visit.status === 'completed' && visit.feedback && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {visit.buyerInterestLevel && (
              <div className="mb-2">
                {getInterestBadge(visit.buyerInterestLevel)}
                {visit.likelyToOffer && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    ✓ Provável oferta
                  </span>
                )}
              </div>
            )}
            
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Feedback:</span> {visit.feedback}
            </p>
            
            {visit.concerns && visit.concerns.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Preocupações:</span> {visit.concerns.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Action buttons for scheduled visits */}
        {showActions && visit.status === 'scheduled' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => onComplete(visit.id)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Marcar como Concluída
            </button>
            <button
              onClick={() => onCancel(visit.id)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <XCircleIcon className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Visits */}
      {scheduledVisits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            Visitas Agendadas ({scheduledVisits.length})
          </h3>
          <div className="space-y-3">
            {scheduledVisits.map(visit => (
              <VisitCard key={visit.id} visit={visit} showActions={true} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Visits */}
      {completedVisits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            Visitas Concluídas ({completedVisits.length})
          </h3>
          <div className="space-y-3">
            {completedVisits.map(visit => (
              <VisitCard key={visit.id} visit={visit} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Visits */}
      {cancelledVisits.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircleIcon className="w-5 h-5 text-red-600" />
            Visitas Canceladas ({cancelledVisits.length})
          </h3>
          <div className="space-y-3">
            {cancelledVisits.map(visit => (
              <VisitCard key={visit.id} visit={visit} showActions={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {viewings.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Nenhuma visita agendada ainda</p>
          <p className="text-sm text-gray-500 mt-1">
            Clique em "Agendar Visita" para adicionar a primeira visita
          </p>
        </div>
      )}
    </div>
  );
}