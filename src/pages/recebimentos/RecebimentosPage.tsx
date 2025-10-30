import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Filter,
  Search,
  Download,
  Eye,
  Plus,
  Smartphone,
  Banknote,
  CheckSquare,
  Receipt,
  Building2,
  X
} from 'lucide-react'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
// import { Select } from "../../components/shared/Select"
import { Loading } from "../../components/shared/Loading"
import { useToast } from '../../lib/toast-hooks'
import { getAllNotasFiscais, getRecebimentosKPIs } from '../../lib/obrasNotasFiscaisApi'
import { getAllPagamentosDiretos } from '../../lib/obrasPagamentosDiretosApi'
import { formatDateToBR } from '../../utils/date-utils'
import { formatarStatusNota } from '../../utils/notas-fiscais-utils'
import type { ObraNotaFiscal } from '../../types/obras-financeiro'
import type { ObraPagamentoDireto, FormaPagamento } from '../../types/obras-pagamentos'

// ⚙️ MODO MOCK - Conectado ao banco de dados real
const USE_MOCK = false

// Mock data para recebimentos consolidados
const mockNotasFiscais: Array<ObraNotaFiscal & { obra_nome?: string }> = [
  {
    id: '1',
    obra_id: '1',
    numero_nota: 'NF-001',
    valor_nota: 45000.00,
    vencimento: '2025-01-15',
    desconto_inss: 2250.00,
    desconto_iss: 2250.00,
    outro_desconto: 0,
    valor_liquido: 40500.00,
    status: 'paga',
    data_pagamento: '2025-01-10',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-001.pdf',
    observacoes: 'Pagamento antecipado',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    obra_nome: 'Pavimentação Rua das Flores - Osasco'
  },
  {
    id: '2',
    obra_id: '1',
    numero_nota: 'NF-002',
    valor_nota: 30000.00,
    vencimento: '2025-01-25',
    desconto_inss: 1500.00,
    desconto_iss: 1500.00,
    outro_desconto: 0,
    valor_liquido: 27000.00,
    status: 'pendente',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-002.pdf',
    observacoes: 'Aguardando pagamento',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    obra_nome: 'Pavimentação Rua das Flores - Osasco'
  },
  {
    id: '3',
    obra_id: '2',
    numero_nota: 'NF-003',
    valor_nota: 25000.00,
    vencimento: '2025-01-20',
    desconto_inss: 1250.00,
    desconto_iss: 1250.00,
    outro_desconto: 0,
    valor_liquido: 22500.00,
    status: 'vencido',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-003.pdf',
    observacoes: 'Vencida - aguardando renegociação',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
    obra_nome: 'Avenida Central - Barueri'
  }
]

const mockPagamentosDiretos: Array<ObraPagamentoDireto & { obra_nome?: string }> = [
  {
    id: '1',
    obra_id: '1',
    descricao: 'PIX - Avanço de Pagamento',
    valor: 15000.00,
    data_pagamento: '2025-01-15',
    forma_pagamento: 'pix',
    comprovante_url: 'https://exemplo.com/comprovantes/pix-avancao.pdf',
    observacoes: 'Avanço de 30% do valor total',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
    obra_nome: 'Pavimentação Rua das Flores - Osasco'
  },
  {
    id: '2',
    obra_id: '1',
    descricao: 'Transferência - Pagamento Final',
    valor: 25000.00,
    data_pagamento: '2025-01-20',
    forma_pagamento: 'transferencia',
    comprovante_url: 'https://exemplo.com/comprovantes/transferencia-final.pdf',
    observacoes: 'Pagamento final da obra',
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
    obra_nome: 'Pavimentação Rua das Flores - Osasco'
  },
  {
    id: '3',
    obra_id: '2',
    descricao: 'PIX - Pagamento Mensal',
    valor: 12000.00,
    data_pagamento: '2025-01-25',
    forma_pagamento: 'pix',
    observacoes: 'Pagamento mensal de janeiro',
    created_at: '2025-01-25T00:00:00Z',
    updated_at: '2025-01-25T00:00:00Z',
    obra_nome: 'Avenida Central - Barueri'
  }
]

const mockKPIs = {
  total_recebimentos: 142500.00, // Todos os recebimentos (pago + pendente + vencido)
  total_faturamento_bruto: 92500.00, // Apenas os pagos (40500 + 52000)
  total_pendentes: 27000.00, // Notas pendentes
  total_vencidos: 22500.00 // Notas vencidas
}

export function RecebimentosPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [notasFiscais, setNotasFiscais] = useState<Array<ObraNotaFiscal & { obra_nome?: string }>>([])
  const [pagamentosDiretos, setPagamentosDiretos] = useState<Array<ObraPagamentoDireto & { obra_nome?: string }>>([])
  const [kpis, setKpis] = useState(mockKPIs)
  const [showModalDetalhes, setShowModalDetalhes] = useState(false)
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState<any>(null)
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: 'todos', // todos, notas-fiscais, pagamentos-diretos
    status: 'todos', // todos, pago, pendente, vencido, renegociado
    data_inicio: '',
    data_fim: ''
  })

  useEffect(() => {
    loadRecebimentos()
  }, [])

  const loadRecebimentos = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setNotasFiscais(mockNotasFiscais)
        setPagamentosDiretos(mockPagamentosDiretos)
        setKpis(mockKPIs)
      } else {
        try {
          // Buscar TODAS as notas fiscais (pago, pendente, vencido)
          const notas = await getAllNotasFiscais()
          setNotasFiscais(notas || [])
        } catch (e) {
          console.error('Erro ao carregar notas fiscais:', e)
          setNotasFiscais([])
        }
        
        try {
          // Buscar pagamentos diretos
          const pagamentos = await getAllPagamentosDiretos()
          setPagamentosDiretos(pagamentos || [])
        } catch (e) {
          console.error('Erro ao carregar pagamentos diretos:', e)
          setPagamentosDiretos([])
        }
        
        try {
          // Buscar KPIs
          const kpisData = await getRecebimentosKPIs()
          console.log('📊 [RecebimentosPage] KPIs recebidos:', kpisData)
          console.log('📊 [RecebimentosPage] Total Recebimentos:', kpisData?.total_recebimentos)
          console.log('📊 [RecebimentosPage] Faturamento Bruto:', kpisData?.total_faturamento_bruto)
          console.log('📊 [RecebimentosPage] Pendentes:', kpisData?.total_pendentes)
          console.log('📊 [RecebimentosPage] Vencidos:', kpisData?.total_vencidos)
          setKpis(kpisData || mockKPIs)
        } catch (e) {
          console.error('Erro ao carregar KPIs:', e)
          setKpis(mockKPIs)
        }
      }
    } catch (error) {
      console.error('Erro geral ao carregar recebimentos:', error)
      addToast({
        type: 'error',
        title: 'Erro ao carregar recebimentos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const getFormaPagamentoInfo = (forma: FormaPagamento) => {
    const formas = {
      'pix': { label: 'PIX', icon: <Smartphone className="h-4 w-4" />, color: 'text-green-600' },
      'transferencia': { label: 'Transferência', icon: <CreditCard className="h-4 w-4" />, color: 'text-blue-600' },
      'dinheiro': { label: 'Dinheiro', icon: <Banknote className="h-4 w-4" />, color: 'text-yellow-600' },
      'cheque': { label: 'Cheque', icon: <CheckSquare className="h-4 w-4" />, color: 'text-purple-600' },
      'outro': { label: 'Outro', icon: <Receipt className="h-4 w-4" />, color: 'text-gray-600' }
    }
    return formas[forma] || formas.outro
  }

  const getStatusInfo = (status: string) => {
    return formatarStatusNota(status as any)
  }

  const handleVerDetalhes = (recebimento: any) => {
    setRecebimentoSelecionado(recebimento)
    setShowModalDetalhes(true)
  }

  const handleFecharModal = () => {
    setShowModalDetalhes(false)
    setRecebimentoSelecionado(null)
  }

  const recebimentosFiltrados = [
    // Todas as notas fiscais (pago, pendente, vencido)
    ...(notasFiscais || []).map(nota => ({
      id: `nf-${nota.id}`,
      tipo: 'nota-fiscal' as const,
      descricao: `Nota Fiscal ${nota.numero_nota || 'N/A'}`,
      obra: (nota as any).obra_nome || 'Obra não encontrada',
      valor: nota.valor_liquido || 0,
      data: nota.data_pagamento || nota.vencimento || new Date().toISOString(),
      status: nota.status,
      forma_pagamento: 'nota-fiscal' as FormaPagamento,
      arquivo_url: nota.arquivo_nota_url,
      observacoes: nota.observacoes,
      dados_originais: nota
    })),
    // Pagamentos diretos (sempre pagos)
    ...(pagamentosDiretos || []).map(pag => ({
      id: `pd-${pag.id}`,
      tipo: 'pagamento-direto' as const,
      descricao: pag.descricao || '',
      obra: (pag as any).obra_nome || 'Obra não encontrada',
      valor: pag.valor || 0,
      data: pag.data_pagamento || new Date().toISOString(),
      status: 'paga' as const,
      forma_pagamento: pag.forma_pagamento,
      arquivo_url: pag.comprovante_url,
      observacoes: pag.observacoes,
      dados_originais: pag
    }))
  ].filter(item => {
    // Aplicar filtros
    if (filtros.busca && !item.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) && 
        !item.obra.toLowerCase().includes(filtros.busca.toLowerCase())) {
      return false
    }
    
    if (filtros.tipo !== 'todos' && item.tipo !== filtros.tipo) {
      return false
    }
    
    if (filtros.status !== 'todos' && item.status !== filtros.status) {
      return false
    }
    
    if (filtros.data_inicio && item.data < filtros.data_inicio) {
      return false
    }
    
    if (filtros.data_fim && item.data > filtros.data_fim) {
      return false
    }
    
    return true
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recebimentos</h1>
            <p className="text-gray-600 mt-1">
              Todos os pagamentos aprovados e recebidos
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Recebimentos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Total de Recebimentos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(kpis.total_recebimentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Pago + Pendente + Vencido</p>
              </div>
            </div>
          </div>

          {/* Faturamento Bruto */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Faturamento Bruto</h3>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(kpis.total_faturamento_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Apenas pagos</p>
              </div>
            </div>
          </div>

          {/* Pendentes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Pendentes</h3>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(kpis.total_pendentes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Aguardando pagamento</p>
              </div>
            </div>
          </div>

          {/* Vencidos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Vencidos</h3>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {(kpis.total_vencidos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500">Necessitam ação</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Descrição ou obra..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="nota-fiscal">Notas Fiscais</option>
                <option value="pagamento-direto">Pagamentos Diretos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="vencido">Vencido</option>
                <option value="renegociado">Renegociado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Lista de Recebimentos */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recebimentos ({recebimentosFiltrados.length})
            </h3>
          </div>

          {recebimentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum recebimento encontrado
              </h3>
              <p className="text-gray-500">
                Ajuste os filtros ou aguarde novos recebimentos
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Forma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recebimentosFiltrados.map((recebimento) => {
                    const formaInfo = getFormaPagamentoInfo(recebimento.forma_pagamento)
                    const statusInfo = getStatusInfo(recebimento.status)
                    
                    return (
                      <tr key={recebimento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {recebimento.tipo === 'nota-fiscal' ? (
                              <FileText className="h-4 w-4 text-blue-600" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-purple-600" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {recebimento.tipo === 'nota-fiscal' ? 'Nota Fiscal' : 'Pagamento Direto'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {recebimento.descricao}
                            </div>
                            {recebimento.observacoes && (
                              <div className="text-sm text-gray-500">
                                {recebimento.observacoes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {recebimento.obra}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            R$ {recebimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatDateToBR(recebimento.data)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={formaInfo.color}>
                              {formaInfo.icon}
                            </span>
                            <span className="text-sm text-gray-900">
                              {formaInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.cor}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerDetalhes(recebimento)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {recebimento.arquivo_url && (
                              <a
                                href={recebimento.arquivo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="Baixar arquivo"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalhes */}
        {showModalDetalhes && recebimentoSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 rounded-lg p-2">
                    {recebimentoSelecionado.tipo === 'nota-fiscal' ? (
                      <FileText className="h-6 w-6 text-white" />
                    ) : (
                      <CreditCard className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {recebimentoSelecionado.tipo === 'nota-fiscal' ? 'Detalhes da Nota Fiscal' : 'Detalhes do Pagamento Direto'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {recebimentoSelecionado.descricao}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFecharModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Informações Principais */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-900 font-semibold mb-1">
                        Valor {recebimentoSelecionado.tipo === 'nota-fiscal' ? 'Líquido' : 'Pago'}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        R$ {recebimentoSelecionado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-900 font-semibold mb-1">
                        Status
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-900">
                        {recebimentoSelecionado.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações da Obra */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Obra</h4>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{recebimentoSelecionado.obra}</span>
                  </div>
                </div>

                {/* Informações de Data */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Datas</h4>
                  <div className="space-y-2">
                    {recebimentoSelecionado.tipo === 'nota-fiscal' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Vencimento:</span>
                          <span className="text-sm text-gray-900">{formatDateToBR(recebimentoSelecionado.dados_originais?.vencimento || '')}</span>
                        </div>
                        {recebimentoSelecionado.status === 'pago' && recebimentoSelecionado.dados_originais?.data_pagamento && (
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Data de Pagamento:</span>
                            <span className="text-sm text-gray-900">{formatDateToBR(recebimentoSelecionado.dados_originais.data_pagamento)}</span>
                          </div>
                        )}
                      </>
                    )}
                    {recebimentoSelecionado.tipo === 'pagamento-direto' && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Data de Pagamento:</span>
                        <span className="text-sm text-gray-900">{formatDateToBR(recebimentoSelecionado.data)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Forma de Pagamento */}
                {recebimentoSelecionado.tipo === 'pagamento-direto' && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Forma de Pagamento</h4>
                    <div className="flex items-center gap-2">
                      {getFormaPagamentoInfo(recebimentoSelecionado.forma_pagamento).icon}
                      <span className="text-gray-900">{getFormaPagamentoInfo(recebimentoSelecionado.forma_pagamento).label}</span>
                    </div>
                  </div>
                )}

                {/* Detalhes Adicionais (Nota Fiscal) */}
                {recebimentoSelecionado.tipo === 'nota-fiscal' && recebimentoSelecionado.dados_originais && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Valores da Nota Fiscal</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valor Bruto:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          R$ {(recebimentoSelecionado.dados_originais.valor_nota || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Desconto INSS:</span>
                        <span className="text-sm text-gray-900">
                          R$ {(recebimentoSelecionado.dados_originais.desconto_inss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Desconto ISS:</span>
                        <span className="text-sm text-gray-900">
                          R$ {(recebimentoSelecionado.dados_originais.desconto_iss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Outros Descontos:</span>
                        <span className="text-sm text-gray-900">
                          R$ {(recebimentoSelecionado.dados_originais.outro_desconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Valor Líquido:</span>
                        <span className="text-sm font-bold text-blue-900">
                          R$ {recebimentoSelecionado.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {recebimentoSelecionado.observacoes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Observações</h4>
                    <p className="text-sm text-gray-700">{recebimentoSelecionado.observacoes}</p>
                  </div>
                )}

                {/* Arquivo */}
                {recebimentoSelecionado.arquivo_url && (
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {recebimentoSelecionado.tipo === 'nota-fiscal' ? 'Arquivo da Nota Fiscal' : 'Comprovante'}
                    </h4>
                    <a
                      href={recebimentoSelecionado.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Visualizar/Abrir Arquivo</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t">
                <Button variant="outline" onClick={handleFecharModal}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
