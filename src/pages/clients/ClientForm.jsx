/**
 * CLIENT FORM - RealEstateCRM Pro
 * Multi-step form for complete client profiles
 * Part 1: Basic structure and personal information steps
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, Phone, Mail, Calendar, MapPin, CreditCard, 
  Briefcase, Heart, Home, Tag, ChevronLeft, ChevronRight,
  Save, AlertCircle, CheckCircle, Users, FileText,
  Globe, Building, Euro, Clock, Target
} from 'lucide-react';
import { useClients } from '../../contexts/ClientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  validateNIF, 
  validatePhone, 
  validateEmail, 
  validatePostalCode,
  validateCCNumber 
} from '../../utils/validation';
import { RELATIONSHIP_STATUS } from '../../models/clientModel';
import { portugalDistricts } from '../../utils/portugalAddress';
import { Home, ShoppingCart, Building, Key, TrendingUp, Hammer, Settings } from 'lucide-react';

// Qualification types with icons and descriptions
const QUALIFICATION_TYPES = {
  buyer: {
    label: 'Buyer',
    icon: ShoppingCart,
    description: 'Looking to purchase property'
  },
  seller: {
    label: 'Seller',
    icon: Home,
    description: 'Has property to sell'
  },
  landlord: {
    label: 'Landlord',
    icon: Building,
    description: 'Has property to rent'
  },
  tenant: {
    label: 'Tenant',
    icon: Key,
    description: 'Looking to rent property'
  },
  investor: {
    label: 'Investor',
    icon: TrendingUp,
    description: 'Interested in investment properties'
  },
  developer: {
    label: 'Developer',
    icon: Hammer,
    description: 'Property development projects'
  },
  propertyManager: {
    label: 'Property Manager',
    icon: Settings,
    description: 'Needs property management services'
  }
};

// Form steps
const FORM_STEPS = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'contact', label: 'Contact & Address', icon: MapPin },
  { id: 'professional', label: 'Professional', icon: Briefcase },
  { id: 'spouse', label: 'Spouse/Partner', icon: Heart },
  { id: 'qualifications', label: 'Qualifications', icon: Target },
  { id: 'metadata', label: 'Additional Info', icon: Tag }
];

export function ClientForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { createClient, updateClient, getClientById } = useClients();

  const isEditMode = !!id;

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    ccNumber: '',
    ccExpiryDate: '',
    nif: '',
    dateOfBirth: '',
    birthPlace: { city: '', country: 'Portugal' },
    naturality: '',
    nationality: 'Portuguese',
    
    // Contact & Address
    phone: '',
    alternativePhone: '',
    whatsapp: '',
    email: '',
    alternativeEmail: '',
    address: {
      street: '',
      number: '',
      floor: '',
      side: '',
      postalCode: '',
      city: '',
      parish: '',
      municipality: '',
      district: '',
      country: 'Portugal'
    },
    
    // Professional
    occupation: '',
    company: '',
    annualIncome: '',
    
    // Relationship & Spouse
    relationshipStatus: 'single',
    spouse: {
      name: '',
      ccNumber: '',
      ccExpiryDate: '',
      nif: '',
      dateOfBirth: '',
      nationality: 'Portuguese',
      phone: '',
      email: '',
      occupation: '',
      annualIncome: ''
    },
    
    // Qualifications
    qualifications: [],
    
    // Metadata
    source: 'walkin',
    referredBy: '',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load client data if editing
  useEffect(() => {
    if (isEditMode && id) {
      loadClientData(id);
    }
  }, [id]);

  const loadClientData = async (clientId) => {
    try {
      const client = await getClientById(clientId);
      if (client) {
        setFormData(client);
      }
    } catch (error) {
      console.error('Error loading client:', error);
    }
  };

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
    
    // Clear error for this field
    const errorKey = section ? `${section}.${field}` : field;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateStep = (stepId) => {
    const stepErrors = {};

    switch (stepId) {
      case 'personal':
        if (!formData.name.trim()) {
          stepErrors.name = 'Name is required';
        }
        if (formData.ccNumber && !validateCCNumber(formData.ccNumber)) {
          stepErrors.ccNumber = 'Invalid CC number format';
        }
        if (formData.nif && !validateNIF(formData.nif)) {
          stepErrors.nif = 'Invalid NIF format';
        }
        if (!formData.dateOfBirth) {
          stepErrors.dateOfBirth = 'Date of birth is required';
        }
        break;

      case 'contact':
        if (!formData.phone && !formData.email) {
          stepErrors.contact = 'At least one contact method is required';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
          stepErrors.phone = 'Invalid phone number';
        }
        if (formData.email && !validateEmail(formData.email)) {
          stepErrors.email = 'Invalid email address';
        }
        if (formData.address.postalCode && !validatePostalCode(formData.address.postalCode)) {
          stepErrors['address.postalCode'] = 'Invalid postal code format (XXXX-XXX)';
        }
        break;

      case 'spouse':
        if (formData.relationshipStatus === 'married' && formData.spouse.name) {
          if (formData.spouse.nif && !validateNIF(formData.spouse.nif)) {
            stepErrors['spouse.nif'] = 'Invalid spouse NIF';
          }
          if (formData.spouse.email && !validateEmail(formData.spouse.email)) {
            stepErrors['spouse.email'] = 'Invalid spouse email';
          }
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    const currentStepId = FORM_STEPS[currentStep].id;
    if (validateStep(currentStepId)) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all steps
    let allValid = true;
    for (const step of FORM_STEPS) {
      if (!validateStep(step.id)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (isEditMode) {
        result = await updateClient(id, formData);
      } else {
        result = await createClient(formData);
      }

      if (result) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/clients/${result.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {FORM_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </button>
              
              {index < FORM_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <h3 className="text-lg font-medium text-gray-900">
          {t(`clients.form.steps.${FORM_STEPS[currentStep].id}.title`)}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {t(`clients.form.steps.${FORM_STEPS[currentStep].id}.description`)}
        </p>
      </div>
    </div>
  );

  const renderPersonalStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.name')} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange(null, 'name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="João Silva"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* CC Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.ccNumber')}
          </label>
          <input
            type="text"
            value={formData.ccNumber}
            onChange={(e) => handleInputChange(null, 'ccNumber', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.ccNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="12345678"
            maxLength="8"
          />
          {errors.ccNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.ccNumber}</p>
          )}
        </div>

        {/* CC Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.ccExpiryDate')}
          </label>
          <input
            type="date"
            value={formData.ccExpiryDate}
            onChange={(e) => handleInputChange(null, 'ccExpiryDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* NIF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.nif')}
          </label>
          <input
            type="text"
            value={formData.nif}
            onChange={(e) => handleInputChange(null, 'nif', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.nif ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123456789"
            maxLength="9"
          />
          {errors.nif && (
            <p className="mt-1 text-sm text-red-600">{errors.nif}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.dateOfBirth')} *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange(null, 'dateOfBirth', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Birth City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.birthCity')}
          </label>
          <input
            type="text"
            value={formData.birthPlace.city}
            onChange={(e) => handleInputChange('birthPlace', 'city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Lisboa"
          />
        </div>

        {/* Birth Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.birthCountry')}
          </label>
          <input
            type="text"
            value={formData.birthPlace.country}
            onChange={(e) => handleInputChange('birthPlace', 'country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Portugal"
          />
        </div>

        {/* Naturality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.naturality')}
          </label>
          <input
            type="text"
            value={formData.naturality}
            onChange={(e) => handleInputChange(null, 'naturality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Lisboeta"
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.nationality')}
          </label>
          <select
            value={formData.nationality}
            onChange={(e) => handleInputChange(null, 'nationality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="Portuguese">Portuguese</option>
            <option value="Brazilian">Brazilian</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="British">British</option>
            <option value="American">American</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange(null, 'phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+351 912 345 678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Alternative Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.alternativePhone')}
            </label>
            <input
              type="tel"
              value={formData.alternativePhone}
              onChange={(e) => handleInputChange(null, 'alternativePhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="+351 212 345 678"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.whatsapp')}
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange(null, 'whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="+351 912 345 678"
            />
          </div>

          {/* Primary Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(null, 'email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Alternative Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.alternativeEmail')}
            </label>
            <input
              type="email"
              value={formData.alternativeEmail}
              onChange={(e) => handleInputChange(null, 'alternativeEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="alternative@example.com"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Street */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.street')}
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address', 'street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Rua do Exemplo"
            />
          </div>

          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.number')}
            </label>
            <input
              type="text"
              value={formData.address.number}
              onChange={(e) => handleInputChange('address', 'number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="123"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.floor')}
            </label>
            <input
              type="text"
              value={formData.address.floor}
              onChange={(e) => handleInputChange('address', 'floor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="3º"
            />
          </div>

          {/* Side */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.side')}
            </label>
            <select
              value={formData.address.side}
              onChange={(e) => handleInputChange('address', 'side', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select...</option>
              <option value="Esq">Esquerdo</option>
              <option value="Dir">Direito</option>
              <option value="Fte">Frente</option>
              <option value="Tras">Traseiras</option>
              <option value="Centro">Centro</option>
            </select>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.postalCode')}
            </label>
            <input
              type="text"
              value={formData.address.postalCode}
              onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors['address.postalCode'] ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1234-567"
              maxLength="8"
            />
            {errors['address.postalCode'] && (
              <p className="mt-1 text-sm text-red-600">{errors['address.postalCode']}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.city')}
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleInputChange('address', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Lisboa"
            />
          </div>

          {/* Parish */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.parish')}
            </label>
            <input
              type="text"
              value={formData.address.parish}
              onChange={(e) => handleInputChange('address', 'parish', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Freguesia"
            />
          </div>

          {/* Municipality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.municipality')}
            </label>
            <input
              type="text"
              value={formData.address.municipality}
              onChange={(e) => handleInputChange('address', 'municipality', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Concelho"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.district')}
            </label>
            <select
              value={formData.address.district}
              onChange={(e) => handleInputChange('address', 'district', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select district...</option>
              {portugalDistricts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.country')}
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleInputChange('address', 'country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Portugal"
            />
          </div>
        </div>
      </div>

      {errors.contact && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errors.contact}</p>
        </div>
      )}
    </div>
  );

  const renderProfessionalStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.occupation')}
          </label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => handleInputChange(null, 'occupation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Software Developer"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.company')}
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange(null, 'company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Tech Company Ltd."
          />
        </div>

        {/* Annual Income */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.annualIncome')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Euro className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.annualIncome}
              onChange={(e) => handleInputChange(null, 'annualIncome', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="50000"
            />
          </div>
        </div>
      </div>

      {/* Income Range Helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Income Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
          <div>• &lt; €20k: Entry level</div>
          <div>• €20-40k: Middle</div>
          <div>• €40-80k: Upper middle</div>
          <div>• &gt; €80k: High</div>
        </div>
      </div>
    </div>
  );

  const renderSpouseStep = () => (
    <div className="space-y-6">
      {/* Relationship Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('clients.fields.relationshipStatus')}
        </label>
        <select
          value={formData.relationshipStatus}
          onChange={(e) => handleInputChange(null, 'relationshipStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {Object.entries(RELATIONSHIP_STATUS).map(([key, value]) => (
            <option key={key} value={value}>
              {t(`clients.relationshipStatus.${value}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Show spouse fields only if married or partnership */}
      {(formData.relationshipStatus === 'married' || formData.relationshipStatus === 'partnership') && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Spouse/Partner Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spouse Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseName')}
              </label>
              <input
                type="text"
                value={formData.spouse.name}
                onChange={(e) => handleInputChange('spouse', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Maria Silva"
              />
            </div>

            {/* Spouse CC Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseCC')}
              </label>
              <input
                type="text"
                value={formData.spouse.ccNumber}
                onChange={(e) => handleInputChange('spouse', 'ccNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="87654321"
                maxLength="8"
              />
            </div>

            {/* Spouse NIF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseNIF')}
              </label>
              <input
                type="text"
                value={formData.spouse.nif}
                onChange={(e) => handleInputChange('spouse', 'nif', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors['spouse.nif'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="987654321"
                maxLength="9"
              />
              {errors['spouse.nif'] && (
                <p className="mt-1 text-sm text-red-600">{errors['spouse.nif']}</p>
              )}
            </div>

            {/* Spouse Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseDOB')}
              </label>
              <input
                type="date"
                value={formData.spouse.dateOfBirth}
                onChange={(e) => handleInputChange('spouse', 'dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Spouse Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseNationality')}
              </label>
              <select
                value={formData.spouse.nationality}
                onChange={(e) => handleInputChange('spouse', 'nationality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Portuguese">Portuguese</option>
                <option value="Brazilian">Brazilian</option>
                <option value="Spanish">Spanish</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Spouse Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spousePhone')}
              </label>
              <input
                type="tel"
                value={formData.spouse.phone}
                onChange={(e) => handleInputChange('spouse', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="+351 912 345 678"
              />
            </div>

            {/* Spouse Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseEmail')}
              </label>
              <input
                type="email"
                value={formData.spouse.email}
                onChange={(e) => handleInputChange('spouse', 'email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                  errors['spouse.email'] ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="spouse@example.com"
              />
              {errors['spouse.email'] && (
                <p className="mt-1 text-sm text-red-600">{errors['spouse.email']}</p>
              )}
            </div>

            {/* Spouse Occupation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseOccupation')}
              </label>
              <input
                type="text"
                value={formData.spouse.occupation}
                onChange={(e) => handleInputChange('spouse', 'occupation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Teacher"
              />
            </div>

            {/* Spouse Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('clients.fields.spouseIncome')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Euro className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.spouse.annualIncome}
                  onChange={(e) => handleInputChange('spouse', 'annualIncome', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="30000"
                />
              </div>
            </div>
          </div>

          {/* Option to create spouse as separate client */}
          {formData.spouse.name && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 After creating this client, you can create the spouse as a separate client profile for better management.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderQualificationsStep = () => {
    const toggleQualification = (type) => {
      const existing = formData.qualifications.find(q => q.type === type);
      if (existing) {
        setFormData(prev => ({
          ...prev,
          qualifications: prev.qualifications.filter(q => q.type !== type)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          qualifications: [...prev.qualifications, { type, active: true, preferences: {} }]
        }));
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Select the qualifications that apply to this client. Each qualification will automatically create an opportunity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(QUALIFICATION_TYPES).map(([key, value]) => {
            const isSelected = formData.qualifications.some(q => q.type === key);
            const Icon = value.icon;
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleQualification(key)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <Icon className={`w-5 h-5 mr-3 mt-0.5 ${
                    isSelected ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                  <div className="text-left">
                    <h4 className={`font-medium ${
                      isSelected ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {value.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {value.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {formData.qualifications.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">
              Selected Qualifications ({formData.qualifications.length})
            </h4>
            <p className="text-sm text-green-800">
              {formData.qualifications.length} {formData.qualifications.length === 1 ? 'opportunity' : 'opportunities'} will be created automatically.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMetadataStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('clients.fields.source')}
          </label>
          <select
            value={formData.source}
            onChange={(e) => handleInputChange(null, 'source', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="coldcall">Cold Call</option>
            <option value="walkin">Walk-in</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Referred By */}
        {formData.source === 'referral' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clients.fields.referredBy')}
            </label>
            <input
              type="text"
              value={formData.referredBy}
              onChange={(e) => handleInputChange(null, 'referredBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Name of referrer"
            />
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('clients.fields.tags')}
        </label>
        <input
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => handleInputChange(null, 'tags', e.target.value.split(',').map(t => t.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="vip, investor, urgent (comma separated)"
        />
        <p className="mt-1 text-sm text-gray-500">
          Separate tags with commas
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('clients.fields.notes')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Additional notes about the client..."
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (FORM_STEPS[currentStep].id) {
      case 'personal':
        return renderPersonalStep();
      case 'contact':
        return renderContactStep();
      case 'professional':
        return renderProfessionalStep();
      case 'spouse':
        return renderSpouseStep();
      case 'qualifications':
        return renderQualificationsStep();
      case 'metadata':
        return renderMetadataStep();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Clients
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Client' : 'New Client'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode 
            ? 'Update client information' 
            : 'Create a complete client profile with all details'
          }
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-green-800">
            Client {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Content */}
          <div className="mt-8">
            {renderCurrentStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handlePrevious}
              className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                currentStep === 0 ? 'invisible' : ''
              }`}
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              {currentStep === FORM_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-1" />
                      {isEditMode ? 'Update Client' : 'Create Client'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  disabled={isSubmitting}
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}