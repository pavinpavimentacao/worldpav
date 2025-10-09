# Migrations - Relatórios Diários

## 📋 Ordem de Execução

Execute as migrations SQL na seguinte ordem:

### 1. Parceiros com Nichos
```bash
create_parceiros_nichos_completo.sql
```
**O que faz:**
- Adiciona campo `nicho` na tabela `parceiros`
- Cria tabela `parceiros_maquinarios` (maquinários terceiros)
- Cria tabela `parceiros_equipes` (equipes terceiras)
- Configura RLS e índices

### 2. Relatórios Diários
```bash
create_relatorios_diarios_completo.sql
```
**O que faz:**
- Cria tabela `relatorios_diarios`
- Cria tabela `relatorios_diarios_maquinarios` (vinculação)
- Atualiza tabela `obras_ruas` (campos de finalização)
- Cria triggers automáticos:
  - Gerar número do relatório (RD-YYYY-NNN)
  - Calcular espessura automaticamente
  - Finalizar rua ao criar relatório
- Configura RLS e índices
- Cria view `vw_relatorios_diarios_completo`

---

## 🚀 Como Aplicar no Supabase

### Opção 1: Via SQL Editor (Recomendado)

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Crie uma nova query
4. Cole o conteúdo de `create_parceiros_nichos_completo.sql`
5. Execute (RUN)
6. Crie outra query
7. Cole o conteúdo de `create_relatorios_diarios_completo.sql`
8. Execute (RUN)

### Opção 2: Via CLI do Supabase

```bash
# Migration 1 - Parceiros
supabase db push < db/migrations/create_parceiros_nichos_completo.sql

# Migration 2 - Relatórios Diários
supabase db push < db/migrations/create_relatorios_diarios_completo.sql
```

---

## ✅ Verificação

Após executar as migrations, verifique:

### 1. Tabelas Criadas
```sql
-- Verificar se as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'parceiros_maquinarios',
  'parceiros_equipes',
  'relatorios_diarios',
  'relatorios_diarios_maquinarios'
);
```

### 2. Colunas Adicionadas
```sql
-- Verificar campo nicho em parceiros
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'parceiros'
AND column_name = 'nicho';

-- Verificar campos em obras_ruas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'obras_ruas'
AND column_name IN ('relatorio_diario_id', 'data_finalizacao', 'metragem_executada', 'toneladas_executadas');
```

### 3. Triggers Criados
```sql
-- Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN (
  'gerar_numero_relatorio_trigger',
  'calcular_espessura_relatorio_trigger',
  'finalizar_rua_trigger'
);
```

### 4. View Criada
```sql
-- Verificar view
SELECT table_name
FROM information_schema.views
WHERE table_name = 'vw_relatorios_diarios_completo';
```

---

## 🧪 Teste Básico

Execute este script para testar o fluxo completo:

```sql
-- 1. Criar um parceiro empreiteiro (se não existir)
INSERT INTO parceiros (id, nome, nicho, ativo)
VALUES ('550e8400-e29b-41d4-a716-446655440099', 'Teste Empreiteiro', 'empreiteiro', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Adicionar maquinário terceiro
INSERT INTO parceiros_maquinarios (parceiro_id, nome, tipo, placa, valor_diaria)
VALUES ('550e8400-e29b-41d4-a716-446655440099', 'Caminhão Teste', 'Caminhão', 'TST-1234', 500.00);

-- 3. Adicionar equipe terceira
INSERT INTO parceiros_equipes (parceiro_id, nome, quantidade_pessoas, valor_diaria, especialidade)
VALUES ('550e8400-e29b-41d4-a716-446655440099', 'Equipe Teste', 5, 2000.00, 'Pavimentação');

-- 4. Criar relatório de teste (ajustar IDs conforme seu banco)
-- Substitua os IDs de cliente, obra e rua pelos seus
INSERT INTO relatorios_diarios (
  cliente_id,
  obra_id,
  rua_id,
  data_inicio,
  horario_inicio,
  metragem_feita,
  toneladas_aplicadas
) VALUES (
  '[SEU_CLIENTE_ID]',
  '[SUA_OBRA_ID]',
  '[SUA_RUA_ID]',
  CURRENT_DATE,
  '08:00',
  450.00,
  45.00
);

-- 5. Verificar se número foi gerado automaticamente
SELECT numero, espessura_calculada
FROM relatorios_diarios
ORDER BY created_at DESC
LIMIT 1;

-- Deve retornar algo como: RD-2024-001 e espessura 1.00

-- 6. Verificar se a rua foi finalizada
SELECT status, data_finalizacao, metragem_executada, relatorio_diario_id
FROM obras_ruas
WHERE id = '[SUA_RUA_ID]';

-- Status deve ser 'finalizada'
```

---

## 🔄 Rollback (Se Necessário)

Caso precise reverter as migrations:

```sql
-- ATENÇÃO: Isto irá deletar todas as tabelas e dados!

-- Remover triggers
DROP TRIGGER IF EXISTS finalizar_rua_trigger ON relatorios_diarios;
DROP TRIGGER IF EXISTS calcular_espessura_relatorio_trigger ON relatorios_diarios;
DROP TRIGGER IF EXISTS gerar_numero_relatorio_trigger ON relatorios_diarios;

-- Remover funções
DROP FUNCTION IF EXISTS finalizar_rua_ao_criar_relatorio();
DROP FUNCTION IF EXISTS calcular_espessura_relatorio();
DROP FUNCTION IF EXISTS gerar_numero_relatorio();

-- Remover view
DROP VIEW IF EXISTS vw_relatorios_diarios_completo;

-- Remover colunas de obras_ruas
ALTER TABLE obras_ruas DROP COLUMN IF EXISTS relatorio_diario_id;
ALTER TABLE obras_ruas DROP COLUMN IF EXISTS data_finalizacao;
ALTER TABLE obras_ruas DROP COLUMN IF EXISTS metragem_executada;
ALTER TABLE obras_ruas DROP COLUMN IF EXISTS toneladas_executadas;

-- Remover tabelas
DROP TABLE IF EXISTS relatorios_diarios_maquinarios;
DROP TABLE IF EXISTS relatorios_diarios;
DROP TABLE IF EXISTS parceiros_equipes;
DROP TABLE IF EXISTS parceiros_maquinarios;

-- Remover coluna nicho de parceiros
ALTER TABLE parceiros DROP COLUMN IF EXISTS nicho;
```

---

## 📝 Notas Importantes

### Triggers Automáticos

1. **gerar_numero_relatorio_trigger**
   - Gera número sequencial: RD-YYYY-NNN
   - Executa ANTES de inserir
   - Incrementa automaticamente por ano

2. **calcular_espessura_relatorio_trigger**
   - Calcula: (toneladas ÷ metragem) × 10
   - Executa ANTES de inserir/atualizar
   - Previne divisão por zero

3. **finalizar_rua_trigger**
   - Atualiza rua para 'finalizada'
   - Preenche data_finalizacao, metragem_executada, etc.
   - Executa DEPOIS de inserir relatório

### RLS (Row Level Security)

- Todas as tabelas têm RLS habilitado
- Policies permitem acesso para usuários autenticados
- Ajuste as policies conforme necessidade (por empresa, usuário, etc.)

### Dados de Exemplo

- Os scripts incluem dados mockados (comentados)
- Descomente se quiser popular o banco com exemplos
- Ajuste UUIDs se necessário

---

## 🎯 Próximos Passos

Após executar as migrations:

1. ✅ Remover flag `USE_MOCK` das APIs:
   - `/src/lib/parceirosApi.ts`
   - `/src/lib/relatoriosDiariosApi.ts`

2. ✅ Implementar queries reais do Supabase

3. ✅ Testar fluxo completo:
   - Criar parceiro empreiteiro
   - Adicionar maquinários/equipes
   - Criar novo relatório diário
   - Verificar sincronização com rua
   - Verificar faturamento criado

4. ✅ Ajustar RLS conforme regras de negócio

---

## 📞 Suporte

Se encontrar erros durante a execução:

1. Verifique se as tabelas dependentes existem (`clients`, `obras`, `obras_ruas`, `parceiros`)
2. Verifique permissões do usuário do banco
3. Revise logs de erro do Supabase
4. Execute as migrations em blocos menores se necessário

**Lembre-se**: Sempre faça backup do banco antes de executar migrations em produção! 🔒


