import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationType } from '../types/notification';
import LogManager from '../utils/logManager';
import { Platform } from 'react-native';

// Função para gerar ID único
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const STORAGE_KEY = '@LendarioX:notifications';
const LAST_FETCH_KEY = '@LendarioX:lastNotificationFetch';

// Número de dias que as notificações ficam no cache antes de serem automaticamente excluídas
const NOTIFICATION_EXPIRY_DAYS = 14;

/**
 * Serviço para gerenciar notificações do usuário
 */
export const notificationService = {
  /**
   * Busca todas as notificações do usuário
   * Combina dados do servidor com cache local para funcionamento offline
   */
  async fetchNotifications(): Promise<Notification[]> {
    try {
      LogManager.debug('notification', 'Buscando notificações');
      // Em produção, aqui faria uma chamada de API
      // const response = await api.get('/notifications');
      
      // Para desenvolvimento, carregamos do cache local
      const cachedData = await this.getLocalNotifications();
      
      // Simular uma busca de novas notificações a cada 24h
      const lastFetch = await AsyncStorage.getItem(LAST_FETCH_KEY);
      const now = new Date();
      const shouldGenerateNew = !lastFetch || (now.getTime() - new Date(lastFetch).getTime() > 24 * 60 * 60 * 1000);
      
      let notifications = cachedData;
      
      if (shouldGenerateNew) {
        // Gerar algumas notificações aleatórias para desenvolvimento
        const newNotifications = this.generateMockNotifications(3);
        notifications = [...newNotifications, ...notifications];
        
        // Salvar no cache
        await this.saveLocalNotifications(notifications);
        await AsyncStorage.setItem(LAST_FETCH_KEY, now.toISOString());
      }
      
      // Limpar notificações antigas
      notifications = this.removeExpiredNotifications(notifications);
      await this.saveLocalNotifications(notifications);
      
      LogManager.debug('notification', `${notifications.length} notificações carregadas`);
      return notifications;
    } catch (error) {
      LogManager.error('notification', 'Erro ao buscar notificações', error);
      return [];
    }
  },
  
  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    try {
      LogManager.debug('notification', `Marcando notificação ${id} como lida`);
      
      // Em produção: const response = await api.patch(`/notifications/${id}`, { isRead: true });
      
      // Para desenvolvimento
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      
      await this.saveLocalNotifications(updatedNotifications);
      LogManager.debug('notification', 'Notificação marcada como lida');
    } catch (error) {
      LogManager.error('notification', `Erro ao marcar notificação ${id} como lida`, error);
      throw error;
    }
  },
  
  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    try {
      LogManager.debug('notification', 'Marcando todas as notificações como lidas');
      
      // Em produção: const response = await api.patch('/notifications/read-all');
      
      // Para desenvolvimento
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      await this.saveLocalNotifications(updatedNotifications);
      LogManager.debug('notification', 'Todas as notificações marcadas como lidas');
    } catch (error) {
      LogManager.error('notification', 'Erro ao marcar todas as notificações como lidas', error);
      throw error;
    }
  },
  
  /**
   * Marca todas as notificações de um tipo específico como lidas
   */
  async markTypeAsRead(type: NotificationType): Promise<void> {
    try {
      LogManager.debug('notification', `Marcando notificações do tipo ${type} como lidas`);
      
      // Em produção: const response = await api.patch(`/notifications/read-by-type/${type}`);
      
      // Para desenvolvimento
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.map(notification => 
        notification.type === type ? { ...notification, isRead: true } : notification
      );
      
      await this.saveLocalNotifications(updatedNotifications);
      LogManager.debug('notification', `Notificações do tipo ${type} marcadas como lidas`);
    } catch (error) {
      LogManager.error('notification', `Erro ao marcar notificações do tipo ${type} como lidas`, error);
      throw error;
    }
  },
  
  /**
   * Remove uma notificação
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      LogManager.debug('notification', `Removendo notificação ${id}`);
      
      // Em produção: const response = await api.delete(`/notifications/${id}`);
      
      // Para desenvolvimento
      const notifications = await this.getLocalNotifications();
      const updatedNotifications = notifications.filter(
        notification => notification.id !== id
      );
      
      await this.saveLocalNotifications(updatedNotifications);
      LogManager.debug('notification', 'Notificação removida');
    } catch (error) {
      LogManager.error('notification', `Erro ao remover notificação ${id}`, error);
      throw error;
    }
  },
  
  /**
   * Remove todas as notificações
   */
  async clearAll(): Promise<void> {
    try {
      LogManager.debug('notification', 'Removendo todas as notificações');
      
      // Em produção: const response = await api.delete('/notifications');
      
      // Para desenvolvimento
      await this.saveLocalNotifications([]);
      LogManager.debug('notification', 'Todas as notificações foram removidas');
    } catch (error) {
      LogManager.error('notification', 'Erro ao remover todas as notificações', error);
      throw error;
    }
  },
  
  /**
   * Busca notificações armazenadas localmente
   */
  async getLocalNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      return JSON.parse(data, (key, value) => {
        // Converter strings de data de volta para objetos Date
        if (key === 'createdAt') return new Date(value);
        return value;
      });
    } catch (error) {
      LogManager.error('notification', 'Erro ao carregar notificações do cache', error);
      return [];
    }
  },
  
  /**
   * Salva notificações no armazenamento local
   */
  async saveLocalNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      LogManager.error('notification', 'Erro ao salvar notificações no cache', error);
      throw error;
    }
  },
  
  /**
   * Remove notificações mais antigas que o período definido
   */
  removeExpiredNotifications(notifications: Notification[]): Notification[] {
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - NOTIFICATION_EXPIRY_DAYS));
    
    return notifications.filter(notification => 
      new Date(notification.createdAt) > cutoffDate
    );
  },
  
  /**
   * Gera notificações de teste para desenvolvimento
   */
  generateMockNotifications(count: number = 3): Notification[] {
    const types = Object.values(NotificationType);
    const now = new Date();
    
    return Array(count).fill(null).map((_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const minutesAgo = Math.floor(Math.random() * 60 * 24); // Até 24h atrás
      const createdAt = new Date(now.getTime() - (minutesAgo * 60 * 1000));
      
      let title = '';
      let message = '';
      
      switch (type) {
        case NotificationType.SYSTEM:
          title = 'Atualização do Sistema';
          message = 'Nova atualização do app disponível. Confira as novidades!';
          break;
        case NotificationType.BOOK_UPDATE:
          title = 'Novos livros disponíveis';
          message = 'Adicionamos novos livros à biblioteca. Confira agora!';
          break;
        case NotificationType.AUTHOR:
          title = 'Mensagem do autor';
          message = 'Um autor que você segue publicou um novo livro!';
          break;
        case NotificationType.SOCIAL:
          title = 'Comentário em sua análise';
          message = 'Alguém comentou em sua análise de livro. Veja agora!';
          break;
        case NotificationType.ACHIEVEMENT:
          title = 'Nova conquista desbloqueada!';
          message = 'Você desbloqueou a conquista "Leitor Ávido". Parabéns!';
          break;
        case NotificationType.PROFILE:
          title = 'Perfil incompleto';
          message = 'Complete seu perfil para melhorar suas recomendações de leitura.';
          break;
      }
      
      return {
        id: generateUUID(),
        title,
        message,
        type,
        isRead: Math.random() > 0.7, // 30% chance de estar não lida
        createdAt,
        metadata: {}
      };
    });
  }
}; 