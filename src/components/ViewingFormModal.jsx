// components/ViewingFormModal.jsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon as StarOutline,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon
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
  { value: 'another_viewing', label: 'Quer Ver Novamente', icon: '🔄' },
  { value: 'time_to_think', label: 'Precisa Pensar', icon: '🤔' },
  { value: 'make_offer', label: 'Quer Fazer Proposta', icon: '💰' },
  { value: 'not_interested', label: 'Não Interessado', icon: '❌' }
];

const ViewingFormModal = ({ isOpen, onClose, onSave, deal, client, existingViewing = null }) => {
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
  const [otherAttendeeInput, setOtherAttendeeInput] = useState('');

  // Load existing viewing data if editing
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
    // Validation
    if (!formData.date || !formData.time) {
      alert('Por favor, preencha a data e hora da visita');
      return;
    }
    if (!formData.feedback.overallImpression) {
      alert('Por favor, selecione a impressão geral');
      return;
    }

    // Convert date string to Date object for saving
    const viewingData = {
      ...formData,
      date: new Date(`${formData.date}T${formData.time}`),
      dealId: deal.id
    };

    onSave(viewingData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {existingViewing ? 'Editar Visita' : 'Registar Visita'}
              </h2>
              <p className="text-indigo-100 mt-1">{deal?.property?.address}</p>
              <p className="text-indigo-200 text-sm mt-1">Cliente: {client?.name}</p>
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
                  required
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
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        addItem('attendees', 'others', otherAttendeeInput, setOtherAttendeeInput);
                      }
                    }}
                    placeholder="Nome do participante..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('attendees', 'others', otherAttendeeInput, setOtherAttendeeInput)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
                          onClick={() => removeItem('attendees', 'others', index)}
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

          {/* Feedback Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Feedback do Cliente
            </h3>

            {/* Overall Impression */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impressão Geral *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {OVERALL_IMPRESSIONS.map(impression => (
                  <button
                    key={impression.value}
                    type="button"
                    onClick={() => handleInputChange('feedback', 'overallImpression', impression.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.feedback.overallImpression === impression.value
                        ? `border-${impression.color}-600 bg-${impression.color}-50 text-${impression.color}-700 font-medium`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {impression.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Level */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Interesse: {formData.feedback.interestLevel}/10
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange('feedback', 'interestLevel', value)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    {value <= formData.feedback.interestLevel ? (
                      <StarSolid className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <StarOutline className="w-6 h-6 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Positives */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ✅ Pontos Positivos
              </label>
              <div className="flex gap-2">
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
                  placeholder="O que o cliente gostou..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addItem('feedback', 'positives', positiveInput, setPositiveInput)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              {formData.feedback.positives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.feedback.positives.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      ✅ {item}
                      <button
                        type="button"
                        onClick={() => removeItem('feedback', 'positives', index)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Negatives */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ❌ Pontos Negativos / Preocupações
              </label>
              <div className="flex gap-2">
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
                  placeholder="Preocupações ou aspetos negativos..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addItem('feedback', 'negatives', negativeInput, setNegativeInput)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              {formData.feedback.negatives.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.feedback.negatives.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      ❌ {item}
                      <button
                        type="button"
                        onClick={() => removeItem('feedback', 'negatives', index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ❓ Questões Levantadas
              </label>
              <div className="flex gap-2">
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
                  placeholder="Questões que o cliente levantou..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => addItem('feedback', 'questions', questionInput, setQuestionInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              {formData.feedback.questions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.feedback.questions.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      ❓ {item}
                      <button
                        type="button"
                        onClick={() => removeItem('feedback', 'questions', index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout / Distribuição
                </label>
                <select
                  value={formData.feedback.layout}
                  onChange={(e) => handleInputChange('feedback', 'layout', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado / Conservação
                </label>
                <select
                  value={formData.feedback.condition}
                  onChange={(e) => handleInputChange('feedback', 'condition', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <select
                  value={formData.feedback.location}
                  onChange={(e) => handleInputChange('feedback', 'location', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione...</option>
                  {ASPECT_RATINGS.map(rating => (
                    <option key={rating.value} value={rating.value}>
                      {rating.emoji} {rating.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relação Preço / Valor
                </label>
                <select
                  value={formData.feedback.price}
                  onChange={(e) => handleInputChange('feedback', 'price', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione...</option>
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
                  O que o Cliente Quer Fazer?
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
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            {existingViewing ? 'Atualizar' : 'Guardar'} Visita
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewingFormModal;