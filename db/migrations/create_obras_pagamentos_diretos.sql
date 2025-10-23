-- =====================================================
-- MIGRAÇÃO: Pagamentos Diretos (PIX, Transferência, etc.)
-- =====================================================
-- Esta migração cria uma tabela para pagamentos que não possuem nota fiscal
-- Exemplos: PIX, transferência bancária, dinheiro, etc.

-- Tabela para pagamentos diretos (sem nota fiscal)
CREATE TABLE IF NOT EXISTS obras_pagamentos_diretos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  descricao TEXT NOT NULL, -- "PIX - Janeiro 2025", "Transferência - Avanço", etc.
  valor DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'transferencia', 'dinheiro', 'cheque', 'outro')),
  
  -- Dados opcionais
  comprovante_url TEXT, -- URL do comprovante (PDF, imagem)
  observacoes TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_obra_id ON obras_pagamentos_diretos(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_data ON obras_pagamentos_diretos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_forma ON obras_pagamentos_diretos(forma_pagamento);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_obras_pagamentos_diretos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_obras_pagamentos_diretos_updated_at
  BEFORE UPDATE ON obras_pagamentos_diretos
  FOR EACH ROW
  EXECUTE FUNCTION update_obras_pagamentos_diretos_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE obras_pagamentos_diretos ENABLE ROW LEVEL SECURITY;

-- Política para permitir operações baseadas na empresa do usuário
CREATE POLICY "Usuários podem gerenciar pagamentos diretos da sua empresa" ON obras_pagamentos_diretos
  FOR ALL USING (
    obra_id IN (
      SELECT id FROM obras 
      WHERE company_id = (
        SELECT company_id FROM users 
        WHERE id = auth.uid()
      )
    )
  );

-- Comentários para documentação
COMMENT ON TABLE obras_pagamentos_diretos IS 'Pagamentos diretos sem nota fiscal (PIX, transferência, etc.)';
COMMENT ON COLUMN obras_pagamentos_diretos.descricao IS 'Descrição do pagamento (ex: PIX - Janeiro 2025)';
COMMENT ON COLUMN obras_pagamentos_diretos.forma_pagamento IS 'Forma de pagamento: pix, transferencia, dinheiro, cheque, outro';
COMMENT ON COLUMN obras_pagamentos_diretos.comprovante_url IS 'URL do comprovante de pagamento (PDF, imagem)';





