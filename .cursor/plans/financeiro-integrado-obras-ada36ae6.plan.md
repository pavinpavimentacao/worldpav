<!-- ada36ae6-fdb6-497f-9a49-a94c09522cc0 ac572815-b138-46c0-87dd-577915467e74 -->
# Plano: Sistema Financeiro Integrado de Obras

## 1. Estrutura de Banco de Dados

### 1.1 Tabela `obras_ruas`

Cadastro prévio de ruas da obra:

- `id` (UUID)
- `obra_id` (referência para obras)
- `nome` (string, nome da rua)
- `metragem_planejada` (nullable, m²)
- `status` (enum: 'pendente', 'em_andamento', 'finalizada')
- `ordem` (integer, para ordenação)
- `observacoes` (text)
- `created_at`, `updated_at`

### 1.2 Tabela `obras_financeiro_faturamentos`

Armazena faturamentos gerados quando ruas são finalizadas:

- `id` (UUID)
- `obra_id` (referência para obras)
- `rua_id` (referência para obras_ruas)
- `metragem_executada` (m²)
- `toneladas_utilizadas` (decimal)
- `espessura_calculada` (decimal, calculada: toneladas / metragem / 2.4)
- `preco_por_m2` (R$ do serviço principal da obra)
- `valor_total` (metragem × preço)
- `status` (enum: 'pendente', 'pago')
- `data_finalizacao` (data que a rua foi finalizada)
- `data_pagamento` (nullable, quando status muda para 'pago')
- `nota_fiscal` (nullable, string)
- `observacoes` (text)
- `created_at`, `updated_at`

### 1.3 Tabela `obras_financeiro_despesas`

Armazena todas as despesas vinculadas a cada obra:

- `id` (UUID)
- `obra_id` (referência para obras)
- `categoria` (enum: 'diesel', 'materiais', 'manutencao', 'outros')
- `descricao` (text)
- `valor` (decimal)
- `data_despesa` (date)
- `maquinario_id` (nullable, quando é diesel)
- `fornecedor` (nullable, string)
- `comprovante_url` (nullable, string)
- `sincronizado_financeiro_principal` (boolean, default true)
- `financeiro_principal_id` (nullable, referência para expenses)
- `created_at`, `updated_at`

### 1.4 Tabela `maquinarios_diesel`

Registros de abastecimento de diesel por maquinário:

- `id` (UUID)
- `maquinario_id` (referência)
- `obra_id` (nullable, obra onde será usado)
- `quantidade_litros` (decimal)
- `preco_por_litro` (decimal)
- `valor_total` (decimal)
- `data_abastecimento` (date)
- `posto` (string)
- `km_hodometro` (nullable, decimal)
- `observacoes` (text)
- `despesa_obra_id` (nullable, referência para obras_financeiro_despesas)
- `created_at`, `updated_at`

## 2. API/Services para Financeiro de Obras

### 2.1 Criar arquivo `src/lib/obrasRuasApi.ts`

Funções para gerenciar ruas:

- `getObrasRuas(obraId)` - Lista todas as ruas da obra
- `createRua(data)` - Criar nova rua
- `updateRua(id, data)` - Editar rua
- `deleteRua(id)` - Excluir rua
- `updateRuaStatus(id, status)` - Alterar status da rua

### 2.2 Criar arquivo `src/lib/obrasFinanceiroApi.ts`

Funções principais:

- `getObraFaturamentos(obraId, filters)` - Lista faturamentos da obra
- `getObraDespesas(obraId, filters)` - Lista despesas da obra
- `getObraResumoFinanceiro(obraId, mesAno?)` - Resumo: faturado, gasto, lucro
- `createFaturamentoRua(data)` - Criar faturamento ao finalizar rua (calcula espessura automaticamente)
- `updateFaturamentoStatus(id, status, dataPagamento?, notaFiscal?)` - Alterar status
- `createDespesaObra(data)` - Criar despesa manual
- `deleteDespesaObra(id)` - Excluir despesa
- `getObraFinanceiroMensal(obraId, ano)` - Dados mensais para gráficos

### 2.3 Criar arquivo `src/lib/maquinariosDieselApi.ts`

Funções principais:

- `getMaquinarioDiesel(maquinarioId)` - Lista abastecimentos
- `createAbastecimentoDiesel(data)` - Adicionar diesel (com obra opcional)
- `updateAbastecimentoDiesel(id, data)` - Editar
- `deleteAbastecimentoDiesel(id)` - Excluir
- `getMaquinarioDieselStats(maquinarioId, periodo)` - Estatísticas consumo

## 3. Componentes de Interface

### 3.1 Criar `src/components/obras/ObraFinanceiroTab.tsx`

Dashboard financeiro da obra com:

- Cards de resumo (Total Faturado, Total Despesas, Lucro Líquido, Faturamento Pendente)
- Gráfico de linha: Faturamento vs Despesas por mês
- Gráfico de pizza: Distribuição de despesas por categoria
- Tabela de faturamentos com ações (marcar como pago, adicionar nota fiscal)
- Tabela de despesas com filtros por categoria
- Botão flutuante "Adicionar Despesa"
- Filtro por período (mês/ano)

### 3.2 Criar `src/components/obras/ObraRuasTab.tsx`

Gerenciamento de ruas da obra:

- Lista de ruas cadastradas com status (pendente, em andamento, finalizada)
- Botão "Adicionar Rua"
- Botão "Finalizar" para cada rua pendente/em andamento
- Exibir metragem planejada e executada de cada rua
- Permitir reordenar ruas (drag and drop ou botões up/down)

### 3.3 Criar `src/components/obras/AdicionarRuaModal.tsx`

Modal para cadastrar nova rua:

- Input: Nome da rua
- Input: Metragem planejada (opcional)
- Textarea: Observações
- Botões: Cancelar, Salvar

### 3.4 Criar `src/components/obras/FinalizarRuaModal.tsx`

Modal para finalizar rua e gerar faturamento:

- Display: Nome da rua (readonly, vem da rua selecionada)
- Input: Metragem executada (m²)
- Input: Toneladas utilizadas
- Display calculado: Espessura (toneladas / metragem / 2.4)
- Display: Preço por m² (vem da obra)
- Display calculado: Valor total (metragem × preço)
- Textarea: Observações
- Botões: Cancelar, Finalizar Rua

### 3.5 Criar `src/components/obras/AdicionarDespesaModal.tsx`

Modal para adicionar despesa manual:

- Select: Categoria (Materiais, Manutenção, Outros)
- Input: Descrição
- Input: Valor (R$)
- DatePicker: Data da despesa
- Input: Fornecedor (opcional)
- Upload: Comprovante (opcional)
- Checkbox: Sincronizar com financeiro principal (default: checked)

### 3.6 Criar `src/components/maquinarios/DieselTab.tsx`

Aba de diesel na página de detalhes do maquinário:

- Cards de resumo (Total Litros, Gasto Total, Média por Litro, Consumo Médio)
- Gráfico: Consumo ao longo do tempo
- Tabela de abastecimentos com obra vinculada
- Botão "Adicionar Abastecimento"

### 3.7 Criar `src/components/maquinarios/AdicionarDieselModal.tsx`

Modal para adicionar diesel:

- Input: Quantidade de litros
- Input: Preço por litro
- Display calculado: Valor total
- DatePicker: Data do abastecimento
- Input: Posto/Fornecedor
- Input: KM/Horímetro (opcional)
- Select: Obra (opcional, lista obras ativas)
- Textarea: Observações
- Info: Se obra selecionada, avisa que será criada despesa automática

## 4. Atualização de Páginas Existentes

### 4.1 Modificar `src/pages/obras/ObraDetails.tsx`

Adicionar sistema de abas:

- Aba "Visão Geral" (conteúdo atual)
- Aba "Ruas" (novo componente ObraRuasTab)
- Aba "Financeiro" (novo componente ObraFinanceiroTab)
- Na seção superior, adicionar card de "Lucro da Obra" ao lado dos KPIs existentes

### 4.2 Modificar `src/pages/maquinarios/DetalhesMaquinario.tsx`

Adicionar aba "Diesel" com componente DieselTab

### 4.3 Atualizar `src/pages/financial/FinancialDashboard.tsx`

Modificar para incluir dados das obras:

- No cálculo de despesas totais, incluir `obras_financeiro_despesas` sincronizadas
- No cálculo de receitas, incluir faturamentos de obras com status 'pago'
- Adicionar filtro opcional "Por Obra" nos filtros avançados
- Nos gráficos de categorias, incluir "Despesas de Obras" como categoria
- Manter lógica de mês civil (dia 01 a 31)

## 5. Utilitários e Helpers

### 5.1 Criar `src/utils/financeiro-obras-utils.ts`

Funções auxiliares:

- `calcularEspessura(toneladas, metragem)` - Fórmula: toneladas / metragem / 2.4
- `calcularFaturamentoRua(metragem, precoPorM2)` - Calcula valor
- `calcularResumoFinanceiro(faturamentos, despesas)` - Totaliza
- `formatarStatusFaturamento(status)` - Badge component
- `formatarStatusRua(status)` - Badge component para ruas
- `validarFinalizacaoRua(data)` - Validações
- `getMesCivil(data)` - Retorna início e fim do mês civil
- `agruparPorMesCivil(items, campoData)` - Agrupa por mês (01-31)

Constante importante:

```typescript
export const DENSIDADE_ASFALTO = 2.4
```

### 5.2 Criar `src/utils/diesel-calculations.ts`

Funções auxiliares:

- `calcularValorAbastecimento(litros, precoPorLitro)` - Calcula total
- `calcularConsumoMedio(abastecimentos)` - Estatísticas
- `formatarConsumo(valor)` - Formata para exibição

## 6. Types e Interfaces

### 6.1 Criar `src/types/obras-financeiro.ts`

```typescript
export interface ObraRua {
  id: string
  obra_id: string
  nome: string
  metragem_planejada?: number
  status: 'pendente' | 'em_andamento' | 'finalizada'
  ordem: number
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface ObraFaturamento {
  id: string
  obra_id: string
  rua_id: string
  rua?: ObraRua
  metragem_executada: number
  toneladas_utilizadas: number
  espessura_calculada: number
  preco_por_m2: number
  valor_total: number
  status: 'pendente' | 'pago'
  data_finalizacao: string
  data_pagamento?: string
  nota_fiscal?: string
  observacoes?: string
  created_at: string
}

export interface ObraDespesa {
  id: string
  obra_id: string
  categoria: 'diesel' | 'materiais' | 'manutencao' | 'outros'
  descricao: string
  valor: number
  data_despesa: string
  maquinario_id?: string
  fornecedor?: string
  sincronizado_financeiro_principal: boolean
  created_at: string
}

export interface ObraResumoFinanceiro {
  total_faturado: number
  total_pendente: number
  total_despesas: number
  lucro_liquido: number
  despesas_por_categoria: Record<string, number>
}
```

### 6.2 Criar `src/types/maquinarios-diesel.ts`

```typescript
export interface MaquinarioDiesel {
  id: string
  maquinario_id: string
  obra_id?: string
  obra?: { id: string, nome: string }
  quantidade_litros: number
  preco_por_litro: number
  valor_total: number
  data_abastecimento: string
  posto: string
  km_hodometro?: number
  observacoes?: string
  created_at: string
}
```

## 7. SQL Scripts

### 7.1 Criar `db/migrations/create_obras_financeiro.sql`

Scripts de criação das 4 tabelas mencionadas acima (obras_ruas, obras_financeiro_faturamentos, obras_financeiro_despesas, maquinarios_diesel) com:

- Políticas RLS apropriadas
- Índices para performance
- Triggers para updated_at
- Foreign keys com ON DELETE CASCADE

## 8. Regras de Negócio Implementadas

- Ruas devem ser cadastradas antes de serem finalizadas
- Faturamento calculado: `metragem_executada × preco_por_m2`
- Espessura calculada: `toneladas_utilizadas / metragem_executada / 2.4` (densidade fixa)
- Status de faturamento: apenas 'pendente' e 'pago'
- Status de rua: 'pendente', 'em_andamento', 'finalizada'
- Diesel vinculado a obra cria despesa automática na obra E no financeiro principal
- Mão de obra (folha salarial) não entra no financeiro por obra, apenas no geral
- Todos os cálculos mensais usam mês civil (dia 01 ao dia 31)
- Despesas podem opcionalmente não sincronizar com financeiro principal
- Ao deletar despesa de diesel, também remove registro de abastecimento

## 9. Fluxo de Trabalho

### Cadastrar Rua:

1. Usuário vai em "Obras" > Detalhes da Obra > aba "Ruas"
2. Clica "Adicionar Rua"
3. Preenche nome e opcionalmente metragem planejada
4. Rua é criada com status 'pendente'

### Finalizar Rua:

1. Usuário seleciona rua com status 'pendente' ou 'em_andamento'
2. Clica "Finalizar Rua"
3. Modal abre mostrando nome da rua
4. Preenche: metragem executada e toneladas utilizadas
5. Sistema calcula automaticamente a espessura (toneladas / metragem / 2.4)
6. Sistema calcula valor total (metragem × preço/m²)
7. Cria registro em `obras_financeiro_faturamentos` com status 'pendente'
8. Atualiza status da rua para 'finalizada'
9. Atualiza resumo financeiro da obra

### Adicionar Diesel:

1. Usuário entra em "Detalhes do Maquinário" > aba "Diesel"
2. Clica "Adicionar Abastecimento"
3. Preenche dados, opcionalmente seleciona obra
4. Sistema cria registro em `maquinarios_diesel`
5. Se obra selecionada: cria despesa em `obras_financeiro_despesas` (categoria diesel)
6. Cria também despesa em `expenses` (financeiro principal) com referência cruzada

### Marcar Faturamento como Pago:

1. Usuário vai em "Financeiro" da obra
2. Na tabela de faturamentos, clica em "Marcar como Pago"
3. Modal solicita data de pagamento e número da nota fiscal
4. Atualiza status para 'pago' e registra no financeiro principal como receita

## Observações Importantes

- Toda lógica de datas deve usar mês civil (01-31), não últimos 30 dias
- Gráficos devem ser limpos, diretos e profissionais (sem excessos)
- Validar que obra tem preço por m² definido antes de permitir finalizar rua
- Ao vincular diesel a obra, mostrar alerta claro de que será criada despesa
- Permitir filtrar despesas por maquinário na aba financeiro da obra
- Dashboard deve carregar rápido mesmo com muitos dados (usar paginação)
- A densidade do asfalto (2.4) é constante e deve estar em um arquivo de constantes
- Exibir espessura calculada com 2 casas decimais

### To-dos

- [ ] Criar migrations SQL para tabelas obras_financeiro_faturamentos, obras_financeiro_despesas e maquinarios_diesel
- [ ] Criar types TypeScript para obras-financeiro.ts e maquinarios-diesel.ts
- [ ] Criar utils financeiro-obras-utils.ts com funções de cálculo e formatação
- [ ] Criar utils diesel-calculations.ts para cálculos de consumo
- [ ] Implementar obrasFinanceiroApi.ts com todas as funções de CRUD e estatísticas
- [ ] Implementar maquinariosDieselApi.ts para gestão de abastecimentos
- [ ] Criar componente ObraFinanceiroTab com dashboard completo
- [ ] Criar modal FinalizarRuaModal para gerar faturamentos
- [ ] Criar modal AdicionarDespesaModal para despesas manuais
- [ ] Criar componente DieselTab para maquinários
- [ ] Criar modal AdicionarDieselModal com integração automática a obras
- [ ] Adicionar sistema de abas em ObraDetails (Visão Geral, Financeiro, Ruas)
- [ ] Adicionar aba Diesel em DetalhesMaquinario
- [ ] Integrar dados das obras no FinancialDashboard principal
- [ ] Testar fluxo completo: finalizar rua, adicionar diesel, sincronização com financeiro