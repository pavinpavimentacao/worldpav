# Mockups de Notas Fiscais e Medições - Documentação

## ✅ Status: MOCKUPS ATIVADOS

Todos os componentes do sistema de Notas Fiscais e Medições estão com dados de exemplo (mockups) para visualização e testes.

---

## 📋 Mockups Implementados

### 1. Notas Fiscais (4 exemplos)

#### NF-2025-001 - Status: PENDENTE
- **Valor Bruto:** R$ 45.000,00
- **Desconto INSS:** R$ 1.350,00 (3%)
- **Desconto ISS:** R$ 900,00 (2%)
- **Outro Desconto:** R$ 0,00
- **Valor Líquido:** R$ 42.750,00
- **Vencimento:** 15/02/2025 (próximos dias)
- **Arquivo:** PDF disponível
- **Observação:** Primeira medição da obra - Ruas A e B

#### NF-2025-002 - Status: PAGO ✅
- **Valor Bruto:** R$ 38.500,00
- **Desconto INSS:** R$ 1.155,00 (3%)
- **Desconto ISS:** R$ 770,00 (2%)
- **Outro Desconto:** R$ 200,00
- **Valor Líquido:** R$ 36.375,00
- **Vencimento:** 28/01/2025
- **Data Pagamento:** 25/01/2025 (pago antecipadamente)
- **Arquivo:** PDF disponível
- **Observação:** Pagamento antecipado - desconto negociado

#### NF-2024-098 - Status: VENCIDO ⚠️
- **Valor Bruto:** R$ 52.000,00
- **Desconto INSS:** R$ 1.560,00 (3%)
- **Desconto ISS:** R$ 1.040,00 (2%)
- **Outro Desconto:** R$ 0,00
- **Valor Líquido:** R$ 49.400,00
- **Vencimento:** 10/01/2025 (vencida há 11 dias)
- **Arquivo:** PDF disponível
- **Observação:** Aguardando regularização do cliente

#### NF-2025-003 - Status: RENEGOCIADO 🔄
- **Valor Bruto:** R$ 41.000,00
- **Desconto INSS:** R$ 1.230,00 (3%)
- **Desconto ISS:** R$ 820,00 (2%)
- **Outro Desconto:** R$ 500,00 (negociado)
- **Valor Líquido:** R$ 38.450,00
- **Vencimento:** 28/02/2025
- **Arquivo:** PDF disponível
- **Observação:** Valores ajustados conforme reunião do dia 20/01

---

### 2. Medições (3 exemplos)

#### Medição #1 - Vinculada à NF-2025-002
- **Descrição:** Medição referente ao mês de Janeiro/2025 - Ruas A, B e C
- **Data:** 31/01/2025
- **Arquivo:** medicao-janeiro-2025.xlsx (Excel)
- **Nota Vinculada:** NF-2025-002 (R$ 38.500,00)
- **Criado:** Há 5 dias

#### Medição #2 - Sem Nota Vinculada
- **Descrição:** Levantamento topográfico inicial - Todas as ruas
- **Data:** 15/12/2024
- **Arquivo:** levantamento-inicial.pdf (PDF)
- **Nota Vinculada:** Nenhuma
- **Criado:** Há 40 dias

#### Medição #3 - Vinculada à NF-2025-001
- **Descrição:** Medição Fevereiro/2025 - Ruas D, E e F
- **Data:** 10/02/2025
- **Arquivo:** medicao-fevereiro-2025.xlsx (Excel)
- **Nota Vinculada:** NF-2025-001 (R$ 45.000,00)
- **Criado:** Há 1 dia

---

## 📊 KPIs Mockados

### Na Aba "Notas e Medições" da Obra

**Faturamento Previsto:**
- **Valor:** R$ 125.000,00
- **Cálculo:** 5.000 m² planejados × R$ 25/m²
- **Cor:** Gradiente Azul

**Faturamento Bruto:**
- **Valor:** R$ 176.500,00
- **Cálculo:** Soma das 4 notas fiscais (45.000 + 38.500 + 52.000 + 41.000)
- **Cor:** Gradiente Verde

### Na Página "Recebimentos"

**Total a Receber:**
- **Valor:** R$ 166.150,00
- **Composição:** 
  - NF-2025-001 (Pendente): R$ 42.750,00
  - NF-2024-098 (Vencida): R$ 49.400,00
  - NF-2025-003 (Renegociada): R$ 38.450,00
  - NF-2025-010 (Pendente - Av. Central): R$ 74.100,00 *(nota adicional de outra obra)*
- **Cor:** Gradiente Amarelo

**Total Recebido:**
- **Valor:** R$ 36.375,00
- **Composição:** NF-2025-002 (Paga)
- **Cor:** Gradiente Verde

**Total Vencido:**
- **Valor:** R$ 49.400,00
- **Composição:** NF-2024-098 (Vencida)
- **Cor:** Gradiente Vermelho

**Próximos Vencimentos (7 dias):**
- **Valor:** R$ 74.100,00
- **Composição:** NF-2025-010 (vence em 05/02/2025)
- **Cor:** Gradiente Azul

---

## 🎨 Funcionalidades Demonstradas nos Mockups

### ✅ Na Aba "Notas e Medições" da Obra

#### Sub-aba "Notas Fiscais"
1. **Tabela completa** com todas as colunas:
   - Nº Nota
   - Valor Bruto
   - Descontos
   - Valor Líquido
   - Vencimento
   - Status (badges coloridos)
   - Ações

2. **Badges de Status:**
   - 🟡 Pendente (amarelo)
   - 🟢 Pago (verde)
   - 🔴 Vencido (vermelho)
   - 🔵 Renegociado (azul)

3. **Ações por nota:**
   - ℹ️ Ver Detalhes (novo modal)
   - 👁️ Visualizar PDF
   - ✏️ Editar
   - 🗑️ Excluir

4. **Alertas Visuais:**
   - Notas que vencem em até 7 dias mostram "Vence em X dias"
   - Notas vencidas calculadas automaticamente

#### Sub-aba "Medições"
1. **Grid de Cards** (layout moderno)
2. **Tipos de arquivo:**
   - 📊 Excel (ícone verde)
   - 📄 PDF (ícone vermelho)

3. **Informações por card:**
   - Descrição
   - Data da medição
   - Nota fiscal vinculada (se houver)

4. **Ações por medição:**
   - ℹ️ Ver Detalhes (novo modal)
   - ⬇️ Download
   - 🗑️ Excluir

### ✅ Na Página "Recebimentos"

1. **4 KPIs coloridos** (gradientes)
2. **Tabela de todas as notas** de todas as obras
3. **Filtros funcionais:**
   - Busca por obra ou nº da nota
   - Status (todos, pendente, pago, vencido, renegociado)
   - Período de vencimento (início e fim)

4. **Ações:**
   - ℹ️ Ver Detalhes (novo modal)
   - 👁️ Visualizar PDF
   - ✅ Marcar como Pago (só para pendentes/vencidas)
   - Link para a obra

5. **Nota adicional de outra obra:**
   - NF-2025-010 da "Avenida Central - São Paulo"
   - Para demonstrar que a página consolida todas as obras

---

## 🎭 Modais de Detalhes Implementados

### Modal de Detalhes da Nota Fiscal

**Informações Exibidas:**
- 📋 Número da nota e status (badge)
- 💰 Valores detalhados:
  - Valor bruto
  - Desconto INSS
  - Desconto ISS
  - Outro desconto
  - Total de descontos
  - **Valor líquido** (destaque)
- 📅 Datas:
  - Vencimento (com alerta se próximo ou vencido)
  - Data de pagamento (se pago)
- 📝 Observações
- 📄 Arquivo PDF (visualizar e download)
- 🔧 Informações do sistema (criado em, última atualização)

**Visual:**
- Header com gradiente azul
- Ícone de nota fiscal
- Seções bem organizadas
- Valores destacados
- Botões de ação (Visualizar, Download, Fechar)

### Modal de Detalhes da Medição

**Informações Exibidas:**
- 📋 Descrição completa
- 📅 Data da medição
- 📅 Data de cadastro
- 🔗 Nota fiscal vinculada (se houver):
  - Número da nota
  - Valor
  - Vencimento
- 📄 Arquivo (Excel ou PDF):
  - Ícone apropriado
  - Nome do arquivo
  - Tipo de arquivo
  - Botões de visualizar e download
- 🔧 Informações do sistema (ID, última atualização)

**Visual:**
- Header com gradiente verde
- Ícone de planilha
- Card especial para nota vinculada
- Seção destacada para arquivo
- Botões grandes de visualizar e download

---

## 🚀 Como Testar os Mockups

### Passo 1: Acessar a Obra
```
http://localhost:5173/obras/1
```

### Passo 2: Ir para Aba "Notas e Medições"
- Você verá 2 KPIs no topo
- 2 sub-abas: "Notas Fiscais" e "Medições"

### Passo 3: Visualizar Notas Fiscais
- Ver 4 notas diferentes com status variados
- Clicar em ℹ️ para ver detalhes completos
- Clicar em ✏️ para editar (marca como RENEGOCIADO)
- Tentar excluir uma nota

### Passo 4: Visualizar Medições
- Ver 3 medições em formato de cards
- 2 medições vinculadas a notas fiscais
- 1 medição sem vínculo
- Clicar em "Detalhes" para ver informações completas
- Download de arquivos (Excel e PDF)

### Passo 5: Acessar Recebimentos
```
http://localhost:5173/pagamentos-receber
```

### Passo 6: Ver Consolidado
- 4 KPIs coloridos
- Tabela com 5 notas (4 da obra principal + 1 de outra obra)
- Testar filtros
- Clicar em ℹ️ para ver detalhes
- Marcar nota como paga

---

## 🎯 Valores Mockados

### Totais Gerais
- **Faturamento Previsto:** R$ 125.000,00
- **Faturamento Bruto (Notas):** R$ 176.500,00
- **Total a Receber:** R$ 166.150,00
- **Total Recebido:** R$ 36.375,00
- **Total Vencido:** R$ 49.400,00
- **Próximos Vencimentos:** R$ 74.100,00

### Percentuais de Desconto Padrão
- **INSS:** 3% do valor bruto
- **ISS:** 2% do valor bruto
- **Outros:** Variável conforme negociação

---

## 🔧 Desativando os Mockups

Quando o banco de dados estiver configurado:

1. **NotasFiscaisSubTab.tsx** - Linha 13:
   ```typescript
   const USE_MOCK = false
   ```

2. **MedicoesSubTab.tsx** - Linha 13:
   ```typescript
   const USE_MOCK = false
   ```

3. **NotasMedicoesTab.tsx** - Linha 10:
   ```typescript
   const USE_MOCK = false
   ```

4. **RecebimentosIndex.tsx** - Linha 31:
   ```typescript
   const USE_MOCK = false
   ```

---

## 📱 Visualização Recomendada

### Desktop
- Tabela completa de notas fiscais
- Grid 3 colunas para medições
- KPIs em linha (4 colunas)

### Mobile
- Scroll horizontal na tabela
- Grid 1 coluna para medições
- KPIs empilhados

---

## ✨ Destaques dos Mockups

### 1. Variedade de Status
- ✅ Demonstra todos os 4 status possíveis
- ⏰ Mostra nota próxima do vencimento
- ❌ Mostra nota vencida
- 💰 Mostra nota paga com data

### 2. Realismo nos Valores
- Valores seguem padrão real de obras de pavimentação
- Descontos calculados com percentuais reais (INSS 3%, ISS 2%)
- Datas distribuídas ao longo do tempo

### 3. Cenários Diversos
- Medições com e sem nota vinculada
- Arquivos em diferentes formatos (XLSX e PDF)
- Notas com diferentes valores e descontos

### 4. Modais Interativos
- **Detalhes da Nota Fiscal:** Visual rico com todas as informações
- **Detalhes da Medição:** Card destacado para nota vinculada
- Ambos com botões de ação (visualizar, download)

---

## 💡 Próximos Passos

1. ✅ Acessar a obra e testar as abas
2. ✅ Abrir os modais de detalhes
3. ✅ Testar os filtros na página de Recebimentos
4. ✅ Visualizar os diferentes status e badges
5. ⏸️ Configurar Supabase Storage (buckets)
6. ⏸️ Executar migrações SQL
7. ⏸️ Desativar mockups

---

**Criado:** Janeiro 2025  
**Modo Mock:** ✅ ATIVADO  
**Pronto para demonstração:** ✅ SIM

