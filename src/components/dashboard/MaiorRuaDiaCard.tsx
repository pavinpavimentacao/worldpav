import { Trophy, MapPin, Ruler, Weight, DollarSign } from 'lucide-react'
import type { MaiorRuaDia } from '../../types/dashboard-pavimentacao'
import { formatCurrency } from '../../utils/format'

interface MaiorRuaDiaCardProps {
  data: MaiorRuaDia | null
  loading?: boolean
}

export function MaiorRuaDiaCard({ data, loading }: MaiorRuaDiaCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-yellow-200 rounded w-1/3"></div>
          <div className="h-8 bg-yellow-200 rounded w-2/3"></div>
          <div className="flex gap-4">
            <div className="h-6 bg-yellow-200 rounded w-24"></div>
            <div className="h-6 bg-yellow-200 rounded w-24"></div>
            <div className="h-6 bg-yellow-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma rua finalizada hoje</p>
        </div>
      </div>
    )
  }

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 shadow-lg relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-0 right-0 opacity-10">
        <Trophy className="w-32 h-32 text-yellow-600" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-bold text-gray-900">🏆 Destaque do Dia</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xl font-bold text-gray-900">{data.rua_nome}</p>
              <p className="text-sm text-gray-600">{data.obra_nome}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
              <Ruler className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(data.metragem, 1)} m²
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
              <Weight className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(data.toneladas, 2)} ton
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {formatCurrency(data.valor)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

