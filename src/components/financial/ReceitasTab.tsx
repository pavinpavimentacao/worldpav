import React, { useEffect, useState, useMemo } from 'react'
import { Search, FileText, Calendar } from 'lucide-react'
import { DatePicker } from '../ui/date-picker'
import { Input } from '../ui/input'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

interface Faturamento {
  id: string
  data_pagamento: string
  obra_nome: string
  rua_nome: string
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
        f.obra_nome.toLowerCase().includes(filtroObra.toLowerCase()) ||
        f.rua_nome.toLowerCase().includes(filtroObra.toLowerCase())
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
        
        // Dados mockados
        setFaturamentos([
          {
            id: '1',
            data_pagamento: '2025-01-20',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            rua_nome: 'Rua das Flores',
            valor_total: 18500.00,
            numero_nota_fiscal: 'NF-001/2025'
          },
          {
            id: '2',
            data_pagamento: '2025-01-22',
            obra_nome: 'Pavimentação Rua das Flores - Osasco',
            rua_nome: 'Rua dos Girassóis',
            valor_total: 17750.00,
            numero_nota_fiscal: 'NF-002/2025'
          },
          {
            id: '3',
            data_pagamento: '2025-01-25',
            obra_nome: 'Avenida Central - Barueri',
            rua_nome: 'Avenida Central',
            valor_total: 30000.00,
            numero_nota_fiscal: 'NF-003/2025'
          }
        ])
      } else {
        // TODO: Implementar chamada real da API
        // const data = await getFinancialConsolidado(mesAno)
        // setFaturamentos(data.faturamentos)
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            Total de Receitas ({faturamentosFiltrados.length} {faturamentosFiltrados.length === 1 ? 'faturamento' : 'faturamentos'})
          </span>
          <span className="text-xl font-bold text-blue-900">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
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
                  Data Pagamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rua
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nota Fiscal
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faturamentosFiltrados.map((faturamento) => (
                <tr key={faturamento.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatarData(faturamento.data_pagamento)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium">
                      {faturamento.obra_nome}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      {faturamento.rua_nome}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {faturamento.numero_nota_fiscal || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-green-600">
                      R$ {faturamento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

