// components/ScheduleViewingModal.jsx - For SCHEDULING future visits
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const VIEWING_TYPES = [
  { value: 'first_visit', label: 'Primeira Visita' },
  { value: 'second_visit', label: 'Segunda Visita' },
  { value: 'technical_inspection', label: 'Inspeção Técnica' },
  { value: 'final_visit', label: 'Visita Final' }
];

const ScheduleViewingModal = ({ isOpen, onClose, onSave, deal, client, existingViewing = null }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    type: 'first_visit',
    
    attendees: {
      buyers: [client?.name || ''],
      agentPresent: true,
      sellerPresent: false,
      others: []
    },
    
    notes: '',
    status: 'scheduled' // IMPORTANT: Mark as scheduled
  });

  const [otherAttendeeInput, setOtherAttendeeInput] = useState('');

  // Load existing viewing if editing
  useEffect(() => {
    if (existingViewing) {
      setFormData({
        ...existingViewing,
        date: existingViewing.date instanceof Date 
          ? existingViewing.date.toISOString().split('T')[0]
          : new Date(existingViewing.date).toISOString().split('T')[0],
        time: existingViewing.time || new Date().toTimeString().slice(0, 5)
      });
    }
  }, [existingViewing]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addOtherAttendee = () => {
    if (otherAttendeeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: {
          ...prev.attendees,
          others: [...prev.attendees.others, otherAttendeeInput.trim()]
        }
      }));
      setOtherAttendeeInput('');
    }
  };

  const removeOtherAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: {
        ...prev.attendees,
        others: prev.attendees.others.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.time) {
      alert('Por favor, preencha a data e hora da visita');
      return;
    }

    const viewingData = {
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`),
      dealId: deal.id,
      status: 'scheduled'
    };

    onSave(viewingData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Agendar Visita</h2>
              <p className="text-blue-100 mt-1">{deal?.property?.address}</p>
              <p className="text-blue-200 text-sm mt-1">Cliente: {client?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Date & Time */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
              Data e Hora
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange(null, 'time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange(null, 'duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="15"
                  step="15"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Visita
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VIEWING_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange(null, 'type', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
              Quem vai estar presente?
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.attendees.agentPresent}
                  onChange={(e) => handleInputChange('attendees', 'agentPresent', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Agente Presente</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.attendees.sellerPresent}
                  onChange={(e) => handleInputChange('attendees', 'sellerPresent', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Vendedor Presente</span>
              </label>

              {/* Other Attendees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outros Participantes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otherAttendeeInput}
                    onChange={(e) => setOtherAttendeeInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOtherAttendee();
                      }
                    }}
                    placeholder="Nome do participante..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addOtherAttendee}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
                {formData.attendees.others.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.attendees.others.map((person, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                      >
                        {person}
                        <button
                          type="button"
                          onClick={() => removeOtherAttendee(index)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preparation Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas de Preparação
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Pontos a verificar, perguntas a fazer, documentos a levar..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Agendar Visita
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleViewingModal;