# Alteração de Terminologia: "Valor do Contrato" para "Faturamento Previsto"

## Problema Identificado

O cliente solicitou que a terminologia "Valor do Contrato" fosse alterada para "Faturamento Previsto" em toda a interface da aplicação, para melhor refletir a natureza do valor exibido.

## Solução Implementada

### 1. Página de Detalhes da Obra (ObraDetails.tsx)

```diff
- <p className="text-sm font-medium text-gray-500">Valor Contrato</p>
+ <p className="text-sm font-medium text-gray-500">Faturamento Previsto</p>
```

### 2. Aba de Visão Geral (ObraVisaoGeralTab.tsx)

```diff
- <h3 className="text-sm font-medium text-gray-900">Valor do Contrato</h3>
+ <h3 className="text-sm font-medium text-gray-900">Faturamento Previsto</h3>

- <div className="text-sm text-gray-500">Valor contratado</div>
+ <div className="text-sm text-gray-500">Valor total previsto</div>

- <div className="text-sm text-gray-500">Restante do contrato</div>
+ <div className="text-sm text-gray-500">Restante do faturamento</div>
```

## Benefícios

1. **Terminologia mais precisa**: "Faturamento Previsto" reflete melhor o significado do valor exibido, que representa o valor total esperado para a obra.

2. **Consistência**: A terminologia foi alterada em toda a aplicação, garantindo uma experiência de usuário consistente.

3. **Clareza para o usuário**: Os termos agora são mais claros e alinhados com o vocabulário do negócio.

## Arquivos Modificados

1. `src/pages/obras/ObraDetails.tsx`
   - Alterado o título do card de "Valor Contrato" para "Faturamento Previsto"

2. `src/components/obras/ObraVisaoGeralTab.tsx`
   - Alterado o título do card de "Valor do Contrato" para "Faturamento Previsto"
   - Alterada a descrição de "Valor contratado" para "Valor total previsto"
   - Alterada a descrição de "Restante do contrato" para "Restante do faturamento"

## Como Verificar

1. Acesse a página de detalhes de uma obra
2. Verifique se o card superior exibe "Faturamento Previsto" em vez de "Valor Contrato"
3. Acesse a aba "Visão Geral"
4. Verifique se o primeiro card do resumo financeiro exibe "Faturamento Previsto" em vez de "Valor do Contrato"
5. Verifique se as descrições foram atualizadas conforme especificado

