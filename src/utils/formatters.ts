/**
 * Conjunto de funções para formatação de dados
 */

/**
 * Formata o tamanho de arquivo de bytes para KB, MB, etc.
 */
export const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formata números grandes para versões mais legíveis com sufixos K e M
 * @param value Número a ser formatado
 * @param decimals Casas decimais a manter (padrão: 1)
 * @returns String formatada (ex: 1.5K, 2.3M)
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals).replace(/\.0$/, '')}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals).replace(/\.0$/, '')}K`;
  }
  return value.toString();
};

/**
 * Formata números de visualizações com sufixo
 * @param views Número de visualizações
 * @returns String formatada com sufixo "leituras"
 */
export const formatViews = (views: number): string => {
  return `${formatNumber(views)} leituras`;
};

/**
 * Formata uma data ISO para o formato local.
 */
export const formatDateISO = (dateString: string | undefined, locale: string = 'pt-BR'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Formata o título do livro para exibição, limitando o tamanho.
 */
export const formatBookTitle = (title: string, maxLength: number = 40): string => {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  
  return `${title.substring(0, maxLength)}...`;
};

/**
 * Formata o progresso de leitura como porcentagem.
 */
export const formatReadingProgress = (current: number, total: number): string => {
  if (!total || total === 0) return '0%';
  
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
};

/**
 * Formata o tempo de leitura estimado.
 * Média de 250 palavras por minuto para leitura.
 */
export const formatReadingTime = (wordCount: number): string => {
  if (!wordCount || wordCount === 0) return '0 min';
  
  const minutes = Math.ceil(wordCount / 250);
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
};

/**
 * Formata uma lista de tags para exibição.
 */
export const formatTags = (tags: string[] | undefined, separator: string = ', '): string => {
  if (!tags || tags.length === 0) return '';
  return tags.join(separator);
};

/**
 * Trunca o texto para um determinado tamanho, adicionando "..." ao final.
 */
export const truncateText = (text: string | undefined, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Converte um texto em um slug (para URLs, identificadores, etc).
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')                // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')            // Espaços para hífens
    .replace(/[^\w-]+/g, '')         // Remove caracteres não alfanuméricos
    .replace(/--+/g, '-');           // Substitui múltiplos hífens por um
};

/**
 * Formata um timestamp ou objeto Date para uma string de data legível
 * @param date Data em formato timestamp, Date ou string ISO
 * @param format Formato desejado ('short', 'medium', 'long')
 * @returns String formatada da data
 */
export const formatDate = (
  date: number | Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  // Converter para objeto Date se não for
  const dateObj = 
    date instanceof Date ? date : 
    typeof date === 'string' ? new Date(date) :
    new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: format === 'short' ? '2-digit' : 'long',
    year: 'numeric',
  };
  
  if (format === 'long') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('pt-BR', options);
};

/**
 * Formata um número como porcentagem
 * @param value Valor decimal (0.1 = 10%)
 * @param decimals Casas decimais
 * @returns String formatada com símbolo de porcentagem
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals).replace(/\.0$/, '')}%`;
};

/**
 * Formata um tempo em segundos para formato MM:SS ou HH:MM:SS
 * @param seconds Tempo em segundos
 * @param showHours Forçar exibição de horas mesmo se for zero
 * @returns String formatada no formato de tempo
 */
export const formatTime = (seconds: number, showHours: boolean = false): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0 || showHours) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formata um número para exibição de moeda (R$)
 * @param value Valor a formatar
 * @returns String formatada com símbolo de moeda
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}; 