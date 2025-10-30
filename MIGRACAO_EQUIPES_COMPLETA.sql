-- ============================================
-- MIGRAÇÃO: Sistema de Equipes
-- ============================================
-- Execute este script no Supabase SQL Editor
-- Acesse: https://supabase.com/dashboard/project/[seu-projeto]/sql

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

-- 4. Comentários
COMMENT ON TABLE public.equipes IS 'Equipes da empresa - criadas e gerenciadas pelo usuário';
COMMENT ON COLUMN public.equipes.company_id IS 'Empresa da equipe (multi-tenant)';
COMMENT ON COLUMN public.equipes.name IS 'Nome da equipe';
COMMENT ON COLUMN public.equipes.prefixo IS 'Prefix da equipe (ex: EQUIP-01)';
COMMENT ON COLUMN public.equipes.descricao IS 'Descrição da equipe';
COMMENT ON COLUMN public.equipes.ativo IS 'Se a equipe está ativa';
COMMENT ON COLUMN public.colaboradores.equipe_id IS 'Equipe do colaborador';

-- 5. Criar equipes baseadas nos tipos existentes
INSERT INTO public.equipes (company_id, name, prefixo, descricao, ativo)
SELECT DISTINCT
  c.company_id,
  CASE 
    WHEN c.tipo_equipe::text = 'pavimentacao' THEN 'Equipe de Pavimentação'
    WHEN c.tipo_equipe::text = 'maquinas' THEN 'Equipe de Máquinas'
    WHEN c.tipo_equipe::text = 'apoio' THEN 'Equipe de Apoio'
    ELSE 'Outros'
  END as name,
  UPPER(LEFT(c.tipo_equipe::text, 3)) as prefixo,
  'Equipe criada automaticamente na migração' as descricao,
  true as ativo
FROM public.colaboradores c
WHERE c.tipo_equipe IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.equipes e 
    WHERE e.company_id = c.company_id 
      AND e.name = CASE 
        WHEN c.tipo_equipe::text = 'pavimentacao' THEN 'Equipe de Pavimentação'
        WHEN c.tipo_equipe::text = 'maquinas' THEN 'Equipe de Máquinas'
        WHEN c.tipo_equipe::text = 'apoio' THEN 'Equipe de Apoio'
        ELSE 'Outros'
      END
  );

-- 6. Vincular colaboradores às equipes
UPDATE public.colaboradores c
SET equipe_id = e.id
FROM public.equipes e
WHERE e.company_id = c.company_id
  AND e.name = CASE 
    WHEN c.tipo_equipe::text = 'pavimentacao' THEN 'Equipe de Pavimentação'
    WHEN c.tipo_equipe::text = 'maquinas' THEN 'Equipe de Máquinas'
    WHEN c.tipo_equipe::text = 'apoio' THEN 'Equipe de Apoio'
    ELSE 'Outros'
  END;

-- 7. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_equipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'equipes_updated_at_trigger'
  ) THEN
    CREATE TRIGGER equipes_updated_at_trigger
      BEFORE UPDATE ON public.equipes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_equipes_updated_at();
  END IF;
END $$;

-- 8. Verificar resultado
SELECT 
  'Equipes criadas' as status,
  COUNT(*) as quantidade
FROM public.equipes;

SELECT 
  'Colaboradores vinculados' as status,
  COUNT(*) as quantidade
FROM public.colaboradores 
WHERE equipe_id IS NOT NULL;

-- 9. Mostrar equipes criadas
SELECT 
  e.name as equipe_nome,
  e.prefixo,
  COUNT(c.id) as colaboradores_vinculados
FROM public.equipes e
LEFT JOIN public.colaboradores c ON c.equipe_id::text = e.id::text
GROUP BY e.id, e.name, e.prefixo
ORDER BY e.name;
