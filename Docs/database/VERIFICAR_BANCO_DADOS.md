# 🔍 Como Verificar se as Tabelas Estão Criadas

## 📋 Opção 1: Via SQL (Recomendado)

### 1. Acesse o Supabase
1. Vá para https://app.supabase.com
2. Selecione seu projeto: **ztcwsztsiuevwmgyfyzh**
3. Clique em **SQL Editor** no menu lateral

### 2. Execute o Script de Verificação

Copie e cole todo o conteúdo do arquivo:
```
scripts/verificar-tabelas-supabase.sql
```

### 3. Analise os Resultados

**Se tudo estiver OK, você verá:**
```
✅ obras
✅ obras_ruas
✅ obras_financeiro_faturamentos
✅ obras_financeiro_despesas
✅ obras_notas_fiscais
✅ obras_medicoes
✅ obras_pagamentos_diretos
✅ companies
✅ clientes
✅ colaboradores
✅ maquinarios
```

**Se alguma tabela estiver faltando:**
```
❌ obras_notas_fiscais - FALTANDO!
```

---

## 📋 Opção 2: Via Dashboard (Visual)

### 1. Acesse Table Editor
1. Vá para https://app.supabase.com
2. Selecione seu projeto
3. Clique em **Table Editor** no menu lateral

### 2. Verifique se existem estas tabelas:

**Módulo OBRAS:**
- [ ] `obras`
- [ ] `obras_ruas`
- [ ] `obras_financeiro_faturamentos`
- [ ] `obras_financeiro_despesas`
- [ ] `obras_notas_fiscais`
- [ ] `obras_medicoes`
- [ ] `obras_pagamentos_diretos`

**Módulo BASE:**
- [ ] `companies`
- [ ] `clientes`

**Módulo COLABORADORES:**
- [ ] `colaboradores`
- [ ] `colaboradores_documentos`

**Módulo MAQUINÁRIOS:**
- [ ] `maquinarios`
- [ ] `maquinarios_licencas`

**Módulo FINANCEIRO:**
- [ ] `expenses`
- [ ] `contas_pagar`

**Módulo PROGRAMAÇÃO:**
- [ ] `programacao_diaria`
- [ ] `relatorios_diarios`

---

## 📋 Opção 3: Via Console do Navegador

### 1. Abra o Console (F12)

### 2. Execute este JavaScript:

```javascript
// Listar todas as tabelas
const tabelas = [
  'companies',
  'clientes',
  'obras',
  'obras_ruas',
  'obras_financeiro_faturamentos',
  'obras_financeiro_despesas',
  'obras_notas_fiscais',
  'obras_medicoes',
  'obras_pagamentos_diretos',
  'colaboradores',
  'maquinarios'
]

for (const tabela of tabelas) {
  const { data, error } = await supabase
    .from(tabela)
    .select('id')
    .limit(1)
  
  if (error) {
    console.log(`❌ ${tabela}: ${error.message}`)
  } else {
    console.log(`✅ ${tabela}`)
  }
}
```

---

## ❌ Se as Tabelas NÃO existirem

### Você precisa executar as migrations!

#### Passo 1: Ordem de Execução

Execute os arquivos SQL nesta ordem no **SQL Editor** do Supabase:

```
1. db/migrations/00_foundation.sql
2. db/migrations/01_companies_clientes.sql
3. db/migrations/02_obras.sql
4. db/migrations/03_obras_financeiro.sql
5. db/migrations/create_obras_notas_medicoes.sql
6. db/migrations/fix_obras_preco_por_m2.sql
7. db/migrations/04_maquinarios.sql
8. db/migrations/05_colaboradores.sql
9. db/migrations/06_programacao.sql
10. db/migrations/07_relatorios.sql
11. db/migrations/08_financial.sql
```

#### Passo 2: Ou Execute o Script Completo

Se existe um arquivo consolidado:
```sql
-- Executar no SQL Editor
\i db/migrations/apply_migration.sql
```

---

## ✅ Se as Tabelas JÁ existirem

### Verifique apenas se está tudo atualizado:

#### 1. Campo `preco_por_m2` na tabela `obras`

Execute:
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'obras' 
  AND column_name = 'preco_por_m2';
```

**Se retornar vazio**, execute:
```sql
-- Arquivo: db/migrations/fix_obras_preco_por_m2.sql
```

#### 2. Buckets do Storage

Verifique no dashboard: **Storage** → Deve ter:
- `obras-notas-fiscais`
- `obras-medicoes`
- `obras-comprovantes`

**Se não existirem**, execute:
```bash
node scripts/setup-storage-buckets.js
```

---

## 🎯 Status Atual do Seu Banco

Pelo seu log, vejo que o **Supabase está conectado**:
```
Supabase URL: https://ztcwsztsiuevwmgyfyzh.supabase.co ✅
Supabase Key: DEFINIDA ✅
```

**Mas não sei se as tabelas estão criadas!**

---

## 🚀 Verificação Rápida (30 segundos)

### No Console do Navegador (F12):

```javascript
// Teste rápido de tabelas essenciais
const testar = async () => {
  const tabelas = ['obras', 'obras_ruas', 'obras_notas_fiscais', 'clientes']
  
  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase.from(tabela).select('id').limit(1)
      console.log(error ? `❌ ${tabela}` : `✅ ${tabela}`)
    } catch (e) {
      console.log(`❌ ${tabela}`)
    }
  }
}

testar()
```

---

## 📊 Resultado Esperado

### ✅ Se tudo estiver OK:
```
✅ obras
✅ obras_ruas
✅ obras_notas_fiscais
✅ clientes
```

### ❌ Se faltar tabelas:
```
❌ obras - relation "obras" does not exist
❌ obras_ruas - relation "obras_ruas" does not exist
```

**→ Neste caso, você precisa executar as migrations!**

---

## 🎯 Me Avise

**Execute o teste rápido acima e me diga:**
- ✅ "Todas as tabelas existem"
- ❌ "Está dando erro X na tabela Y"

Assim eu posso te ajudar a criar as tabelas que faltam! 🚀

