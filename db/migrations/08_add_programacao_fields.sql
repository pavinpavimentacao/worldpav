-- =====================================================
-- WORLDPAV - ADICIONAR CAMPOS À PROGRAMAÇÃO
-- =====================================================
-- Adiciona campos faltantes à tabela programacao_pavimentacao
--
-- DEPENDÊNCIAS: 
-- - 07_programacao_pavimentacao.sql
-- =====================================================

-- =====================================================
-- 1. ADICIONAR CAMPOS FALTANTES
-- =====================================================

-- Adicionar campos de metragem e toneladas
ALTER TABLE public.programacao_pavimentacao 
ADD COLUMN IF NOT EXISTS metragem_prevista DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantidade_toneladas DECIMAL(10,2) DEFAULT 0;

-- Adicionar campos de faixa e rua
ALTER TABLE public.programacao_pavimentacao 
ADD COLUMN IF NOT EXISTS faixa_realizar TEXT,
ADD COLUMN IF NOT EXISTS rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE SET NULL;

-- Adicionar campos de horário e espessura
ALTER TABLE public.programacao_pavimentacao 
ADD COLUMN IF NOT EXISTS horario_inicio TIME,
ADD COLUMN IF NOT EXISTS espessura_media_solicitada DECIMAL(5,2);

-- Adicionar campos de tipo de serviço
ALTER TABLE public.programacao_pavimentacao 
ADD COLUMN IF NOT EXISTS tipo_servico TEXT,
ADD COLUMN IF NOT EXISTS espessura DECIMAL(5,2);

-- =====================================================
-- 2. COMENTÁRIOS DOS NOVOS CAMPOS
-- =====================================================

COMMENT ON COLUMN public.programacao_pavimentacao.metragem_prevista IS 'Metragem prevista em m²';
COMMENT ON COLUMN public.programacao_pavimentacao.quantidade_toneladas IS 'Quantidade de toneladas programadas';
COMMENT ON COLUMN public.programacao_pavimentacao.faixa_realizar IS 'Faixa de asfalto a ser realizada';
COMMENT ON COLUMN public.programacao_pavimentacao.rua_id IS 'ID da rua específica da programação';
COMMENT ON COLUMN public.programacao_pavimentacao.horario_inicio IS 'Horário de início da programação';
COMMENT ON COLUMN public.programacao_pavimentacao.espessura_media_solicitada IS 'Espessura média solicitada em cm';
COMMENT ON COLUMN public.programacao_pavimentacao.tipo_servico IS 'Tipo de serviço a ser realizado';
COMMENT ON COLUMN public.programacao_pavimentacao.espessura IS 'Espessura em cm';

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para busca por rua
CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_rua_id 
ON public.programacao_pavimentacao(rua_id);

-- Índice para busca por faixa
CREATE INDEX IF NOT EXISTS idx_programacao_pavimentacao_faixa 
ON public.programacao_pavimentacao(faixa_realizar);

-- =====================================================
-- 4. ATUALIZAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Atualizar programações existentes com valores padrão se necessário
-- UPDATE public.programacao_pavimentacao 
-- SET metragem_prevista = 0, quantidade_toneladas = 0 
-- WHERE metragem_prevista IS NULL OR quantidade_toneladas IS NULL;
