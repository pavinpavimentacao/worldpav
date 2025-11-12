-- =====================================================
-- FIX RLS - OBRAS_FINANCEIRO_DESPESAS
-- =====================================================
-- Remove e recria as políticas RLS para permitir operações CRUD
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas;

-- 2. RECRIAR POLÍTICAS PERMISSIVAS

-- SELECT - Permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver despesas"
  ON obras_financeiro_despesas FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT - Permitir inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir despesas"
  ON obras_financeiro_despesas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE - Permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar despesas"
  ON obras_financeiro_despesas FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE - Permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar despesas"
  ON obras_financeiro_despesas FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Listar todas as políticas da tabela obras_financeiro_despesas
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'obras_financeiro_despesas'
ORDER BY cmd;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
/*
Deve mostrar 4 políticas:

1. DELETE - Usuários autenticados podem deletar despesas
2. INSERT - Usuários autenticados podem inserir despesas  
3. SELECT - Usuários autenticados podem ver despesas
4. UPDATE - Usuários autenticados podem atualizar despesas

Todas com: qual = (auth.role() = 'authenticated'::text)
*/

-- =====================================================
-- FIM DO SCRIPT FIX RLS
-- =====================================================



