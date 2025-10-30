import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { format } from 'date-fns'
import { Badge } from "../../components/shared/Badge"
import { useAuth } from '../../lib/auth-hooks'
import { WorkScheduling } from '../../components/shared/WorkScheduling'
import { formatDateToBR } from '../../utils/date-utils'
import { useToast } from '../../lib/toast-hooks'
import { getClienteById, type Cliente } from '../../lib/clientesApi'
import { getObras, type Obra } from '../../lib/obrasApi'
import { supabase } from '../../lib/supabase'
import { ProgramacaoDetalhesModal } from '../../components/programacao/ProgramacaoDetalhesModal'
import { ProgramacaoPavimentacaoAPI, type ProgramacaoPavimentacaoWithDetails } from '../../lib/programacao-pavimentacao-api'
import { ContratosAPI, type ContratoWithDetails } from '../../lib/contratos-api'
import { DocumentacaoAPI, type DocumentacaoWithDetails } from '../../lib/documentacao-api'
import { NovoContratoModal } from '../../components/contratos/NovoContratoModal'
import { NovaDocumentacaoModal } from '../../components/documentacao/NovaDocumentacaoModal'
import { DetalhesContratoModal } from '../../components/contratos/DetalhesContratoModal'
import { EditarContratoModal } from '../../components/contratos/EditarContratoModal'
import { DetalhesDocumentacaoModal } from '../../components/documentacao/DetalhesDocumentacaoModal'
import { EditarDocumentacaoModal } from '../../components/documentacao/EditarDocumentacaoModal'

type Report = {
  id: string
  report_number: string
  date: string
  realized_volume: number | null
  total_value: number | null
  status: 'PENDENTE' | 'CONFIRMADO' | 'PAGO' | 'NOTA_EMITIDA'
  work_id?: string | null
  client_id?: string | null
}

function currency(v: number | null | undefined) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export default function ClientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<Cliente | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [works, setWorks] = useState<Obra[]>([])
  const [contracts, setContracts] = useState<ContratoWithDetails[]>([])
  const [documentacao, setDocumentacao] = useState<DocumentacaoWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'reports' | 'contracts' | 'scheduling' | 'documentation'>('overview')
  
  // Estados para programações
  const [programacoes, setProgramacoes] = useState<ProgramacaoPavimentacaoWithDetails[]>([])
  const [programacaoSelecionada, setProgramacaoSelecionada] = useState<ProgramacaoPavimentacaoWithDetails | null>(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  
  // Estados para modais
  const [showNovoContratoModal, setShowNovoContratoModal] = useState(false)
  const [showNovaDocumentacaoModal, setShowNovaDocumentacaoModal] = useState(false)
  
  // Estados para detalhes e edição de contratos
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoWithDetails | null>(null)
  const [showDetalhesContratoModal, setShowDetalhesContratoModal] = useState(false)
  const [showEditarContratoModal, setShowEditarContratoModal] = useState(false)
  
  // Estados para detalhes e edição de documentação
  const [documentacaoSelecionada, setDocumentacaoSelecionada] = useState<DocumentacaoWithDetails | null>(null)
  const [showDetalhesDocumentacaoModal, setShowDetalhesDocumentacaoModal] = useState(false)
  const [showEditarDocumentacaoModal, setShowEditarDocumentacaoModal] = useState(false)


  const canSeeRevenue = useMemo(() => {
    const role = (user?.user_metadata as any)?.role
    return role === 'admin' || role === 'financeiro'
  }, [user])

  // Função para buscar obras do cliente
  async function fetchWorks(clientId: string, companyId: string): Promise<Obra[]> {
    try {
      const { data } = await getObras(companyId, { client_id: clientId })
      return data || []
    } catch (error) {
      console.error('Erro ao buscar obras do cliente:', error)
      return []
    }
  }

  // Função para buscar relatórios do cliente
  async function fetchReports(clientId: string): Promise<Report[]> {
    try {
      // TODO: Implementar busca real de relatórios quando a estrutura estiver definida
      // Por enquanto, retornamos array vazio já que a tabela reports não tem client_id
      console.log('Busca de relatórios por cliente ainda não implementada')
      return []
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error)
      return []
    }
  }

  // Função para buscar contratos do cliente
  async function fetchContracts(clientId: string): Promise<ContratoWithDetails[]> {
    try {
      const contratos = await ContratosAPI.getByClientId(clientId)
      return contratos
    } catch (error) {
      console.error('Erro ao buscar contratos:', error)
      return []
    }
  }

  // Função para buscar documentação do cliente
  async function fetchDocumentacao(clientId: string): Promise<DocumentacaoWithDetails[]> {
    try {
      const docs = await DocumentacaoAPI.getByClientId(clientId)
      return docs
    } catch (error) {
      console.error('Erro ao buscar documentação:', error)
      return []
    }
  }

  // Função para buscar programações do cliente
  async function fetchProgramacoes(clientId: string) {
    try {
      const progs = await ProgramacaoPavimentacaoAPI.getByClientId(clientId)
      setProgramacoes(progs)
      return progs
    } catch (error) {
      console.error('Erro ao buscar programações:', error)
      return []
    }
  }
  
  // Função para abrir modal de detalhes
  const abrirDetalhes = (programacao: ProgramacaoPavimentacaoWithDetails) => {
    setProgramacaoSelecionada(programacao)
    setShowDetalhesModal(true)
  }
  
  // Função para fechar modal
  const fecharDetalhes = () => {
    setShowDetalhesModal(false)
    setProgramacaoSelecionada(null)
  }

  // Funções para contratos
  const abrirDetalhesContrato = (contrato: ContratoWithDetails) => {
    setContratoSelecionado(contrato)
    setShowDetalhesContratoModal(true)
  }

  const fecharDetalhesContrato = () => {
    setShowDetalhesContratoModal(false)
    setContratoSelecionado(null)
  }

  const abrirEditarContrato = (contrato: ContratoWithDetails) => {
    setContratoSelecionado(contrato)
    setShowEditarContratoModal(true)
    setShowDetalhesContratoModal(false)
  }

  const fecharEditarContrato = () => {
    setShowEditarContratoModal(false)
    setContratoSelecionado(null)
  }

  const handleDeletarContrato = async () => {
    if (!contratoSelecionado || !client) return
    
    if (!confirm(`Tem certeza que deseja excluir o contrato "${contratoSelecionado.name}"?`)) {
      return
    }

    try {
      await ContratosAPI.delete(contratoSelecionado.id)
      alert('Contrato excluído com sucesso!')
      
      // Recarregar contratos
      const newContracts = await fetchContracts(client.id)
      setContracts(newContracts)
      
      fecharDetalhesContrato()
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir contrato.')
    }
  }

  // Funções para documentação
  const abrirDetalhesDocumentacao = (doc: DocumentacaoWithDetails) => {
    setDocumentacaoSelecionada(doc)
    setShowDetalhesDocumentacaoModal(true)
  }

  const fecharDetalhesDocumentacao = () => {
    setShowDetalhesDocumentacaoModal(false)
    setDocumentacaoSelecionada(null)
  }

  const abrirEditarDocumentacao = (doc: DocumentacaoWithDetails) => {
    setDocumentacaoSelecionada(doc)
    setShowEditarDocumentacaoModal(true)
    setShowDetalhesDocumentacaoModal(false)
  }

  const fecharEditarDocumentacao = () => {
    setShowEditarDocumentacaoModal(false)
    setDocumentacaoSelecionada(null)
  }

  const handleDeletarDocumentacao = async () => {
    if (!documentacaoSelecionada || !client) return
    
    if (!confirm(`Tem certeza que deseja excluir a documentação "${documentacaoSelecionada.name}"?`)) {
      return
    }

    try {
      await DocumentacaoAPI.delete(documentacaoSelecionada.id)
      alert('Documentação excluída com sucesso!')
      
      // Recarregar documentação
      const newDocs = await fetchDocumentacao(client.id)
      setDocumentacao(newDocs)
      
      fecharDetalhesDocumentacao()
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir documentação.')
    }
  }

  async function fetchAll() {
    if (!id) return
    setLoading(true)
    setError(null)
    
    try {
      // Buscar dados reais do cliente
      const clientData = await getClienteById(id)
      
      if (!clientData) {
        throw new Error('Cliente não encontrado')
      }
      
      setClient(clientData)

      // Buscar dados reais em paralelo
      const [worksData, reportsData, contractsData, documentacaoData, programacoesData] = await Promise.all([
        fetchWorks(id, clientData.company_id),
        fetchReports(id),
        fetchContracts(id),
        fetchDocumentacao(id),
        fetchProgramacoes(id)
      ])

      setWorks(worksData)
      setReports(reportsData)
      setContracts(contractsData)
      setDocumentacao(documentacaoData)
      setProgramacoes(programacoesData)

      setLoading(false)
    } catch (err: any) {
      console.error('Erro ao buscar cliente:', err)
      setError(err?.message || 'Erro ao carregar dados do cliente')
      addToast({ message: 'Erro ao carregar dados do cliente', type: 'error' })
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const totalFaturado = useMemo(() => {
    return reports.reduce((acc, r) => acc + (Number(r.total_value) || 0), 0)
  }, [reports])

  const totalObras = useMemo(() => {
    return works.reduce((acc, w) => acc + (Number(w.contract_value) || 0), 0)
  }, [works])

  const reportsByWork = useMemo(() => {
    const grouped: { [workId: string]: Report[] } = {}
    reports.forEach(report => {
      const workId = report.work_id || 'sem_obra'
      if (!grouped[workId]) {
        grouped[workId] = []
      }
      grouped[workId].push(report)
    })
    return grouped
  }, [reports])

  function whatsappLink() {
    const digits = (client?.phone || '').replace(/\D/g, '')
    if (!digits) return null
    const text = `Olá ${client?.representante || ''}! Aqui é da WorldPav. Estamos revisando seus relatórios. Qualquer dúvida, estamos à disposição.`
    return `https://wa.me/55${digits}?text=${encodeURIComponent(text)}`
  }

  function getClientTypeLabel(type?: string | null) {
    const types = {
      'construtora': 'Construtora',
      'prefeitura': 'Prefeitura',
      'empresa_privada': 'Empresa Privada',
      'incorporadora': 'Incorporadora'
    }
    return types[type as keyof typeof types] || '-'
  }

  function getWorkAreaLabel(area?: string | null) {
    const areas = {
      'residencial': 'Residencial',
      'comercial': 'Comercial',
      'industrial': 'Industrial',
      'publico': 'Público'
    }
    return areas[area as keyof typeof areas] || '-'
  }

  function getWorkTypeLabel(type?: string | null) {
    const types = {
      'pavimentacao_nova': 'Pavimentação Nova',
      'recapeamento': 'Recapeamento',
      'manutencao': 'Manutenção'
    }
    return types[type as keyof typeof types] || '-'
  }

  function getWorkStatusBadge(status: string) {
    const variants = {
      'planejamento': 'default',
      'andamento': 'warning',
      'concluida': 'success',
      'cancelada': 'danger'
    } as const
    return variants[status as keyof typeof variants] || 'default'
  }

  function getContractStatusBadge(status: string) {
    const variants = {
      'ativo': 'success',
      'vencido': 'danger',
      'cancelado': 'default'
    } as const
    return variants[status as keyof typeof variants] || 'default'
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar cliente</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchAll()}>Tentar Novamente</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {client ? `${client.representante || client.name || 'Cliente'}${client.empresa ? ` - ${client.empresa}` : ''}` : 'Detalhes do Cliente'}
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
            {whatsappLink() && (
              <a href={whatsappLink()!} target="_blank" rel="noreferrer">
                <Button variant="outline">📱 WhatsApp</Button>
              </a>
            )}
            <Link to={`/clients/${id}/edit`}>
              <Button variant="outline">✏️ Editar</Button>
            </Link>
            <Button variant="primary" onClick={() => navigate('/clients')}>← Voltar</Button>
          </div>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊' },
              { id: 'works', label: 'Obras', icon: '🏗️' },
              { id: 'reports', label: 'Relatórios', icon: '📋' },
              { id: 'contracts', label: 'Contratos', icon: '📄' },
              { id: 'documentation', label: 'Documentação', icon: '📋' },
              { id: 'scheduling', label: 'Programação', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              {loading ? (
                <div className="animate-pulse h-24 bg-gray-100 rounded" />
              ) : client ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Representante:</span> <span className="ml-2 font-medium">{client.representante || '-'}</span></div>
                  <div><span className="text-gray-500">Empresa:</span> <span className="ml-2 font-medium">{client.empresa_responsavel?.name || '-'}</span></div>
                  <div><span className="text-gray-500">Nome:</span> <span className="ml-2 font-medium">{client.name || '-'}</span></div>
                  <div><span className="text-gray-500">Razão Social:</span> <span className="ml-2 font-medium">{client.empresa || '-'}</span></div>
                  <div><span className="text-gray-500">CPF/CNPJ:</span> <span className="ml-2 font-medium">{client.cpf_cnpj || '-'}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="ml-2 font-medium">{client.email || '-'}</span></div>
                  <div><span className="text-gray-500">Telefone:</span> <span className="ml-2 font-medium">{client.phone || '-'}</span></div>
                  <div><span className="text-gray-500">Endereço:</span> <span className="ml-2 font-medium">{client.address || '-'}</span></div>
                  <div><span className="text-gray-500">Cidade/UF:</span> <span className="ml-2 font-medium">{client.city || '-'} / {client.state || '-'}</span></div>
                  <div><span className="text-gray-500">CEP:</span> <span className="ml-2 font-medium">{client.zip_code || '-'}</span></div>
                </div>
              ) : (
                <div>Nenhum cliente encontrado.</div>
              )}
            </div>





            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Total Faturado</h3>
                {canSeeRevenue ? (
                  <div className="text-2xl font-bold text-green-600">{currency(totalFaturado)}</div>
                ) : (
                  <div className="text-sm text-gray-500">Sem permissão</div>
                )}
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Obras Realizadas</h3>
                <div className="text-2xl font-bold text-blue-600">{works.length}</div>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold mb-2">Relatórios</h3>
                <div className="text-2xl font-bold text-purple-600">{reports.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'works' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Obras do Cliente</h3>
              <Button onClick={() => navigate(`/obras/new?client_id=${id}`)}>
                + Nova Obra
              </Button>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : works.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhuma obra encontrada para este cliente.</p>
                <Button className="mt-4" onClick={() => navigate(`/obras/new?client_id=${id}`)}>
                  Criar primeira obra
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {works.map((work) => (
                  <div key={work.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{work.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                      </div>
                      <Badge variant={getWorkStatusBadge(work.status)} size="sm">
                        {work.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Empresa:</span>
                        <span className="ml-2 font-medium">{work.company_id || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Início:</span>
                        <span className="ml-2 font-medium">{work.start_date ? formatDateToBR(work.start_date) : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Estimado:</span>
                        <span className="ml-2 font-medium">{currency(work.contract_value)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Localização:</span>
                        <span className="ml-2 font-medium">{work.location || '-'}</span>
                      </div>
                    </div>
                    
                    {work.description && (
                      <div className="mt-4">
                        <span className="text-gray-500">Descrição:</span>
                        <p className="text-sm text-gray-700 mt-1">{work.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Relatórios por Obra</h3>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : Object.keys(reportsByWork).length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhum relatório encontrado para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(reportsByWork).map(([workId, workReports]) => {
                  const work = works.find(w => w.id === workId)
                  return (
                    <div key={workId} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {work ? work.name : 'Relatórios sem obra específica'}
                        </h4>
                        <Badge variant="default" size="sm">
                          {workReports.length} relatório(s)
                        </Badge>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2">Nº</th>
                              <th className="text-left py-2">Data</th>
                              <th className="text-left py-2">Volume</th>
                              <th className="text-left py-2">Total</th>
                              <th className="text-left py-2">Status</th>
                              <th className="text-left py-2">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workReports.map((report) => (
                              <tr key={report.id} className="border-b border-gray-100">
                                <td className="py-2">{report.report_number}</td>
                                <td className="py-2">{format(new Date(report.date), 'dd/MM/yyyy')}</td>
                                <td className="py-2">{report.realized_volume ?? '-'}</td>
                                <td className="py-2">{currency(report.total_value)}</td>
                                <td className="py-2">
                                  <Badge 
                                    variant={report.status === 'PAGO' ? 'success' : report.status === 'CONFIRMADO' ? 'warning' : report.status === 'PENDENTE' ? 'danger' : 'info'} 
                                    size="sm"
                                  >
                                    {report.status}
                                  </Badge>
                                </td>
                                <td className="py-2">
                                  <Link to={`/reports/${report.id}`}>
                                    <Button variant="outline" size="sm">Ver</Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Contratos e Documentos</h3>
              <Button onClick={() => setShowNovoContratoModal(true)}>
                + Novo Contrato
              </Button>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : contracts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📄</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato cadastrado</h4>
                <p className="text-gray-600 mb-4">
                  Este cliente ainda não possui contratos cadastrados.
                </p>
                <Button onClick={() => setShowNovoContratoModal(true)}>
                  Adicionar Primeiro Contrato
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{contract.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)} • 
                          Criado em {format(new Date(contract.created_at), 'dd/MM/yyyy')}
                        </p>
                        {contract.obra_nome && (
                          <p className="text-sm text-gray-500 mt-1">Obra: {contract.obra_nome}</p>
                        )}
                      </div>
                      <Badge variant={getContractStatusBadge(contract.status)}>
                        {contract.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Início:</span>
                        <span className="ml-2 font-medium">{format(new Date(contract.start_date), 'dd/MM/yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fim:</span>
                        <span className="ml-2 font-medium">
                          {contract.end_date ? format(new Date(contract.end_date), 'dd/MM/yyyy') : 'Indefinido'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor:</span>
                        <span className="ml-2 font-medium">{currency(contract.value)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => abrirDetalhesContrato(contract)}>
                        👁️ Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => abrirEditarContrato(contract)}>
                        ✏️ Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          if (!confirm(`Tem certeza que deseja excluir o contrato "${contract.name}"?`)) return
                          try {
                            await ContratosAPI.delete(contract.id)
                            alert('Contrato excluído com sucesso!')
                            if (client) {
                              const newContracts = await fetchContracts(client.id)
                              setContracts(newContracts)
                            }
                          } catch (error: any) {
                            alert(error.message || 'Erro ao excluir contrato.')
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                      >
                        🗑️ Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Documentação e NRS</h3>
              <Button onClick={() => setShowNovaDocumentacaoModal(true)}>
                + Nova Documentação
              </Button>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : documentacao.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma documentação cadastrada</h4>
                <p className="text-gray-600 mb-4">
                  Este cliente ainda não possui documentação cadastrada.
                </p>
                <Button onClick={() => setShowNovaDocumentacaoModal(true)}>
                  Adicionar Primeira Documentação
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {documentacao.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Tipo: {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                          {doc.category && ` • ${doc.category}`}
                        </p>
                        {doc.obra_nome && (
                          <p className="text-sm text-gray-500 mt-1">Obra: {doc.obra_nome}</p>
                        )}
                      </div>
                      <Badge variant={doc.status === 'vencido' ? 'danger' : doc.status === 'proximo_vencimento' ? 'warning' : 'success'}>
                        {doc.status.toUpperCase().replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Válido de:</span>
                        <span className="ml-2 font-medium">
                          {doc.valid_from ? format(new Date(doc.valid_from), 'dd/MM/yyyy') : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Válido até:</span>
                        <span className="ml-2 font-medium">
                          {doc.valid_until ? format(new Date(doc.valid_until), 'dd/MM/yyyy') : 'Indefinido'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Criado em:</span>
                        <span className="ml-2 font-medium">{format(new Date(doc.created_at), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                    
                    {doc.observations && (
                      <div className="mt-4">
                        <span className="text-gray-500">Observações:</span>
                        <p className="text-sm text-gray-700 mt-1">{doc.observations}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => abrirDetalhesDocumentacao(doc)}>
                        👁️ Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => abrirEditarDocumentacao(doc)}>
                        ✏️ Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={async () => {
                          if (!confirm(`Tem certeza que deseja excluir a documentação "${doc.name}"?`)) return
                          try {
                            await DocumentacaoAPI.delete(doc.id)
                            alert('Documentação excluída com sucesso!')
                            if (client) {
                              const newDocs = await fetchDocumentacao(client.id)
                              setDocumentacao(newDocs)
                            }
                          } catch (error: any) {
                            alert(error.message || 'Erro ao excluir documentação.')
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                      >
                        🗑️ Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="space-y-6">
            {/* Programações do cliente */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Programações de Pavimentação</h3>
              <div className="text-sm text-gray-500">
                {programacoes.length} programação(ões) encontrada(s)
              </div>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : programacoes.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhuma programação encontrada para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {programacoes.map((prog) => (
                  <div key={prog.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{prog.obra}</h4>
                        <p className="text-sm text-gray-600 mt-1">{prog.rua}</p>
                        <p className="text-sm text-gray-500 mt-1">📅 {formatDateToBR(prog.data)}</p>
                      </div>
                      <Badge 
                        variant={prog.status === 'confirmada' ? 'success' : 'default'}
                      >
                        {prog.status === 'confirmada' ? 'CONFIRMADA' : 'PROGRAMADA'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Horário:</span>
                        <span className="ml-2 font-medium">{prog.horario_inicio || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Metragem:</span>
                        <span className="ml-2 font-medium">{prog.metragem_prevista} m²</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Toneladas:</span>
                        <span className="ml-2 font-medium">{prog.quantidade_toneladas} ton</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Equipe:</span>
                        <span className="ml-2 font-medium">{prog.prefixo_equipe}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => abrirDetalhes(prog)}
                      >
                        👁️ Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Modal de Detalhes */}
            {showDetalhesModal && programacaoSelecionada && (
              <ProgramacaoDetalhesModal 
                programacao={programacaoSelecionada}
                onClose={fecharDetalhes}
              />
            )}
          </div>
        )}


      </div>

      {/* Modais */}
      {showNovoContratoModal && client && (
        <NovoContratoModal
          isOpen={showNovoContratoModal}
          onClose={() => setShowNovoContratoModal(false)}
          clientId={client.id}
          onSuccess={async () => {
            // Recarregar contratos
            const newContracts = await fetchContracts(client.id)
            setContracts(newContracts)
          }}
        />
      )}

      {showNovaDocumentacaoModal && client && (
        <NovaDocumentacaoModal
          isOpen={showNovaDocumentacaoModal}
          onClose={() => setShowNovaDocumentacaoModal(false)}
          clientId={client.id}
          onSuccess={async () => {
            // Recarregar documentação
            const newDocs = await fetchDocumentacao(client.id)
            setDocumentacao(newDocs)
          }}
        />
      )}

      {/* Modais de Detalhes e Edição - Contratos */}
      {showDetalhesContratoModal && contratoSelecionado && (
        <DetalhesContratoModal
          contrato={contratoSelecionado}
          onClose={fecharDetalhesContrato}
          onEdit={() => abrirEditarContrato(contratoSelecionado)}
          onDelete={handleDeletarContrato}
        />
      )}

      {showEditarContratoModal && contratoSelecionado && (
        <EditarContratoModal
          isOpen={showEditarContratoModal}
          onClose={fecharEditarContrato}
          contrato={contratoSelecionado}
          onSuccess={async () => {
            if (!client) return
            const newContracts = await fetchContracts(client.id)
            setContracts(newContracts)
          }}
        />
      )}

      {/* Modais de Detalhes e Edição - Documentação */}
      {showDetalhesDocumentacaoModal && documentacaoSelecionada && (
        <DetalhesDocumentacaoModal
          documentacao={documentacaoSelecionada}
          onClose={fecharDetalhesDocumentacao}
          onEdit={() => abrirEditarDocumentacao(documentacaoSelecionada)}
          onDelete={handleDeletarDocumentacao}
        />
      )}

      {showEditarDocumentacaoModal && documentacaoSelecionada && (
        <EditarDocumentacaoModal
          isOpen={showEditarDocumentacaoModal}
          onClose={fecharEditarDocumentacao}
          documentacao={documentacaoSelecionada}
          onSuccess={async () => {
            if (!client) return
            const newDocs = await fetchDocumentacao(client.id)
            setDocumentacao(newDocs)
          }}
        />
      )}
    </Layout>
  )
}
