-- =====================================================
-- WORLDPAV - RELATÓRIOS DIÁRIOS
-- =====================================================
-- Relatórios diários de progresso de obras
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA RELATORIOS_DIARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.relatorios_diarios (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Data
  date DATE NOT NULL,
  
  -- Condições climáticas
  weather TEXT,
  temperature TEXT,
  
  -- Atividades executadas
  activities TEXT,
  
  -- Materiais utilizados (JSON)
  materials_used JSONB DEFAULT '{}'::jsonb,
  
  -- Equipamentos utilizados (array)
  equipment_used TEXT[],
  
  -- Quantidade de trabalhadores
  workers_count INTEGER,
  
  -- Progresso
  progress_percentage DECIMAL(5, 2),
  
  -- Observações
  observations TEXT,
  
  -- Fotos (array de URLs no Storage)
  photos TEXT[],
  
  -- Status
  status status_relatorio NOT NULL DEFAULT 'rascunho',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT relatorios_diarios_progress_valid CHECK (
    progress_percentage IS NULL OR 
    (progress_percentage >= 0 AND progress_percentage <= 100)
  ),
  CONSTRAINT relatorios_diarios_workers_positive CHECK (
    workers_count IS NULL OR workers_count >= 0
  )
);

COMMENT ON TABLE public.relatorios_diarios IS 'Relatórios diários de obras';
COMMENT ON COLUMN public.relatorios_diarios.materials_used IS 'Materiais utilizados em formato JSON';
COMMENT ON COLUMN public.relatorios_diarios.equipment_used IS 'Array de equipamentos utilizados';
COMMENT ON COLUMN public.relatorios_diarios.progress_percentage IS 'Percentual de progresso (0-100)';
COMMENT ON COLUMN public.relatorios_diarios.photos IS 'Array de URLs de fotos no Supabase Storage';
COMMENT ON COLUMN public.relatorios_diarios.status IS 'Status: rascunho, finalizado';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_company_id 
  ON public.relatorios_diarios(company_id);

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_obra_id 
  ON public.relatorios_diarios(obra_id);

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_date 
  ON public.relatorios_diarios(date DESC);

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_status 
  ON public.relatorios_diarios(status);

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_deleted_at 
  ON public.relatorios_diarios(deleted_at);

CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_company_date 
  ON public.relatorios_diarios(company_id, date DESC);

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_relatorios_diarios_updated_at
  BEFORE UPDATE ON public.relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.relatorios_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company relatorios_diarios"
  ON public.relatorios_diarios FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company relatorios_diarios"
  ON public.relatorios_diarios FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company relatorios_diarios"
  ON public.relatorios_diarios FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete relatorios_diarios"
  ON public.relatorios_diarios FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT RELATÓRIOS DIÁRIOS
-- =====================================================
-- Próximo script: 09_parceiros.sql
-- =====================================================


