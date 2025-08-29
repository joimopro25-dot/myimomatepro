// src/components/layout/AppLayout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useTheme } from '../../hooks/useTheme';
import { useTenant } from '../../hooks/useTenant';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface AppLayoutProps {
 children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
 const { theme } = useTheme();
 const { loading, error, isSubscriptionActive } = useTenant();

 if (loading) {
   return (
     <div className=\"min-h-screen flex items-center justify-center\"
          style={{ backgroundColor: theme.colors.background.primary }}>
       <LoadingSpinner size=\"lg\" />
     </div>
   );
 }

 if (error) {
   return (
     <div className=\"min-h-screen flex items-center justify-center\"
          style={{ backgroundColor: theme.colors.background.primary }}>
       <div className=\"text-center p-8\">
         <h2 className=\"text-xl font-semibold mb-4\"
             style={{ color: theme.colors.text.primary }}>
           Erro ao carregar dados
         </h2>
         <p style={{ color: theme.colors.text.secondary }}>
           {error}
         </p>
       </div>
     </div>
   );
 }

 if (!isSubscriptionActive) {
   return (
     <div className=\"min-h-screen flex items-center justify-center\"
          style={{ backgroundColor: theme.colors.background.primary }}>
       <div className=\"text-center p-8\">
         <h2 className=\"text-xl font-semibold mb-4\"
             style={{ color: theme.colors.text.primary }}>
           Subscrição Expirada
         </h2>
         <p style={{ color: theme.colors.text.secondary }}>
           Por favor, renove a sua subscrição para continuar.
         </p>
       </div>
     </div>
   );
 }

 return (
   <div className=\"h-screen flex overflow-hidden\"
        style={{ backgroundColor: theme.colors.background.primary }}>
     
     {/* Sidebar */}
     <div className=\"flex-shrink-0\">
       <Sidebar />
     </div>

     {/* Main content area */}
     <div className=\"flex-1 flex flex-col overflow-hidden\">
       
       {/* Header */}
       <Header />
       
       {/* Page content */}
       <main className=\"flex-1 overflow-auto\"
             style={{ backgroundColor: theme.colors.background.secondary }}>
         <div className=\"h-full\">
           <ErrorBoundary>
             {children}
           </ErrorBoundary>
         </div>
       </main>
     </div>
   </div>
 );
};
