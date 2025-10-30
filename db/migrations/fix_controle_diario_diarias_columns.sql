-- =====================================================
-- FIX COLUNAS - CONTROLE_DIARIO_DIARIAS
-- =====================================================
-- Adiciona colunas faltantes na tabela controle_diario_diarias
-- =====================================================

-- Verificar e adicionar coluna 'adicional'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'adicional'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN adicional DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "adicional" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'desconto'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'desconto'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN desconto DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "desconto" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'horas_extras'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'horas_extras'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN horas_extras INTEGER DEFAULT 0;
    
    RAISE NOTICE 'Coluna "horas_extras" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'valor_hora_extra'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'valor_hora_extra'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN valor_hora_extra DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "valor_hora_extra" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'total_horas_extras'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'total_horas_extras'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN total_horas_extras DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "total_horas_extras" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'valor_total'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'valor_total'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN valor_total DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "valor_total" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'quantidade' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'quantidade'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN quantidade INTEGER DEFAULT 1;
    
    RAISE NOTICE 'Coluna "quantidade" adicionada';
  END IF;
END $$;

-- Verificar e adicionar coluna 'valor_unitario' se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'controle_diario_diarias' 
    AND column_name = 'valor_unitario'
  ) THEN
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN valor_unitario DECIMAL(10, 2) DEFAULT 0;
    
    RAISE NOTICE 'Coluna "valor_unitario" adicionada';
  END IF;
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================



