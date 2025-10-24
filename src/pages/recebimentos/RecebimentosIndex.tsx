import React, { useState, useEffect, useMemo } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
import { Select } from "../../components/shared/Select"
import { Loading } from "../../components/shared/Loading"
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  Search, 
  Eye, 
  CheckCircle,
  FileText,
  Calendar as CalendarIcon,
  Info
} from 'lucide-react'
import { useToast } from '../../lib/toast-hooks'
import { useNavigate } from 'react-router-dom'
import { 
  getAllNotasFiscais, 
  getRecebimentosKPIs,
  verificarNotasVencidas 
} from '../../lib/obrasNotasFiscaisApi'
import { formatarStatusNota, diasParaVencimento } from '../../utils/notas-fiscais-utils'
import { formatDateToBR } from '../../utils/date-utils'
import { MarcarComoPagoModal } from '../../components/recebimentos/MarcarComoPagoModal'
import { DetalhesNotaFiscalModal } from '../../components/obras/DetalhesNotaFiscalModal'
import type { ObraNotaFiscal, NotaFiscalStatus } from '../../types/obras-financeiro'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

const mockNotasRecebimentos: Array<ObraNotaFiscal & { obra_nome?: string }> = [
  {
    id: '1',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    numero_nota: 'NF-2025-001',
    valor_nota: 45000.00,
    vencimento: '2025-02-15',
    desconto_inss: 1350.00,
    desconto_iss: 900.00,
    outro_desconto: 0,
    valor_liquido: 42750.00,
    status: 'pendente',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-001.pdf',
    observacoes: 'Primeira medição da obra - Ruas A e B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    numero_nota: 'NF-2025-002',
    valor_nota: 38500.00,
    vencimento: '2025-01-28',
    desconto_inss: 1155.00,
    desconto_iss: 770.00,
    outro_desconto: 200.00,
    valor_liquido: 36375.00,
    status: 'pago',
    data_pagamento: '2025-01-25',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-002.pdf',
    observacoes: 'Pagamento antecipado - desconto negociado',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    numero_nota: 'NF-2024-098',
    valor_nota: 52000.00,
    vencimento: '2025-01-10',
    desconto_inss: 1560.00,
    desconto_iss: 1040.00,
    outro_desconto: 0,
    valor_liquido: 49400.00,
    status: 'vencido',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2024-098.pdf',
    observacoes: 'Aguardando regularização do cliente',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    numero_nota: 'NF-2025-003',
    valor_nota: 41000.00,
    vencimento: '2025-02-28',
    desconto_inss: 1230.00,
    desconto_iss: 820.00,
    outro_desconto: 500.00,
    valor_liquido: 38450.00,
    status: 'renegociado',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-003.pdf',
    observacoes: 'Valores ajustados conforme reunião do dia 20/01',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    obra_id: '2',
    obra_nome: 'Avenida Central - São Paulo',
    numero_nota: 'NF-2025-010',
    valor_nota: 78000.00,
    vencimento: '2025-02-05',
    desconto_inss: 2340.00,
    desconto_iss: 1560.00,
    outro_desconto: 0,
    valor_liquido: 74100.00,
    status: 'pendente',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-010.pdf',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockKPIs = {
  total_a_receber: 166150.00,  // NF-001 (42.750) + NF-098 (49.400) + NF-003 (38.450) + NF-010 (74.100) - vencido
  total_recebido: 36375.00,    // NF-002 (36.375) - pago
  total_vencido: 49400.00,     // NF-098 (49.400)
  proximos_vencimentos: 74100.00  // NF-010 vence em 2025-02-05 (próximos 7 dias)
}

export default function RecebimentosIndex() {
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [notas, setNotas] = useState<Array<ObraNotaFiscal & { obra_nome?: string }>>([])
  const [kpis, setKpis] = useState({
    total_a_receber: 0,
    total_recebido: 0,
    total_vencido: 0,
    proximos_vencimentos: 0
  })

  // Estados de filtros
  const [filtroObra, setFiltroObra] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<NotaFiscalStatus | ''>('')
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState('')
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState('')

  // Estados dos modais
  const [modalMarcarPago, setModalMarcarPago] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<(ObraNotaFiscal & { obra_nome?: string }) | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setNotas(mockNotasRecebimentos)
        setKpis(mockKPIs)
      } else {
        // Verificar notas vencidas antes de carregar
        const [notasData, kpisData] = await Promise.all([
          getAllNotasFiscais(),
          getRecebimentosKPIs()
        ])
        
        setNotas(notasData)
        setKpis(kpisData)
      }
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error)
      addToast({
        type: 'error',
        message: 'Erro ao carregar recebimentos'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarComoPago = (nota: ObraNotaFiscal & { obra_nome?: string }) => {
    setNotaSelecionada(nota)
    setModalMarcarPago(true)
  }

  const handleVerDetalhes = (nota: ObraNotaFiscal & { obra_nome?: string }) => {
    setNotaSelecionada(nota)
    setModalDetalhes(true)
  }

  // Aplicar filtros
  const notasFiltradas = useMemo(() => {
    let resultado = [...notas]

    // Filtro por obra
    if (filtroObra) {
      resultado = resultado.filter(n => 
        n.obra_nome?.toLowerCase().includes(filtroObra.toLowerCase()) ||
        n.numero_nota.toLowerCase().includes(filtroObra.toLowerCase())
      )
    }

    // Filtro por status
    if (filtroStatus) {
      resultado = resultado.filter(n => n.status === filtroStatus)
    }

    // Filtro por período
    if (filtroPeriodoInicio) {
      resultado = resultado.filter(n => n.vencimento >= filtroPeriodoInicio)
    }
    if (filtroPeriodoFim) {
      resultado = resultado.filter(n => n.vencimento <= filtroPeriodoFim)
    }

    return resultado
  }, [notas, filtroObra, filtroStatus, filtroPeriodoInicio, filtroPeriodoFim])

  const totalDescontos = (nota: ObraNotaFiscal) => {
    return nota.desconto_inss + nota.desconto_iss + nota.outro_desconto
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
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
            <h1 className="text-2xl font-bold text-gray-900">Recebimentos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as notas fiscais e recebimentos das obras
            </p>
          </div>
          <Button onClick={loadData} variant="outline">
            Atualizar
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total a Receber */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total a Receber</h3>
              <AlertCircle className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mb-1">
              R$ {kpis.total_a_receber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-80">Pendentes + Vencidas</p>
          </div>

          {/* Total Recebido */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Recebido</h3>
              <CheckCircle className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mb-1">
              R$ {kpis.total_recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-80">Notas Pagas</p>
          </div>

          {/* Total Vencido */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Vencido</h3>
              <AlertCircle className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mb-1">
              R$ {kpis.total_vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-80">Atenção Necessária</p>
          </div>

          {/* Próximos Vencimentos */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Próximos Vencimentos</h3>
              <Clock className="h-5 w-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold mb-1">
              R$ {kpis.proximos_vencimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs opacity-80">Próximos 7 dias</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Buscar por Obra/Nota */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Obra ou Nº da Nota"
                  value={filtroObra}
                  onChange={(e) => setFiltroObra(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as NotaFiscalStatus | '')}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
                <option value="renegociado">Renegociado</option>
              </Select>
            </div>

            {/* Período Início */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vencimento De
              </label>
              <Input
                type="date"
                value={filtroPeriodoInicio}
                onChange={(e) => setFiltroPeriodoInicio(e.target.value)}
              />
            </div>

            {/* Período Fim */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vencimento Até
              </label>
              <Input
                type="date"
                value={filtroPeriodoFim}
                onChange={(e) => setFiltroPeriodoFim(e.target.value)}
              />
            </div>
          </div>

          {/* Limpar Filtros */}
          {(filtroObra || filtroStatus || filtroPeriodoInicio || filtroPeriodoFim) && (
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFiltroObra('')
                  setFiltroStatus('')
                  setFiltroPeriodoInicio('')
                  setFiltroPeriodoFim('')
                }}
                className="text-xs"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Tabela de Notas Fiscais */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notas Fiscais
              </h3>
              <p className="text-sm text-gray-500">
                {notasFiltradas.length} {notasFiltradas.length === 1 ? 'nota encontrada' : 'notas encontradas'}
              </p>
            </div>
          </div>

          {notasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Nenhuma nota encontrada
              </h3>
              <p className="text-sm text-gray-500">
                {filtroObra || filtroStatus || filtroPeriodoInicio || filtroPeriodoFim
                  ? 'Tente ajustar os filtros'
                  : 'Nenhuma nota fiscal cadastrada'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Bruto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descontos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Líquido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
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
                  {notasFiltradas.map((nota) => {
                    const statusInfo = formatarStatusNota(nota.status)
                    const diasVencimento = diasParaVencimento(nota.vencimento)
                    const podeMarcarPago = nota.status === 'emitida' || nota.status === 'enviada'

                    return (
                      <tr key={nota.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/obras/${nota.obra_id}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {nota.obra_nome || 'Obra sem nome'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {nota.numero_nota}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            R$ {nota.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-red-600">
                            - R$ {totalDescontos(nota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            R$ {nota.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {formatDateToBR(nota.vencimento)}
                            </span>
                            {nota.status === 'pendente' && diasVencimento >= 0 && diasVencimento <= 7 && (
                              <span className="text-xs text-orange-600">
                                Vence em {diasVencimento} {diasVencimento === 1 ? 'dia' : 'dias'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.cor}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVerDetalhes(nota)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalhes"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                            {nota.arquivo_nota_url && (
                              <a
                                href={nota.arquivo_nota_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="Visualizar PDF"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            )}
                            {podeMarcarPago && (
                              <Button
                                onClick={() => handleMarcarComoPago(nota)}
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                Marcar como Pago
                              </Button>
                            )}
                            {nota.status === 'pago' && nota.data_pagamento && (
                              <span className="text-xs text-gray-500">
                                Pago em {formatDateToBR(nota.data_pagamento)}
                              </span>
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
      </div>

      {/* Modais */}
      <MarcarComoPagoModal
        isOpen={modalMarcarPago}
        onClose={() => {
          setModalMarcarPago(false)
          setNotaSelecionada(null)
        }}
        nota={notaSelecionada}
        onSuccess={loadData}
      />

      <DetalhesNotaFiscalModal
        isOpen={modalDetalhes}
        onClose={() => {
          setModalDetalhes(false)
          setNotaSelecionada(null)
        }}
        nota={notaSelecionada}
      />
    </Layout>
  )
}

