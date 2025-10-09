import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { DatePicker } from '../../components/ui/date-picker'
import { RelatorioDiarioCard } from '../../components/relatorios-diarios/RelatorioDiarioCard'
import { Plus, FileText, Filter } from 'lucide-react'
import { getRelatoriosDiarios } from '../../lib/relatoriosDiariosApi'
import { RelatorioDiario } from '../../types/relatorios-diarios'

export function RelatoriosDiariosList() {
  const navigate = useNavigate()
  const [relatorios, setRelatorios] = useState<RelatorioDiario[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')

  useEffect(() => {
    loadRelatorios()
  }, [filtroCliente, filtroObra, filtroDataInicio, filtroDataFim])

  async function loadRelatorios() {
    try {
      setLoading(true)
      
      const data = await getRelatoriosDiarios({
        cliente_id: filtroCliente || undefined,
        obra_id: filtroObra || undefined,
        data_inicio: filtroDataInicio || undefined,
        data_fim: filtroDataFim || undefined
      })
      
      setRelatorios(data)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  function limparFiltros() {
    setFiltroCliente('')
    setFiltroObra('')
    setFiltroDataInicio('')
    setFiltroDataFim('')
  }

  // Mock options para filtros
  const clientesOptions = [
    { value: '', label: 'Todos os clientes' },
    { value: 'cli-1', label: 'Prefeitura de Osasco' },
    { value: 'cli-2', label: 'Construtora ABC' },
    { value: 'cli-3', label: 'Prefeitura de Barueri' },
    { value: 'cli-4', label: 'Incorporadora XYZ' }
  ]

  const obrasOptions = [
    { value: '', label: 'Todas as obras' },
    { value: '1', label: 'Pavimentação Rua das Flores - Osasco' },
    { value: '2', label: 'Avenida Central - Barueri' },
    { value: '3', label: 'Conjunto Residencial Vila Nova' }
  ]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Diários</h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie todos os relatórios diários de obras
            </p>
          </div>
          <Button
            onClick={() => navigate('/relatorios-diarios/novo')}
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Relatório
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filtroCliente}
              onChange={setFiltroCliente}
              options={clientesOptions}
              label="Cliente"
              placeholder="Filtrar por cliente"
            />

            <Select
              value={filtroObra}
              onChange={setFiltroObra}
              options={obrasOptions}
              label="Obra"
              placeholder="Filtrar por obra"
            />

            <DatePicker
              value={filtroDataInicio}
              onChange={setFiltroDataInicio}
              label="Data Início"
              placeholder="Data inicial"
            />

            <DatePicker
              value={filtroDataFim}
              onChange={setFiltroDataFim}
              label="Data Fim"
              placeholder="Data final"
              minDate={filtroDataInicio}
            />
          </div>

          {(filtroCliente || filtroObra || filtroDataInicio || filtroDataFim) && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={limparFiltros}
                size="sm"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{relatorios.length}</p>
                <p className="text-sm text-gray-600">Total de Relatórios</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-5 w-5 text-green-600 font-bold flex items-center justify-center">
                  m²
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {relatorios.reduce((acc, r) => acc + r.metragem_feita, 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Total Metragem</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="h-5 w-5 text-purple-600 font-bold flex items-center justify-center">
                  t
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {relatorios.reduce((acc, r) => acc + r.toneladas_aplicadas, 0).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Total Toneladas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <div className="h-5 w-5 text-amber-600 font-bold flex items-center justify-center text-xs">
                  cm
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {relatorios.length > 0
                    ? (relatorios.reduce((acc, r) => acc + r.espessura_calculada, 0) / relatorios.length).toFixed(2)
                    : '0.00'}
                </p>
                <p className="text-sm text-gray-600">Espessura Média</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Relatórios */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando relatórios...</p>
          </div>
        ) : relatorios.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Nenhum relatório encontrado</p>
            <p className="text-gray-500 text-sm mt-1">
              Crie um novo relatório diário para começar
            </p>
            <Button
              onClick={() => navigate('/relatorios-diarios/novo')}
              className="mt-4 gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Primeiro Relatório
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatorios.map(relatorio => (
              <RelatorioDiarioCard key={relatorio.id} relatorio={relatorio} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default RelatoriosDiariosList
