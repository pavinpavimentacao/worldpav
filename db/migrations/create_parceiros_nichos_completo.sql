-- =====================================================
-- MIGRATION: Parceiros com Nichos e Recursos Terceiros
-- =====================================================
-- Adiciona suporte a nichos de parceiros (Usina Asfalto, Usina RR2C, Empreiteiro)
-- e permite cadastro de maquinários e equipes terceiras

-- 1. Atualizar tabela parceiros com campo nicho
ALTER TABLE parceiros ADD COLUMN IF NOT EXISTS nicho VARCHAR(50) NOT NULL DEFAULT 'empreiteiro';

COMMENT ON COLUMN parceiros.nicho IS 'Tipo de nicho do parceiro: usina_asfalto, usina_rr2c, empreiteiro';

-- 2. Criar tabela de maquinários de parceiros terceiros
CREATE TABLE IF NOT EXISTS parceiros_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- Ex: Caminhão, Rolo, Escavadeira, Pá Carregadeira
  placa VARCHAR(20),
  valor_diaria DECIMAL(10,2), -- Valor cobrado por dia de uso
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE parceiros_maquinarios IS 'Maquinários disponíveis de parceiros empreiteiros para locação';

-- Índices para parceiros_maquinarios
CREATE INDEX IF NOT EXISTS idx_parceiros_maquinarios_parceiro ON parceiros_maquinarios(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_maquinarios_ativo ON parceiros_maquinarios(ativo);

-- 3. Criar tabela de equipes de parceiros terceiros
CREATE TABLE IF NOT EXISTS parceiros_equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parceiro_id UUID NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  quantidade_pessoas INTEGER,
  valor_diaria DECIMAL(10,2), -- Valor cobrado por dia
  especialidade VARCHAR(100), -- Ex: Pavimentação, Sinalização, Terraplenagem
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE parceiros_equipes IS 'Equipes disponíveis de parceiros empreiteiros para locação';

-- Índices para parceiros_equipes
CREATE INDEX IF NOT EXISTS idx_parceiros_equipes_parceiro ON parceiros_equipes(parceiro_id);
CREATE INDEX IF NOT EXISTS idx_parceiros_equipes_ativo ON parceiros_equipes(ativo);

-- 4. Row Level Security (RLS)

-- Habilitar RLS nas novas tabelas
ALTER TABLE parceiros_maquinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros_equipes ENABLE ROW LEVEL SECURITY;

-- Policies para parceiros_maquinarios
CREATE POLICY "Permitir visualizar maquinários de parceiros autenticados"
  ON parceiros_maquinarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserir maquinários de parceiros autenticados"
  ON parceiros_maquinarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar maquinários de parceiros autenticados"
  ON parceiros_maquinarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir deletar maquinários de parceiros autenticados"
  ON parceiros_maquinarios FOR DELETE
  TO authenticated
  USING (true);

-- Policies para parceiros_equipes
CREATE POLICY "Permitir visualizar equipes de parceiros autenticados"
  ON parceiros_equipes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserir equipes de parceiros autenticados"
  ON parceiros_equipes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar equipes de parceiros autenticados"
  ON parceiros_equipes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir deletar equipes de parceiros autenticados"
  ON parceiros_equipes FOR DELETE
  TO authenticated
  USING (true);

-- 5. Triggers para updated_at

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parceiros_maquinarios_updated_at
  BEFORE UPDATE ON parceiros_maquinarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parceiros_equipes_updated_at
  BEFORE UPDATE ON parceiros_equipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Dados de exemplo (opcional - comentar se não quiser)
/*
INSERT INTO parceiros (id, nome, nicho, contato, telefone, email, cnpj, ativo) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Usina Central Asfalto', 'usina_asfalto', 'João Silva', '(11) 98765-4321', 'contato@usinacentral.com.br', '12.345.678/0001-90', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'RR2C Premium', 'usina_rr2c', 'Maria Santos', '(11) 97654-3210', 'maria@rr2cpremium.com.br', '98.765.432/0001-10', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Empreiteira Pav Solutions', 'empreiteiro', 'Carlos Mendes', '(11) 96543-2109', 'carlos@pavsolutions.com.br', '45.678.901/0001-23', true);

INSERT INTO parceiros_maquinarios (parceiro_id, nome, tipo, placa, valor_diaria, ativo) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Caminhão Basculante Mercedes 2726', 'Caminhão Basculante', 'ABC-1234', 800.00, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Rolo Compactador Dynapac CA25', 'Rolo Compactador', 'DEF-5678', 1200.00, true);

INSERT INTO parceiros_equipes (parceiro_id, nome, quantidade_pessoas, valor_diaria, especialidade, ativo) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Equipe Pavimentação Alpha', 8, 3200.00, 'Pavimentação', true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Equipe Sinalização Beta', 4, 1600.00, 'Sinalização', true);
*/


