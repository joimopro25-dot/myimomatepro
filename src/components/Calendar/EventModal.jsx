/**
 * EVENT MODAL - MyImoMatePro
 * Modal for viewing and editing calendar events
 */

import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PencilIcon,
  CakeIcon,
  DocumentTextIcon,
  HomeIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { EVENT_TYPES, formatDate } from './CalendarUtils';

const EventModal = ({ event, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  if (!event) return null;

  const eventConfig = EVENT_TYPES[event.type];
  
  // Icon mapping
  const iconMap = {
    birthday: CakeIcon,
    cpcv: DocumentTextIcon,
    escritura: HomeIcon,
    task: CheckCircleIcon,
    visit: EyeIcon,
    followup: ArrowPathIcon
  };
  
  const Icon = iconMap[event.type];

  const handleSave = () => {
    onSave(editedEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${eventConfig.color} px-6 py-4 flex items-center justify-between text-white rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6" />
            <h2 className="text-xl font-bold">{eventConfig.label}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="text-lg font-semibold text-gray-900">{event.title}</div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <div className="text-gray-900">{formatDate(event.date)}</div>
            {event.recurring && (
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <span>🔄</span> Recorrente anualmente
              </div>
            )}
          </div>

          {/* Time */}
          {(event.time || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              {isEditing ? (
                <input
                  type="time"
                  value={editedEvent.time || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, time: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="text-gray-900">{event.time}</div>
              )}
            </div>
          )}

          {/* Description */}
          {(event.description || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              {isEditing ? (
                <textarea
                  value={editedEvent.description || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adicionar descrição..."
                />
              ) : (
                <div className="text-gray-700">{event.description}</div>
              )}
            </div>
          )}

          {/* Priority */}
          {(event.priority || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridade
              </label>
              {isEditing ? (
                <select
                  value={editedEvent.priority || 'medium'}
                  onChange={(e) => setEditedEvent({ ...editedEvent, priority: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    event.priority === 'high' ? 'bg-red-500' :
                    event.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}></span>
                  <span className="capitalize text-gray-900">
                    {event.priority === 'high' ? 'Alta' : 
                     event.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {(event.location || isEditing) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent.location || ''}
                  onChange={(e) => setEditedEvent({ ...editedEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adicionar localização..."
                />
              ) : (
                <div className="text-gray-700">{event.location}</div>
              )}
            </div>
          )}

          {/* Related Info */}
          {event.clientId && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <strong>Cliente:</strong> Relacionado com cliente #{event.clientId}
            </div>
          )}

          {event.propertyId && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <strong>Propriedade:</strong> Relacionado com propriedade #{event.propertyId}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {eventConfig.editable && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
            )}
            
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </>
            )}
            
            {!isEditing && (
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Fechar
              </button>
            )}
          </div>

          {/* View Only Notice */}
          {!eventConfig.editable && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              ℹ️ Este evento é gerado automaticamente pelo CRM e não pode ser editado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;