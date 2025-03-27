import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_USER_PREFERENCES, CompleteUser } from '../types/user';
import { ExtendedUser } from '../types/auth';
import LogManager from '../utils/logManager';

const USER_PREFERENCES_KEY = '@LENDARIOX:user_preferences';

export const userService = {
  /**
   * Obter as preferências do usuário, primeiro tentando do AsyncStorage
   * e, se não encontrar, do Supabase.
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      // Tentar carregar do AsyncStorage primeiro (mais rápido)
      const localPreferences = await AsyncStorage.getItem(`${USER_PREFERENCES_KEY}:${userId}`);
      if (localPreferences) {
        return JSON.parse(localPreferences);
      }

      // Se não encontrar localmente, buscar do Supabase
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Converter para o formato correto
        const preferences: UserPreferences = {
          theme: data.theme || DEFAULT_USER_PREFERENCES.theme,
          fontSize: data.font_size || DEFAULT_USER_PREFERENCES.fontSize,
          defaultReadingMode: data.default_reading_mode || DEFAULT_USER_PREFERENCES.defaultReadingMode,
          notifyNewBooks: data.notify_new_books !== undefined ? data.notify_new_books : DEFAULT_USER_PREFERENCES.notifyNewBooks,
          notifyUpdates: data.notify_updates !== undefined ? data.notify_updates : DEFAULT_USER_PREFERENCES.notifyUpdates,
          autoSyncProgress: data.auto_sync_progress !== undefined ? data.auto_sync_progress : DEFAULT_USER_PREFERENCES.autoSyncProgress,
          downloadOnlyOnWifi: data.download_only_on_wifi !== undefined ? data.download_only_on_wifi : DEFAULT_USER_PREFERENCES.downloadOnlyOnWifi,
          language: data.language || DEFAULT_USER_PREFERENCES.language,
          updatedAt: data.updated_at
        };

        // Salvar no AsyncStorage para acesso mais rápido
        await AsyncStorage.setItem(`${USER_PREFERENCES_KEY}:${userId}`, JSON.stringify(preferences));
        
        return preferences;
      }

      // Se não encontrar no Supabase, retornar valores padrão
      return DEFAULT_USER_PREFERENCES;
    } catch (error) {
      LogManager.error('app', 'Erro ao buscar preferências do usuário', error);
      // Em caso de erro, retornar as preferências padrão
      return DEFAULT_USER_PREFERENCES;
    }
  },

  /**
   * Salvar as preferências do usuário
   */
  async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    try {
      // Atualizar o timestamp
      const updatedPreferences = {
        ...preferences,
        updatedAt: new Date().toISOString()
      };
      
      // Salvar no AsyncStorage primeiro para acesso rápido
      await AsyncStorage.setItem(`${USER_PREFERENCES_KEY}:${userId}`, JSON.stringify(updatedPreferences));
      
      // Converter para o formato do banco de dados
      const dbPreferences = {
        user_id: userId,
        theme: preferences.theme,
        font_size: preferences.fontSize,
        default_reading_mode: preferences.defaultReadingMode,
        notify_new_books: preferences.notifyNewBooks,
        notify_updates: preferences.notifyUpdates,
        auto_sync_progress: preferences.autoSyncProgress,
        download_only_on_wifi: preferences.downloadOnlyOnWifi,
        language: preferences.language,
        updated_at: updatedPreferences.updatedAt
      };
      
      // Salvar no Supabase usando upsert (inserir ou atualizar)
      const { error } = await supabase
        .from('user_preferences')
        .upsert(dbPreferences);
      
      if (error) {
        throw error;
      }
      
      LogManager.info('app', 'Preferências do usuário salvas com sucesso');
    } catch (error) {
      LogManager.error('app', 'Erro ao salvar preferências do usuário', error);
      throw error;
    }
  },

  /**
   * Obter informações completas do usuário
   */
  async getCompleteUserProfile(userId: string): Promise<CompleteUser | null> {
    try {
      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      if (!profile) {
        return null;
      }
      
      // Buscar as preferências do usuário
      const preferences = await this.getUserPreferences(userId);
      
      // Buscar os livros favoritos do usuário
      const { data: favorites, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('book_id')
        .eq('user_id', userId);
        
      if (favoritesError) {
        throw favoritesError;
      }
      
      // Buscar as categorias favoritas do usuário
      const { data: categories, error: categoriesError } = await supabase
        .from('user_favorite_categories')
        .select('category_id')
        .eq('user_id', userId);
        
      if (categoriesError) {
        throw categoriesError;
      }
      
      // Compor o objeto de usuário completo
      // Usar um tipo parcial para evitar erro de propriedades ausentes
      const userData = {
        id: userId,
        email: profile.email,
        username: profile.username,
        avatar_url: profile.avatar_url,
        fullName: profile.full_name,
        bio: profile.bio,
        country: profile.country,
        preferences: preferences,
        favoriteBookIds: favorites ? favorites.map(f => f.book_id) : [],
        favoriteCategoryIds: categories ? categories.map(c => c.category_id) : []
      };
      
      // @ts-ignore - Ignorar o erro de tipo aqui, pois estamos construindo o objeto parcialmente
      const completeUser: CompleteUser = userData;
      
      return completeUser;
    } catch (error) {
      LogManager.error('app', 'Erro ao buscar perfil completo do usuário', error);
      return null;
    }
  },

  /**
   * Atualizar o perfil do usuário
   */
  async updateUserProfile(userId: string, profileData: Partial<CompleteUser>): Promise<boolean> {
    try {
      // Extrair as preferências se foram enviadas
      const { preferences, ...userData } = profileData;
      
      // Preparar os dados para o Supabase
      const profileUpdate = {
        id: userId,
        username: userData.username,
        avatar_url: userData.avatar_url,
        full_name: userData.fullName,
        bio: userData.bio,
        country: userData.country,
        updated_at: new Date().toISOString()
      };
      
      // Atualizar o perfil
      const { error } = await supabase
        .from('profiles')
        .upsert(profileUpdate);
        
      if (error) {
        throw error;
      }
      
      // Se foram enviadas preferências, atualizar também
      if (preferences) {
        await this.saveUserPreferences(userId, preferences);
      }
      
      return true;
    } catch (error) {
      LogManager.error('app', 'Erro ao atualizar perfil do usuário', error);
      return false;
    }
  }
}; 