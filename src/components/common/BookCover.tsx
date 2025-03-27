import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Dimensions, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

interface BookCoverProps {
  uri?: string | null;
  width?: number;
  height?: number;
  borderRadius?: number;
  showGradient?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * Componente para exibir capas de livros com tratamento de erros e carregamento
 */
const BookCover: React.FC<BookCoverProps> = ({
  uri,
  width = normalize(140),
  height = normalize(200),
  borderRadius = 8,
  showGradient = false,
  style,
  imageStyle,
  resizeMode = 'cover'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const validUri = uri && uri.trim().length > 0 ? uri : null;
  
  // Placeholder URL para quando não houver imagem ou ocorrer erro
  const placeholderUri = `https://via.placeholder.com/${Math.round(width)}x${Math.round(height)}?text=Sem+Imagem`;
  
  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };
  
  const handleLoadEnd = () => {
    setLoading(false);
  };
  
  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <View 
      style={[
        styles.container, 
        { width, height, borderRadius },
        shadows.medium,
        style
      ]}
    >
      <Image 
        source={{ uri: error || !validUri ? placeholderUri : validUri }}
        style={[
          styles.image, 
          { width, height, borderRadius },
          imageStyle
        ]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {showGradient && (
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={[styles.gradient, { borderRadius }]}
        />
      )}
      
      {loading && (
        <View style={[styles.loadingContainer, { borderRadius }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.backgroundLight,
  },
  image: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
});

export default BookCover; 