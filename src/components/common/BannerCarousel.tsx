import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ImageBackground, 
  TouchableOpacity, 
  FlatList,
  Animated,
  FlatListProps,
  ListRenderItem
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  cover_url: string;
  action?: () => void;
}

interface BannerCarouselProps {
  data: BannerItem[];
  componentHeight?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showPagination?: boolean;
  onItemPress?: (item: BannerItem) => void;
}

// Criando componentes animados
const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * Componente de carrossel animado para banners promocionais
 */
const BannerCarousel: React.FC<BannerCarouselProps> = ({
  data,
  componentHeight = height * 0.4,
  autoPlay = true,
  autoPlayInterval = 4000,
  showPagination = true,
  onItemPress
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const bannerData = data.length > 0 ? data : [{
    id: 'placeholder',
    title: 'EXEMPLOS DE LIVROS',
    subtitle: 'DESTAQUE',
    description: 'Adicione livros para ver destacados aqui!',
    cover_url: 'https://via.placeholder.com/500x700?text=Adicione+Livros'
  }];

  // Calcular layout do item para paginação
  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  // Configuração do carrossel automático
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoPlay && bannerData.length > 1) {
      intervalId = setInterval(() => {
        if (flatListRef.current) {
          const nextIndex = (currentIndex + 1) % bannerData.length;
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }, autoPlayInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentIndex, bannerData.length, autoPlay, autoPlayInterval]);

  // Manipular scroll do carrossel
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  // Lidar com o fim do scroll
  const handleMomentumScrollEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  // Renderizar um item do banner com tipagem correta
  const renderItem: ListRenderItem<BannerItem> = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp'
    });
    
    const handlePress = () => {
      if (onItemPress) {
        onItemPress(item);
      } else if (item.action) {
        item.action();
      }
    };
    
    return (
      <TouchableOpacity 
        style={styles.bannerContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <AnimatedView style={[styles.bannerWrapper, { transform: [{ scale }] }]}>
          <ImageBackground 
            source={{ uri: item.cover_url }}
            style={styles.bannerImage} 
            imageStyle={{ borderRadius: 16 }}
            resizeMode="cover" 
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                {item.subtitle && (
                  <View style={styles.bannerTagContainer}>
                    <Text style={styles.bannerTag}>{item.subtitle}</Text>
                  </View>
                )}
                <Text style={styles.bannerTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.bannerDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.bannerButton}>
                  <Ionicons name="play-circle" size={normalize(20)} color="#FFFFFF" />
                  <Text style={styles.bannerButtonText}>Ler agora</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </AnimatedView>
      </TouchableOpacity>
    );
  };

  // Separando propriedades do FlatList para contornar problemas de tipagem
  const flatListProps = {
    data: bannerData,
    renderItem,
    keyExtractor: (item: BannerItem) => item.id,
    horizontal: true,
    pagingEnabled: true,
    showsHorizontalScrollIndicator: false,
    decelerationRate: "fast",
    snapToInterval: width,
    snapToAlignment: "center",
    onScroll: handleScroll,
    onMomentumScrollEnd: handleMomentumScrollEnd,
    scrollEventThrottle: 16,
    initialScrollIndex: 0,
    getItemLayout,
    contentContainerStyle: styles.carouselList
  };

  return (
    <View style={[styles.container, { height: componentHeight }]}>
      <FlatList
        {...flatListProps}
        // @ts-ignore Para contornar o erro de tipagem com ref no React 19
        ref={flatListRef}
      />
      
      {/* Paginação dots com animação */}
      {showPagination && bannerData.length > 1 && (
        <View style={styles.paginationContainer}>
          {bannerData.map((_: BannerItem, index: number) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width
              ],
              outputRange: [normalize(8), normalize(20), normalize(8)],
              extrapolate: 'clamp'
            });
            
            return (
              <AnimatedView
                key={index}
                style={[
                  styles.paginationDot,
                  { 
                    width: dotWidth,
                    opacity: index === currentIndex ? 1 : 0.6,
                    backgroundColor: index === currentIndex ? colors.secondary : colors.textLight
                  }
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  carouselList: {
    alignItems: 'center',
  },
  bannerContainer: {
    width: width,
    height: '100%',
    paddingHorizontal: normalize(16),
    justifyContent: 'center',
  },
  bannerWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: normalize(16),
  },
  bannerContent: {
    width: '100%',
  },
  bannerTagContainer: {
    backgroundColor: 'rgba(255,69,0,0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: 4,
    marginBottom: normalize(12),
  },
  bannerTag: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(8),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerDescription: {
    color: '#FFFFFF',
    marginBottom: normalize(16),
    fontSize: normalize(14),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: 20,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: normalize(8),
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: normalize(16),
    alignSelf: 'center',
    height: normalize(8),
    alignItems: 'center',
  },
  paginationDot: {
    height: normalize(8),
    borderRadius: normalize(4),
    marginHorizontal: normalize(4),
  },
});

export default BannerCarousel; 