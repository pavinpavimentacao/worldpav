-- Migration: Criar tabelas de Seguro para Maquinários e Veículos
-- Data: 2025-10-18
-- Descrição: Tabelas para gerenciar seguros, apólices e sinistros de equipamentos

-- ============================================================================
-- TABELA: seguros_maquinarios
-- Armazena informações de seguros de cada maquinário/veículo
-- ============================================================================
CREATE TABLE IF NOT EXISTS seguros_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maquinario_id UUID NOT NULL, -- FK para tabela de maquinários (a ser criada)
  company_id UUID NOT NULL,
  
  -- Informações da Seguradora
  seguradora VARCHAR(200) NOT NULL,
  numero_apolice VARCHAR(100) NOT NULL,
  tipo_cobertura VARCHAR(50) NOT NULL CHECK (tipo_cobertura IN (
    'compreensiva', 
    'colisao', 
    'incendio_roubo', 
    'roubo', 
    'terceiros', 
    'outras'
  )),
  
  -- Valores
  valor_segurado DECIMAL(12, 2) NOT NULL,
  valor_franquia DECIMAL(12, 2) DEFAULT 0,
  valor_premio DECIMAL(12, 2) NOT NULL, -- Valor total do seguro
  
  -- Vigência
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE NOT NULL,
  
  -- Pagamento
  forma_pagamento VARCHAR(50) NOT NULL CHECK (forma_pagamento IN (
    'vista', 
    'parcelado_mensal', 
    'parcelado_trimestral', 
    'parcelado_semestral', 
    'parcelado_anual'
  )),
  valor_parcela DECIMAL(12, 2),
  quantidade_parcelas INTEGER,
  dia_vencimento INTEGER CHECK (dia_vencimento BETWEEN 1 AND 31),
  
  -- Corretor
  corretor VARCHAR(200),
  telefone_corretor VARCHAR(20),
  email_corretor VARCHAR(100),
  
  -- Documentação
  arquivo_apolice_url TEXT,
  observacoes TEXT,
  
  -- Status e Controle
  status VARCHAR(50) NOT NULL DEFAULT 'ativo' CHECK (status IN (
    'ativo', 
    'vencido', 
    'cancelado', 
    'em_renovacao'
  )),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT numero_apolice_unico UNIQUE (numero_apolice, company_id),
  CONSTRAINT vigencia_valida CHECK (data_fim_vigencia > data_inicio_vigencia)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_seguros_maquinario ON seguros_maquinarios(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_seguros_company ON seguros_maquinarios(company_id);
CREATE INDEX IF NOT EXISTS idx_seguros_status ON seguros_maquinarios(status);
CREATE INDEX IF NOT EXISTS idx_seguros_vigencia ON seguros_maquinarios(data_fim_vigencia);

-- ============================================================================
-- TABELA: sinistros_seguros
-- Armazena informações de sinistros/acionamentos de seguro
-- ============================================================================
CREATE TABLE IF NOT EXISTS sinistros_seguros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seguro_id UUID NOT NULL,
  
  -- Informações do Sinistro
  data_sinistro DATE NOT NULL,
  tipo_sinistro VARCHAR(50) NOT NULL CHECK (tipo_sinistro IN (
    'colisao', 
    'roubo', 
    'incendio', 
    'danos_terceiros', 
    'quebra_equipamento', 
    'outros'
  )),
  descricao TEXT NOT NULL,
  
  -- Valores
  valor_prejuizo DECIMAL(12, 2) NOT NULL,
  valor_franquia_paga DECIMAL(12, 2) DEFAULT 0,
  valor_indenizado DECIMAL(12, 2) DEFAULT 0,
  
  -- Controle do Sinistro
  numero_sinistro VARCHAR(100),
  status_sinistro VARCHAR(50) NOT NULL DEFAULT 'em_analise' CHECK (status_sinistro IN (
    'em_analise', 
    'aprovado', 
    'reprovado', 
    'pago', 
    'cancelado'
  )),
  
  -- Datas
  data_abertura DATE NOT NULL,
  data_conclusao DATE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT fk_seguro FOREIGN KEY (seguro_id) REFERENCES seguros_maquinarios(id) ON DELETE CASCADE,
  CONSTRAINT valores_sinistro_validos CHECK (valor_indenizado <= valor_prejuizo)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sinistros_seguro ON sinistros_seguros(seguro_id);
CREATE INDEX IF NOT EXISTS idx_sinistros_data ON sinistros_seguros(data_sinistro);
CREATE INDEX IF NOT EXISTS idx_sinistros_status ON sinistros_seguros(status_sinistro);

-- ============================================================================
-- FUNCTION: Atualizar status do seguro automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION atualizar_status_seguro()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar status baseado na data de vigência
  IF NEW.data_fim_vigencia < CURRENT_DATE THEN
    NEW.status := 'vencido';
  END IF;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente
CREATE TRIGGER trigger_atualizar_status_seguro
  BEFORE INSERT OR UPDATE ON seguros_maquinarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_status_seguro();

-- ============================================================================
-- POLICIES RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE seguros_maquinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sinistros_seguros ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seguros da sua empresa
CREATE POLICY seguros_maquinarios_select_policy ON seguros_maquinarios
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem inserir seguros para sua empresa
CREATE POLICY seguros_maquinarios_insert_policy ON seguros_maquinarios
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar seguros da sua empresa
CREATE POLICY seguros_maquinarios_update_policy ON seguros_maquinarios
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem deletar seguros da sua empresa
CREATE POLICY seguros_maquinarios_delete_policy ON seguros_maquinarios
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM usuarios WHERE id = auth.uid()
    )
  );

-- Policies para Sinistros
CREATE POLICY sinistros_select_policy ON sinistros_seguros
  FOR SELECT
  USING (
    seguro_id IN (
      SELECT id FROM seguros_maquinarios 
      WHERE company_id IN (
        SELECT company_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY sinistros_insert_policy ON sinistros_seguros
  FOR INSERT
  WITH CHECK (
    seguro_id IN (
      SELECT id FROM seguros_maquinarios 
      WHERE company_id IN (
        SELECT company_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY sinistros_update_policy ON sinistros_seguros
  FOR UPDATE
  USING (
    seguro_id IN (
      SELECT id FROM seguros_maquinarios 
      WHERE company_id IN (
        SELECT company_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY sinistros_delete_policy ON sinistros_seguros
  FOR DELETE
  USING (
    seguro_id IN (
      SELECT id FROM seguros_maquinarios 
      WHERE company_id IN (
        SELECT company_id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- ============================================================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================================================
COMMENT ON TABLE seguros_maquinarios IS 'Tabela para armazenar informações de seguros de maquinários e veículos';
COMMENT ON TABLE sinistros_seguros IS 'Tabela para armazenar histórico de sinistros e acionamentos de seguro';

COMMENT ON COLUMN seguros_maquinarios.tipo_cobertura IS 'Tipo de cobertura do seguro (compreensiva, colisão, etc)';
COMMENT ON COLUMN seguros_maquinarios.valor_premio IS 'Valor total do prêmio (custo total do seguro)';
COMMENT ON COLUMN seguros_maquinarios.valor_franquia IS 'Valor da franquia em caso de sinistro';
COMMENT ON COLUMN sinistros_seguros.valor_prejuizo IS 'Valor total do prejuízo estimado';
COMMENT ON COLUMN sinistros_seguros.valor_indenizado IS 'Valor efetivamente indenizado pela seguradora';


