-- ============================================
-- DIAGNOSTICAR E CORRIGIR VINCULAÇÃO DE EQUIPES
-- ============================================
-- Execute este script no Supabase SQL Editor

-- 1. Verificar TODAS as equipes existentes
SELECT 
  '=== EQUIPES EXISTENTES ===' as info;

SELECT 
  id,
  name as nome_equipe,
  prefixo,
  descricao,
  ativo,
  created_at,
  (SELECT COUNT(*) FROM colaboradores WHERE equipe_id::text = equipes.id::text AND deleted_at IS NULL) as colaboradores_vinculados
FROM public.equipes 
WHERE deleted_at IS NULL
ORDER BY created_at;

-- 2. Verificar colaboradores e suas vinculações atuais
SELECT 
  '=== COLABORADORES E SUAS EQUIPES ===' as info;

SELECT 
  c.id,
  c.name as colaborador_nome,
  c.tipo_equipe as tipo_equipe_colaborador,
  c.equipe_id as equipe_id_vinculado,
  e.name as equipe_nome_vinculada,
  e.prefixo as prefixo_equipe
FROM public.colaboradores c
LEFT JOIN public.equipes e ON e.id::text = c.equipe_id::text
WHERE c.deleted_at IS NULL
ORDER BY c.name;

-- 3. Mostrar estatísticas
SELECT 
  '=== ESTATÍSTICAS ===' as info;

SELECT 
  e.name as equipe_nome,
  COUNT(c.id) as total_colaboradores
FROM public.equipes e
LEFT JOIN public.colaboradores c ON c.equipe_id::text = e.id::text AND c.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.name
ORDER BY e.name;
