-- ============================================
-- Correção: Tabelas de Notas Fiscais e Ruas
-- ============================================
-- Este script corrige as colunas faltantes nas tabelas
-- ============================================

-- 1. Adicionar colunas faltantes na tabela obras_notas_fiscais
ALTER TABLE public.obras_notas_fiscais
ADD COLUMN IF NOT EXISTS valor_nota DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS vencimento DATE,
ADD COLUMN IF NOT EXISTS desconto_inss DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS desconto_iss DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_liquido DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS numero_nota TEXT;

-- 2. Adicionar colunas faltantes na tabela obras_ruas
ALTER TABLE public.obras_ruas
ADD COLUMN IF NOT EXISTS metragem_planejada DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS metragem_executada DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS toneladas_utilizadas DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS espessura_calculada DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valor_total DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS data_finalizacao DATE,
ADD COLUMN IF NOT EXISTS relatorio_diario_id UUID;

-- 3. Atualizar valores existentes se necessário
UPDATE public.obras_notas_fiscais 
SET valor_nota = amount,
    valor_liquido = net_amount,
    numero_nota = invoice_number
WHERE valor_nota IS NULL;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_valor_nota 
  ON public.obras_notas_fiscais(valor_nota);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_vencimento 
  ON public.obras_notas_fiscais(vencimento);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_valor_liquido 
  ON public.obras_notas_fiscais(valor_liquido);

CREATE INDEX IF NOT EXISTS idx_obras_ruas_metragem_planejada 
  ON public.obras_ruas(metragem_planejada);

CREATE INDEX IF NOT EXISTS idx_obras_ruas_metragem_executada 
  ON public.obras_ruas(metragem_executada);

CREATE INDEX IF NOT EXISTS idx_obras_ruas_data_finalizacao 
  ON public.obras_ruas(data_finalizacao);

-- 5. Adicionar constraints se necessário (sem IF NOT EXISTS)
DO $$ 
BEGIN
  -- Constraint para valor_nota
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'obras_notas_fiscais_valor_nota_positive'
  ) THEN
    ALTER TABLE public.obras_notas_fiscais
    ADD CONSTRAINT obras_notas_fiscais_valor_nota_positive 
    CHECK (valor_nota IS NULL OR valor_nota >= 0);
  END IF;

  -- Constraint para valor_liquido
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'obras_notas_fiscais_valor_liquido_positive'
  ) THEN
    ALTER TABLE public.obras_notas_fiscais
    ADD CONSTRAINT obras_notas_fiscais_valor_liquido_positive 
    CHECK (valor_liquido IS NULL OR valor_liquido >= 0);
  END IF;

  -- Constraint para metragem
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'obras_ruas_metragem_positive'
  ) THEN
    ALTER TABLE public.obras_ruas
    ADD CONSTRAINT obras_ruas_metragem_positive 
    CHECK (
      (metragem_planejada IS NULL OR metragem_planejada >= 0) AND
      (metragem_executada IS NULL OR metragem_executada >= 0) AND
      (toneladas_utilizadas IS NULL OR toneladas_utilizadas >= 0) AND
      (espessura_calculada IS NULL OR espessura_calculada >= 0) AND
      (preco_por_m2 IS NULL OR preco_por_m2 >= 0) AND
      (valor_total IS NULL OR valor_total >= 0)
    );
  END IF;
END $$;

-- 6. Comentários nas colunas
COMMENT ON COLUMN public.obras_notas_fiscais.valor_nota IS 'Valor bruto da nota fiscal';
COMMENT ON COLUMN public.obras_notas_fiscais.vencimento IS 'Data de vencimento da nota fiscal';
COMMENT ON COLUMN public.obras_notas_fiscais.desconto_inss IS 'Desconto de INSS aplicado';
COMMENT ON COLUMN public.obras_notas_fiscais.desconto_iss IS 'Desconto de ISS aplicado';
COMMENT ON COLUMN public.obras_notas_fiscais.valor_liquido IS 'Valor líquido após descontos';
COMMENT ON COLUMN public.obras_notas_fiscais.numero_nota IS 'Número da nota fiscal';

COMMENT ON COLUMN public.obras_ruas.metragem_planejada IS 'Metragem planejada para a rua';
COMMENT ON COLUMN public.obras_ruas.metragem_executada IS 'Metragem realmente executada';
COMMENT ON COLUMN public.obras_ruas.toneladas_utilizadas IS 'Toneladas de material utilizadas';
COMMENT ON COLUMN public.obras_ruas.espessura_calculada IS 'Espessura calculada automaticamente';
COMMENT ON COLUMN public.obras_ruas.preco_por_m2 IS 'Preço por metro quadrado';
COMMENT ON COLUMN public.obras_ruas.valor_total IS 'Valor total da rua';
COMMENT ON COLUMN public.obras_ruas.data_finalizacao IS 'Data de finalização da rua';
COMMENT ON COLUMN public.obras_ruas.relatorio_diario_id IS 'ID do relatório diário relacionado';

-- 7. Verificação final
SELECT 
  'obras_notas_fiscais' as tabela,
  COUNT(*) as total_registros,
  COUNT(valor_nota) as com_valor_nota,
  COUNT(vencimento) as com_vencimento
FROM public.obras_notas_fiscais

UNION ALL

SELECT 
  'obras_ruas' as tabela,
  COUNT(*) as total_registros,
  COUNT(metragem_planejada) as com_metragem_planejada,
  COUNT(metragem_executada) as com_metragem_executada
FROM public.obras_ruas;

-- ============================================
-- ✅ Sucesso!
-- ============================================
-- As colunas foram adicionadas com sucesso.
-- Agora a aba Notas e Medições deve funcionar!
-- ============================================
