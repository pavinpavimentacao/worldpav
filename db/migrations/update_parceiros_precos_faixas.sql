-- ==========================================
-- MIGRATION: Atualizar Parceiros com Preços por Faixa
-- ==========================================
-- Descrição: Substitui preco_tonelada e faixas_disponiveis por precos_faixas (array de objetos)
-- Data: 2024-02-XX
-- ==========================================

-- 1. Criar tipo ENUM para faixas de asfalto (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'faixa_asfalto') THEN
        CREATE TYPE faixa_asfalto AS ENUM (
            'faixa_3',
            'faixa_4', 
            'faixa_5',
            'binder',
            'sma'
        );
    END IF;
END $$;

-- 2. Criar tipo composto para preço por faixa
DROP TYPE IF EXISTS preco_faixa CASCADE;
CREATE TYPE preco_faixa AS (
    faixa faixa_asfalto,
    preco_tonelada DECIMAL(10, 2)
);

-- 3. Adicionar nova coluna precos_faixas à tabela parceiros
ALTER TABLE parceiros 
ADD COLUMN IF NOT EXISTS precos_faixas preco_faixa[];

-- 4. Migrar dados existentes (se houver preco_tonelada e faixas_disponiveis)
-- Nota: Esta migração assume que todas as faixas tinham o mesmo preço
UPDATE parceiros
SET precos_faixas = ARRAY(
    SELECT ROW(faixa_item::faixa_asfalto, preco_tonelada)::preco_faixa
    FROM unnest(faixas_disponiveis) AS faixa_item
)
WHERE nicho = 'usina_asfalto' 
  AND preco_tonelada IS NOT NULL 
  AND faixas_disponiveis IS NOT NULL
  AND array_length(faixas_disponiveis, 1) > 0;

-- 5. Remover colunas antigas (OPCIONAL - descomentar se quiser remover)
-- ALTER TABLE parceiros DROP COLUMN IF EXISTS preco_tonelada;
-- ALTER TABLE parceiros DROP COLUMN IF EXISTS faixas_disponiveis;

-- 6. Comentários nas colunas
COMMENT ON COLUMN parceiros.precos_faixas IS 'Array de objetos contendo faixa de asfalto e preço por tonelada. Formato: [{faixa: "faixa_3", preco_tonelada: 380.00}]';

-- 7. Função helper para adicionar preço de faixa
CREATE OR REPLACE FUNCTION adicionar_preco_faixa(
    p_parceiro_id UUID,
    p_faixa faixa_asfalto,
    p_preco DECIMAL(10, 2)
)
RETURNS void AS $$
BEGIN
    UPDATE parceiros
    SET precos_faixas = COALESCE(precos_faixas, '{}') || ARRAY[ROW(p_faixa, p_preco)::preco_faixa]
    WHERE id = p_parceiro_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Função helper para atualizar preço de faixa existente
CREATE OR REPLACE FUNCTION atualizar_preco_faixa(
    p_parceiro_id UUID,
    p_faixa faixa_asfalto,
    p_novo_preco DECIMAL(10, 2)
)
RETURNS void AS $$
BEGIN
    UPDATE parceiros
    SET precos_faixas = ARRAY(
        SELECT CASE 
            WHEN (pf).faixa = p_faixa 
            THEN ROW(p_faixa, p_novo_preco)::preco_faixa
            ELSE pf
        END
        FROM unnest(precos_faixas) AS pf
    )
    WHERE id = p_parceiro_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Função helper para remover preço de faixa
CREATE OR REPLACE FUNCTION remover_preco_faixa(
    p_parceiro_id UUID,
    p_faixa faixa_asfalto
)
RETURNS void AS $$
BEGIN
    UPDATE parceiros
    SET precos_faixas = ARRAY(
        SELECT pf
        FROM unnest(precos_faixas) AS pf
        WHERE (pf).faixa != p_faixa
    )
    WHERE id = p_parceiro_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Função helper para buscar preço de uma faixa específica
CREATE OR REPLACE FUNCTION obter_preco_faixa(
    p_parceiro_id UUID,
    p_faixa faixa_asfalto
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    v_preco DECIMAL(10, 2);
BEGIN
    SELECT (pf).preco_tonelada INTO v_preco
    FROM unnest(
        (SELECT precos_faixas FROM parceiros WHERE id = p_parceiro_id)
    ) AS pf
    WHERE (pf).faixa = p_faixa
    LIMIT 1;
    
    RETURN v_preco;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- EXEMPLOS DE USO
-- ==========================================

-- Adicionar preço de faixa:
-- SELECT adicionar_preco_faixa('uuid-do-parceiro', 'faixa_3', 380.00);

-- Atualizar preço de faixa:
-- SELECT atualizar_preco_faixa('uuid-do-parceiro', 'faixa_3', 390.00);

-- Remover preço de faixa:
-- SELECT remover_preco_faixa('uuid-do-parceiro', 'faixa_3');

-- Buscar preço de faixa:
-- SELECT obter_preco_faixa('uuid-do-parceiro', 'faixa_3');

-- Inserir parceiro com preços:
-- INSERT INTO parceiros (nome, nicho, precos_faixas) 
-- VALUES (
--     'Usina Teste', 
--     'usina_asfalto',
--     ARRAY[
--         ROW('faixa_3', 380.00)::preco_faixa,
--         ROW('faixa_4', 360.00)::preco_faixa,
--         ROW('faixa_5', 340.00)::preco_faixa
--     ]
-- );

-- ==========================================
-- FIM DA MIGRATION
-- ==========================================


