import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { BookDownload } from '../types/book';

/**
 * Diretório para armazenar livros baixados
 */
const BOOKS_DIRECTORY = `${FileSystem.documentDirectory}books/`;

/**
 * Inicializa o sistema de arquivos, criando diretórios necessários
 */
export const initializeFileSystem = async (): Promise<void> => {
  try {
    const directoryInfo = await FileSystem.getInfoAsync(BOOKS_DIRECTORY);
    
    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_DIRECTORY, { intermediates: true });
      console.log('Diretório de livros criado:', BOOKS_DIRECTORY);
    }
  } catch (error) {
    console.error('Erro ao inicializar sistema de arquivos:', error);
    throw error;
  }
};

/**
 * Baixa um arquivo PDF ou EPUB e o salva localmente
 */
export const downloadBook = async (
  bookId: string,
  userId: string,
  fileUrl: string,
  fileType: 'pdf' | 'epub'
): Promise<BookDownload> => {
  try {
    // Garante que o diretório existe
    await initializeFileSystem();
    
    // Determina o nome do arquivo baseado no ID do livro e tipo
    const fileName = `${bookId}.${fileType}`;
    const localUri = `${BOOKS_DIRECTORY}${fileName}`;
    
    // Verifica se o arquivo já existe
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (fileInfo.exists) {
      // Retorna o arquivo existente
      console.log('Livro já baixado:', localUri);
      
      // Recupera informações do download
      const downloadInfo = await getBookDownloadInfo(bookId);
      
      if (downloadInfo) {
        return downloadInfo;
      }
    }
    
    // Inicia o download
    console.log('Iniciando download:', fileUrl);
    const downloadResumable = FileSystem.createDownloadResumable(
      fileUrl,
      localUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        // Aqui você pode emitir um evento de progresso se necessário
        console.log(`Download progresso: ${Math.round(progress * 100)}%`);
      }
    );
    
    const result = await downloadResumable.downloadAsync();
    
    if (!result) {
      throw new Error('Download falhou');
    }
    
    // Cria registro do download
    const download: BookDownload = {
      id: `${bookId}_${userId}`,
      book_id: bookId,
      user_id: userId,
      local_uri: result.uri,
      file_size: 0,
      download_date: new Date().toISOString(),
      is_complete: true,
      file_type: fileType
    };
    
    // Salva informações do download
    await saveBookDownloadInfo(download);
    
    console.log('Download concluído:', result.uri);
    return download;
  } catch (error) {
    console.error('Erro ao baixar livro:', error);
    throw error;
  }
};

/**
 * Remove um livro baixado do armazenamento local
 */
export const removeDownloadedBook = async (bookId: string): Promise<boolean> => {
  try {
    // Recupera informações do download
    const download = await getBookDownloadInfo(bookId);
    
    if (!download) {
      console.log('Nenhum download encontrado para:', bookId);
      return false;
    }
    
    // Verifica se o arquivo existe
    const fileInfo = await FileSystem.getInfoAsync(download.local_uri);
    
    if (fileInfo.exists) {
      // Remove o arquivo
      await FileSystem.deleteAsync(download.local_uri);
      console.log('Arquivo removido:', download.local_uri);
    }
    
    // Remove informações do download do AsyncStorage
    await removeBookDownloadInfo(bookId);
    
    return true;
  } catch (error) {
    console.error('Erro ao remover livro:', error);
    return false;
  }
};

/**
 * Compartilha um livro baixado
 */
export const shareBook = async (bookId: string): Promise<boolean> => {
  try {
    // Recupera informações do download
    const download = await getBookDownloadInfo(bookId);
    
    if (!download) {
      console.log('Nenhum download encontrado para compartilhar:', bookId);
      return false;
    }
    
    // Verifica se o compartilhamento está disponível
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Compartilhamento não disponível');
      return false;
    }
    
    // Compartilha o arquivo
    await Sharing.shareAsync(download.local_uri);
    console.log('Arquivo compartilhado:', download.local_uri);
    
    return true;
  } catch (error) {
    console.error('Erro ao compartilhar livro:', error);
    return false;
  }
};

/**
 * Salva informações de um download no AsyncStorage
 */
const saveBookDownloadInfo = async (download: BookDownload): Promise<void> => {
  try {
    // Recupera downloads existentes
    const downloadsJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOK_DOWNLOADS);
    const downloads: Record<string, BookDownload> = downloadsJson 
      ? JSON.parse(downloadsJson) 
      : {};
    
    // Adiciona ou atualiza o download
    downloads[download.book_id] = download;
    
    // Salva de volta no AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.BOOK_DOWNLOADS, JSON.stringify(downloads));
  } catch (error) {
    console.error('Erro ao salvar informações de download:', error);
    throw error;
  }
};

/**
 * Recupera informações de um download específico
 */
export const getBookDownloadInfo = async (bookId: string): Promise<BookDownload | null> => {
  try {
    const downloadsJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOK_DOWNLOADS);
    
    if (!downloadsJson) {
      return null;
    }
    
    const downloads: Record<string, BookDownload> = JSON.parse(downloadsJson);
    return downloads[bookId] || null;
  } catch (error) {
    console.error('Erro ao recuperar informações de download:', error);
    return null;
  }
};

/**
 * Remove informações de um download do AsyncStorage
 */
const removeBookDownloadInfo = async (bookId: string): Promise<void> => {
  try {
    const downloadsJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOK_DOWNLOADS);
    
    if (!downloadsJson) {
      return;
    }
    
    const downloads: Record<string, BookDownload> = JSON.parse(downloadsJson);
    
    if (downloads[bookId]) {
      delete downloads[bookId];
      await AsyncStorage.setItem(STORAGE_KEYS.BOOK_DOWNLOADS, JSON.stringify(downloads));
    }
  } catch (error) {
    console.error('Erro ao remover informações de download:', error);
    throw error;
  }
};

/**
 * Lista todos os livros baixados
 */
export const getAllDownloadedBooks = async (): Promise<BookDownload[]> => {
  try {
    const downloadsJson = await AsyncStorage.getItem(STORAGE_KEYS.BOOK_DOWNLOADS);
    
    if (!downloadsJson) {
      return [];
    }
    
    const downloads: Record<string, BookDownload> = JSON.parse(downloadsJson);
    return Object.values(downloads);
  } catch (error) {
    console.error('Erro ao listar livros baixados:', error);
    return [];
  }
};

/**
 * Verifica se um livro está baixado
 */
export const isBookDownloaded = async (bookId: string): Promise<boolean> => {
  const download = await getBookDownloadInfo(bookId);
  
  if (!download) {
    return false;
  }
  
  // Verifica se o arquivo realmente existe
  const fileInfo = await FileSystem.getInfoAsync(download.local_uri);
  return fileInfo.exists;
}; 