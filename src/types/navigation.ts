/**
 * Tipos para navegação entre telas do aplicativo
 */
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: { initialForm?: 'login' | 'register' };
  Loading: { message?: string; redirectTo: string; initialForm?: 'login' | 'register' };
  Home: undefined;
  BookDetail: { bookId: string };
  PdfReader: { 
    uri: string, 
    bookId: string, 
    title: string, 
    currentPage: number, 
    totalPages: number 
  };
  EPUBReader: { 
    bookId: string,
    bookUrl: string,
    title?: string
  };
  Profile: undefined;
  Notifications: undefined;
}; 