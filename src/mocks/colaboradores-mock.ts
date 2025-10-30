// Mock para colaboradores
export interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  salario: number;
  data_admissao: string;
  status: 'ativo' | 'inativo';
}

export const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva',
    funcao: 'Operador',
    salario: 3000.00,
    data_admissao: '2024-01-01',
    status: 'ativo'
  }
];

export const getColaboradores = (): Colaborador[] => {
  return mockColaboradores;
};

