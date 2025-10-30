-- =====================================================
-- WORLDPAV - CONTROLE DIÁRIO (VERSÃO COMPLETA)
-- =====================================================
-- Sistema completo de controle diário de colaboradores:
-- - controle_diario_relacoes (agrupamento por dia)
-- - controle_diario_presencas (registro de presença/ausência)
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
  
  -- Data e equipe
  date DATE NOT NULL,
  equipe_id UUID, -- ID da equipe (pode ser NULL se não houver equipe específica)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Status
  status status_controle_diario NOT NULL DEFAULT 'rascunho',
  
  -- Totais (calculados automaticamente)
  total_presentes INTEGER DEFAULT 0,
  total_ausencias INTEGER DEFAULT 0,
  total_diarias DECIMAL(10, 2) DEFAULT 0,
  total_horas_extras DECIMAL(10, 2) DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  
  -- Controle
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.controle_diario_relacoes IS 'Relações diárias (agrupamento de diárias por dia)';
COMMENT ON COLUMN public.controle_diario_relacoes.date IS 'Data da relação diária';
COMMENT ON COLUMN public.controle_diario_relacoes.equipe_id IS 'ID da equipe (opcional - pode ser equipe manual)';
COMMENT ON COLUMN public.controle_diario_relacoes.obra_id IS 'Obra relacionada (opcional)';
COMMENT ON COLUMN public.controle_diario_relacoes.status IS 'Status: rascunho, finalizada';
COMMENT ON COLUMN public.controle_diario_relacoes.total_presentes IS 'Total de colaboradores presentes';
COMMENT ON COLUMN public.controle_diario_relacoes.total_ausencias IS 'Total de ausências';
COMMENT ON COLUMN public.controle_diario_relacoes.total_diarias IS 'Total de diárias (calculado automaticamente)';
COMMENT ON COLUMN public.controle_diario_relacoes.total_horas_extras IS 'Total de horas extras (calculado automaticamente)';

-- =====================================================
-- 2. TABELA CONTROLE_DIARIO_PRESENCAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.controle_diario_presencas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relação e colaborador
  relacao_id UUID NOT NULL REFERENCES public.controle_diario_relacoes(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE RESTRICT,
  
  -- Status de presença
  status TEXT NOT NULL DEFAULT 'presente', -- 'presente', 'falta', 'atestado', 'mudanca_equipe'
  
  -- Dados de ausência
  equipe_destino_id UUID, -- Se mudou de equipe
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.controle_diario_presencas IS 'Registros de presença individual por colaborador';
COMMENT ON COLUMN public.controle_diario_presencas.status IS 'presente, falta, atestado, mudanca_equipe';
COMMENT ON COLUMN public.controle_diario_presencas.equipe_destino_id IS 'Equipe de destino (se mudou de equipe)';
COMMENT ON COLUMN public.controle_diario_presencas.observacoes IS 'Observações sobre a presença/ausência';

-- =====================================================
-- 3. TABELA CONTROLE_DIARIO_DIARIAS
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
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  adicional DECIMAL(10, 2) DEFAULT 0,
  desconto DECIMAL(10, 2) DEFAULT 0,
  
  -- Horas extras
  horas_extras INTEGER DEFAULT 0,
  valor_hora_extra DECIMAL(10, 2) DEFAULT 0,
  total_horas_extras DECIMAL(10, 2) DEFAULT 0,
  
  -- Total líquido (calculado automaticamente)
  valor_total DECIMAL(10, 2) DEFAULT 0,
  
  -- Datas e status de pagamento
  data_diaria DATE NOT NULL,
  data_pagamento DATE,
  status_pagamento TEXT DEFAULT 'pendente', -- 'pendente', 'pago', 'cancelado'
  
  -- Observações
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT controle_diario_diarias_valores_positive CHECK (
    quantidade >= 0 AND
    valor_unitario >= 0 AND
    adicional >= 0 AND
    desconto >= 0 AND
    horas_extras >= 0 AND
    valor_hora_extra >= 0 AND
    total_horas_extras >= 0
  ),
  -- Não pode ter diárias duplicadas para mesmo colaborador na mesma relação
  UNIQUE(relacao_id, colaborador_id)
);

COMMENT ON TABLE public.controle_diario_diarias IS 'Diárias individuais de colaboradores';
COMMENT ON COLUMN public.controle_diario_diarias.quantidade IS 'Quantidade de diárias';
COMMENT ON COLUMN public.controle_diario_diarias.valor_unitario IS 'Valor por diária';
COMMENT ON COLUMN public.controle_diario_diarias.valor_total IS 'Total calculado (quantidade * unitario + adicional - desconto + horas extras)';
COMMENT ON COLUMN public.controle_diario_diarias.status_pagamento IS 'Status: pendente, pago, cancelado';

-- =====================================================
-- 4. ÍNDICES
-- =====================================================

-- Índices para controle_diario_relacoes
CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_company_id 
  ON public.controle_diario_relacoes(company_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_date 
  ON public.controle_diario_relacoes(date DESC);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_equipe_id 
  ON public.controle_diario_relacoes(equipe_id) WHERE equipe_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_obra_id 
  ON public.controle_diario_relacoes(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_status 
  ON public.controle_diario_relacoes(status);

CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_deleted_at 
  ON public.controle_diario_relacoes(deleted_at);

-- Índices para controle_diario_presencas
CREATE INDEX IF NOT EXISTS idx_controle_diario_presencas_relacao_id 
  ON public.controle_diario_presencas(relacao_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_presencas_colaborador_id 
  ON public.controle_diario_presencas(colaborador_id);

-- Índices para controle_diario_diarias
CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_relacao_id 
  ON public.controle_diario_diarias(relacao_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_colaborador_id 
  ON public.controle_diario_diarias(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_date 
  ON public.controle_diario_diarias(date DESC);

CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_status_pagamento 
  ON public.controle_diario_diarias(status_pagamento);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Trigger para UPDATE updated_at
CREATE TRIGGER trigger_update_controle_diario_relacoes_updated_at
  BEFORE UPDATE ON public.controle_diario_relacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_controle_diario_diarias_updated_at
  BEFORE UPDATE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. FUNCTIONS PARA CALCULOS
-- =====================================================

-- Função para calcular totais de diária
CREATE OR REPLACE FUNCTION public.calculate_diaria_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular total de horas extras
  NEW.total_horas_extras = NEW.horas_extras * NEW.valor_hora_extra;
  
  -- Calcular total líquido
  NEW.valor_total = (NEW.quantidade * NEW.valor_unitario) + NEW.adicional - NEW.desconto + NEW.total_horas_extras;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_diaria_totals
  BEFORE INSERT OR UPDATE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_diaria_totals();

-- Função para atualizar totais da relação
CREATE OR REPLACE FUNCTION public.update_relacao_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar totais na relação diária
  UPDATE public.controle_diario_relacoes
  SET 
    total_presentes = (
      SELECT COUNT(*) 
      FROM public.controle_diario_presencas 
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id) AND status = 'presente'
    ),
    total_ausencias = (
      SELECT COUNT(*) 
      FROM public.controle_diario_presencas 
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id) AND status != 'presente'
    ),
    total_diarias = (
      SELECT COALESCE(SUM(valor_total), 0)
      FROM public.controle_diario_diarias
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id)
    )
  WHERE id = COALESCE(NEW.relacao_id, OLD.relacao_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar totais quando presenças ou diárias são alteradas
CREATE TRIGGER trigger_update_relacao_totals_from_presencas
  AFTER INSERT OR UPDATE OR DELETE ON public.controle_diario_presencas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

CREATE TRIGGER trigger_update_relacao_totals_from_diarias
  AFTER INSERT OR UPDATE OR DELETE ON public.controle_diario_diarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- RLS para controle_diario_relacoes
ALTER TABLE public.controle_diario_relacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR UPDATE
  USING (company_id = get_user_company_id() AND deleted_at IS NULL);

CREATE POLICY "Admins can delete controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR DELETE
  USING (company_id = get_user_company_id() AND is_user_admin());

-- RLS para controle_diario_presencas
ALTER TABLE public.controle_diario_presencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company controle_diario_presencas"
  ON public.controle_diario_presencas FOR SELECT
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can manage own company controle_diario_presencas"
  ON public.controle_diario_presencas FOR ALL
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

-- RLS para controle_diario_diarias
ALTER TABLE public.controle_diario_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company controle_diario_diarias"
  ON public.controle_diario_diarias FOR SELECT
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can manage own company controle_diario_diarias"
  ON public.controle_diario_diarias FOR ALL
  USING (
    relacao_id IN (
      SELECT id FROM public.controle_diario_relacoes 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- FIM DO SCRIPT CONTROLE DIÁRIO COMPLETO
-- =====================================================

