import { Calendar, Flame } from 'lucide-react'
import type { DiariaRecente } from '../../types/dashboard-pavimentacao'
import { formatCurrency } from '../../utils/format'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UltimasDiariasCardProps {
  diarias: DiariaRecente[]
  loading?: boolean
}

export function UltimasDiariasCard({ diarias, loading }: UltimasDiariasCardProps) {
  const getDataRelativa = (data: string) => {
    const hoje = new Date().toISOString().split('T')[0]
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    if (data === hoje) return 'Hoje'
    if (data === ontem) return 'Ontem'
    
    try {
      return formatDistanceToNow(new Date(data + 'T12:00:00'), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return data
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Últimas Diárias de Guardas</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!diarias || diarias.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Últimas Diárias de Guardas</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma diária de guarda lançada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Últimas Diárias de Guardas</h3>
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {diarias.length}
        </span>
      </div>

      <div className="space-y-2">
        {diarias.map((diaria, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {diaria.colaborador_nome}
                </p>
                {diaria.tem_hora_extra && (
                  <Flame className="w-4 h-4 text-red-500 flex-shrink-0" title="Com hora extra" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{diaria.equipe_nome}</p>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm font-semibold text-green-600">
                {formatCurrency(diaria.valor)}
              </span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {getDataRelativa(diaria.data)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

