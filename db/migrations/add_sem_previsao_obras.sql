-- Script de migração para adicionar campos 'sem_previsao_volume', 'sem_previsao_ruas' e 'sem_previsao_toneladas' na tabela de obras
-- Autor: Sistema
-- Data: 2025-10-16
-- Descrição: Adiciona a funcionalidade de obras sem previsão de volume, ruas e/ou toneladas definidas de forma independente

-- Adicionar coluna 'sem_previsao_volume' na tabela 'obras'
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS sem_previsao_volume BOOLEAN DEFAULT FALSE;

-- Adicionar coluna 'sem_previsao_ruas' na tabela 'obras'
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS sem_previsao_ruas BOOLEAN DEFAULT FALSE;

-- Adicionar coluna 'sem_previsao_toneladas' na tabela 'obras'
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS sem_previsao_toneladas BOOLEAN DEFAULT FALSE;

-- Adicionar coluna 'toneladas_previstas' na tabela 'obras'
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS toneladas_previstas DECIMAL(10, 2);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN obras.sem_previsao_volume IS 'Indica se a obra não possui previsão de volume total definido no momento da criação';
COMMENT ON COLUMN obras.sem_previsao_ruas IS 'Indica se a obra não possui previsão de total de ruas definido no momento da criação';
COMMENT ON COLUMN obras.sem_previsao_toneladas IS 'Indica se a obra não possui previsão de toneladas definido no momento da criação';
COMMENT ON COLUMN obras.toneladas_previstas IS 'Quantidade de toneladas previstas para a obra (opcional)';

-- Alterar a coluna volume_total_previsto para aceitar NULL
ALTER TABLE obras
ALTER COLUMN volume_total_previsto DROP NOT NULL;

-- Alterar a coluna total_ruas para aceitar NULL
ALTER TABLE obras
ALTER COLUMN total_ruas DROP NOT NULL;

-- Criar índices para melhorar performance nas consultas por obras sem previsão
CREATE INDEX IF NOT EXISTS idx_obras_sem_previsao_volume ON obras(sem_previsao_volume);
CREATE INDEX IF NOT EXISTS idx_obras_sem_previsao_ruas ON obras(sem_previsao_ruas);
CREATE INDEX IF NOT EXISTS idx_obras_sem_previsao_toneladas ON obras(sem_previsao_toneladas);

-- Atualizar obras existentes que possuem valores zerados como "sem previsão"
-- (Apenas se houver obras já cadastradas com valores zerados que deveriam ser "sem previsão")
-- UPDATE obras
-- SET sem_previsao_volume = TRUE
-- WHERE volume_total_previsto = 0 OR volume_total_previsto IS NULL;

-- UPDATE obras
-- SET sem_previsao_ruas = TRUE
-- WHERE total_ruas = 0 OR total_ruas IS NULL;

-- UPDATE obras
-- SET sem_previsao_toneladas = TRUE
-- WHERE toneladas_previstas = 0 OR toneladas_previstas IS NULL;

-- Nota: As linhas acima estão comentadas. Execute apenas se necessário atualizar obras existentes.

