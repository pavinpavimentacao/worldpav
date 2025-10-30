// Mock para seguros de maquinários
export interface SeguroMaquinario {
  id: string;
  maquinario_id: string;
  seguradora: string;
  apolice: string;
  data_inicio: string;
  data_vencimento: string;
  valor: number;
  status: 'ativo' | 'vencido' | 'cancelado';
  observacoes?: string;
}

export const mockSeguros: SeguroMaquinario[] = [
  {
    id: '1',
    maquinario_id: '1',
    seguradora: 'Seguradora ABC',
    apolice: 'AP-2024-001',
    data_inicio: '2024-01-01',
    data_vencimento: '2024-12-31',
    valor: 5000.00,
    status: 'ativo',
    observacoes: 'Seguro completo'
  }
];

export const getSegurosByMaquinarioId = (maquinarioId: string): SeguroMaquinario[] => {
  return mockSeguros.filter(seguro => seguro.maquinario_id === maquinarioId);
};

