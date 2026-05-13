# RecruteiEduca - Sistema de Gestão de Cursos

Uma plataforma completa de educação corporativa construída com React, TypeScript, Vite e Supabase.

## 🚀 Funcionalidades

### Sistema de Convites (Acesso Exclusivo)
- **Acesso restrito**: Apenas usuários convidados podem se cadastrar
- **Convites por e-mail**: Administradores enviam convites personalizados
- **Definição de papéis**: Estudante ou Administrador
- **Validade de 7 dias**: Links expiram automaticamente
- **Integração com Supabase**: E-mails enviados via Edge Functions

### Gestão de Usuários
- **Criação via convite**: Administradores convidam usuários por e-mail
- **Papéis definidos**: Estudante e Administrador
- **Perfis completos**: Nome, e-mail, empresa, papel
- **Status de usuários**: Ativo/Inativo

### Plataforma de Cursos
- **Cursos organizados**: Por categorias e formações
- **Sistema de aulas**: Vídeos, materiais e progresso
- **Certificações**: Reconhecimento de conclusão
- **Dashboard administrativo**: Gestão completa da plataforma

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Zustand com persistência
- **UI**: Componentes customizados + Tailwind CSS
- **Roteamento**: React Router
- **Animações**: Framer Motion
- **Notificações**: Sonner

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Modal, etc.)
│   └── TipTapEditor.tsx # Editor de texto rico
├── pages/              # Páginas da aplicação
│   ├── auth/           # Autenticação
│   │   ├── Login.tsx
│   │   ├── InviteSetup.tsx    # Configuração via convite
│   │   └── CompleteProfile.tsx
│   ├── admin/          # Painel administrativo
│   │   ├── UserManagement.tsx # Gestão de usuários
│   │   └── CourseManagement.tsx
│   └── student/        # Área do estudante
├── stores/             # Gerenciamento de estado
│   ├── authStore.ts    # Autenticação e usuários
│   └── dataStore.ts    # Dados da aplicação
├── lib/                # Utilitários
│   └── supabase.ts     # Cliente Supabase
└── types/              # Definições TypeScript
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Supabase CLI
- Conta no Supabase

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd recruteieduca
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Supabase**
   ```bash
   # Login no Supabase
   supabase login

   # Link com seu projeto
   supabase link --project-ref your-project-ref

   # Execute as migrações
   supabase db push
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env

   # Edite com suas credenciais
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Execute as Edge Functions**
   ```bash
   # Deploy das funções
   node deploy-functions.js

   # Ou manualmente
   supabase functions deploy send_invite
   supabase functions deploy send_email
   ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 📧 Sistema de Convites

### Como Funciona

1. **Administrador convida usuário**:
   - Acesse `/admin/users`
   - Clique em "Convidar Usuário"
   - Preencha: e-mail, empresa, papel (estudante/admin)
   - Sistema gera link único e envia e-mail

2. **Usuário recebe convite**:
   - E-mail com link personalizado
   - Link válido por 7 dias
   - Informações da empresa e papel

3. **Usuário configura conta**:
   - Clica no link: `/invite/{token}`
   - Define nome e senha
   - Conta é criada automaticamente
   - Redirecionado para dashboard

### Edge Functions

- **`send_invite`**: Envia e-mails de convite
- **`send_email`**: Função base para envio de e-mails

## 🔐 Autenticação

- **Login tradicional**: E-mail + senha
- **Sistema de convites**: Acesso exclusivo via convite
- **JWT tokens**: Gerenciados pelo Supabase
- **Perfis de usuário**: Armazenados na tabela `profiles`

## 📊 Banco de Dados

### Tabelas Principais

- **`profiles`**: Perfis dos usuários
- **`courses`**: Cursos disponíveis
- **`lessons`**: Aulas dos cursos
- **`user_progress`**: Progresso dos estudantes
- **`categories`**: Categorias dos cursos

### Políticas RLS

O Supabase utiliza Row Level Security para controle de acesso:
- Usuários só veem seus próprios dados
- Administradores têm acesso completo
- Convites são validados por token

## 🎨 UI/UX

- **Design System**: Componentes consistentes
- **Responsivo**: Mobile-first approach
- **Tema escuro**: Suporte completo
- **Animações suaves**: Framer Motion
- **Feedback visual**: Toasts e loading states

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Deploy das funções Supabase
node deploy-functions.js

# Lint do código
npm run lint
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato com a equipe de desenvolvimento ou abra uma issue no GitHub.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
