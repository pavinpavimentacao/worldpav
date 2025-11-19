-- =====================================================
-- WORLDPAV - CRIAR FUNÇÃO RPC PARA INSERIR FUNÇÃO
-- =====================================================
-- Cria uma função RPC que bypassa o RLS usando SECURITY DEFINER
-- Isso permite inserir funções mesmo com RLS habilitado
-- =====================================================

-- Remover funções antigas se existirem (todas as versões possíveis)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remover todas as versões de insert_funcao
    FOR r IN (
        SELECT oid::regprocedure as func_name
        FROM pg_proc
        WHERE proname = 'insert_funcao'
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_name || ' CASCADE';
    END LOOP;
    
    -- Remover todas as versões de update_funcao
    FOR r IN (
        SELECT oid::regprocedure as func_name
        FROM pg_proc
        WHERE proname = 'update_funcao'
        AND pronamespace = 'public'::regnamespace
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_name || ' CASCADE';
    END LOOP;
END $$;

-- Função para inserir função (bypass RLS)
-- IMPORTANTE: Parâmetros em ordem alfabética para PostgREST
CREATE OR REPLACE FUNCTION public.insert_funcao(
  p_ativo BOOLEAN DEFAULT true,
  p_company_id UUID,
  p_descricao TEXT DEFAULT NULL,
  p_nome TEXT,
  p_tipo_equipe tipo_equipe DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Inserir a função e retornar como JSONB
  INSERT INTO public.funcoes (
    company_id,
    nome,
    descricao,
    tipo_equipe,
    ativo
  ) VALUES (
    p_company_id,
    p_nome,
    p_descricao,
    p_tipo_equipe,
    p_ativo
  )
  RETURNING to_jsonb(funcoes.*) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Garantir que a função seja exposta no PostgREST
GRANT EXECUTE ON FUNCTION public.insert_funcao TO anon;
GRANT EXECUTE ON FUNCTION public.insert_funcao TO authenticated;

-- Comentário
COMMENT ON FUNCTION public.insert_funcao IS 
  'Insere uma função na tabela funcoes, bypassando RLS (usar apenas em desenvolvimento)';

-- Garantir que a função seja exposta no PostgREST
GRANT EXECUTE ON FUNCTION public.insert_funcao TO anon;
GRANT EXECUTE ON FUNCTION public.insert_funcao TO authenticated;

-- Função para atualizar função (bypass RLS)
CREATE OR REPLACE FUNCTION public.update_funcao(
  p_id UUID,
  p_nome TEXT DEFAULT NULL,
  p_descricao TEXT DEFAULT NULL,
  p_tipo_equipe tipo_equipe DEFAULT NULL,
  p_ativo BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  nome TEXT,
  descricao TEXT,
  tipo_equipe tipo_equipe,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar a função
  UPDATE public.funcoes
  SET 
    nome = COALESCE(p_nome, nome),
    descricao = COALESCE(p_descricao, descricao),
    tipo_equipe = COALESCE(p_tipo_equipe, tipo_equipe),
    ativo = COALESCE(p_ativo, ativo),
    updated_at = NOW()
  WHERE id = p_id;
  
  -- Retornar os dados atualizados
  RETURN QUERY
  SELECT 
    f.id,
    f.company_id,
    f.nome,
    f.descricao,
    f.tipo_equipe,
    f.ativo,
    f.created_at,
    f.updated_at
  FROM public.funcoes f
  WHERE f.id = p_id;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.update_funcao IS 
  'Atualiza uma função na tabela funcoes, bypassando RLS (usar apenas em desenvolvimento)';

