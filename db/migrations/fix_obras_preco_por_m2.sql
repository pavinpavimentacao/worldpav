-- =====================================================
-- FIX: Adicionar campo preco_por_m2 na tabela obras
-- =====================================================
-- Este campo é essencial para o cálculo de faturamento
-- previsto e para passagem correta do valor para as abas
-- de Ruas e Notas/Medições
-- =====================================================

-- 1. Adicionar campo se não existir
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2);

-- 2. Definir valor padrão para obras existentes sem preço
UPDATE obras
SET preco_por_m2 = 25.00
WHERE preco_por_m2 IS NULL;

-- 3. Adicionar comentário explicativo
COMMENT ON COLUMN obras.preco_por_m2 IS 'Preço cobrado por metro quadrado nesta obra. Usado para calcular faturamento previsto (metragem planejada × preço) e faturamento real (metragem executada × preço)';

-- 4. Verificação
DO $$
DECLARE
  obras_sem_preco INTEGER;
BEGIN
  SELECT COUNT(*) INTO obras_sem_preco
  FROM obras
  WHERE preco_por_m2 IS NULL;
  
  IF obras_sem_preco > 0 THEN
    RAISE WARNING 'Atenção: % obra(s) ainda sem preço por m² definido!', obras_sem_preco;
  ELSE
    RAISE NOTICE '✅ Todas as obras têm preço por m² definido!';
  END IF;
END $$;

-- 5. Exibir relatório
SELECT 
  id,
  name,
  preco_por_m2,
  CASE 
    WHEN preco_por_m2 IS NULL THEN '❌ Sem preço'
    WHEN preco_por_m2 = 25.00 THEN '⚠️  Preço padrão'
    ELSE '✅ Preço customizado'
  END AS status
FROM obras
ORDER BY created_at DESC;



