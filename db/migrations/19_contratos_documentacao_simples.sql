-- =====================================================
-- WORLDPAV - CONTRATOS E DOCUMENTAÇÃO (EXECUÇÃO SIMPLES)
-- =====================================================
-- Execute este script completo no Supabase SQL Editor
-- =====================================================

-- 1. Criar tipos ENUM primeiro
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contrato_type') THEN
        CREATE TYPE contrato_type AS ENUM (
          'contrato',
          'proposta',
          'termo',
          'aditivo'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contrato_status') THEN
        CREATE TYPE contrato_status AS ENUM (
          'ativo',
          'vencido',
          'cancelado'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'documentacao_type') THEN
        CREATE TYPE documentacao_type AS ENUM (
          'nrs',
          'licenca',
          'certificado',
          'outros'
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'documentacao_status') THEN
        CREATE TYPE documentacao_status AS ENUM (
          'ativo',
          'vencido',
          'proximo_vencimento'
        );
    END IF;
END $$;

-- 2. Criar tabela contratos
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type contrato_type NOT NULL DEFAULT 'contrato',
  status contrato_status NOT NULL DEFAULT 'ativo',
  value DECIMAL(15, 2),
  start_date DATE NOT NULL,
  end_date DATE,
  file_path TEXT,
  file_name TEXT,
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT contratos_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT contratos_dates_valid CHECK (
    end_date IS NULL OR 
    start_date IS NULL OR 
    end_date >= start_date
  ),
  CONSTRAINT contratos_value_positive CHECK (
    value IS NULL OR value >= 0
  )
);

-- 3. Criar tabela documentação
CREATE TABLE IF NOT EXISTS public.documentacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type documentacao_type NOT NULL DEFAULT 'nrs',
  category TEXT,
  valid_from DATE,
  valid_until DATE,
  file_path TEXT,
  file_name TEXT,
  status documentacao_status NOT NULL DEFAULT 'ativo',
  observations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT documentacao_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT documentacao_dates_valid CHECK (
    valid_until IS NULL OR 
    valid_from IS NULL OR 
    valid_until >= valid_from
  )
);

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_contratos_company_id ON public.contratos(company_id);
CREATE INDEX IF NOT EXISTS idx_contratos_client_id ON public.contratos(client_id);
CREATE INDEX IF NOT EXISTS idx_contratos_obra_id ON public.contratos(obra_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.contratos(status);
CREATE INDEX IF NOT EXISTS idx_contratos_type ON public.contratos(type);

CREATE INDEX IF NOT EXISTS idx_documentacao_company_id ON public.documentacao(company_id);
CREATE INDEX IF NOT EXISTS idx_documentacao_client_id ON public.documentacao(client_id);
CREATE INDEX IF NOT EXISTS idx_documentacao_obra_id ON public.documentacao(obra_id);
CREATE INDEX IF NOT EXISTS idx_documentacao_status ON public.documentacao(status);
CREATE INDEX IF NOT EXISTS idx_documentacao_type ON public.documentacao(type);
CREATE INDEX IF NOT EXISTS idx_documentacao_valid_until ON public.documentacao(valid_until);

-- 5. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_documentacao_updated_at
  BEFORE UPDATE ON public.documentacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Habilitar RLS
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentacao ENABLE ROW LEVEL SECURITY;

-- 7. Criar policies básicas (assumindo que as funções get_user_company_id e is_user_admin existem)
-- Se não existirem, você pode criar policies mais simples:

-- Policies para contratos
CREATE POLICY "Users can view own company contratos"
  ON public.contratos FOR SELECT
  USING (true); -- Temporário - ajustar depois

CREATE POLICY "Users can insert own company contratos"
  ON public.contratos FOR INSERT
  WITH CHECK (true); -- Temporário - ajustar depois

CREATE POLICY "Users can update own company contratos"
  ON public.contratos FOR UPDATE
  USING (true); -- Temporário - ajustar depois

CREATE POLICY "Users can delete own company contratos"
  ON public.contratos FOR DELETE
  USING (true); -- Temporário - ajustar depois

-- Policies para documentação
CREATE POLICY "Users can view own company documentacao"
  ON public.documentacao FOR SELECT
  USING (true); -- Temporário - ajustar depois

CREATE POLICY "Users can insert own company documentacao"
  ON public.documentacao FOR INSERT
  WITH CHECK (true); -- Temporário - ajustar depois

CREATE POLICY "Users can update own company documentacao"
  ON public.documentacao FOR UPDATE
  USING (true); -- Temporário - ajustar depois

CREATE POLICY "Users can delete own company documentacao"
  ON public.documentacao FOR DELETE
  USING (true); -- Temporário - ajustar depois

-- 8. Comentários
COMMENT ON TABLE public.contratos IS 'Contratos e documentos de clientes';
COMMENT ON TABLE public.documentacao IS 'Documentação e NRS de clientes';

-- Verificar se as tabelas foram criadas
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename IN ('contratos', 'documentacao');
