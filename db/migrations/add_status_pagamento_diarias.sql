-- =====================================================
-- ADD STATUS_PAGAMENTO E DATA_PAGAMENTO - CONTROLE_DIARIO_DIARIAS
-- =====================================================
-- Adiciona campos para controle de pagamento de diárias
-- =====================================================

-- Adicionar coluna status_pagamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'status_pagamento'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN status_pagamento TEXT DEFAULT 'pendente';
    
    RAISE NOTICE 'Coluna "status_pagamento" adicionada';
  END IF;
END $$;

-- Adicionar coluna data_pagamento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'data_pagamento'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN data_pagamento DATE;
    
    RAISE NOTICE 'Coluna "data_pagamento" adicionada';
  END IF;
END $$;

-- Adicionar data_diaria (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'data_diaria'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN data_diaria DATE;
    
    RAISE NOTICE 'Coluna "data_diaria" adicionada';
  END IF;
END $$;

-- Adicionar updated_at (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    
    RAISE NOTICE 'Coluna "updated_at" adicionada';
  END IF;
END $$;

-- Criar índice para status_pagamento
CREATE INDEX IF NOT EXISTS idx_controle_diario_diarias_status_pagamento 
  ON public.controle_diario_diarias(status_pagamento);

-- Atualizar registros existentes para definir status_pagamento como 'pendente'
UPDATE public.controle_diario_diarias 
SET status_pagamento = 'pendente' 
WHERE status_pagamento IS NULL;

-- Adicionar comentários
COMMENT ON COLUMN public.controle_diario_diarias.status_pagamento IS 'Status do pagamento: pendente, pago, cancelado';
COMMENT ON COLUMN public.controle_diario_diarias.data_pagamento IS 'Data em que o pagamento foi realizado';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

