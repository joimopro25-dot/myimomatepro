/**
 * APP.JSX - MyImoMatePro
 * Main application with all routes and providers
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ClientProvider } from './contexts/ClientContext';
import { OpportunityProvider } from './contexts/OpportunityContext';
import { DealProvider } from './contexts/DealContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Protected Pages - Dashboard
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';

// Protected Pages - Clients
import ClientList from './pages/ClientList';
import ClientForm from './pages/ClientForm';
import ClientView from './pages/ClientView';

// Protected Pages - Buyer Opportunities
import OpportunityList from './pages/OpportunityList';
import OpportunityView from './pages/OpportunityView';
import BuyerOpportunityForm from './pages/BuyerOpportunityForm';

// Protected Pages - Seller Opportunities
import SellerOpportunitiesBoard from './pages/SellerOpportunities/SellerOpportunitiesBoard';
import NewSellerOpportunity from './pages/SellerOpportunities/NewSellerOpportunity';
import SellerOpportunityView from './pages/SellerOpportunityView';

// ADD: Calendar page
import CalendarPage from './pages/CalendarPage';

// ✅ NEW: Email Hub
import EmailHub from './components/EmailHub/EmailHub';

// Protected Pages - Deals
import DealList from './pages/DealList';
import DealBoard from './pages/DealBoard';

// Deal single view & Commissions (moved to components as requested)
import DealView from './components/DealView';
import CommissionDashboard from './components/CommissionDashboard';
import SellerDealBoard from './components/SellerDealBoard'; // Added

// Add Google OAuth provider import and client ID
import { GoogleOAuthProvider } from '@react-oauth/google';
const GOOGLE_CLIENT_ID = '1049091148333-601scem4d8c7ek4d5ikvehugjv89jsj7.apps.googleusercontent.com';

// Styles
import './index.css';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" />;
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

        {/* ===== PROTECTED ROUTES - BUYER OPPORTUNITY SYSTEM ===== */}
        
        {/* All opportunities list (buyers + sellers) */}
        <Route path="/opportunities" element={
          <ProtectedRoute>
            <OpportunityList />
          </ProtectedRoute>
        } />

        {/* Buyer opportunity detail view */}
        <Route path="/clients/:clientId/opportunities/:opportunityId" element={
          <ProtectedRoute>
            <OpportunityView />
          </ProtectedRoute>
        } />

        {/* Buyer opportunity edit form */}
        <Route path="/clients/:clientId/opportunities/:opportunityId/edit" element={
          <ProtectedRoute>
            <BuyerOpportunityForm />
          </ProtectedRoute>
        } />

        {/* ===== PROTECTED ROUTES - SELLER OPPORTUNITY SYSTEM ===== */}
        
        {/* Seller opportunities board */}
        <Route path="/seller-opportunities" element={
          <ProtectedRoute>
            <SellerOpportunitiesBoard />
          </ProtectedRoute>
        } />

        {/* New seller opportunity form */}
        <Route path="/clients/:clientId/seller-opportunities/new" element={
          <ProtectedRoute>
            <NewSellerOpportunity />
          </ProtectedRoute>
        } />

        {/* Seller opportunity detail view */}
        <Route path="/clients/:clientId/seller-opportunities/:opportunityId" element={
          <ProtectedRoute>
            <SellerOpportunityView />
          </ProtectedRoute>
        } />

        {/* ===== PROTECTED ROUTES - SELLER DEAL BOARD (NEW) ===== */}
        <Route
          path="/seller-deals"
          element={
            <ProtectedRoute>
              <SellerDealBoard
                onUpdateDeal={(deal) => console.log('Deal updated:', deal)}
                onDeleteDeal={(dealId) => console.log('Deal deleted:', dealId)}
                onAddDeal={() => console.log('Add new deal')}
              />
            </ProtectedRoute>
          }
        />

        {/* ===== PROTECTED ROUTES - DEALS SYSTEM ===== */}
        <Route path="/deals" element={
          <ProtectedRoute>
            <DealList />
          </ProtectedRoute>
        } />
        <Route path="/clients/:clientId/opportunities/:opportunityId/deals" element={
            <ProtectedRoute>
              <DealBoard />
            </ProtectedRoute>
        } />
        <Route path="/clients/:clientId/deals/:dealId" element={
          <ProtectedRoute>
            <DealView />
          </ProtectedRoute>
        } />

        {/* Commissions dashboard */}
        <Route path="/commissions" element={
          <ProtectedRoute>
            <CommissionDashboard />
          </ProtectedRoute>
        } />

        {/* ===== PROTECTED ROUTES - CALENDAR ===== */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />

        {/* ===== ✅ NEW: EMAIL HUB ROUTE ===== */}
        <Route path="/emails" element={
          <ProtectedRoute>
            <EmailHub />
          </ProtectedRoute>
        } />

        {/* ===== FALLBACK ROUTE - 404 ===== */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
    </GoogleOAuthProvider>
  );
}

export default App;