/**
 * ENHANCED SCHEDULE VISIT MODAL - MyImoMatePro
 * With SMS, customizable templates, and reminder scheduling
 */

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  UserGroupIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  BellIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const VISIT_STAGES = [
  { value: 'pending', label: 'Pendente', color: 'gray' },
  { value: 'owner_approved', label: 'Aprovado Proprietário', color: 'blue' },
  { value: 'buyer_approved', label: 'Aprovado Comprador', color: 'indigo' },
  { value: 'confirmed', label: 'Confirmado', color: 'green' },
];

// Default message templates
const DEFAULT_TEMPLATES = {
  whatsapp: {
    owner: 'Olá! 📍 Confirmando visita ao seu imóvel:\n📅 Data: {{date}}\n🕐 Hora: {{time}}\n👤 Visitante: {{visitorName}}\n\nPor favor confirme disponibilidade.',
    buyer: 'Olá {{visitorName}}! ✅ Sua visita está agendada:\n📅 {{date}} às {{time}}\n📍 {{address}}\n\nConfirme sua presença respondendo esta mensagem.',
    agent: 'Olá {{agentName}}! 📋 Nova visita agendada:\n📅 {{date}} às {{time}}\n👤 Cliente: {{visitorName}}\n📍 {{address}}\n\nPor favor confirme acompanhamento.'
  },
  email: {
    owner: {
      subject: 'Confirmação de Visita - {{date}}',
      body: 'Prezado(a) Proprietário,\n\nConfirmamos o agendamento de visita ao seu imóvel:\n\nData: {{date}}\nHora: {{time}}\nVisitante: {{visitorName}}\n\nPor favor, confirme sua disponibilidade.\n\nAtenciosamente,\n{{yourName}}'
    },
    buyer: {
      subject: 'Visita Agendada - {{address}}',
      body: 'Olá {{visitorName}},\n\nSua visita foi agendada com sucesso!\n\nData: {{date}}\nHora: {{time}}\nEndereço: {{address}}\n\nAguardamos sua confirmação.\n\nAtenciosamente,\n{{yourName}}'
    },
    agent: {
      subject: 'Acompanhamento de Visita - {{date}}',
      body: 'Olá {{agentName}},\n\nSolicitamos seu acompanhamento na seguinte visita:\n\nData: {{date}}\nHora: {{time}}\nCliente: {{visitorName}}\nEndereço: {{address}}\n\nPor favor confirme disponibilidade.\n\nAtenciosamente,\n{{yourName}}'
    }
  },
  sms: {
    owner: 'Visita agendada {{date}} às {{time}}. Visitante: {{visitorName}}. Confirme: {{confirmLink}}',
    buyer: '{{visitorName}}, visita confirmada {{date}} {{time}}. Local: {{address}}',
    agent: 'Nova visita {{date}} {{time}}. Cliente: {{visitorName}}. Confirme acompanhamento.'
  }
};

// Reminder options
const REMINDER_OPTIONS = [
  { value: 'none', label: 'Sem lembrete' },
  { value: '1h', label: '1 hora antes' },
  { value: '2h', label: '2 horas antes' },
  { value: '1d', label: '1 dia antes' },
  { value: '2d', label: '2 dias antes' },
  { value: 'custom', label: 'Personalizado' }
];

export default function ScheduleVisitModal({ 
  isOpen, 
  onClose, 
  onSave, 
  opportunity,
  existingVisit = null,   // Added
  isEditMode = false      // Added
}) {
  // Helper to build initial form state (supports edit mode)
  const getInitialFormData = () => {
    if (existingVisit) {
      return {
        scheduledDate: existingVisit.scheduledDate || '',
        scheduledTime: existingVisit.scheduledTime || '',
        visitorName: existingVisit.visitorName || '',
        visitorPhone: existingVisit.visitorPhone || '',
        visitorEmail: existingVisit.visitorEmail || '',
        buyerAgent: {
          name: existingVisit.buyerAgent?.name || '',
            phone: existingVisit.buyerAgent?.phone || '',
          email: existingVisit.buyerAgent?.email || ''
        },
        visitStage: existingVisit.visitStage || existingVisit.status || 'pending',
        ownerApproved: !!existingVisit.ownerApproved,
        buyerApproved: !!existingVisit.buyerApproved,
        notes: existingVisit.notes || '',
        communications: {
          ownerWhatsApp: !!existingVisit.communications?.ownerWhatsApp,
          ownerEmail: !!existingVisit.communications?.ownerEmail,
          ownerSMS: !!existingVisit.communications?.ownerSMS,
          buyerWhatsApp: !!existingVisit.communications?.buyerWhatsApp,
          buyerEmail: !!existingVisit.communications?.buyerEmail,
          buyerSMS: !!existingVisit.communications?.buyerSMS,
          agentWhatsApp: !!existingVisit.communications?.agentWhatsApp,
          agentEmail: !!existingVisit.communications?.agentEmail,
          agentSMS: !!existingVisit.communications?.agentSMS
        },
        reminders: {
          owner: existingVisit.reminders?.owner || 'none',
          buyer: existingVisit.reminders?.buyer || '1d',
          agent: existingVisit.reminders?.agent || '2h',
          customReminders: existingVisit.reminders?.customReminders || []
        },
        templates: existingVisit.templates || DEFAULT_TEMPLATES
      };
    }
    // Default (create mode)
    return {
      scheduledDate: '',
      scheduledTime: '',
      visitorName: '',
      visitorPhone: '',
      visitorEmail: '',
      buyerAgent: { name: '', phone: '', email: '' },
      visitStage: 'pending',
      ownerApproved: false,
      buyerApproved: false,
      notes: '',
      communications: {
        ownerWhatsApp: false,
        ownerEmail: false,
        ownerSMS: false,
        buyerWhatsApp: false,
        buyerEmail: false,
        buyerSMS: false,
        agentWhatsApp: false,
        agentEmail: false,
        agentSMS: false
      },
      reminders: {
        owner: 'none',
        buyer: '1d',
        agent: '2h',
        customReminders: []
      },
      templates: DEFAULT_TEMPLATES
    };
  };

  const [formData, setFormData] = useState(getInitialFormData); // Updated
  const [showCommunicationStatus, setShowCommunicationStatus] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [activeTab, setActiveTab] = useState('basic');

  // Reset form when opening or when editingVisit changes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setActiveTab('basic');
    }
  }, [isOpen, existingVisit]); // Added

  if (!isOpen) return null;

  // Replace template variables with actual values
  const processTemplate = (template, recipient) => {
    const replacements = {
      '{{date}}': formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString('pt-PT') : '[DATA]',
      '{{time}}': formData.scheduledTime || '[HORA]',
      '{{visitorName}}': formData.visitorName || '[NOME DO VISITANTE]',
      '{{agentName}}': formData.buyerAgent.name || '[NOME DO CONSULTOR]',
      '{{address}}': opportunity?.property?.address || '[ENDEREÇO]',
      '{{yourName}}': 'Consultor', // Could be from user profile
      '{{confirmLink}}': 'https://app.exemplo.com/confirmar' // Would be actual link
    };

    let processed = template;
    Object.keys(replacements).forEach(key => {
      processed = processed.replace(new RegExp(key, 'g'), replacements[key]);
    });
    
    return processed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert('Por favor, preencha a data e hora da visita');
      return;
    }
    
    if (!formData.visitorName) {
      alert('Por favor, preencha o nome do comprador');
      return;
    }

    // Auto-set visit stage based on approvals
    let stage = 'pending';
    if (formData.ownerApproved && formData.buyerApproved) {
      stage = 'confirmed';
    } else if (formData.ownerApproved) {
      stage = 'owner_approved';
    } else if (formData.buyerApproved) {
      stage = 'buyer_approved';
    }

    const visitData = {
      ...formData,
      visitStage: stage,
      status: 'scheduled',
      templates: templates, // Save custom templates
      createdAt: new Date().toISOString()
    };

    onSave(visitData);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAgentInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      buyerAgent: {
        ...prev.buyerAgent,
        [field]: value
      }
    }));
  };

  const handleReminderChange = (recipient, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [recipient]: value
      }
    }));
  };

  // Send WhatsApp message
  const sendWhatsApp = (recipient, phone) => {
    if (!phone) {
      alert('Número de telefone não disponível');
      return;
    }
    
    const message = processTemplate(templates.whatsapp[recipient], recipient);
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Mark as sent
    setFormData(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        [`${recipient}WhatsApp`]: true
      }
    }));
    setShowCommunicationStatus(true);
  };

  // Send Email
  const sendEmail = (recipient, email) => {
    if (!email) {
      alert('Email não disponível');
      return;
    }
    
    const subject = processTemplate(templates.email[recipient].subject, recipient);
    const body = processTemplate(templates.email[recipient].body, recipient);
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    // Mark as sent after a delay
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        communications: {
          ...prev.communications,
          [`${recipient}Email`]: true
        }
      }));
      setShowCommunicationStatus(true);
    }, 2000);
  };

  // Send SMS (simulated - would integrate with SMS service)
  const sendSMS = (recipient, phone) => {
    if (!phone) {
      alert('Número de telefone não disponível');
      return;
    }
    
    const message = processTemplate(templates.sms[recipient], recipient);
    
    // In production, this would call an SMS API
    // For now, we'll copy to clipboard
    navigator.clipboard.writeText(message);
    alert(`SMS copiado para área de transferência:\n\n${message}\n\nCole em seu aplicativo de SMS preferido.`);
    
    // Mark as sent
    setFormData(prev => ({
      ...prev,
      communications: {
        ...prev.communications,
        [`${recipient}SMS`]: true
      }
    }));
    setShowCommunicationStatus(true);
  };

  // Template editor modal
  const TemplateEditor = () => {
    if (!showTemplateEditor || !editingTemplate) return null;

    const { type, recipient } = editingTemplate;
    const currentTemplate = type === 'email' 
      ? templates[type][recipient] 
      : templates[type][recipient];

    const [tempTemplate, setTempTemplate] = useState(
      type === 'email' 
        ? { subject: currentTemplate.subject, body: currentTemplate.body }
        : currentTemplate
    );

    const saveTemplate = () => {
      setTemplates(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [recipient]: tempTemplate
        }
      }));
      setShowTemplateEditor(false);
      setEditingTemplate(null);
    };

    return (
      <div className="fixed inset-0 z-60 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowTemplateEditor(false)} />
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 z-10">
          <h3 className="text-lg font-semibold mb-4">
            Editar Template - {type.toUpperCase()} para {recipient}
          </h3>
          
          <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
            <p className="font-medium mb-2">Variáveis disponíveis:</p>
            <code className="text-xs">
              {'{{date}}'} {'{{time}}'} {'{{visitorName}}'} {'{{agentName}}'} {'{{address}}'} {'{{yourName}}'}
            </code>
          </div>

          {type === 'email' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={tempTemplate.subject}
                  onChange={(e) => setTempTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corpo do Email
                </label>
                <textarea
                  value={tempTemplate.body}
                  onChange={(e) => setTempTemplate(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                value={tempTemplate}
                onChange={(e) => setTempTemplate(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pré-visualização
            </label>
            <div className="p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
              {type === 'email' ? (
                <>
                  <div className="font-medium mb-2">
                    Assunto: {processTemplate(tempTemplate.subject, recipient)}
                  </div>
                  <div className="border-t pt-2">
                    {processTemplate(tempTemplate.body, recipient)}
                  </div>
                </>
              ) : (
                processTemplate(tempTemplate, recipient)
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowTemplateEditor(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

          <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Editar Visita' : 'Agendar Nova Visita'} {/* Updated */}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Informações Básicas
                </button>
                <button
                  onClick={() => setActiveTab('communication')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'communication'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Comunicação
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reminders'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Lembretes
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Informações do Comprador
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.visitorName}
                          onChange={(e) => handleInputChange('visitorName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          value={formData.visitorPhone}
                          onChange={(e) => handleInputChange('visitorPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="+351 900 000 000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.visitorEmail}
                          onChange={(e) => handleInputChange('visitorEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buyer's Agent Information */}
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <UserGroupIcon className="w-4 h-4 mr-2" />
                      Consultor do Comprador
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Nome do Consultor
                        </label>
                        <input
                          type="text"
                          value={formData.buyerAgent.name}
                          onChange={(e) => handleAgentInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Nome do consultor"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Telefone do Consultor
                        </label>
                        <input
                          type="tel"
                          value={formData.buyerAgent.phone}
                          onChange={(e) => handleAgentInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="+351 900 000 000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email do Consultor
                        </label>
                        <input
                          type="email"
                          value={formData.buyerAgent.email}
                          onChange={(e) => handleAgentInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="consultor@exemplo.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visit Approval Status */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Estado de Aprovação
                    </h4>
                    
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        formData.ownerApproved && formData.buyerApproved
                          ? 'bg-green-100 text-green-700'
                          : formData.ownerApproved
                          ? 'bg-blue-100 text-blue-700'
                          : formData.buyerApproved
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {formData.ownerApproved && formData.buyerApproved
                          ? '✓ Totalmente Confirmado'
                          : formData.ownerApproved
                          ? 'Aprovado pelo Proprietário'
                          : formData.buyerApproved
                          ? 'Aprovado pelo Comprador'
                          : 'Pendente Aprovações'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.ownerApproved}
                          onChange={(e) => handleInputChange('ownerApproved', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-3 text-sm font-medium">
                          Proprietário Aprovou
                        </span>
                        {formData.ownerApproved && (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                      </label>

                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.buyerApproved}
                          onChange={(e) => handleInputChange('buyerApproved', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="ml-3 text-sm font-medium">
                          Comprador Aprovou
                        </span>
                        {formData.buyerApproved && (
                          <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto" />
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionais
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Observações sobre a visita..."
                    />
                  </div>
                </div>
              )}

              {/* Communication Tab */}
              {activeTab === 'communication' && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      Envie notificações instantâneas para todos os envolvidos. 
                      Clique nos ícones para enviar ou edite os templates conforme necessário.
                    </p>
                  </div>

                  {/* Communication Grid */}
                  <div className="space-y-4">
                    {/* Buyer Communication */}
                    {formData.visitorName && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">
                          Comprador: {formData.visitorName}
                        </h5>
                        <div className="flex items-center space-x-4">
                          {formData.visitorPhone && (
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => sendWhatsApp('buyer', formData.visitorPhone)}
                                className={`p-2 rounded-lg border ${
                                  formData.communications.buyerWhatsApp
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => sendSMS('buyer', formData.visitorPhone)}
                                className={`p-2 rounded-lg border ${
                                  formData.communications.buyerSMS
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />
                              </button>
                            </div>
                          )}
                          {formData.visitorEmail && (
                            <button
                              type="button"
                              onClick={() => sendEmail('buyer', formData.visitorEmail)}
                              className={`p-2 rounded-lg border ${
                                formData.communications.buyerEmail
                                  ? 'bg-blue-50 border-blue-300'
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTemplate({ type: 'whatsapp', recipient: 'buyer' });
                              setShowTemplateEditor(true);
                            }}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Agent Communication */}
                    {formData.buyerAgent.name && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">
                          Consultor: {formData.buyerAgent.name}
                        </h5>
                        <div className="flex items-center space-x-4">
                          {formData.buyerAgent.phone && (
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => sendWhatsApp('agent', formData.buyerAgent.phone)}
                                className={`p-2 rounded-lg border ${
                                  formData.communications.agentWhatsApp
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => sendSMS('agent', formData.buyerAgent.phone)}
                                className={`p-2 rounded-lg border ${
                                  formData.communications.agentSMS
                                    ? 'bg-purple-50 border-purple-300'
                                    : 'bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />
                              </button>
                            </div>
                          )}
                          {formData.buyerAgent.email && (
                            <button
                              type="button"
                              onClick={() => sendEmail('agent', formData.buyerAgent.email)}
                              className={`p-2 rounded-lg border ${
                                formData.communications.agentEmail
                                  ? 'bg-blue-50 border-blue-300'
                                  : 'bg-white border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTemplate({ type: 'whatsapp', recipient: 'agent' });
                              setShowTemplateEditor(true);
                            }}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Owner Communication (placeholder) */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">
                        Proprietário
                      </h5>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => sendWhatsApp('owner', opportunity?.owner?.phone || '')}
                          className={`p-2 rounded-lg border ${
                            formData.communications.ownerWhatsApp
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => sendSMS('owner', opportunity?.owner?.phone || '')}
                          className={`p-2 rounded-lg border ${
                            formData.communications.ownerSMS
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => sendEmail('owner', opportunity?.owner?.email || '')}
                          className={`p-2 rounded-lg border ${
                            formData.communications.ownerEmail
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTemplate({ type: 'whatsapp', recipient: 'owner' });
                            setShowTemplateEditor(true);
                          }}
                          className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Communication Status */}
                  {showCommunicationStatus && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Status das Comunicações
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(formData.communications).map(([key, sent]) => {
                          if (!sent) return null;
                          const [recipient, type] = [
                            key.replace(/WhatsApp|Email|SMS/, ''),
                            key.includes('WhatsApp') ? 'WhatsApp' : 
                            key.includes('Email') ? 'Email' : 'SMS'
                          ];
                          return (
                            <div key={key} className="flex items-center text-green-600">
                              <CheckIcon className="w-4 h-4 mr-1" />
                              {type} enviado - {recipient}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reminders Tab */}
              {activeTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700 flex items-center">
                      <BellIcon className="w-4 h-4 mr-2" />
                      Configure lembretes automáticos para garantir que todos sejam notificados antes da visita.
                    </p>
                  </div>

                  {/* Reminder Settings */}
                  <div className="space-y-4">
                    {/* Owner Reminder */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          Lembrete para Proprietário
                        </h5>
                        <HomeIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.reminders.owner}
                        onChange={(e) => handleReminderChange('owner', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {REMINDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Buyer Reminder */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          Lembrete para Comprador
                        </h5>
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.reminders.buyer}
                        onChange={(e) => handleReminderChange('buyer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {REMINDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Agent Reminder */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          Lembrete para Consultor
                        </h5>
                        <UserGroupIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.reminders.agent}
                        onChange={(e) => handleReminderChange('agent', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {REMINDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Reminders */}
                    <div className="border border-dashed border-gray-300 rounded-lg p-4">
                      <button
                        type="button"
                        className="w-full flex items-center justify-center py-2 text-gray-600 hover:text-gray-900"
                        onClick={() => alert('Adicionar lembrete personalizado')}
                      >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar Lembrete Personalizado
                      </button>
                    </div>
                  </div>

                  {/* Reminder Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Resumo dos Lembretes
                    </h4>
                    <div className="space-y-2 text-sm">
                      {formData.reminders.owner !== 'none' && (
                        <div className="flex items-center text-gray-600">
                          <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                          Proprietário será notificado {
                            REMINDER_OPTIONS.find(o => o.value === formData.reminders.owner)?.label
                          }
                        </div>
                      )}
                      {formData.reminders.buyer !== 'none' && (
                        <div className="flex items-center text-gray-600">
                          <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                          Comprador será notificado {
                            REMINDER_OPTIONS.find(o => o.value === formData.reminders.buyer)?.label
                          }
                        </div>
                      )}
                      {formData.reminders.agent !== 'none' && (
                        <div className="flex items-center text-gray-600">
                          <BellIcon className="w-4 h-4 mr-2 text-blue-500" />
                          Consultor será notificado {
                            REMINDER_OPTIONS.find(o => o.value === formData.reminders.agent)?.label
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>{isEditMode ? 'Atualizar Visita' : 'Agendar Visita'}</span> {/* Updated */}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      <TemplateEditor />
    </>
  );
}