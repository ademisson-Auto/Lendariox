import 'react-native-gesture-handler';
import * as React from 'react';
import { StatusBar, View, ActivityIndicator, Text, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { BookProvider } from './src/contexts/BookContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import Navigation from './src/navigation';
import LogManager from './src/utils/logManager';
import { StyleSheet } from 'react-native';

// Inicialização do LogManager de forma síncrona antes de qualquer renderização
if (!LogManager.isInitialized()) {
  LogManager.initialize();
  LogManager.enableLogs();
  LogManager.enableCategory('app');
  LogManager.enableCategory('auth');
  LogManager.enableCategory('navigation');
  LogManager.enableCategory('notification');
  LogManager.disableCategory('books');
}

// Componente principal sem camadas extras para evitar problemas de contexto
export default function App() {
  // Utilizando React.useState para evitar conflitos potenciais
  const [ready, setReady] = React.useState(false);

  // Efeito para inicialização com tempo suficiente
  React.useEffect(() => {
    LogManager.info('app', 'Inicializando aplicação');
    
    // Dar tempo suficiente para inicialização em dispositivos mais lentos
    const timer = setTimeout(() => {
      setReady(true);
      LogManager.info('app', 'Aplicação pronta para renderização');
    }, Platform.OS === 'android' ? 500 : 300);
    
    return () => {
      clearTimeout(timer);
      LogManager.info('app', 'Aplicação encerrada');
    };
  }, []);

  // Renderizar tela de carregamento até que esteja pronto
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  // Renderizar a aplicação com providers aninhados corretamente
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AuthProvider children={
        <NotificationProvider children={
          <BookProvider children={
            <Navigation />
          } />
        } />
      } />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
  }
});
