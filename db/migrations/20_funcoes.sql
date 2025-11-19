-- =====================================================
-- WORLDPAV - FUNÇÕES DE COLABORADORES
-- =====================================================
-- Tabela para gerenciamento de funções/cargos dos colaboradores
-- Permite criar, editar e excluir funções customizadas
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql (deve ser executada primeiro)
-- =====================================================

-- =====================================================
-- 0. GARANTIR DEPENDÊNCIAS (se não existirem)
-- =====================================================

-- Garantir que a extensão uuid-ossp existe (necessária para uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Garantir que a tabela companies existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    CREATE TABLE public.companies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      cnpj TEXT UNIQUE,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      settings JSONB DEFAULT '{}'::jsonb,
      logo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      deleted_at TIMESTAMPTZ
    );
    
    COMMENT ON TABLE public.companies IS 'Empresas do sistema (multi-tenant)';
    RAISE NOTICE 'Tabela companies criada automaticamente';
  END IF;
END $$;

-- Garantir que o enum tipo_equipe existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_equipe') THEN
    CREATE TYPE tipo_equipe AS ENUM (
      'pavimentacao',
      'maquinas',
      'apoio'
    );
  END IF;
END $$;

-- Garantir que a tabela profiles existe (necessária para get_user_company_id)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Criar enum user_role se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
      CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
    END IF;
    
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY,
      company_id UUID NOT NULL,
      name TEXT NOT NULL,
      role user_role NOT NULL DEFAULT 'user',
      avatar_url TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
    
    COMMENT ON TABLE public.profiles IS 'Perfis de usuários (vinculados ao auth.users)';
    RAISE NOTICE 'Tabela profiles criada automaticamente';
  END IF;
END $$;

-- Garantir que a função get_user_company_id existe
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
-- 1. TABELA FUNÇÕES
-- =====================================================

-- Criar tabela sem foreign key primeiro (se não existir)
CREATE TABLE IF NOT EXISTS public.funcoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant (sem foreign key inicialmente)
  company_id UUID NOT NULL,
  
  -- Dados da função
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_equipe tipo_equipe, -- 'pavimentacao', 'maquinas', 'apoio' ou NULL para geral (usa o enum existente)
  ativo BOOLEAN NOT NULL DEFAULT true,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT funcoes_nome_not_empty CHECK (LENGTH(TRIM(nome)) > 0)
);

-- Adicionar foreign key se a tabela companies existir
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'funcoes' 
      AND constraint_name = 'funcoes_company_id_fkey'
    ) THEN
      ALTER TABLE public.funcoes 
      ADD CONSTRAINT funcoes_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Índice único parcial para garantir que não haja duplicatas de nome por empresa (apenas para registros não deletados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_funcoes_unique_nome_company 
  ON public.funcoes(company_id, nome) 
  WHERE deleted_at IS NULL;

COMMENT ON TABLE public.funcoes IS 'Funções/cargos dos colaboradores';
COMMENT ON COLUMN public.funcoes.company_id IS 'Empresa da função (isolamento multi-tenant)';
COMMENT ON COLUMN public.funcoes.nome IS 'Nome da função/cargo';
COMMENT ON COLUMN public.funcoes.descricao IS 'Descrição da função';
COMMENT ON COLUMN public.funcoes.tipo_equipe IS 'Tipo de equipe associada (opcional)';
COMMENT ON COLUMN public.funcoes.ativo IS 'Se a função está ativa';
COMMENT ON COLUMN public.funcoes.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_funcoes_company_id ON public.funcoes(company_id);
CREATE INDEX IF NOT EXISTS idx_funcoes_tipo_equipe ON public.funcoes(tipo_equipe);
CREATE INDEX IF NOT EXISTS idx_funcoes_ativo ON public.funcoes(ativo);
CREATE INDEX IF NOT EXISTS idx_funcoes_deleted_at ON public.funcoes(deleted_at);

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_funcoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_funcoes_updated_at ON public.funcoes;
CREATE TRIGGER trigger_update_funcoes_updated_at
  BEFORE UPDATE ON public.funcoes
  FOR EACH ROW
  EXECUTE FUNCTION update_funcoes_updated_at();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.funcoes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can insert own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can update own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can delete own company funcoes" ON public.funcoes;

-- Política de SELECT: usuários podem ver funções da própria empresa
-- Se o usuário tem perfil, verifica pelo company_id do perfil
-- Se não tem perfil, permite ver todas as funções de empresas válidas
CREATE POLICY "Users can view own company funcoes"
  ON public.funcoes FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      company_id = get_user_company_id()
      OR (
        get_user_company_id() IS NULL
        AND EXISTS (
          SELECT 1 FROM public.companies c 
          WHERE c.id = funcoes.company_id 
          AND c.deleted_at IS NULL
        )
      )
    )
  );

-- Política de INSERT: usuários autenticados podem criar funções
-- Verifica se o company_id existe na tabela companies e não está deletado
-- Política simples e permissiva para desenvolvimento
CREATE POLICY "Users can insert own company funcoes"
  ON public.funcoes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = company_id 
      AND c.deleted_at IS NULL
    )
  );

-- Política de UPDATE: usuários podem atualizar funções da própria empresa
CREATE POLICY "Users can update own company funcoes"
  ON public.funcoes FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      company_id = get_user_company_id()
      OR (
        get_user_company_id() IS NULL
        AND EXISTS (
          SELECT 1 FROM public.companies c 
          WHERE c.id = funcoes.company_id 
          AND c.deleted_at IS NULL
        )
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      company_id = get_user_company_id()
      OR (
        get_user_company_id() IS NULL
        AND EXISTS (
          SELECT 1 FROM public.companies c 
          WHERE c.id = funcoes.company_id 
          AND c.deleted_at IS NULL
        )
      )
    )
  );

-- Política de DELETE: usuários podem deletar funções da própria empresa (soft delete)
CREATE POLICY "Users can delete own company funcoes"
  ON public.funcoes FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (
      company_id = get_user_company_id()
      OR (
        get_user_company_id() IS NULL
        AND EXISTS (
          SELECT 1 FROM public.companies c 
          WHERE c.id = funcoes.company_id 
          AND c.deleted_at IS NULL
        )
      )
    )
  );

-- =====================================================
-- 5. COMENTÁRIOS DAS POLÍTICAS
-- =====================================================

COMMENT ON POLICY "Users can view own company funcoes" ON public.funcoes 
  IS 'Permite visualizar funções da mesma empresa do usuário';
COMMENT ON POLICY "Users can insert own company funcoes" ON public.funcoes 
  IS 'Permite criar funções na mesma empresa do usuário';
COMMENT ON POLICY "Users can update own company funcoes" ON public.funcoes 
  IS 'Permite atualizar funções da mesma empresa do usuário';
COMMENT ON POLICY "Users can delete own company funcoes" ON public.funcoes 
  IS 'Permite deletar funções da mesma empresa do usuário';

