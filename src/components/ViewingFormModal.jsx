// components/ViewingFormModal.jsx
import React, { useState } from 'react';
import {
  XMarkIcon,
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

const VIEWING_TYPES = [
  { value: 'first_visit', label: 'Primeira Visita' },
  { value: 'second_visit', label: 'Segunda Visita' },
  { value: 'technical_inspection', label: 'Inspeção Técnica' },
  { value: 'final_visit', label: 'Visita Final' }
];

const OVERALL_IMPRESSIONS = [
  { value: 'loved', label: '❤️ Adorou', color: 'green' },
  { value: 'liked', label: '😊 Gostou', color: 'blue' },
  { value: 'neutral', label: '😐 Neutro', color: 'yellow' },
  { value: 'disliked', label: '😕 Não Gostou', color: 'red' }
];

const ASPECT_RATINGS = [
  { value: 'perfect', label: 'Perfeito', emoji: '✨' },
  { value: 'good', label: 'Bom', emoji: '👍' },
  { value: 'acceptable', label: 'Aceitável', emoji: '👌' },
  { value: 'poor', label: 'Fraco', emoji: '👎' }
];

const PRICE_RATINGS = [
  { value: 'great_value', label: 'Excelente Negócio', emoji: '💎' },
  { value: 'fair', label: 'Justo', emoji: '👌' },
  { value: 'expensive', label: 'Caro', emoji: '💰' },
  { value: 'overpriced', label: 'Sobrevalorizado', emoji: '🚫' }
];

const NEXT_STEPS = [
  { value: 'another_viewing', label: 'Quer Ver Novamente' },
  { value: 'time_to_think', label: 'Precisa Pensar' },
  { value: 'make_offer', label: 'Quer Fazer Proposta' },
  { value: 'not_interested', label: 'Não Interessado' }
];

const ViewingFormModal = ({ isOpen, onClose, onSave, deal, client }) => {
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
    if (!formData.date || !formData.time) {
      alert('Por favor, preencha a data e hora da visita');
      return;
    }
    if (!formData.feedback.overallImpression) {
      alert('Por favor, selecione a impressão geral');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Registar Visita</h2>
              <p className="text-indigo-100 mt-1">{deal?.property?.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Informação da Visita
            </h3>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange(null, 'time', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange(null, 'duration', parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="15"
                  step="15"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Visita
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange(null, 'type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {VIEWING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2 text-purple-600" />
              Participantes
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.attendees.agentPresent}
                  onChange={(e) => handleInputChange('attendees', 'agentPresent', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Agente presente</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.attendees.sellerPresent}
                  onChange={(e) => handleInputChange('attendees', 'sellerPresent', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Vendedor presente</span>
              </label>
            </div>
          </div>

          {/* Overall Impression */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Impressão Geral *
            </h3>
            
            <div className="grid grid-cols-4 gap-3">
              {OVERALL_IMPRESSIONS.map(impression => (
                <button
                  key={impression.value}
                  onClick={() => handleInputChange('feedback', 'overallImpression', impression.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.feedback.overallImpression === impression.value
                      ? `border-${impression.color}-500 bg-${impression.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{impression.label.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{impression.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interest Level */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <StarOutline className="w-5 h-5 mr-2 text-yellow-500" />
              Nível de Interesse: {formData.feedback.interestLevel}/10
            </h3>
            
            <div className="flex items-center space-x-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleInputChange('feedback', 'interestLevel', i + 1)}
                  className="focus:outline-none transform hover:scale-110 transition-transform"
                >
                  {i < formData.feedback.interestLevel ? (
                    <StarSolid className="w-8 h-8 text-yellow-500" />
                  ) : (
                    <StarOutline className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              {formData.feedback.interestLevel >= 9 && '🔥 Cliente muito interessado!'}
              {formData.feedback.interestLevel >= 7 && formData.feedback.interestLevel < 9 && '😊 Bom interesse'}
              {formData.feedback.interestLevel >= 5 && formData.feedback.interestLevel < 7 && '🤔 Interesse moderado'}
              {formData.feedback.interestLevel < 5 && '😕 Pouco interesse'}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Feedback Detalhado
            </h3>
            
            {/* Positives */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                Pontos Positivos
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={positiveInput}
                  onChange={(e) => setPositiveInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('feedback', 'positives', positiveInput, setPositiveInput);
                    }
                  }}
                  placeholder="O que gostaram..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => addItem('feedback', 'positives', positiveInput, setPositiveInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.feedback.positives.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    ✓ {item}
                    <button
                      onClick={() => removeItem('feedback', 'positives', index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Negatives */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1 text-red-600" />
                Pontos Negativos / Preocupações
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={negativeInput}
                  onChange={(e) => setNegativeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('feedback', 'negatives', negativeInput, setNegativeInput);
                    }
                  }}
                  placeholder="O que não gostaram ou preocupações..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => addItem('feedback', 'negatives', negativeInput, setNegativeInput)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.feedback.negatives.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    ✗ {item}
                    <button
                      onClick={() => removeItem('feedback', 'negatives', index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1 text-blue-600" />
                Questões Levantadas
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('feedback', 'questions', questionInput, setQuestionInput);
                    }
                  }}
                  placeholder="Questões a resolver..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => addItem('feedback', 'questions', questionInput, setQuestionInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.feedback.questions.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    ? {item}
                    <button
                      onClick={() => removeItem('feedback', 'questions', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Avaliação por Área
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout / Distribuição
                </label>
                <select
                  value={formData.feedback.layout}
                  onChange={(e) => handleInputChange('feedback', 'layout', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de Conservação
                </label>
                <select
                  value={formData.feedback.condition}
                  onChange={(e) => handleInputChange('feedback', 'condition', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <select
                  value={formData.feedback.location}
                  onChange={(e) => handleInputChange('feedback', 'location', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relação Preço/Qualidade
                </label>
                <select
                  value={formData.feedback.price}
                  onChange={(e) => handleInputChange('feedback', 'price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {PRICE_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowRightIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Próximos Passos
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que o cliente quer?
                </label>
                <select
                  value={formData.followUp.clientWants}
                  onChange={(e) => handleInputChange('followUp', 'clientWants', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecionar...</option>
                  {NEXT_STEPS.map(step => (
                    <option key={step.value} value={step.value}>
                      {step.label}
                    </option>
                  ))}
                </select>
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
              placeholder="Observações gerais sobre a visita..."
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
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Guardar Visita
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewingFormModal;