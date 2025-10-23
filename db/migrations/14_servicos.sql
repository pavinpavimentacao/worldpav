-- =====================================================
-- WORLDPAV - SERVIÇOS
-- =====================================================
-- Catálogo de serviços oferecidos pela empresa
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- =====================================================

-- =====================================================
-- 1. TABELA SERVICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.servicos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados do serviço
  name TEXT NOT NULL,
  description TEXT,
  
  -- Unidade e preço
  unit TEXT, -- m², m³, ton, etc
  unit_price DECIMAL(10, 2),
  
  -- Categoria
  category TEXT,
  
  -- Status
  status status_servico NOT NULL DEFAULT 'ativo',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT servicos_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT servicos_unit_price_positive CHECK (
    unit_price IS NULL OR unit_price >= 0
  )
);

COMMENT ON TABLE public.servicos IS 'Catálogo de serviços oferecidos';
COMMENT ON COLUMN public.servicos.name IS 'Nome do serviço';
COMMENT ON COLUMN public.servicos.unit IS 'Unidade (m², m³, ton, etc)';
COMMENT ON COLUMN public.servicos.unit_price IS 'Preço por unidade';
COMMENT ON COLUMN public.servicos.status IS 'Status: ativo, inativo';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_servicos_company_id 
  ON public.servicos(company_id);

CREATE INDEX IF NOT EXISTS idx_servicos_status 
  ON public.servicos(status);

CREATE INDEX IF NOT EXISTS idx_servicos_category 
  ON public.servicos(category) WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_servicos_deleted_at 
  ON public.servicos(deleted_at);

CREATE INDEX IF NOT EXISTS idx_servicos_name 
  ON public.servicos USING gin(to_tsvector('portuguese', name));

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company servicos"
  ON public.servicos FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company servicos"
  ON public.servicos FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company servicos"
  ON public.servicos FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete servicos"
  ON public.servicos FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT SERVIÇOS
-- =====================================================
-- Próximo script: 15_storage_setup.sql
-- =====================================================


