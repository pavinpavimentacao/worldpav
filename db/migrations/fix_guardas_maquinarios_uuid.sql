/**
 * FIX: Corrigir tipo de maquinario_id para UUID
 * Remove dados inválidos e altera a coluna
 */

-- 1. Remover todos os registros da tabela diarias_seguranca_maquinarios
-- (necessário pois contém IDs no formato TEXT que não são UUID)
TRUNCATE TABLE diarias_seguranca_maquinarios CASCADE;

-- 2. Alterar o tipo da coluna para UUID
ALTER TABLE diarias_seguranca_maquinarios 
  ALTER COLUMN maquinario_id TYPE UUID USING maquinario_id::UUID;

-- 3. Adicionar foreign key para maquinarios
ALTER TABLE diarias_seguranca_maquinarios
  DROP CONSTRAINT IF EXISTS diarias_seguranca_maquinarios_maquinario_id_fkey;

ALTER TABLE diarias_seguranca_maquinarios
  ADD CONSTRAINT diarias_seguranca_maquinarios_maquinario_id_fkey
  FOREIGN KEY (maquinario_id) REFERENCES public.maquinarios(id) ON DELETE CASCADE;

-- 4. Remover a coluna antiga "rua" (que tinha NOT NULL constraint)
ALTER TABLE diarias_guarda_seguranca 
  DROP COLUMN IF EXISTS rua;

-- 5. Adicionar as novas colunas obra, rua e rua_nome
ALTER TABLE diarias_guarda_seguranca 
  ADD COLUMN IF NOT EXISTS obra_id UUID,
  ADD COLUMN IF NOT EXISTS rua_id UUID,
  ADD COLUMN IF NOT EXISTS rua_nome TEXT;

-- 6. Adicionar foreign keys
DO $$ 
BEGIN
  -- FK para obras
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'diarias_guarda_seguranca_obra_id_fkey'
  ) THEN
    ALTER TABLE diarias_guarda_seguranca
      ADD CONSTRAINT diarias_guarda_seguranca_obra_id_fkey
      FOREIGN KEY (obra_id) REFERENCES public.obras(id) ON DELETE SET NULL;
  END IF;

  -- FK para obras_ruas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'diarias_guarda_seguranca_rua_id_fkey'
  ) THEN
    ALTER TABLE diarias_guarda_seguranca
      ADD CONSTRAINT diarias_guarda_seguranca_rua_id_fkey
      FOREIGN KEY (rua_id) REFERENCES public.obras_ruas(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. Criar índices
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_obra_id ON diarias_guarda_seguranca(obra_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_rua_id ON diarias_guarda_seguranca(rua_id);

-- 8. Comentários
COMMENT ON COLUMN diarias_guarda_seguranca.obra_id IS 'Obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_id IS 'Rua da obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_nome IS 'Nome da rua (preenchido automaticamente se rua_id estiver definido)';

-- Sucesso!
SELECT 'Tabelas atualizadas com sucesso!' as message;

