/**
 * QUICK ADD MODAL - RealEstateCRM Pro
 * Modal for quick client capture with minimal information
 * Name is required, phone and email optional
 */

import React, { useState } from 'react';
import { useClients } from '../../contexts/ClientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { validatePhone, validateEmail } from '../../utils/validation';
import { CLIENT_SOURCE } from '../../models/clientModel';
import { 
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { UserPlusIcon } from '@heroicons/react/20/solid';

export default function QuickAddModal({ isOpen, onClose, onSuccess }) {
  const { quickAddClient, checkDuplicates } = useClients();
  const { t } = useTranslation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: CLIENT_SOURCE.WALKIN,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicates, setDuplicates] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Hide duplicate warning when changing fields
    if (showDuplicateWarning && (name === 'email' || name === 'phone')) {
      setShowDuplicateWarning(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    // Validate phone if provided
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    // Validate email if provided
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for duplicates
  const handleCheckDuplicates = async () => {
    if (!formData.email && !formData.phone) {
      return true; // No duplicates if no contact info
    }

    const result = await checkDuplicates({
      email: formData.email,
      phone: formData.phone
    });

    if (result.hasDuplicates) {
      setDuplicates(result.clients);
      setShowDuplicateWarning(true);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for duplicates
      const noDuplicates = await handleCheckDuplicates();
      
      if (!noDuplicates && !showDuplicateWarning) {
        setIsSubmitting(false);
        return;
      }

      // Add client
      const result = await quickAddClient(formData);

      if (result) {
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          source: CLIENT_SOURCE.WALKIN,
          notes: ''
        });
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error adding client:', error);
      setErrors({ submit: 'Erro ao adicionar cliente' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Force add despite duplicates
  const handleForceAdd = async () => {
    setShowDuplicateWarning(false);
    setIsSubmitting(true);

    try {
      const result = await quickAddClient(formData);

      if (result) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          source: CLIENT_SOURCE.WALKIN,
          notes: ''
        });
        
        if (onSuccess) {
          onSuccess(result);
        }

        onClose();
      }
    } catch (error) {
      console.error('Error adding client:', error);
      setErrors({ submit: 'Erro ao adicionar cliente' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <UserPlusIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Adicionar Cliente Rápido
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Capture informações básicas do cliente
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Duplicate Warning */}
          {showDuplicateWarning && (
            <div className="mb-4 rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Possível duplicado encontrado
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Clientes com dados similares já existem:</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      {duplicates.map(client => (
                        <li key={client.id}>
                          {client.name} - {client.email || client.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      onClick={handleForceAdd}
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-700"
                    >
                      Adicionar mesmo assim
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDuplicateWarning(false)}
                      className="text-sm font-medium text-gray-600 hover:text-gray-500"
                    >
                      Editar informações
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Required) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  placeholder="João Silva"
                  autoFocus
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.phone ? 'border-red-300' : ''
                  }`}
                  placeholder="912 345 678"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="joao.silva@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Fonte
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="source"
                  id="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value={CLIENT_SOURCE.WALKIN}>Loja</option>
                  <option value={CLIENT_SOURCE.WEBSITE}>Website</option>
                  <option value={CLIENT_SOURCE.REFERRAL}>Referência</option>
                  <option value={CLIENT_SOURCE.SOCIAL}>Redes Sociais</option>
                  <option value={CLIENT_SOURCE.COLDCALL}>Chamada Fria</option>
                  <option value={CLIENT_SOURCE.ADVERTISEMENT}>Publicidade</option>
                  <option value={CLIENT_SOURCE.OTHER}>Outro</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pt-3 pl-3">
                  <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Procura T2 na zona de Lisboa..."
                />
              </div>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2 sm:text-sm"
              >
                {isSubmitting ? 'A adicionar...' : 'Adicionar Cliente'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
              >
                Cancelar
              </button>
            </div>

            {/* Quick tip */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              💡 Dica: Pode completar o perfil do cliente mais tarde
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}