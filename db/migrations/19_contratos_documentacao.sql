-- =====================================================
-- WORLDPAV - CONTRATOS E DOCUMENTAÇÃO
-- =====================================================
-- Sistema de contratos e documentação de clientes
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 01_clientes.sql
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUM PARA CONTRATOS E DOCUMENTAÇÃO
-- =====================================================

-- Tipo de contrato
CREATE TYPE contrato_type AS ENUM (
  'contrato',
  'proposta',
  'termo',
  'aditivo'
);

-- Status de contrato
CREATE TYPE contrato_status AS ENUM (
  'ativo',
  'vencido',
  'cancelado'
);

-- Tipo de documentação
CREATE TYPE documentacao_type AS ENUM (
  'nrs',
  'licenca',
  'certificado',
  'outros'
);

-- Status de documentação
CREATE TYPE documentacao_status AS ENUM (
  'ativo',
  'vencido',
  'proximo_vencimento'
);

-- Comentários dos tipos
COMMENT ON TYPE contrato_type IS 'Tipos de contrato: contrato, proposta, termo, aditivo';
COMMENT ON TYPE contrato_status IS 'Status de contrato: ativo, vencido, cancelado';
COMMENT ON TYPE documentacao_type IS 'Tipos de documentação: nrs, licenca, certificado, outros';
COMMENT ON TYPE documentacao_status IS 'Status de documentação: ativo, vencido, proximo_vencimento';

-- =====================================================
-- 2. TABELA CONTRATOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contratos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Cliente relacionado
  client_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  -- Obra relacionada (opcional)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Dados do contrato
  name TEXT NOT NULL,
  type contrato_type NOT NULL DEFAULT 'contrato',
  status contrato_status NOT NULL DEFAULT 'ativo',
  
  -- Valores
  value DECIMAL(15, 2),
  
  -- Datas
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Documentos
  file_path TEXT, -- Caminho do arquivo no storage
  file_name TEXT, -- Nome original do arquivo
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
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

COMMENT ON TABLE public.contratos IS 'Contratos e documentos de clientes';
COMMENT ON COLUMN public.contratos.name IS 'Nome/título do contrato';
COMMENT ON COLUMN public.contratos.type IS 'Tipo: contrato, proposta, termo, aditivo';
COMMENT ON COLUMN public.contratos.status IS 'Status: ativo, vencido, cancelado';
COMMENT ON COLUMN public.contratos.value IS 'Valor do contrato';
COMMENT ON COLUMN public.contratos.file_path IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN public.contratos.file_name IS 'Nome original do arquivo';

-- =====================================================
-- 2. TABELA DOCUMENTACAO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documentacao (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Cliente relacionado
  client_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  -- Obra relacionada (opcional)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Dados da documentação
  name TEXT NOT NULL,
  type documentacao_type NOT NULL DEFAULT 'nrs',
  category TEXT, -- Categoria específica (ex: "NRS 12", "NRS 35")
  
  -- Validade
  valid_from DATE,
  valid_until DATE,
  
  -- Documentos
  file_path TEXT, -- Caminho do arquivo no storage
  file_name TEXT, -- Nome original do arquivo
  
  -- Status
  status documentacao_status NOT NULL DEFAULT 'ativo',
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT documentacao_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT documentacao_dates_valid CHECK (
    valid_until IS NULL OR 
    valid_from IS NULL OR 
    valid_until >= valid_from
  )
);

COMMENT ON TABLE public.documentacao IS 'Documentação e NRS de clientes';
COMMENT ON COLUMN public.documentacao.name IS 'Nome/título da documentação';
COMMENT ON COLUMN public.documentacao.type IS 'Tipo: nrs, licenca, certificado, outros';
COMMENT ON COLUMN public.documentacao.category IS 'Categoria específica (ex: NRS 12, NRS 35)';
COMMENT ON COLUMN public.documentacao.valid_from IS 'Data de início da validade';
COMMENT ON COLUMN public.documentacao.valid_until IS 'Data de vencimento';
COMMENT ON COLUMN public.documentacao.file_path IS 'Caminho do arquivo no storage';
COMMENT ON COLUMN public.documentacao.file_name IS 'Nome original do arquivo';

-- =====================================================
-- 3. ÍNDICES
-- =====================================================

-- Contratos
CREATE INDEX IF NOT EXISTS idx_contratos_company_id 
  ON public.contratos(company_id);

CREATE INDEX IF NOT EXISTS idx_contratos_client_id 
  ON public.contratos(client_id);

CREATE INDEX IF NOT EXISTS idx_contratos_obra_id 
  ON public.contratos(obra_id);

CREATE INDEX IF NOT EXISTS idx_contratos_status 
  ON public.contratos(status);

CREATE INDEX IF NOT EXISTS idx_contratos_type 
  ON public.contratos(type);

CREATE INDEX IF NOT EXISTS idx_contratos_deleted_at 
  ON public.contratos(deleted_at);

-- Documentação
CREATE INDEX IF NOT EXISTS idx_documentacao_company_id 
  ON public.documentacao(company_id);

CREATE INDEX IF NOT EXISTS idx_documentacao_client_id 
  ON public.documentacao(client_id);

CREATE INDEX IF NOT EXISTS idx_documentacao_obra_id 
  ON public.documentacao(obra_id);

CREATE INDEX IF NOT EXISTS idx_documentacao_status 
  ON public.documentacao(status);

CREATE INDEX IF NOT EXISTS idx_documentacao_type 
  ON public.documentacao(type);

CREATE INDEX IF NOT EXISTS idx_documentacao_valid_until 
  ON public.documentacao(valid_until);

CREATE INDEX IF NOT EXISTS idx_documentacao_deleted_at 
  ON public.documentacao(deleted_at);

-- =====================================================
-- 4. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_contratos_updated_at
  BEFORE UPDATE ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_documentacao_updated_at
  BEFORE UPDATE ON public.documentacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Contratos
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company contratos"
  ON public.contratos FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company contratos"
  ON public.contratos FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company contratos"
  ON public.contratos FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete contratos"
  ON public.contratos FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- Documentação
ALTER TABLE public.documentacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company documentacao"
  ON public.documentacao FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company documentacao"
  ON public.documentacao FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company documentacao"
  ON public.documentacao FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete documentacao"
  ON public.documentacao FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT CONTRATOS E DOCUMENTAÇÃO
-- =====================================================
