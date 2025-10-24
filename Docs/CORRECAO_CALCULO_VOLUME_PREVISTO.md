# Correção do Cálculo de Volume Previsto

## Problema Identificado

O volume previsto não estava sendo contabilizado corretamente no resumo da obra. Isso ocorria porque:

1. Havia uma inconsistência entre os campos usados para o volume:
   - O formulário tinha dois campos: `volume_total_previsto` e `volume_planejamento`
   - O resumo estava usando `volume_total_previsto`, mas os dados estavam sendo inseridos em `volume_planejamento`

2. Isso causava um problema no cálculo de previsão de faturamento, que multiplicava o valor por m²/m³ pelo volume previsto, mas o volume estava sempre como 0.

## Solução Implementada

1. **Correção da Variável de Volume**:
   ```diff
   - const volumePrevisto = watch('volume_total_previsto') || 0
   + const volumePrevisto = watch('volume_planejamento') || 0
   ```

2. **Atualização do Resumo**:
   ```diff
   - {watch('volume_total_previsto')?.toFixed(1) || 0} m³
   + {watch('volume_planejamento')?.toFixed(1) || 0} m³
   ```

3. **Correção do Payload para Salvar Serviços**:
   - Adicionado `obra_id` ao mapear os serviços para salvar no banco de dados

## Benefícios

1. **Cálculo Correto**: Agora o valor previsto da obra é calculado corretamente, multiplicando o valor por m²/m³ pelo volume planejado.
2. **Consistência**: Os mesmos valores são usados em todo o formulário, evitando confusão.
3. **Dados Corretos**: Os serviços são salvos corretamente no banco de dados com o `obra_id`.

## Como Testar

1. Acesse: http://localhost:5173
2. Vá em: Obras → Nova Obra
3. Preencha o campo "Volume Total Previsto (m³)" na seção "Planejamento da Obra"
4. Adicione alguns serviços
5. Verifique se o resumo mostra o valor correto para "Previsão Faturamento M²/M³"
6. Confirme que o "Total Previsto da Obra" inclui o volume previsto no cálculo

## Arquivos Modificados

1. `src/pages/obras/NovaObra.tsx`
   - Corrigida a variável `volumePrevisto` para usar `volume_planejamento`
   - Atualizado o resumo para mostrar o valor correto
   - Corrigido o payload para salvar serviços incluindo `obra_id`

