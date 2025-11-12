-- =====================================================
-- FIX RLS ULTRA PERMISSIVO - OBRAS_FINANCEIRO_DESPESAS
-- =====================================================
-- Políticas extremamente permissivas para desenvolvimento
-- =====================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE (se necessário para testes)
-- ALTER TABLE obras_financeiro_despesas DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON obras_financeiro_despesas;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON obras_financeiro_despesas;

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE obras_financeiro_despesas ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS SUPER PERMISSIVAS

-- Política SELECT - permite tudo
CREATE POLICY "Enable read access for all authenticated users"
  ON obras_financeiro_despesas FOR SELECT
  USING (true);

-- Política INSERT - permite tudo (SEM restrições no WITH CHECK)
CREATE POLICY "Enable insert for all authenticated users"
  ON obras_financeiro_despesas FOR INSERT
  WITH CHECK (true);

-- Política UPDATE - permite tudo
CREATE POLICY "Enable update for all authenticated users"
  ON obras_financeiro_despesas FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política DELETE - permite tudo
CREATE POLICY "Enable delete for all authenticated users"
  ON obras_financeiro_despesas FOR DELETE
  USING (true);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Listar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'obras_financeiro_despesas'
ORDER BY cmd;

-- Verificar se RLS está habilitado
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'obras_financeiro_despesas';

-- =====================================================
-- TESTE DE INSERÇÃO
-- =====================================================

-- Testar inserção simples (descomente para testar)
/*
INSERT INTO obras_financeiro_despesas (
  obra_id,
  categoria,
  descricao,
  valor,
  data_lancamento
) VALUES (
  (SELECT id FROM obras LIMIT 1), -- Primeira obra disponível
  'Teste',
  'Teste de inserção RLS',
  100.00,
  CURRENT_DATE
) RETURNING *;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
⚠️ ATENÇÃO: Estas políticas são MUITO PERMISSIVAS e devem ser usadas 
apenas em DESENVOLVIMENTO. 

Para PRODUÇÃO, você deve implementar políticas baseadas em:
- company_id (multi-tenancy)
- user roles (admin, manager, user)
- ownership (created_by)

Exemplo de política segura para produção:

CREATE POLICY "Users can insert their company despesas"
  ON obras_financeiro_despesas FOR INSERT
  WITH CHECK (
    obra_id IN (
      SELECT id FROM obras WHERE company_id = auth.jwt()->>'company_id'
    )
  );
*/



