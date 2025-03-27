// Chaves para AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@LENDARIOX:auth_token',
  USER_DATA: '@LENDARIOX:user_data',
  HAS_LAUNCHED: '@LENDARIOX:hasLaunched',
  READING_PROGRESS: '@LENDARIOX:reading_progress',
  BOOK_DOWNLOADS: '@LENDARIOX:book_downloads',
  SETTINGS: '@LENDARIOX:settings',
};

// Mensagens de erro
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Por favor, tente novamente.',
  NETWORK: 'Falha na conexão. Verifique sua internet e tente novamente.',
  AUTH: {
    INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
    WEAK_PASSWORD: 'A senha deve ter pelo menos 6 caracteres.',
    EMAIL_IN_USE: 'Este e-mail já está em uso.',
    INVALID_EMAIL: 'Por favor, forneça um e-mail válido.',
    EMPTY_FIELDS: 'Por favor, preencha todos os campos.',
    SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.',
  },
  BOOKS: {
    NOT_FOUND: 'Livro não encontrado.',
    LOAD_FAILED: 'Não foi possível carregar os livros. Tente novamente.',
    PREMIUM_REQUIRED: 'Este é um livro premium. Faça upgrade para acessá-lo.',
    DOWNLOAD_FAILED: 'Falha ao baixar o livro. Tente novamente.',
  },
  READER: {
    LOAD_FAILED: 'Não foi possível carregar o documento. Tente novamente.',
    UNSUPPORTED_FORMAT: 'Formato de arquivo não suportado.',
  },
};

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Login realizado com sucesso!',
    REGISTER: 'Conta criada com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    PASSWORD_RESET: 'E-mail de recuperação enviado!',
  },
  BOOKS: {
    DOWNLOAD_COMPLETE: 'Download concluído!',
    PROGRESS_SAVED: 'Progresso salvo!',
  },
};

// Rotas de navegação
export const ROUTES = {
  ONBOARDING: 'Onboarding',
  AUTH: 'Auth',
  LOADING: 'Loading',
  HOME: 'Home',
  BOOK_DETAIL: 'BookDetail',
  PDF_READER: 'PdfReader',
  EPUB_READER: 'EpubReader',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LIBRARY: 'Library',
  PREMIUM: 'Premium',
};

// Valores padrão
export const DEFAULTS = {
  ITEMS_PER_PAGE: 10,
  ANIMATION_DURATION: 300,
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 50,
  DEFAULT_READING_MODE: 'vertical' as const,
  THUMBNAIL_SIZE: { width: 150, height: 230 },
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/150x230',
  DEFAULT_LANGUAGE: 'pt-BR',
  PAGINATION_LIMIT: 20,
};

// Tipos de arquivos suportados
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  EPUB: 'application/epub+zip',
};

// Categorias pré-definidas
export const PREDEFINED_CATEGORIES = [
  'Aventura',
  'Ficção Científica',
  'Romance',
  'Terror',
  'Fantasia',
  'História',
  'Biografia',
  'Autoajuda',
  'Negócios',
  'Educação',
];

export default {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  DEFAULTS,
  SUPPORTED_FILE_TYPES,
  PREDEFINED_CATEGORIES,
}; 