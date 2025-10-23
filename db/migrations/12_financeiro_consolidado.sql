-- =====================================================
-- WORLDPAV - FINANCEIRO CONSOLIDADO
-- =====================================================
-- Sistema financeiro geral da empresa (consolidado)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA FINANCIAL_TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.financial_transactions (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Tipo de transação
  type tipo_transacao NOT NULL, -- 'receita' ou 'despesa'
  
  -- Classificação
  category TEXT,
  description TEXT NOT NULL,
  
  -- Valor
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Data
  date DATE NOT NULL,
  
  -- Pagamento
  payment_method TEXT,
  
  -- Obra relacionada (opcional)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Status
  status status_transacao NOT NULL DEFAULT 'pendente',
  
  -- Documento
  document_url TEXT, -- URL no Storage
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT financial_transactions_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.financial_transactions IS 'Transações financeiras consolidadas da empresa';
COMMENT ON COLUMN public.financial_transactions.type IS 'Tipo: receita ou despesa';
COMMENT ON COLUMN public.financial_transactions.obra_id IS 'Obra relacionada (opcional)';
COMMENT ON COLUMN public.financial_transactions.status IS 'Status: pendente, confirmado, cancelado';
COMMENT ON COLUMN public.financial_transactions.document_url IS 'URL do documento no Supabase Storage';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_id 
  ON public.financial_transactions(company_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_type 
  ON public.financial_transactions(type);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_category 
  ON public.financial_transactions(category) WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date 
  ON public.financial_transactions(date DESC);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_obra_id 
  ON public.financial_transactions(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_financial_transactions_status 
  ON public.financial_transactions(status);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_deleted_at 
  ON public.financial_transactions(deleted_at);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_company_date 
  ON public.financial_transactions(company_id, date DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company financial_transactions"
  ON public.financial_transactions FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company financial_transactions"
  ON public.financial_transactions FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company financial_transactions"
  ON public.financial_transactions FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete financial_transactions"
  ON public.financial_transactions FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT FINANCEIRO CONSOLIDADO
-- =====================================================
-- Próximo script: 13_notes_reports.sql
-- =====================================================


