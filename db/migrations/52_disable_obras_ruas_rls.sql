-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA DESENVOLVIMENTO
-- =====================================================
-- ATENÇÃO: Isto é apenas para desenvolvimento!
-- Em produção, reabilite o RLS e configure as policies corretas
-- =====================================================

-- Desabilitar RLS na tabela obras_ruas
ALTER TABLE public.obras_ruas DISABLE ROW LEVEL SECURITY;

-- Comentário
COMMENT ON TABLE public.obras_ruas IS 'Ruas/etapas das obras (RLS DESABILITADO TEMPORARIAMENTE PARA DEV)';

