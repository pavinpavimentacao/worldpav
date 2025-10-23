# Fluxo Completo de Confirmação de Obra

## 📋 Visão Geral

Sistema completo que conecta **Programação → Execução → Relatório Diário → Faturamento**, permitindo a confirmação de obras executadas e finalizando automaticamente as ruas.

## 🔄 Fluxo Completo Passo a Passo

### 1️⃣ **Cadastrar Cliente**
```
Menu: Clientes → + Novo Cliente
```
- Nome da empresa/pessoa
- CNPJ/CPF
- Contato
- Endereço

### 2️⃣ **Criar Obra dentro do Cliente**
```
Menu: Cliente → Obras → + Nova Obra
```
- Nome da obra
- Endereço/local
- Cliente (pré-selecionado)
- Datas previstas
- Valor do m²

### 3️⃣ **Cadastrar Ruas na Obra**
```
Menu: Obra → Aba "Ruas" → + Adicionar Rua
```
Para cada rua/trecho:
- Nome da rua/trecho
- **Metragem planejada** (m²)
- **Toneladas previstas** (t)
- Observações

**Status inicial:** `PENDENTE`

### 4️⃣ **Criar Programação para a Rua**
```
Menu: Programação → + Nova Programação
```
Campos a preencher:
- Cliente (selecionar)
- Obra (selecionar)
- **Rua** (selecionar - apenas ruas pendentes)
- Data programada
- Equipe (A, B ou Terceira)
- Maquinários necessários
- Horário de início previsto
- Observações

**O que o sistema faz:**
- Cria a programação
- Vincula à rua
- Status da rua muda para: `EM_ANDAMENTO`
- Aparece no quadro de programação

### 5️⃣ **Executar a Obra** (dia programado)

A equipe vai à obra e executa o trabalho conforme programado.

### 6️⃣ **Confirmar Finalização da Obra** ⭐ (NOVO)

```
Menu: Programação → Lista → Botão "✓ Confirmar Obra"
```

**Modal de Confirmação** abre com:

#### **Dados PRÉ-PREENCHIDOS** (apenas visualização):
- ✅ Cliente: Nome do cliente
- ✅ Obra: Nome da obra  
- ✅ Rua: Nome da rua
- ✅ Data Programada: Data original
- ✅ Equipe: Equipe A, B ou Terceira
- ✅ Maquinários: Lista de equipamentos
- ✅ Previsão: Metragem e toneladas planejadas

#### **Dados a PREENCHER** (execução real):
- 📝 Data de Finalização * (hoje por padrão)
- 📝 Horário de Término *
- 📝 Metragem Executada (m²) * (valor previsto como sugestão)
- 📝 Toneladas Aplicadas (t) * (valor previsto como sugestão)
- 📷 Fotos da Obra (opcional - até 10 fotos)
- 📝 Observações (opcional)

#### **Calculadora Automática:**
- Mostra espessura calculada em tempo real
- Valida se está dentro do padrão (3-7 cm)
- Alerta se estiver fora do padrão

#### **Resumo do que será feito:**
```
✓ Ao confirmar, o sistema irá:
  • Marcar a rua como FINALIZADA
  • Criar automaticamente um Relatório Diário
  • Gerar o Faturamento da rua executada
  • Salvar N foto(s) da execução
  • Atualizar as estatísticas da obra
```

### 7️⃣ **O que acontece ao Confirmar:**

#### **A. Criação do Relatório Diário**
Sistema cria automaticamente:
```
Relatório: RD-2025-XXX
Cliente: [da programação]
Obra: [da programação]
Rua: [da programação]
Equipe: [da programação]
Maquinários: [da programação]
Data Início: [data programada]
Data Fim: [data preenchida]
Horário Início: [da programação]
Horário Fim: [preenchido]
Metragem: [executada - preenchida]
Toneladas: [aplicadas - preenchida]
Espessura: [calculada automaticamente]
Fotos: [enviadas]
Observações: [preenchidas]
```

#### **B. Finalização da Rua**
```sql
UPDATE obras_ruas 
SET status = 'FINALIZADA',
    metragem_executada = [valor preenchido],
    toneladas_utilizadas = [valor preenchido],
    data_finalizacao = [data preenchida],
    relatorio_diario_id = [id do relatório criado]
WHERE id = [rua_id]
```

#### **C. Geração do Faturamento**
```sql
INSERT INTO obras_faturamentos (
  obra_id,
  rua_id,
  metragem_executada,
  toneladas_utilizadas,
  espessura_calculada,
  preco_por_m2,
  valor_total,
  status,
  data_finalizacao
) VALUES (...)
```

**Valor Total** = Metragem Executada × Preço/m² (da obra)

#### **D. Status Atualizado**
- Rua: `PENDENTE` → `EM_ANDAMENTO` → **`FINALIZADA`** ✅
- Programação: Marcada como concluída
- Obra: Progresso atualizado

### 8️⃣ **Visualizar Resultados**

#### **Rua Confirmada:**
- Badge verde: **"Finalizada"**
- Link para ver detalhes
- Link para o relatório diário criado

#### **Relatório Diário:**
```
Menu: Relatórios Diários → Ver RD-2025-XXX
```
- Todas as informações da execução
- Fotos da obra
- Dados de equipe e maquinários
- Métricas e espessura
- Vínculo com a rua finalizada

#### **Faturamento:**
```
Menu: Obra → Aba "Financeiro"
```
- Faturamento gerado automaticamente
- Status: Pendente
- Ação: Marcar como Pago

## 🎯 Vantagens do Fluxo

### ✅ **Automação:**
- Não precisa preencher tudo de novo
- Dados da programação são reutilizados
- Relatório criado automaticamente
- Faturamento gerado sem esforço

### ✅ **Rastreabilidade:**
- Rua → Programação → Relatório → Faturamento
- Histórico completo
- Fotos da execução
- Dados auditáveis

### ✅ **Consistência:**
- Mesmos dados em todos os lugares
- Sem duplicação manual
- Espessura calculada automaticamente
- Validações em tempo real

### ✅ **Produtividade:**
- Processo rápido de confirmação
- Menos campos para preencher
- Upload de múltiplas fotos de uma vez
- Feedback imediato

## 📊 Estados da Rua

| Status | Descrição | Quando |
|--------|-----------|--------|
| **PENDENTE** | Rua cadastrada, aguardando programação | Ao criar a rua |
| **EM_ANDAMENTO** | Programação criada, obra em execução | Ao programar |
| **FINALIZADA** | Obra concluída e confirmada | Ao confirmar finalização ✅ |

## 🔔 Validações Automáticas

### ❌ **Bloqueios:**
- Metragem <= 0
- Toneladas <= 0
- Espessura < 3cm ou > 7cm (com alerta)
- Data futura
- Mais de 10 fotos

### ✅ **Permissões:**
- Metragem diferente da prevista (com indicador)
- Toneladas diferentes da prevista (com indicador)
- Sem fotos (opcional)
- Sem observações (opcional)

## 📸 Upload de Fotos

### Características:
- **Máximo:** 10 fotos por obra
- **Formatos:** JPG, PNG
- **Tamanho:** 5MB por foto
- **Preview:** Miniatura com opção de remover
- **Upload múltiplo:** Selecione várias de uma vez

### Interface:
```
┌─────────────────────────────────────┐
│ [Foto1] [Foto2] [Foto3] [Foto4]    │
│   [X]     [X]     [X]     [X]       │
│ [Foto5] [Foto6] [+Upload]           │
│   [X]     [X]                       │
└─────────────────────────────────────┘
```

## 🎨 Interface do Modal

### Header (verde):
```
✓ Confirmar Finalização da Obra
Preencha os dados executados para finalizar a rua
```

### Seções:
1. **Informações da Programação** (azul - apenas leitura)
2. **Dados da Execução** (formulário)
3. **Calculadora de Espessura** (automática)
4. **Upload de Fotos** (opcional)
5. **Observações** (opcional)
6. **Resumo** (verde - o que será feito)

### Footer:
- Botão "Cancelar"
- Botão "✓ Confirmar Finalização" (verde)

## 💾 Estrutura de Dados

### Tabela: `obras_ruas`
```sql
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS metragem_executada DECIMAL(10,2);
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS toneladas_utilizadas DECIMAL(10,2);
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS data_finalizacao DATE;
ALTER TABLE obras_ruas ADD COLUMN IF NOT EXISTS relatorio_diario_id UUID;
```

### Relacionamentos:
```
Cliente
  └─ Obra
      └─ Rua
          ├─ Programação (1:1)
          └─ Relatório Diário (1:1)
              └─ Faturamento (1:1)
```

## 🚀 Exemplo Prático

### Situação:
```
Cliente: Prefeitura de Osasco
Obra: Pavimentação Bairro Flores
Rua: Rua das Acácias - Trecho A
  └─ Previsto: 1.500m² • 150t
```

### Programação Criada:
```
Data: 18/10/2025
Equipe: Equipe A
Maquinários: Vibroacabadora, Rolo Chapa, Rolo Pneumático
Início: 07:00
```

### Confirmação (no dia ou depois):
```
Data Fim: 18/10/2025
Horário Fim: 16:30
Executado: 1.450m² • 145t
Espessura: 4.17cm ✓
Fotos: 5 fotos anexadas
Obs: Obra concluída sem intercorrências
```

### Resultado Automático:
```
✅ Relatório: RD-2025-042
✅ Rua: FINALIZADA
✅ Faturamento: R$ 36.250,00 (1.450m² × R$25/m²)
✅ Status: Pendente de pagamento
```

## 🎯 Benefícios

| Antes (Manual) | Depois (Automático) |
|----------------|---------------------|
| Criar relatório do zero | ✅ Dados pré-preenchidos |
| Digitar cliente/obra/rua novamente | ✅ Já vinculados |
| Selecionar equipe e maquinários | ✅ Já selecionados |
| Marcar rua como finalizada | ✅ Automático |
| Criar faturamento manualmente | ✅ Gerado automaticamente |
| Calcular espessura | ✅ Calculada em tempo real |
| Tempo: ~10 minutos | ⚡ Tempo: ~2 minutos |

## 📌 Observações Importantes

1. **Metragem pode variar:** Sistema permite executar mais ou menos que o previsto
2. **Fotos são opcionais:** Mas recomendadas para registro
3. **Um relatório = Uma rua:** Cada confirmação cria 1 relatório
4. **Não é reversível facilmente:** Confirmar finaliza a rua definitivamente
5. **Faturamento automático:** Usa o preço/m² cadastrado na obra

## 🔍 Onde Encontrar

- **Programações:** Menu → Programação
- **Confirmar Obra:** Botão na lista de programações
- **Relatórios:** Menu → Relatórios Diários
- **Faturamento:** Obra → Aba Financeiro
- **Status da Rua:** Obra → Aba Ruas

---

**Criado em:** 18/10/2025  
**Versão:** 1.0  
**Status:** Implementado


