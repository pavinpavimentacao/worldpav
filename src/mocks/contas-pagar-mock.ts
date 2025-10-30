// Mock para contas a pagar
export interface ContaPagar {
  id: string;
  numero_nota: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  status: 'Pendente' | 'Paga' | 'Atrasada' | 'Cancelada';
  fornecedor: string;
  descricao: string;
  categoria: string;
}

export const mockContasPagar: ContaPagar[] = [
  {
    id: '1',
    numero_nota: 'NF-001',
    valor: 1000.00,
    data_emissao: '2024-01-01',
    data_vencimento: '2024-01-31',
    status: 'Pendente',
    fornecedor: 'Fornecedor ABC',
    descricao: 'Serviços de manutenção',
    categoria: 'Manutenção'
  }
];

export const getContasPagar = (): ContaPagar[] => {
  return mockContasPagar;
};

export const contasPagarMock = mockContasPagar;

export const estatisticasMock = {
  total: mockContasPagar.length,
  pendentes: mockContasPagar.filter(c => c.status === 'Pendente').length,
  pagas: mockContasPagar.filter(c => c.status === 'Paga').length,
  atrasadas: mockContasPagar.filter(c => c.status === 'Atrasada').length,
  valorTotal: mockContasPagar.reduce((sum, c) => sum + c.valor, 0)
};
