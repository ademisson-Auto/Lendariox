import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Book, ReadingProgress } from '../types/book';
import { bookService } from '../services/bookService';
import { useAuth } from './AuthContext';
import LogManager from '../utils/logManager';

// Garantir que o LogManager está inicializado
if (!LogManager.isInitialized()) {
  LogManager.initialize();
}

interface BookContextData {
  // Dados de livros
  recommendedBooks: Book[];
  premiumBooks: Book[];
  recentlyReadBooks: Book[];
  allBooks: Book[];
  // Estado de carregamento
  loading: boolean;
  // Funções
  getBookById: (id: string) => Promise<Book | null>;
  getBooksByCategory: (category: string) => Promise<Book[]>;
  getReadingProgress: (bookId: string) => Promise<ReadingProgress | null>;
  updateReadingProgress: (bookId: string, currentPage: number, totalPages: number) => Promise<void>;
  getBookPdfUrl: (bookId: string) => Promise<string>;
  // Funções de verificação de formato
  hasEpub: (bookId: string) => Promise<boolean>;
  hasPdf: (bookId: string) => Promise<boolean>;
  // Funções de upload de arquivos
  uploadBookCover: (file: File | Blob, fileName: string) => Promise<string>;
  uploadBookPdf: (file: File | Blob, fileName: string) => Promise<string>;
  // Funções de atualização
  refreshRecommendedBooks: () => Promise<void>;
  refreshPremiumBooks: () => Promise<void>;
  refreshRecentlyReadBooks: () => Promise<void>;
  refreshAllBooks: () => Promise<void>;
}

// Valores padrão para o contexto
const defaultContextValue: BookContextData = {
  recommendedBooks: [],
  premiumBooks: [],
  recentlyReadBooks: [],
  allBooks: [],
  loading: false,
  getBookById: async () => null,
  getBooksByCategory: async () => [],
  getReadingProgress: async () => null,
  updateReadingProgress: async () => {},
  getBookPdfUrl: async () => '',
  hasEpub: async () => false,
  hasPdf: async () => false,
  uploadBookCover: async () => '',
  uploadBookPdf: async () => '',
  refreshRecommendedBooks: async () => {},
  refreshPremiumBooks: async () => {},
  refreshRecentlyReadBooks: async () => {},
  refreshAllBooks: async () => {},
};

// Criar contexto com valor padrão definido
const BookContext = createContext<BookContextData>(defaultContextValue);

interface BookProviderProps {
  children: ReactNode;
}

// Provider usando React.memo para otimização
export const BookProvider = React.memo(({ children }: BookProviderProps) => {
  // Usar try-catch para proteção contra erros de context
  let authContext;
  try {
    authContext = useAuth();
    if (!authContext) {
      LogManager.warn('books', 'AuthContext não encontrado, usando fallback');
    }
  } catch (error) {
    LogManager.error('books', 'Erro ao acessar AuthContext', error);
  }
  
  const { user, loading: authLoading } = authContext || { user: null, loading: false };
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [premiumBooks, setPremiumBooks] = useState<Book[]>([]);
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Funções para atualizar os dados - com useCallback para evitar recriações
  const refreshRecommendedBooks = useCallback(async () => {
    try {
      setLoading(true);
      const books = await bookService.getRecommendedBooks();
      setRecommendedBooks(books);
    } catch (error) {
      LogManager.error('books', 'Erro ao carregar livros recomendados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPremiumBooks = useCallback(async () => {
    try {
      setLoading(true);
      const books = await bookService.getPremiumBooks();
      setPremiumBooks(books);
    } catch (error) {
      LogManager.error('books', 'Erro ao carregar livros premium:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRecentlyReadBooks = useCallback(async () => {
    if (!user) {
      setRecentlyReadBooks([]);
      return;
    }
    
    try {
      setLoading(true);
      const books = await bookService.getRecentlyReadBooks();
      setRecentlyReadBooks(books);
    } catch (error) {
      LogManager.error('books', 'Erro ao carregar livros recentemente lidos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshAllBooks = useCallback(async () => {
    try {
      setLoading(true);
      const books = await bookService.getAllBooks();
      setAllBooks(books);
    } catch (error) {
      LogManager.error('books', 'Erro ao carregar todos os livros:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar livros por categoria
  const getBooksByCategory = useCallback(async (category: string): Promise<Book[]> => {
    try {
      return await bookService.getBooksByCategory(category);
    } catch (error) {
      LogManager.error('books', `Erro ao carregar livros da categoria ${category}:`, error);
      return [];
    }
  }, []);

  // Função para buscar detalhes de um livro específico
  const getBookById = useCallback(async (id: string): Promise<Book | null> => {
    try {
      return await bookService.getBookById(id);
    } catch (error) {
      LogManager.error('books', `Erro ao carregar detalhes do livro ${id}:`, error);
      return null;
    }
  }, []);

  // Função para buscar progresso de leitura
  const getReadingProgress = useCallback(async (bookId: string): Promise<ReadingProgress | null> => {
    if (!user) {
      return null;
    }
    
    try {
      return await bookService.getReadingProgress(bookId);
    } catch (error) {
      LogManager.error('books', `Erro ao carregar progresso de leitura para o livro ${bookId}:`, error);
      return null;
    }
  }, [user]);

  // Função para atualizar progresso de leitura
  const updateReadingProgress = useCallback(async (bookId: string, currentPage: number, totalPages: number): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      await bookService.updateReadingProgress(bookId, currentPage, totalPages);
      // Atualizar livros recentemente lidos após atualização de progresso
      refreshRecentlyReadBooks();
    } catch (error) {
      LogManager.error('books', `Erro ao atualizar progresso de leitura para o livro ${bookId}:`, error);
      throw error;
    }
  }, [user, refreshRecentlyReadBooks]);

  // Função para obter URL de download do PDF
  const getBookPdfUrl = useCallback(async (bookId: string): Promise<string> => {
    try {
      return await bookService.getBookPdfUrl(bookId);
    } catch (error) {
      LogManager.error('books', `Erro ao obter URL de download para o PDF do livro ${bookId}:`, error);
      throw error;
    }
  }, []);

  // Função para fazer upload de capa de livro
  const uploadBookCover = useCallback(async (file: File | Blob, fileName: string): Promise<string> => {
    try {
      return await bookService.uploadBookCover(file, fileName);
    } catch (error) {
      LogManager.error('books', 'Erro ao fazer upload da capa:', error);
      throw error;
    }
  }, []);
  
  // Função para fazer upload de arquivo PDF
  const uploadBookPdf = useCallback(async (file: File | Blob, fileName: string): Promise<string> => {
    try {
      return await bookService.uploadBookPdf(file, fileName);
    } catch (error) {
      LogManager.error('books', 'Erro ao fazer upload do PDF:', error);
      throw error;
    }
  }, []);

  // Função para verificar se um livro tem formato EPUB
  const hasEpub = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      return await bookService.hasEpub(bookId);
    } catch (error) {
      LogManager.error('books', `Erro ao verificar formato EPUB do livro ${bookId}:`, error);
      return false;
    }
  }, []);

  // Função para verificar se um livro tem formato PDF
  const hasPdf = useCallback(async (bookId: string): Promise<boolean> => {
    try {
      return await bookService.hasPdf(bookId);
    } catch (error) {
      LogManager.error('books', `Erro ao verificar formato PDF do livro ${bookId}:`, error);
      return false;
    }
  }, []);

  // Carregar dados iniciais quando o usuário estiver autenticado
  useEffect(() => {
    LogManager.info('books', 'BookProvider inicializado');
    
    if (!authLoading) {
      LogManager.debug('books', 'Carregando dados iniciais de livros');
      refreshAllBooks();
      refreshRecommendedBooks();
      refreshPremiumBooks();
      
      if (user) {
        LogManager.debug('books', 'Usuário autenticado, carregando livros recentes');
        refreshRecentlyReadBooks();
      }
    }
  }, [authLoading, user, refreshAllBooks, refreshRecommendedBooks, refreshPremiumBooks, refreshRecentlyReadBooks]);

  // Criar valor de contexto usando useMemo para evitar renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Dados
    recommendedBooks,
    premiumBooks,
    recentlyReadBooks,
    allBooks,
    // Estado
    loading,
    // Funções
    getBookById,
    getBooksByCategory,
    getReadingProgress,
    updateReadingProgress,
    getBookPdfUrl,
    // Funções de verificação
    hasEpub,
    hasPdf,
    // Funções de upload
    uploadBookCover,
    uploadBookPdf,
    // Funções de atualização
    refreshRecommendedBooks,
    refreshPremiumBooks,
    refreshRecentlyReadBooks,
    refreshAllBooks
  }), [
    recommendedBooks,
    premiumBooks,
    recentlyReadBooks,
    allBooks,
    loading,
    getBookById,
    getBooksByCategory,
    getReadingProgress,
    updateReadingProgress,
    getBookPdfUrl,
    hasEpub,
    hasPdf,
    uploadBookCover,
    uploadBookPdf,
    refreshRecommendedBooks,
    refreshPremiumBooks,
    refreshRecentlyReadBooks,
    refreshAllBooks
  ]);

  return (
    <BookContext.Provider value={contextValue}>
      {children}
    </BookContext.Provider>
  );
});

// Hook otimizado para usar o contexto
export const useBooks = (): BookContextData => {
  try {
    const context = useContext(BookContext);
    
    if (!context) {
      LogManager.error('books', 'useBooks chamado fora do BookProvider');
      return defaultContextValue;
    }
    
    return context;
  } catch (error) {
    LogManager.error('books', 'Erro ao acessar BookContext', error);
    return defaultContextValue;
  }
}; 