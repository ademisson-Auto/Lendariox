import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

interface OnboardingSlideProps {
  title: string;
  description: string;
  image: any;
}

const OnboardingSlide = ({ title, description, image }: OnboardingSlideProps) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={image} 
            style={[styles.image, { width: width * 0.8, height: width * 0.6 }]} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 140, // Espaço aumentado para os botões e indicadores
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#6b21a8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  image: {
    borderRadius: 20,
  },
  textContainer: {
    paddingHorizontal: 24,
    maxWidth: 350,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  }
});

export default OnboardingSlide; 