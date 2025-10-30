-- =====================================================
-- WORLDPAV - CONFIGURAÇÃO DO SUPABASE STORAGE
-- =====================================================
-- Execute este script no Supabase SQL Editor para criar o bucket de documentos
-- =====================================================

-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Bucket privado
  10485760, -- 10MB limite
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS para o bucket
-- Política para permitir upload de arquivos autenticados
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Política para permitir visualização de arquivos autenticados
CREATE POLICY "Users can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Política para permitir atualização de arquivos autenticados
CREATE POLICY "Users can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Política para permitir exclusão de arquivos autenticados
CREATE POLICY "Users can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Verificar se o bucket foi criado
SELECT * FROM storage.buckets WHERE id = 'documents';
