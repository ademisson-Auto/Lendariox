export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  cover_url: string;
  tags?: string[];
  views?: number;
  created_at?: string;
  updated_at?: string;
  is_premium?: boolean;
  reading_mode?: 'vertical' | 'horizontal';
  pdf_url?: string;
  epub_url?: string;
  file_type?: 'pdf' | 'epub';
  file_size?: number; // tamanho em bytes
  language?: string;
  publisher?: string;
  publish_date?: string;
  isbn?: string;
  is_downloaded?: boolean;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number;
  last_read_at: string;
  completed: boolean;
  completion_percentage: number;
  current_location?: string; // Para EPUB pode ser um CFI (Canon Fragment Identifier)
  current_chapter?: string;
  bookmarks?: Bookmark[];
  annotations?: Annotation[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface que combina um livro com seu progresso de leitura
 */
export interface BookWithProgress extends Book {
  current_page: number;
  total_pages: number;
  completion_percentage: number;
  last_read_at?: string;
}

export interface BookCategory {
  id: string;
  name: string;
  description?: string;
  books?: Book[];
  image_url?: string;
  book_count?: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number?: number; // Para PDF
  cfi?: string; // Para EPUB
  chapter?: string;
  text_snippet?: string;
  note?: string;
  created_at: string;
}

export interface Annotation {
  id: string;
  user_id: string;
  book_id: string;
  page_number?: number; // Para PDF
  cfi?: string; // Para EPUB
  chapter?: string;
  text_selection: string;
  note: string;
  highlight_color: string;
  created_at: string;
  updated_at?: string;
}

export interface BookDownload {
  id: string;
  book_id: string;
  user_id: string;
  local_uri: string;
  file_size: number;
  download_date: string;
  is_complete: boolean;
  file_type: 'pdf' | 'epub';
} 