-- ============================================
-- Adicionar coluna outro_desconto
-- ============================================
-- Esta migração adiciona a coluna outro_desconto que está faltando
-- ============================================

-- Adicionar coluna outro_desconto na tabela obras_notas_fiscais
ALTER TABLE public.obras_notas_fiscais
ADD COLUMN IF NOT EXISTS outro_desconto DECIMAL(12,2) DEFAULT 0;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.obras_notas_fiscais.outro_desconto IS 'Outros descontos aplicados na nota fiscal';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_outro_desconto 
  ON public.obras_notas_fiscais(outro_desconto);

-- Verificação
SELECT 
  'obras_notas_fiscais' as tabela,
  COUNT(*) as total_registros,
  COUNT(outro_desconto) as com_outro_desconto
FROM public.obras_notas_fiscais;

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- A coluna outro_desconto foi adicionada com sucesso.
-- Agora a criação de notas fiscais deve funcionar!
-- ============================================

