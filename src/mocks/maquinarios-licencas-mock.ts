// Mock para licenças de maquinários
export interface LicencaMaquinario {
  id: string;
  maquinario_id: string;
  tipo: string;
  numero: string;
  data_vencimento: string;
  status: 'ativa' | 'vencida' | 'renovada';
  observacoes?: string;
}

export const mockLicencas: LicencaMaquinario[] = [
  {
    id: '1',
    maquinario_id: '1',
    tipo: 'Licença Ambiental',
    numero: 'LA-2024-001',
    data_vencimento: '2024-12-31',
    status: 'ativa',
    observacoes: 'Licença válida até dezembro'
  }
];

export const getLicencasByMaquinarioId = (maquinarioId: string): LicencaMaquinario[] => {
  return mockLicencas.filter(licenca => licenca.maquinario_id === maquinarioId);
};

