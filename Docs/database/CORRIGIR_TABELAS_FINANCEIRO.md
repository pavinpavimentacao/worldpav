# 🔧 Correção: Tabelas de Financeiro de Obras

## 🎯 Problema

As tabelas `obras_financeiro_faturamentos` e `obras_financeiro_despesas` não existem no banco de dados, causando erros 404 ao acessar a aba Financeiro das obras.

**Erro:**
```
Could not find the table 'public.obras_financeiro_faturamentos' in the schema cache
Could not find the table 'public.obras_financeiro_despesas' in the schema cache
```

## ✅ Solução

Aplicar a migração `create_obras_financeiro.sql` que cria as tabelas necessárias.

## 📋 Tabelas que Serão Criadas

1. **obras_financeiro_faturamentos** - Faturamentos das ruas executadas
2. **obras_financeiro_despesas** - Despesas específicas de cada obra
3. **maquinarios_diesel** (se não existir) - Controle de diesel por maquinário

## 🚀 Como Aplicar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse**: https://supabase.com/dashboard
2. **SQL Editor** (menu lateral)
3. **New Query**
4. **Copie e cole** o conteúdo do arquivo: `db/migrations/create_obras_financeiro.sql`
5. **Execute** (Run ou Ctrl+Enter)
6. Aguarde a confirmação de sucesso

### Opção 2: SQL Simplificado (Se deu erro de índice já existente)

**Use este arquivo em vez do anterior:**
- Arquivo: `db/migrations/create_obras_financeiro_SOMENTE_FALTANTES.sql`
- Este arquivo usa `IF NOT EXISTS` em tudo e evita erros

### Opção 3: SQL Direto

Execute no SQL Editor do Supabase:

```sql
-- 1. Tabela de Faturamentos das Obras
CREATE TABLE IF NOT EXISTS obras_financeiro_faturamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  rua_id UUID NOT NULL REFERENCES obras_ruas(id) ON DELETE CASCADE,
  metragem_executada DECIMAL(10,2) NOT NULL,
  toneladas_utilizadas DECIMAL(10,2) NOT NULL,
  espessura_calculada DECIMAL(10,2) NOT NULL,
  preco_por_m2 DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  data_finalizacao DATE NOT NULL,
  data_pagamento DATE,
  nota_fiscal TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_financeiro_faturamentos
CREATE INDEX IF NOT EXISTS idx_faturamentos_obra_id ON obras_financeiro_faturamentos(obra_id);
CREATE INDEX IF NOT EXISTS idx_faturamentos_rua_id ON obras_financeiro_faturamentos(rua_id);
CREATE INDEX IF NOT EXISTS idx_faturamentos_status ON obras_financeiro_faturamentos(status);
CREATE INDEX IF NOT EXISTS idx_faturamentos_data_finalizacao ON obras_financeiro_faturamentos(data_finalizacao);

-- 2. Tabela de Despesas das Obras
CREATE TABLE IF NOT EXISTS obras_financeiro_despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('diesel', 'materiais', 'manutencao', 'outros')),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_despesa DATE NOT NULL,
  maquinario_id UUID REFERENCES maquinarios(id) ON DELETE SET NULL,
  fornecedor TEXT,
  comprovante_url TEXT,
  sincronizado_financeiro_principal BOOLEAN NOT NULL DEFAULT true,
  financeiro_principal_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para obras_financeiro_despesas
CREATE INDEX IF NOT EXISTS idx_despesas_obra_id ON obras_financeiro_despesas(obra_id);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON obras_financeiro_despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON obras_financeiro_despesas(data_despesa);
CREATE INDEX IF NOT EXISTS idx_despesas_maquinario ON obras_financeiro_despesas(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_despesas_financeiro_principal ON obras_financeiro_despesas(financeiro_principal_id);

-- Habilitar RLS
ALTER TABLE obras_financeiro_faturamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras_financeiro_despesas ENABLE ROW LEVEL SECURITY;

-- Políticas para obras_financeiro_faturamentos
CREATE POLICY "Usuários autenticados podem ver faturamentos" ON obras_financeiro_faturamentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir faturamentos" ON obras_financeiro_faturamentos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar faturamentos" ON obras_financeiro_faturamentos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar faturamentos" ON obras_financeiro_faturamentos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para obras_financeiro_despesas
CREATE POLICY "Usuários autenticados podem ver despesas" ON obras_financeiro_despesas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir despesas" ON obras_financeiro_despesas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar despesas" ON obras_financeiro_despesas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar despesas" ON obras_financeiro_despesas
  FOR DELETE USING (auth.role() = 'authenticated');

-- Comentários nas tabelas
COMMENT ON TABLE obras_financeiro_faturamentos IS 'Faturamentos gerados quando ruas são finalizadas';
COMMENT ON TABLE obras_financeiro_despesas IS 'Despesas específicas de cada obra';
COMMENT ON COLUMN obras_financeiro_faturamentos.espessura_calculada IS 'Calculada pela fórmula: toneladas / metragem / 2.4 (densidade)';
COMMENT ON COLUMN obras_financeiro_despesas.sincronizado_financeiro_principal IS 'Indica se a despesa deve aparecer no financeiro principal';
```

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('obras_financeiro_faturamentos', 'obras_financeiro_despesas')
ORDER BY table_name;
```

Deve retornar 2 linhas com os nomes das tabelas.

## ✅ Depois de Aplicar

1. Acesse uma obra no sistema
2. Clique na aba **"Financeiro"**
3. ✅ **Não deve mais dar erro 404**
4. A tela deve carregar normalmente (vazia se ainda não houver dados)

## 📊 Estrutura das Tabelas

### obras_financeiro_faturamentos

Armazena o faturamento de cada rua finalizada:
- Metragem executada
- Toneladas utilizadas
- Espessura calculada automaticamente
- Valor total (metragem × preço/m²)
- Status: pendente ou pago

### obras_financeiro_despesas

Armazena despesas específicas da obra:
- Categorias: diesel, materiais, manutenção, outros
- Pode vincular a um maquinário
- Pode sincronizar com financeiro principal
- Comprovante de pagamento (URL)

## ⚠️ Observações

1. **Backup**: Recomenda-se fazer backup antes de executar migrações
2. **Permissões**: Certifique-se de ter permissões para criar tabelas
3. **RLS**: As políticas de segurança estão configuradas para usuários autenticados
4. **Relações**: As tabelas têm foreign keys para `obras`, `obras_ruas` e `maquinarios`

## 🔗 Integração

Após aplicar a migração, o sistema terá:
- ✅ Aba Financeiro funcionando em Detalhes da Obra
- ✅ Criação automática de faturamentos ao finalizar ruas
- ✅ Registro de despesas por obra
- ✅ Relatórios financeiros por obra
- ✅ Cálculo de lucro líquido (faturamento - despesas)

---

**Status**: 🔧 Requer aplicação da migração no banco de dados
