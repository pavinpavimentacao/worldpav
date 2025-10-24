-- ============================================
-- Verificar estrutura da tabela obras_medicoes
-- ============================================

-- 1. Verificar se a tabela existe
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'obras_medicoes';

-- 2. Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'obras_medicoes' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_medicoes FROM obras_medicoes;

