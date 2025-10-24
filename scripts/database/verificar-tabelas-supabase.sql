-- =====================================================
-- VERIFICAÇÃO DE TABELAS DO BANCO DE DADOS
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para verificar
-- se todas as tabelas necessárias estão criadas
-- =====================================================

-- 1. Listar todas as tabelas do sistema
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'companies',
      'clientes',
      'obras',
      'obras_ruas',
      'obras_financeiro_faturamentos',
      'obras_financeiro_despesas',
      'obras_notas_fiscais',
      'obras_medicoes',
      'obras_pagamentos_diretos',
      'maquinarios',
      'maquinarios_licencas',
      'colaboradores',
      'colaboradores_documentos',
      'programacao_diaria',
      'relatorios_diarios',
      'expenses',
      'contas_pagar'
    ) THEN '✅ NECESSÁRIA'
    ELSE '⚠️  EXTRA'
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY 
  CASE WHEN table_name LIKE 'obras%' THEN 1 
       WHEN table_name LIKE 'colaboradores%' THEN 2
       WHEN table_name LIKE 'maquinarios%' THEN 3
       ELSE 4 END,
  table_name;

-- =====================================================
-- 2. Verificar tabelas específicas de OBRAS
-- =====================================================

SELECT 'TABELAS DE OBRAS' as verificacao;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras') 
    THEN '✅ obras'
    ELSE '❌ obras - FALTANDO!'
  END as status
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_ruas') 
    THEN '✅ obras_ruas'
    ELSE '❌ obras_ruas - FALTANDO!'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_financeiro_faturamentos') 
    THEN '✅ obras_financeiro_faturamentos'
    ELSE '❌ obras_financeiro_faturamentos - FALTANDO!'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_financeiro_despesas') 
    THEN '✅ obras_financeiro_despesas'
    ELSE '❌ obras_financeiro_despesas - FALTANDO!'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_notas_fiscais') 
    THEN '✅ obras_notas_fiscais'
    ELSE '❌ obras_notas_fiscais - FALTANDO!'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_medicoes') 
    THEN '✅ obras_medicoes'
    ELSE '❌ obras_medicoes - FALTANDO!'
  END
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_pagamentos_diretos') 
    THEN '✅ obras_pagamentos_diretos'
    ELSE '❌ obras_pagamentos_diretos - FALTANDO!'
  END;

-- =====================================================
-- 3. Verificar campo preco_por_m2 na tabela obras
-- =====================================================

SELECT 'VERIFICAR CAMPO preco_por_m2' as verificacao;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'preco_por_m2' THEN '✅ Campo existe'
    ELSE '⚠️  Outro campo'
  END as status
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name = 'preco_por_m2';

-- Se retornar vazio, significa que o campo NÃO existe!
-- Nesse caso, execute: db/migrations/fix_obras_preco_por_m2.sql

-- =====================================================
-- 4. Verificar BUCKETS do Storage
-- =====================================================

SELECT 'BUCKETS DE STORAGE' as verificacao;

-- Nota: Esta query só funciona se você tiver permissões de admin
-- Caso contrário, verifique no dashboard do Supabase

SELECT 
  id,
  name,
  CASE 
    WHEN name IN ('obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes')
    THEN '✅ NECESSÁRIO'
    ELSE '⚠️  EXTRA'
  END as status,
  public,
  created_at
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- 5. Contar registros em cada tabela
-- =====================================================

SELECT 'CONTAGEM DE REGISTROS' as verificacao;

SELECT 
  'companies' as tabela,
  COUNT(*) as total_registros
FROM companies
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'obras', COUNT(*) FROM obras WHERE deleted_at IS NULL
UNION ALL
SELECT 'obras_ruas', COUNT(*) FROM obras_ruas WHERE deleted_at IS NULL
UNION ALL
SELECT 'obras_notas_fiscais', COUNT(*) FROM obras_notas_fiscais
UNION ALL
SELECT 'obras_medicoes', COUNT(*) FROM obras_medicoes
UNION ALL
SELECT 'colaboradores', COUNT(*) FROM colaboradores WHERE deleted_at IS NULL
UNION ALL
SELECT 'maquinarios', COUNT(*) FROM maquinarios WHERE deleted_at IS NULL
ORDER BY tabela;

-- =====================================================
-- 6. Verificar RLS (Row Level Security)
-- =====================================================

SELECT 'POLÍTICAS RLS' as verificacao;

SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' THEN '👁️  SELECT'
    WHEN cmd = 'INSERT' THEN '➕ INSERT'
    WHEN cmd = 'UPDATE' THEN '✏️  UPDATE'
    WHEN cmd = 'DELETE' THEN '🗑️  DELETE'
    ELSE cmd
  END as operacao
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'obras%'
ORDER BY tablename, cmd;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
Se todas as tabelas existirem, você verá:

✅ obras
✅ obras_ruas
✅ obras_financeiro_faturamentos
✅ obras_financeiro_despesas
✅ obras_notas_fiscais
✅ obras_medicoes
✅ obras_pagamentos_diretos

Se alguma tabela estiver faltando, você verá:
❌ nome_da_tabela - FALTANDO!

AÇÃO: Execute as migrations em db/migrations/ na ordem correta
*/


