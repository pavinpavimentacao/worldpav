/**
 * Utilitários para cálculos financeiros de obras
 */

import type { 
  ObraFaturamento, 
  ObraDespesa, 
  ObraResumoFinanceiro,
  RuaStatus,
  FaturamentoStatus 
} from '../types/obras-financeiro'

/**
 * Densidade do asfalto usada nos cálculos de espessura
 */
export const DENSIDADE_ASFALTO = 2.4

/**
 * Calcula a espessura da camada de asfalto
 * Fórmula: toneladas / metragem / densidade
 * 
 * @param toneladas - Quantidade de toneladas utilizadas
 * @param metragem - Área em metros quadrados
 * @returns Espessura em centímetros
 */
export function calcularEspessura(toneladas: number, metragem: number): number {
  if (metragem <= 0) return 0
  return toneladas / metragem / DENSIDADE_ASFALTO
}

/**
 * Calcula o valor total do faturamento de uma rua
 * 
 * @param metragem - Área executada em m²
 * @param precoPorM2 - Preço por metro quadrado
 * @returns Valor total em reais
 */
export function calcularFaturamentoRua(metragem: number, precoPorM2: number): number {
  return metragem * precoPorM2
}

/**
 * Calcula o resumo financeiro de uma obra
 * 
 * @param faturamentos - Lista de faturamentos da obra
 * @param despesas - Lista de despesas da obra
 * @returns Resumo com totais e distribuição
 */
export function calcularResumoFinanceiro(
  faturamentos: ObraFaturamento[],
  despesas: ObraDespesa[]
): ObraResumoFinanceiro {
  const total_faturado = faturamentos
    .filter(f => f.status === 'pago')
    .reduce((sum, f) => sum + f.valor_total, 0)

  const total_pendente = faturamentos
    .filter(f => f.status === 'pendente')
    .reduce((sum, f) => sum + f.valor_total, 0)

  const total_despesas = despesas.reduce((sum, d) => sum + d.valor, 0)

  const despesas_por_categoria = despesas.reduce((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + d.valor
    return acc
  }, {} as Record<string, number>)

  const lucro_liquido = total_faturado - total_despesas

  return {
    total_faturado,
    total_pendente,
    total_despesas,
    lucro_liquido,
    despesas_por_categoria
  }
}

/**
 * Formata o status do faturamento para exibição
 */
export function formatarStatusFaturamento(status: FaturamentoStatus): {
  label: string
  className: string
} {
  const statusMap = {
    pendente: {
      label: 'Pendente',
      className: 'bg-yellow-100 text-yellow-800'
    },
    pago: {
      label: 'Pago',
      className: 'bg-green-100 text-green-800'
    }
  }
  return statusMap[status]
}

/**
 * Formata o status da rua para exibição
 */
export function formatarStatusRua(status: RuaStatus): {
  label: string
  className: string
} {
  const statusMap = {
    pendente: {
      label: 'Pendente',
      className: 'bg-gray-100 text-gray-800'
    },
    em_andamento: {
      label: 'Em Andamento',
      className: 'bg-blue-100 text-blue-800'
    },
    finalizada: {
      label: 'Finalizada',
      className: 'bg-green-100 text-green-800'
    }
  }
  return statusMap[status]
}

/**
 * Valida os dados antes de finalizar uma rua
 */
export function validarFinalizacaoRua(data: {
  metragem_executada: number
  toneladas_utilizadas: number
  preco_por_m2: number
}): { valido: boolean; erro?: string } {
  if (data.metragem_executada <= 0) {
    return { valido: false, erro: 'Metragem executada deve ser maior que zero' }
  }

  if (data.toneladas_utilizadas <= 0) {
    return { valido: false, erro: 'Toneladas utilizadas devem ser maior que zero' }
  }

  if (data.preco_por_m2 <= 0) {
    return { valido: false, erro: 'Preço por m² deve ser maior que zero' }
  }

  return { valido: true }
}

/**
 * Retorna o primeiro e último dia do mês civil
 * 
 * @param data - Data de referência
 * @returns Objeto com início e fim do mês
 */
export function getMesCivil(data: Date = new Date()): {
  inicio: Date
  fim: Date
} {
  const inicio = new Date(data.getFullYear(), data.getMonth(), 1)
  const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59)
  
  return { inicio, fim }
}

/**
 * Agrupa itens por mês civil (01-31)
 * 
 * @param items - Lista de itens com data
 * @param campoData - Nome do campo que contém a data
 * @returns Objeto agrupado por mês (YYYY-MM)
 */
export function agruparPorMesCivil<T extends Record<string, any>>(
  items: T[],
  campoData: keyof T
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const data = new Date(item[campoData] as string)
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
    
    if (!acc[mesAno]) {
      acc[mesAno] = []
    }
    acc[mesAno].push(item)
    
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Formata valor de categoria de despesa
 */
export function formatarCategoriaDespesa(categoria: string): string {
  const categoriaMap: Record<string, string> = {
    diesel: 'Diesel',
    materiais: 'Materiais',
    manutencao: 'Manutenção',
    outros: 'Outros'
  }
  return categoriaMap[categoria] || categoria
}

/**
 * Valida os dados de uma despesa
 */
export function validarDespesa(data: {
  descricao: string
  valor: number
  data_despesa: string
}): { valido: boolean; erro?: string } {
  if (!data.descricao || data.descricao.trim().length === 0) {
    return { valido: false, erro: 'Descrição é obrigatória' }
  }

  if (data.valor <= 0) {
    return { valido: false, erro: 'Valor deve ser maior que zero' }
  }

  if (!data.data_despesa) {
    return { valido: false, erro: 'Data da despesa é obrigatória' }
  }

  return { valido: true }
}

/**
 * Formata espessura para exibição
 */
export function formatarEspessura(espessura: number): string {
  return `${espessura.toFixed(2)} cm`
}

/**
 * Formata metragem para exibição
 */
export function formatarMetragem(metragem: number): string {
  return `${metragem.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²`
}

/**
 * Formata toneladas para exibição
 */
export function formatarToneladas(toneladas: number): string {
  return `${toneladas.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} t`
}


