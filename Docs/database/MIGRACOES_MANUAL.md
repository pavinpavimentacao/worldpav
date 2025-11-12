# 🚀 Guia de Migrações - WorldPav

## ❌ Problema Identificado

As tabelas principais do sistema não existem no banco de dados Supabase:
- ❌ `obras` - Tabela principal de obras
- ❌ `maquinarios` - Tabela de máquinas/equipamentos  
- ❌ `relatorios_diarios` - Tabela de relatórios
- ❌ `contas_pagar` - Tabela financeira

## ✅ Tabelas que Existem

- ✅ `companies` - Empresas (1 registro)
- ✅ `clients` - Clientes (1 registro)  
- ✅ `colaboradores` - Colaboradores (0 registros)
- ✅ `bombas` - Bombas (1 registro)
- ✅ `notas_fiscais` - Notas fiscais (0 registros)

## 🔧 Solução: Aplicar Migrações Manualmente

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `rgsovlqsezjeqohlbyod`

### Passo 2: Abrir o SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar as Migrações

Execute os seguintes SQLs **na ordem exata**:

#### 1. Criar Tabela Obras (PRINCIPAL)

```sql
-- =====================================================
-- CRIAR TABELA OBRAS
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

#### 2. Criar Tabela Maquinários

```sql
-- =====================================================
-- CRIAR TABELA MAQUINARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  model TEXT,
  year INTEGER,
  status TEXT DEFAULT 'ativo',
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.maquinarios IS 'Máquinas e equipamentos da empresa';
```

#### 3. Criar Tabela Relatórios Diários

```sql
-- =====================================================
-- CRIAR TABELA RELATORIOS_DIARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.relatorios_diarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT,
  weather TEXT,
  temperature DECIMAL(5,2),
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.relatorios_diarios IS 'Relatórios diários de obras';
```

#### 4. Criar Tabela Contas a Pagar

```sql
-- =====================================================
-- CRIAR TABELA CONTAS_PAGAR
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  numero_nota TEXT NOT NULL,
  valor DECIMAL(15, 2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT DEFAULT 'Pendente',
  fornecedor TEXT,
  descricao TEXT,
  categoria TEXT,
  data_pagamento DATE,
  valor_pago DECIMAL(15, 2),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.contas_pagar IS 'Contas a pagar da empresa';
```

### Passo 4: Verificar se as Tabelas Foram Criadas

Execute este SQL para verificar:

```sql
-- =====================================================
-- VERIFICAR TABELAS CRIADAS
-- =====================================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('obras', 'maquinarios', 'relatorios_diarios', 'contas_pagar')
    THEN '✅ CRIADA'
    ELSE '⚠️  OUTRA'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('obras', 'maquinarios', 'relatorios_diarios', 'contas_pagar')
ORDER BY table_name;
```

### Passo 5: Testar a Aplicação

Após criar as tabelas:

1. Volte para a aplicação: http://localhost:5173
2. Verifique se os erros de "tabela não encontrada" desapareceram
3. Teste criar uma obra, cliente ou colaborador

## 🎯 Resultado Esperado

Após aplicar as migrações, você deve ver:

```
✅ obras - X registros
✅ maquinarios - X registros  
✅ relatorios_diarios - X registros
✅ contas_pagar - X registros
```

## 🆘 Se Houver Problemas

1. **Erro de permissão**: Verifique se você tem acesso de admin ao projeto
2. **Erro de sintaxe**: Copie e cole o SQL exatamente como mostrado
3. **Tabela já existe**: Use `DROP TABLE IF EXISTS` antes de criar

## 📞 Suporte

Se precisar de ajuda, me envie:
- Screenshot do erro
- Logs do console da aplicação
- Resultado da verificação de tabelas

