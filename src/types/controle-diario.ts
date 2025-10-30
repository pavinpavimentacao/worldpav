/**
 * Types: Controle Diário
 * Sistema de controle diário de colaboradores
 */

import { TipoEquipe } from './colaboradores';

// Status de presença
export type StatusPresenca = 'presente' | 'falta' | 'atestado' | 'mudanca_equipe';

export interface StatusPresencaInfo {
  label: string;
  color: string;
  bgColor: string;
}

export function getStatusPresencaInfo(status: StatusPresenca): StatusPresencaInfo {
  switch (status) {
    case 'presente':
      return { label: 'Presente', color: 'text-green-800', bgColor: 'bg-green-100' };
    case 'falta':
      return { label: 'Falta', color: 'text-red-800', bgColor: 'bg-red-100' };
    case 'atestado':
      return { label: 'Atestado Médico', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    case 'mudanca_equipe':
      return { label: 'Mudança de Equipe', color: 'text-orange-800', bgColor: 'bg-orange-100' };
    default:
      return { label: 'Desconhecido', color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
}

// Registro de Presença na Relação Diária
export interface RegistroPresencaRelacao {
  id: string;
  relacao_diaria_id: string;
  colaborador_id: string;
  colaborador_nome?: string;
  colaborador_funcao?: string;
  status: StatusPresenca;
  equipe_destino_id?: string; // Se mudou de equipe
  equipe_destino_nome?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// Relação Diária (Registro do dia)
export interface RelacaoDiaria {
  id: string;
  data: string; // YYYY-MM-DD
  equipe_id: string;
  equipe_nome?: string;
  equipe_tipo?: TipoEquipe;
  total_presentes: number;
  total_ausencias: number;
  observacoes_dia?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Relação Diária Completa (com registros de presença)
export interface RelacaoDiariaCompleta extends RelacaoDiaria {
  registros: RegistroPresencaRelacao[];
}

// Registro de Diária (pagamento)
export interface RegistroDiaria {
  id: string;
  colaborador_id: string;
  colaborador_nome?: string;
  colaborador_funcao?: string;
  quantidade: number; // Quantidade de diárias
  valor_unitario: number; // Valor por diária
  adicional: number; // Valor adicional
  desconto: number; // Desconto
  valor_total: number; // Total a pagar
  data_diaria: string; // Data em que a diária foi realizada
  data_pagamento?: string; // Data prevista/realizada do pagamento
  status_pagamento: 'pendente' | 'pago' | 'cancelado';
  observacoes?: string;
  relacao_diaria_id?: string; // Referência à relação diária
  created_at: string;
  updated_at: string;
}

// Resumo de Diárias por Colaborador
export interface ResumoDiariasColaborador {
  colaborador_id: string;
  colaborador_nome: string;
  colaborador_funcao: string;
  total_diarias: number;
  valor_total: number;
  diarias_pendentes: number;
  diarias_pagas: number;
  ultimo_pagamento?: string;
}

// Dados para criar Relação Diária
export interface CreateRelacaoDiariaData {
  data: string;
  equipe_id: string;
  colaboradores_presentes: string[]; // IDs dos colaboradores presentes
  ausencias: {
    colaborador_id: string;
    status: StatusPresenca;
    equipe_destino_id?: string;
    observacoes?: string;
  }[];
  observacoes_dia?: string;
}

// Dados para criar Registro de Diária
export interface CreateRegistroDiariaData {
  colaborador_id: string;
  quantidade: number;
  valor_unitario: number;
  adicional?: number;
  desconto?: number;
  data_diaria: string;
  data_pagamento?: string;
  observacoes?: string;
  relacao_diaria_id?: string;
  status_pagamento?: 'pendente' | 'pago' | 'cancelado';
}

// Estatísticas do Controle Diário
export interface EstatisticasControleDiario {
  totalRelacoes: number;
  totalPresencas: number;
  totalAusencias: number;
  totalFaltas: number;
  totalAtestados: number;
  totalMudancas: number;
  totalDiarias: number;
  valorTotalDiarias: number;
  diariasPendentes: number;
  valorPendente: number;
}

// Helper para calcular valor total da diária
export function calcularValorTotalDiaria(
  quantidade: number,
  valorUnitario: number,
  adicional: number = 0,
  desconto: number = 0
): number {
  return (quantidade * valorUnitario) + adicional - desconto;
}

// Helper para formatar valor em reais
export function formatarValor(valor: number | undefined | null): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


