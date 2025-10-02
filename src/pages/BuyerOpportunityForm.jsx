/**
 * BUYER OPPORTUNITY FORM - MyImoMatePro
 * Multi-step form for qualifying buyer opportunities
 * FIXED: Proper edit mode support with client data loading
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOpportunities } from '../contexts/OpportunityContext';
import { useClients } from '../contexts/ClientContext';
import {
  PROPERTY_TYPES,
  PROPERTY_PURPOSE,
  URGENCY_LEVELS,
  CURRENT_SITUATION,
  PROPERTY_FEATURES,
  validateBuyerOpportunity,
  formatPrice
} from '../models/opportunityModel';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  HomeIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const BuyerOpportunityForm = ({ clientId: propClientId, clientName: propClientName, onComplete, onCancel }) => {
  const navigate = useNavigate();
  const { clientId: urlClientId, opportunityId } = useParams();
  const clientId = propClientId || urlClientId;
  const isEditMode = !!opportunityId;

  const { 
    createBuyerOpportunity, 
    updateBuyerOpportunity,
    getOpportunity,
    loading, 
    error: contextError 
  } = useOpportunities();
  
  const { getClient } = useClients();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [clientName, setClientName] = useState(propClientName || '');
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);
  
  // Initialize form data with proper defaults to avoid null values
  const getInitialFormData = () => ({
    title: '',
    status: 'active',
    qualification: {
      budget: {
        minPrice: '',
        maxPrice: '',
        idealPrice: '',
        hasFinancing: false,
        financingApproved: false,
        financingAmount: '',
        bankName: '',
        downPaymentAvailable: '',
        monthlyPaymentCapacity: '',
        needsSaleProceeds: false
      },
      requirements: {
        propertyTypes: [],
        purpose: 'primary_residence',
        bedrooms: { min: 1, max: '' },
        bathrooms: { min: 1, max: '' },
        area: { min: '', max: '' },
        preferredLocations: [],
        excludedLocations: [],
        maxDistanceToWork: '',
        workAddress: '',
        mustHaveFeatures: [],
        niceToHaveFeatures: [],
        dealBreakers: [],
        maxFloor: '',
        minFloor: '',
        maxBuildingAge: '',
        renovationNeeded: 'any'
      },
      timeline: {
        urgency: 'flexible',
        idealMoveDate: '',
        currentSituation: '',
        currentSituationDetails: '',
        motivationToBuy: '',
        viewingAvailability: [],
        decisionMakers: '',
        preApprovedForViewing: false
      }
    },
    internalNotes: '',
    clientExpectations: '',
    consultantStrategy: ''
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load opportunity and client data for editing
  useEffect(() => {
    let isMounted = true; // Prevent state updates if unmounted
    
    const loadData = async () => {
      if (!isEditMode || !opportunityId || !clientId) return;
      
      setIsLoadingData(true);
      try {
        // Load opportunity data
        const oppData = await getOpportunity(clientId, opportunityId);
        if (oppData && isMounted) {
          // Normalize data to ensure no null values
          const normalizedData = normalizeFormData(oppData);
          setFormData(normalizedData);
        }
        
        // Load client data if not provided via props
        if (!propClientName && isMounted) {
          const clientData = await getClient(clientId);
          if (clientData) {
            setClientName(clientData.name || 'Cliente');
          }
        }
      } catch (e) {
        console.error('Error loading data for edit:', e);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false; // Cleanup
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, opportunityId, clientId, propClientName]); // Removed getOpportunity and getClient

  // Normalize form data to replace null/undefined with empty strings
  const normalizeFormData = (data) => {
    const initial = getInitialFormData();
    
    // Deep merge with defaults to ensure no null values
    const normalized = {
      ...initial,
      ...data,
      title: data.title || '',
      status: data.status || 'active',
      qualification: {
        budget: {
          ...initial.qualification.budget,
          ...(data.qualification?.budget || {}),
          minPrice: data.qualification?.budget?.minPrice || '',
          maxPrice: data.qualification?.budget?.maxPrice || '',
          idealPrice: data.qualification?.budget?.idealPrice || '',
          financingAmount: data.qualification?.budget?.financingAmount || '',
          bankName: data.qualification?.budget?.bankName || '',
          downPaymentAvailable: data.qualification?.budget?.downPaymentAvailable || '',
          monthlyPaymentCapacity: data.qualification?.budget?.monthlyPaymentCapacity || ''
        },
        requirements: {
          ...initial.qualification.requirements,
          ...(data.qualification?.requirements || {}),
          propertyTypes: data.qualification?.requirements?.propertyTypes || [],
          preferredLocations: data.qualification?.requirements?.preferredLocations || [],
          excludedLocations: data.qualification?.requirements?.excludedLocations || [],
          mustHaveFeatures: data.qualification?.requirements?.mustHaveFeatures || [],
          niceToHaveFeatures: data.qualification?.requirements?.niceToHaveFeatures || [],
          dealBreakers: data.qualification?.requirements?.dealBreakers || [],
          workAddress: data.qualification?.requirements?.workAddress || '',
          maxDistanceToWork: data.qualification?.requirements?.maxDistanceToWork || '',
          maxFloor: data.qualification?.requirements?.maxFloor || '',
          minFloor: data.qualification?.requirements?.minFloor || '',
          maxBuildingAge: data.qualification?.requirements?.maxBuildingAge || '',
          bedrooms: {
            min: data.qualification?.requirements?.bedrooms?.min || 1,
            max: data.qualification?.requirements?.bedrooms?.max || ''
          },
          bathrooms: {
            min: data.qualification?.requirements?.bathrooms?.min || 1,
            max: data.qualification?.requirements?.bathrooms?.max || ''
          },
          area: {
            min: data.qualification?.requirements?.area?.min || '',
            max: data.qualification?.requirements?.area?.max || ''
          }
        },
        timeline: {
          ...initial.qualification.timeline,
          ...(data.qualification?.timeline || {}),
          viewingAvailability: data.qualification?.timeline?.viewingAvailability || [],
          idealMoveDate: data.qualification?.timeline?.idealMoveDate || '',
          currentSituationDetails: data.qualification?.timeline?.currentSituationDetails || '',
          motivationToBuy: data.qualification?.timeline?.motivationToBuy || '',
          decisionMakers: data.qualification?.timeline?.decisionMakers || ''
        }
      },
      internalNotes: data.internalNotes || '',
      clientExpectations: data.clientExpectations || '',
      consultantStrategy: data.consultantStrategy || ''
    };
    
    return normalized;
  };

  // Handle field changes with nested object support
  const handleFieldChange = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear validation error for this field
    if (validationErrors[path]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  }, [validationErrors]);

  // Handle array fields (property types, features, etc.)
  const handleArrayToggle = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const fieldName = keys[keys.length - 1];
      const currentArray = current[fieldName] || [];
      
      if (currentArray.includes(value)) {
        current[fieldName] = currentArray.filter(item => item !== value);
      } else {
        current[fieldName] = [...currentArray, value];
      }
      
      return newData;
    });
  }, []);

  // Validate current step
  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1: // Budget
        if (!formData.qualification.budget.maxPrice) {
          errors['budget.maxPrice'] = 'Preço máximo é obrigatório';
        }
        if (formData.qualification.budget.hasFinancing && !formData.qualification.budget.downPaymentAvailable) {
          errors['budget.downPaymentAvailable'] = 'Entrada disponível é obrigatória quando há financiamento';
        }
        break;
        
      case 2: // Requirements
        if (formData.qualification.requirements.propertyTypes.length === 0) {
          errors['requirements.propertyTypes'] = 'Selecione pelo menos um tipo de imóvel';
        }
        break;
        
      case 3: // Location & Features
        if (formData.qualification.requirements.preferredLocations.length === 0) {
          errors['requirements.preferredLocations'] = 'Adicione pelo menos uma localização preferida';
        }
        break;
        
      case 4: // Timeline
        if (!formData.qualification.timeline.urgency) {
          errors['timeline.urgency'] = 'Urgência é obrigatória';
        }
        if (!formData.qualification.timeline.currentSituation) {
          errors['timeline.currentSituation'] = 'Situação atual é obrigatória';
        }
        break;
    }
    
    return errors;
  };

  // Navigation
  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors({});

    try {
      const validation = validateBuyerOpportunity(formData);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      if (isEditMode) {
        await updateBuyerOpportunity(clientId, opportunityId, formData);
        if (onComplete) {
          onComplete(opportunityId);
        } else {
          navigate(`/clients/${clientId}/opportunities/${opportunityId}`);
        }
      } else {
        const newOpportunityId = await createBuyerOpportunity(clientId, formData);
        if (onComplete) {
          onComplete(newOpportunityId);
        } else {
          navigate(`/clients/${clientId}/opportunities/${newOpportunityId}`);
        }
      }
    } catch (err) {
      console.error('Error saving opportunity:', err);
      setIsSubmitting(false);
    }
  };

  // Location management
  const [newLocation, setNewLocation] = useState('');
  const handleAddLocation = (type) => {
    if (!newLocation.trim()) return;
    
    const path = type === 'preferred' 
      ? 'qualification.requirements.preferredLocations'
      : 'qualification.requirements.excludedLocations';
    
    handleFieldChange(path, [
      ...formData.qualification.requirements[type === 'preferred' ? 'preferredLocations' : 'excludedLocations'],
      newLocation.trim()
    ]);
    setNewLocation('');
  };

  const handleRemoveLocation = (type, index) => {
    const path = type === 'preferred' 
      ? 'qualification.requirements.preferredLocations'
      : 'qualification.requirements.excludedLocations';
    
    const current = type === 'preferred'
      ? formData.qualification.requirements.preferredLocations
      : formData.qualification.requirements.excludedLocations;
    
    handleFieldChange(path, current.filter((_, i) => i !== index));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBudgetStep();
      case 2:
        return renderRequirementsStep();
      case 3:
        return renderLocationFeaturesStep();
      case 4:
        return renderTimelineStep();
      default:
        return null;
    }
  };

  // Step 1: Budget & Financing
  const renderBudgetStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CurrencyEuroIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Orçamento e Financiamento</h2>
        <p className="text-gray-600 mt-2">Vamos definir a capacidade financeira do comprador</p>
      </div>

      {/* Opportunity Title */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Identificação da Oportunidade</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título/Descrição da Oportunidade *
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Ex: T3 Lisboa para família, Investimento em terreno Sintra, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Identifique claramente esta oportunidade para distinguir de outras
          </p>
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Faixa de Preço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Mínimo (€)
            </label>
            <input
              type="number"
              value={formData.qualification.budget.minPrice || ''}
              onChange={(e) => handleFieldChange('qualification.budget.minPrice', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="150000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Máximo (€) *
            </label>
            <input
              type="number"
              value={formData.qualification.budget.maxPrice || ''}
              onChange={(e) => handleFieldChange('qualification.budget.maxPrice', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                validationErrors['budget.maxPrice'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="250000"
            />
            {validationErrors['budget.maxPrice'] && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['budget.maxPrice']}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preço Ideal (€)
            </label>
            <input
              type="number"
              value={formData.qualification.budget.idealPrice || ''}
              onChange={(e) => handleFieldChange('qualification.budget.idealPrice', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="200000"
            />
          </div>
        </div>
      </div>

      {/* Financing */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financiamento</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.qualification.budget.hasFinancing}
                onChange={(e) => handleFieldChange('qualification.budget.hasFinancing', e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-gray-700">Necessita financiamento</span>
            </label>
            
            {formData.qualification.budget.hasFinancing && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.qualification.budget.financingApproved}
                  onChange={(e) => handleFieldChange('qualification.budget.financingApproved', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-700">Financiamento pré-aprovado</span>
              </label>
            )}
          </div>

          {formData.qualification.budget.hasFinancing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Financiamento (€)
                </label>
                <input
                  type="number"
                  value={formData.qualification.budget.financingAmount || ''}
                  onChange={(e) => handleFieldChange('qualification.budget.financingAmount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="180000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  value={formData.qualification.budget.bankName || ''}
                  onChange={(e) => handleFieldChange('qualification.budget.bankName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Nome do banco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrada Disponível (€) *
                </label>
                <input
                  type="number"
                  value={formData.qualification.budget.downPaymentAvailable || ''}
                  onChange={(e) => handleFieldChange('qualification.budget.downPaymentAvailable', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                    validationErrors['budget.downPaymentAvailable'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
                {validationErrors['budget.downPaymentAvailable'] && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors['budget.downPaymentAvailable']}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidade Mensal (€)
                </label>
                <input
                  type="number"
                  value={formData.qualification.budget.monthlyPaymentCapacity || ''}
                  onChange={(e) => handleFieldChange('qualification.budget.monthlyPaymentCapacity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="1200"
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.qualification.budget.needsSaleProceeds}
                onChange={(e) => handleFieldChange('qualification.budget.needsSaleProceeds', e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-gray-700">Depende da venda de outro imóvel</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Property Requirements
  const renderRequirementsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HomeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Requisitos do Imóvel</h2>
        <p className="text-gray-600 mt-2">Que tipo de imóvel o cliente procura?</p>
      </div>

      {/* Property Types */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tipo de Imóvel *
          {validationErrors['requirements.propertyTypes'] && (
            <span className="text-red-500 text-sm ml-2 font-normal">
              {validationErrors['requirements.propertyTypes']}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(type => (
            <label
              key={type.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.requirements.propertyTypes.includes(type.value)
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.qualification.requirements.propertyTypes.includes(type.value)}
                onChange={() => handleArrayToggle('qualification.requirements.propertyTypes', type.value)}
                className="sr-only"
              />
              <span className="text-xl mr-2">{type.icon}</span>
              <span className="text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Finalidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROPERTY_PURPOSE.map(purpose => (
            <label
              key={purpose.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.requirements.purpose === purpose.value
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="purpose"
                value={purpose.value}
                checked={formData.qualification.requirements.purpose === purpose.value}
                onChange={(e) => handleFieldChange('qualification.requirements.purpose', e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{purpose.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Requirements */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quartos (mín)</label>
            <input
              type="number"
              min="0"
              value={formData.qualification.requirements.bedrooms.min || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.bedrooms.min', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quartos (máx)</label>
            <input
              type="number"
              min="0"
              value={formData.qualification.requirements.bedrooms.max || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.bedrooms.max', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WCs (mín)</label>
            <input
              type="number"
              min="0"
              value={formData.qualification.requirements.bathrooms.min || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.bathrooms.min', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WCs (máx)</label>
            <input
              type="number"
              min="0"
              value={formData.qualification.requirements.bathrooms.max || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.bathrooms.max', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área Mínima (m²)</label>
            <input
              type="number"
              value={formData.qualification.requirements.area.min || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.area.min', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="80"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área Máxima (m²)</label>
            <input
              type="number"
              value={formData.qualification.requirements.area.max || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.area.max', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="150"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Andar Mínimo</label>
            <input
              type="number"
              value={formData.qualification.requirements.minFloor || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.minFloor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Andar Máximo</label>
            <input
              type="number"
              value={formData.qualification.requirements.maxFloor || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.maxFloor', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idade Máxima (anos)</label>
            <input
              type="number"
              value={formData.qualification.requirements.maxBuildingAge || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.maxBuildingAge', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="20"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Aceita obras?</label>
          <select
            value={formData.qualification.requirements.renovationNeeded}
            onChange={(e) => handleFieldChange('qualification.requirements.renovationNeeded', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Indiferente</option>
            <option value="yes">Sim, procura para renovar</option>
            <option value="no">Não, só pronto a habitar</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 3: Location & Features
  const renderLocationFeaturesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Localização e Características</h2>
        <p className="text-gray-600 mt-2">Onde procura e o que é importante?</p>
      </div>

      {/* Preferred Locations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Localizações Preferidas *
          {validationErrors['requirements.preferredLocations'] && (
            <span className="text-red-500 text-sm ml-2 font-normal">
              {validationErrors['requirements.preferredLocations']}
            </span>
          )}
        </h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLocation('preferred')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Lisboa, Cascais, Oeiras..."
            />
            <button
              type="button"
              onClick={() => handleAddLocation('preferred')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.qualification.requirements.preferredLocations.map((location, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {location}
                <button
                  type="button"
                  onClick={() => handleRemoveLocation('preferred', index)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Work Distance */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distância ao Trabalho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço do Trabalho
            </label>
            <input
              type="text"
              value={formData.qualification.requirements.workAddress || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.workAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: Av. da Liberdade, Lisboa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distância Máxima (km ou min)
            </label>
            <input
              type="text"
              value={formData.qualification.requirements.maxDistanceToWork || ''}
              onChange={(e) => handleFieldChange('qualification.requirements.maxDistanceToWork', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Ex: 30 min ou 20 km"
            />
          </div>
        </div>
      </div>

      {/* Must Have Features */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Características Essenciais</h3>
        <p className="text-sm text-gray-600 mb-4">O que é absolutamente necessário?</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROPERTY_FEATURES.filter(f => f.category === 'essential').map(feature => (
            <label
              key={feature.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.requirements.mustHaveFeatures.includes(feature.value)
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.qualification.requirements.mustHaveFeatures.includes(feature.value)}
                onChange={() => handleArrayToggle('qualification.requirements.mustHaveFeatures', feature.value)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Nice to Have Features */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Características Desejáveis</h3>
        <p className="text-sm text-gray-600 mb-4">Seria bom ter, mas não é obrigatório</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PROPERTY_FEATURES.filter(f => f.category === 'comfort').map(feature => (
            <label
              key={feature.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.requirements.niceToHaveFeatures.includes(feature.value)
                  ? 'bg-blue-50 border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.qualification.requirements.niceToHaveFeatures.includes(feature.value)}
                onChange={() => handleArrayToggle('qualification.requirements.niceToHaveFeatures', feature.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Timeline & Notes
  const renderTimelineStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Timeline e Motivação</h2>
        <p className="text-gray-600 mt-2">Quando e porquê comprar?</p>
      </div>

      {/* Urgency */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Urgência *
          {validationErrors['timeline.urgency'] && (
            <span className="text-red-500 text-sm ml-2 font-normal">
              {validationErrors['timeline.urgency']}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {URGENCY_LEVELS.map(level => (
            <label
              key={level.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.timeline.urgency === level.value
                  ? `bg-${level.color}-50 border-${level.color}-500`
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={level.value}
                checked={formData.qualification.timeline.urgency === level.value}
                onChange={(e) => handleFieldChange('qualification.timeline.urgency', e.target.value)}
                className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span className="ml-2 text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Current Situation */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Situação Atual *
          {validationErrors['timeline.currentSituation'] && (
            <span className="text-red-500 text-sm ml-2 font-normal">
              {validationErrors['timeline.currentSituation']}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CURRENT_SITUATION.map(situation => (
            <label
              key={situation.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.qualification.timeline.currentSituation === situation.value
                  ? 'bg-orange-50 border-orange-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="situation"
                value={situation.value}
                checked={formData.qualification.timeline.currentSituation === situation.value}
                onChange={(e) => handleFieldChange('qualification.timeline.currentSituation', e.target.value)}
                className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span className="ml-2 text-gray-700">{situation.label}</span>
            </label>
          ))}
        </div>
        
        {formData.qualification.timeline.currentSituation && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalhes da Situação Atual
            </label>
            <input
              type="text"
              value={formData.qualification.timeline.currentSituationDetails || ''}
              onChange={(e) => handleFieldChange('qualification.timeline.currentSituationDetails', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Contrato termina em Março, casa dos pais, etc."
            />
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Adicionais</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Ideal para Mudança
            </label>
            <input
              type="date"
              value={formData.qualification.timeline.idealMoveDate || ''}
              onChange={(e) => handleFieldChange('qualification.timeline.idealMoveDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivação para Comprar
            </label>
            <textarea
              value={formData.qualification.timeline.motivationToBuy || ''}
              onChange={(e) => handleFieldChange('qualification.timeline.motivationToBuy', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Família crescendo, investimento, mudança de trabalho..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tomadores de Decisão
            </label>
            <input
              type="text"
              value={formData.qualification.timeline.decisionMakers || ''}
              onChange={(e) => handleFieldChange('qualification.timeline.decisionMakers', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Casal, precisa aprovação dos pais, decisão individual..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disponibilidade para Visitas
            </label>
            <div className="space-y-2">
              {[
                { value: 'weekdays', label: 'Dias de semana' },
                { value: 'weekends', label: 'Fins de semana' },
                { value: 'mornings', label: 'Manhãs' },
                { value: 'afternoons', label: 'Tardes' },
                { value: 'evenings', label: 'Noites' }
              ].map(time => (
                <label key={time.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.qualification.timeline.viewingAvailability.includes(time.value)}
                    onChange={() => handleArrayToggle('qualification.timeline.viewingAvailability', time.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-700">{time.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notas e Estratégia</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expectativas do Cliente
            </label>
            <textarea
              value={formData.clientExpectations || ''}
              onChange={(e) => handleFieldChange('clientExpectations', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="O que o cliente espera encontrar, preocupações, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estratégia do Consultor
            </label>
            <textarea
              value={formData.consultantStrategy || ''}
              onChange={(e) => handleFieldChange('consultantStrategy', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Como abordar este cliente, prioridades..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Internas
            </label>
            <textarea
              value={formData.internalNotes || ''}
              onChange={(e) => handleFieldChange('internalNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Observações privadas sobre o cliente ou oportunidade..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Progress indicator
  const renderProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
            >
              {currentStep > step ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-600">Orçamento</span>
        <span className="text-xs text-gray-600">Requisitos</span>
        <span className="text-xs text-gray-600">Localização</span>
        <span className="text-xs text-gray-600">Timeline</span>
      </div>
    </div>
  );

  // Show loading state while fetching data in edit mode
  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">A carregar dados da oportunidade...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onCancel || (() => navigate(-1))}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Editar Oportunidade de Compra' : 'Nova Oportunidade de Compra'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Cliente: <span className="font-medium">{clientName || 'A carregar...'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {contextError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{contextError}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {renderProgress()}

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={currentStep === 1 ? (onCancel || (() => navigate(-1))) : handlePrevious}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (isEditMode ? 'A guardar...' : 'A criar...') 
              : (isEditMode ? 'Guardar Alterações' : 'Criar Oportunidade')
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default BuyerOpportunityForm;