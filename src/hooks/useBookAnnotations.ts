import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

// Tipos para bookmarks e anotações
export interface Bookmark {
  bookId: string;
  page: number;
  chapterTitle?: string;
  createdAt: string;
}

export interface Annotation {
  bookId: string;
  text: string;
  note?: string;
  page?: number;
  chapterTitle?: string;
  color?: string;
  createdAt: string;
}

// Chaves para o AsyncStorage
const BOOKMARKS_STORAGE_KEY = 'lendariox_bookmarks';
const ANNOTATIONS_STORAGE_KEY = 'lendariox_annotations';

/**
 * Hook para gerenciar anotações e marcadores de livros
 */
const useBookAnnotations = () => {
  const [bookmarks, setBookmarks] = React.useState<Record<string, Bookmark>>({});
  const [annotations, setAnnotations] = React.useState<Record<string, Annotation>>({});
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [isBookmarkLoaded, setIsBookmarkLoaded] = React.useState<boolean>(false);

  // Carregar anotações e marcadores do AsyncStorage e/ou Supabase
  const loadBookAnnotations = React.useCallback(async (bookId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Carregar do AsyncStorage primeiro para acesso rápido offline
      const storedBookmarksJson = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
      const storedAnnotationsJson = await AsyncStorage.getItem(ANNOTATIONS_STORAGE_KEY);

      let bookmarksData: Record<string, Bookmark> = {};
      let annotationsData: Record<string, Annotation> = {};

      if (storedBookmarksJson) {
        const parsedBookmarks = JSON.parse(storedBookmarksJson);
        // Filtrar apenas os marcadores do livro atual
        bookmarksData = Object.entries(parsedBookmarks)
          .filter(([_, bookmark]) => (bookmark as Bookmark).bookId === bookId)
          .reduce((acc, [key, value]) => {
            acc[key] = value as Bookmark;
            return acc;
          }, {} as Record<string, Bookmark>);
      }

      if (storedAnnotationsJson) {
        const parsedAnnotations = JSON.parse(storedAnnotationsJson);
        // Filtrar apenas as anotações do livro atual
        annotationsData = Object.entries(parsedAnnotations)
          .filter(([_, annotation]) => (annotation as Annotation).bookId === bookId)
          .reduce((acc, [key, value]) => {
            acc[key] = value as Annotation;
            return acc;
          }, {} as Record<string, Annotation>);
      }

      // Tentar sincronizar com o Supabase se estiver online
      try {
        // Carregar marcadores do Supabase
        const { data: bookmarksFromSupabase, error: bookmarksError } = await supabase
          .from('reading_progress')
          .select('id, book_id, current_page, bookmark_locations, last_chapter')
          .eq('book_id', bookId)
          .not('bookmark_locations', 'is', null);

        if (bookmarksError) throw bookmarksError;

        if (bookmarksFromSupabase && bookmarksFromSupabase.length > 0) {
          // Converter dados do Supabase para o formato local
          bookmarksFromSupabase.forEach(bookmark => {
            if (bookmark.bookmark_locations) {
              const locations = Array.isArray(bookmark.bookmark_locations) 
                ? bookmark.bookmark_locations 
                : JSON.parse(bookmark.bookmark_locations);
              
              locations.forEach((location: any, index: number) => {
                const key = `${bookId}-page-${location.page || index}`;
                bookmarksData[key] = {
                  bookId: bookmark.book_id,
                  page: location.page || bookmark.current_page,
                  chapterTitle: location.chapter || bookmark.last_chapter,
                  createdAt: location.created_at || new Date().toISOString(),
                };
              });
            }
          });
        }

        // Carregar anotações do Supabase (supondo que exista uma tabela para isso)
        // Esta implementação pode variar de acordo com a estrutura real do banco de dados
        const { data: annotationsFromSupabase, error: annotationsError } = await supabase
          .from('user_publications')
          .select('id, book_id, content, metadata, created_at')
          .eq('book_id', bookId)
          .eq('type', 'annotation');

        if (annotationsError) throw annotationsError;

        if (annotationsFromSupabase && annotationsFromSupabase.length > 0) {
          annotationsFromSupabase.forEach(annotation => {
            const key = `${bookId}-annotation-${annotation.id}`;
            const metadata = typeof annotation.metadata === 'string' 
              ? JSON.parse(annotation.metadata) 
              : annotation.metadata;
              
            annotationsData[key] = {
              bookId: annotation.book_id,
              text: annotation.content,
              page: metadata?.page,
              chapterTitle: metadata?.chapter,
              color: metadata?.color,
              note: metadata?.note,
              createdAt: annotation.created_at,
            };
          });
        }
      } catch (syncError) {
        console.warn('Erro ao sincronizar com Supabase, usando dados do AsyncStorage:', syncError);
        // Continuamos com os dados do AsyncStorage em caso de falha na sincronização
      }

      // Atualizar o estado
      setBookmarks(bookmarksData);
      setAnnotations(annotationsData);
      setIsBookmarkLoaded(true);
    } catch (err) {
      console.error('Erro ao carregar anotações e marcadores:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar anotações'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar estado atual no AsyncStorage
  const saveToStorage = React.useCallback(async () => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      await AsyncStorage.setItem(ANNOTATIONS_STORAGE_KEY, JSON.stringify(annotations));
    } catch (err) {
      console.error('Erro ao salvar no AsyncStorage:', err);
      setError(err instanceof Error ? err : new Error('Erro ao salvar no AsyncStorage'));
    }
  }, [bookmarks, annotations]);

  // Quando os estados mudam, salvar no AsyncStorage
  React.useEffect(() => {
    if (isBookmarkLoaded) {
      saveToStorage();
    }
  }, [bookmarks, annotations, isBookmarkLoaded, saveToStorage]);

  // Adicionar um marcador
  const addBookmark = React.useCallback((key: string, bookmark: Bookmark) => {
    setBookmarks(prev => ({
      ...prev,
      [key]: bookmark
    }));

    // Sincronizar com Supabase (em segundo plano)
    (async () => {
      try {
        // Verificar se já existe progresso para este livro
        const { data: existingProgress, error: checkError } = await supabase
          .from('reading_progress')
          .select('id, bookmark_locations')
          .eq('book_id', bookmark.bookId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        let bookmarkLocations = [];
        if (existingProgress?.bookmark_locations) {
          bookmarkLocations = Array.isArray(existingProgress.bookmark_locations)
            ? existingProgress.bookmark_locations
            : JSON.parse(existingProgress.bookmark_locations);
        }

        // Adicionar novo marcador
        bookmarkLocations.push({
          page: bookmark.page,
          chapter: bookmark.chapterTitle,
          created_at: bookmark.createdAt
        });

        if (existingProgress) {
          // Atualizar progresso existente
          const { error: updateError } = await supabase
            .from('reading_progress')
            .update({
              bookmark_locations: bookmarkLocations,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProgress.id);

          if (updateError) throw updateError;
        } else {
          // Criar novo registro de progresso
          const { error: insertError } = await supabase
            .from('reading_progress')
            .insert({
              book_id: bookmark.bookId,
              current_page: bookmark.page,
              last_chapter: bookmark.chapterTitle,
              bookmark_locations: bookmarkLocations,
              progress: 0 // Valor inicial
            });

          if (insertError) throw insertError;
        }
      } catch (err) {
        console.error('Erro ao sincronizar marcador com Supabase:', err);
      }
    })();
  }, []);

  // Remover um marcador
  const removeBookmark = React.useCallback((key: string) => {
    setBookmarks(prev => {
      const newBookmarks = { ...prev };
      const bookmark = newBookmarks[key];
      delete newBookmarks[key];
      
      // Sincronizar com Supabase (em segundo plano)
      if (bookmark) {
        (async () => {
          try {
            const { data: existingProgress, error: checkError } = await supabase
              .from('reading_progress')
              .select('id, bookmark_locations')
              .eq('book_id', bookmark.bookId)
              .single();

            if (checkError) throw checkError;

            if (existingProgress?.bookmark_locations) {
              let bookmarkLocations = Array.isArray(existingProgress.bookmark_locations)
                ? existingProgress.bookmark_locations
                : JSON.parse(existingProgress.bookmark_locations);

              // Remover o marcador correspondente
              bookmarkLocations = bookmarkLocations.filter(
                (loc: any) => !(loc.page === bookmark.page && loc.chapter === bookmark.chapterTitle)
              );

              // Atualizar no Supabase
              const { error: updateError } = await supabase
                .from('reading_progress')
                .update({
                  bookmark_locations: bookmarkLocations,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingProgress.id);

              if (updateError) throw updateError;
            }
          } catch (err) {
            console.error('Erro ao remover marcador do Supabase:', err);
          }
        })();
      }
      
      return newBookmarks;
    });
  }, []);

  // Adicionar uma anotação
  const addAnnotation = React.useCallback((key: string, annotation: Annotation) => {
    setAnnotations(prev => ({
      ...prev,
      [key]: annotation
    }));

    // Sincronizar com Supabase (em segundo plano)
    (async () => {
      try {
        const { error } = await supabase
          .from('user_publications')
          .insert({
            book_id: annotation.bookId,
            type: 'annotation',
            content: annotation.text,
            metadata: {
              page: annotation.page,
              chapter: annotation.chapterTitle,
              color: annotation.color,
              note: annotation.note
            }
          });

        if (error) throw error;
      } catch (err) {
        console.error('Erro ao sincronizar anotação com Supabase:', err);
      }
    })();
  }, []);

  // Remover uma anotação
  const removeAnnotation = React.useCallback((key: string) => {
    setAnnotations(prev => {
      const newAnnotations = { ...prev };
      const annotation = newAnnotations[key];
      delete newAnnotations[key];
      
      // Sincronizar com Supabase (em segundo plano)
      if (annotation) {
        (async () => {
          try {
            // Extrair ID da anotação do key (supondo que o key seja no formato "bookId-annotation-id")
            const annotationId = key.split('-annotation-')[1];
            
            if (annotationId) {
              const { error } = await supabase
                .from('user_publications')
                .delete()
                .eq('id', annotationId)
                .eq('type', 'annotation');

              if (error) throw error;
            }
          } catch (err) {
            console.error('Erro ao remover anotação do Supabase:', err);
          }
        })();
      }
      
      return newAnnotations;
    });
  }, []);

  // Verificar se uma página está marcada
  const isBookmarked = React.useCallback((key: string): boolean => {
    return !!bookmarks[key];
  }, [bookmarks]);

  return {
    bookmarks,
    annotations,
    isLoading,
    error,
    loadBookAnnotations,
    addBookmark,
    removeBookmark,
    addAnnotation,
    removeAnnotation,
    isBookmarkLoaded,
    isBookmarked
  };
};

export default useBookAnnotations; 