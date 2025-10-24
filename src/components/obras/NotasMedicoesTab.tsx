import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, FileText, FileSpreadsheet } from 'lucide-react'
import { NotasFiscaisSubTab } from './NotasFiscaisSubTab'
import { MedicoesSubTab } from './MedicoesSubTab'
import { PagamentosDiretosSubTab } from './PagamentosDiretosSubTab'
import { getFaturamentoBrutoTotal } from '../../lib/obrasNotasFiscaisApi'
import { calcularValorTotalServicos } from '../../lib/obrasServicosApi'
import { getObraRuas } from '../../lib/obrasRuasApi'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = false

type SubTabType = 'notas' | 'medicoes' | 'pagamentos-diretos'

interface NotasMedicoesTabProps {
  obraId: string
  precoPorM2: number
}

export function NotasMedicoesTab({ obraId, precoPorM2 }: NotasMedicoesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('notas')
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    faturamentoPrevisto: 0,
    faturamentoBruto: 0
  })

  useEffect(() => {
    loadKPIs()
  }, [obraId])

  const loadKPIs = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        // Faturamento Previsto: Baseado em 5000m² planejados × R$ 25/m²
        // Faturamento Bruto: Soma das 4 notas fiscais mockadas
        setKpis({
          faturamentoPrevisto: 125000.00,  // 5000 × 25
          faturamentoBruto: 176500.00       // 45000 + 38500 + 52000 + 41000
        })
      } else {
        const [faturamentoPrevisto, faturamentoBruto] = await Promise.all([
          calcularValorTotalServicos(obraId),
          getFaturamentoBrutoTotal(obraId)
        ])
        
        setKpis({
          faturamentoPrevisto,
          faturamentoBruto
        })
      }
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Faturamento Previsto */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Faturamento Previsto</h3>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded w-32 mb-1"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-48"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold mb-1">
                R$ {kpis.faturamentoPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs opacity-80">
                Baseado nos serviços × volume planejado + mobilizações
              </p>
            </>
          )}
        </div>

        {/* Faturamento Bruto */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Faturamento Bruto</h3>
            <DollarSign className="h-5 w-5 opacity-80" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-white bg-opacity-20 rounded w-32 mb-1"></div>
              <div className="h-4 bg-white bg-opacity-20 rounded w-48"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold mb-1">
                R$ {kpis.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs opacity-80">
                Soma de notas fiscais + pagamentos diretos
              </p>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('notas')}
            className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'notas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Notas Fiscais
          </button>
          <button
            onClick={() => setActiveSubTab('medicoes')}
            className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'medicoes'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Medições
          </button>
          <button
            onClick={() => setActiveSubTab('pagamentos-diretos')}
            className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'pagamentos-diretos'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Pagamentos Diretos
          </button>
        </nav>
      </div>

      {/* Sub-tabs Content */}
      <div>
        {activeSubTab === 'notas' && (
          <NotasFiscaisSubTab obraId={obraId} />
        )}
        {activeSubTab === 'medicoes' && (
          <MedicoesSubTab obraId={obraId} />
        )}
        {activeSubTab === 'pagamentos-diretos' && (
          <PagamentosDiretosSubTab obraId={obraId} />
        )}
      </div>
    </div>
  )
}

