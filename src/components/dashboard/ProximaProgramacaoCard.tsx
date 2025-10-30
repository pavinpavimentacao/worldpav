import { Clock, MapPin, Building2, User, Calendar, Ruler, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ProximaProgramacao } from '../../types/dashboard-pavimentacao'

interface ProximaProgramacaoCardProps {
  programacao: ProximaProgramacao | null
  loading?: boolean
}

export function ProximaProgramacaoCard({ programacao, loading }: ProximaProgramacaoCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!programacao) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center flex-col">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Nenhuma programação futura</p>
          <p className="text-sm text-gray-500 mt-1">Todas as pavimentações foram concluídas</p>
        </div>
      </div>
    )
  }

  // Definir status baseado no tempo restante
  const getStatusInfo = () => {
    if (programacao.minutos_restantes < 60) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'Urgente'
      }
    }
    if (programacao.minutos_restantes < 240) {
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'Em Breve'
      }
    }
    return {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'Programado'
    }
  }

  const status = getStatusInfo()

  // Formatar data por extenso
  const dataFormatada = format(new Date(programacao.data), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Próxima Pavimentação</h3>
              <p className="text-2xl font-bold text-blue-800 mt-1">{programacao.tempo_restante}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className={`${status.bg} ${status.border} px-3 py-1.5 rounded-lg text-xs font-semibold ${status.color} border`}>
              {status.text}
            </div>
            <div className="text-sm font-medium text-gray-600">
              {programacao.horario}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {/* Data */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600 font-medium">{dataCapitalizada}</span>
        </div>

        {/* Localização */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">Localização</p>
            <p className="text-sm text-gray-900 font-medium">
              {programacao.endereco_completo}
            </p>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cliente */}
          {programacao.cliente_nome && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-500">Cliente</span>
              </div>
              <p className="text-sm text-gray-900 font-medium truncate">{programacao.cliente_nome}</p>
            </div>
          )}

          {/* Obra */}
          {programacao.obra_nome && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-500">Obra</span>
              </div>
              <p className="text-sm text-gray-900 font-medium truncate">{programacao.obra_nome}</p>
            </div>
          )}

          {/* Metragem */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-gray-500">Metragem</span>
            </div>
            <p className="text-sm text-gray-900 font-medium">180 m²</p>
          </div>

          {/* Espessura Solicitada */}
          {programacao.espessura_media_solicitada && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs text-gray-500">Espessura</span>
              </div>
              <p className="text-sm text-orange-600 font-medium">{programacao.espessura_media_solicitada} cm</p>
            </div>
          )}

          {/* Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs text-gray-500">Status</span>
            </div>
            <p className="text-sm text-orange-600 font-medium">Confirmado</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span>Duração estimada:</span>
            <span className="font-medium text-gray-900">4-6h</span>
          </div>
          <div className="flex items-center gap-1 text-orange-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="font-medium">Em dia</span>
          </div>
        </div>
      </div>
    </div>
  )
}

