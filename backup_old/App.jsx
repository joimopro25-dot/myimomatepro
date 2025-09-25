import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
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

        {/* ===== FUTURAS ROTAS DO SISTEMA ===== */}
        {/* 
        Rotas planejadas para próximas fases:
        
        // SISTEMA DE LEADS
        <Route path="/leads" element={<ProtectedRoute><LeadList /></ProtectedRoute>} />
        <Route path="/leads/new" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
        <Route path="/leads/:leadId/edit" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
        
        // SISTEMA DE OPORTUNIDADES
        <Route path="/opportunities" element={<ProtectedRoute><OpportunityList /></ProtectedRoute>} />
        <Route path="/opportunities/new" element={<ProtectedRoute><OpportunityForm /></ProtectedRoute>} />
        <Route path="/opportunities/:opportunityId" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
        
        // SISTEMA DE DEALS
        <Route path="/deals" element={<ProtectedRoute><DealList /></ProtectedRoute>} />
        <Route path="/deals/new" element={<ProtectedRoute><DealForm /></ProtectedRoute>} />
        <Route path="/deals/:dealId" element={<ProtectedRoute><DealDetail /></ProtectedRoute>} />
        
        // SISTEMA DE RELATÓRIOS
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/reports/performance" element={<ProtectedRoute><PerformanceReport /></ProtectedRoute>} />
        <Route path="/reports/commissions" element={<ProtectedRoute><CommissionReport /></ProtectedRoute>} />
        
        // SISTEMA DE CONFIGURAÇÕES
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationSettings /></ProtectedRoute>} />
        */}

        {/* ===== ROTA FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

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