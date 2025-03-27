import { supabase } from './supabase';
import { Book, ReadingProgress } from '../types/book';
import { isBookDownloaded, getBookDownloadInfo } from '../utils/fileManager';
import LogManager from '../utils/logManager';

export const bookService = {
  // Método para ativar os logs (compatibilidade com código existente)
  enableLogs() {
    LogManager.enableCategory('books');
    LogManager.info('books', 'Logs de livros ativados');
  },

  // Método para desativar os logs (compatibilidade com código existente)
  disableLogs() {
    LogManager.disableCategory('books');
    LogManager.info('app', 'Logs de livros desativados');
  },

  // Obter todos os livros
  async getAllBooks(): Promise<Book[]> {
    try {
      LogManager.info('books', 'Buscando todos os livros');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        LogManager.error('books', 'Erro ao buscar livros', error);
        throw error;
      }

      // Verificar quais livros estão baixados
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const isDownloaded = await isBookDownloaded(book.id);
          return { ...book, is_downloaded: isDownloaded };
        })
      );

      LogManager.info('books', `${data.length} livros encontrados`);
      return booksWithDownloadStatus;
    } catch (error) {
      LogManager.error('books', 'Falha ao buscar livros', error);
      throw error;
    }
  },

  // Obter livros por categoria
  async getBooksByCategory(category: string): Promise<Book[]> {
    try {
      LogManager.info('books', `Buscando livros da categoria: ${category}`);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .containedBy('tags', [category])
        .order('created_at', { ascending: false });

      if (error) {
        LogManager.error('books', `Erro ao buscar livros da categoria ${category}`, error);
        throw error;
      }

      // Verificar quais livros estão baixados
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const isDownloaded = await isBookDownloaded(book.id);
          return { ...book, is_downloaded: isDownloaded };
        })
      );

      LogManager.info('books', `${data.length} livros encontrados na categoria ${category}`);
      return booksWithDownloadStatus;
    } catch (error) {
      LogManager.error('books', `Falha ao buscar livros da categoria ${category}`, error);
      throw error;
    }
  },

  // Obter livros premium
  async getPremiumBooks(): Promise<Book[]> {
    try {
      LogManager.info('books', 'Buscando livros premium');
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_premium', true)
        .order('created_at', { ascending: false });

      if (error) {
        LogManager.error('books', 'Erro ao buscar livros premium', error);
        throw error;
      }

      // Verificar quais livros estão baixados
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const isDownloaded = await isBookDownloaded(book.id);
          return { ...book, is_downloaded: isDownloaded };
        })
      );

      LogManager.info('books', `${data.length} livros premium encontrados`);
      return booksWithDownloadStatus;
    } catch (error) {
      LogManager.error('books', 'Falha ao buscar livros premium', error);
      throw error;
    }
  },

  // Obter detalhes de um livro específico
  async getBookById(id: string): Promise<Book | null> {
    try {
      LogManager.info('books', `Buscando detalhes do livro: ${id}`);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao buscar livro ${id}`, error);
        throw error;
      }

      // Verificar se o livro está baixado
      if (data) {
        const isDownloaded = await isBookDownloaded(id);
        data.is_downloaded = isDownloaded;
      }

      LogManager.info('books', `Livro ${id} encontrado`);
      return data;
    } catch (error) {
      LogManager.error('books', `Falha ao buscar livro ${id}`, error);
      throw error;
    }
  },

  // Buscar progresso de leitura de um livro
  async getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      LogManager.info('books', `Buscando progresso de leitura para o livro: ${bookId}`);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        LogManager.error('books', 'Usuário não autenticado', userError);
        throw new Error('Usuário não autenticado');
      }

      const userId = userData.user.id;
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o erro quando nenhum registro é encontrado
        LogManager.error('books', `Erro ao buscar progresso de leitura para o livro ${bookId}`, error);
        throw error;
      }

      if (data) {
        LogManager.info('books', `Progresso de leitura encontrado para o livro ${bookId}`);
      } else {
        LogManager.info('books', `Nenhum progresso de leitura encontrado para o livro ${bookId}`);
      }
      
      return data;
    } catch (error) {
      LogManager.error('books', `Falha ao buscar progresso de leitura para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Atualizar progresso de leitura
  async updateReadingProgress(
    bookId: string, 
    currentPage: number, 
    totalPages: number,
    additionalData?: {
      currentLocation?: string;
      currentChapter?: string;
    }
  ): Promise<ReadingProgress> {
    try {
      LogManager.info('books', `Atualizando progresso de leitura para o livro: ${bookId}`);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        LogManager.error('books', 'Usuário não autenticado', userError);
        throw new Error('Usuário não autenticado');
      }

      const userId = userData.user.id;
      // Verificar se já existe um progresso para este livro
      const { data: existingProgress } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      const completionPercentage = Math.round((currentPage / totalPages) * 100);
      const completed = completionPercentage >= 100;

      const updateData = {
        current_page: currentPage,
        total_pages: totalPages,
        last_read_at: new Date().toISOString(),
        completed,
        completion_percentage: completionPercentage,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      if (existingProgress) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('reading_progress')
          .update(updateData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          LogManager.error('books', `Erro ao atualizar progresso de leitura para o livro ${bookId}`, error);
          throw error;
        }

        LogManager.info('books', `Progresso de leitura atualizado para o livro ${bookId}`);
        return data;
      } else {
        // Criar novo progresso
        const { data, error } = await supabase
          .from('reading_progress')
          .insert({
            user_id: userId,
            book_id: bookId,
            ...updateData
          })
          .select()
          .single();

        if (error) {
          LogManager.error('books', `Erro ao criar progresso de leitura para o livro ${bookId}`, error);
          throw error;
        }

        LogManager.info('books', `Novo progresso de leitura criado para o livro ${bookId}`);
        return data;
      }
    } catch (error) {
      LogManager.error('books', `Falha ao atualizar progresso de leitura para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Obter URL do PDF para streaming
  async getBookPdfUrl(bookId: string): Promise<string> {
    try {
      LogManager.info('books', `Buscando URL do PDF para o livro: ${bookId}`);
      
      // Verificar se o livro está baixado localmente
      const downloadInfo = await getBookDownloadInfo(bookId);
      if (downloadInfo && downloadInfo.file_type === 'pdf') {
        LogManager.info('books', `Usando PDF baixado localmente para o livro ${bookId}`);
        return downloadInfo.local_uri;
      }
      
      // Se não estiver baixado, buscar do Supabase
      const { data, error } = await supabase
        .from('books')
        .select('pdf_url')
        .eq('id', bookId)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao buscar URL do PDF para o livro ${bookId}`, error);
        throw error;
      }

      if (!data.pdf_url) {
        LogManager.error('books', `Livro ${bookId} não possui URL de PDF`);
        throw new Error('PDF não disponível');
      }

      LogManager.info('books', `URL do PDF encontrada para o livro ${bookId}`);
      return data.pdf_url;
    } catch (error) {
      LogManager.error('books', `Falha ao obter URL do PDF para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Obter URL do EPUB para streaming
  async getBookEpubUrl(bookId: string): Promise<string> {
    try {
      LogManager.info('books', `Buscando URL do EPUB para o livro: ${bookId}`);
      
      // Verificar se o livro está baixado localmente
      const downloadInfo = await getBookDownloadInfo(bookId);
      if (downloadInfo && downloadInfo.file_type === 'epub') {
        LogManager.info('books', `Usando EPUB baixado localmente para o livro ${bookId}`);
        return downloadInfo.local_uri;
      }
      
      // Se não estiver baixado, buscar do Supabase
      const { data, error } = await supabase
        .from('books')
        .select('epub_url')
        .eq('id', bookId)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao buscar URL do EPUB para o livro ${bookId}`, error);
        throw error;
      }

      if (!data.epub_url) {
        LogManager.error('books', `Livro ${bookId} não possui URL de EPUB`);
        throw new Error('EPUB não disponível');
      }

      LogManager.info('books', `URL do EPUB encontrada para o livro ${bookId}`);
      return data.epub_url;
    } catch (error) {
      LogManager.error('books', `Falha ao obter URL do EPUB para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Obter URL pública temporária do PDF para streaming
  async getBookPdfStreamUrl(bookId: string): Promise<string> {
    try {
      LogManager.info('books', `Buscando URL de streaming do PDF para o livro: ${bookId}`);
      
      // Verificar se o livro está baixado localmente
      const downloadInfo = await getBookDownloadInfo(bookId);
      if (downloadInfo && downloadInfo.file_type === 'pdf') {
        LogManager.info('books', `Usando PDF baixado localmente para o livro ${bookId}`);
        return downloadInfo.local_uri;
      }
      
      // Se não estiver baixado, buscar do Supabase Storage
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('pdf_url')
        .eq('id', bookId)
        .single();

      if (bookError || !book || !book.pdf_url) {
        LogManager.error('books', `Erro ao buscar informações do livro ${bookId}`, bookError);
        throw bookError || new Error('Livro não encontrado ou sem PDF');
      }

      // Extrair o path do arquivo dentro do storage
      const urlParts = book.pdf_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const bucketPath = `pdfs/${fileName}`;

      // Obter URL pública assinada
      const { data, error } = await supabase.storage
        .from('books')
        .createSignedUrl(bucketPath, 3600); // URL válida por 1 hora

      if (error) {
        LogManager.error('books', `Erro ao criar URL de streaming para ${bucketPath}`, error);
        throw error;
      }

      LogManager.info('books', `URL de streaming do PDF criada para o livro ${bookId}`);
      return data.signedUrl;
    } catch (error) {
      LogManager.error('books', `Falha ao obter URL de streaming para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Obter URL pública temporária do EPUB para streaming
  async getBookEpubStreamUrl(bookId: string): Promise<string> {
    try {
      LogManager.info('books', `Buscando URL de streaming do EPUB para o livro: ${bookId}`);
      
      // Verificar se o livro está baixado localmente
      const downloadInfo = await getBookDownloadInfo(bookId);
      if (downloadInfo && downloadInfo.file_type === 'epub') {
        LogManager.info('books', `Usando EPUB baixado localmente para o livro ${bookId}`);
        return downloadInfo.local_uri;
      }
      
      // Se não estiver baixado, buscar do Supabase Storage
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('epub_url')
        .eq('id', bookId)
        .single();

      if (bookError || !book || !book.epub_url) {
        LogManager.error('books', `Erro ao buscar informações do livro ${bookId}`, bookError);
        throw bookError || new Error('Livro não encontrado ou sem EPUB');
      }

      // Extrair o path do arquivo dentro do storage
      const urlParts = book.epub_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const bucketPath = `epubs/${fileName}`;

      // Obter URL pública assinada
      const { data, error } = await supabase.storage
        .from('books')
        .createSignedUrl(bucketPath, 3600); // URL válida por 1 hora

      if (error) {
        LogManager.error('books', `Erro ao criar URL de streaming para ${bucketPath}`, error);
        throw error;
      }

      LogManager.info('books', `URL de streaming do EPUB criada para o livro ${bookId}`);
      return data.signedUrl;
    } catch (error) {
      LogManager.error('books', `Falha ao obter URL de streaming para o livro ${bookId}`, error);
      throw error;
    }
  },

  // Buscar livros recentemente lidos pelo usuário
  async getRecentlyReadBooks(): Promise<Book[]> {
    try {
      LogManager.info('books', 'Buscando livros lidos recentemente');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        LogManager.error('books', 'Usuário não autenticado', userError);
        throw new Error('Usuário não autenticado');
      }

      const userId = userData.user.id;
      const { data: progressData, error: progressError } = await supabase
        .from('reading_progress')
        .select('book_id, last_read_at')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(10);

      if (progressError) {
        LogManager.error('books', 'Erro ao buscar progresso de leitura recente', progressError);
        throw progressError;
      }

      if (!progressData || progressData.length === 0) {
        LogManager.info('books', 'Nenhum livro lido recentemente');
        return [];
      }

      // Extrair os IDs dos livros
      const bookIds = progressData.map(item => item.book_id);
      
      // Buscar informações completas dos livros
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds);

      if (booksError) {
        LogManager.error('books', 'Erro ao buscar informações dos livros recentes', booksError);
        throw booksError;
      }

      // Reordenar os livros na mesma ordem do progresso (mais recente primeiro)
      const orderedBooks = bookIds.map(bookId => {
        return booksData.find(book => book.id === bookId);
      }).filter(Boolean);

      // Verificar quais livros estão baixados
      const booksWithDownloadStatus = await Promise.all(
        orderedBooks.map(async (book) => {
          const isDownloaded = await isBookDownloaded(book.id);
          return { ...book, is_downloaded: isDownloaded };
        })
      );

      LogManager.info('books', `${orderedBooks.length} livros lidos recentemente encontrados`);
      return booksWithDownloadStatus;
    } catch (error) {
      LogManager.error('books', 'Falha ao buscar livros lidos recentemente', error);
      throw error;
    }
  },

  // Obter recomendações de livros (exemplo simples)
  async getRecommendedBooks(): Promise<Book[]> {
    try {
      LogManager.info('books', 'Buscando livros recomendados');
      // Em um app real, aqui você implementaria a lógica de recomendação
      // baseada nos interesses do usuário, histórico de leitura, etc.
      
      // Por enquanto, apenas retorna alguns livros aleatórios
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(10)
        .order('views', { ascending: false });

      if (error) {
        LogManager.error('books', 'Erro ao buscar livros recomendados', error);
        throw error;
      }

      // Verificar quais livros estão baixados
      const booksWithDownloadStatus = await Promise.all(
        data.map(async (book) => {
          const isDownloaded = await isBookDownloaded(book.id);
          return { ...book, is_downloaded: isDownloaded };
        })
      );

      LogManager.info('books', `${data.length} livros recomendados encontrados`);
      return booksWithDownloadStatus;
    } catch (error) {
      LogManager.error('books', 'Falha ao buscar livros recomendados', error);
      throw error;
    }
  },

  // Upload de capa de livro
  async uploadBookCover(file: File | Blob, fileName: string): Promise<string> {
    try {
      LogManager.info('books', `Iniciando upload de capa: ${fileName}`);
      const { data, error } = await supabase.storage
        .from('books')
        .upload(`covers/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        LogManager.error('books', `Erro ao fazer upload da capa ${fileName}`, error);
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = await supabase.storage
        .from('books')
        .getPublicUrl(`covers/${fileName}`);
        
      LogManager.info('books', `Upload de capa concluído: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      LogManager.error('books', `Falha ao fazer upload da capa ${fileName}`, error);
      throw error;
    }
  },

  // Upload de PDF
  async uploadBookPdf(file: File | Blob, fileName: string): Promise<string> {
    try {
      LogManager.info('books', `Iniciando upload de PDF: ${fileName}`);
      const { data, error } = await supabase.storage
        .from('books')
        .upload(`pdfs/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        LogManager.error('books', `Erro ao fazer upload do PDF ${fileName}`, error);
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = await supabase.storage
        .from('books')
        .getPublicUrl(`pdfs/${fileName}`);

      LogManager.info('books', `Upload de PDF concluído: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      LogManager.error('books', `Falha ao fazer upload do PDF ${fileName}`, error);
      throw error;
    }
  },

  // Upload de EPUB
  async uploadBookEpub(file: File | Blob, fileName: string): Promise<string> {
    try {
      LogManager.info('books', `Iniciando upload de EPUB: ${fileName}`);
      const { data, error } = await supabase.storage
        .from('books')
        .upload(`epubs/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        LogManager.error('books', `Erro ao fazer upload do EPUB ${fileName}`, error);
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = await supabase.storage
        .from('books')
        .getPublicUrl(`epubs/${fileName}`);

      LogManager.info('books', `Upload de EPUB concluído: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      LogManager.error('books', `Falha ao fazer upload do EPUB ${fileName}`, error);
      throw error;
    }
  },

  // Salvar progresso de leitura com valor percentual
  async saveReadingProgress(bookId: string, progress: number): Promise<void> {
    try {
      LogManager.info('books', `Salvando progresso de leitura para o livro: ${bookId}, progresso: ${progress}`);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        LogManager.error('books', 'Usuário não autenticado', userError);
        throw new Error('Usuário não autenticado');
      }

      const userId = userData.user.id;
      
      // Verificar se já existe um progresso para este livro
      const { data: existingProgress, error: checkError } = await supabase
        .from('reading_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      // Normalizar o progresso para um valor entre 0 e 100
      const normalizedProgress = Math.min(Math.max(progress * 100, 0), 100);
      const completed = normalizedProgress >= 99.5; // Considerar como concluído se acima de 99.5%
      
      const updateData = {
        progress: normalizedProgress,
        completed,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingProgress) {
        // Atualizar progresso existente
        const { error: updateError } = await supabase
          .from('reading_progress')
          .update(updateData)
          .eq('id', existingProgress.id);

        if (updateError) {
          LogManager.error('books', `Erro ao atualizar progresso simplificado para o livro ${bookId}`, updateError);
          throw updateError;
        }
      } else {
        // Criar novo progresso
        const { error: insertError } = await supabase
          .from('reading_progress')
          .insert({
            user_id: userId,
            book_id: bookId,
            ...updateData
          });

        if (insertError) {
          LogManager.error('books', `Erro ao criar progresso simplificado para o livro ${bookId}`, insertError);
          throw insertError;
        }
      }

      LogManager.info('books', `Progresso de leitura (${normalizedProgress}%) salvo para o livro ${bookId}`);
    } catch (error) {
      LogManager.error('books', `Falha ao salvar progresso simplificado para o livro ${bookId}`, error);
      // Apenas logar o erro, sem quebrar a experiência de leitura
      console.error(error);
    }
  },

  // Atualizar o último livro lido
  async updateLastRead(bookId: string): Promise<void> {
    try {
      LogManager.info('books', `Atualizando último livro lido: ${bookId}`);
      
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        LogManager.error('books', 'Usuário não autenticado', userError);
        throw new Error('Usuário não autenticado');
      }

      const userId = userData.user.id;
      
      // Atualizar o campo last_read_at na tabela reading_progress
      const { error: updateError } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          book_id: bookId,
          last_read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,book_id'
        });

      if (updateError) {
        LogManager.error('books', `Erro ao atualizar último livro lido ${bookId}`, updateError);
        throw updateError;
      }

      // Atualizar o contador de visualizações do livro
      const { error: viewError } = await supabase.rpc('increment_book_views', {
        book_id: bookId
      });

      if (viewError) {
        LogManager.error('books', `Erro ao incrementar visualizações do livro ${bookId}`, viewError);
        // Não lançar erro aqui, pois essa é uma operação secundária
        console.warn(viewError);
      }

      LogManager.info('books', `Último livro lido atualizado para ${bookId}`);
    } catch (error) {
      LogManager.error('books', `Falha ao atualizar último livro lido ${bookId}`, error);
      // Apenas logar o erro, sem quebrar a experiência de leitura
      console.error(error);
    }
  },

  // Determina o tipo de arquivo do livro (PDF ou EPUB)
  async getBookFileType(bookId: string): Promise<'pdf' | 'epub' | null> {
    try {
      LogManager.info('books', `Verificando tipo de arquivo do livro: ${bookId}`);
      const { data, error } = await supabase
        .from('books')
        .select('pdf_url, epub_url')
        .eq('id', bookId)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao verificar tipo de arquivo do livro ${bookId}`, error);
        throw error;
      }

      if (data.epub_url) {
        return 'epub';
      } else if (data.pdf_url) {
        return 'pdf';
      }

      return null;
    } catch (error) {
      LogManager.error('books', `Falha ao verificar tipo de arquivo do livro ${bookId}`, error);
      throw error;
    }
  },

  // Verifica se o livro tem formato PDF
  async hasPdf(bookId: string): Promise<boolean> {
    try {
      LogManager.info('books', `Verificando se o livro ${bookId} tem formato PDF`);
      const { data, error } = await supabase
        .from('books')
        .select('pdf_url')
        .eq('id', bookId)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao verificar formato PDF do livro ${bookId}`, error);
        throw error;
      }

      return !!data.pdf_url;
    } catch (error) {
      LogManager.error('books', `Falha ao verificar formato PDF do livro ${bookId}`, error);
      return false;
    }
  },

  // Verifica se o livro tem formato EPUB
  async hasEpub(bookId: string): Promise<boolean> {
    try {
      LogManager.info('books', `Verificando se o livro ${bookId} tem formato EPUB`);
      const { data, error } = await supabase
        .from('books')
        .select('epub_url')
        .eq('id', bookId)
        .single();

      if (error) {
        LogManager.error('books', `Erro ao verificar formato EPUB do livro ${bookId}`, error);
        throw error;
      }

      return !!data.epub_url;
    } catch (error) {
      LogManager.error('books', `Falha ao verificar formato EPUB do livro ${bookId}`, error);
      return false;
    }
  }
}; 