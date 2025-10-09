import React, { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { formatDateToBR } from '../../utils/date-utils'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit, CheckCircle } from 'lucide-react'

interface Obra {
  id: string
  nome: string
  cliente: string
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  empresa: 'WorldPav' | 'Pavin'
  previsaoConclusao: string
  valorTotal: number
  // Informações técnicas da obra
  metragemFeita: number // em m²
  metragemPlanejada: number // em m²
  toneladasAplicadas: number // em toneladas
  toneladasPlanejadas: number // em toneladas
  espessuraMedia: number // em cm
  ruasFeitas: number // quantidade de ruas concluídas
  totalRuas: number // total de ruas planejadas
  faturamentoBruto: number // em R$
}

// Dados mock para demonstração
// Regra de negócio: 1000 m² = 100 toneladas (divisão por 10) | Espessura média base: 3,5 cm
const mockObras: Obra[] = [
  {
    id: '1',
    nome: 'Pavimentação Rua das Flores - Osasco',
    cliente: 'Prefeitura de Osasco',
    status: 'em_andamento',
    empresa: 'WorldPav',
    previsaoConclusao: '2024-02-15',
    valorTotal: 125000,
    metragemFeita: 3250,
    metragemPlanejada: 5000,
    toneladasAplicadas: 325,        // 3250 ÷ 10 = 325 ton
    toneladasPlanejadas: 500,       // 5000 ÷ 10 = 500 ton
    espessuraMedia: 3.5,            // Base padrão
    ruasFeitas: 4,
    totalRuas: 6,
    faturamentoBruto: 81250
  },
  {
    id: '2',
    nome: 'Recapeamento Avenida Central - São Paulo',
    cliente: 'Construtora ABC',
    status: 'planejada',
    empresa: 'Pavin',
    previsaoConclusao: '2024-03-01',
    valorTotal: 89000,
    metragemFeita: 0,
    metragemPlanejada: 4200,
    toneladasAplicadas: 0,
    toneladasPlanejadas: 420,       // 4200 ÷ 10 = 420 ton
    espessuraMedia: 0,              // Obra ainda não iniciada
    ruasFeitas: 0,
    totalRuas: 3,
    faturamentoBruto: 0
  },
  {
    id: '3',
    nome: 'Pavimentação Condomínio Residencial',
    cliente: 'Empresa XYZ',
    status: 'concluida',
    empresa: 'WorldPav',
    previsaoConclusao: '2024-01-20',
    valorTotal: 45000,
    metragemFeita: 1800,
    metragemPlanejada: 1800,
    toneladasAplicadas: 180,        // 1800 ÷ 10 = 180 ton
    toneladasPlanejadas: 180,       // 1800 ÷ 10 = 180 ton
    espessuraMedia: 3.5,            // Base padrão
    ruasFeitas: 2,
    totalRuas: 2,
    faturamentoBruto: 45000
  }
]

const getStatusBadge = (status: Obra['status']) => {
  const statusConfig = {
    planejada: { label: 'Planejada', className: 'status-planejada' },
    em_andamento: { label: 'Em Andamento', className: 'status-em-andamento' },
    concluida: { label: 'Concluída', className: 'status-concluida' },
    cancelada: { label: 'Cancelada', className: 'status-cancelada' }
  }
  
  const config = statusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

const getEmpresaColor = (empresa: Obra['empresa']) => {
  return empresa === 'WorldPav' ? 'empresa-worldpav' : 'empresa-pavin'
}

export default function ObrasList() {
  const [obras] = useState<Obra[]>(mockObras)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [empresaFilter, setEmpresaFilter] = useState<string>('all')
  const [clienteFilter, setClienteFilter] = useState<string>('all')

  // Obter lista única de clientes
  const clientesUnicos = Array.from(new Set(obras.map(obra => obra.cliente))).sort()

  const filteredObras = obras.filter(obra => {
    const matchesSearch = obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obra.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || obra.status === statusFilter
    const matchesEmpresa = empresaFilter === 'all' || obra.empresa === empresaFilter
    const matchesCliente = clienteFilter === 'all' || obra.cliente === clienteFilter
    
    return matchesSearch && matchesStatus && matchesEmpresa && matchesCliente
  })

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

  const formatArea = (value: number) => {
    return `${formatNumber(value)} m²`
  }

  const formatWeight = (value: number) => {
    return `${formatNumber(value, 1)} t`
  }

  const formatThickness = (value: number) => {
    return `${formatNumber(value, 1)} cm`
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Obras
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todas as obras de pavimentação
            </p>
          </div>
          <div className="mt-4 md:ml-4 md:mt-0">
            <Link to="/obras/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">M²</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Metragem Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatArea(filteredObras.reduce((total, obra) => total + obra.metragemFeita, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">T</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Toneladas Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatWeight(filteredObras.reduce((total, obra) => total + obra.toneladasAplicadas, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">CM</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Espessura Média</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(() => {
                    const obrasComEspessura = filteredObras.filter(obra => obra.espessuraMedia > 0)
                    const espessuraMedia = obrasComEspessura.length > 0 
                      ? obrasComEspessura.reduce((total, obra) => total + obra.espessuraMedia, 0) / obrasComEspessura.length
                      : 0
                    return espessuraMedia > 0 ? formatThickness(espessuraMedia) : '-'
                  })()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">R$</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(filteredObras.reduce((total, obra) => total + obra.faturamentoBruto, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar obras ou clientes..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro Status */}
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              placeholder="Todos os Status"
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'planejada', label: 'Planejada' },
                { value: 'em_andamento', label: 'Em Andamento' },
                { value: 'concluida', label: 'Concluída' },
                { value: 'cancelada', label: 'Cancelada' }
              ]}
            />

            {/* Filtro Empresa */}
            <Select
              value={empresaFilter}
              onChange={(value) => setEmpresaFilter(value)}
              placeholder="Todas as Empresas"
              options={[
                { value: 'all', label: 'Todas as Empresas' },
                { value: 'WorldPav', label: 'WorldPav' },
                { value: 'Pavin', label: 'Pavin' }
              ]}
            />

            {/* Filtro Cliente */}
            <Select
              value={clienteFilter}
              onChange={(value) => setClienteFilter(value)}
              placeholder="Todos os Clientes"
              options={[
                { value: 'all', label: 'Todos os Clientes' },
                ...clientesUnicos.map(cliente => ({
                  value: cliente,
                  label: cliente
                }))
              ]}
            />
          </div>
        </div>

        {/* Lista de Obras */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metragem Feita
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toneladas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Espessura
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faturamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredObras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {obra.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ruas: {obra.ruasFeitas}/{obra.totalRuas} ({obra.totalRuas > 0 ? ((obra.ruasFeitas / obra.totalRuas) * 100).toFixed(0) : 0}%)
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{obra.cliente}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(obra.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatArea(obra.metragemFeita)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatWeight(obra.toneladasAplicadas)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {obra.espessuraMedia > 0 ? formatThickness(obra.espessuraMedia) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium text-green-600">
                        {formatCurrency(obra.faturamentoBruto)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getEmpresaColor(obra.empresa)}`}>
                        {obra.empresa}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/obras/${obra.id}`}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/obras/${obra.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        {obra.status === 'em_andamento' && (
                          <button
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Concluir obra"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredObras.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma obra encontrada
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou criar uma nova obra.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

