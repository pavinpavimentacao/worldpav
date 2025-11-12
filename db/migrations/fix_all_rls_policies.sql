-- =====================================================
-- FIX ALL RLS POLICIES - DESENVOLVIMENTO
-- =====================================================
-- Corrige TODAS as políticas RLS do sistema
-- Políticas SUPER PERMISSIVAS para desenvolvimento
-- =====================================================

-- =====================================================
-- 1. RELATORIOS_DIARIOS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Users can insert own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Users can update own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Admins can delete relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.relatorios_diarios;

ALTER TABLE public.relatorios_diarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON public.relatorios_diarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. RELATORIOS_DIARIOS_MAQUINARIOS
-- =====================================================

DROP POLICY IF EXISTS "Permitir tudo para autenticados - MAQUINARIOS" ON public.relatorios_diarios_maquinarios;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.relatorios_diarios_maquinarios;

ALTER TABLE public.relatorios_diarios_maquinarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON public.relatorios_diarios_maquinarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. OBRAS_FINANCEIRO_DESPESAS
-- =====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON obras_financeiro_despesas;

ALTER TABLE obras_financeiro_despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON obras_financeiro_despesas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. OBRAS_FINANCEIRO_FATURAMENTOS
-- =====================================================

DROP POLICY IF EXISTS "Usuários autenticados podem ver faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar faturamentos" ON obras_financeiro_faturamentos;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON obras_financeiro_faturamentos;

ALTER TABLE obras_financeiro_faturamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON obras_financeiro_faturamentos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. OBRAS_RUAS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company obras_ruas" ON public.obras_ruas;
DROP POLICY IF EXISTS "Users can insert own company obras_ruas" ON public.obras_ruas;
DROP POLICY IF EXISTS "Users can update own company obras_ruas" ON public.obras_ruas;
DROP POLICY IF EXISTS "Admins can delete obras_ruas" ON public.obras_ruas;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.obras_ruas;

ALTER TABLE public.obras_ruas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON public.obras_ruas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. DIARIAS_GUARDA_SEGURANCA
-- =====================================================

DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON diarias_guarda_seguranca;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON diarias_guarda_seguranca;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON diarias_guarda_seguranca;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON diarias_guarda_seguranca;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON diarias_guarda_seguranca;

ALTER TABLE diarias_guarda_seguranca ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON diarias_guarda_seguranca
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. CONTAS_PAGAR
-- =====================================================

DROP POLICY IF EXISTS "Users can view own company contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can insert own company contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can update own company contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Admins can delete contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.contas_pagar;

ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users"
  ON public.contas_pagar
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICAÇÃO GERAL
-- =====================================================

-- Listar todas as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename IN (
  'relatorios_diarios',
  'relatorios_diarios_maquinarios',
  'obras_financeiro_despesas',
  'obras_financeiro_faturamentos',
  'obras_ruas',
  'diarias_guarda_seguranca',
  'contas_pagar'
)
ORDER BY tablename, cmd;

-- Verificar quais tabelas têm RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN (
  'relatorios_diarios',
  'relatorios_diarios_maquinarios',
  'obras_financeiro_despesas',
  'obras_financeiro_faturamentos',
  'obras_ruas',
  'diarias_guarda_seguranca',
  'contas_pagar'
)
ORDER BY tablename;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
/*
Cada tabela deve ter 1 política:
- policyname: "Enable all for authenticated users"
- cmd: *
- roles: {authenticated}

E todas devem ter rowsecurity = true
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
⚠️ ATENÇÃO: Estas políticas são MUITO PERMISSIVAS!

São adequadas para DESENVOLVIMENTO e TESTES.

Para PRODUÇÃO, implemente políticas baseadas em:
1. company_id (isolamento multi-tenant)
2. user roles (permissões por função)
3. ownership (created_by)

Exemplo de política segura para produção:

CREATE POLICY "secure_insert_relatorios"
  ON public.relatorios_diarios FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );
*/

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Mensagem de sucesso
SELECT '✅ Todas as políticas RLS foram atualizadas com sucesso!' AS status;



