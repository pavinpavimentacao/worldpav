import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqcWoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTQ5MjAwMCwiZXhwIjoxOTU1MDY4MDAwfQ.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Aplicando migração da tabela equipes...\n');
  
  try {
    // SQL da migração
    const migrationSQL = `
-- 1. Criar tabela de equipes
CREATE TABLE IF NOT EXISTS public.equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prefixo TEXT,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT equipes_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 2. Adicionar coluna equipe_id em colaboradores se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'equipe_id'
  ) THEN
    ALTER TABLE public.colaboradores
    ADD COLUMN equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_equipe_id ON public.colaboradores(equipe_id);
CREATE INDEX IF NOT EXISTS idx_equipes_company_id ON public.equipes(company_id);
CREATE INDEX IF NOT EXISTS idx_equipes_ativo ON public.equipes(ativo);
CREATE INDEX IF NOT EXISTS idx_equipes_deleted_at ON public.equipes(deleted_at);

-- 4. Criar equipes de exemplo
INSERT INTO public.equipes (company_id, name, prefixo, descricao, ativo)
VALUES 
  ('39cf8b61-6737-4aa5-af3f-51fba9f12345', 'Equipe de Pavimentação', 'PAV', 'Equipe responsável pela pavimentação', true),
  ('39cf8b61-6737-4aa5-af3f-51fba9f12345', 'Equipe de Máquinas', 'MAQ', 'Equipe responsável pelos equipamentos', true),
  ('39cf8b61-6737-4aa5-af3f-51fba9f12345', 'Equipe de Apoio', 'APO', 'Equipe de apoio geral', true)
ON CONFLICT DO NOTHING;

-- 5. Vincular colaboradores existentes às equipes
UPDATE public.colaboradores 
SET equipe_id = (
  SELECT id FROM public.equipes 
  WHERE company_id = colaboradores.company_id 
  AND name = CASE 
    WHEN colaboradores.tipo_equipe::text = 'pavimentacao' THEN 'Equipe de Pavimentação'
    WHEN colaboradores.tipo_equipe::text = 'maquinas' THEN 'Equipe de Máquinas'
    WHEN colaboradores.tipo_equipe::text = 'apoio' THEN 'Equipe de Apoio'
    ELSE 'Equipe de Pavimentação'
  END
  LIMIT 1
)
WHERE equipe_id IS NULL AND tipo_equipe IS NOT NULL;

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_equipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipes_updated_at_trigger
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_equipes_updated_at();
`;

    console.log('📝 Executando migração SQL...');
    
    // Executar a migração usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      
      // Tentar executar partes da migração separadamente
      console.log('🔄 Tentando executar migração em partes...');
      
      // 1. Criar tabela
      const { error: createError } = await supabase
        .from('equipes')
        .select('id')
        .limit(1);
        
      if (createError && createError.message.includes('relation "equipes" does not exist')) {
        console.log('📋 Tabela equipes não existe. Execute a migração SQL manualmente no Supabase.');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql');
        console.log('\n📄 SQL para copiar e colar:');
        console.log(migrationSQL);
      }
    } else {
      console.log('✅ Migração executada com sucesso!');
    }
    
    // Verificar se funcionou
    console.log('\n🔍 Verificando resultado...');
    const { data: equipes, error: checkError } = await supabase
      .from('equipes')
      .select('*');
      
    if (checkError) {
      console.error('❌ Erro ao verificar equipes:', checkError.message);
    } else {
      console.log(`✅ Equipes encontradas: ${equipes?.length || 0}`);
      if (equipes && equipes.length > 0) {
        equipes.forEach((eq, i) => {
          console.log(`   ${i + 1}. ${eq.name} (ID: ${eq.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

applyMigration();


