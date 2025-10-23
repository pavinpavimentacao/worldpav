-- =====================================================
-- MIGRAÇÃO: Adicionar Campos Financeiros em Colaboradores
-- Data: 2025-10-22
-- Descrição: Adiciona campos de informações financeiras e contratuais
--            que eram usados nos mocks mas faltavam no banco
-- =====================================================

-- Adicionar campos financeiros
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS tipo_contrato TEXT DEFAULT 'fixo',
ADD COLUMN IF NOT EXISTS salario_fixo DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_pagamento_1 TEXT,
ADD COLUMN IF NOT EXISTS data_pagamento_2 TEXT,
ADD COLUMN IF NOT EXISTS valor_pagamento_1 DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS valor_pagamento_2 DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS registrado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vale_transporte BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qtd_passagens_por_dia INTEGER,
ADD COLUMN IF NOT EXISTS equipamento_vinculado_id UUID,
ADD COLUMN IF NOT EXISTS equipe_id TEXT;

-- Comentários
COMMENT ON COLUMN public.colaboradores.tipo_contrato IS 'Tipo de contrato: fixo ou diarista';
COMMENT ON COLUMN public.colaboradores.salario_fixo IS 'Salário fixo mensal (para contratos fixos)';
COMMENT ON COLUMN public.colaboradores.data_pagamento_1 IS 'Data do primeiro pagamento mensal';
COMMENT ON COLUMN public.colaboradores.data_pagamento_2 IS 'Data do segundo pagamento mensal';
COMMENT ON COLUMN public.colaboradores.valor_pagamento_1 IS 'Valor do primeiro pagamento';
COMMENT ON COLUMN public.colaboradores.valor_pagamento_2 IS 'Valor do segundo pagamento';
COMMENT ON COLUMN public.colaboradores.registrado IS 'Se o colaborador é registrado (CLT)';
COMMENT ON COLUMN public.colaboradores.vale_transporte IS 'Se recebe vale transporte';
COMMENT ON COLUMN public.colaboradores.qtd_passagens_por_dia IS 'Quantidade de passagens por dia';
COMMENT ON COLUMN public.colaboradores.equipamento_vinculado_id IS 'ID do equipamento vinculado ao colaborador';
COMMENT ON COLUMN public.colaboradores.equipe_id IS 'ID da equipe/turma do colaborador';

-- Validações
ALTER TABLE public.colaboradores
ADD CONSTRAINT check_tipo_contrato CHECK (tipo_contrato IN ('fixo', 'diarista')),
ADD CONSTRAINT check_salario_fixo CHECK (salario_fixo >= 0),
ADD CONSTRAINT check_qtd_passagens CHECK (qtd_passagens_por_dia IS NULL OR qtd_passagens_por_dia > 0);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
