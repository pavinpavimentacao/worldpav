-- ============================================
-- Sistema Financeiro Integrado de Obras
-- ============================================

-- 1. Tabela de Ruas das Obras
CREATE TABLE IF NOT EXISTS obras_ruas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  metragem_planejada DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'finalizada')),
  ordem INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_ruas
CREATE INDEX idx_obras_ruas_obra_id ON obras_ruas(obra_id);
CREATE INDEX idx_obras_ruas_status ON obras_ruas(status);
CREATE INDEX idx_obras_ruas_ordem ON obras_ruas(obra_id, ordem);

-- 2. Tabela de Faturamentos das Obras
CREATE TABLE IF NOT EXISTS obras_financeiro_faturamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  rua_id UUID NOT NULL REFERENCES obras_ruas(id) ON DELETE CASCADE,
  metragem_executada DECIMAL(10,2) NOT NULL,
  toneladas_utilizadas DECIMAL(10,2) NOT NULL,
  espessura_calculada DECIMAL(10,2) NOT NULL,
  preco_por_m2 DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  data_finalizacao DATE NOT NULL,
  data_pagamento DATE,
  nota_fiscal TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_financeiro_faturamentos
CREATE INDEX idx_faturamentos_obra_id ON obras_financeiro_faturamentos(obra_id);
CREATE INDEX idx_faturamentos_rua_id ON obras_financeiro_faturamentos(rua_id);
CREATE INDEX idx_faturamentos_status ON obras_financeiro_faturamentos(status);
CREATE INDEX idx_faturamentos_data_finalizacao ON obras_financeiro_faturamentos(data_finalizacao);

-- 3. Tabela de Despesas das Obras
CREATE TABLE IF NOT EXISTS obras_financeiro_despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('diesel', 'materiais', 'manutencao', 'outros')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_despesa DATE NOT NULL,
  maquinario_id UUID REFERENCES maquinarios(id) ON DELETE SET NULL,
  fornecedor TEXT,
  comprovante_url TEXT,
  sincronizado_financeiro_principal BOOLEAN NOT NULL DEFAULT true,
  financeiro_principal_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_financeiro_despesas
CREATE INDEX idx_despesas_obra_id ON obras_financeiro_despesas(obra_id);
CREATE INDEX idx_despesas_categoria ON obras_financeiro_despesas(categoria);
CREATE INDEX idx_despesas_data ON obras_financeiro_despesas(data_despesa);
CREATE INDEX idx_despesas_maquinario ON obras_financeiro_despesas(maquinario_id);
CREATE INDEX idx_despesas_financeiro_principal ON obras_financeiro_despesas(financeiro_principal_id);

-- 4. Tabela de Diesel dos Maquinários
CREATE TABLE IF NOT EXISTS maquinarios_diesel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maquinario_id UUID NOT NULL REFERENCES maquinarios(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES obras(id) ON DELETE SET NULL,
  quantidade_litros DECIMAL(10,2) NOT NULL,
  preco_por_litro DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  data_abastecimento DATE NOT NULL,
  posto TEXT NOT NULL,
  km_hodometro DECIMAL(10,2),
  observacoes TEXT,
  despesa_obra_id UUID REFERENCES obras_financeiro_despesas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para maquinarios_diesel
CREATE INDEX idx_diesel_maquinario_id ON maquinarios_diesel(maquinario_id);
CREATE INDEX idx_diesel_obra_id ON maquinarios_diesel(obra_id);
CREATE INDEX idx_diesel_data ON maquinarios_diesel(data_abastecimento);
CREATE INDEX idx_diesel_despesa_obra ON maquinarios_diesel(despesa_obra_id);

-- ============================================
-- Triggers para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_obras_ruas_updated_at
  BEFORE UPDATE ON obras_ruas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faturamentos_updated_at
  BEFORE UPDATE ON obras_financeiro_faturamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON obras_financeiro_despesas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diesel_updated_at
  BEFORE UPDATE ON maquinarios_diesel
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE obras_ruas ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras_financeiro_faturamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras_financeiro_despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE maquinarios_diesel ENABLE ROW LEVEL SECURITY;

-- Políticas para obras_ruas
CREATE POLICY "Usuários autenticados podem ver ruas" ON obras_ruas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir ruas" ON obras_ruas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar ruas" ON obras_ruas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar ruas" ON obras_ruas
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para obras_financeiro_faturamentos
CREATE POLICY "Usuários autenticados podem ver faturamentos" ON obras_financeiro_faturamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir faturamentos" ON obras_financeiro_faturamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar faturamentos" ON obras_financeiro_faturamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar faturamentos" ON obras_financeiro_faturamentos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para obras_financeiro_despesas
CREATE POLICY "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para maquinarios_diesel
CREATE POLICY "Usuários autenticados podem ver diesel" ON maquinarios_diesel
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir diesel" ON maquinarios_diesel
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar diesel" ON maquinarios_diesel
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar diesel" ON maquinarios_diesel
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Comentários nas tabelas
-- ============================================

COMMENT ON TABLE obras_ruas IS 'Cadastro de ruas de cada obra para controle de execução';
COMMENT ON TABLE obras_financeiro_faturamentos IS 'Faturamentos gerados quando ruas são finalizadas';
COMMENT ON TABLE obras_financeiro_despesas IS 'Despesas específicas de cada obra';
COMMENT ON TABLE maquinarios_diesel IS 'Controle de abastecimento de diesel por maquinário';

COMMENT ON COLUMN obras_financeiro_faturamentos.espessura_calculada IS 'Calculada pela fórmula: toneladas / metragem / 2.4 (densidade)';
COMMENT ON COLUMN obras_financeiro_despesas.sincronizado_financeiro_principal IS 'Indica se a despesa deve aparecer no financeiro principal';


