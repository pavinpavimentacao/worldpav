-- =====================================================
-- WORLDPAV - DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
-- Este arquivo desabilita o RLS temporariamente para desenvolvimento
-- ATENÇÃO: NÃO USAR EM PRODUÇÃO!
-- =====================================================

-- Desabilitar RLS na tabela colaboradores temporariamente
ALTER TABLE public.colaboradores DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'colaboradores' AND schemaname = 'public';

-- Comentário de aviso
COMMENT ON TABLE public.colaboradores IS 'RLS DESABILITADO TEMPORARIAMENTE PARA DESENVOLVIMENTO - REABILITAR EM PRODUÇÃO!';

