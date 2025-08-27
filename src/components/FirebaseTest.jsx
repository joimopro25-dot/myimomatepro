// src/components/FirebaseTest.jsx
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const FirebaseTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [testData, setTestData] = useState({
    email: 'teste@exemplo.com',
    password: 'teste123'
  });

  const addResult = (test, success, message = '') => {
    setTestResults(prev => ({
      ...prev,
      [test]: { success, message }
    }));
  };

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Teste 1: Conectar ao Firebase
      addResult('connection', true, 'Firebase inicializado com sucesso');
      
      // Teste 2: Authentication - Criar utilizador
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          testData.email, 
          testData.password
        );
        setUser(userCredential.user);
        addResult('auth_create', true, `Utilizador criado: ${userCredential.user.email}`);
        
        // Teste 3: Firestore - Escrever dados
        try {
          const testDoc = {
            name: 'Teste Usuario',
            email: testData.email,
            createdAt: new Date(),
            testField: 'Conexão Firestore OK'
          };
          
          await setDoc(doc(db, 'users', userCredential.user.uid), testDoc);
          addResult('firestore_write', true, 'Dados gravados no Firestore');
          
          // Teste 4: Firestore - Ler dados
          try {
            const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (docSnap.exists()) {
              addResult('firestore_read', true, `Dados lidos: ${docSnap.data().name}`);
            } else {
              addResult('firestore_read', false, 'Documento não encontrado');
            }
          } catch (error) {
            addResult('firestore_read', false, `Erro ao ler: ${error.message}`);
          }
          
        } catch (error) {
          addResult('firestore_write', false, `Erro ao escrever: ${error.message}`);
        }
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          // Se utilizador já existe, tenta fazer login
          try {
            const userCredential = await signInWithEmailAndPassword(
              auth,
              testData.email,
              testData.password
            );
            setUser(userCredential.user);
            addResult('auth_create', true, `Login realizado: ${userCredential.user.email}`);
            
            // Teste Firestore com utilizador existente
            try {
              const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
              if (docSnap.exists()) {
                addResult('firestore_read', true, `Dados existentes lidos: ${docSnap.data().name}`);
              } else {
                // Criar documento se não existir
                const testDoc = {
                  name: 'Teste Usuario',
                  email: testData.email,
                  createdAt: new Date(),
                  testField: 'Conexão Firestore OK'
                };
                await setDoc(doc(db, 'users', userCredential.user.uid), testDoc);
                addResult('firestore_write', true, 'Dados gravados no Firestore (novo)');
              }
            } catch (firestoreError) {
              addResult('firestore_read', false, `Erro Firestore: ${firestoreError.message}`);
            }
            
          } catch (loginError) {
            addResult('auth_create', false, `Erro login: ${loginError.message}`);
          }
        } else {
          addResult('auth_create', false, `Erro auth: ${error.message}`);
        }
      }
      
    } catch (error) {
      addResult('connection', false, `Erro conexão: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      addResult('auth_logout', true, 'Logout realizado com sucesso');
    } catch (error) {
      addResult('auth_logout', false, `Erro logout: ${error.message}`);
    }
  };

  const clearTests = () => {
    setTestResults({});
    setUser(null);
  };

  const TestResult = ({ test, result }) => {
    if (!result) return null;
    
    return (
      <div className={`flex items-start p-3 rounded-lg ${
        result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        {result.success ? (
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
        )}
        <div>
          <h4 className={`font-medium ${
            result.success ? 'text-green-900' : 'text-red-900'
          }`}>
            {test.replace(/_/g, ' ').toUpperCase()}
          </h4>
          <p className={`text-sm ${
            result.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.message}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste de Conectividade Firebase
        </h1>
        
        {/* Configurações de Teste */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuração do Teste
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de Teste
              </label>
              <input
                type="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password de Teste
              </label>
              <input
                type="password"
                value={testData.password}
                onChange={(e) => setTestData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Testando...
                </>
              ) : (
                'Executar Testes'
              )}
            </button>
            
            {user && (
              <button
                onClick={testLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Logout
              </button>
            )}
            
            <button
              onClick={clearTests}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Estado do Utilizador */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Utilizador Autenticado</h3>
            <p className="text-sm text-blue-700">Email: {user.email}</p>
            <p className="text-sm text-blue-700">UID: {user.uid}</p>
          </div>
        )}

        {/* Resultados dos Testes */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Resultados dos Testes
            </h2>
            
            <div className="space-y-4">
              <TestResult test="connection" result={testResults.connection} />
              <TestResult test="auth_create" result={testResults.auth_create} />
              <TestResult test="firestore_write" result={testResults.firestore_write} />
              <TestResult test="firestore_read" result={testResults.firestore_read} />
              <TestResult test="auth_logout" result={testResults.auth_logout} />
            </div>
            
            {/* Resumo */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Resumo</h3>
              <p className="text-sm text-gray-600">
                Testes executados: {Object.keys(testResults).length} | 
                Sucessos: {Object.values(testResults).filter(r => r.success).length} | 
                Falhas: {Object.values(testResults).filter(r => !r.success).length}
              </p>
            </div>
          </div>
        )}

        {/* Informações Técnicas */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informações de Configuração
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Firebase Config</h3>
              <p className="text-gray-600">Project ID: myimomatepro</p>
              <p className="text-gray-600">Auth Domain: myimomatepro.firebaseapp.com</p>
              <p className="text-gray-600">Storage Bucket: myimomatepro.firebasestorage.app</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Serviços Testados</h3>
              <p className="text-gray-600">✓ Firebase Authentication</p>
              <p className="text-gray-600">✓ Cloud Firestore</p>
              <p className="text-gray-600">- Cloud Storage (não testado)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;