-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- =====================================================
-- ATENÇÃO: Isto é apenas para desenvolvimento!
-- Em produção, reabilite o RLS e configure as policies corretas
-- =====================================================

-- Desabilitar RLS na tabela obras
ALTER TABLE public.obras DISABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON TABLE public.obras IS 'Obras de pavimentação (RLS DESABILITADO TEMPORARIAMENTE PARA DEV)';

