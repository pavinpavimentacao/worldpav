import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Eye, Edit, CheckCircle, Trash2 } from 'lucide-react'
import { getObras, getEstatisticasObras, deleteObra, Obra, ObraStats } from '../../lib/obrasApi'
import { getObraFaturamentos } from '../../lib/obrasFinanceiroApi'
import { getRuasByObra } from '../../lib/obrasRuasApi'
import { useToast } from '../../lib/toast-hooks'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import { DeleteObraModal } from '../../components/obras/DeleteObraModal'

// Interface local para compatibilidade com a UI existente
interface ObraDisplay extends Obra {
  nome: string
  cliente: string
  empresa: 'WorldPav' | 'Pavin'
  previsaoConclusao: string
  valorTotal: number
  metragemFeita: number
  metragemPlanejada: number
  toneladasAplicadas: number
  toneladasPlanejadas: number
  espessuraMedia: number
  ruasFeitas: number
  totalRuas: number
  faturamentoBruto: number
}

const getStatusBadge = (status: Obra['status']) => {
  const statusConfig = {
    planejamento: { label: 'Planejamento', className: 'status-planejamento' },
    andamento: { label: 'Em Andamento', className: 'status-andamento' },
    concluida: { label: 'Concluída', className: 'status-concluida' },
    cancelada: { label: 'Cancelada', className: 'status-cancelada' }
  }
  
  const config = statusConfig[status]
  return <span className={config.className}>{config.label}</span>
}

const getEmpresaColor = (empresa: string) => {
  return empresa === 'WorldPav' ? 'empresa-worldpav' : 'empresa-pavin'
}

// Função para buscar dados reais de uma obra
async function getObraDadosReais(obraId: string) {
  try {
    // Buscar faturamentos e ruas em paralelo
    const [faturamentos, ruas] = await Promise.all([
      getObraFaturamentos(obraId),
      getRuasByObra(obraId)
    ])

    console.log(`🔍 Dados da obra ${obraId}:`, {
      faturamentos: faturamentos.length,
      ruas: ruas.length
    })

    // Calcular metragem executada (priorizar faturamentos, fallback para ruas)
    const metragemFeita = faturamentos.length > 0 
      ? faturamentos.reduce((total, fat) => total + (fat.metragem_executada || 0), 0)
      : ruas.reduce((total, rua) => total + (rua.metragem_executada || 0), 0)
    
    // Calcular metragem planejada (soma das ruas - usar area se metragem_planejada for null)
    const metragemPlanejada = ruas.reduce((total, rua) => total + (rua.metragem_planejada || rua.area || 0), 0)
    
    // Calcular toneladas aplicadas (priorizar faturamentos, fallback para ruas)
    const toneladasAplicadas = faturamentos.length > 0
      ? faturamentos.reduce((total, fat) => total + (fat.toneladas_aplicadas || 0), 0)
      : ruas.reduce((total, rua) => total + (rua.toneladas_utilizadas || 0), 0)
    
    // Calcular toneladas planejadas (converter area m² para toneladas)
    const toneladasPlanejadas = ruas.reduce((total, rua) => {
      const area = rua.metragem_planejada || rua.area || 0
      return total + (area / 10) // 1000 m² = 100 toneladas (fator 10)
    }, 0)
    
    // Calcular espessura média (priorizar faturamentos, fallback para ruas)
    let espessuraMedia = 0
    if (faturamentos.length > 0) {
      espessuraMedia = faturamentos.reduce((total, fat) => total + (fat.espessura_calculada || 0), 0) / faturamentos.length
    } else {
      // Usar espessura já calculada das ruas ou calcular se não existir
      const ruasComEspessura = ruas.filter(rua => rua.espessura_calculada || (rua.metragem_executada && rua.toneladas_utilizadas))
      if (ruasComEspessura.length > 0) {
        const totalEspessura = ruasComEspessura.reduce((total, rua) => {
          if (rua.espessura_calculada) {
            return total + rua.espessura_calculada
          } else {
            // Calcular espessura se não existir
            const espessura = rua.toneladas_utilizadas / rua.metragem_executada / 2.4 // Densidade do asfalto
            return total + espessura
          }
        }, 0)
        espessuraMedia = totalEspessura / ruasComEspessura.length
      }
    }
    
    // Contar ruas (ruas finalizadas vs total)
    const ruasFeitas = ruas.filter(rua => rua.status === 'concluida' || rua.status === 'finalizada').length
    const totalRuas = ruas.length
    
    // Calcular faturamento bruto (priorizar faturamentos, fallback para ruas)
    const faturamentoBruto = faturamentos.length > 0
      ? faturamentos.reduce((total, fat) => total + (fat.valor_total || 0), 0)
      : ruas.reduce((total, rua) => total + (rua.valor_total || 0), 0)

    const dados = {
      metragemFeita,
      metragemPlanejada,
      toneladasAplicadas,
      toneladasPlanejadas,
      espessuraMedia,
      ruasFeitas,
      totalRuas,
      faturamentoBruto
    }

    console.log(`📊 Dados calculados para obra ${obraId}:`, dados)
    return dados
  } catch (error) {
    console.error('❌ Erro ao buscar dados reais da obra:', error)
    return {
      metragemFeita: 0,
      metragemPlanejada: 0,
      toneladasAplicadas: 0,
      toneladasPlanejadas: 0,
      espessuraMedia: 0,
      ruasFeitas: 0,
      totalRuas: 0,
      faturamentoBruto: 0
    }
  }
}

// Função para converter Obra da API para ObraDisplay da UI
const convertObraToDisplay = (obra: Obra, dadosReais?: any): ObraDisplay => {
  return {
    ...obra,
    nome: obra.name,
    cliente: obra.client?.name || 'Cliente não informado',
    empresa: 'WorldPav', // Por enquanto, sempre WorldPav
    previsaoConclusao: obra.expected_end_date || '',
    valorTotal: obra.contract_value || 0,
    // Dados técnicos reais ou padrão
    metragemFeita: dadosReais?.metragemFeita || 0,
    metragemPlanejada: dadosReais?.metragemPlanejada || 0,
    toneladasAplicadas: dadosReais?.toneladasAplicadas || 0,
    toneladasPlanejadas: dadosReais?.toneladasPlanejadas || 0,
    espessuraMedia: dadosReais?.espessuraMedia || 0,
    ruasFeitas: dadosReais?.ruasFeitas || 0,
    totalRuas: dadosReais?.totalRuas || 0,
    faturamentoBruto: dadosReais?.faturamentoBruto || obra.executed_value || 0
  }
}

export default function ObrasList() {
  const { addToast } = useToast()
  const [obras, setObras] = useState<ObraDisplay[]>([])
  const [stats, setStats] = useState<ObraStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [empresaFilter, setEmpresaFilter] = useState<string>('all')
  const [clienteFilter, setClienteFilter] = useState<string>('all')
  
  // Estados para modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [obraToDelete, setObraToDelete] = useState<ObraDisplay | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Carregar company ID
  useEffect(() => {
    loadCompanyId()
  }, [])

  // Carregar dados quando companyId mudar
  useEffect(() => {
    if (companyId) {
      loadData()
    }
  }, [companyId, searchTerm, statusFilter, empresaFilter, clienteFilter])

  async function loadCompanyId() {
    try {
      const id = await getOrCreateDefaultCompany()
      setCompanyId(id)
    } catch (err) {
      console.error('Erro ao carregar company ID:', err)
      addToast({ message: 'Erro ao carregar empresa', type: 'error' })
    }
  }

  async function loadData() {
    if (!companyId) return

    try {
      setLoading(true)
      
      console.log('🔍 Carregando dados para companyId:', companyId)
      
      // Carregar obras e estatísticas em paralelo
      const [obrasResult, statsResult] = await Promise.all([
        getObras(companyId, {
          search: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page: 1,
          limit: 100
        }),
        getEstatisticasObras(companyId)
      ])

      console.log('📊 Obras encontradas:', obrasResult.data.length)
      console.log('📈 Estatísticas:', statsResult)

      // Buscar dados reais para cada obra
      const obrasComDadosReais = await Promise.all(
        obrasResult.data.map(async (obra) => {
          const dadosReais = await getObraDadosReais(obra.id)
          console.log(`🏗️ Dados reais da obra ${obra.name}:`, dadosReais)
          return convertObraToDisplay(obra, dadosReais)
        })
      )

      console.log('✅ Obras processadas:', obrasComDadosReais.length)
      setObras(obrasComDadosReais)
      setStats(statsResult)
    } catch (error) {
      console.error('❌ Erro ao carregar obras:', error)
      addToast({ message: 'Erro ao carregar obras', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Obter lista única de clientes
  const clientesUnicos = Array.from(new Set(obras.map(obra => obra.cliente))).sort()

  // Função para abrir modal de exclusão
  const handleOpenDeleteModal = (obra: ObraDisplay) => {
    setObraToDelete(obra)
    setDeleteModalOpen(true)
  }

  // Função para fechar modal de exclusão
  const handleCloseDeleteModal = () => {
    if (!deleting) {
      setDeleteModalOpen(false)
      setObraToDelete(null)
    }
  }

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!obraToDelete) return

    try {
      setDeleting(true)
      await deleteObra(obraToDelete.id)
      
      addToast({
        type: 'success',
        message: `Obra "${obraToDelete.nome}" excluída com sucesso`
      })

      // Recarregar a lista
      await loadData()
      
      // Fechar modal
      setDeleteModalOpen(false)
      setObraToDelete(null)
    } catch (error) {
      console.error('Erro ao excluir obra:', error)
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao excluir obra'
      })
    } finally {
      setDeleting(false)
    }
  }

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
    return `${formatNumber(value, 2)} cm`
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">#</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total de Obras</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : (stats?.total || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">▶</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Em Andamento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : (stats?.andamento || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-lg font-semibold text-gray-900">
                  {loading ? '...' : (stats?.concluida || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Faturamento Previsto</p>
                <p className="text-lg font-semibold text-blue-600">
                  {loading ? '...' : formatCurrency(stats?.faturamento_previsto || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">💰</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Faturamento Bruto</p>
                <p className="text-lg font-semibold text-green-600">
                  {loading ? '...' : formatCurrency(stats?.faturamento_bruto || 0)}
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
                { value: 'planejamento', label: 'Planejamento' },
                { value: 'andamento', label: 'Em Andamento' },
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
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p>Carregando obras...</p>
              </div>
            </div>
          ) : (
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
                      <div className="text-sm font-medium text-green-600">
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
                        {obra.status === 'andamento' && (
                          <button
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Concluir obra"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDeleteModal(obra)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Excluir obra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredObras.length === 0 && !loading && (
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
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        <DeleteObraModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          obraNome={obraToDelete?.nome || ''}
          loading={deleting}
        />
      </div>
    </Layout>
  )
}

