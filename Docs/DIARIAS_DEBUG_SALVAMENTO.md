# Debug: Diárias Não Estão Salvando no Banco de Dados

## Problema Identificado

As alterações (marcar como pago, valores totais) não estão sendo persistidas no banco de dados.

## Causas Possíveis

1. **Colunas Faltantes**: As colunas `status_pagamento`, `data_pagamento`, `data_diaria` não existem no banco
2. **Erros Silenciosos**: A função pode estar falhando sem mostrar erro na interface
3. **RLS (Row Level Security)**: Políticas de segurança podem estar bloqueando UPDATE

## Soluções Implementadas

### 1. Debug Completo Adicionado

**Arquivo**: `src/lib/controle-diario-api.ts`

```typescript
export async function atualizarDiaria(id: string, data: Partial<CreateRegistroDiariaData>): Promise<RegistroDiaria> {
  console.log('🔍 [atualizarDiaria] Iniciando atualização para ID:', id);
  console.log('🔍 [atualizarDiaria] Dados para atualizar:', data);
  // ... logs completos em cada etapa
}
```

### 2. Debug no Componente

**Arquivo**: `src/components/controle-diario/DiariasTab.tsx`

```typescript
const handleMarcarPago = async (diaria: RegistroDiaria) => {
  console.log('🔍 [handleMarcarPago] Iniciando marcação como pago para:', diaria);
  // ... logs completos
}
```

### 3. Melhor Tratamento de Erros

- Adicionado `.select()` no UPDATE para retornar dados atualizados
- Adicionado `updated_at` automaticamente
- Mensagens de erro mais descritivas

## Como Debuggar

### Passo 1: Abrir Console do Navegador

1. Abra o navegador (Chrome/Edge)
2. Pressione `F12` ou clique com botão direito → "Inspecionar"
3. Vá para a aba "Console"

### Passo 2: Recarregar a Página

Recarregue a página para ver os logs iniciais:
```
🔍 Diárias carregadas: [...]
```

### Passo 3: Clicar em "Marcar Pago"

Ao clicar no botão, você deve ver no console:

```
🔍 [handleMarcarPago] Iniciando marcação como pago para: {id: "...", ...}
🔍 [atualizarDiaria] Iniciando atualização para ID: ...
🔍 [atualizarDiaria] Dados para atualizar: {status_pagamento: "pago", ...}
✅ [atualizarDiaria] Diária atual encontrada: {...}
📤 [atualizarDiaria] Dados para UPDATE: {...}
```

### Passo 4: Verificar Erros

Se houver erro, você verá:

```
❌ [atualizarDiaria] Erro no UPDATE: {...}
```

Os erros mais comuns são:

1. **"column 'status_pagamento' does not exist"**
   - **Solução**: Aplicar migração `add_status_pagamento_diarias.sql`

2. **"permission denied for table controle_diario_diarias"**
   - **Solução**: Verificar RLS policies no Supabase

3. **"column 'updated_at' does not exist"**
   - **Solução**: Aplicar migração que adiciona `updated_at`

## Migrações Necessárias

### Aplicar Migração no Supabase

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Execute o arquivo: `db/migrations/add_status_pagamento_diarias.sql`

Este script:
- ✅ Adiciona colunas faltantes (`status_pagamento`, `data_pagamento`, `data_diaria`, `updated_at`)
- ✅ Atualiza registros existentes com `status_pagamento = 'pendente'`
- ✅ Cria índices para otimizar consultas

## Verificação Rápida

Após aplicar a migração, recarregue a página e verifique no console:

```javascript
🔍 Diárias carregadas: [
  { id: "...", colaborador: "João", status: "pendente", valor: 150 }
]
```

Se o `status` for `null` ou `undefined`, a migração não foi aplicada corretamente.

## Próximos Passos

1. **Aplicar migração no banco de dados** (via Supabase Dashboard)
2. **Verificar logs no console** ao clicar em "Marcar Pago"
3. **Compartilhar logs** se ainda houver erro

## Checklist de Verificação

- [ ] Migração aplicada no Supabase
- [ ] Console mostra diárias carregadas com status
- [ ] Logs aparecem ao clicar em "Marcar Pago"
- [ ] Sem erros no console
- [ ] Status muda para "pago" na interface
- [ ] Botão desaparece após marcar como pago


