-- =====================================================
-- WORLDPAV - COLABORADORES HORAS EXTRAS
-- =====================================================
-- Tabela para gestão de horas extras dos colaboradores
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 04_colaboradores.sql
-- =====================================================

-- =====================================================
-- 1. ENUM TIPO DIA HORA EXTRA
-- =====================================================

DO $$ BEGIN
  CREATE TYPE tipo_dia_hora_extra AS ENUM ('normal', 'sabado', 'domingo', 'feriado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. TABELA COLABORADORES_HORAS_EXTRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_horas_extras (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados da hora extra
  data DATE NOT NULL,
  horas DECIMAL(5, 2) NOT NULL,
  valor_calculado DECIMAL(10, 2) NOT NULL,
  tipo_dia tipo_dia_hora_extra NOT NULL DEFAULT 'normal',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT colaboradores_horas_extras_horas_positivo CHECK (horas > 0),
  CONSTRAINT colaboradores_horas_extras_valor_positivo CHECK (valor_calculado >= 0)
);

COMMENT ON TABLE public.colaboradores_horas_extras IS 'Horas extras dos colaboradores';
COMMENT ON COLUMN public.colaboradores_horas_extras.data IS 'Data da hora extra';
COMMENT ON COLUMN public.colaboradores_horas_extras.horas IS 'Quantidade de horas extras';
COMMENT ON COLUMN public.colaboradores_horas_extras.valor_calculado IS 'Valor calculado da hora extra';
COMMENT ON COLUMN public.colaboradores_horas_extras.tipo_dia IS 'Tipo de dia: normal (50%), sabado (50%), domingo (100%), feriado (100%)';

-- =====================================================
-- 3. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_colaboradores_horas_extras_colaborador_id 
  ON public.colaboradores_horas_extras(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_horas_extras_data 
  ON public.colaboradores_horas_extras(data);

CREATE INDEX IF NOT EXISTS idx_colaboradores_horas_extras_tipo_dia 
  ON public.colaboradores_horas_extras(tipo_dia);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.colaboradores_horas_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company horas extras"
  ON public.colaboradores_horas_extras FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_horas_extras.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company horas extras"
  ON public.colaboradores_horas_extras FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_horas_extras.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company horas extras"
  ON public.colaboradores_horas_extras FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_horas_extras.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete own company horas extras"
  ON public.colaboradores_horas_extras FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_horas_extras.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

