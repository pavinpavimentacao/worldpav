# 🔧 Correção: Dados Vazios na Programação

## 📋 Problema Identificado

Os dados da programação estavam sendo salvos no banco, mas vários campos apareciam vazios na interface:
- RUA e FAIXA vazios
- METRAGEM PREVISTA e QUANTIDADE PROGRAMADA com valor 0
- Outros campos opcionais também não apareciam

### 🔍 Causa Raiz

**A função `create` da API estava salvando apenas campos básicos:**
- `company_id`, `obra_id`, `date`, `status`, `team`, `equipment`, `observations`

**Mas o formulário enviava MUITO MAIS campos:**
- `metragem_prevista`, `quantidade_toneladas`, `faixa_realizar`
- `rua_id`, `horario_inicio`, `tipo_servico`, `espessura_media_solicitada`

Esses campos NÃO estavam sendo salvos no banco de dados!

## ✅ Correção Aplicada

### 1. Atualizada a função `create` em `programacao-pavimentacao-api.ts`

```typescript
const insertData = {
  company_id: data.company_id,
  obra_id: data.obra_id,
  date: data.data,
  status: data.status || 'programado',
  team: data.prefixo_equipe,
  equipment: data.maquinarios || [],
  observations: data.observacoes,
  // ✅ NOVO: Adicionar TODOS os campos enviados pelo formulário
  metragem_prevista: data.metragem_prevista || 0,
  quantidade_toneladas: data.quantidade_toneladas || 0,
  faixa_realizar: data.faixa_realizar || '',
  rua_id: data.rua_id || null,
  horario_inicio: data.horario_inicio || null,
  tipo_servico: data.tipo_servico || null,
  espessura_media_solicitada: data.espessura_media_solicitada ? parseFloat(data.espessura_media_solicitada) : null
}
```

### 2. Verificação: Migration 08 Aplicada?

A tabela `programacao_pavimentacao` precisa ter os campos adicionados pela migration `08_add_programacao_fields.sql`.

**Execute este SQL no Supabase para adicionar os campos se ainda não estiverem presentes:**

```sql
-- Verificar se os campos existem
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'programacao_pavimentacao' 
  AND column_name IN (
    'metragem_prevista', 
    'quantidade_toneladas', 
    'faixa_realizar', 
    'rua_id',
    'horario_inicio',
    'tipo_servico',
    'espessura_media_solicitada'
  );

-- Se alguns campos não existirem, execute a migration 08
-- Copiar e colar o conteúdo de db/migrations/08_add_programacao_fields.sql
```

## 🧪 Teste

Após aplicar a correção:

1. **Criar uma nova programação** com todos os campos preenchidos
2. **Verificar** se os dados aparecem corretamente na lista
3. **Ver detalhes** de uma programação existente para confirmar que os campos são exibidos

## 📝 Resumo

- ✅ Função `create` atualizada para salvar TODOS os campos
- ✅ Migration 08 deve estar aplicada no banco
- ⚠️ Programações antigas ainda terão campos vazios (precisam ser recriadas ou editadas)




