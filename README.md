# LENDARIOX

Aplicativo de leitura de ebooks com funcionalidades de biblioteca digital, marcação de progresso, visualização de PDF e EPUB.

<p align="center">
  <img src="assets/icon.png" alt="Logo Lendariox" width="150" />
</p>

## Sobre o Projeto

Lendariox é uma plataforma completa para leitura de e-books que oferece uma experiência personalizada e intuitiva para leitores. O aplicativo permite gerenciar sua biblioteca digital, acompanhar seu progresso de leitura e acessar seus livros favoritos em qualquer lugar.

## Tecnologias

- **Frontend:**
  - React Native 0.76.7
  - Expo 52.0.41
  - TypeScript 5.8.2
  - React Navigation 7.0
  - Reanimated 3.16.1
  
- **Backend:**
  - Supabase (autenticação e banco de dados)
  - Expo File System para cache local
  
- **Visualização de Documentos:**
  - React Native PDF
  - Suporte para arquivos EPUB
  
- **Utilitários:**
  - Lottie para animações
  - Expo Secure Store para armazenamento seguro
  - Expo Updates para atualizações OTA
  - Linear Gradient para interfaces modernas

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

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npx expo start
```

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

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto está licenciado sob os termos da licença MIT. 