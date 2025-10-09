/**
 * Utilitários para cálculos de diesel e consumo de maquinários
 */

import type { MaquinarioDiesel, DieselStats } from '../types/maquinarios-diesel'

/**
 * Calcula o valor total de um abastecimento
 * 
 * @param litros - Quantidade de litros
 * @param precoPorLitro - Preço por litro
 * @returns Valor total em reais
 */
export function calcularValorAbastecimento(litros: number, precoPorLitro: number): number {
  return litros * precoPorLitro
}

/**
 * Calcula estatísticas de consumo de diesel
 * 
 * @param abastecimentos - Lista de abastecimentos
 * @returns Estatísticas consolidadas
 */
export function calcularConsumoMedio(abastecimentos: MaquinarioDiesel[]): DieselStats {
  if (abastecimentos.length === 0) {
    return {
      total_litros: 0,
      total_gasto: 0,
      media_preco_litro: 0,
      consumo_medio: 0,
      abastecimentos_count: 0
    }
  }

  const total_litros = abastecimentos.reduce((sum, a) => sum + a.quantidade_litros, 0)
  const total_gasto = abastecimentos.reduce((sum, a) => sum + a.valor_total, 0)
  const media_preco_litro = total_gasto / total_litros

  // Calcular consumo médio baseado em KM (se disponível)
  const abastecimentosComKm = abastecimentos
    .filter(a => a.km_hodometro !== undefined && a.km_hodometro !== null)
    .sort((a, b) => (a.km_hodometro || 0) - (b.km_hodometro || 0))

  let consumo_medio: number | undefined

  if (abastecimentosComKm.length >= 2) {
    const kmInicial = abastecimentosComKm[0].km_hodometro || 0
    const kmFinal = abastecimentosComKm[abastecimentosComKm.length - 1].km_hodometro || 0
    const kmPercorridos = kmFinal - kmInicial
    
    if (kmPercorridos > 0) {
      // Consumo em km/litro
      consumo_medio = kmPercorridos / total_litros
    }
  }

  return {
    total_litros,
    total_gasto,
    media_preco_litro,
    consumo_medio,
    abastecimentos_count: abastecimentos.length
  }
}

/**
 * Formata consumo para exibição
 * 
 * @param valor - Valor do consumo
 * @param unidade - Unidade (km/l, l/h, etc)
 * @returns String formatada
 */
export function formatarConsumo(valor: number, unidade: string = 'km/l'): string {
  return `${valor.toFixed(2)} ${unidade}`
}

/**
 * Formata litros para exibição
 */
export function formatarLitros(litros: number): string {
  return `${litros.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L`
}

/**
 * Formata preço por litro para exibição
 */
export function formatarPrecoPorLitro(preco: number): string {
  return `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/L`
}

/**
 * Valida dados de abastecimento
 */
export function validarAbastecimento(data: {
  quantidade_litros: number
  preco_por_litro: number
  data_abastecimento: string
  posto?: string
}): { valido: boolean; erro?: string } {
  if (data.quantidade_litros <= 0) {
    return { valido: false, erro: 'Quantidade de litros deve ser maior que zero' }
  }

  if (data.preco_por_litro <= 0) {
    return { valido: false, erro: 'Preço por litro deve ser maior que zero' }
  }

  if (!data.data_abastecimento) {
    return { valido: false, erro: 'Data do abastecimento é obrigatória' }
  }

  return { valido: true }
}

/**
 * Calcula a diferença entre dois abastecimentos (para análise de consumo)
 */
export function calcularDiferencaAbastecimentos(
  atual: MaquinarioDiesel,
  anterior: MaquinarioDiesel
): {
  dias: number
  litros: number
  km?: number
  consumo?: number
} | null {
  const dataAtual = new Date(atual.data_abastecimento)
  const dataAnterior = new Date(anterior.data_abastecimento)
  
  const dias = Math.floor((dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24))
  const litros = atual.quantidade_litros

  if (atual.km_hodometro !== undefined && anterior.km_hodometro !== undefined) {
    const km = atual.km_hodometro - anterior.km_hodometro
    const consumo = km > 0 ? km / litros : undefined
    
    return { dias, litros, km, consumo }
  }

  return { dias, litros }
}

/**
 * Agrupa abastecimentos por período (mês)
 */
export function agruparAbastecimentosPorMes(
  abastecimentos: MaquinarioDiesel[]
): Record<string, MaquinarioDiesel[]> {
  return abastecimentos.reduce((acc, abastecimento) => {
    const data = new Date(abastecimento.data_abastecimento)
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[mesAno]) {
      acc[mesAno] = []
    }
    acc[mesAno].push(abastecimento)
    
    return acc
  }, {} as Record<string, MaquinarioDiesel[]>)
}

/**
 * Calcula total de diesel por obra
 */
export function calcularDieselPorObra(
  abastecimentos: MaquinarioDiesel[]
): Record<string, { litros: number; valor: number }> {
  return abastecimentos
    .filter(a => a.obra_id)
    .reduce((acc, a) => {
      const obraId = a.obra_id!
      if (!acc[obraId]) {
        acc[obraId] = { litros: 0, valor: 0 }
      }
      acc[obraId].litros += a.quantidade_litros
      acc[obraId].valor += a.valor_total
      return acc
    }, {} as Record<string, { litros: number; valor: number }>)
}

