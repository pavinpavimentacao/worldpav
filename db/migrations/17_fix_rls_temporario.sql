-- =====================================================
-- WORLDPAV - FIX RLS TEMPORÁRIO
-- =====================================================
-- Solução temporária para problemas de RLS
-- =====================================================

-- =====================================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
-- Desabilita RLS para permitir inserções

ALTER TABLE public.colaboradores_documentos_nr DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. RECRIAR POLÍTICAS MAIS PERMISSIVAS
-- =====================================================
-- Políticas mais simples que não dependem de funções complexas

ALTER TABLE public.colaboradores_documentos_nr ENABLE ROW LEVEL SECURITY;

-- Política de SELECT - permitir visualizar todos os documentos
CREATE POLICY "Allow all SELECT on colaboradores_documentos_nr"
  ON public.colaboradores_documentos_nr FOR SELECT
  USING (true);

-- Política de INSERT - permitir inserir documentos
CREATE POLICY "Allow all INSERT on colaboradores_documentos_nr"
  ON public.colaboradores_documentos_nr FOR INSERT
  WITH CHECK (true);

-- Política de UPDATE - permitir atualizar documentos
CREATE POLICY "Allow all UPDATE on colaboradores_documentos_nr"
  ON public.colaboradores_documentos_nr FOR UPDATE
  USING (true);

-- Política de DELETE - permitir deletar documentos
CREATE POLICY "Allow all DELETE on colaboradores_documentos_nr"
  ON public.colaboradores_documentos_nr FOR DELETE
  USING (true);

-- =====================================================
-- 3. APLICAR MESMO FIX PARA COLABORADORES_DOCUMENTOS
-- =====================================================

ALTER TABLE public.colaboradores_documentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_documentos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own company colaboradores_documentos" ON public.colaboradores_documentos;
DROP POLICY IF EXISTS "Users can insert own company colaboradores_documentos" ON public.colaboradores_documentos;
DROP POLICY IF EXISTS "Users can update own company colaboradores_documentos" ON public.colaboradores_documentos;
DROP POLICY IF EXISTS "Admins can delete colaboradores_documentos" ON public.colaboradores_documentos;

-- Criar políticas mais simples
CREATE POLICY "Allow all SELECT on colaboradores_documentos"
  ON public.colaboradores_documentos FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on colaboradores_documentos"
  ON public.colaboradores_documentos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on colaboradores_documentos"
  ON public.colaboradores_documentos FOR UPDATE
  USING (true);

CREATE POLICY "Allow all DELETE on colaboradores_documentos"
  ON public.colaboradores_documentos FOR DELETE
  USING (true);

-- =====================================================
-- FIM DO SCRIPT FIX RLS TEMPORÁRIO
-- =====================================================
