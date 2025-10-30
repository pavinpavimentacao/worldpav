-- =====================================================
-- MIGRATION: Adicionar tipo_equipe aos relatórios diários
-- =====================================================
-- Altera estrutura para salvar tipo de equipe (pavimentacao, maquinas, apoio)
-- em vez de equipe_id para facilitar identificação e relatórios

-- Adicionar coluna tipo_equipe
ALTER TABLE relatorios_diarios 
ADD COLUMN IF NOT EXISTS tipo_equipe VARCHAR(50);

COMMENT ON COLUMN relatorios_diarios.tipo_equipe IS 'Tipo da equipe: pavimentacao (Equipe A), maquinas (Equipe B), apoio (Equipe C)';

-- Atualizar tabela para incluir índice em tipo_equipe
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_tipo_equipe 
ON relatorios_diarios(tipo_equipe);

-- =====================================================
-- NOTAS:
-- 1. A coluna equipe_id ainda existirá para referência (pode ser NULL)
-- 2. tipo_equipe será preenchido ao criar/editar relatórios
-- 3. Valores possíveis: 'pavimentacao', 'maquinas', 'apoio'
-- =====================================================


