/**
 * APP COMPONENT - RealEstateCRM Pro
 * Main application component with all providers and routing
 * Multi-tenant CRM with complete error handling and i18n
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ToastProvider, useToast } from './contexts/ToastContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages - Protected
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';

// Styles
import './index.css';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" replace />;
}

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }
  
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
}

/**
 * Email Verification Check Component
 * Shows verification reminder if email is not verified
 */
function EmailVerificationCheck({ children }) {
  const { currentUser, isEmailVerified, resendVerificationEmail } = useAuth();
  const { warning } = useToast();
  const [sending, setSending] = React.useState(false);
  
  const handleResendVerification = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      warning('Email de verificação enviado. Verifique a sua caixa de entrada.');
    } catch (error) {
      console.error('Error sending verification email:', error);
    } finally {
      setSending(false);
    }
  };
  
  if (currentUser && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Verification Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <p className="text-amber-800">
                O seu email ainda não foi verificado. 
                Algumas funcionalidades podem estar limitadas.
              </p>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className="text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
            >
              {sending ? 'A enviar...' : 'Reenviar email'}
            </button>
          </div>
        </div>
        
        {/* Main content */}
        {children}
      </div>
    );
  }
  
  return children;
}

/**
 * App Routes Component
 * Defines all application routes
 */
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

        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* ===== PROTECTED ROUTES ===== */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <Dashboard />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        <Route path="/account" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <AccountSettings />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        {/* ===== CLIENT ROUTES (PHASE 2) ===== */}
        {/* 
        <Route path="/clients" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <ClientList />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        <Route path="/clients/new" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <ClientForm />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <ClientDetail />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        <Route path="/clients/:clientId/edit" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <ClientForm />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />
        */}

        {/* ===== PROPERTY ROUTES (PHASE 3) ===== */}
        {/* 
        <Route path="/properties" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <PropertyList />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />
        */}

        {/* ===== PARTNER ROUTES (PHASE 4) ===== */}
        {/* 
        <Route path="/partners" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <PartnerList />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />
        */}

        {/* ===== OPPORTUNITIES & DEALS ROUTES (PHASE 5) ===== */}
        {/* 
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <OpportunityList />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />

        <Route path="/deals" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <DealList />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />
        */}

        {/* ===== REPORTS ROUTES (PHASE 6) ===== */}
        {/* 
        <Route path="/reports" element={
          <ProtectedRoute>
            <EmailVerificationCheck>
              <Reports />
            </EmailVerificationCheck>
          </ProtectedRoute>
        } />
        */}

        {/* ===== 404 FALLBACK ===== */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Página não encontrada
              </h2>
              <p className="text-gray-600 mb-8">
                A página que procura não existe ou foi movida.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

/**
 * Main App Component
 * Wraps the application with all necessary providers
 */
function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <LoadingProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <AppRoutes />
              </SubscriptionProvider>
            </AuthProvider>
          </LoadingProvider>
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;