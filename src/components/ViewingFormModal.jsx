/**
 * VIEWING FORM MODAL - Enhanced with Schedule/Complete Workflow
 * CORRECTED VERSION - Fixed syntax errors
 */

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  VIEWING_TYPES,
  IMPRESSION_OPTIONS,
  RATING_OPTIONS,
  NEXT_STEPS
} from '../models/buyerDealModel';

const ViewingFormModal = ({
  isOpen,
  onClose,
  onSave,
  deal,
  client,
  existingViewing = null,
  mode = 'record' // 'schedule' | 'complete' | 'record'
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    type: 'first_visit',
    status: mode === 'schedule' ? 'scheduled' : 'completed',
    
    attendees: {
      buyers: [client?.name || ''],
      agentPresent: true,
      sellerPresent: false,
      others: []
    },
    
    feedback: {
      overallImpression: '',
      interestLevel: 5,
      positives: [],
      negatives: [],
      questions: [],
      layout: '',
      condition: '',
      location: '',
      price: ''
    },
    
    followUp: {
      clientWants: '',
      nextSteps: '',
      scheduledFor: null
    },
    
    notes: ''
  });

  const [positiveInput, setPositiveInput] = useState('');
  const [negativeInput, setNegativeInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [otherAttendeeInput, setOtherAttendeeInput] = useState('');

  // Load existing viewing data if editing or completing
  useEffect(() => {
    if (existingViewing) {
      setFormData({
        ...existingViewing,
        date: existingViewing.date instanceof Date 
          ? existingViewing.date.toISOString().split('T')[0]
          : new Date(existingViewing.date).toISOString().split('T')[0],
        time: existingViewing.time || new Date().toTimeString().slice(0, 5),
        status: mode === 'complete' ? 'completed' : existingViewing.status
      });
    }
  }, [existingViewing, mode]);

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

  const addItem = (section, field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: [...prev[section][field], value.trim()]
        }
      }));
      setter('');
    }
  };

  const removeItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = () => {
    // Validation for basic info
    if (!formData.date || !formData.time) {
      alert('Por favor, preencha a data e hora da visita');
      return;
    }

    // Additional validation for completed visits
    if (mode !== 'schedule' && !formData.feedback.overallImpression) {
      alert('Por favor, selecione a impressão geral');
      return;
    }

    const viewingData = {
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`),
      dealId: deal.id,
      completedAt: mode !== 'schedule' ? new Date() : null
    };

    onSave(viewingData);
    onClose();
  };

  if (!isOpen) return null;

  const isScheduleMode = mode === 'schedule';
  const showFeedback = mode !== 'schedule';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`${
          isScheduleMode 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600'
        } text-white p-6 rounded-t-xl flex-shrink-0`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {isScheduleMode && '📅 Agendar Visita'}
                {mode === 'complete' && '✅ Completar Visita'}
                {mode === 'record' && '📝 Registar Visita'}
              </h2>
              <p className="text-blue-100 mt-1">
                {deal.property?.address || 'Propriedade'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Basic Info - Always visible */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Informação Básica
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange(null, 'time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange(null, 'duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
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
              <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Participantes
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.attendees.agentPresent}
                  onChange={(e) => handleInputChange('attendees', 'agentPresent', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Agente Presente</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.attendees.sellerPresent}
                  onChange={(e) => handleInputChange('attendees', 'sellerPresent', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Vendedor Presente</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outros Participantes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otherAttendeeInput}
                    onChange={(e) => setOtherAttendeeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('attendees', 'others', otherAttendeeInput, setOtherAttendeeInput)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nome..."
                  />
                  <button
                    type="button"
                    onClick={() => addItem('attendees', 'others', otherAttendeeInput, setOtherAttendeeInput)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    +
                  </button>
                </div>
                {formData.attendees.others.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.attendees.others.map((person, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {person}
                        <button
                          onClick={() => removeItem('attendees', 'others', idx)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Section - Only for complete/record modes */}
          {showFeedback && (
            <>
              {/* Overall Impression */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Impressão Geral *
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {IMPRESSION_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('feedback', 'overallImpression', option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.feedback.overallImpression === option.value
                          ? `border-${option.color}-600 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.label.split(' ')[0]}</div>
                      <div className="font-medium">{option.label.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nível de Interesse: {formData.feedback.interestLevel}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.feedback.interestLevel}
                    onChange={(e) => handleInputChange('feedback', 'interestLevel', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Nada interessado</span>
                    <span>Muito interessado</span>
                  </div>
                </div>
              </div>

              {/* Detailed Ratings - FIXED SYNTAX ERROR HERE */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Avaliação Detalhada
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'layout', label: 'Layout' },
                    { key: 'condition', label: 'Estado' },
                    { key: 'location', label: 'Localização' },
                    { key: 'price', label: 'Preço' }
                  ].map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {item.label}
                      </label>
                      <select
                        value={formData.feedback[item.key]}
                        onChange={(e) => handleInputChange('feedback', item.key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Selecionar...</option>
                        {RATING_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positives & Negatives */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Feedback Detalhado
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Positives */}
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      👍 Pontos Positivos
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={positiveInput}
                        onChange={(e) => setPositiveInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('feedback', 'positives', positiveInput, setPositiveInput)}
                        className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="O que gostaram..."
                      />
                      <button
                        type="button"
                        onClick={() => addItem('feedback', 'positives', positiveInput, setPositiveInput)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        +
                      </button>
                    </div>
                    {formData.feedback.positives.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {formData.feedback.positives.map((item, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded">
                            <span className="text-sm">{item}</span>
                            <button
                              onClick={() => removeItem('feedback', 'positives', idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Negatives */}
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      👎 Pontos Negativos
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={negativeInput}
                        onChange={(e) => setNegativeInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('feedback', 'negatives', negativeInput, setNegativeInput)}
                        className="flex-1 px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="Preocupações..."
                      />
                      <button
                        type="button"
                        onClick={() => addItem('feedback', 'negatives', negativeInput, setNegativeInput)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        +
                      </button>
                    </div>
                    {formData.feedback.negatives.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {formData.feedback.negatives.map((item, idx) => (
                          <li key={idx} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded">
                            <span className="text-sm">{item}</span>
                            <button
                              onClick={() => removeItem('feedback', 'negatives', idx)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Questions */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ❓ Questões Levantadas
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={questionInput}
                      onChange={(e) => setQuestionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('feedback', 'questions', questionInput, setQuestionInput)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Perguntas do cliente..."
                    />
                    <button
                      type="button"
                      onClick={() => addItem('feedback', 'questions', questionInput, setQuestionInput)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      +
                    </button>
                  </div>
                  {formData.feedback.questions.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {formData.feedback.questions.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm">{item}</span>
                          <button
                            onClick={() => removeItem('feedback', 'questions', idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Follow-up */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-indigo-600" />
                  Próximos Passos
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      O que o cliente quer fazer?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {NEXT_STEPS.map(step => (
                        <button
                          key={step.value}
                          type="button"
                          onClick={() => handleInputChange('followUp', 'clientWants', step.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            formData.followUp.clientWants === step.value
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{step.icon}</span>
                          {step.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ações a Tomar
                    </label>
                    <textarea
                      value={formData.followUp.nextSteps}
                      onChange={(e) => handleInputChange('followUp', 'nextSteps', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows="2"
                      placeholder="Contactar agente, verificar documentação, etc..."
                    />
                  </div>

                  {formData.followUp.clientWants === 'another_viewing' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agendar Para
                      </label>
                      <input
                        type="date"
                        value={formData.followUp.scheduledFor || ''}
                        onChange={(e) => handleInputChange('followUp', 'scheduledFor', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* General Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionais
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows="3"
              placeholder="Observações gerais..."
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
            className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center ${
              isScheduleMode
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isScheduleMode && (
              <>
                <CalendarIcon className="w-5 h-5 mr-2" />
                Agendar Visita
              </>
            )}
            {mode === 'complete' && (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Completar Visita
              </>
            )}
            {mode === 'record' && (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Registar Visita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewingFormModal;