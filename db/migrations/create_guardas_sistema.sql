/**
 * MIGRATION: Sistema de Guardas
 * Criação de tabelas para empresas de guarda, guardas e diárias
 * 
 * Tabelas:
 * - empresas_guarda: Empresas que fornecem guardas
 * - guardas: Guardas vinculados a empresas
 * - diarias_guarda: Registro de diárias de segurança
 * - diarias_maquinarios: Maquinários vinculados a cada diária
 */

-- ============================================
-- TABELA: empresas_guarda
-- ============================================

CREATE TABLE IF NOT EXISTS empresas_guarda (
  id TEXT PRIMARY KEY DEFAULT ('emp-guarda-' || lower(substr(md5(random()::text), 1, 8))),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  documento TEXT NOT NULL, -- CPF ou CNPJ
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('CPF', 'CNPJ')),
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by TEXT REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresas_guarda_ativo ON empresas_guarda(ativo);
CREATE INDEX IF NOT EXISTS idx_empresas_guarda_documento ON empresas_guarda(documento);

-- RLS
ALTER TABLE empresas_guarda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON empresas_guarda FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON empresas_guarda FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON empresas_guarda FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_empresas_guarda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER empresas_guarda_updated_at
  BEFORE UPDATE ON empresas_guarda
  FOR EACH ROW
  EXECUTE FUNCTION update_empresas_guarda_updated_at();

-- ============================================
-- TABELA: guardas
-- ============================================

CREATE TABLE IF NOT EXISTS guardas (
  id TEXT PRIMARY KEY DEFAULT ('guarda-' || lower(substr(md5(random()::text), 1, 8))),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  empresa_id TEXT NOT NULL REFERENCES empresas_guarda(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by TEXT REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_guardas_empresa_id ON guardas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_guardas_ativo ON guardas(ativo);

-- RLS
ALTER TABLE guardas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON guardas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON guardas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON guardas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_guardas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guardas_updated_at
  BEFORE UPDATE ON guardas
  FOR EACH ROW
  EXECUTE FUNCTION update_guardas_updated_at();

-- ============================================
-- TABELA: diarias_guarda
-- ============================================

CREATE TABLE IF NOT EXISTS diarias_guarda (
  id TEXT PRIMARY KEY DEFAULT ('diaria-' || lower(substr(md5(random()::text), 1, 8))),
  guarda_id TEXT NOT NULL REFERENCES guardas(id) ON DELETE CASCADE,
  empresa_id TEXT NOT NULL REFERENCES empresas_guarda(id) ON DELETE CASCADE,
  solicitante TEXT NOT NULL, -- Nome de quem solicitou
  valor_diaria NUMERIC(10, 2) NOT NULL CHECK (valor_diaria > 0),
  data_diaria DATE NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite', 'madrugada')),
  rua TEXT NOT NULL, -- Nome da rua onde ocorreu a diária
  foto_maquinario_url TEXT, -- URL da foto do maquinário
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by TEXT REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_guarda_id ON diarias_guarda(guarda_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_empresa_id ON diarias_guarda(empresa_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_data ON diarias_guarda(data_diaria);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_turno ON diarias_guarda(turno);

-- RLS
ALTER TABLE diarias_guarda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON diarias_guarda FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON diarias_guarda FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON diarias_guarda FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_diarias_guarda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diarias_guarda_updated_at
  BEFORE UPDATE ON diarias_guarda
  FOR EACH ROW
  EXECUTE FUNCTION update_diarias_guarda_updated_at();

-- ============================================
-- TABELA: diarias_maquinarios
-- ============================================

CREATE TABLE IF NOT EXISTS diarias_maquinarios (
  id TEXT PRIMARY KEY DEFAULT ('diaria-maq-' || lower(substr(md5(random()::text), 1, 8))),
  diaria_id TEXT NOT NULL REFERENCES diarias_guarda(id) ON DELETE CASCADE,
  maquinario_id TEXT NOT NULL, -- ID do maquinário (foreign key se existir tabela maquinarios)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diarias_maquinarios_diaria_id ON diarias_maquinarios(diaria_id);
CREATE INDEX IF NOT EXISTS idx_diarias_maquinarios_maquinario_id ON diarias_maquinarios(maquinario_id);

-- RLS
ALTER TABLE diarias_maquinarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON diarias_maquinarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON diarias_maquinarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON diarias_maquinarios FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE empresas_guarda IS 'Empresas que fornecem guardas para maquinários';
COMMENT ON TABLE guardas IS 'Guardas vinculados a empresas fornecedoras';
COMMENT ON TABLE diarias_guarda IS 'Registro de diárias de segurança para maquinários';
COMMENT ON TABLE diarias_maquinarios IS 'Maquinários vinculados a cada diária de guarda';

COMMENT ON COLUMN empresas_guarda.tipo_documento IS 'Tipo de documento: CPF para pessoa física ou CNPJ para pessoa jurídica';
COMMENT ON COLUMN diarias_guarda.turno IS 'Turno da diária: manha, tarde, noite ou madrugada';
COMMENT ON COLUMN diarias_guarda.rua IS 'Nome da rua onde o maquinário estava sendo guardado';
COMMENT ON COLUMN diarias_guarda.foto_maquinario_url IS 'URL da foto do maquinário guardado';

-- ============================================
-- FIM DA MIGRATION
-- ============================================


