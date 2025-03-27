# LENDARIOX

Aplicativo de leitura de ebooks com funcionalidades de biblioteca digital, marcação de progresso e visualização de PDF.

## Tecnologias

- React Native
- Expo
- Supabase (autenticação e banco de dados)
- TypeScript

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npx expo start
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

## Estrutura de Banco de Dados

O aplicativo utiliza o Supabase como backend com as seguintes tabelas:

- `books`: Armazena informações dos livros
- `reading_progress`: Rastreia o progresso de leitura dos usuários

## Funcionalidades

- Visualização de livros em formato PDF
- Acompanhamento de progresso de leitura
- Navegação entre páginas
- Carregamento progressivo de PDFs (streaming)
- Modo de leitura otimizado para dispositivos móveis 