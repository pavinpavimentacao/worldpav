-- ============================================
-- Corrigir estrutura da tabela obras_medicoes
-- ============================================

-- Este script corrige a estrutura da tabela obras_medicoes
-- para alinhar com o que a API espera

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'obras_medicoes') THEN
        -- Criar tabela se não existir
        CREATE TABLE public.obras_medicoes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
            nota_fiscal_id UUID REFERENCES public.obras_notas_fiscais(id) ON DELETE SET NULL,
            descricao TEXT NOT NULL,
            arquivo_medicao_url TEXT NOT NULL,
            data_medicao DATE NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_medicoes_obra_id ON public.obras_medicoes(obra_id);
        CREATE INDEX idx_medicoes_nota_fiscal_id ON public.obras_medicoes(nota_fiscal_id);
        CREATE INDEX idx_medicoes_data ON public.obras_medicoes(data_medicao);
        
        RAISE NOTICE 'Tabela obras_medicoes criada com sucesso.';
    ELSE
        RAISE NOTICE 'Tabela obras_medicoes já existe.';
    END IF;
END
$$;

-- 2. Verificar se a coluna data_medicao existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_medicoes' AND column_name = 'data_medicao') THEN
        -- Adicionar coluna data_medicao se não existir
        ALTER TABLE public.obras_medicoes ADD COLUMN data_medicao DATE;
        RAISE NOTICE 'Coluna data_medicao adicionada.';
    ELSE
        RAISE NOTICE 'Coluna data_medicao já existe.';
    END IF;
END
$$;

-- 3. Verificar se a coluna descricao existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_medicoes' AND column_name = 'descricao') THEN
        -- Adicionar coluna descricao se não existir
        ALTER TABLE public.obras_medicoes ADD COLUMN descricao TEXT;
        RAISE NOTICE 'Coluna descricao adicionada.';
    ELSE
        RAISE NOTICE 'Coluna descricao já existe.';
    END IF;
END
$$;

-- 4. Verificar se a coluna arquivo_medicao_url existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_medicoes' AND column_name = 'arquivo_medicao_url') THEN
        -- Adicionar coluna arquivo_medicao_url se não existir
        ALTER TABLE public.obras_medicoes ADD COLUMN arquivo_medicao_url TEXT;
        RAISE NOTICE 'Coluna arquivo_medicao_url adicionada.';
    ELSE
        RAISE NOTICE 'Coluna arquivo_medicao_url já existe.';
    END IF;
END
$$;

-- 5. Verificar se a coluna nota_fiscal_id existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'obras_medicoes' AND column_name = 'nota_fiscal_id') THEN
        -- Adicionar coluna nota_fiscal_id se não existir
        ALTER TABLE public.obras_medicoes ADD COLUMN nota_fiscal_id UUID REFERENCES public.obras_notas_fiscais(id) ON DELETE SET NULL;
        RAISE NOTICE 'Coluna nota_fiscal_id adicionada.';
    ELSE
        RAISE NOTICE 'Coluna nota_fiscal_id já existe.';
    END IF;
END
$$;

-- 6. Verificar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'obras_medicoes' 
ORDER BY ordinal_position;

-- 7. Verificar se há dados na tabela
SELECT COUNT(*) as total_medicoes FROM public.obras_medicoes;

