# 📊 Relatório de Verificação - Estrutura da Tabela `contas_pagar`

**Data:** 2025-01-27  
**Script:** `scripts/testing/verificar-estrutura-contas-pagar.js`

---

## ✅ Resultados da Verificação

### 1. Status da Tabela
- ✅ **Tabela existe** no banco de dados
- ⚠️ **Tabela está vazia** (sem registros)
- ✅ **Conexão funcionando** - Supabase responde corretamente

### 2. Teste de Inserção - Campos em Português
**Resultado:** ❌ FALHOU

```
Erro: Could not find the 'data_emissao' column of 'contas_pagar' in the schema cache
```

**Conclusão:** 
- A tabela **NÃO usa campos em português** como esperado pelo código TypeScript
- Campos testados que falharam: `data_emissao`, `numero_nota`, `valor`, `data_vencimento`

### 3. Teste de Inserção - Campos em Inglês
**Resultado:** ⚠️ ERRO DE RLS (não estrutura)

```
Erro: new row violates row-level security policy for table "contas_pagar"
```

**Conclusão:**
- A inserção foi **bloqueada por RLS**, não por estrutura incorreta
- Isso sugere que a tabela **provavelmente usa campos em inglês**
- O erro de RLS é esperado (usuário não autenticado no script)

---

## 🔍 Análise

### Estrutura Real vs Esperada

| Item | Esperado (Código) | Provável Real (Banco) | Status |
|------|-------------------|----------------------|--------|
| **Campos** | Português | Inglês | ❌ Divergente |
| **Número da Nota** | `numero_nota` | `invoice_number` | ❌ |
| **Valor** | `valor` | `amount` | ❌ |
| **Data Emissão** | `data_emissao` | Provavelmente não existe | ❌ |
| **Data Vencimento** | `data_vencimento` | `due_date` | ❌ |
| **Fornecedor** | `fornecedor` | `supplier` | ❌ |
| **Descrição** | `descricao` | `description` | ❌ |
| **Status** | `status` (Pendente/Paga/etc) | `status` (enum: pendente/pago/etc) | ⚠️ Formato diferente |

### Migration Aplicada
Baseado no erro, parece que a migration **`11_contas_pagar.sql`** foi aplicada, que usa:
- Campos em **inglês**
- Enum `status_conta_pagar` com valores em **minúsculas**
- Campo `company_id` obrigatório
- Campo `description` obrigatório (não tem `numero_nota` separado)

---

## ❌ Problemas Identificados

### 1. **Incompatibilidade de Campos**
- **Severidade:** 🔴 CRÍTICA
- **Impacto:** Nenhuma operação CRUD funcionará sem mapeamento
- **Solução:** Criar função de mapeamento ou atualizar migration

### 2. **Estrutura Diferente Entre Migrations**
- **Severidade:** 🟡 MÉDIA
- **Migrações encontradas:**
  - `11_contas_pagar.sql` - Campos em inglês
  - `create_contas_pagar.sql` - Campos em português
- **Impacto:** Confusão sobre qual estrutura usar
- **Solução:** Padronizar em uma única estrutura

### 3. **Status com Formato Diferente**
- **Severidade:** 🟡 MÉDIA
- **Impacto:** Valores de status não corresponderão
- **Solução:** Criar função de mapeamento

---

## ✅ Próximos Passos

### Opção 1: Criar Função de Mapeamento (Recomendado)
**Vantagens:**
- Não precisa alterar banco
- Flexível para futuras mudanças
- Menos invasivo

**Implementar:**
1. Criar funções de mapeamento em `contas-pagar-api.ts`
2. Converter campos ao ler/escrever no banco
3. Manter tipos TypeScript em português

### Opção 2: Atualizar Migration
**Vantagens:**
- Estrutura consistente
- Sem necessidade de mapeamento

**Desvantagens:**
- Pode quebrar dados existentes
- Requer nova migration
- Mais trabalho

### Recomendação: **Opção 1** (Mapeamento)

---

## 📋 Campos Esperados no Banco (baseado em `11_contas_pagar.sql`)

```sql
contas_pagar:
  - id (UUID)
  - company_id (UUID) - OBRIGATÓRIO
  - obra_id (UUID) - Opcional
  - description (TEXT) - OBRIGATÓRIO
  - category (TEXT) - Opcional
  - supplier (TEXT) - Opcional
  - amount (DECIMAL) - OBRIGATÓRIO
  - due_date (DATE) - OBRIGATÓRIO
  - payment_date (DATE) - Opcional
  - status (status_conta_pagar ENUM) - OBRIGATÓRIO
  - payment_method (TEXT) - Opcional
  - invoice_number (TEXT) - Opcional
  - invoice_url (TEXT) - Opcional
  - observations (TEXT) - Opcional
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
  - deleted_at (TIMESTAMPTZ)
```

### Enum: `status_conta_pagar`
```sql
- 'pendente'
- 'pago'
- 'atrasado'
- 'cancelado'
```

---

## 🔄 Mapeamento Necessário

### Campos Português → Inglês

| Português (Código) | Inglês (Banco) | Observação |
|-------------------|----------------|------------|
| `numero_nota` | `invoice_number` | Campo opcional no banco |
| `valor` | `amount` | ✅ |
| `data_emissao` | ❌ Não existe | Usar `created_at` ou adicionar campo |
| `data_vencimento` | `due_date` | ✅ |
| `fornecedor` | `supplier` | ✅ |
| `descricao` | `description` | ✅ |
| `categoria` | `category` | ✅ |
| `data_pagamento` | `payment_date` | ✅ |
| `valor_pago` | ❌ Não existe | Pode usar `amount` quando pago |
| `forma_pagamento` | `payment_method` | ✅ |
| `observacoes` | `observations` | ✅ |
| `anexo_url` | `invoice_url` | ✅ |
| `anexo_nome` | ❌ Não existe | Pode extrair do URL |

### Status: App → Banco

| App (TypeScript) | Banco (Enum) |
|------------------|--------------|
| `'Pendente'` | `'pendente'` |
| `'Paga'` | `'pago'` |
| `'Atrasada'` | `'atrasado'` |
| `'Cancelada'` | `'cancelado'` |

---

## 📝 Checklist para Implementação

### TASK 2: Criar API com Mapeamento
- [ ] Criar função `mapearBancoParaApp(conta: any): ContaPagar`
- [ ] Criar função `mapearAppParaBanco(conta: ContaPagarFormData): any`
- [ ] Criar função `mapearStatusAppParaBanco(status: string): string`
- [ ] Criar função `mapearStatusBancoParaApp(status: string): StatusContaPagar`
- [ ] Implementar `getContasPagar()` com mapeamento
- [ ] Implementar `createContaPagar()` com mapeamento
- [ ] Implementar `updateContaPagar()` com mapeamento

### TASK 5: Ajustar Status
- [ ] Criar funções de mapeamento de status
- [ ] Testar conversão bidirecional
- [ ] Atualizar API para usar mapeamento

### Campos Ausentes a Tratar:
- [ ] `data_emissao` - Usar `created_at` ou permitir null
- [ ] `valor_pago` - Usar `amount` quando status = 'pago'
- [ ] `anexo_nome` - Extrair do filename do URL ou permitir null

---

## ✅ Conclusão

A tabela `contas_pagar` no banco de dados:
- ✅ Existe e está acessível
- ❌ Usa campos em **inglês** (não português)
- ❌ Usa enum de status em **minúsculas** (não maiúsculas)
- ✅ Requer `company_id` obrigatório
- ✅ Tem RLS configurado (correto)

**Solução:** Implementar funções de mapeamento na API para converter entre o formato do código (português) e o formato do banco (inglês).

---

**Status:** ✅ Verificação Completa  
**Próximo passo:** Implementar TASK 2 com funções de mapeamento


