import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationType } from '../../types/notification';
import { colors } from '../../theme';
import { normalize } from '../../utils/responsiveness';

interface NotificationIndicatorProps {
  type?: NotificationType;
  size?: number;
  color?: string;
  style?: ViewStyle;
  animated?: boolean;
  showCount?: boolean;
}

/**
 * Componente que exibe um indicador visual de notificações não lidas
 * Pode ser personalizado para diferentes tamanhos e cores
 * Suporta animação de pulsação para chamar mais atenção
 */
const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  type,
  size = 10,
  color = colors.error,
  style,
  animated = true,
  showCount = false,
}) => {
  // Acessar o contexto de notificações
  const { hasUnreadNotifications, hasUnreadNotificationsOfType, getUnreadCount, getUnreadCountByType } = useNotification();
  
  // Valores de animação
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Verificar se há notificações não lidas
  const hasUnread = type 
    ? hasUnreadNotificationsOfType(type) 
    : hasUnreadNotifications();
  
  // Número de notificações não lidas (se showCount = true)
  const unreadCount = type 
    ? getUnreadCountByType(type)
    : getUnreadCount();
  
  // Iniciar animação quando o componente for montado ou quando houver alterações
  useEffect(() => {
    if (hasUnread && animated) {
      // Animação de fade in
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Animação de pulsação
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out quando não houver notificações
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [hasUnread, animated, pulseAnim, opacityAnim]);
  
  // Se não houver notificações não lidas, não renderiza nada
  if (!hasUnread) {
    return null;
  }
  
  // Configura estilos dinâmicos
  const dotStyle = {
    width: normalize(size),
    height: normalize(size),
    borderRadius: normalize(size / 2),
    backgroundColor: color,
    ...style,
  };
  
  // Aplica transformações de animação se animated=true
  const animatedStyle = animated
    ? {
        opacity: opacityAnim,
        transform: [{ scale: pulseAnim }],
      }
    : { opacity: 1 };
    
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.dot, dotStyle]}>
        {showCount && unreadCount > 0 && (
          <View style={styles.countContainer}>
            <Animated.Text style={styles.countText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Animated.Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  dot: {
    position: 'absolute',
    top: normalize(3),
    right: normalize(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: colors.text,
    fontSize: normalize(7),
    fontWeight: 'bold',
  },
});

export default NotificationIndicator; 