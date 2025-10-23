/**
 * Utilitários para Notas Fiscais
 */

import type { NotaFiscalStatus, ObraRua } from '../types/obras-financeiro'

/**
 * Calcula o valor líquido da nota fiscal
 */
export function calcularValorLiquido(
  valorBruto: number,
  descontoInss: number = 0,
  descontoIss: number = 0,
  outroDesconto: number = 0
): number {
  return valorBruto - descontoInss - descontoIss - outroDesconto
}

/**
 * Formata o status da nota fiscal para exibição
 */
export function formatarStatusNota(status: NotaFiscalStatus): {
  label: string
  cor: string
  bgColor: string
} {
  const statusMap = {
    pendente: {
      label: 'Pendente',
      cor: 'text-yellow-800',
      bgColor: 'bg-yellow-100'
    },
    pago: {
      label: 'Pago',
      cor: 'text-green-800',
      bgColor: 'bg-green-100'
    },
    vencido: {
      label: 'Vencido',
      cor: 'text-red-800',
      bgColor: 'bg-red-100'
    },
    renegociado: {
      label: 'Renegociado',
      cor: 'text-blue-800',
      bgColor: 'bg-blue-100'
    }
  }

  return statusMap[status]
}

/**
 * Verifica se uma data de vencimento já passou
 */
export function verificarVencimento(dataVencimento: string): boolean {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)
  
  return vencimento < hoje
}

/**
 * Calcula o faturamento previsto baseado nas ruas planejadas
 */
export function calcularFaturamentoPrevisto(
  ruas: ObraRua[],
  precoPorM2: number
): number {
  return ruas.reduce((total, rua) => {
    if (rua.metragem_planejada) {
      return total + (rua.metragem_planejada * precoPorM2)
    }
    return total
  }, 0)
}

/**
 * Calcula o total de descontos de uma nota fiscal
 */
export function calcularTotalDescontos(
  descontoInss: number = 0,
  descontoIss: number = 0,
  outroDesconto: number = 0
): number {
  return descontoInss + descontoIss + outroDesconto
}

/**
 * Valida se os descontos não ultrapassam o valor bruto
 */
export function validarDescontos(
  valorBruto: number,
  descontoInss: number = 0,
  descontoIss: number = 0,
  outroDesconto: number = 0
): { valido: boolean; mensagem?: string } {
  const totalDescontos = calcularTotalDescontos(descontoInss, descontoIss, outroDesconto)
  
  if (totalDescontos > valorBruto) {
    return {
      valido: false,
      mensagem: 'A soma dos descontos não pode ser maior que o valor bruto da nota'
    }
  }
  
  if (descontoInss < 0 || descontoIss < 0 || outroDesconto < 0) {
    return {
      valido: false,
      mensagem: 'Os valores dos descontos não podem ser negativos'
    }
  }
  
  return { valido: true }
}

/**
 * Formata o número da nota fiscal
 */
export function formatarNumeroNota(numero: string): string {
  return numero.trim().toUpperCase()
}

/**
 * Calcula quantos dias faltam para o vencimento
 */
export function diasParaVencimento(dataVencimento: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const vencimento = new Date(dataVencimento)
  vencimento.setHours(0, 0, 0, 0)
  
  const diffTime = vencimento.getTime() - hoje.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Verifica se a nota vence nos próximos N dias
 */
export function venceProximamente(dataVencimento: string, dias: number = 7): boolean {
  const diasRestantes = diasParaVencimento(dataVencimento)
  return diasRestantes >= 0 && diasRestantes <= dias
}






