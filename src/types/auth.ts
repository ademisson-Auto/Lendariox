import { User } from '@supabase/supabase-js';

/**
 * Extensão do tipo User do Supabase para incluir propriedades
 * específicas do nosso aplicativo
 */
export interface ExtendedUser extends User {
  /**
   * URL do avatar do usuário. Esta propriedade deve ser padronizada
   * em toda a aplicação para evitar conflitos de tipo.
   */
  avatar_url?: string;
  
  /**
   * @deprecated Use avatar_url em vez disso. Mantido para 
   * compatibilidade com código existente.
   */
  photo_url?: string;
  
  /**
   * Nome de usuário para exibição. Se não definido, usa a parte 
   * inicial do email.
   */
  username?: string;
}

/**
 * Função para obter uma URL de avatar padronizada para o usuário
 * Lida com casos em que nem avatar_url nem photo_url estão definidos
 */
export function getUserAvatarUrl(user: User | ExtendedUser | null): string {
  if (!user) return 'https://ui-avatars.com/api/?background=FF4500&color=FFFFFF&bold=true&name=User';
  
  // As propriedades avatar_url e photo_url já estão definidas no tipo User através da extensão em global.d.ts
  const avatarUrl = user.avatar_url || user.photo_url || null;
  
  if (avatarUrl) return avatarUrl;
  
  // Gerar avatar com base no email ou ID do usuário
  const name = user.email?.split('@')[0] || 'User';
  return `https://ui-avatars.com/api/?background=FF4500&color=FFFFFF&bold=true&name=${encodeURIComponent(name)}`;
} 