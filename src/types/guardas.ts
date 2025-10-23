/**
 * TIPOS - Sistema de Guardas
 * Gerenciamento de empresas de segurança, guardas e suas diárias
 */

// ============================================
// EMPRESA DE GUARDA
// ============================================

export interface EmpresaGuarda {
  id: string;
  nome: string;
  telefone: string;
  documento: string; // CPF ou CNPJ
  tipo_documento: 'CPF' | 'CNPJ';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaGuardaInput {
  nome: string;
  telefone: string;
  documento: string;
  tipo_documento: 'CPF' | 'CNPJ';
}

// ============================================
// GUARDA
// ============================================

export interface Guarda {
  id: string;
  nome: string;
  telefone: string;
  empresa_id: string;
  empresa_nome?: string; // Join
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGuardaInput {
  nome: string;
  telefone: string;
  empresa_id: string;
}

// ============================================
// DIÁRIA DE GUARDA
// ============================================

export type TurnoGuarda = 'manha' | 'tarde' | 'noite' | 'madrugada';

export interface DiariaGuarda {
  id: string;
  guarda_id: string;
  guarda_nome?: string; // Join
  empresa_id: string;
  empresa_nome?: string; // Join
  solicitante: string; // Nome de quem solicitou
  valor_diaria: number;
  data_diaria: string; // YYYY-MM-DD
  turno: TurnoGuarda;
  rua: string;
  foto_maquinario_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Maquinários vinculados à diária
export interface DiariaMaquinario {
  id: string;
  diaria_id: string;
  maquinario_id: string;
  maquinario_nome?: string; // Join
  created_at: string;
}

// Diária completa (com maquinários)
export interface DiariaGuardaCompleta extends DiariaGuarda {
  maquinarios: DiariaMaquinario[];
}

export interface CreateDiariaGuardaInput {
  guarda_id: string;
  solicitante: string;
  valor_diaria: number;
  data_diaria: string;
  turno: TurnoGuarda;
  rua: string;
  maquinarios: string[]; // IDs dos maquinários
  foto_maquinario?: File;
  observacoes?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Retorna o label de um turno
 */
export function getLabelTurno(turno: TurnoGuarda): string {
  const labels: Record<TurnoGuarda, string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    noite: 'Noite',
    madrugada: 'Madrugada',
  };
  return labels[turno];
}

/**
 * Retorna a cor de um turno
 */
export function getCorTurno(turno: TurnoGuarda): string {
  const cores: Record<TurnoGuarda, string> = {
    manha: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    tarde: 'bg-orange-100 text-orange-800 border-orange-300',
    noite: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    madrugada: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return cores[turno];
}

/**
 * Retorna o ícone de um turno (emoji)
 */
export function getIconeTurno(turno: TurnoGuarda): string {
  const icones: Record<TurnoGuarda, string> = {
    manha: '🌅',
    tarde: '☀️',
    noite: '🌙',
    madrugada: '🌃',
  };
  return icones[turno];
}

/**
 * Valida CPF (formato simples)
 */
export function validarCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Valida CNPJ (formato simples)
 */
export function validarCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.length === 14;
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatarCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatarCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata documento (CPF ou CNPJ)
 */
export function formatarDocumento(documento: string, tipo: 'CPF' | 'CNPJ'): string {
  return tipo === 'CPF' ? formatarCPF(documento) : formatarCNPJ(documento);
}

/**
 * Retorna todos os turnos disponíveis
 */
export function getTurnosDisponiveis(): { value: TurnoGuarda; label: string }[] {
  return [
    { value: 'manha', label: '🌅 Manhã' },
    { value: 'tarde', label: '☀️ Tarde' },
    { value: 'noite', label: '🌙 Noite' },
    { value: 'madrugada', label: '🌃 Madrugada' },
  ];
}

/**
 * Calcula total de diárias por período
 */
export interface EstatisticasDiarias {
  total_diarias: number;
  valor_total: number;
  valor_medio: number;
  por_turno: Record<TurnoGuarda, number>;
  por_guarda: Record<string, number>;
}


