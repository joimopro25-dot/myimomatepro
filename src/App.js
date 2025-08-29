// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const handlePlanSelection = (planId) => {
    // Navegar para registro com plano selecionado
    window.location.href = `/register?plan=${planId}`;
  };

  const handleRegistrationSuccess = (user, plan) => {
    // Após registo bem-sucedido, navegar para dashboard
    console.log('Registration successful:', { user, plan });
    window.location.href = '/dashboard';
  };

  const handleLoginSuccess = (user) => {
    // Após login bem-sucedido, navegar para dashboard
    console.log('Login successful:', user);
    window.location.href = '/dashboard';
  };

  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing Page - Página inicial */}
          <Route 
            path="/" 
            element={
              <LandingPage 
                onPlanSelect={handlePlanSelection}
                onLoginClick={() => window.location.href = '/login'}
              />
            } 
          />
          
          {/* Página de Registo */}
          <Route 
            path="/register" 
            element={
              <Register 
                onBack={handleBackToLanding}
                onSuccess={handleRegistrationSuccess}
              />
            } 
          />
          
          {/* Página de Login */}
          <Route 
            path="/login" 
            element={
              <Login 
                onBack={handleBackToLanding}
                onSuccess={handleLoginSuccess}
                onRegisterClick={() => window.location.href = '/register'}
              />
            } 
          />
          
          {/* Dashboard - Área protegida */}
          <Route 
            path="/dashboard" 
            element={<Dashboard />} 
          />
          
          {/* Rota 404 - Redirecionar para landing */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Página não encontrada</p>
                  <button 
                    onClick={handleBackToLanding}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
                  >
                    Voltar ao Início
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;