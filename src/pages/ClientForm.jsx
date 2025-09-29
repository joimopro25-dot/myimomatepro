/**
 * CLIENT FORM PAGE - MyImoMatePro
 * Simplified form for creating and editing clients
 * Single page with collapsible sections
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClients } from '../contexts/ClientContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  UsersIcon,
  CurrencyEuroIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import {
  createClientModel,
  validateClient,
  formatPhone,
  formatNIF,
  formatCC,
  calculateTotalHousehold,
  CLIENT_OPTIONS
} from '../models/clientModel';

export default function ClientForm() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    createClient,
    updateClient,
    getClient,
    checkDuplicate,
    loading,
    error,
    clearError
  } = useClients();

  const isEditMode = Boolean(clientId);

  // Form data state
  const [formData, setFormData] = useState(createClientModel(currentUser?.uid));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    spouse: false,
    financial: false,
    management: false
  });

  // Load client data if editing
  useEffect(() => {
    if (isEditMode && clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      const client = await getClient(clientId);
      if (client) {
        setFormData(client);
        // Auto-expand spouse section if married
        if (client.maritalStatus === 'married' || client.maritalStatus === 'union') {
          setExpandedSections(prev => ({ ...prev, spouse: true }));
        }
      }
    } catch (err) {
      console.error('Error loading client:', err);
      navigate('/clients');
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle input changes
  const handleChange = (field, value) => {
    const fields = field.split('.');
    
    if (fields.length === 1) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (fields.length === 2) {
      setFormData(prev => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0]],
          [fields[1]]: value
        }
      }));
    } else if (fields.length === 3) {
      setFormData(prev => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0]],
          [fields[1]]: {
            ...prev[fields[0]][fields[1]],
            [fields[2]]: value
          }
        }
      }));
    }

    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-calculate total household income
    if (field === 'financial.monthlyIncome' || field === 'financial.spouseMonthlyIncome') {
      const monthlyIncome = field === 'financial.monthlyIncome' 
        ? value 
        : formData.financial.monthlyIncome;
      const spouseIncome = field === 'financial.spouseMonthlyIncome'
        ? value
        : formData.financial.spouseMonthlyIncome;
      
      const total = calculateTotalHousehold(monthlyIncome, spouseIncome);
      setFormData(prev => ({
        ...prev,
        financial: {
          ...prev.financial,
          totalHousehold: total
        }
      }));
    }

    // Auto-format inputs (only if value changed)
    if (field === 'phone' || field === 'spouse.phone') {
      const formatted = formatPhone(value);
      if (formatted !== value) {
        setFormData(prev => {
          const fields = field.split('.');
          if (fields.length === 1) {
            return { ...prev, [field]: formatted };
          } else {
            return {
              ...prev,
              [fields[0]]: { ...prev[fields[0]], [fields[1]]: formatted }
            };
          }
        });
        return; // Exit to prevent recursion
      }
    }

    if (field === 'nif' || field === 'spouse.nif') {
      const formatted = formatNIF(value);
      if (formatted !== value) {
        setFormData(prev => {
          const fields = field.split('.');
          if (fields.length === 1) {
            return { ...prev, [field]: formatted };
          } else {
            return {
              ...prev,
              [fields[0]]: { ...prev[fields[0]], [fields[1]]: formatted }
            };
          }
        });
        return; // Exit to prevent recursion
      }
    }

    if (field === 'cc' || field === 'spouse.cc') {
      const formatted = formatCC(value);
      if (formatted !== value) {
        setFormData(prev => {
          const fields = field.split('.');
          if (fields.length === 1) {
            return { ...prev, [field]: formatted };
          } else {
            return {
              ...prev,
              [fields[0]]: { ...prev[fields[0]], [fields[1]]: formatted }
            };
          }
        });
        return; // Exit to prevent recursion
      }
    }
  };

  // Check for duplicates
  const checkForDuplicates = async () => {
    if (!isEditMode && formData.nif) {
      const isDuplicate = await checkDuplicate('nif', formData.nif);
      if (isDuplicate) {
        setDuplicateWarning('Um cliente com este NIF já existe');
        return true;
      }
    }
    return false;
  };

  // Handle tag selection
  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    try {
      // Validate form
      const validation = validateClient(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        // Scroll to first error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Check duplicates
      if (await checkForDuplicates()) {
        setIsSubmitting(false);
        return;
      }

      // Submit form
      if (isEditMode) {
        await updateClient(clientId, formData);
      } else {
        const newClientId = await createClient(formData);
        // Navigate to the new client's view
        navigate(`/clients/${newClientId}`);
        return;
      }

      // Success - navigate back to list
      navigate('/clients');
    } catch (err) {
      console.error('Error saving client:', err);
      setIsSubmitting(false);
    }
  };

  // Should show spouse section
  const showSpouseSection = formData.maritalStatus === 'married' || formData.maritalStatus === 'union';

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/clients"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Editar Cliente' : 'Novo Cliente'}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? 'Atualizar informações do cliente' : 'Adicionar novo cliente à carteira'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {(error || duplicateWarning) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {duplicateWarning ? 'Cliente Duplicado' : 'Erro'}
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {duplicateWarning || error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Essential Information - Always visible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Informações Essenciais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+351 xxx xxx xxx"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIF
                </label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => handleChange('nif', e.target.value)}
                  placeholder="xxx xxx xxx"
                  maxLength="11"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nif ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nif && (
                  <p className="mt-1 text-sm text-red-600">{errors.nif}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferência de Contacto
                </label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => handleChange('contactPreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CLIENT_OPTIONS.contactPreference.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Melhor Hora para Contacto
                </label>
                <input
                  type="text"
                  value={formData.bestContactTime}
                  onChange={(e) => handleChange('bestContactTime', e.target.value)}
                  placeholder="Ex: 9h-12h, após 18h"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Personal Details - Collapsible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection('personal')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                Dados Pessoais
              </h2>
              {expandedSections.personal ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.personal && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Naturalidade
                    </label>
                    <input
                      type="text"
                      value={formData.birthPlace}
                      onChange={(e) => handleChange('birthPlace', e.target.value)}
                      placeholder="Cidade de nascimento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cartão Cidadão
                    </label>
                    <input
                      type="text"
                      value={formData.cc}
                      onChange={(e) => handleChange('cc', e.target.value)}
                      placeholder="12345678 9 ZZ0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Validade CC
                    </label>
                    <input
                      type="date"
                      value={formData.ccValidity || ''}
                      onChange={(e) => handleChange('ccValidity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => handleChange('profession', e.target.value)}
                      placeholder="Ex: Engenheiro Civil"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil
                    </label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => {
                        handleChange('maritalStatus', e.target.value);
                        // Auto-expand spouse section if married/union
                        if (e.target.value === 'married' || e.target.value === 'union') {
                          setExpandedSections(prev => ({ ...prev, spouse: true }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CLIENT_OPTIONS.maritalStatus.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showSpouseSection && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regime de Casamento
                      </label>
                      <select
                        value={formData.marriageRegime}
                        onChange={(e) => handleChange('marriageRegime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {CLIENT_OPTIONS.marriageRegime.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Morada</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleChange('address.street', e.target.value)}
                        placeholder="Rua/Avenida, Número"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => handleChange('address.postalCode', e.target.value)}
                        placeholder="Código Postal"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleChange('address.city', e.target.value)}
                        placeholder="Cidade"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spouse Information - Only show if married/union */}
          {showSpouseSection && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                type="button"
                onClick={() => toggleSection('spouse')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2 text-pink-600" />
                  Dados do Cônjuge
                </h2>
                {expandedSections.spouse ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSections.spouse && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Cônjuge
                      </label>
                      <input
                        type="text"
                        value={formData.spouse.name}
                        onChange={(e) => handleChange('spouse.name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone do Cônjuge
                      </label>
                      <input
                        type="tel"
                        value={formData.spouse.phone}
                        onChange={(e) => handleChange('spouse.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email do Cônjuge
                      </label>
                      <input
                        type="email"
                        value={formData.spouse.email}
                        onChange={(e) => handleChange('spouse.email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIF do Cônjuge
                      </label>
                      <input
                        type="text"
                        value={formData.spouse.nif}
                        onChange={(e) => handleChange('spouse.nif', e.target.value)}
                        maxLength="11"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CC do Cônjuge
                      </label>
                      <input
                        type="text"
                        value={formData.spouse.cc}
                        onChange={(e) => handleChange('spouse.cc', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validade CC Cônjuge
                      </label>
                      <input
                        type="date"
                        value={formData.spouse.ccValidity || ''}
                        onChange={(e) => handleChange('spouse.ccValidity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Nascimento Cônjuge
                      </label>
                      <input
                        type="date"
                        value={formData.spouse.birthDate || ''}
                        onChange={(e) => handleChange('spouse.birthDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Naturalidade Cônjuge
                      </label>
                      <input
                        type="text"
                        value={formData.spouse.birthPlace}
                        onChange={(e) => handleChange('spouse.birthPlace', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profissão do Cônjuge
                      </label>
                      <input
                        type="text"
                        value={formData.spouse.profession}
                        onChange={(e) => handleChange('spouse.profession', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Information - Collapsible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection('financial')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CurrencyEuroIcon className="w-5 h-5 mr-2 text-green-600" />
                Qualificação Financeira
              </h2>
              {expandedSections.financial ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.financial && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rendimento Mensal (€)
                    </label>
                    <input
                      type="number"
                      value={formData.financial.monthlyIncome}
                      onChange={(e) => handleChange('financial.monthlyIncome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {showSpouseSection && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rendimento Cônjuge (€)
                      </label>
                      <input
                        type="number"
                        value={formData.financial.spouseMonthlyIncome}
                        onChange={(e) => handleChange('financial.spouseMonthlyIncome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Agregado (€)
                    </label>
                    <input
                      type="number"
                      value={formData.financial.totalHousehold}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                      disabled
                      readOnly
                    />
                  </div>
                </div>

                {/* Loans */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasLoans"
                      checked={formData.financial.hasLoans}
                      onChange={(e) => handleChange('financial.hasLoans', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasLoans" className="ml-2 text-sm font-medium text-gray-700">
                      Tem créditos ativos
                    </label>
                  </div>

                  {formData.financial.hasLoans && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Prestações Mensais (€)
                      </label>
                      <input
                        type="number"
                        value={formData.financial.monthlyLoanPayments}
                        onChange={(e) => handleChange('financial.monthlyLoanPayments', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Pre-approval */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasPreApproval"
                      checked={formData.financial.hasPreApproval}
                      onChange={(e) => handleChange('financial.hasPreApproval', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasPreApproval" className="ml-2 text-sm font-medium text-gray-700">
                      Tem pré-aprovação bancária
                    </label>
                  </div>

                  {formData.financial.hasPreApproval && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Banco
                        </label>
                        <input
                          type="text"
                          value={formData.financial.preApprovalBank}
                          onChange={(e) => handleChange('financial.preApprovalBank', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Montante Aprovado (€)
                        </label>
                        <input
                          type="number"
                          value={formData.financial.preApprovalAmount}
                          onChange={(e) => handleChange('financial.preApprovalAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Relationship Management - Collapsible */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection('management')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <TagIcon className="w-5 h-5 mr-2 text-purple-600" />
                Gestão de Relacionamento
              </h2>
              {expandedSections.management ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.management && (
              <div className="px-6 pb-6 border-t border-gray-100">
                {/* Lead Source */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Como nos conheceu?
                  </label>
                  <select
                    value={formData.leadSource}
                    onChange={(e) => handleChange('leadSource', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CLIENT_OPTIONS.leadSource.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_OPTIONS.tags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Contact */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Próximo Contacto
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextContactDate || ''}
                    onChange={(e) => handleChange('nextContactDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Internal Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => handleChange('internalNotes', e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observações privadas sobre o cliente..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* GDPR Consent */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentCheckIcon className="w-5 h-5 mr-2 text-red-600" />
              Consentimento GDPR
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  checked={formData.gdprConsent}
                  onChange={(e) => handleChange('gdprConsent', e.target.checked)}
                  className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="gdprConsent" className="ml-3 text-sm text-gray-700">
                  <span className="font-medium">
                    Consentimento para Tratamento de Dados Pessoais *
                  </span>
                  <p className="mt-1 text-gray-600">
                    Consinto no tratamento dos meus dados pessoais para fins de prestação de serviços imobiliários,
                    conforme descrito na Política de Privacidade.
                  </p>
                </label>
              </div>
              {errors.gdprConsent && (
                <p className="mt-2 text-sm text-red-600 ml-7">{errors.gdprConsent}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Link
              to="/clients"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>

            <div className="space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    A guardar...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {isEditMode ? 'Atualizar Cliente' : 'Criar Cliente'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
