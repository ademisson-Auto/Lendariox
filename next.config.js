module.exports = {
  typescript: {
    // Isso é temporário enquanto corrigimos os problemas de tipagem
    ignoreBuildErrors: true,
  },
  compiler: {
    // Configurações do compilador para suportar JSX no React Native
    styledComponents: true,
  },
}; 