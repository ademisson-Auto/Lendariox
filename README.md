<div align="center">
  <img src="assets/icon.png" alt="Lendariox Logo" width="120" />
  
  # 📚 LENDARIOX
  
  **Aplicativo completo de leitura de ebooks para React Native**
  
  *Biblioteca digital moderna com suporte a PDF/EPUB, anotações e sincronização offline*
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.76.7-blue.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
  [![Expo](https://img.shields.io/badge/Expo-52.0.41-black.svg)](https://expo.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
  
  [📱 Demo](#-demonstração) • [⚡ Instalação](#-instalação-rápida) • [🚀 Deploy](#-deploy) • [📖 Documentação](#-documentação)
  
</div>

## 🎯 Características Principais

<table>
  <tr>
    <td>📱</td>
    <td><strong>Plataforma Móvel</strong></td>
    <td>Desenvolvido com React Native para iOS e Android</td>
  </tr>
  <tr>
    <td>📚</td>
    <td><strong>Multi-formato</strong></td>
    <td>Suporte completo a PDF e EPUB</td>
  </tr>
  <tr>
    <td>🔒</td>
    <td><strong>Segurança</strong></td>
    <td>Autenticação via Supabase e armazenamento seguro</td>
  </tr>
  <tr>
    <td>🔄</td>
    <td><strong>Offline-first</strong></td>
    <td>Funciona perfeitamente offline com sincronização automática</td>
  </tr>
  <tr>
    <td>⚡</td>
    <td><strong>Performance</strong></td>
    <td>Streaming progressivo e cache inteligente</td>
  </tr>
  <tr>
    <td>🎨</td>
    <td><strong>UX Moderna</strong></td>
    <td>Interface intuitiva com animações fluidas</td>
  </tr>
</table>

## 📱 Demonstração

> **Nota:** Screenshots e demo em vídeo serão adicionados em breve!

## 🚀 Sobre o Projeto

Lendariox é uma plataforma completa para leitura de e-books que oferece uma experiência personalizada e intuitiva para leitores. O aplicativo permite gerenciar sua biblioteca digital, acompanhar seu progresso de leitura e acessar seus livros favoritos em qualquer lugar.

## 🚀 Stack Tecnológico

### Frontend & Mobile
```
📱 React Native 0.76.7    - Framework mobile nativo
⚡ Expo 52.0.41            - Plataforma de desenvolvimento
🔷 TypeScript 5.8.2       - Tipagem estática
🧭 React Navigation 7.0   - Navegação entre telas
🎨 Reanimated 3.16.1       - Animações de alta performance
```

### Backend & Dados
```
🔋 Supabase                - Backend-as-a-Service
🔐 Supabase Auth          - Autenticação segura
💾 PostgreSQL             - Banco de dados relacional
📁 Expo File System       - Cache local e gerenciamento de arquivos
```

### Leitura & Documentos
```
📄 React Native PDF       - Renderização de PDF nativo
📚 EPUB Support           - Suporte completo a ebooks EPUB
🔖 Streaming Progressive   - Carregamento inteligente
```

### UX & Interface
```
🎨 Lottie                  - Animações vectoriais
🔒 Expo Secure Store      - Armazenamento criptografado
🔄 Expo Updates           - Atualizações OTA
🌈 Linear Gradient        - Gradientes modernos
```

## Funcionalidades

### Autenticação e Perfil de Usuário
- Login e registro com email/senha
- Perfil de usuário personalizável
- Recuperação de senha

### Biblioteca Digital
- Catálogo de livros organizado
- Visualização de capas e informações detalhadas
- Organização de livros por categorias
- Pesquisa avançada de títulos

### Leitura de Documentos
- Suporte para PDF com streaming progressivo
- Leitor de EPUB com múltiplas opções de personalização
- Marcadores e anotações
- Múltiplos temas de leitura (claro, escuro, sépia)
- Ajuste de tamanho de fonte e espaçamento

### Progresso de Leitura
- Acompanhamento automático de páginas lidas
- Continuação de leitura do ponto onde parou
- Estatísticas de leitura

### Experiência do Usuário
- Interface moderna e intuitiva
- Modo de leitura otimizado para diferentes dispositivos
- Suporte para notificações
- Animações fluidas
- Tutorial interativo para novos usuários (onboarding)

## Estrutura do Projeto

```
src/
├── assets/            # Imagens e recursos estáticos
├── components/        # Componentes reutilizáveis
├── config/            # Configurações do aplicativo
├── constants/         # Constantes e valores fixos
├── contexts/          # Contextos React (Auth, Books, etc)
├── hooks/             # Custom hooks
├── navigation/        # Configuração de rotas e navegação
├── screens/           # Telas do aplicativo
├── services/          # Serviços de API e backend
├── theme/             # Tema global e estilização
├── types/             # Tipos TypeScript
└── utils/             # Utilitários e funções auxiliares
```

## Estrutura de Banco de Dados

O aplicativo utiliza o Supabase como backend com as seguintes tabelas:

- `profiles`: Informações dos usuários
- `books`: Armazena informações dos livros
- `reading_progress`: Rastreia o progresso de leitura dos usuários
- `user_preferences`: Preferências de usuário
- `bookmarks`: Marcadores de páginas
- `annotations`: Anotações de leitura
- `notifications`: Sistema de notificações

## ⚡ Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/ademisson-Auto/Lendariox.git
cd Lendariox

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o projeto
npx expo start
```

### 📝 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI global: `npm install -g @expo/cli`
- Conta no [Supabase](https://supabase.com) (gratuita)
- Expo Go app no seu dispositivo (para testes)

## Desenvolvimento

```bash
# Limpar cache do Metro
npm run clear-metro

# Executar no Android
npm run android

# Executar no iOS
npm run ios

# Executar na Web
npm run web
```

## Deploy automático

Este projeto está configurado para deploy automático no Expo via GitHub Actions usando EAS Update. Cada vez que um código é enviado para a branch principal (main ou master), o workflow é acionado para publicar automaticamente uma atualização.

### Requisitos para o deploy automático

1. Adicione um segredo chamado `EXPO_TOKEN` no seu repositório GitHub:
   - Acesse sua conta Expo e gere um token: https://expo.dev/settings/access-tokens
   - Adicione o token em Configurações > Secrets > Actions do seu repositório GitHub

2. Autenticação com Expo CLI:
   ```bash
   # Autenticar localmente com sua conta Expo
   npx expo login
   ```

3. Para fazer deploy manual:
   ```bash
   # Publicar uma atualização com EAS Update
   npx eas update --message "Descrição da atualização"
   ```

4. Para construir um APK ou IPA:
   ```bash
   # Construir para preview (APK para Android)
   npx eas build --platform android --profile preview
   
   # Construir para produção
   npx eas build --platform all
   ```

## 🛣️ Roadmap

### 🕰️ Próximas Atualizações

- [ ] 📸 **Screenshots & Demo** - Adicionar imagens e vídeo demonstrativo
- [ ] 🌍 **Internacionalização** - Suporte a múltiplos idiomas
- [ ] 🔍 **Busca Avançada** - Busca por conteúdo dentro dos livros
- [ ] 📈 **Analytics** - Estatísticas avançadas de leitura
- [ ] 🎙️ **Audiobooks** - Suporte a livros em áudio
- [ ] 🚀 **Performance** - Otimizações e melhorias

### 💡 Ideias Futuras

- 🤝 **Social** - Compartilhamento e recomendações
- 🎨 **Temas** - Personalização avançada de interface
- ☁️ **Sincronização** - Backup na nuvem
- 🤖 **IA** - Recomendações inteligentes

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Aqui está como você pode ajudar:

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado nas [Issues](https://github.com/ademisson-Auto/Lendariox/issues)
2. Crie uma nova issue com detalhes do problema
3. Inclua screenshots e informações do dispositivo

### ✨ Sugerir Melhorias
1. Abra uma issue com o label `enhancement`
2. Descreva detalhadamente sua ideia
3. Explique por que seria útil

### 📝 Contribuir com Código
1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📋 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  
  **📚 Lendariox - Transformando a leitura digital**
  
  Desenvolvido com ❤️ por [Ademisson](https://github.com/ademisson-Auto)
  
  [![GitHub](https://img.shields.io/badge/GitHub-ademisson--Auto-black?logo=github)](https://github.com/ademisson-Auto)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/ademisson)
  
  **Se este projeto te ajudou, deixe uma ⭐!**
  
</div>
