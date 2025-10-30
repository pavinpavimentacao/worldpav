-- =====================================================
-- MIGRATION: Adicionar soft delete em faturamentos
-- =====================================================
-- Adiciona coluna deleted_at para soft delete
-- e atualiza a busca de faturamentos para filtrar excluídos

-- Adicionar coluna deleted_at se não existir
ALTER TABLE obras_financeiro_faturamentos 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN obras_financeiro_faturamentos.deleted_at IS 'Data de exclusão (soft delete)';

-- Criar índice para deleted_at
CREATE INDEX IF NOT EXISTS idx_faturamentos_deleted_at 
ON obras_financeiro_faturamentos(deleted_at);

-- Atualizar consultas existentes para filtrar deleted_at
-- (Isso é apenas para referência - a lógica já filtra no código)


