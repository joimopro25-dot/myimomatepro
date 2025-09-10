/**
 * APP.JSX - MyImoMatePro
 * Router principal da aplicação
 * 
 * Caminho: src/App.jsx
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Dashboard e configurações
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';

// Sistema de Clientes
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import ClientDetail from './pages/ClientDetail';

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

        {/* ===== ROTAS PROTEGIDAS - SISTEMA DE CLIENTES ===== */}
        <Route path="/clients" element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        } />

        <Route path="/clients/new" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId" element={
          <ProtectedRoute>
            <ClientDetail />
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId/edit" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        {/* ===== ROTA FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Componente principal com todos os providers
function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ClientProvider>
          <AppRoutes />
        </ClientProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;