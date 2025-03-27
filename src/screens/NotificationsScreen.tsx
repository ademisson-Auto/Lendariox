import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  StatusBar,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../contexts/NotificationContext';
import { Notification, NotificationType } from '../types/notification';
import { colors } from '../theme';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import LogManager from '../utils/logManager';

// Obter dimensões da tela para responsividade
const { width } = Dimensions.get('window');

// Calcula tamanhos relativos para diferentes dispositivos
const normalize = (size: number) => Math.round(size * (width / 375));

// Funções auxiliares para formatação de data sem dependências externas
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffMonth / 12);
  
  if (diffSec < 60) {
    return 'agora';
  } else if (diffMin < 60) {
    return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHour < 24) {
    return `há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`;
  } else if (diffDay < 30) {
    return `há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`;
  } else if (diffMonth < 12) {
    return `há ${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`;
  } else {
    return `há ${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`;
  }
};

const formatDate = (date: Date): string => {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const ano = date.getFullYear();
  
  const hoje = new Date();
  
  if (date.getFullYear() === hoje.getFullYear()) {
    return `${dia} de ${mes}`;
  } else {
    return `${dia} de ${mes} de ${ano}`;
  }
};

type NotificationsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Notifications'>;
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { 
    state, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();
  
  // Carregar notificações quando a tela for montada
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Renderizar o ícone adequado para cada tipo de notificação
  const renderNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SYSTEM:
        return <Ionicons name="alert-circle-outline" size={24} color={colors.primary} />;
      case NotificationType.BOOK_UPDATE:
        return <Ionicons name="book-outline" size={24} color={colors.primary} />;
      case NotificationType.AUTHOR:
        return <Ionicons name="person-outline" size={24} color={colors.primary} />;
      case NotificationType.SOCIAL:
        return <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />;
      case NotificationType.ACHIEVEMENT:
        return <Ionicons name="trophy-outline" size={24} color={colors.primary} />;
      case NotificationType.PROFILE:
        return <Ionicons name="person-circle-outline" size={24} color={colors.primary} />;
      default:
        return <Ionicons name="notifications-outline" size={24} color={colors.primary} />;
    }
  };
  
  // Formatar a data da notificação
  const formatNotificationDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Se for menos de 24 horas, mostrar tempo relativo (há X horas)
    if (diff < 24 * 60 * 60 * 1000) {
      return formatRelativeTime(date);
    }
    
    // Caso contrário, mostrar data formatada
    return formatDate(date);
  };
  
  // Renderizar o componente de ação de exclusão do Swipeable
  const renderRightActions = (notification: Notification) => {
    return (
      <View style={styles.rightActionsContainer}>
        <RectButton
          style={styles.readAction}
          onPress={() => markAsRead(notification.id)}
        >
          <Ionicons name="checkmark-outline" size={22} color="#FFF" />
          <Text style={styles.actionText}>Ler</Text>
        </RectButton>
        
        <RectButton
          style={styles.deleteAction}
          onPress={() => {
            Alert.alert(
              'Excluir notificação',
              'Tem certeza que deseja excluir esta notificação?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => deleteNotification(notification.id) }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#FFF" />
          <Text style={styles.actionText}>Excluir</Text>
        </RectButton>
      </View>
    );
  };
  
  // Renderizar cada item da lista de notificações
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity 
          style={[
            styles.notificationItem,
            !item.isRead && styles.unreadNotification
          ]}
          onPress={() => markAsRead(item.id)}
        >
          <View style={styles.notificationIconContainer}>
            {renderNotificationIcon(item.type)}
          </View>
          
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>
              {formatNotificationDate(item.createdAt)}
            </Text>
          </View>
          
          {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Swipeable>
    );
  };
  
  // Renderizar o separador entre itens
  const renderSeparator = () => <View style={styles.separator} />;
  
  // Renderizar quando não houver notificações
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={50} color="#777" />
      <Text style={styles.emptyText}>Você não tem notificações</Text>
    </View>
  );
  
  // Função para confirmar leitura de todas as notificações
  const handleMarkAllAsRead = () => {
    if (state.summary.unread > 0) {
      Alert.alert(
        'Marcar todas como lidas',
        'Tem certeza que deseja marcar todas as notificações como lidas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Marcar', onPress: markAllAsRead }
        ]
      );
    } else {
      Alert.alert('Informação', 'Não há notificações não lidas.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor="#0A0A0A" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notificações</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleMarkAllAsRead}
        >
          <Ionicons name="checkmark-done-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Contador de notificações não lidas */}
      {state.summary.unread > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {state.summary.unread} {state.summary.unread === 1 ? 'notificação não lida' : 'notificações não lidas'}
          </Text>
        </View>
      )}
      
      {/* Lista de notificações */}
      {state.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando notificações...</Text>
        </View>
      ) : (
        <FlatList
          data={state.notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={state.loading}
              onRefresh={fetchNotifications}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.text,
  },
  actionButton: {
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBanner: {
    backgroundColor: colors.primaryDark,
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadText: {
    color: colors.text,
    fontSize: normalize(14),
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: normalize(20),
  },
  notificationItem: {
    flexDirection: 'row',
    padding: normalize(16),
    backgroundColor: colors.card,
  },
  unreadNotification: {
    backgroundColor: colors.modal,
  },
  notificationIconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalize(12),
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: normalize(4),
  },
  notificationMessage: {
    fontSize: normalize(14),
    color: colors.textSecondary,
    marginBottom: normalize(4),
    lineHeight: normalize(18),
  },
  notificationTime: {
    fontSize: normalize(12),
    color: colors.textLight,
  },
  unreadDot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: normalize(8),
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  loadingText: {
    color: colors.text,
    marginTop: normalize(12),
    fontSize: normalize(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
    marginTop: normalize(40),
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: normalize(12),
    fontSize: normalize(16),
    textAlign: 'center',
  },
  rightActionsContainer: {
    width: normalize(160),
    flexDirection: 'row',
  },
  readAction: {
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(80),
    height: '100%',
  },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(80),
    height: '100%',
  },
  actionText: {
    color: colors.text,
    fontSize: normalize(12),
    fontWeight: '500',
    marginTop: normalize(4),
  }
});

export default NotificationsScreen; 