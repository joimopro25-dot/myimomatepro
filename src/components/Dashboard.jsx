// src/components/Dashboard.jsx
import React from 'react';
import { Building2, Users, Home, TrendingUp, LogOut } from 'lucide-react';

const Dashboard = () => {
  const handleLogout = () => {
    // Por agora apenas redireciona para landing page
    // Depois vamos implementar logout real
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
              <span className="text-2xl font-bold text-gray-900">MyImoMatePro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bem-vindo!</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo ao MyImoMatePro</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Propriedades</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ações Rápidas</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Adicionar Cliente</span>
              </button>

              <button className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <Home className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Adicionar Propriedade</span>
              </button>

              <button className="flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">Nova Venda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">
                Bem-vindo ao MyImoMatePro!
              </h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>
                  Está na área principal da sua aplicação. Aqui pode gerir os seus clientes, 
                  propriedades e acompanhar o progresso das suas vendas.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-4 text-sm">
                  <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Guia de Início Rápido
                  </a>
                  <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Contactar Suporte
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;