-- =====================================================
-- WORLDPAV - FINANCEIRO DE OBRAS
-- =====================================================
-- Tabelas para gestão financeira específica de obras:
-- - obras_financeiro (movimentações gerais)
-- - obras_medicoes (medições e faturamento)
-- - obras_notas_fiscais (NFs de serviços)
-- - obras_pagamentos_diretos (pagamentos diretos)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA OBRAS_FINANCEIRO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_financeiro (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Tipo e dados da transação
  type tipo_transacao NOT NULL, -- 'receita' ou 'despesa'
  category TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Data e pagamento
  date DATE NOT NULL,
  payment_method TEXT,
  document_number TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_financeiro_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.obras_financeiro IS 'Movimentações financeiras de obras';
COMMENT ON COLUMN public.obras_financeiro.type IS 'Tipo: receita ou despesa';
COMMENT ON COLUMN public.obras_financeiro.amount IS 'Valor da movimentação';
COMMENT ON COLUMN public.obras_financeiro.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 2. TABELA OBRAS_MEDICOES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_medicoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados da medição
  measurement_number INTEGER NOT NULL,
  measurement_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  description TEXT,
  
  -- Valores
  measured_value DECIMAL(12, 2) NOT NULL,
  accumulated_value DECIMAL(12, 2),
  percentage DECIMAL(5, 2), -- Percentual de execução
  
  -- Status
  status status_medicao NOT NULL DEFAULT 'pendente',
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_medicoes_values_positive CHECK (
    measured_value >= 0 AND
    (accumulated_value IS NULL OR accumulated_value >= 0) AND
    (percentage IS NULL OR (percentage >= 0 AND percentage <= 100))
  ),
  CONSTRAINT obras_medicoes_number_positive CHECK (measurement_number > 0),
  UNIQUE(obra_id, measurement_number)
);

COMMENT ON TABLE public.obras_medicoes IS 'Medições de obras para faturamento';
COMMENT ON COLUMN public.obras_medicoes.measurement_number IS 'Número da medição';
COMMENT ON COLUMN public.obras_medicoes.measured_value IS 'Valor medido nesta medição';
COMMENT ON COLUMN public.obras_medicoes.accumulated_value IS 'Valor acumulado até esta medição';
COMMENT ON COLUMN public.obras_medicoes.percentage IS 'Percentual de execução (0-100)';
COMMENT ON COLUMN public.obras_medicoes.status IS 'Status: pendente, aprovada, faturada';

-- =====================================================
-- 3. TABELA OBRAS_NOTAS_FISCAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_notas_fiscais (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra e medição relacionadas
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  medicao_id UUID REFERENCES public.obras_medicoes(id) ON DELETE SET NULL,
  
  -- Dados da nota fiscal
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  
  -- Valores
  amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,
  
  -- Descrição
  description TEXT,
  
  -- Arquivo da NF (PDF no Storage)
  file_url TEXT,
  
  -- Status
  status status_nota_fiscal NOT NULL DEFAULT 'emitida',
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_notas_fiscais_values_positive CHECK (
    amount >= 0 AND
    tax_amount >= 0 AND
    net_amount >= 0
  )
);

COMMENT ON TABLE public.obras_notas_fiscais IS 'Notas fiscais emitidas para obras';
COMMENT ON COLUMN public.obras_notas_fiscais.invoice_number IS 'Número da nota fiscal';
COMMENT ON COLUMN public.obras_notas_fiscais.amount IS 'Valor bruto';
COMMENT ON COLUMN public.obras_notas_fiscais.tax_amount IS 'Valor dos impostos';
COMMENT ON COLUMN public.obras_notas_fiscais.net_amount IS 'Valor líquido';
COMMENT ON COLUMN public.obras_notas_fiscais.file_url IS 'URL do PDF da NF no Supabase Storage';
COMMENT ON COLUMN public.obras_notas_fiscais.status IS 'Status: emitida, enviada, paga';

-- =====================================================
-- 4. TABELA OBRAS_PAGAMENTOS_DIRETOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_pagamentos_diretos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados do pagamento
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  
  -- Classificação
  category TEXT,
  recipient TEXT,
  document_number TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_pagamentos_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.obras_pagamentos_diretos IS 'Pagamentos diretos vinculados a obras';
COMMENT ON COLUMN public.obras_pagamentos_diretos.description IS 'Descrição do pagamento';
COMMENT ON COLUMN public.obras_pagamentos_diretos.amount IS 'Valor do pagamento';
COMMENT ON COLUMN public.obras_pagamentos_diretos.recipient IS 'Beneficiário do pagamento';

-- =====================================================
-- 5. ÍNDICES - OBRAS_FINANCEIRO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_obras_financeiro_obra_id 
  ON public.obras_financeiro(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_financeiro_type 
  ON public.obras_financeiro(type);

CREATE INDEX IF NOT EXISTS idx_obras_financeiro_date 
  ON public.obras_financeiro(date DESC);

CREATE INDEX IF NOT EXISTS idx_obras_financeiro_deleted_at 
  ON public.obras_financeiro(deleted_at);

-- =====================================================
-- 6. ÍNDICES - OBRAS_MEDICOES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_obras_medicoes_obra_id 
  ON public.obras_medicoes(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_medicoes_status 
  ON public.obras_medicoes(status);

CREATE INDEX IF NOT EXISTS idx_obras_medicoes_date 
  ON public.obras_medicoes(measurement_date DESC);

CREATE INDEX IF NOT EXISTS idx_obras_medicoes_deleted_at 
  ON public.obras_medicoes(deleted_at);

-- =====================================================
-- 7. ÍNDICES - OBRAS_NOTAS_FISCAIS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_obra_id 
  ON public.obras_notas_fiscais(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_medicao_id 
  ON public.obras_notas_fiscais(medicao_id);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_status 
  ON public.obras_notas_fiscais(status);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_invoice_number 
  ON public.obras_notas_fiscais(invoice_number);

CREATE INDEX IF NOT EXISTS idx_obras_notas_fiscais_deleted_at 
  ON public.obras_notas_fiscais(deleted_at);

-- =====================================================
-- 8. ÍNDICES - OBRAS_PAGAMENTOS_DIRETOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_obra_id 
  ON public.obras_pagamentos_diretos(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_date 
  ON public.obras_pagamentos_diretos(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_deleted_at 
  ON public.obras_pagamentos_diretos(deleted_at);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- OBRAS_FINANCEIRO
ALTER TABLE public.obras_financeiro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company obras_financeiro"
  ON public.obras_financeiro FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company obras_financeiro"
  ON public.obras_financeiro FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company obras_financeiro"
  ON public.obras_financeiro FOR UPDATE
  USING (
    deleted_at IS NULL AND
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- OBRAS_MEDICOES
ALTER TABLE public.obras_medicoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company obras_medicoes"
  ON public.obras_medicoes FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company obras_medicoes"
  ON public.obras_medicoes FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company obras_medicoes"
  ON public.obras_medicoes FOR UPDATE
  USING (
    deleted_at IS NULL AND
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- OBRAS_NOTAS_FISCAIS
ALTER TABLE public.obras_notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company obras_notas_fiscais"
  ON public.obras_notas_fiscais FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company obras_notas_fiscais"
  ON public.obras_notas_fiscais FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company obras_notas_fiscais"
  ON public.obras_notas_fiscais FOR UPDATE
  USING (
    deleted_at IS NULL AND
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- OBRAS_PAGAMENTOS_DIRETOS
ALTER TABLE public.obras_pagamentos_diretos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company obras_pagamentos_diretos"
  ON public.obras_pagamentos_diretos FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company obras_pagamentos_diretos"
  ON public.obras_pagamentos_diretos FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company obras_pagamentos_diretos"
  ON public.obras_pagamentos_diretos FOR UPDATE
  USING (
    deleted_at IS NULL AND
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- FIM DO SCRIPT OBRAS_FINANCEIRO
-- =====================================================
-- Próximo script: 04_colaboradores.sql
-- =====================================================


