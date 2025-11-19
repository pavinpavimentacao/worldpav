-- Limpar faturamentos incorretos criados com fallback de R$ 25
-- A aba Financeiro agora busca diretamente das ruas (obras_ruas)

-- Fazer soft delete dos faturamentos existentes
UPDATE obras_financeiro_faturamentos
SET deleted_at = NOW()
WHERE deleted_at IS NULL
  AND preco_por_m2 = 25; -- Apenas os criados com fallback

-- Log
DO $$
BEGIN
  RAISE NOTICE 'Faturamentos com fallback (R$ 25/m²) marcados como excluídos';
  RAISE NOTICE 'A aba Financeiro buscará os dados diretamente das ruas finalizadas';
END $$;




