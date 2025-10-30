-- =====================================================
-- FIX TRIGGER - CONTROLE DIÁRIO PRESENÇAS
-- =====================================================
-- Corrige o trigger que está causando erro ao inserir presenças
-- =====================================================

-- 1. Recriar a função com SECURITY DEFINER para bypass RLS
CREATE OR REPLACE FUNCTION public.update_relacao_totals()
RETURNS TRIGGER 
SECURITY DEFINER -- Permite bypass de RLS
SET search_path = public
AS $$
BEGIN
  -- Atualizar totais na relação diária
  UPDATE public.controle_diario_relacoes
  SET 
    total_presentes = (
      SELECT COUNT(*) 
      FROM public.controle_diario_presencas 
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id) 
        AND status = 'presente'
    ),
    total_ausencias = (
      SELECT COUNT(*) 
      FROM public.controle_diario_presencas 
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id) 
        AND status != 'presente'
    ),
    total_diarias = (
      SELECT COALESCE(SUM(valor_total), 0)
      FROM public.controle_diario_diarias
      WHERE relacao_id = COALESCE(NEW.relacao_id, OLD.relacao_id)
    )
  WHERE id = COALESCE(NEW.relacao_id, OLD.relacao_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS trigger_update_relacao_totals_from_presencas ON public.controle_diario_presencas;
CREATE TRIGGER trigger_update_relacao_totals_from_presencas
  AFTER INSERT OR UPDATE OR DELETE ON public.controle_diario_presencas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_relacao_totals();

-- 3. Garantir que a tabela controle_diario_diarias existe e tem a coluna valor_total
-- (Se não existir, criar com valores padrão)
DO $$
BEGIN
  -- Verificar se a coluna existe, se não, adicionar
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'controle_diario_diarias' 
    AND column_name = 'valor_total'
  ) THEN
    -- Adicionar coluna se não existir
    ALTER TABLE public.controle_diario_diarias 
    ADD COLUMN IF NOT EXISTS valor_total DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- FIM DO SCRIPT FIX TRIGGER
-- =====================================================



