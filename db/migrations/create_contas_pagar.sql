-- ============================================
-- CRIAÇÃO DA TABELA: contas_pagar
-- ============================================
-- Gerenciamento de contas a pagar com notas fiscais
-- Autor: WorldPav System
-- Data: 2025-10-21
-- ============================================

CREATE TABLE IF NOT EXISTS public.contas_pagar (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações da Nota Fiscal
  numero_nota TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  
  -- Status da conta
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Paga', 'Atrasada', 'Cancelada')),
  
  -- Informações adicionais
  fornecedor TEXT,
  descricao TEXT,
  categoria TEXT,
  
  -- Informações de pagamento
  data_pagamento DATE,
  valor_pago DECIMAL(12, 2),
  forma_pagamento TEXT,
  observacoes TEXT,
  
  -- Anexo da nota fiscal
  anexo_url TEXT,
  anexo_nome TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status 
  ON public.contas_pagar(status);

-- Índice para busca por data de vencimento
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento 
  ON public.contas_pagar(data_vencimento DESC);

-- Índice para busca por fornecedor
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor 
  ON public.contas_pagar(fornecedor);

-- Índice para busca por categoria
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria 
  ON public.contas_pagar(categoria);

-- Índice composto para relatórios financeiros
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status_vencimento 
  ON public.contas_pagar(status, data_vencimento DESC);

-- ============================================
-- TRIGGER PARA ATUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_contas_pagar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contas_pagar_updated_at
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION update_contas_pagar_updated_at();

-- ============================================
-- TRIGGER PARA ATUALIZAR STATUS AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_status_conta_pagar()
RETURNS TRIGGER AS $$
BEGIN
  -- Se foi marcado como pago, atualiza o status
  IF NEW.data_pagamento IS NOT NULL AND NEW.valor_pago IS NOT NULL THEN
    NEW.status = 'Paga';
  -- Se está atrasado e não foi pago
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL THEN
    NEW.status = 'Atrasada';
  -- Se está dentro do prazo e não foi pago
  ELSIF NEW.data_vencimento >= CURRENT_DATE AND NEW.data_pagamento IS NULL THEN
    NEW.status = 'Pendente';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_conta_pagar
  BEFORE INSERT OR UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_conta_pagar();

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

-- Política de leitura: usuários autenticados podem ver todas as contas
CREATE POLICY "Usuários autenticados podem visualizar contas a pagar"
  ON public.contas_pagar
  FOR SELECT
  TO authenticated
  USING (true);

-- Política de inserção: usuários autenticados podem criar contas
CREATE POLICY "Usuários autenticados podem criar contas a pagar"
  ON public.contas_pagar
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política de atualização: usuários autenticados podem atualizar contas
CREATE POLICY "Usuários autenticados podem atualizar contas a pagar"
  ON public.contas_pagar
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política de exclusão: usuários autenticados podem deletar contas
CREATE POLICY "Usuários autenticados podem deletar contas a pagar"
  ON public.contas_pagar
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- COMENTÁRIOS NA TABELA E COLUNAS
-- ============================================

COMMENT ON TABLE public.contas_pagar IS 'Gerenciamento de contas a pagar com notas fiscais';
COMMENT ON COLUMN public.contas_pagar.id IS 'Identificador único da conta';
COMMENT ON COLUMN public.contas_pagar.numero_nota IS 'Número da nota fiscal';
COMMENT ON COLUMN public.contas_pagar.valor IS 'Valor total da nota fiscal';
COMMENT ON COLUMN public.contas_pagar.data_emissao IS 'Data de emissão da nota fiscal';
COMMENT ON COLUMN public.contas_pagar.data_vencimento IS 'Data de vencimento do pagamento';
COMMENT ON COLUMN public.contas_pagar.status IS 'Status da conta: Pendente, Paga, Atrasada, Cancelada';
COMMENT ON COLUMN public.contas_pagar.fornecedor IS 'Nome do fornecedor/credor';
COMMENT ON COLUMN public.contas_pagar.descricao IS 'Descrição do produto/serviço';
COMMENT ON COLUMN public.contas_pagar.categoria IS 'Categoria da despesa';
COMMENT ON COLUMN public.contas_pagar.data_pagamento IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN public.contas_pagar.valor_pago IS 'Valor efetivamente pago';
COMMENT ON COLUMN public.contas_pagar.forma_pagamento IS 'Forma de pagamento utilizada';
COMMENT ON COLUMN public.contas_pagar.anexo_url IS 'URL do anexo da nota fiscal no storage';
COMMENT ON COLUMN public.contas_pagar.anexo_nome IS 'Nome original do arquivo anexado';

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTADO)
-- ============================================

-- INSERT INTO public.contas_pagar (
--   numero_nota,
--   valor,
--   data_emissao,
--   data_vencimento,
--   fornecedor,
--   descricao,
--   categoria,
--   status
-- ) VALUES
-- ('NF-001234', 5500.00, '2025-10-15', '2025-11-15', 'Fornecedor ABC Ltda', 'Materiais de construção', 'Materiais', 'Pendente'),
-- ('NF-001235', 3200.00, '2025-10-10', '2025-10-25', 'Serviços XYZ', 'Manutenção de equipamentos', 'Serviços', 'Atrasada'),
-- ('NF-001236', 8900.00, '2025-09-20', '2025-10-05', 'Distribuidora DEF', 'Combustível', 'Combustível', 'Paga');

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================






