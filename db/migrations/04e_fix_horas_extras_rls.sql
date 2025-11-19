-- =====================================================
-- WORLDPAV - CORRIGIR RLS DE HORAS EXTRAS
-- =====================================================
-- Corrige a política RLS para permitir inserção de horas extras
-- quando o colaborador pertence à empresa do usuário
--
-- DEPENDÊNCIAS: 
-- - 04c_colaboradores_horas_extras.sql
-- =====================================================

-- Remover todas as políticas antigas de colaboradores_horas_extras
DROP POLICY IF EXISTS "Users can view own company horas extras" ON public.colaboradores_horas_extras;
DROP POLICY IF EXISTS "Users can insert own company horas extras" ON public.colaboradores_horas_extras;
DROP POLICY IF EXISTS "Users can update own company horas extras" ON public.colaboradores_horas_extras;
DROP POLICY IF EXISTS "Users can delete own company horas extras" ON public.colaboradores_horas_extras;

-- Criar política de SELECT
-- Usa a mesma lógica da tabela colaboradores_documentos
-- Verifica se o colaborador pertence à empresa do usuário
CREATE POLICY "Users can view own company horas extras"
  ON public.colaboradores_horas_extras FOR SELECT
  USING (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
      AND deleted_at IS NULL
    )
  );

-- Criar política de INSERT
-- Usa a mesma lógica da tabela colaboradores_documentos
-- Verifica se o colaborador pertence à empresa do usuário
CREATE POLICY "Users can insert own company horas extras"
  ON public.colaboradores_horas_extras FOR INSERT
  WITH CHECK (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
      AND deleted_at IS NULL
    )
  );

-- Criar política de UPDATE
-- Usa a mesma lógica da tabela colaboradores_documentos
-- Verifica se o colaborador pertence à empresa do usuário
CREATE POLICY "Users can update own company horas extras"
  ON public.colaboradores_horas_extras FOR UPDATE
  USING (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
      AND deleted_at IS NULL
    )
  );

-- Criar política de DELETE
-- Usa a mesma lógica da tabela colaboradores_documentos
-- Verifica se o colaborador pertence à empresa do usuário
CREATE POLICY "Users can delete own company horas extras"
  ON public.colaboradores_horas_extras FOR DELETE
  USING (
    colaborador_id IN (
      SELECT id FROM public.colaboradores 
      WHERE company_id = get_user_company_id()
      AND deleted_at IS NULL
    )
  );

-- Comentários
COMMENT ON POLICY "Users can view own company horas extras" ON public.colaboradores_horas_extras 
  IS 'Permite visualizar horas extras para colaboradores da mesma empresa do usuário';
COMMENT ON POLICY "Users can insert own company horas extras" ON public.colaboradores_horas_extras 
  IS 'Permite inserir horas extras para colaboradores da mesma empresa do usuário';
COMMENT ON POLICY "Users can update own company horas extras" ON public.colaboradores_horas_extras 
  IS 'Permite atualizar horas extras para colaboradores da mesma empresa do usuário';
COMMENT ON POLICY "Users can delete own company horas extras" ON public.colaboradores_horas_extras 
  IS 'Permite deletar horas extras para colaboradores da mesma empresa do usuário';

