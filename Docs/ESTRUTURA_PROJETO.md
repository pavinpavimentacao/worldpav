# 📂 Estrutura do Projeto WorldPav

Este documento descreve a organização completa do projeto WorldPav.

## 📁 Estrutura de Diretórios

```
Worldpav/
├── 📄 README.md                    # Documentação principal
├── 📄 package.json                 # Dependências e scripts
├── 📄 tsconfig.json                # Configuração TypeScript
├── 📄 vite.config.ts              # Configuração Vite
├── 📄 tailwind.config.js          # Configuração TailwindCSS
├── 📄 postcss.config.js           # Configuração PostCSS
│
├── 📁 src/                        # Código fonte
│   ├── 📁 components/             # Componentes React organizados
│   │   ├── 📁 cards/             # Componentes de card
│   │   ├── 📁 colaboradores/     # Componentes de colaboradores
│   │   ├── 📁 controle-diario/   # Controle diário
│   │   ├── 📁 dashboard/         # Dashboard components
│   │   ├── 📁 exports/           # Exportação de dados
│   │   ├── 📁 financial/         # Componentes financeiros
│   │   ├── 📁 forms/             # Formulários
│   │   ├── 📁 guardas/           # Sistema de guardas
│   │   ├── 📁 inputs/            # Inputs customizados
│   │   │   └── 📁 validation/    # Inputs com validação
│   │   ├── 📁 layout/            # Layout e navegação
│   │   │   └── 📁 mobile/       # Componentes mobile
│   │   ├── 📁 maquinarios/       # Gestão de equipamentos
│   │   ├── 📁 modals/            # Componentes modais
│   │   ├── 📁 notas-fiscais/     # Notas fiscais
│   │   ├── 📁 obras/             # Componentes de obras
│   │   ├── 📁 parceiros/         # Gestão de parceiros
│   │   ├── 📁 programacao/       # Programação
│   │   ├── 📁 recebimentos/      # Recebimentos
│   │   ├── 📁 relatorios/        # Relatórios
│   │   ├── 📁 relatorios-diarios/ # Relatórios diários
│   │   ├── 📁 shared/            # Componentes compartilhados
│   │   ├── 📁 ui/                # Componentes UI base
│   │   └── 📄 index.ts          # Barrel export
│   │
│   ├── 📁 config/                # Configurações do app
│   │   ├── 📄 manifest.json      # PWA manifest
│   │   ├── 📄 mock-config.ts     # Configuração de mocks
│   │   ├── 📄 netlify.toml       # Config Netlify
│   │   ├── 📄 timezone-setup.ts  # Setup timezone
│   │   ├── 📄 timezone.ts        # Utilidades timezone
│   │   └── 📄 vercel.json        # Config Vercel
│   │
│   ├── 📁 hooks/                 # React Hooks customizados
│   │   ├── 📄 use-media-query.ts
│   │   ├── 📄 useSupabaseSubscription.ts
│   │   └── 📄 useViaCep.ts
│   │
│   ├── 📁 lib/                   # Bibliotecas e APIs
│   │   ├── 📄 api.ts            # API principal
│   │   ├── 📄 auth.tsx          # Autenticação
│   │   ├── 📄 auth-hooks.ts     # Hooks de auth
│   │   ├── 📄 dashboard-api.ts   # API dashboard
│   │   ├── 📄 financialApi.ts    # API financeira
│   │   ├── 📄 jwt-auth-service.ts # Serviço JWT
│   │   ├── 📄 obrasFinanceiroApi.ts # API obras
│   │   ├── 📄 programacao-api.ts # API programação
│   │   ├── 📄 supabase.ts       # Cliente Supabase
│   │   ├── 📄 toast-hooks.ts    # Notificações toast
│   │   └── 📄 viacep-api.ts     # Integração ViaCEP
│   │
│   ├── 📁 mocks/                 # Dados mock para desenvolvimento
│   │   ├── 📄 colaboradores-mock.ts
│   │   ├── 📄 contas-pagar-mock.ts
│   │   ├── 📄 guardas-mock.ts
│   │   ├── 📄 programacao-pavimentacao-mock.ts
│   │   └── 📄 index.ts
│   │
│   ├── 📁 pages/                 # Páginas da aplicação
│   │   ├── 📁 auth/             # Páginas de autenticação
│   │   ├── 📁 colaboradores/     # Páginas de colaboradores
│   │   ├── 📁 contas-pagar/      # Contas a pagar
│   │   ├── 📁 financial/         # Páginas financeiras
│   │   ├── 📁 guardas/           # Sistema de guardas
│   │   ├── 📁 maquinarios/       # Gestão de equipamentos
│   │   ├── 📁 obras/             # Gestão de obras
│   │   ├── 📁 programacao/       # Programação
│   │   ├── 📁 recebimentos/      # Recebimentos
│   │   └── 📁 reports/           # Relatórios
│   │
│   ├── 📁 routes/                # Configuração de rotas
│   │   └── 📄 index.tsx
│   │
│   ├── 📁 services/              # Serviços externos
│   │   └── 📄 colaborador-storage.ts
│   │
│   ├── 📁 styles/                # Estilos globais
│   │   ├── 📄 globals.css
│   │   └── 📄 print.css
│   │
│   ├── 📁 types/                 # TypeScript types
│   │   ├── 📄 colaboradores.ts
│   │   ├── 📄 contas-pagar.ts
│   │   ├── 📄 financial.ts
│   │   ├── 📄 obras-financeiro.ts
│   │   └── 📄 programacao.ts
│   │
│   ├── 📁 utils/                 # Utilitários
│   │   ├── 📄 date-utils.ts
│   │   ├── 📄 format.ts
│   │   └── 📄 pdf-utils.ts
│   │
│   ├── 📄 main.tsx              # Entry point
│   └── 📄 vite-env.d.ts         # Tipos Vite
│
├── 📁 db/                        # Banco de dados
│   └── 📁 migrations/            # Migrações SQL
│       ├── 📄 create_contas_pagar.sql
│       ├── 📄 create_guardas_sistema.sql
│       ├── 📄 create_obras_financeiro.sql
│       ├── 📄 create_programacao_pavimentacao.sql
│       └── 📄 README_*.md       # Docs de cada migração
│
├── 📁 docs/                      # Documentação
│   ├── 📄 README.md             # Índice da documentação
│   ├── 📁 features/             # Docs de funcionalidades
│   │   ├── 📄 CONTAS_PAGAR_IMPLEMENTADO.md
│   │   ├── 📄 FINANCEIRO_CONSOLIDADO_WORLDPAV.md
│   │   └── ...
│   ├── 📁 setup/                # Guias de setup
│   ├── 📁 archived/             # Documentação obsoleta
│   └── 📁 Docs/                 # Docs técnicos detalhados
│       ├── 📁 api/              # Documentação de APIs
│       ├── 📁 architecture/      # Arquitetura
│       ├── 📁 changelog/         # Histórico de mudanças
│       ├── 📁 development/       # Guias de desenvolvimento
│       └── 📁 troubleshooting/   # Solução de problemas
│
├── 📁 public/                    # Arquivos estáticos
│   ├── 📄 _redirects           # Netlify redirects
│   ├── 📄 icon.svg             # Ícone principal
│   ├── 📄 manifest.json        # PWA manifest
│   ├── 📄 sw.js                # Service Worker
│   └── 📁 icons/               # Ícones PWA
│
├── 📁 scripts/                   # Scripts auxiliares
│   ├── 📁 debug/               # Scripts de debug
│   ├── 📁 deployment/          # Scripts de deploy
│   ├── 📁 setup/               # Scripts de setup
│   └── 📁 testing/             # Scripts de teste
│
├── 📁 supabase/                  # Supabase configuration
│   └── 📁 functions/            # Edge Functions
│
└── 📁 tests/                     # Testes (a implementar)
```

## 🎯 Princípios de Organização

### 1. **Componentes por Funcionalidade**
Os componentes estão organizados por feature/módulo:
- `colaboradores/` - Tudo relacionado a colaboradores
- `financial/` - Componentes financeiros
- `obras/` - Componentes de obras
- etc.

### 2. **Componentes Compartilhados**
Componentes reutilizáveis ficam em pastas específicas:
- `shared/` - Componentes genéricos
- `ui/` - Componentes de UI base
- `inputs/` - Inputs customizados
- `cards/` - Cards reutilizáveis
- `modals/` - Modais genéricos

### 3. **Separação de Concerns**
- `lib/` - Lógica de negócio e APIs
- `hooks/` - Lógica reutilizável com hooks
- `utils/` - Funções utilitárias puras
- `types/` - Definições de tipos TypeScript
- `services/` - Integrações externas

### 4. **Documentação Organizada**
- `docs/features/` - Docs de funcionalidades prontas
- `docs/setup/` - Guias de instalação
- `docs/archived/` - Docs históricos
- `docs/Docs/` - Documentação técnica detalhada

## 📝 Convenções de Nomenclatura

### Arquivos
- **Componentes**: `PascalCase.tsx` (ex: `ColaboradorForm.tsx`)
- **Hooks**: `camelCase.ts` com prefixo `use` (ex: `useAuth.ts`)
- **Utils**: `kebab-case.ts` (ex: `date-utils.ts`)
- **Types**: `kebab-case.ts` (ex: `contas-pagar.ts`)
- **APIs**: `camelCase.ts` com sufixo `Api` (ex: `financialApi.ts`)

### Pastas
- **Features**: `kebab-case` (ex: `contas-pagar/`)
- **Componentes**: `PascalCase` ou `kebab-case` (ex: `NovaObra/` ou `nova-obra/`)

### Exports
- Use **barrel exports** (`index.ts`) para facilitar imports
- Exemplo: `import { Button, Badge } from '@/components'`

## 🔄 Fluxo de Dados

```
Pages → Components → Hooks → APIs → Supabase
  ↓         ↓          ↓       ↓
Types ←  Validation ← Utils ← Config
```

## 🎨 Estrutura de Componentes

### Componente Típico
```tsx
// Imports
import React from 'react'
import { useNavigate } from 'react-router-dom'

// Types
import type { MyType } from '@/types'

// Components
import { Button, Card } from '@/components'

// Hooks
import { useAuth } from '@/hooks'

// Utils
import { formatDate } from '@/utils'

// Component
export function MyComponent() {
  // Hooks
  // States
  // Effects
  // Handlers
  // Render
}
```

## 🚀 Onde Adicionar Novo Código

### Novo Componente
- **Específico**: `src/components/{feature}/`
- **Genérico**: `src/components/shared/`
- **UI Base**: `src/components/ui/`

### Nova API
- `src/lib/{feature}Api.ts`

### Novo Hook
- `src/hooks/use{Name}.ts`

### Novo Type
- `src/types/{feature}.ts`

### Nova Página
- `src/pages/{feature}/`

### Nova Migração
- `db/migrations/{description}.sql`
- Adicione README: `db/migrations/README_{FEATURE}.md`

## 📦 Barrel Exports

Use barrel exports para simplificar imports:

```typescript
// src/components/index.ts
export * from './shared'
export * from './inputs'
export * from './cards'
// ...

// Usage
import { Button, Card, Input } from '@/components'
```

## 🎯 Boas Práticas

1. **Mantenha componentes pequenos e focados**
2. **Use TypeScript para tudo**
3. **Documente código complexo**
4. **Crie hooks para lógica reutilizável**
5. **Separe lógica de apresentação**
6. **Use barrel exports**
7. **Mantenha a estrutura consistente**
8. **Documente mudanças significativas**

---

*Esta estrutura foi projetada para escalar e facilitar a manutenção do projeto.*






