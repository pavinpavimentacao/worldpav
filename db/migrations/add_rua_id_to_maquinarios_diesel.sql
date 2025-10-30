-- =====================================================
-- ADICIONAR COLUNA RUA_ID À TABELA MAQUINARIOS_DIESEL
-- =====================================================

-- Adicionar coluna rua_id
ALTER TABLE public.maquinarios_diesel 
ADD COLUMN IF NOT EXISTS rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE SET NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_rua_id 
  ON public.maquinarios_diesel(rua_id) WHERE rua_id IS NOT NULL;

-- Comentário na coluna
COMMENT ON COLUMN public.maquinarios_diesel.rua_id IS 'ID da rua específica onde o abastecimento foi realizado (opcional)';

