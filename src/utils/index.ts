/**
 * Utilitários centralizados da aplicação
 */

// Exporta funcionalidades de formatação
export * from './formatters';

// Exporta utilitários de responsividade
export * from './responsiveness';

// Exporta utilitários de cache
export * from './cache';

// Exporta utilitários de validação
export * from './validation';

// Exporta utilitários de logging
export * from './logManager';

// Exporta outros utilitários existentes 
// Adicione aqui conforme necessário

// Objeto com utilitários agrupados por categoria para uso mais organizado
const utils = {
  // Formatters
  formatters: require('./formatters'),
  
  // Responsive (usando o módulo responsiveness)
  responsive: require('./responsiveness'),
  
  // Cache
  cache: require('./cache'),
  
  // Validation
  validation: require('./validation'),
  
  // LogManager
  log: require('./logManager')
};

export default utils; 