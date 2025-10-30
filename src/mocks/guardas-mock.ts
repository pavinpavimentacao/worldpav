// Mock para guardas
export interface Guarda {
  id: string;
  nome: string;
  turno: 'manha' | 'tarde' | 'noite';
  data: string;
  status: 'presente' | 'ausente';
}

export interface EmpresaGuarda {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  endereco: string;
  contato: string;
  email: string;
  observacoes?: string;
}

export const mockGuardas: Guarda[] = [
  {
    id: '1',
    nome: 'Maria Santos',
    turno: 'manha',
    data: '2024-01-01',
    status: 'presente'
  }
];

export const mockEmpresasGuarda: EmpresaGuarda[] = [
  {
    id: '1',
    nome: 'Segurança Total Ltda',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123',
    contato: 'João Silva',
    email: 'contato@segurancatotal.com',
    observacoes: 'Empresa especializada em segurança'
  }
];

export const getGuardas = (): Guarda[] => {
  return mockGuardas;
};

export const adicionarEmpresaGuarda = (empresa: Omit<EmpresaGuarda, 'id'>) => {
  const novaEmpresa: EmpresaGuarda = {
    ...empresa,
    id: Date.now().toString()
  };
  mockEmpresasGuarda.push(novaEmpresa);
  return novaEmpresa;
};

export const getEstatisticasGuardas = () => {
  return {
    totalGuardas: mockGuardas.length,
    guardasPresentes: mockGuardas.filter(g => g.status === 'presente').length,
    totalEmpresas: mockEmpresasGuarda.length
  };
};

export const mockDiariasGuarda = [
  {
    id: '1',
    data: '2024-01-01',
    guarda: 'Maria Santos',
    empresa: 'Segurança Total Ltda',
    turno: 'manha',
    status: 'presente'
  }
];

export const adicionarGuarda = (guarda: Omit<Guarda, 'id'>) => {
  const novoGuarda: Guarda = {
    ...guarda,
    id: Date.now().toString()
  };
  mockGuardas.push(novoGuarda);
  return novoGuarda;
};

export const adicionarDiariaGuarda = (diaria: any) => {
  const novaDiaria = {
    ...diaria,
    id: Date.now().toString()
  };
  mockDiariasGuarda.push(novaDiaria);
  return novaDiaria;
};
