/**
 * APP.JSX - MyImoMatePro
 * Componente principal com rotas e providers
 * VERSÃO ATUALIZADA: Inclui suporte para Negócios Plenos
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
import NegocioPlenoList from './pages/negocioPleno/NegocioPlenoList';
import NegocioPlenoDetail from './pages/negocioPleno/NegocioPlenoDetail';
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

        {/* ===== ROTAS PROTEGIDAS - NEGÓCIOS PLENOS ===== */}

        {/* Lista de negócios plenos */}
        <Route path="/negocios-plenos" element={
          <ProtectedRoute>
            <NegocioPlenoList />
          </ProtectedRoute>
        } />

        {/* Detalhe do negócio pleno */}
        <Route path="/negocios-plenos/:negocioPlenoId" element={
          <ProtectedRoute>
            <NegocioPlenoDetail />
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

        {/* ===== IMPORTANTE: ROTAS DE OPORTUNIDADES ANTES DO CLIENT DETAIL ===== */}

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