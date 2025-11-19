-- =====================================================
-- WORLDPAV - ADICIONAR TURNO DIURNO E NOTURNO
-- =====================================================
-- Adiciona os valores 'diurno' e 'noturno' ao ENUM tipo_dia_hora_extra
-- para permitir registro de horas extras em turnos noturnos (20h às 05h)
--
-- DEPENDÊNCIAS: 
-- - 04c_colaboradores_horas_extras.sql
-- =====================================================

-- Adicionar novos valores ao ENUM (se não existirem)
DO $$ 
BEGIN
  -- Adicionar 'diurno' se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'diurno' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_dia_hora_extra')
  ) THEN
    ALTER TYPE tipo_dia_hora_extra ADD VALUE 'diurno';
  END IF;

  -- Adicionar 'noturno' se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'noturno' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_dia_hora_extra')
  ) THEN
    ALTER TYPE tipo_dia_hora_extra ADD VALUE 'noturno';
  END IF;
END $$;

-- Atualizar comentário da coluna
COMMENT ON COLUMN public.colaboradores_horas_extras.tipo_dia IS 
  'Tipo de dia/turno: normal (50%), sabado (50%), domingo (100%), feriado (100%), diurno (50%), noturno (50% - turno 20h às 05h)';


