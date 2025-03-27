import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book, BookWithProgress } from '../../types/book';
import BookCover from './BookCover';
import { colors, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

interface ContinueReadingProps {
  book: BookWithProgress;
  onPress: (bookId: string) => void;
}

/**
 * Card para retomar a leitura em andamento
 */
const ContinueReading: React.FC<ContinueReadingProps> = ({ book, onPress }) => {
  const handlePress = () => {
    onPress(book.id);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.left}>
        <BookCover 
          uri={book.cover_url}
          width={normalize(80)}
          height={normalize(120)}
          style={styles.coverContainer}
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.label}>CONTINUE DE ONDE PAROU</Text>
        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${book.completion_percentage}%` }]} />
        </View>
        
        <Text style={styles.progress}>
          {book.completion_percentage}% concluído • Página {book.current_page} de {book.total_pages}
        </Text>
      </View>
      
      <View style={styles.right}>
        <View style={styles.iconContainer}>
          <Ionicons name="chevron-forward" size={normalize(24)} color={colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: normalize(12),
    padding: normalize(12),
    marginBottom: normalize(16),
    ...shadows.medium,
  },
  left: {
    marginRight: normalize(12),
  },
  coverContainer: {
    borderRadius: normalize(8),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: colors.secondary,
    fontSize: normalize(11),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  title: {
    color: colors.text,
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: normalize(4),
  },
  author: {
    color: colors.textSecondary,
    fontSize: normalize(14),
    marginBottom: normalize(8),
  },
  progressBarContainer: {
    height: normalize(4),
    backgroundColor: colors.backgroundLight,
    borderRadius: normalize(2),
    overflow: 'hidden',
    marginBottom: normalize(6),
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: normalize(2),
  },
  progress: {
    color: colors.textLight,
    fontSize: normalize(12),
  },
  right: {
    justifyContent: 'center',
    marginLeft: normalize(8),
  },
  iconContainer: {
    width: normalize(24),
    height: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ContinueReading; 