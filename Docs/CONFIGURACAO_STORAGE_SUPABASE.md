# Configuração do Supabase Storage

## 📋 Visão Geral

Este documento explica como configurar os buckets do Supabase Storage para o sistema de Obras, incluindo:
- **Notas Fiscais** (PDFs)
- **Medições** (Excel/PDF)
- **Comprovantes de Despesas** (PDFs e Imagens)

---

## 🪣 Buckets Necessários

### 1. **obras-notas-fiscais**
```sql
Nome: obras-notas-fiscais
Público: Sim
Tamanho máximo: 10MB
Tipos permitidos: application/pdf
```

### 2. **obras-medicoes**
```sql
Nome: obras-medicoes
Público: Sim
Tamanho máximo: 10MB
Tipos permitidos:
  - application/pdf
  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (xlsx)
  - application/vnd.ms-excel (xls)
```

### 3. **obras-comprovantes**
```sql
Nome: obras-comprovantes
Público: Sim
Tamanho máximo: 10MB
Tipos permitidos:
  - application/pdf
  - image/jpeg
  - image/png
  - image/jpg
```

---

## 🚀 Configuração Automática

### Opção 1: Via Script (Recomendado)

```bash
# Execute o script de configuração
node scripts/setup-storage-buckets.js
```

Este script irá:
✅ Verificar se os buckets existem
✅ Criar os buckets que estiverem faltando
✅ Configurar limites de tamanho e tipos de arquivo

---

## 🛠️ Configuração Manual

### Passo 1: Acessar o Dashboard do Supabase
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral

### Passo 2: Criar os Buckets

Para cada bucket necessário:

1. Clique em **"New bucket"**
2. Preencha os dados:
   - **Name**: Nome do bucket (ex: `obras-notas-fiscais`)
   - **Public bucket**: ✅ Ativado
   - **File size limit**: 10485760 (10MB)
   - **Allowed MIME types**: Veja a lista acima
3. Clique em **Create bucket**

### Passo 3: Configurar Políticas RLS (Opcional)

Se você quiser restringir o acesso, adicione políticas RLS:

```sql
-- Política de SELECT (qualquer usuário autenticado pode ver)
CREATE POLICY "Usuários autenticados podem visualizar arquivos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'obras-notas-fiscais');

-- Política de INSERT (qualquer usuário autenticado pode fazer upload)
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'obras-notas-fiscais');

-- Política de DELETE (apenas donos podem deletar)
CREATE POLICY "Usuários podem deletar próprios arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'obras-notas-fiscais' AND auth.uid() = owner);
```

**Repita essas políticas para cada bucket**, alterando o `bucket_id`.

---

## ✅ Verificação

### Teste se os buckets foram criados corretamente:

1. **Via Dashboard**:
   - Acesse Storage → Veja se os 3 buckets aparecem

2. **Via Código**:
```typescript
import { supabase } from './lib/supabase'

async function testBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  
  if (error) {
    console.error('Erro:', error)
    return
  }
  
  console.log('Buckets disponíveis:', data)
  
  // Verificar se os buckets necessários existem
  const requiredBuckets = [
    'obras-notas-fiscais',
    'obras-medicoes', 
    'obras-comprovantes'
  ]
  
  requiredBuckets.forEach(bucket => {
    const exists = data?.some(b => b.name === bucket)
    console.log(`${bucket}: ${exists ? '✅' : '❌'}`)
  })
}

testBuckets()
```

---

## 🧪 Teste de Upload

Após configurar, teste o upload:

1. Acesse uma obra no sistema
2. Vá para **Notas e Medições**
3. Clique em **Nova Nota Fiscal**
4. Arraste um PDF para a área de upload
5. Verifique se o arquivo é enviado com sucesso

Se houver erro, verifique:
- ✅ Os buckets foram criados
- ✅ As variáveis de ambiente estão corretas
- ✅ O usuário está autenticado
- ✅ O tipo de arquivo é permitido
- ✅ O tamanho é menor que 10MB

---

## 🐛 Troubleshooting

### Erro: "Bucket not found"
**Solução**: Verifique se o bucket foi criado no dashboard do Supabase

### Erro: "File type not allowed"
**Solução**: Verifique os tipos MIME permitidos no bucket

### Erro: "File size exceeds limit"
**Solução**: O arquivo deve ter menos de 10MB

### Erro: "Permission denied"
**Solução**: Configure as políticas RLS ou defina o bucket como público

### Upload funciona mas não aparece a URL
**Solução**: Verifique se o bucket está configurado como público

---

## 📚 Referências

- [Documentação oficial do Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas RLS para Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Upload de arquivos](https://supabase.com/docs/guides/storage/uploads)

---

## 🔄 Atualização dos Buckets

Se precisar modificar configurações dos buckets:

```typescript
// Atualizar configuração de um bucket
const { data, error } = await supabase.storage.updateBucket('obras-notas-fiscais', {
  public: true,
  fileSizeLimit: 10485760,
  allowedMimeTypes: ['application/pdf']
})
```

---

## 📝 Notas Importantes

1. **URLs Públicas**: Os buckets devem ser públicos para que as URLs dos arquivos funcionem corretamente
2. **Segurança**: Mesmo com buckets públicos, você pode implementar RLS para controlar uploads/deleções
3. **Limpeza**: Considere implementar uma rotina para deletar arquivos órfãos (não vinculados a registros)
4. **Backup**: Supabase faz backup automático, mas considere uma estratégia adicional para arquivos críticos

---

## ✨ Pronto!

Após seguir estes passos, o sistema de upload de arquivos estará funcionando corretamente! 🎉



