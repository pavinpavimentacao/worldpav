-- =====================================================
-- WORLDPAV - PARCEIROS/FORNECEDORES
-- =====================================================
-- Sistema completo de gestão de parceiros:
-- - parceiros (dados principais)
-- - parceiros_precos (tabela de preços por faixa)
-- - carregamentos_rr2c (controle de carregamentos)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA PARCEIROS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.parceiros (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados do parceiro
  name TEXT NOT NULL,
  cnpj TEXT,
  nicho nicho_parceiro, -- 'asfalto', 'brita', 'areia', 'frete', 'outros'
  
  -- Contato
  email TEXT,
  phone TEXT,
  
  -- Endereço
  address TEXT,
  city TEXT,
  state TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT parceiros_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

COMMENT ON TABLE public.parceiros IS 'Parceiros/fornecedores por nicho';
COMMENT ON COLUMN public.parceiros.nicho IS 'Nicho: asfalto, brita, areia, frete, outros';

-- =====================================================
-- 2. TABELA PARCEIROS_PRECOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.parceiros_precos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Parceiro relacionado
  parceiro_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  
  -- Faixa de distância
  faixa_distancia TEXT NOT NULL, -- Ex: "0-50km", "50-100km"
  
  -- Preço
  preco_por_tonelada DECIMAL(10, 2) NOT NULL,
  
  -- Data de vigência
  effective_date DATE DEFAULT CURRENT_DATE,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT parceiros_precos_preco_positive CHECK (preco_por_tonelada > 0)
);

COMMENT ON TABLE public.parceiros_precos IS 'Tabela de preços por faixa de distância';
COMMENT ON COLUMN public.parceiros_precos.faixa_distancia IS 'Faixa de distância (ex: 0-50km)';
COMMENT ON COLUMN public.parceiros_precos.preco_por_tonelada IS 'Preço por tonelada nesta faixa';

-- =====================================================
-- 3. TABELA CARREGAMENTOS_RR2C
-- =====================================================

CREATE TABLE IF NOT EXISTS public.carregamentos_rr2c (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Parceiro e obra
  parceiro_id UUID NOT NULL REFERENCES public.parceiros(id) ON DELETE CASCADE,
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  
  -- Data
  date DATE NOT NULL,
  
  -- Material
  material TEXT NOT NULL,
  
  -- Quantidade e valores
  quantity_tons DECIMAL(10, 2) NOT NULL,
  price_per_ton DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Distância
  distance_km DECIMAL(10, 2),
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT carregamentos_rr2c_values_positive CHECK (
    quantity_tons > 0 AND
    price_per_ton > 0 AND
    total_amount > 0 AND
    (distance_km IS NULL OR distance_km >= 0)
  )
);

COMMENT ON TABLE public.carregamentos_rr2c IS 'Carregamentos RR2C de parceiros';
COMMENT ON COLUMN public.carregamentos_rr2c.quantity_tons IS 'Quantidade em toneladas';
COMMENT ON COLUMN public.carregamentos_rr2c.price_per_ton IS 'Preço por tonelada';
COMMENT ON COLUMN public.carregamentos_rr2c.distance_km IS 'Distância em quilômetros';

-- =====================================================
-- 4. ÍNDICES - PARCEIROS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_parceiros_company_id 
  ON public.parceiros(company_id);

CREATE INDEX IF NOT EXISTS idx_parceiros_nicho 
  ON public.parceiros(nicho) WHERE nicho IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_parceiros_deleted_at 
  ON public.parceiros(deleted_at);

CREATE INDEX IF NOT EXISTS idx_parceiros_name 
  ON public.parceiros USING gin(to_tsvector('portuguese', name));

-- =====================================================
-- 5. ÍNDICES - PARCEIROS_PRECOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_parceiros_precos_parceiro_id 
  ON public.parceiros_precos(parceiro_id);

CREATE INDEX IF NOT EXISTS idx_parceiros_precos_effective_date 
  ON public.parceiros_precos(effective_date DESC);

-- =====================================================
-- 6. ÍNDICES - CARREGAMENTOS_RR2C
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_carregamentos_rr2c_parceiro_id 
  ON public.carregamentos_rr2c(parceiro_id);

CREATE INDEX IF NOT EXISTS idx_carregamentos_rr2c_obra_id 
  ON public.carregamentos_rr2c(obra_id);

CREATE INDEX IF NOT EXISTS idx_carregamentos_rr2c_date 
  ON public.carregamentos_rr2c(date DESC);

-- =====================================================
-- 7. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_parceiros_updated_at
  BEFORE UPDATE ON public.parceiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) - PARCEIROS
-- =====================================================

ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company parceiros"
  ON public.parceiros FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company parceiros"
  ON public.parceiros FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company parceiros"
  ON public.parceiros FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete parceiros"
  ON public.parceiros FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) - PARCEIROS_PRECOS
-- =====================================================

ALTER TABLE public.parceiros_precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company parceiros_precos"
  ON public.parceiros_precos FOR SELECT
  USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company parceiros_precos"
  ON public.parceiros_precos FOR INSERT
  WITH CHECK (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company parceiros_precos"
  ON public.parceiros_precos FOR UPDATE
  USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) - CARREGAMENTOS_RR2C
-- =====================================================

ALTER TABLE public.carregamentos_rr2c ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company carregamentos_rr2c"
  ON public.carregamentos_rr2c FOR SELECT
  USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company carregamentos_rr2c"
  ON public.carregamentos_rr2c FOR INSERT
  WITH CHECK (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company carregamentos_rr2c"
  ON public.carregamentos_rr2c FOR UPDATE
  USING (
    parceiro_id IN (
      SELECT id FROM public.parceiros 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- FIM DO SCRIPT PARCEIROS
-- =====================================================
-- Próximo script: 10_guardas.sql
-- =====================================================


