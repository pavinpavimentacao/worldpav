# Implementação de Serviços para Obras

## Problema Identificado

Os serviços não estavam sendo exibidos no formulário de criação de obras porque:

1. Não existia uma tabela no banco de dados para armazenar os serviços do catálogo
2. A função `getServicosAtivos()` estava apenas retornando dados mockados
3. O componente `ServicoSelector` não estava preparado para carregar dados de forma assíncrona

## Solução Implementada

### 1. Criação de Tabelas no Banco de Dados

Foram criadas duas tabelas:

- **`obras_servicos`**: Armazena os serviços vinculados a cada obra
- **`servicos_catalogo`**: Armazena o catálogo de serviços disponíveis no sistema

### 2. Migração dos Dados

Criamos dois arquivos de migração:

- **`db/migrations/04_obras_servicos.sql`**: Cria a tabela `obras_servicos`
- **`db/migrations/05_servicos_catalogo.sql`**: Cria a tabela `servicos_catalogo` e insere os serviços iniciais

### 3. APIs para Acesso aos Dados

Criamos duas APIs:

- **`src/lib/obrasServicosApi.ts`**: Para gerenciar serviços vinculados a obras
- **`src/lib/servicosCatalogoApi.ts`**: Para gerenciar o catálogo de serviços

### 4. Atualização da Função `getServicosAtivos()`

A função foi modificada para:

1. Tentar buscar serviços do banco de dados
2. Em caso de erro ou se não encontrar serviços, usar os dados mockados como fallback
3. Uma versão síncrona `getServicosAtivosSinc()` foi criada para compatibilidade com código existente

### 5. Atualização do Componente `ServicoSelector`

O componente foi atualizado para:

1. Carregar serviços de forma assíncrona usando `useEffect`
2. Mostrar um indicador de carregamento enquanto os serviços são carregados
3. Tratar erros e usar dados mockados como fallback

## Como Testar

### 1. Executar as Migrações

Execute os scripts SQL no Supabase SQL Editor:

1. Primeiro o script `db/migrations/04_obras_servicos.sql`
2. Depois o script `db/migrations/05_servicos_catalogo.sql`

Ou use o script consolidado `scripts/executar-migracoes-servicos.sql`

### 2. Verificar as Tabelas

Execute a consulta:

```sql
SELECT 
  table_name,
  COUNT(*) AS total_colunas
FROM information_schema.columns 
WHERE table_name IN ('obras_servicos', 'servicos_catalogo')
AND table_schema = 'public'
GROUP BY table_name;
```

### 3. Verificar os Serviços no Catálogo

Execute a consulta:

```sql
SELECT id, nome, tipo, unidade_padrao, preco_base, ativo
FROM servicos_catalogo
ORDER BY nome;
```

### 4. Testar o Formulário de Nova Obra

1. Acesse: http://localhost:5173
2. Vá em: Obras → Nova Obra
3. Clique em "Adicionar Serviço"
4. Verifique se os serviços são carregados no dropdown

## Arquivos Modificados

1. `src/types/servicos.ts`: Atualizada a função `getServicosAtivos()`
2. `src/components/shared/ServicoSelector.tsx`: Atualizado para carregar serviços de forma assíncrona
3. `src/lib/obrasServicosApi.ts`: Nova API para serviços de obras
4. `src/lib/servicosCatalogoApi.ts`: Nova API para catálogo de serviços
5. `db/migrations/04_obras_servicos.sql`: Migração para tabela de serviços de obras
6. `db/migrations/05_servicos_catalogo.sql`: Migração para tabela de catálogo de serviços
7. `scripts/executar-migracoes-servicos.sql`: Script para executar as migrações

## Próximos Passos

1. Executar as migrações no banco de dados
2. Testar o formulário de criação de obras
3. Verificar se os serviços estão sendo salvos corretamente

