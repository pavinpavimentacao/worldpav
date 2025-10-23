-- =====================================================
-- WORLDPAV - RPC FUNCTIONS
-- =====================================================
-- Funções RPC para contornar problemas de RLS
-- =====================================================

-- =====================================================
-- 1. FUNCTION: CREATE_DOCUMENTO_NR
-- =====================================================
-- Cria documento NR contornando RLS

CREATE OR REPLACE FUNCTION public.create_documento_nr(
  p_colaborador_id UUID,
  p_tipo_documento TEXT,
  p_data_validade DATE,
  p_arquivo_url TEXT DEFAULT NULL
)
RETURNS public.colaboradores_documentos_nr AS $$
DECLARE
  v_documento public.colaboradores_documentos_nr;
BEGIN
  -- Verificar se o colaborador existe e pertence à empresa do usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.colaboradores c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = p_colaborador_id 
    AND p.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Colaborador não encontrado ou não pertence à sua empresa';
  END IF;

  -- Inserir documento
  INSERT INTO public.colaboradores_documentos_nr (
    colaborador_id,
    tipo_documento,
    data_validade,
    arquivo_url
  ) VALUES (
    p_colaborador_id,
    p_tipo_documento,
    p_data_validade,
    p_arquivo_url
  ) RETURNING * INTO v_documento;

  RETURN v_documento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_documento_nr IS 'Cria documento NR contornando RLS';

-- =====================================================
-- 2. FUNCTION: UPDATE_DOCUMENTO_NR
-- =====================================================
-- Atualiza documento NR contornando RLS

CREATE OR REPLACE FUNCTION public.update_documento_nr(
  p_id UUID,
  p_data_validade DATE DEFAULT NULL,
  p_arquivo_url TEXT DEFAULT NULL
)
RETURNS public.colaboradores_documentos_nr AS $$
DECLARE
  v_documento public.colaboradores_documentos_nr;
BEGIN
  -- Verificar se o documento existe e pertence à empresa do usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.colaboradores_documentos_nr d
    JOIN public.colaboradores c ON c.id = d.colaborador_id
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE d.id = p_id 
    AND p.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Documento não encontrado ou não pertence à sua empresa';
  END IF;

  -- Atualizar documento
  UPDATE public.colaboradores_documentos_nr 
  SET 
    data_validade = COALESCE(p_data_validade, data_validade),
    arquivo_url = COALESCE(p_arquivo_url, arquivo_url),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_documento;

  RETURN v_documento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_documento_nr IS 'Atualiza documento NR contornando RLS';

-- =====================================================
-- 3. FUNCTION: CREATE_DOCUMENTO_PESSOAL
-- =====================================================
-- Cria documento pessoal contornando RLS

CREATE OR REPLACE FUNCTION public.create_documento_pessoal(
  p_colaborador_id UUID,
  p_document_type TEXT,
  p_file_name TEXT,
  p_file_url TEXT,
  p_file_size BIGINT DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL
)
RETURNS public.colaboradores_documentos AS $$
DECLARE
  v_documento public.colaboradores_documentos;
BEGIN
  -- Verificar se o colaborador existe e pertence à empresa do usuário
  IF NOT EXISTS (
    SELECT 1 FROM public.colaboradores c
    JOIN public.profiles p ON p.company_id = c.company_id
    WHERE c.id = p_colaborador_id 
    AND p.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Colaborador não encontrado ou não pertence à sua empresa';
  END IF;

  -- Inserir documento
  INSERT INTO public.colaboradores_documentos (
    colaborador_id,
    document_type,
    file_name,
    file_url,
    file_size,
    expiry_date
  ) VALUES (
    p_colaborador_id,
    p_document_type,
    p_file_name,
    p_file_url,
    p_file_size,
    p_expiry_date
  ) RETURNING * INTO v_documento;

  RETURN v_documento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.create_documento_pessoal IS 'Cria documento pessoal contornando RLS';

-- =====================================================
-- FIM DO SCRIPT RPC FUNCTIONS
-- =====================================================
