import { Dimensions, PixelRatio, Platform } from 'react-native';

// Obtém as dimensões da tela
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Largura base de design (baseada em iPhone X)
const BASE_WIDTH = 375;

// Escala para diferentes dispositivos
const scale = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Normaliza um tamanho para diferentes tamanhos de tela.
 * 
 * @param size Tamanho em pixels para normalizar
 * @returns Tamanho normalizado para a densidade e tamanho de tela atual
 */
export function normalize(size: number): number {
  // Para iOS, usamos uma escala simples
  // Para Android, ajustamos com base na densidade de pixels para melhor consistência
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  } else {
    // Para Android, usamos PixelRatio para ajustar com base na densidade da tela
    return Math.round(newSize * PixelRatio.getFontScale());
  }
}

/**
 * Normaliza uma altura para diferentes tamanhos de tela.
 * 
 * @param size Altura em pixels para normalizar
 * @returns Altura normalizada para o tamanho de tela atual
 */
export function normalizeHeight(size: number): number {
  // Para alturas, consideramos a proporção da tela em relação à altura base (812 do iPhone X)
  const BASE_HEIGHT = 812;
  const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
  
  return Math.round(size * heightScale);
}

/**
 * Calcula uma porcentagem da largura da tela
 * 
 * @param percentage Porcentagem da largura (0-100)
 * @returns Valor em pixels correspondente à porcentagem da largura da tela
 */
export function widthPercentage(percentage: number): number {
  return (percentage / 100) * SCREEN_WIDTH;
}

/**
 * Calcula uma porcentagem da altura da tela
 * 
 * @param percentage Porcentagem da altura (0-100)
 * @returns Valor em pixels correspondente à porcentagem da altura da tela
 */
export function heightPercentage(percentage: number): number {
  return (percentage / 100) * SCREEN_HEIGHT;
}

/**
 * Retorna as dimensões da tela atual
 */
export function getScreenDimensions() {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
}

/**
 * Verifica se o dispositivo é um tablet com base na largura da tela
 */
export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}

/**
 * Retorna um valor diferente baseado no tipo de dispositivo (tablet ou telefone)
 * 
 * @param phone Valor a ser retornado para telefones
 * @param tablet Valor a ser retornado para tablets
 * @returns O valor correspondente ao tipo de dispositivo
 */
export function deviceSpecific<T>(phone: T, tablet: T): T {
  return isTablet() ? tablet : phone;
} 