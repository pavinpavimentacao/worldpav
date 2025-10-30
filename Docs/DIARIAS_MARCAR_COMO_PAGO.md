# Como Marcar Diárias Como Pago

## Problema Identificado

A funcionalidade de "Marcar como Pago" nas diárias não estava funcionando porque a coluna `status_pagamento` não existia na tabela `controle_diario_diarias` no banco de dados.

## Solução Implementada

### 1. Migração de Banco de Dados

Foi criada uma migração (`add_status_pagamento_diarias.sql`) que adiciona os seguintes campos:

- `status_pagamento` (TEXT DEFAULT 'pendente') - Status do pagamento: pendente, pago, cancelado
- `data_pagamento` (DATE) - Data em que o pagamento foi realizado
- `data_diaria` (DATE) - Data da diária (se não existir)
- `updated_at` (TIMESTAMPTZ) - Timestamp de atualização

### 2. Correções no Código

#### API (controle-diario-api.ts)

- Corrigido mapeamento de `observacoes` para `observations` (nome correto no banco)
- Função `atualizarDiaria` agora atualiza corretamente `status_pagamento` e `data_pagamento`

#### Componente (DiariasTab.tsx)

O componente já estava implementado corretamente:

```typescript
const handleMarcarPago = async (diaria: RegistroDiaria) => {
  try {
    const atualizada = await atualizarRegistroDiaria(diaria.id, {
      status_pagamento: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
    });

    if (atualizada) {
      setDiarias((prev) => prev.map((d) => (d.id === diaria.id ? atualizada : d)));
      toast.success('Diária marcada como paga!');
    }
  } catch (error: any) {
    toast.error('Erro ao marcar diária como paga');
  }
};
```

## Como Aplicar a Correção

### Opção 1: Via Script (Windows)

```bash
# Execute o script:
scripts/database/aplicar-migracao-status-pagamento-diarias.bat
```

### Opção 2: Via Supabase CLI

```bash
cd worldpav
supabase db push
```

### Opção 3: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá para "SQL Editor"
3. Copie o conteúdo do arquivo `db/migrations/add_status_pagamento_diarias.sql`
4. Execute o SQL

## Verificação

Após aplicar a migração, verifique se as colunas foram criadas:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'controle_diario_diarias'
AND column_name IN ('status_pagamento', 'data_pagamento', 'data_diaria', 'updated_at');
```

## Funcionalidade

Após aplicar a migração, a funcionalidade "Marcar como Pago" irá:

1. Alterar o `status_pagamento` para 'pago' ✅
2. Definir a `data_pagamento` com a data atual ✅
3. Atualizar o `updated_at` automaticamente ✅
4. Atualizar a interface para mostrar "✓ Pago" ✅
5. Contabilizar corretamente nas estatísticas ✅

## Problema: Botão "Marcar como Pago" Sumiu

### Causa
As diárias existentes no banco não têm o campo `status_pagamento` definido (NULL), então a condição `diaria.status_pagamento === 'pendente'` retorna `false`.

### Solução
A migração atualizada agora inclui:
```sql
-- Atualizar registros existentes para definir status_pagamento como 'pendente'
UPDATE public.controle_diario_diarias 
SET status_pagamento = 'pendente' 
WHERE status_pagamento IS NULL;
```

### Debug Adicionado
O componente agora mostra no console os status das diárias carregadas:
```javascript
console.log('🔍 Diárias carregadas:', data.map(d => ({ 
  id: d.id, 
  colaborador: d.colaborador_nome, 
  status: d.status_pagamento,
  valor: d.valor_total 
})));
```

## Status de Implementação

- [x] Migração criada
- [x] API corrigida
- [x] Componente verificado
- [x] Debug adicionado
- [x] Migração atualizada para corrigir registros existentes
- [ ] Migração aplicada no banco (pendente)
- [ ] Testado em produção

