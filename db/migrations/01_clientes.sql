-- =====================================================
-- WORLDPAV - CLIENTES
-- =====================================================
-- Tabela para gerenciar clientes da empresa
-- Cada cliente pertence a uma empresa (multi-tenant)
--
-- DEPENDÊNCIAS: 00_foundation.sql
-- =====================================================

-- =====================================================
-- 1. TABELA CLIENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clients (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados do cliente
  name TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  phone TEXT,
  
  -- Endereço
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT clients_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Comentários
COMMENT ON TABLE public.clients IS 'Clientes da empresa (multi-tenant)';
COMMENT ON COLUMN public.clients.id IS 'ID único do cliente';
COMMENT ON COLUMN public.clients.company_id IS 'Empresa do cliente (isolamento multi-tenant)';
COMMENT ON COLUMN public.clients.name IS 'Nome do cliente';
COMMENT ON COLUMN public.clients.cpf_cnpj IS 'CPF ou CNPJ do cliente';
COMMENT ON COLUMN public.clients.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

-- Índice para busca por empresa (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_clients_company_id 
  ON public.clients(company_id);

-- Índice para busca por CPF/CNPJ
CREATE INDEX IF NOT EXISTS idx_clients_cpf_cnpj 
  ON public.clients(cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

-- Índice para soft delete
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at 
  ON public.clients(deleted_at);

-- Índice composto para queries comuns (empresa + não deletados)
CREATE INDEX IF NOT EXISTS idx_clients_company_active 
  ON public.clients(company_id, deleted_at);

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_clients_name 
  ON public.clients USING gin(to_tsvector('portuguese', name));

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuários veem apenas clientes da sua empresa
CREATE POLICY "Users can view own company clients"
  ON public.clients
  FOR SELECT
  USING (company_id = get_user_company_id());

-- Policy: INSERT - Usuários podem criar clientes na sua empresa
CREATE POLICY "Users can insert own company clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Policy: UPDATE - Usuários podem atualizar clientes não deletados da sua empresa
CREATE POLICY "Users can update own company clients"
  ON public.clients
  FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

-- Policy: DELETE - Apenas admins podem deletar (recomenda-se soft delete)
CREATE POLICY "Admins can delete clients"
  ON public.clients
  FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT CLIENTS
-- =====================================================
-- Próximo script: 02_obras.sql
-- =====================================================


