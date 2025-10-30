# 📋 STATUS DAS MIGRATIONS - RELATÓRIOS DIÁRIOS

## ✅ MIGRATIONS EXISTENTES E VALIDADAS

### 1. Relatórios Diários Completo
**Arquivo**: `db/migrations/create_relatorios_diarios_completo.sql`

**Status**: ✅ Arquivo existe e está completo

**O que cria**:
- ✅ Tabela `relatorios_diarios` com todos os campos necessários
- ✅ Tabela `relatorios_diarios_maquinarios` para vinculação
- ✅ Atualiza `obras_ruas` com campos de finalização
- ✅ Triggers automáticos:
  - `gerar_numero_relatorio()` - Gera RD-YYYY-001
  - `calcular_espessura_relatorio()` - Calcula espessura
  - `finalizar_rua_trigger` - Finaliza rua automaticamente
- ✅ RLS policies
- ✅ View `vw_relatorios_diarios_completo`
- ✅ Todos os índices necessários

**CAMPOS IMPORTANTES**:
```sql
relatorios_diarios:
  - id UUID
  - numero VARCHAR(50) -- Auto-gerado: RD-YYYY-001
  - cliente_id UUID → clients(id)
  - obra_id UUID → obras(id)
  - rua_id UUID → obras_ruas(id)
  - equipe_id UUID
  - equipe_is_terceira BOOLEAN
  - data_inicio DATE
  - data_fim DATE
  - horario_inicio TIME
  - metragem_feita DECIMAL(10,2)
  - toneladas_aplicadas DECIMAL(10,2)
  - espessura_calculada DECIMAL(5,2) -- Calculada automaticamente
  - observacoes TEXT
  - status VARCHAR(20) DEFAULT 'finalizado'
```

### 2. Obras Ruas (Atualização)
**Arquivo**: `db/migrations/create_relatorios_diarios_completo.sql` (linhas 70-79)

**O que adiciona em `obras_ruas`**:
```sql
- relatorio_diario_id UUID REFERENCES relatorios_diarios(id)
- data_finalizacao DATE
- metragem_executada DECIMAL(10,2)
- toneladas_executadas DECIMAL(10,2)
```

### 3. Obras Financeiro Faturamentos
**Arquivo**: `db/migrations/create_obras_financeiro.sql` ou `create_obras_financeiro_MINIMO.sql`

**Status**: ✅ Arquivo existe

**O que cria**:
```sql
obras_financeiro_faturamentos:
  - id UUID
  - obra_id UUID → obras(id)
  - rua_id UUID → obras_ruas(id)
  - metragem_executada DECIMAL(10,2)
  - toneladas_utilizadas DECIMAL(10,2)
  - espessura_calculada DECIMAL(10,2)
  - preco_por_m2 DECIMAL(10,2)
  - valor_total DECIMAL(10,2)
  - data_finalizacao DATE
  - created_at TIMESTAMP
  - updated_at TIMESTAMP
```

---

## ⚠️ ATENÇÃO: DUPLICAÇÃO DE TABELAS

Há **duas migrations diferentes** criando `obras_ruas`:

### Versão 1: `02_obras.sql`
- Campos: `id`, `obra_id`, `name`, `length`, `width`, `area`, `status`, `start_date`, `end_date`, `observations`
- Status: `status_rua` (enum) - 'planejada', 'andamento', 'concluida', 'cancelada'

### Versão 2: `create_obras_financeiro.sql`
- Campos: `id`, `obra_id`, `nome`, `metragem_planejada`, `status`, `ordem`, `observacoes`
- Status: TEXT - 'pendente', 'em_andamento', 'finalizada'

**DECISÃO NECESSÁRIA**: Verificar qual tabela está no banco e padronizar.

---

## 🔍 VERIFICAÇÃO NO BANCO DE DADOS

Execute estas queries no Supabase SQL Editor para verificar:

### 1. Verificar se tabela relatorios_diarios existe
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'relatorios_diarios'
ORDER BY ordinal_position;
```

### 2. Verificar se tabela relatorios_diarios_maquinarios existe
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'relatorios_diarios_maquinarios'
ORDER BY ordinal_position;
```

### 3. Verificar campos em obras_ruas
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'obras_ruas'
ORDER BY ordinal_position;
```

**Procurar por**:
- ✅ `relatorio_diario_id` (UUID)
- ✅ `data_finalizacao` (DATE)
- ✅ `metragem_executada` (DECIMAL)
- ✅ `toneladas_executadas` (DECIMAL)

### 4. Verificar se tabela obras_financeiro_faturamentos existe
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'obras_financeiro_faturamentos'
ORDER BY ordinal_position;
```

### 5. Verificar triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('relatorios_diarios', 'obras_ruas');
```

**Procurar por**:
- ✅ `gerar_numero_relatorio_trigger`
- ✅ `calcular_espessura_relatorio_trigger`
- ✅ `finalizar_rua_trigger`

---

## 📝 PROCEDIMENTO PARA APLICAR NO SUPABASE

### Opção 1: Via SQL Editor (RECOMENDADO)

1. **Acesse Supabase Dashboard** → **SQL Editor**

2. **Execute a migration completa**:
   - Abra o arquivo: `db/migrations/create_relatorios_diarios_completo.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Execute (RUN)

3. **Verifique se foi aplicado**:
   ```sql
   -- Verificar se as tabelas foram criadas
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('relatorios_diarios', 'relatorios_diarios_maquinarios');
   ```

4. **Verificar se os campos foram adicionados em obras_ruas**:
   ```sql
   -- Verificar se relatorio_diario_id existe
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'obras_ruas' 
   AND column_name = 'relatorio_diario_id';
   ```

### Opção 2: Via CLI do Supabase (se configurado)

```bash
cd worldpav
supabase db push
```

---

## ⚠️ PROBLEMA IDENTIFICADO: TRIGGER AUTOMÁTICO

A migration tem um **trigger automático** que finaliza a rua:

```sql
CREATE TRIGGER finalizar_rua_trigger
  AFTER INSERT ON relatorios_diarios
  FOR EACH ROW
  EXECUTE FUNCTION finalizar_rua_ao_criar_relatorio();
```

**ISSO CONFLITA** com nossa implementação manual na API que também finaliza a rua!

**DECISÃO NECESSÁRIA**:
- **Opção A**: Desabilitar o trigger e usar apenas nossa função manual
- **Opção B**: Manter o trigger e remover nossa função manual
- **Opção C**: Manter ambos (redundante, mas seguro)

**RECOMENDAÇÃO**: Manter o trigger (já que está na migration) e comentar nossa função manual para evitar duplicação.

---

## 📊 CHECKLIST DE VERIFICAÇÃO

- [ ] Migration `create_relatorios_diarios_completo.sql` foi aplicada
- [ ] Tabela `relatorios_diarios` existe com todos os campos
- [ ] Tabela `relatorios_diarios_maquinarios` existe
- [ ] Campos em `obras_ruas` foram adicionados:
  - [ ] `relatorio_diario_id`
  - [ ] `data_finalizacao`
  - [ ] `metragem_executada`
  - [ ] `toneladas_executadas`
- [ ] Tabela `obras_financeiro_faturamentos` existe
- [ ] Triggers foram criados:
  - [ ] `gerar_numero_relatorio_trigger`
  - [ ] `calcular_espessura_relatorio_trigger`
  - [ ] `finalizar_rua_trigger`
- [ ] RLS policies foram criadas
- [ ] View `vw_relatorios_diarios_completo` existe

---

## 🎯 PRÓXIMOS PASSOS

1. **Aplicar a migration** no Supabase (se ainda não foi aplicada)
2. **Verificar se os campos** em `obras_ruas` existem
3. **Decidir sobre o trigger** automático vs manual
4. **Testar criação de relatório** manual
5. **Testar confirmação de rua** automática

---

**Status**: 🔍 Aguardando verificação no banco  
**Próximo Passo**: Aplicar migration no Supabase (se necessário)


