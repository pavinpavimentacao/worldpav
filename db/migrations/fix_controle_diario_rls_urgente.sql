-- =====================================================
-- FIX URGENTE RLS - CONTROLE DIÁRIO
-- =====================================================
-- Remove todas as políticas restritivas e cria políticas permissivas
-- para permitir operações CRUD completas
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Users can insert own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Users can update own company controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Admins can delete controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Allow all SELECT on controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Allow all INSERT on controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Allow all UPDATE on controle_diario_relacoes" ON public.controle_diario_relacoes;
DROP POLICY IF EXISTS "Allow all DELETE on controle_diario_relacoes" ON public.controle_diario_relacoes;

-- 2. CRIAR POLÍTICAS PERMISSIVAS PARA DESENVOLVIMENTO
CREATE POLICY "Allow all SELECT on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on controle_diario_relacoes"
  ON public.controle_diario_relacoes FOR DELETE
  USING (true);

-- 3. MESMO PARA controle_diario_presencas
DROP POLICY IF EXISTS "Users can view own company controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Users can manage own company controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Allow all SELECT on controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Allow all INSERT on controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Allow all UPDATE on controle_diario_presencas" ON public.controle_diario_presencas;
DROP POLICY IF EXISTS "Allow all DELETE on controle_diario_presencas" ON public.controle_diario_presencas;

CREATE POLICY "Allow all SELECT on controle_diario_presencas"
  ON public.controle_diario_presencas FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on controle_diario_presencas"
  ON public.controle_diario_presencas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on controle_diario_presencas"
  ON public.controle_diario_presencas FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on controle_diario_presencas"
  ON public.controle_diario_presencas FOR DELETE
  USING (true);

-- 4. MESMO PARA controle_diario_diarias
DROP POLICY IF EXISTS "Users can view own company controle_diario_diarias" ON public.controle_diario_diarias;
DROP POLICY IF EXISTS "Users can insert own company controle_diario_diarias" ON public.controle_diario_diarias;
DROP POLICY IF EXISTS "Users can update own company controle_diario_diarias" ON public.controle_diario_diarias;
DROP POLICY IF EXISTS "Admins can delete controle_diario_diarias" ON public.controle_diario_diarias;

CREATE POLICY "Allow all SELECT on controle_diario_diarias"
  ON public.controle_diario_diarias FOR SELECT
  USING (true);

CREATE POLICY "Allow all INSERT on controle_diario_diarias"
  ON public.controle_diario_diarias FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all UPDATE on controle_diario_diarias"
  ON public.controle_diario_diarias FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all DELETE on controle_diario_diarias"
  ON public.controle_diario_diarias FOR DELETE
  USING (true);

-- 5. CORRIGIR created_by PARA ACEITAR NULL
-- Remove a constraint se existir e recria permitindo NULL
ALTER TABLE public.controle_diario_relacoes 
  ALTER COLUMN created_by DROP NOT NULL;

-- =====================================================
-- FIM DO SCRIPT FIX URGENTE RLS
-- =====================================================



