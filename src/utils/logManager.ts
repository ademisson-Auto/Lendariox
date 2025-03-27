/**
 * Sistema de gerenciamento de logs centralizado para a aplicação.
 * Permite habilitar/desabilitar logs por categoria e 
 * fornece uma interface unificada para logging.
 */

// Configurações globais
const config = {
  // Flag global para ativar/desativar todos os logs
  enabled: false,
  // Flag de inicialização
  initialized: false,
  // Configurações por categoria
  categories: {
    app: true,     // Logs do ciclo de vida da aplicação
    auth: true,    // Logs de autenticação
    books: false,  // Logs relacionados a livros e leitura (desativados por padrão)
    navigation: true, // Logs de navegação
    network: true, // Logs de requisições de rede
    notification: true, // Logs de notificações
  },
  // Gravar logs no AsyncStorage para depuração posterior
  persistLogs: false,
  // Configuração de rate limit para evitar logs excessivos
  rateLimit: {
    enabled: true,
    windowMs: 1000, // Janela de 1 segundo para verificar duplicatas
    maxLogs: 3,     // Máximo de 3 logs iguais no período
  }
};

// Níveis de log
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Interface para um log estruturado
interface LogEntry {
  timestamp: string;
  category: string;
  level: LogLevel;
  message: string;
  data?: any;
}

// Lista de logs para possível persistência
const logHistory: LogEntry[] = [];
const MAX_LOG_HISTORY = 1000; // Limitar para evitar uso excessivo de memória

// Cache para controle de rate limiting
const logCache: Record<string, { count: number, lastTimestamp: number }> = {};

// Definir um tipo para as categorias de log permitidas
export type CategoryName = 
  | 'app'       // Logs relacionados à inicialização da aplicação
  | 'auth'      // Logs de autenticação
  | 'books'     // Logs relacionados a livros
  | 'navigation' // Logs de navegação
  | 'network'   // Logs de rede/API
  | 'notification'; // Logs de notificações

/**
 * Classe principal para gerenciamento de logs
 */
export class LogManager {
  /**
   * Garante que o LogManager está inicializado
   */
  static initialize(): void {
    if (!config.initialized) {
      config.initialized = true;
      console.info('[LOG MANAGER] Inicializado com sucesso');
    }
  }

  /**
   * Verifica se o LogManager está inicializado
   */
  static isInitialized(): boolean {
    return config.initialized;
  }

  /**
   * Ativa todos os logs da aplicação
   */
  static enableLogs(): void {
    LogManager.initialize();
    config.enabled = true;
    console.info('[LOG MANAGER] Logs ativados globalmente');
  }

  /**
   * Desativa todos os logs da aplicação
   */
  static disableLogs(): void {
    config.enabled = false;
    console.info('[LOG MANAGER] Logs desativados globalmente');
  }

  /**
   * Ativa logs para uma categoria específica
   */
  static enableCategory(category: keyof typeof config.categories): void {
    if (category in config.categories) {
      config.categories[category] = true;
      console.info(`[LOG MANAGER] Logs da categoria '${category}' ativados`);
    }
  }

  /**
   * Desativa logs para uma categoria específica
   */
  static disableCategory(category: keyof typeof config.categories): void {
    if (category in config.categories) {
      config.categories[category] = false;
      console.info(`[LOG MANAGER] Logs da categoria '${category}' desativados`);
    }
  }

  /**
   * Verifica se uma categoria está habilitada para logs
   */
  static isCategoryEnabled(category: keyof typeof config.categories): boolean {
    return config.enabled && (category in config.categories) && config.categories[category];
  }

  /**
   * Ativa ou desativa o rate limiting de logs
   */
  static setRateLimiting(enabled: boolean): void {
    config.rateLimit.enabled = enabled;
    console.info(`[LOG MANAGER] Rate limiting ${enabled ? 'ativado' : 'desativado'}`);
  }

  /**
   * Configura os parâmetros de rate limiting
   */
  static configureRateLimiting(windowMs: number, maxLogs: number): void {
    config.rateLimit.windowMs = windowMs;
    config.rateLimit.maxLogs = maxLogs;
    console.info(`[LOG MANAGER] Rate limiting configurado: ${maxLogs} logs a cada ${windowMs}ms`);
  }

  /**
   * Registra uma mensagem de log com nível DEBUG
   */
  static debug(category: keyof typeof config.categories, message: string, data?: any): void {
    LogManager.log(category, LogLevel.DEBUG, message, data);
  }

  /**
   * Registra uma mensagem de log com nível INFO
   */
  static info(category: keyof typeof config.categories, message: string, data?: any): void {
    LogManager.log(category, LogLevel.INFO, message, data);
  }

  /**
   * Registra uma mensagem de log com nível WARN
   */
  static warn(category: keyof typeof config.categories, message: string, data?: any): void {
    LogManager.log(category, LogLevel.WARN, message, data);
  }

  /**
   * Registra uma mensagem de log com nível ERROR
   */
  static error(category: keyof typeof config.categories, message: string, data?: any): void {
    // Erros sempre são registrados, independentemente das configurações
    LogManager.log(category, LogLevel.ERROR, message, data, true);
  }

  /**
   * Método interno para registrar logs
   */
  private static log(
    category: keyof typeof config.categories,
    level: LogLevel,
    message: string, 
    data?: any,
    forceLog: boolean = false
  ): void {
    // Verificar se os logs estão ativados para esta categoria
    if (!forceLog && !LogManager.isCategoryEnabled(category)) {
      return;
    }

    // Verificar rate limiting para evitar spam de logs
    if (config.rateLimit.enabled && level !== LogLevel.ERROR) {
      const cacheKey = `${category}:${level}:${message}`;
      const now = Date.now();
      const cached = logCache[cacheKey];

      if (cached) {
        // Verificar se estamos dentro da janela de tempo
        if (now - cached.lastTimestamp < config.rateLimit.windowMs) {
          cached.count++;
          cached.lastTimestamp = now;
          
          // Se excedeu o limite, não registrar o log
          if (cached.count > config.rateLimit.maxLogs) {
            // A cada 10 logs bloqueados, emitir um aviso
            if (cached.count % 10 === 0) {
              console.warn(`[LOG MANAGER] Rate limit atingido para: [${category.toUpperCase()}] ${message} (${cached.count} ocorrências)`);
            }
            return;
          }
        } else {
          // Fora da janela de tempo, resetar contador
          cached.count = 1;
          cached.lastTimestamp = now;
        }
      } else {
        // Primeiro log deste tipo
        logCache[cacheKey] = {
          count: 1,
          lastTimestamp: now
        };
      }
    }

    // Criar entrada de log estruturada
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      data,
    };

    // Adicionar ao histórico com limite
    logHistory.push(entry);
    if (logHistory.length > MAX_LOG_HISTORY) {
      logHistory.shift();
    }

    // Formatar mensagem para exibição
    const formattedMessage = `[${category.toUpperCase()}] ${message}`;

    // Registrar no console com o nível apropriado
    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage, data ? data : '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data ? data : '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data ? data : '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data ? data : '');
        break;
    }
  }

  /**
   * Limpa o cache de rate limiting
   */
  static clearRateLimitCache(): void {
    Object.keys(logCache).forEach(key => delete logCache[key]);
    console.info('[LOG MANAGER] Cache de rate limiting limpo');
  }

  /**
   * Retorna o histórico de logs para análise
   */
  static getLogHistory(): LogEntry[] {
    return [...logHistory];
  }

  /**
   * Limpa o histórico de logs
   */
  static clearLogHistory(): void {
    logHistory.length = 0;
    console.info('[LOG MANAGER] Histórico de logs limpo');
  }
}

export default LogManager; 