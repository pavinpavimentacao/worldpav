# Instruções para Debug - Criação de Diária

## Problema
Ao clicar em "+ Adicionar Diária", a diária não está sendo criada no banco de dados.

## Logs Adicionados

Adicionei logs detalhados em:
- `src/lib/controle-diario-api.ts` - Função `criarDiaria`
- `src/mocks/controle-diario-mock.ts` - Mock `criarRegistroDiaria`

## Como Testar

### 1. Abrir o Console do Navegador
- Pressione **F12** ou **Cmd+Option+I** (Mac)
- Vá para a aba **Console**

### 2. Tentar Criar uma Diária
1. Clique em **"+ Adicionar Diária"**
2. Preencha os campos:
   - **Colaborador**: Selecione um
   - **Quantidade**: 1
   - **Valor Unitário**: 150
   - Clique em **"Registrar Diária"**

### 3. Verificar os Logs no Console

Procure por logs com os seguintes prefixos:

#### Logs de Início:
```
📤 [criarRegistroDiaria] Tentando criar diária: {...}
🔍 [criarDiaria] Iniciando criação de diária: {...}
📋 [criarDiaria] Company ID: ...
📋 [criarDiaria] User ID: ...
```

#### Se a Relação Não Existir:
```
⚠️ [criarDiaria] Relação não encontrada, criando nova...
❌ [criarDiaria] Erro ao criar relação: {...}
```

#### Se Houver Erro na Inserção:
```
❌ [criarDiaria] Erro ao inserir diária: {...}
📋 [criarDiaria] Código do erro: ...
📋 [criarDiaria] Mensagem: ...
📋 [criarDiaria] Detalhes: ...
```

#### Se For Sucesso:
```
✅ [criarDiaria] Diária inserida no banco: {...}
✅ [criarDiaria] Diária criada com sucesso
```

## Possíveis Erros

### 1. Company ID não encontrado
**Erro**: `Company ID não encontrado`
**Solução**: Verificar se o usuário está autenticado

### 2. Erro ao criar relação diária
**Erro**: `null value in column "company_id" violates not-null constraint`
**Solução**: Já corrigido nos logs

### 3. Erro ao inserir diária
**Erro**: `Could not find the 'observations' column`
**Solução**: Já corrigido para usar `observacoes`

### 4. Foreign Key Violation
**Erro**: `Key is not present in table`
**Solução**: Verificar se o colaborador_id existe na tabela colaboradores

## Próximos Passos

1. **Copiar os logs do console** que aparecem ao tentar criar a diária
2. **Enviar os logs** para análise
3. **Verificar se há erros específicos** nos logs

## Logs Esperados (Sucesso)

Se tudo estiver funcionando, você verá:
```
📤 [criarRegistroDiaria] Tentando criar diária: {colaborador_id: "...", quantidade: 1, ...}
🔍 [criarDiaria] Iniciando criação de diária: {...}
📋 [criarDiaria] Company ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
📋 [criarDiaria] User ID: ...
🔍 [criarDiaria] Verificando relação diária para: 2025-10-28
⚠️ [criarDiaria] Relação não encontrada, criando nova...
✅ [criarDiaria] Relação criada: ...
📤 [criarDiaria] Inserindo diária no banco: {...}
✅ [criarDiaria] Diária inserida no banco: {...}
✅ [criarDiaria] Diária criada com sucesso
```


