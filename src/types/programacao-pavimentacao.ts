/**
 * Tipos para Programação de Pavimentação
 */

export type StatusProgramacao = 'programada' | 'confirmada' | 'cancelada';

export interface ProgramacaoPavimentacao {
  id: string;
  
  // Dados da Obra
  data: string; // YYYY-MM-DD
  cliente_id: string;
  cliente_nome?: string;
  obra: string; // Nome da obra
  rua: string; // Nome da rua
  
  // Equipe e Maquinários
  prefixo_equipe: string; // Ex: "Equipe A", "Equipe 01"
  maquinarios: string[]; // Array de IDs dos maquinários
  maquinarios_nomes?: string[]; // Nomes para exibição
  
  // Metragem e Produção
  metragem_prevista: number; // m² ou m
  quantidade_toneladas: number; // Toneladas programadas
  faixa_realizar: string; // Ex: "Faixa 1", "Faixa 2 e 3", etc.
  espessura_media_solicitada?: string; // Espessura média solicitada para a rua
  
  // Dados Adicionais (opcionais)
  horario_inicio?: string; // HH:mm
  observacoes?: string;
  tipo_servico?: string; // "CBUQ", "Imprimação", etc.
  espessura?: string; // cm
  
  // Status e Confirmação
  status: StatusProgramacao; // Status da programação
  confirmada: boolean; // Se a obra foi confirmada/finalizada
  data_confirmacao?: string; // Quando foi confirmada
  relatorio_diario_id?: string; // ID do relatório gerado
  
  // Controle
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramacaoPavimentacaoFormData {
  data: string;
  cliente_id: string;
  obra: string;
  rua: string;
  prefixo_equipe: string;
  maquinarios: string[];
  metragem_prevista: number;
  quantidade_toneladas: number;
  faixa_realizar: string;
  espessura_media_solicitada?: string;
  horario_inicio?: string;
  observacoes?: string;
  tipo_servico?: string;
  espessura?: string;
  company_id: string;
}

export interface ProgramacaoPavimentacaoExport {
  Data: string; // DD/MM/YYYY
  Cliente: string;
  Obra: string;
  Rua: string;
  'Prefixo da Equipe': string;
  'Maquinários': string; // Lista separada por vírgula
  'Metragem Prevista (m²)': string;
  'Quantidade de Toneladas': string;
  'Faixa a Ser Realizada': string;
  'Espessura Média Solicitada'?: string;
  'Horário Início'?: string;
  'Tipo de Serviço'?: string;
  'Espessura (cm)'?: string;
  'Observações'?: string;
}

export interface MaquinarioOption {
  id: string;
  nome: string;
  tipo: string;
  prefixo?: string;
}

export interface EquipeOption {
  value: string;
  label: string;
}

// Opções pré-definidas de equipes
export const EQUIPES_OPTIONS: EquipeOption[] = [
  { value: 'Equipe A', label: 'Equipe A' },
  { value: 'Equipe B', label: 'Equipe B' },
  { value: 'Equipe C', label: 'Equipe C' },
  { value: 'Equipe 01', label: 'Equipe 01' },
  { value: 'Equipe 02', label: 'Equipe 02' },
  { value: 'Equipe 03', label: 'Equipe 03' },
];

// Tipos de serviço
export const TIPOS_SERVICO_OPTIONS = [
  { value: 'CBUQ', label: 'CBUQ (Concreto Betuminoso Usinado a Quente)' },
  { value: 'Imprimação', label: 'Imprimação' },
  { value: 'Pintura de Ligação', label: 'Pintura de Ligação' },
  { value: 'Recapeamento', label: 'Recapeamento' },
  { value: 'PMF', label: 'PMF (Pré-Misturado a Frio)' },
  { value: 'Remendo', label: 'Remendo' },
];

