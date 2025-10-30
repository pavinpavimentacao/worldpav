-- =====================================================
-- FIX RLS - CONTROLE DIÁRIO
-- =====================================================
-- Corrige políticas RLS para permitir inserção de relações diárias
-- =====================================================

-- Remover políticas antigas que dependem de get_user_company_id()
DROP POLICY IF EXISTS "Users can view own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Users can insert own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Users can update own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Admins can delete controle_diario_relacoes" ON public.controle_diario_relacoes;

-- Políticas mais permissivas para desenvolvimento
CREATE POLICY "Allow all SELECT on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR UPDATE
  USING (true);

CREATE POLICY "Allow all DELETE on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR DELETE
  USING (true);

-- RLS para controle_diario_presencas
DROP POLICY IF EXISTS "Users can view own company controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Users can manage own company controle_diario_presencas" ON public.controle_diario_presencas;

CREATE POLICY "Allow all SELECT on controle_diario_presencas"
  ON public.controle_diario_presencas FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on controle_diario_presencas"
  ON public.controle_diario_presencas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on controle_diario_presencas"
  ON public.controle_diario_presencas FOR UPDATE
  USING (true);

CREATE POLICY "Allow all DELETE on controle_diario_presencas"
  ON public.controle_diario_presencas FOR DELETE
  USING (true);

-- =====================================================
-- FIM DO SCRIPT FIX RLS
-- =====================================================


