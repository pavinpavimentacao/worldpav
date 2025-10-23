-- ============================================
-- Atualização da tabela obras_financeiro_faturamentos
-- Para remover controle de pagamento por rua
-- ============================================

-- Adicionar coluna nota_fiscal_id (se não existir)
ALTER TABLE obras_financeiro_faturamentos 
  ADD COLUMN IF NOT EXISTS nota_fiscal_id UUID REFERENCES obras_notas_fiscais(id) ON DELETE SET NULL;

-- Remover coluna status (se existir)
ALTER TABLE obras_financeiro_faturamentos 
  DROP COLUMN IF EXISTS status;

-- Remover coluna data_pagamento (se existir)
ALTER TABLE obras_financeiro_faturamentos 
  DROP COLUMN IF EXISTS data_pagamento;

-- Remover coluna nota_fiscal (texto) se existir
ALTER TABLE obras_financeiro_faturamentos 
  DROP COLUMN IF EXISTS nota_fiscal;

-- Criar índice para nota_fiscal_id
CREATE INDEX IF NOT EXISTS idx_faturamentos_nota_fiscal_id ON obras_financeiro_faturamentos(nota_fiscal_id);

-- Adicionar campo preco_por_m2 na tabela obras se não existir
ALTER TABLE obras 
  ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2);

COMMENT ON COLUMN obras_financeiro_faturamentos.nota_fiscal_id IS 'Referência à nota fiscal que cobre este faturamento (opcional)';
COMMENT ON COLUMN obras.preco_por_m2 IS 'Preço cobrado por metro quadrado nesta obra';






