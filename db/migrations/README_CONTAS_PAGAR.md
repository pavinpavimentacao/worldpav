# 🚀 Guia de Instalação - Módulo Contas a Pagar

## 📋 Pré-requisitos

- Acesso ao Supabase Dashboard ou CLI
- Credenciais de administrador do banco de dados

---

## 🔧 Passos para Instalação

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Faça login em [https://app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto WorldPav

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New Query"

3. **Execute a Migração**
   - Copie todo o conteúdo do arquivo `create_contas_pagar.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione `Ctrl + Enter`

4. **Verifique a Criação**
   ```sql
   -- Execute esta query para verificar
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'contas_pagar';
   ```

5. **Configure o Storage (se necessário)**
   - Vá em "Storage" no menu lateral
   - Verifique se o bucket `attachments` existe
   - Se não existir, crie-o com as seguintes configurações:
     - Nome: `attachments`
     - Público: ✅ Sim
     - Allowed MIME types: `application/pdf, image/jpeg, image/jpg, image/png`

### Opção 2: Via Supabase CLI

```bash
# Navegue até o diretório do projeto
cd /path/to/Worldpav

# Execute a migração
supabase db push --file db/migrations/create_contas_pagar.sql

# OU usando psql diretamente
psql $DATABASE_URL -f db/migrations/create_contas_pagar.sql
```

### Opção 3: Via psql (Terminal)

```bash
# Conecte ao banco de dados
psql -h [SEU_HOST] -U [SEU_USUARIO] -d [SEU_DATABASE]

# Execute o arquivo
\i db/migrations/create_contas_pagar.sql

# Verifique a criação
\dt contas_pagar
```

---

## ✅ Verificação da Instalação

Execute as seguintes queries para verificar se tudo foi criado corretamente:

### 1. Verificar Tabela
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'contas_pagar';
```

### 2. Verificar Colunas
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contas_pagar'
ORDER BY ordinal_position;
```

### 3. Verificar Índices
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'contas_pagar';
```

### 4. Verificar Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'contas_pagar';
```

### 5. Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'contas_pagar';
```

---

## 🎯 Teste Inicial

Após a instalação, teste a criação de uma conta:

```sql
-- Inserir uma conta de teste
INSERT INTO public.contas_pagar (
  numero_nota,
  valor,
  data_emissao,
  data_vencimento,
  fornecedor,
  descricao,
  categoria,
  status
) VALUES (
  'NF-TESTE-001',
  1500.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'Fornecedor Teste Ltda',
  'Teste do sistema de contas a pagar',
  'Materiais',
  'Pendente'
) RETURNING *;
```

### Verificar se a conta foi criada
```sql
SELECT * FROM contas_pagar WHERE numero_nota = 'NF-TESTE-001';
```

### Limpar dados de teste (opcional)
```sql
DELETE FROM contas_pagar WHERE numero_nota = 'NF-TESTE-001';
```

---

## 🔐 Configuração do Storage

### Criar Bucket no Supabase Storage

1. **Via Dashboard:**
   - Acesse "Storage" no menu lateral
   - Clique em "New bucket"
   - Nome: `attachments`
   - Público: ✅ Sim
   - Clique em "Create bucket"

2. **Configurar Políticas do Bucket:**

```sql
-- Política para permitir upload (INSERT)
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Política para permitir leitura (SELECT)
CREATE POLICY "Arquivos públicos podem ser lidos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');

-- Política para permitir atualização (UPDATE)
CREATE POLICY "Usuários autenticados podem atualizar seus arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'attachments')
WITH CHECK (bucket_id = 'attachments');

-- Política para permitir exclusão (DELETE)
CREATE POLICY "Usuários autenticados podem deletar seus arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');
```

---

## 🐛 Resolução de Problemas

### Erro: "relation already exists"
```sql
-- A tabela já existe, você pode:
-- 1. Deletar a tabela existente (CUIDADO!)
DROP TABLE IF EXISTS contas_pagar CASCADE;

-- 2. Ou apenas pular este erro e continuar
```

### Erro: "permission denied"
```bash
# Verifique se você tem permissões de superuser
# Conecte como superuser ou solicite ao administrador
```

### Erro: "function uuid_generate_v4() does not exist"
```sql
-- Instale a extensão uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: RLS não está funcionando
```sql
-- Verifique se RLS está habilitado
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

-- Liste as políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'contas_pagar';
```

---

## 📊 Estrutura Final

Após a instalação bem-sucedida, você terá:

✅ Tabela `contas_pagar` com 18 colunas  
✅ 5 índices para performance  
✅ 2 triggers automáticos  
✅ 4 políticas RLS  
✅ Bucket `attachments` configurado  
✅ Políticas de storage  

---

## 🔄 Rollback (Desfazer Instalação)

Se precisar remover o módulo:

```sql
-- Desabilitar RLS
ALTER TABLE contas_pagar DISABLE ROW LEVEL SECURITY;

-- Remover políticas
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar contas a pagar" ON contas_pagar;
DROP POLICY IF EXISTS "Usuários autenticados podem criar contas a pagar" ON contas_pagar;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contas a pagar" ON contas_pagar;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar contas a pagar" ON contas_pagar;

-- Remover triggers
DROP TRIGGER IF EXISTS trigger_update_contas_pagar_updated_at ON contas_pagar;
DROP TRIGGER IF EXISTS trigger_atualizar_status_conta_pagar ON contas_pagar;

-- Remover funções
DROP FUNCTION IF EXISTS update_contas_pagar_updated_at();
DROP FUNCTION IF EXISTS atualizar_status_conta_pagar();

-- Remover tabela
DROP TABLE IF EXISTS contas_pagar CASCADE;
```

---

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs do Supabase
2. Consulte a documentação em `CONTAS_PAGAR_IMPLEMENTADO.md`
3. Entre em contato com a equipe de desenvolvimento

---

**Status:** 📝 Documentação completa  
**Versão:** 1.0.0  
**Data:** 21 de outubro de 2025






