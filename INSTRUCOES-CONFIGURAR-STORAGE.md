# 🚀 INSTRUÇÕES PARA CONFIGURAR O SUPABASE STORAGE

## 📋 Passo a Passo

### 1️⃣ Acessar o Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Faça login na sua conta
3. Selecione o projeto: **Worldpav**

---

### 2️⃣ Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **+ New query** para criar uma nova query

---

### 3️⃣ Executar o Script SQL

1. Abra o arquivo: `db/migrations/99_criar_todos_buckets_publicos.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter / Cmd+Enter)

---

### 4️⃣ Verificar se deu certo

Após executar o script, você verá **2 tabelas de resultado** no fim:

**Tabela 1 - Buckets Criados:**
```
✅ obras-notas-fiscais       | Público | 10 MB
✅ obras-medicoes            | Público | 10 MB
✅ obras-comprovantes        | Público | 10 MB
✅ contratos-documentacao    | Público | 10 MB
✅ documents                 | Público | 10 MB
✅ colaboradores-documents   | Público | 50 MB
... (e outros)
```

**Tabela 2 - Políticas Criadas:**
```
🔐 Authenticated users can upload files
🔐 Authenticated users can view files
🔐 Authenticated users can update own files
🔐 Authenticated users can delete own files
🌍 Public can view files in public buckets
```

Se você ver estas tabelas, **está tudo OK!** ✅

---

### 5️⃣ Verificar visualmente (opcional)

1. No menu lateral, clique em **Storage**
2. Você deverá ver todos os buckets listados:
   - obras-notas-fiscais
   - obras-medicoes
   - obras-comprovantes
   - contratos-documentacao
   - documents
   - colaboradores-documents
   - colaboradores-photos
   - maquinarios-photos
   - maquinarios-documents
   - obras-photos
   - relatorios-photos
   - contas-pagar-documents
   - general-uploads

---

## ⚠️ Problemas Comuns

### Erro: "relation storage.buckets already exists"
**Solução:** Isso é normal se você já executou o script antes. O script usa `ON CONFLICT DO UPDATE`, então vai apenas atualizar os buckets existentes.

### Erro: "permission denied"
**Solução:** Você precisa estar logado como **owner** do projeto ou ter permissões de admin.

### Não vejo os buckets no Storage
**Solução:** 
1. Atualize a página (F5)
2. Verifique se o script foi executado sem erros
3. Execute novamente a query de verificação no fim do script

---

## 🎯 Próximos Passos

Após criar os buckets, precisamos **corrigir os arquivos TypeScript** que estão usando buckets errados.

Os arquivos que precisam de correção:
- ❌ `NotaFiscalForm.tsx` - trocar `attachments` por `obras-notas-fiscais`
- ❌ `NotaFiscalFormSimple.tsx` - trocar `attachments` por `obras-notas-fiscais`
- ❌ `ContaPagarForm.tsx` - trocar `attachments` por `obras-comprovantes`
- ❌ `AdicionarPagamentoDiretoModal.tsx` - corrigir função de upload

**Essas correções serão feitas automaticamente no próximo passo!**

---

## 📞 Precisa de Ajuda?

Se algo der errado:
1. Copie a mensagem de erro
2. Verifique se está usando o projeto correto
3. Tente executar o script novamente

---

**Após executar este script, confirme para que eu prossiga com a correção dos arquivos TypeScript!** ✅



