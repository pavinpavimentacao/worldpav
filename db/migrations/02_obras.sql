-- =====================================================
-- WORLDPAV - OBRAS E RUAS
-- =====================================================
-- Tabelas para gerenciar obras e suas etapas (ruas)
-- Obras são o centro do sistema, vinculadas a clientes
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 01_clientes.sql
-- =====================================================

-- =====================================================
-- 1. TABELA OBRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Cliente
  client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
  
  -- Dados da obra
  name TEXT NOT NULL,
  description TEXT,
  status status_obra NOT NULL DEFAULT 'planejamento',
  
  -- Datas
  start_date DATE,
  expected_end_date DATE, -- Pode ser NULL (obras sem previsão)
  end_date DATE, -- Data real de conclusão
  
  -- Valores
  contract_value DECIMAL(15, 2),
  executed_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Localização
  location TEXT,
  city TEXT,
  state TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT obras_dates_valid CHECK (
    expected_end_date IS NULL OR 
    start_date IS NULL OR 
    expected_end_date >= start_date
  ),
  CONSTRAINT obras_values_positive CHECK (
    (contract_value IS NULL OR contract_value >= 0) AND
    (executed_value IS NULL OR executed_value >= 0)
  )
);

-- Comentários
COMMENT ON TABLE public.obras IS 'Obras de pavimentação (tabela central do sistema)';
COMMENT ON COLUMN public.obras.id IS 'ID único da obra';
COMMENT ON COLUMN public.obras.company_id IS 'Empresa da obra (isolamento multi-tenant)';
COMMENT ON COLUMN public.obras.client_id IS 'Cliente da obra';
COMMENT ON COLUMN public.obras.status IS 'Status: planejamento, andamento, concluida, cancelada';
COMMENT ON COLUMN public.obras.expected_end_date IS 'Data prevista de conclusão (pode ser NULL)';
COMMENT ON COLUMN public.obras.end_date IS 'Data real de conclusão';
COMMENT ON COLUMN public.obras.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 2. TABELA OBRAS_RUAS (ETAPAS/RUAS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.obras_ruas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Obra relacionada
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Dados da rua/etapa
  name TEXT NOT NULL,
  
  -- Medidas
  length DECIMAL(10, 2), -- Comprimento em metros
  width DECIMAL(10, 2), -- Largura em metros
  area DECIMAL(12, 2), -- Área total (calculada ou manual)
  
  -- Status
  status status_rua NOT NULL DEFAULT 'planejada',
  
  -- Datas
  start_date DATE,
  end_date DATE,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT obras_ruas_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT obras_ruas_measurements_positive CHECK (
    (length IS NULL OR length > 0) AND
    (width IS NULL OR width > 0) AND
    (area IS NULL OR area > 0)
  )
);

-- Comentários
COMMENT ON TABLE public.obras_ruas IS 'Ruas/etapas das obras';
COMMENT ON COLUMN public.obras_ruas.id IS 'ID único da rua/etapa';
COMMENT ON COLUMN public.obras_ruas.obra_id IS 'Obra relacionada';
COMMENT ON COLUMN public.obras_ruas.name IS 'Nome da rua ou descrição da etapa';
COMMENT ON COLUMN public.obras_ruas.length IS 'Comprimento em metros';
COMMENT ON COLUMN public.obras_ruas.width IS 'Largura em metros';
COMMENT ON COLUMN public.obras_ruas.area IS 'Área total em m²';
COMMENT ON COLUMN public.obras_ruas.status IS 'Status: planejada, em_execucao, concluida';
COMMENT ON COLUMN public.obras_ruas.deleted_at IS 'Data de exclusão lógica (soft delete)';

-- =====================================================
-- 3. ÍNDICES - OBRAS
-- =====================================================

-- Índice para busca por empresa (multi-tenant)
CREATE INDEX IF NOT EXISTS idx_obras_company_id 
  ON public.obras(company_id);

-- Índice para busca por cliente
CREATE INDEX IF NOT EXISTS idx_obras_client_id 
  ON public.obras(client_id);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_obras_status 
  ON public.obras(status);

-- Índice para soft delete
CREATE INDEX IF NOT EXISTS idx_obras_deleted_at 
  ON public.obras(deleted_at);

-- Índice composto para queries comuns (empresa + status + não deletados)
CREATE INDEX IF NOT EXISTS idx_obras_company_status_active 
  ON public.obras(company_id, status, deleted_at);

-- Índice para busca por datas
CREATE INDEX IF NOT EXISTS idx_obras_dates 
  ON public.obras(start_date, expected_end_date);

-- Índice para busca por nome (text search)
CREATE INDEX IF NOT EXISTS idx_obras_name 
  ON public.obras USING gin(to_tsvector('portuguese', name));

-- =====================================================
-- 4. ÍNDICES - OBRAS_RUAS
-- =====================================================

-- Índice para busca por obra
CREATE INDEX IF NOT EXISTS idx_obras_ruas_obra_id 
  ON public.obras_ruas(obra_id);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_obras_ruas_status 
  ON public.obras_ruas(status);

-- Índice para soft delete
CREATE INDEX IF NOT EXISTS idx_obras_ruas_deleted_at 
  ON public.obras_ruas(deleted_at);

-- Índice composto (obra + status + não deletados)
CREATE INDEX IF NOT EXISTS idx_obras_ruas_obra_status_active 
  ON public.obras_ruas(obra_id, status, deleted_at);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. TRIGGER PARA CALCULAR ÁREA AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_obras_ruas_area()
RETURNS TRIGGER AS $$
BEGIN
  -- Se length e width estão preenchidos e area está nulo, calcular
  IF NEW.length IS NOT NULL AND NEW.width IS NOT NULL AND NEW.area IS NULL THEN
    NEW.area = NEW.length * NEW.width;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_obras_ruas_area
  BEFORE INSERT OR UPDATE ON public.obras_ruas
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_obras_ruas_area();

COMMENT ON FUNCTION public.calculate_obras_ruas_area() IS 'Calcula área automaticamente (length * width)';

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) - OBRAS
-- =====================================================

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuários veem apenas obras da sua empresa
CREATE POLICY "Users can view own company obras"
  ON public.obras
  FOR SELECT
  USING (company_id = get_user_company_id());

-- Policy: INSERT - Usuários podem criar obras na sua empresa
CREATE POLICY "Users can insert own company obras"
  ON public.obras
  FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

-- Policy: UPDATE - Usuários podem atualizar obras não deletadas da sua empresa
CREATE POLICY "Users can update own company obras"
  ON public.obras
  FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

-- Policy: DELETE - Apenas admins podem deletar
CREATE POLICY "Admins can delete obras"
  ON public.obras
  FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) - OBRAS_RUAS
-- =====================================================

ALTER TABLE public.obras_ruas ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Usuários veem ruas de obras da sua empresa
CREATE POLICY "Users can view own company obras_ruas"
  ON public.obras_ruas
  FOR SELECT
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- Policy: INSERT - Usuários podem criar ruas em obras da sua empresa
CREATE POLICY "Users can insert own company obras_ruas"
  ON public.obras_ruas
  FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- Policy: UPDATE - Usuários podem atualizar ruas não deletadas
CREATE POLICY "Users can update own company obras_ruas"
  ON public.obras_ruas
  FOR UPDATE
  USING (
    deleted_at IS NULL
    AND obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
    )
  );

-- Policy: DELETE - Apenas admins podem deletar
CREATE POLICY "Admins can delete obras_ruas"
  ON public.obras_ruas
  FOR DELETE
  USING (
    obra_id IN (
      SELECT id FROM public.obras 
      WHERE company_id = get_user_company_id()
      AND is_user_admin()
    )
  );

-- =====================================================
-- FIM DO SCRIPT OBRAS
-- =====================================================
-- Próximo script: 03_obras_financeiro.sql
-- =====================================================


