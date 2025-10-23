-- Migration: Criar tabela de Licenças para Maquinários e Veículos
-- Data: 2025-10-18
-- Descrição: Tabela para gerenciar licenças obrigatórias de equipamentos e veículos

-- ============================================================================
-- TABELA: licencas_maquinarios
-- Armazena informações de licenças de cada maquinário/veículo
-- ============================================================================
CREATE TABLE IF NOT EXISTS licencas_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maquinario_id UUID NOT NULL, -- FK para tabela de maquinários
  company_id UUID NOT NULL,
  
  -- Informações da Licença
  tipo_licenca VARCHAR(50) NOT NULL CHECK (tipo_licenca IN (
    'ANTT',           -- Agência Nacional de Transportes Terrestres
    'Ambipar',        -- Licença Ambiental
    'CIPP',           -- Certificado de Inspeção para Transporte de Produtos Perigosos
    'CIV',            -- Certificado de Inspeção Veicular
    'CRLV',           -- Certificado de Registro e Licenciamento de Veículo
    'Alvará',         -- Alvará de funcionamento
    'Outros'          -- Outras licenças
  )),
  numero_licenca VARCHAR(100) NOT NULL,
  orgao_emissor VARCHAR(200),
  
  -- Datas
  data_emissao DATE,
  data_validade DATE NOT NULL,
  
  -- Documentação
  arquivo_url TEXT,
  observacoes TEXT,
  
  -- Status e Controle
  status VARCHAR(50) NOT NULL DEFAULT 'valida' CHECK (status IN (
    'valida',
    'vencida',
    'em_renovacao',
    'pendente'
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT licenca_unica UNIQUE (maquinario_id, tipo_licenca, numero_licenca),
  CONSTRAINT datas_validas CHECK (data_validade >= data_emissao OR data_emissao IS NULL)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_licencas_maquinario ON licencas_maquinarios(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_licencas_company ON licencas_maquinarios(company_id);
CREATE INDEX IF NOT EXISTS idx_licencas_tipo ON licencas_maquinarios(tipo_licenca);
CREATE INDEX IF NOT EXISTS idx_licencas_status ON licencas_maquinarios(status);
CREATE INDEX IF NOT EXISTS idx_licencas_validade ON licencas_maquinarios(data_validade);

-- ============================================================================
-- FUNCTION: Atualizar status da licença automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION atualizar_status_licenca()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular dias para vencimento
  DECLARE
    dias_restantes INTEGER;
  BEGIN
    dias_restantes := NEW.data_validade - CURRENT_DATE;
    
    -- Definir status baseado na validade
    IF dias_restantes < 0 THEN
      NEW.status := 'vencida';
    ELSIF dias_restantes <= 30 THEN
      NEW.status := 'em_renovacao';
    ELSE
      NEW.status := 'valida';
    END IF;
  END;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente
CREATE TRIGGER trigger_atualizar_status_licenca
  BEFORE INSERT OR UPDATE ON licencas_maquinarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_licenca();

-- ============================================================================
-- POLICIES RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE licencas_maquinarios ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas licenças da sua empresa
CREATE POLICY licencas_select_policy ON licencas_maquinarios
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem inserir licenças para sua empresa
CREATE POLICY licencas_insert_policy ON licencas_maquinarios
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar licenças da sua empresa
CREATE POLICY licencas_update_policy ON licencas_maquinarios
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem deletar licenças da sua empresa
CREATE POLICY licencas_delete_policy ON licencas_maquinarios
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- VIEW: Licenças próximas do vencimento (30 dias)
-- ============================================================================
CREATE OR REPLACE VIEW licencas_vencendo AS
SELECT 
  l.*,
  m.nome as maquinario_nome,
  m.tipo as maquinario_tipo,
  (l.data_validade - CURRENT_DATE) as dias_restantes
FROM licencas_maquinarios l
-- JOIN maquinarios m ON l.maquinario_id = m.id  -- Descomentar quando tabela maquinarios existir
WHERE l.status IN ('valida', 'em_renovacao')
  AND (l.data_validade - CURRENT_DATE) <= 30
ORDER BY l.data_validade ASC;

-- ============================================================================
-- VIEW: Licenças vencidas
-- ============================================================================
CREATE OR REPLACE VIEW licencas_vencidas AS
SELECT 
  l.*,
  m.nome as maquinario_nome,
  m.tipo as maquinario_tipo,
  (CURRENT_DATE - l.data_validade) as dias_vencido
FROM licencas_maquinarios l
-- JOIN maquinarios m ON l.maquinario_id = m.id  -- Descomentar quando tabela maquinarios existir
WHERE l.status = 'vencida'
ORDER BY l.data_validade DESC;

-- ============================================================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================================================
COMMENT ON TABLE licencas_maquinarios IS 'Tabela para armazenar licenças e certificações de maquinários e veículos';

COMMENT ON COLUMN licencas_maquinarios.tipo_licenca IS 'Tipo de licença (ANTT, Ambipar, CIPP, CIV, CRLV, etc)';
COMMENT ON COLUMN licencas_maquinarios.numero_licenca IS 'Número único da licença emitida';
COMMENT ON COLUMN licencas_maquinarios.orgao_emissor IS 'Órgão responsável pela emissão (ANTT, DETRAN, CETESB, etc)';
COMMENT ON COLUMN licencas_maquinarios.arquivo_url IS 'URL do arquivo PDF da licença';
COMMENT ON COLUMN licencas_maquinarios.status IS 'Status atual da licença (valida, vencida, em_renovacao, pendente)';

-- ============================================================================
-- DADOS DE EXEMPLO (opcional - remover em produção)
-- ============================================================================
/*
-- Exemplo de inserção de licenças
INSERT INTO licencas_maquinarios (
  maquinario_id, 
  company_id, 
  tipo_licenca, 
  numero_licenca, 
  orgao_emissor, 
  data_emissao, 
  data_validade,
  observacoes
) VALUES 
(
  'maquinario-uuid-aqui',
  'company-uuid-aqui',
  'ANTT',
  'ANTT-2024-001234',
  'Agência Nacional de Transportes Terrestres',
  '2024-01-15',
  '2025-01-14',
  'Licença para transporte de produtos químicos'
);
*/


