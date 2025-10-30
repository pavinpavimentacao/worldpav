# Resumo: Alteração para salvar `tipo_equipe` em vez de apenas `equipe_id`

## ✅ Mudanças Implementadas

### 1. **Migração do Banco de Dados**
**Arquivo:** `worldpav/db/migrations/add_tipo_equipe_to_relatorios_diarios.sql`
- ✅ Adiciona coluna `tipo_equipe` na tabela `relatorios_diarios`
- ✅ Valores possíveis: `pavimentacao`, `maquinas`, `apoio`
- ✅ Adiciona índice para busca otimizada

### 2. **Interface CreateRelatorioDiarioData**
**Arquivo:** `worldpav/src/types/relatorios-diarios.ts`
- ✅ Adicionado campo `tipo_equipe?: string` na interface

### 3. **Interface EquipeSelecionavel**
**Arquivo:** `worldpav/src/types/relatorios-diarios.ts`
- ✅ Adicionado campo `tipo_equipe?: string` na interface

### 4. **API - Salvamento de `tipo_equipe`**
**Arquivo:** `worldpav/src/lib/relatoriosDiariosApi.ts`

#### `createRelatorioDiario()`:
```typescript
const insertData = {
  // ...
  tipo_equipe: data.tipo_equipe, // ✅ Salvar tipo de equipe
  // ...
}
```

#### `updateRelatorioDiario()`:
```typescript
if (data.tipo_equipe) updateData.tipo_equipe = data.tipo_equipe
```

#### `getRelatoriosDiarios()`:
```typescript
// ✅ Usar tipo_equipe diretamente do registro
if (item.tipo_equipe) {
  equipeNome = item.tipo_equipe === 'pavimentacao' ? 'Equipe A' : 
               item.tipo_equipe === 'maquinas' ? 'Equipe B' :
               item.tipo_equipe === 'apoio' ? 'Equipe C' :
               item.tipo_equipe
}
```

### 5. **Componente EquipeSelector**
**Arquivo:** `worldpav/src/components/relatorios-diarios/EquipeSelector.tsx`

- ✅ Interface atualizada: `onChange: (equipeId, isTerceira, tipoEquipe)`
- ✅ `handleChange` passa `tipo_equipe` para `onChange`
- ✅ Mapeamento inclui `tipo_equipe` no objeto da equipe

### 6. **Página Novo Relatório**
**Arquivo:** `worldpav/src/pages/relatorios-diarios/NovoRelatorioDiario.tsx`

- ✅ Estado `tipoEquipe` adicionado
- ✅ `onChange` captura `tipo_equipe` do EquipeSelector
- ✅ `tipo_equipe` enviado ao `createRelatorioDiario()`

### 7. **Função getEquipes**
**Arquivo:** `worldpav/src/lib/colaboradoresApi.ts`

- ✅ Retorna `tipo_equipe` nos objetos de equipe
- ✅ Logs mostram tipo de equipe criado

## 📋 Como Funciona Agora

### Fluxo de Criação:

1. **Usuário seleciona equipe** no `EquipeSelector`
2. **EquipeSelector** busca `tipo_equipe` do objeto da equipe
3. **NovoRelatorioDiario** recebe `tipo_equipe` via `onChange`
4. **createRelatorioDiario** salva:
   - `equipe_id`: ID do colaborador representante
   - `tipo_equipe`: 'pavimentacao' | 'maquinas' | 'apoio'
5. **Relatório criado** com ambos os campos

### Fluxo de Busca:

1. **getRelatoriosDiarios** busca relatórios do banco
2. **Busca `tipo_equipe` diretamente do registro** (prioridade)
3. **Mapeia para nome amigável:**
   - `'pavimentacao'` → `'Equipe A'`
   - `'maquinas'` → `'Equipe B'`
   - `'apoio'` → `'Equipe C'`
4. **Fallback:** Se não tiver `tipo_equipe`, busca no colaborador por `equipe_id`

## 🎯 Benefícios

### Antes:
- ❌ Salvava apenas `equipe_id` (ID de colaborador)
- ❌ Busca frágil (colaborador pode não existir)
- ❌ Dependência de relacionamento com colaborador

### Agora:
- ✅ Salva `tipo_equipe` (identificador estável)
- ✅ Busca direta do registro
- ✅ Maior confiabilidade
- ✅ Melhor performance (menos joins)
- ✅ Facilita relatórios por tipo de equipe

## 🔄 Compatibilidade

O sistema mantém **ambos os campos**:
- `equipe_id`: Para referência ao colaborador
- `tipo_equipe`: Para identificação da equipe (prioridade)

Isso garante compatibilidade com dados antigos e novos.

## 📝 Próximos Passos

1. **Aplicar migração SQL:**
   ```bash
   # No Supabase SQL Editor
   # Execute: add_tipo_equipe_to_relatorios_diarios.sql
   ```

2. **Testar criação de relatório:**
   - Selecionar equipe
   - Verificar se `tipo_equipe` é salvo corretamente
   - Verificar se exibe "Equipe A/B/C" corretamente

3. **Testar listagem:**
   - Verificar se equipes aparecem corretamente
   - Verificar logs no console

## 🎨 Mapeamento Visual

```
tipo_equipe → Nome Exibido
───────────────────────────
pavimentacao → Equipe A
maquinas     → Equipe B
apoio        → Equipe C
```


