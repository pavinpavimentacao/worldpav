-- =====================================================
-- WORLDPAV - FOUNDATION (BASE DO SISTEMA)
-- =====================================================
-- Este script cria a estrutura base para o sistema multi-tenant:
-- - Extensões necessárias
-- - Tabela companies (empresas)
-- - Tabela profiles (usuários estendidos)
-- - Enums do sistema
-- - Functions auxiliares
--
-- EXECUTAR PRIMEIRO - É A BASE DE TUDO
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES
-- =====================================================

-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. ENUMS (TIPOS ENUMERADOS)
-- =====================================================

-- Status de obras
CREATE TYPE status_obra AS ENUM (
  'planejamento',
  'andamento',
  'concluida',
  'cancelada'
);

-- Status de ruas/etapas
CREATE TYPE status_rua AS ENUM (
  'planejada',
  'em_execucao',
  'concluida'
);

-- Tipo de equipe de colaboradores
CREATE TYPE tipo_equipe AS ENUM (
  'pavimentacao',
  'maquinas',
  'apoio'
);

-- Status de colaboradores
CREATE TYPE status_colaborador AS ENUM (
  'ativo',
  'inativo',
  'ferias',
  'afastado'
);

-- Status de maquinários
CREATE TYPE status_maquinario AS ENUM (
  'ativo',
  'manutencao',
  'inativo'
);

-- Tipo de licença de maquinário
CREATE TYPE tipo_licenca AS ENUM (
  'cnh',
  'alvara',
  'crlv',
  'outros'
);

-- Status de documentos
CREATE TYPE status_documento AS ENUM (
  'ativo',
  'vencido',
  'proximo_vencimento'
);

-- Status de seguros
CREATE TYPE status_seguro AS ENUM (
  'ativo',
  'vencido',
  'cancelado'
);

-- Status de medições
CREATE TYPE status_medicao AS ENUM (
  'pendente',
  'aprovada',
  'faturada'
);

-- Status de notas fiscais
CREATE TYPE status_nota_fiscal AS ENUM (
  'emitida',
  'enviada',
  'paga'
);

-- Status de contas a pagar
CREATE TYPE status_conta_pagar AS ENUM (
  'pendente',
  'pago',
  'atrasado',
  'cancelado'
);

-- Tipo de transação financeira
CREATE TYPE tipo_transacao AS ENUM (
  'receita',
  'despesa'
);

-- Status de transações
CREATE TYPE status_transacao AS ENUM (
  'pendente',
  'confirmado',
  'cancelado'
);

-- Turno
CREATE TYPE turno AS ENUM (
  'manha',
  'tarde',
  'noite'
);

-- Status de programação
CREATE TYPE status_programacao AS ENUM (
  'programado',
  'andamento',
  'concluido',
  'cancelado'
);

-- Status de relatórios
CREATE TYPE status_relatorio AS ENUM (
  'rascunho',
  'finalizado'
);

-- Nicho de parceiros
CREATE TYPE nicho_parceiro AS ENUM (
  'asfalto',
  'brita',
  'areia',
  'frete',
  'outros'
);

-- Status de guardas
CREATE TYPE status_guarda AS ENUM (
  'agendado',
  'realizado',
  'cancelado'
);

-- Status de anotações
CREATE TYPE status_note AS ENUM (
  'ativa',
  'resolvida',
  'arquivada'
);

-- Prioridade de anotações
CREATE TYPE prioridade_note AS ENUM (
  'baixa',
  'media',
  'alta'
);

-- Role de usuários
CREATE TYPE user_role AS ENUM (
  'admin',
  'manager',
  'user'
);

-- Status de controle diário
CREATE TYPE status_controle_diario AS ENUM (
  'rascunho',
  'finalizada'
);

-- Status de serviços
CREATE TYPE status_servico AS ENUM (
  'ativo',
  'inativo'
);

-- =====================================================
-- 3. TABELA COMPANIES (EMPRESAS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.companies (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados da empresa
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Configurações (JSON)
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Logo da empresa
  logo_url TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- Comentários
COMMENT ON TABLE public.companies IS 'Empresas do sistema (multi-tenant)';
COMMENT ON COLUMN public.companies.id IS 'ID único da empresa';
COMMENT ON COLUMN public.companies.name IS 'Nome da empresa';
COMMENT ON COLUMN public.companies.cnpj IS 'CNPJ da empresa (único)';
COMMENT ON COLUMN public.companies.settings IS 'Configurações da empresa em JSON';
COMMENT ON COLUMN public.companies.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 4. TABELA PROFILES (USUÁRIOS ESTENDIDOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- ID vinculado ao auth.users do Supabase
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Empresa do usuário (multi-tenant)
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados do usuário
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  phone TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentários
COMMENT ON TABLE public.profiles IS 'Perfis de usuários (vinculados ao auth.users)';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (mesmo do auth.users)';
COMMENT ON COLUMN public.profiles.company_id IS 'Empresa do usuário (isolamento multi-tenant)';
COMMENT ON COLUMN public.profiles.role IS 'Papel do usuário: admin, manager ou user';

-- =====================================================
-- 5. ÍNDICES
-- =====================================================

-- Índice para busca por empresa
CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON public.companies(deleted_at);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- =====================================================
-- 6. FUNCTION: UPDATE_UPDATED_AT_COLUMN
-- =====================================================
-- Atualiza automaticamente o campo updated_at

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza automaticamente o campo updated_at';

-- =====================================================
-- 7. FUNCTION: GET_USER_COMPANY_ID
-- =====================================================
-- Retorna o company_id do usuário logado (para RLS)

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_company_id() IS 'Retorna company_id do usuário logado (usado em RLS)';

-- =====================================================
-- 8. FUNCTION: GET_USER_ROLE
-- =====================================================
-- Retorna o role do usuário logado

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_role() IS 'Retorna role do usuário logado';

-- =====================================================
-- 9. FUNCTION: IS_USER_ADMIN
-- =====================================================
-- Verifica se o usuário logado é admin

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_user_admin() IS 'Verifica se usuário logado é admin';

-- =====================================================
-- 10. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para companies
CREATE TRIGGER trigger_update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para profiles
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) - PROFILES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas profiles da sua empresa
CREATE POLICY "Users can view own company profiles"
  ON public.profiles
  FOR SELECT
  USING (company_id = get_user_company_id());

-- Policy: Admins podem inserir novos usuários na sua empresa
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- Policy: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());

-- Policy: Admins podem atualizar profiles da empresa
CREATE POLICY "Admins can update company profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) - COMPANIES
-- =====================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas sua própria empresa
CREATE POLICY "Users can view own company"
  ON public.companies
  FOR SELECT
  USING (id = get_user_company_id());

-- Policy: Apenas admins podem atualizar dados da empresa
CREATE POLICY "Admins can update company"
  ON public.companies
  FOR UPDATE
  USING (
    id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT FOUNDATION
-- =====================================================
-- Próximo script: 01_clientes.sql
-- =====================================================


