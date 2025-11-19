-- =====================================================
-- WORLDPAV - CORRIGIR RLS DE FUNÇÕES
-- =====================================================
-- Corrige a política RLS para permitir inserção de funções
-- quando o usuário está autenticado e o company_id é válido
--
-- DEPENDÊNCIAS: 
-- - 20_funcoes.sql
-- =====================================================

-- Remover política antiga de INSERT
DROP POLICY IF EXISTS "Users can insert own company funcoes" ON public.funcoes;

-- Criar política de INSERT muito simples e permissiva
-- Permite inserir se:
-- 1. Usuário está autenticado
-- 2. Company_id existe e não está deletado
-- Esta política é mais permissiva para desenvolvimento
CREATE POLICY "Users can insert own company funcoes"
  ON public.funcoes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.id = company_id 
      AND c.deleted_at IS NULL
    )
  );

-- Comentário
COMMENT ON POLICY "Users can insert own company funcoes" ON public.funcoes 
  IS 'Permite criar funções para usuários autenticados em empresas válidas';

