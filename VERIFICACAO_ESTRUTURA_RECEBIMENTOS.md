# 🔍 VERIFICAÇÃO DE ESTRUTURA - RECEBIMENTOS

**Data:** Janeiro 2025  
**Status:** ✅ Completado

---

## 📊 ESTRUTURA IDENTIFICADA

### ✅ 1. Tabela `obras_notas_fiscais`

**COLUNAS EXISTENTES (2 Schemas Misturados):**

#### Schema ANTIGO (03_obras_financeiro.sql):
- `id` (uuid)
- `obra_id` (uuid)
- `medicao_id` (uuid)
- `invoice_number` (text) ❌
- `issue_date` (date) ❌
- `amount` (numeric) ❌
- `tax_amount` (numeric)
- `net_amount` (numeric) ❌
- `description` (text)
- `file_url` (text) ❌
- `status` (enum) ⚠️
- `created_at` (timestamp)
- `deleted_at` (timestamp)

#### Schema NOVO (create_obras_notas_medicoes.sql):
- `valor_nota` (numeric) ✅
- `vencimento` (date) ✅
- `desconto_inss` (numeric) ✅
- `desconto_iss` (numeric) ✅
- `valor_liquido` (numeric) ✅
- `numero_nota` (text) ✅
- `outro_desconto` (numeric) ✅
- `arquivo_nota_url` (text) ✅
- `observacoes` (text) ✅
- `data_pagamento` (date) ✅
- `updated_at` (timestamp) ✅

**⚠️ PROBLEMA CRÍTICO:** A tabela tem AMBOS os schemas misturados!

---

### ✅ 2. Tabela `obras_pagamentos_diretos`

**COLUNAS EXISTENTES:**

- `id` (uuid)
- `obra_id` (uuid)
- `description` (text) ❌ (esperado: `descricao`)
- `amount` (numeric) ❌ (esperado: `valor`)
- `payment_date` (date) ❌ (esperado: `data_pagamento`)
- `payment_method` (text) ❌ (esperado: `forma_pagamento`)
- `category` (text) ✅
- `recipient` (text) ✅
- `document_number` (text) ✅
- `observations` (text) ❌ (esperado: `observacoes`)
- `created_at` (timestamp)
- `deleted_at` (timestamp)

**❌ PROBLEMA:** Todos os nomes em INGLÊS, TypeScript espera PORTUGUÊS!

---

### 📊 3. Dados Existentes

**Nota Fiscal 1:**
- `valor_nota`: R$ 150.000,00
- `vencimento`: 2025-10-24
- `desconto_inss`: R$ 1,23
- `desconto_iss`: R$ 1.231,23
- `outro_desconto`: R$ 12.312,45
- `valor_liquido`: R$ 136.455,09
- `numero_nota`: "123"
- `status`: "emitida"

---

## 🎯 PROBLEMAS IDENTIFICADOS

### ❌ **CRÍTICO: obras_notas_fiscais**

**Problema:** Tabela tem campos de 2 migrations diferentes misturados

**Campos que EXISTEM mas em INGLÊS:**
- `invoice_number` → deveria ser `numero_nota` ✅ (já existe em pt)
- `issue_date` → deveria ser `vencimento` ✅ (já existe em pt)
- `amount` → deveria ser `valor_nota` ✅ (já existe em pt)
- `net_amount` → deveria ser `valor_liquido` ✅ (já existe em pt)
- `file_url` → deveria ser `arquivo_nota_url` ✅ (já existe em pt)

**Campos que EXISTEM em PORTUGUÊS (corretos):**
- ✅ `numero_nota`
- ✅ `valor_nota`
- ✅ `vencimento`
- ✅ `desconto_inss`
- ✅ `desconto_iss`
- ✅ `outro_desconto`
- ✅ `valor_liquido`
- ✅ `arquivo_nota_url`
- ✅ `observacoes`
- ✅ `data_pagamento`

**Solução:** Usar apenas os campos em PORTUGUÊS (já existem!)

---

### ❌ **CRÍTICO: obras_pagamentos_diretos**

**Problema:** TODOS os nomes de campos em INGLÊS

**Campos Incorretos:**
- `description` → deveria ser `descricao`
- `amount` → deveria ser `valor`
- `payment_date` → deveria ser `data_pagamento`
- `payment_method` → deveria ser `forma_pagamento`
- `observations` → deveria ser `observacoes`

**Solução:** Renomear colunas ou mapear na API

---

## ✅ PLANO DE CORREÇÃO

### **OPÇÃO A: Renomear Colunas no Banco (Recomendado)**

Criar migration para renomear campos.

### **OPÇÃO B: Mapear na API (Mais Rápido)**

Ajustar APIs para usar nomes corretos.

### **RECOMENDAÇÃO: OPÇÃO B (mais segura)**

- ✅ Não altera dados existentes
- ✅ Implementação mais rápida
- ✅ Menos risco de problemas

---

## 🚀 PRÓXIMA TASK

**Task 2:** Criar mapeamento de campos nas APIs

**Arquivos a Modificar:**
1. `src/lib/obrasNotasFiscaisApi.ts` → Usar campos em português
2. `src/lib/obrasPagamentosDiretosApi.ts` → Mapear inglês → português

---

## ✅ CONCLUSÃO

**Status:** ✅ Diagnóstico Completo

**Descobertas:**
1. ✅ `obras_notas_fiscais` tem campos corretos em português
2. ❌ `obras_pagamentos_diretos` precisa mapeamento
3. ✅ Existe 1 nota fiscal com dados corretos
4. ❌ Não há pagamentos diretos ainda

**Próximo Passo:** Implementar mapeamento nas APIs
