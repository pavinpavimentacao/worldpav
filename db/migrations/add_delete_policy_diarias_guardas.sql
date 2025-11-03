-- =====================================================
-- ADICIONAR POLÍTICA DELETE PARA DIÁRIAS DE GUARDAS
-- Correção: Permitir exclusão de diárias
-- =====================================================

-- Remover política antiga se existir (para evitar erro de duplicação)
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON diarias_guarda_seguranca;

-- Adicionar política DELETE para diarias_guarda_seguranca
CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON diarias_guarda_seguranca FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Listar todas as políticas da tabela diarias_guarda_seguranca
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'diarias_guarda_seguranca'
ORDER BY cmd;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
/*
Deve mostrar 4 políticas:

1. SELECT - Permitir leitura para usuários autenticados
2. INSERT - Permitir inserção para usuários autenticados  
3. UPDATE - Permitir atualização para usuários autenticados
4. DELETE - Permitir exclusão para usuários autenticados ⬅️ NOVA

Se não aparecer a política DELETE, execute este script!
*/

