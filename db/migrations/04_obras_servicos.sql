-- Migração para tabela de serviços da obra
-- Arquivo: db/migrations/04_obras_servicos.sql

-- Criar tabela de serviços da obra
CREATE TABLE IF NOT EXISTS obras_servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  servico_id VARCHAR(255) NOT NULL,
  servico_nome VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(50) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_obras_servicos_obra_id ON obras_servicos(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_servicos_servico_id ON obras_servicos(servico_id);
CREATE INDEX IF NOT EXISTS idx_obras_servicos_deleted_at ON obras_servicos(deleted_at);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_obras_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_obras_servicos_updated_at
  BEFORE UPDATE ON obras_servicos
  FOR EACH ROW
  EXECUTE FUNCTION update_obras_servicos_updated_at();

-- Comentários na tabela
COMMENT ON TABLE obras_servicos IS 'Serviços associados a cada obra';
COMMENT ON COLUMN obras_servicos.obra_id IS 'ID da obra';
COMMENT ON COLUMN obras_servicos.servico_id IS 'ID do serviço (referência ao catálogo)';
COMMENT ON COLUMN obras_servicos.servico_nome IS 'Nome do serviço';
COMMENT ON COLUMN obras_servicos.quantidade IS 'Quantidade do serviço';
COMMENT ON COLUMN obras_servicos.preco_unitario IS 'Preço por unidade';
COMMENT ON COLUMN obras_servicos.valor_total IS 'Valor total do serviço';
COMMENT ON COLUMN obras_servicos.unidade IS 'Unidade de medida (m2, m3, ton, diaria, viagem, servico)';
COMMENT ON COLUMN obras_servicos.observacoes IS 'Observações sobre o serviço';
COMMENT ON COLUMN obras_servicos.deleted_at IS 'Data de exclusão (soft delete)';

