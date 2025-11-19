-- =====================================================
-- VERIFICAR POLÍTICAS RLS RESTANTES
-- =====================================================

-- Verificar se há políticas na tabela funcoes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'funcoes';

-- Verificar status do RLS
SELECT 
    tablename, 
    rowsecurity,
    schemaname
FROM pg_tables 
WHERE tablename = 'funcoes';

-- Verificar se há políticas em outros schemas
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename LIKE '%funcoes%';

-- Forçar desabilitar RLS novamente (caso tenha sido reabilitado)
ALTER TABLE public.funcoes DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas novamente (garantir)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, policyname 
        FROM pg_policies 
        WHERE tablename = 'funcoes'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.funcoes';
    END LOOP;
END $$;

