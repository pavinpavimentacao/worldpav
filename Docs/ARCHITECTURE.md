# Arquitetura do Projeto WorldPav

## Visão Geral
Este documento descreve a arquitetura e organização do projeto WorldPav, um sistema de gestão de obras de pavimentação.

## Estrutura de Diretórios

### 📁 `/src` - Código Fonte
- **`/components`** - Componentes React organizados por módulo
  - `/ui` - Componentes de interface reutilizáveis
  - `/shared` - Componentes compartilhados
  - `/obras` - Componentes específicos de obras
  - `/financial` - Componentes financeiros
  - `/colaboradores` - Componentes de colaboradores
  - `/maquinarios` - Componentes de maquinários
  - `/controle-diario` - Componentes de controle diário
- **`/pages`** - Páginas da aplicação
- **`/lib`** - Bibliotecas e APIs
- **`/types`** - Definições de tipos TypeScript
- **`/utils`** - Utilitários e funções auxiliares
- **`/hooks`** - Custom React hooks
- **`/mocks`** - Dados mock para desenvolvimento

### 📁 `/docs` - Documentação
- **`/architecture`** - Documentação de arquitetura
- **`/database`** - Documentação de banco de dados
- **`/deployment`** - Guias de deploy
- **`/development`** - Guias de desenvolvimento
- **`/features`** - Documentação de funcionalidades
- **`/troubleshooting`** - Guias de resolução de problemas
- **`/api`** - Documentação da API

### 📁 `/scripts` - Scripts e Automação
- **`/database`** - Scripts de banco de dados e migrações
- **`/maintenance`** - Scripts de manutenção
- **`/utilities`** - Scripts utilitários
- **`/debug`** - Scripts de debug
- **`/deployment`** - Scripts de deploy
- **`/setup`** - Scripts de configuração
- **`/testing`** - Scripts de teste

### 📁 `/db` - Banco de Dados
- **`/migrations`** - Migrações do banco de dados

### 📁 `/supabase` - Configuração Supabase
- **`/functions`** - Edge Functions

## Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Edge Functions** - Serverless functions

### Ferramentas de Desenvolvimento
- **ESLint** - Linting
- **Prettier** - Formatação de código
- **Playwright** - Testes E2E

## Padrões de Desenvolvimento

### Estrutura de Componentes
```
src/components/[modulo]/
├── ComponentName.tsx
├── ComponentName.test.tsx
└── index.ts
```

### Estrutura de Páginas
```
src/pages/[modulo]/
├── PageName.tsx
├── components/
└── hooks/
```

### Estrutura de APIs
```
src/lib/
├── [modulo]Api.ts
├── types.ts
└── utils.ts
```

## Convenções de Nomenclatura

### Arquivos
- **Componentes**: PascalCase (ex: `UserProfile.tsx`)
- **Páginas**: PascalCase (ex: `ObrasList.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useAuth.ts`)
- **Utilitários**: camelCase (ex: `formatCurrency.ts`)
- **Tipos**: PascalCase (ex: `User.ts`)

### Variáveis e Funções
- **camelCase** para variáveis e funções
- **PascalCase** para componentes e tipos
- **UPPER_CASE** para constantes

## Organização de Documentação

### Por Categoria
- **Architecture**: Documentação de arquitetura e design
- **Database**: Guias de banco de dados e migrações
- **Deployment**: Instruções de deploy
- **Development**: Guias de desenvolvimento
- **Features**: Documentação de funcionalidades
- **Troubleshooting**: Resolução de problemas

### Convenções de Nomenclatura de Docs
- **IMPLEMENTACAO_[MODULO].md** - Documentação de implementação
- **CORRECAO_[PROBLEMA].md** - Documentação de correções
- **TROUBLESHOOTING_[PROBLEMA].md** - Guias de resolução
- **SETUP_[SERVICO].md** - Guias de configuração

## Scripts Organizados

### Database Scripts
- Migrações SQL
- Scripts de correção de dados
- Scripts de verificação de integridade

### Maintenance Scripts
- Scripts de backup
- Scripts de limpeza
- Scripts de manutenção

### Utilities Scripts
- Scripts de desenvolvimento
- Scripts de build
- Scripts de teste

## Próximos Passos

1. **Documentação de API**: Completar documentação das APIs
2. **Testes**: Implementar testes automatizados
3. **CI/CD**: Configurar pipeline de integração contínua
4. **Monitoramento**: Implementar logs e métricas
5. **Performance**: Otimizações de performance

---

*Última atualização: 24/10/2025*
