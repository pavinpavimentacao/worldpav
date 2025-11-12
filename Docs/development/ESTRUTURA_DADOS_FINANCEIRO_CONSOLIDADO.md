# 📊 ESTRUTURA DE DADOS - FINANCEIRO CONSOLIDADO

**Data:** 2025-01-27  
**Objetivo:** Mapear todas as tabelas e campos relevantes para o dashboard financeiro consolidado

---

## 🔍 TABELAS RELEVANTES

### 1. **OBRAS_NOTAS_FISCAIS** (Receitas - Notas Fiscais)

**Arquivo:** `db/migrations/03_obras_financeiro.sql` e `create_obras_notas_medicoes.sql`

#### Estrutura Principal (Migration 03):
```sql
CREATE TABLE public.obras_notas_fiscais (
  id UUID PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id),
  medicao_id UUID REFERENCES obras_medicoes(id),
  
  -- Dados da NF
  invoice_number TEXT NOT NULL,      -- Número da nota
  issue_date DATE NOT NULL,          -- Data de emissão
  
  -- Valores
  amount DECIMAL(12,2),              -- Valor bruto
  tax_amount DECIMAL(12,2) DEFAULT 0, -- Impostos
  net_amount DECIMAL(12,2),          -- Valor líquido
  
  description TEXT,
  file_url TEXT,
  status status_nota_fiscal DEFAULT 'emitida',  -- emitida, enviada, paga
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)
```

#### Campos Alternativos (Migration create_obras_notas_medicoes):
```sql
-- Colunas adicionais presentes em outra migration
numero_nota TEXT,                    -- Número da nota
valor_nota DECIMAL(10,2),            -- Valor bruto
vencimento DATE,                     -- Data de vencimento
desconto_inss DECIMAL(10,2) DEFAULT 0,
desconto_iss DECIMAL(10,2) DEFAULT 0,
outro_desconto DECIMAL(10,2) DEFAULT 0,
valor_liquido DECIMAL(10,2),         -- Valor após descontos
status TEXT DEFAULT 'pendente',     -- pendente, pago, vencido, renegociado
data_pagamento DATE,                 -- Data do pagamento
arquivo_nota_url TEXT,
observacoes TEXT,
updated_at TIMESTAMPTZ
```

**⚠️ INCONSISTÊNCIA:** Existem 2 estruturas diferentes para a mesma tabela!
- **Migration 03:** usa `invoice_number`, `issue_date`, `amount`, `net_amount`, `status` (enum)
- **Migration create_obras_notas_medicoes:** usa `numero_nota`, `vencimento`, `valor_nota`, `valor_liquido`, `status` (TEXT)

**AÇÃO NECESSÁRIA:** Verificar qual estrutura está ativa no banco atual

---

### 2. **OBRAS_PAGAMENTOS_DIRETOS** (Receitas - Pagamentos Sem NF)

**Arquivo:** `db/migrations/03_obras_financeiro.sql` e `create_obras_pagamentos_diretos.sql`

```sql
CREATE TABLE public.obras_pagamentos_diretos (
  id UUID PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id),
  
  -- Dados do pagamento
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,        -- Data do pagamento
  payment_method TEXT,               -- pix, transferencia, dinheiro, etc
  
  -- Classificação
  category TEXT,
  recipient TEXT,                    -- Beneficiário
  document_number TEXT,
  observations TEXT,
  
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)
```

**Campos para RECEITAS:**
- `payment_date` → Data da receita
- `amount` → Valor recebido

---

### 3. **OBRAS_FINANCEIRO** (Movimentações Gerais)

**Arquivo:** `db/migrations/03_obras_financeiro.sql`

```sql
CREATE TABLE public.obras_financeiro (
  id UUID PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id),
  
  -- Tipo de transação
  type tipo_transacao NOT NULL,     -- 'receita' ou 'despesa'
  category TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,               -- Data da transação
  payment_method TEXT,
  document_number TEXT,
  observations TEXT,
  
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)
```

**Campos para RECEITAS:**
- `type = 'receita'`
- `amount` → Valor da receita
- `date` → Data da receita

**Campos para DESPESAS:**
- `type = 'despesa'`
- `amount` → Valor da despesa
- `date` → Data da despesa

---

### 4. **OBRAS_FINANCEIRO_DESPESAS** (Despesas Detalhadas)

**Arquivo:** `db/migrations/create_obras_financeiro.sql`

```sql
CREATE TABLE public.obras_financeiro_despesas (
  id UUID PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id),
  
  -- Classificação
  categoria TEXT CHECK (categoria IN ('diesel', 'materiais', 'manutencao', 'outros')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_despesa DATE NOT NULL,
  
  -- Dados adicionais
  maquinario_id UUID REFERENCES maquinarios(id),
  fornecedor TEXT,
  comprovante_url TEXT,
  sincronizado_financeiro_principal BOOLEAN DEFAULT true,
  financeiro_principal_id UUID,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Campos para DESPESAS:**
- `categoria` → Tipo da despesa (diesel, materiais, manutenção, outros)
- `valor` → Valor da despesa
- `data_despesa` → Data da despesa

---

### 5. **MAQUINARIOS_DIESEL** (Despesas - Abastecimentos)

**Arquivo:** `db/migrations/create_obras_financeiro.sql`

```sql
CREATE TABLE public.maquinarios_diesel (
  id UUID PRIMARY KEY,
  maquinario_id UUID NOT NULL REFERENCES maquinarios(id),
  obra_id UUID REFERENCES obras(id),          -- Vinculação com obra
  
  -- Dados do abastecimento
  quantidade_litros DECIMAL(10,2),
  preco_por_litro DECIMAL(10,2),
  valor_total DECIMAL(10,2) NOT NULL,
  data_abastecimento DATE NOT NULL,
  
  -- Dados adicionais
  posto TEXT NOT NULL,
  km_hodometro DECIMAL(10,2),
  observacoes TEXT,
  despesa_obra_id UUID REFERENCES obras_financeiro_despesas(id),
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Campos para DESPESAS:**
- `valor_total` → Valor do abastecimento (despesa)
- `data_abastecimento` → Data da despesa
- `obra_id` → Vinculação com obra

---

### 6. **CONTAS_PAGAR** (Despesas - Contas Empresariais)

**Arquivo:** `db/migrations/11_contas_pagar.sql`

```sql
CREATE TABLE public.contas_pagar (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  obra_id UUID REFERENCES obras(id),          -- Vinculação opcional com obra
  
  -- Descrição
  description TEXT NOT NULL,
  category TEXT,
  supplier TEXT,
  amount DECIMAL(12,2) NOT NULL,
  
  -- Datas
  due_date DATE NOT NULL,
  payment_date DATE,                          -- Data do pagamento
  
  -- Status
  status status_conta_pagar DEFAULT 'pendente',  -- pendente, pago, atrasado, cancelado
  
  -- Pagamento
  payment_method TEXT,
  invoice_number TEXT,
  invoice_url TEXT,
  observations TEXT,
  
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
)
```

**Campos para DESPESAS:**
- `amount` → Valor da conta
- `payment_date` → Data do pagamento (quando foi pago)
- `status = 'pago'` → Apenas contas pagas
- `obra_id` → Vinculação opcional com obra

---

## 🔗 RELACIONAMENTOS

```
OBRAS
  ├── OBRAS_NOTAS_FISCAIS (receita)
  ├── OBRAS_PAGAMENTOS_DIRETOS (receita)
  ├── OBRAS_FINANCEIRO (receita OU despesa)
  ├── OBRAS_FINANCEIRO_DESPESAS (despesa)
  └── MAQUINARIOS_DIESEL (despesa - via obra_id)

CONTAS_PAGAR
  └── OBRAS (opcional - via obra_id)
```

---

## 📊 CÁLCULOS PARA O DASHBOARD

### RECEITAS (Total do Período)

**Fontes:**
1. `obras_notas_fiscais` → quando `status = 'pago'`
2. `obras_pagamentos_diretos` → todos os registros
3. `obras_financeiro` → quando `type = 'receita'`

**Campo de data para receita:**
- Notas fiscais: `updated_at` (quando mudou para 'pago') ou `issue_date`
- Pagamentos diretos: `payment_date`
- Financeiro geral: `date`

**Campo de valor para receita:**
- Notas fiscais: `net_amount` ou `valor_liquido` (após descontos)
- Pagamentos diretos: `amount`
- Financeiro geral: `amount`

---

### DESPESAS (Total do Período)

**Fontes:**
1. `obras_financeiro_despesas` → todas as despesas
2. `maquinarios_diesel` → valor_total
3. `contas_pagar` → quando `status = 'pago'` e `obra_id IS NOT NULL`
4. `obras_financeiro` → quando `type = 'despesa'`

**Campo de data para despesa:**
- Despesas obras: `data_despesa`
- Diesel: `data_abastecimento`
- Contas a pagar: `payment_date` (quando foi pago)
- Financeiro geral: `date`

**Campo de valor para despesa:**
- Despesas obras: `valor`
- Diesel: `valor_total`
- Contas a pagar: `amount`
- Financeiro geral: `amount`

**Campo de categoria para despesa:**
- Despesas obras: `categoria` (diesel, materiais, manutenção, outros)
- Diesel: 'diesel' (hardcoded)
- Contas a pagar: `category`
- Financeiro geral: `category`

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### Opção 1: Usar múltiplas queries (Consolidar no JavaScript)
- Buscar de cada tabela separadamente
- Consolidar no frontend
- Mais flexível, mas múltiplas queries

### Opção 2: Criar VIEW SQL (Recomendado)
- Criar view que consolida receitas e despesas
- UMA query para buscar tudo
- Melhor performance, mas mais complexo

### Opção 3: Usar tabela FINANCIAL_TRANSACTIONS
- Migrar tudo para a tabela consolidada
- Mais limpo, mas requer refatoração

**RECOMENDAÇÃO:** Opção 2 (Criar VIEWS SQL)

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. **Inconsistência em OBRAS_NOTAS_FISCAIS**
- Existem 2 estruturas diferentes
- Campos diferentes: `invoice_number` vs `numero_nota`, `amount` vs `valor_nota`
- **SOLUÇÃO:** Verificar banco atual e normalizar

### 2. **Campos de data inconsistentes**
- Notas fiscais: `updated_at` vs `data_pagamento` vs `issue_date`
- **SOLUÇÃO:** Usar `data_pagamento` quando existir, senão `updated_at`

### 3. **Status inconsistentes**
- Notas fiscais: enum `status_nota_fiscal` vs TEXT com valores diferentes
- **SOLUÇÃO:** Verificar valores reais no banco

### 4. **Vinculação de DESPESAS com OBRAS**
- `maquinarios_diesel` tem `obra_id` opcional
- `contas_pagar` tem `obra_id` opcional
- **SOLUÇÃO:** Filtrar apenas despesas vinculadas a obras

### 5. **Categorização de DESPESAS**
- Diferentes tabelas usam campos diferentes
- **SOLUÇÃO:** Unificar categorias no código

---

## ✅ PRÓXIMOS PASSOS

1. **Verificar estrutura real** das tabelas no banco de dados
2. **Criar queries de teste** para cada fonte de dados
3. **Criar VIEWs SQL** para consolidar receitas e despesas
4. **Implementar APIs** que consomem as VIEWs
5. **Conectar ao dashboard**

---

**Fim do Mapeamento**



