/**
 * Tipos e interfaces para Licenças de Maquinários e Veículos
 */

export interface LicencaMaquinario {
  id: string;
  maquinario_id: string;
  tipo_licenca: TipoLicenca;
  numero_licenca: string;
  orgao_emissor: string;
  data_emissao: string;
  data_validade: string;
  arquivo_url?: string;
  status: StatusLicenca;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type TipoLicenca = 
  | 'ANTT'           // Agência Nacional de Transportes Terrestres
  | 'Ambipar'        // Licença Ambiental
  | 'CIPP'           // Certificado de Inspeção para o Transporte de Produtos Perigosos
  | 'CIV'            // Certificado de Inspeção Veicular
  | 'CRLV'           // Certificado de Registro e Licenciamento de Veículo
  | 'Alvará'         // Alvará de funcionamento
  | 'Outros';

export type StatusLicenca = 
  | 'valida' 
  | 'vencida' 
  | 'em_renovacao' 
  | 'pendente';

export const TIPO_LICENCA_OPTIONS = [
  { value: 'ANTT', label: 'ANTT - Agência Nacional de Transportes Terrestres' },
  { value: 'Ambipar', label: 'Ambipar - Licença Ambiental' },
  { value: 'CIPP', label: 'CIPP - Certificado de Produtos Perigosos' },
  { value: 'CIV', label: 'CIV - Certificado de Inspeção Veicular' },
  { value: 'CRLV', label: 'CRLV - Certificado de Registro e Licenciamento' },
  { value: 'Alvará', label: 'Alvará de Funcionamento' },
  { value: 'Outros', label: 'Outras Licenças' },
];

// Licenças obrigatórias para caminhões espargidor
export const LICENCAS_OBRIGATORIAS_ESPARGIDOR: TipoLicenca[] = [
  'ANTT',
  'Ambipar',
  'CIPP',
  'CIV'
];

// Licenças obrigatórias para veículos em geral
export const LICENCAS_OBRIGATORIAS_VEICULOS: TipoLicenca[] = [
  'CRLV',
  'CIV'
];

export const STATUS_LICENCA_OPTIONS = [
  { value: 'valida', label: 'Válida' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'em_renovacao', label: 'Em Renovação' },
  { value: 'pendente', label: 'Pendente' },
];

/**
 * Helper functions
 */
export function calcularDiasParaVencimentoLicenca(dataValidade: string): number {
  const hoje = new Date();
  const dataFim = new Date(dataValidade);
  const diferenca = dataFim.getTime() - hoje.getTime();
  return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

export function getStatusLicenca(dataValidade: string): StatusLicenca {
  const diasRestantes = calcularDiasParaVencimentoLicenca(dataValidade);
  
  if (diasRestantes < 0) {
    return 'vencida';
  }
  
  if (diasRestantes <= 30) {
    return 'em_renovacao'; // Vence em até 30 dias
  }
  
  return 'valida';
}

export function getCorStatusLicenca(status: StatusLicenca): string {
  switch (status) {
    case 'valida':
      return 'bg-green-100 text-green-800';
    case 'vencida':
      return 'bg-red-100 text-red-800';
    case 'em_renovacao':
      return 'bg-yellow-100 text-yellow-800';
    case 'pendente':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTextoStatusLicenca(status: StatusLicenca): string {
  switch (status) {
    case 'valida':
      return 'Válida';
    case 'vencida':
      return 'Vencida';
    case 'em_renovacao':
      return 'Vence em Breve';
    case 'pendente':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
}

/**
 * Verifica se um maquinário tem todas as licenças obrigatórias
 */
export function verificarLicencasObrigatorias(
  licencas: LicencaMaquinario[],
  tipoMaquinario: string
): {
  completo: boolean;
  faltantes: TipoLicenca[];
  vencidas: LicencaMaquinario[];
} {
  const isEspargidor = tipoMaquinario.toLowerCase().includes('espargidor');
  const licencasObrigatorias = isEspargidor 
    ? LICENCAS_OBRIGATORIAS_ESPARGIDOR 
    : LICENCAS_OBRIGATORIAS_VEICULOS;

  const tiposPresentes = licencas.map(l => l.tipo_licenca);
  const faltantes = licencasObrigatorias.filter(tipo => !tiposPresentes.includes(tipo));
  
  const vencidas = licencas.filter(l => 
    licencasObrigatorias.includes(l.tipo_licenca) && 
    l.status === 'vencida'
  );

  return {
    completo: faltantes.length === 0 && vencidas.length === 0,
    faltantes,
    vencidas
  };
}


