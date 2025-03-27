import React, { createContext, useState, useEffect, useContext, useMemo, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtendedUser } from '../types/auth';
import LogManager from '../utils/logManager';

// Garantir que o LogManager está inicializado
if (!LogManager.isInitialized()) {
  LogManager.initialize();
}

const AUTH_SESSION_KEY = 'LENDARIOX_session';
const AUTH_TOKEN_KEY = 'LENDARIOX_auth_token';
const AUTH_REFRESH_TOKEN_KEY = 'LENDARIOX_refresh_token';

interface AuthContextData {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
}

// Valor padrão para o contexto
const defaultContextValue: AuthContextData = {
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null, data: null }),
  signIn: async () => ({ error: null, data: null }),
  signOut: async () => {},
};

// Criar o contexto com valor padrão definido
export const AuthContext = createContext<AuthContextData>(defaultContextValue);

// Interface para as props do provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider usando React.memo para otimização
export const AuthProvider = React.memo(({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para verificar se o SecureStore está disponível na plataforma
  const isSecureStoreAvailable = Platform.OS !== 'web';

  // Função para salvar a sessão
  const saveSession = async (currentSession: Session | null) => {
    try {
      LogManager.debug('auth', 'Tentando salvar sessão', currentSession ? 'Sessão existe' : 'Nenhuma sessão');
      
      if (currentSession) {
        if (isSecureStoreAvailable) {
          // Salvar tokens separadamente no SecureStore para maior segurança
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, currentSession.access_token);
          await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, currentSession.refresh_token || '');
          
          // Salvar resto da sessão no AsyncStorage
          const sessionWithoutTokens = { 
            ...currentSession,
            // Removemos os tokens sensíveis para não duplicar
            access_token: '[STORED_IN_SECURE_STORE]',
            refresh_token: '[STORED_IN_SECURE_STORE]'
          };
          await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionWithoutTokens));
          LogManager.info('auth', 'Tokens salvos no SecureStore e sessão no AsyncStorage');
        } else {
          // Fallback para plataformas sem SecureStore (web)
          await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentSession));
          LogManager.info('auth', 'Sessão completa salva no AsyncStorage (sem SecureStore disponível)');
        }
      } else {
        // Limpando os armazenamentos
        if (isSecureStoreAvailable) {
          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
        }
        await AsyncStorage.removeItem(AUTH_SESSION_KEY);
        LogManager.info('auth', 'Sessão removida de todos os armazenamentos');
      }
    } catch (error) {
      LogManager.error('auth', 'Erro ao salvar sessão:', error);
    }
  };

  // Função para recuperar a sessão
  const loadSession = async () => {
    try {
      LogManager.debug('auth', 'Tentando carregar sessão...');
      
      let accessToken = null;
      let refreshToken = null;
      let sessionData = null;
      
      // Recuperar informações de diferentes armazenamentos
      if (isSecureStoreAvailable) {
        accessToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        refreshToken = await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
        LogManager.debug('auth', 'Tokens recuperados do SecureStore', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      }
      
      const savedSessionData = await AsyncStorage.getItem(AUTH_SESSION_KEY);
      LogManager.debug('auth', 'Dados de sessão recuperados do AsyncStorage', { exists: !!savedSessionData });
      
      if (savedSessionData) {
        const savedSession = JSON.parse(savedSessionData) as Session;
        
        // Verificar se a sessão é válida (não expirou)
        const now = new Date();
        const expiryTime = new Date(savedSession.expires_at || 0);
        
        LogManager.debug('auth', 'Verificando validade da sessão', {
          now: now.toISOString(),
          expiry: expiryTime.toISOString(),
          isValid: expiryTime > now
        });
        
        if (expiryTime > now) {
          // Reconstruir a sessão completa
          if (isSecureStoreAvailable && accessToken) {
            savedSession.access_token = accessToken;
            savedSession.refresh_token = refreshToken || '';
          }
          
          // Sessão válida, restaurar no Supabase
          const sessionResult = await supabase.auth.setSession({
            access_token: savedSession.access_token,
            refresh_token: savedSession.refresh_token || ''
          });
          
          if (sessionResult.error) {
            LogManager.error('auth', 'Erro ao restaurar sessão no Supabase:', sessionResult.error);
            // Limpar tokens inválidos
            await saveSession(null);
          } else {
            LogManager.info('auth', 'Sessão restaurada com sucesso no Supabase');
            setSession(savedSession);
            setUser(savedSession?.user ?? null);
          }
        } else {
          // Sessão expirada, remover do storage
          LogManager.info('auth', 'Sessão expirada, removendo dos armazenamentos');
          await saveSession(null);
        }
      } else {
        LogManager.info('auth', 'Nenhuma sessão encontrada no armazenamento');
      }
    } catch (error) {
      LogManager.error('auth', 'Erro ao carregar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    LogManager.info('auth', 'AuthProvider inicializado - Carregando sessão');
    
    // Tentar carregar a sessão salva primeiro
    loadSession();

    // Verificar se já existe uma sessão ativa no Supabase
    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      LogManager.debug('auth', 'Resultado de getSession do Supabase', { hasSession: !!supabaseSession });
      
      if (supabaseSession) {
        setSession(supabaseSession);
        setUser(supabaseSession?.user ?? null);
        saveSession(supabaseSession);
      }
      setLoading(false);
    }).catch(error => {
      LogManager.error('auth', 'Erro ao obter sessão do Supabase:', error);
      setLoading(false);
    });

    // Configurar ouvinte para alterações na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      LogManager.info('auth', `Evento de autenticação: ${_event}`, { hasSession: !!currentSession });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      saveSession(currentSession);
      setLoading(false);
    });

    return () => {
      LogManager.debug('auth', 'Cancelando inscrição de eventos de autenticação');
      subscription.unsubscribe();
    };
  }, []);

  // Função para registrar usuário
  const signUp = async (email: string, password: string) => {
    LogManager.info('auth', 'Tentando registrar novo usuário', { email });
    setLoading(true);
    
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (response.error) {
        LogManager.error('auth', 'Erro ao registrar usuário', response.error);
      } else {
        LogManager.info('auth', 'Usuário registrado com sucesso', { userId: response.data?.user?.id });
        
        if (response.data?.session) {
          saveSession(response.data.session);
        }
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      LogManager.error('auth', 'Exceção ao registrar usuário:', error);
      setLoading(false);
      return { error, data: null };
    }
  };

  // Função para fazer login
  const signIn = async (email: string, password: string) => {
    LogManager.info('auth', 'Tentando fazer login', { email });
    setLoading(true);
    
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) {
        LogManager.error('auth', 'Erro ao fazer login', response.error);
      } else {
        LogManager.info('auth', 'Login bem-sucedido', { userId: response.data?.user?.id });
        
        if (response.data?.session) {
          await saveSession(response.data.session);
          setSession(response.data.session);
          setUser(response.data.user);
          
          // Ativar logs de livros após login bem-sucedido
          LogManager.enableCategory('books');
        }
      }
      
      setLoading(false);
      return response;
    } catch (error) {
      LogManager.error('auth', 'Exceção ao fazer login:', error);
      setLoading(false);
      return { error, data: null };
    }
  };

  // Função para fazer logout
  const signOut = async () => {
    LogManager.info('auth', 'Iniciando processo de logout');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      await saveSession(null);
      
      setUser(null);
      setSession(null);
      
      // Desativar logs de livros após logout
      LogManager.disableCategory('books');
      
      LogManager.info('auth', 'Logout concluído com sucesso');
    } catch (error) {
      LogManager.error('auth', 'Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar valor do contexto usando useMemo para evitar renderizações desnecessárias
  const contextValue = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
});

// Hook para facilitar o uso do contexto
export const useAuth = (): AuthContextData => {
  try {
    const context = useContext(AuthContext);
    
    if (!context) {
      LogManager.error('auth', 'useAuth chamado fora do AuthProvider');
      return defaultContextValue;
    }
    
    return context;
  } catch (error) {
    LogManager.error('auth', 'Erro ao acessar AuthContext', error);
    return defaultContextValue;
  }
}; 