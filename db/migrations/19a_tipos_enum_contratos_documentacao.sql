-- =====================================================
-- WORLDPAV - ADICIONAR TIPOS ENUM PARA CONTRATOS E DOCUMENTAÇÃO
-- =====================================================
-- Adiciona tipos ENUM necessários para contratos e documentação
--
-- DEPENDÊNCIAS: 
-- - 00_foundation.sql
-- =====================================================

-- =====================================================
-- 1. TIPOS ENUM PARA CONTRATOS
-- =====================================================

-- Tipo de contrato
CREATE TYPE contrato_type AS ENUM (
  'contrato',
  'proposta',
  'termo',
  'aditivo'
);

-- Status de contrato
CREATE TYPE contrato_status AS ENUM (
  'ativo',
  'vencido',
  'cancelado'
);

-- =====================================================
-- 2. TIPOS ENUM PARA DOCUMENTAÇÃO
-- =====================================================

-- Tipo de documentação
CREATE TYPE documentacao_type AS ENUM (
  'nrs',
  'licenca',
  'certificado',
  'outros'
);

-- Status de documentação
CREATE TYPE documentacao_status AS ENUM (
  'ativo',
  'vencido',
  'proximo_vencimento'
);

-- =====================================================
-- 3. COMENTÁRIOS DOS TIPOS
-- =====================================================

COMMENT ON TYPE contrato_type IS 'Tipos de contrato: contrato, proposta, termo, aditivo';
COMMENT ON TYPE contrato_status IS 'Status de contrato: ativo, vencido, cancelado';
COMMENT ON TYPE documentacao_type IS 'Tipos de documentação: nrs, licenca, certificado, outros';
COMMENT ON TYPE documentacao_status IS 'Status de documentação: ativo, vencido, proximo_vencimento';

-- =====================================================
-- FIM DO SCRIPT TIPOS ENUM
-- =====================================================
