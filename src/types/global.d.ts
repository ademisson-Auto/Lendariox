import { User } from '@supabase/supabase-js';

// Estender o tipo User do Supabase para incluir campos personalizados
declare module '@supabase/supabase-js' {
  interface User {
    avatar_url?: string;
    photo_url?: string;
    username?: string;
  }
} 