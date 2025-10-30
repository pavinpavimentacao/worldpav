# 🎯 PLANO DE IMPLEMENTAÇÃO - FINANCEIRO CONSOLIDADO

**Data:** 2025-01-27  
**Objetivo:** Implementar dados reais no dashboard financeiro consolidado do WorldPav

---

## 📊 VISÃO GERAL

O dashboard financeiro consolidado deve exibir:
- **Total Receitas** (verde)
- **Total Despesas** (vermelho)
- **Lucro Líquido** (azul)
- **Saldo Atual** (roxo)
- **Gráficos** de receitas vs despesas
- **Distribuição** de despesas por categoria
- **Desempenho** individual por obra

---

## 🗂️ ESTRUTURA DE DADOS ATUAL

### Fontes de Dados Disponíveis

#### 1. **RECEITAS** (Entradas)
- `obras_notas_fiscais` - Notas fiscais emitidas de serviços
- `obras_pagamentos_diretos` - Pagamentos diretos (PIX/Transferência)
- `obras_financeiro_faturamentos` - Faturamentos de ruas/etapas

#### 2. **DESPESAS** (Saídas)
- `obras_financeiro_despesas` - Despesas de obras (diesel, materiais, manutenção)
- `maquinarios_diesel` - Abastecimentos de diesel
- `contas_pagar` - Contas a pagar da empresa

---

## 📋 TASKS DE IMPLEMENTAÇÃO

### **PHASE 1: Preparaçção e Análise** 🔍

#### Task 1.1: Analisar estrutura atual do banco de dados financeiro
**Prioridade:** Alta  
**Estimativa:** 2 horas  
**Dependências:** Nenhuma

**Ações:**
- [ ] Mapear todas as tabelas financeiras existentes
- [ ] Identificar campos relevantes para o dashboard
- [ ] Verificar integridade dos dados existentes
- [ ] Documentar relacionamentos entre tabelas

**Arquivos a revisar:**
- `db/migrations/03_obras_financeiro.sql`
- `db/migrations/11_contas_pagar.sql`
- `db/migrations/12_financeiro_consolidado.sql`
- `db/migrations/create_obras_financeiro.sql`

**Deliverable:** Documento de mapeamento de estrutura de dados

---

#### Task 1.2: Criar arquivo de API para financeiro consolidado
**Prioridade:** Alta  
**Estimativa:** 3 horas  
**Dependências:** Task 1.1

**Ações:**
- [ ] Criar `src/lib/financialConsolidadoApi.ts` (se não existir)
- [ ] Implementar função `getFinancialConsolidado(mesAno)`
- [ ] Implementar função `getObrasComResumoFinanceiro(mesAno)`
- [ ] Implementar funções auxiliares de cálculo

**Funções a implementar:**
```typescript
// Calcular totais do período
getTotalReceitas(dataInicio, dataFim)
getTotalDespesas(dataInicio, dataFim)
getLucroLiquido(dataInicio, dataFim)

// Calcular dados por obra
getReceitasPorObra(obraId, dataInicio, dataFim)
getDespesasPorObra(obraId, dataInicio, dataFim)
getLucroPorObra(obraId, dataInicio, dataFim)

// Calcular para gráficos
getDadosGraficoReceitasDespesas(dataInicio, dataFim)
getDadosGraficoDespesasPorCategoria(dataInicio, dataFim)
```

**Deliverable:** Arquivo de API funcional com consultas ao banco

---

### **PHASE 2: Implementação de Consultas SQL** 💾

#### Task 2.1: Implementar consulta de receitas consolidadas
**Prioridade:** Alta  
**Estimativa:** 4 horas  
**Dependências:** Task 1.2

**Ações:**
- [ ] Criar query SQL para somar todas as receitas do período
- [ ] Considerar múltiplas fontes: notas fiscais pagas + pagamentos diretos
- [ ] Filtrar por obra_id quando necessário
- [ ] Retornar dados agregados por dia para gráfico

**Query SQL sugerida:**
```sql
-- Receitas de Notas Fiscais Pagas
SELECT 
  obra_id,
  DATE(updated_at) as data,
  SUM(valor_liquido) as valor
FROM obras_notas_fiscais
WHERE status = 'paga'
  AND DATE_TRUNC('month', updated_at) = '{mes}/{ano}'
GROUP BY obra_id, DATE(updated_at)

UNION ALL

-- Receitas de Pagamentos Diretos
SELECT 
  obra_id,
  DATE(payment_date) as data,
  SUM(amount) as valor
FROM obras_pagamentos_diretos
WHERE DATE_TRUNC('month', payment_date) = '{mes}/{ano}'
GROUP BY obra_id, DATE(payment_date)
```

**Deliverable:** Função retornando receitas consolidadas por dia

---

#### Task 2.2: Implementar consulta de despesas consolidadas
**Prioridade:** Alta  
**Estimativa:** 4 horas  
**Dependências:** Task 1.2

**Ações:**
- [ ] Criar query SQL para somar todas as despesas do período
- [ ] Considerar múltiplas fontes: despesas de obras + diesel + contas a pagar
- [ ] Filtrar por obra_id quando necessário
- [ ] Retornar dados agregados por dia e por categoria

**Query SQL sugerida:**
```sql
-- Despesas de Obras
SELECT 
  obra_id,
  DATE(data_despesa) as data,
  categoria,
  SUM(valor) as valor
FROM obras_financeiro_despesas
WHERE DATE_TRUNC('month', data_despesa) = '{mes}/{ano}'
GROUP BY obra_id, DATE(data_despesa), categoria

UNION ALL

-- Diesel de Maquinários
SELECT 
  obra_id,
  DATE(data_abastecimento) as data,
  'diesel' as categoria,
  SUM(valor_total) as valor
FROM maquinarios_diesel
WHERE DATE_TRUNC('month', data_abastecimento) = '{mes}/{ano}'
  AND obra_id IS NOT NULL
GROUP BY obra_id, DATE(data_abastecimento)

UNION ALL

-- Contas a Pagar Pagas (se vinculadas a obra)
SELECT 
  obra_id,
  DATE(payment_date) as data,
  category as categoria,
  SUM(amount) as valor
FROM contas_pagar
WHERE status = 'pago'
  AND obra_id IS NOT NULL
  AND DATE_TRUNC('month', payment_date) = '{mes}/{ano}'
GROUP BY obra_id, DATE(payment_date), category
```

**Deliverable:** Função retornando despesas consolidadas por dia e categoria

---

#### Task 2.3: Implementar consulta de desempenho por obra
**Prioridade:** Média  
**Estimativa:** 3 horas  
**Dependências:** Task 2.1, Task 2.2

**Ações:**
- [ ] Criar query SQL para calcular resumo financeiro por obra
- [ ] Incluir: total faturado, total despesas, lucro, margem
- [ ] Filtrar apenas obras com movimentação no período
- [ ] Ordenar por lucro (maior primeiro)

**Query SQL sugerida:**
```sql
WITH receitas_obra AS (
  -- Receitas da obra
  SELECT 
    obra_id,
    SUM(valor) as total_receitas
  FROM (
    SELECT obra_id, valor_liquido as valor
    FROM obras_notas_fiscais
    WHERE status = 'paga' 
      AND DATE_TRUNC('month', updated_at) = '{mes}/{ano}'
    
    UNION ALL
    
    SELECT obra_id, amount as valor
    FROM obras_pagamentos_diretos
    WHERE DATE_TRUNC('month', payment_date) = '{mes}/{ano}'
  ) receitas
  GROUP BY obra_id
),
despesas_obra AS (
  -- Despesas da obra
  SELECT 
    obra_id,
    SUM(valor) as total_despesas
  FROM obras_financeiro_despesas
  WHERE DATE_TRUNC('month', data_despesa) = '{mes}/{ano}'
  GROUP BY obra_id
)
SELECT 
  o.id,
  o.name as nome,
  o.status,
  COALESCE(r.total_receitas, 0) as total_faturado,
  COALESCE(d.total_despesas, 0) as total_despesas,
  COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0) as lucro
FROM obras o
LEFT JOIN receitas_obra r ON r.obra_id = o.id
LEFT JOIN despesas_obra d ON d.obra_id = o.id
WHERE (r.total_receitas > 0 OR d.total_despesas > 0)
ORDER BY lucro DESC
```

**Deliverable:** Função retornando lista de obras com resumo financeiro

---

### **PHASE 3: Implementação das Interfaces** 🎨

#### Task 3.1: Conectar dados reais ao FinancialDashboard
**Prioridade:** Alta  
**Estimativa:** 3 horas  
**Dependências:** Task 2.1, Task 2.2

**Ações:**
- [ ] Alterar `USE_MOCK = false` em `FinancialDashboard.tsx`
- [ ] Conectar chamada real de API
- [ ] Implementar tratamento de erros
- [ ] Adicionar loading states
- [ ] Testar com dados reais

**Arquivo:** `src/pages/financial/FinancialDashboard.tsx`

**Modificações necessárias:**
```typescript
// Remover ou alterar para false
const USE_MOCK = false

// Conectar API real
const loadFinancialData = async () => {
  const data = await getFinancialConsolidado(mesAno)
  setResumo({
    totalReceitas: data.totalReceitas,
    totalDespesas: data.totalDespesas,
    lucroLiquido: data.lucroLiquido,
    saldoAtual: data.saldoAtual
  })
}
```

**Deliverable:** Dashboard conectado com dados reais

---

#### Task 3.2: Conectar dados reais ao ResumoGeralTab
**Prioridade:** Alta  
**Estimativa:** 3 horas  
**Dependências:** Task 2.3

**Ações:**
- [ ] Alterar `USE_MOCK = false` em `ResumoGeralTab.tsx`
- [ ] Conectar chamada real de API para obras
- [ ] Implementar geração de dados para gráficos
- [ ] Tratar casos sem dados
- [ ] Testar visualização de gráficos

**Arquivo:** `src/components/financial/ResumoGeralTab.tsx`

**Funções a criar:**
```typescript
// Gerar dados para gráfico de linha (por dia)
const gerarDadosLinha = (receitas: any[], despesas: any[]): DadosGraficoLinha[] => {
  // Agrupar receitas e despesas por dia
  // Retornar array para o gráfico
}

// Gerar dados para gráfico de pizza (por categoria)
const gerarDadosPizza = (despesas: any[]): DadosGraficoPizza[] => {
  // Agrupar despesas por categoria
  // Calcular valores e percentuais
  // Retornar array para o gráfico
}
```

**Deliverable:** Aba Resumo Geral com dados e gráficos reais

---

#### Task 3.3: Implementar Tabs de Receitas e Despesas
**Prioridade:** Média  
**Estimativa:** 4 horas  
**Dependências:** Task 2.1, Task 2.2

**Ações:**
- [ ] Criar componente `ReceitasTab.tsx` (se não existir)
- [ ] Criar componente `DespesasTab.tsx` (se não existir)
- [ ] Implementar listagem de receitas por obra
- [ ] Implementar listagem de despesas por categoria
- [ ] Adicionar filtros e ordenação
- [ ] Conectar com APIs reais

**Componentes a criar:**
```typescript
// ReceitasTab.tsx
interface ReceitaItem {
  id: string
  data: string
  obra_nome: string
  descricao: string
  valor: number
  tipo: 'nota_fiscal' | 'pagamento_direto'
}

// DespesasTab.tsx
interface DespesaItem {
  id: string
  data: string
  obra_nome?: string
  categoria: string
  descricao: string
  valor: number
}
```

**Deliverable:** Tabs de Receitas e Despesas funcionais

---

### **PHASE 4: Otimizações e Testes** 🧪

#### Task 4.1: Otimizar consultas SQL com índices
**Prioridade:** Média  
**Estimativa:** 2 horas  
**Dependências:** Task 2.1, Task 2.2

**Ações:**
- [ ] Analisar performance das queries
- [ ] Adicionar índices necessários nas colunas filtradas
- [ ] Criar índices compostos para consultas frequentes
- [ ] Verificar execution plans

**Índices sugeridos:**
```sql
-- Índices para consultas por data
CREATE INDEX IF NOT EXISTS idx_obras_nf_updated_at_status 
  ON obras_notas_fiscais(updated_at, status);

CREATE INDEX IF NOT EXISTS idx_obras_pag_dir_payment_date 
  ON obras_pagamentos_diretos(payment_date);

CREATE INDEX IF NOT EXISTS idx_obras_despesas_data_despesa 
  ON obras_financeiro_despesas(data_despesa);

CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_data_obra 
  ON maquinarios_diesel(data_abastecimento, obra_id);
```

**Deliverable:** Migrations com índices otimizados

---

#### Task 4.2: Implementar cache para performance
**Prioridade:** Baixa  
**Estimativa:** 3 horas  
**Dependências:** Task 3.1

**Ações:**
- [ ] Implementar cache em memória para KPIs
- [ ] Definir TTL (Time To Live) apropriado
- [ ] Implementar invalidação de cache
- [ ] Adicionar indicador de "dados em cache"

**Deliverable:** Sistema de cache implementado

---

#### Task 4.3: Testes de integração
**Prioridade:** Alta  
**Estimativa:** 4 horas  
**Dependências:** Todas as tasks anteriores

**Ações:**
- [ ] Criar dados de teste no banco
- [ ] Testar cálculo de receitas
- [ ] Testar cálculo de despesas
- [ ] Testar cálculo de lucro
- [ ] Testar filtros por período
- [ ] Testar filtros por obra
- [ ] Validar visualizações

**Checklist de testes:**
- [ ] Dashboard carrega sem erros
- [ ] Valores exibidos são corretos
- [ ] Gráficos renderizam corretamente
- [ ] Filtros funcionam
- [ ] Performance é aceitável (< 2s)
- [ ] Dados estão atualizados

**Deliverable:** Dashboard testado e validado

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 Prioridade Alta (Fazer Primeiro)
1. Task 1.1 - Analisar estrutura do banco
2. Task 1.2 - Criar arquivo de API
3. Task 2.1 - Consulta de receitas
4. Task 2.2 - Consulta de despesas
5. Task 3.1 - Conectar dashboard
6. Task 3.2 - Conectar ResumoGeralTab
7. Task 4.3 - Testes de integração

### 🟡 Prioridade Média
1. Task 2.3 - Desempenho por obra
2. Task 3.3 - Tabs Receitas/Despesas
3. Task 4.1 - Otimizar índices

### 🟢 Prioridade Baixa
1. Task 4.2 - Implementar cache

---

## 📅 CRONOGRAMA SUGERIDO

**Semana 1:**
- Task 1.1 + 1.2 (Preparação e API)
- Task 2.1 + 2.2 (Consultas SQL)

**Semana 2:**
- Task 2.3 + 3.1 (Desempenho e Dashboard)
- Task 3.2 + 3.3 (Tabs e Gráficos)

**Semana 3:**
- Task 4.1 + 4.3 (Otimizações e Testes)
- Task 4.2 (Cache - opcional)

**Total estimado:** ~28 horas de desenvolvimento

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO

### Funcionalidade
- [ ] Dashboard exibe dados reais do banco
- [ ] KPIs são calculados corretamente
- [ ] Gráficos renderizam sem erros
- [ ] Filtros por período funcionam
- [ ] Filtros por obra funcionam
- [ ] Desempenho por obra é exibido

### Performance
- [ ] Dashboard carrega em < 2 segundos
- [ ] Mudança de mês carrega em < 1 segundo
- [ ] Consultas SQL executam em < 500ms

### Qualidade
- [ ] Código está documentado
- [ ] Não há erros no console
- [ ] Dados estão consistentes
- [ ] Tratamento de erros implementado

---

## 🔍 ARQUIVOS A MODIFICAR

### Novos arquivos a criar:
```
src/lib/financialConsolidadoApi.ts (ou atualizar)
src/components/financial/ReceitasTab.tsx (se não existir)
src/components/financial/DespesasTab.tsx (se não existir)
db/migrations/XX_add_financial_consolidado_indexes.sql
```

### Arquivos a modificar:
```
src/pages/financial/FinancialDashboard.tsx
src/components/financial/ResumoGeralTab.tsx
```

---

## 📝 NOTAS IMPORTANTES

1. **Compatibilidade de dados:** Garantir que campos existem nas tabelas do banco
2. **Multi-tenant:** Todos os dados devem filtrar por `company_id`
3. **Soft delete:** Respeitar registros com `deleted_at IS NULL`
4. **Performance:** Usar agregações SQL, não processar no frontend
5. **Timezone:** Usar UTC para datas no banco, converter para timezone local na exibição

---

**Fim do Plano**


