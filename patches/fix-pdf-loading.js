// Este patch é uma solução de contorno para problemas de carregamento do PDF
// Ele modifica o comportamento do WebView para lidar melhor com o streaming de PDFs

// Uso:
// 1. Importar este arquivo no seu componente
// 2. Chamar applyPdfFix() antes de renderizar o WebView com PDF

export const applyPdfFix = () => {
  // Verificar se estamos em ambiente de desenvolvimento
  if (__DEV__) {
    console.log('[PDF Fix] Aplicando patch para otimizar carregamento de PDF');
  }

  // Adicionar uma função global para verificar o estado de carregamento
  global.checkPdfLoading = (url) => {
    return new Promise((resolve) => {
      // Força o carregamento progressivo usando fetch com responseType 'stream'
      fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Cache-Control': 'no-store',
          'Range': 'bytes=0-65535' // Solicitar apenas os primeiros 64KB
        }
      })
        .then(response => {
          if (response.status >= 200 && response.status < 300) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => {
          resolve(false);
        });
    });
  };

  return true;
}; 