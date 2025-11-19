-- =====================================================
-- WORLDPAV - CORRIGIR TODAS AS POLÍTICAS RLS DE FUNÇÕES
-- =====================================================
-- Remove todas as políticas antigas e cria novas políticas
-- muito permissivas para desenvolvimento
--
-- DEPENDÊNCIAS: 
-- - 20_funcoes.sql
-- =====================================================

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "Users can view own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can insert own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can update own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can delete own company funcoes" ON public.funcoes;

-- =====================================================
-- POLÍTICAS RLS SIMPLIFICADAS E PERMISSIVAS
-- =====================================================

-- Política de SELECT: qualquer usuário autenticado pode ver funções
CREATE POLICY "Users can view funcoes"
  ON public.funcoes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política de INSERT: qualquer usuário autenticado pode criar funções
-- desde que o company_id exista e não esteja deletado
CREATE POLICY "Users can insert funcoes"
  ON public.funcoes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = company_id 
      AND c.deleted_at IS NULL
    )
  );

-- Política de UPDATE: qualquer usuário autenticado pode atualizar funções
CREATE POLICY "Users can update funcoes"
  ON public.funcoes FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política de DELETE: qualquer usuário autenticado pode deletar funções (soft delete)
CREATE POLICY "Users can delete funcoes"
  ON public.funcoes FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON POLICY "Users can view funcoes" ON public.funcoes 
  IS 'Permite visualizar funções para usuários autenticados';
COMMENT ON POLICY "Users can insert funcoes" ON public.funcoes 
  IS 'Permite criar funções para usuários autenticados em empresas válidas';
COMMENT ON POLICY "Users can update funcoes" ON public.funcoes 
  IS 'Permite atualizar funções para usuários autenticados';
COMMENT ON POLICY "Users can delete funcoes" ON public.funcoes 
  IS 'Permite deletar funções para usuários autenticados';

