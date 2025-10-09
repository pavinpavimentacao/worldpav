-- =====================================================
-- PROGRAMAÇÃO DE PAVIMENTAÇÃO - SCHEMA
-- =====================================================
-- Este script cria a estrutura para gerenciar programações
-- de pavimentação com todos os campos necessários.
--
-- EXECUTAR ESTE SCRIPT MANUALMENTE NO SUPABASE
-- quando estiver pronto para integrar com o banco de dados.
-- =====================================================

-- 1. Criar tabela de programação de pavimentação
CREATE TABLE IF NOT EXISTS public.programacao_pavimentacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dados da Obra
  data DATE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT, -- Redundante para performance em queries
  obra TEXT NOT NULL,
  rua TEXT NOT NULL,
  
  -- Equipe e Maquinários
  prefixo_equipe TEXT NOT NULL,
  maquinarios UUID[] NOT NULL, -- Array de IDs dos maquinários
  maquinarios_nomes TEXT[], -- Array de nomes para cache
  
  -- Metragem e Produção
  metragem_prevista DECIMAL(10,2) NOT NULL CHECK (metragem_prevista > 0),
  quantidade_toneladas DECIMAL(10,2) NOT NULL CHECK (quantidade_toneladas > 0),
  faixa_realizar TEXT NOT NULL,
  
  -- Dados Adicionais (opcionais)
  horario_inicio TIME,
  observacoes TEXT,
  tipo_servico TEXT,
  espessura TEXT,
  
  -- Controle
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT programacao_pav_metragem_positiva CHECK (metragem_prevista > 0),
  CONSTRAINT programacao_pav_toneladas_positiva CHECK (quantidade_toneladas > 0),
  CONSTRAINT programacao_pav_data_futura CHECK (data >= CURRENT_DATE - INTERVAL '30 days')
);

-- 2. Comentários para documentação
COMMENT ON TABLE public.programacao_pavimentacao IS 'Tabela para gerenciar programações de pavimentação';
COMMENT ON COLUMN public.programacao_pavimentacao.data IS 'Data da programação';
COMMENT ON COLUMN public.programacao_pavimentacao.cliente_id IS 'Referência ao cliente';
COMMENT ON COLUMN public.programacao_pavimentacao.obra IS 'Nome da obra a ser realizada';
COMMENT ON COLUMN public.programacao_pavimentacao.rua IS 'Endereço completo da rua';
COMMENT ON COLUMN public.programacao_pavimentacao.prefixo_equipe IS 'Identificação da equipe (ex: Equipe A, Equipe 01)';
COMMENT ON COLUMN public.programacao_pavimentacao.maquinarios IS 'Array de UUIDs dos maquinários utilizados';
COMMENT ON COLUMN public.programacao_pavimentacao.metragem_prevista IS 'Metragem prevista em m²';
COMMENT ON COLUMN public.programacao_pavimentacao.quantidade_toneladas IS 'Quantidade de toneladas programada';
COMMENT ON COLUMN public.programacao_pavimentacao.faixa_realizar IS 'Faixa de trabalho a ser realizada';

-- 3. Índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_programacao_pav_data 
  ON public.programacao_pavimentacao(data DESC);

CREATE INDEX IF NOT EXISTS idx_programacao_pav_cliente 
  ON public.programacao_pavimentacao(cliente_id);

CREATE INDEX IF NOT EXISTS idx_programacao_pav_company 
  ON public.programacao_pavimentacao(company_id);

CREATE INDEX IF NOT EXISTS idx_programacao_pav_prefixo_equipe 
  ON public.programacao_pavimentacao(prefixo_equipe);

CREATE INDEX IF NOT EXISTS idx_programacao_pav_tipo_servico 
  ON public.programacao_pavimentacao(tipo_servico);

-- Índice composto para queries comuns (por company e data)
CREATE INDEX IF NOT EXISTS idx_programacao_pav_company_data 
  ON public.programacao_pavimentacao(company_id, data DESC);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_programacao_pav_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_programacao_pav_updated_at
  BEFORE UPDATE ON public.programacao_pavimentacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_programacao_pav_updated_at();

-- 5. Trigger para atualizar cliente_nome automaticamente
CREATE OR REPLACE FUNCTION public.sync_programacao_pav_cliente_nome()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cliente_id IS NOT NULL THEN
    SELECT name INTO NEW.cliente_nome
    FROM public.clientes
    WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_programacao_pav_cliente_nome
  BEFORE INSERT OR UPDATE OF cliente_id ON public.programacao_pavimentacao
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_programacao_pav_cliente_nome();

-- 6. Row Level Security (RLS)
ALTER TABLE public.programacao_pavimentacao ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários só veem programações da própria empresa
CREATE POLICY "Users can view own company programacao_pavimentacao"
  ON public.programacao_pavimentacao
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem inserir programações na própria empresa
CREATE POLICY "Users can insert own company programacao_pavimentacao"
  ON public.programacao_pavimentacao
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem atualizar programações da própria empresa
CREATE POLICY "Users can update own company programacao_pavimentacao"
  ON public.programacao_pavimentacao
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy: Usuários podem deletar programações da própria empresa
CREATE POLICY "Users can delete own company programacao_pavimentacao"
  ON public.programacao_pavimentacao
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- 7. Dados de exemplo (opcional - remover em produção)
-- Descomentar caso queira inserir dados de teste
/*
INSERT INTO public.programacao_pavimentacao (
  data,
  cliente_id,
  cliente_nome,
  obra,
  rua,
  prefixo_equipe,
  maquinarios,
  metragem_prevista,
  quantidade_toneladas,
  faixa_realizar,
  horario_inicio,
  tipo_servico,
  espessura,
  observacoes,
  company_id
) VALUES (
  CURRENT_DATE + 1,
  (SELECT id FROM public.clientes LIMIT 1),
  'Cliente Exemplo',
  'Pavimentação Av. Exemplo',
  'Av. Exemplo, entre Rua A e Rua B',
  'Equipe A',
  ARRAY[(SELECT id FROM public.maquinarios LIMIT 1)]::UUID[],
  2500.00,
  150.00,
  'Faixa 1 e 2',
  '07:00',
  'CBUQ',
  '5cm',
  'Programação de teste',
  (SELECT id FROM public.companies LIMIT 1)
);
*/

-- =====================================================
-- VERIFICAÇÕES PÓS-INSTALAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'programacao_pavimentacao';

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'programacao_pavimentacao';

-- Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'programacao_pavimentacao';

-- =====================================================
-- SCRIPT FINALIZADO
-- =====================================================
-- Para executar este script:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute
-- 5. Verifique os resultados nas queries de verificação
-- =====================================================

