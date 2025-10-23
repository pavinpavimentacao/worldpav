-- =====================================================
-- WORLDPAV - MAQUINÁRIOS
-- =====================================================
-- Sistema completo de gestão de maquinários:
-- - maquinarios (dados principais)
-- - maquinarios_seguros (apólices de seguro)
-- - maquinarios_licencas (CNH, alvarás, CRLV)
-- - maquinarios_diesel (abastecimentos)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 02_obras.sql
-- =====================================================

-- =====================================================
-- 1. TABELA MAQUINARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maquinarios (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Multi-tenant
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Dados do maquinário
  name TEXT NOT NULL,
  type TEXT, -- Tipo: Vibroacabadora, Rolo, Caminhão, etc
  brand TEXT,
  model TEXT,
  plate TEXT, -- Placa
  year INTEGER,
  
  -- Status
  status status_maquinario NOT NULL DEFAULT 'ativo',
  
  -- Observações
  observations TEXT,
  
  -- Foto
  photo_url TEXT, -- URL no Storage
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT maquinarios_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT maquinarios_year_valid CHECK (year IS NULL OR year >= 1900)
);

COMMENT ON TABLE public.maquinarios IS 'Maquinários e equipamentos da empresa';
COMMENT ON COLUMN public.maquinarios.type IS 'Tipo de maquinário (Vibroacabadora, Rolo, etc)';
COMMENT ON COLUMN public.maquinarios.status IS 'Status: ativo, manutencao, inativo';
COMMENT ON COLUMN public.maquinarios.photo_url IS 'URL da foto no Supabase Storage';

-- =====================================================
-- 2. TABELA MAQUINARIOS_SEGUROS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maquinarios_seguros (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Maquinário relacionado
  maquinario_id UUID NOT NULL REFERENCES public.maquinarios(id) ON DELETE CASCADE,
  
  -- Dados do seguro
  insurance_company TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  coverage_type TEXT,
  
  -- Valores
  coverage_value DECIMAL(12, 2),
  premium_value DECIMAL(12, 2),
  
  -- Vigência
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status status_seguro NOT NULL DEFAULT 'ativo',
  
  -- Documento
  document_url TEXT, -- URL do documento no Storage
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT maquinarios_seguros_dates_valid CHECK (end_date >= start_date),
  CONSTRAINT maquinarios_seguros_values_positive CHECK (
    (coverage_value IS NULL OR coverage_value >= 0) AND
    (premium_value IS NULL OR premium_value >= 0)
  )
);

COMMENT ON TABLE public.maquinarios_seguros IS 'Seguros de maquinários';
COMMENT ON COLUMN public.maquinarios_seguros.policy_number IS 'Número da apólice';
COMMENT ON COLUMN public.maquinarios_seguros.coverage_value IS 'Valor da cobertura';
COMMENT ON COLUMN public.maquinarios_seguros.premium_value IS 'Valor do prêmio (mensalidade)';
COMMENT ON COLUMN public.maquinarios_seguros.status IS 'Status: ativo, vencido, cancelado';
COMMENT ON COLUMN public.maquinarios_seguros.document_url IS 'URL do documento no Supabase Storage';

-- =====================================================
-- 3. TABELA MAQUINARIOS_LICENCAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maquinarios_licencas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Maquinário relacionado
  maquinario_id UUID NOT NULL REFERENCES public.maquinarios(id) ON DELETE CASCADE,
  
  -- Dados da licença
  license_type tipo_licenca NOT NULL, -- 'cnh', 'alvara', 'crlv', 'outros'
  license_number TEXT NOT NULL,
  holder_name TEXT, -- Titular da CNH
  
  -- Datas
  issue_date DATE,
  expiry_date DATE,
  
  -- Status
  status status_documento NOT NULL DEFAULT 'ativo',
  
  -- Documento
  document_url TEXT, -- URL do documento no Storage
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.maquinarios_licencas IS 'Licenças de maquinários (CNH, alvarás, CRLV)';
COMMENT ON COLUMN public.maquinarios_licencas.license_type IS 'Tipo: cnh, alvara, crlv, outros';
COMMENT ON COLUMN public.maquinarios_licencas.holder_name IS 'Titular da CNH (para tipo CNH)';
COMMENT ON COLUMN public.maquinarios_licencas.status IS 'Status: ativo, vencido, proximo_vencimento';
COMMENT ON COLUMN public.maquinarios_licencas.document_url IS 'URL do documento no Supabase Storage';

-- =====================================================
-- 4. TABELA MAQUINARIOS_DIESEL
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maquinarios_diesel (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Maquinário e obra
  maquinario_id UUID NOT NULL REFERENCES public.maquinarios(id) ON DELETE CASCADE,
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  
  -- Dados do abastecimento
  date DATE NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  price_per_liter DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Hodômetro/horímetro
  odometer DECIMAL(10, 2),
  
  -- Posto
  gas_station TEXT,
  
  -- Observações
  observations TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT maquinarios_diesel_values_positive CHECK (
    liters > 0 AND
    price_per_liter > 0 AND
    total_amount > 0 AND
    (odometer IS NULL OR odometer >= 0)
  )
);

COMMENT ON TABLE public.maquinarios_diesel IS 'Abastecimentos de diesel de maquinários';
COMMENT ON COLUMN public.maquinarios_diesel.liters IS 'Quantidade de litros abastecidos';
COMMENT ON COLUMN public.maquinarios_diesel.price_per_liter IS 'Preço por litro';
COMMENT ON COLUMN public.maquinarios_diesel.total_amount IS 'Valor total do abastecimento';
COMMENT ON COLUMN public.maquinarios_diesel.odometer IS 'Hodômetro/horímetro no momento do abastecimento';

-- =====================================================
-- 5. ÍNDICES - MAQUINARIOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_maquinarios_company_id 
  ON public.maquinarios(company_id);

CREATE INDEX IF NOT EXISTS idx_maquinarios_status 
  ON public.maquinarios(status);

CREATE INDEX IF NOT EXISTS idx_maquinarios_type 
  ON public.maquinarios(type) WHERE type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maquinarios_plate 
  ON public.maquinarios(plate) WHERE plate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maquinarios_deleted_at 
  ON public.maquinarios(deleted_at);

CREATE INDEX IF NOT EXISTS idx_maquinarios_company_status_active 
  ON public.maquinarios(company_id, status, deleted_at);

-- =====================================================
-- 6. ÍNDICES - MAQUINARIOS_SEGUROS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_maquinarios_seguros_maquinario_id 
  ON public.maquinarios_seguros(maquinario_id);

CREATE INDEX IF NOT EXISTS idx_maquinarios_seguros_status 
  ON public.maquinarios_seguros(status);

CREATE INDEX IF NOT EXISTS idx_maquinarios_seguros_end_date 
  ON public.maquinarios_seguros(end_date);

CREATE INDEX IF NOT EXISTS idx_maquinarios_seguros_deleted_at 
  ON public.maquinarios_seguros(deleted_at);

-- =====================================================
-- 7. ÍNDICES - MAQUINARIOS_LICENCAS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_maquinarios_licencas_maquinario_id 
  ON public.maquinarios_licencas(maquinario_id);

CREATE INDEX IF NOT EXISTS idx_maquinarios_licencas_license_type 
  ON public.maquinarios_licencas(license_type);

CREATE INDEX IF NOT EXISTS idx_maquinarios_licencas_status 
  ON public.maquinarios_licencas(status);

CREATE INDEX IF NOT EXISTS idx_maquinarios_licencas_expiry_date 
  ON public.maquinarios_licencas(expiry_date) 
  WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maquinarios_licencas_deleted_at 
  ON public.maquinarios_licencas(deleted_at);

-- =====================================================
-- 8. ÍNDICES - MAQUINARIOS_DIESEL
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_maquinario_id 
  ON public.maquinarios_diesel(maquinario_id);

CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_obra_id 
  ON public.maquinarios_diesel(obra_id) WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maquinarios_diesel_date 
  ON public.maquinarios_diesel(date DESC);

-- =====================================================
-- 9. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER trigger_update_maquinarios_updated_at
  BEFORE UPDATE ON public.maquinarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 10. TRIGGER PARA ATUALIZAR STATUS DE SEGUROS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_maquinarios_seguros_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.status = 'vencido';
  ELSIF NEW.end_date >= CURRENT_DATE THEN
    NEW.status = 'ativo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maquinarios_seguros_status
  BEFORE INSERT OR UPDATE ON public.maquinarios_seguros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maquinarios_seguros_status();

-- =====================================================
-- 11. TRIGGER PARA ATUALIZAR STATUS DE LICENÇAS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_maquinarios_licencas_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL THEN
    IF NEW.expiry_date < CURRENT_DATE THEN
      NEW.status = 'vencido';
    ELSIF NEW.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'proximo_vencimento';
    ELSE
      NEW.status = 'ativo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_maquinarios_licencas_status
  BEFORE INSERT OR UPDATE ON public.maquinarios_licencas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maquinarios_licencas_status();

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) - MAQUINARIOS
-- =====================================================

ALTER TABLE public.maquinarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company maquinarios"
  ON public.maquinarios FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert own company maquinarios"
  ON public.maquinarios FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update own company maquinarios"
  ON public.maquinarios FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND deleted_at IS NULL
  );

CREATE POLICY "Admins can delete maquinarios"
  ON public.maquinarios FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_user_admin()
  );

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) - MAQUINARIOS_SEGUROS
-- =====================================================

ALTER TABLE public.maquinarios_seguros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company maquinarios_seguros"
  ON public.maquinarios_seguros FOR SELECT
  USING (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company maquinarios_seguros"
  ON public.maquinarios_seguros FOR INSERT
  WITH CHECK (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company maquinarios_seguros"
  ON public.maquinarios_seguros FOR UPDATE
  USING (
    deleted_at IS NULL AND
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS) - MAQUINARIOS_LICENCAS
-- =====================================================

ALTER TABLE public.maquinarios_licencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company maquinarios_licencas"
  ON public.maquinarios_licencas FOR SELECT
  USING (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company maquinarios_licencas"
  ON public.maquinarios_licencas FOR INSERT
  WITH CHECK (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company maquinarios_licencas"
  ON public.maquinarios_licencas FOR UPDATE
  USING (
    deleted_at IS NULL AND
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS) - MAQUINARIOS_DIESEL
-- =====================================================

ALTER TABLE public.maquinarios_diesel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company maquinarios_diesel"
  ON public.maquinarios_diesel FOR SELECT
  USING (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company maquinarios_diesel"
  ON public.maquinarios_diesel FOR INSERT
  WITH CHECK (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company maquinarios_diesel"
  ON public.maquinarios_diesel FOR UPDATE
  USING (
    maquinario_id IN (
      SELECT id FROM public.maquinarios 
      WHERE company_id = get_user_company_id()
    )
  );

-- =====================================================
-- FIM DO SCRIPT MAQUINARIOS
-- =====================================================
-- Próximo script: 07_programacao_pavimentacao.sql
-- =====================================================


