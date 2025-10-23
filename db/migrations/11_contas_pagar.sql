-- =====================================================
-- WORLDPAV - CONTAS A PAGAR
-- =====================================================
-- Sistema de contas a pagar com notas fiscais
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA CONTAS_PAGAR
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contas_pagar (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Obra relacionada (opcional)
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Descrição
  description TEXT NOT NULL,
  category TEXT,
  supplier TEXT, -- Fornecedor
  
  -- Valores
  amount DECIMAL(12, 2) NOT NULL,
  
  -- Datas
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- Status
  status status_conta_pagar NOT NULL DEFAULT 'pendente',
  
  -- Pagamento
  payment_method TEXT,
  invoice_number TEXT,
  invoice_url TEXT, -- URL do PDF no Storage
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT contas_pagar_amount_positive CHECK (amount > 0)
);

COMMENT ON TABLE public.contas_pagar IS 'Contas a pagar com notas fiscais';
COMMENT ON COLUMN public.contas_pagar.obra_id IS 'Obra relacionada (opcional)';
COMMENT ON COLUMN public.contas_pagar.supplier IS 'Nome do fornecedor/credor';
COMMENT ON COLUMN public.contas_pagar.due_date IS 'Data de vencimento';
COMMENT ON COLUMN public.contas_pagar.payment_date IS 'Data do pagamento realizado';
COMMENT ON COLUMN public.contas_pagar.status IS 'Status: pendente, pago, atrasado, cancelado';
COMMENT ON COLUMN public.contas_pagar.invoice_url IS 'URL da nota fiscal no Supabase Storage';

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contas_pagar_company_id 
  ON public.contas_pagar(company_id);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_obra_id 
  ON public.contas_pagar(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contas_pagar_status 
  ON public.contas_pagar(status);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_due_date 
  ON public.contas_pagar(due_date);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_deleted_at 
  ON public.contas_pagar(deleted_at);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_company_due_date 
  ON public.contas_pagar(company_id, due_date);

-- =====================================================
-- 3. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. TRIGGER PARA ATUALIZAR STATUS AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_conta_pagar_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Se foi pago
  IF NEW.payment_date IS NOT NULL THEN
    NEW.status = 'pago';
  -- Se está atrasado e não foi pago
  ELSIF NEW.due_date < CURRENT_DATE AND NEW.payment_date IS NULL THEN
    NEW.status = 'atrasado';
  -- Se está pendente
  ELSIF NEW.due_date >= CURRENT_DATE AND NEW.payment_date IS NULL THEN
    NEW.status = 'pendente';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conta_pagar_status
  BEFORE INSERT OR UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conta_pagar_status();

COMMENT ON FUNCTION public.update_conta_pagar_status() IS 'Atualiza status baseado em datas';

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company contas_pagar"
  ON public.contas_pagar FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company contas_pagar"
  ON public.contas_pagar FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company contas_pagar"
  ON public.contas_pagar FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete contas_pagar"
  ON public.contas_pagar FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- FIM DO SCRIPT CONTAS A PAGAR
-- =====================================================
-- Próximo script: 12_financeiro_consolidado.sql
-- =====================================================


