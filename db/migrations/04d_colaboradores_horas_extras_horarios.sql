-- =====================================================
-- WORLDPAV - ADICIONAR HORÁRIOS DE ENTRADA E SAÍDA
-- =====================================================
-- Adiciona campos de horário de entrada e saída na tabela
-- de horas extras para cálculo automático
--
-- DEPENDÊNCIAS: 
-- - 04c_colaboradores_horas_extras.sql
-- =====================================================

-- Adicionar colunas de horário de entrada e saída
ALTER TABLE public.colaboradores_horas_extras
ADD COLUMN IF NOT EXISTS horario_entrada TIME,
ADD COLUMN IF NOT EXISTS horario_saida TIME;

-- Comentários
COMMENT ON COLUMN public.colaboradores_horas_extras.horario_entrada IS 'Horário de entrada do colaborador';
COMMENT ON COLUMN public.colaboradores_horas_extras.horario_saida IS 'Horário de saída do colaborador';


