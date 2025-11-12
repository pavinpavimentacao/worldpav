-- Script para verificar quais equipes existem e por que uma pode não estar aparecendo

-- 1. Verificar todas as equipes (sem filtros)
SELECT 
  id,
  company_id,
  name,
  prefixo,
  descricao,
  ativo,
  deleted_at,
  created_at,
  updated_at
FROM public.equipes
WHERE company_id = '39cf8b61-6737-4aa5-af3f-51fba9f12345'
ORDER BY name;

-- 2. Verificar equipes ativas e não deletadas (como no código)
SELECT 
  id,
  name,
  prefixo,
  ativo,
  deleted_at
FROM public.equipes
WHERE company_id = '39cf8b61-6737-4aa5-af3f-51fba9f12345'
  AND deleted_at IS NULL
ORDER BY name;

-- 3. Verificar se há duplicatas ou problemas nos dados
SELECT 
  name,
  COUNT(*) as total,
  STRING_AGG(id::text, ', ') as ids,
  STRING_AGG(CASE WHEN deleted_at IS NULL THEN 'ativa' ELSE 'deletada' END, ', ') as status
FROM public.equipes
WHERE company_id = '39cf8b61-6737-4aa5-af3f-51fba9f12345'
GROUP BY name
HAVING COUNT(*) > 1;

-- 4. Verificar se há problemas com valores nulos ou vazios
SELECT 
  id,
  name,
  CASE 
    WHEN name IS NULL THEN 'name é NULL'
    WHEN TRIM(name) = '' THEN 'name é vazio'
    WHEN LENGTH(TRIM(name)) = 0 THEN 'name tem length 0'
    ELSE 'OK'
  END as problema_name
FROM public.equipes
WHERE company_id = '39cf8b61-6737-4aa5-af3f-51fba9f12345'
  AND deleted_at IS NULL
  AND (
    name IS NULL 
    OR TRIM(name) = '' 
    OR LENGTH(TRIM(name)) = 0
  );



