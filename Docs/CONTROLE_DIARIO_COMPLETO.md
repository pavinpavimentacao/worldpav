# 📋 Sistema de Controle Diário - Documentação Completa

## 📌 Visão Geral

O **Sistema de Controle Diário** é um módulo completo para gerenciamento de presença, ausências e pagamento de diárias dos colaboradores de pavimentação.

## 🎯 Funcionalidades Principais

### 1. **Relação Diária**
Controle diário de presença dos colaboradores por equipe.

**Características:**
- ✅ Seleção de equipe e data
- ✅ Pré-seleção automática dos membros da equipe
- ✅ Controle de presença/ausência
- ✅ Registro de motivos de ausência:
  - **Falta** - Ausência não justificada
  - **Atestado Médico** - Ausência justificada por saúde
  - **Mudança de Equipe** - Colaborador foi trabalhar em outra equipe
- ✅ Observações gerais do dia

**Fluxo de Uso:**
1. Clicar em "Nova Relação"
2. Selecionar data e equipe
3. Colaboradores da equipe aparecem PRÉ-SELECIONADOS
4. Para marcar ausência: desmarcar colaborador
5. Modal de ausência abre automaticamente
6. Escolher motivo (falta, atestado ou mudança de equipe)
7. Se mudança: selecionar equipe de destino
8. Adicionar observações (opcional)
9. Confirmar registro

### 2. **Diárias (Pagamentos)**
Gestão financeira de pagamento de diárias extras.

**Características:**
- ✅ Registro de diárias por colaborador
- ✅ Campos:
  - Nome do colaborador
  - Quantidade de diárias
  - Valor unitário por diária
  - Adicional (se houver)
  - Desconto (se houver)
  - Data da diária
  - Data prevista de pagamento
  - Observações
- ✅ Cálculo automático do valor total
- ✅ Status de pagamento (pendente/pago)
- ✅ Filtros por colaborador e status
- ✅ Estatísticas em tempo real:
  - Total de diárias
  - Valor total
  - Pendentes
  - Valor pendente

**Mural de Colaboradores:**
- 📊 Cards individuais por colaborador
- 💰 Visualização de:
  - Quantidade de diárias
  - Valor unitário
  - Adicional/Desconto
  - Valor total
  - Datas
  - Status de pagamento
- ✅ Ação rápida: "Marcar como Pago"
- 🗑️ Opção de exclusão

### 3. **Histórico**
Consulta de registros passados de relações diárias.

**Características:**
- ✅ Listagem de todas as relações registradas
- ✅ Filtros:
  - Por data
  - Por equipe
- ✅ Visualização de detalhes:
  - Colaboradores presentes
  - Ausências registradas
  - Motivos de ausência
  - Observações do dia
- ✅ Estatísticas por relação

## 📊 Estatísticas no Dashboard

O dashboard principal exibe:

1. **Relações Registradas** - Total de registros criados
2. **Total de Presenças** - Soma de todos os colaboradores presentes
3. **Valor Total de Diárias** - Soma de todos os pagamentos
4. **Pagamentos Pendentes** - Valor e quantidade ainda não pagos

## 🎨 Design e UI/UX

### Layout Padrão WorldPav:
- ✅ Header com gradient azul-indigo
- ✅ Cards com bordas arredondadas e sombras
- ✅ Gradientes coloridos para estatísticas:
  - 🔵 Azul para dados gerais
  - 🟢 Verde para valores positivos
  - 🟣 Roxo para totalizadores
  - 🟠 Laranja para alertas/pendências
- ✅ Tabs organizadas com ícones e descrições
- ✅ Modais responsivos e acessíveis

### Componentes Utilizados:
- `Layout` - Container padrão da aplicação
- `Button` - Botões estilizados
- `Input` - Campos de entrada
- `Select` - Seletores dropdown
- Ícones `lucide-react`:
  - `ClipboardList` - Relação diária
  - `DollarSign` - Diárias
  - `History` - Histórico
  - `Users`, `Calendar`, `TrendingUp`, `AlertCircle`

## 📁 Estrutura de Arquivos

```
src/
├── types/
│   └── controle-diario.ts           # Types e interfaces
├── mocks/
│   └── controle-diario-mock.ts      # Dados mock
├── pages/
│   └── controle-diario/
│       └── ControleDiarioIndex.tsx  # Página principal
├── components/
│   └── controle-diario/
│       ├── RelacaoDiariaTab.tsx     # Tab de relação
│       ├── DiariasTab.tsx           # Tab de diárias
│       └── HistoricoTab.tsx         # Tab de histórico
└── routes/
    └── index.tsx                    # Rota /controle-diario
```

## 🗄️ Estrutura de Dados

### RelacaoDiaria
```typescript
{
  id: string;
  data: string; // YYYY-MM-DD
  equipe_id: string;
  equipe_nome?: string;
  total_presentes: number;
  total_ausencias: number;
  observacoes_dia?: string;
  registros: RegistroPresencaRelacao[];
}
```

### RegistroPresencaRelacao
```typescript
{
  id: string;
  relacao_diaria_id: string;
  colaborador_id: string;
  status: 'presente' | 'falta' | 'atestado' | 'mudanca_equipe';
  equipe_destino_id?: string;
  observacoes?: string;
}
```

### RegistroDiaria
```typescript
{
  id: string;
  colaborador_id: string;
  quantidade: number;
  valor_unitario: number;
  adicional: number;
  desconto: number;
  valor_total: number;
  data_diaria: string;
  data_pagamento?: string;
  status_pagamento: 'pendente' | 'pago' | 'cancelado';
  observacoes?: string;
}
```

## 🔄 Fluxo Completo

### Cenário 1: Registrar Relação Diária
1. Usuário acessa "Controle Diário"
2. Clica em "Nova Relação"
3. Seleciona equipe "Equipe Alpha"
4. Todos os 10 membros aparecem selecionados
5. Desmarca "João Silva"
6. Modal abre: "Por que João não estará presente?"
7. Seleciona "Mudança de Equipe"
8. Escolhe "Equipe Beta"
9. Adiciona observação: "Reforço temporário"
10. Confirma
11. Sistema registra: 9 presentes, 1 mudança
12. Relação salva com sucesso

### Cenário 2: Registrar Diária
1. Usuário vai na tab "Diárias"
2. Clica em "Adicionar Diária"
3. Seleciona colaborador "Maria Santos"
4. Quantidade: 2 diárias
5. Valor unitário: R$ 150,00
6. Adicional: R$ 50,00 (trabalho noturno)
7. Sistema calcula: R$ 350,00
8. Define data de pagamento
9. Adiciona observação
10. Registra diária
11. Card aparece no mural com status "Pendente"

### Cenário 3: Marcar Diária como Paga
1. Usuário encontra diária de "Maria Santos"
2. Clica em "Marcar como Pago"
3. Sistema atualiza status
4. Card fica com borda verde
5. Badge muda para "✓ Pago"
6. Estatísticas se atualizam

## 🎯 Observações Importantes

### **TODOS os colaboradores aparecem:**
- ✅ Não apenas os que têm `tipo: 'diaria'`
- ✅ Todos os colaboradores de pavimentação
- ✅ Sistema filtra por `tipo_equipe: 'pavimentacao'` ou `'ambas'`

### **Diárias são pagas quando:**
- ✅ Colaborador trabalha à noite
- ✅ Colaborador trabalha em fim de semana
- ✅ Colaborador faz horas extras especiais
- ✅ Qualquer situação de pagamento adicional

### **Pré-seleção automática:**
- ✅ Ao escolher uma equipe, TODOS os membros vêm marcados
- ✅ Facilita o registro (maioria está presente)
- ✅ Apenas desmarcar quem faltou

## 🚀 Próximas Melhorias Sugeridas

1. **Integração com Banco de Dados Real**
   - Substituir mocks por queries Supabase
   - Implementar RLS (Row Level Security)

2. **Relatórios Avançados**
   - PDF de relatórios mensais
   - Gráficos de presença
   - Análise de faltas por colaborador

3. **Notificações**
   - Alertar sobre pagamentos pendentes
   - Lembrar de registrar relação diária

4. **Exportação de Dados**
   - Excel/CSV de diárias
   - Relatório de folha de pagamento

5. **Dashboard Analytics**
   - Taxa de presença por equipe
   - Média de diárias por colaborador
   - Custo total mensal

## 📱 Sidebar

**Ícone:** ClipboardCheck  
**Rota:** `/controle-diario`  
**Posição:** Entre "Colaboradores" e "Relatórios Diários"

---

## ✅ Sistema Completo e Funcional!

**Data de Criação:** 18/10/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementado e Testado


