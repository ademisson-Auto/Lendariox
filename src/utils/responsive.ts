import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base width and height used for scaling
const BASE_WIDTH = 375; // iPhone 8 width as baseline
const BASE_HEIGHT = 812; // iPhone 8 height as baseline

/**
 * Escala um tamanho com base na largura da tela atual comparada à largura base
 * @param size Tamanho original para escala
 * @returns Tamanho dimensionado proporcionalmente à largura da tela
 */
export const normalize = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  }
  
  // Ajuste para diferentes densidades de pixel no Android
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Dimensiona uma altura com base na proporção da tela
 * @param size Tamanho original para escala
 * @returns Tamanho dimensionado proporcionalmente à altura da tela
 */
export const normalizeHeight = (size: number): number => {
  const scale = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scale;
  
  return Math.round(newSize);
};

/**
 * Calcula a porcentagem da largura da tela
 * @param percentage Porcentagem desejada (0-100)
 * @returns Valor em pixels correspondente à porcentagem da largura
 */
export const widthPercentage = (percentage: number): number => {
  return (percentage / 100) * SCREEN_WIDTH;
};

/**
 * Calcula a porcentagem da altura da tela
 * @param percentage Porcentagem desejada (0-100)
 * @returns Valor em pixels correspondente à porcentagem da altura
 */
export const heightPercentage = (percentage: number): number => {
  return (percentage / 100) * SCREEN_HEIGHT;
};

/**
 * Determina se o dispositivo está em modo paisagem
 * @returns true se estiver em modo paisagem, false se estiver em retrato
 */
export const isLandscape = (): boolean => {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
};

/**
 * Determina se o dispositivo é um tablet com base na diagonal da tela
 * (uma abordagem comum é considerar dispositivos com tela > 7" como tablets)
 * @returns true se for um tablet, false caso contrário
 */
export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH / pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT / pixelDensity;
  
  const diagonalInches = Math.sqrt(
    Math.pow(adjustedWidth, 2) + Math.pow(adjustedHeight, 2)
  ) / 160; // 160 é DPI padrão
  
  return diagonalInches >= 7;
};

/**
 * Obtém a altura da barra de status
 * @returns Altura da barra de status em pixels
 */
export const getStatusBarHeight = (): number => {
  return Platform.OS === 'ios' 
    ? isIphoneX() ? 44 : 20 
    : StatusBar.currentHeight || 0;
};

/**
 * Verifica se o dispositivo é um iPhone X ou modelo posterior (com notch)
 * @returns true se for um iPhone X ou modelo posterior, false caso contrário
 */
export const isIphoneX = (): boolean => {
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (SCREEN_HEIGHT === 780 ||
      SCREEN_WIDTH === 780 ||
      SCREEN_HEIGHT === 812 ||
      SCREEN_WIDTH === 812 ||
      SCREEN_HEIGHT === 844 ||
      SCREEN_WIDTH === 844 ||
      SCREEN_HEIGHT === 896 ||
      SCREEN_WIDTH === 896 ||
      SCREEN_HEIGHT === 926 ||
      SCREEN_WIDTH === 926)
  );
};

/**
 * Obtém a altura segura da parte inferior (para iPhones com notch)
 * @returns Altura do padding inferior para área segura
 */
export const getBottomSpace = (): number => {
  return isIphoneX() ? 34 : 0;
};

/**
 * Dimensões da tela e constantes úteis para responsividade
 */
export default {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  normalize,
  normalizeHeight,
  widthPercentage,
  heightPercentage,
  isLandscape,
  isTablet,
  getStatusBarHeight,
  isIphoneX,
  getBottomSpace
}; 