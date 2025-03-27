import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  FlatList,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useBooks } from '../contexts/BookContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Book, BookWithProgress } from '../types/book';
import { LinearGradient } from 'expo-linear-gradient';
import { bookService } from '../services/bookService';
import { AnimatedView, AnimatedScrollView, AnimatedFlatList, KeyedView } from '../components/common/AnimatedComponents';
import { getUserAvatarUrl } from '../types/auth';
import LogManager from '../utils/logManager';
import { BannerCarousel, BookList, ContinueReading } from '../components/common';
import { useNotification } from '../contexts/NotificationContext';
import NotificationIndicator from '../components/common/NotificationIndicator';

/* 
 * INSTRUÇÕES PARA ADICIONAR ÍCONES NA BARRA DE NAVEGAÇÃO:
 * 
 * 1. Baixe os ícones nos links abaixo e salve na pasta 'assets/icons/':
 *    - Home: https://www.pngitem.com/pimgs/m/79-791767_house-icon-transparent-background-hd-png-download.png
 *    - Search: https://www.pngitem.com/pimgs/m/381-3813435_search-icon-white-png-transparent-png.png
 *    - Library: https://www.pngkey.com/png/full/121-1219163_library-icon-png-white-book-icon-png.png
 *    - Write: https://www.pngitem.com/pimgs/m/1-12353_edit-png-icon-white-edit-icon-transparent-png.png
 *    - Notification: https://www.pngitem.com/pimgs/m/178-1783296_notification-bell-icon-png-transparent-png.png
 * 
 * 2. Salve os arquivos como:
 *    - home.png
 *    - search.png
 *    - library.png
 *    - write.png
 *    - notification.png
 * 
 * 3. No código abaixo da barra de navegação (bottomNav), substitua os blocos
 *    de comentários pelos imports de imagem indicados.
 */

const { width, height } = Dimensions.get('window');
const scale = width / 375;
const normalize = (size: number) => Math.round(size * scale);

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover_url: string;
}

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1).replace(/\.0$/, '')} M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1).replace(/\.0$/, '')} K`;
  } else {
    return views.toString();
  }
};

// Renderiza um item de história com contador de visualizações
const renderStoryWithViews = ({ item }: { item: Book }) => (
  <TouchableOpacity 
    style={styles.storyItem}
    activeOpacity={0.8}
  >
    <View style={styles.bookCoverContainer}>
      <Image 
        source={{ 
          uri: item.cover_url || 'https://via.placeholder.com/150x200?text=Sem+Imagem'
        }} 
        style={styles.storyCover} 
        resizeMode="cover" 
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
        style={styles.coverGradient}
      />
    </View>
    <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
    <Text style={styles.storyAuthor} numberOfLines={1}>{item.author}</Text>
    <Text style={styles.storyViews}>{formatViews(item.views || 0)} leituras</Text>
  </TouchableOpacity>
);

// Renderiza um item premium
const renderPremiumItem = ({ item }: { item: Book }) => (
  <TouchableOpacity 
    style={styles.premiumItem}
    activeOpacity={0.8}
  >
    <Image 
      source={{ 
        uri: item.cover_url || 'https://via.placeholder.com/150x200?text=Sem+Imagem'
      }} 
      style={styles.premiumCover} 
      resizeMode="cover" 
    />
    <View style={styles.premiumContent}>
      <View>
        <Text style={styles.premiumTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.premiumAuthor} numberOfLines={1}>{item.author}</Text>
        <Text style={styles.premiumDescription} numberOfLines={3}>{item.description}</Text>
      </View>
      <Text style={styles.premiumViews}>{formatViews(item.views || 0)} leituras</Text>
    </View>
  </TouchableOpacity>
);

// Layout para o FlatList de banner
const getBannerItemLayout = (_: any, index: number) => ({
  length: width,
  offset: width * index,
  index,
});

export default function Home({ navigation }: HomeProps) {
  const { user, signOut } = useAuth();
  const { 
    recommendedBooks, 
    premiumBooks, 
    recentlyReadBooks, 
    allBooks, 
    loading, 
    getBooksByCategory,
    refreshRecommendedBooks,
    refreshRecentlyReadBooks,
    refreshAllBooks
  } = useBooks();
  const { hasUnreadNotifications } = useNotification();
  
  // Estados para categorias específicas
  const [romanceBooks, setRomanceBooks] = useState<Book[]>([]);
  const [escapeBooks, setEscapeBooks] = useState<Book[]>([]);
  const [storiesByHer, setStoriesByHer] = useState<Book[]>([]);
  
  // Memoizar a função de carregamento de categorias para evitar re-criações
  const loadCategoryBooks = useCallback(async () => {
    const romanceData = await getBooksByCategory('romance');
    const escapeData = await getBooksByCategory('escape');
    const storiesByHerData = await getBooksByCategory('storiesByHer');
    
    setRomanceBooks(romanceData);
    setEscapeBooks(escapeData);
    setStoriesByHer(storiesByHerData);
  }, [getBooksByCategory]);
  
  // Carregar livros por categoria
  useEffect(() => {
    loadCategoryBooks();
  }, [loadCategoryBooks]);
  
  // Memoizar a função refreshData para evitar re-criações desnecessárias
  const refreshData = useCallback(async () => {
    LogManager.info('navigation', 'Atualizando dados da tela Home');
    
    await refreshAllBooks();
    await refreshRecommendedBooks();
    if (user) {
      await refreshRecentlyReadBooks();
    }
    
    LogManager.info('navigation', 'Dados da tela Home atualizados');
  }, [refreshAllBooks, refreshRecommendedBooks, refreshRecentlyReadBooks, user]);
  
  // Controle de primeira montagem para evitar execuções repetidas
  const isFirstMount = useRef(true);
  
  // Atualizar dados apenas na primeira montagem
  useEffect(() => {
    if (isFirstMount.current) {
      refreshData();
      isFirstMount.current = false;
    }
  }, [refreshData]);
  
  // Configurar listener de foco separadamente para evitar re-execuções desnecessárias
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isFirstMount.current) { // Evitar dupla execução na primeira montagem
        LogManager.debug('navigation', 'Home recebeu foco - atualizando dados');
        refreshData();
      }
    });
    
    return unsubscribe;
  }, [navigation, refreshData]);

  // Estados para o carrossel de banners
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const scrollX = useRef(new Animated.Value(0)).current;
  const [bannerData, setBannerData] = useState<BannerItem[]>([]);

  // Usar o tipo BookWithProgress para recentlyReadBooks
  const recentlyReadBooksWithProgress = recentlyReadBooks as BookWithProgress[];
  
  // Usar os primeiros livros como banners de destaque
  useEffect(() => {
    if (allBooks.length > 0) {
      const banners = allBooks.slice(0, 4).map((book: Book, index: number) => ({
        id: book.id,
        title: book.title.toUpperCase(),
        subtitle: `DESTAQUE ${index + 1}`,
        description: book.description || 'Confira esta incrível história agora mesmo!',
        cover_url: book.cover_url,
      }));
      setBannerData(banners);
    }
  }, [allBooks]);
  
  const scrollViewRef = useRef<any>(null);
  const lastScrollY = useRef(0);
  
  // Valores animados para rastreamento e animação
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.85, 1],
    extrapolate: 'clamp'
  });
  
  // Configurações para o header
  const headerHeight = normalize(Platform.OS === 'ios' ? 100 : 80);
  
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  });
  
  // Função para lidar com o scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        
        if (currentScrollY > lastScrollY.current + 5) {
          Animated.spring(headerTranslateY, {
            toValue: -headerHeight,
            useNativeDriver: true,
            tension: 100,
            friction: 10
          }).start();
        } else if (currentScrollY < lastScrollY.current - 5 || currentScrollY <= 0) {
          Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10
          }).start();
        }
        
        lastScrollY.current = currentScrollY;
      }
    }
  );

  // Substituir a função de navegação para perfil por uma função de favoritos
  const navigateToFavorites = () => {
    // Por enquanto, apenas mostrar um alerta, mas isso poderia navegar para uma tela de favoritos
    Alert.alert(
      "Favoritos",
      "Seus livros favoritos aparecerão aqui em breve!",
      [{ text: "OK", onPress: () => console.log("Favoritos pressionado") }]
    );
  };

  // Navegar para a tela de notificações
  const navigateToNotifications = () => {
    navigation.navigate('Notifications');
  };

  // Verifica se estamos no iOS e aplica um estilo específico para a área segura
  const safeAreaStyle = Platform.OS === 'ios' 
    ? [styles.container, styles.iosSafeArea] 
    : styles.container;

  return (
    <SafeAreaViewContext style={[
      safeAreaStyle, 
      Platform.OS === 'ios' && styles.iosSafeArea
    ]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      {/* Header com fundo translúcido */}
      <AnimatedView 
        style={[
          styles.headerWrapper,
          { 
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        ]}
      >
        <AnimatedView 
          style={[
            styles.headerBackground,
            { opacity: headerOpacity }
          ]} 
        />
        
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>LX</Text>
            <Text style={styles.logoText}>Lendario</Text>
          </View>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={navigateToNotifications}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              <NotificationIndicator size={8} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={navigateToFavorites}>
              <View style={styles.favoriteIconContainer}>
                <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Carregando sua biblioteca...</Text>
        </View>
      ) : (
        <AnimatedScrollView 
          scrollViewRef={scrollViewRef}
          style={{
            flex: 1, 
            width: '100%',
            backgroundColor: '#121212'
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: normalize(70)
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Espaço reservado para o cabeçalho no início do scroll */}
          <View style={styles.headerPlaceholder} />
          
          {/* Banner Carousel com animação */}
          <BannerCarousel 
            data={bannerData}
            componentHeight={height * 0.4}
            onItemPress={(item) => navigation.navigate('BookDetail', { bookId: item.id })}
          />

          {/* Continue a partir daqui com o restante do conteúdo */}
          {/* Recommended Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recomendado para você</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>Ver tudo</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF4500" />
              </TouchableOpacity>
            </View>
            
            {recommendedBooks.length > 0 ? (
              <FlatList
                horizontal
                data={recommendedBooks}
                renderItem={({ item }: { item: Book }) => (
                  <TouchableOpacity 
                    style={styles.storyItem}
                    onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.bookCoverContainer}>
                      <Image 
                        source={{ 
                          uri: item.cover_url || 'https://via.placeholder.com/150x200?text=Sem+Imagem'
                        }} 
                        style={styles.storyCover} 
                        resizeMode="cover" 
                      />
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                        style={styles.coverGradient}
                      />
                    </View>
                    <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.storyAuthor} numberOfLines={1}>{item.author}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item: Book) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Ionicons name="book-outline" size={40} color="#444" />
                    <Text style={styles.emptyListText}>Sem recomendações no momento</Text>
                  </View>
                }
              />
            ) : (
              <View style={styles.shimmingContainer}>
                {[1, 2, 3, 4].map((item) => {
                  // Usando KeyedView que aceita itemKey corretamente
                  return (
                    <KeyedView itemKey={`shimmer-${item}`} style={styles.shimmerBook}>
                      <View style={[styles.shimmerCover, styles.shimmerEffect]} />
                      <View style={[styles.shimmerTitle, styles.shimmerEffect]} />
                      <View style={[styles.shimmerAuthor, styles.shimmerEffect]} />
                    </KeyedView>
                  );
                })}
              </View>
            )}
          </View>
          
          {/* Continue Reading Section */}
          {recentlyReadBooksWithProgress.length > 0 && (
            <View style={styles.continueReadingSection}>
              <Text style={styles.sectionTitle}>Continue lendo</Text>
              <ContinueReading 
                book={recentlyReadBooksWithProgress[0]} 
                onPress={(bookId) => navigation.navigate('BookDetail', { bookId })}
              />
            </View>
          )}

          {/* Romance Stories Section */}
          <View style={styles.section}>
            <BookList
              title="Histórias de Romance"
              books={romanceBooks}
              onBookPress={(bookId) => navigation.navigate('BookDetail', { bookId })}
              loading={loading}
            />
          </View>

          {/* Stories By Her Section */}
          <View style={styles.section}>
            <BookList
              title="Histórias Por Elas"
              books={storiesByHer}
              onBookPress={(bookId) => navigation.navigate('BookDetail', { bookId })}
              loading={loading}
            />
          </View>

          {/* Premium Selection Section */}
          {premiumBooks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seleção Premium</Text>
              <FlatList
                data={premiumBooks.slice(0, 2)}
                renderItem={renderPremiumItem}
                keyExtractor={(item: Book) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.premiumList}
              />
            </View>
          )}

          {/* Escape Section */}
          <View style={styles.section}>
            <BookList
              title="Escape da Realidade"
              books={escapeBooks}
              onBookPress={(bookId) => navigation.navigate('BookDetail', { bookId })}
              loading={loading}
            />
          </View>

          {/* Reading Radar Section */}
          {allBooks.length > 0 && (
            <View style={styles.section}>
              <BookList
                title="Radar de Leitura"
                books={allBooks.slice(4, 10)}
                onBookPress={(bookId) => navigation.navigate('BookDetail', { bookId })}
                loading={loading}
              />
            </View>
          )}
          
          {/* Espaço adicional no final do scroll para evitar conteúdo cortado */}
          <View style={styles.scrollEndPadding} />
        </AnimatedScrollView>
      )}

      {/* Bottom Navigation - Design material moderno */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="home" size={24} color="#FF4500" />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="search" size={24} color="#777777" />
          </View>
          <Text style={styles.navText}>Explorar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconContainer}>
            <Ionicons name="library" size={24} color="#777777" />
          </View>
          <Text style={styles.navText}>Biblioteca</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="person" size={24} color="#777777" />
            {user && (
              <View style={styles.navProfileIndicator} />
            )}
          </View>
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  iosSafeArea: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerWrapper: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    zIndex: 999,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FF4500',
    marginRight: normalize(4),
  },
  logoText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    width: normalize(36),
    height: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    marginLeft: normalize(12),
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4500',
  },
  favoriteIconContainer: {
    width: normalize(22),
    height: normalize(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: normalize(80),
  },
  section: {
    marginTop: normalize(16),
    marginBottom: normalize(24),
    paddingHorizontal: normalize(16),
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#FF4500',
    fontSize: normalize(14),
    fontWeight: '600',
    marginRight: normalize(4),
  },
  horizontalList: {
    paddingRight: normalize(16),
  },
  storyItem: {
    width: normalize(140),
    marginRight: normalize(16),
  },
  bookCoverContainer: {
    position: 'relative',
    marginBottom: normalize(8),
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  storyCover: {
    width: normalize(140),
    height: normalize(200),
    borderRadius: 8,
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  storyTitle: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(4),
  },
  storyAuthor: {
    fontSize: normalize(12),
    color: '#BBBBBB',
  },
  storyTag: {
    fontSize: normalize(10),
    color: '#FF4500',
    marginBottom: normalize(4),
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  storyViews: {
    fontSize: normalize(12),
    color: '#999999',
    marginTop: normalize(4),
  },
  continueReadingSection: {
    marginTop: normalize(16),
    marginBottom: normalize(24),
    padding: normalize(16),
  },
  continueReading: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginTop: normalize(16),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueReadingLeft: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: normalize(12),
    paddingVertical: normalize(12),
  },
  continueReadingContent: {
    flex: 1,
    padding: normalize(16),
    justifyContent: 'space-between',
  },
  continueReadingLabel: {
    fontSize: normalize(10),
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: normalize(4),
  },
  continueReadingTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(4),
  },
  continueReadingAuthor: {
    fontSize: normalize(12),
    color: '#BBBBBB',
    marginBottom: normalize(16),
  },
  continueReadingCover: {
    width: normalize(80),
    height: normalize(120),
    borderRadius: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  progressBarContainer: {
    flex: 1,
    height: normalize(4),
    backgroundColor: '#333333',
    borderRadius: 2,
    marginRight: normalize(8),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 2,
  },
  continueReadingProgress: {
    fontSize: normalize(12),
    color: '#BBBBBB',
    width: normalize(36),
    textAlign: 'right',
  },
  readNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4500',
    alignSelf: 'flex-start',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: 16,
  },
  readNowButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: normalize(12),
    marginLeft: normalize(4),
  },
  emptyListContainer: {
    width: width - normalize(32),
    height: normalize(200),
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    color: '#777',
    marginTop: normalize(16),
    fontSize: normalize(14),
    textAlign: 'center',
  },
  shimmingContainer: {
    flexDirection: 'row',
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
    backgroundColor: '#222',
  },
  shimmerTitle: {
    width: '100%',
    height: normalize(14),
    marginBottom: normalize(8),
    backgroundColor: '#222',
    borderRadius: 4,
  },
  shimmerAuthor: {
    width: '70%',
    height: normalize(12),
    backgroundColor: '#222',
    borderRadius: 4,
  },
  shimmerEffect: {
    opacity: 0.7,
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
  navProfileIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: normalize(16),
    fontSize: normalize(16),
  },
  premiumItem: {
    width: width * 0.8,
    height: normalize(150),
    marginRight: normalize(16),
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  premiumCover: {
    width: normalize(100),
    height: '100%',
  },
  premiumContent: {
    flex: 1,
    padding: normalize(12),
    justifyContent: 'space-between',
  },
  premiumTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: normalize(8),
  },
  premiumAuthor: {
    fontSize: normalize(14),
    color: '#DDDDDD',
    marginBottom: normalize(8),
  },
  premiumDescription: {
    fontSize: normalize(13),
    color: '#DDDDDD',
    lineHeight: normalize(18),
    marginBottom: normalize(8),
  },
  premiumViews: {
    fontSize: normalize(12),
    color: '#999999',
  },
  premiumList: {
    paddingRight: normalize(16),
  },
  headerPlaceholder: {
    height: normalize(Platform.OS === 'ios' ? 100 : 80),
    width: '100%',
  },
  scrollEndPadding: {
    height: normalize(80),
  },
});

