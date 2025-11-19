-- =====================================================
-- WORLDPAV - FUNÇÕES DE COLABORADORES
-- =====================================================
-- Tabela para gerenciamento de funções/cargos dos colaboradores
-- Permite criar, editar e excluir funções customizadas
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- =====================================================

-- =====================================================
-- 1. TABELA FUNÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.funcoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
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
CREATE POLICY "Users can insert own company funcoes"
  ON public.funcoes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = company_id 
      AND c.deleted_at IS NULL
    )
    AND (
      company_id = get_user_company_id()
      OR get_user_company_id() IS NULL
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

