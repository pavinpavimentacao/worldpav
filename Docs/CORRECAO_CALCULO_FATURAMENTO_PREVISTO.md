# Correção do Cálculo do Faturamento Previsto

## Problema Identificado

O faturamento previsto estava sendo calculado incorretamente, baseando-se apenas na soma dos valores dos serviços, sem considerar o volume de metragem previsto. O cálculo correto deve ser:

1. Para serviços por m²/m³: multiplicar o preço unitário pelo volume previsto
2. Para serviços fixos (mobilização/imobilização): usar o valor total diretamente

## Solução Implementada

### 1. Atualização da Função de Cálculo

Modificamos a função `calcularValorTotalServicos` em `src/lib/obrasServicosApi.ts` para:

1. Buscar o volume planejado da obra no banco de dados
2. Separar os serviços por tipo (m²/m³ vs. serviços fixos)
3. Calcular o valor por m²/m³ somando os preços unitários
4. Multiplicar esse valor pelo volume previsto
5. Adicionar os valores fixos (mobilização/imobilização)

```typescript
export async function calcularValorTotalServicos(obraId: string): Promise<number> {
  try {
    // Buscar os serviços da obra
    const servicos = await getServicosObra(obraId)
    
    // Buscar dados da obra para obter o volume previsto
    const { data: obra } = await supabase
      .from('obras')
      .select('volume_planejamento')
      .eq('id', obraId)
      .single()
    
    const volumePrevisto = obra?.volume_planejamento || 0
    
    // Separar serviços por tipo
    const servicosM2M3 = servicos.filter(s => s.unidade === 'm2' || s.unidade === 'm3')
    const servicosMobilizacao = servicos.filter(s => s.unidade === 'servico' || s.unidade === 'viagem')
    
    // Calcular valor total por M²/M³
    const valorPorM2M3 = servicosM2M3.reduce((total, servico) => total + servico.preco_unitario, 0)
    
    // Multiplicar pelo volume previsto
    const previsaoFaturamentoM2M3 = valorPorM2M3 * volumePrevisto
    
    // Valor das mobilizações (fixo)
    const totalMobilizacao = servicosMobilizacao.reduce((total, servico) => total + servico.valor_total, 0)
    
    // Total previsto da obra
    return previsaoFaturamentoM2M3 + totalMobilizacao
  } catch (error) {
    console.error('Erro ao calcular valor total dos serviços:', error)
    return 0
  }
}
```

### 2. Atualização da Interface `Obra`

Adicionamos os campos necessários à interface `Obra` em `src/lib/obrasApi.ts`:

```typescript
export interface Obra {
  // ... campos existentes
  preco_por_m2?: number | null
  volume_planejamento?: number | null
}
```

### 3. Atualização da Exibição

Modificamos os componentes para exibir o faturamento previsto corretamente:

- `src/pages/obras/ObraDetails.tsx`
- `src/components/obras/ObraVisaoGeralTab.tsx`

## Como Testar

1. Crie uma nova obra com:
   - Volume planejado (ex: 1.000 m³)
   - Adicione serviços por m² ou m³ (ex: Pavimentação a R$ 45,00/m²)
   - Adicione serviços fixos (ex: Mobilização a R$ 2.500,00)

2. Verifique se o faturamento previsto é calculado corretamente:
   - Valor por m² × Volume + Valores fixos
   - Ex: (R$ 45,00 × 1.000) + R$ 2.500,00 = R$ 47.500,00

## Benefícios

1. **Precisão**: O faturamento previsto agora reflete com precisão o valor esperado da obra
2. **Consistência**: O cálculo é consistente em toda a aplicação
3. **Clareza**: Os usuários podem entender facilmente como o valor é calculado

## Próximos Passos

1. Implementar atualização automática do faturamento previsto quando o volume planejado é alterado
2. Adicionar uma visualização detalhada do cálculo na interface
3. Considerar diferentes unidades de cobrança (m², m³, diária) no cálculo

