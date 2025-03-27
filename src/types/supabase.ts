/**
 * Definição de tipos para o banco de dados Supabase
 */
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
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['books']['Row'], 'id'>>;
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
          current_location?: string;
          current_chapter?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reading_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['reading_progress']['Row'], 'id'>>;
      };
      book_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['book_categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['book_categories']['Row'], 'id'>>;
      };
      books_to_categories: {
        Row: {
          book_id: string;
          category_id: string;
        };
        Insert: Database['public']['Tables']['books_to_categories']['Row'];
        Update: Partial<Database['public']['Tables']['books_to_categories']['Row']>;
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
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id'>>;
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
        Insert: Omit<Database['public']['Tables']['user_publications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['user_publications']['Row'], 'id'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
} 