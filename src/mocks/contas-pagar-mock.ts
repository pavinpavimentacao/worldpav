import type { ContaPagar } from '../types/contas-pagar'

// Função para calcular status baseado na data de vencimento
function calcularStatus(dataVencimento: string, statusAtual: string): string {
  if (statusAtual === 'Paga' || statusAtual === 'Cancelada') {
    return statusAtual
  }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)

  const diffTime = vencimento.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Atrasada'
  } else {
    return 'Pendente'
  }
}

// Função para gerar datas
function gerarData(diasOffset: number): string {
  const data = new Date()
  data.setDate(data.getDate() + diasOffset)
  return data.toISOString().split('T')[0]
}

export const contasPagarMock: ContaPagar[] = [
  {
    id: '1',
    numero_nota: 'NF-2024-001',
    valor: 15000.00,
    data_emissao: gerarData(-15),
    data_vencimento: gerarData(-5), // Vencida há 5 dias
    status: calcularStatus(gerarData(-5), 'Pendente') as any,
    fornecedor: 'Construtora ABC Ltda',
    descricao: 'Serviços de pavimentação asfáltica - Rua das Flores',
    categoria: 'Serviços',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Urgente - Contato com fornecedor necessário',
    anexo_url: 'https://example.com/nota-001.pdf',
    anexo_nome: 'nota-fiscal-001.pdf',
    created_at: gerarData(-20),
    updated_at: gerarData(-5),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '2',
    numero_nota: 'NF-2024-002',
    valor: 8500.50,
    data_emissao: gerarData(-10),
    data_vencimento: gerarData(3), // Vence em 3 dias
    status: calcularStatus(gerarData(3), 'Pendente') as any,
    fornecedor: 'Equipamentos Rodoviários S.A.',
    descricao: 'Aluguel de equipamentos - Rolo compactador',
    categoria: 'Equipamentos',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Verificar disponibilidade de equipamento',
    anexo_url: 'https://example.com/nota-002.pdf',
    anexo_nome: 'nota-fiscal-002.pdf',
    created_at: gerarData(-12),
    updated_at: gerarData(-10),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '3',
    numero_nota: 'NF-2024-003',
    valor: 3200.00,
    data_emissao: gerarData(-20),
    data_vencimento: gerarData(-10), // Vencida há 10 dias
    status: calcularStatus(gerarData(-10), 'Pendente') as any,
    fornecedor: 'Material de Construção XYZ',
    descricao: 'Asfalto quente - 50 toneladas',
    categoria: 'Materiais',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Material já entregue, aguardando pagamento',
    anexo_url: 'https://example.com/nota-003.pdf',
    anexo_nome: 'nota-fiscal-003.pdf',
    created_at: gerarData(-22),
    updated_at: gerarData(-10),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '4',
    numero_nota: 'NF-2024-004',
    valor: 12000.00,
    data_emissao: gerarData(-30),
    data_vencimento: gerarData(-15), // Vencida há 15 dias
    status: 'Paga',
    fornecedor: 'Seguros e Proteção Ltda',
    descricao: 'Seguro de equipamentos - Trimestre Q1',
    categoria: 'Seguros',
    data_pagamento: gerarData(-12),
    valor_pago: 12000.00,
    forma_pagamento: 'Pix',
    observacoes: 'Pagamento realizado com sucesso',
    anexo_url: 'https://example.com/nota-004.pdf',
    anexo_nome: 'nota-fiscal-004.pdf',
    created_at: gerarData(-32),
    updated_at: gerarData(-12),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '5',
    numero_nota: 'NF-2024-005',
    valor: 7500.00,
    data_emissao: gerarData(-5),
    data_vencimento: gerarData(10), // Vence em 10 dias
    status: calcularStatus(gerarData(10), 'Pendente') as any,
    fornecedor: 'Energia Elétrica Regional',
    descricao: 'Conta de energia - Obra Centro',
    categoria: 'Utilidades',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Verificar desconto por pagamento antecipado',
    anexo_url: 'https://example.com/nota-005.pdf',
    anexo_nome: 'nota-fiscal-005.pdf',
    created_at: gerarData(-7),
    updated_at: gerarData(-5),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '6',
    numero_nota: 'NF-2024-006',
    valor: 2500.00,
    data_emissao: gerarData(-8),
    data_vencimento: gerarData(1), // Vence amanhã
    status: calcularStatus(gerarData(1), 'Pendente') as any,
    fornecedor: 'Manutenção Express',
    descricao: 'Manutenção preventiva - Caminhão basculante',
    categoria: 'Manutenção',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Serviço concluído, aguardando pagamento',
    anexo_url: 'https://example.com/nota-006.pdf',
    anexo_nome: 'nota-fiscal-006.pdf',
    created_at: gerarData(-10),
    updated_at: gerarData(-8),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '7',
    numero_nota: 'NF-2024-007',
    valor: 18000.00,
    data_emissao: gerarData(-25),
    data_vencimento: gerarData(-8), // Vencida há 8 dias
    status: calcularStatus(gerarData(-8), 'Pendente') as any,
    fornecedor: 'Asfalto Premium Ltda',
    descricao: 'Massa asfáltica CBUQ - 100m³',
    categoria: 'Materiais',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Material de alta qualidade, negociar desconto',
    anexo_url: 'https://example.com/nota-007.pdf',
    anexo_nome: 'nota-fiscal-007.pdf',
    created_at: gerarData(-27),
    updated_at: gerarData(-8),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '8',
    numero_nota: 'NF-2024-008',
    valor: 4500.00,
    data_emissao: gerarData(-15),
    data_vencimento: gerarData(5), // Vence em 5 dias
    status: calcularStatus(gerarData(5), 'Pendente') as any,
    fornecedor: 'Transporte Rápido',
    descricao: 'Frete de materiais - 3 viagens',
    categoria: 'Transporte',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Serviço de qualidade, recomendar para próximas obras',
    anexo_url: 'https://example.com/nota-008.pdf',
    anexo_nome: 'nota-fiscal-008.pdf',
    created_at: gerarData(-17),
    updated_at: gerarData(-15),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '9',
    numero_nota: 'NF-2024-009',
    valor: 9500.00,
    data_emissao: gerarData(-40),
    data_vencimento: gerarData(-25), // Vencida há 25 dias
    status: 'Cancelada',
    fornecedor: 'Serviços Gerais SP',
    descricao: 'Serviços de limpeza - Cancelado',
    categoria: 'Serviços',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Serviço cancelado por não conformidade',
    anexo_url: 'https://example.com/nota-009.pdf',
    anexo_nome: 'nota-fiscal-009.pdf',
    created_at: gerarData(-42),
    updated_at: gerarData(-25),
    created_by: 'user-1',
    updated_by: 'user-1'
  },
  {
    id: '10',
    numero_nota: 'NF-2024-010',
    valor: 6800.00,
    data_emissao: gerarData(-12),
    data_vencimento: gerarData(7), // Vence em 7 dias
    status: calcularStatus(gerarData(7), 'Pendente') as any,
    fornecedor: 'Consultoria Técnica',
    descricao: 'Consultoria em engenharia civil',
    categoria: 'Consultoria',
    data_pagamento: null,
    valor_pago: null,
    forma_pagamento: null,
    observacoes: 'Relatório técnico excelente, recomendar',
    anexo_url: 'https://example.com/nota-010.pdf',
    anexo_nome: 'nota-fiscal-010.pdf',
    created_at: gerarData(-14),
    updated_at: gerarData(-12),
    created_by: 'user-1',
    updated_by: 'user-1'
  }
]

// Estatísticas calculadas
export const estatisticasMock = {
  total_contas: contasPagarMock.length,
  total_pendente: contasPagarMock.filter(c => c.status === 'Pendente').length,
  total_pago: contasPagarMock.filter(c => c.status === 'Paga').length,
  total_atrasado: contasPagarMock.filter(c => c.status === 'Atrasada').length,
  valor_total_pendente: contasPagarMock
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + c.valor, 0),
  valor_total_pago: contasPagarMock
    .filter(c => c.status === 'Paga')
    .reduce((sum, c) => sum + c.valor, 0),
  valor_total_atrasado: contasPagarMock
    .filter(c => c.status === 'Atrasada')
    .reduce((sum, c) => sum + c.valor, 0)
}
