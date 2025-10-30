# 🎯 Sistema de Equipes - Aplicar Migração

## 📋 Passo a Passo

### 1. Aplicar a Migração SQL

Copie e cole o seguinte SQL no **Supabase SQL Editor**:

```sql
-- ============================================
-- Criação da Tabela EQUIPES
-- ============================================

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

-- 3. Criar índice para performance
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

-- 5. Migração de dados existentes
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'tipo_equipe'
  ) THEN
    -- Criar equipes baseadas nos tipos existentes
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
    
    -- Vincular colaboradores às equipes
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
    
    RAISE NOTICE 'Migração concluída! Colaboradores vinculados às equipes criadas.';
  END IF;
END $$;

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_equipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS equipes_updated_at_trigger ON public.equipes;
CREATE TRIGGER equipes_updated_at_trigger
  BEFORE UPDATE ON public.equipes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_equipes_updated_at();
```

### 2. Verificar Resultado

Após aplicar, a tabela `equipes` estará criada e terá migrado seus colaboradores automaticamente!

### 3. Usar o Sistema

Agora você pode:
- ✅ Acessar **Equipes** no sidebar
- ✅ Criar equipes customizadas
- ✅ Vincular colaboradores às equipes
- ✅ Usar equipes na programação



