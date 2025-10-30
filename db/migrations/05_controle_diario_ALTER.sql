-- =====================================================
-- WORLDPAV - CONTROLE DIÁRIO (ALTERAÇÕES)
-- =====================================================
-- Migração para adicionar funcionalidades faltantes:
-- - Adicionar coluna equipe_id em controle_diario_relacoes
-- - Adicionar coluna total_presentes e total_ausencias
-- - Criar tabela controle_diario_presencas
-- =====================================================

-- =====================================================
-- 1. ADICIONAR COLUNAS FALTANTES EM controle_diario_relacoes
-- =====================================================

-- Adicionar equipe_id (pode ser NULL)
ALTER TABLE public.controle_diario_relacoes 
  ADD COLUMN IF NOT EXISTS equipe_id UUID;

COMMENT ON COLUMN public.controle_diario_relacoes.equipe_id IS 'ID da equipe (opcional)';

-- Adicionar total_presentes e total_ausencias
ALTER TABLE public.controle_diario_relacoes 
  ADD COLUMN IF NOT EXISTS total_presentes INTEGER DEFAULT 0;

ALTER TABLE public.controle_diario_relacoes 
  ADD COLUMN IF NOT EXISTS total_ausencias INTEGER DEFAULT 0;

COMMENT ON COLUMN public.controle_diario_relacoes.total_presentes IS 'Total de colaboradores presentes (calculado automaticamente)';
COMMENT ON COLUMN public.controle_diario_relacoes.total_ausencias IS 'Total de ausências (calculado automaticamente)';

-- Adicionar created_by
ALTER TABLE public.controle_diario_relacoes 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.controle_diario_relacoes.created_by IS 'Usuário que criou a relação';

-- Renomear observations para observacoes (se necessário)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'controle_diario_relacoes' 
    AND column_name = 'observations'
    AND column_name != 'observacoes'
  ) THEN
    ALTER TABLE public.controle_diario_relacoes RENAME COLUMN observations TO observacoes;
  END IF;
END $$;

-- =====================================================
-- 2. CRIAR TABELA controle_diario_presencas
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
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: não pode ter presença duplicada para mesmo colaborador na mesma relação
  UNIQUE(relacao_id, colaborador_id)
);

COMMENT ON TABLE public.controle_diario_presencas IS 'Registros de presença individual por colaborador';
COMMENT ON COLUMN public.controle_diario_presencas.status IS 'presente, falta, atestado, mudanca_equipe';
COMMENT ON COLUMN public.controle_diario_presencas.equipe_destino_id IS 'Equipe de destino (se mudou de equipe)';

-- =====================================================
-- 3. ADICIONAR COLUNAS FALTANTES EM controle_diario_diarias
-- =====================================================

-- Adicionar quantidade (se não existir)
ALTER TABLE public.controle_diario_diarias 
  ADD COLUMN IF NOT EXISTS quantidade INTEGER DEFAULT 1;

-- Adicionar data_diaria (se não existir)
ALTER TABLE public.controle_diario_diarias 
  ADD COLUMN IF NOT EXISTS data_diaria DATE;

-- Atualizar data_diaria com valor de date se estiver NULL
UPDATE public.controle_diario_diarias 
SET data_diaria = date 
WHERE data_diaria IS NULL;

-- Tornar data_diaria NOT NULL
ALTER TABLE public.controle_diario_diarias 
  ALTER COLUMN data_diaria SET NOT NULL;

-- Adicionar status_pagamento
ALTER TABLE public.controle_diario_diarias 
  ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'pendente';

-- Renomear observations para observacoes se necessário
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'controle_diario_diarias' 
    AND column_name = 'observations'
    AND column_name != 'observacoes'
  ) THEN
    ALTER TABLE public.controle_diario_diarias RENAME COLUMN observations TO observacoes;
  END IF;
END $$;

COMMENT ON COLUMN public.controle_diario_diarias.quantidade IS 'Quantidade de diárias';
COMMENT ON COLUMN public.controle_diario_diarias.data_diaria IS 'Data da diária';
COMMENT ON COLUMN public.controle_diario_diarias.status_pagamento IS 'Status: pendente, pago, cancelado';

-- =====================================================
-- 4. CRIAR ÍNDICES
-- =====================================================

-- Índices para controle_diario_relacoes
CREATE INDEX IF NOT EXISTS idx_controle_diario_relacoes_equipe_id 
  ON public.controle_diario_relacoes(equipe_id) WHERE equipe_id IS NOT NULL;

-- Índices para controle_diario_presencas
CREATE INDEX IF NOT EXISTS idx_controle_diario_presencas_relacao_id 
  ON public.controle_diario_presencas(relacao_id);

CREATE INDEX IF NOT EXISTS idx_controle_diario_presencas_colaborador_id 
  ON public.controle_diario_presencas(colaborador_id);

-- =====================================================
-- 5. CRIAR TRIGGERS
-- =====================================================

-- Trigger para updated_at em controle_diario_presencas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_controle_diario_presencas_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_controle_diario_presencas_updated_at
      BEFORE UPDATE ON public.controle_diario_presencas
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 6. ATUALIZAR FUNÇÃO update_relacao_totals
-- =====================================================

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

-- Criar triggers para atualizar totais quando presenças são alteradas
DROP TRIGGER IF EXISTS trigger_update_relacao_totals_from_presencas ON public.controle_diario_presencas;
CREATE TRIGGER trigger_update_relacao_totals_from_presencas
  AFTER INSERT OR UPDATE OR DELETE ON public.controle_diario_presencas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) para controle_diario_presencas
-- =====================================================

ALTER TABLE public.controle_diario_presencas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own company controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Users can manage own company controle_diario_presencas" ON public.controle_diario_presencas;

-- Criar políticas
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

-- =====================================================
-- FIM DA MIGRAÇÃO ALTER
-- =====================================================

