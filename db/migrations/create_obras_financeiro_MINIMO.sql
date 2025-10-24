-- ============================================
-- Criar Tabelas de Financeiro - VERSÃO MÍNIMA
-- ============================================
-- Esta versão remove dependências opcionais que podem não existir
-- ============================================

-- 1. Tabela de Faturamentos das Obras
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

-- 2. Tabela de Despesas das Obras (SEM referência a expenses)
CREATE TABLE IF NOT EXISTS obras_financeiro_despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('diesel', 'materiais', 'manutencao', 'outros')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_despesa DATE NOT NULL,
  maquinario_id UUID,
  fornecedor TEXT,
  comprovante_url TEXT,
  sincronizado_financeiro_principal BOOLEAN NOT NULL DEFAULT true,
  financeiro_principal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================

-- Índices para obras_financeiro_faturamentos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_faturamentos_obra_id') THEN
    CREATE INDEX idx_faturamentos_obra_id ON obras_financeiro_faturamentos(obra_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_faturamentos_rua_id') THEN
    CREATE INDEX idx_faturamentos_rua_id ON obras_financeiro_faturamentos(rua_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_faturamentos_status') THEN
    CREATE INDEX idx_faturamentos_status ON obras_financeiro_faturamentos(status);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_faturamentos_data_finalizacao') THEN
    CREATE INDEX idx_faturamentos_data_finalizacao ON obras_financeiro_faturamentos(data_finalizacao);
  END IF;
END $$;

-- Índices para obras_financeiro_despesas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_despesas_obra_id') THEN
    CREATE INDEX idx_despesas_obra_id ON obras_financeiro_despesas(obra_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_despesas_categoria') THEN
    CREATE INDEX idx_despesas_categoria ON obras_financeiro_despesas(categoria);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_despesas_data') THEN
    CREATE INDEX idx_despesas_data ON obras_financeiro_despesas(data_despesa);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_despesas_maquinario') THEN
    CREATE INDEX idx_despesas_maquinario ON obras_financeiro_despesas(maquinario_id);
  END IF;
END $$;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE obras_financeiro_faturamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras_financeiro_despesas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ver faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar faturamentos" ON obras_financeiro_faturamentos;

DROP POLICY IF EXISTS "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas;

-- Criar políticas novas
CREATE POLICY "Usuários autenticados podem ver faturamentos" ON obras_financeiro_faturamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir faturamentos" ON obras_financeiro_faturamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar faturamentos" ON obras_financeiro_faturamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar faturamentos" ON obras_financeiro_faturamentos
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- Comentários
-- ============================================

COMMENT ON TABLE obras_financeiro_faturamentos IS 'Faturamentos gerados quando ruas são finalizadas';
COMMENT ON TABLE obras_financeiro_despesas IS 'Despesas específicas de cada obra';
COMMENT ON COLUMN obras_financeiro_faturamentos.espessura_calculada IS 'Calculada pela fórmula: toneladas / metragem / 2.4 (densidade)';
COMMENT ON COLUMN obras_financeiro_despesas.sincronizado_financeiro_principal IS 'Indica se a despesa deve aparecer no financeiro principal';

-- ============================================
-- Verificação Final
-- ============================================

SELECT 
  'obras_financeiro_faturamentos' as tabela,
  COUNT(*) as total_registros
FROM obras_financeiro_faturamentos

UNION ALL

SELECT 
  'obras_financeiro_despesas' as tabela,
  COUNT(*) as total_registros
FROM obras_financeiro_despesas;

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- As tabelas foram criadas com sucesso.
-- Agora você pode acessar a aba Financeiro nas obras sem erros 404!
-- ============================================


