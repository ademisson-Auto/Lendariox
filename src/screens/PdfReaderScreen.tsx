import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  BackHandler,
  ProgressBarAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooks } from '../contexts/BookContext';
import { WebView } from 'react-native-webview';
import usePdfViewer from '../hooks/usePdfViewer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { applyPdfFix } from '../../patches/fix-pdf-loading';

// Aplicar patch para melhorar o carregamento do PDF
applyPdfFix();

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

type PdfReaderScreenProps = NativeStackScreenProps<RootStackParamList, 'PdfReader'>;

const PdfReaderScreen = ({ route, navigation }: PdfReaderScreenProps) => {
  const { uri, bookId, title, currentPage, totalPages } = route.params;
  const { updateReadingProgress } = useBooks();
  const { sharePdf } = usePdfViewer();
  
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [page, setPage] = useState(currentPage);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const webViewRef = useRef<WebView>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lidar com botão de voltar no Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  // Esconder controles após um tempo
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Salvar progresso de leitura antes de sair
  const handleExit = async () => {
    try {
      await updateReadingProgress(bookId, page, totalPages);
    } catch (error) {
      console.error('Erro ao salvar progresso de leitura:', error);
    } finally {
      navigation.goBack();
    }
  };

  // Função para mudar de página
  const changePage = (increment: number) => {
    const newPage = Math.max(1, Math.min(page + increment, totalPages));
    setPage(newPage);
    
    // Enviar mensagem para WebView atualizar página
    const script = `window.scrollTo(0, ${(newPage - 1) / totalPages} * document.body.scrollHeight); true;`;
    webViewRef.current?.injectJavaScript(script);
  };

  // Compartilhar o PDF
  const handleShare = async () => {
    try {
      const fileName = title.replace(/\s+/g, '_').toLowerCase();
      await sharePdf(uri, fileName);
    } catch (error) {
      console.error('Erro ao compartilhar PDF:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o PDF');
    }
  };

  // Função para alternar controles ao tocar na tela
  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  // Script de inicialização para o WebView
  const initializeScript = `
    (function() {
      // Configuração para carregar apenas as páginas visíveis primeiro
      if (typeof PDFViewerApplication !== 'undefined') {
        PDFViewerApplication.initiallyHighestPriority = true;
      }
      
      // Verificar se é possível acessar o documento
      if (document && document.body) {
        // Scroll para a página correta
        const scrollToPage = () => {
          const targetPosition = ${(currentPage - 1) / totalPages} * document.body.scrollHeight;
          window.scrollTo(0, targetPosition);
        };
        
        // Tentar configurar a página inicial
        setTimeout(scrollToPage, 500);
      }
      
      // Reportar progresso de carregamento
      window.addEventListener('load', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'initialLoadComplete',
          success: true
        }));
      });
      
      true;
    })();
  `;

  // Script para detectar scroll e gerenciar PDF
  const scrollDetectionScript = `
    (function() {
      let lastScrollPosition = 0;
      let scrollTimer = null;
      let pdfLoaded = false;
      
      // Reportar progresso de carregamento
      const reportLoadProgress = (progress) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'loadProgress',
          progress: progress
        }));
      };
      
      // Tentar detectar carregamento do PDF
      const checkPdfLoading = () => {
        if (typeof PDFViewerApplication !== 'undefined') {
          const loadingProgress = PDFViewerApplication.loadingBar?.percent || 0;
          reportLoadProgress(loadingProgress / 100);
          
          if (!pdfLoaded && PDFViewerApplication.pdfDocument) {
            pdfLoaded = true;
            reportLoadProgress(1);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pdfLoaded',
              pageCount: PDFViewerApplication.pagesCount || ${totalPages}
            }));
          }
        }
      };
      
      // Verificar progresso a cada 500ms
      const progressInterval = setInterval(() => {
        checkPdfLoading();
        if (pdfLoaded) {
          clearInterval(progressInterval);
        }
      }, 500);
      
      // Detectar mudanças de página no scroll
      document.addEventListener('scroll', function(e) {
        if (scrollTimer !== null) {
          clearTimeout(scrollTimer);
        }
        
        scrollTimer = setTimeout(function() {
          const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
          const totalHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
          const windowHeight = window.innerHeight;
          const scrollPercentage = scrollPosition / (totalHeight - windowHeight);
          
          const currentPage = Math.round(scrollPercentage * ${totalPages}) + 1;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'pageChange',
            page: currentPage
          }));
          
          lastScrollPosition = scrollPosition;
        }, 100);
      });
    })();
    true;
  `;

  // Lidar com mensagens da WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'pageChange':
          setPage(data.page);
          break;
        case 'loadProgress':
          setLoadingProgress(data.progress);
          break;
        case 'pdfLoaded':
          setLoading(false);
          if (data.pageCount && data.pageCount !== totalPages) {
            // Atualizar contagem total de páginas no banco de dados
            updateReadingProgress(bookId, currentPage, data.pageCount);
          }
          break;
        case 'initialLoadComplete':
          // A página inicial carregou, mas o PDF pode ainda estar sendo processado
          if (data.success && loadingProgress > 0.8) {
            setLoading(false);
          }
          break;
      }
    } catch (e) {
      console.error('Erro ao processar mensagem da WebView:', e);
    }
  };

  // Renderizar o indicador de progresso adequado para a plataforma
  const renderProgressIndicator = () => {
    const progressValue = loadingProgress || 0.05; // Mínimo de 5% para feedback visual
    
    if (Platform.OS === 'android') {
      return (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={progressValue === 0}
          progress={progressValue}
          color="#6200ee"
          style={styles.progressBar}
        />
      );
    } else {
      // Fallback para iOS e outras plataformas
      return (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressValue * 100}%` }]} />
        </View>
      );
    }
  };

  // Determinar a source baseado no tipo de URI
  const getWebViewSource = () => {
    // Se for uma URL remota (começa com http ou https)
    if (uri.startsWith('http')) {
      return { 
        uri,
        headers: {
          'Accept': 'application/pdf',
          'Cache-Control': 'no-store'
        }
      };
    }
    // Se for um arquivo local
    return { uri: `file://${uri}` };
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.touchableContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* WebView para exibir o PDF */}
        <WebView
          ref={webViewRef}
          source={getWebViewSource()}
          style={styles.webView}
          onLoadStart={() => {
            setLoading(true);
            setLoadingProgress(0);
          }}
          onLoadEnd={() => {
            if (loadingProgress > 0.9) {
              setLoading(false);
            }
          }}
          onError={(e) => {
            setError('Erro ao carregar o PDF. Tente novamente.');
            setLoading(false);
          }}
          injectedJavaScript={loading ? initializeScript : scrollDetectionScript}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          decelerationRate="normal"
          showsVerticalScrollIndicator={false}
          cacheEnabled={true}
          incognito={false}
        />
        
        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>
              {loadingProgress > 0 
                ? `Carregando PDF: ${Math.round(loadingProgress * 100)}%` 
                : 'Preparando visualizador...'}
            </Text>
            {renderProgressIndicator()}
          </View>
        )}
        
        {/* Erro overlay */}
        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={normalize(48)} color="#ff5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={handleExit}>
              <Text style={styles.errorButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Controles de leitura */}
        {showControls && !error && (
          <>
            {/* Cabeçalho */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.headerButton} onPress={handleExit}>
                <Ionicons name="arrow-back" size={normalize(24)} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={normalize(24)} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Navegação de página */}
            <View style={styles.pageControls}>
              <TouchableOpacity 
                style={styles.pageButton}
                onPress={() => changePage(-1)}
                disabled={page <= 1}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={normalize(28)} 
                  color={page <= 1 ? "#555" : "#fff"} 
                />
              </TouchableOpacity>
              
              <View style={styles.pageInfo}>
                <Text style={styles.pageText}>
                  Página {page} de {totalPages}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${(page / totalPages) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.pageButton}
                onPress={() => changePage(1)}
                disabled={page >= totalPages}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={normalize(28)} 
                  color={page >= totalPages ? "#555" : "#fff"} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  touchableContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: normalize(16),
    fontSize: normalize(16),
    marginBottom: normalize(16),
  },
  progressBar: {
    width: width * 0.7,
    height: normalize(4),
  },
  progressBarContainer: {
    width: width * 0.7,
    height: normalize(4),
    backgroundColor: '#333',
    borderRadius: normalize(2),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: normalize(2),
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(32),
  },
  errorText: {
    color: '#fff',
    marginTop: normalize(16),
    fontSize: normalize(16),
    textAlign: 'center',
    marginBottom: normalize(24),
  },
  errorButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(12),
    borderRadius: normalize(24),
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
  },
  headerButton: {
    padding: normalize(8),
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: normalize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: normalize(8),
  },
  pageControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
  },
  pageButton: {
    padding: normalize(8),
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    color: '#fff',
    fontSize: normalize(14),
    marginBottom: normalize(8),
  },
});

export default PdfReaderScreen; 