import React, { useState, useEffect, ReactNode } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import LoadingScreen from '../screens/LoadingScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import PdfReaderScreen from '../screens/PdfReaderScreen';
import EpubReaderScreen from '../screens/EpubReaderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { useAuth } from '../contexts/AuthContext';
import Home from '../screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { RootStackParamList } from '../types/navigation';
import LogManager from '../utils/logManager';

// Tipo para as props dos componentes de tela
type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: RouteProp<RootStackParamList, T>;
};

// Tema personalizado para navegação
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#10121E', // Fundo escuro para combinar com o tema do app
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation = () => {
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { user, loading } = useAuth();
  const [firstLaunch, setFirstLaunch] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Onboarding');

  // Efeito para inicializar a navegação
  useEffect(() => {
    // Pequeno atraso para garantir que todos os contextos estejam prontos
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
      LogManager.info('navigation', 'Navegação inicializada com sucesso');
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Efeito para verificar o primeiro lançamento
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
        if (hasLaunched !== 'true') {
          // Primeira vez abrindo o app
          setFirstLaunch(true);
          // Marca que já abriu o app
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
        } else {
          setFirstLaunch(false);
        }
      } catch (error) {
        LogManager.error('navigation', 'Erro ao verificar primeiro lançamento:', error);
        setFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Efeito para atualizar a navegação quando o usuário fizer login
  useEffect(() => {
    if (loading) return; // Não atualizar a rota enquanto ainda estiver carregando
    
    if (user) {
      setInitialRoute('Home');
    } else if (!firstLaunch) {
      setInitialRoute('Auth');
    } else {
      setInitialRoute('Onboarding');
    }
  }, [user, firstLaunch, loading]);

  if (loading || !isNavigationReady) {
    // Aguardando verificação de autenticação ou navegação
    return <LoadingScreen message="Preparando seu ambiente de leitura..." onComplete={() => {}} />;
  }

  return (
    <NavigationContainer 
      theme={navTheme}
      children={
        <Stack.Navigator 
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
          children={
            <>
              <Stack.Screen 
                name="Onboarding"
                component={(props: ScreenProps<"Onboarding">) => {
                  const { navigation } = props;
                  
                  React.useEffect(() => {
                    if (user) {
                      navigation.replace('Home');
                    }
                  }, [user]);
                  
                  if (user) {
                    return null; // Renderizar temporariamente algo vazio enquanto o efeito executa
                  }
                  
                  return (
                    <OnboardingScreen 
                      onRegister={() => {
                        navigation.navigate('Loading', {
                          message: 'Preparando o ambiente para você...',
                          redirectTo: 'Auth',
                          initialForm: 'register'
                        });
                      }}
                      onLogin={() => {
                        navigation.navigate('Loading', {
                          message: 'Sincronizando seus dados...',
                          redirectTo: 'Auth',
                          initialForm: 'login'
                        });
                      }}
                    />
                  );
                }}
              />
              
              <Stack.Screen 
                name="Loading"
                component={(props: ScreenProps<"Loading">) => {
                  const { navigation, route } = props;
                  
                  React.useEffect(() => {
                    if (user && !route.params?.redirectTo?.includes('Reader')) {
                      navigation.replace('Home');
                    }
                  }, [user]);
                  
                  return (
                    <LoadingScreen
                      message={route.params?.message || 'Carregando...'}
                      onComplete={() => {
                        if (user) {
                          navigation.replace('Home');
                        } else {
                          const redirectTo = route.params?.redirectTo || 'Auth';
                          
                          if (redirectTo === 'Auth' && route.params?.initialForm) {
                            // Passar explicitamente o initialForm para a tela Auth
                            navigation.navigate('Auth', {
                              initialForm: route.params.initialForm
                            });
                          } else {
                            // Navegação para outras telas
                            // Usar keyof RootStackParamList para garantir que estamos navegando para uma rota válida
                            navigation.navigate(redirectTo as keyof RootStackParamList);
                          }
                        }
                      }}
                    />
                  );
                }}
              />
              
              <Stack.Screen 
                name="Auth" 
                component={AuthScreen}
              />
              <Stack.Screen 
                name="Home" 
                component={Home} 
                options={{ gestureEnabled: false }}
              />
              <Stack.Screen 
                name="BookDetail" 
                component={BookDetailScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen 
                name="PdfReader" 
                component={PdfReaderScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
                  fullScreenGestureEnabled: true,
                  gestureEnabled: false, // Desabilitar gestos para evitar navegação acidental
                }}
              />
              <Stack.Screen 
                name="EPUBReader" 
                component={EpubReaderScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_bottom',
                  fullScreenGestureEnabled: true,
                  gestureEnabled: false, // Desabilitar gestos para evitar navegação acidental
                }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen 
                name="Notifications" 
                component={NotificationsScreen}
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              />
            </>
          }
        />
      }
    />
  );
};

export default Navigation; 