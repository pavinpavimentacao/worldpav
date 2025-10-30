-- =====================================================
-- FIX: Políticas RLS para Programação de Pavimentação
-- =====================================================
-- Este script corrige as políticas RLS para permitir
-- inserção de programações sem autenticação JWT
-- =====================================================

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own company programacao_pavimentacao" ON public.programacao_pavimentacao;
DROP POLICY IF EXISTS "Users can insert own company programacao_pavimentacao" ON public.programacao_pavimentacao;
DROP POLICY IF EXISTS "Users can update own company programacao_pavimentacao" ON public.programacao_pavimentacao;
DROP POLICY IF EXISTS "Admins can delete programacao_pavimentacao" ON public.programacao_pavimentacao;

-- 2. Criar política permissiva para SELECT (visualização)
CREATE POLICY "Allow select programacao_pavimentacao for all users"
  ON public.programacao_pavimentacao FOR SELECT
  USING (true);

-- 3. Criar política permissiva para INSERT (criação)
CREATE POLICY "Allow insert programacao_pavimentacao for all users"
  ON public.programacao_pavimentacao FOR INSERT
  WITH CHECK (true);

-- 4. Criar política permissiva para UPDATE (atualização)
CREATE POLICY "Allow update programacao_pavimentacao for all users"
  ON public.programacao_pavimentacao FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Criar política permissiva para DELETE (exclusão)
CREATE POLICY "Allow delete programacao_pavimentacao for all users"
  ON public.programacao_pavimentacao FOR DELETE
  USING (true);

-- 6. Criar função RPC para inserir programação
CREATE OR REPLACE FUNCTION public.insert_programacao_bypass_rls(
  p_date DATE,
  p_team TEXT DEFAULT NULL,
  p_equipment TEXT[] DEFAULT NULL,
  p_observations TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'programado',
  p_company_id UUID DEFAULT NULL,
  p_obra_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Importante: executa com privilégios do proprietário
AS $$
DECLARE
  v_result json;
  v_company_id UUID;
  v_obra_id UUID;
BEGIN
  -- Se company_id não for fornecido, usar a primeira empresa disponível
  IF p_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies LIMIT 1;
  ELSE
    v_company_id := p_company_id;
  END IF;

  -- Se obra_id não for fornecido, usar a primeira obra disponível
  IF p_obra_id IS NULL THEN
    SELECT id INTO v_obra_id FROM public.obras LIMIT 1;
  ELSE
    v_obra_id := p_obra_id;
  END IF;

  -- Inserir programação
  INSERT INTO public.programacao_pavimentacao (
    date,
    team,
    equipment,
    observations,
    status,
    company_id,
    obra_id
  )
  VALUES (
    p_date,
    p_team,
    p_equipment,
    p_observations,
    p_status::status_programacao,
    v_company_id,
    v_obra_id
  )
  RETURNING json_build_object(
    'id', id,
    'date', date,
    'team', team,
    'equipment', equipment,
    'observations', observations,
    'status', status,
    'company_id', company_id,
    'obra_id', obra_id,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 7. Comentar função
COMMENT ON FUNCTION public.insert_programacao_bypass_rls IS 
  'Função para inserir programação sem restrições RLS (para desenvolvimento)';

-- 8. Verificar status
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'programacao_pavimentacao';
