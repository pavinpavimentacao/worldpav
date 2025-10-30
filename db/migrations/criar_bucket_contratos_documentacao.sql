-- ============================================
-- Criação do Bucket para Contratos e Documentação
-- ============================================
-- Este script cria o bucket necessário para armazenar arquivos de contratos e documentação
-- ============================================

-- Bucket para contratos e documentação (PDFs e imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contratos-documentacao', 
  'contratos-documentacao', 
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
-- Políticas RLS para o bucket
-- ============================================

-- Política de SELECT (qualquer usuário autenticado pode ver)
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar arquivos contratos documentacao" ON storage.objects;
CREATE POLICY "Usuários autenticados podem visualizar arquivos contratos documentacao"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contratos-documentacao');

-- Política de INSERT (qualquer usuário autenticado pode fazer upload)
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload contratos documentacao" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload contratos documentacao"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contratos-documentacao');

-- Política de UPDATE (usuários podem atualizar próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem atualizar próprios arquivos contratos documentacao" ON storage.objects;
CREATE POLICY "Usuários podem atualizar próprios arquivos contratos documentacao"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'contratos-documentacao' AND auth.uid() = owner);

-- Política de DELETE (usuários podem deletar próprios arquivos)
DROP POLICY IF EXISTS "Usuários podem deletar próprios arquivos contratos documentacao" ON storage.objects;
CREATE POLICY "Usuários podem deletar próprios arquivos contratos documentacao"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'contratos-documentacao' AND auth.uid() = owner);

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
WHERE name = 'contratos-documentacao';

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- O bucket foi criado/atualizado com sucesso.
-- Agora o upload de arquivos de contratos e documentação deve funcionar!
-- ============================================
