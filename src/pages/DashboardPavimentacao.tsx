import { useState, useEffect } from 'react'
import { useMediaQuery } from '../hooks/use-media-query'
import { Layout } from '../components/Layout'
import { DashboardDesktop } from '../components/dashboard/DashboardDesktop'
import { DashboardMobile } from '../components/dashboard/DashboardMobile'
import { DashboardPavimentacaoApi } from '../lib/dashboard-pavimentacao-api'
import type { DashboardData } from '../types/dashboard-pavimentacao'
import { RefreshCw } from 'lucide-react'

export default function DashboardPavimentacao() {
  const [data, setData] = useState<DashboardData>({
    kpis: {
      programacao_hoje: 0,
      programacao_amanha: 0,
      faturamento_mes: 0,
      despesas_mes: 0,
      metragem_mes: 0,
      toneladas_mes: 0
    },
    proxima_programacao: null,
    programacoes_hoje: [],
    programacoes_amanha: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detectar se é mobile
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Carregar dados do dashboard
  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const dashboardData = await DashboardPavimentacaoApi.getDashboardData()
      setData(dashboardData)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setError('Não foi possível carregar os dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  // Renderizar erro se houver
  if (error && !loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Erro ao Carregar Dashboard</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={loadDashboard}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Renderizar versão apropriada baseado no tamanho da tela
  return (
    <Layout hideBottomNav={!isMobile}>
      {isMobile ? (
        <DashboardMobile data={data} loading={loading} />
      ) : (
        <DashboardDesktop data={data} loading={loading} />
      )}
    </Layout>
  )
}

