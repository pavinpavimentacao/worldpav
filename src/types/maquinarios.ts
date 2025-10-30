export interface Maquinario {
  id: string;
  name: string;
  plate: string;
  type: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMaquinarioInput {
  name: string;
  plate: string;
  type: string;
  status?: 'ativo' | 'inativo' | 'manutencao';
  company_id: string;
}

export interface UpdateMaquinarioInput {
  name?: string;
  plate?: string;
  type?: string;
  status?: 'ativo' | 'inativo' | 'manutencao';
}

export function getStatusColor(status: Maquinario['status']): string {
  switch (status) {
    case 'ativo':
      return 'text-green-600 bg-green-100';
    case 'inativo':
      return 'text-gray-600 bg-gray-100';
    case 'manutencao':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusText(status: Maquinario['status']): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'inativo':
      return 'Inativo';
    case 'manutencao':
      return 'Manutenção';
    default:
      return 'Desconhecido';
  }
}

export function getStatusLabel(status: Maquinario['status']): string {
  return getStatusText(status);
}

export const tiposMaquinario = [
  { value: 'vibroacabadora', label: 'Vibroacabadora' },
  { value: 'caminhao_espargidor', label: 'Caminhão Espargidor' },
  { value: 'rolo_compactador', label: 'Rolo Compactador' },
  { value: 'pavimentadora', label: 'Pavimentadora' },
  { value: 'caminhao_basculante', label: 'Caminhão Basculante' },
  { value: 'retroescavadeira', label: 'Retroescavadeira' },
  { value: 'outros', label: 'Outros' }
];
