/**
 * MIGRATION: Sistema de Guardas de Segurança
 * Criação de tabelas para empresas de guarda, guardas e diárias
 * 
 * NOTA: Renomeado para evitar conflito com a tabela 'guardas' (guardas de trânsito em obras)
 * 
 * Tabelas:
 * - empresas_guarda: Empresas que fornecem guardas
 * - guardas_seguranca: Guardas vinculados a empresas
 * - diarias_guarda_seguranca: Registro de diárias de segurança
 * - diarias_seguranca_maquinarios: Maquinários vinculados a cada diária
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresas_guarda_deleted_at ON empresas_guarda(deleted_at);
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
-- TABELA: guardas_seguranca
-- ============================================

CREATE TABLE IF NOT EXISTS guardas_seguranca (
  id TEXT PRIMARY KEY DEFAULT ('guarda-seg-' || lower(substr(md5(random()::text), 1, 8))),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES empresas_guarda(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_guardas_seguranca_company_id ON guardas_seguranca(company_id);
CREATE INDEX IF NOT EXISTS idx_guardas_seguranca_deleted_at ON guardas_seguranca(deleted_at);

-- RLS
ALTER TABLE guardas_seguranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON guardas_seguranca FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON guardas_seguranca FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON guardas_seguranca FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_guardas_seguranca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guardas_seguranca_updated_at
  BEFORE UPDATE ON guardas_seguranca
  FOR EACH ROW
  EXECUTE FUNCTION update_guardas_seguranca_updated_at();

-- ============================================
-- TABELA: diarias_guarda_seguranca
-- ============================================

CREATE TABLE IF NOT EXISTS diarias_guarda_seguranca (
  id TEXT PRIMARY KEY DEFAULT ('diaria-seg-' || lower(substr(md5(random()::text), 1, 8))),
  guarda_id TEXT NOT NULL REFERENCES guardas_seguranca(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES empresas_guarda(id) ON DELETE CASCADE,
  
  -- Vinculação com obra e rua
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE SET NULL,
  
  -- Dados da diária
  solicitante TEXT NOT NULL, -- Nome de quem solicitou
  valor_diaria NUMERIC(10, 2) NOT NULL CHECK (valor_diaria > 0),
  data_diaria DATE NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite', 'madrugada')),
  
  -- Informações adicionais
  rua_nome TEXT, -- Nome da rua (preenchido automaticamente ou manual)
  foto_maquinario_url TEXT, -- URL da foto do maquinário
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_guarda_id ON diarias_guarda_seguranca(guarda_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_company_id ON diarias_guarda_seguranca(company_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_obra_id ON diarias_guarda_seguranca(obra_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_rua_id ON diarias_guarda_seguranca(rua_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_data ON diarias_guarda_seguranca(data_diaria);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_turno ON diarias_guarda_seguranca(turno);

-- RLS
ALTER TABLE diarias_guarda_seguranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON diarias_guarda_seguranca FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON diarias_guarda_seguranca FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON diarias_guarda_seguranca FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_diarias_guarda_seguranca_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diarias_guarda_seguranca_updated_at
  BEFORE UPDATE ON diarias_guarda_seguranca
  FOR EACH ROW
  EXECUTE FUNCTION update_diarias_guarda_seguranca_updated_at();

-- ============================================
-- TABELA: diarias_seguranca_maquinarios
-- ============================================

CREATE TABLE IF NOT EXISTS diarias_seguranca_maquinarios (
  id TEXT PRIMARY KEY DEFAULT ('diaria-seg-maq-' || lower(substr(md5(random()::text), 1, 8))),
  diaria_id TEXT NOT NULL REFERENCES diarias_guarda_seguranca(id) ON DELETE CASCADE,
  maquinario_id UUID NOT NULL REFERENCES public.maquinarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_diarias_seguranca_maquinarios_diaria_id ON diarias_seguranca_maquinarios(diaria_id);
CREATE INDEX IF NOT EXISTS idx_diarias_seguranca_maquinarios_maquinario_id ON diarias_seguranca_maquinarios(maquinario_id);

-- RLS
ALTER TABLE diarias_seguranca_maquinarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
  ON diarias_seguranca_maquinarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON diarias_seguranca_maquinarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON diarias_seguranca_maquinarios FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE empresas_guarda IS 'Empresas que fornecem guardas para maquinários';
COMMENT ON TABLE guardas_seguranca IS 'Guardas de segurança vinculados a empresas fornecedoras';
COMMENT ON TABLE diarias_guarda_seguranca IS 'Registro de diárias de segurança para maquinários';
COMMENT ON TABLE diarias_seguranca_maquinarios IS 'Maquinários vinculados a cada diária de guarda';

COMMENT ON COLUMN empresas_guarda.tipo_documento IS 'Tipo de documento: CPF para pessoa física ou CNPJ para pessoa jurídica';
COMMENT ON COLUMN diarias_guarda_seguranca.turno IS 'Turno da diária: manha, tarde, noite ou madrugada';
COMMENT ON COLUMN diarias_guarda_seguranca.obra_id IS 'Obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_id IS 'Rua da obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_nome IS 'Nome da rua (preenchido automaticamente se rua_id estiver definido)';
COMMENT ON COLUMN diarias_guarda_seguranca.foto_maquinario_url IS 'URL da foto do maquinário guardado';

-- ============================================
-- FIM DA MIGRATION
-- ============================================


