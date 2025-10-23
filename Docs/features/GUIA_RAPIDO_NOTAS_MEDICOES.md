# 🚀 Guia Rápido - Sistema de Notas Fiscais e Medições

## ✅ Tudo Pronto para Usar!

O sistema está **100% funcional com mockups** e pronto para você visualizar.

---

## 🎯 Como Acessar

### 1️⃣ Ver Notas e Medições de uma Obra

```
1. Acesse: http://localhost:5173/obras/1
2. Clique na aba "Notas e Medições"
3. Veja 2 KPIs no topo:
   - 💙 Faturamento Previsto: R$ 125.000,00
   - 💚 Faturamento Bruto: R$ 176.500,00
```

**Sub-aba "Notas Fiscais":**
- 4 notas fiscais mockadas
- Status diferentes: Pendente, Pago, Vencido, Renegociado
- Clique em ℹ️ para ver DETALHES COMPLETOS

**Sub-aba "Medições":**
- 3 medições em cards
- Formatos: Excel e PDF
- 2 vinculadas a notas fiscais
- Clique em "Detalhes" para ver TUDO

### 2️⃣ Ver Todos os Recebimentos

```
Acesse: http://localhost:5173/pagamentos-receber
```

**Você verá:**
- 4 KPIs coloridos (Total a Receber, Recebido, Vencido, Próximos)
- Tabela com 5 notas de 2 obras diferentes
- Filtros funcionais
- Botão "Marcar como Pago"
- Clique em ℹ️ para ver DETALHES

---

## 🎨 O Que Você Vai Ver

### Notas Fiscais

**Tabela com:**
- Nº da Nota
- Valor Bruto
- Descontos (INSS, ISS, Outros)
- Valor Líquido
- Vencimento
- Status (badge colorido)

**Ações:**
- ℹ️ **Ver Detalhes** → Modal completo com TODAS as informações
- 👁️ Visualizar PDF
- ✏️ Editar
- 🗑️ Excluir

### Medições

**Cards com:**
- Ícone do tipo de arquivo (Excel 📊 ou PDF 📄)
- Descrição
- Data da medição
- Nota vinculada (se houver)

**Botões:**
- ℹ️ **Detalhes** → Modal completo
- ⬇️ Download
- 🗑️ Excluir

---

## 💡 Modais de Detalhes (NOVO!)

### Modal de Detalhes da Nota Fiscal

**Mostra:**
- ✅ Cabeçalho bonito com número e status
- 💰 Seção de valores (bruto, descontos, líquido)
- 📅 Datas (vencimento, pagamento)
- 📝 Observações
- 📄 Arquivo PDF (visualizar e download)
- ⏱️ Info do sistema (criado em, atualizado em)

**Quando vencida:**
- ⚠️ Mostra "Vencida há X dias" em vermelho

**Quando próxima do vencimento:**
- 🟠 Mostra "Vence em X dias" em laranja

### Modal de Detalhes da Medição

**Mostra:**
- ✅ Cabeçalho com descrição
- 📅 Data da medição
- 🔗 Nota fiscal vinculada (card especial)
  - Número, valor e vencimento da nota
- 📄 Arquivo com ícone apropriado
- 🔽 Botões grandes de visualizar e download
- ⏱️ Info do sistema

---

## 🎯 Cenários de Teste

### Testar Agora (Mockups):

✅ **Cenário 1: Ver Nota Pendente**
- Abra NF-2025-001
- Veja valor líquido R$ 42.750,00
- Veja que vence em 15/02/2025
- Badge amarelo "Pendente"

✅ **Cenário 2: Ver Nota Paga**
- Abra NF-2025-002
- Veja data de pagamento (25/01/2025)
- Badge verde "Pago"
- Observação sobre desconto negociado

✅ **Cenário 3: Ver Nota Vencida**
- Abra NF-2024-098
- Veja alerta "Vencida há 11 dias"
- Badge vermelho "Vencido"
- Valor líquido R$ 49.400,00

✅ **Cenário 4: Ver Nota Renegociada**
- Abra NF-2025-003
- Badge azul "Renegociado"
- Outro desconto de R$ 500,00
- Observação sobre ajustes

✅ **Cenário 5: Ver Medição com Nota Vinculada**
- Abra medição "Janeiro/2025"
- Veja card azul mostrando NF-2025-002
- Arquivo Excel
- Botões de ação

✅ **Cenário 6: Ver Medição sem Vínculo**
- Abra "Levantamento topográfico"
- Sem nota vinculada
- Arquivo PDF
- Data de dezembro/2024

✅ **Cenário 7: Filtros na Página Recebimentos**
- Filtrar por Status "Vencido" → Ver só NF-2024-098
- Filtrar por Obra "Osasco" → Ver 4 notas
- Filtrar por Obra "Central" → Ver 1 nota

---

## 📋 Resumo Visual

```
OBRA
└─ Aba "Notas e Medições"
   ├─ KPI: Faturamento Previsto (R$ 125.000)
   ├─ KPI: Faturamento Bruto (R$ 176.500)
   ├─ Sub-aba "Notas Fiscais"
   │  ├─ NF-2025-001 (Pendente) → [Ver Detalhes]
   │  ├─ NF-2025-002 (Pago) → [Ver Detalhes]
   │  ├─ NF-2024-098 (Vencido) → [Ver Detalhes]
   │  └─ NF-2025-003 (Renegociado) → [Ver Detalhes]
   └─ Sub-aba "Medições"
      ├─ Medição Jan/2025 → [Ver Detalhes]
      ├─ Levantamento → [Ver Detalhes]
      └─ Medição Fev/2025 → [Ver Detalhes]

RECEBIMENTOS (/pagamentos-receber)
├─ KPI: Total a Receber (R$ 166.150)
├─ KPI: Total Recebido (R$ 36.375)
├─ KPI: Total Vencido (R$ 49.400)
├─ KPI: Próximos Vencimentos (R$ 74.100)
└─ Tabela: 5 notas de 2 obras
   └─ Cada nota → [Ver Detalhes] [Marcar como Pago]
```

---

## 🎉 Está Tudo Pronto!

Acesse agora e explore:
1. Entre em qualquer obra
2. Vá na aba "Notas e Medições"
3. Clique em "Ver Detalhes" em qualquer item
4. Veja os modais completos e bonitos!
5. Vá em "Recebimentos" e veja o consolidado

**Divirta-se explorando! 🚀**

