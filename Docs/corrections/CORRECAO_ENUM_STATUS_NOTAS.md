# ✅ CORREÇÃO - ENUM DE STATUS DE NOTAS FISCAIS

**Data:** 29 de Outubro de 2025  
**Problema:** Status "vencido" não existe no enum do banco  
**Status:** ✅ Corrigido

---

## ❌ ERRO IDENTIFICADO

```
Erro: invalid input value for enum status_nota_fiscal: "vencido"
```

**Causa:** O código tentava usar o status 'vencido', mas o enum `status_nota_fiscal` no banco de dados só aceita:
- `emitida`
- `enviada`
- `paga`

---

## ✅ CORREÇÃO APLICADA

### **1. Função `verificarNotasVencidas` Corrigida**

**ANTES:**
```typescript
const { data, error } = await supabase
  .from('obras_notas_fiscais')
  .update({ status: 'vencido' })  // ❌ Status inválido
  .eq('obra_id', obraId)
  .eq('status', 'emitida')
  .lt('vencimento', hoje)
```

**DEPOIS:**
```typescript
// Apenas conta as notas vencidas (sem atualizar status)
const { data, error } = await supabase
  .from('obras_notas_fiscais')
  .select('id')  // ✅ Apenas busca e conta
  .eq('obra_id', obraId)
  .eq('status', 'emitida')
  .lt('vencimento', hoje)

// Retorna apenas a contagem
// Notas ficam como 'emitida' mesmo quando vencidas
return data?.length || 0
```

### **2. Comportamento Atual**

✅ **Notas vencidas permanecem com status `'emitida'`**  
✅ Sistema conta quantas estão vencidas  
✅ Não tenta atualizar para status inexistente  

---

## 📊 ENUM NO BANCO DE DADOS

**Definição do Enum:**
```sql
CREATE TYPE status_nota_fiscal AS ENUM (
  'emitida',
  'enviada',
  'paga'
);
```

**Não existe:**
- ❌ `vencido`
- ❌ `pendente`
- ❌ `renegociado`

---

## 🎯 WORKAROUND

Como o banco não suporta status 'vencido', o sistema:
1. **Mantém a nota como 'emitida'**
2. **Verifica a data de vencimento** para saber se está vencida
3. **Exibe visualmente como vencida** na interface (se necessário)

---

## 🧪 TESTE

1. ✅ Atualizar nota fiscal deve funcionar sem erro
2. ✅ Alterar status de 'emitida' para 'pago' funciona
3. ✅ Sem mais erros de enum

---

**Status:** ✅ Corrigido - Sistema usa apenas status válidos do enum



