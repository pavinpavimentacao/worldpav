# Implementação da Aba de Serviços e Correções na Página de Detalhes da Obra

## Problemas Identificados

1. **Região/Bairro não informado**: A região/bairro estava aparecendo como "Não informado" mesmo quando havia informações disponíveis.
2. **Faturamento Previsto incorreto**: O faturamento previsto não estava mostrando o valor calculado com base nos serviços adicionados.
3. **Ausência de gerenciamento de serviços**: Não havia uma aba específica para gerenciar os serviços da obra.

## Soluções Implementadas

### 1. Correção da Exibição da Região/Bairro

```diff
- <p className="text-sm text-gray-900">{obra.location || 'Não informado'}</p>
+ <p className="text-sm text-gray-900">{obra.location || obra.city || 'Não informado'}</p>
```

Agora, se o campo `location` não estiver preenchido, o sistema exibe o valor do campo `city`.

### 2. Correção do Faturamento Previsto

1. **Adição de função para calcular o valor total dos serviços**:
   ```typescript
   export async function calcularValorTotalServicos(obraId: string): Promise<number> {
     try {
       const servicos = await getServicosObra(obraId)
       return servicos.reduce((total, servico) => total + (servico.valor_total || 0), 0)
     } catch (error) {
       console.error('Erro ao calcular valor total dos serviços:', error)
       return 0
     }
   }
   ```

2. **Atualização do componente ObraDetails**:
   ```typescript
   const [faturamentoPrevisto, setFaturamentoPrevisto] = useState<number>(0)
   
   // Carregar o valor total dos serviços
   const valorServicos = await calcularValorTotalServicos(id)
   setFaturamentoPrevisto(valorServicos)
   ```

3. **Exibição do valor correto**:
   ```diff
   - {formatCurrency(obra.contract_value || 0)}
   + {formatCurrency(faturamentoPrevisto || 0)}
   ```

### 3. Criação da Aba de Serviços

1. **Adição da nova aba no menu de navegação**:
   ```typescript
   <button
     onClick={() => setActiveTab('servicos')}
     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
       activeTab === 'servicos'
         ? 'border-blue-500 text-blue-600'
         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
     }`}
   >
     <Settings className="h-4 w-4 mr-1 inline-block" />
     Serviços
   </button>
   ```

2. **Implementação do componente ObraServicosTab**:
   - Lista de serviços com funcionalidades de busca
   - Resumo financeiro mostrando o valor total dos serviços
   - Botão para adicionar novos serviços

3. **Implementação de modais para gerenciamento**:
   - `AdicionarServicoModal`: Para adicionar novos serviços
   - `EditarServicoModal`: Para editar serviços existentes
   - Confirmação de exclusão integrada na tabela

## Arquivos Criados/Modificados

1. **Modificados**:
   - `src/pages/obras/ObraDetails.tsx`
   - `src/components/obras/ObraVisaoGeralTab.tsx`
   - `src/lib/obrasServicosApi.ts`

2. **Criados**:
   - `src/components/obras/ObraServicosTab.tsx`
   - `src/components/obras/AdicionarServicoModal.tsx`
   - `src/components/obras/EditarServicoModal.tsx`

## Como Testar

1. **Região/Bairro**:
   - Acesse a página de detalhes de uma obra
   - Verifique se o campo Região/Bairro mostra o valor da cidade quando o campo location não está preenchido

2. **Faturamento Previsto**:
   - Adicione alguns serviços à obra
   - Verifique se o valor do "Faturamento Previsto" é atualizado corretamente

3. **Aba de Serviços**:
   - Clique na aba "Serviços"
   - Teste adicionar um novo serviço
   - Teste editar um serviço existente
   - Teste excluir um serviço
   - Verifique se o valor total é atualizado após cada operação

## Próximos Passos

1. Corrigir os erros de lint relacionados à propriedade `preco_por_m2` que não existe no tipo `Obra`
2. Implementar atualização automática do faturamento previsto na página principal quando serviços são modificados
3. Adicionar confirmação antes de excluir serviços

