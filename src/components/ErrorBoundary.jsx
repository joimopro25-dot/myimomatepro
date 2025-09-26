/**
 * ERROR BOUNDARY COMPONENT - RealEstateCRM Pro
 * Catches JavaScript errors anywhere in the component tree
 */

import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to error reporting service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error, errorInfo) {
    // TODO: Send error to logging service
    // Example: Sentry, LogRocket, etc.
    console.error('Logging error to service:', {
      message: error.toString(),
      stack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Optionally reload the page after multiple errors
    if (this.state.errorCount > 3) {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Oops! Algo correu mal
                </h1>
                <p className="text-gray-600 text-lg">
                  Encontrámos um erro inesperado. 
                  {this.state.errorCount > 1 && (
                    <span className="block mt-2 text-sm text-amber-600">
                      Este erro ocorreu {this.state.errorCount} vezes nesta sessão.
                    </span>
                  )}
                </p>
              </div>

              {/* Development Error Details */}
              {isDevelopment && this.state.error && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DocumentTextIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold text-gray-700">
                      Detalhes do Erro (Development)
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-sm font-mono text-red-600">
                        {this.state.error.toString()}
                      </p>
                    </div>
                    
                    {this.state.errorInfo && (
                      <details className="cursor-pointer">
                        <summary className="text-sm text-gray-600 hover:text-gray-800">
                          Ver stack trace
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Tentar Novamente</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Ir para Início</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  <span>Recarregar Página</span>
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Se o problema persistir, por favor contacte o suporte técnico.
                  {isDevelopment && (
                    <span className="block mt-1">
                      Verifique a consola do browser para mais detalhes.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for Error Boundary with fallback UI
export function ErrorBoundaryWrapper({ children, fallback }) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Hook to trigger error boundary (for testing)
export function useErrorHandler() {
  return (error) => {
    throw error;
  };
}

export default ErrorBoundary;