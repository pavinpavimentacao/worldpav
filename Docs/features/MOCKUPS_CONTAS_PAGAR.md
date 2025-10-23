# 🎨 Mockups - Módulo Contas a Pagar

## 📊 Dashboard Principal

### Estatísticas Gerais
- **Total de Contas**: 10 contas
- **Pendentes**: 6 contas (R$ 58.500,50)
- **Pagas**: 1 conta (R$ 12.000,00)
- **Atrasadas**: 3 contas (R$ 23.700,00)
- **Canceladas**: 1 conta (R$ 9.500,00)

## 📋 Lista de Contas a Pagar

### 🔴 Contas Atrasadas (3 contas)

| Nota | Fornecedor | Valor | Vencimento | Status | Dias |
|------|------------|-------|------------|--------|------|
| NF-2024-001 | Construtora ABC Ltda | R$ 15.000,00 | 5 dias atrás | 🔴 Atrasada | -5 |
| NF-2024-003 | Material de Construção XYZ | R$ 3.200,00 | 10 dias atrás | 🔴 Atrasada | -10 |
| NF-2024-007 | Concreto Premium Ltda | R$ 18.000,00 | 8 dias atrás | 🔴 Atrasada | -8 |

### 🟡 Contas Pendentes (6 contas)

| Nota | Fornecedor | Valor | Vencimento | Status | Dias |
|------|------------|-------|------------|--------|------|
| NF-2024-002 | Equipamentos Rodoviários S.A. | R$ 8.500,50 | em 3 dias | 🟡 Pendente | 3 |
| NF-2024-005 | Energia Elétrica Regional | R$ 7.500,00 | em 10 dias | 🟡 Pendente | 10 |
| NF-2024-006 | Manutenção Express | R$ 2.500,00 | amanhã | 🟡 Pendente | 1 |
| NF-2024-008 | Transporte Rápido | R$ 4.500,00 | em 5 dias | 🟡 Pendente | 5 |
| NF-2024-010 | Consultoria Técnica | R$ 6.800,00 | em 7 dias | 🟡 Pendente | 7 |

### 🟢 Contas Pagas (1 conta)

| Nota | Fornecedor | Valor | Pagamento | Status |
|------|------------|-------|-----------|--------|
| NF-2024-004 | Seguros e Proteção Ltda | R$ 12.000,00 | 12 dias atrás | ✅ Paga |

### ⚫ Contas Canceladas (1 conta)

| Nota | Fornecedor | Valor | Motivo | Status |
|------|------------|-------|--------|--------|
| NF-2024-009 | Serviços Gerais SP | R$ 9.500,00 | Não conformidade | ❌ Cancelada |

## 🎯 Categorias Representadas

- **Serviços**: 2 contas (R$ 24.500,00)
- **Materiais**: 2 contas (R$ 21.200,00)
- **Equipamentos**: 1 conta (R$ 8.500,50)
- **Seguros**: 1 conta (R$ 12.000,00)
- **Utilidades**: 1 conta (R$ 7.500,00)
- **Manutenção**: 1 conta (R$ 2.500,00)
- **Transporte**: 1 conta (R$ 4.500,00)
- **Consultoria**: 1 conta (R$ 6.800,00)

## 📈 Lógica de Status Implementada

### Status Automático por Vencimento
- **Pendente**: Vencimento futuro
- **Atrasada**: Vencimento passado (status automático)
- **Paga**: Pagamento realizado
- **Cancelada**: Cancelamento manual

### Alertas Visuais
- 🔴 **Atrasada**: Fundo vermelho, urgente
- 🟡 **Pendente**: Fundo amarelo, atenção
- 🟢 **Paga**: Fundo verde, concluída
- ⚫ **Cancelada**: Fundo cinza, cancelada

## 💰 Valores Totais

- **Valor Total Geral**: R$ 103.500,50
- **Valor Pendente**: R$ 58.500,50
- **Valor Pago**: R$ 12.000,00
- **Valor Atrasado**: R$ 36.200,00
- **Valor Cancelado**: R$ 9.500,00

## 🔍 Funcionalidades Demonstradas

### Filtros Disponíveis
- **Status**: Todas, Pendente, Paga, Atrasada, Cancelada
- **Busca**: Por número da nota, fornecedor, descrição
- **Ordenação**: Por data de vencimento, valor, status

### Ações por Conta
- 👁️ **Visualizar**: Detalhes completos
- ✏️ **Editar**: Modificar dados
- 📄 **Download**: Baixar anexo
- 🗑️ **Excluir**: Remover conta

### Upload de Anexos
- **Tipos**: PDF, JPG, PNG
- **Tamanho**: Máximo 10MB
- **Status**: Anexado/Disponível

## 🎨 Interface Visual

### Cards de Estatísticas
- **Design**: Cards coloridos com ícones
- **Cores**: Verde (pago), Amarelo (pendente), Vermelho (atrasado)
- **Valores**: Formatação brasileira (R$ 1.234,56)

### Tabela Responsiva
- **Colunas**: Nota, Fornecedor, Valor, Vencimento, Status, Ações
- **Responsividade**: Adaptável para mobile
- **Paginação**: 10 itens por página

### Formulário Completo
- **Campos**: Todos os dados da conta
- **Validação**: Em tempo real
- **Upload**: Drag & drop de arquivos
- **Salvamento**: Auto-save opcional

## 🚀 Próximos Passos

1. **Testar Interface**: Navegar pelos mockups
2. **Validar Dados**: Verificar consistência
3. **Ajustar Layout**: Melhorias visuais
4. **Implementar Banco**: Migrar para dados reais
5. **Configurar Storage**: Upload de anexos

---

*Mockups criados com dados realistas para demonstração do módulo Contas a Pagar*
