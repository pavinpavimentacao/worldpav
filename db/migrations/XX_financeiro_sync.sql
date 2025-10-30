-- =====================================================
-- SINCRONIZAÇÃO FINANCEIRA - BACKFILL + TRIGGERS
-- =====================================================
-- Objetivo: Garantir dados reais em obras_financeiro, 
--           obras_financeiro_despesas e obras_financeiro_faturamentos
--           e manter sincronização futura automaticamente.
-- =====================================================

-- 1) BACKFILL: Inserir receitas (faturamentos pagos) em obras_financeiro
INSERT INTO public.obras_financeiro (
  id, obra_id, type, category, description, amount, date, payment_method, document_number, observations, created_at
)
SELECT 
  uuid_generate_v4(),
  f.obra_id,
  'receita'::tipo_transacao,
  'faturamento',
  COALESCE('Faturamento rua ' || r.name, 'Faturamento de obra'),
  f.valor_total,
  f.data_pagamento,
  NULL,
  f.nota_fiscal,
  f.observacoes,
  NOW()
FROM public.obras_financeiro_faturamentos f
LEFT JOIN public.obras_ruas r ON r.id = f.rua_id
WHERE f.status = 'pago'
  AND f.data_pagamento IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.obras_financeiro ofi
    WHERE ofi.type = 'receita'
      AND ofi.obra_id = f.obra_id
      AND ofi.date = f.data_pagamento
      AND ABS(ofi.amount - f.valor_total) < 0.01
  );

-- 2) BACKFILL: Inserir despesas (obras_financeiro_despesas) em obras_financeiro
INSERT INTO public.obras_financeiro (
  id, obra_id, type, category, description, amount, date, payment_method, document_number, observations, created_at
)
SELECT 
  uuid_generate_v4(),
  d.obra_id,
  'despesa'::tipo_transacao,
  d.categoria,
  d.descricao,
  d.valor,
  d.data_despesa,
  NULL,
  NULL,
  NULL,
  NOW()
FROM public.obras_financeiro_despesas d
WHERE NOT EXISTS (
  SELECT 1 FROM public.obras_financeiro ofi
  WHERE ofi.type = 'despesa'
    AND ofi.obra_id = d.obra_id
    AND ofi.date = d.data_despesa
    AND ABS(ofi.amount - d.valor) < 0.01
);

-- 3) TRIGGER: Quando faturamento for marcado como PAGO, refletir em obras_financeiro
CREATE OR REPLACE FUNCTION public.sync_faturamento_to_financeiro()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'pago' AND NEW.data_pagamento IS NOT NULL THEN
    INSERT INTO public.obras_financeiro (
      id, obra_id, type, category, description, amount, date, payment_method, document_number, observations, created_at
    )
    VALUES (
      uuid_generate_v4(),
      NEW.obra_id,
      'receita',
      'faturamento',
      COALESCE('Faturamento rua ' || (SELECT nome FROM public.obras_ruas WHERE id = NEW.rua_id), 'Faturamento de obra'),
      NEW.valor_total,
      NEW.data_pagamento,
      NULL,
      NEW.nota_fiscal,
      NEW.observacoes,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_faturamento_to_financeiro ON public.obras_financeiro_faturamentos;
CREATE TRIGGER trg_sync_faturamento_to_financeiro
AFTER INSERT OR UPDATE ON public.obras_financeiro_faturamentos
FOR EACH ROW EXECUTE FUNCTION public.sync_faturamento_to_financeiro();

-- 4) TRIGGER: Inserção/atualização de despesas em obras_financeiro
CREATE OR REPLACE FUNCTION public.sync_despesa_to_financeiro()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.obras_financeiro (
      id, obra_id, type, category, description, amount, date, created_at
    ) VALUES (
      uuid_generate_v4(), NEW.obra_id, 'despesa', NEW.categoria, NEW.descricao, NEW.valor, NEW.data_despesa, NOW()
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Atualizações simples: inserir novo movimento (evitar divergências históricas)
    INSERT INTO public.obras_financeiro (
      id, obra_id, type, category, description, amount, date, created_at
    ) VALUES (
      uuid_generate_v4(), NEW.obra_id, 'despesa', NEW.categoria, NEW.descricao, NEW.valor, NEW.data_despesa, NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_despesa_to_financeiro ON public.obras_financeiro_despesas;
CREATE TRIGGER trg_sync_despesa_to_financeiro
AFTER INSERT OR UPDATE ON public.obras_financeiro_despesas
FOR EACH ROW EXECUTE FUNCTION public.sync_despesa_to_financeiro();

-- 5) RELATÓRIO RÁPIDO
DO $$
BEGIN
  RAISE NOTICE 'Backfill concluído. Registros atuais em obras_financeiro: %',
    (SELECT COUNT(*) FROM public.obras_financeiro);
END $$;


