# 🗄️ Migrações do Banco de Dados - WorldPav

Instruções completas para implementar toda a estrutura de banco de dados PostgreSQL no Supabase.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Ordem de Execução](#ordem-de-execução)
- [Instruções Detalhadas](#instruções-detalhadas)
- [Verificação e Testes](#verificação-e-testes)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este diretório contém **todos os scripts SQL** necessários para criar a estrutura completa do banco de dados WorldPav no Supabase (PostgreSQL).

### Arquitetura Multi-Tenant

O sistema é **multi-tenant**, ou seja, múltiplas empresas podem usar a mesma instância do banco de dados com **isolamento completo** de dados através de:

- Tabela central `companies`
- Campo `company_id` em todas as tabelas principais
- **Row Level Security (RLS)** garantindo que usuários vejam apenas dados da sua empresa
- **Soft delete** (`deleted_at`) para auditoria e recuperação

### Estrutura de Scripts

- **00-14**: Tabelas principais e relacionamentos
- **15**: Configuração de Storage buckets
- **17-18**: Functions e Views auxiliares
- **20**: Índices adicionais para performance
- **21**: Seed data (opcional, apenas dev/test)

---

## 🔧 Pré-requisitos

Antes de executar as migrações:

1. ✅ **Conta no Supabase** criada
2. ✅ **Projeto Supabase** configurado
3. ✅ **Acesso ao SQL Editor** do Supabase Dashboard
4. ✅ **Credenciais** anotadas (URL e anon key)

---

## 📝 Ordem de Execução

**IMPORTANTE**: Execute os scripts **EXATAMENTE** nesta ordem, pois há dependências entre eles.

### Fase 1: Fundação (Base do Sistema)

```
1. 00_foundation.sql          ← EXECUTAR PRIMEIRO (cria enums, companies, profiles, functions base)
```

### Fase 2: Entidades Principais

```
2. 01_clientes.sql            ← Clientes
3. 02_obras.sql               ← Obras e ruas
4. 03_obras_financeiro.sql    ← Financeiro de obras (medições, notas, pagamentos)
```

### Fase 3: Recursos Humanos e Equipamentos

```
5. 04_colaboradores.sql       ← Colaboradores e documentos
6. 05_controle_diario.sql     ← Sistema de diárias
7. 06_maquinarios.sql         ← Maquinários (seguros, licenças, diesel)
```

### Fase 4: Operacional

```
8. 07_programacao_pavimentacao.sql  ← Sistema de programação
9. 08_relatorios_diarios.sql        ← Relatórios diários de obras
```

### Fase 5: Parceiros e Financeiro Geral

```
10. 09_parceiros.sql           ← Parceiros (preços, carregamentos RR2C)
11. 10_guardas.sql             ← Sistema de guardas
12. 11_contas_pagar.sql        ← Contas a pagar
13. 12_financeiro_consolidado.sql  ← Financeiro geral da empresa
```

### Fase 6: Auxiliares

```
14. 13_notes_reports.sql       ← Anotações e reports gerenciais
15. 14_servicos.sql            ← Catálogo de serviços
```

### Fase 7: Storage e Otimizações

```
16. 15_storage_setup.sql       ← Buckets e policies do Storage
17. 17_functions.sql           ← Functions SQL auxiliares
18. 18_views.sql               ← Views para dashboards
19. 20_indexes_additional.sql  ← Índices compostos extras
```

### Fase 8: Dados Iniciais (Opcional)

```
20. 21_seed_data.sql           ← Dados de teste (APENAS EM DEV!)
```

---

## 🚀 Instruções Detalhadas

### Passo 1: Acessar Supabase SQL Editor

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados no menu lateral)

### Passo 2: Executar os Scripts

Para cada script, na ordem especificada:

1. **Abra o arquivo** no seu editor de código
2. **Copie todo o conteúdo** do arquivo
3. No **SQL Editor** do Supabase, cole o conteúdo
4. Clique em **"Run"** (ou Ctrl/Cmd + Enter)
5. **Aguarde** a execução completar
6. **Verifique** se não houve erros (painel inferior)
7. ✅ Se sucesso, marque como concluído e passe para o próximo

### Passo 3: Verificar Execução

Após executar cada script, verifique:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar RLS ativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar policies criadas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## ✅ Verificação e Testes

### Checklist Completo

Após executar todos os scripts, verifique:

#### Tabelas Criadas

- [ ] `companies` - Empresas
- [ ] `profiles` - Usuários estendidos
- [ ] `clients` - Clientes
- [ ] `obras` - Obras
- [ ] `obras_ruas` - Ruas/etapas de obras
- [ ] `obras_financeiro` - Financeiro de obras
- [ ] `obras_medicoes` - Medições
- [ ] `obras_notas_fiscais` - Notas fiscais de obras
- [ ] `obras_pagamentos_diretos` - Pagamentos diretos
- [ ] `colaboradores` - Colaboradores
- [ ] `colaboradores_documentos` - Documentos de colaboradores
- [ ] `controle_diario_relacoes` - Relações diárias
- [ ] `controle_diario_diarias` - Diárias de colaboradores
- [ ] `maquinarios` - Maquinários
- [ ] `maquinarios_seguros` - Seguros de maquinários
- [ ] `maquinarios_licencas` - Licenças de maquinários
- [ ] `maquinarios_diesel` - Abastecimentos de diesel
- [ ] `programacao_pavimentacao` - Programação
- [ ] `relatorios_diarios` - Relatórios diários
- [ ] `parceiros` - Parceiros/fornecedores
- [ ] `parceiros_precos` - Preços de parceiros
- [ ] `carregamentos_rr2c` - Carregamentos RR2C
- [ ] `guardas` - Guardas de trânsito
- [ ] `contas_pagar` - Contas a pagar
- [ ] `financial_transactions` - Financeiro consolidado
- [ ] `notes` - Anotações
- [ ] `reports` - Reports gerenciais
- [ ] `servicos` - Serviços

**Total esperado: 27 tabelas** + tabelas do Supabase (auth, storage)

#### Storage Buckets

- [ ] `colaboradores-documents`
- [ ] `colaboradores-photos`
- [ ] `maquinarios-photos`
- [ ] `maquinarios-documents`
- [ ] `obras-photos`
- [ ] `notas-fiscais`
- [ ] `relatorios-photos`
- [ ] `contas-pagar-documents`
- [ ] `general-uploads`

**Total esperado: 9 buckets**

#### Functions

- [ ] `update_updated_at_column()`
- [ ] `get_user_company_id()`
- [ ] `get_user_role()`
- [ ] `is_user_admin()`
- [ ] `soft_delete_record()`
- [ ] `calculate_obra_rentability()`
- [ ] `calculate_diesel_consumption()`
- [ ] `calculate_horas_extras_total()`
- [ ] `get_financial_summary()`
- [ ] `get_obras_ativas()`

**Total esperado: 10+ functions**

#### Views

- [ ] `v_obras_dashboard`
- [ ] `v_financial_dashboard`
- [ ] `v_colaboradores_active`
- [ ] `v_maquinarios_active`
- [ ] `v_programacao_calendar`
- [ ] `v_contas_pagar_pending`
- [ ] `v_diesel_consumption_report`
- [ ] `v_documentos_vencimento`

**Total esperado: 8 views**

#### RLS Ativado

- [ ] RLS ativado em todas as 27 tabelas
- [ ] Policies SELECT criadas para todas as tabelas
- [ ] Policies INSERT criadas para todas as tabelas
- [ ] Policies UPDATE criadas para todas as tabelas
- [ ] Policies DELETE criadas para tabelas principais

---

## 🧪 Testes Básicos

### 1. Testar Criação de Empresa

```sql
-- Inserir empresa de teste
INSERT INTO public.companies (name, cnpj, email, phone)
VALUES (
  'Empresa Teste',
  '12.345.678/0001-00',
  'teste@empresa.com',
  '(11) 9999-9999'
)
RETURNING id;
```

### 2. Testar RLS

```sql
-- Verificar se RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- Se retornar linhas, RLS NÃO está ativo nessas tabelas!
```

### 3. Testar Functions

```sql
-- Testar function de resumo financeiro
SELECT * FROM public.get_financial_summary(
  'UUID_DA_EMPRESA',
  '2025-01-01'::DATE,
  '2025-12-31'::DATE
);
```

### 4. Testar Views

```sql
-- Testar view de obras
SELECT * FROM public.v_obras_dashboard LIMIT 5;

-- Testar view de colaboradores ativos
SELECT * FROM public.v_colaboradores_active LIMIT 5;
```

### 5. Testar Storage

Vá em **Storage** no Supabase Dashboard e verifique se os 9 buckets foram criados.

---

## 🔍 Queries Úteis para Verificação

### Contar Tabelas Criadas

```sql
SELECT COUNT(*) AS total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Esperado: 27+ tabelas
```

### Listar Todas as Foreign Keys

```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

### Verificar Índices

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Verificar Triggers

```sql
SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

---

## 🐛 Troubleshooting

### Erro: "extension uuid-ossp does not exist"

**Solução**: Execute primeiro no SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: "relation public.companies does not exist"

**Solução**: Você pulou o script `00_foundation.sql`. Execute-o primeiro.

### Erro: "column company_id does not exist"

**Solução**: A tabela `companies` não foi criada. Volte ao script `00_foundation.sql`.

### Erro: "policy already exists"

**Solução**: O script já foi executado antes. Você pode:
- Ignorar (se quiser manter as policies existentes)
- Dropar as policies primeiro: `DROP POLICY IF EXISTS "policy_name" ON table_name;`

### Erro em Storage Policies

**Solução**: Verifique se os buckets foram criados corretamente em **Storage** > **Buckets** no Supabase Dashboard.

---

## 🔐 Segurança

### Políticas RLS Implementadas

Todas as tabelas têm RLS com o seguinte padrão:

- ✅ **SELECT**: Usuários veem apenas dados da sua empresa (`company_id`)
- ✅ **INSERT**: Usuários criam apenas na sua empresa
- ✅ **UPDATE**: Usuários atualizam apenas dados não deletados da sua empresa
- ✅ **DELETE**: Apenas admins podem deletar (soft delete recomendado)

### Soft Delete

Tabelas principais usam **soft delete**:
- Campo `deleted_at` (TIMESTAMPTZ, nullable)
- Ao deletar, seta `deleted_at = NOW()`
- Queries filtram automaticamente via `WHERE deleted_at IS NULL`

---

## 📊 Estrutura Final

### Total de Entidades

- **27 tabelas** principais
- **9 buckets** de storage
- **10+ functions** SQL
- **8 views** otimizadas
- **20+ triggers** automáticos
- **60+ índices** para performance
- **100+ policies RLS** de segurança

### Relacionamentos Principais

```
COMPANIES (raiz multi-tenant)
├── PROFILES (usuários)
├── CLIENTS
│   └── OBRAS
│       ├── obras_ruas
│       ├── obras_financeiro
│       ├── obras_medicoes
│       ├── obras_notas_fiscais
│       ├── obras_pagamentos_diretos
│       ├── programacao_pavimentacao
│       ├── relatorios_diarios
│       ├── guardas
│       └── carregamentos_rr2c
├── COLABORADORES
│   ├── colaboradores_documentos
│   └── controle_diario_diarias
├── MAQUINARIOS
│   ├── maquinarios_seguros
│   ├── maquinarios_licencas
│   └── maquinarios_diesel
├── PARCEIROS
│   ├── parceiros_precos
│   └── carregamentos_rr2c
└── (Tabelas independentes)
    ├── contas_pagar
    ├── financial_transactions
    ├── controle_diario_relacoes
    ├── notes
    ├── reports
    └── servicos
```

---

## 🎯 Próximos Passos Após Migração

1. ✅ **Criar primeiro usuário**:
   - Ir em **Authentication** > **Users** > **Add User**
   - Email: seu_email@empresa.com
   - Password: (senha forte)

2. ✅ **Criar profile do usuário**:
   ```sql
   INSERT INTO public.profiles (id, company_id, name, role)
   VALUES (
     'UUID_DO_AUTH_USER', -- ID do usuário criado acima
     'UUID_DA_EMPRESA',   -- ID da sua empresa
     'Seu Nome',
     'admin'
   );
   ```

3. ✅ **Configurar variáveis de ambiente** no frontend:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

4. ✅ **Testar autenticação** no app

5. ✅ **Inserir dados de teste** via interface do app

6. ✅ **Testar uploads** de arquivos (documentos, fotos, notas)

---

## 📚 Documentação Adicional

- **README.md principal** (raiz do projeto) - Visão geral do sistema
- **docs/Docs/DATABASE_SETUP_GUIDE.md** - Guia detalhado de setup
- **Supabase Docs** - https://supabase.com/docs

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a **ordem de execução** dos scripts
2. Confira **erros no console** do SQL Editor
3. Revise os **pré-requisitos**
4. Consulte a seção **Troubleshooting** acima
5. Verifique os **logs** do Supabase

---

## ⚠️ Avisos Importantes

### ❌ NÃO FAZER

- ❌ Executar scripts fora de ordem
- ❌ Pular scripts (todos são necessários)
- ❌ Executar `21_seed_data.sql` em produção
- ❌ Modificar scripts sem entender as dependências
- ❌ Desativar RLS nas tabelas
- ❌ Remover soft delete das tabelas principais

### ✅ FAZER

- ✅ Executar scripts na ordem correta
- ✅ Verificar cada execução antes de prosseguir
- ✅ Fazer backup antes de qualquer alteração em produção
- ✅ Testar em ambiente de desenvolvimento primeiro
- ✅ Documentar quaisquer customizações

---

## 🔄 Rollback (Reverter Migrações)

Se precisar reverter as migrações:

```sql
-- ATENÇÃO: Isto deletará TODOS OS DADOS!
-- Use apenas em ambiente de desenvolvimento

-- Deletar todas as políticas RLS
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Deletar todas as tabelas
DROP TABLE IF EXISTS public.servicos CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.financial_transactions CASCADE;
DROP TABLE IF EXISTS public.contas_pagar CASCADE;
DROP TABLE IF EXISTS public.guardas CASCADE;
DROP TABLE IF EXISTS public.carregamentos_rr2c CASCADE;
DROP TABLE IF EXISTS public.parceiros_precos CASCADE;
DROP TABLE IF EXISTS public.parceiros CASCADE;
DROP TABLE IF EXISTS public.relatorios_diarios CASCADE;
DROP TABLE IF EXISTS public.programacao_pavimentacao CASCADE;
DROP TABLE IF EXISTS public.maquinarios_diesel CASCADE;
DROP TABLE IF EXISTS public.maquinarios_licencas CASCADE;
DROP TABLE IF EXISTS public.maquinarios_seguros CASCADE;
DROP TABLE IF EXISTS public.maquinarios CASCADE;
DROP TABLE IF EXISTS public.controle_diario_diarias CASCADE;
DROP TABLE IF EXISTS public.controle_diario_relacoes CASCADE;
DROP TABLE IF EXISTS public.colaboradores_documentos CASCADE;
DROP TABLE IF EXISTS public.colaboradores CASCADE;
DROP TABLE IF EXISTS public.obras_pagamentos_diretos CASCADE;
DROP TABLE IF EXISTS public.obras_notas_fiscais CASCADE;
DROP TABLE IF EXISTS public.obras_medicoes CASCADE;
DROP TABLE IF EXISTS public.obras_financeiro CASCADE;
DROP TABLE IF EXISTS public.obras_ruas CASCADE;
DROP TABLE IF EXISTS public.obras CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Deletar enums
DROP TYPE IF EXISTS status_servico CASCADE;
-- ... (deletar todos os outros enums)
```

---

## 📖 Convenções do Banco

### Nomenclatura

- **Tabelas**: `snake_case`, plural quando apropriado
- **Colunas**: `snake_case`
- **Enums**: `snake_case`
- **Functions**: `snake_case_with_verb`
- **Views**: prefixo `v_` + `snake_case`
- **Indexes**: prefixo `idx_` + `tabela_campo`
- **Triggers**: prefixo `trigger_` + `acao_tabela`
- **Policies**: Nomes descritivos em inglês

### Tipos de Dados Padrão

- **IDs**: `UUID` (via `uuid_generate_v4()`)
- **Texto curto**: `TEXT`
- **Números decimais**: `DECIMAL(12, 2)` para dinheiro
- **Datas**: `DATE` para datas, `TIMESTAMPTZ` para data/hora
- **Booleanos**: `BOOLEAN`
- **Arrays**: `TEXT[]` ou `UUID[]`
- **JSON**: `JSONB` (mais performático que JSON)

### Padrão de Timestamps

Todas as tabelas principais têm:
- `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL` (atualizado via trigger)
- `deleted_at TIMESTAMPTZ` (soft delete)

---

## 🎉 Conclusão

Após executar todos os scripts com sucesso, seu banco de dados estará **100% pronto** para receber o frontend do WorldPav!

**Status**: ✅ **BANCO DE DADOS COMPLETO E FUNCIONAL**

**Desenvolvido com ❤️ por WorldPav Team**


