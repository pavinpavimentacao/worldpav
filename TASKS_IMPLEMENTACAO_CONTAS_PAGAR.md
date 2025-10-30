# ✅ Tasks - Implementação de Dados Reais em Contas a Pagar

## 📋 Resumo das Tasks

### 🎯 Fase 1: Diagnóstico e Preparação

#### ✅ TASK 1: Verificar Estrutura do Banco
**Prioridade:** 🔴 ALTA  
**Arquivo:** `scripts/testing/verificar-estrutura-contas-pagar.js`  
**Tempo estimado:** 30 minutos

**O que fazer:**
- Criar script que conecta ao Supabase
- Listar todos os campos da tabela `contas_pagar`
- Verificar tipos de dados, constraints, índices
- Verificar se enum `status_conta_pagar` existe
- Buscar 3 registros de exemplo
- Comparar estrutura esperada vs real
- Gerar relatório JSON com diferenças

**Entregável:** Script + Relatório de estrutura

---

### 🎯 Fase 2: Infraestrutura

#### ✅ TASK 2: Criar Service API
**Prioridade:** 🔴 ALTA  
**Arquivo:** `src/lib/contas-pagar-api.ts`  
**Tempo estimado:** 2 horas

**Funções a implementar:**

```typescript
// 1. Buscar contas com filtros
getContasPagar(companyId, filters?): Promise<ContaPagar[]>

// 2. Buscar uma conta específica
getContaPagarById(id): Promise<ContaPagar | null>

// 3. Criar nova conta
createContaPagar(data, companyId, userId): Promise<ContaPagar>

// 4. Atualizar conta existente
updateContaPagar(id, data, userId): Promise<ContaPagar>

// 5. Deletar conta
deleteContaPagar(id): Promise<void>

// 6. Buscar estatísticas agregadas
getEstatisticas(companyId): Promise<ContaPagarEstatisticas>
```

**Requisitos:**
- ✅ Usar `getOrCreateDefaultCompany()` para company_id
- ✅ Tratamento de erros robusto
- ✅ Logs de debug
- ✅ Validações de dados
- ✅ Suporte a filtros (status, busca textual, datas)

**Entregável:** Arquivo completo com todas as funções

---

#### ✅ TASK 5: Ajustar Status (se necessário)
**Prioridade:** 🟡 MÉDIA  
**Arquivo:** `src/lib/contas-pagar-api.ts` ou `src/types/contas-pagar.ts`  
**Tempo estimado:** 1 hora

**O que fazer:**
- Verificar valores de status no banco (enum minúsculas vs string maiúsculas)
- Criar função de mapeamento:
  ```typescript
  function mapearStatusBancoParaApp(status: string): StatusContaPagar
  function mapearStatusAppParaBanco(status: StatusContaPagar): string
  ```
- Atualizar API para usar mapeamento
- Corrigir trigger do banco se necessário

**Entregável:** Funções de mapeamento implementadas

---

#### ✅ TASK 6: Atualizar Tipos TypeScript
**Prioridade:** 🟡 MÉDIA  
**Arquivo:** `src/types/contas-pagar.ts`  
**Tempo estimado:** 30 minutos

**O que fazer:**
- Comparar tipos atuais com estrutura real do banco
- Adicionar campos faltantes (company_id, obra_id, etc.)
- Atualizar ContaPagarFormData se necessário
- Garantir compatibilidade com Database types

**Entregável:** Tipos atualizados e validados

---

### 🎯 Fase 3: Integração nas Páginas

#### ✅ TASK 3: Atualizar Listagem
**Prioridade:** 🔴 ALTA  
**Arquivo:** `src/pages/contas-pagar/ContasPagarList.tsx`  
**Tempo estimado:** 2 horas

**Mudanças necessárias:**

1. **Remover mocks:**
   ```typescript
   // ❌ Remover
   import { contasPagarMock, estatisticasMock } from '../../mocks/contas-pagar-mock'
   const [contas, setContas] = useState<ContaPagar[]>(contasPagarMock)
   ```

2. **Adicionar imports:**
   ```typescript
   // ✅ Adicionar
   import { getContasPagar, getEstatisticas } from '../../lib/contas-pagar-api'
   import { getOrCreateDefaultCompany } from '../../lib/company-utils'
   ```

3. **Adicionar estados:**
   ```typescript
   const [companyId, setCompanyId] = useState<string>('')
   ```

4. **Implementar carregamento real:**
   ```typescript
   const carregarContas = async () => {
     try {
       setLoading(true)
       
       if (!companyId) {
         const id = await getOrCreateDefaultCompany()
         setCompanyId(id)
         return
       }
       
       const contasData = await getContasPagar(companyId, {
         status: filtroStatus === 'Todas' ? undefined : filtroStatus,
         searchTerm: searchTerm || undefined
       })
       
       setContas(contasData)
       calcularEstatisticas(contasData)
     } catch (error) {
       console.error('Erro:', error)
       toast.error('Erro ao carregar contas')
     } finally {
       setLoading(false)
     }
   }
   ```

5. **Melhorar tratamento de erros**

**Entregável:** Listagem funcionando com dados reais

---

#### ✅ TASK 4: Atualizar Formulário
**Prioridade:** 🔴 ALTA  
**Arquivo:** `src/pages/contas-pagar/ContaPagarForm.tsx`  
**Tempo estimado:** 1.5 horas

**Mudanças necessárias:**

1. **Adicionar imports:**
   ```typescript
   import { createContaPagar, updateContaPagar } from '../../lib/contas-pagar-api'
   import { getOrCreateDefaultCompany } from '../../lib/company-utils'
   ```

2. **Adicionar estados:**
   ```typescript
   const [companyId, setCompanyId] = useState<string>('')
   const [userId, setUserId] = useState<string>('')
   ```

3. **Carregar company_id e user_id:**
   ```typescript
   useEffect(() => {
     const loadIds = async () => {
       const { data: { user } } = await supabase.auth.getUser()
       if (user) setUserId(user.id)
       
       const id = await getOrCreateDefaultCompany()
       setCompanyId(id)
     }
     loadIds()
   }, [])
   ```

4. **Atualizar handleSubmit:**
   ```typescript
   if (isEditing && id) {
     await updateContaPagar(id, contaData, userId)
   } else {
     await createContaPagar(contaData, companyId, userId)
   }
   ```

5. **Garantir campos obrigatórios:**
   - `company_id` sempre preenchido
   - `created_by` preenchido ao criar
   - `updated_by` preenchido ao atualizar

**Entregável:** Formulário criando/editando com dados reais

---

### 🎯 Fase 4: Melhorias e Testes

#### ✅ TASK 7: Melhorar Tratamento de Erros
**Prioridade:** 🟡 MÉDIA  
**Arquivos:** Todos os arquivos de contas-pagar  
**Tempo estimado:** 1 hora

**Melhorias:**

1. **Mensagens específicas por tipo de erro:**
   ```typescript
   if (error.code === 'PGRST116') {
     toast.error('Nenhuma conta encontrada')
   } else if (error.code === '23505') {
     toast.error('Número da nota já existe')
   } else {
     toast.error('Erro ao salvar conta')
   }
   ```

2. **Logs de debug:**
   ```typescript
   console.log('🔍 [ContasPagar] Carregando contas...')
   console.log('✅ [ContasPagar] Contas carregadas:', contas.length)
   console.error('❌ [ContasPagar] Erro:', error)
   ```

3. **Feedback visual:**
   - Loading states em todas as operações
   - Mensagens de sucesso
   - Validações em tempo real

**Entregável:** Tratamento de erros robusto em todas as páginas

---

#### ✅ TASK 8: Testes de Integração
**Prioridade:** 🔴 ALTA  
**Arquivo:** Manual / Testes  
**Tempo estimado:** 1 hora

**Checklist de testes:**

- [ ] **Criar conta:**
  - [ ] Preencher todos os campos obrigatórios
  - [ ] Verificar se company_id foi salvo
  - [ ] Verificar se created_by foi salvo
  - [ ] Testar upload de anexo

- [ ] **Listar contas:**
  - [ ] Verificar se dados reais aparecem
  - [ ] Verificar se filtro por status funciona
  - [ ] Verificar se busca textual funciona

- [ ] **Ver detalhes:**
  - [ ] Verificar se todos os campos aparecem
  - [ ] Verificar download de anexo

- [ ] **Editar conta:**
  - [ ] Alterar campos
  - [ ] Verificar se updated_by foi salvo
  - [ ] Verificar se atualização funcionou

- [ ] **Excluir conta:**
  - [ ] Confirmar exclusão
  - [ ] Verificar se foi removida da listagem

- [ ] **Estatísticas:**
  - [ ] Verificar se valores estão corretos
  - [ ] Verificar cálculos por status

- [ ] **RLS (Row Level Security):**
  - [ ] Verificar se usuário só vê contas da própria empresa
  - [ ] Testar com múltiplas empresas

**Entregável:** Relatório de testes com status de cada item

---

## 📊 Ordem de Execução

```
1. TASK 1 - Verificar estrutura (30 min)
   ↓
2. TASK 5 - Ajustar status (se necessário) (1h)
   ↓
3. TASK 6 - Atualizar tipos (30 min)
   ↓
4. TASK 2 - Criar API (2h)
   ↓
5. TASK 3 - Atualizar listagem (2h)
   ↓
6. TASK 4 - Atualizar formulário (1.5h)
   ↓
7. TASK 7 - Melhorar erros (1h)
   ↓
8. TASK 8 - Testes (1h)
```

**Tempo total estimado:** 9-10 horas

---

## ✅ Critérios de Sucesso

### Funcionalidades
- [ ] Listagem mostra dados reais do banco
- [ ] Filtros funcionam corretamente
- [ ] Busca textual funciona
- [ ] Estatísticas são calculadas sobre dados reais
- [ ] Criação funciona com todos os campos preenchidos
- [ ] Edição funciona corretamente
- [ ] Exclusão funciona
- [ ] Upload de anexo funciona

### Técnico
- [ ] Company_id sempre preenchido
- [ ] Created_by e updated_by preenchidos
- [ ] RLS funcionando (isolamento por empresa)
- [ ] Tratamento de erros robusto
- [ ] Nenhum uso de mocks
- [ ] Logs de debug implementados

### Qualidade
- [ ] Código limpo e organizado
- [ ] Comentários onde necessário
- [ ] TypeScript sem erros
- [ ] Performance adequada

---

## 🚨 Pontos de Atenção

1. **Company ID:**
   - Usar sempre `getOrCreateDefaultCompany()`
   - Não hardcodar IDs

2. **Status:**
   - Verificar formato real no banco
   - Criar mapeamento se necessário

3. **RLS:**
   - Testar isolamento entre empresas
   - Verificar políticas no banco

4. **Mocks:**
   - Remover TODOS os imports de mocks
   - Verificar se não há outros arquivos usando mocks

---

## 📚 Arquivos Envolvidos

### A serem criados:
- `scripts/testing/verificar-estrutura-contas-pagar.js`
- `src/lib/contas-pagar-api.ts`

### A serem modificados:
- `src/pages/contas-pagar/ContasPagarList.tsx`
- `src/pages/contas-pagar/ContaPagarForm.tsx`
- `src/pages/contas-pagar/ContaPagarDetails.tsx` (verificar se precisa)
- `src/types/contas-pagar.ts` (se necessário)

### Referência:
- `src/lib/company-utils.ts`
- `src/pages/obras/ObrasList.tsx`
- `src/pages/colaboradores/ColaboradoresList.tsx`

---

**Status:** 📝 Planejamento Completo  
**Próximo passo:** Executar TASK 1 - Verificar estrutura do banco


