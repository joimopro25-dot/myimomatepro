// src/components/LandingPage.jsx
import React, { useState } from 'react';
import { Building2, Users, Star, Check, ArrowRight } from 'lucide-react';

const LandingPage = ({ onPlanSelect, onLoginClick }) => {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '€29',
      period: '/mês',
      clientLimit: '50',
      features: [
        'Até 50 clientes',
        'Gestão básica de propriedades',
        'Dashboard simples',
        'Suporte por email',
        'Backup semanal'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '€59',
      period: '/mês',
      clientLimit: '150',
      features: [
        'Até 150 clientes',
        'Gestão avançada de propriedades',
        'Dashboard completo com métricas',
        'Pipeline de vendas',
        'Relatórios detalhados',
        'Suporte prioritário',
        'Backup diário'
      ],
      popular: true
    },
    {
      id: 'unlimited',
      name: 'Unlimited Pro',
      price: '€99',
      period: '/mês',
      clientLimit: 'Ilimitados',
      features: [
        'Clientes ilimitados',
        'Todas as funcionalidades Pro',
        'Automações avançadas',
        'API access',
        'White-label disponível',
        'Suporte 24/7',
        'Backup em tempo real',
        'Gestor de conta dedicado'
      ],
      popular: false
    }
  ];

  const handleGetStarted = (planId) => {
    setSelectedPlan(planId);
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

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
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Funcionalidades
              </button>
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Preços
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium" onClick={handleLoginClick}>
                Entrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
            O CRM que os
            <span className="text-indigo-600 block">Consultores Imobiliários</span>
            merecem
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Gerencie clientes, propriedades e vendas numa única plataforma. 
            Aumente a sua produtividade e feche mais negócios.
          </p>
          <div className="flex justify-center items-center space-x-4 mb-12">
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              <span className="text-sm">Sem compromisso</span>
            </div>
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              <span className="text-sm">14 dias grátis</span>
            </div>
            <div className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              <span className="text-sm">Suporte em português</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo o que precisa para vender mais
            </h2>
            <p className="text-lg text-gray-600">
              Funcionalidades pensadas especificamente para o mercado imobiliário português
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestão de Clientes</h3>
              <p className="text-gray-600">
                Organize compradores e vendedores, acompanhe preferências e histórico de contactos.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Catálogo de Imóveis</h3>
              <p className="text-gray-600">
                Gerencie propriedades com fotos, características detalhadas e histórico de preços.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pipeline de Vendas</h3>
              <p className="text-gray-600">
                Acompanhe cada negócio desde o primeiro contacto até ao fecho da venda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para si
            </h2>
            <p className="text-lg text-gray-600">
              Comece grátis e cresça connosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white px-3 py-1 text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mb-6">Até {plan.clientLimit} clientes</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleGetStarted(plan.id)}
                    className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-indigo-400 mr-2" />
              <span className="text-lg font-semibold">MyImoMatePro</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 MyImoMatePro. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;