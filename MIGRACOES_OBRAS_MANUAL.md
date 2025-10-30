# 🏗️ Guia de Migrações - Tabelas de Obras

## ❌ Problema Identificado

**As tabelas de obras não existem no banco de dados**, mas a aplicação está funcionando com dados mockados. Isso explica por que:

- ✅ A aplicação carrega normalmente
- ❌ Os dados de obras mostram valores zerados (0 m², 0 toneladas, R$ 0,00)
- ❌ Não é possível criar/editar obras reais
- ❌ As consultas de ruas, faturamentos e medições falham

## 🔍 Tabelas Faltantes

As seguintes tabelas relacionadas a obras **NÃO EXISTEM** no banco:

- ❌ `obras` - Tabela principal de obras
- ❌ `obras_ruas` - Ruas/etapas das obras  
- ❌ `obras_financeiro_faturamentos` - Faturamentos das obras
- ❌ `obras_financeiro_despesas` - Despesas das obras
- ❌ `obras_medicoes` - Medições das obras
- ❌ `obras_notas_fiscais` - Notas fiscais das obras
- ❌ `obras_pagamentos_diretos` - Pagamentos diretos
- ❌ `obras_servicos` - Serviços das obras

## 🚀 Solução: Aplicar Migrações das Obras

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `ztcwsztsiuevwmgyfyzh`

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar as Migrações das Obras

Execute os seguintes SQLs **na ordem exata**:

#### 1. Criar Tabela Principal de Obras

```sql
-- =====================================================
-- CRIAR TABELA PRINCIPAL DE OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Cliente
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  
  -- Dados da obra
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planejamento',
  
  -- Datas
  start_date DATE,
  expected_end_date DATE,
  end_date DATE,
  
  -- Valores
  contract_value DECIMAL(15, 2),
  executed_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Localização
  location TEXT,
  city TEXT,
  state TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Comentários
COMMENT ON TABLE public.obras IS 'Obras de pavimentação (tabela central do sistema)';
COMMENT ON COLUMN public.obras.id IS 'ID único da obra';
COMMENT ON COLUMN public.obras.company_id IS 'Empresa da obra (isolamento multi-tenant)';
COMMENT ON COLUMN public.obras.client_id IS 'Cliente da obra';
COMMENT ON COLUMN public.obras.status IS 'Status: planejamento, andamento, concluida, cancelada';
```

#### 2. Criar Tabela de Ruas das Obras

```sql
-- =====================================================
-- CRIAR TABELA DE RUAS DAS OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_ruas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados da rua/etapa
  name TEXT NOT NULL,
  
  -- Medidas
  length DECIMAL(10, 2), -- Comprimento em metros
  width DECIMAL(10, 2), -- Largura em metros
  area DECIMAL(12, 2), -- Área total (calculada ou manual)
  metragem_planejada DECIMAL(10, 2), -- Metragem planejada
  toneladas_planejadas DECIMAL(10, 2), -- Toneladas planejadas
  
  -- Status
  status TEXT NOT NULL DEFAULT 'planejada',
  
  -- Datas
  start_date DATE,
  end_date DATE,
  
  -- Ordem
  ordem INTEGER NOT NULL DEFAULT 0,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Comentários
COMMENT ON TABLE public.obras_ruas IS 'Ruas/etapas das obras de pavimentação';
COMMENT ON COLUMN public.obras_ruas.obra_id IS 'Obra à qual a rua pertence';
COMMENT ON COLUMN public.obras_ruas.status IS 'Status: planejada, em_execucao, concluida';
COMMENT ON COLUMN public.obras_ruas.ordem IS 'Ordem de execução da rua na obra';
```

#### 3. Criar Tabela de Faturamentos das Obras

```sql
-- =====================================================
-- CRIAR TABELA DE FATURAMENTOS DAS OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_financeiro_faturamentos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE CASCADE,
  
  -- Dados do faturamento
  metragem_executada DECIMAL(10, 2) NOT NULL,
  toneladas_utilizadas DECIMAL(10, 2) NOT NULL,
  espessura_calculada DECIMAL(10, 2) NOT NULL,
  preco_por_m2 DECIMAL(10, 2) NOT NULL,
  valor_total DECIMAL(15, 2) NOT NULL,
  
  -- Status e datas
  status TEXT NOT NULL DEFAULT 'pendente',
  data_finalizacao DATE NOT NULL,
  data_pagamento DATE,
  
  -- Documentação
  nota_fiscal TEXT,
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.obras_financeiro_faturamentos IS 'Faturamentos das obras de pavimentação';
COMMENT ON COLUMN public.obras_financeiro_faturamentos.status IS 'Status: pendente, pago';
```

#### 4. Criar Tabela de Despesas das Obras

```sql
-- =====================================================
-- CRIAR TABELA DE DESPESAS DAS OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_financeiro_despesas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados da despesa
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_despesa DATE NOT NULL,
  
  -- Observações
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.obras_financeiro_despesas IS 'Despesas das obras de pavimentação';
COMMENT ON COLUMN public.obras_financeiro_despesas.categoria IS 'Categoria: diesel, mao_obra, manutencao, outros';
```

#### 5. Criar Tabela de Medições das Obras

```sql
-- =====================================================
-- CRIAR TABELA DE MEDIÇÕES DAS OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_medicoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE CASCADE,
  
  -- Dados da medição
  data_medicao DATE NOT NULL,
  metragem_medida DECIMAL(10, 2) NOT NULL,
  toneladas_aplicadas DECIMAL(10, 2) NOT NULL,
  espessura_medida DECIMAL(10, 2) NOT NULL,
  
  -- Observações
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.obras_medicoes IS 'Medições das obras de pavimentação';
```

#### 6. Criar Tabela de Notas Fiscais das Obras

```sql
-- =====================================================
-- CRIAR TABELA DE NOTAS FISCAIS DAS OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_notas_fiscais (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados da nota fiscal
  numero_nota TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'emitida',
  
  -- Observações
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.obras_notas_fiscais IS 'Notas fiscais das obras de pavimentação';
COMMENT ON COLUMN public.obras_notas_fiscais.status IS 'Status: emitida, enviada, paga';
```

#### 7. Criar Tabela de Pagamentos Diretos

```sql
-- =====================================================
-- CRIAR TABELA DE PAGAMENTOS DIRETOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_pagamentos_diretos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  descricao TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_pagamento DATE NOT NULL,
  forma_pagamento TEXT NOT NULL,
  
  -- Documentação
  comprovante_url TEXT,
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.obras_pagamentos_diretos IS 'Pagamentos diretos das obras';
COMMENT ON COLUMN public.obras_pagamentos_diretos.forma_pagamento IS 'Forma: pix, transferencia, dinheiro, cheque';
```

### Passo 4: Verificar se as Tabelas Foram Criadas

Execute este SQL para verificar:

```sql
-- =====================================================
-- VERIFICAR TABELAS DE OBRAS CRIADAS
-- =====================================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'obras', 
      'obras_ruas', 
      'obras_financeiro_faturamentos',
      'obras_financeiro_despesas',
      'obras_medicoes',
      'obras_notas_fiscais',
      'obras_pagamentos_diretos'
    ) THEN '✅ CRIADA'
    ELSE '⚠️  OUTRA'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'obras%'
ORDER BY table_name;
```

### Passo 5: Testar a Aplicação

Após criar as tabelas:

1. Volte para a aplicação: http://localhost:5173
2. Acesse a página de Obras
3. Verifique se os dados agora carregam corretamente
4. Teste criar uma nova obra

## 🎯 Resultado Esperado

Após aplicar as migrações, você deve ver:

- ✅ **Dados reais** nas estatísticas de obras
- ✅ **Metragem e toneladas** calculadas corretamente
- ✅ **Faturamento** mostrando valores reais
- ✅ **Possibilidade de criar/editar** obras
- ✅ **Sistema de ruas** funcionando
- ✅ **Financeiro das obras** operacional

## 🆘 Se Houver Problemas

1. **Erro de permissão**: Verifique se você tem acesso de admin ao projeto
2. **Erro de sintaxe**: Copie e cole o SQL exatamente como mostrado
3. **Tabela já existe**: Use `DROP TABLE IF EXISTS` antes de criar
4. **Dados não aparecem**: Verifique se as tabelas foram criadas corretamente

## 📞 Suporte

Se precisar de ajuda, me envie:
- Screenshot do erro
- Logs do console da aplicação
- Resultado da verificação de tabelas

