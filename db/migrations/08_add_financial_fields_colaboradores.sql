-- =====================================================
-- MIGRAÇÃO: Adicionar Campos Financeiros aos Colaboradores
-- Data: 2025-10-22
-- Descrição: Adiciona campos para controle financeiro
-- =====================================================

-- Adicionar campos financeiros
ALTER TABLE public.colaboradores
  ADD COLUMN IF NOT EXISTS tipo_contrato TEXT DEFAULT 'fixo',
  ADD COLUMN IF NOT EXISTS salario_fixo NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_pagamento_1 DATE,
  ADD COLUMN IF NOT EXISTS data_pagamento_2 DATE,
  ADD COLUMN IF NOT EXISTS valor_pagamento_1 NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS valor_pagamento_2 NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS registrado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vale_transporte BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS qtd_passagens_por_dia INTEGER,
  ADD COLUMN IF NOT EXISTS equipamento_vinculado_id UUID REFERENCES public.equipamentos(id) ON DELETE SET NULL;

-- Adicionar comentários
COMMENT ON COLUMN public.colaboradores.tipo_contrato IS 'Tipo de contrato: fixo ou diarista';
COMMENT ON COLUMN public.colaboradores.salario_fixo IS 'Salário fixo mensal ou valor da diária';
COMMENT ON COLUMN public.colaboradores.registrado IS 'Se o colaborador possui registro CLT';
COMMENT ON COLUMN public.colaboradores.vale_transporte IS 'Se o colaborador recebe vale transporte';
COMMENT ON COLUMN public.colaboradores.qtd_passagens_por_dia IS 'Quantidade de passagens de vale transporte por dia';
COMMENT ON COLUMN public.colaboradores.equipamento_vinculado_id IS 'Equipamento vinculado ao colaborador';

-- Criar índice para equipamento_vinculado_id
CREATE INDEX IF NOT EXISTS idx_colaboradores_equipamento_vinculado 
  ON public.colaboradores(equipamento_vinculado_id) 
  WHERE equipamento_vinculado_id IS NOT NULL;


