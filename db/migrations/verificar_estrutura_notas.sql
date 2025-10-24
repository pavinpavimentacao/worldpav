-- ============================================
-- Verificar estrutura da tabela obras_notas_fiscais
-- ============================================

-- 1. Verificar colunas existentes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'obras_notas_fiscais' 
ORDER BY ordinal_position;

-- 2. Verificar constraints NOT NULL
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'obras_notas_fiscais'
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;

-- 3. Verificar se invoice_number é NOT NULL
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'obras_notas_fiscais' 
    AND column_name = 'invoice_number';

-- 4. Verificar se numero_nota existe
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'obras_notas_fiscais' 
    AND column_name = 'numero_nota';

