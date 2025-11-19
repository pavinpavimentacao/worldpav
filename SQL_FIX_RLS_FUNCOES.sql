-- =====================================================
-- SQL PARA CORRIGIR RLS DE FUNÇÕES - EXECUTE ESTE ARQUIVO
-- =====================================================
-- Copie e cole TODO este conteúdo no Supabase SQL Editor
-- =====================================================

-- PASSO 1: Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS public.funcoes DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as políticas existentes (múltiplas tentativas)
DROP POLICY IF EXISTS "Users can view own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can insert own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can update own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can delete own company funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can view funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can insert funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can update funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "Users can delete funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_select_funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_insert_funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_update_funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_delete_funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_all_funcoes" ON public.funcoes;
DROP POLICY IF EXISTS "allow_all_funcoes_select" ON public.funcoes;
DROP POLICY IF EXISTS "allow_all_funcoes_insert" ON public.funcoes;
DROP POLICY IF EXISTS "allow_all_funcoes_update" ON public.funcoes;
DROP POLICY IF EXISTS "allow_all_funcoes_delete" ON public.funcoes;

-- PASSO 3: Remover políticas restantes usando loop
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'funcoes' 
        AND schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.funcoes';
    END LOOP;
END $$;

-- PASSO 4: Verificar se RLS está desabilitado (deve retornar false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'funcoes';

-- Se você quiser manter RLS habilitado mas com políticas permissivas,
-- descomente as linhas abaixo e comente o PASSO 1:

/*
-- Reabilitar RLS
ALTER TABLE public.funcoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas que permitem TUDO (mesmo sem autenticação)
CREATE POLICY "allow_all_funcoes_select" 
  ON public.funcoes FOR SELECT 
  USING (true);

CREATE POLICY "allow_all_funcoes_insert" 
  ON public.funcoes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "allow_all_funcoes_update" 
  ON public.funcoes FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "allow_all_funcoes_delete" 
  ON public.funcoes FOR DELETE 
  USING (true);
*/

