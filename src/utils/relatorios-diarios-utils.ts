/**
 * Calcula a espessura baseada em metragem e toneladas
 * Fórmula: espessura (cm) = (toneladas / metragem / 2,4) * 100
 * Densidade do asfalto: 2,4 ton/m³
 * Média padrão: 3,5 cm
 */
export function calcularEspessura(metragem: number, toneladas: number): number {
  if (metragem <= 0) return 0
  const DENSIDADE = 2.4
  // Retorna em centímetros
  return (toneladas / metragem / DENSIDADE) * 100
}

/**
 * Gera número único para relatório diário
 * Formato: RD-YYYY-NNN
 */
export function gerarNumeroRelatorio(ano: number, sequencia: number): string {
  const seq = String(sequencia).padStart(3, '0')
  return `RD-${ano}-${seq}`
}

/**
 * Formata horário para exibição
 */
export function formatarHorario(horario: string): string {
  // Se já está no formato HH:MM, retorna
  if (/^\d{2}:\d{2}$/.test(horario)) {
    return horario
  }
  
  // Se está no formato HH:MM:SS, remove os segundos
  if (/^\d{2}:\d{2}:\d{2}$/.test(horario)) {
    return horario.substring(0, 5)
  }
  
  return horario
}

/**
 * Valida se a data não é futura
 */
export function validarDataNaoFutura(data: string): boolean {
  const dataFornecida = new Date(data + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  return dataFornecida <= hoje
}

/**
 * Formata valor de diária
 */
export function formatarDiaria(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Calcula total de diárias para múltiplos itens
 */
export function calcularTotalDiarias(itens: { valor_diaria?: number }[]): number {
  return itens.reduce((total, item) => total + (item.valor_diaria || 0), 0)
}

/**
 * Agrupa maquinários por tipo (próprios e terceiros)
 */
export function agruparMaquinariosPorTipo(
  maquinarios: { is_terceiro: boolean; [key: string]: any }[]
) {
  const proprios = maquinarios.filter(m => !m.is_terceiro)
  const terceiros = maquinarios.filter(m => m.is_terceiro)
  
  return { proprios, terceiros }
}

/**
 * Valida espessura dentro do range aceitável (2-8 cm)
 */
export function validarEspessura(espessura: number): {
  valida: boolean
  mensagem?: string
} {
  if (espessura < 2) {
    return {
      valida: false,
      mensagem: 'Espessura muito baixa (< 2 cm). Verifique os valores.'
    }
  }
  
  if (espessura > 8) {
    return {
      valida: false,
      mensagem: 'Espessura muito alta (> 8 cm). Verifique os valores.'
    }
  }
  
  return { valida: true }
}

