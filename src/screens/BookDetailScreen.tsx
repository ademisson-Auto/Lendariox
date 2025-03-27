import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBooks } from '../contexts/BookContext';
import { Book, ReadingProgress } from '../types/book';
import usePdfViewer from '../hooks/usePdfViewer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { KeyedView } from '../components/common/AnimatedComponents';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

type BookDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

const BookDetailScreen = ({ route, navigation }: BookDetailScreenProps) => {
  const { bookId } = route.params;
  const { getBookById, getReadingProgress, updateReadingProgress } = useBooks();
  const { openPdf } = usePdfViewer();
  
  const [book, setBook] = useState<Book | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingPdf, setStartingPdf] = useState(false);

  // Carregar detalhes do livro
  useEffect(() => {
    const loadBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await getBookById(bookId);
        if (bookData) {
          setBook(bookData);
          
          // Carregar progresso de leitura
          const progressData = await getReadingProgress(bookId);
          setProgress(progressData);
        } else {
          Alert.alert('Erro', 'Livro não encontrado');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erro ao carregar detalhes do livro:', error);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes do livro');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookDetails();
  }, [bookId]);

  // Iniciar leitura do livro
  const startReading = async () => {
    if (!book) return;
    
    try {
      setStartingPdf(true);
      
      // Se não tiver progresso, criar um novo
      if (!progress) {
        // Vamos considerar que um PDF tem 100 páginas por padrão
        // Isso será atualizado quando o PDF carregar
        await updateReadingProgress(bookId, 1, 100); 
      }
      
      // Utilizar a nova função openPdf que simplifica o processo
      await openPdf(
        navigation,
        bookId,
        book.title,
        progress?.current_page || 1,
        progress?.total_pages || 100
      );
    } catch (error) {
      console.error('Erro ao iniciar leitura:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a leitura');
    } finally {
      setStartingPdf(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={normalize(28)} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Seção de capa e detalhes */}
        <View style={styles.bookInfoSection}>
          <Image 
            source={{ 
              uri: book?.cover_url || 'https://via.placeholder.com/300x450?text=Sem+Imagem'
            }} 
            style={styles.bookCover} 
            resizeMode="cover" 
          />
          
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{book?.title}</Text>
            <Text style={styles.bookAuthor}>por {book?.author}</Text>
            
            {/* Exibir tags se disponíveis */}
            {book?.tags && book.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {book.tags.map((tag, index) => (
                  <KeyedView itemKey={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </KeyedView>
                ))}
              </View>
            )}
            
            {/* Exibir informações de visualização */}
            <Text style={styles.viewsText}>
              {book?.views ? `${book.views.toLocaleString()} leituras` : 'Nova adição'}
            </Text>
            
            {/* Mostrar progresso de leitura se disponível */}
            {progress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${progress.completion_percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress.completion_percentage}% completo
                </Text>
              </View>
            )}
            
            {/* Botão de leitura principal */}
            <TouchableOpacity 
              style={styles.readButton}
              onPress={startReading}
              disabled={startingPdf}
            >
              {startingPdf ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.readButtonText}>
                  {progress ? 'Continuar Leitura' : 'Iniciar Leitura'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Seção de descrição */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.descriptionText}>
            {book?.description || 'Nenhuma descrição disponível para este livro.'}
          </Text>
        </View>
        
        {/* Informações adicionais */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modo de Leitura:</Text>
            <Text style={styles.infoValue}>{book?.reading_mode || 'Vertical'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Premium:</Text>
            <Text style={styles.infoValue}>{book?.is_premium ? 'Sim' : 'Não'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adicionado em:</Text>
            <Text style={styles.infoValue}>
              {book?.created_at 
                ? new Date(book.created_at).toLocaleDateString() 
                : 'Desconhecido'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: normalize(16),
    fontSize: normalize(16),
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(8),
    paddingBottom: normalize(16),
  },
  backButton: {
    padding: normalize(8),
  },
  bookInfoSection: {
    flexDirection: 'row',
    padding: normalize(16),
  },
  bookCover: {
    width: normalize(120),
    height: normalize(180),
    borderRadius: normalize(8),
  },
  bookDetails: {
    flex: 1,
    marginLeft: normalize(16),
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: normalize(8),
  },
  bookAuthor: {
    fontSize: normalize(16),
    color: '#aaa',
    marginBottom: normalize(12),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: normalize(12),
  },
  tagChip: {
    backgroundColor: '#333',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
    borderRadius: normalize(16),
    marginRight: normalize(8),
    marginBottom: normalize(8),
  },
  tagText: {
    color: '#fff',
    fontSize: normalize(12),
  },
  viewsText: {
    fontSize: normalize(14),
    color: '#bbb',
    marginBottom: normalize(12),
  },
  progressContainer: {
    marginBottom: normalize(16),
  },
  progressBarContainer: {
    height: normalize(6),
    backgroundColor: '#333',
    borderRadius: normalize(3),
    marginBottom: normalize(8),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: normalize(3),
  },
  progressText: {
    fontSize: normalize(12),
    color: '#bbb',
  },
  readButton: {
    backgroundColor: '#6200ee',
    paddingVertical: normalize(12),
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(16),
  },
  descriptionSection: {
    padding: normalize(16),
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: normalize(12),
  },
  descriptionText: {
    fontSize: normalize(15),
    color: '#ddd',
    lineHeight: normalize(22),
  },
  infoSection: {
    padding: normalize(16),
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: normalize(32), // Espaço extra na parte inferior
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  infoLabel: {
    fontSize: normalize(15),
    color: '#aaa',
  },
  infoValue: {
    fontSize: normalize(15),
    color: '#fff',
    fontWeight: '500',
  },
});

export default BookDetailScreen; 