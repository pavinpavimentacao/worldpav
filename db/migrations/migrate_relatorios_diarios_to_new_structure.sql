-- =====================================================
-- MIGRATION: Atualizar Estrutura de relatorios_diarios
-- =====================================================
-- Migra da estrutura antiga para a nova estrutura
-- =====================================================

-- 1. Verificar se precisamos renomear coluna 'date' para 'data_inicio'
DO $$
BEGIN
  -- Renomear coluna date para data_inicio
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'date'
    AND column_name != 'data_inicio'
  ) THEN
    ALTER TABLE relatorios_diarios RENAME COLUMN date TO data_inicio;
    RAISE NOTICE 'Coluna "date" renomeada para "data_inicio"';
  END IF;
END $$;

-- 2. Adicionar colunas faltantes (mantendo existentes)
DO $$
BEGIN
  -- Adicionar data_fim se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'data_fim'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN data_fim DATE;
    RAISE NOTICE 'Coluna "data_fim" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar horario_inicio se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'horario_inicio'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN horario_inicio TIME;
    RAISE NOTICE 'Coluna "horario_inicio" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar rua_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'rua_id'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN rua_id UUID REFERENCES obras_ruas(id);
    RAISE NOTICE 'Coluna "rua_id" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar equipe_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'equipe_id'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN equipe_id UUID;
    RAISE NOTICE 'Coluna "equipe_id" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar equipe_is_terceira se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'equipe_is_terceira'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN equipe_is_terceira BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna "equipe_is_terceira" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar metragem_feita se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'metragem_feita'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN metragem_feita DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE 'Coluna "metragem_feita" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar toneladas_aplicadas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'toneladas_aplicadas'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN toneladas_aplicadas DECIMAL(10,2) DEFAULT 0;
    RAISE NOTICE 'Coluna "toneladas_aplicadas" adicionada';
  END IF;
END $$;

DO $$
BEGIN
  -- Adicionar espessura_calculada se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'espessura_calculada'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN espessura_calculada DECIMAL(5,2);
    RAISE NOTICE 'Coluna "espessura_calculada" adicionada';
  END IF;
END $$;

-- 3. Garantir que cliente_id existe (renomear de client para clients se necessário)
DO $$
BEGIN
  -- Se não existe cliente_id mas existe algum outro campo de cliente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'relatorios_diarios' 
    AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE relatorios_diarios ADD COLUMN cliente_id UUID;
    RAISE NOTICE 'Coluna "cliente_id" adicionada';
  END IF;
END $$;

-- 4. Adicionar constraints se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'relatorios_diarios_rua_id_fkey'
    AND conrelid = 'relatorios_diarios'::regclass
  ) THEN
    ALTER TABLE relatorios_diarios 
    ADD CONSTRAINT relatorios_diarios_rua_id_fkey 
    FOREIGN KEY (rua_id) REFERENCES obras_ruas(id);
    RAISE NOTICE 'Constraint "relatorios_diarios_rua_id_fkey" adicionada';
  END IF;
END $$;

-- 5. Criar índice em rua_id se não existir
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_rua 
  ON relatorios_diarios(rua_id);

-- 6. Criar índice em data_inicio se não existir
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_data_inicio 
  ON relatorios_diarios(data_inicio);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================


