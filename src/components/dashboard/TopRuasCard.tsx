import { TrendingUp, Award } from 'lucide-react'
import type { RuaFaturamento } from '../../types/dashboard-pavimentacao'
import { formatCurrency } from '../../utils/format'

interface TopRuasCardProps {
  ruas: RuaFaturamento[]
  loading?: boolean
}

export function TopRuasCard({ ruas, loading }: TopRuasCardProps) {
  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  const getMedalIcon = (position: number) => {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
    return medals[position] || `${position + 1}`
  }

  const getRankColor = (position: number) => {
    if (position === 0) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    if (position === 1) return 'bg-gray-100 border-gray-300 text-gray-800'
    if (position === 2) return 'bg-orange-100 border-orange-300 text-orange-800'
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Ruas por Faturamento</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!ruas || ruas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top 5 Ruas por Faturamento</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma rua finalizada este mês</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Top 5 Ruas por Faturamento</h3>
        <span className="ml-auto text-xs text-gray-500">Este mês</span>
      </div>

      <div className="space-y-2">
        {ruas.map((rua, index) => (
          <div 
            key={index} 
            className={`p-3 border rounded-lg ${getRankColor(index)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              {/* Posição */}
              <div className="text-2xl flex-shrink-0">{getMedalIcon(index)}</div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {rua.rua_nome}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {rua.obra_nome}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(rua.valor_total)}
                    </p>
                  </div>
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                  <span>{formatNumber(rua.metragem, 1)} m²</span>
                  <span>•</span>
                  <span className="font-medium">
                    {formatCurrency(rua.valor_por_m2)}/m²
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

