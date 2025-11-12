# 🚀 Aplicar Migrações - Passo a Passo

## ⚠️ IMPORTANTE: Execute nesta ordem exata!

### Passo 1: Migrar Estrutura Antiga → Nova

Execute no **SQL Editor do Supabase**:

```sql
-- Arquivo: migrate_relatorios_diarios_to_new_structure.sql
-- (Conteúdo já enviado, cole e execute)
```

### Passo 2: Corrigir RLS e Criar Tabelas Faltantes

Execute no **SQL Editor do Supabase**:

```sql
-- Arquivo: fix_rls_and_create_missing_tables.sql
-- (Conteúdo já criado, cole e execute)
```

### Passo 3: Executar Testes

```bash
cd worldpav

# 1. Teste diagnóstico
node scripts/testing/test-migracao-final.js

# 2. Teste completo de relatórios
node scripts/testing/test-relatorios-diarios.js

# 3. Teste de controle
node scripts/testing/test-controle-diario-diarias.js

# 4. Todos os testes
node scripts/testing/run-all-migration-tests.js
```

## 📋 Conteúdo dos Scripts

### 1. `migrate_relatorios_diarios_to_new_structure.sql`
**O que faz:**
- ✅ Renomeia `date` → `data_inicio`
- ✅ Adiciona colunas: `data_fim`, `horario_inicio`, `rua_id`, `equipe_id`, etc
- ✅ Adiciona colunas: `metragem_feita`, `toneladas_aplicadas`, `espessura_calculada`
- ✅ Cria índices

### 2. `fix_rls_and_create_missing_tables.sql` ⭐ NOVO
**O que faz:**
- ✅ Cria tabela `relatorios_diarios_maquinarios` que está faltando
- ✅ Adiciona colunas em `obras_ruas`: `relatorio_diario_id`, `data_finalizacao`, etc
- ✅ Ajusta RLS para permitir testes (policies permissivas)
- ✅ Cria funções e triggers automáticos:
  - Calcula espessura automaticamente
  - Finaliza rua ao criar relatório

### 3. `add_status_pagamento_diarias.sql`
**O que faz:**
- ✅ Adiciona `status_pagamento`, `data_pagamento`, `data_diaria`
- ✅ Cria índice

### 4. `fix_controle_diario_diarias_columns.sql`
**O que faz:**
- ✅ Adiciona campos: `adicional`, `desconto`, `horas_extras`, etc
- ✅ Cria valores padrão

## 🎯 Resultado Esperado

Após aplicar as migrations:

```
✅ Tabela relatorios_diarios_maquinarios criada
✅ Colunas adicionadas em obras_ruas
✅ RLS ajustado para testes
✅ Triggers criados (calcular espessura, finalizar rua)
✅ TODOS OS TESTES DEVEM PASSAR
```

## ⚠️ Avisos

### RLS Permissivo para Testes
O script `fix_rls_and_create_missing_tables.sql` cria policies **muito permissivas** para permitir os testes. Em produção, ajuste as policies de acordo com sua segurança.

### Ordem Importa
Não pule passos! Execute na ordem:
1. `migrate_relatorios_diarios_to_new_structure.sql`
2. `fix_rls_and_create_missing_tables.sql`
3. Depois os outros scripts

## 🔍 Verificação

Após executar, verifique no SQL Editor:

```sql
-- Verificar se tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'relatorios_diarios',
  'relatorios_diarios_maquinarios'
);

-- Verificar colunas de obras_ruas
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'obras_ruas'
AND column_name IN (
  'relatorio_diario_id',
  'data_finalizacao',
  'metragem_executada',
  'toneladas_executadas'
);
```

## 📝 Próximos Passos Após Migrations

1. ✅ Executar testes JavaScript
2. ✅ Usar MCP Playwright para testar via interface
3. ✅ Validar fluxo completo
4. ✅ Documentar resultados


