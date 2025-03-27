import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';


const supabaseUrl = 'https://fwfjhsytzepuhcjdlows.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3Zmpoc3l0emVwdWhjamRsb3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjE0MjYsImV4cCI6MjA1ODM5NzQyNn0.hyobgh4jUPlLIn4hJSS8eU62gMItGMRyhPK2yUPfRrQ';

// Interface para representar tabelas do Supabase
export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          description: string | null;
          cover_url: string;
          pdf_url: string | null;
          epub_url: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
          tags: string[] | null;
          reading_mode: 'vertical' | 'horizontal' | null;
        };
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          current_page: number;
          total_pages: number;
          last_read_at: string;
          completed: boolean;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
      };
      book_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
      };
      books_to_categories: {
        Row: {
          book_id: string;
          category_id: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      user_publications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cover_url: string | null;
          file_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
      };
    };
  };
}

// Configure o cliente com persistência via AsyncStorage e schema 'public'
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  }
}); 