import { Book } from './book';
import { User } from '@supabase/supabase-js';

/**
 * Tipos de notificações disponíveis no sistema
 */
export enum NotificationType {
  SYSTEM = 'system',        // Mensagens do sistema (manutenção, atualizações)
  BOOK_UPDATE = 'book_update',     // Atualizações de livros
  AUTHOR = 'author',        // Mensagens de autores 
  SOCIAL = 'social',        // Interações sociais (comentários, marcações)
  ACHIEVEMENT = 'achievement', // Conquistas desbloqueadas
  PROFILE = 'profile'       // Atualizações de perfil (assinatura, configurações)
}

/**
 * Estrutura de uma notificação
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  metadata: Record<string, any>;
}

/**
 * Resumo de notificações por tipo
 */
export interface NotificationSummary {
  total: number;
  unread: number;
  byType: {
    [key in NotificationType]?: {
      total: number;
      unread: number;
    };
  };
  // Propriedades adicionais para exibição rápida
  hasProfileNotifications?: boolean;
  hasGeneralNotifications?: boolean;
}

/**
 * Estado do contexto de notificações
 */
export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  summary: NotificationSummary;
  lastFetched: Date | null;
}

/**
 * Ações disponíveis para notificações
 */
export type NotificationAction = 
  | { type: 'FETCH_NOTIFICATIONS_START' }
  | { type: 'FETCH_NOTIFICATIONS_SUCCESS', payload: Notification[] }
  | { type: 'FETCH_NOTIFICATIONS_ERROR', payload: Error }
  | { type: 'MARK_AS_READ', payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'MARK_TYPE_AS_READ', payload: NotificationType }
  | { type: 'DELETE_NOTIFICATION', payload: string }
  | { type: 'CLEAR_ALL' };

/**
 * Ações disponíveis para o gerenciamento de notificações
 */
export interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markTypeAsRead: (type: NotificationType) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

/**
 * Dados compartilhados pelo contexto de notificações
 */
export interface NotificationContextData extends NotificationState, NotificationActions {
  // Funções de conveniência
  hasUnreadNotifications: () => boolean;
  hasUnreadNotificationsOfType: (type: NotificationType) => boolean;
  getUnreadCount: () => number;
  getUnreadCountByType: (type: NotificationType) => number;
} 