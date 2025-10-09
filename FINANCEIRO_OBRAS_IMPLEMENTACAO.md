# Sistema Financeiro Integrado de Obras - Guia de Implementação

## ✅ Componentes Implementados

### 1. Banco de Dados
- ✅ **SQL Migration**: `db/migrations/create_obras_financeiro.sql`
  - Tabela `obras_ruas` - Cadastro de ruas das obras
  - Tabela `obras_financeiro_faturamentos` - Faturamentos por rua finalizada
  - Tabela `obras_financeiro_despesas` - Despesas específicas de obras
  - Tabela `maquinarios_diesel` - Controle de abastecimento de diesel
  - Políticas RLS configuradas
  - Índices para performance
  - Triggers para updated_at

### 2. Types TypeScript
- ✅ `src/types/obras-financeiro.ts` - Types para sistema financeiro de obras
- ✅ `src/types/maquinarios-diesel.ts` - Types para diesel dos maquinários

### 3. Utilitários
- ✅ `src/utils/financeiro-obras-utils.ts` - Cálculos e formatações financeiras
- ✅ `src/utils/diesel-calculations.ts` - Cálculos de consumo de diesel

### 4. APIs/Services
- ✅ `src/lib/obrasRuasApi.ts` - CRUD de ruas das obras
- ✅ `src/lib/obrasFinanceiroApi.ts` - Faturamentos e despesas
- ✅ `src/lib/maquinariosDieselApi.ts` - Gerenciamento de diesel

### 5. Modais
- ✅ `src/components/obras/AdicionarRuaModal.tsx` - Modal para cadastrar ruas
- ✅ `src/components/obras/FinalizarRuaModal.tsx` - Modal para finalizar rua e gerar faturamento
- ✅ `src/components/obras/AdicionarDespesaModal.tsx` - Modal para adicionar despesas manuais
- ✅ `src/components/maquinarios/AdicionarDieselModal.tsx` - Modal para adicionar diesel

### 6. Componentes de Abas
- ✅ `src/components/obras/ObraRuasTab.tsx` - Gerenciamento de ruas da obra
- ✅ `src/components/obras/ObraFinanceiroTab.tsx` - Dashboard financeiro da obra
- ✅ `src/components/maquinarios/DieselTab.tsx` - Controle de diesel por maquinário

### 7. Páginas Atualizadas
- ✅ `src/pages/obras/ObraDetails.tsx` - Sistema de abas adicionado (Visão Geral, Ruas, Financeiro)

## 📋 Próximos Passos para Finalizar

### Passo 1: Aplicar o SQL no Supabase

```bash
# Execute o script SQL no Supabase
# Vá para: Supabase Dashboard > SQL Editor
# Copie e cole o conteúdo de: db/migrations/create_obras_financeiro.sql
# Execute o script
```

### Passo 2: Adicionar Aba de Diesel aos Maquinários

Editar `/src/pages/maquinarios/DetalhesMaquinario.tsx`:

1. Adicionar imports no topo do arquivo:
```typescript
import { DieselTab } from '../../components/maquinarios/DieselTab'
```

2. Adicionar state para as abas (se ainda não existir):
```typescript
const [activeTab, setActiveTab] = useState<'info' | 'obras' | 'diesel' | 'cola'>('info')
```

3. Adicionar botão da aba "Diesel" na navegação de tabs:
```tsx
<button
  onClick={() => setActiveTab('diesel')}
  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
    activeTab === 'diesel'
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700'
  }`}
>
  <Fuel className="h-4 w-4 inline mr-2" />
  Diesel
</button>
```

4. Adicionar o conteúdo da aba:
```tsx
{activeTab === 'diesel' && (
  <DieselTab maquinarioId={id || ''} />
)}
```

### Passo 3: Atualizar o Modelo de Obras

Adicionar o campo `preco_por_m2` na tabela `obras` (se ainda não existir):

```sql
ALTER TABLE obras ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2);
```

Depois, atualizar `ObraDetails.tsx` para buscar esse valor do banco ao invés de usar valor hardcoded:

```typescript
// Substituir esta linha:
precoPorM2={25}

// Por:
precoPorM2={obra.preco_por_m2 || 25}
```

### Passo 4: Integração com Financeiro Principal

Implementar a sincronização automática das despesas de obras com o financeiro principal. Descomentar e implementar as seções TODO em:

- `src/lib/obrasFinanceiroApi.ts` (linha ~98)
- `src/lib/maquinariosDieselApi.ts` (linha ~142, 162)

```typescript
// Exemplo de implementação:
if (input.sincronizado_financeiro_principal) {
  const { data: expense } = await supabase
    .from('expenses')
    .insert({
      description: input.descricao,
      amount: input.valor,
      date: input.data_despesa,
      category: 'obra',
      obra_id: input.obra_id
    })
    .select()
    .single()
  
  // Guardar referência
  updateData.financeiro_principal_id = expense.id
}
```

### Passo 5: Atualizar Dashboard Financeiro

Modificar `src/pages/financial/FinancialDashboard.tsx` para incluir despesas de obras:

```typescript
// Buscar despesas de obras sincronizadas
const { data: obrasDespesas } = await supabase
  .from('obras_financeiro_despesas')
  .select('*')
  .eq('sincronizado_financeiro_principal', true)
  .gte('data_despesa', dataInicio)
  .lte('data_despesa', dataFim)

// Incluir no cálculo total de despesas
const totalDespesas = [...expenses, ...obrasDespesas].reduce(...)

// Buscar faturamentos pagos
const { data: obrasFaturamentos } = await supabase
  .from('obras_financeiro_faturamentos')
  .select('*')
  .eq('status', 'pago')
  .gte('data_pagamento', dataInicio)
  .lte('data_pagamento', dataFim)

// Incluir no cálculo de receitas
const totalReceitas = [...revenues, ...obrasFaturamentos].reduce(...)
```

## 🎯 Funcionalidades Principais

### Gerenciamento de Ruas
1. Cadastrar ruas antes da execução
2. Definir metragem planejada (opcional)
3. Reordenar ruas (up/down)
4. Finalizar rua gerando faturamento automático
5. Cálculo automático de espessura (ton / m² / 2.4)

### Controle Financeiro por Obra
1. **Faturamentos**:
   - Gerados automaticamente ao finalizar ruas
   - Status: Pendente → Pago
   - Registro de nota fiscal
   - Cálculo automático de espessura e valor

2. **Despesas**:
   - Categorias: Diesel, Materiais, Manutenção, Outros
   - Sincronização com financeiro principal
   - Filtros por categoria
   - Despesas de diesel criadas automaticamente via maquinários

3. **Resumo Financeiro**:
   - Total Faturado
   - Total Pendente
   - Total Despesas
   - Lucro Líquido

### Controle de Diesel
1. Registro de abastecimentos por maquinário
2. Vinculação opcional a obras
3. Criação automática de despesa na obra
4. Estatísticas de consumo
5. Histórico completo

## 📊 Regras de Negócio

### Cálculos
- **Espessura**: `toneladas / metragem / 2.4` (densidade do asfalto)
- **Faturamento**: `metragem_executada × preco_por_m2`
- **Valor Diesel**: `litros × preco_por_litro`
- **Conversão base**: `1.000 m² = 100 toneladas`

### Mês Civil
- Todos os cálculos mensais usam dia 01 a 31
- Não usar "últimos 30 dias"
- Agrupar por ano-mês (YYYY-MM)

### Sincronização
- Despesas de obras podem sincronizar com financeiro principal
- Diesel vinculado a obra cria despesa automática
- Mão de obra (folha salarial) NÃO entra por obra, apenas no geral

## ⚠️ Notas Importantes

1. **Validações**: Todos os modais possuem validação de formulário
2. **Toast Messages**: Sistema de notificações implementado
3. **Loading States**: Indicadores de carregamento em todas as operações
4. **Error Handling**: Try/catch em todas as operações assíncronas
5. **RLS**: Políticas de segurança configuradas no Supabase
6. **Performance**: Índices criados nas colunas mais consultadas

## 🔧 Testando o Sistema

### Fluxo Completo de Teste

1. **Criar Obra** → Acessar detalhes da obra
2. **Aba Ruas** → Adicionar 3-4 ruas
3. **Finalizar Rua** → Preencher metragem e toneladas, verificar cálculo de espessura
4. **Aba Financeiro** → Verificar faturamento pendente
5. **Marcar como Pago** → Adicionar nota fiscal
6. **Adicionar Despesa** → Testar despesa manual de materiais
7. **Maquinários** → Aba Diesel → Adicionar abastecimento com obra vinculada
8. **Verificar Despesa** → Aba Financeiro da obra deve mostrar diesel
9. **Resumo** → Verificar cálculos de lucro líquido

## 📝 Checklist de Implementação

- [x] SQL migrations criadas
- [x] Types TypeScript definidos
- [x] Utilitários de cálculo implementados
- [x] APIs/Services implementadas
- [x] Modais criados
- [x] Componentes de abas criados
- [x] Página de obras atualizada
- [ ] SQL aplicado no Supabase
- [ ] Campo preco_por_m2 adicionado em obras
- [ ] Aba Diesel adicionada em maquinários
- [ ] Sincronização com financeiro principal implementada
- [ ] Dashboard financeiro atualizado com dados de obras
- [ ] Testes realizados

## 🚀 Deploy

Após completar os passos acima:

1. Testar localmente
2. Fazer commit das mudanças
3. Push para repositório
4. Deploy automático (Vercel/Netlify)

## 💡 Melhorias Futuras

- Gráficos de faturamento vs despesas por obra
- Exportação de relatórios financeiros por obra
- Dashboard consolidado de todas as obras
- Previsão de lucro com base em ruas restantes
- Alertas de despesas acima do orçamento
- Histórico de preço de diesel por período


