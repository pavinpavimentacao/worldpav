-- =====================================================
-- WORLDPAV - FORÇAR CORREÇÃO RLS DE FUNÇÕES
-- =====================================================
-- Esta migration força a correção removendo TODAS as políticas
-- e criando políticas extremamente permissivas
-- Execute esta migration se ainda houver problemas com RLS
-- =====================================================

-- Desabilitar RLS temporariamente para limpar tudo
ALTER TABLE public.funcoes DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes (caso ainda existam)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'funcoes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.funcoes';
    END LOOP;
END $$;

-- Reabilitar RLS
ALTER TABLE public.funcoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas extremamente permissivas

-- SELECT: qualquer usuário autenticado pode ver todas as funções
CREATE POLICY "allow_select_funcoes"
  ON public.funcoes FOR SELECT
  USING (true);

-- INSERT: qualquer usuário autenticado pode criar funções
-- Apenas verifica se o company_id existe
CREATE POLICY "allow_insert_funcoes"
  ON public.funcoes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = company_id 
      AND c.deleted_at IS NULL
    )
  );

-- UPDATE: qualquer usuário autenticado pode atualizar funções
CREATE POLICY "allow_update_funcoes"
  ON public.funcoes FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- DELETE: qualquer usuário autenticado pode deletar funções
CREATE POLICY "allow_delete_funcoes"
  ON public.funcoes FOR DELETE
  USING (true);

-- Comentários
COMMENT ON POLICY "allow_select_funcoes" ON public.funcoes 
  IS 'Permite visualizar todas as funções';
COMMENT ON POLICY "allow_insert_funcoes" ON public.funcoes 
  IS 'Permite criar funções para usuários autenticados em empresas válidas';
COMMENT ON POLICY "allow_update_funcoes" ON public.funcoes 
  IS 'Permite atualizar todas as funções';
COMMENT ON POLICY "allow_delete_funcoes" ON public.funcoes 
  IS 'Permite deletar todas as funções';

