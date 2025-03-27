import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Texto a ser exibido no botão
   */
  title: string;
  
  /**
   * Variante do botão
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  
  /**
   * Tamanho do botão
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Estilo customizado do container
   */
  containerStyle?: ViewStyle;
  
  /**
   * Estilo customizado do texto
   */
  textStyle?: TextStyle;
  
  /**
   * Se o botão está em estado de carregamento
   */
  loading?: boolean;
  
  /**
   * Se o botão ocupa toda a largura disponível
   */
  fullWidth?: boolean;
  
  /**
   * Ícone à esquerda do texto
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícone à direita do texto
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Se o botão está desabilitado
   */
  disabled?: boolean;
  
  /**
   * Ação ao pressionar o botão
   */
  onPress?: () => void;
}

/**
 * Componente de botão customizável
 */
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  containerStyle,
  textStyle,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  onPress,
  ...rest
}) => {
  // Determina os estilos com base nas props
  const getContainerStyle = (): ViewStyle[] => {
    const styles: ViewStyle[] = [buttonStyles.base];
    
    // Adiciona estilo de variante
    switch (variant) {
      case 'primary':
        styles.push(buttonStyles.primaryContainer);
        break;
      case 'secondary':
        styles.push(buttonStyles.secondaryContainer);
        break;
      case 'outline':
        styles.push(buttonStyles.outlineContainer);
        break;
      case 'text':
        styles.push(buttonStyles.textContainer);
        break;
      case 'danger':
        styles.push(buttonStyles.dangerContainer);
        break;
    }
    
    // Adiciona estilo de tamanho
    switch (size) {
      case 'small':
        styles.push(buttonStyles.smallContainer);
        break;
      case 'medium':
        styles.push(buttonStyles.mediumContainer);
        break;
      case 'large':
        styles.push(buttonStyles.largeContainer);
        break;
    }
    
    // Adiciona estilo de largura completa
    if (fullWidth) {
      styles.push(buttonStyles.fullWidth);
    }
    
    // Adiciona estilo de desabilitado
    if (disabled) {
      styles.push(buttonStyles.disabledContainer);
    }
    
    // Adiciona estilo customizado
    if (containerStyle) {
      styles.push(containerStyle);
    }
    
    return styles;
  };
  
  // Determina os estilos do texto
  const getTextStyle = (): TextStyle[] => {
    const styles: TextStyle[] = [buttonStyles.text];
    
    // Adiciona estilo de texto de acordo com a variante
    switch (variant) {
      case 'primary':
        styles.push(buttonStyles.primaryText);
        break;
      case 'secondary':
        styles.push(buttonStyles.secondaryText);
        break;
      case 'outline':
        styles.push(buttonStyles.outlineText);
        break;
      case 'text':
        styles.push(buttonStyles.textOnlyText);
        break;
      case 'danger':
        styles.push(buttonStyles.dangerText);
        break;
    }
    
    // Adiciona estilo de texto de acordo com o tamanho
    switch (size) {
      case 'small':
        styles.push(buttonStyles.smallText);
        break;
      case 'medium':
        styles.push(buttonStyles.mediumText);
        break;
      case 'large':
        styles.push(buttonStyles.largeText);
        break;
    }
    
    // Adiciona estilo de texto desabilitado
    if (disabled) {
      styles.push(buttonStyles.disabledText);
    }
    
    // Adiciona estilo customizado
    if (textStyle) {
      styles.push(textStyle);
    }
    
    return styles;
  };
  
  // Cor do spinner de carregamento
  const getLoaderColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.text;
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'text':
        return colors.primary;
      case 'danger':
        return colors.text;
      default:
        return colors.text;
    }
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  // Estilos base
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  
  // Variantes
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  textContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xs,
  },
  dangerContainer: {
    backgroundColor: colors.error,
  },
  
  // Tamanhos
  smallContainer: {
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  mediumContainer: {
    paddingVertical: spacing.sm,
  },
  largeContainer: {
    paddingVertical: spacing.md,
  },
  
  // Estado
  disabledContainer: {
    opacity: 0.5,
  },
  
  // Texto
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.text,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.primary,
  },
  textOnlyText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.text,
  },
  
  // Texto por tamanho
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  
  // Texto desabilitado
  disabledText: {
    opacity: 0.7,
  },
  
  // Largura
  fullWidth: {
    width: '100%',
  },
});

export default Button; 