// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthState {
 user: User | null;
 loading: boolean;
 error: string | null;
}

export const useAuth = () => {
 const [authState, setAuthState] = useState<AuthState>({
   user: null,
   loading: true,
   error: null
 });

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(
     auth,
     (user) => {
       setAuthState({
         user,
         loading: false,
         error: null
       });
     },
     (error) => {
       console.error('Auth state change error:', error);
       setAuthState({
         user: null,
         loading: false,
         error: error.message
       });
     }
   );

   return unsubscribe;
 }, []);

 const logout = async () => {
   try {
     setAuthState(prev => ({ ...prev, loading: true }));
     await signOut(auth);
     // State will be updated by onAuthStateChanged
   } catch (error) {
     console.error('Logout error:', error);
     setAuthState(prev => ({
       ...prev,
       loading: false,
       error: error instanceof Error ? error.message : 'Erro ao terminar sessão'
     }));
   }
 };

 return {
   user: authState.user,
   loading: authState.loading,
   error: authState.error,
   isAuthenticated: !!authState.user,
   logout
 };
};
