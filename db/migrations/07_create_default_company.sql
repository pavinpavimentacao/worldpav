-- =====================================================
-- WORLDPAV - CRIAR EMPRESAS SIMPLIFICADAS
-- =====================================================
-- Cria apenas as duas empresas necessárias: Worldpav e Pavin
-- Apenas com company_id e name
-- =====================================================

-- Limpar empresas existentes (se houver)
DELETE FROM public.companies WHERE id IN (
  '39cf8b61-6737-4aa5-af3f-51fba9f12345',
  '48cf8b61-6737-4aa5-af3f-51fba9f12346'
);

-- Inserir Worldpav
INSERT INTO public.companies (
  id,
  name,
  created_at,
  updated_at
) VALUES (
  '39cf8b61-6737-4aa5-af3f-51fba9f12345',
  'Worldpav',
  NOW(),
  NOW()
);

-- Inserir Pavin
INSERT INTO public.companies (
  id,
  name,
  created_at,
  updated_at
) VALUES (
  '48cf8b61-6737-4aa5-af3f-51fba9f12346',
  'Pavin',
  NOW(),
  NOW()
);

-- Verificar se foram criadas
SELECT id, name, created_at 
FROM public.companies 
ORDER BY name;

-- Comentário de aviso
COMMENT ON TABLE public.companies IS 'EMPRESAS SIMPLIFICADAS CRIADAS PARA DESENVOLVIMENTO';
