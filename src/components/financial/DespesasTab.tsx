import React, { useEffect, useState, useMemo } from 'react'
import { Search, Tag, Calendar } from 'lucide-react'
import { Select } from "../shared/Select"
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'

// ⚙️ DADOS REAIS
const USE_MOCK = false

interface Despesa {
  id: string
  data_despesa: string
  categoria: string
  descricao: string
  obra_nome?: string
  maquinario_nome?: string
  valor: number
}

interface DespesasTabProps {
  mesAno: { mes: number; ano: number }
}

const CATEGORIAS = ['Diesel', 'Materiais', 'Manutenção', 'Mão de Obra', 'Outros']

export function DespesasTab({ mesAno }: DespesasTabProps) {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroData, setFiltroData] = useState('')

  useEffect(() => {
    loadDespesas()
  }, [mesAno])

  // Aplicar filtros usando useMemo para melhor performance
  const despesasFiltradas = useMemo(() => {
    let resultado = [...despesas]

    if (filtroCategoria) {
      resultado = resultado.filter(d => d.categoria === filtroCategoria)
    }

    if (filtroObra) {
      resultado = resultado.filter(d => 
        (d.obra_nome || '').toLowerCase().includes(filtroObra.toLowerCase()) ||
        d.descricao.toLowerCase().includes(filtroObra.toLowerCase())
      )
    }

    if (filtroData) {
      resultado = resultado.filter(d => d.data_despesa.startsWith(filtroData))
    }

    return resultado
  }, [despesas, filtroCategoria, filtroObra, filtroData])

  const loadDespesas = async () => {
    try {
      setLoading(true)

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setDespesas([])
      } else {
        const { getFinancialConsolidado } = await import('../../lib/financialConsolidadoApi')
        const data = await getFinancialConsolidado(mesAno)
        setDespesas((data.despesas || []) as any)
      }
    } catch (error) {
      console.error('Erro ao carregar despesas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString + 'T00:00:00')
    return data.toLocaleDateString('pt-BR')
  }

  const getCategoriaColor = (categoria: string) => {
    const cores: { [key: string]: string } = {
      'Diesel': 'bg-yellow-100 text-yellow-800',
      'Materiais': 'bg-blue-100 text-blue-800',
      'Manutenção': 'bg-orange-100 text-orange-800',
      'Mão de Obra': 'bg-purple-100 text-purple-800',
      'Outros': 'bg-gray-100 text-gray-800'
    }
    return cores[categoria] || 'bg-gray-100 text-gray-800'
  }

  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + d.valor, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando despesas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          value={filtroCategoria}
          onChange={setFiltroCategoria}
          options={[
            { value: '', label: 'Todas as categorias' },
            ...CATEGORIAS.map(cat => ({ value: cat, label: cat }))
          ]}
          label="Categoria"
          placeholder="Selecione a categoria"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por Obra
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Digite o nome da obra..."
              value={filtroObra}
              onChange={(e) => setFiltroObra(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <DatePicker
          value={filtroData}
          onChange={setFiltroData}
          label="Filtrar por Data"
          placeholder="Selecione a data"
        />
      </div>

      {/* Resumo */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-900">
            Total de Despesas ({despesasFiltradas.length} {despesasFiltradas.length === 1 ? 'despesa' : 'despesas'})
          </span>
          <span className="text-xl font-bold text-red-900">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Tabela de Despesas */}
      {despesasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Nenhuma despesa encontrada com os filtros aplicados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Obra / Maquinário
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatarData(despesa.data_despesa)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(despesa.categoria)}`}>
                      <Tag className="h-3 w-3" />
                      {despesa.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {despesa.descricao}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      {despesa.obra_nome && (
                        <div className="font-medium">{despesa.obra_nome}</div>
                      )}
                      {despesa.maquinario_nome && (
                        <div className="text-xs text-gray-500">{despesa.maquinario_nome}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-red-600">
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

