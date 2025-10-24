-- Migração para adicionar coluna volume_planejamento à tabela obras
-- Arquivo: db/migrations/add_volume_planejamento_to_obras.sql

-- Adicionar coluna volume_planejamento
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS volume_planejamento DECIMAL(15,2) DEFAULT 0;

-- Adicionar coluna preco_por_m2 (caso ainda não exista)
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(15,2) DEFAULT 0;

-- Comentários nas colunas
COMMENT ON COLUMN obras.volume_planejamento IS 'Volume total planejado para a obra em m³';
COMMENT ON COLUMN obras.preco_por_m2 IS 'Preço por metro quadrado da obra';

-- Verificar se as colunas foram adicionadas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'obras' 
AND column_name IN ('volume_planejamento', 'preco_por_m2')
ORDER BY ordinal_position;

