import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions, 
  ViewStyle, 
  StyleProp
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../../types/book';
import BookCover from './BookCover';
import { colors } from '../../theme';
import { KeyedView } from '../common/AnimatedComponents';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

interface BookListProps {
  title?: string;
  books: Book[];
  showViewsCount?: boolean;
  showAuthor?: boolean;
  onBookPress: (bookId: string) => void;
  onSeeAllPress?: () => void;
  loading?: boolean;
  emptyText?: string;
  style?: StyleProp<ViewStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
}

interface BookItemProps {
  item: Book;
  showViewsCount?: boolean;
  showAuthor?: boolean;
  onPress: (bookId: string) => void;
}

/**
 * Item individual de livro para a lista
 */
const BookItem: React.FC<BookItemProps> = ({ 
  item, 
  showViewsCount = true, 
  showAuthor = true, 
  onPress 
}) => {
  const handlePress = () => {
    onPress(item.id);
  };

  // Função para formatar a contagem de visualizações
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.bookItem}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <BookCover 
        uri={item.cover_url}
        showGradient
        width={normalize(140)}
        height={normalize(200)}
      />
      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
      {showAuthor && (
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
      )}
      {showViewsCount && item.views !== undefined && (
        <Text style={styles.bookViews}>
          {formatViews(item.views)} leituras
        </Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Componente para exibir listas horizontais de livros com estilo consistente
 */
const BookList: React.FC<BookListProps> = ({
  title,
  books,
  showViewsCount = true,
  showAuthor = true,
  onBookPress,
  onSeeAllPress,
  loading = false,
  emptyText = 'Nenhum livro disponível',
  style,
  listContainerStyle
}) => {
  // Renderizar o estado de carregamento
  const renderLoading = () => (
    <View style={styles.shimmingContainer}>
      {[1, 2, 3, 4].map((item) => (
        <KeyedView itemKey={`shimmer-${item}`} style={styles.shimmerBook}>
          <View style={[styles.shimmerCover, styles.shimmerEffect]} />
          <View style={[styles.shimmerTitle, styles.shimmerEffect]} />
          <View style={[styles.shimmerAuthor, styles.shimmerEffect]} />
        </KeyedView>
      ))}
    </View>
  );

  // Renderizar o estado vazio
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={40} color="#444" />
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {onSeeAllPress && (
            <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAllPress}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {loading ? (
        renderLoading()
      ) : (
        <FlatList
          horizontal
          data={books}
          renderItem={({ item }) => (
            <BookItem 
              item={item} 
              showViewsCount={showViewsCount} 
              showAuthor={showAuthor} 
              onPress={onBookPress} 
            />
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            books.length === 0 && styles.emptyListContainer,
            listContainerStyle
          ]}
          ListEmptyComponent={renderEmpty}
          initialNumToRender={4}
          maxToRenderPerBatch={8}
          windowSize={3}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: normalize(12),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
    paddingHorizontal: normalize(16),
  },
  title: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: colors.secondary,
    fontSize: normalize(14),
    fontWeight: '600',
    marginRight: normalize(4),
  },
  listContainer: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
  },
  emptyListContainer: {
    width: width - normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookItem: {
    width: normalize(140),
    marginRight: normalize(16),
    marginBottom: normalize(8),
  },
  bookTitle: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: normalize(8),
    marginBottom: normalize(4),
  },
  bookAuthor: {
    fontSize: normalize(12),
    color: colors.textSecondary,
  },
  bookViews: {
    fontSize: normalize(12),
    color: colors.textDark,
    marginTop: normalize(4),
  },
  emptyContainer: {
    width: width - normalize(32),
    height: normalize(200),
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(16),
  },
  emptyText: {
    color: colors.textDark,
    marginTop: normalize(16),
    fontSize: normalize(14),
    textAlign: 'center',
  },
  shimmingContainer: {
    flexDirection: 'row',
    paddingHorizontal: normalize(16),
  },
  shimmerBook: {
    width: normalize(140),
    marginRight: normalize(16),
  },
  shimmerCover: {
    width: normalize(140),
    height: normalize(200),
    borderRadius: 8,
    marginBottom: normalize(8),
    backgroundColor: colors.backgroundLight,
  },
  shimmerTitle: {
    width: '100%',
    height: normalize(14),
    marginBottom: normalize(8),
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
  },
  shimmerAuthor: {
    width: '70%',
    height: normalize(12),
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
  },
  shimmerEffect: {
    opacity: 0.7,
  },
});

export default BookList; 