-- =====================================================
-- WORLDPAV - PROGRAMAÇÃO DE PAVIMENTAÇÃO
-- =====================================================
-- Sistema de programação visual de pavimentação
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA PROGRAMACAO_PAVIMENTACAO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.programacao_pavimentacao (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Data e turno
  date DATE NOT NULL,
  shift turno, -- 'manha', 'tarde', 'noite'
  
  -- Status
  status status_programacao NOT NULL DEFAULT 'programado',
  
  -- Equipe
  team TEXT,
  
  -- Equipamentos (array de nomes ou IDs)
  equipment TEXT[],
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.programacao_pavimentacao IS 'Programação de pavimentação (calendário visual)';
COMMENT ON COLUMN public.programacao_pavimentacao.date IS 'Data da programação';
COMMENT ON COLUMN public.programacao_pavimentacao.shift IS 'Turno: manha, tarde, noite';
COMMENT ON COLUMN public.programacao_pavimentacao.status IS 'Status: programado, andamento, concluido, cancelado';
COMMENT ON COLUMN public.programacao_pavimentacao.team IS 'Nome/identificação da equipe';
COMMENT ON COLUMN public.programacao_pavimentacao.equipment IS 'Array de equipamentos utilizados';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_company_id 
  ON public.programacao_pavimentacao(company_id);

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_obra_id 
  ON public.programacao_pavimentacao(obra_id);

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_date 
  ON public.programacao_pavimentacao(date DESC);

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_status 
  ON public.programacao_pavimentacao(status);

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_deleted_at 
  ON public.programacao_pavimentacao(deleted_at);

CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_company_date 
  ON public.programacao_pavimentacao(company_id, date DESC);

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_programacao_pavimentacao_updated_at
  BEFORE UPDATE ON public.programacao_pavimentacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.programacao_pavimentacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company programacao_pavimentacao"
  ON public.programacao_pavimentacao FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company programacao_pavimentacao"
  ON public.programacao_pavimentacao FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company programacao_pavimentacao"
  ON public.programacao_pavimentacao FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete programacao_pavimentacao"
  ON public.programacao_pavimentacao FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT PROGRAMAÇÃO PAVIMENTAÇÃO
-- =====================================================
-- Próximo script: 08_relatorios_diarios.sql
-- =====================================================


