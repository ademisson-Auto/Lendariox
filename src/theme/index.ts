import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Cores do aplicativo
export const colors = {
  // Cores primárias
  primary: '#7B61FF',
  primaryDark: '#5B41DF',
  primaryLight: '#9B81FF',
  
  // Cores secundárias
  secondary: '#FF5678',
  secondaryDark: '#E03456',
  secondaryLight: '#FF7898',
  
  // Cores de fundo
  background: '#10121E',
  backgroundLight: '#1E2235',
  card: '#262A3D',
  modal: '#2D3250',
  
  // Cores de texto
  text: '#FFFFFF',
  textSecondary: '#A7A9BC',
  textLight: '#D0D0D8',
  textDark: '#52556F',
  
  // Cores de status
  success: '#4CAF50',
  info: '#2196F3',
  warning: '#FF9800',
  error: '#F44336',
  
  // Outras cores
  border: '#3D4160',
  divider: '#343850',
  overlay: 'rgba(16, 18, 30, 0.8)',
  premium: '#FFD700',
  shadow: '#000000',
};

// Tipografia
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    '2xl': 30,
    '3xl': 36,
    '4xl': 38,
    '5xl': 44,
  },
};

// Espaçamento
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

// Raios de borda
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
};

// Dimensões da tela
export const layout = {
  width,
  height,
  isSmallDevice: width < 375,
};

// Sombras
export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  layout,
  shadows,
}; 