-- =====================================================
-- WORLDPAV - GUARDAS DE TRÂNSITO
-- =====================================================
-- Sistema de controle de guardas de trânsito
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA GUARDAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.guardas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados do guarda
  guard_name TEXT NOT NULL,
  
  -- Data e turno
  date DATE NOT NULL,
  shift turno, -- 'manha', 'tarde', 'noite'
  
  -- Horas e valores
  hours DECIMAL(5, 2) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status status_guarda NOT NULL DEFAULT 'agendado',
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT guardas_values_positive CHECK (
    hours > 0 AND
    hourly_rate > 0 AND
    total_amount > 0
  )
);

COMMENT ON TABLE public.guardas IS 'Guardas de trânsito em obras';
COMMENT ON COLUMN public.guardas.guard_name IS 'Nome do guarda';
COMMENT ON COLUMN public.guardas.shift IS 'Turno: manha, tarde, noite';
COMMENT ON COLUMN public.guardas.hours IS 'Horas trabalhadas';
COMMENT ON COLUMN public.guardas.hourly_rate IS 'Valor por hora';
COMMENT ON COLUMN public.guardas.total_amount IS 'Valor total';
COMMENT ON COLUMN public.guardas.status IS 'Status: agendado, realizado, cancelado';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_guardas_company_id 
  ON public.guardas(company_id);

CREATE INDEX IF NOT EXISTS idx_guardas_obra_id 
  ON public.guardas(obra_id);

CREATE INDEX IF NOT EXISTS idx_guardas_date 
  ON public.guardas(date DESC);

CREATE INDEX IF NOT EXISTS idx_guardas_status 
  ON public.guardas(status);

CREATE INDEX IF NOT EXISTS idx_guardas_deleted_at 
  ON public.guardas(deleted_at);

-- =====================================================
-- 3. TRIGGER PARA CALCULAR TOTAL
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_guarda_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount = NEW.hours * NEW.hourly_rate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_guarda_total
  BEFORE INSERT OR UPDATE ON public.guardas
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_guarda_total();

COMMENT ON FUNCTION public.calculate_guarda_total() IS 'Calcula automaticamente total (horas * valor_hora)';

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.guardas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company guardas"
  ON public.guardas FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company guardas"
  ON public.guardas FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company guardas"
  ON public.guardas FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete guardas"
  ON public.guardas FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT GUARDAS
-- =====================================================
-- Próximo script: 11_contas_pagar.sql
-- =====================================================


