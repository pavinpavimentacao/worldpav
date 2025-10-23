-- =====================================================
-- WORLDPAV - COLABORADORES
-- =====================================================
-- Tabelas para gestão completa de colaboradores:
-- - colaboradores (dados principais)
-- - colaboradores_documentos (documentação e uploads)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- =====================================================

-- =====================================================
-- 1. TABELA COLABORADORES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados pessoais
  name TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  birth_date DATE,
  
  -- Contato
  email TEXT,
  phone TEXT,
  
  -- Endereço
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Dados profissionais
  position TEXT, -- Função/cargo
  tipo_equipe tipo_equipe, -- 'pavimentacao', 'maquinas', 'apoio'
  status status_colaborador NOT NULL DEFAULT 'ativo',
  hire_date DATE,
  
  -- Foto
  photo_url TEXT, -- URL no Storage
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT colaboradores_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

COMMENT ON TABLE public.colaboradores IS 'Colaboradores da empresa';
COMMENT ON COLUMN public.colaboradores.company_id IS 'Empresa do colaborador (isolamento multi-tenant)';
COMMENT ON COLUMN public.colaboradores.tipo_equipe IS 'Tipo de equipe: pavimentacao, maquinas, apoio';
COMMENT ON COLUMN public.colaboradores.status IS 'Status: ativo, inativo, ferias, afastado';
COMMENT ON COLUMN public.colaboradores.photo_url IS 'URL da foto no Supabase Storage';
COMMENT ON COLUMN public.colaboradores.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 2. TABELA COLABORADORES_DOCUMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_documentos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados do documento
  document_type TEXT NOT NULL, -- RG, CPF, CNH, Certificado, etc
  file_url TEXT NOT NULL, -- URL no Storage
  file_name TEXT NOT NULL,
  file_size INTEGER, -- Tamanho em bytes
  
  -- Datas
  upload_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expiry_date DATE, -- Data de validade (para CNH, certificados, etc)
  
  -- Status
  status status_documento NOT NULL DEFAULT 'ativo',
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT colaboradores_documentos_file_size_positive CHECK (
    file_size IS NULL OR file_size > 0
  )
);

COMMENT ON TABLE public.colaboradores_documentos IS 'Documentos dos colaboradores (RG, CPF, CNH, certificados, etc)';
COMMENT ON COLUMN public.colaboradores_documentos.document_type IS 'Tipo: RG, CPF, CNH, Certificado, etc';
COMMENT ON COLUMN public.colaboradores_documentos.file_url IS 'URL do arquivo no Supabase Storage';
COMMENT ON COLUMN public.colaboradores_documentos.expiry_date IS 'Data de validade do documento';
COMMENT ON COLUMN public.colaboradores_documentos.status IS 'Status: ativo, vencido, proximo_vencimento';
COMMENT ON COLUMN public.colaboradores_documentos.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 3. ÍNDICES - COLABORADORES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_colaboradores_company_id 
  ON public.colaboradores(company_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf 
  ON public.colaboradores(cpf) WHERE cpf IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_colaboradores_status 
  ON public.colaboradores(status);

CREATE INDEX IF NOT EXISTS idx_colaboradores_tipo_equipe 
  ON public.colaboradores(tipo_equipe) WHERE tipo_equipe IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_colaboradores_deleted_at 
  ON public.colaboradores(deleted_at);

CREATE INDEX IF NOT EXISTS idx_colaboradores_company_status_active 
  ON public.colaboradores(company_id, status, deleted_at);

CREATE INDEX IF NOT EXISTS idx_colaboradores_name 
  ON public.colaboradores USING gin(to_tsvector('portuguese', name));

-- =====================================================
-- 4. ÍNDICES - COLABORADORES_DOCUMENTOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_colaborador_id 
  ON public.colaboradores_documentos(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_document_type 
  ON public.colaboradores_documentos(document_type);

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_status 
  ON public.colaboradores_documentos(status);

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_expiry_date 
  ON public.colaboradores_documentos(expiry_date) 
  WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_deleted_at 
  ON public.colaboradores_documentos(deleted_at);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_colaboradores_updated_at
  BEFORE UPDATE ON public.colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. TRIGGER PARA ATUALIZAR STATUS DE DOCUMENTOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_colaboradores_documentos_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se tem data de validade, atualizar status
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status = 'vencido';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'proximo_vencimento';
    ELSE
      NEW.status = 'ativo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_colaboradores_documentos_status
  BEFORE INSERT OR UPDATE ON public.colaboradores_documentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_colaboradores_documentos_status();

COMMENT ON FUNCTION public.update_colaboradores_documentos_status() 
  IS 'Atualiza status do documento baseado na data de validade';

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) - COLABORADORES
-- =====================================================

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company colaboradores"
  ON public.colaboradores FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company colaboradores"
  ON public.colaboradores FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company colaboradores"
  ON public.colaboradores FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete colaboradores"
  ON public.colaboradores FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) - COLABORADORES_DOCUMENTOS
-- =====================================================

ALTER TABLE public.colaboradores_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company colaboradores_documentos"
  ON public.colaboradores_documentos FOR SELECT
  USING (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company colaboradores_documentos"
  ON public.colaboradores_documentos FOR INSERT
  WITH CHECK (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company colaboradores_documentos"
  ON public.colaboradores_documentos FOR UPDATE
  USING (
    deleted_at IS NULL AND
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Admins can delete colaboradores_documentos"
  ON public.colaboradores_documentos FOR DELETE
  USING (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
      AND is_user_admin()
    )
  );

-- =====================================================
-- FIM DO SCRIPT COLABORADORES
-- =====================================================
-- Próximo script: 05_controle_diario.sql
-- =====================================================


