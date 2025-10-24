-- ============================================
-- Script para corrigir estrutura da tabela obras_notas_fiscais
-- ============================================

-- 1. Verificar se as colunas novas existem
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'numero_nota') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN numero_nota TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'valor_nota') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN valor_nota DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'vencimento') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN vencimento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'desconto_inss') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN desconto_inss DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'desconto_iss') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN desconto_iss DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'outro_desconto') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN outro_desconto DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'valor_liquido') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN valor_liquido DECIMAL(12,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'arquivo_nota_url') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN arquivo_nota_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'observacoes') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN observacoes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'data_pagamento') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN data_pagamento DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_notas_fiscais' AND column_name = 'updated_at') THEN
        ALTER TABLE public.obras_notas_fiscais ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. Migrar dados das colunas antigas para as novas (se existirem)
UPDATE public.obras_notas_fiscais 
SET 
    numero_nota = COALESCE(numero_nota, invoice_number),
    valor_nota = COALESCE(valor_nota, amount),
    valor_liquido = COALESCE(valor_liquido, net_amount),
    arquivo_nota_url = COALESCE(arquivo_nota_url, file_url)
WHERE 
    (numero_nota IS NULL AND invoice_number IS NOT NULL) OR
    (valor_nota IS NULL AND amount IS NOT NULL) OR
    (valor_liquido IS NULL AND net_amount IS NOT NULL) OR
    (arquivo_nota_url IS NULL AND file_url IS NOT NULL);

-- 3. Tornar as colunas obrigatórias (se necessário)
ALTER TABLE public.obras_notas_fiscais 
ALTER COLUMN numero_nota SET NOT NULL,
ALTER COLUMN valor_nota SET NOT NULL,
ALTER COLUMN vencimento SET NOT NULL,
ALTER COLUMN valor_liquido SET NOT NULL;

-- 4. Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_numero_nota 
    ON public.obras_notas_fiscais(numero_nota);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_valor_nota 
    ON public.obras_notas_fiscais(valor_nota);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_vencimento 
    ON public.obras_notas_fiscais(vencimento);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_valor_liquido 
    ON public.obras_notas_fiscais(valor_liquido);

-- 5. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'obras_notas_fiscais' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
