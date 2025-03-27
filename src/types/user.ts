import { User } from '@supabase/supabase-js';
import { ExtendedUser } from './auth';

/**
 * Interface para representar as preferências do usuário
 */
export interface UserPreferences {
  /**
   * Tema preferido do usuário
   */
  theme: 'light' | 'dark' | 'sepia' | 'system';

  /**
   * Tamanho da fonte para leitura
   */
  fontSize: number;

  /**
   * Modo padrão de leitura
   */
  defaultReadingMode: 'vertical' | 'horizontal';

  /**
   * Receber notificações de novos livros
   */
  notifyNewBooks: boolean;

  /**
   * Receber notificações de atualizações do app
   */
  notifyUpdates: boolean;

  /**
   * Sincronizar progresso de leitura automaticamente
   */
  autoSyncProgress: boolean;

  /**
   * Baixar livros apenas via WiFi
   */
  downloadOnlyOnWifi: boolean;

  /**
   * Linguagem preferida para interface
   */
  language: string;

  /**
   * Data da última atualização das preferências
   */
  updatedAt: string;
}

/**
 * Interface que representa um usuário completo do sistema
 * Estende o ExtendedUser já existente com as preferências
 */
export interface CompleteUser extends ExtendedUser {
  /**
   * Preferências do usuário
   */
  preferences?: UserPreferences;

  /**
   * Nome completo do usuário
   */
  fullName?: string;

  /**
   * Biografia do usuário
   */
  bio?: string;

  /**
   * País do usuário
   */
  country?: string;

  /**
   * Livros favoritos do usuário
   */
  favoriteBookIds?: string[];

  /**
   * Categorias favoritas do usuário
   */
  favoriteCategoryIds?: string[];
}

/**
 * Valores padrão para as preferências do usuário
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 16,
  defaultReadingMode: 'vertical',
  notifyNewBooks: true,
  notifyUpdates: true,
  autoSyncProgress: true,
  downloadOnlyOnWifi: true,
  language: 'pt-BR',
  updatedAt: new Date().toISOString()
}; 