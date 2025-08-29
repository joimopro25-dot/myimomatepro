// src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Check, AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import { registerUser } from '../firebase/auth';

const Register = ({ onBack, onSuccess }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Ler plano da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get('plan');
    if (planFromUrl && ['basic', 'pro', 'unlimited'].includes(planFromUrl)) {
      setSelectedPlan(planFromUrl);
    }
  }, []);

  const plans = {
    basic: {
      name: 'Basic',
      price: '€29',
      clientLimit: '50',
      features: ['Até 50 clientes', 'Gestão básica', 'Dashboard simples', 'Suporte email']
    },
    pro: {
      name: 'Pro',
      price: '€59',
      clientLimit: '150',
      features: ['Até 150 clientes', 'Gestão avançada', 'Dashboard completo', 'Pipeline vendas']
    },
    unlimited: {
      name: 'Unlimited Pro',
      price: '€99',
      clientLimit: 'Ilimitados',
      features: ['Clientes ilimitados', 'Todas funcionalidades', 'API access', 'Suporte 24/7']
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'Password é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve ter pelo menos 6 caracteres';
    }

    // Confirmar password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme a password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords não coincidem';
    }

    // Validar empresa
    if (!formData.company.trim()) {
      newErrors.company = 'Nome da empresa é obrigatório';
    }

    // Validar telefone
    const phoneRegex = /^[0-9\s\+\-\(\)]{9,}$/;
    if (!formData.phone) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }

    // Validar termos
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Deve aceitar os termos e condições';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Registar utilizador com Firebase Auth
      const user = await registerUser(formData.email, formData.password, formData.name);
      
      // Aqui depois vamos adicionar lógica para:
      // 1. Criar tenant no Firestore
      // 2. Configurar plano selecionado
      // 3. Enviar email de boas-vindas
      
      console.log('User registered:', user);
      console.log('Selected plan:', selectedPlan);
      console.log('Company data:', {
        company: formData.company,
        phone: formData.phone
      });

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(user, selectedPlan);
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      // Tratar erros específicos do Firebase
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está registado. Tente fazer login.';
        setErrors({ email: errorMessage });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password muito fraca. Use pelo menos 6 caracteres.';
        setErrors({ password: errorMessage });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
        setErrors({ email: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">MyImoMatePro</span>
            </div>
            <button 
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
          </div>
        </div>
      </header>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Plano Selecionado */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Plano Selecionado</h2>
              
              <div className="border-2 border-indigo-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{currentPlan.price}</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">Até {currentPlan.clientLimit} clientes</p>
                
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <Check className="h-4 w-4 inline mr-1" />
                  14 dias de teste grátis - Sem compromisso
                </p>
              </div>
            </div>

            {/* Formulário de Registo */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Conta</h2>

              {errors.general && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-600">{errors.general}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="João Silva"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="joao@exemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirmar Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Repita a password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Empresa */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.company ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Imobiliária Silva & Associados"
                  />
                  {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+351 912 345 678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Termos e Condições */}
                <div className="flex items-start">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-3">
                    <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                      Aceito os{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-500">
                        Termos e Condições
                      </a>{' '}
                      e{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-500">
                        Política de Privacidade
                      </a>
                    </label>
                    {errors.agreeTerms && <p className="text-sm text-red-600 mt-1">{errors.agreeTerms}</p>}
                  </div>
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta e Começar Teste Grátis'
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Já tem conta?{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Faça login aqui
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;