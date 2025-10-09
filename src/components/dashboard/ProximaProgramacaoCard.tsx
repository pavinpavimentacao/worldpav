import { Clock, MapPin, Building2, User, Calendar, Ruler, TrendingUp, CheckCircle2 } from 'lucide-react'
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
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-32 mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-48 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!programacao) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl border border-slate-700 p-6">
        <div className="flex items-center justify-center flex-col py-8">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-white">Nenhuma programação futura</p>
          <p className="text-sm text-slate-400 mt-1">Todas as pavimentações foram concluídas</p>
        </div>
      </div>
    )
  }

  // Definir badge de urgência baseado no tempo restante
  const getUrgencyBadge = () => {
    if (programacao.minutos_restantes < 60) {
      return {
        bg: 'bg-red-500',
        text: 'Urgente',
        pulse: true
      }
    }
    if (programacao.minutos_restantes < 240) {
      return {
        bg: 'bg-amber-500',
        text: 'Em Breve',
        pulse: false
      }
    }
    return {
      bg: 'bg-blue-500',
      text: 'Programado',
      pulse: false
    }
  }

  const urgency = getUrgencyBadge()

  // Formatar data por extenso
  const dataFormatada = format(new Date(programacao.data), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-xl shadow-xl border border-slate-700 overflow-hidden">
      {/* Header com gradiente */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-100 uppercase tracking-wider truncate">Próxima Pavimentação</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-0.5">{programacao.tempo_restante}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 md:gap-2 flex-shrink-0">
            <div className={`${urgency.bg} ${urgency.pulse ? 'animate-pulse' : ''} px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-white text-xs font-bold shadow-lg`}>
              {urgency.text}
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-white text-sm font-semibold">
              {programacao.horario}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 md:px-6 md:py-5 space-y-3 md:space-y-4">
        {/* Data */}
        <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4 border-b border-slate-700">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
          <span className="text-xs md:text-sm text-slate-300 font-medium truncate">{dataCapitalizada}</span>
        </div>

        {/* Endereço */}
        <div className="bg-slate-800 bg-opacity-50 rounded-lg p-3 md:p-4 border border-slate-700">
          <div className="flex items-start gap-2 md:gap-3">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 mb-1">Localização</p>
              <p className="text-xs md:text-sm text-white font-medium leading-relaxed">
                {programacao.endereco_completo}
              </p>
            </div>
          </div>
        </div>

        {/* Grid de Informações - Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex md:grid md:grid-cols-2 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {/* Cliente */}
          {programacao.cliente_nome && (
            <div className="bg-slate-800 bg-opacity-50 rounded-lg p-2.5 md:p-3 border border-slate-700 min-w-[160px] md:min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">Cliente</span>
              </div>
              <p className="text-xs md:text-sm text-white font-medium truncate">{programacao.cliente_nome}</p>
            </div>
          )}

          {/* Obra */}
          {programacao.obra_nome && (
            <div className="bg-slate-800 bg-opacity-50 rounded-lg p-2.5 md:p-3 border border-slate-700 min-w-[160px] md:min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                <span className="text-xs text-slate-400">Obra</span>
              </div>
              <p className="text-xs md:text-sm text-white font-medium truncate">{programacao.obra_nome}</p>
            </div>
          )}

          {/* Metragem Estimada */}
          <div className="bg-slate-800 bg-opacity-50 rounded-lg p-2.5 md:p-3 border border-slate-700 min-w-[120px] md:min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <Ruler className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">Metragem</span>
            </div>
            <p className="text-xs md:text-sm text-white font-medium">180 m²</p>
          </div>

          {/* Status */}
          <div className="bg-slate-800 bg-opacity-50 rounded-lg p-2.5 md:p-3 border border-slate-700 min-w-[120px] md:min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-400 flex-shrink-0" />
              <span className="text-xs text-slate-400">Status</span>
            </div>
            <p className="text-xs md:text-sm text-green-400 font-medium">Confirmado</p>
          </div>
        </div>
      </div>

      {/* Footer com destaque */}
      <div className="bg-slate-900 bg-opacity-50 px-4 py-2.5 md:px-6 md:py-3 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
            <span className="hidden md:inline">Duração estimada:</span>
            <span className="md:hidden">Duração:</span>
            <span className="text-white font-medium truncate">4-6h</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400 flex-shrink-0">
            <TrendingUp className="w-3 h-3" />
            <span className="font-medium">Em dia</span>
          </div>
        </div>
      </div>
    </div>
  )
}

