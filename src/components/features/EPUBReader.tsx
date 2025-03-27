import * as React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { EPUBReaderProps, EPUBBook, EPUBLocation, EPUBSelection } from '../../types/epub-reader';
import { colors } from '../../theme';

/**
 * Componente de leitor EPUB simplificado usando WebView
 * 
 * Como não temos acesso a uma biblioteca dedicada para EPUB,
 * usamos WebView com uma abordagem mais simples para exibir conteúdo EPUB.
 */
const EPUBReader: React.FC<EPUBReaderProps> = ({
  src,
  style,
  fontSize = 16,
  theme = 'light',
  initialLocation,
  onLocationChange,
  onLoad,
  onError,
  onSelection,
}) => {
  const webViewRef = React.useRef<WebView>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [htmlContent, setHtmlContent] = React.useState<string | null>(null);

  // Função para preparar o conteúdo EPUB
  const prepareEpubContent = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Se a fonte for uma URL, vamos exibir diretamente na WebView 
      // com um HTML básico para controlar aparência
      if (src.startsWith('http')) {
        // HTML básico que pode carregar o EPUB através de uma iframe ou embed
        // Na prática, uma implementação mais robusta seria necessária
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                  font-size: ${fontSize}px;
                  line-height: 1.5;
                  ${theme === 'dark' 
                    ? 'background-color: #121212; color: #ffffff;' 
                    : theme === 'sepia' 
                      ? 'background-color: #f8f1e3; color: #5f4b32;' 
                      : 'background-color: #ffffff; color: #333333;'
                  }
                }
                .container {
                  padding: 16px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                iframe {
                  width: 100%;
                  height: 100vh;
                  border: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div id="reader">
                  <p>Carregando conteúdo EPUB...</p>
                  <!-- Aqui seria carregado o conteúdo ou um iframe -->
                </div>
              </div>
            </body>
          </html>
        `;
        setHtmlContent(html);
      } else if (src.startsWith('file://')) {
        // Se for um arquivo local, tentamos extrair o conteúdo
        // Essa é uma implementação simplificada
        try {
          // Verificar se o arquivo existe
          const fileInfo = await FileSystem.getInfoAsync(src);
          if (!fileInfo.exists) {
            throw new Error('Arquivo EPUB não encontrado');
          }

          // Como extrair o conteúdo de um EPUB local é complexo, 
          // usamos uma página que indica que o arquivo existe
          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <style>
                  body {
                    margin: 0;
                    padding: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: ${fontSize}px;
                    line-height: 1.5;
                    ${theme === 'dark' 
                      ? 'background-color: #121212; color: #ffffff;' 
                      : theme === 'sepia' 
                        ? 'background-color: #f8f1e3; color: #5f4b32;' 
                        : 'background-color: #ffffff; color: #333333;'
                    }
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                  }
                  .container {
                    text-align: center;
                    max-width: 800px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>Livro EPUB</h2>
                  <p>Arquivo EPUB encontrado: ${src.split('/').pop()}</p>
                  <p>Para uma implementação completa do leitor EPUB, seria necessária uma biblioteca específica para processamento.</p>
                </div>
              </body>
            </html>
          `;
          setHtmlContent(html);
        } catch (error) {
          console.error('Erro ao preparar conteúdo EPUB:', error);
          if (onError) {
            onError(error instanceof Error ? error : new Error('Erro ao preparar conteúdo EPUB'));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao preparar conteúdo EPUB:', error);
      if (onError) {
        onError(error instanceof Error ? error : new Error('Erro ao preparar conteúdo EPUB'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para preparar o conteúdo quando a fonte ou propriedades relacionadas mudam
  React.useEffect(() => {
    prepareEpubContent();
    // Adicionamos as dependências relevantes para garantir que o conteúdo é atualizado quando elas mudam
  }, [src, fontSize, theme, initialLocation]);

  // Adicionar console.log para debug
  console.log('EPUBReader props:', { 
    src, 
    fontSize, 
    theme, 
    initialLocation: initialLocation || 'not provided'
  });

  // Simular o carregamento do livro
  React.useEffect(() => {
    if (!isLoading && onLoad) {
      // Simulamos um livro básico com informações mínimas
      const bookInfo: EPUBBook = {
        title: src.split('/').pop()?.replace('.epub', '') || 'Livro EPUB',
        author: 'Autor Desconhecido',
      };
      onLoad(bookInfo);
    }
  }, [isLoading, onLoad, src]);

  // Função para lidar com mensagens da WebView
  const handleMessage = (event: any): void => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Processar diferentes tipos de mensagens
      switch (data.type) {
        case 'location':
          if (onLocationChange) {
            const location: EPUBLocation = {
              progress: data.progress || 0,
              currentPage: data.page,
              totalPages: data.totalPages,
              chapterTitle: data.chapterTitle,
            };
            onLocationChange(location);
          }
          break;
        
        case 'selection':
          if (onSelection) {
            const selection: EPUBSelection = {
              text: data.text || '',
            };
            onSelection(selection);
          }
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem da WebView:', error);
    }
  };

  // Script injetado na WebView para capturar eventos
  const injectedJavaScript = `
    (function() {
      // Simular progresso e seleção para fins de demonstração
      // Em uma implementação real, esses eventos seriam capturados do leitor EPUB

      // Simular evento de mudança de página a cada 5 segundos
      let page = 1;
      const totalPages = 100;
      setInterval(() => {
        if (page < totalPages) {
          page++;
          const progress = page / totalPages;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'location',
            page: page,
            totalPages: totalPages,
            progress: progress,
            chapterTitle: 'Capítulo ' + Math.ceil(page / 10)
          }));
        }
      }, 5000);

      // Capturar seleção de texto
      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (selection && selection.toString()) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'selection',
            text: selection.toString()
          }));
        }
      });

      true;
    })();
  `;

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        htmlContent && (
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
            injectedJavaScript={injectedJavaScript}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (onError) {
                onError(new Error(`WebView error: ${nativeEvent.description}`));
              }
            }}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EPUBReader; 