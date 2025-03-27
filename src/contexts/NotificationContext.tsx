import React, { createContext, useReducer, useEffect, useContext, useCallback, ReactNode } from 'react';
import { 
  Notification, 
  NotificationAction, 
  NotificationType, 
  NotificationState, 
  NotificationSummary 
} from '../types/notification';
import { notificationService } from '../services/notificationService';
import { AuthContext } from './AuthContext';
import LogManager from '../utils/logManager';

// Garantir que o LogManager está inicializado
if (!LogManager.isInitialized()) {
  LogManager.initialize();
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  summary: {
    total: 0,
    unread: 0,
    byType: {}
  },
  lastFetched: null,
};

// Criando o contexto
export interface NotificationContextData {
  // Estado
  state: NotificationState;
  
  // Ações
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markTypeAsRead: (type: NotificationType) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Helpers
  hasUnreadNotifications: () => boolean;
  hasUnreadNotificationsOfType: (type: NotificationType) => boolean;
  getUnreadCount: () => number;
  getUnreadCountByType: (type: NotificationType) => number;
}

// Inicializar com valores padrão para evitar erro de _context undefined
const defaultContextValue: NotificationContextData = {
  state: initialState,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  markTypeAsRead: async () => {},
  deleteNotification: async () => {},
  clearAll: async () => {},
  hasUnreadNotifications: () => false,
  hasUnreadNotificationsOfType: () => false,
  getUnreadCount: () => 0,
  getUnreadCountByType: () => 0
};

// IMPORTANTE: Atribuir um valor não-undefined para o contexto
export const NotificationContext = createContext<NotificationContextData>(defaultContextValue);

// Reducer para gerenciar estado
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'FETCH_NOTIFICATIONS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case 'FETCH_NOTIFICATIONS_SUCCESS': {
      const notifications = action.payload;
      return {
        ...state,
        notifications,
        loading: false,
        summary: calculateSummary(notifications),
        lastFetched: new Date()
      };
    }
      
    case 'FETCH_NOTIFICATIONS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case 'MARK_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
        summary: calculateSummary(updatedNotifications)
      };
    }
      
    case 'MARK_ALL_AS_READ': {
      const updatedNotifications = state.notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      return {
        ...state,
        notifications: updatedNotifications,
        summary: calculateSummary(updatedNotifications)
      };
    }
      
    case 'MARK_TYPE_AS_READ': {
      const updatedNotifications = state.notifications.map(notification =>
        notification.type === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
        summary: calculateSummary(updatedNotifications)
      };
    }
      
    case 'DELETE_NOTIFICATION': {
      const updatedNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      
      return {
        ...state,
        notifications: updatedNotifications,
        summary: calculateSummary(updatedNotifications)
      };
    }
      
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        summary: {
          total: 0,
          unread: 0,
          byType: {}
        }
      };
      
    default:
      return state;
  }
}

// Função utilitária para calcular o resumo
function calculateSummary(notifications: Notification[]): NotificationSummary {
  const summary: NotificationSummary = {
    total: notifications.length,
    unread: 0,
    byType: {}
  };
  
  // Calcula totais
  notifications.forEach(notification => {
    // Contagem total de não lidas
    if (!notification.isRead) {
      summary.unread++;
    }
    
    // Inicializa o contador do tipo se não existir
    if (!summary.byType[notification.type]) {
      summary.byType[notification.type] = {
        total: 0,
        unread: 0
      };
    }
    
    // Incrementa contadores por tipo
    summary.byType[notification.type]!.total++;
    
    if (!notification.isRead) {
      summary.byType[notification.type]!.unread++;
    }
  });
  
  return summary;
}

// Provedor do contexto
interface NotificationProviderProps {
  children: ReactNode;
}

// Usar React.memo para otimizar renderizações
export const NotificationProvider = React.memo(({ children }: NotificationProviderProps) => {
  // Definir explicitamente o estado inicial para os reducers
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Usar try-catch para proteger contra erros de context
  let auth: any = null;
  try {
    auth = useContext(AuthContext);
    if (!auth) {
      LogManager.warn('notification', 'AuthContext não encontrado, usando fallback');
    }
  } catch (error) {
    LogManager.error('notification', 'Erro ao acessar AuthContext', error);
  }
  
  // Carregar notificações iniciais e definir intervalo de atualização
  useEffect(() => {
    // Só busca notificações se o usuário estiver autenticado
    if (auth?.user) {
      LogManager.debug('notification', 'Usuário autenticado, carregando notificações');
      fetchNotifications();
      
      // Atualizar a cada 5 minutos (300000ms)
      const interval = setInterval(fetchNotifications, 300000);
      
      return () => clearInterval(interval);
    }
  }, [auth?.user]);
  
  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_NOTIFICATIONS_START' });
      const notifications = await notificationService.fetchNotifications();
      dispatch({ type: 'FETCH_NOTIFICATIONS_SUCCESS', payload: notifications });
    } catch (error) {
      LogManager.error('notification', 'Erro ao buscar notificações', error);
      dispatch({ type: 'FETCH_NOTIFICATIONS_ERROR', payload: error as Error });
    }
  }, []);
  
  // Marcar como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      dispatch({ type: 'MARK_AS_READ', payload: id });
    } catch (error) {
      LogManager.error('notification', `Erro ao marcar notificação ${id} como lida`, error);
    }
  }, []);
  
  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      LogManager.error('notification', 'Erro ao marcar todas as notificações como lidas', error);
    }
  }, []);
  
  // Marcar tipo específico como lido
  const markTypeAsRead = useCallback(async (type: NotificationType) => {
    try {
      await notificationService.markTypeAsRead(type);
      dispatch({ type: 'MARK_TYPE_AS_READ', payload: type });
    } catch (error) {
      LogManager.error('notification', `Erro ao marcar notificações do tipo ${type} como lidas`, error);
    }
  }, []);
  
  // Excluir notificação
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    } catch (error) {
      LogManager.error('notification', `Erro ao excluir notificação ${id}`, error);
    }
  }, []);
  
  // Limpar todas
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      dispatch({ type: 'CLEAR_ALL' });
    } catch (error) {
      LogManager.error('notification', 'Erro ao limpar todas as notificações', error);
    }
  }, []);
  
  // Helpers - memoizados para evitar recriações constantes
  const hasUnreadNotifications = useCallback(() => {
    return state.summary.unread > 0;
  }, [state.summary.unread]);
  
  const hasUnreadNotificationsOfType = useCallback((type: NotificationType) => {
    return (state.summary.byType[type]?.unread || 0) > 0;
  }, [state.summary.byType]);
  
  const getUnreadCount = useCallback(() => {
    return state.summary.unread;
  }, [state.summary.unread]);
  
  const getUnreadCountByType = useCallback((type: NotificationType) => {
    return state.summary.byType[type]?.unread || 0;
  }, [state.summary.byType]);
  
  // Criar o valor do contexto ANTES do render final para evitar problemas
  const contextValue = React.useMemo(() => ({
    state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markTypeAsRead,
    deleteNotification,
    clearAll,
    hasUnreadNotifications,
    hasUnreadNotificationsOfType,
    getUnreadCount,
    getUnreadCountByType
  }), [
    state, 
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    markTypeAsRead,
    deleteNotification,
    clearAll,
    hasUnreadNotifications,
    hasUnreadNotificationsOfType,
    getUnreadCount,
    getUnreadCountByType
  ]);
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
});

// Hook para facilitar o uso do contexto
export function useNotification(): NotificationContextData {
  // Usar try-catch aqui também para proteger contra erros
  try {
    const context = useContext(NotificationContext);
    
    if (!context) {
      LogManager.error('notification', 'useNotification chamado fora do NotificationProvider');
      return defaultContextValue; // Retornar valor padrão em vez de lançar erro
    }
    
    return context;
  } catch (error) {
    LogManager.error('notification', 'Erro ao acessar NotificationContext', error);
    return defaultContextValue;
  }
} 