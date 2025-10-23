import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
  Trash2,
  Eye,
  Edit,
  FileDown
} from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/format'
import { formatDateSafe } from '../../utils/date-utils'
import { useToast } from '../../lib/toast-hooks'
import type { ContaPagar, StatusContaPagar, ContaPagarEstatisticas } from '../../types/contas-pagar'
import { STATUS_COLORS, calcularDiasParaVencimento, obterStatusVencimento } from '../../types/contas-pagar'
import { contasPagarMock, estatisticasMock } from '../../mocks/contas-pagar-mock'

export default function ContasPagarList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [contas, setContas] = useState<ContaPagar[]>(contasPagarMock)
  const [contasFiltradas, setContasFiltradas] = useState<ContaPagar[]>(contasPagarMock)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusContaPagar | 'Todas'>('Todas')
  const [estatisticas, setEstatisticas] = useState<ContaPagarEstatisticas>(estatisticasMock)

  useEffect(() => {
    carregarContas()
  }, [])

  useEffect(() => {
    filtrarContas()
  }, [searchTerm, filtroStatus, contas])

  const carregarContas = async () => {
    try {
      setLoading(true)
      
      // Simular carregamento com dados mock
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setContas(contasPagarMock)
      setEstatisticas(estatisticasMock)
    } catch (error: any) {
      console.error('Erro ao carregar contas a pagar:', error)
      toast.error('Erro ao carregar contas a pagar')
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = (contas: ContaPagar[]) => {
    const stats: ContaPagarEstatisticas = {
      total_contas: contas.length,
      total_pendente: contas.filter(c => c.status === 'Pendente').length,
      total_pago: contas.filter(c => c.status === 'Paga').length,
      total_atrasado: contas.filter(c => c.status === 'Atrasada').length,
      valor_total_pendente: contas.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + Number(c.valor), 0),
      valor_total_pago: contas.filter(c => c.status === 'Paga').reduce((acc, c) => acc + Number(c.valor_pago || c.valor), 0),
      valor_total_atrasado: contas.filter(c => c.status === 'Atrasada').reduce((acc, c) => acc + Number(c.valor), 0),
      valor_total_geral: contas.reduce((acc, c) => acc + Number(c.valor), 0),
    }
    setEstatisticas(stats)
  }

  const filtrarContas = () => {
    let resultado = [...contas]

    // Filtro por status
    if (filtroStatus !== 'Todas') {
      resultado = resultado.filter(conta => conta.status === filtroStatus)
    }

    // Filtro por busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase()
      resultado = resultado.filter(conta => 
        conta.numero_nota?.toLowerCase().includes(termo) ||
        conta.fornecedor?.toLowerCase().includes(termo) ||
        conta.descricao?.toLowerCase().includes(termo) ||
        conta.categoria?.toLowerCase().includes(termo)
      )
    }

    setContasFiltradas(resultado)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return

    try {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Conta excluída com sucesso!')
      carregarContas()
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      toast.error('Erro ao excluir conta')
    }
  }

  const handleDownloadAnexo = (anexoUrl: string, numeroNota: string) => {
    window.open(anexoUrl, '_blank')
  }

  const getStatusIcon = (status: StatusContaPagar) => {
    switch (status) {
      case 'Paga':
        return <CheckCircle2 className="h-4 w-4" />
      case 'Pendente':
        return <Clock className="h-4 w-4" />
      case 'Atrasada':
        return <AlertCircle className="h-4 w-4" />
      case 'Cancelada':
        return <XCircle className="h-4 w-4" />
    }
  }

  const getDiasVencimentoDisplay = (conta: ContaPagar) => {
    if (conta.status === 'Paga' || conta.status === 'Cancelada') return null
    
    const dias = calcularDiasParaVencimento(conta.data_vencimento)
    
    if (dias < 0) {
      return (
        <span className="text-xs text-red-600 font-medium">
          Atrasado há {Math.abs(dias)} dia(s)
        </span>
      )
    } else if (dias === 0) {
      return (
        <span className="text-xs text-orange-600 font-medium">
          Vence hoje
        </span>
      )
    } else if (dias <= 7) {
      return (
        <span className="text-xs text-yellow-600 font-medium">
          Vence em {dias} dia(s)
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando contas a pagar...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary-600" />
              Contas a Pagar
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie suas contas e notas fiscais a pagar
            </p>
          </div>
          <button
            onClick={() => navigate('/contas-pagar/nova')}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nova Conta
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Contas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {estatisticas.total_contas}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(estatisticas.valor_total_geral)} no total
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {estatisticas.total_pendente}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(estatisticas.valor_total_pendente)} a pagar
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pagas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {estatisticas.total_pago}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(estatisticas.valor_total_pago)} pagos
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {estatisticas.total_atrasado}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatCurrency(estatisticas.valor_total_atrasado)} em atraso
            </p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número da nota, fornecedor, descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro Status */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as StatusContaPagar | 'Todas')}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Todas">Todas</option>
                <option value="Pendente">Pendentes</option>
                <option value="Paga">Pagas</option>
                <option value="Atrasada">Atrasadas</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Contas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {contasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filtroStatus !== 'Todas' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece adicionando sua primeira conta a pagar.'
                }
              </p>
              {!searchTerm && filtroStatus === 'Todas' && (
                <button
                  onClick={() => navigate('/contas-pagar/nova')}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Nova Conta
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número da Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anexo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contasFiltradas.map((conta) => (
                    <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {conta.numero_nota}
                          </span>
                          {conta.categoria && (
                            <span className="text-xs text-gray-500">
                              {conta.categoria}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {conta.fornecedor || '-'}
                          </span>
                          {conta.descricao && (
                            <span className="text-xs text-gray-500 truncate max-w-xs">
                              {conta.descricao}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(conta.valor))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDateSafe(conta.data_vencimento)}
                          </span>
                          {getDiasVencimentoDisplay(conta)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[conta.status].badge}`}>
                          {getStatusIcon(conta.status)}
                          {conta.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {conta.anexo_url ? (
                          <button
                            onClick={() => handleDownloadAnexo(conta.anexo_url!, conta.numero_nota)}
                            className="text-primary-600 hover:text-primary-700"
                            title="Baixar anexo"
                          >
                            <FileDown className="h-5 w-5" />
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/contas-pagar/${conta.id}`)}
                            className="text-gray-600 hover:text-primary-600 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/contas-pagar/${conta.id}/editar`)}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleExcluir(conta.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé com totais */}
        {contasFiltradas.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Mostrando {contasFiltradas.length} de {contas.length} conta(s)
              </span>
              <div className="flex items-center gap-6">
                <span className="text-gray-900 font-medium">
                  Total: {formatCurrency(contasFiltradas.reduce((acc, c) => acc + Number(c.valor), 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

