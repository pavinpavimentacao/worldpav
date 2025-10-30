# 📋 PLANO DE IMPLEMENTAÇÃO - BANCO DE DADOS EM RELATÓRIOS DIÁRIOS

## 🎯 Objetivo

Conectar o módulo de **Relatórios Diários** ao banco de dados real, removendo os mockups e integrando com a funcionalidade de **Confirmação de Ruas** na Programação.

## 🔄 DOIS FLUXOS DE CRIAÇÃO

### ✅ **FLUXO 1: Criação Manual de Relatório**
O usuário pode criar um relatório diário manualmente através da página "Novo Relatório Diário":
- Escolhe cliente → obra → rua
- Preenche dados da execução (metragem, toneladas, equipe, maquinários)
- Salva o relatório
- Rua é finalizada automaticamente
- Faturamento é criado automaticamente

### ✅ **FLUXO 2: Criação Automática ao Confirmar Rua**
Ao confirmar uma rua na Programação de Pavimentação:
- Sistema cria o relatório automaticamente com os dados da execução
- Rua é finalizada automaticamente
- Faturamento é criado automaticamente

---

## 📊 Situação Atual

### ✅ Estrutura Existente

1. **Tabelas no Banco**:
   - `relatorios_diarios` ✅ (já existe com migration)
   - `relatorios_diarios_maquinarios` ✅ (já existe com migration)
   - `obras_ruas` ✅ (tabela base de ruas)
   - `obras_financeiro_faturamentos` ✅ (tabela de faturamento)

2. **API com Mockups**:
   - Arquivo: `src/lib/relatoriosDiariosApi.ts`
   - Flag `USE_MOCK = true`
   - Funções mockadas: `getRelatoriosDiarios()`, `getRelatorioDiarioById()`, `createRelatorioDiario()`

3. **Integração com Programação**:
   - Modal de confirmação já implementado
   - Cria relatório ao confirmar rua (mas usando mockups)
   - Não finaliza a rua no banco
   - Não cria faturamento no banco

---

## 🔧 Tarefas de Implementação

### **FASE 1: Atualizar API de Relatórios Diários**

#### 📝 Tarefa 1.1: Substituir Mockups por Supabase
- **Arquivo**: `src/lib/relatoriosDiariosApi.ts`
- **Ação**: Remover flag `USE_MOCK` e implementar queries reais
- **Funções a implementar**:
  1. `getRelatoriosDiarios()` - Buscar relatórios com filtros
  2. `getRelatorioDiarioById()` - Buscar relatório completo com maquinários
  3. `createRelatorioDiario()` - Criar novo relatório no banco
  4. `finalizarRua()` - Atualizar status da rua para `finalizada`
  5. `criarFaturamentoRua()` - Criar faturamento automático

#### 📝 Tarefa 1.2: Implementar JOINs com tabelas relacionadas
- Buscar nome do cliente (`clients`)
- Buscar nome da obra (`obras`)
- Buscar nome da rua (`obras_ruas`)
- Buscar maquinários vinculados (`relatorios_diarios_maquinarios`)

---

### **FASE 2: Integração com Confirmação de Ruas**

#### 📝 Tarefa 2.1: Mapear IDs Reais
**Problema**: Atualmente usando IDs mock como `obra-${programacaoSelecionada.id}`

**Solução**: Buscar IDs reais da programação no banco

**Arquivo**: `src/pages/programacao/ProgramacaoPavimentacaoList.tsx`

**Linhas a corrigir**:
```typescript
// ANTES (mock):
obra_id: `obra-${programacaoSelecionada.id}`,
rua_id: `rua-${programacaoSelecionada.id}`,

// DEPOIS (real):
obra_id: programacaoSelecionada.obra_id,
rua_id: programacaoSelecionada.rua_id,
```

#### 📝 Tarefa 2.2: Atualizar ProgramacaoPavimentacaoAPI
**Arquivo**: `src/lib/programacao-pavimentacao-api.ts`

**Função `confirmar()`**:
- Deve retornar programação atualizada
- Deve vincular `relatorio_diario_id` à programação

#### 📝 Tarefa 2.3: Finalizar Rua no Banco
**Função**: `finalizarRua()`

**Ação**:
```sql
UPDATE obras_ruas
SET 
  status = 'finalizada',
  relatorio_diario_id = :relatorio_id,
  data_finalizacao = :data_fim,
  metragem_executada = :metragem,
  toneladas_executadas = :toneladas
WHERE id = :rua_id
```

#### 📝 Tarefa 2.4: Criar Faturamento Automático
**Função**: `criarFaturamentoRua()`

**Ação**:
```sql
INSERT INTO obras_financeiro_faturamentos (
  obra_id,
  rua_id,
  metragem_executada,
  toneladas_utilizadas,
  espessura_calculada,
  preco_por_m2,
  valor_total,
  data_finalizacao
) VALUES (
  :obra_id,
  :rua_id,
  :metragem,
  :toneladas,
  :espessura,
  :preco_m2,
  :valor_total,
  :data_fim
)
```

---

### **FASE 3: Testes e Validação**

#### 📝 Tarefa 3.1: Testar Criação de Relatório
1. Acessar Programação
2. Confirmar uma rua
3. Verificar se relatório é criado no banco
4. Verificar se dados estão corretos

#### 📝 Tarefa 3.2: Testar Finalização de Rua
1. Verificar se status da rua muda para `finalizada`
2. Verificar se `relatorio_diario_id` é vinculado
3. Verificar se dados de execução são salvos

#### 📝 Tarefa 3.3: Testar Faturamento
1. Verificar se faturamento é criado automaticamente
2. Verificar se valores estão corretos
3. Verificar se espessura é calculada corretamente

#### 📝 Tarefa 3.4: Testar Visualização
1. Acessar página de Relatórios Diários
2. Verificar se relatórios aparecem
3. Verificar se detalhes estão corretos
4. Verificar se maquinários aparecem corretamente

---

## 🗂️ Estrutura de Arquivos a Modificar

```
worldpav/
├── src/
│   ├── lib/
│   │   └── relatoriosDiariosApi.ts ✏️ IMPLEMENTAR
│   │   └── programacao-pavimentacao-api.ts ✏️ AJUSTAR
│   │
│   ├── pages/
│   │   └── programacao/
│   │       └── ProgramacaoPavimentacaoList.tsx ✏️ AJUSTAR IDs
│
├── db/
│   └── migrations/
│       ├── create_relatorios_diarios_completo.sql ✅ JÁ EXISTE
│       └── verificar-migration-obras-ruas.sql ✅ JÁ EXISTE
```

---

## 🔄 Fluxo de Confirmação de Rua

### Antes (com Mockups):
```
Confirmar Rua → Mock Relatório → Mock Finalizar → Mock Faturamento
```

### Depois (com Banco):
```
Confirmar Rua 
  ↓
1. Criar Relatório Diário no banco
  ↓
2. Atualizar Rua (status = finalizada)
  ↓
3. Criar Faturamento automático
  ↓
4. Atualizar Programação (confirmada = true)
```

---

## 📊 Tabelas e Relacionamentos

### `relatorios_diarios`
```
id → UUID PRIMARY KEY
numero → VARCHAR(50) UNIQUE (auto-gerado: RD-YYYY-001)
cliente_id → UUID → clients(id)
obra_id → UUID → obras(id)
rua_id → UUID → obras_ruas(id)
equipe_id → UUID
data_inicio → DATE
data_fim → DATE
metragem_feita → DECIMAL(10,2)
toneladas_aplicadas → DECIMAL(10,2)
espessura_calculada → DECIMAL(5,2) (calculada automaticamente)
status → VARCHAR(20) DEFAULT 'finalizado'
created_at → TIMESTAMP
updated_at → TIMESTAMP
```

### `relatorios_diarios_maquinarios`
```
id → UUID PRIMARY KEY
relatorio_id → UUID → relatorios_diarios(id)
maquinario_id → UUID
is_terceiro → BOOLEAN
parceiro_id → UUID → parceiros(id)
created_at → TIMESTAMP
```

### `obras_ruas`
```
id → UUID PRIMARY KEY
obra_id → UUID → obras(id)
name → TEXT
status → VARCHAR (pendente, em_andamento, finalizada)
relatorio_diario_id → UUID → relatorios_diarios(id) ⭐ NOVO
data_finalizacao → DATE ⭐ NOVO
metragem_executada → DECIMAL(10,2) ⭐ NOVO
toneladas_executadas → DECIMAL(10,2) ⭐ NOVO
```

### `obras_financeiro_faturamentos`
```
id → UUID PRIMARY KEY
obra_id → UUID → obras(id)
rua_id → UUID → obras_ruas(id)
metragem_executada → DECIMAL(10,2)
toneladas_utilizadas → DECIMAL(10,2)
espessura_calculada → DECIMAL(10,2)
preco_por_m2 → DECIMAL(10,2)
valor_total → DECIMAL(10,2)
data_finalizacao → DATE
created_at → TIMESTAMP
```

---

## 🎯 Fórmulas Importantes

### Cálculo de Espessura
```typescript
// Fórmula: (toneladas / metragem / densidade) × 100
// Densidade do asfalto: 2.4 ton/m³
const espessura = (toneladas / metragem / 2.4) * 100;
// Resultado em centímetros
```

### Cálculo de Valor Total
```typescript
// Metragem × Preço por m²
const valorTotal = metragem * precoPorM2;
```

---

## ✅ Checklist de Implementação

- [ ] Remover flag `USE_MOCK` de `relatoriosDiariosApi.ts`
- [ ] Implementar `getRelatoriosDiarios()` com query real
- [ ] Implementar `getRelatorioDiarioById()` com JOIN de maquinários
- [ ] Implementar `createRelatorioDiario()` com insert real
- [ ] Implementar `finalizarRua()` com UPDATE na rua
- [ ] Implementar `criarFaturamentoRua()` com INSERT no faturamento
- [ ] Corrigir IDs mockados em `ProgramacaoPavimentacaoList.tsx`
- [ ] Adicionar busca de obra_id e rua_id na programação
- [ ] Testar criação de relatório
- [ ] Testar finalização de rua
- [ ] Testar criação de faturamento
- [ ] Testar visualização de relatórios
- [ ] Remover todos os mockups após validação

---

## 🚀 Ordem de Execução Recomendada

1. **Primeiro**: Implementar funções na `relatoriosDiariosApi.ts`
2. **Segundo**: Corrigir IDs na confirmação de ruas
3. **Terceiro**: Implementar `finalizarRua()` e `criarFaturamentoRua()`
4. **Quarto**: Testar todo o fluxo
5. **Quinto**: Remover mockups após validação

---

## 📝 Notas Importantes

1. **Triggers Automáticos**: A migration `create_relatorios_diarios_completo.sql` já cria triggers para:
   - Gerar número sequencial do relatório (RD-YYYY-001)
   - Calcular espessura automaticamente
   - Finalizar rua automaticamente ao criar relatório

2. **RLS Policies**: As tabelas já têm RLS habilitado para usuários autenticados

3. **Views**: Existe uma view `vw_relatorios_diarios_completo` que já faz JOINs necessários

4. **Índices**: Todas as tabelas já têm índices criados para performance

---

## 🎓 Exemplos de Uso

### Criar Relatório com Maquinários
```typescript
const relatorio = await createRelatorioDiario({
  cliente_id: 'uuid-cliente',
  obra_id: 'uuid-obra',
  rua_id: 'uuid-rua',
  equipe_id: 'uuid-equipe',
  data_inicio: '2024-03-15',
  data_fim: '2024-03-15',
  horario_inicio: '07:00',
  metragem_feita: 450,
  toneladas_aplicadas: 27,
  observacoes: 'Trabalho executado conforme planejado',
  maquinarios: [
    { id: 'uuid-maq-1', is_terceiro: false },
    { id: 'uuid-maq-2', is_terceiro: true, parceiro_id: 'uuid-parceiro' }
  ]
});
```

### Finalizar Rua e Criar Faturamento
```typescript
await finalizarRua(
  'uuid-rua',
  'uuid-relatorio',
  '2024-03-15',
  450,  // metragem
  27    // toneladas
);

await criarFaturamentoRua(
  'uuid-obra',
  'uuid-rua',
  450,  // metragem
  25    // preco m²
);
```

---

## ✅ Resultado Esperado

Após a implementação:

✅ Relatórios diários salvos no banco de dados  
✅ Ruas finalizadas automaticamente ao confirmar  
✅ Faturamentos criados automaticamente  
✅ Integração completa Programação → Relatórios → Faturamento  
✅ Sem mockups, tudo funcionando com banco real  

---

**Data de Criação**: 2024-03-15  
**Status**: 📋 Plano Criado - Aguardando Implementação  
**Próximo Passo**: Começar implementação da FASE 1

