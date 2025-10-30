# Correção: KPIs não atualizavam com status "paga"

## 📋 Problema

Os KPIs na página de "Recebimentos" estavam mostrando R$ 0,00 para:
- **Faturamento Bruto** (apenas pagos)
- **Pendentes** (aguardando pagamento)
- **Vencidos** (necessitam ação)

Mesmo com uma nota fiscal no status "paga" no banco de dados.

## 🔍 Causa

O código estava comparando `status === 'pago'` (masculino), mas o banco de dados usa `'paga'` (feminino) conforme o enum `NotaFiscalStatus`.

**Logs revelaram:**
```
📊 [KPIs] Status das notas: ['paga']
📊 [KPIs] Notas pagas: 0  ← Filtro não encontrou por causa de 'pago' vs 'paga'
```

## ✅ Correções Aplicadas

### 1. `src/lib/obrasNotasFiscaisApi.ts`
```typescript
// ANTES:
const notasPagas = (todasNotas || []).filter(n => n.status === 'pago').reduce(...)

// DEPOIS:
const notasPagas = (todasNotas || []).filter(n => n.status === 'paga').reduce(...)
```

### 2. `src/pages/recebimentos/RecebimentosPage.tsx`
```typescript
// Mock data: status: 'pago' → status: 'paga'
```

### 3. `src/pages/recebimentos/RecebimentosIndex.tsx`
```typescript
// Mock data: status: 'pago' → status: 'paga'
```

## 📊 Resultado

Agora os KPIs estão calculando corretamente:
- **Total Recebimentos**: R$ 136.455,09
- **Faturamento Bruto**: R$ 136.455,09 (notas com status 'paga')
- **Pendentes**: R$ 0,00
- **Vencidos**: R$ 0,00

## 🎯 Status
✅ **CORRIGIDO** - 29/10/2025


