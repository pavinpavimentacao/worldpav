# Instruções para Corrigir RLS de Funções

## Problema
A política RLS está bloqueando a inserção de funções mesmo quando o usuário está autenticado e o `company_id` é válido.

## Solução

Execute a migration `20a_fix_funcoes_rls.sql` no Supabase SQL Editor:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `db/migrations/20a_fix_funcoes_rls.sql`
4. Execute a query

## O que a migration faz

A migration corrige a política de INSERT para:
- Permitir inserção se o usuário tem perfil E o `company_id` é da empresa dele
- Permitir inserção se o usuário **não tem perfil** (permite inserir em qualquer empresa válida)

Isso resolve o problema quando o usuário está autenticado mas não tem um registro na tabela `profiles`.

## Verificação

Após executar a migration, tente criar uma função novamente. Se ainda houver erro, verifique:
1. Se o usuário está autenticado (`auth.uid()` não é NULL)
2. Se o `company_id` existe na tabela `companies` e não está deletado
3. Se a política foi criada corretamente (verifique em **Authentication > Policies**)

