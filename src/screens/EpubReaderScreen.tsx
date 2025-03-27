import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { EPUBBook, EPUBLocation, EPUBSelection } from '../types/epub-reader';
import EPUBReader from '../components/features/EPUBReader';
import useBookAnnotations from '../hooks/useBookAnnotations';
import { RootStackParamList } from '../types/navigation';
import { bookService } from '../services/bookService';

type EpubReaderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EPUBReader'>;
type EpubReaderScreenRouteProp = RouteProp<RootStackParamList, 'EPUBReader'>;

const EpubReaderScreen: React.FC = () => {
  const navigation = useNavigation<EpubReaderScreenNavigationProp>();
  const route = useRoute<EpubReaderScreenRouteProp>();
  const { bookId = '', bookUrl = '' } = route.params || {};

  const [book, setBook] = React.useState<EPUBBook | null>(null);
  const [location, setLocation] = React.useState<EPUBLocation | null>(null);
  const [fontSize, setFontSize] = React.useState<number>(16);
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'sepia'>('light');
  const [showControls, setShowControls] = React.useState<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  const { 
    bookmarks, 
    annotations, 
    loadBookAnnotations, 
    addBookmark, 
    removeBookmark, 
    addAnnotation,
    removeAnnotation,
    isBookmarkLoaded,
    isBookmarked
  } = useBookAnnotations();

  // Log para debug
  React.useEffect(() => {
    console.log('EpubReaderScreen - Params:', { bookId, bookUrl });
    console.log('EpubReaderScreen - States:', { 
      hasBook: !!book, 
      hasLocation: !!location, 
      fontSize, 
      theme, 
      showControls,
      isLoading,
      hasError: !!error
    });
  }, [book, location, fontSize, theme, showControls, isLoading, error, bookId, bookUrl]);

  React.useEffect(() => {
    if (bookId) {
      loadBookAnnotations(bookId);
    }
  }, [bookId]);

  // Verificamos se temos as informações necessárias
  React.useEffect(() => {
    if (!bookUrl) {
      Alert.alert(
        'Erro ao abrir livro',
        'A URL do livro não foi fornecida.',
        [
          {
            text: 'Voltar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [bookUrl, navigation]);

  // Função para lidar com a mudança de localização
  const handleLocationChange = (newLocation: EPUBLocation): void => {
    setLocation(newLocation);
    
    // Salvar progresso de leitura
    if (bookId && newLocation.progress) {
      bookService.saveReadingProgress(bookId, newLocation.progress);
    }
  };

  // Função para lidar com o carregamento do livro
  const handleBookLoad = (bookInfo: EPUBBook): void => {
    setBook(bookInfo);
    setIsLoading(false);

    // Atualizar último livro lido
    if (bookId) {
      bookService.updateLastRead(bookId);
    }
  };

  // Função para lidar com erros
  const handleError = (err: Error): void => {
    console.error('Erro ao carregar EPUB:', err);
    setError(err);
    setIsLoading(false);
  };

  // Função para lidar com seleção de texto
  const handleSelection = (selection: EPUBSelection): void => {
    if (selection.text && bookId && location) {
      // Aqui poderíamos mostrar um menu para adicionar anotação
      console.log('Texto selecionado:', selection.text);
    }
  };

  // Alternar entre os temas disponíveis
  const toggleTheme = (): void => {
    setTheme(current => {
      if (current === 'light') return 'sepia';
      if (current === 'sepia') return 'dark';
      return 'light';
    });
  };

  // Alternar tamanho da fonte
  const changeFontSize = (increment: boolean): void => {
    setFontSize(current => {
      const newSize = increment ? current + 2 : current - 2;
      return Math.max(12, Math.min(24, newSize)); // Limitamos entre 12 e 24
    });
  };

  // Alternar bookmark na página atual
  const toggleBookmark = (): void => {
    if (!bookId || !location || !location.currentPage) return;
    
    const key = `${bookId}-page-${location.currentPage}`;
    
    if (isBookmarked(key)) {
      removeBookmark(key);
    } else {
      addBookmark(key, {
        bookId,
        page: location.currentPage,
        chapterTitle: location.chapterTitle || 'Capítulo desconhecido',
        createdAt: new Date().toISOString(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barra de controles superior */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {book?.title || 'Carregando...'}
          </Text>
          
          <TouchableOpacity onPress={() => setShowControls(false)} style={styles.hideButton}>
            <Ionicons name="chevron-up" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Conteúdo principal - Leitor EPUB */}
      <View style={styles.readerContainer}>
        {bookUrl ? (
          <EPUBReader
            src={bookUrl}
            fontSize={fontSize}
            theme={theme}
            initialLocation={location?.cfi}
            onLocationChange={handleLocationChange}
            onLoad={handleBookLoad}
            onError={handleError}
            onSelection={handleSelection}
            style={styles.reader}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              URL do livro não fornecida
            </Text>
          </View>
        )}
        
        {/* Área para mostrar quando o usuário toca na tela para exibir controles */}
        {!showControls && (
          <TouchableOpacity 
            style={styles.touchControl} 
            activeOpacity={1}
            onPress={() => setShowControls(true)}
          />
        )}
      </View>
      
      {/* Barra de controles inferior */}
      {showControls && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => changeFontSize(false)} style={styles.iconButton}>
            <Ionicons name="text" size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => changeFontSize(true)} style={styles.iconButton}>
            <Ionicons name="text" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {theme === 'light' ? (
              <Ionicons name="sunny" size={24} color={colors.text} />
            ) : theme === 'dark' ? (
              <Ionicons name="moon" size={24} color={colors.text} />
            ) : (
              <Ionicons name="book" size={24} color={colors.text} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleBookmark} style={styles.iconButton}>
            <Ionicons 
              name={isBookmarked(bookId && location?.currentPage ? `${bookId}-page-${location.currentPage}` : '') ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          {location && (
            <Text style={styles.pageInfo}>
              {location.currentPage || 0}/{location.totalPages || 0}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  hideButton: {
    marginLeft: 16,
  },
  readerContainer: {
    flex: 1,
    position: 'relative',
  },
  reader: {
    flex: 1,
  },
  touchControl: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconButton: {
    padding: 8,
  },
  pageInfo: {
    fontSize: 14,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});

export default EpubReaderScreen; 