# 📸 Configuração do Bucket guardas-fotos

## ⚠️ IMPORTANTE
O bucket **NÃO PODE** ser criado via SQL diretamente. Use uma das opções abaixo:

---

## 🎯 OPÇÃO 1: Via Dashboard do Supabase (RECOMENDADO - Mais Rápido)

### Passo a Passo:

1. **Acesse o Dashboard do Supabase**
   - URL: https://app.supabase.com
   - Selecione seu projeto

2. **Vá para Storage**
   - Menu lateral → **Storage**

3. **Criar Novo Bucket**
   - Clique em **"New bucket"**
   
4. **Configurar o Bucket**
   ```
   Nome: guardas-fotos
   Public bucket: ✅ ATIVADO
   File size limit: 5242880 (5MB em bytes)
   Allowed MIME types: 
     - image/jpeg
     - image/jpg
     - image/png
     - image/webp
   ```

5. **Criar o Bucket**
   - Clique em **"Create bucket"**

6. **Configurar Políticas RLS**
   - Após criar o bucket, vá para **"Policies"**
   - Clique em **"New Policy"** para cada uma:

   **Política 1: SELECT (Visualizar)**
   ```
   Nome: Usuários autenticados podem visualizar fotos
   Target roles: authenticated
   USING: bucket_id = 'guardas-fotos'
   ```

   **Política 2: INSERT (Upload)**
   ```
   Nome: Usuários autenticados podem fazer upload
   Target roles: authenticated
   WITH CHECK: bucket_id = 'guardas-fotos'
   ```

   **Política 3: UPDATE (Atualizar)**
   ```
   Nome: Usuários autenticados podem atualizar
   Target roles: authenticated
   USING: bucket_id = 'guardas-fotos'
   ```

   **Política 4: DELETE (Deletar)**
   ```
   Nome: Usuários autenticados podem deletar
   Target roles: authenticated
   USING: bucket_id = 'guardas-fotos'
   ```

✅ **Pronto!** O bucket está configurado.

---

## 🎯 OPÇÃO 2: Via Script Node.js (Automatizado)

Execute o script `scripts/setup-guardas-bucket.js`:

```bash
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/GESTÃO\ ASFALTO/Worldpav\ -\ Ultimo/worldpav
node scripts/setup-guardas-bucket.js
```

---

## ✅ Verificação

Após criar o bucket, verifique se está funcionando:

1. **No Dashboard do Supabase:**
   - Storage → Deve aparecer **guardas-fotos**
   - Clique no bucket → Deve estar vazio (normal)

2. **Via SQL (apenas para verificar):**
   ```sql
   -- Verificar se o bucket existe
   SELECT * FROM storage.buckets WHERE name = 'guardas-fotos';
   
   -- Verificar políticas
   SELECT * FROM pg_policies 
   WHERE tablename = 'objects' 
     AND schemaname = 'storage'
     AND policyname LIKE '%guardas%';
   ```

---

## 🧪 Testar Upload

1. Abra a aplicação no browser
2. Vá para **Guardas** → **Diárias**
3. Clique em **Nova Diária**
4. Preencha os campos obrigatórios
5. **Arraste uma foto** para a área de upload
6. A foto deve aparecer como preview
7. Clique em **Registrar Diária**
8. Se tudo estiver OK, você verá:
   - ✅ Toast: "Fazendo upload da foto..."
   - ✅ Toast: "Diária registrada com sucesso!"

---

## 🐛 Troubleshooting

### Erro: "Bucket not found"
- Certifique-se que o nome do bucket é exatamente `guardas-fotos`
- Verifique se o bucket está criado no Dashboard

### Erro: "Permission denied"
- Verifique se as políticas RLS estão configuradas
- Confirme que o usuário está autenticado

### Erro: "File too large"
- O limite é 5MB
- Comprima a imagem antes de fazer upload

### Foto não aparece
- Verifique se o bucket está marcado como **public**
- Teste a URL diretamente no navegador

---

## 📁 Estrutura de Pastas

As fotos serão salvas com o seguinte padrão:

```
guardas-fotos/
  └── diarias/
      ├── temp_1699876543210_abc123.jpg
      ├── temp_1699876544321_def456.png
      └── ...
```

**Nota:** Os arquivos começam com `temp_` porque são criados antes da diária ter um ID definitivo. Isso é normal e funciona perfeitamente.

---

## 🔄 Próximos Passos

1. ✅ Criar bucket via Dashboard (OPÇÃO 1) ou Script (OPÇÃO 2)
2. ✅ Testar upload de foto no modal
3. ✅ Verificar visualização da foto nos detalhes da diária
4. ✅ Confirmar que a URL está sendo salva no banco de dados

---

**Dúvidas?** Verifique os logs do navegador (F12 → Console) para mais detalhes sobre erros.





