/**
 * APP.JSX - MyImoMatePro
 * Componente principal com rotas e providers
 * VERSÃO ATUALIZADA: Com suporte para Negócios Plenos
 * 
 * Caminho: src/App.jsx
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';
import { OpportunityProvider } from './contexts/OpportunityContext';
import { NegocioPlenoProvider } from './contexts/NegocioPlenoContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import ClientDetail from './pages/ClientDetail';
import OpportunityList from './pages/OpportunityList';
import OpportunityForm from './pages/opportunities/OpportunityForm';
import OpportunityDetail from './pages/OpportunityDetail';
// Páginas de Negócios Plenos - comentar se não existirem ainda
// import NegocioPlenosList from './pages/NegocioPlenosList';
// import NegocioPlenoPage from './pages/NegocioPlenoPage';
import './index.css';

// Componente para proteger rotas autenticadas
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Componente para redirecionar utilizadores já autenticados
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" />;
}

// Páginas placeholder temporárias (remover quando criar as páginas reais)
const NegocioPlenosList = () => {
  const navigate = React.useCallback(() => window.location.href = '/clients', []);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Negócios Plenos</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Página em desenvolvimento</p>
          <button
            onClick={navigate}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Ir para Clientes
          </button>
        </div>
      </div>
    </div>
  );
};

const NegocioPlenoPage = () => {
  const navigate = React.useCallback(() => window.location.href = '/clients', []);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Detalhes do Negócio Pleno</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Página em desenvolvimento</p>
          <button
            onClick={navigate}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ===== ROTAS PÚBLICAS ===== */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />

        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* ===== ROTAS PROTEGIDAS - DASHBOARD ===== */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/account" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />

        {/* ===== ROTAS PROTEGIDAS - SISTEMA DE CLIENTES ===== */}

        {/* Lista de todos os clientes */}
        <Route path="/clients" element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        } />

        {/* Novo cliente */}
        <Route path="/clients/new" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        {/* ===== ROTAS DE NEGÓCIOS PLENOS - CORRIGIDAS ===== */}

        {/* Lista de todos os negócios plenos - rota consistente com Dashboard */}
        <Route path="/negocio-pleno" element={
          <ProtectedRoute>
            <NegocioPlenosList />
          </ProtectedRoute>
        } />

        {/* Detalhe de um negócio pleno específico */}
        <Route path="/negocio-pleno/:negocioPlenoId" element={
          <ProtectedRoute>
            <NegocioPlenoPage />
          </ProtectedRoute>
        } />

        {/* ===== ROTAS DE OPORTUNIDADES ===== */}

        {/* Lista de todas as oportunidades */}
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <OpportunityList />
          </ProtectedRoute>
        } />

        {/* Oportunidades de um cliente específico */}
        <Route path="/clients/:clientId/opportunities" element={
          <ProtectedRoute>
            <OpportunityList />
          </ProtectedRoute>
        } />

        {/* Nova oportunidade para um cliente */}
        <Route path="/clients/:clientId/opportunities/new" element={
          <ProtectedRoute>
            <OpportunityForm />
          </ProtectedRoute>
        } />

        {/* Editar oportunidade */}
        <Route path="/clients/:clientId/opportunities/:opportunityId/edit" element={
          <ProtectedRoute>
            <OpportunityForm />
          </ProtectedRoute>
        } />

        {/* Detalhe da oportunidade */}
        <Route path="/clients/:clientId/opportunities/:opportunityId" element={
          <ProtectedRoute>
            <OpportunityDetail />
          </ProtectedRoute>
        } />

        {/* ===== ROTAS DE CLIENTE (DEPOIS DAS OPORTUNIDADES) ===== */}

        {/* Editar cliente */}
        <Route path="/clients/:clientId/edit" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        {/* Detalhe do cliente - DEVE SER A ÚLTIMA */}
        <Route path="/clients/:clientId" element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        } />

        {/* ===== ROTA CATCH-ALL - 404 ===== */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ClientProvider>
          <OpportunityProvider>
            <NegocioPlenoProvider>
              <AppRoutes />
            </NegocioPlenoProvider>
          </OpportunityProvider>
        </ClientProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;