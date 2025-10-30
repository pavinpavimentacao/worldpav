-- ============================================
-- Correção de Ruas e Faturamentos
-- ============================================
-- Este script corrige:
-- 1. Ruas com metragem_executada mas status diferente de 'concluida'
-- 2. Faturamentos com valores incorretos
-- ============================================

-- 1. Corrigir status de ruas com metragem executada
UPDATE obras_ruas
SET status = 'concluida'
WHERE metragem_executada IS NOT NULL
  AND metragem_executada > 0
  AND status != 'concluida'
  AND deleted_at IS NULL;

-- 2. Garantir que existe data_finalizacao para ruas concluídas
UPDATE obras_ruas
SET data_finalizacao = COALESCE(data_finalizacao, updated_at::date, NOW()::date)
WHERE status = 'concluida'
  AND data_finalizacao IS NULL
  AND deleted_at IS NULL;

-- 3. Garantir que existe espessura_calculada para ruas com metragem e toneladas
UPDATE obras_ruas
SET espessura_calculada = ((toneladas_utilizadas::numeric / metragem_executada::numeric) / 2.4) * 100
WHERE metragem_executada IS NOT NULL
  AND metragem_executada > 0
  AND toneladas_utilizadas IS NOT NULL
  AND toneladas_utilizadas > 0
  AND espessura_calculada IS NULL
  AND deleted_at IS NULL;

-- 4. Garantir que existe preco_por_m2 para ruas concluídas
-- Buscar o preço/m² da obra através dos serviços
DO $$
DECLARE
    rua_record RECORD;
    preco_m2 numeric;
    total_servicos numeric;
    total_metragem numeric;
BEGIN
    FOR rua_record IN 
        SELECT or_.* 
        FROM obras_ruas or_
        WHERE or_.status = 'concluida'
          AND or_.preco_por_m2 IS NULL
          AND or_.deleted_at IS NULL
    LOOP
        -- Buscar total de serviços da obra
        SELECT COALESCE(SUM(valor_total::numeric), 0)
        INTO total_servicos
        FROM obras_servicos
        WHERE obra_id = rua_record.obra_id;

        -- Buscar total de metragem planejada da obra
        SELECT COALESCE(SUM(metragem_planejada::numeric), 0)
        INTO total_metragem
        FROM obras_ruas
        WHERE obra_id = rua_record.obra_id
          AND deleted_at IS NULL;

        -- Calcular preço por m²
        IF total_metragem > 0 THEN
            preco_m2 := total_servicos / total_metragem;

            -- Atualizar rua
            UPDATE obras_ruas
            SET preco_por_m2 = preco_m2
            WHERE id = rua_record.id;

            RAISE NOTICE 'Rua % atualizada com preço R$ % por m²', rua_record.id, preco_m2;
        END IF;
    END LOOP;
END $$;

-- 5. Garantir que existe valor_total para ruas concluídas
UPDATE obras_ruas
SET valor_total = metragem_executada * COALESCE(preco_por_m2, 0)
WHERE status = 'concluida'
  AND metragem_executada IS NOT NULL
  AND valor_total IS NULL
  AND deleted_at IS NULL;

-- 6. Corrigir faturamentos com valores incorretos
-- Atualizar valor_total baseado em metragem * preco_por_m2
UPDATE obras_financeiro_faturamentos
SET valor_total = metragem_executada * preco_por_m2
WHERE deleted_at IS NULL;

-- Verificar resultados
DO $$
DECLARE
    total_ruas_corrigidas INTEGER;
    total_faturamentos INTEGER;
    total_faturado NUMERIC;
BEGIN
    -- Contar ruas concluídas
    SELECT COUNT(*) INTO total_ruas_corrigidas
    FROM obras_ruas
    WHERE status = 'concluida'
      AND deleted_at IS NULL;

    -- Contar faturamentos
    SELECT COUNT(*) INTO total_faturamentos
    FROM obras_financeiro_faturamentos
    WHERE deleted_at IS NULL;

    -- Total faturado
    SELECT COALESCE(SUM(valor_total), 0) INTO total_faturado
    FROM obras_financeiro_faturamentos
    WHERE deleted_at IS NULL;

    RAISE NOTICE '✅ Correção concluída!';
    RAISE NOTICE '📊 Total de ruas concluídas: %', total_ruas_corrigidas;
    RAISE NOTICE '💰 Total de faturamentos: %', total_faturamentos;
    RAISE NOTICE '💵 Total faturado: R$ %', total_faturado;
END $$;

-- Comentários finais
COMMENT ON TABLE obras_ruas IS 'Ruas das obras - Status atualizado para concluida quando há metragem executada';
COMMENT ON TABLE obras_financeiro_faturamentos IS 'Faturamentos das obras - Valores calculados corretamente';



