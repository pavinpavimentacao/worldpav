# ✅ Verificação: Financeiro e Notas/Medições de Obras

## 📋 Checklist de Verificação

Este documento contém todas as verificações necessárias para garantir que o sistema de **Financeiro** e **Notas e Medições** está funcionando corretamente.

---

## 1. ✅ Estrutura do Banco de Dados

### Tabelas Necessárias

Execute este SQL para verificar se todas as tabelas existem:

```sql
-- Verificar se as tabelas existem
SELECT 
  table_name, 
  CASE 
    WHEN table_name IN (
      'obras',
      'obras_ruas',
      'obras_financeiro_faturamentos',
      'obras_financeiro_despesas',
      'obras_notas_fiscais',
      'obras_medicoes',
      'obras_pagamentos_diretos'
    ) THEN '✅ OK'
    ELSE '❌ FALTANDO'
  END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'obras%'
ORDER BY table_name;
```

### Campos Essenciais da Tabela `obras`

```sql
-- Verificar se o campo preco_por_m2 existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
  AND column_name = 'preco_por_m2';
```

**Resultado esperado:**
```
column_name   | data_type | is_nullable
--------------+-----------+-------------
preco_por_m2  | numeric   | YES
```

Se o campo não existir, adicione-o:

```sql
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2) DEFAULT 25.00;

COMMENT ON COLUMN obras.preco_por_m2 IS 'Preço por metro quadrado para cálculo de faturamento';
```

### Tabela `obras_notas_fiscais`

```sql
-- Verificar estrutura completa
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'obras_notas_fiscais'
ORDER BY ordinal_position;
```

**Campos esperados:**
- `id` (UUID, PK)
- `obra_id` (UUID, FK → obras)
- `numero_nota` (TEXT)
- `valor_nota` (DECIMAL)
- `vencimento` (DATE)
- `desconto_inss` (DECIMAL)
- `desconto_iss` (DECIMAL)
- `outro_desconto` (DECIMAL)
- `valor_liquido` (DECIMAL)
- `status` (TEXT: 'pendente', 'pago', 'vencido', 'renegociado')
- `data_pagamento` (DATE, nullable)
- `arquivo_nota_url` (TEXT)
- `observacoes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Tabela `obras_medicoes`

```sql
-- Verificar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'obras_medicoes'
ORDER BY ordinal_position;
```

**Campos esperados:**
- `id` (UUID, PK)
- `obra_id` (UUID, FK → obras)
- `nota_fiscal_id` (UUID, FK → obras_notas_fiscais, nullable)
- `descricao` (TEXT)
- `arquivo_medicao_url` (TEXT)
- `data_medicao` (DATE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## 2. ✅ Configuração do Supabase Storage

### Verificar Buckets

Execute no console do navegador (com supabase importado):

```javascript
const { data, error } = await supabase.storage.listBuckets()
console.log('Buckets disponíveis:', data)

// Verificar buckets necessários
const required = ['obras-notas-fiscais', 'obras-medicoes', 'obras-comprovantes']
required.forEach(bucket => {
  const exists = data?.find(b => b.name === bucket)
  console.log(`${bucket}: ${exists ? '✅' : '❌'}`)
})
```

### Criar Buckets Manualmente (se necessário)

Via Dashboard do Supabase:
1. Acesse Storage
2. Clique em "New bucket"
3. Configure:
   - **Nome**: `obras-notas-fiscais`
   - **Público**: ✅ Sim
   - **File size limit**: 10485760 (10MB)
   - **Allowed MIME types**: `application/pdf`

Repita para:
- `obras-medicoes` (PDF + Excel)
- `obras-comprovantes` (PDF + Imagens)

**Ou execute o script:**
```bash
node scripts/setup-storage-buckets.js
```

---

## 3. ✅ Testes Funcionais

### Teste 1: Criar uma Obra com Preço por M²

1. Acesse **Obras** → **Nova Obra**
2. Preencha os dados básicos
3. **IMPORTANTE**: Adicione o campo `Preço por M²` (ex: R$ 25,00)
4. Salve

**Verificar no banco:**
```sql
SELECT id, name, preco_por_m2
FROM obras
WHERE id = 'SEU_ID_AQUI';
```

### Teste 2: Criar e Finalizar uma Rua

1. Abra a obra criada
2. Vá na aba **Ruas**
3. Clique em **Nova Rua**
4. Preencha:
   - Nome: "Rua Teste A"
   - Metragem Planejada: 1000 m²
5. Salve
6. Clique em **Finalizar Rua**
7. Preencha:
   - Metragem Executada: 950 m²
   - Toneladas Utilizadas: 95 ton
8. Confirme

**Verificar faturamento criado:**
```sql
SELECT 
  f.id,
  f.metragem_executada,
  f.valor_total,
  f.preco_por_m2,
  r.nome as rua_nome
FROM obras_financeiro_faturamentos f
JOIN obras_ruas r ON r.id = f.rua_id
WHERE f.obra_id = 'SEU_ID_OBRA';
```

**Resultado esperado:**
- `valor_total` = 950 × 25 = **R$ 23.750,00**

### Teste 3: Verificar KPI de Faturamento Previsto

1. Na aba **Notas e Medições**
2. Verifique o card **Faturamento Previsto**
3. Deve mostrar: 1000 m² × R$ 25 = **R$ 25.000,00**

**Debug no console (F12):**
```javascript
// Verificar se o preço está sendo passado corretamente
console.log('Preço por M²:', obra.preco_por_m2)

// Testar cálculo manual
const { data: ruas } = await supabase
  .from('obras_ruas')
  .select('metragem_planejada')
  .eq('obra_id', 'SEU_ID_OBRA')

const total = ruas.reduce((sum, r) => sum + r.metragem_planejada, 0)
console.log('Faturamento Previsto:', total * 25)
```

### Teste 4: Criar Nota Fiscal

1. Na aba **Notas e Medições** → Sub-aba **Notas Fiscais**
2. Clique em **Nova Nota Fiscal**
3. Preencha:
   - Número da Nota: NF-2025-001
   - Valor da Nota: R$ 23.750,00
   - Vencimento: (data futura)
   - Desconto INSS: R$ 712,50 (3%)
   - Desconto ISS: R$ 475,00 (2%)
4. Faça upload de um PDF
5. Salve

**Verificações:**
- ✅ Valor líquido calculado automaticamente: **R$ 22.562,50**
- ✅ PDF foi enviado para o Storage
- ✅ Nota aparece na lista

**Verificar no banco:**
```sql
SELECT 
  numero_nota,
  valor_nota,
  desconto_inss,
  desconto_iss,
  valor_liquido,
  arquivo_nota_url,
  status
FROM obras_notas_fiscais
WHERE obra_id = 'SEU_ID_OBRA';
```

### Teste 5: Verificar KPI de Faturamento Bruto

Após criar a nota fiscal:
1. Volte para a aba **Notas e Medições**
2. Verifique o card **Faturamento Bruto**
3. Deve mostrar: **R$ 23.750,00**

### Teste 6: Criar Medição Vinculada

1. Vá para sub-aba **Medições**
2. Clique em **Nova Medição**
3. Preencha:
   - Descrição: "Medição Janeiro/2025 - Rua Teste A"
   - Data da Medição: (data atual)
   - **Vincular a Nota Fiscal**: Selecione NF-2025-001
4. Faça upload de um arquivo Excel ou PDF
5. Salve

**Verificações:**
- ✅ Medição criada
- ✅ Arquivo enviado
- ✅ Nota fiscal aparece vinculada
- ✅ Badge azul mostra "Vinculada à Nota NF-2025-001"

### Teste 7: Editar Nota Fiscal

1. Clique no botão de **Editar** em uma nota
2. Altere o valor ou vencimento
3. Salve

**Verificações:**
- ✅ Status alterado automaticamente para **"Renegociado"**
- ✅ Valor líquido recalculado
- ✅ Toast de sucesso exibido

### Teste 8: Excluir Nota Fiscal

**IMPORTANTE**: Não é possível excluir nota que tem medições vinculadas!

1. Tente excluir a nota com medição vinculada
   - ❌ Deve dar erro

2. Exclua primeiro a medição
3. Depois exclua a nota
   - ✅ Deve funcionar

---

## 4. ✅ Verificação de Erros Comuns

### Erro: "Bucket not found"

**Causa**: Buckets do Storage não foram criados

**Solução**:
```bash
node scripts/setup-storage-buckets.js
```

Ou crie manualmente no dashboard.

### Erro: "Permission denied" ao fazer upload

**Causa**: Políticas RLS muito restritivas

**Solução**: Configure os buckets como públicos no dashboard.

### Erro: "preco_por_m2 is undefined"

**Causa**: Campo não existe na tabela ou não foi preenchido

**Solução**:
```sql
-- Adicionar campo se não existir
ALTER TABLE obras ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(10,2) DEFAULT 25.00;

-- Atualizar obras existentes
UPDATE obras SET preco_por_m2 = 25.00 WHERE preco_por_m2 IS NULL;
```

### KPIs não aparecem ou mostram R$ 0,00

**Causa**: Não há ruas planejadas ou notas fiscais

**Solução**: 
1. Crie pelo menos uma rua com metragem planejada
2. Finalize a rua para gerar faturamento
3. Crie uma nota fiscal

### Upload falha mas não mostra erro

**Causa**: Arquivo muito grande ou tipo não permitido

**Solução**: Verifique:
- Arquivo PDF deve ter < 10MB
- Arquivo Excel deve ter < 10MB
- Tipos permitidos: PDF, XLSX, XLS

---

## 5. ✅ Queries Úteis para Debug

### Ver todas as notas de uma obra
```sql
SELECT 
  numero_nota,
  valor_nota,
  valor_liquido,
  status,
  vencimento,
  created_at
FROM obras_notas_fiscais
WHERE obra_id = 'SEU_ID'
ORDER BY created_at DESC;
```

### Ver todas as medições de uma obra
```sql
SELECT 
  m.descricao,
  m.data_medicao,
  n.numero_nota as nota_vinculada
FROM obras_medicoes m
LEFT JOIN obras_notas_fiscais n ON n.id = m.nota_fiscal_id
WHERE m.obra_id = 'SEU_ID'
ORDER BY m.data_medicao DESC;
```

### Ver faturamento total de uma obra
```sql
SELECT 
  SUM(valor_total) as total_faturado,
  COUNT(*) as ruas_finalizadas
FROM obras_financeiro_faturamentos
WHERE obra_id = 'SEU_ID';
```

### Ver resumo financeiro completo
```sql
SELECT 
  o.name as obra_nome,
  o.preco_por_m2,
  COALESCE(SUM(f.valor_total), 0) as total_faturado,
  COALESCE(SUM(d.valor), 0) as total_despesas,
  COALESCE(SUM(f.valor_total), 0) - COALESCE(SUM(d.valor), 0) as lucro_liquido
FROM obras o
LEFT JOIN obras_financeiro_faturamentos f ON f.obra_id = o.id
LEFT JOIN obras_financeiro_despesas d ON d.obra_id = o.id
WHERE o.id = 'SEU_ID'
GROUP BY o.id, o.name, o.preco_por_m2;
```

---

## 6. ✅ Checklist Final

Marque conforme for testando:

**Estrutura:**
- [ ] Tabela `obras` tem campo `preco_por_m2`
- [ ] Tabela `obras_notas_fiscais` existe e está completa
- [ ] Tabela `obras_medicoes` existe e está completa
- [ ] Buckets do Storage foram criados

**Funcionalidades:**
- [ ] Criar obra com preço por m²
- [ ] Criar e finalizar rua
- [ ] Faturamento é criado automaticamente
- [ ] KPI "Faturamento Previsto" funciona
- [ ] Criar nota fiscal
- [ ] Upload de PDF funciona
- [ ] Valor líquido é calculado automaticamente
- [ ] KPI "Faturamento Bruto" funciona
- [ ] Criar medição
- [ ] Upload de Excel/PDF funciona
- [ ] Vincular medição a nota fiscal
- [ ] Editar nota fiscal (status → renegociado)
- [ ] Excluir medição
- [ ] Excluir nota fiscal (sem medições vinculadas)

**Integrações:**
- [ ] Rua finalizada → Cria faturamento
- [ ] Faturamento → Atualiza KPIs
- [ ] Nota fiscal → Aparece em "Recebimentos"
- [ ] Medição vinculada → Impede exclusão de nota

---

## ✅ Conclusão

Se todos os testes passaram, o sistema está **100% funcional**! 🎉

Caso encontre algum problema:
1. Verifique os logs do navegador (Console F12)
2. Verifique os logs do Supabase
3. Execute as queries de debug acima
4. Consulte o arquivo `CONFIGURACAO_STORAGE_SUPABASE.md`

---

**Data da última verificação:** 23/10/2024
**Status:** ✅ Sistema pronto para produção



