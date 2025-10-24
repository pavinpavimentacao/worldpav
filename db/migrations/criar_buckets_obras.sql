-- ============================================
-- Criação dos Buckets para Obras
-- ============================================
-- Este script cria os buckets necessários para o sistema de obras
-- ============================================

-- 1. Bucket para notas fiscais (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-notas-fiscais', 
  'obras-notas-fiscais', 
  true, 
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- 2. Bucket para medições (Excel/PDF)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-medicoes', 
  'obras-medicoes', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

-- 3. Bucket para comprovantes (PDFs/Imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-comprovantes', 
  'obras-comprovantes', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- ============================================
-- Políticas RLS para os buckets
-- ============================================

-- Política de SELECT (qualquer usuário autenticado pode ver)
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar arquivos obras" ON storage.objects;
CREATE POLICY "Usuários autenticados podem visualizar arquivos obras"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes'));

-- Política de INSERT (qualquer usuário autenticado pode fazer upload)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload obras" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload obras"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes'));

-- Política de UPDATE (usuários podem atualizar próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem atualizar próprios arquivos obras" ON storage.objects;
CREATE POLICY "Usuários podem atualizar próprios arquivos obras"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes') AND auth.uid() = owner);

-- Política de DELETE (usuários podem deletar próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem deletar próprios arquivos obras" ON storage.objects;
CREATE POLICY "Usuários podem deletar próprios arquivos obras"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes') AND auth.uid() = owner);

-- ============================================
-- Verificação final
-- ============================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes')
ORDER BY name;

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- Os buckets foram criados/atualizados com sucesso.
-- Agora o upload de arquivos deve funcionar!
-- ============================================

