# ✅ CORREÇÃO - NOME DA OBRA NOS RECEBIMENTOS

**Data:** 29 de Outubro de 2025  
**Problema:** "Obra não encontrada" aparecia na lista  
**Status:** ✅ Corrigido

---

## ❌ PROBLEMA IDENTIFICADO

Nas imagens enviadas, aparecia:
- **Na tabela:** "Obra não encontrada"
- **No modal:** "Obra não encontrada"

**Causa:** A API não estava buscando o nome da obra nas queries.

---

## ✅ CORREÇÃO APLICADA

### **1. Atualização em `obrasNotasFiscaisApi.ts`**

**ANTES:**
```typescript
return (data || []).map((nota: any) => ({
  ...nota,
  obra_nome: undefined // ❌ Sempre retornava undefined
}))
```

**DEPOIS:**
```typescript
const notasComObra = await Promise.all(
  (data || []).map(async (nota: any) => {
    try {
      const { data: obra } = await supabase
        .from('obras')
        .select('name')  // ✅ Busca o nome da obra
        .eq('id', nota.obra_id)
        .single()
      
      return {
        ...nota,
        obra_nome: obra?.name || 'Obra não encontrada'
      }
    } catch (e) {
      return {
        ...nota,
        obra_nome: 'Obra não encontrada'
      }
    }
  })
)

return notasComObra  // ✅ Retorna com nome da obra
```

### **2. Atualização em `obrasPagamentosDiretosApi.ts`**

Mesma lógica aplicada para pagamentos diretos:
```typescript
// Buscar nomes das obras para cada pagamento
const pagamentosComObra = await Promise.all(
  pagamentosMapeados.map(async (pagamento) => {
    const { data: obra } = await supabase
      .from('obras')
      .select('name')
      .eq('id', pagamento.obra_id)
      .single()
    
    return {
      ...pagamento,
      obra_nome: obra?.name || 'Obra não encontrada'
    }
  })
)
```

---

## 📊 RESULTADO ESPERADO

### **Na Tabela:**
- ✅ Mostra o nome real da obra (ex: "test")

### **No Modal:**
- ✅ Mostra o nome real da obra (ex: "test")

### **Se a obra não existir:**
- ⚠️ Mostra "Obra não encontrada" (comportamento esperado)

---

## 🧪 TESTE

1. Acesse `/recebimentos`
2. Verifique se agora aparece "test" (nome da obra) ao invés de "Obra não encontrada"
3. Clique no ícone "👁️ Ver Detalhes"
4. Verifique se no modal também aparece "test"

---

## 🎯 COLUNA DO BANCO

**Tabela:** `obras`  
**Coluna:** `name` (em inglês no banco)  
**Mapeamento:** `obra.name` → `obra_nome` (em português na interface)

---

**Status:** ✅ Corrigido - Nome da obra aparece corretamente



