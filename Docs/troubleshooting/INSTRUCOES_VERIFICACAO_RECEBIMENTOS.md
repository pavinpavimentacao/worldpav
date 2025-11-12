# 🚀 INSTRUÇÕES - VERIFICAÇÃO DE RECEBIMENTOS

## TASK 1 em andamento 🔄

---

## 📋 O QUE FOI CRIADO:

1. ✅ **Script SQL de Verificação** → `db/migrations/XX_verificar_estrutura_recebimentos.sql`
2. ✅ **Template de Documentação** → `VERIFICACAO_ESTRUTURA_RECEBIMENTOS.md`
3. ✅ **Este arquivo com instruções**

---

## 🎯 OBJETIVO DA TASK 1

Verificar a estrutura real das tabelas no banco de dados para identificar:
- ✅ Quais colunas existem
- ✅ Quais colunas estão faltando
- ✅ Quais colunas têm nomes diferentes
- ✅ Quais são os valores de status usados

---

## 📝 COMO EXECUTAR:

### **OPÇÃO 1: Via Supabase Dashboard (RECOMENDADO)**

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - Menu lateral → "SQL Editor"
   - Clique em "New Query"

3. **Copie o Script**
   - Abra o arquivo: `worldpav/db/migrations/XX_verificar_estrutura_recebimentos.sql`
   - Copie TODO o conteúdo

4. **Cole e Execute**
   - Cole no SQL Editor
   - Clique em "Run" ou pressione `Ctrl+Enter`

5. **Salve os Resultados**
   - Copie os resultados de cada query
   - Cole no arquivo: `VERIFICACAO_ESTRUTURA_RECEBIMENTOS.md`

---

### **OPÇÃO 2: Via Terminal (CLI)**

```bash
# Se você tem supabase CLI instalado
cd worldpav

# Execute o script
supabase db execute --file db/migrations/XX_verificar_estrutura_recebimentos.sql
```

---

## 🔍 O QUE ANALISAR:

### **1. Estrutura de obras_notas_fiscais**

Verifique se existem estas colunas:
- ✅ `numero_nota` (ou `invoice_number`?)
- ✅ `valor_nota` (ou `amount`?)
- ✅ `vencimento` (ou `issue_date`?)
- ✅ `desconto_inss`
- ✅ `desconto_iss`
- ✅ `outro_desconto`
- ✅ `valor_liquido` (ou `net_amount`?)
- ✅ `status`
- ✅ `data_pagamento`
- ✅ `arquivo_nota_url` (ou `file_url`?)
- ✅ `observacoes`

### **2. Estrutura de obras_pagamentos_diretos**

Verifique se existem estas colunas:
- ✅ `descricao`
- ✅ `valor` (ou `amount`?)
- ✅ `data_pagamento` (ou `payment_date`?)
- ✅ `forma_pagamento` (ou `payment_method`?)
- ✅ `comprovante_url`
- ✅ `observacoes`

### **3. Valores de Status**

Verifique quais status estão sendo usados:
- `'pago'` ou `'paga'`?
- `'emitida'` ou `'pendente'`?
- `'vencido'` ou `'atrasado'`?

---

## ✅ RESULTADO ESPERADO:

Após executar o script, você deve ter:

1. ✅ Lista completa de colunas de cada tabela
2. ✅ Exemplos de dados existentes
3. ✅ Lista de status distintos
4. ✅ Informações sobre índices
5. ✅ Políticas RLS (segurança)

---

## 📊 PRÓXIMOS PASSOS:

Após completar a verificação:

1. ✅ Marcar Task 1 como concluída
2. ✅ Iniciar Task 2 - Criar scripts de padronização
3. ✅ Corrigir nomes de colunas baseado nos resultados

---

## 🆘 PROBLEMAS COMUNS:

### **Erro: "relation does not exist"**
- ❌ Tabela não foi criada ainda
- ✅ Executar as migrations de criação primeiro

### **Erro: "permission denied"**
- ❌ Permissões RLS bloqueando
- ✅ Verificar se usuário tem acesso

### **Não retorna dados**
- ❌ Tabela está vazia
- ✅ Normal para ambiente de desenvolvimento

---

## 📞 DÚVIDAS?

Se encontrar problemas:
1. Copie a mensagem de erro
2. Verifique a documentação do Supabase
3. Contate a equipe de desenvolvimento

---

**Status:** ⏳ Aguardando execução do script



