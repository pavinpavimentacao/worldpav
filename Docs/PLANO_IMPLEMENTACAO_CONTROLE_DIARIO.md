# 📋 Plano de Implementação - Controle Diário (Banco de Dados)

## 📌 Visão Geral

Este documento apresenta o plano completo para implementar a integração do módulo **Controle Diário** com o banco de dados Supabase, substituindo todos os mockups por operações reais.

---

## 🎯 Objetivo

Implementar CRUD completo no módulo de Controle Diário, conectando o frontend já existente ao banco de dados Supabase PostgreSQL.

---

## 📊 Análise da Situação Atual

### ✅ O que já existe:

1. **Frontend Completo:**
   - ✅ Componentes UI (`RelacaoDiariaTab`, `DiariasTab`, `HistoricoTab`)
   - ✅ Tipos TypeScript (`controle-diario.ts`)
   - ✅ Mockups funcionais (`controle-diario-mock.ts`)
   - ✅ Páginas e navegação

2. **Estrutura de Banco de Dados:**
   - ✅ Migração `05_controle_diario.sql` (versão original)
   - ✅ Migração `05_controle_diario_COMPLETO.sql` (versão completa)
   - ✅ Migração `05_controle_diario_ALTER.sql` (ajustes)

3. **Tabelas Existentes:**
   - ✅ `controle_diario_relacoes` (relação diária)
   - ✅ `controle_diario_diarias` (registros de diárias)
   - ⚠️ `controle_diario_presencas` (necessita ser criada via ALTER)

### ❌ O que falta:

1. **Serviços de API:**
   - ❌ API para Relação Diária
   - ❌ API para Presenças
   - ❌ API para Diárias

2. **Integração:**
   - ❌ Substituir mockups por chamadas reais
   - ❌ Implementar sincronização em tempo real
   - ❌ Tratamento de erros

---

## 🔄 TASKS DE IMPLEMENTAÇÃO

### **TASK 1: Aplicar Migrações SQL no Banco de Dados**

**Prioridade:** ⭐⭐⭐ CRÍTICA  
**Dependências:** Nenhuma  
**Tempo Estimado:** 15-30 minutos

#### Passos:

1. **Aplicar migração ALTER:**
   ```sql
   -- Executar: 05_controle_diario_ALTER.sql
   ```

2. **Verificar estrutura:**
   ```sql
   -- Verificar se as colunas foram criadas
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'controle_diario_relacoes';
   ```

3. **Verificar tabela de presenças:**
   ```sql
   SELECT * FROM controle_diario_presencas LIMIT 1;
   ```

**Critérios de Sucesso:**
- ✅ Coluna `equipe_id` existe em `controle_diario_relacoes`
- ✅ Colunas `total_presentes` e `total_ausencias` existem
- ✅ Tabela `controle_diario_presencas` criada
- ✅ RLS configurado corretamente

---

### **TASK 2: Criar Serviço de API - Relação Diária**

**Prioridade:** ⭐⭐⭐ CRÍTICA  
**Dependências:** TASK 1  
**Tempo Estimado:** 2-3 horas

#### Arquivo a criar:
`src/lib/controle-diario-api.ts`

#### Funcionalidades a implementar:

1. **`listarRelacoesDiarias()`**
   - Buscar todas as relações
   - Incluir presenças (JOIN)
   - Filtros por data/equipe

2. **`getRelacaoDiariaById(id)`**
   - Buscar relação específica
   - Incluir presenças e diárias

3. **`criarRelacaoDiaria(data)`**
   - Criar relação
   - Criar registros de presença
   - Transação SQL

4. **`atualizarRelacaoDiaria(id, data)`**
   - Atualizar dados da relação
   - Atualizar presenças

5. **`deletarRelacaoDiaria(id)`**
   - Soft delete

**Pseudocódigo:**
```typescript
export async function criarRelacaoDiaria(data: CreateRelacaoDiariaData) {
  // 1. Criar relação
  const relacao = await supabase.from('controle_diario_relacoes')
    .insert({...})
    .select()
    .single();
  
  // 2. Criar presenças (presentes)
  await supabase.from('controle_diario_presencas')
    .insert(presentes.map(id => ({relacao_id, colaborador_id: id, status: 'presente'})));
  
  // 3. Criar presenças (ausentes)
  await supabase.from('controle_diario_presencas')
    .insert(ausentes.map(a => ({...a, relacao_id})));
}
```

---

### **TASK 3: Criar Serviço de API - Diárias**

**Prioridade:** ⭐⭐⭐ CRÍTICA  
**Dependências:** TASK 1  
**Tempo Estimado:** 1-2 horas

#### Funcionalidades a implementar:

1. **`listarDiarias(filtros)`**
   - Buscar diárias com filtros
   - JOIN com colaboradores

2. **`criarDiaria(data)`**
   - Criar registro de diária
   - Calcular totais

3. **`atualizarDiaria(id, data)`**
   - Atualizar diária
   - Recalcular totais

4. **`marcarComoPago(id)`**
   - Atualizar status

5. **`deletarDiaria(id)`**
   - Soft delete

---

### **TASK 4: Substituir Mockups por APIs Reais**

**Prioridade:** ⭐⭐⭐ CRÍTICA  
**Dependências:** TASK 2, TASK 3  
**Tempo Estimado:** 2-3 horas

#### Arquivos a modificar:

1. **`src/mocks/controle-diario-mock.ts`**
   - Manter como fallback
   - Adicionar flag `USE_MOCK`

2. **`src/components/controle-diario/RelacaoDiariaTab.tsx`**
   - Substituir `listarRelacoesDiarias()` por API real
   - Adicionar loading states

3. **`src/pages/controle-diario/NovaRelacaoDiaria.tsx`**
   - Substituir `criarRelacaoDiaria()` por API real
   - Adicionar tratamento de erros

4. **`src/components/controle-diario/DiariasTab.tsx`**
   - Substituir todas as chamadas mock
   - Implementar paginação

---

### **TASK 5: Implementar Sincronização em Tempo Real**

**Prioridade:** ⭐⭐ MÉDIA  
**Dependências:** TASK 4  
**Tempo Estimado:** 1-2 horas

#### Usar Supabase Realtime:

```typescript
// Inscrever em mudanças nas relações
const subscription = supabase
  .channel('controle_diario_relacoes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'controle_diario_relacoes'
  }, (payload) => {
    // Atualizar lista
  })
  .subscribe();
```

#### Implementar em:
- `RelacaoDiariaTab.tsx`
- `DiariasTab.tsx`

---

### **TASK 6: Adicionar Tratamento de Erros e Loading States**

**Prioridade:** ⭐⭐ MÉDIA  
**Dependências:** TASK 4  
**Tempo Estimado:** 1 hora

#### Implementar:

1. **Loading States:**
   - Skeleton loaders
   - Spinners em botões

2. **Error Handling:**
   - Try/catch em todas APIs
   - Toast notifications
   - Fallback para mock

3. **Empty States:**
   - Mensagens quando não há dados

---

### **TASK 7: Validação e Testes**

**Prioridade:** ⭐⭐ MÉDIA  
**Dependências:** TASK 6  
**Tempo Estimado:** 2-3 horas

#### Cenários de teste:

1. **Criar Relação:**
   - ✅ Com equipe
   - ✅ Sem equipe
   - ✅ Com presentes e ausentes
   - ✅ Com observações

2. **Atualizar Relação:**
   - ✅ Adicionar ausência
   - ✅ Remover ausência
   - ✅ Alterar observações

3. **Diárias:**
   - ✅ Criar diária
   - ✅ Calcular totais
   - ✅ Marcar como pago
   - ✅ Deletar diária

4. **Filtros:**
   - ✅ Por data
   - ✅ Por equipe
   - ✅ Por status

---

## 📁 ESTRUTURA DE ARQUIVOS RESULTANTE

```
src/
├── lib/
│   └── controle-diario-api.ts          [NOVO - TASK 2, 3]
├── components/
│   └── controle-diario/
│       ├── RelacaoDiariaTab.tsx         [MODIFICAR - TASK 4]
│       ├── DiariasTab.tsx               [MODIFICAR - TASK 4]
│       └── HistoricoTab.tsx             [MODIFICAR - TASK 4]
├── pages/
│   └── controle-diario/
│       └── NovaRelacaoDiaria.tsx        [MODIFICAR - TASK 4]
└── mocks/
    └── controle-diario-mock.ts          [MANTER - fallback]
```

---

## 🔧 TECNOLOGIAS UTILIZADAS

- **Supabase:** PostgreSQL + Realtime
- **TypeScript:** Tipagem forte
- **React Query:** Cache e sincronização (opcional)
- **React Hooks:** useState, useEffect
- **Toast Notifications:** Feedback ao usuário

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Multi-tenancy:**
   - Sempre filtrar por `company_id`
   - RLS já implementado nas migrações

2. **Transações:**
   - Criar relação + presenças em transação
   - Rollback em caso de erro

3. **Performance:**
   - Usar índices corretamente
   - Paginar listas grandes
   - Evitar N+1 queries

4. **Permissões:**
   - Verificar RLS antes de deploy
   - Testar com usuários diferentes

---

## 📈 MÉTRICAS DE SUCESSO

- ✅ 100% dos mockups substituídos
- ✅ Todas as operações CRUD funcionando
- ✅ Tempo de resposta < 500ms
- ✅ Zero erros em produção
- ✅ UI/UX mantidos iguais

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

1. **TASK 1** → Aplicar migrações SQL
2. **TASK 2** → Criar API de Relações
3. **TASK 3** → Criar API de Diárias
4. **TASK 4** → Substituir mockups
5. **TASK 5** → Implementar Realtime
6. **TASK 6** → Adicionar tratamento de erros
7. **TASK 7** → Testes finais

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas:

1. Verificar logs do Supabase
2. Verificar console do navegador
3. Verificar RLS policies
4. Testar queries diretamente no SQL Editor

---

**Última Atualização:** 25/10/2025  
**Versão:** 1.0  
**Status:** ⏳ Aguardando Início

