-- ============================================
-- Correção: Campos da tabela obras_notas_fiscais
-- ============================================
-- Esta migração corrige o mapeamento de campos
-- ============================================

-- 1. Verificar se a coluna invoice_number existe
DO $$ 
BEGIN
    -- Se invoice_number não existe, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'invoice_number'
    ) THEN
        ALTER TABLE public.obras_notas_fiscais 
        ADD COLUMN invoice_number TEXT;
    END IF;
END $$;

-- 2. Se numero_nota existe e invoice_number não, copiar os dados
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'numero_nota'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'invoice_number'
    ) THEN
        -- Copiar dados de numero_nota para invoice_number
        UPDATE public.obras_notas_fiscais 
        SET invoice_number = numero_nota 
        WHERE invoice_number IS NULL;
    END IF;
END $$;

-- 3. Se issue_date não existe, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'issue_date'
    ) THEN
        ALTER TABLE public.obras_notas_fiscais 
        ADD COLUMN issue_date DATE;
    END IF;
END $$;

-- 4. Se vencimento existe e issue_date não, copiar os dados
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'vencimento'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'issue_date'
    ) THEN
        -- Copiar dados de vencimento para issue_date
        UPDATE public.obras_notas_fiscais 
        SET issue_date = vencimento 
        WHERE issue_date IS NULL;
    END IF;
END $$;

-- 5. Se amount não existe, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'amount'
    ) THEN
        ALTER TABLE public.obras_notas_fiscais 
        ADD COLUMN amount DECIMAL(12,2);
    END IF;
END $$;

-- 6. Se valor_nota existe e amount não, copiar os dados
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'valor_nota'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'obras_notas_fiscais' 
        AND column_name = 'amount'
    ) THEN
        -- Copiar dados de valor_nota para amount
        UPDATE public.obras_notas_fiscais 
        SET amount = valor_nota 
        WHERE amount IS NULL;
    END IF;
END $$;

-- 7. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'obras_notas_fiscais' 
ORDER BY ordinal_position;

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- Os campos foram mapeados corretamente.
-- Agora a criação de notas fiscais deve funcionar!
-- ============================================

