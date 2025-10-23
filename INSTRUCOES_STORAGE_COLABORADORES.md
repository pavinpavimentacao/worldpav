# 📦 CONFIGURAÇÃO DO STORAGE PARA COLABORADORES

## ❌ Problema
O bucket `colaboradores-documents` não existe ou tem políticas RLS muito restritivas, impedindo o upload de arquivos de colaboradores (multas, certificados, documentos, etc).

**Erros comuns:**
```
StorageApiError: new row violates row-level security policy
Invalid key: 5300887e-.../Fatura de Locação - Félix Mix.pdf
```

---

## ✅ Solução Completa

### Passo 1: Criar Bucket Manualmente no Supabase

#### Opção A: Via Interface (Recomendado)

1. **Acesse o Storage**
   - Vá para: https://supabase.com/dashboard/project/ztcwsztsiuevwmgyfyzh
   - Clique em **Storage** no menu lateral
   - Clique em **Create a new bucket**

2. **Configurar o Bucket**
   - **Name**: `colaboradores-documents`
   - **Public bucket**: ❌ **NÃO** (mantenha privado)
   - **File size limit**: `10 MB` (10485760 bytes)
   - **Allowed MIME types**: 
     ```
     application/pdf
     image/png
     image/jpeg
     image/jpg
     application/zip
     application/x-zip-compressed
     ```

3. **Clique em "Save"**

#### Opção B: Via SQL

Execute no **SQL Editor**:

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'colaboradores-documents',
  'colaboradores-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/zip', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO NOTHING;
```

---

### Passo 2: Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as **políticas RLS** para permitir upload e download.

#### Via Interface (Recomendado)

1. No **Storage**, clique no bucket `colaboradores-documents`
2. Clique na aba **Policies**
3. Adicione 4 políticas:

**Política 1: SELECT (Ver arquivos)**
- Name: `Allow authenticated SELECT`
- Policy definition: `(bucket_id = 'colaboradores-documents')`
- Target roles: `authenticated`
- Action: `SELECT`

**Política 2: INSERT (Upload)**
- Name: `Allow authenticated INSERT`
- Policy definition: `(bucket_id = 'colaboradores-documents')`
- Target roles: `authenticated`
- Action: `INSERT`

**Política 3: UPDATE (Atualizar)**
- Name: `Allow authenticated UPDATE`
- Policy definition: `(bucket_id = 'colaboradores-documents')`
- Target roles: `authenticated`
- Action: `UPDATE`

**Política 4: DELETE (Deletar)**
- Name: `Allow authenticated DELETE`
- Policy definition: `(bucket_id = 'colaboradores-documents')`
- Target roles: `authenticated`
- Action: `DELETE`

#### Via SQL

Execute no **SQL Editor**:

```sql
-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow authenticated SELECT" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated INSERT" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated DELETE" ON storage.objects;

-- Criar novas políticas
CREATE POLICY "Allow authenticated SELECT" ON storage.objects
  FOR SELECT 
  TO authenticated
  USING (bucket_id = 'colaboradores-documents');

CREATE POLICY "Allow authenticated INSERT" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'colaboradores-documents');

CREATE POLICY "Allow authenticated UPDATE" ON storage.objects
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'colaboradores-documents');

CREATE POLICY "Allow authenticated DELETE" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'colaboradores-documents');
```

---

### Passo 3: Verificar Configuração

Execute no **SQL Editor** para verificar:

```sql
-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'colaboradores-documents';

-- Verificar políticas (deve retornar 4 linhas)
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%authenticated%';
```

**Resultado esperado:**
- 1 linha do bucket com o nome `colaboradores-documents`
- 4 políticas (SELECT, INSERT, UPDATE, DELETE)

---

## 🐛 Problema com Nomes de Arquivos

### Erro:
```
StorageApiError: Invalid key: 5300887e-.../Fatura de Locação - Félix Mix.pdf
```

### ✅ Solução Aplicada Automaticamente

O código foi atualizado para **sanitizar automaticamente** os nomes dos arquivos:

**Antes:**
```
Fatura de Locação - Félix Mix - Irmãos Muffato.pdf
```

**Depois:**
```
Fatura_de_Locacao_Felix_Mix_Irmaos_Muffato_1761220053745_i8xudd.pdf
```

**O que é removido:**
- ✅ Acentos: `ç`, `á`, `é`, `í`, `ó`, `ú`, `ã`, `õ`
- ✅ Espaços → `_`
- ✅ Caracteres especiais: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`

**Nenhuma ação necessária** - a correção já está no código!

---

## 🧪 Testar Upload

Após configurar tudo:

1. Vá para **Colaboradores** no sistema
2. Clique em um colaborador
3. Vá para a aba **Arquivos**
4. Tente fazer upload de um arquivo PDF
5. Deve aparecer a mensagem: **"Arquivo enviado com sucesso!"**

---

## ⚠️ Problemas Comuns

### 1. Erro: "new row violates row-level security policy"
**Causa:** Políticas RLS não foram criadas ou estão incorretas.
**Solução:** Execute o script SQL do Passo 2.

### 2. Erro: "Invalid key"
**Causa:** Nome do arquivo com caracteres especiais.
**Solução:** Código já corrige automaticamente. Recarregue a página.

### 3. Erro: "Bucket not found"
**Causa:** Bucket não foi criado.
**Solução:** Execute o script SQL do Passo 1.

### 4. Upload não salva no banco
**Causa:** Políticas RLS da tabela `colaboradores_arquivos` estão bloqueando.
**Solução:** Execute:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own company arquivos" ON public.colaboradores_arquivos;
DROP POLICY IF EXISTS "Users can insert own company arquivos" ON public.colaboradores_arquivos;
DROP POLICY IF EXISTS "Users can update own company arquivos" ON public.colaboradores_arquivos;
DROP POLICY IF EXISTS "Users can delete own company arquivos" ON public.colaboradores_arquivos;

-- Criar políticas mais permissivas
CREATE POLICY "Allow all SELECT on colaboradores_arquivos"
  ON public.colaboradores_arquivos FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on colaboradores_arquivos"
  ON public.colaboradores_arquivos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on colaboradores_arquivos"
  ON public.colaboradores_arquivos FOR UPDATE
  USING (true);

CREATE POLICY "Allow all DELETE on colaboradores_arquivos"
  ON public.colaboradores_arquivos FOR DELETE
  USING (true);
```

---

## 📋 Checklist Final

- [ ] Bucket `colaboradores-documents` criado
- [ ] 4 políticas RLS configuradas no Storage
- [ ] Políticas RLS da tabela `colaboradores_arquivos` configuradas
- [ ] Upload de arquivo testado com sucesso
- [ ] Arquivo aparece na lista de arquivos
- [ ] Download do arquivo funciona
- [ ] Exclusão do arquivo funciona

---

## 🎉 Pronto!

Agora você pode fazer upload de arquivos de colaboradores sem problemas!
