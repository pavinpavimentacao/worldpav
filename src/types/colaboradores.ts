/**
 * Tipos e Interfaces para o Módulo de Colaboradores
 * Sistema de gerenciamento de equipes e colaboradores
 */

// ============================================
// ENUMS
// ============================================

/**
 * Tipo de equipe do colaborador
 */
export type TipoEquipe = 'massa' | 'administrativa';

/**
 * Funções da Equipe de Massa (Operacional)
 */
export type FuncaoEquipeMassa =
  | 'Ajudante'
  | 'Rasteleiro'
  | 'Operador de Rolo Chapa Chapa'
  | 'Operador de Rolo Pneu Pneu'
  | 'Operador de VibroAcabadora'
  | 'Operador de Mesa da VibroAcabadora'
  | 'Motorista de Caminhão Espargidor'
  | 'Mangueirista'
  | 'Encarregado'
  // Funções antigas mantidas para compatibilidade
  | 'Motorista Operador de Bomba'
  | 'Auxiliar de Bomba'
  | 'Fiscal de Obras'
  | 'Mecânico';

/**
 * Funções da Equipe Administrativa
 */
export type FuncaoEquipeAdministrativa =
  | 'Financeiro'
  | 'RH'
  | 'Programador'
  | 'Admin'
  // Função antiga mantida para compatibilidade
  | 'Administrador Financeiro';

/**
 * Todas as funções possíveis
 */
export type FuncaoColaborador = FuncaoEquipeMassa | FuncaoEquipeAdministrativa;

/**
 * Tipo de contrato do colaborador
 */
export type TipoContrato = 'fixo' | 'diarista';

/**
 * Status do colaborador
 */
export type StatusColaborador = 'ativo' | 'inativo' | 'afastado' | 'ferias';

/**
 * Tipos de documento
 */
export type TipoDocumento =
  | 'CNH'
  | 'RG'
  | 'Comprovante Residência'
  | 'Reservista'
  | 'Título Eleitor'
  | 'CTPS'
  | 'PIS'
  | 'Outros';

/**
 * Tipo de dia para horas extras
 */
export type TipoDiaHoraExtra = 'segunda-sexta' | 'sabado';

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Interface principal para Colaborador
 */
export interface Colaborador {
  id: string;
  nome: string;
  tipo_equipe: TipoEquipe;
  funcao: FuncaoColaborador;
  tipo_contrato: TipoContrato;
  salario_fixo: number;
  data_pagamento_1?: string | null;
  data_pagamento_2?: string | null;
  valor_pagamento_1?: number | null;
  valor_pagamento_2?: number | null;
  equipamento_vinculado_id?: string | null;
  registrado: boolean;
  vale_transporte: boolean;
  qtd_passagens_por_dia?: number | null;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  company_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para criação de Colaborador (Insert)
 */
export interface ColaboradorInsert {
  id?: string;
  nome: string;
  tipo_equipe: TipoEquipe;
  funcao: FuncaoColaborador;
  tipo_contrato?: TipoContrato;
  salario_fixo?: number;
  data_pagamento_1?: string | null;
  data_pagamento_2?: string | null;
  valor_pagamento_1?: number | null;
  valor_pagamento_2?: number | null;
  equipamento_vinculado_id?: string | null;
  registrado?: boolean;
  vale_transporte?: boolean;
  qtd_passagens_por_dia?: number | null;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
  company_id: string;
}

/**
 * Interface para atualização de Colaborador (Update)
 */
export interface ColaboradorUpdate {
  id?: string;
  nome?: string;
  tipo_equipe?: TipoEquipe;
  funcao?: FuncaoColaborador;
  tipo_contrato?: TipoContrato;
  salario_fixo?: number;
  data_pagamento_1?: string | null;
  data_pagamento_2?: string | null;
  valor_pagamento_1?: number | null;
  valor_pagamento_2?: number | null;
  equipamento_vinculado_id?: string | null;
  registrado?: boolean;
  vale_transporte?: boolean;
  qtd_passagens_por_dia?: number | null;
  cpf?: string | null;
  telefone?: string | null;
  email?: string | null;
}

/**
 * Interface para Dependente
 */
export interface ColaboradorDependente {
  id: string;
  colaborador_id: string;
  nome_completo: string;
  data_nascimento: string;
  local_nascimento?: string | null;
  tipo_dependente?: string | null;
  created_at: string;
}

/**
 * Interface para criação de Dependente
 */
export interface ColaboradorDependenteInsert {
  id?: string;
  colaborador_id: string;
  nome_completo: string;
  data_nascimento: string;
  local_nascimento?: string | null;
  tipo_dependente?: string | null;
}

/**
 * Interface para Documento
 */
export interface ColaboradorDocumento {
  id: string;
  colaborador_id: string;
  tipo_documento: TipoDocumento;
  dados_texto?: any | null; // JSONB
  arquivo_url?: string | null;
  created_at: string;
}

/**
 * Interface para criação de Documento
 */
export interface ColaboradorDocumentoInsert {
  id?: string;
  colaborador_id: string;
  tipo_documento: TipoDocumento;
  dados_texto?: any | null;
  arquivo_url?: string | null;
}

/**
 * Interface para Hora Extra
 */
export interface ColaboradorHoraExtra {
  id: string;
  colaborador_id: string;
  data: string;
  horas: number;
  valor_calculado: number;
  tipo_dia: TipoDiaHoraExtra;
  created_at: string;
}

/**
 * Interface para criação de Hora Extra
 */
export interface ColaboradorHoraExtraInsert {
  id?: string;
  colaborador_id: string;
  data: string;
  horas: number;
  tipo_dia: TipoDiaHoraExtra;
}

// ============================================
// INTERFACES PARA UI E FORMULÁRIOS
// ============================================

/**
 * Interface para opções de Select
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Filtros para listagem de colaboradores
 */
export interface ColaboradorFilters {
  searchTerm?: string;
  tipo_equipe?: TipoEquipe | 'todas';
  funcao?: FuncaoColaborador | 'todas';
  tipo_contrato?: TipoContrato | 'todos';
  status?: StatusColaborador | 'todos';
  equipamento_vinculado_id?: string | 'todos';
}

/**
 * Dados expandidos do colaborador (com relacionamentos)
 */
export interface ColaboradorCompleto extends Colaborador {
  dependentes?: ColaboradorDependente[];
  documentos?: ColaboradorDocumento[];
  horas_extras?: ColaboradorHoraExtra[];
  equipamento?: {
    id: string;
    prefix: string;
    model: string;
  } | null;
}

/**
 * Estatísticas de colaboradores
 */
export interface ColaboradorStats {
  total: number;
  equipe_massa: number;
  equipe_administrativa: number;
  ativos: number;
  inativos: number;
  por_funcao: {
    funcao: FuncaoColaborador;
    quantidade: number;
  }[];
}

// ============================================
// CONSTANTS E HELPERS
// ============================================

/**
 * Opções para o select de Tipo de Equipe
 */
export const TIPO_EQUIPE_OPTIONS: SelectOption[] = [
  { value: 'massa', label: 'Equipe de Massa' },
  { value: 'administrativa', label: 'Equipe Administrativa' },
];

/**
 * Opções para funções da Equipe de Massa
 */
export const FUNCOES_EQUIPE_MASSA: SelectOption[] = [
  { value: 'Ajudante', label: 'Ajudante' },
  { value: 'Rasteleiro', label: 'Rasteleiro' },
  { value: 'Operador de Rolo Chapa Chapa', label: 'Operador de Rolo Chapa Chapa' },
  { value: 'Operador de Rolo Pneu Pneu', label: 'Operador de Rolo Pneu Pneu' },
  { value: 'Operador de VibroAcabadora', label: 'Operador de VibroAcabadora' },
  { value: 'Operador de Mesa da VibroAcabadora', label: 'Operador de Mesa da VibroAcabadora' },
  { value: 'Motorista de Caminhão Espargidor', label: 'Motorista de Caminhão Espargidor' },
  { value: 'Mangueirista', label: 'Mangueirista' },
  { value: 'Encarregado', label: 'Encarregado' },
];

/**
 * Opções para funções da Equipe Administrativa
 */
export const FUNCOES_EQUIPE_ADMINISTRATIVA: SelectOption[] = [
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'RH', label: 'RH' },
  { value: 'Programador', label: 'Programador' },
  { value: 'Admin', label: 'Admin' },
];

/**
 * Opções para Tipo de Contrato
 */
export const TIPO_CONTRATO_OPTIONS: SelectOption[] = [
  { value: 'fixo', label: 'Fixo' },
  { value: 'diarista', label: 'Diarista' },
];

/**
 * Opções para Tipo de Documento
 */
export const TIPO_DOCUMENTO_OPTIONS: SelectOption[] = [
  { value: 'CNH', label: 'CNH' },
  { value: 'RG', label: 'RG' },
  { value: 'Comprovante Residência', label: 'Comprovante de Residência' },
  { value: 'Reservista', label: 'Certificado de Reservista' },
  { value: 'Título Eleitor', label: 'Título de Eleitor' },
  { value: 'CTPS', label: 'CTPS' },
  { value: 'PIS', label: 'PIS' },
  { value: 'Outros', label: 'Outros' },
];

/**
 * Opções para Tipo de Dia (Horas Extras)
 */
export const TIPO_DIA_OPTIONS: SelectOption[] = [
  { value: 'segunda-sexta', label: 'Segunda a Sexta' },
  { value: 'sabado', label: 'Sábado' },
];

/**
 * Retorna as opções de função baseado no tipo de equipe
 */
export function getFuncoesOptions(tipoEquipe: TipoEquipe): SelectOption[] {
  return tipoEquipe === 'massa'
    ? FUNCOES_EQUIPE_MASSA
    : FUNCOES_EQUIPE_ADMINISTRATIVA;
}

/**
 * Retorna o label do tipo de equipe
 */
export function getTipoEquipeLabel(tipoEquipe: TipoEquipe): string {
  const option = TIPO_EQUIPE_OPTIONS.find(opt => opt.value === tipoEquipe);
  return option?.label || tipoEquipe;
}

/**
 * Calcula o valor da hora extra
 */
export function calcularHoraExtra(
  salarioFixo: number,
  horas: number,
  tipoDia: TipoDiaHoraExtra
): number {
  const valorDiaria = salarioFixo / 30;
  const valorHoraExtra = tipoDia === 'segunda-sexta' ? valorDiaria / 2 : valorDiaria;
  return horas * valorHoraExtra;
}

/**
 * Valida se a função é compatível com o tipo de equipe
 */
export function validarFuncaoTipoEquipe(
  funcao: FuncaoColaborador,
  tipoEquipe: TipoEquipe
): boolean {
  if (tipoEquipe === 'massa') {
    return FUNCOES_EQUIPE_MASSA.some(opt => opt.value === funcao);
  } else {
    return FUNCOES_EQUIPE_ADMINISTRATIVA.some(opt => opt.value === funcao);
  }
}

/**
 * Mapa de cores para cada função (Tailwind CSS classes)
 * Retorna classes de background e texto para badges
 */
export function getFuncaoColor(funcao: FuncaoColaborador): { bg: string; text: string } {
  const colorMap: Record<FuncaoColaborador, { bg: string; text: string }> = {
    // Equipe de Massa - Tons de Laranja, Amarelo e Marrom
    'Ajudante': { bg: 'bg-amber-100', text: 'text-amber-800' },
    'Rasteleiro': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Operador de Rolo Chapa Chapa': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Operador de Rolo Pneu Pneu': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Operador de VibroAcabadora': { bg: 'bg-red-100', text: 'text-red-800' },
    'Operador de Mesa da VibroAcabadora': { bg: 'bg-pink-100', text: 'text-pink-800' },
    'Motorista de Caminhão Espargidor': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Mangueirista': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
    'Encarregado': { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    
    // Equipe Administrativa - Tons de Roxo, Azul e Verde
    'Financeiro': { bg: 'bg-green-100', text: 'text-green-800' },
    'RH': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'Programador': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Admin': { bg: 'bg-violet-100', text: 'text-violet-800' },
    
    // Funções antigas (compatibilidade)
    'Motorista Operador de Bomba': { bg: 'bg-sky-100', text: 'text-sky-800' },
    'Auxiliar de Bomba': { bg: 'bg-teal-100', text: 'text-teal-800' },
    'Administrador Financeiro': { bg: 'bg-lime-100', text: 'text-lime-800' },
    'Fiscal de Obras': { bg: 'bg-slate-100', text: 'text-slate-800' },
    'Mecânico': { bg: 'bg-zinc-100', text: 'text-zinc-800' },
  };

  return colorMap[funcao] || { bg: 'bg-gray-100', text: 'text-gray-800' };
}

