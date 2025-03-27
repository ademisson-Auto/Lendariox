import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Animated, 
  useWindowDimensions,
  ViewToken,
  ListRenderItem
} from 'react-native';
import OnboardingSlide from '../components/onboarding/OnboardingSlide';
import { onboardingImages, onboardingData } from '../assets/images';

interface Slide {
  title: string;
  description: string;
  image: any;
  id: string;
}

interface OnboardingScreenProps {
  onRegister: () => void;
  onLogin: () => void;
}

export default function OnboardingScreen({ onRegister, onLogin }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);
  
  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Combinar os dados das imagens e dos textos
  const slides: Slide[] = onboardingData.map((item, index) => ({
    ...item,
    image: onboardingImages[index],
    id: index.toString(),
  }));

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  // Define renderItem com o tipo correto que o FlatList espera
  const renderItem: ListRenderItem<Slide> = ({ item }) => (
    <OnboardingSlide 
      title={item.title} 
      description={item.description} 
      image={item.image} 
    />
  );

  // Criando um objeto com props para evitar problemas de tipagem
  const flatListProps = {
    data: slides,
    renderItem,
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    pagingEnabled: true,
    bounces: false,
    keyExtractor: (item: Slide) => item.id,
    onScroll: Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: false }
    ),
    onViewableItemsChanged: viewableItemsChanged,
    viewabilityConfig: viewConfig
  };

  return (
    <View style={styles.container}>
      <View style={styles.slidesContainer}>
        <FlatList
          {...flatListProps}
          // @ts-ignore Para contornar o erro de tipagem com ref no React 19
          ref={slidesRef}
        />
      </View>
      
      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width
            ];
            
            // Estilos animados para o indicador
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp'
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp'
            });
            
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#555555', '#9333EA', '#555555'],
              extrapolate: 'clamp'
            });
            
            return (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  { 
                    width: dotWidth, 
                    opacity, 
                    backgroundColor,
                    // Cor fixa para o indicador atual como alternativa à animação
                    ...(currentIndex === index ? { backgroundColor: '#9333EA'} : {})
                  }
                ]}
              />
            );
          })}
        </View>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={onRegister}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={onLogin}
          >
            <Text style={styles.linkButtonText}>Já sou cadastrado</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  slidesContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'rgba(24, 24, 24, 0.95)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#9333EA',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: '#9333EA',
    fontSize: 16,
    fontWeight: '500',
  },
}); 