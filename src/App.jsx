import React from 'react'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          MyImoMatePro
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sistema de gestão imobiliária
        </p>
        
        <div className="space-y-3">
          <button className="btn-primary w-full">
            Iniciar Projeto
          </button>
          
          <button className="btn-outline w-full">
            Ver Configurações
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          ✅ React + Vite + Tailwind configurado!
        </div>
      </div>
    </div>
  )
}

export default App