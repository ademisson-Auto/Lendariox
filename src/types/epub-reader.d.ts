// Definição de tipos para nossa própria implementação de leitor EPUB usando WebView
import { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface EPUBReaderProps {
  /**
   * URI para o arquivo EPUB. Pode ser uma URL remota ou um caminho local.
   */
  src: string;

  /**
   * Estilo para o componente do leitor.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Localização inicial no livro EPUB (pode ser um CFI - Canon Fragment Identifier ou uma página).
   */
  initialLocation?: string;

  /**
   * Tamanho da fonte para o conteúdo.
   */
  fontSize?: number;

  /**
   * Controla o tema de leitura.
   */
  theme?: 'light' | 'dark' | 'sepia';

  /**
   * Callback chamado quando o usuário muda de página/localização.
   */
  onLocationChange?: (location: EPUBLocation) => void;

  /**
   * Callback chamado quando o livro é carregado.
   */
  onLoad?: (book: EPUBBook) => void;

  /**
   * Callback chamado quando ocorre um erro.
   */
  onError?: (error: Error) => void;

  /**
   * Callback chamado quando o usuário seleciona texto.
   */
  onSelection?: (selection: EPUBSelection) => void;
}

export interface EPUBLocation {
  /**
   * Identificador da localização atual (para EPUB pode ser um CFI).
   */
  cfi?: string;

  /**
   * Número do capítulo atual.
   */
  chapterNumber?: number;

  /**
   * Título do capítulo atual.
   */
  chapterTitle?: string;

  /**
   * Progresso atual no livro (0-1).
   */
  progress: number;

  /**
   * Número de páginas total estimado.
   */
  totalPages?: number;

  /**
   * Número da página atual estimado.
   */
  currentPage?: number;
}

export interface EPUBBook {
  /**
   * Título do livro.
   */
  title: string;

  /**
   * Autor do livro.
   */
  author: string;

  /**
   * URL da capa do livro.
   */
  coverURL?: string;

  /**
   * Lista de capítulos do livro.
   */
  chapters?: EPUBChapter[];

  /**
   * Metadados do livro.
   */
  metadata?: Record<string, string>;
}

export interface EPUBChapter {
  /**
   * Título do capítulo.
   */
  title: string;

  /**
   * Identificador do capítulo.
   */
  id: string;

  /**
   * Nível de hierarquia do capítulo.
   */
  level?: number;
}

export interface EPUBSelection {
  /**
   * Texto selecionado.
   */
  text: string;

  /**
   * Identificador da seleção (para EPUB pode ser um CFI).
   */
  cfiRange?: string;

  /**
   * Coordenadas da seleção.
   */
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

/**
 * Componente para renderizar um leitor de EPUB.
 */
const EPUBReader: ComponentType<EPUBReaderProps>;

export default EPUBReader; 