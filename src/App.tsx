// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { TenantProvider } from './contexts/TenantContext';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { ClientList } from './components/clients/ClientList';
import { ClientForm } from './components/clients/ClientForm';
import { ClientDetail } from './components/clients/ClientDetail';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import './index.css';

// Auth wrapper component
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 const { user, loading } = useAuth();

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <LoadingSpinner size="lg" text="A inicializar..." />
     </div>
   );
 }

 if (!user) {
   // In production, redirect to login page
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="text-center">
         <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
         <p className="text-gray-600">Please sign in to continue</p>
         {/* TODO: Implement login component */}
       </div>
     </div>
   );
 }

 return (
   <TenantProvider user={user}>
     {children}
   </TenantProvider>
 );
};

// Protected routes wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 return (
   <AppLayout>
     {children}
   </AppLayout>
 );
};

// Main App component
const App: React.FC = () => {
 return (
   <ThemeProvider>
     <I18nProvider>
       <Router>
         <AuthWrapper>
           <Routes>
             {/* Dashboard */}
             <Route 
               path="/" 
               element={
                 <ProtectedRoute>
                   <Navigate to="/dashboard" replace />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/dashboard" 
               element={
                 <ProtectedRoute>
                   <DashboardHome />
                 </ProtectedRoute>
               } 
             />

             {/* Clients Routes */}
             <Route 
               path="/clients" 
               element={
                 <ProtectedRoute>
                   <ClientList />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/clients/new" 
               element={
                 <ProtectedRoute>
                   <ClientForm />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/clients/:clientId" 
               element={
                 <ProtectedRoute>
                   <ClientDetail />
                 </ProtectedRoute>
               } 
             />
             <Route 
               path="/clients/:clientId/edit" 
               element={
                 <ProtectedRoute>
                   <ClientForm />
                 </ProtectedRoute>
               } 
             />

             {/* Leads Routes - TODO */}
             <Route 
               path="/leads" 
               element={
                 <ProtectedRoute>
                   <div className="p-6">
                     <h1 className="text-2xl font-bold">Leads</h1>
                     <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                   </div>
                 </ProtectedRoute>
               } 
             />

             {/* Deals Routes - TODO */}
             <Route 
               path="/deals" 
               element={
                 <ProtectedRoute>
                   <div className="p-6">
                     <h1 className="text-2xl font-bold">Negócios</h1>
                     <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                   </div>
                 </ProtectedRoute>
               } 
             />

             {/* Documents Routes - TODO */}
             <Route 
               path="/documents" 
               element={
                 <ProtectedRoute>
                   <div className="p-6">
                     <h1 className="text-2xl font-bold">Documentos</h1>
                     <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                   </div>
                 </ProtectedRoute>
               } 
             />

             {/* Reports Routes - TODO */}
             <Route 
               path="/reports" 
               element={
                 <ProtectedRoute>
                   <div className="p-6">
                     <h1 className="text-2xl font-bold">Relatórios</h1>
                     <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                   </div>
                 </ProtectedRoute>
               } 
             />

             {/* Settings Routes - TODO */}
             <Route 
               path="/settings" 
               element={
                 <ProtectedRoute>
                   <div className="p-6">
                     <h1 className="text-2xl font-bold">Configurações</h1>
                     <p className="text-gray-600 mt-2">Em desenvolvimento...</p>
                   </div>
                 </ProtectedRoute>
               } 
             />

             {/* 404 Route */}
             <Route 
               path="*" 
               element={
                 <ProtectedRoute>
                   <div className="p-6 text-center">
                     <h1 className="text-2xl font-bold mb-4">Página não encontrada</h1>
                     <p className="text-gray-600 mb-4">
                       A página que procura não existe ou foi movida.
                     </p>
                     <Navigate to="/dashboard" replace />
                   </div>
                 </ProtectedRoute>
               } 
             />
           </Routes>
         </AuthWrapper>
       </Router>
     </I18nProvider>
   </ThemeProvider>
 );
};

export default App;
