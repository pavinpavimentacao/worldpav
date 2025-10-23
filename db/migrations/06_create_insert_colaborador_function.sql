-- =====================================================
-- WORLDPAV - FUNÇÃO PARA INSERIR COLABORADOR
-- =====================================================
-- Esta função contorna o RLS temporariamente para desenvolvimento
-- ATENÇÃO: NÃO USAR EM PRODUÇÃO!
-- =====================================================

-- Criar função para inserir colaborador contornando RLS
CREATE OR REPLACE FUNCTION insert_colaborador(
  p_name TEXT,
  p_cpf TEXT,
  p_rg TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_position TEXT,
  p_tipo_equipe TEXT,
  p_tipo_contrato TEXT,
  p_salario_fixo NUMERIC,
  p_status TEXT,
  p_registrado BOOLEAN,
  p_vale_transporte BOOLEAN,
  p_company_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
  new_colaborador JSON;
BEGIN
  -- Inserir colaborador diretamente, contornando RLS
  INSERT INTO public.colaboradores (
    name,
    cpf,
    rg,
    phone,
    email,
    position,
    tipo_equipe,
    tipo_contrato,
    salario_fixo,
    status,
    registrado,
    vale_transporte,
    company_id,
    created_at,
    updated_at
  ) VALUES (
    p_name,
    p_cpf,
    p_rg,
    p_phone,
    p_email,
    p_position,
    p_tipo_equipe::tipo_equipe,
    p_tipo_contrato::tipo_contrato,
    p_salario_fixo,
    p_status::status_colaborador,
    p_registrado,
    p_vale_transporte,
    p_company_id::UUID,
    NOW(),
    NOW()
  )
  RETURNING to_json(colaboradores.*) INTO new_colaborador;
  
  RETURN new_colaborador;
END;
$$;

-- Comentário de aviso
COMMENT ON FUNCTION insert_colaborador IS 'FUNÇÃO TEMPORÁRIA PARA CONTORNAR RLS - REMOVER EM PRODUÇÃO!';

