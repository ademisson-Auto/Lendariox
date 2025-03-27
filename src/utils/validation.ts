/**
 * Conjunto de funções para validação de dados
 */

/**
 * Verifica se um e-mail é válido
 * @param email O e-mail a ser validado
 * @returns true se o e-mail for válido, false caso contrário
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Verifica se uma senha atende aos requisitos mínimos
 * - Mínimo de 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial
 * 
 * @param password A senha a ser validada
 * @returns true se a senha atender aos requisitos, false caso contrário
 */
export const isStrongPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Verifica se uma senha possui o tamanho mínimo
 * @param password A senha a ser validada
 * @param minLength Tamanho mínimo (padrão: 8)
 * @returns true se a senha tiver o tamanho mínimo, false caso contrário
 */
export const hasMinLength = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength;
};

/**
 * Analisa a força de uma senha e retorna uma pontuação
 * @param password A senha a ser analisada
 * @returns Pontuação de 0 a 4 (0: muito fraca, 4: muito forte)
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  // Comprimento
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Complexidade
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Normaliza para 0-4
  return Math.min(4, Math.floor(score / 1.5));
};

/**
 * Verifica se duas senhas são iguais
 * @param password Senha original
 * @param confirm Confirmação da senha
 * @returns true se as senhas forem iguais, false caso contrário
 */
export const passwordsMatch = (password: string, confirm: string): boolean => {
  return password === confirm;
};

/**
 * Verifica se um nome é válido (não vazio e pelo menos 2 caracteres)
 * @param name O nome a ser validado
 * @returns true se o nome for válido, false caso contrário
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Verifica se um número de telefone é válido
 * @param phone O número de telefone a ser validado
 * @returns true se o telefone for válido, false caso contrário
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Validação básica para telefone brasileiro (8 ou 9 dígitos + DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Verifica se um CEP é válido
 * @param cep O CEP a ser validado
 * @returns true se o CEP for válido, false caso contrário
 */
export const isValidCEP = (cep: string): boolean => {
  const cleanCep = cep.replace(/\D/g, '');
  return cleanCep.length === 8;
};

/**
 * Verifica se um CPF é válido 
 * @param cpf O CPF a ser validado
 * @returns true se o CPF for válido, false caso contrário
 */
export const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais, o que tornaria o CPF inválido
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Validação do primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  // Validação do segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

/**
 * Verifica se uma URL é válida
 * @param url A URL a ser validada
 * @returns true se a URL for válida, false caso contrário
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida se uma data é válida e está no passado
 * @param date A data a ser validada
 * @returns true se a data for válida e estiver no passado, false caso contrário
 */
export const isPastDate = (date: Date): boolean => {
  const now = new Date();
  return date < now && date.toString() !== 'Invalid Date';
};

/**
 * Valida se uma data é válida e está no futuro
 * @param date A data a ser validada
 * @returns true se a data for válida e estiver no futuro, false caso contrário
 */
export const isFutureDate = (date: Date): boolean => {
  const now = new Date();
  return date > now && date.toString() !== 'Invalid Date';
};

/**
 * Verifica se uma string está vazia ou contém apenas espaços
 * @param text O texto a ser verificado
 * @returns true se o texto estiver vazio ou com apenas espaços, false caso contrário
 */
export const isEmpty = (text: string): boolean => {
  return text.trim().length === 0;
};

/**
 * Verifica se um objeto contém todas as propriedades necessárias
 * @param obj O objeto a ser verificado
 * @param requiredProps Lista de propriedades necessárias
 * @returns true se todas as propriedades estiverem presentes, false caso contrário
 */
export const hasRequiredProperties = <T extends Record<string, any>>(obj: T, requiredProps: (keyof T)[]): boolean => {
  return requiredProps.every(prop => 
    Object.prototype.hasOwnProperty.call(obj, prop) && 
    obj[prop] !== undefined && 
    obj[prop] !== null
  );
};

/**
 * Converte uma string de data para um objeto Date
 * @param dateStr String de data no formato DD/MM/YYYY
 * @returns Objeto Date ou null se inválido
 */
export const parseDateString = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Meses em JS são 0-indexados
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  // Verificação de data válida
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  
  return date;
};

export default {
  isValidEmail,
  isStrongPassword,
  hasMinLength,
  getPasswordStrength,
  passwordsMatch,
  isValidName,
  isValidPhoneNumber,
  isValidCEP,
  isValidCPF,
  isValidURL,
  isPastDate,
  isFutureDate,
  isEmpty,
  hasRequiredProperties,
  parseDateString
}; 