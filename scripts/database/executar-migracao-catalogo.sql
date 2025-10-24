-- Executar migração para criar a tabela de serviços do catálogo
-- Execute este script no Supabase SQL Editor

-- Criar tabela de serviços do catálogo
CREATE TABLE IF NOT EXISTS servicos_catalogo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL,
  unidade_padrao VARCHAR(50) NOT NULL,
  preco_base DECIMAL(10,2),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_servicos_catalogo_tipo ON servicos_catalogo(tipo);
CREATE INDEX IF NOT EXISTS idx_servicos_catalogo_ativo ON servicos_catalogo(ativo);
CREATE INDEX IF NOT EXISTS idx_servicos_catalogo_deleted_at ON servicos_catalogo(deleted_at);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_servicos_catalogo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_servicos_catalogo_updated_at
  BEFORE UPDATE ON servicos_catalogo
  FOR EACH ROW
  EXECUTE FUNCTION update_servicos_catalogo_updated_at();

-- Inserir serviços iniciais no catálogo
INSERT INTO servicos_catalogo (nome, descricao, tipo, unidade_padrao, preco_base, ativo)
VALUES
  ('Pavimentação CBUQ', 'Pavimentação com concreto betuminoso usinado a quente', 'pavimentacao', 'm2', 45.00, TRUE),
  ('Recapeamento Asfáltico', 'Recapeamento de via existente', 'pavimentacao', 'm2', 35.00, TRUE),
  ('Imprimação', 'Aplicação de emulsão asfáltica para impermeabilização', 'imprimacao', 'm2', 8.50, TRUE),
  ('Pintura de Ligação', 'Aplicação de emulsão entre camadas', 'imprimacao', 'm2', 6.00, TRUE),
  ('Impermeabilizante', 'Aplicação de produto impermeabilizante', 'impermeabilizante', 'm2', 12.00, TRUE),
  ('Mobilização de Equipamentos', 'Transporte e mobilização de equipamentos para a obra', 'mobilizacao', 'servico', 2500.00, TRUE),
  ('Imobilização de Equipamentos', 'Desmobilização e retorno de equipamentos', 'imobilizacao', 'servico', 1500.00, TRUE),
  ('Serviços Diversos', 'Outros serviços complementares', 'outros', 'servico', 0, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Verificar se os serviços foram inseridos
SELECT id, nome, tipo, unidade_padrao, preco_base, ativo
FROM servicos_catalogo
ORDER BY nome;

