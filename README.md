# 🚀 TaskFlow — Gerenciador Inteligente de Tarefas

> Aplicativo web moderno, responsivo e de alta performance para gerenciamento de tarefas pessoais e profissionais, desenvolvido com **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite** e backend integrado com **Supabase** (Autenticação, Banco PostgreSQL e Row Level Security).

---

## 🌟 Principais Funcionalidades

### 🔐 1. Autenticação & Perfis de Usuário (Supabase Auth)
- **Login e Cadastro**: Interface com glassmorphism para entrada rápida e criação de contas com medidor de força de senha em tempo real.
- **Recuperação de Senha**: Envio de links seguros de redefinição de senha por e-mail.
- **Multi-tenant / Isolamento de Dados**: Cada usuário possui seu próprio perfil (`public.profiles`) e acessa exclusivamente suas próprias tarefas e categorias via **Row Level Security (RLS)** do PostgreSQL (`auth.uid() = user_id`).
- **Sessão Persistente & Logout**: Gerenciamento automático de tokens JWT e logout seguro.

### 📅 2. Visualização em Calendário Interativo
- **Grade Mensal Completa**: Distribuição visual das tarefas pelos dias do mês conforme o prazo de entrega.
- **Navegação Rápida**: Avançar/retroceder meses e botão **Hoje** para retorno imediato à data atual.
- **Pílulas de Tarefas**: Visualização colorida por categoria, indicador de prioridade urgente e tarefas fixadas.
- **Painel do Dia Selecionado**: Lista detalhada das tarefas da data com checkboxes para conclusão direta, edição e botão para adicionar nova tarefa com a data pré-preenchida.
- **Alternância Fluida**: Botão de alternância entre visão em **Lista** e visão em **Calendário** com contador dinâmico e atalho de teclado <kbd>C</kbd>.

### 📋 3. CRUD Completo de Tarefas & Subtarefas
- **Criação Rápida (Quick Add)**: Inserção ágil de tarefas por atalhos de data (*Hoje, Amanhã, +7 dias*) e seleção de categoria.
- **Criação Detalhada**: Modal completo com título, descrição, categoria, prioridade (*Baixa, Média, Alta, Urgente*), prazo e checklist de subtarefas.
- **Tarefas Fixadas (Pin)**: Destaque visual âmbar e prioridade no topo da listagem.
- **Subtarefas**: Checklist interativo com barra de progresso em tempo real e adição inline de novas subtarefas diretamente no card.
- **Exclusão Segura & Desfazer**: Modal de confirmação com suporte a **Toast Notification** e botão de **Desfazer (Undo)** para recuperação instantânea.

### 📊 4. Painel de Análises & Métricas (Dashboard)
- **KPIs em Tempo Real**: Métricas de produtividade, total de concluídas, pendentes, atrasadas e tarefas que vencem hoje.
- **Gráficos Proporcionais**: Distribuição por categorias e matriz de urgência/impacto por prioridade.

### 🎨 5. Design Premium & Acessibilidade
- **Modo Claro / Modo Escuro (Light/Dark Mode)**: Cores balanceadas, sincronização com preferências do sistema operacional e transições suaves.
- **Atalhos de Teclado**:
  - <kbd>N</kbd>: Nova tarefa
  - <kbd>C</kbd>: Alternar entre Lista e Calendário
  - <kbd>/</kbd> ou <kbd>F</kbd>: Focar na busca
  - <kbd>D</kbd>: Alternar exibição do Dashboard
  - <kbd>Esc</kbd>: Fechar modais ativos
- **Totalmente Responsivo**: Otimizado para desktop, tablets e dispositivos móveis.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com `@tailwindcss/vite`
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, RLS)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Linter & Qualidade**: [Oxlint](https://oxc.rs/)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [npm](https://www.npmjs.com/) (gerenciador de pacotes)
- Projeto criado no [Supabase](https://supabase.com/)

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/fabiotoniati/fono-2605.git
cd fono-2605
```

### Passo 2: Instalar as Dependências
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```
Preencha as variáveis com os dados do seu projeto Supabase (disponíveis em *Project Settings > API*):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### Passo 4: Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`.

---

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento Vite com HMR.
- `npm run build`: Valida tipagem com TypeScript (`tsc`) e gera o bundle de produção otimizado em `dist/`.
- `npm run lint`: Executa a verificação estática de código com Oxlint.
- `npm run preview`: Executa localmente o build de produção gerado.

---

## 🔒 Arquitetura de Segurança (Supabase RLS)

Todas as tabelas do banco de dados utilizam **Row Level Security (RLS)**:
```sql
-- Políticas de acesso aplicadas:
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
```

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Sinta-se livre para usar e modificar.
