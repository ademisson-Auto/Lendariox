import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StatusBar,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { getUserAvatarUrl } from '../types/auth';
import LogManager from '../utils/logManager';
import NotificationIndicator from '../components/common/NotificationIndicator';
import { NotificationType } from '../types/notification';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

// Obter dimensões da tela para responsividade
const { width, height } = Dimensions.get('window');

// Calcula tamanhos relativos para diferentes dispositivos
const scale = width / 375; // Usando 375 como largura base de design (iPhone X)
const normalize = (size: number) => Math.round(size * scale);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const { hasUnreadNotifications } = useNotification();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Função para realizar logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      LogManager.info('auth', 'Iniciando processo de logout');
      
      // Fazer logout com o Supabase
      await signOut();
      
      LogManager.info('auth', 'Logout realizado com sucesso, redirecionando para Onboarding');
      
      // Usar setTimeout para garantir que o estado seja atualizado corretamente antes de navegar
      setTimeout(() => {
        // Navegar para a tela de Onboarding após o logout
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }]
        });
      }, 100);
    } catch (error) {
      LogManager.error('auth', 'Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Função para navegar para a tela de onboarding (slides)
  const navigateToOnboarding = () => {
    navigation.navigate('Onboarding');
  };
  
  // Função para navegar para a tela de notificações
  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };
  
  return (
    <SafeAreaViewContext style={styles.container}>
      <StatusBar backgroundColor="#0A0A0A" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 24 }} /> {/* Espaço para balancear o header */}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil do usuário */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['rgba(255,69,0,0.7)', 'rgba(10,10,10,0.9)']}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <Image 
                source={{ uri: getUserAvatarUrl(user) }}
                style={styles.profileImage}
              />
              <View style={styles.profileNameContainer}>
                <Text style={styles.profileName}>{user?.email?.split('@')[0] || 'Usuário'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'Sem email'}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        {/* Menu de opções */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Editar perfil</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToNotifications}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Notificações</Text>
            <View style={styles.menuItemIconContainer}>
              <NotificationIndicator 
                size={8} 
                type={NotificationType.PROFILE} 
                color="#FF4500" 
                animated={true}
              />
              <Ionicons name="chevron-forward" size={20} color="#777777" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Privacidade</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="color-palette-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Aparência</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="text-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Tamanho da fonte</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>Sobre</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToOnboarding}
          >
            <Ionicons name="information-circle-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Tutorial</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star-outline" size={22} color="#FFFFFF" />
            <Text style={styles.menuItemText}>Avaliar aplicativo</Text>
            <Ionicons name="chevron-forward" size={20} color="#777777" />
          </TouchableOpacity>
        </View>
        
        {/* Botão de logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
        
        {/* Espaço no final do scroll */}
        <View style={styles.scrollEndPadding} />
      </ScrollView>
      
      {/* Bottom Navigation - mantendo consistência com a Home */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="home-outline" size={24} color="#777777" />
          </View>
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="search-outline" size={24} color="#777777" />
          </View>
          <Text style={styles.navText}>Explorar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="library-outline" size={24} color="#777777" />
          </View>
          <Text style={styles.navText}>Biblioteca</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="person" size={24} color="#FF4500" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaViewContext>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    width: '100%',
    height: normalize(150),
    marginBottom: normalize(20),
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileImage: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileNameContainer: {
    marginLeft: normalize(20),
  },
  profileName: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(4),
  },
  profileEmail: {
    fontSize: normalize(14),
    color: '#DDDDDD',
  },
  menuContainer: {
    paddingHorizontal: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FF4500',
    marginTop: normalize(20),
    marginBottom: normalize(10),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  menuItemText: {
    fontSize: normalize(16),
    color: '#FFFFFF',
    flex: 1,
    marginLeft: normalize(15),
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4500',
    marginHorizontal: normalize(16),
    marginTop: normalize(30),
    padding: normalize(16),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginLeft: normalize(8),
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: normalize(20),
  },
  versionText: {
    color: '#777777',
    fontSize: normalize(14),
  },
  scrollEndPadding: {
    height: normalize(100),
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    paddingVertical: normalize(12),
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    height: normalize(65),
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: normalize(26),
    height: normalize(26),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navText: {
    color: '#777777',
    fontSize: normalize(12),
    marginTop: normalize(4),
  },
  activeNavText: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
  menuItemIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProfileScreen; 