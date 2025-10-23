# 🔧 Instruções para Corrigir RLS - Documentos e Campos

## ⚠️ **Problemas Atuais:**
- ❌ RLS bloqueando inserções na tabela `colaboradores_documentos`
- ❌ Coluna `funcao` não existe - o campo correto é `position`
- ❌ Falta campos financeiros na tabela `colaboradores`

## 📋 **Instruções para o Supabase Dashboard:**

### **1. Adicionar Campos Financeiros aos Colaboradores**

Execute a migration `08_add_financial_fields_colaboradores.sql` ou os comandos abaixo:

```sql
-- Adicionar campos financeiros
ALTER TABLE public.colaboradores
  ADD COLUMN IF NOT EXISTS tipo_contrato TEXT DEFAULT 'fixo',
  ADD COLUMN IF NOT EXISTS salario_fixo NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_pagamento_1 DATE,
  ADD COLUMN IF NOT EXISTS data_pagamento_2 DATE,
  ADD COLUMN IF NOT EXISTS valor_pagamento_1 NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS valor_pagamento_2 NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS registrado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vale_transporte BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS qtd_passagens_por_dia INTEGER,
  ADD COLUMN IF NOT EXISTS equipamento_vinculado_id UUID;
```

### **2. Remover Constraint Problemática**

A constraint `check_qtd_passagens` está bloqueando updates. Execute:

```sql
-- Remover constraint que causa problemas
ALTER TABLE public.colaboradores 
DROP CONSTRAINT IF EXISTS check_qtd_passagens;

-- Verificar se foi removida
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'colaboradores'::regclass 
AND conname LIKE '%qtd_passagens%';
```

### **3. Desabilitar RLS para colaboradores_documentos**

Acesse o SQL Editor no Supabase e execute:

```sql
-- Desabilitar RLS para colaboradores_documentos
ALTER TABLE colaboradores_documentos DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'colaboradores_documentos';
```

### **2. Verificar se a tabela existe**

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores_documentos'
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### **3. Se a tabela não existir, criar:**

```sql
-- Criar tabela colaboradores_documentos
CREATE TABLE IF NOT EXISTS colaboradores_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'ativo',
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida
CREATE INDEX idx_colaboradores_documentos_colaborador 
ON colaboradores_documentos(colaborador_id);

-- Desabilitar RLS
ALTER TABLE colaboradores_documentos DISABLE ROW LEVEL SECURITY;
```

### **4. Verificar RLS Status:**

```sql
-- Ver todas as tabelas e seu status de RLS
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '🔒 RLS ATIVADO'
    ELSE '✅ RLS DESATIVADO'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('colaboradores', 'colaboradores_documentos', 'companies')
ORDER BY tablename;
```

## ✅ **Resultado Esperado:**

Após executar os comandos, você deve ver:

```
tablename                    | rowsecurity | status
-----------------------------|-------------|------------------
colaboradores                | f           | ✅ RLS DESATIVADO
colaboradores_documentos     | f           | ✅ RLS DESATIVADO
companies                    | f           | ✅ RLS DESATIVADO
```

## 🔍 **Para Verificar se Funcionou:**

No SQL Editor, tente inserir um documento de teste:

```sql
-- Inserir documento de teste (substitua o UUID pelo de um colaborador real)
INSERT INTO colaboradores_documentos (
  colaborador_id,
  document_type,
  file_name,
  file_url,
  file_size,
  status
) VALUES (
  '5300887e-b235-4920-a47f-533d5178484e',  -- Substitua pelo ID real
  'cnh',
  'teste.pdf',
  'https://exemplo.com/teste.pdf',
  1024,
  'ativo'
);

-- Ver se foi inserido
SELECT * FROM colaboradores_documentos 
WHERE document_type = 'cnh' 
LIMIT 1;
```

## 📝 **Nota Importante:**

Após fazer essas mudanças, **NÃO É NECESSÁRIO** reiniciar o servidor Node/Vite. As mudanças no banco de dados são aplicadas imediatamente.

---

**Após executar os comandos acima, teste novamente salvar a CNH no sistema!** ✅

