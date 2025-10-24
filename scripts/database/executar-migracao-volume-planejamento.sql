-- Script para executar a migração que adiciona volume_planejamento à tabela obras
-- Arquivo: scripts/executar-migracao-volume-planejamento.sql

-- Importar o arquivo de migração
\ir ../db/migrations/add_volume_planejamento_to_obras.sql

-- Mensagem de confirmação
SELECT 'Migração para adicionar volume_planejamento à tabela obras executada com sucesso!' as mensagem;

