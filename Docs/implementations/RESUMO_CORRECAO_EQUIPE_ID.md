# Correção - Campo equipe_id na Finalização de Ruas

## ✅ Problema Identificado

Ao tentar confirmar a finalização de uma rua na programação de pavimentação, o seguinte erro ocorria:

```
invalid input syntax for type uuid: "A"
```

**Causa Raiz:** O campo `equipe_id` estava recebendo o valor `prefixo_equipe` (ex: "A") em vez de um UUID válido. O banco de dados espera um UUID ou NULL para esse campo.

## 🔧 Correção Aplicada

**Arquivo:** `worldpav/src/pages/programacao/ProgramacaoPavimentacaoList.tsx`

**Linha 170:** Removido o campo `equipe_id` da criação do relatório, já que é opcional e não temos o ID real da equipe (apenas o prefixo).

**Antes:**
```typescript
equipe_id: programacaoSelecionada.prefixo_equipe, // Usando prefixo por enquanto
```

**Depois:**
```typescript
// equipe_id não é obrigatório e não temos o ID real da equipe, apenas o prefixo
```

## 📋 Motivo da Correção

1. O campo `equipe_id` na interface `CreateRelatorioDiarioData` é opcional (`equipe_id?: string`)
2. A programação não armazena o UUID da equipe, apenas o prefixo (ex: "A", "B", etc.)
3. O banco de dados não aceita string simples como UUID, causando o erro

## 🎯 Resultado Esperado

Após essa correção:
1. ✅ O relatório diário é criado sem tentar passar um UUID inválido
2. ✅ O campo `equipe_id` ficará NULL no banco de dados (valor padrão permitido)
3. ✅ A finalização da rua acontece sem erros
4. ✅ O faturamento é gerado corretamente

## 🚀 Como Testar

1. Recarregue a página do navegador
2. Vá para a página de Programação de Pavimentação
3. Tente confirmar uma rua programada
4. O relatório deve ser criado com sucesso
5. A rua deve ser finalizada e o faturamento gerado


