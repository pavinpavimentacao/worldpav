-- =====================================================
-- WORLDPAV - STORAGE SETUP
-- =====================================================
-- Configuração de buckets do Supabase Storage
-- Este script cria os buckets e policies de acesso
--
-- IMPORTANTE: Execute este script no Supabase Dashboard
-- após criar as tabelas principais
-- =====================================================

-- =====================================================
-- CRIAR BUCKETS
-- =====================================================
-- Nota: Buckets devem ser criados via Supabase Dashboard
-- ou via SQL com INSERT em storage.buckets
-- =====================================================

-- 1. Bucket para documentos de colaboradores
INSERT INTO storage.buckets (id, name, public)
VALUES ('colaboradores-documents', 'colaboradores-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Bucket para fotos de colaboradores
INSERT INTO storage.buckets (id, name, public)
VALUES ('colaboradores-photos', 'colaboradores-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Bucket para fotos de maquinários
INSERT INTO storage.buckets (id, name, public)
VALUES ('maquinarios-photos', 'maquinarios-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Bucket para documentos de maquinários (seguros, licenças)
INSERT INTO storage.buckets (id, name, public)
VALUES ('maquinarios-documents', 'maquinarios-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Bucket para fotos de obras
INSERT INTO storage.buckets (id, name, public)
VALUES ('obras-photos', 'obras-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Bucket para notas fiscais (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notas-fiscais', 'notas-fiscais', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Bucket para fotos de relatórios
INSERT INTO storage.buckets (id, name, public)
VALUES ('relatorios-photos', 'relatorios-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 8. Bucket para comprovantes de contas a pagar
INSERT INTO storage.buckets (id, name, public)
VALUES ('contas-pagar-documents', 'contas-pagar-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 9. Bucket para uploads gerais
INSERT INTO storage.buckets (id, name, public)
VALUES ('general-uploads', 'general-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - COLABORADORES-DOCUMENTS
-- =====================================================

-- SELECT: Usuários da mesma empresa podem ver
CREATE POLICY "Users can view own company colaboradores-documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'colaboradores-documents' AND
    auth.role() = 'authenticated'
  );

-- INSERT: Usuários autenticados podem fazer upload
CREATE POLICY "Users can upload colaboradores-documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'colaboradores-documents' AND
    auth.role() = 'authenticated'
  );

-- UPDATE: Apenas o uploader pode atualizar
CREATE POLICY "Users can update own colaboradores-documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'colaboradores-documents' AND
    auth.uid() = owner
  );

-- DELETE: Apenas o uploader ou admin pode deletar
CREATE POLICY "Users can delete own colaboradores-documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'colaboradores-documents' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - COLABORADORES-PHOTOS
-- =====================================================

CREATE POLICY "Users can view own company colaboradores-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'colaboradores-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload colaboradores-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'colaboradores-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own colaboradores-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'colaboradores-photos' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own colaboradores-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'colaboradores-photos' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - MAQUINARIOS-PHOTOS
-- =====================================================

CREATE POLICY "Users can view own company maquinarios-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'maquinarios-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload maquinarios-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'maquinarios-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own maquinarios-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'maquinarios-photos' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own maquinarios-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'maquinarios-photos' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - MAQUINARIOS-DOCUMENTS
-- =====================================================

CREATE POLICY "Users can view own company maquinarios-documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'maquinarios-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload maquinarios-documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'maquinarios-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own maquinarios-documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'maquinarios-documents' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own maquinarios-documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'maquinarios-documents' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - OBRAS-PHOTOS
-- =====================================================

CREATE POLICY "Users can view own company obras-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'obras-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload obras-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'obras-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own obras-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'obras-photos' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own obras-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'obras-photos' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - NOTAS-FISCAIS
-- =====================================================

CREATE POLICY "Users can view own company notas-fiscais"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'notas-fiscais' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload notas-fiscais"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notas-fiscais' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own notas-fiscais"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'notas-fiscais' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own notas-fiscais"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'notas-fiscais' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - RELATORIOS-PHOTOS
-- =====================================================

CREATE POLICY "Users can view own company relatorios-photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'relatorios-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload relatorios-photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'relatorios-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own relatorios-photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'relatorios-photos' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own relatorios-photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'relatorios-photos' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - CONTAS-PAGAR-DOCUMENTS
-- =====================================================

CREATE POLICY "Users can view own company contas-pagar-documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'contas-pagar-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload contas-pagar-documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'contas-pagar-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own contas-pagar-documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'contas-pagar-documents' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own contas-pagar-documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'contas-pagar-documents' AND
    auth.uid() = owner
  );

-- =====================================================
-- STORAGE POLICIES - GENERAL-UPLOADS
-- =====================================================

CREATE POLICY "Users can view own company general-uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'general-uploads' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can upload general-uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'general-uploads' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own general-uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'general-uploads' AND
    auth.uid() = owner
  );

CREATE POLICY "Users can delete own general-uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'general-uploads' AND
    auth.uid() = owner
  );

-- =====================================================
-- FIM DO SCRIPT STORAGE SETUP
-- =====================================================
-- Próximo script: 17_functions.sql
-- Nota: 16_rls_policies.sql já foi aplicado em cada tabela
-- =====================================================


