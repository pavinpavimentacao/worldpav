-- =====================================================
-- BUCKET DE STORAGE: GUARDAS FOTOS
-- Bucket para armazenar fotos das diárias de guardas
-- =====================================================

-- 1. Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guardas-fotos',
  'guardas-fotos',
  true, -- Público para facilitar acesso às fotos
  5242880, -- 5MB em bytes
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- 2. Permitir SELECT (visualizar) para usuários autenticados
CREATE POLICY "Usuários autenticados podem visualizar fotos de guardas"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'guardas-fotos');

-- 3. Permitir INSERT (upload) para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guardas-fotos');

-- 4. Permitir UPDATE para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'guardas-fotos');

-- 5. Permitir DELETE para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guardas-fotos');

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE storage.buckets IS 'Bucket guardas-fotos: Armazena fotos das diárias de guardas de segurança. Limite: 5MB por arquivo. Tipos permitidos: JPG, PNG, WebP.';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Listar buckets criados
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'guardas-fotos';

-- Listar políticas criadas
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%guardas%';

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
📋 COMO USAR:

1. Execute este script no SQL Editor do Supabase
2. Verifique se o bucket foi criado corretamente
3. No código, use a função uploadFotoGuarda() do file-upload-utils.ts
4. As fotos serão salvas em: guardas-fotos/diarias/{diariaId}_{timestamp}_{random}.{ext}

🔒 SEGURANÇA:

- Bucket PÚBLICO: Qualquer pessoa com a URL pode ver a foto
- Apenas usuários AUTENTICADOS podem fazer upload/update/delete
- Limite de 5MB por arquivo
- Tipos permitidos: JPG, PNG, WebP

📁 ESTRUTURA DE PASTAS:

guardas-fotos/
  └── diarias/
      ├── {diariaId}_1234567890_abc123.jpg
      ├── {diariaId}_1234567891_def456.png
      └── ...

✅ PRÓXIMOS PASSOS:

1. Testar upload de foto no modal de Nova Diária
2. Verificar se a URL está sendo salva corretamente no banco
3. Confirmar visualização da foto no modal de detalhes
*/





