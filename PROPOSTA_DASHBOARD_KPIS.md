# 📊 KPIs Relevantes e Práticos para Dashboard - Sistema WorldPav

## 🎯 KPIs Atuais (Mantidos e Corrigidos)

### ✅ Linha 1 - Operacional Básico
1. **Programação Hoje** - Serviços agendados para hoje
2. **Programação Amanhã** - Serviços agendados para amanhã  
3. **Faturamento Mês** - R$ total de ruas executadas ✅ CORRIGIDO
4. **Despesas Mês** - R$ total de custos

### ✅ Linha 2 - Produção do Mês
5. **m² Pavimentados** - Total executado no mês ✅ CORRIGIDO
6. **Toneladas Aplicadas** - Total aplicado no mês ✅ CORRIGIDO

---

## 🚀 NOVOS KPIs RELEVANTES (A Implementar)

## 📍 Seção 1: Destaques do Dia/Período

### 1. 🏆 **Maior Rua Executada do Dia**
```typescript
interface MaiorRuaDia {
  rua_nome: string
  obra_nome: string
  metragem: number
  toneladas: number
  data_conclusao: string
}

async getMaiorRuaDia(data: string) {
  // Buscar rua concluída hoje com maior metragem
  SELECT 
    r.name as rua_nome,
    o.name as obra_nome,
    r.metragem_executada,
    r.toneladas_utilizadas,
    r.data_finalizacao
  FROM obras_ruas r
  JOIN obras o ON o.id = r.obra_id
  WHERE r.status = 'concluida'
    AND r.data_finalizacao::date = '2025-11-03'
  ORDER BY r.metragem_executada DESC
  LIMIT 1
}
```
**Exibição**: Card destacado mostrando "🏆 Destaque do Dia: Rua X (1.500 m²) - Obra Y"

---

### 2. 💼 **Últimas 5 Diárias Lançadas**
```typescript
interface DiariasRecentes {
  colaborador_nome: string
  equipe_nome: string
  data: string
  valor: number
  tipo: 'normal' | 'extra'
}

async getUltimasDiarias(limite: number = 5) {
  SELECT 
    c.nome as colaborador_nome,
    e.name as equipe_nome,
    d.data,
    d.valor_diaria,
    CASE 
      WHEN d.horas_extras > 0 THEN 'extra'
      ELSE 'normal'
    END as tipo
  FROM colaboradores_diarias d
  JOIN colaboradores c ON c.id = d.colaborador_id
  LEFT JOIN equipes e ON e.id = c.equipe_id
  ORDER BY d.data DESC, d.created_at DESC
  LIMIT 5
}
```
**Exibição**: Lista compacta com "João Silva - R$ 150,00 - Hoje" + badge se tiver hora extra

---

### 3. 📊 **Top 5 Ruas por Faturamento**
```typescript
interface RuaFaturamento {
  rua_nome: string
  obra_nome: string
  cliente_nome: string
  valor_total: number
  metragem: number
  valor_por_m2: number
  data_conclusao: string
}

async getTop5RuasFaturamento(periodo: 'mes' | 'semana' = 'mes') {
  SELECT 
    r.name as rua_nome,
    o.name as obra_nome,
    c.name as cliente_nome,
    r.valor_total,
    r.metragem_executada,
    (r.valor_total / NULLIF(r.metragem_executada, 0)) as valor_por_m2,
    r.data_finalizacao
  FROM obras_ruas r
  JOIN obras o ON o.id = r.obra_id
  JOIN clients c ON c.id = o.client_id
  WHERE r.status = 'concluida'
    AND r.data_finalizacao >= (periodo início)
  ORDER BY r.valor_total DESC
  LIMIT 5
}
```
**Exibição**: Mini tabela com ranking:
```
1. Av. Paulista - Obra Centro | R$ 45.000,00 | 1.200 m² | R$ 37,50/m²
2. Rua das Flores - Obra Sul  | R$ 32.500,00 | 980 m²   | R$ 33,16/m²
...
```

---

### 4. 🚛 **Maquinário Mais Utilizado**
```typescript
interface MaquinarioUso {
  maquinario_nome: string
  tipo: string
  dias_uso_mes: number
  obras_utilizadas: number
  horas_trabalhadas?: number
}

async getMaquinariosMaisUtilizados(limite: number = 5) {
  SELECT 
    m.name as maquinario_nome,
    m.tipo,
    COUNT(DISTINCT cd.data) as dias_uso_mes,
    COUNT(DISTINCT cd.obra_id) as obras_utilizadas,
    SUM(cd.horas_trabalhadas) as horas_trabalhadas
  FROM maquinarios m
  JOIN controle_diario cd ON cd.maquinarios_ids @> ARRAY[m.id]::uuid[]
  WHERE cd.data >= início_do_mês
  GROUP BY m.id, m.name, m.tipo
  ORDER BY dias_uso_mes DESC
  LIMIT 5
}
```
**Exibição**: Lista com ícones:
```
🚛 Rolo Compactador X1 - 22 dias - 8 obras
🚜 Vibro Acabadora A2 - 18 dias - 5 obras
...
```

---

### 5. 👷 **Colaboradores com Mais Diárias**
```typescript
interface ColaboradorDesempenho {
  colaborador_nome: string
  equipe_nome: string
  total_diarias_mes: number
  dias_trabalhados: number
  valor_total: number
}

async getColaboradoresTopDiarias(limite: number = 5) {
  SELECT 
    c.nome,
    e.name as equipe_nome,
    COUNT(*) as total_diarias,
    COUNT(DISTINCT d.data) as dias_trabalhados,
    SUM(d.valor_diaria) as valor_total
  FROM colaboradores_diarias d
  JOIN colaboradores c ON c.id = d.colaborador_id
  LEFT JOIN equipes e ON e.id = c.equipe_id
  WHERE d.data >= início_do_mês
  GROUP BY c.id, c.nome, e.name
  ORDER BY total_diarias DESC
  LIMIT 5
}
```
**Exibição**: Ranking de desempenho
```
🥇 João Silva - 22 dias - R$ 3.300,00
🥈 Carlos Santos - 20 dias - R$ 3.000,00
...
```

---

### 6. ⚡ **Eficiência Média por M²**
```typescript
interface EficienciaProdutiva {
  media_m2_por_dia: number
  media_ton_por_dia: number
  media_valor_por_m2: number
  melhor_dia: {
    data: string
    metragem: number
  }
}

async getEficienciaProducao(mesInicio: string, mesFim: string) {
  // Calcular médias do mês
  SELECT 
    AVG(metragem_diaria) as media_m2_dia,
    AVG(toneladas_diaria) as media_ton_dia,
    AVG(valor_total / NULLIF(metragem_executada, 0)) as media_valor_m2
  FROM (
    SELECT 
      data,
      SUM(metragem_executada) as metragem_diaria,
      SUM(toneladas_utilizadas) as toneladas_diaria
    FROM obras_ruas
    WHERE status = 'concluida'
      AND data_finalizacao BETWEEN mesInicio AND mesFim
    GROUP BY data
  )
}
```
**Exibição**: 
```
⚡ Eficiência Média: 150 m²/dia | 18 ton/dia | R$ 35,00/m²
🏆 Melhor dia: 03/11 - 450 m²
```

---

### 7. 🎯 **Obras Próximas de Concluir**
```typescript
interface ObraProximaConclusao {
  obra_nome: string
  cliente_nome: string
  ruas_concluidas: number
  total_ruas: number
  percentual: number
  valor_faltante: number
}

async getObrasProximasConclusao(percentualMin: number = 70) {
  SELECT 
    o.name,
    c.name as cliente_nome,
    COUNT(CASE WHEN r.status = 'concluida' THEN 1 END) as ruas_concluidas,
    COUNT(*) as total_ruas,
    (COUNT(CASE WHEN r.status = 'concluida' THEN 1 END)::float / COUNT(*)) * 100 as percentual,
    SUM(CASE WHEN r.status != 'concluida' THEN r.valor_total ELSE 0 END) as valor_faltante
  FROM obras o
  JOIN clients c ON c.id = o.client_id
  JOIN obras_ruas r ON r.obra_id = o.id
  WHERE o.status = 'andamento'
  GROUP BY o.id, o.name, c.name
  HAVING (COUNT(CASE WHEN r.status = 'concluida' THEN 1 END)::float / COUNT(*)) * 100 >= percentualMin
  ORDER BY percentual DESC
  LIMIT 5
}
```
**Exibição**: Card de alerta
```
🎯 Próximas a Concluir:
- Obra Centro (85%) - Falta R$ 15k - 2 ruas
- Obra Sul (78%) - Falta R$ 28k - 3 ruas
```

---

### 8. 📉 **Despesas por Categoria (Top 5)**
```typescript
interface DespesaCategoria {
  categoria: string
  valor_total: number
  quantidade: number
  percentual_do_total: number
}

async getTopDespesasCategorias(mesInicio: string, mesFim: string) {
  SELECT 
    categoria,
    SUM(valor) as valor_total,
    COUNT(*) as quantidade,
    (SUM(valor) / (SELECT SUM(valor) FROM obras_financeiro_despesas WHERE data_despesa BETWEEN mesInicio AND mesFim)) * 100 as percentual
  FROM obras_financeiro_despesas
  WHERE data_despesa BETWEEN mesInicio AND mesFim
  GROUP BY categoria
  ORDER BY valor_total DESC
  LIMIT 5
}
```
**Exibição**: Mini gráfico de barras
```
⛽ Combustível    R$ 12.500 (45%) ████████████████
👷 Mão de Obra   R$ 8.200  (29%) ██████████
🔧 Manutenção    R$ 4.100  (15%) █████
...
```

---

### 9. 🚨 **Alertas e Pendências**
```typescript
interface Alertas {
  tipo: 'manutencao' | 'documento' | 'conta' | 'licenca'
  mensagem: string
  urgencia: 'alta' | 'media' | 'baixa'
  quantidade: number
}

async getAlertas() {
  return [
    {
      tipo: 'manutencao',
      mensagem: 'Manutenções vencidas',
      urgencia: 'alta',
      quantidade: await countManutençõesVencidas()
    },
    {
      tipo: 'conta',
      mensagem: 'Contas vencidas',
      urgencia: 'alta',
      quantidade: await countContasVencidas()
    },
    {
      tipo: 'documento',
      mensagem: 'CNHs a vencer em 30 dias',
      urgencia: 'media',
      quantidade: await countDocumentosVencendo()
    }
  ]
}
```
**Exibição**: Badge de alerta
```
🚨 3 Alertas:
- ⚠️ 2 manutenções vencidas
- 💳 1 conta vencida
- 📄 4 CNHs vencem em 30 dias
```

---

### 10. 📅 **Horas Extras do Mês**
```typescript
interface HorasExtras {
  total_horas: number
  total_valor: number
  colaboradores_com_extra: number
  dia_maior_uso: string
}

async getHorasExtrasMes(mesInicio: string, mesFim: string) {
  SELECT 
    SUM(horas) as total_horas,
    SUM(valor_total) as total_valor,
    COUNT(DISTINCT colaborador_id) as colaboradores_com_extra,
    (SELECT data FROM colaboradores_horas_extras 
     WHERE data BETWEEN mesInicio AND mesFim 
     GROUP BY data 
     ORDER BY SUM(horas) DESC 
     LIMIT 1) as dia_maior_uso
  FROM colaboradores_horas_extras
  WHERE data BETWEEN mesInicio AND mesFim
}
```
**Exibição**: 
```
⏰ Horas Extras: 85h | R$ 2.550,00 | 12 colaboradores
📅 Pico: 15/11 (22h)
```

---

## 📅 Layout do Dashboard Proposto

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 PRÓXIMA PROGRAMAÇÃO                                         │
│  [Horário, Cliente, Obra, Tempo Restante]                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ 📅 Prog Hoje │ 📅 Prog Amanhã│ 💰 Fatur Mês│ 📉 Desp Mês  │
│ 5 serviços   │ 8 serviços   │ R$ 245k     │ R$ 87k       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌────────────────────────────┬────────────────────────────┐
│ 📏 M² Pavimentados         │ ⚖️ Toneladas Aplicadas    │
│ 3.250 m² este mês          │ 487 ton este mês           │
└────────────────────────────┴────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 🏆 DESTAQUE DO DIA                                        │
│ Av. Paulista - Obra Centro | 1.500 m² | 180 ton          │
│ Concluída hoje às 16:30                                   │
└───────────────────────────────────────────────────────────┘

┌────────────────────────────┬────────────────────────────┐
│ 💼 ÚLTIMAS 5 DIÁRIAS       │ 🚛 MAQUINÁRIO MAIS USADO   │
│ João Silva - R$ 150 - Hoje │ Rolo X1 - 22 dias - 8 obras│
│ Maria Santos - R$ 150 - Hj │ Vibro A2 - 18 dias - 5 obr │
│ Carlos Souza - R$ 180 🔥   │ Caminhão C3 - 15 dias      │
│ Ana Costa - R$ 150 - Ontem │ Rolo X2 - 12 dias          │
│ Pedro Lima - R$ 150 - Ontem│ Pá Carregad - 10 dias      │
└────────────────────────────┴────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│ 📊 TOP 5 RUAS POR FATURAMENTO (Este Mês)                 │
│ 1. Av. Central - Obra Industrial  | R$ 85k | 2.100m²     │
│ 2. Rua Flores - Obra Jardim      | R$ 52k | 1.450m²     │
│ 3. Via Norte - Obra Logística    | R$ 48k | 1.380m²     │
│ 4. Rua Sul - Obra Residencial    | R$ 38k | 1.100m²     │
│ 5. Av. Leste - Obra Centro Hist  | R$ 35k | 980m²       │
└───────────────────────────────────────────────────────────┘

┌────────────────────────────┬────────────────────────────┐
│ 🎯 OBRAS PRÓX. CONCLUIR    │ 🚨 ALERTAS & PENDÊNCIAS    │
│ Obra Centro (85%) - 2 ruas │ ⚠️ 2 manutenções vencidas  │
│ Obra Sul (78%) - 3 ruas    │ 💳 1 conta vencida         │
│ Valor falta: R$ 43.000     │ 📄 4 CNHs vencem em 30d    │
└────────────────────────────┴────────────────────────────┘

┌────────────────────────────┬────────────────────────────┐
│ ⏰ HORAS EXTRAS ESTE MÊS   │ 📉 TOP 5 DESPESAS          │
│ 85h | R$ 2.550             │ ⛽ Combustível: R$ 12.5k   │
│ 12 colaboradores           │ 👷 Mão de Obra: R$ 8.2k    │
│ Pico: 15/11 (22h extras)   │ 🔧 Manutenção: R$ 4.1k     │
│                            │ 🧱 Material: R$ 3.8k       │
│                            │ 📞 Admin: R$ 2.1k          │
└────────────────────────────┴────────────────────────────┘
```

---

## 🎨 Componentes Visuais Sugeridos

### Card de Destaque do Dia (Maior Rua)
- Gradiente dourado/amarelo
- Ícone de troféu
- Animação de pulso
- Mostra: Nome da rua, obra, metragem, toneladas

### Mini Tabela de Diárias Recentes
- Scroll vertical se mais de 5
- Badge vermelho 🔥 para horas extras
- Formatação de data relativa ("Hoje", "Ontem", "2 dias atrás")

### Ranking de Ruas por Faturamento
- Números 1-5 com cores diferentes (ouro, prata, bronze, azul, cinza)
- Barra de progresso proporcional
- Valor por m² destacado

### Lista de Maquinários
- Ícones diferentes por tipo (rolo, vibro, caminhão, etc)
- Badge com "dias em uso"
- Mini gráfico de barras

### Card de Alertas
- Cores por urgência (vermelho=alta, amarelo=média, azul=baixa)
- Contador total
- Ícones específicos por tipo
- Clicável para ir direto na tela correspondente

---

## 🔧 Implementação Técnica

### Novo Type para DashboardKPIs:
```typescript
export interface DashboardKPIs {
  // Operacional (JÁ EXISTE)
  programacao_hoje: number
  programacao_amanhã: number
  faturamento_mes: number
  despesas_mes: number
  metragem_mes: number
  toneladas_mes: number
  
  // NOVOS
  maior_rua_dia: MaiorRuaDia | null
  ultimas_diarias: DiariasRecentes[]
  top_ruas_faturamento: RuaFaturamento[]
  maquinarios_mais_usados: MaquinarioUso[]
  colaboradores_top_diarias: ColaboradorDesempenho[]
  eficiencia_producao: EficienciaProdutiva
  obras_proximas_conclusao: ObraProximaConclusao[]
  alertas: Alertas[]
  horas_extras_mes: HorasExtras
  top_despesas: DespesaCategoria[]
}
```

---

## 📌 Priorização de Implementação

### 🔴 MÁXIMA PRIORIDADE (Implementar AGORA):
1. ✅ **Faturamento, M², Toneladas corrigidos** - JÁ FEITO
2. 🏆 **Maior Rua Executada do Dia** - Motivação da equipe
3. 💼 **Últimas 5 Diárias** - Controle financeiro imediato

### 🟡 ALTA PRIORIDADE (Esta Semana):
4. 📊 **Top 5 Ruas por Faturamento** - Análise de desempenho
5. 🚛 **Maquinário Mais Utilizado** - Gestão de recursos
6. 🚨 **Alertas e Pendências** - Gestão de riscos

### 🟢 MÉDIA PRIORIDADE (Próxima Semana):
7. 👷 **Colaboradores com Mais Diárias** - RH e custos
8. ⚡ **Eficiência Média por M²** - Métricas de produtividade
9. 🎯 **Obras Próximas de Concluir** - Planejamento

### 🔵 BAIXA PRIORIDADE (Quando tiver tempo):
10. ⏰ **Horas Extras do Mês** - Análise de custos
11. 📉 **Top 5 Despesas por Categoria** - Controle financeiro
12. 📈 **Gráficos de tendência** - Visualização avançada

---

## 💡 Benefícios dos Novos KPIs

### Para o Gestor:
- ✅ Visão completa da operação em um único olhar
- ✅ Identificação rápida de problemas (alertas)
- ✅ Dados para tomada de decisão imediata

### Para Operação:
- ✅ Reconhecimento de desempenho (maior rua do dia)
- ✅ Transparência de diárias lançadas
- ✅ Controle de uso de equipamentos

### Para Financeiro:
- ✅ Faturamento real vs pago
- ✅ Controle de despesas por categoria
- ✅ Alertas de contas vencidas

### Para Planejamento:
- ✅ Obras próximas de concluir
- ✅ Eficiência produtiva
- ✅ Tendências e padrões

---

## 🎯 Meta Final

Dashboard que responde em tempo real:
1. **O que está acontecendo AGORA?** (programações hoje, alertas)
2. **Como estamos PERFORMANDO?** (m², ton, faturamento)
3. **Onde estão os DESTAQUES?** (maior rua, top colaboradores)
4. **O que precisa de ATENÇÃO?** (alertas, obras perto de concluir)
5. **Onde vai o DINHEIRO?** (despesas, diárias, faturamento)

---

**Conclusão**: Dashboard deve ser uma **ferramenta de gestão prática**, não apenas números bonitos. Cada KPI deve responder uma pergunta específica do negócio e facilitar decisões rápidas.

