-- ============================================
-- VERIFICAR E CORRIGIR VINCULAÇÃO DE EQUIPES
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar equipes existentes
SELECT 
  'Equipes existentes' as status,
  id,
  name,
  prefixo,
  created_at
FROM public.equipes 
ORDER BY created_at;

-- 2. Verificar colaboradores e suas equipes
SELECT 
  'Colaboradores e suas equipes' as status,
  c.id,
  c.name as colaborador_nome,
  c.tipo_equipe,
  c.equipe_id,
  e.name as equipe_nome
FROM public.colaboradores c
LEFT JOIN public.equipes e ON e.id = c.equipe_id
WHERE c.deleted_at IS NULL
ORDER BY c.name;

-- 3. Verificar se há colaboradores sem equipe_id
SELECT 
  'Colaboradores sem equipe_id' as status,
  COUNT(*) as quantidade
FROM public.colaboradores 
WHERE equipe_id IS NULL 
  AND deleted_at IS NULL;

-- 4. Vincular colaboradores às equipes criadas manualmente
-- (Assumindo que você quer vincular todos os colaboradores às suas equipes criadas)

-- Vincular colaboradores à "Equipe do Tico"
UPDATE public.colaboradores 
SET equipe_id = (
  SELECT id FROM public.equipes 
  WHERE name = 'Equipe do Tico'
  LIMIT 1
)
WHERE equipe_id IS NULL 
  AND tipo_equipe = 'pavimentacao'
  AND deleted_at IS NULL;

-- Vincular colaboradores à "Equipe do Wellignton"  
UPDATE public.colaboradores 
SET equipe_id = (
  SELECT id FROM public.equipes 
  WHERE name = 'Equipe do Wellignton'
  LIMIT 1
)
WHERE equipe_id IS NULL 
  AND tipo_equipe = 'maquinas'
  AND deleted_at IS NULL;

-- 5. Verificar resultado final
SELECT 
  'Resultado final' as status,
  e.name as equipe_nome,
  e.prefixo,
  COUNT(c.id) as colaboradores_vinculados
FROM public.equipes e
LEFT JOIN public.colaboradores c ON c.equipe_id = e.id AND c.deleted_at IS NULL
GROUP BY e.id, e.name, e.prefixo
ORDER BY e.name;


