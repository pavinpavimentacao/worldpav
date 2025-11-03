import React, { useEffect, useState, useMemo } from 'react'
import { Search, FileText, Calendar } from 'lucide-react'
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'

// ⚙️ DADOS REAIS
const USE_MOCK = false

interface Faturamento {
  id: string
  data_pagamento: string
  data_finalizacao?: string
  obra_nome: string
  rua_nome: string
  metragem_executada?: number
  toneladas_utilizadas?: number
  preco_por_m2?: number
  valor_total: number
  numero_nota_fiscal?: string
}

interface ReceitasTabProps {
  mesAno: { mes: number; ano: number }
}

export function ReceitasTab({ mesAno }: ReceitasTabProps) {
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroData, setFiltroData] = useState('')

  useEffect(() => {
    loadFaturamentos()
  }, [mesAno])

  // Aplicar filtros usando useMemo para melhor performance
  const faturamentosFiltrados = useMemo(() => {
    let resultado = [...faturamentos]

    if (filtroObra) {
      resultado = resultado.filter(f => 
        (f.obra_nome || '').toLowerCase().includes(filtroObra.toLowerCase()) ||
        (f.rua_nome || '').toLowerCase().includes(filtroObra.toLowerCase())
      )
    }

    if (filtroData) {
      resultado = resultado.filter(f => f.data_pagamento.startsWith(filtroData))
    }

    return resultado
  }, [faturamentos, filtroObra, filtroData])

  const loadFaturamentos = async () => {
    try {
      setLoading(true)

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setFaturamentos([
          {
            id: '1',
            data_pagamento: '2025-01-20',
            data_finalizacao: '2025-01-15',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            rua_nome: 'Rua das Flores - Trecho 1',
            metragem_executada: 850.50,
            toneladas_utilizadas: 42.5,
            preco_por_m2: 21.75,
            valor_total: 18500.00,
            numero_nota_fiscal: 'NF-001/2025'
          },
          {
            id: '2',
            data_pagamento: '2025-01-25',
            data_finalizacao: '2025-01-22',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            rua_nome: 'Rua das Flores - Trecho 2',
            metragem_executada: 816.09,
            toneladas_utilizadas: 40.8,
            preco_por_m2: 21.75,
            valor_total: 17750.00,
            numero_nota_fiscal: 'NF-002/2025'
          },
          {
            id: '3',
            data_pagamento: '2025-01-28',
            data_finalizacao: '2025-01-25',
            obra_nome: 'Avenida Central - Barueri',
            rua_nome: 'Avenida Central - Completa',
            metragem_executada: 1379.31,
            toneladas_utilizadas: 68.9,
            preco_por_m2: 21.75,
            valor_total: 30000.00,
            numero_nota_fiscal: 'NF-003/2025'
          }
        ])
      } else {
        // Buscar ruas executadas diretamente da tabela obras_ruas
        const { getRuasExecutadasComFaturamento } = await import('../../lib/financialConsolidadoApi')
        const ruasExecutadas = await getRuasExecutadasComFaturamento(mesAno)

        setFaturamentos(
          ruasExecutadas.map((rua: any) => ({
            id: rua.id,
            data_pagamento: rua.data_finalizacao,
            data_finalizacao: rua.data_finalizacao,
            obra_nome: rua.obra_nome,
            rua_nome: rua.rua_nome,
            metragem_executada: rua.metragem_executada || 0,
            toneladas_utilizadas: rua.toneladas_utilizadas || 0,
            preco_por_m2: rua.preco_por_m2 || 0,
            valor_total: rua.valor_executado || 0,
            numero_nota_fiscal: undefined,
          }))
        )
      }
    } catch (error) {
      console.error('Erro ao carregar faturamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + 'T00:00:00')
    return data.toLocaleDateString('pt-BR')
  }

  const totalReceitas = faturamentosFiltrados.reduce((sum, f) => sum + f.valor_total, 0)
  const totalMetragem = faturamentosFiltrados.reduce((sum, f) => sum + (f.metragem_executada || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando receitas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Obra ou Rua
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Digite o nome da obra ou rua..."
              value={filtroObra}
              onChange={(e) => setFiltroObra(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <DatePicker
            value={filtroData}
            onChange={setFiltroData}
            label="Filtrar por Data"
            placeholder="Selecione a data"
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Total de Receitas</p>
              <p className="text-xs text-green-600 mt-1">
                {faturamentosFiltrados.length} rua{faturamentosFiltrados.length !== 1 ? 's' : ''} executada{faturamentosFiltrados.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Executado</p>
              <p className="text-xs text-blue-600 mt-1">Metragem total</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {totalMetragem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Faturamentos */}
      {faturamentosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Nenhum faturamento encontrado com os filtros aplicados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rua Executada
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Metragem (m²)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Toneladas
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Preço/m²
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data Finalização
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor Executado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faturamentosFiltrados.map((faturamento) => (
                <tr key={faturamento.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium">
                      {faturamento.obra_nome}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-semibold">
                      {faturamento.rua_nome}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 font-medium">
                      {(faturamento.metragem_executada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      {(faturamento.toneladas_utilizadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-600">
                      R$ {(faturamento.preco_por_m2 || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatarData(faturamento.data_finalizacao || faturamento.data_pagamento)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-green-600">
                      R$ {faturamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900">
                  TOTAL
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                  {totalMetragem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} m²
                </td>
                <td colSpan={3}></td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-green-600">
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

