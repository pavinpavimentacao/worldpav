/**
 * Utilitários para cálculo e exibição de status de documentos
 */

import { StatusDocumento } from '../types/colaboradores';
import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Calcula o status de um documento baseado na data de validade
 */
export function calcularStatusDocumento(dataValidade: string | null | undefined): StatusDocumento {
  if (!dataValidade) {
    return 'valido';
  }

  try {
    const dataValidadeDate = parseISO(dataValidade);
    
    if (!isValid(dataValidadeDate)) {
      return 'valido';
    }

    const hoje = new Date();
    const diasRestantes = differenceInDays(dataValidadeDate, hoje);

    if (diasRestantes < 0) {
      return 'vencido';
    } else if (diasRestantes <= 30) {
      return 'vence_em_30_dias';
    } else {
      return 'valido';
    }
  } catch (error) {
    console.error('Erro ao calcular status do documento:', error);
    return 'valido';
  }
}

/**
 * Retorna os dias restantes até o vencimento
 */
export function getDiasParaVencimento(dataValidade: string | null | undefined): number | null {
  if (!dataValidade) {
    return null;
  }

  try {
    const dataValidadeDate = parseISO(dataValidade);
    
    if (!isValid(dataValidadeDate)) {
      return null;
    }

    const hoje = new Date();
    return differenceInDays(dataValidadeDate, hoje);
  } catch (error) {
    console.error('Erro ao calcular dias para vencimento:', error);
    return null;
  }
}

/**
 * Retorna o ícone apropriado para o status
 */
export function getIconeStatus(status: StatusDocumento): string {
  switch (status) {
    case 'valido':
      return '✓';
    case 'vence_em_30_dias':
      return '⚠';
    case 'vencido':
      return '✗';
    default:
      return '?';
  }
}

/**
 * Retorna as classes Tailwind para o status
 */
export function getCorStatus(status: StatusDocumento): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (status) {
    case 'valido':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600',
      };
    case 'vence_em_30_dias':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
      };
    case 'vencido':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: 'text-red-600',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: 'text-gray-600',
      };
  }
}

/**
 * Retorna o texto descritivo do status
 */
export function getTextoStatus(status: StatusDocumento): string {
  switch (status) {
    case 'valido':
      return 'Válido';
    case 'vence_em_30_dias':
      return 'Vence em breve';
    case 'vencido':
      return 'Vencido';
    default:
      return 'Desconhecido';
  }
}

/**
 * Retorna mensagem detalhada sobre o status do documento
 */
export function getMensagemStatus(
  dataValidade: string | null | undefined,
  status: StatusDocumento
): string {
  if (!dataValidade) {
    return 'Sem data de validade definida';
  }

  const dias = getDiasParaVencimento(dataValidade);

  if (dias === null) {
    return 'Data de validade inválida';
  }

  if (dias < 0) {
    const diasVencido = Math.abs(dias);
    return `Vencido há ${diasVencido} dia${diasVencido !== 1 ? 's' : ''}`;
  } else if (dias === 0) {
    return 'Vence hoje';
  } else if (dias === 1) {
    return 'Vence amanhã';
  } else if (dias <= 30) {
    return `Vence em ${dias} dias`;
  } else {
    return `Válido por mais ${dias} dias`;
  }
}

/**
 * Valida se um arquivo é do tipo permitido
 */
export function validarTipoArquivo(arquivo: File): boolean {
  const tiposPermitidos = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/zip',
    'application/x-zip-compressed',
  ];

  return tiposPermitidos.includes(arquivo.type);
}

/**
 * Valida se o arquivo está dentro do tamanho permitido (10MB)
 */
export function validarTamanhoArquivo(arquivo: File): boolean {
  const tamanhoMaximo = 10 * 1024 * 1024; // 10MB em bytes
  return arquivo.size <= tamanhoMaximo;
}

/**
 * Formata o tamanho do arquivo para exibição
 */
export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Retorna o ícone apropriado para o tipo de arquivo
 */
export function getIconeArquivo(nomeArquivo: string): string {
  const extensao = nomeArquivo.split('.').pop()?.toLowerCase();

  switch (extensao) {
    case 'pdf':
      return '📄';
    case 'png':
    case 'jpg':
    case 'jpeg':
      return '🖼️';
    case 'zip':
      return '📦';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    default:
      return '📎';
  }
}

/**
 * Valida formato de CNH (11 dígitos)
 */
export function validarCNH(cnh: string): boolean {
  const cnhLimpa = cnh.replace(/\D/g, '');
  return cnhLimpa.length === 11;
}

/**
 * Formata CNH para exibição
 */
export function formatarCNH(cnh: string): string {
  const cnhLimpa = cnh.replace(/\D/g, '');
  if (cnhLimpa.length !== 11) return cnh;
  
  return cnhLimpa.replace(/(\d{11})/, '$1');
}



