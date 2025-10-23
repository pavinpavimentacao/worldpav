-- ============================================
-- Sistema de Notas Fiscais e Medições de Obras
-- ============================================

-- 1. Tabela de Notas Fiscais das Obras
CREATE TABLE IF NOT EXISTS obras_notas_fiscais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero_nota TEXT NOT NULL,
  valor_nota DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  desconto_inss DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto_iss DECIMAL(10,2) NOT NULL DEFAULT 0,
  outro_desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_liquido DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'renegociado')),
  data_pagamento DATE,
  arquivo_nota_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_notas_fiscais
CREATE INDEX idx_notas_fiscais_obra_id ON obras_notas_fiscais(obra_id);
CREATE INDEX idx_notas_fiscais_status ON obras_notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_vencimento ON obras_notas_fiscais(vencimento);
CREATE INDEX idx_notas_fiscais_numero ON obras_notas_fiscais(numero_nota);

-- 2. Tabela de Medições das Obras
CREATE TABLE IF NOT EXISTS obras_medicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  nota_fiscal_id UUID REFERENCES obras_notas_fiscais(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  arquivo_medicao_url TEXT NOT NULL,
  data_medicao DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_medicoes
CREATE INDEX idx_medicoes_obra_id ON obras_medicoes(obra_id);
CREATE INDEX idx_medicoes_nota_fiscal_id ON obras_medicoes(nota_fiscal_id);
CREATE INDEX idx_medicoes_data ON obras_medicoes(data_medicao);

-- ============================================
-- Triggers para updated_at
-- ============================================

CREATE TRIGGER update_notas_fiscais_updated_at
  BEFORE UPDATE ON obras_notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicoes_updated_at
  BEFORE UPDATE ON obras_medicoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE obras_notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras_medicoes ENABLE ROW LEVEL SECURITY;

-- Políticas para obras_notas_fiscais
CREATE POLICY "Usuários autenticados podem ver notas fiscais" ON obras_notas_fiscais
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir notas fiscais" ON obras_notas_fiscais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar notas fiscais" ON obras_notas_fiscais
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar notas fiscais" ON obras_notas_fiscais
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para obras_medicoes
CREATE POLICY "Usuários autenticados podem ver medições" ON obras_medicoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir medições" ON obras_medicoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar medições" ON obras_medicoes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar medições" ON obras_medicoes
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Comentários nas tabelas
-- ============================================

COMMENT ON TABLE obras_notas_fiscais IS 'Notas fiscais emitidas para cada obra';
COMMENT ON TABLE obras_medicoes IS 'Medições vinculadas às obras e opcionalmente às notas fiscais';

COMMENT ON COLUMN obras_notas_fiscais.valor_liquido IS 'Valor líquido = valor_nota - desconto_inss - desconto_iss - outro_desconto';
COMMENT ON COLUMN obras_notas_fiscais.status IS 'Status da nota: pendente (aguardando pagamento), pago (recebido), vencido (vencimento passou), renegociado (nota editada)';






