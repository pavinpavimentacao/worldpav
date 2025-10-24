# ⚡ Guia Rápido - WorldPav

Guia rápido para encontrar o que você precisa no projeto.

## 🔍 Onde Está o Quê?

### 📱 Preciso Alterar/Ver uma Página
```
src/pages/{modulo}/
```
Exemplo: `src/pages/colaboradores/ColaboradoresList.tsx`

### 🎨 Preciso Alterar/Ver um Componente
```
src/components/{categoria}/{Componente}.tsx
```

Exemplos:
- Card: `src/components/cards/DashboardCard.tsx`
- Modal: `src/components/modals/ConfirmDialog.tsx`
- Input: `src/components/inputs/CurrencyInput.tsx`
- Colaborador: `src/components/colaboradores/DocumentacaoTab.tsx`

### 📊 Preciso Ver/Alterar uma API
```
src/lib/{feature}Api.ts
```
Exemplos:
- `src/lib/financialApi.ts`
- `src/lib/obrasFinanceiroApi.ts`
- `src/lib/programacao-api.ts`

### 🗃️ Preciso Ver os Tipos/Interfaces
```
src/types/{feature}.ts
```
Exemplos:
- `src/types/colaboradores.ts`
- `src/types/financial.ts`
- `src/types/contas-pagar.ts`

### 🎯 Preciso Adicionar uma Nova Migração SQL
```
db/migrations/{nome-descritivo}.sql
```
E crie um README:
```
db/migrations/README_{FEATURE}.md
```

### 📖 Preciso Ver a Documentação de uma Feature
```
docs/features/{FEATURE}.md
```
Exemplos:
- `docs/features/CONTAS_PAGAR_IMPLEMENTADO.md`
- `docs/features/FINANCEIRO_CONSOLIDADO_WORLDPAV.md`

### 🧪 Preciso Ver/Alterar Dados Mock
```
src/mocks/{feature}-mock.ts
```
Exemplos:
- `src/mocks/colaboradores-mock.ts`
- `src/mocks/contas-pagar-mock.ts`

### ⚙️ Preciso Alterar Configurações
```
src/config/{config}.ts
```
Ou arquivos raiz:
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`

## 🚀 Comandos Rápidos

### Desenvolvimento
```bash
npm run dev              # Iniciar dev server
npm run build           # Build de produção
npm run preview         # Preview do build
```

### Linting e Formatação
```bash
npm run lint            # Verificar erros
npm run format          # Formatar código
```

### Deploy
```bash
npm run build && vercel --prod    # Deploy Vercel
npm run build && netlify deploy --prod  # Deploy Netlify
```

## 📂 Estrutura Visual Rápida

```
Worldpav/
├── 📄 README.md              → Documentação principal
├── 📄 GUIA_RAPIDO.md         → Este arquivo
│
├── 📁 src/
│   ├── components/           → Componentes React
│   │   ├── cards/           → Cards
│   │   ├── forms/           → Formulários
│   │   ├── modals/          → Modais
│   │   ├── inputs/          → Inputs
│   │   ├── shared/          → Compartilhados
│   │   └── {feature}/       → Por feature
│   │
│   ├── pages/               → Páginas/Rotas
│   ├── lib/                 → APIs e bibliotecas
│   ├── types/               → TypeScript types
│   ├── mocks/               → Dados mock
│   ├── hooks/               → React hooks
│   ├── utils/               → Utilitários
│   ├── config/              → Configurações
│   └── styles/              → Estilos
│
├── 📁 docs/
│   ├── README.md            → Índice
│   ├── features/            → Features implementadas
│   ├── setup/               → Guias de setup
│   └── archived/            → Histórico
│
└── 📁 db/migrations/        → Migrações SQL
```

## 🎯 Cenários Comuns

### "Quero criar uma nova página"
1. Criar em `src/pages/{feature}/NovaPagina.tsx`
2. Adicionar rota em `src/routes/index.tsx`
3. Adicionar item no sidebar se necessário

### "Quero criar um novo componente reutilizável"
1. Determinar categoria (card, modal, input, etc)
2. Criar em `src/components/{categoria}/NovoComponente.tsx`
3. Adicionar export em `src/components/index.ts` se for muito usado

### "Quero adicionar uma nova API"
1. Criar `src/lib/{feature}Api.ts`
2. Adicionar tipos em `src/types/{feature}.ts`
3. Documentar em `docs/features/{FEATURE}.md`

### "Quero adicionar uma nova tabela no banco"
1. Criar migração em `db/migrations/create_{tabela}.sql`
2. Criar README em `db/migrations/README_{TABELA}.md`
3. Atualizar tipos em `src/lib/supabase.ts`
4. Criar types em `src/types/{feature}.ts`

### "Quero ver como funciona uma feature existente"
1. Ler `docs/features/{FEATURE}.md`
2. Ver exemplos em `src/pages/{feature}/`
3. Ver componentes em `src/components/{feature}/`
4. Ver API em `src/lib/{feature}Api.ts`

## 📖 Documentação Importante

| O que você quer | Onde encontrar |
|-----------------|----------------|
| **Visão geral do projeto** | [README.md](./README.md) |
| **Estrutura do projeto** | [docs/ESTRUTURA_PROJETO.md](./docs/ESTRUTURA_PROJETO.md) |
| **Features implementadas** | [docs/features/](./docs/features/) |
| **Guias de setup** | [docs/Docs/](./docs/Docs/) |
| **Changelog** | [docs/Docs/changelog/](./docs/Docs/changelog/) |
| **Troubleshooting** | [docs/Docs/troubleshooting/](./docs/Docs/troubleshooting/) |

## 🆘 Problemas Comuns

### Erro de import
```typescript
// ❌ Evite
import { Button } from '../../../components/Button'

// ✅ Use
import { Button } from '@/components'
```

### Não encontro um componente
1. Use busca global (Cmd/Ctrl + P)
2. Consulte `src/components/index.ts`
3. Veja [docs/ESTRUTURA_PROJETO.md](./docs/ESTRUTURA_PROJETO.md)

### Não encontro documentação
1. Comece pelo [docs/README.md](./docs/README.md)
2. Busque em [docs/features/](./docs/features/)
3. Veja docs técnicos em [docs/Docs/](./docs/Docs/)

## 💡 Dicas Rápidas

1. **Use barrel exports**: `import { X, Y } from '@/components'`
2. **Siga as convenções**: PascalCase para componentes, camelCase para funções
3. **Documente mudanças**: Adicione em `docs/Docs/changelog/`
4. **Teste localmente**: `npm run dev` antes de fazer commit
5. **Consulte tipos**: TypeScript vai te ajudar!

## 🎉 Pronto!

Agora você sabe onde encontrar tudo! Se ainda tiver dúvidas:
- Consulte [README.md](./README.md)
- Veja [docs/ESTRUTURA_PROJETO.md](./docs/ESTRUTURA_PROJETO.md)
- Explore [docs/](./docs/)

**Bom desenvolvimento! 🚀**






