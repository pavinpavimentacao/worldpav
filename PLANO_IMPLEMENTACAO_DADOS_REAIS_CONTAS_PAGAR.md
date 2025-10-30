# 📋 Plano de Implementação - Dados Reais em Contas a Pagar

## 🎯 Objetivo
Remover todos os dados mock e implementar integração completa com banco de dados real (Supabase) no módulo de Contas a Pagar.

---

## 📊 Análise da Situação Atual

### ✅ O que está funcionando:
- ✅ Estrutura de páginas (List, Form, Details) completa
- ✅ Validações de formulário implementadas
- ✅ Upload de anexos funcionando
- ✅ Rotas configuradas
- ✅ Sidebar integrado
- ✅ Tipos TypeScript definidos corretamente

### ❌ O que precisa ser corrigido:
- ❌ **Listagem usando dados MOCK** ao invés de buscar do banco
- ❌ **company_id não é preenchido** ao criar registros
- ❌ **Inconsistência de nomes de campos** entre migrations
- ❌ **Inconsistência de valores de status** (enum vs string)
- ❌ **Estatísticas calculadas sobre mocks** ao invés de dados reais
- ❌ **Tratamento de erros limitado**

---

## 🔍 Verificações Necessárias

### 1. Estrutura Real do Banco de Dados
**Task:** Criar script para verificar estrutura real da tabela `contas_pagar` no Supabase
- Verificar quais campos existem (português vs inglês)
- Verificar se enum `status_conta_pagar` existe
- Verificar se campos obrigatórios estão presentes
- Verificar se índices foram criados

### 2. Função para Obter Company ID
**Status:** ✅ Já existe função `getOrCreateDefaultCompany()` em `company-utils.ts`
**Uso:** Já usada em outras páginas (ObrasList, ColaboradoresList)

---

## 🗂️ Estrutura de Implementação

### Fase 1: Verificação e Diagnóstico
1. Criar script de verificação da estrutura do banco
2. Executar script e analisar resultados
3. Documentar estrutura real encontrada
4. Identificar inconsistências

### Fase 2: Correção de Estrutura (se necessário)
1. Verificar qual migration foi realmente aplicada
2. Criar migration de correção (se necessário)
3. Ajustar tipos TypeScript se houver diferenças
4. Atualizar código para usar campos corretos

### Fase 3: Implementação de Service/API
1. Criar arquivo `contas-pagar-api.ts` com funções:
   - `getContasPagar(companyId, filters?)` - Buscar contas
   - `getContaPagarById(id)` - Buscar uma conta
   - `createContaPagar(data, companyId)` - Criar conta
   - `updateContaPagar(id, data)` - Atualizar conta
   - `deleteContaPagar(id)` - Deletar conta
   - `getEstatisticas(companyId)` - Buscar estatísticas
2. Implementar tratamento de erros robusto
3. Implementar loading states

### Fase 4: Integração nas Páginas
1. **ContasPagarList.tsx:**
   - Remover imports de mocks
   - Implementar busca real com `getContasPagar()`
   - Implementar cálculo de estatísticas reais
   - Adicionar tratamento de erros
   - Adicionar loading states

2. **ContaPagarForm.tsx:**
   - Garantir que `company_id` seja preenchido ao criar
   - Usar `getOrCreateDefaultCompany()` para obter company_id
   - Preencher `created_by` e `updated_by` com user.id
   - Melhorar tratamento de erros

3. **ContaPagarDetails.tsx:**
   - Já está buscando dados reais (verificar se está completo)
   - Melhorar tratamento de erros

### Fase 5: Ajustes de Status
1. Verificar como o banco armazena status (enum vs string)
2. Criar função de mapeamento entre valores se necessário
3. Ajustar código para usar valores corretos
4. Corrigir trigger do banco se necessário

### Fase 6: Testes e Validação
1. Testar criação de conta
2. Testar listagem
3. Testar filtros e busca
4. Testar edição
5. Testar exclusão
6. Testar upload de anexo
7. Validar estatísticas

---

## 📝 Detalhamento das Tasks

### TASK 1: Script de Verificação da Estrutura
**Arquivo:** `scripts/testing/verificar-estrutura-contas-pagar.js`
**Objetivo:** Verificar estrutura real da tabela no banco

**Funcionalidades:**
- Listar todos os campos da tabela `contas_pagar`
- Verificar tipos de dados
- Verificar constraints
- Verificar se enum existe
- Buscar 3 registros de exemplo
- Comparar estrutura esperada vs real
- Gerar relatório de inconsistências

### TASK 2: Criar Service API
**Arquivo:** `src/lib/contas-pagar-api.ts`
**Objetivo:** Centralizar todas as operações de banco

**Funções a implementar:**
```typescript
// Buscar contas com filtros
export async function getContasPagar(
  companyId: string,
  filters?: {
    status?: StatusContaPagar | 'Todas'
    searchTerm?: string
    dataInicio?: string
    dataFim?: string
  }
): Promise<ContaPagar[]>

// Buscar uma conta específica
export async function getContaPagarById(id: string): Promise<ContaPagar | null>

// Criar nova conta
export async function createContaPagar(
  data: ContaPagarFormData,
  companyId: string,
  userId: string
): Promise<ContaPagar>

// Atualizar conta
export async function updateContaPagar(
  id: string,
  data: Partial<ContaPagarFormData>,
  userId: string
): Promise<ContaPagar>

// Deletar conta
export async function deleteContaPagar(id: string): Promise<void>

// Buscar estatísticas
export async function getEstatisticas(
  companyId: string
): Promise<ContaPagarEstatisticas>
```

### TASK 3: Atualizar ContasPagarList
**Arquivo:** `src/pages/contas-pagar/ContasPagarList.tsx`
**Mudanças:**
1. Remover import de mocks
2. Adicionar import de API e company-utils
3. Adicionar state para `companyId`
4. Implementar `carregarContas()` real:
   ```typescript
   const carregarContas = async () => {
     try {
       setLoading(true)
       
       // Obter company_id
       if (!companyId) {
         const id = await getOrCreateDefaultCompany()
         setCompanyId(id)
         return // useEffect vai chamar novamente
       }
       
       // Buscar contas reais
       const contasData = await getContasPagar(companyId, {
         status: filtroStatus === 'Todas' ? undefined : filtroStatus,
         searchTerm: searchTerm || undefined
       })
       
       setContas(contasData)
       calcularEstatisticas(contasData)
     } catch (error) {
       console.error('Erro ao carregar contas:', error)
       toast.error('Erro ao carregar contas a pagar')
     } finally {
       setLoading(false)
     }
   }
   ```
5. Atualizar cálculo de estatísticas para usar dados reais
6. Melhorar tratamento de erros

### TASK 4: Atualizar ContaPagarForm
**Arquivo:** `src/pages/contas-pagar/ContaPagarForm.tsx`
**Mudanças:**
1. Adicionar import de API e company-utils
2. Adicionar state para `companyId` e `userId`
3. Implementar `loadCompanyId()`:
   ```typescript
   useEffect(() => {
     loadCompanyId()
   }, [])
   
   const loadCompanyId = async () => {
     const { data: { user } } = await supabase.auth.getUser()
     if (user) setUserId(user.id)
     
     const id = await getOrCreateDefaultCompany()
     setCompanyId(id)
   }
   ```
4. Atualizar `handleSubmit()`:
   ```typescript
   // Remover lógica direta do Supabase
   // Usar: await createContaPagar(contaData, companyId, userId)
   // ou: await updateContaPagar(id, contaData, userId)
   ```
5. Garantir que `company_id`, `created_by`, `updated_by` sejam preenchidos

### TASK 5: Verificar e Ajustar Status
**Objetivo:** Alinhar valores de status entre banco e código

**Ações:**
1. Verificar se enum `status_conta_pagar` existe no banco
2. Se usar enum, ajustar código para converter:
   - 'Pendente' ↔ 'pendente'
   - 'Paga' ↔ 'pago'
   - 'Atrasada' ↔ 'atrasado'
   - 'Cancelada' ↔ 'cancelado'
3. Criar função de mapeamento se necessário
4. Atualizar trigger do banco se necessário

### TASK 6: Atualizar Tipos (se necessário)
**Arquivo:** `src/types/contas-pagar.ts`
**Ações:**
1. Verificar se tipos estão alinhados com estrutura real
2. Adicionar campos faltantes (company_id, obra_id, etc.)
3. Atualizar ContaPagarFormData se necessário

### TASK 7: Melhorar Tratamento de Erros
**Objetivo:** Adicionar mensagens de erro mais descritivas

**Implementar:**
- Try-catch em todas as chamadas de API
- Mensagens de erro específicas por tipo
- Logs de debug para desenvolvimento
- Feedback visual para o usuário

### TASK 8: Testes de Integração
**Objetivo:** Validar todas as funcionalidades

**Checklist:**
- [ ] Criar conta nova
- [ ] Listar contas
- [ ] Filtrar por status
- [ ] Buscar por texto
- [ ] Ver detalhes
- [ ] Editar conta
- [ ] Excluir conta
- [ ] Upload de anexo
- [ ] Estatísticas corretas
- [ ] Company_id sendo preenchido
- [ ] RLS funcionando (usuário só vê suas contas)

---

## 🚨 Pontos de Atenção

### 1. Company ID
- ✅ Função `getOrCreateDefaultCompany()` já existe
- ✅ Usada com sucesso em outras páginas
- ⚠️ Garantir que seja chamada antes de qualquer operação

### 2. Status Values
- ⚠️ Banco pode usar enum em minúsculas
- ⚠️ Código TypeScript usa primeira letra maiúscula
- ⚠️ Precisamos mapear entre os dois formatos

### 3. Campos Obrigatórios
- ⚠️ Migration oficial (11_contas_pagar.sql) usa campos em inglês
- ⚠️ Código TypeScript espera campos em português
- ⚠️ Verificar qual estrutura está realmente no banco

### 4. RLS (Row Level Security)
- ✅ Políticas já estão configuradas na migration
- ⚠️ Garantir que `get_user_company_id()` funcione corretamente
- ⚠️ Testar se usuário só vê contas da própria empresa

---

## 📈 Ordem de Execução Recomendada

1. **TASK 1** - Verificar estrutura real do banco
2. **TASK 5** - Ajustar status se necessário
3. **TASK 6** - Atualizar tipos se necessário
4. **TASK 2** - Criar service API
5. **TASK 3** - Atualizar listagem
6. **TASK 4** - Atualizar formulário
7. **TASK 7** - Melhorar tratamento de erros
8. **TASK 8** - Executar testes

---

## ✅ Critérios de Sucesso

- [ ] Listagem mostra dados reais do banco
- [ ] Filtros funcionam corretamente
- [ ] Estatísticas são calculadas sobre dados reais
- [ ] Criação de conta funciona com company_id preenchido
- [ ] Edição funciona corretamente
- [ ] Exclusão funciona corretamente
- [ ] Upload de anexo funciona
- [ ] RLS funciona (isolamento por empresa)
- [ ] Tratamento de erros está robusto
- [ ] Não há mais nenhum uso de mocks

---

## 📚 Referências

- `worldpav/src/lib/company-utils.ts` - Função para obter company_id
- `worldpav/src/pages/obras/ObrasList.tsx` - Exemplo de uso de getOrCreateDefaultCompany
- `worldpav/src/pages/colaboradores/ColaboradoresList.tsx` - Exemplo de integração real
- `worldpav/db/migrations/11_contas_pagar.sql` - Migration oficial
- `worldpav/src/types/contas-pagar.ts` - Tipos TypeScript

---

**Data de Criação:** 2025-01-27  
**Última Atualização:** 2025-01-27  
**Status:** 📝 Planejamento


