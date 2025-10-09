import { Calendar, DollarSign, TrendingDown, Ruler, Weight } from 'lucide-react'
import { KpiCard } from '../KpiCard'
import { ProximaProgramacaoCard } from './ProximaProgramacaoCard'
import { ProgramacaoListItem } from './ProgramacaoListItem'
import type { DashboardData } from '../../types/dashboard-pavimentacao'

interface DashboardDesktopProps {
  data: DashboardData
  loading?: boolean
}

export function DashboardDesktop({ data, loading }: DashboardDesktopProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Pavimentação</h1>
        <p className="text-gray-600 mt-1">Visão geral das operações de pavimentação asfáltica</p>
      </div>

      {/* Próxima Programação - Card Destaque */}
      <ProximaProgramacaoCard 
        programacao={data.proxima_programacao} 
        loading={loading}
      />

      {/* Grid de KPIs - 4 colunas na primeira linha, 2 na segunda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Programação Hoje"
          value={loading ? 0 : data.kpis.programacao_hoje}
          subtitle="serviços agendados"
          loading={loading}
          icon={<Calendar className="w-8 h-8 text-blue-600" />}
          className="bg-blue-50 border-blue-200"
        />
        
        <KpiCard
          title="Programação Amanhã"
          value={loading ? 0 : data.kpis.programacao_amanha}
          subtitle="serviços agendados"
          loading={loading}
          icon={<Calendar className="w-8 h-8 text-blue-600" />}
          className="bg-blue-50 border-blue-200"
        />

        <KpiCard
          title="Faturamento Mês"
          value={loading ? 'R$ 0,00' : formatCurrency(data.kpis.faturamento_mes)}
          subtitle="obras pagas"
          loading={loading}
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
          className="bg-green-50 border-green-200"
        />

        <KpiCard
          title="Despesas Mês"
          value={loading ? 'R$ 0,00' : formatCurrency(data.kpis.despesas_mes)}
          subtitle="custos de obras"
          loading={loading}
          icon={<TrendingDown className="w-8 h-8 text-red-600" />}
          className="bg-red-50 border-red-200"
        />
      </div>

      {/* Segunda linha de KPIs - 2 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          title="m² Pavimentados"
          value={loading ? '0 m²' : `${formatNumber(data.kpis.metragem_mes, 1)} m²`}
          subtitle="metragem executada no mês"
          loading={loading}
          icon={<Ruler className="w-8 h-8 text-purple-600" />}
          className="bg-purple-50 border-purple-200"
        />

        <KpiCard
          title="Toneladas Aplicadas"
          value={loading ? '0 ton' : `${formatNumber(data.kpis.toneladas_mes, 2)} ton`}
          subtitle="asfalto aplicado no mês"
          loading={loading}
          icon={<Weight className="w-8 h-8 text-orange-600" />}
          className="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Listas de Programações - 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programação de Hoje */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Programação de Hoje</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {data.programacoes_hoje.length} {data.programacoes_hoje.length === 1 ? 'serviço' : 'serviços'}
            </span>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
              ))}
            </div>
          ) : data.programacoes_hoje.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma programação para hoje</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.programacoes_hoje.slice(0, 5).map((prog) => (
                <ProgramacaoListItem key={prog.id} programacao={prog} variant="compact" />
              ))}
            </div>
          )}
        </div>

        {/* Programação de Amanhã */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Programação de Amanhã</h2>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              {data.programacoes_amanha.length} {data.programacoes_amanha.length === 1 ? 'serviço' : 'serviços'}
            </span>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20"></div>
              ))}
            </div>
          ) : data.programacoes_amanha.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma programação para amanhã</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {data.programacoes_amanha.slice(0, 5).map((prog) => (
                <ProgramacaoListItem key={prog.id} programacao={prog} variant="compact" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

