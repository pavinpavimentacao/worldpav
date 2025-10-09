import { Clock, MapPin, Building2, User } from 'lucide-react'
import type { ProgramacaoItem } from '../../types/dashboard-pavimentacao'

interface ProgramacaoListItemProps {
  programacao: ProgramacaoItem
  variant?: 'default' | 'compact'
}

export function ProgramacaoListItem({ programacao, variant = 'default' }: ProgramacaoListItemProps) {
  const endereco = [
    programacao.endereco,
    programacao.numero,
    programacao.bairro
  ].filter(Boolean).join(', ')

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{endereco}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {programacao.horario}
              </span>
              {programacao.cliente_nome && (
                <span className="truncate">{programacao.cliente_nome}</span>
              )}
            </div>
          </div>
        </div>
        {programacao.metragem_planejada && (
          <div className="flex-shrink-0 ml-2">
            <span className="text-xs font-medium text-gray-700">
              {programacao.metragem_planejada} m²
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">{programacao.horario}</span>
        </div>
        {programacao.metragem_planejada && (
          <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
            {programacao.metragem_planejada} m²
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-900">{endereco}</span>
        </div>

        {programacao.obra_nome && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{programacao.obra_nome}</span>
          </div>
        )}

        {programacao.cliente_nome && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{programacao.cliente_nome}</span>
          </div>
        )}
      </div>
    </div>
  )
}

