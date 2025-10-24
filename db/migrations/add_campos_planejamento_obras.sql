    -- =====================================================
    -- Migração: Adicionar Campos de Planejamento às Obras
    -- =====================================================
    -- Adiciona campos necessários para o planejamento completo
    -- de obras, incluindo volume, unidade de cobrança, previsões, etc.
    -- =====================================================

    -- Adicionar colunas de planejamento
    ALTER TABLE public.obras
    ADD COLUMN IF NOT EXISTS unidade_cobranca TEXT DEFAULT 'm2',
    ADD COLUMN IF NOT EXISTS volume_planejamento DECIMAL(15,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_ruas INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS previsao_dias INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tem_cnpj_separado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cnpj_obra TEXT,
    ADD COLUMN IF NOT EXISTS razao_social_obra TEXT,
    ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(15,2) DEFAULT 0;

    -- Adicionar constraint para unidade_cobranca
    ALTER TABLE public.obras
    DROP CONSTRAINT IF EXISTS obras_unidade_cobranca_valid;

    ALTER TABLE public.obras
    ADD CONSTRAINT obras_unidade_cobranca_valid 
    CHECK (unidade_cobranca IN ('m2', 'm3', 'diaria') OR unidade_cobranca IS NULL);

    -- Adicionar constraint para valores positivos
    ALTER TABLE public.obras
    DROP CONSTRAINT IF EXISTS obras_planejamento_positivos;

    ALTER TABLE public.obras
    ADD CONSTRAINT obras_planejamento_positivos 
    CHECK (
    (volume_planejamento IS NULL OR volume_planejamento >= 0) AND
    (total_ruas IS NULL OR total_ruas >= 0) AND
    (previsao_dias IS NULL OR previsao_dias >= 0) AND
    (preco_por_m2 IS NULL OR preco_por_m2 >= 0)
    );

    -- Comentários nas colunas
    COMMENT ON COLUMN public.obras.unidade_cobranca IS 'Unidade de cobrança da obra: m2, m3 ou diaria';
    COMMENT ON COLUMN public.obras.volume_planejamento IS 'Volume total planejado para a obra (m² ou m³)';
    COMMENT ON COLUMN public.obras.total_ruas IS 'Número total de ruas previstas';
    COMMENT ON COLUMN public.obras.previsao_dias IS 'Previsão de duração em dias';
    COMMENT ON COLUMN public.obras.tem_cnpj_separado IS 'Indica se a obra tem CNPJ separado';
    COMMENT ON COLUMN public.obras.cnpj_obra IS 'CNPJ específico da obra (se aplicável)';
    COMMENT ON COLUMN public.obras.razao_social_obra IS 'Razão social específica da obra (se aplicável)';
    COMMENT ON COLUMN public.obras.preco_por_m2 IS 'Preço por unidade de cobrança (m² ou m³)';

    -- Criar índice para busca por unidade de cobrança
    CREATE INDEX IF NOT EXISTS idx_obras_unidade_cobranca 
    ON public.obras(unidade_cobranca);

    -- Verificar se as colunas foram adicionadas
    SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
    FROM information_schema.columns 
    WHERE table_name = 'obras' 
    AND column_name IN (
    'unidade_cobranca',
    'volume_planejamento',
    'total_ruas',
    'previsao_dias',
    'tem_cnpj_separado',
    'cnpj_obra',
    'razao_social_obra',
    'preco_por_m2'
    )
    ORDER BY ordinal_position;

    -- =====================================================
    -- FIM DA MIGRAÇÃO
    -- =====================================================


