/**
 * Tipos e interfaces para Seguro de Maquinários e Veículos
 */

export interface SeguroMaquinario {
  id: string;
  maquinario_id: string;
  seguradora: string;
  numero_apolice: string;
  tipo_cobertura: TipoCobertura;
  valor_segurado: number;
  valor_franquia: number;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  forma_pagamento: FormaPagamento;
  valor_premio: number; // Valor total do seguro
  valor_parcela?: number;
  quantidade_parcelas?: number;
  dia_vencimento?: number;
  observacoes?: string;
  corretor?: string;
  telefone_corretor?: string;
  email_corretor?: string;
  arquivo_apolice_url?: string;
  status: StatusSeguro;
  created_at: string;
  updated_at: string;
}

export type TipoCobertura = 
  | 'compreensiva' 
  | 'colisao' 
  | 'incendio_roubo' 
  | 'roubo' 
  | 'terceiros' 
  | 'outras';

export type FormaPagamento = 
  | 'vista' 
  | 'parcelado_mensal' 
  | 'parcelado_trimestral' 
  | 'parcelado_semestral' 
  | 'parcelado_anual';

export type StatusSeguro = 
  | 'ativo' 
  | 'vencido' 
  | 'cancelado' 
  | 'em_renovacao';

export const TIPO_COBERTURA_OPTIONS = [
  { value: 'compreensiva', label: 'Compreensiva (Cobertura Total)' },
  { value: 'colisao', label: 'Colisão' },
  { value: 'incendio_roubo', label: 'Incêndio e Roubo' },
  { value: 'roubo', label: 'Roubo' },
  { value: 'terceiros', label: 'Responsabilidade Civil (Terceiros)' },
  { value: 'outras', label: 'Outras' },
];

export const FORMA_PAGAMENTO_OPTIONS = [
  { value: 'vista', label: 'À Vista' },
  { value: 'parcelado_mensal', label: 'Parcelado Mensal' },
  { value: 'parcelado_trimestral', label: 'Parcelado Trimestral' },
  { value: 'parcelado_semestral', label: 'Parcelado Semestral' },
  { value: 'parcelado_anual', label: 'Parcelado Anual' },
];

export const STATUS_SEGURO_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'em_renovacao', label: 'Em Renovação' },
];

/**
 * Sinistros relacionados ao seguro
 */
export interface SinistroSeguro {
  id: string;
  seguro_id: string;
  data_sinistro: string;
  tipo_sinistro: TipoSinistro;
  descricao: string;
  valor_prejuizo: number;
  valor_franquia_paga: number;
  valor_indenizado: number;
  numero_sinistro?: string;
  status_sinistro: StatusSinistro;
  data_abertura: string;
  data_conclusao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type TipoSinistro = 
  | 'colisao' 
  | 'roubo' 
  | 'incendio' 
  | 'danos_terceiros' 
  | 'quebra_equipamento' 
  | 'outros';

export type StatusSinistro = 
  | 'em_analise' 
  | 'aprovado' 
  | 'reprovado' 
  | 'pago' 
  | 'cancelado';

export const TIPO_SINISTRO_OPTIONS = [
  { value: 'colisao', label: 'Colisão' },
  { value: 'roubo', label: 'Roubo/Furto' },
  { value: 'incendio', label: 'Incêndio' },
  { value: 'danos_terceiros', label: 'Danos a Terceiros' },
  { value: 'quebra_equipamento', label: 'Quebra de Equipamento' },
  { value: 'outros', label: 'Outros' },
];

export const STATUS_SINISTRO_OPTIONS = [
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'reprovado', label: 'Reprovado' },
  { value: 'pago', label: 'Pago/Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

/**
 * Helper functions
 */
export function calcularDiasParaVencimento(dataFimVigencia: string): number {
  const hoje = new Date();
  const dataFim = new Date(dataFimVigencia);
  const diferenca = dataFim.getTime() - hoje.getTime();
  return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

export function getStatusSeguro(dataFimVigencia: string): StatusSeguro {
  const diasRestantes = calcularDiasParaVencimento(dataFimVigencia);
  
  if (diasRestantes < 0) {
    return 'vencido';
  }
  
  return 'ativo';
}

export function getCorStatus(status: StatusSeguro): string {
  switch (status) {
    case 'ativo':
      return 'bg-green-100 text-green-800';
    case 'vencido':
      return 'bg-red-100 text-red-800';
    case 'cancelado':
      return 'bg-gray-100 text-gray-800';
    case 'em_renovacao':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTextoStatus(status: StatusSeguro): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'vencido':
      return 'Vencido';
    case 'cancelado':
      return 'Cancelado';
    case 'em_renovacao':
      return 'Em Renovação';
    default:
      return 'Desconhecido';
  }
}


