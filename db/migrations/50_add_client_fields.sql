-- =====================================================
-- WORLDPAV - ADICIONAR CAMPOS FALTANTES NA TABELA CLIENTS
-- =====================================================
-- Adiciona campos para representante, empresa, tipo, área e empresa responsável
--
-- DEPENDÊNCIAS: 01_clientes.sql
-- =====================================================

-- =====================================================
-- 1. ADICIONAR CAMPOS FALTANTES
-- =====================================================

-- Adicionar campos para representante e empresa
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS representante TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS tipo_cliente TEXT,
ADD COLUMN IF NOT EXISTS area_atuacao TEXT,
ADD COLUMN IF NOT EXISTS empresa_responsavel_id UUID REFERENCES public.companies(id);

-- Comentários dos novos campos
COMMENT ON COLUMN public.clients.representante IS 'Nome do representante do cliente';
COMMENT ON COLUMN public.clients.empresa IS 'Nome da empresa do cliente';
COMMENT ON COLUMN public.clients.tipo_cliente IS 'Tipo do cliente (ex: pessoa física, jurídica)';
COMMENT ON COLUMN public.clients.area_atuacao IS 'Área de atuação do cliente';
COMMENT ON COLUMN public.clients.empresa_responsavel_id IS 'Empresa responsável por este cliente (WorldPav ou Pavin)';

-- =====================================================
-- 2. ÍNDICES PARA NOVOS CAMPOS
-- =====================================================

-- Índice para busca por representante
CREATE INDEX IF NOT EXISTS idx_clients_representante 
  ON public.clients(representante);

-- Índice para busca por empresa
CREATE INDEX IF NOT EXISTS idx_clients_empresa 
  ON public.clients(empresa);

-- Índice para busca por tipo de cliente
CREATE INDEX IF NOT EXISTS idx_clients_tipo_cliente 
  ON public.clients(tipo_cliente);

-- Índice para busca por empresa responsável
CREATE INDEX IF NOT EXISTS idx_clients_empresa_responsavel 
  ON public.clients(empresa_responsavel_id);

-- =====================================================
-- 3. ATUALIZAR DADOS EXISTENTES (SE HOUVER)
-- =====================================================

-- Se existirem clientes, vamos popular os campos básicos
UPDATE public.clients 
SET 
  representante = name,
  empresa = name,
  tipo_cliente = CASE 
    WHEN cpf_cnpj IS NOT NULL AND LENGTH(REPLACE(REPLACE(cpf_cnpj, '.', ''), '-', '')) = 11 THEN 'Pessoa Física'
    WHEN cpf_cnpj IS NOT NULL AND LENGTH(REPLACE(REPLACE(REPLACE(REPLACE(cpf_cnpj, '.', ''), '/', ''), '-', ''), ' ', '')) = 14 THEN 'Pessoa Jurídica'
    ELSE 'Não informado'
  END,
  area_atuacao = 'Não informado',
  empresa_responsavel_id = company_id
WHERE representante IS NULL;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
