import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';
import { OpportunityProvider } from './contexts/OpportunityContext';
import { DealProvider } from './contexts/DealContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import ClientView from './pages/ClientView';
import OpportunityList from './pages/OpportunityList';
import OpportunityView from './pages/OpportunityView';
import DealList from './pages/DealList';
import DealBoard from './pages/DealBoard';
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
            <ClientView />
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId/edit" element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } />

        {/* ===== PROTECTED ROUTES - OPPORTUNITY SYSTEM ===== */}
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <OpportunityList />
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId/opportunities/:opportunityId" element={
          <ProtectedRoute>
            <OpportunityView />
          </ProtectedRoute>
        } />

        {/* ===== PROTECTED ROUTES - DEALS SYSTEM ===== */}
        {/* All deals overview */}
        <Route path="/deals" element={
          <ProtectedRoute>
            <DealList />
          </ProtectedRoute>
        } />

        {/* Deal board for specific opportunity */}
        <Route path="/clients/:clientId/opportunities/:opportunityId/deals" element={
          <ProtectedRoute>
            <DealBoard />
          </ProtectedRoute>
        } />

        {/* ===== FALLBACK ROUTE - MUST BE LAST ===== */}
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
          <OpportunityProvider>
            <DealProvider>
              <AppRoutes />
            </DealProvider>
          </OpportunityProvider>
        </ClientProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;