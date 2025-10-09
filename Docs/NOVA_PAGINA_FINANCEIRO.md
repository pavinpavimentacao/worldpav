# Nova Página de Financeiro - WorldPav

## 📋 Visão Geral

Nova página de Financeiro completamente refeita do zero, seguindo o padrão visual moderno do projeto WorldPav com sistema de abas e integração com dados de obras.

---

## 🎯 Especificações Implementadas

### Escopo
- **Empresa**: WorldPav consolidado (não inclui Pavin)
- **Período**: Mês atual (fechamento do dia 01 ao dia 31)
- **Dados**: Mockups ativados por padrão

### Fontes de Dados

#### Receitas
- Faturamentos de obras quando ruas são finalizadas e pagas
- Integração com tabela `obras_financeiro_faturamentos`

#### Despesas
- Despesas de obras (materiais, manutenção, outros)
- Diesel de maquinários alocados em obras
- Folha salarial (será integrada futuramente no financeiro geral)
- Integração com tabela `obras_financeiro_despesas`

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── pages/financial/
│   └── FinancialDashboard.tsx        # Página principal
├── components/financial/
│   ├── ResumoGeralTab.tsx            # Aba de resumo geral
│   ├── ReceitasTab.tsx               # Aba de receitas
│   └── DespesasTab.tsx               # Aba de despesas
└── lib/
    └── financialConsolidadoApi.ts    # API de integração
```

### Rotas

- **URL**: `/financial`
- **Autenticação**: Requerida via `<RequireAuth>`
- **Configuração**: `src/routes/index.tsx`

---

## 🎨 Layout e Componentes

### 1. Header
- Título: "Financeiro WorldPav"
- Subtítulo: Período selecionado
- Seletor de mês/ano (últimos 12 meses)
- Botão de filtros (placeholder)

### 2. Cards KPI (4 Cards)

#### Total Receitas (Verde)
- Ícone: `TrendingUp`
- Cor: `green-600`
- Fonte: Faturamentos pagos do mês

#### Total Despesas (Vermelho)
- Ícone: `TrendingDown`
- Cor: `red-600`
- Fonte: Despesas sincronizadas do mês

#### Lucro Líquido (Azul/Vermelho dinâmico)
- Ícone: `DollarSign`
- Cor: Azul se positivo, vermelho se negativo
- Cálculo: Receitas - Despesas
- Background colorido quando positivo/negativo

#### Saldo Atual (Roxo)
- Ícone: `Wallet`
- Cor: `purple-600`
- Por enquanto = Lucro Líquido do mês

### 3. Sistema de Abas

#### Aba: Resumo Geral
**Componente**: `ResumoGeralTab`

**Conteúdo**:
- **Gráfico de Linha** (Receitas vs Despesas):
  - Mostra evolução ao longo dos dias do mês
  - Linha verde para receitas
  - Linha vermelha para despesas
  - Tooltip customizado com valores formatados
  - Biblioteca: Recharts
- **Gráfico de Pizza** (Distribuição de Despesas):
  - Mostra porcentagem de cada categoria
  - Cores correspondentes às categorias
  - Tooltip com valores em R$
  - Legenda com valores totais
  - Biblioteca: Recharts
- Lista de obras com desempenho individual:
  - Nome da obra
  - Total faturado
  - Total de despesas
  - Lucro (com indicador visual)
  - Margem de lucro percentual

**Mockups**:
```typescript
[
  {
    nome: 'Pavimentação Rua das Flores - Osasco',
    totalFaturado: 36250.00,
    totalDespesas: 8500.00,
    lucro: 27750.00
  },
  {
    nome: 'Avenida Central - Barueri',
    totalFaturado: 30000.00,
    totalDespesas: 6950.00,
    lucro: 23050.00
  }
]
```

#### Aba: Receitas
**Componente**: `ReceitasTab`

**Filtros**:
- Busca por obra ou rua (campo de texto)
- Filtro por data específica

**Tabela**:
| Data Pagamento | Obra | Rua | Nota Fiscal | Valor |
|----------------|------|-----|-------------|-------|
| Com ícone de calendário | Nome da obra | Nome da rua | NF-XXX/YYYY | R$ valor |

**Resumo**:
- Box azul destacado com total de receitas e quantidade de faturamentos

**Mockups**:
```typescript
[
  {
    data_pagamento: '2025-01-20',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_nome: 'Rua das Flores',
    valor_total: 18500.00,
    numero_nota_fiscal: 'NF-001/2025'
  }
  // ... mais faturamentos
]
```

#### Aba: Despesas
**Componente**: `DespesasTab`

**Filtros**:
- Categoria (dropdown: Diesel, Materiais, Manutenção, Mão de Obra, Outros)
- Busca por obra (campo de texto)
- Filtro por data específica

**Tabela**:
| Data | Categoria | Descrição | Obra / Maquinário | Valor |
|------|-----------|-----------|-------------------|-------|
| Com ícone | Badge colorido | Texto | Nome da obra + maquinário (se houver) | R$ valor |

**Categorias com cores**:
- Diesel: Amarelo (`yellow-100/800`)
- Materiais: Azul (`blue-100/800`)
- Manutenção: Laranja (`orange-100/800`)
- Mão de Obra: Roxo (`purple-100/800`)
- Outros: Cinza (`gray-100/800`)

**Resumo**:
- Box vermelho destacado com total de despesas e quantidade

**Mockups**:
```typescript
[
  {
    data_despesa: '2025-01-18',
    categoria: 'Diesel',
    descricao: 'Abastecimento Rolo Compactador',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    maquinario_nome: 'Rolo Compactador CAT-001',
    valor: 550.00
  }
  // ... mais despesas
]
```

---

## 🔌 Integração com Backend

### API Service: `financialConsolidadoApi.ts`

#### Função Principal: `getFinancialConsolidado`

**Parâmetros**:
```typescript
{ mes: number, ano: number }
```

**Retorno**:
```typescript
{
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
  saldoAtual: number
  faturamentos: FaturamentoConsolidado[]
  despesas: DespesaConsolidada[]
}
```

**Lógica**:
1. Calcula primeiro e último dia do mês
2. Busca faturamentos com `status = 'pago'` no período
3. Busca despesas com `sincronizado_financeiro_principal = true` no período
4. Calcula totais
5. Retorna dados consolidados

#### Função Auxiliar: `getObrasComResumoFinanceiro`

**Uso**: Aba "Resumo Geral"

**Lógica**:
1. Busca obras ativas ou concluídas
2. Para cada obra, calcula:
   - Total faturado no mês
   - Total de despesas no mês
   - Lucro (faturado - despesas)
3. Retorna apenas obras com movimentação financeira

---

## ⚙️ Modo Mock

### Ativação

Todos os componentes possuem uma flag no início do arquivo:

```typescript
const USE_MOCK = true
```

### Quando Desativar

1. Configurar variáveis de ambiente do Supabase
2. Criar tabelas necessárias via migrations
3. Alterar `USE_MOCK` para `false` em todos os componentes:
   - `FinancialDashboard.tsx`
   - `ResumoGeralTab.tsx`
   - `ReceitasTab.tsx`
   - `DespesasTab.tsx`

### Dados Mockados

#### Dashboard Principal
```typescript
{
  totalReceitas: 66250.00,
  totalDespesas: 15450.00,
  lucroLiquido: 50800.00,
  saldoAtual: 50800.00
}
```

#### Detalhes
- 3 faturamentos pagos (total: R$ 66.250,00)
- 6 despesas diversas (total: R$ 15.450,00)
- 2 obras com movimentação financeira

---

## 🎯 Padrão Visual

### Cores WorldPav

- **Verde** (Receitas): `green-100`, `green-600`, `green-900`
- **Vermelho** (Despesas): `red-100`, `red-600`, `red-900`
- **Azul** (Lucro positivo): `blue-100`, `blue-600`, `blue-900`
- **Roxo** (Saldo): `purple-100`, `purple-600`, `purple-900`
- **Cinza** (Neutro): `gray-50`, `gray-200`, `gray-500`, `gray-900`

### Componentes Reutilizados

- `<Layout>`: Container principal com sidebar
- `<Button>`: Botões padronizados (variant: `outline`, `primary`)
- Ícones: `lucide-react`
- Grid responsivo: `grid-cols-1 md:grid-cols-4`
- Cards: `bg-white rounded-lg border border-gray-200`

### Responsividade

- Mobile first
- Breakpoints:
  - `md:` (768px+): Grid com 4 colunas, filtros em linha
  - Default (<768px): Grid empilhado, filtros em coluna

---

## 📊 Próximos Passos

### 1. Gráficos (Resumo Geral)
- [x] Implementar gráfico de linha com Recharts ✅
- [x] Implementar gráfico de pizza para distribuição de despesas ✅
- [ ] Adicionar opções de exportação de gráficos

### 2. Filtros Avançados
- [ ] Implementar lógica do botão "Filtros"
- [ ] Adicionar filtro por empresa (WorldPav | Pavin)
- [ ] Filtro por período customizado
- [ ] Exportar dados filtrados para Excel/PDF

### 3. Folha Salarial
- [ ] Criar módulo de folha salarial
- [ ] Integrar despesas de salários no financeiro geral
- [ ] Separar custos de mão de obra por obra (opcional)

### 4. Saldo Acumulado
- [ ] Implementar controle de saldo anterior
- [ ] Calcular saldo real (saldo anterior + lucro do mês)
- [ ] Adicionar histórico de saldos mensais

### 5. Alertas e Notificações
- [ ] Alerta quando despesas ultrapassam receitas
- [ ] Notificação de faturamentos pendentes
- [ ] Resumo mensal automático via email

---

## 🔧 Troubleshooting

### Problema: Página não carrega

**Solução**:
1. Verificar se a rota está configurada em `src/routes/index.tsx`
2. Confirmar que o import de `FinancialDashboard` está correto
3. Verificar console do navegador para erros

### Problema: Dados não aparecem

**Solução**:
1. Confirmar que `USE_MOCK = true`
2. Se usando banco real, verificar conexão com Supabase
3. Conferir tabelas e permissões (RLS)

### Problema: Erro de TypeScript

**Solução**:
1. Verificar imports de tipos em `src/types/obras-financeiro.ts`
2. Executar `npm run build` para ver erros completos
3. Conferir se todos os tipos estão definidos

---

## 📝 Notas de Implementação

### Decisões de Design

1. **Por que usar abas?**
   - Organização visual clara
   - Facilita navegação entre receitas e despesas
   - Permite adicionar mais visualizações no futuro

2. **Por que mockups por padrão?**
   - Permite testar interface sem configurar banco
   - Facilita demonstrações para clientes
   - Desenvolvimento mais rápido

3. **Por que separar componentes de abas?**
   - Código mais organizado e mantível
   - Reutilização em outras páginas se necessário
   - Facilita testes individuais

### Boas Práticas Aplicadas

- ✅ TypeScript com tipos explícitos
- ✅ Comentários em português
- ✅ Formatação pt-BR para datas e valores
- ✅ Loading states
- ✅ Tratamento de erros
- ✅ Código modular e reutilizável
- ✅ Responsividade mobile-first
- ✅ Padrão visual consistente

---

## 🎉 Resultado Final

Uma página de Financeiro moderna, profissional e completa com:

- ✅ Dashboard consolidado da WorldPav
- ✅ 4 cards KPI informativos no topo
- ✅ Sistema de 3 abas totalmente funcionais
- ✅ Integração preparada com dados de obras
- ✅ Mockups realistas para demonstração
- ✅ Pronta para conectar com banco de dados real
- ✅ Código limpo, organizado e documentado

---

**Data de Implementação**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: ✅ Completo e Funcional

