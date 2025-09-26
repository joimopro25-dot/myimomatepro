import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import './index.css';

// Component to protect authenticated routes
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Component to redirect already authenticated users
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
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

        {/* ===== PROTECTED ROUTES - DASHBOARD ===== */}
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

        {/* ===== PROTECTED ROUTES - CLIENT SYSTEM ===== */}
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
            <ClientList />
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId/edit" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        {/* ===== FUTURE SYSTEM ROUTES ===== */}
        {/* 
        Planned routes for next phases:
        
        // LEAD SYSTEM
        <Route path="/leads" element={<ProtectedRoute><LeadList /></ProtectedRoute>} />
        <Route path="/leads/new" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
        <Route path="/leads/:leadId/edit" element={<ProtectedRoute><LeadForm /></ProtectedRoute>} />
        
        // OPPORTUNITY SYSTEM
        <Route path="/opportunities" element={<ProtectedRoute><OpportunityList /></ProtectedRoute>} />
        <Route path="/opportunities/new" element={<ProtectedRoute><OpportunityForm /></ProtectedRoute>} />
        <Route path="/opportunities/:opportunityId" element={<ProtectedRoute><OpportunityDetail /></ProtectedRoute>} />
        
        // DEAL SYSTEM
        <Route path="/deals" element={<ProtectedRoute><DealList /></ProtectedRoute>} />
        <Route path="/deals/new" element={<ProtectedRoute><DealForm /></ProtectedRoute>} />
        <Route path="/deals/:dealId" element={<ProtectedRoute><DealDetail /></ProtectedRoute>} />
        
        // REPORTING SYSTEM
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/reports/performance" element={<ProtectedRoute><PerformanceReport /></ProtectedRoute>} />
        <Route path="/reports/commissions" element={<ProtectedRoute><CommissionReport /></ProtectedRoute>} />
        
        // SETTINGS SYSTEM
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/settings/integrations" element={<ProtectedRoute><IntegrationSettings /></ProtectedRoute>} />
        */}

        {/* ===== FALLBACK ROUTE ===== */}
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