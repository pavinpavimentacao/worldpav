-- =====================================================
-- FIX: RLS e Criação de Tabelas Faltantes
-- =====================================================
-- Corrige RLS para permitir testes
-- Cria tabela relatorios_diarios_maquinarios que está faltando
-- =====================================================

-- 1. Criar tabela de maquinários (se não existir)
CREATE TABLE IF NOT EXISTS public.relatorios_diarios_maquinarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relatorio_id UUID NOT NULL REFERENCES public.relatorios_diarios(id) ON DELETE CASCADE,
  maquinario_id UUID, -- ID do maquinário próprio OU parceiro_maquinario_id
  is_terceiro BOOLEAN DEFAULT false,
  parceiro_id UUID, -- Se for terceiro, qual parceiro (pode ser NULL se tabela não existir)
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.relatorios_diarios_maquinarios IS 'Vinculação de maquinários (próprios ou terceiros) aos relatórios diários';

-- Índices para relatorios_diarios_maquinarios
CREATE INDEX IF NOT EXISTS idx_rdm_relatorio ON public.relatorios_diarios_maquinarios(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_rdm_maquinario ON public.relatorios_diarios_maquinarios(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_rdm_terceiro ON public.relatorios_diarios_maquinarios(is_terceiro);

-- 2. Adicionar colunas em obras_ruas (se não existirem)
ALTER TABLE public.obras_ruas ADD COLUMN IF NOT EXISTS relatorio_diario_id UUID;
ALTER TABLE public.obras_ruas ADD COLUMN IF NOT EXISTS data_finalizacao DATE;
ALTER TABLE public.obras_ruas ADD COLUMN IF NOT EXISTS metragem_executada DECIMAL(10,2);
ALTER TABLE public.obras_ruas ADD COLUMN IF NOT EXISTS toneladas_executadas DECIMAL(10,2);

COMMENT ON COLUMN public.obras_ruas.relatorio_diario_id IS 'Relatório diário que finalizou esta rua';
COMMENT ON COLUMN public.obras_ruas.data_finalizacao IS 'Data em que a rua foi finalizada';
COMMENT ON COLUMN public.obras_ruas.metragem_executada IS 'Metragem real executada (m²)';
COMMENT ON COLUMN public.obras_ruas.toneladas_executadas IS 'Toneladas reais aplicadas';

-- Índice para busca por relatório em obras_ruas
CREATE INDEX IF NOT EXISTS idx_obras_ruas_relatorio ON public.obras_ruas(relatorio_diario_id);

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE public.relatorios_diarios_maquinarios ENABLE ROW LEVEL SECURITY;

-- 4. Policies mais permissivas para TESTS (ajuste depois!)
-- Relatórios Diários
DROP POLICY IF EXISTS "Permitir visualizar relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir inserir relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir atualizar relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir deletar relatórios autenticados" ON public.relatorios_diarios;

CREATE POLICY "Permitir tudo para autenticados - RELATORIOS" ON public.relatorios_diarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Maquinários de Relatórios
CREATE POLICY "Permitir tudo para autenticados - MAQUINARIOS" ON public.relatorios_diarios_maquinarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Função para calcular espessura automaticamente
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
DROP TRIGGER IF EXISTS calcular_espessura_relatorio_trigger ON public.relatorios_diarios;
CREATE TRIGGER calcular_espessura_relatorio_trigger
  BEFORE INSERT OR UPDATE OF metragem_feita, toneladas_aplicadas
  ON public.relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION calcular_espessura_relatorio();

-- 6. Função para finalizar rua automaticamente ao criar relatório
CREATE OR REPLACE FUNCTION finalizar_rua_ao_criar_relatorio()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar rua para concluida SE rua_id foi fornecido
  IF NEW.rua_id IS NOT NULL THEN
    UPDATE public.obras_ruas
    SET
      status = 'concluida', -- Valor correto para o enum status_rua
      relatorio_diario_id = NEW.id,
      data_finalizacao = COALESCE(NEW.data_fim, NEW.data_inicio),
      metragem_executada = NEW.metragem_feita,
      toneladas_executadas = NEW.toneladas_aplicadas
    WHERE id = NEW.rua_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para finalizar rua
DROP TRIGGER IF EXISTS finalizar_rua_trigger ON public.relatorios_diarios;
CREATE TRIGGER finalizar_rua_trigger
  AFTER INSERT ON public.relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION finalizar_rua_ao_criar_relatorio();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

