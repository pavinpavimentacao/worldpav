-- =====================================================
-- MIGRATION: Relatórios Diários com Sincronização
-- =====================================================
-- Cria sistema completo de relatórios diários integrado
-- com obras, ruas, maquinários e parceiros terceiros

-- 1. Criar tabela de relatórios diários
CREATE TABLE IF NOT EXISTS relatorios_diarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL, -- Auto-gerado: RD-YYYY-001
  
  -- Relacionamentos
  cliente_id UUID REFERENCES clients(id),
  obra_id UUID REFERENCES obras(id),
  rua_id UUID REFERENCES obras_ruas(id),
  equipe_id UUID, -- Pode ser ID de equipe própria ou parceiro_equipe_id
  equipe_is_terceira BOOLEAN DEFAULT false,
  
  -- Datas e horários
  data_inicio DATE NOT NULL,
  data_fim DATE,
  horario_inicio TIME NOT NULL,
  
  -- Metragem e toneladas
  metragem_feita DECIMAL(10,2) NOT NULL,
  toneladas_aplicadas DECIMAL(10,2) NOT NULL,
  espessura_calculada DECIMAL(5,2), -- Calculada automaticamente: (toneladas / metragem) × 10
  
  -- Observações
  observacoes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'finalizado', -- Sempre finalizado ao criar
  
  -- Auditoria
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE relatorios_diarios IS 'Relatórios diários de trabalhos realizados em ruas de obras';
COMMENT ON COLUMN relatorios_diarios.numero IS 'Número sequencial do relatório (RD-YYYY-NNN)';
COMMENT ON COLUMN relatorios_diarios.espessura_calculada IS 'Espessura em cm: (toneladas / metragem / 2.4) × 100. Densidade: 2.4 ton/m³. Média: 3.5 cm';

-- Índices para relatorios_diarios
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_cliente ON relatorios_diarios(cliente_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_obra ON relatorios_diarios(obra_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_rua ON relatorios_diarios(rua_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_data_inicio ON relatorios_diarios(data_inicio);
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_numero ON relatorios_diarios(numero);
CREATE INDEX IF NOT EXISTS idx_relatorios_diarios_status ON relatorios_diarios(status);

-- 2. Criar tabela de vinculação maquinários x relatórios (Many-to-Many)
CREATE TABLE IF NOT EXISTS relatorios_diarios_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relatorio_id UUID NOT NULL REFERENCES relatorios_diarios(id) ON DELETE CASCADE,
  maquinario_id UUID, -- ID do maquinário próprio OU parceiro_maquinario_id
  is_terceiro BOOLEAN DEFAULT false,
  parceiro_id UUID REFERENCES parceiros(id), -- Se for terceiro, qual parceiro
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE relatorios_diarios_maquinarios IS 'Vinculação de maquinários (próprios ou terceiros) aos relatórios diários';

-- Índices para relatorios_diarios_maquinarios
CREATE INDEX IF NOT EXISTS idx_rdm_relatorio ON relatorios_diarios_maquinarios(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_rdm_maquinario ON relatorios_diarios_maquinarios(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_rdm_terceiro ON relatorios_diarios_maquinarios(is_terceiro);

-- 3. Atualizar tabela obras_ruas para vincular relatório de finalização
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS relatorio_diario_id UUID REFERENCES relatorios_diarios(id);
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS data_finalizacao DATE;
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS metragem_executada DECIMAL(10,2);
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS toneladas_executadas DECIMAL(10,2);

COMMENT ON COLUMN obras_ruas.relatorio_diario_id IS 'Relatório diário que finalizou esta rua';
COMMENT ON COLUMN obras_ruas.data_finalizacao IS 'Data em que a rua foi finalizada';
COMMENT ON COLUMN obras_ruas.metragem_executada IS 'Metragem real executada (m²)';
COMMENT ON COLUMN obras_ruas.toneladas_executadas IS 'Toneladas reais aplicadas';

-- Índice para busca por relatório
CREATE INDEX IF NOT EXISTS idx_obras_ruas_relatorio ON obras_ruas(relatorio_diario_id);

-- 4. Row Level Security (RLS)

-- Habilitar RLS nas novas tabelas
ALTER TABLE relatorios_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_diarios_maquinarios ENABLE ROW LEVEL SECURITY;

-- Policies para relatorios_diarios
CREATE POLICY "Permitir visualizar relatórios autenticados"
  ON relatorios_diarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserir relatórios autenticados"
  ON relatorios_diarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar relatórios autenticados"
  ON relatorios_diarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir deletar relatórios autenticados"
  ON relatorios_diarios FOR DELETE
  TO authenticated
  USING (true);

-- Policies para relatorios_diarios_maquinarios
CREATE POLICY "Permitir visualizar maquinários de relatórios autenticados"
  ON relatorios_diarios_maquinarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserir maquinários de relatórios autenticados"
  ON relatorios_diarios_maquinarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar maquinários de relatórios autenticados"
  ON relatorios_diarios_maquinarios FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir deletar maquinários de relatórios autenticados"
  ON relatorios_diarios_maquinarios FOR DELETE
  TO authenticated
  USING (true);

-- 5. Trigger para updated_at
CREATE TRIGGER update_relatorios_diarios_updated_at
  BEFORE UPDATE ON relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Função para gerar número sequencial de relatório
CREATE OR REPLACE FUNCTION gerar_numero_relatorio()
RETURNS TRIGGER AS $$
DECLARE
  ano INTEGER;
  sequencia INTEGER;
  novo_numero VARCHAR(50);
BEGIN
  -- Obter ano atual
  ano := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Se já tem número, retornar
  IF NEW.numero IS NOT NULL AND NEW.numero != '' THEN
    RETURN NEW;
  END IF;
  
  -- Buscar última sequência do ano
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(numero FROM 'RD-' || ano::text || '-(\d+)')
      AS INTEGER
    )
  ), 0) INTO sequencia
  FROM relatorios_diarios
  WHERE numero LIKE 'RD-' || ano::text || '-%';
  
  -- Incrementar
  sequencia := sequencia + 1;
  
  -- Gerar número (RD-YYYY-NNN)
  novo_numero := 'RD-' || ano::text || '-' || LPAD(sequencia::text, 3, '0');
  
  NEW.numero := novo_numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número automaticamente
CREATE TRIGGER gerar_numero_relatorio_trigger
  BEFORE INSERT ON relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION gerar_numero_relatorio();

-- 7. Função para calcular espessura automaticamente
CREATE OR REPLACE FUNCTION calcular_espessura_relatorio()
RETURNS TRIGGER AS $$
DECLARE
  densidade DECIMAL := 2.4; -- Densidade do asfalto em ton/m³
BEGIN
  -- Calcular espessura: (toneladas / metragem / densidade) × 100
  -- Resultado em centímetros
  IF NEW.metragem_feita > 0 THEN
    NEW.espessura_calculada := (NEW.toneladas_aplicadas / NEW.metragem_feita / densidade) * 100;
  ELSE
    NEW.espessura_calculada := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular espessura
CREATE TRIGGER calcular_espessura_relatorio_trigger
  BEFORE INSERT OR UPDATE OF metragem_feita, toneladas_aplicadas
  ON relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION calcular_espessura_relatorio();

-- 8. Função para finalizar rua automaticamente ao criar relatório
CREATE OR REPLACE FUNCTION finalizar_rua_ao_criar_relatorio()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar rua para finalizada
  UPDATE obras_ruas
  SET
    status = 'finalizada',
    relatorio_diario_id = NEW.id,
    data_finalizacao = COALESCE(NEW.data_fim, NEW.data_inicio),
    metragem_executada = NEW.metragem_feita,
    toneladas_executadas = NEW.toneladas_aplicadas
  WHERE id = NEW.rua_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para finalizar rua
CREATE TRIGGER finalizar_rua_trigger
  AFTER INSERT ON relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION finalizar_rua_ao_criar_relatorio();

-- 9. View para relatórios com informações completas
CREATE OR REPLACE VIEW vw_relatorios_diarios_completo AS
SELECT
  rd.*,
  c.company_name AS cliente_nome,
  o.nome AS obra_nome,
  r.nome AS rua_nome,
  COUNT(rdm.id) AS total_maquinarios,
  COUNT(rdm.id) FILTER (WHERE rdm.is_terceiro = true) AS total_maquinarios_terceiros
FROM relatorios_diarios rd
LEFT JOIN clients c ON rd.cliente_id = c.id
LEFT JOIN obras o ON rd.obra_id = o.id
LEFT JOIN obras_ruas r ON rd.rua_id = r.id
LEFT JOIN relatorios_diarios_maquinarios rdm ON rd.id = rdm.relatorio_id
GROUP BY rd.id, c.company_name, o.nome, r.nome;

COMMENT ON VIEW vw_relatorios_diarios_completo IS 'View com relatórios diários e informações relacionadas';

