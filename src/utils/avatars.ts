/**
 * Avatares padrão para usuários
 */
const AVATAR_URLS = {
  DEFAULT: "https://ui-avatars.com/api/?background=random&name=User",
  // Avatar masculino
  MALE: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
  // Avatar feminino
  FEMALE: "https://img.freepik.com/free-psd/3d-illustration-person-with-pink-hair_23-2149436191.jpg",
  // Avatar neutro
  NEUTRAL: "https://img.freepik.com/free-psd/3d-illustration-person_23-2149436192.jpg",
  // Avatares temáticos
  BOOK_LOVER: "https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149334862.jpg",
  WRITER: "https://img.freepik.com/free-vector/hand-drawn-flat-design-typewriter-illustration_23-2149325763.jpg",
  // Avatares com base em iniciais (utilizando o serviço UI Avatars)
  getInitialsAvatar: (name: string, background = "FF4500", color = "FFFFFF") => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=${color}&bold=true`;
  },
  // Avatar aleatório do Pravatar (recebe um número ou ID para gerar diferentes imagens)
  getRandom: (id: string | number = Math.floor(Math.random() * 1000)) => {
    return `https://i.pravatar.cc/300?img=${id}`;
  }
};

export default AVATAR_URLS; 