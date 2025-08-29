// src/components/common/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

interface ErrorBoundaryProps {
 children: ReactNode;
 fallback?: ReactNode;
}

interface ErrorBoundaryState {
 hasError: boolean;
 error?: Error;
 errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
 constructor(props: ErrorBoundaryProps) {
   super(props);
   this.state = { hasError: false };
 }

 static getDerivedStateFromError(error: Error): ErrorBoundaryState {
   return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
   this.setState({ error, errorInfo });
   
   // Log error to console in development
   if (process.env.NODE_ENV === 'development') {
     console.error('ErrorBoundary caught an error:', error, errorInfo);
   }
   
   // TODO: Send error to monitoring service in production
   // logErrorToService(error, errorInfo);
 }

 handleRetry = () => {
   this.setState({ hasError: false, error: undefined, errorInfo: undefined });
 };

 render() {
   if (this.state.hasError) {
     if (this.props.fallback) {
       return this.props.fallback;
     }

     return (
       <div className=\"min-h-64 flex items-center justify-center p-8\">
         <div className=\"text-center max-w-md\">
           <div className=\"mb-4 flex justify-center\">
             <AlertTriangleIcon className=\"w-12 h-12 text-red-500\" />
           </div>
           
           <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">
             Algo correu mal
           </h3>
           
           <p className=\"text-gray-600 mb-6\">
             Ocorreu um erro inesperado. Por favor, tente novamente.
           </p>
           
           <button
             onClick={this.handleRetry}
             className=\"inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors\"
           >
             <RefreshCwIcon className=\"w-4 h-4 mr-2\" />
             Tentar novamente
           </button>
           
           {process.env.NODE_ENV === 'development' && this.state.error && (
             <details className=\"mt-6 text-left\">
               <summary className=\"cursor-pointer text-sm text-gray-500 hover:text-gray-700\">
                 Detalhes técnicos
               </summary>
               <div className=\"mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto\">
                 <pre>{this.state.error.toString()}</pre>
                 {this.state.errorInfo?.componentStack && (
                   <pre className=\"mt-2 text-gray-600\">
                     {this.state.errorInfo.componentStack}
                   </pre>
                 )}
               </div>
             </details>
           )}
         </div>
       </div>
     );
   }

   return this.props.children;
 }
}

// Hook version for functional components
export const useErrorHandler = () => {
 const handleError = (error: Error, errorInfo?: any) => {
   console.error('Error caught by useErrorHandler:', error, errorInfo);
   
   // TODO: Send to monitoring service
   // logErrorToService(error, errorInfo);
 };

 return { handleError };
};

// Simple error fallback component
export const SimpleErrorFallback: React.FC<{ 
 error?: Error; 
 resetError?: () => void; 
}> = ({ error, resetError }) => (
 <div className=\"p-4 bg-red-50 border border-red-200 rounded-md\">
   <div className=\"flex items-start\">
     <AlertTriangleIcon className=\"w-5 h-5 text-red-500 mt-0.5\" />
     <div className=\"ml-3 flex-1\">
       <h4 className=\"text-sm font-medium text-red-800\">
         Erro
       </h4>
       <p className=\"text-sm text-red-700 mt-1\">
         {error?.message || 'Ocorreu um erro inesperado'}
       </p>
       {resetError && (
         <button
           onClick={resetError}
           className=\"mt-2 text-sm text-red-600 hover:text-red-800 underline\"
         >
           Tentar novamente
         </button>
       )}
     </div>
   </div>
 </div>
);
