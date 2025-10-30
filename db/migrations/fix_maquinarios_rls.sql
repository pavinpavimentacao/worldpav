-- =====================================================
-- FIX: Políticas RLS para Maquinários
-- =====================================================
-- Este script corrige as políticas RLS para permitir
-- inserção de maquinários sem autenticação JWT
-- =====================================================

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own company maquinarios" ON public.maquinarios;
DROP POLICY IF EXISTS "Users can insert own company maquinarios" ON public.maquinarios;
DROP POLICY IF EXISTS "Users can update own company maquinarios" ON public.maquinarios;
DROP POLICY IF EXISTS "Admins can delete maquinarios" ON public.maquinarios;

-- 2. Criar política permissiva para SELECT (visualização)
CREATE POLICY "Allow select maquinarios for all users"
  ON public.maquinarios FOR SELECT
  USING (true);

-- 3. Criar política permissiva para INSERT (criação)
CREATE POLICY "Allow insert maquinarios for all users"
  ON public.maquinarios FOR INSERT
  WITH CHECK (true);

-- 4. Criar política permissiva para UPDATE (atualização)
CREATE POLICY "Allow update maquinarios for all users"
  ON public.maquinarios FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Criar política permissiva para DELETE (exclusão)
CREATE POLICY "Allow delete maquinarios for all users"
  ON public.maquinarios FOR DELETE
  USING (true);

-- 6. Criar função RPC para inserir maquinários
CREATE OR REPLACE FUNCTION public.insert_maquinario_bypass_rls(
  p_name TEXT,
  p_type TEXT DEFAULT NULL,
  p_brand TEXT DEFAULT NULL,
  p_model TEXT DEFAULT NULL,
  p_plate TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_status TEXT DEFAULT 'ativo',
  p_observations TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_company_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Importante: executa com privilégios do proprietário
AS $$
DECLARE
  v_result json;
  v_company_id UUID;
BEGIN
  -- Se company_id não for fornecido, usar a primeira empresa disponível
  IF p_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies LIMIT 1;
  ELSE
    v_company_id := p_company_id;
  END IF;

  -- Inserir maquinário
  INSERT INTO public.maquinarios (
    name,
    type,
    brand,
    model,
    plate,
    year,
    status,
    observations,
    photo_url,
    company_id
  )
  VALUES (
    p_name,
    p_type,
    p_brand,
    p_model,
    p_plate,
    p_year,
    p_status::status_maquinario,
    p_observations,
    p_photo_url,
    v_company_id
  )
  RETURNING json_build_object(
    'id', id,
    'name', name,
    'type', type,
    'brand', brand,
    'model', model,
    'plate', plate,
    'year', year,
    'status', status,
    'observations', observations,
    'photo_url', photo_url,
    'company_id', company_id,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 7. Comentar função
COMMENT ON FUNCTION public.insert_maquinario_bypass_rls IS 
  'Função para inserir maquinários sem restrições RLS (para desenvolvimento)';

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
WHERE tablename = 'maquinarios';

