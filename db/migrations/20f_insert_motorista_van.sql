-- =====================================================
-- WORLDPAV - INSERIR FUNÇÃO "MOTORISTA DE VAN"
-- =====================================================
-- Insere a função "Motorista de Van" diretamente no banco
-- enquanto o problema de RLS não é resolvido
-- =====================================================

-- Inserir função "Motorista de Van" para a empresa Worldpav
-- Usando o ID da empresa: 39cf8b61-6737-4aa5-af3f-51fba9f12345
INSERT INTO public.funcoes (
  id,
  company_id,
  nome,
  descricao,
  tipo_equipe,
  ativo,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '39cf8b61-6737-4aa5-af3f-51fba9f12345'::UUID,
  'Motorista de Van',
  'Motorista responsável por dirigir veículos tipo van',
  NULL, -- Tipo de equipe não especificado (pode ser usado em qualquer equipe)
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Verificar se foi inserida
SELECT id, nome, company_id, ativo 
FROM public.funcoes 
WHERE nome = 'Motorista de Van' 
AND company_id = '39cf8b61-6737-4aa5-af3f-51fba9f12345'::UUID;

