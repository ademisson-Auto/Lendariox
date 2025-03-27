import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import md5 from 'md5';

// Definindo uma interface completa em vez de estender FileInfo
interface CacheFileInfo {
  exists: boolean;
  uri: string;
  isDirectory?: boolean;
  size?: number;
  modificationTime?: number;
  md5?: string;
}

/**
 * Classe para gerenciar o cache de arquivos em disco no dispositivo
 */
export class CacheManager {
  private static instance: CacheManager;
  private cacheDirectory: string;
  private inMemoryCache: Record<string, string> = {};
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB por padrão

  private constructor() {
    // Diretório de cache - no iOS fica no cacheDirectory, no Android fica em um diretório personalizado
    this.cacheDirectory = `${FileSystem.cacheDirectory}app-cache/`;
    this.initCache();
  }

  /**
   * Obtém a instância singleton do CacheManager
   */
  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Inicializa o diretório de cache se ele não existir
   */
  private async initCache(): Promise<void> {
    try {
      const { exists } = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (!exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDirectory, { intermediates: true });
      }
    } catch (error) {
      console.error('Erro ao inicializar o cache:', error);
    }
  }

  /**
   * Define o tamanho máximo do cache em bytes
   * @param sizeInBytes Tamanho máximo em bytes
   */
  public setMaxCacheSize(sizeInBytes: number): void {
    this.maxCacheSize = sizeInBytes;
  }

  /**
   * Gera um nome de arquivo hash com base na URL
   * @param url URL do recurso
   * @returns Nome do arquivo com hash
   */
  private getHashedFileName(url: string): string {
    return md5(url);
  }

  /**
   * Obtém o caminho do arquivo em cache
   * @param url URL original do arquivo
   * @returns Caminho do arquivo em cache
   */
  private getCacheFilePath(url: string): string {
    const fileName = this.getHashedFileName(url);
    const ext = this.getExtensionFromUrl(url);
    return `${this.cacheDirectory}${fileName}${ext}`;
  }

  /**
   * Extrai a extensão do arquivo da URL
   * @param url URL do arquivo
   * @returns Extensão do arquivo incluindo o ponto
   */
  private getExtensionFromUrl(url: string): string {
    const extension = url.split(/[#?]/)[0].split('.').pop()?.trim();
    return extension ? `.${extension}` : '';
  }

  /**
   * Obtém um arquivo da cache ou baixa e armazena se não existir
   * @param url URL do recurso
   * @returns Caminho local do arquivo
   */
  public async getFileFromCache(url: string): Promise<string> {
    // Verifica se já temos o caminho na memória
    if (this.inMemoryCache[url]) {
      return this.inMemoryCache[url];
    }

    const cachedFilePath = this.getCacheFilePath(url);

    try {
      // Verifica se o arquivo existe no cache
      const fileInfo = await FileSystem.getInfoAsync(cachedFilePath);
      
      if (fileInfo.exists) {
        // Arquivo existe, retorna o caminho local
        this.inMemoryCache[url] = cachedFilePath;
        return cachedFilePath;
      }

      // Arquivo não existe, deve baixar
      await this.downloadFile(url, cachedFilePath);
      
      // Verificar o tamanho do cache e limpar se necessário
      this.cleanCacheIfNeeded();
      
      this.inMemoryCache[url] = cachedFilePath;
      return cachedFilePath;
    } catch (error) {
      console.error('Erro ao acessar arquivo em cache:', error);
      return url; // Em caso de erro, retorna a URL original
    }
  }

  /**
   * Baixa um arquivo e o salva no caminho especificado
   * @param url URL do arquivo para baixar
   * @param filePath Caminho onde salvar o arquivo
   */
  private async downloadFile(url: string, filePath: string): Promise<void> {
    try {
      await FileSystem.downloadAsync(url, filePath);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }

  /**
   * Limpa o cache se ele exceder o tamanho máximo
   */
  private async cleanCacheIfNeeded(): Promise<void> {
    try {
      const cacheSize = await this.getCacheSize();
      
      if (cacheSize > this.maxCacheSize) {
        console.log(`Cache excede o tamanho máximo (${cacheSize} bytes). Limpando...`);
        await this.clearOldestFiles();
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Obtém o tamanho total do cache em bytes
   * @returns Tamanho total do cache em bytes
   */
  private async getCacheSize(): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(this.cacheDirectory) as CacheFileInfo;
      return fileInfo.size || 0;
    } catch (error) {
      console.error('Erro ao obter tamanho do cache:', error);
      return 0;
    }
  }

  /**
   * Limpa os arquivos mais antigos do cache
   */
  private async clearOldestFiles(): Promise<void> {
    try {
      // Listar todos os arquivos do diretório de cache
      const files = await FileSystem.readDirectoryAsync(this.cacheDirectory);
      
      // Obter detalhes de cada arquivo para ordenar por data
      const fileDetails = await Promise.all(
        files.map(async (fileName) => {
          const filePath = `${this.cacheDirectory}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath) as CacheFileInfo;
          return {
            name: fileName,
            path: filePath,
            modificationTime: fileInfo.modificationTime || 0,
            size: fileInfo.size || 0
          };
        })
      );
      
      // Ordenar pelo mais antigo primeiro
      fileDetails.sort((a, b) => a.modificationTime - b.modificationTime);
      
      // Remover arquivos até que o cache esteja abaixo de 70% do tamanho máximo
      const targetSize = this.maxCacheSize * 0.7;
      let currentSize = await this.getCacheSize();
      
      for (const file of fileDetails) {
        if (currentSize <= targetSize) break;
        
        await FileSystem.deleteAsync(file.path);
        currentSize -= file.size;
        
        // Remover da cache em memória
        const urlKeys = Object.keys(this.inMemoryCache);
        for (const key of urlKeys) {
          if (this.inMemoryCache[key] === file.path) {
            delete this.inMemoryCache[key];
            break;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar arquivos antigos:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  public async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.cacheDirectory);
      await this.initCache();
      this.inMemoryCache = {};
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Pré-carrega uma lista de URLs na cache
   * @param urls Lista de URLs para pré-carregar
   * @returns Array de caminhos locais
   */
  public async preloadFiles(urls: string[]): Promise<string[]> {
    const results = await Promise.all(
      urls.map(url => this.getFileFromCache(url))
    );
    return results;
  }
}

// Exporta uma instância do CacheManager para uso fácil
export const cacheManager = CacheManager.getInstance();

/**
 * Obtém uma URL de imagem com cache, utilizando o CacheManager
 * @param url URL da imagem
 * @returns Caminho para a imagem em cache ou a URL original
 */
export async function getCachedImagePath(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) {
    return url; // Retorna URLs de dados (data:) diretamente
  }

  try {
    // No iOS, as imagens trabalham melhor com file://
    // No Android, retorna o caminho direto
    const cachePath = await cacheManager.getFileFromCache(url);
    return Platform.OS === 'ios' ? cachePath.replace('file:/', 'file:///') : cachePath;
  } catch (error) {
    console.error('Erro ao obter imagem em cache:', error);
    return url;
  }
}

/**
 * Hook de cache útil para componentes React
 */
export const ImageCache = {
  // Obtém uma imagem em cache
  get: getCachedImagePath,
  
  // Obtém a instância do gerenciador de cache
  getManager: () => cacheManager,
  
  // Limpa todo o cache
  clearCache: () => cacheManager.clearCache(),
  
  // Pré-carrega múltiplas imagens
  preloadImages: (urls: string[]) => cacheManager.preloadFiles(urls)
}; 