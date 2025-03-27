// Exportações das imagens do onboarding

// NOTA IMPORTANTE: LINKS PARA IMAGENS DE ALTA QUALIDADE SEM FUNDO
// ---------------------------------------------------------------
// Slide 1 (Biblioteca): https://pngimg.com/uploads/book/book_PNG51090.png
// Slide 2 (Leitura): https://www.pngmart.com/files/7/Reading-Book-PNG-Free-Download.png
// Slide 3 (Anotações): https://www.pngmart.com/files/22/Bookmark-PNG-Transparent.png
// Slide 4 (Progresso): https://www.pngmart.com/files/7/Progress-Bar-PNG-Transparent-Image.png
// Slide 5 (Comunidade): https://www.freepnglogos.com/uploads/anime-png/anime-png-manga-transparent-0.png
//
// Instruções:
// 1. Baixe manualmente as imagens dos links acima
// 2. Salve na pasta assets/onboarding/ com os nomes: slide1.png, slide2.png, etc.
// 3. Descomente as linhas de import abaixo e comente as antigas

// Usando as imagens existentes no projeto por enquanto
export const onboardingImages = [
  require('../../../assets/adaptive-icon.png'), // Temporário: Substitua por slide1.png
  require('../../../assets/icon.png'),          // Temporário: Substitua por slide2.png
  require('../../../assets/splash-icon.png'),   // Temporário: Substitua por slide3.png
  require('../../../assets/favicon.png'),       // Temporário: Substitua por slide4.png
  require('../../../assets/adaptive-icon.png'), // Temporário: Substitua por slide5.png
];

// Quando você tiver baixado as imagens, descomente estas linhas:
/*
export const onboardingImages = [
  require('../../../assets/onboarding/slide1.png'), // Imagem de biblioteca digital
  require('../../../assets/onboarding/slide2.png'), // Imagem de leitura personalizada
  require('../../../assets/onboarding/slide3.png'), // Imagem de marcadores e anotações
  require('../../../assets/onboarding/slide4.png'), // Imagem de progresso de leitura
  require('../../../assets/onboarding/slide5.png'), // Imagem de comunidade de leitores/anime
];
*/

// Textos e descrições temáticos para cada slide (aplicativo de leitura com toque de anime)
export const onboardingData = [
  {
    title: "Sua biblioteca de mangás e livros",
    description: "Acesse todos os seus mangás, light novels e livros favoritos em um só lugar, com uma interface intuitiva e organizada.",
  },
  {
    title: "Leitura personalizada ao seu estilo",
    description: "Ajuste o layout, modo de leitura (vertical ou horizontal) e cores para a melhor experiência com seu conteúdo favorito.",
  },
  {
    title: "Marque seus momentos favoritos",
    description: "Salve cenas épicas, frases memoráveis e momentos emocionantes para revisitar ou compartilhar depois.",
  },
  {
    title: "Acompanhe sua jornada de leitura",
    description: "Visualize seu progresso em cada série, receba recomendações baseadas no seu gosto e nunca perca onde parou.",
  },
  {
    title: "Conecte-se com outros fãs",
    description: "Discuta teorias, compartilhe opiniões e descubra novas recomendações na comunidade de leitores e otakus.",
  },
]; 