-- =====================================================
-- FIX RLS - RELATORIOS_DIARIOS
-- =====================================================
-- Políticas permissivas para desenvolvimento
-- =====================================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Users can insert own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Users can update own company relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Admins can delete relatorios_diarios" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir visualizar relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir inserir relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir atualizar relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir deletar relatórios autenticados" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Permitir tudo para autenticados - RELATORIOS" ON public.relatorios_diarios;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.relatorios_diarios;

-- 2. VERIFICAR SE RLS ESTÁ HABILITADO
ALTER TABLE public.relatorios_diarios ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICA ÚNICA SUPER PERMISSIVA

CREATE POLICY "Enable all for authenticated users"
  ON public.relatorios_diarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. APLICAR MESMA CORREÇÃO PARA TABELA DE MAQUINÁRIOS

-- Remover políticas antigas de maquinários
DROP POLICY IF EXISTS "Permitir tudo para autenticados - MAQUINARIOS" ON public.relatorios_diarios_maquinarios;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.relatorios_diarios_maquinarios;

-- Habilitar RLS
ALTER TABLE public.relatorios_diarios_maquinarios ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva
CREATE POLICY "Enable all for authenticated users"
  ON public.relatorios_diarios_maquinarios
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar políticas de relatorios_diarios
SELECT 
  'relatorios_diarios' as tabela,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'relatorios_diarios'
ORDER BY cmd;

-- Verificar políticas de relatorios_diarios_maquinarios
SELECT 
  'relatorios_diarios_maquinarios' as tabela,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'relatorios_diarios_maquinarios'
ORDER BY cmd;

-- Verificar se RLS está habilitado
SELECT 
  tablename, 
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename IN ('relatorios_diarios', 'relatorios_diarios_maquinarios')
ORDER BY tablename;

-- =====================================================
-- TESTE DE INSERÇÃO
-- =====================================================
/*
-- Descomente para testar inserção após aplicar as políticas

INSERT INTO public.relatorios_diarios (
  company_id,
  cliente_id,
  obra_id,
  rua_id,
  data_inicio,
  data_fim,
  metragem_feita,
  toneladas_aplicadas
) VALUES (
  (SELECT id FROM companies LIMIT 1),
  (SELECT id FROM clients LIMIT 1),
  (SELECT id FROM obras LIMIT 1),
  (SELECT id FROM obras_ruas LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE,
  100,
  50
) RETURNING id, numero;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
/*
⚠️ ESTAS POLÍTICAS SÃO MUITO PERMISSIVAS!

Use apenas em DESENVOLVIMENTO. Para produção, implemente:
- Verificação de company_id
- Controle de permissões por role
- Validação de ownership

Exemplo de política segura:

CREATE POLICY "Users can insert their company relatorios"
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





