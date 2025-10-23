// ============================================================================
// TIPOS DE DESPESAS E FINANCEIRO
// ============================================================================

export type ExpenseCategory = 'Mão de obra' | 'Diesel' | 'Manutenção' | 'Imposto' | 'Outros'
export type ExpenseType = 'fixo' | 'variável'
export type ExpenseStatus = 'pendente' | 'pago' | 'cancelado'
export type TransactionType = 'Entrada' | 'Saída'
export type PaymentMethod = 'cartao' | 'pix' | 'dinheiro' | 'boleto' | 'transferencia'

export interface Expense {
  id: string
  descricao: string
  categoria: ExpenseCategory
  valor: number
  tipo_custo: ExpenseType
  tipo_transacao?: TransactionType
  data_despesa: string
  pump_id: string
  company_id: string
  status: ExpenseStatus
  quilometragem_atual?: number | null
  quantidade_litros?: number | null
  custo_por_litro?: number | null
  payment_method?: string | null
  discount_type?: 'fixed' | 'percentage' | null
  discount_value?: number | null
  fuel_station?: string | null
  nota_fiscal_id?: string | null
  observacoes?: string | null
  relatorio_id?: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseWithRelations extends Expense {
  pumps?: {
    prefix: string
    model: string
    brand: string
  }
  companies?: {
    name: string
  }
  notas_fiscais?: {
    numero_nota: string
  }
  // Campos calculados
  company_name?: string
  nota_numero?: string
}

export interface CreateExpenseData {
  descricao: string
  categoria: ExpenseCategory
  valor: number
  tipo_custo: ExpenseType
  tipo_transacao?: TransactionType
  data_despesa: string
  pump_id: string
  company_id: string
  status?: ExpenseStatus
  quilometragem_atual?: number | null
  quantidade_litros?: number | null
  custo_por_litro?: number | null
  payment_method?: string | null
  discount_type?: 'fixed' | 'percentage' | null
  discount_value?: number | null
  fuel_station?: string | null
  nota_fiscal_id?: string | null
  observacoes?: string | null
  relatorio_id?: string | null
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  id: string
}

export interface ExpenseFilters {
  company_id?: string
  pump_id?: string
  categoria?: ExpenseCategory[]
  tipo_custo?: ExpenseType[]
  tipo_transacao?: TransactionType[]
  status?: ExpenseStatus[]
  data_inicio?: string
  data_fim?: string
  search?: string
  page?: number
  limit?: number
}

export interface FinancialStats {
  total_despesas: number
  total_entradas: number
  saldo: number
  despesas_por_categoria: Record<ExpenseCategory, number>
  despesas_por_tipo: Record<ExpenseType, number>
  despesas_por_empresa: Array<{
    company_id: string
    company_name: string
    total: number
  }>
  total_por_empresa: Record<string, number>
  despesas_por_periodo: Array<{
    periodo: string
    total: number
  }>
  despesas_por_tipo_transacao?: Record<TransactionType, number>
}

export interface PaginatedExpenses {
  expenses: ExpenseWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InvoiceIntegration {
  nota_fiscal_id: string
  numero_nota: string
  valor: number
  data_emissao: string
  relatorio_id?: string
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: 'Mão de obra', label: 'Mão de obra' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Manutenção', label: 'Manutenção' },
  { value: 'Imposto', label: 'Imposto' },
  { value: 'Outros', label: 'Outros' }
]

export const TRANSACTION_TYPE_OPTIONS = [
  { value: 'Entrada', label: 'Entrada' },
  { value: 'Saída', label: 'Saída' }
]

export const EXPENSE_TYPE_OPTIONS = [
  { value: 'fixo', label: 'Fixo' },
  { value: 'variável', label: 'Variável' }
]

export const EXPENSE_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'cancelado', label: 'Cancelado' }
]

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Formata um valor numérico como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Retorna a cor da badge para cada categoria de despesa
 */
export function getCategoryColor(categoria: ExpenseCategory): string {
  const colors: Record<ExpenseCategory, string> = {
    'Mão de obra': 'bg-blue-100 text-blue-800',
    'Diesel': 'bg-yellow-100 text-yellow-800',
    'Manutenção': 'bg-orange-100 text-orange-800',
    'Imposto': 'bg-red-100 text-red-800',
    'Outros': 'bg-gray-100 text-gray-800'
  }
  return colors[categoria] || 'bg-gray-100 text-gray-800'
}

/**
 * Retorna o ícone para cada categoria de despesa
 */
export function getExpenseIcon(categoria: ExpenseCategory): string {
  const icons: Record<ExpenseCategory, string> = {
    'Mão de obra': '👷',
    'Diesel': '⛽',
    'Manutenção': '🔧',
    'Imposto': '📋',
    'Outros': '📦'
  }
  return icons[categoria] || '📦'
}

/**
 * Retorna a cor da badge para cada tipo de transação
 */
export function getTransactionTypeColor(tipo: TransactionType): string {
  const colors: Record<TransactionType, string> = {
    'Entrada': 'bg-green-100 text-green-800',
    'Saída': 'bg-red-100 text-red-800'
  }
  return colors[tipo] || 'bg-gray-100 text-gray-800'
}

/**
 * Retorna o ícone para cada tipo de transação
 */
export function getTransactionTypeIcon(tipo: TransactionType): string {
  const icons: Record<TransactionType, string> = {
    'Entrada': '💰',
    'Saída': '💸'
  }
  return icons[tipo] || '💵'
}

/**
 * Retorna a cor da badge para cada status de despesa
 */
export function getStatusColor(status: ExpenseStatus): string {
  const colors: Record<ExpenseStatus, string> = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'pago': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Retorna o ícone para cada status de despesa
 */
export function getStatusIcon(status: ExpenseStatus): string {
  const icons: Record<ExpenseStatus, string> = {
    'pendente': '⏱️',
    'pago': '✅',
    'cancelado': '❌'
  }
  return icons[status] || '❓'
}

/**
 * Calcula o total de despesas
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.valor, 0)
}

/**
 * Filtra despesas por período
 */
export function filterByPeriod(
  expenses: Expense[], 
  startDate: string, 
  endDate: string
): Expense[] {
  return expenses.filter(expense => {
    const date = new Date(expense.data_despesa)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return date >= start && date <= end
  })
}

/**
 * Agrupa despesas por categoria
 */
export function groupByCategory(expenses: Expense[]): Record<ExpenseCategory, Expense[]> {
  const grouped: Record<string, Expense[]> = {
    'Mão de obra': [],
    'Diesel': [],
    'Manutenção': [],
    'Imposto': [],
    'Outros': []
  }
  
  expenses.forEach(expense => {
    if (!grouped[expense.categoria]) {
      grouped[expense.categoria] = []
    }
    grouped[expense.categoria].push(expense)
  })
  
  return grouped as Record<ExpenseCategory, Expense[]>
}

/**
 * Formata uma data no formato YYYY-MM-DD para dd/mm/yyyy
 */
export function formatDate(date: string): string {
  // Se a data está no formato YYYY-MM-DD, criar diretamente para evitar problemas de fuso horário
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day) // Mês é 0-indexado
    return dateObj.toLocaleDateString('pt-BR')
  }
  
  // Para outros formatos, usar a conversão normal
  return new Date(date).toLocaleDateString('pt-BR')
}

/**
 * Calcula o total do combustível
 */
export function calculateFuelTotal(quantidade_litros: number, custo_por_litro: number): number {
  return quantidade_litros * custo_por_litro
}

// ============================================================================
// INTERFACES ADICIONAIS
// ============================================================================

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }>
}

export interface FinancialReport {
  periodo: {
    inicio: string
    fim: string
  }
  resumo: FinancialStats
  despesas: ExpenseWithRelations[]
  graficos: {
    pizza_categoria: ChartData
    barra_bomba: ChartData
    linha_tempo: ChartData
  }
}

export interface FuelExpenseData {
  quilometragem_atual: number
  quantidade_litros: number
  custo_por_litro: number
  valor_total: number // Calculado automaticamente
}

// Validação de formulário
export const expenseFormSchema = {
  descricao: { required: true, minLength: 3, maxLength: 255 },
  categoria: { required: true },
  valor: { required: true, min: 0.01 },
  tipo_custo: { required: true },
  data_despesa: { required: true },
  company_id: { required: true },
  quilometragem_atual: { min: 0 },
  quantidade_litros: { min: 0 },
  custo_por_litro: { min: 0 }
}

// Interface para paginação
export interface PaginationParams {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Interface para exportação
export interface ExportOptions {
  format: 'excel' | 'pdf'
  filters?: ExpenseFilters
  includeCharts?: boolean
  dateRange?: {
    inicio: string
    fim: string
  }
}

// Interface para alertas de orçamento
export interface BudgetAlert {
  categoria: ExpenseCategory
  limite_mensal: number
  gasto_atual: number
  percentual_utilizado: number
  status: 'ok' | 'alerta' | 'limite_excedido'
}

