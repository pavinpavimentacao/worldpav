-- Script para executar migrações de serviços
-- Execute este script no Supabase SQL Editor

-- Verificar se as tabelas já existem
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'obras_servicos'
) AS obras_servicos_existe,
EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'servicos_catalogo'
) AS servicos_catalogo_existe;

-- Executar migração de obras_servicos se não existir
-- (Copie e cole o conteúdo do arquivo 04_obras_servicos.sql aqui)

-- Executar migração de servicos_catalogo se não existir
-- (Copie e cole o conteúdo do arquivo 05_servicos_catalogo.sql aqui)

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  COUNT(*) AS total_colunas
FROM information_schema.columns 
WHERE table_name IN ('obras_servicos', 'servicos_catalogo')
AND table_schema = 'public'
GROUP BY table_name;

-- Verificar serviços no catálogo
SELECT id, nome, tipo, unidade_padrao, preco_base, ativo
FROM servicos_catalogo
ORDER BY nome;

