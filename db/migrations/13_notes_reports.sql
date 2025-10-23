-- =====================================================
-- WORLDPAV - ANOTAÇÕES E REPORTS
-- =====================================================
-- Sistema de anotações e reports gerenciais
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Criador
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Conteúdo
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Suporta Markdown
  
  -- Relacionamento polimórfico
  related_to_id UUID,
  related_to_type TEXT, -- 'obra', 'relatorio', 'cliente', etc
  
  -- Status e prioridade
  status status_note NOT NULL DEFAULT 'ativa',
  priority prioridade_note NOT NULL DEFAULT 'media',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT notes_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT notes_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

COMMENT ON TABLE public.notes IS 'Anotações gerais (suporta Markdown)';
COMMENT ON COLUMN public.notes.created_by IS 'Usuário que criou a anotação';
COMMENT ON COLUMN public.notes.content IS 'Conteúdo em Markdown';
COMMENT ON COLUMN public.notes.related_to_type IS 'Tipo: obra, relatorio, cliente, etc';
COMMENT ON COLUMN public.notes.status IS 'Status: ativa, resolvida, arquivada';
COMMENT ON COLUMN public.notes.priority IS 'Prioridade: baixa, media, alta';

-- =====================================================
-- 2. TABELA REPORTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reports (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Criador
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Dados do report
  title TEXT NOT NULL,
  type TEXT,
  
  -- Conteúdo (JSON estruturado)
  content JSONB DEFAULT '{}'::jsonb,
  
  -- Filtros aplicados (JSON)
  filters JSONB DEFAULT '{}'::jsonb,
  
  -- Obra relacionada (opcional)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Período
  period_start DATE,
  period_end DATE,
  
  -- Status
  status status_relatorio NOT NULL DEFAULT 'rascunho',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT reports_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

COMMENT ON TABLE public.reports IS 'Reports gerenciais customizáveis';
COMMENT ON COLUMN public.reports.created_by IS 'Usuário que criou o report';
COMMENT ON COLUMN public.reports.content IS 'Conteúdo estruturado em JSON';
COMMENT ON COLUMN public.reports.filters IS 'Filtros aplicados em JSON';
COMMENT ON COLUMN public.reports.status IS 'Status: rascunho, finalizado';

-- =====================================================
-- 3. ÍNDICES - NOTES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notes_company_id 
  ON public.notes(company_id);

CREATE INDEX IF NOT EXISTS idx_notes_created_by 
  ON public.notes(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notes_status 
  ON public.notes(status);

CREATE INDEX IF NOT EXISTS idx_notes_priority 
  ON public.notes(priority);

CREATE INDEX IF NOT EXISTS idx_notes_related_to 
  ON public.notes(related_to_id, related_to_type) 
  WHERE related_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notes_deleted_at 
  ON public.notes(deleted_at);

CREATE INDEX IF NOT EXISTS idx_notes_content 
  ON public.notes USING gin(to_tsvector('portuguese', content));

-- =====================================================
-- 4. ÍNDICES - REPORTS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reports_company_id 
  ON public.reports(company_id);

CREATE INDEX IF NOT EXISTS idx_reports_created_by 
  ON public.reports(created_by) WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_obra_id 
  ON public.reports(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_status 
  ON public.reports(status);

CREATE INDEX IF NOT EXISTS idx_reports_type 
  ON public.reports(type) WHERE type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_deleted_at 
  ON public.reports(deleted_at);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) - NOTES
-- =====================================================

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company notes"
  ON public.notes FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company notes"
  ON public.notes FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company notes"
  ON public.notes FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete notes"
  ON public.notes FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) - REPORTS
-- =====================================================

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company reports"
  ON public.reports FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company reports"
  ON public.reports FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company reports"
  ON public.reports FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete reports"
  ON public.reports FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT NOTES E REPORTS
-- =====================================================
-- Próximo script: 14_servicos.sql
-- =====================================================


