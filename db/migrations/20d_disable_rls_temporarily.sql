-- =====================================================
-- WORLDPAV - DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
-- Esta migration DESABILITA completamente o RLS na tabela funcoes
-- Use apenas para desenvolvimento/teste
-- NÃO USE EM PRODUÇÃO!
-- =====================================================

-- Desabilitar RLS completamente
ALTER TABLE public.funcoes DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'funcoes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.funcoes';
    END LOOP;
END $$;

-- Comentário de aviso
COMMENT ON TABLE public.funcoes IS 
  'Tabela de funções - RLS DESABILITADO TEMPORARIAMENTE PARA DESENVOLVIMENTO';

-- ALTERNATIVA: Se preferir manter RLS habilitado mas permitir operações sem autenticação
-- Descomente as linhas abaixo e comente as linhas acima:

/*
-- Manter RLS habilitado mas criar políticas que permitem operações sem autenticação
ALTER TABLE public.funcoes ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'funcoes' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.funcoes';
    END LOOP;
END $$;

-- Criar políticas que permitem tudo (mesmo sem autenticação)
CREATE POLICY "allow_all_funcoes_select" ON public.funcoes FOR SELECT USING (true);
CREATE POLICY "allow_all_funcoes_insert" ON public.funcoes FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all_funcoes_update" ON public.funcoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_funcoes_delete" ON public.funcoes FOR DELETE USING (true);
*/

