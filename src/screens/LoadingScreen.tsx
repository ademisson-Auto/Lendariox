import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingAnimation from '../components/common/LoadingAnimation';

interface LoadingScreenProps {
  message?: string;
  onComplete: () => void;
  duration?: number;
  route?: {
    params?: {
      message?: string;
      redirectTo?: string;
    }
  };
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Sincronizando planejamentos personalizados...', 
  onComplete,
  duration = 3000,
  route
}) => {
  const [progress, setProgress] = useState(0);
  
  // Use mensagem da rota se disponível
  const displayMessage = route?.params?.message || message;
  
  useEffect(() => {
    // Simular progresso
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 1;
      });
    }, duration / 100);

    // Chamar onComplete quando o progresso chegar a 100%
    const timeout = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete]);

  return (
    <View style={styles.container}>
      <LoadingAnimation message={displayMessage} progress={progress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
});

export default LoadingScreen; 