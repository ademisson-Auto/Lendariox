import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import { bookService } from '../services/bookService';

const usePdfViewer = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);

  // Função para obter URL de streaming do PDF 
  const getPdfStreamUrl = async (bookId: string): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Obter URL do PDF do Supabase com parâmetro de streaming
      const pdfUrl = await bookService.getBookPdfStreamUrl(bookId);
      if (!pdfUrl) {
        throw new Error('URL do PDF não disponível');
      }
      
      setLoading(false);
      setStreamReady(true);
      return pdfUrl;
    } catch (error) {
      setLoading(false);
      console.error('Erro ao obter URL de streaming do PDF:', error);
      Alert.alert('Erro', 'Não foi possível carregar o PDF. Tente novamente mais tarde.');
      return null;
    }
  };

  // Função para baixar o PDF (versão original para compatibilidade)
  const downloadPdf = async (bookId: string, fileName: string): Promise<string | null> => {
    try {
      setLoading(true);
      setProgress(0);
      
      // Verifica se o PDF já existe no cache
      const fileUri = `${FileSystem.cacheDirectory}${fileName}.pdf`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        console.log('PDF já existe no cache, usando cópia local');
        setLocalUri(fileUri);
        setLoading(false);
        return fileUri;
      }
      
      // Se estiver no modo de desenvolvimento ou for um dispositivo com pouca memória,
      // usar URL de streaming direta em vez de baixar
      if (__DEV__ || Platform.OS === 'web') {
        const streamUrl = await getPdfStreamUrl(bookId);
        if (streamUrl) {
          setLocalUri(streamUrl);
          setLoading(false);
          return streamUrl;
        }
        return null;
      }
      
      // Obter URL do PDF do Supabase
      const pdfUrl = await bookService.getBookPdfUrl(bookId);
      if (!pdfUrl) {
        throw new Error('URL do PDF não disponível');
      }
      
      // Baixar o PDF para o armazenamento local
      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setProgress(progress);
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error('Falha ao baixar o PDF');
      }

      setLocalUri(result.uri);
      setLoading(false);
      
      console.log('PDF baixado com sucesso para:', result.uri);
      return result.uri;
    } catch (error) {
      setLoading(false);
      console.error('Erro ao baixar PDF:', error);
      Alert.alert('Erro', 'Não foi possível baixar o PDF. Tente novamente mais tarde.');
      return null;
    }
  };
  
  // Função para compartilhar o PDF
  const sharePdf = async (uri: string, fileName: string): Promise<void> => {
    try {
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/pdf'
          );
          
          await FileSystem.copyAsync({
            from: uri,
            to: destinationUri
          });
          
          Alert.alert('Sucesso', 'PDF salvo com sucesso!');
        }
      } else {
        // iOS e outras plataformas
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Erro', 'O compartilhamento não está disponível neste dispositivo');
        }
      }
    } catch (error) {
      console.error('Erro ao compartilhar PDF:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o PDF');
    }
  };
  
  // Função para limpar o cache
  const clearCache = async (): Promise<void> => {
    try {
      if (localUri && localUri.startsWith('file://')) {
        await FileSystem.deleteAsync(localUri);
        setLocalUri(null);
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  };
  
  // Função para preparar a fonte do PDF para exibição
  const preparePdfSource = async (bookId: string, forceDownload = false): Promise<{
    uri: string;
    isStreaming: boolean;
  } | null> => {
    try {
      setLoading(true);
      
      const fileName = (await bookService.getBookById(bookId))?.title.replace(/\s+/g, '_').toLowerCase() || `book_${bookId}`;
      
      // Verificar se já existe localmente
      if (!forceDownload) {
        const fileUri = `${FileSystem.cacheDirectory}${fileName}.pdf`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (fileInfo.exists) {
          setLocalUri(fileUri);
          setLoading(false);
          return { uri: fileUri, isStreaming: false };
        }
      }
      
      // Tentar streaming primeiro
      const streamUrl = await getPdfStreamUrl(bookId);
      if (streamUrl) {
        setLoading(false);
        setStreamReady(true);
        return { uri: streamUrl, isStreaming: true };
      }
      
      // Fallback para download
      const pdfUri = await downloadPdf(bookId, fileName);
      if (pdfUri) {
        return { uri: pdfUri, isStreaming: false };
      }
      
      return null;
    } catch (error) {
      setLoading(false);
      console.error('Erro ao preparar fonte do PDF:', error);
      Alert.alert('Erro', 'Não foi possível preparar o PDF para visualização');
      return null;
    }
  };
  
  // Função para abrir o PDF no leitor
  const openPdf = async (
    navigation: any, 
    bookId: string, 
    title: string, 
    currentPage: number = 1, 
    totalPages: number = 100
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const pdfSource = await preparePdfSource(bookId);
      if (!pdfSource) {
        throw new Error('Não foi possível preparar o PDF');
      }
      
      // Navegar para a tela de leitura
      navigation.navigate('PdfReader', {
        uri: pdfSource.uri,
        bookId: bookId,
        title: title,
        currentPage: currentPage,
        totalPages: totalPages,
        isStreaming: pdfSource.isStreaming
      });
      
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      console.error('Erro ao abrir PDF:', error);
      Alert.alert('Erro', 'Não foi possível abrir o PDF para leitura');
      return false;
    }
  };
  
  return {
    loading,
    progress,
    localUri,
    streamReady,
    getPdfStreamUrl,
    downloadPdf,
    sharePdf,
    clearCache,
    preparePdfSource,
    openPdf
  };
};

export default usePdfViewer; 