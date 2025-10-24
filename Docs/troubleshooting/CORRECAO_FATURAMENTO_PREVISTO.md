# ✅ Correção do Faturamento Previsto

## 🎯 Problema Identificado

O **Faturamento Previsto** estava sendo calculado corretamente no resumo ao salvar uma obra, mas **não estava sendo salvo no banco de dados**. Isso causava inconsistência:

- ✅ **Resumo ao salvar**: Calculava corretamente baseado no volume de metragem previsto
- ❌ **Visualização da obra**: Mostrava R$ 0,00 porque os dados não foram salvos no banco

## 🔧 Solução Implementada

### 1. **Atualização da Interface ObraInsertData**

Adicionados campos de planejamento que estavam faltando:

```typescript
// src/lib/obrasApi.ts
export interface ObraInsertData {
  // ... campos existentes
  
  // Campos de planejamento adicionados:
  unidade_cobranca?: string | null          // m2, m3 ou diaria
  volume_planejamento?: number | null       // Volume previsto
  total_ruas?: number | null                // Número de ruas
  previsao_dias?: number | null             // Dias previstos
  tem_cnpj_separado?: boolean | null        // Se tem CNPJ próprio
  cnpj_obra?: string | null                 // CNPJ da obra
  razao_social_obra?: string | null         // Razão social
}
```

### 2. **Atualização do Salvamento da Obra**

Modificado o `onSubmit` para incluir todos os campos:

```typescript
// src/pages/obras/NovaObra.tsx
const obraData: ObraInsertData = {
  // ... dados existentes
  
  // Campos de planejamento agora são salvos:
  unidade_cobranca: data.unidade_cobranca || null,
  volume_planejamento: data.volume_planejamento || null,
  total_ruas: data.total_ruas || null,
  previsao_dias: data.previsao_dias || null,
  tem_cnpj_separado: data.tem_cnpj_separado || null,
  cnpj_obra: data.cnpj_obra || null,
  razao_social_obra: data.razao_social_obra || null
}
```

### 3. **Nova Migração do Banco de Dados**

Criada migração completa para adicionar todas as colunas necessárias:

**Arquivo**: `db/migrations/add_campos_planejamento_obras.sql`

Adiciona as seguintes colunas à tabela `obras`:
- `unidade_cobranca` (TEXT) - Unidade de cobrança: m2, m3 ou diaria
- `volume_planejamento` (DECIMAL) - Volume total planejado
- `total_ruas` (INTEGER) - Número de ruas previstas
- `previsao_dias` (INTEGER) - Previsão de duração
- `tem_cnpj_separado` (BOOLEAN) - Se tem CNPJ separado
- `cnpj_obra` (TEXT) - CNPJ específico da obra
- `razao_social_obra` (TEXT) - Razão social da obra
- `preco_por_m2` (DECIMAL) - Preço por unidade

## 📋 Como Aplicar a Correção

### Opção 1: Via Script Node.js (Recomendado)

```bash
node scripts/aplicar-migracao-planejamento.js
```

### Opção 2: Manualmente no Supabase Dashboard

1. Acesse o **Supabase Dashboard** do seu projeto
2. Vá em **SQL Editor**
3. Copie todo o conteúdo do arquivo `db/migrations/add_campos_planejamento_obras.sql`
4. Cole no editor e clique em **Run**
5. Verifique se todas as colunas foram criadas com sucesso

### Opção 3: Via Supabase CLI

```bash
supabase db push
```

## 🧪 Como Testar

1. **Acesse**: http://localhost:5173/obras/nova
2. **Preencha** os dados da obra:
   - Nome, cliente, localização
   - **Volume Planejamento** (ex: 1000 m³)
   - Unidade de cobrança (m2 ou m3)
3. **Adicione serviços**:
   - Serviços por m²/m³ (ex: Pavimentação)
   - Serviços de mobilização (se aplicável)
4. **Verifique o resumo**:
   - Deve mostrar o cálculo correto
   - Previsão = (Soma preços m²/m³) × Volume + Mobilização
5. **Salve a obra**
6. **Visualize a obra criada**:
   - Vá na aba "Visão Geral"
   - O **Faturamento Previsto** deve mostrar o valor correto
   - NÃO deve mais aparecer R$ 0,00

## 📊 Fórmula do Faturamento Previsto

```
Faturamento Previsto = (∑ Preços Unitários m²/m³ × Volume Previsto) + ∑ Valores de Mobilização
```

**Exemplo:**
- Serviço A: R$ 25,00/m² 
- Serviço B: R$ 15,00/m²
- Volume: 1.000 m²
- Mobilização: R$ 5.000,00

**Cálculo:**
```
(25 + 15) × 1.000 + 5.000 = R$ 45.000,00
```

## ✅ Benefícios

1. **Consistência**: Resumo e visualização mostram o mesmo valor
2. **Persistência**: Dados são salvos corretamente no banco
3. **Confiabilidade**: Faturamento previsto baseado em dados reais
4. **Rastreabilidade**: Todas as informações de planejamento são armazenadas
5. **Integridade**: Constraints garantem valores válidos

## 🔍 Verificação Pós-Aplicação

Execute no SQL Editor do Supabase para verificar:

```sql
-- Verificar se as colunas existem
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'obras' 
AND column_name IN (
  'unidade_cobranca',
  'volume_planejamento',
  'total_ruas',
  'previsao_dias',
  'tem_cnpj_separado',
  'cnpj_obra',
  'razao_social_obra',
  'preco_por_m2'
)
ORDER BY column_name;

-- Verificar obras existentes
SELECT 
  id,
  name,
  volume_planejamento,
  unidade_cobranca,
  preco_por_m2
FROM obras
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;
```

## 📝 Arquivos Modificados

1. ✅ `src/lib/obrasApi.ts` - Interfaces ObraInsertData e ObraUpdateData atualizadas
2. ✅ `src/pages/obras/NovaObra.tsx` - Salvamento de dados completo
3. ✅ `src/pages/obras/EditarObra.tsx` - **NOVO**: Página de edição de obra
4. ✅ `src/routes/index.tsx` - Rota de edição adicionada
5. ✅ `db/migrations/add_campos_planejamento_obras.sql` - Nova migração
6. ✅ `scripts/aplicar-migracao-planejamento.js` - Script de aplicação

## 🚀 Próximos Passos

Após aplicar a correção:

1. ✅ **Criar nova obra** com volume previsto
2. ✅ **Editar obra existente** e adicionar/modificar o volume previsto
3. ✅ **Visualizar obra** e confirmar que o faturamento previsto aparece
4. ✅ **Persistência** verificada - dados são salvos corretamente

### Como Editar uma Obra

1. Acesse a lista de obras: `/obras`
2. Clique em uma obra para visualizar os detalhes
3. Clique no botão **"Editar Obra"** (canto superior direito)
4. Modifique os campos desejados, incluindo:
   - Volume Planejamento
   - Unidade de Cobrança
   - Total de Ruas
   - Previsão de Dias
   - E todos os outros campos
5. Clique em **"Salvar Alterações"**
6. O faturamento previsto será recalculado automaticamente

## ⚠️ Observações Importantes

- Obras criadas **antes** da migração terão `volume_planejamento = 0`
- É necessário editar essas obras para adicionar o volume previsto
- O cálculo só funciona com serviços já cadastrados
- Serviços devem ter unidade e preço unitário corretos

---

**Data da Correção**: 23/10/2025  
**Status**: ✅ Implementado
