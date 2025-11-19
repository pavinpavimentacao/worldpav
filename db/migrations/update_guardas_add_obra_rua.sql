/**
 * UPDATE: Adicionar obra_id e rua_id nas diárias de guardas
 * Executar após create_guardas_sistema.sql se já foi executado
 */

-- Adicionar colunas na tabela diarias_guarda_seguranca
ALTER TABLE diarias_guarda_seguranca 
  ADD COLUMN IF NOT EXISTS obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rua_id UUID REFERENCES public.obras_ruas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rua_nome TEXT;

-- Atualizar maquinario_id para UUID se ainda for TEXT
-- NOTA: Isso só funciona se a tabela estiver vazia ou se todos os IDs forem UUID válidos
ALTER TABLE diarias_seguranca_maquinarios 
  ALTER COLUMN maquinario_id TYPE UUID USING maquinario_id::UUID;

-- Adicionar foreign key para maquinarios se ainda não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'diarias_seguranca_maquinarios_maquinario_id_fkey'
  ) THEN
    ALTER TABLE diarias_seguranca_maquinarios
      ADD CONSTRAINT diarias_seguranca_maquinarios_maquinario_id_fkey
      FOREIGN KEY (maquinario_id) REFERENCES public.maquinarios(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Criar índices se ainda não existirem
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_obra_id ON diarias_guarda_seguranca(obra_id);
CREATE INDEX IF NOT EXISTS idx_diarias_guarda_seguranca_rua_id ON diarias_guarda_seguranca(rua_id);

-- Comentários
COMMENT ON COLUMN diarias_guarda_seguranca.obra_id IS 'Obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_id IS 'Rua da obra onde a diária ocorreu (opcional)';
COMMENT ON COLUMN diarias_guarda_seguranca.rua_nome IS 'Nome da rua (preenchido automaticamente se rua_id estiver definido)';





