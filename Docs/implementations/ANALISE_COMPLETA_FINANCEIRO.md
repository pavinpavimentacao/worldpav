# 📊 ANÁLISE DETALHADA - MÓDULO FINANCEIRO

**Data:** 2025-01-27  
**Sistema:** WorldPav - Gestão de Asfalto

---

## 🎯 VISÃO GERAL

O módulo financeiro do WorldPav está estruturado em **4 pilares principais**:

1. **Contas a Pagar** (Despesas da empresa)
2. **Recebimentos** (Receitas de obras)
3. **Pagamentos Diretos** (PIX/Transferências)
4. **Notas Fiscais de Serviços** (Faturamento de obras)

---

## 📋 1. CONTAS A PAGAR

### 1.1 Estrutura de Dados

**Tabela:** `contas_pagar` (migration: `11_contas_pagar.sql`)

```sql
Campos Principais:
- id (UUID, PK)
- company_id (UUID, FK) → Multi-tenant
- obra_id (UUID, FK, opcional) → Vinculação com obra
- description (TEXT) → Descrição da conta
- category (TEXT) → Categoria da despesa
- supplier (TEXT) → Fornecedor/credor
- amount (DECIMAL 12,2) → Valor da conta
- due_date (DATE) → Data de vencimento
- payment_date (DATE, opcional) → Data de pagamento
- status (enum) → pendente | pago | atrasado | cancelado
- payment_method (TEXT) → Forma de pagamento
- invoice_number (TEXT) → Número da nota fiscal
- invoice_url (TEXT) → URL do PDF no Storage
- observations (TEXT) → Observações
```

### 1.2 Recursos Implementados

#### ✅ Funcionalidades Completas:
- [x] Listagem de contas com filtros (status, busca, categoria, data)
- [x] Cadastro de contas com notas fiscais
- [x] Upload de anexos (PDF, JPG, PNG até 10MB)
- [x] Edição de contas existentes
- [x] Exclusão (soft delete)
- [x] Visualização detalhada
- [x] Cards de estatísticas (pendentes, pagas, atrasadas)
- [x] Cálculo automático de dias para vencimento
- [x] Alertas visuais de vencimento
- [x] Validações (valor > 0, datas válidas)

#### 📄 Arquivos Relacionados:

**Frontend:**
- `src/pages/contas-pagar/ContasPagarList.tsx` - Listagem principal
- `src/pages/contas-pagar/ContaPagarForm.tsx` - Formulário CRUD
- `src/pages/contas-pagar/ContaPagarDetails.tsx` - Detalhes

**Backend:**
- `src/lib/contas-pagar-api.ts` - API layer com mapeamento PT ↔ EN
- `src/types/contas-pagar.ts` - TypeScript types

**Database:**
- `db/migrations/11_contas_pagar.sql` - Estrutura da tabela
- `db/migrations/XX_fix_contas_pagar_rls.sql` - Políticas RLS

### 1.3 Funcionalidades de API

```typescript
// Funções principais
getContasPagar(companyId, filtros?) → Lista contas
getContaPagarById(id) → Busca por ID
createContaPagar(formData, companyId) → Cria nova conta
updateContaPagar(id, formData) → Atualiza conta
deleteContaPagar(id) → Soft delete
updateAnexoUrl(id, url) → Atualiza URL do anexo
getEstatisticas(companyId) → Calcula estatísticas

// Mapeamento de status:
App (PT) → Banco (EN)
'Pendente' → 'pendente'
'Paga' → 'pago'
'Atrasada' → 'atrasado'
'Cancelada' → 'cancelado'
```

### 1.4 Segurança (RLS)

```sql
-- Políticas implementadas:
1. SELECT: Visualizar contas se company_id existe
2. INSERT: Inserir se company_id válido
3. UPDATE: Atualizar contas não deletadas
4. DELETE: Deletar (soft delete)
```

---

## 💰 2. RECEBIMENTOS (Receitas)

### 2.1 Arquitetura

O módulo de recebimentos combina **2 fontes de dados**:

1. **Notas Fiscais de Serviços** (`obras_notas_fiscais`)
2. **Pagamentos Diretos** (`obras_pagamentos_diretos`)

### 2.2 Estrutura de Dados

#### A) Notas Fiscais de Serviços

**Tabela:** `obras_notas_fiscais` (migration: `03_obras_financeiro.sql`)

```sql
Campos Principais:
- id (UUID, PK)
- obra_id (UUID, FK) → Obra relacionada
- numero_nota (TEXT) → Número da NF
- valor_nota (DECIMAL) → Valor bruto
- vencimento (DATE) → Data de vencimento
- desconto_inss (DECIMAL) → Desconto INSS
- desconto_iss (DECIMAL) → Desconto ISS
- outro_desconto (DECIMAL) → Outros descontos
- valor_liquido (DECIMAL) → Valor calculado
- status (enum) → emitida | enviada | paga
- data_pagamento (DATE, opcional) → Data de pagamento
- arquivo_nota_url (TEXT) → URL do PDF
- observacoes (TEXT)
```

#### B) Pagamentos Diretos

**Tabela:** `obras_pagamentos_diretos` (migration: `create_obras_pagamentos_diretos.sql`)

```sql
Campos Principais:
- id (UUID, PK)
- obra_id (UUID, FK) → Obra relacionada
- descricao (TEXT) → Descrição do pagamento
- valor (DECIMAL) → Valor do pagamento
- data_pagamento (DATE) → Data do pagamento
- forma_pagamento (TEXT) → pix | transferencia | dinheiro | cheque
- comprovante_url (TEXT) → URL do comprovante
- observacoes (TEXT)
```

### 2.3 Arquivos Relacionados

**Frontend:**
- `src/pages/recebimentos/RecebimentosPage.tsx` - Listagem consolidada
- `src/pages/recebimentos/RecebimentosIndex.tsx` - Listagem com KPIs
- `src/pages/pagamentos-receber/PagamentosList.tsx` - Gestão de pagamentos

**Backend:**
- `src/lib/obrasNotasFiscaisApi.ts` - API de notas fiscais
- `src/lib/obrasPagamentosDiretosApi.ts` - API de pagamentos diretos
- `src/lib/pagamentos-receber-api-integrado.ts` - API integrada

**Database:**
- `db/migrations/03_obras_financeiro.sql` - Estrutura das tabelas

### 2.4 Views do Banco de Dados

```sql
-- Views relacionadas a recebimentos:

1. view_pagamentos_receber_integrado
   → Combina pagamentos + clientes + relatórios + notas fiscais
   
2. view_kpis_financeiros_unificados
   → KPIs consolidados de recebimentos
```

### 2.5 Fluxo de Dados

```
┌─────────────────┐
│ Notas Fiscais   │──┐
│ (obras_nf)      │  │
└─────────────────┘  │
                     ├──→ RecebimentosPage → Dashboard
┌─────────────────┐  │
│ Pagamentos Dir. │──┘
│ (obras_pag_dir) │
└─────────────────┘
```

---

## 📊 3. KPIS E ESTATÍSTICAS

### 3.1 Contas a Pagar

```typescript
interface ContaPagarEstatisticas {
  total_contas: number
  total_pendente: number
  total_pago: number
  total_atrasado: number
  valor_total_pendente: number
  valor_total_pago: number
  valor_total_atrasado: number
  valor_total_geral: number
}
```

### 3.2 Recebimentos

```typescript
interface KPIsFinanceirosIntegrados {
  // Pagamentos
  pagamentos_aguardando: number
  pagamentos_pagos: number
  pagamentos_vencidos: number
  pagamentos_proximo_vencimento: number
  
  // Valores
  valor_aguardando: number
  valor_pago: number
  valor_vencido: number
  valor_proximo_vencimento: number
  
  // Faturamento
  faturamento_hoje: number
  faturamento_mes: number
  
  // Relatórios
  relatorios_aguardando_pagamento: number
  relatorios_pendentes: number
  relatorios_pagos: number
  
  // Notas Fiscais
  notas_faturadas: number
  notas_pagas: number
  
  // Métricas
  total_bombeamentos_feitos: number
  valor_total_bombeamentos: number
}
```

---

## 🔄 4. MIGRAÇÕES DO BANCO DE DADOS

### 4.1 Ordem das Migrations

```sql
1. 00_foundation.sql → Base (enums, company_id)
2. 02_obras.sql → Tabela de obras
3. 03_obras_financeiro.sql → Notas fiscais, pagamentos diretos
4. 11_contas_pagar.sql → Contas a pagar
5. 12_financeiro_consolidado.sql → Transações consolidadas
6. 18_views.sql → Views para dashboards
```

### 4.2 Enums Utilizados

```sql
-- Status de conta a pagar
CREATE TYPE status_conta_pagar AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');

-- Tipo de transação
CREATE TYPE tipo_transacao AS ENUM ('receita', 'despesa');

-- Status de transação
CREATE TYPE status_transacao AS ENUM ('pendente', 'confirmado', 'cancelado');
```

---

## 🎨 5. INTERFACE DO USUÁRIO

### 5.1 Páginas Implementadas

#### Contas a Pagar
- ✅ `/contas-pagar` - Listagem
- ✅ `/contas-pagar/nova` - Cadastro
- ✅ `/contas-pagar/:id` - Detalhes
- ✅ `/contas-pagar/:id/editar` - Edição

#### Recebimentos
- ✅ `/recebimentos` - Listagem consolidada
- ✅ `/pagamentos-receber` - Gestão de pagamentos

### 5.2 Componentes Visuais

**Cards de Estatísticas:**
- Total de contas
- Pendentes (valor + quantidade)
- Pagas (valor + quantidade)
- Atrasadas (valor + quantidade)

**Tabela de Dados:**
- Filtros por status
- Busca textual
- Ordenação por data
- Ações rápidas (visualizar, editar, excluir)

**Indicadores de Status:**
- 🟡 Pendente (Amarelo)
- 🟢 Paga (Verde)
- 🔴 Atrasada (Vermelho)
- ⚫ Cancelada (Cinza)

---

## 🔒 6. SEGURANÇA E RLS

### 6.1 Row Level Security

Todas as tabelas financeiras possuem RLS habilitado:

```sql
-- Contas a Pagar
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

-- Políticas:
- SELECT: company_id válido
- INSERT: company_id válido
- UPDATE: company_id válido + não deletado
- DELETE: Soft delete
```

### 6.2 Soft Delete

Mecanismo implementado em todas as tabelas:
```sql
deleted_at TIMESTAMPTZ → Data de exclusão
-- Registros com deleted_at IS NULL = ativos
```

---

## 🚀 7. FUNCIONALIDADES AVANÇADAS

### 7.1 Upload de Arquivos

```typescript
// Storage no Supabase
- Bucket: 'invoices' (notas fiscais)
- Máximo: 10MB por arquivo
- Tipos: PDF, JPG, PNG
- Nomenclatura: {uuid}_{timestamp}_{filename}
```

### 7.2 Cálculo Automático de Status

```sql
-- Trigger automático
CREATE TRIGGER trigger_update_conta_pagar_status
  BEFORE INSERT OR UPDATE ON contas_pagar
  EXECUTE FUNCTION update_conta_pagar_status()

-- Lógica:
- Se payment_date IS NOT NULL → 'pago'
- Se due_date < CURRENT_DATE → 'atrasado'
- Se due_date >= CURRENT_DATE → 'pendente'
```

### 7.3 Sincronização de Dados

```typescript
// Ao marcar pagamento como pago:
1. Atualiza status em 'pagamentos_receber'
2. Sincroniza relatório correspondente
3. Sincroniza notas fiscais vinculadas
4. Atualiza KPIs em tempo real
```

---

## 📈 8. DASHBOARDS E RELATÓRIOS

### 8.1 Dashboard Financeiro

**Localização:** `src/pages/financial/FinancialDashboard.tsx`

**Funcionalidades:**
- Resumo de receitas e despesas
- Gráficos de fluxo de caixa
- Filtros por período
- Filtros por obra
- Exportação (Excel, PDF)

### 8.2 Views SQL

```sql
-- v_contas_pagar_pending
→ Contas pendentes com alertas de vencimento

-- v_financial_dashboard
→ Resumo financeiro por mês e tipo
```

---

## ⚠️ 9. PONTOS DE ATENÇÃO

### 9.1 Inconsistências Identificadas

1. **Duplicação de Migration**
   - `create_contas_pagar.sql` (estrutura antiga)
   - `11_contas_pagar.sql` (estrutura nova)
   - **Status:** Migration antiga não usada

2. **Mapeamento de Campos**
   - Campos em **inglês** no banco
   - Campos em **português** na aplicação
   - API faz conversão manual

3. **RLS em Desenvolvimento**
   - Políticas flexíveis para desenvolvimento
   - Company_id padrão: `39cf8b61-6737-4aa5-af3f-51fba9f12345`

### 9.2 Melhorias Sugeridas

1. **Padronização de nomenclatura**
   - Decidir: português ou inglês no banco
   - Aplicar consistente em todas as tabelas

2. **Documentação de status**
   - Criar enum centralizado
   - Documentar transições de status

3. **Testes**
   - Implementar testes unitários das APIs
   - Testes de integração do fluxo completo

---

## ✅ 10. RESUMO EXECUTIVO

### O que está funcionando:
✅ Contas a Pagar (CRUD completo)  
✅ Notas Fiscais de Serviços  
✅ Pagamentos Diretos  
✅ Upload de arquivos  
✅ KPIs e estatísticas  
✅ Filtros e buscas  
✅ Soft delete  
✅ RLS configurado  

### O que precisa atenção:
⚠️ Duplicação de migrations  
⚠️ Padronização de nomenclatura PT/EN  
⚠️ Testes automatizados  
⚠️ Documentação de status  

### Próximos passos sugeridos:
1. Consolidar migrations duplicadas
2. Criar documentação de status e fluxos
3. Implementar testes automatizados
4. Padronizar nomenclatura (escolher PT ou EN)
5. Criar relatórios avançados de fluxo de caixa

---

## 📝 11. GLOSSÁRIO

- **RLS:** Row Level Security (segurança em nível de linha)
- **Soft Delete:** Exclusão lógica (marca deleted_at ao invés de deletar)
- **Multi-tenant:** Sistema que suporta múltiplas empresas (company_id)
- **NF:** Nota Fiscal
- **KPIs:** Key Performance Indicators (indicadores de desempenho)

---

**Fim da Análise**



