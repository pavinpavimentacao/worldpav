-- ============================================
-- VERIFICAR RELATÓRIO DIÁRIO E EQUIPE
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Buscar o relatório
SELECT 
  '=== RELATÓRIO ===' as info,
  id,
  equipe_id,
  equipe_is_terceira,
  created_at
FROM public.relatorios_diarios
WHERE id = 'ed5ee729-9c3d-4242-b149-9846aaef85ac';

-- 2. Buscar o colaborador vinculado
SELECT 
  '=== COLABORADOR ===' as info,
  c.id,
  c.name,
  c.equipe_id,
  c.tipo_equipe
FROM public.colaboradores c
WHERE c.id = (
  SELECT equipe_id 
  FROM public.relatorios_diarios 
  WHERE id = 'ed5ee729-9c3d-4242-b149-9846aaef85ac'
  LIMIT 1
);

-- 3. Buscar a equipe do colaborador
SELECT 
  '=== EQUIPE DO COLABORADOR ===' as info,
  e.id,
  e.name,
  e.prefixo,
  e.descricao
FROM public.equipes e
WHERE e.id::text = (
  SELECT c.equipe_id::text 
  FROM public.colaboradores c
  WHERE c.id = (
    SELECT equipe_id 
    FROM public.relatorios_diarios 
    WHERE id = 'ed5ee729-9c3d-4242-b149-9846aaef85ac'
    LIMIT 1
  )
  LIMIT 1
);
