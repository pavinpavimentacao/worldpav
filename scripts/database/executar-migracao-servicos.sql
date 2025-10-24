-- Script para executar migração de serviços da obra
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela já existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'obras_servicos'
);

-- Se não existir, executar a migração
-- (Copie e cole o conteúdo do arquivo 04_obras_servicos.sql aqui)

-- Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'obras_servicos'
ORDER BY ordinal_position;

