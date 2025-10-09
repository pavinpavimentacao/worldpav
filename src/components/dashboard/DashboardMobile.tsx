import { Calendar, DollarSign, TrendingDown, Ruler, Weight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KpiCard } from '../KpiCard'
import { ProximaProgramacaoCard } from './ProximaProgramacaoCard'
import { ProgramacaoListItem } from './ProgramacaoListItem'
import type { DashboardData } from '../../types/dashboard-pavimentacao'

interface DashboardMobileProps {
  data: DashboardData
  loading?: boolean
}

export function DashboardMobile({ data, loading }: DashboardMobileProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  return (
    <div className="min-h-screen">
      {/* Header Fixo */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold">WorldPav</h1>
        <p className="text-sm opacity-90">Dashboard de Pavimentação</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Próxima Programação - Card Destaque */}
        <ProximaProgramacaoCard 
          programacao={data.proxima_programacao} 
          loading={loading}
        />

        {/* Grid de KPIs - 2 colunas no mobile */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            title="Hoje"
            value={loading ? 0 : data.kpis.programacao_hoje}
            subtitle="serviços"
            loading={loading}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            className="bg-blue-50 border-blue-200"
          />
          
          <KpiCard
            title="Amanhã"
            value={loading ? 0 : data.kpis.programacao_amanha}
            subtitle="serviços"
            loading={loading}
            icon={<Calendar className="w-6 h-6 text-blue-600" />}
            className="bg-blue-50 border-blue-200"
          />

          <KpiCard
            title="Faturamento"
            value={loading ? 'R$ 0' : formatCurrency(data.kpis.faturamento_mes)}
            subtitle="mês"
            loading={loading}
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            className="bg-green-50 border-green-200"
          />

          <KpiCard
            title="Despesas"
            value={loading ? 'R$ 0' : formatCurrency(data.kpis.despesas_mes)}
            subtitle="mês"
            loading={loading}
            icon={<TrendingDown className="w-6 h-6 text-red-600" />}
            className="bg-red-50 border-red-200"
          />

          <KpiCard
            title="m² Pavimentados"
            value={loading ? '0' : formatNumber(data.kpis.metragem_mes, 0)}
            subtitle="mês"
            loading={loading}
            icon={<Ruler className="w-6 h-6 text-purple-600" />}
            className="bg-purple-50 border-purple-200"
          />

          <KpiCard
            title="Toneladas"
            value={loading ? '0' : formatNumber(data.kpis.toneladas_mes, 1)}
            subtitle="ton no mês"
            loading={loading}
            icon={<Weight className="w-6 h-6 text-orange-600" />}
            className="bg-orange-50 border-orange-200"
          />
        </div>

        {/* Programação de Hoje */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Programação de Hoje</h2>
            {data.programacoes_hoje.length > 0 && (
              <Link 
                to="/programacao-pavimentacao" 
                className="text-primary-600 flex items-center gap-1 text-sm font-medium"
              >
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
              ))}
            </div>
          ) : data.programacoes_hoje.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma programação para hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.programacoes_hoje.slice(0, 3).map((prog) => (
                <ProgramacaoListItem key={prog.id} programacao={prog} variant="compact" />
              ))}
              {data.programacoes_hoje.length > 3 && (
                <Link 
                  to="/programacao-pavimentacao" 
                  className="block text-center py-2 text-primary-600 text-sm font-medium"
                >
                  + {data.programacoes_hoje.length - 3} serviços
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Programação de Amanhã */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Programação de Amanhã</h2>
            {data.programacoes_amanha.length > 0 && (
              <Link 
                to="/programacao-pavimentacao" 
                className="text-primary-600 flex items-center gap-1 text-sm font-medium"
              >
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16"></div>
              ))}
            </div>
          ) : data.programacoes_amanha.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma programação para amanhã</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.programacoes_amanha.slice(0, 3).map((prog) => (
                <ProgramacaoListItem key={prog.id} programacao={prog} variant="compact" />
              ))}
              {data.programacoes_amanha.length > 3 && (
                <Link 
                  to="/programacao-pavimentacao" 
                  className="block text-center py-2 text-primary-600 text-sm font-medium"
                >
                  + {data.programacoes_amanha.length - 3} serviços
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

