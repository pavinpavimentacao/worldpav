# 🚀 Próximos Passos - Sistema de Colaboradores Detalhado

## ✅ O que foi implementado

- ✅ Migrations SQL com todas as tabelas e campos
- ✅ Types TypeScript completos
- ✅ Utilitários de status e validação
- ✅ Serviço de storage com upload/download
- ✅ Componentes reutilizáveis (FileUpload, DocumentCard)
- ✅ 5 Abas completas (Informações, Documentação, Certificados, Multas, Arquivos)
- ✅ Página principal de detalhes com navegação
- ✅ Rotas atualizadas
- ✅ Lista de colaboradores com botão "Detalhes"
- ✅ Documentação completa

---

## 📋 Ações Necessárias (Manual)

### 1. Aplicar Migração SQL no Banco de Dados

**Arquivo:** `db/migrations/add_colaboradores_detalhamento.sql`

**Opção A - Via Supabase Dashboard:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo SQL
6. Clique em **Run**

**Opção B - Via CLI:**
```bash
# Se tiver supabase CLI instalado
supabase db push

# Ou via psql
psql -h [SEU_HOST] -U postgres -d postgres -f db/migrations/add_colaboradores_detalhamento.sql
```

**Verificação:** Execute no SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN (
  'colaboradores_documentos_nr',
  'colaboradores_certificados',
  'colaboradores_multas',
  'colaboradores_arquivos',
  'email_logs'
);
```
Deve retornar 5 tabelas.

---

### 2. Criar Bucket de Storage no Supabase

**Via Dashboard:**
1. Acesse: **Storage** → **New Bucket**
2. Nome: `colaboradores-documentos`
3. **Public bucket:** Desmarcar (deixar privado)
4. **File size limit:** 10485760 (10MB)
5. **Allowed MIME types:** 
   ```
   application/pdf
   image/png
   image/jpeg
   image/jpg
   application/zip
   application/x-zip-compressed
   ```
6. Clique em **Create bucket**

**Via Código (Automático):**
O sistema tentará criar automaticamente no primeiro upload.

---

### 3. Configurar Políticas RLS no Bucket

No Supabase Dashboard → Storage → `colaboradores-documentos` → Policies:

**Policy 1: SELECT (download)**
```sql
CREATE POLICY "Users can view files from their company"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'colaboradores-documentos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM colaboradores 
    WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
);
```

**Policy 2: INSERT (upload)**
```sql
CREATE POLICY "Users can upload files for their company"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'colaboradores-documentos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM colaboradores 
    WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
);
```

**Policy 3: DELETE**
```sql
CREATE POLICY "Users can delete files from their company"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'colaboradores-documentos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM colaboradores 
    WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
);
```

---

### 4. Instalar Dependência do Resend

```bash
npm install resend
```

---

### 5. Configurar Variáveis de Ambiente

**Arquivo `.env` (local):**
```env
RESEND_API_KEY=re_TnEQuGqc_QFzxPWvdt6wzXQkzaptctRpD
RESEND_FROM_EMAIL=alertas@worldpav.com
APP_URL=http://localhost:5173
```

**Supabase Secrets (produção):**
```bash
# Se tiver Supabase CLI
supabase secrets set RESEND_API_KEY=re_TnEQuGqc_QFzxPWvdt6wzXQkzaptctRpD

# Ou via Dashboard → Project Settings → Edge Functions → Secrets
```

---

### 6. Testar o Sistema

**Teste Básico:**
1. Acesse `/colaboradores`
2. Clique em um colaborador existente ou crie um novo
3. Clique no botão "Detalhes"
4. Navegue pelas 5 abas
5. Tente fazer upload de um arquivo em cada aba
6. Verifique se os arquivos aparecem corretamente

**Verificar no Supabase:**
- Storage: deve aparecer pasta com o ID do colaborador
- Tabelas: devem ter os registros inseridos

---

### 7. Criar Edge Function de E-mail (Opcional por enquanto)

**Arquivo:** `supabase/functions/notificar-documentos-vencidos/index.ts`

Este arquivo precisa ser criado caso queira ativar os e-mails automáticos.

**Template básico:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    // 1. Buscar documentos vencendo/vencidos
    // 2. Agrupar por empresa
    // 3. Buscar destinatários (admins/RH)
    // 4. Enviar e-mail
    // 5. Salvar log
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Deploy:**
```bash
supabase functions deploy notificar-documentos-vencidos
```

---

## 🧪 Checklist de Validação

Após completar os passos acima:

- [ ] Migração SQL executada com sucesso
- [ ] 5 novas tabelas existem no banco
- [ ] Bucket `colaboradores-documentos` criado
- [ ] Políticas RLS configuradas no bucket
- [ ] Dependência `resend` instalada
- [ ] Variáveis de ambiente configuradas
- [ ] Upload de arquivo funciona
- [ ] Download de arquivo funciona
- [ ] Navegação entre abas funciona
- [ ] Auto-save em Informações funciona
- [ ] Certificados podem ser adicionados
- [ ] Multas podem ser registradas
- [ ] Arquivos gerais podem ser enviados

---

## ⚠️ Problemas Conhecidos e Soluções

### "Failed to fetch" ao fazer upload
**Causa:** Bucket não existe ou políticas RLS incorretas  
**Solução:** Verificar passos 2 e 3 acima

### "Permission denied" ao salvar
**Causa:** Políticas RLS nas tabelas não configuradas  
**Solução:** A migração SQL já cria as políticas, verificar se foi executada

### Auto-save não funciona
**Causa:** Problema de permissão ou validação  
**Solução:** Abrir console do navegador (F12) e verificar erros

### Arquivos não aparecem após upload
**Causa:** Path incorreto ou bucket privado sem política de leitura  
**Solução:** Verificar passo 3 (políticas RLS)

---

## 📱 Testando em Produção

Após deploy:

1. **Criar colaborador de teste**
2. **Fazer upload de cada tipo de documento**
3. **Verificar status visual dos documentos**
4. **Testar responsividade mobile**
5. **Verificar performance de carregamento**

---

## 🎯 Próximas Melhorias (Backlog)

Para futuras iterações:

1. **Dashboard de vencimentos** - Visão geral de todos os colaboradores
2. **Filtros avançados** - Filtrar por documentos vencidos
3. **Notificações in-app** - Além de e-mail
4. **Exportação PDF** - Relatório completo de documentação
5. **Histórico de alterações** - Audit trail completo
6. **Assinatura digital** - Para documentos críticos
7. **OCR de documentos** - Extração automática de dados

---

## 📞 Precisa de Ajuda?

Consulte:
1. `Docs/COLABORADORES_DETALHAMENTO.md` - Documentação completa
2. Console do navegador (F12) - Erros em tempo real
3. Supabase Dashboard → Logs - Erros do backend
4. Storage → `colaboradores-documentos` - Verificar arquivos

---

**Última atualização:** 16 de outubro de 2025  
**Status:** ✅ Implementação Completa - Aguardando Configuração Manual


