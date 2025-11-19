-- =====================================================
-- SCRIPT DE VERIFICAÇÃO: Estrutura das Tabelas de Recebimentos
-- =====================================================
-- Este script verifica a estrutura atual das tabelas
-- de notas fiscais e pagamentos diretos
-- =====================================================

-- =====================================================
-- 1. ESTRUTURA: obras_notas_fiscais
-- =====================================================

SELECT 
    'obras_notas_fiscais' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'obras_notas_fiscais'
ORDER BY ordinal_position;

-- =====================================================
-- 2. DADOS DE EXEMPLO: obras_notas_fiscais
-- =====================================================

SELECT * FROM public.obras_notas_fiscais LIMIT 3;

-- =====================================================
-- 3. STATUS DISTINTOS: obras_notas_fiscais
-- =====================================================

SELECT DISTINCT status, COUNT(*) as quantidade
FROM public.obras_notas_fiscais
GROUP BY status
ORDER BY quantidade DESC;

-- =====================================================
-- 4. ESTRUTURA: obras_pagamentos_diretos
-- =====================================================

SELECT 
    'obras_pagamentos_diretos' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'obras_pagamentos_diretos'
ORDER BY ordinal_position;

-- =====================================================
-- 5. DADOS DE EXEMPLO: obras_pagamentos_diretos
-- =====================================================

SELECT * FROM public.obras_pagamentos_diretos LIMIT 3;

-- =====================================================
-- 6. VERIFICAR ÍNDICES: obras_notas_fiscais
-- =====================================================

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'obras_notas_fiscais'
  AND schemaname = 'public';

-- =====================================================
-- 7. VERIFICAR ÍNDICES: obras_pagamentos_diretos
-- =====================================================

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'obras_pagamentos_diretos'
  AND schemaname = 'public';

-- =====================================================
-- 8. VERIFICAR CONSTRAINTS: obras_notas_fiscais
-- =====================================================

SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.obras_notas_fiscais'::regclass
ORDER BY contype, conname;

-- =====================================================
-- 9. VERIFICAR RLS (Row Level Security)
-- =====================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('obras_notas_fiscais', 'obras_pagamentos_diretos')
ORDER BY tablename, policyname;

-- =====================================================
-- 10. CONTAGEM DE REGISTROS
-- =====================================================

SELECT 
    'obras_notas_fiscais' as tabela,
    COUNT(*) as total_registros
FROM public.obras_notas_fiscais
UNION ALL
SELECT 
    'obras_pagamentos_diretos' as tabela,
    COUNT(*) as total_registros
FROM public.obras_pagamentos_diretos;

-- =====================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- =====================================================
-- Copie os resultados e cole em VERIFICACAO_ESTRUTURA_RECEBIMENTOS.md
-- =====================================================








