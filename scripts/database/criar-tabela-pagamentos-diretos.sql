-- =====================================================
-- CRIAR TABELA: obras_pagamentos_diretos
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para criar a tabela
-- necessária para o sistema de Pagamentos Diretos
-- =====================================================

-- Tabela para pagamentos diretos (sem nota fiscal)
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_obra_id 
  ON public.obras_pagamentos_diretos(obra_id);

CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_payment_date 
  ON public.obras_pagamentos_diretos(payment_date);

CREATE INDEX IF NOT EXISTS idx_obras_pagamentos_diretos_payment_method 
  ON public.obras_pagamentos_diretos(payment_method);

-- Comentários para documentação
COMMENT ON TABLE public.obras_pagamentos_diretos IS 'Pagamentos diretos vinculados a obras';
COMMENT ON COLUMN public.obras_pagamentos_diretos.description IS 'Descrição do pagamento';
COMMENT ON COLUMN public.obras_pagamentos_diretos.amount IS 'Valor do pagamento';
COMMENT ON COLUMN public.obras_pagamentos_diretos.recipient IS 'Beneficiário do pagamento';

-- =====================================================
-- POLÍTICAS RLS (Row Level Security) - OPCIONAL
-- =====================================================

-- Descomente as linhas abaixo se quiser habilitar RLS
-- ALTER TABLE public.obras_pagamentos_diretos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir todas as operações em pagamentos diretos" 
-- ON public.obras_pagamentos_diretos
-- FOR ALL USING (true);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'obras_pagamentos_diretos'
ORDER BY ordinal_position;
