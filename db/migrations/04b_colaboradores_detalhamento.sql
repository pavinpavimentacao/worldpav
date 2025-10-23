-- =====================================================
-- WORLDPAV - COLABORADORES DETALHAMENTO
-- =====================================================
-- Tabelas especializadas para documentação de colaboradores:
-- - colaboradores_documentos_nr (Normas Regulamentadoras)
-- - colaboradores_certificados (Cursos e certificações)
-- - colaboradores_multas (Multas de trânsito)
-- - colaboradores_arquivos (Arquivos gerais)
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- - 04_colaboradores.sql
-- =====================================================

-- =====================================================
-- 1. TABELA COLABORADORES_DOCUMENTOS_NR
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_documentos_nr (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados do documento
  tipo_documento TEXT NOT NULL, -- NR-01, NR-06, NR-11, NR-12, NR-18, MOPI, ASO, Ficha de Registro
  data_validade DATE NOT NULL,
  arquivo_url TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT colaboradores_documentos_nr_tipo_valido CHECK (
    tipo_documento IN ('NR-01', 'NR-06', 'NR-11', 'NR-12', 'NR-18', 'MOPI', 'ASO', 'Ficha de Registro')
  )
);

COMMENT ON TABLE public.colaboradores_documentos_nr IS 'Documentos de Normas Regulamentadoras dos colaboradores';
COMMENT ON COLUMN public.colaboradores_documentos_nr.tipo_documento IS 'Tipo de documento NR';
COMMENT ON COLUMN public.colaboradores_documentos_nr.data_validade IS 'Data de validade do documento';

-- =====================================================
-- 2. TABELA COLABORADORES_CERTIFICADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_certificados (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados do certificado
  nome_curso TEXT NOT NULL,
  instituicao TEXT,
  data_emissao DATE,
  data_validade DATE,
  arquivo_url TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT colaboradores_certificados_nome_not_empty CHECK (LENGTH(TRIM(nome_curso)) > 0)
);

COMMENT ON TABLE public.colaboradores_certificados IS 'Certificados e cursos dos colaboradores';
COMMENT ON COLUMN public.colaboradores_certificados.nome_curso IS 'Nome do curso ou certificação';
COMMENT ON COLUMN public.colaboradores_certificados.instituicao IS 'Instituição emissora';

-- =====================================================
-- 3. TABELA COLABORADORES_MULTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_multas (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados da multa
  tipo_infracao TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10, 2),
  pontos_carteira INTEGER,
  data_infracao TIMESTAMPTZ NOT NULL,
  data_vencimento DATE,
  local_infracao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, em_recurso
  comprovante_url TEXT,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT colaboradores_multas_tipo_not_empty CHECK (LENGTH(TRIM(tipo_infracao)) > 0),
  CONSTRAINT colaboradores_multas_status_valido CHECK (status IN ('pendente', 'pago', 'em_recurso')),
  CONSTRAINT colaboradores_multas_valor_positivo CHECK (valor IS NULL OR valor >= 0),
  CONSTRAINT colaboradores_multas_pontos_positivo CHECK (pontos_carteira IS NULL OR pontos_carteira >= 0)
);

COMMENT ON TABLE public.colaboradores_multas IS 'Multas de trânsito dos colaboradores';
COMMENT ON COLUMN public.colaboradores_multas.tipo_infracao IS 'Tipo de infração cometida';
COMMENT ON COLUMN public.colaboradores_multas.status IS 'Status: pendente, pago, em_recurso';

-- =====================================================
-- 4. TABELA COLABORADORES_ARQUIVOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.colaboradores_arquivos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Colaborador relacionado
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  
  -- Dados do arquivo
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT,
  tamanho INTEGER NOT NULL,
  arquivo_url TEXT NOT NULL,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT colaboradores_arquivos_nome_not_empty CHECK (LENGTH(TRIM(nome_arquivo)) > 0),
  CONSTRAINT colaboradores_arquivos_tamanho_positivo CHECK (tamanho > 0)
);

COMMENT ON TABLE public.colaboradores_arquivos IS 'Arquivos gerais dos colaboradores';
COMMENT ON COLUMN public.colaboradores_arquivos.nome_arquivo IS 'Nome do arquivo';
COMMENT ON COLUMN public.colaboradores_arquivos.tamanho IS 'Tamanho em bytes';

-- =====================================================
-- 5. ÍNDICES
-- =====================================================

-- Documentos NR
CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_nr_colaborador_id 
  ON public.colaboradores_documentos_nr(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_nr_data_validade 
  ON public.colaboradores_documentos_nr(data_validade);

CREATE INDEX IF NOT EXISTS idx_colaboradores_documentos_nr_tipo 
  ON public.colaboradores_documentos_nr(tipo_documento);

-- Certificados
CREATE INDEX IF NOT EXISTS idx_colaboradores_certificados_colaborador_id 
  ON public.colaboradores_certificados(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_certificados_data_validade 
  ON public.colaboradores_certificados(data_validade) 
  WHERE data_validade IS NOT NULL;

-- Multas
CREATE INDEX IF NOT EXISTS idx_colaboradores_multas_colaborador_id 
  ON public.colaboradores_multas(colaborador_id);

CREATE INDEX IF NOT EXISTS idx_colaboradores_multas_status 
  ON public.colaboradores_multas(status);

CREATE INDEX IF NOT EXISTS idx_colaboradores_multas_data_infracao 
  ON public.colaboradores_multas(data_infracao);

-- Arquivos
CREATE INDEX IF NOT EXISTS idx_colaboradores_arquivos_colaborador_id 
  ON public.colaboradores_arquivos(colaborador_id);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

CREATE TRIGGER trigger_update_colaboradores_documentos_nr_updated_at
  BEFORE UPDATE ON public.colaboradores_documentos_nr
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Documentos NR
ALTER TABLE public.colaboradores_documentos_nr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company documentos NR"
  ON public.colaboradores_documentos_nr FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_documentos_nr.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company documentos NR"
  ON public.colaboradores_documentos_nr FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_documentos_nr.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company documentos NR"
  ON public.colaboradores_documentos_nr FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_documentos_nr.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete own company documentos NR"
  ON public.colaboradores_documentos_nr FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_documentos_nr.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

-- Certificados
ALTER TABLE public.colaboradores_certificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company certificados"
  ON public.colaboradores_certificados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_certificados.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company certificados"
  ON public.colaboradores_certificados FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_certificados.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company certificados"
  ON public.colaboradores_certificados FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_certificados.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete own company certificados"
  ON public.colaboradores_certificados FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_certificados.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

-- Multas
ALTER TABLE public.colaboradores_multas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company multas"
  ON public.colaboradores_multas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_multas.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company multas"
  ON public.colaboradores_multas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_multas.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company multas"
  ON public.colaboradores_multas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_multas.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete own company multas"
  ON public.colaboradores_multas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_multas.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

-- Arquivos
ALTER TABLE public.colaboradores_arquivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company arquivos"
  ON public.colaboradores_arquivos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_arquivos.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert own company arquivos"
  ON public.colaboradores_arquivos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_arquivos.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can update own company arquivos"
  ON public.colaboradores_arquivos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_arquivos.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can delete own company arquivos"
  ON public.colaboradores_arquivos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores
      WHERE colaboradores.id = colaboradores_arquivos.colaborador_id
      AND colaboradores.company_id = get_user_company_id()
    )
  );


