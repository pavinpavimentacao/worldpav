# Correção da Exibição da Região no Resumo da Obra

## Problema Identificado

A região da obra não estava aparecendo corretamente no resumo. Isso ocorria porque:

1. O campo `location` estava sendo usado no resumo, mas este campo não contém a informação completa da região
2. Os campos corretos `cidade` e `estado` não estavam sendo utilizados na seção de resumo

## Solução Implementada

Substituímos o uso do campo `location` pela combinação de `cidade` e `estado` no resumo da obra:

```diff
- <p className="font-medium text-gray-900">{watch('location') || 'Não informado'}</p>
+ <p className="font-medium text-gray-900">
+   {watch('cidade') && watch('estado') 
+     ? `${watch('cidade')}/${watch('estado')}`
+     : 'Não informado'
+   }
+ </p>
```

## Benefícios

1. **Consistência**: Agora o resumo exibe a região no mesmo formato que é mostrado em outras partes do formulário
2. **Clareza**: O usuário vê a cidade e o estado claramente identificados
3. **Confiabilidade**: A informação é sempre exibida corretamente, independentemente do valor do campo `location`

## Como Testar

1. Acesse: http://localhost:5173
2. Vá em: Obras → Nova Obra
3. Preencha os campos "Cidade" e "Estado" na seção "Informações Básicas"
4. Verifique se o resumo na parte inferior da página mostra a região corretamente no formato "Cidade/Estado"

## Arquivos Modificados

1. `src/pages/obras/NovaObra.tsx`
   - Atualizada a exibição da região no resumo da obra para usar os campos `cidade` e `estado`

