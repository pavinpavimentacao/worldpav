-- =====================================================
-- WORLDPAV - CONTROLE DIÁRIO
-- =====================================================
-- Sistema de controle diário de colaboradores:
-- - controle_diario_relacoes (agrupamento por dia)
-- - controle_diario_diarias (diárias individuais)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- - 04_colaboradores.sql
-- =====================================================

-- =====================================================
-- 1. TABELA CONTROLE_DIARIO_RELACOES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.controle_diario_relacoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Data e obra
  date DATE NOT NULL,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Status
  status status_controle_diario NOT NULL DEFAULT 'rascunho',
  
  -- Totais (calculados automaticamente)
  total_diarias DECIMAL(10, 2) DEFAULT 0,
  total_horas_extras DECIMAL(10, 2) DEFAULT 0,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.controle_diario_relacoes IS 'Relações diárias (agrupamento de diárias por dia)';
COMMENT ON COLUMN public.controle_diario_relacoes.date IS 'Data da relação diária';
COMMENT ON COLUMN public.controle_diario_relacoes.obra_id IS 'Obra relacionada (opcional)';
COMMENT ON COLUMN public.controle_diario_relacoes.status IS 'Status: rascunho, finalizada';
COMMENT ON COLUMN public.controle_diario_relacoes.total_diarias IS 'Total de diárias (calculado automaticamente)';
COMMENT ON COLUMN public.controle_diario_relacoes.total_horas_extras IS 'Total de horas extras (calculado automaticamente)';

-- =====================================================
-- 2. TABELA CONTROLE_DIARIO_DIARIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.controle_diario_diarias (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relação e colaborador
  relacao_id UUID NOT NULL REFERENCES public.controle_diario_relacoes(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE RESTRICT,
  
  -- Data
  date DATE NOT NULL,
  
  -- Diária
  valor_diaria DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Horas extras
  horas_extras INTEGER DEFAULT 0,
  valor_hora_extra DECIMAL(10, 2) DEFAULT 0,
  total_horas_extras DECIMAL(10, 2) DEFAULT 0,
  
  -- Descontos
  multas DECIMAL(10, 2) DEFAULT 0,
  outros_descontos DECIMAL(10, 2) DEFAULT 0,
  
  -- Total líquido (calculado automaticamente)
  total_liquido DECIMAL(10, 2) DEFAULT 0,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT controle_diario_diarias_valores_positive CHECK (
    valor_diaria >= 0 AND
    horas_extras >= 0 AND
    valor_hora_extra >= 0 AND
    total_horas_extras >= 0 AND
    multas >= 0 AND
    outros_descontos >= 0
  ),
  -- Não pode ter diárias duplicadas para mesmo colaborador na mesma relação
  UNIQUE(relacao_id, colaborador_id)
);

COMMENT ON TABLE public.controle_diario_diarias IS 'Diárias individuais de colaboradores';
COMMENT ON COLUMN public.controle_diario_diarias.valor_diaria IS 'Valor da diária';
COMMENT ON COLUMN public.controle_diario_diarias.horas_extras IS 'Quantidade de horas extras';
COMMENT ON COLUMN public.controle_diario_diarias.valor_hora_extra IS 'Valor por hora extra';
COMMENT ON COLUMN public.controle_diario_diarias.total_horas_extras IS 'Total de horas extras (horas * valor)';
COMMENT ON COLUMN public.controle_diario_diarias.total_liquido IS 'Total líquido (calculado automaticamente)';

-- =====================================================
-- 3. ÍNDICES - CONTROLE_DIARIO_RELACOES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_company_id 
  ON public.controle_diario_relacoes(company_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_date 
  ON public.controle_diario_relacoes(date DESC);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_obra_id 
  ON public.controle_diario_relacoes(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_status 
  ON public.controle_diario_relacoes(status);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_deleted_at 
  ON public.controle_diario_relacoes(deleted_at);

-- =====================================================
-- 4. ÍNDICES - CONTROLE_DIARIO_DIARIAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_relacao_id 
  ON public.controle_diario_diarias(relacao_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_colaborador_id 
  ON public.controle_diario_diarias(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_date 
  ON public.controle_diario_diarias(date DESC);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_controle_diario_relacoes_updated_at
  BEFORE UPDATE ON public.controle_diario_relacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. TRIGGER PARA CALCULAR TOTAIS DE DIÁRIA
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_diaria_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular total de horas extras
  NEW.total_horas_extras = NEW.horas_extras * NEW.valor_hora_extra;
  
  -- Calcular total líquido
  NEW.total_liquido = NEW.valor_diaria + NEW.total_horas_extras - NEW.multas - NEW.outros_descontos;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_diaria_totals
  BEFORE INSERT OR UPDATE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_diaria_totals();

COMMENT ON FUNCTION public.calculate_diaria_totals() IS 'Calcula automaticamente totais de horas extras e líquido';

-- =====================================================
-- 7. TRIGGER PARA ATUALIZAR TOTAIS DA RELAÇÃO
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_relacao_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar totais na relação diária
  UPDATE public.controle_diario_relacoes
  SET 
    total_diarias = (
      SELECT COALESCE(SUM(valor_diaria), 0)
      FROM public.controle_diario_diarias
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id)
    ),
    total_horas_extras = (
      SELECT COALESCE(SUM(total_horas_extras), 0)
      FROM public.controle_diario_diarias
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id)
    )
  WHERE id = COALESCE(NEW.relacao_id, OLD.relacao_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_relacao_totals_after_insert
  AFTER INSERT ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

CREATE TRIGGER trigger_update_relacao_totals_after_update
  AFTER UPDATE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

CREATE TRIGGER trigger_update_relacao_totals_after_delete
  AFTER DELETE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

COMMENT ON FUNCTION public.update_relacao_totals() IS 'Atualiza totais da relação diária quando diárias são alteradas';

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) - CONTROLE_DIARIO_RELACOES
-- =====================================================

ALTER TABLE public.controle_diario_relacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) - CONTROLE_DIARIO_DIARIAS
-- =====================================================

ALTER TABLE public.controle_diario_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company controle_diario_diarias"
  ON public.controle_diario_diarias FOR SELECT
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company controle_diario_diarias"
  ON public.controle_diario_diarias FOR INSERT
  WITH CHECK (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company controle_diario_diarias"
  ON public.controle_diario_diarias FOR UPDATE
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Admins can delete controle_diario_diarias"
  ON public.controle_diario_diarias FOR DELETE
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
      AND is_user_admin()
    )
  );

-- =====================================================
-- FIM DO SCRIPT CONTROLE DIÁRIO
-- =====================================================
-- Próximo script: 06_maquinarios.sql
-- =====================================================


