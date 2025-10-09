/**
 * Utilitários para cálculos de obras de pavimentação
 * 
 * Baseado nas regras de negócio da empresa:
 * - 1.000 m² = 100 toneladas (divisão por 10)
 * - Espessura média base: 3,5 cm
 */

/**
 * Espessura média base padrão (em centímetros)
 * Base de cálculo para estimativas iniciais
 */
export const ESPESSURA_MEDIA_BASE = 3.5

/**
 * Fator de conversão de metragem para toneladas
 * 1000 m² = 100 toneladas → fator = 10
 */
export const FATOR_CONVERSAO_M2_TONELADAS = 10

/**
 * Calcula a quantidade de toneladas previstas com base na metragem
 * 
 * Regra: Toneladas = Metragem ÷ 10
 * 
 * @param metragem - Área em metros quadrados (m²)
 * @returns Quantidade de toneladas estimada
 * 
 * @example
 * calcularToneladasPrevistas(1000) // retorna 100
 * calcularToneladasPrevistas(5000) // retorna 500
 * calcularToneladasPrevistas(3250) // retorna 325
 */
export function calcularToneladasPrevistas(metragem: number): number {
  if (metragem <= 0) return 0
  return metragem / FATOR_CONVERSAO_M2_TONELADAS
}

/**
 * Calcula a metragem necessária com base nas toneladas
 * 
 * Regra inversa: Metragem = Toneladas × 10
 * 
 * @param toneladas - Quantidade de toneladas
 * @returns Área em metros quadrados (m²)
 * 
 * @example
 * calcularMetragemPorToneladas(100) // retorna 1000
 * calcularMetragemPorToneladas(500) // retorna 5000
 */
export function calcularMetragemPorToneladas(toneladas: number): number {
  if (toneladas <= 0) return 0
  return toneladas * FATOR_CONVERSAO_M2_TONELADAS
}

/**
 * Calcula o percentual de progresso com base na metragem
 * 
 * @param metragemFeita - Metragem já executada (m²)
 * @param metragemPlanejada - Metragem planejada total (m²)
 * @returns Percentual de progresso (0-100)
 * 
 * @example
 * calcularProgressoPorMetragem(3250, 5000) // retorna 65
 * calcularProgressoPorMetragem(1800, 1800) // retorna 100
 */
export function calcularProgressoPorMetragem(
  metragemFeita: number,
  metragemPlanejada: number
): number {
  if (metragemPlanejada <= 0) return 0
  const progresso = (metragemFeita / metragemPlanejada) * 100
  return Math.min(100, Math.max(0, progresso)) // Limita entre 0 e 100
}

/**
 * Calcula o percentual de progresso com base nas toneladas
 * 
 * @param toneladasAplicadas - Toneladas já aplicadas
 * @param toneladasPlanejadas - Toneladas planejadas total
 * @returns Percentual de progresso (0-100)
 */
export function calcularProgressoPorToneladas(
  toneladasAplicadas: number,
  toneladasPlanejadas: number
): number {
  if (toneladasPlanejadas <= 0) return 0
  const progresso = (toneladasAplicadas / toneladasPlanejadas) * 100
  return Math.min(100, Math.max(0, progresso))
}

/**
 * Calcula o percentual de progresso com base no número de ruas
 * 
 * @param ruasFeitas - Número de ruas concluídas
 * @param totalRuas - Total de ruas planejadas
 * @returns Percentual de progresso (0-100)
 */
export function calcularProgressoPorRuas(
  ruasFeitas: number,
  totalRuas: number
): number {
  if (totalRuas <= 0) return 0
  const progresso = (ruasFeitas / totalRuas) * 100
  return Math.min(100, Math.max(0, progresso))
}

/**
 * Valida se os valores de metragem e toneladas estão consistentes
 * 
 * @param metragem - Área em m²
 * @param toneladas - Quantidade de toneladas
 * @returns true se os valores são consistentes com a regra (margem de 5%)
 */
export function validarRelacaoMetragemToneladas(
  metragem: number,
  toneladas: number
): boolean {
  const toneladasEsperadas = calcularToneladasPrevistas(metragem)
  const diferenca = Math.abs(toneladas - toneladasEsperadas)
  const margemErro = toneladasEsperadas * 0.05 // 5% de margem
  return diferenca <= margemErro
}

/**
 * Formata valores de metragem para exibição
 * 
 * @param metragem - Área em m²
 * @returns String formatada (ex: "5.000 m²")
 */
export function formatarMetragem(metragem: number): string {
  return `${metragem.toLocaleString('pt-BR')} m²`
}

/**
 * Formata valores de toneladas para exibição
 * 
 * @param toneladas - Quantidade de toneladas
 * @param decimais - Número de casas decimais (padrão: 1)
 * @returns String formatada (ex: "325,5 t")
 */
export function formatarToneladas(toneladas: number, decimais: number = 1): string {
  return `${toneladas.toLocaleString('pt-BR', { 
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais 
  })} t`
}

/**
 * Formata valores de espessura para exibição
 * 
 * @param espessura - Espessura em cm
 * @param decimais - Número de casas decimais (padrão: 1)
 * @returns String formatada (ex: "3,5 cm")
 */
export function formatarEspessura(espessura: number, decimais: number = 1): string {
  return `${espessura.toLocaleString('pt-BR', { 
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais 
  })} cm`
}

/**
 * Tipo auxiliar para dados de obra
 */
export interface MetricasObra {
  metragemFeita: number
  metragemPlanejada: number
  toneladasAplicadas: number
  toneladasPlanejadas: number
  espessuraMedia: number
  ruasFeitas: number
  totalRuas: number
}

/**
 * Calcula todas as métricas de progresso de uma obra
 * 
 * @param metricas - Dados da obra
 * @returns Objeto com todos os percentuais de progresso
 */
export function calcularMetricasProgresso(metricas: MetricasObra) {
  return {
    progressoMetragem: calcularProgressoPorMetragem(
      metricas.metragemFeita,
      metricas.metragemPlanejada
    ),
    progressoToneladas: calcularProgressoPorToneladas(
      metricas.toneladasAplicadas,
      metricas.toneladasPlanejadas
    ),
    progressoRuas: calcularProgressoPorRuas(
      metricas.ruasFeitas,
      metricas.totalRuas
    )
  }
}


