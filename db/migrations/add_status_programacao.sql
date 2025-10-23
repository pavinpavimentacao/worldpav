-- Migration: Adicionar campos de status e confirmação em programações
-- Data: 2025-10-18
-- Descrição: Permite controlar o status da programação e vincular ao relatório diário gerado

-- ============================================================================
-- Adicionar colunas de status e confirmação
-- ============================================================================

DO $$ 
BEGIN
    -- Adicionar coluna status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programacoes_pavimentacao' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE programacoes_pavimentacao 
        ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'programada' 
        CHECK (status IN ('programada', 'confirmada', 'cancelada'));
        
        COMMENT ON COLUMN programacoes_pavimentacao.status IS 'Status da programação (programada, confirmada, cancelada)';
    END IF;

    -- Adicionar coluna confirmada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programacoes_pavimentacao' 
        AND column_name = 'confirmada'
    ) THEN
        ALTER TABLE programacoes_pavimentacao 
        ADD COLUMN confirmada BOOLEAN NOT NULL DEFAULT false;
        
        COMMENT ON COLUMN programacoes_pavimentacao.confirmada IS 'Se a obra foi confirmada/finalizada';
    END IF;

    -- Adicionar coluna data_confirmacao
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programacoes_pavimentacao' 
        AND column_name = 'data_confirmacao'
    ) THEN
        ALTER TABLE programacoes_pavimentacao 
        ADD COLUMN data_confirmacao DATE;
        
        COMMENT ON COLUMN programacoes_pavimentacao.data_confirmacao IS 'Data em que a obra foi confirmada/finalizada';
    END IF;

    -- Adicionar coluna relatorio_diario_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'programacoes_pavimentacao' 
        AND column_name = 'relatorio_diario_id'
    ) THEN
        ALTER TABLE programacoes_pavimentacao 
        ADD COLUMN relatorio_diario_id UUID;
        
        COMMENT ON COLUMN programacoes_pavimentacao.relatorio_diario_id IS 'ID do relatório diário gerado ao confirmar a obra';
        
        -- Adicionar FK quando tabela de relatórios existir
        -- ALTER TABLE programacoes_pavimentacao 
        -- ADD CONSTRAINT fk_relatorio_diario 
        -- FOREIGN KEY (relatorio_diario_id) REFERENCES relatorios_diarios(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- Índices para melhor performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_programacoes_status ON programacoes_pavimentacao(status);
CREATE INDEX IF NOT EXISTS idx_programacoes_confirmada ON programacoes_pavimentacao(confirmada);
CREATE INDEX IF NOT EXISTS idx_programacoes_data_confirmacao ON programacoes_pavimentacao(data_confirmacao);

-- ============================================================================
-- FUNCTION: Atualizar status automaticamente ao confirmar
-- ============================================================================
CREATE OR REPLACE FUNCTION atualizar_status_programacao_confirmacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando confirmada = true, garantir que status = 'confirmada'
  IF NEW.confirmada = true AND NEW.status != 'confirmada' THEN
    NEW.status := 'confirmada';
  END IF;
  
  -- Quando status = 'confirmada', garantir que confirmada = true
  IF NEW.status = 'confirmada' AND NEW.confirmada != true THEN
    NEW.confirmada := true;
  END IF;
  
  -- Se confirmar sem data de confirmação, usar data atual
  IF NEW.confirmada = true AND NEW.data_confirmacao IS NULL THEN
    NEW.data_confirmacao := CURRENT_DATE;
  END IF;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_status_programacao ON programacoes_pavimentacao;
CREATE TRIGGER trigger_atualizar_status_programacao
  BEFORE INSERT OR UPDATE ON programacoes_pavimentacao
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_programacao_confirmacao();

-- ============================================================================
-- VIEW: Programações pendentes de confirmação
-- ============================================================================
CREATE OR REPLACE VIEW programacoes_pendentes_confirmacao AS
SELECT 
  p.*,
  (CURRENT_DATE - p.data::DATE) as dias_desde_programacao
FROM programacoes_pavimentacao p
WHERE p.confirmada = false 
  AND p.status = 'programada'
  AND p.data::DATE <= CURRENT_DATE
ORDER BY p.data ASC;

COMMENT ON VIEW programacoes_pendentes_confirmacao IS 'Programações que já passaram da data mas ainda não foram confirmadas';

-- ============================================================================
-- VIEW: Programações confirmadas
-- ============================================================================
CREATE OR REPLACE VIEW programacoes_confirmadas AS
SELECT 
  p.*,
  r.numero as relatorio_numero
FROM programacoes_pavimentacao p
LEFT JOIN relatorios_diarios r ON p.relatorio_diario_id = r.id
WHERE p.confirmada = true
ORDER BY p.data_confirmacao DESC;

COMMENT ON VIEW programacoes_confirmadas IS 'Histórico de programações confirmadas com link para relatório';

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE programacoes_pavimentacao IS 'Tabela de programações de pavimentação - inclui controle de confirmação de obra';

-- ============================================================================
-- INSTRUÇÕES DE USO
-- ============================================================================
/*
FLUXO DE CONFIRMAÇÃO DE OBRA:

1. Programação criada → status = 'programada', confirmada = false
2. Obra executada
3. Usuário clica em "Confirmar Obra"
4. Sistema:
   - Cria relatório diário
   - Atualiza programação: 
     UPDATE programacoes_pavimentacao 
     SET confirmada = true, 
         status = 'confirmada',
         data_confirmacao = CURRENT_DATE,
         relatorio_diario_id = '[id_do_relatorio]'
     WHERE id = '[programacao_id]';
   - Finaliza rua (status = 'FINALIZADA')
   - Gera faturamento

Consultas úteis:

-- Programações que precisam ser confirmadas (já passaram da data)
SELECT * FROM programacoes_pendentes_confirmacao;

-- Histórico de obras confirmadas
SELECT * FROM programacoes_confirmadas;

-- Estatísticas
SELECT 
  COUNT(*) FILTER (WHERE confirmada = true) as confirmadas,
  COUNT(*) FILTER (WHERE confirmada = false) as pendentes,
  COUNT(*) as total
FROM programacoes_pavimentacao
WHERE data::DATE >= '2025-01-01';
*/


