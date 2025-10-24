# Correção da Coluna Volume Planejamento

## Problema Identificado

Foi identificado um erro ao calcular o faturamento previsto das obras:

```
Error: Erro ao buscar dados da obra: column obras.volume_planejamento does not exist
```

O problema ocorreu porque adicionamos a propriedade `volume_planejamento` à interface TypeScript `Obra` e tentamos acessá-la no banco de dados, mas a coluna correspondente não existia na tabela `obras`.

## Solução Implementada

### 1. Criação de Migração SQL

Criamos uma migração SQL para adicionar as colunas necessárias:

```sql
-- Adicionar coluna volume_planejamento
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS volume_planejamento DECIMAL(15,2) DEFAULT 0;

-- Adicionar coluna preco_por_m2 (caso ainda não exista)
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS preco_por_m2 DECIMAL(15,2) DEFAULT 0;

-- Comentários nas colunas
COMMENT ON COLUMN obras.volume_planejamento IS 'Volume total planejado para a obra em m³';
COMMENT ON COLUMN obras.preco_por_m2 IS 'Preço por metro quadrado da obra';
```

### 2. Melhoria da Função de Cálculo

Modificamos a função `calcularValorTotalServicos` em `src/lib/obrasServicosApi.ts` para ser mais resiliente:

- Agora ela tenta buscar o volume planejado, mas não falha se a coluna não existir
- Se não conseguir obter o volume previsto, simplesmente soma os valores totais dos serviços
- Usa `select('*')` em vez de `select('volume_planejamento')` para evitar erros de coluna inexistente

### 3. Script de Execução da Migração

Criamos um script SQL para facilitar a execução da migração:

```sql
-- Importar o arquivo de migração
\ir ../db/migrations/add_volume_planejamento_to_obras.sql

-- Mensagem de confirmação
SELECT 'Migração para adicionar volume_planejamento à tabela obras executada com sucesso!' as mensagem;
```

## Como Aplicar a Correção

1. Execute o script de migração no banco de dados:

```bash
psql -h <host> -U <usuario> -d <banco> -f scripts/executar-migracao-volume-planejamento.sql
```

Ou usando a interface do Supabase:

1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `db/migrations/add_volume_planejamento_to_obras.sql`
4. Execute a consulta

## Verificação

Após aplicar a migração, verifique se as colunas foram adicionadas corretamente:

```sql
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'obras' 
AND column_name IN ('volume_planejamento', 'preco_por_m2')
ORDER BY ordinal_position;
```

## Impacto

Esta correção permite que o sistema calcule corretamente o faturamento previsto com base no volume planejado e nos preços unitários dos serviços.

