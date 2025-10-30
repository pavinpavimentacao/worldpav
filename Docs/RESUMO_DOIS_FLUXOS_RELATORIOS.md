# 📋 DOIS FLUXOS DE CRIAÇÃO DE RELATÓRIOS DIÁRIOS

## 🎯 Visão Geral

O sistema permite criar relatórios diários de **duas formas**:

---

## ✅ **FLUXO 1: Criação Manual**

### Onde acontece:
- Menu: **Relatórios Diários** → **Novo Relatório**

### Como funciona:
1. Usuário acessa página "Novo Relatório Diário"
2. Seleciona **Cliente** → **Obra** → **Rua**
3. Preenche dados da execução:
   - Data de início e fim
   - Horário de início
   - Metragem feita
   - Toneladas aplicadas
   - Equipe (própria ou terceira)
   - Maquinários utilizados
   - Observações
4. Salva o relatório
5. **Sistema automaticamente**:
   - Finaliza a rua (status = 'finalizada')
   - Cria faturamento automático

### Quando usar:
- Para registrar execução de rua que **não estava programada**
- Para corrigir ou ajustar dados de uma rua já programada
- Para registrar trabalho realizado sem programação prévia

---

## ✅ **FLUXO 2: Criação Automática (Confirmação de Rua)**

### Onde acontece:
- Menu: **Programação** → Lista de programações → Botão "Confirmar Obra"

### Como funciona:
1. Usuário programa uma pavimentação para um dia futuro
2. No dia programado, acessa **Programação** → Seleciona a programação
3. Clica em "✓ Confirmar Obra"
4. Modal abre com dados **pré-preenchidos** da programação:
   - Cliente, Obra, Rua
   - Data programada
   - Equipe programada
   - Maquinários programados
   - Metragem e toneladas previstas
5. Usuário preenche apenas os dados da **execução real**:
   - Data de finalização (padrão: hoje)
   - Metragem realmente feita
   - Toneladas realmente aplicadas
   - Observações (opcional)
6. Confirma
7. **Sistema automaticamente**:
   - Cria o relatório diário completo
   - Finaliza a rua (status = 'finalizada')
   - Marca programação como "confirmada"
   - Cria faturamento automático

### Quando usar:
- Para confirmar execução de uma rua que estava **programada**
- Seguir o fluxo: Programação → Execução → Relatório → Faturamento

---

## 🔄 **Comparação dos Fluxos**

| Característica | FLUXO 1 - Manual | FLUXO 2 - Automático |
|----------------|------------------|----------------------|
| **Acesso** | Relatórios Diários → Novo | Programação → Confirmar Obra |
| **Rua precisa estar programada?** | ❌ Não | ✅ Sim |
| **Dados pré-preenchidos** | 👤 Usuário seleciona tudo | 🤖 Sistema preenche da programação |
| **User preenche** | Todos os dados | Apenas valores reais da execução |
| **Finaliza rua?** | ✅ Automático | ✅ Automático |
| **Cria faturamento?** | ✅ Automático | ✅ Automático |
| **Vincula à programação?** | ❌ Não | ✅ Sim (relatorio_diario_id) |

---

## 🛠️ **Implementação Técnica**

Ambos os fluxos usam a **mesma função**:
```typescript
await createRelatorioDiario({
  cliente_id,
  obra_id,
  rua_id,
  equipe_id,
  data_inicio,
  data_fim,
  horario_inicio,
  metragem_feita,
  toneladas_aplicadas,
  observacoes,
  maquinarios: [...]
});
```

Ambos os fluxos também executam **automaticamente**:
```typescript
await finalizarRua(rua_id, relatorio_id, data_fim, metragem, toneladas);
await criarFaturamentoRua(obra_id, rua_id, metragem, preco_m2);
```

---

## 📊 **Estado da Rua em Cada Fluxo**

### FLUXO 1 (Manual):
```
Status inicial: Pendente ou Em Andamento
  ↓
Criar Relatório
  ↓
Status final: Finalizada ✨
```

### FLUXO 2 (Automático):
```
Status inicial: Em Andamento (com programação)
  ↓
Confirmar Obra (criar relatório)
  ↓
Status final: Finalizada ✨
  ↓
Programação marcada: Confirmada ✅
```

---

## ⚙️ **Configurações Importantes**

### 1. Finalização Automática da Rua
A função `finalizarRua()` atualiza:
- `status` → 'finalizada'
- `relatorio_diario_id` → ID do relatório criado
- `data_finalizacao` → Data do fim da execução
- `metragem_executada` → Metragem real
- `toneladas_executadas` → Toneladas reais

### 2. Faturamento Automático
A função `criarFaturamentoRua()` cria registro em:
- Tabela: `obras_financeiro_faturamentos`
- Calcula: `valor_total = metragem × preco_por_m2`
- Vincula: `rua_id` e `obra_id`

### 3. Trigger no Banco
A migration `create_relatorios_diarios_completo.sql` já cria um **trigger** que:
- Gera número sequencial automaticamente (RD-YYYY-001)
- Calcula espessura automaticamente
- Finaliza a rua automaticamente ao inserir relatório

---

## ✅ **Checklist de Implementação**

### Ambos os Fluxos:
- [ ] Implementar `createRelatorioDiario()` no banco real
- [ ] Implementar `finalizarRua()` no banco real
- [ ] Implementar `criarFaturamentoRua()` no banco real
- [ ] Testar criação manual de relatório
- [ ] Testar criação automática via confirmação
- [ ] Verificar se rua é finalizada corretamente
- [ ] Verificar se faturamento é criado corretamente
- [ ] Remover mockups

### Fluxo 1 Específico:
- [ ] Verificar se `NovoRelatorioDiario.tsx` cria relatório corretamente
- [ ] Verificar se `SelecionarClienteObraRua` busca ruas do banco
- [ ] Verificar se finaliza e cria faturamento

### Fluxo 2 Específico:
- [ ] Corrigir IDs mockados em `ProgramacaoPavimentacaoList.tsx`
- [ ] Verificar se programação é marcada como confirmada
- [ ] Verificar vinculação `relatorio_diario_id` na programação

---

## 🎓 **Exemplos de Uso**

### Exemplo 1: Criação Manual
```
Situação: Cliente pediu trabalho de emergência na rua "Av. Principal"

Passos:
1. Vou em "Relatórios Diários" → "Novo Relatório"
2. Escolho: Cliente → Obra → Rua "Av. Principal"
3. Preencho: 500 m², 30 toneladas, Equipe A
4. Salvo

Resultado:
✅ Relatório criado: RD-2024-045
✅ Rua "Av. Principal" finalizada
✅ Faturamento criado automaticamente
```

### Exemplo 2: Confirmação Programada
```
Situação: Tinha programado para hoje fazer a rua "Rua das Flores"

Passos:
1. Vou em "Programação" → Vejo que hoje está programado
2. Clico em "Confirmar Obra"
3. Modal abre já com dados: Cliente "Prefeitura", Obra "Obra X", Rua "Rua das Flores"
4. Confirmo que realmente fiz: 450 m² (planejado: 500 m²), 27 toneladas (planejado: 30 t)
5. Clico em "Confirmar"

Resultado:
✅ Relatório criado: RD-2024-046
✅ Rua "Rua das Flores" finalizada
✅ Programação marcada como "confirmada"
✅ Faturamento criado automaticamente
```

---

## 📝 **Notas Importantes**

1. **Não é obrigatório programar antes**: O FLUXO 1 permite criar relatório sem programação
2. **Programação não cria relatório sozinha**: Só após confirmar é que o relatório é criado
3. **Ambos finalizam rua automaticamente**: Quando relatório é criado, rua vira 'finalizada'
4. **Ambos criam faturamento**: Sistema cria faturamento automaticamente
5. **Uma rua só pode ter UM relatório**: Se tentar criar outro, sistema deve avisar

---

**Status**: 📋 Plano criado  
**Próximo Passo**: Implementar API real removendo mockups


