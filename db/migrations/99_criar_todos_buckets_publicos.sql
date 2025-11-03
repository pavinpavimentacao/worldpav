-- ============================================
-- WORLDPAV - CRIAÇÃO DE TODOS OS BUCKETS (PÚBLICOS)
-- ============================================
-- Este script cria TODOS os buckets necessários como PÚBLICOS
-- para simplificar o desenvolvimento e uso do storage
-- 
-- Execute este script no Supabase SQL Editor
-- ============================================

-- ============================================
-- REMOVER BUCKETS EXISTENTES (se houver)
-- ============================================
-- Descomente as linhas abaixo apenas se precisar recriar tudo do zero
-- DELETE FROM storage.objects WHERE bucket_id IN (SELECT id FROM storage.buckets);
-- DELETE FROM storage.buckets;

-- ============================================
-- CRIAR BUCKETS PRINCIPAIS
-- ============================================

-- 1. Obras - Notas Fiscais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-notas-fiscais', 
  'obras-notas-fiscais', 
  true, 
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

-- 2. Obras - Medições
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-medicoes', 
  'obras-medicoes', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
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
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 3. Obras - Comprovantes
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

-- 4. Contratos e Documentação
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

-- 5. Documentos Gerais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
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
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 6. Colaboradores - Documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'colaboradores-documents', 
  'colaboradores-documents', 
  true, 
  52428800, -- 50MB (para arquivos maiores como zips)
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed'
  ];

-- 7. Colaboradores - Fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'colaboradores-photos', 
  'colaboradores-photos', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 8. Maquinários - Fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maquinarios-photos', 
  'maquinarios-photos', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 9. Maquinários - Documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'maquinarios-documents', 
  'maquinarios-documents', 
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

-- 10. Obras - Fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obras-photos', 
  'obras-photos', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 11. Relatórios - Fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'relatorios-photos', 
  'relatorios-photos', 
  true, 
  10485760, -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

-- 12. Contas a Pagar - Documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contas-pagar-documents', 
  'contas-pagar-documents', 
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

-- 13. General Uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'general-uploads', 
  'general-uploads', 
  true, 
  10485760 -- 10MB
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- ============================================
-- LIMPAR POLÍTICAS RLS ANTIGAS
-- ============================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- ============================================
-- CRIAR POLÍTICAS RLS SIMPLES E PÚBLICAS
-- ============================================

-- Política 1: Qualquer usuário AUTENTICADO pode fazer UPLOAD
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 2: Qualquer usuário AUTENTICADO pode VER arquivos
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (true);

-- Política 3: Qualquer usuário AUTENTICADO pode ATUALIZAR seus próprios arquivos
CREATE POLICY "Authenticated users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (auth.uid() = owner);

-- Política 4: Qualquer usuário AUTENTICADO pode DELETAR seus próprios arquivos
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);

-- Política 5: Acesso PÚBLICO para leitura (importante para buckets públicos)
CREATE POLICY "Public can view files in public buckets"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id IN (
    SELECT id FROM storage.buckets WHERE public = true
  )
);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todos os buckets criados
SELECT 
  id,
  name,
  CASE 
    WHEN public THEN '✅ Público'
    ELSE '🔒 Privado'
  END as tipo,
  ROUND(file_size_limit / 1048576.0, 2) || ' MB' as tamanho_max,
  array_length(allowed_mime_types, 1) as tipos_permitidos,
  created_at
FROM storage.buckets 
ORDER BY name;

-- Listar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN roles::text LIKE '%public%' THEN '🌍 Público'
    WHEN roles::text LIKE '%authenticated%' THEN '🔐 Autenticado'
    ELSE '👤 Restrito'
  END as acesso,
  cmd as operacao
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;

-- ============================================
-- ✅ SUCESSO!
-- ============================================
-- Todos os buckets foram criados como PÚBLICOS
-- As políticas permitem:
-- - Upload, visualização, atualização e deleção para usuários autenticados
-- - Visualização pública para todos os buckets
-- 
-- Agora você pode fazer upload de arquivos facilmente!
-- ============================================

