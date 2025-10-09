import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
// import { supabase } from '../../lib/supabase'
// import { GenericError } from '../errors/GenericError'
import { format } from 'date-fns'
import { Badge } from '../../components/Badge'
import { useAuth } from '../../lib/auth-hooks'
import { WorkScheduling } from '../../components/WorkScheduling'
import { formatDateToBR } from '../../utils/date-utils'

type Client = {
  id: string
  rep_name?: string | null
  company_name?: string | null
  legal_name?: string | null
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  cep?: string | null
  // Novos campos
  client_type?: 'construtora' | 'prefeitura' | 'empresa_privada' | 'incorporadora' | null
  work_area?: 'residencial' | 'comercial' | 'industrial' | 'publico' | null
  work_type?: 'pavimentacao_nova' | 'recapeamento' | 'manutencao' | null
  responsible_company?: 'WorldPav' | 'Pavin' | null
  estimated_volume?: string | null
  payment_terms?: '30' | '60' | '90' | null
  technical_contact?: string | null
  financial_contact?: string | null
  equipment_preferences?: string[] | null
  documentation_requirements?: string | null
  notes?: string | null
}

type Report = {
  id: string
  report_number: string
  date: string
  pump_prefix: string | null
  realized_volume: number | null
  total_value: number | null
  status: 'PENDENTE' | 'CONFIRMADO' | 'PAGO' | 'NOTA_EMITIDA'
  work_id?: string | null
}

type Work = {
  id: string
  name: string
  description?: string | null
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada'
  start_date?: string | null
  end_date?: string | null
  estimated_value?: number | null
  realized_value?: number | null
  progress: number
  responsible_company: 'WorldPav' | 'Pavin'
  created_at: string
}

type Contract = {
  id: string
  name: string
  type: 'contrato' | 'proposta' | 'termo' | 'aditivo'
  status: 'ativo' | 'vencido' | 'cancelado'
  start_date: string
  end_date?: string | null
  value?: number | null
  file_path?: string | null
  created_at: string
}

function currency(v: number | null | undefined) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

export default function ClientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'reports' | 'contracts' | 'scheduling' | 'documentation'>('overview')

  const canSeeRevenue = useMemo(() => {
    const role = (user?.user_metadata as any)?.role
    return role === 'admin' || role === 'financeiro'
  }, [user])

  function fetchAll() {
    if (!id) return
    setLoading(true)
    setError(null)
    
    try {
      // Simular delay de carregamento
      setTimeout(() => {
        // Mock data para cliente
        const mockClient: Client = {
          id: id,
          rep_name: 'João Silva',
          company_name: 'Construtora ABC Ltda',
          legal_name: 'Construtora ABC Ltda',
          document: '12345678000199',
          email: 'joao@construtoraabc.com',
          phone: '11999887766',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          cep: '01234567',
          client_type: 'construtora',
          work_area: 'residencial',
          work_type: 'pavimentacao_nova',
          responsible_company: 'WorldPav',
          estimated_volume: '500m²',
          payment_terms: '30',
          technical_contact: 'Carlos Engenheiro',
          financial_contact: 'Maria Financeiro',
          equipment_preferences: ['Vibroacabadora CAT AP1055F', 'Rolo Compactador Chapa Dynapac CA2500'],
          documentation_requirements: 'ART, NR-12, NR-18, Alvará de Construção',
          notes: 'Cliente preferencial, sempre pontual nos pagamentos'
        }
        setClient(mockClient)

        // Mock data para relatórios
        const mockReports: Report[] = [
          {
            id: '1',
            report_number: 'REL-001',
            date: '2024-01-15',
            pump_prefix: 'BM-001',
            realized_volume: 150,
            total_value: 15000,
            status: 'PAGO',
            work_id: 'work-1'
          },
          {
            id: '2',
            report_number: 'REL-002',
            date: '2024-01-20',
            pump_prefix: 'BM-002',
            realized_volume: 200,
            total_value: 20000,
            status: 'CONFIRMADO',
            work_id: 'work-1'
          },
          {
            id: '3',
            report_number: 'REL-003',
            date: '2024-02-01',
            pump_prefix: 'BM-001',
            realized_volume: 100,
            total_value: 10000,
            status: 'PENDENTE',
            work_id: 'work-2'
          }
        ]
        setReports(mockReports)

      // Mock data para obras (será substituído por dados reais do banco)
      const mockWorks: Work[] = [
        {
          id: '1',
          name: 'Pavimentação Residencial - Condomínio ABC',
          description: 'Pavimentação asfáltica de 2.500m² em condomínio residencial',
          status: 'em_andamento',
          start_date: '2024-01-15',
          end_date: '2024-02-15',
          estimated_value: 125000,
          realized_value: 75000,
          progress: 60,
          responsible_company: 'WorldPav',
          created_at: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          name: 'Recapeamento - Rua das Flores',
          description: 'Recapeamento de 1.200m² em via pública',
          status: 'concluida',
          start_date: '2023-12-01',
          end_date: '2023-12-20',
          estimated_value: 85000,
          realized_value: 82000,
          progress: 100,
          responsible_company: 'Pavin',
          created_at: '2023-11-25T10:00:00Z'
        }
      ]
      setWorks(mockWorks)

      // Mock data para contratos (será substituído por dados reais do banco)
      const mockContracts: Contract[] = [
        {
          id: '1',
          name: 'Contrato de Prestação de Serviços - 2024',
          type: 'contrato',
          status: 'ativo',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          value: 500000,
          file_path: '/contracts/contrato-2024.pdf',
          created_at: '2023-12-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Proposta Técnica - Condomínio ABC',
          type: 'proposta',
          status: 'ativo',
          start_date: '2024-01-10',
          end_date: '2024-02-15',
          value: 125000,
          file_path: '/contracts/proposta-condominio-abc.pdf',
          created_at: '2024-01-05T10:00:00Z'
        }
      ]
      setContracts(mockContracts)

        setLoading(false)
      }, 500) // Simular delay de 500ms
    } catch (err: any) {
      console.error('Fetch client details error:', { message: err?.message, id })
      setError(err?.message || 'Falha ao carregar dados do cliente')
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
    return works.reduce((acc, w) => acc + (Number(w.realized_value) || 0), 0)
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
    const text = `Olá ${client?.rep_name || ''}! Aqui é da WorldPav. Estamos revisando seus relatórios. Qualquer dúvida, estamos à disposição.`
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
      'planejada': 'secondary',
      'em_andamento': 'warning',
      'concluida': 'success',
      'cancelada': 'danger'
    } as const
    return variants[status as keyof typeof variants] || 'secondary'
  }

  function getContractStatusBadge(status: string) {
    const variants = {
      'ativo': 'success',
      'vencido': 'danger',
      'cancelado': 'secondary'
    } as const
    return variants[status as keyof typeof variants] || 'secondary'
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
              {client ? `${client.rep_name || 'Cliente'} - ${client.company_name || 'Sem empresa'}` : 'Detalhes do Cliente'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {client && (
                <>
                  {getClientTypeLabel(client.client_type)} • {getWorkAreaLabel(client.work_area)} • {client.responsible_company}
                </>
              )}
            </p>
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
                  <div><span className="text-gray-500">Representante:</span> <span className="ml-2 font-medium">{client.rep_name || '-'}</span></div>
                  <div><span className="text-gray-500">Empresa:</span> <span className="ml-2 font-medium">{client.company_name || '-'}</span></div>
                  <div><span className="text-gray-500">Razão Social:</span> <span className="ml-2 font-medium">{client.legal_name || '-'}</span></div>
                  <div><span className="text-gray-500">Documento:</span> <span className="ml-2 font-medium">{client.document || '-'}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span className="ml-2 font-medium">{client.email || '-'}</span></div>
                  <div><span className="text-gray-500">Telefone:</span> <span className="ml-2 font-medium">{client.phone || '-'}</span></div>
                  <div><span className="text-gray-500">Contato Técnico:</span> <span className="ml-2 font-medium">{client.technical_contact || '-'}</span></div>
                  <div><span className="text-gray-500">Contato Financeiro:</span> <span className="ml-2 font-medium">{client.financial_contact || '-'}</span></div>
                  <div><span className="text-gray-500">Prazo Pagamento:</span> <span className="ml-2 font-medium">{client.payment_terms ? `${client.payment_terms} dias` : '-'}</span></div>
                  <div><span className="text-gray-500">Endereço:</span> <span className="ml-2 font-medium">{client.address || '-'}</span></div>
                  <div><span className="text-gray-500">Cidade/UF:</span> <span className="ml-2 font-medium">{client.city || '-'} / {client.state || '-'}</span></div>
                  <div><span className="text-gray-500">CEP:</span> <span className="ml-2 font-medium">{client.cep || '-'}</span></div>
                </div>
              ) : (
                <div>Nenhum cliente encontrado.</div>
              )}
            </div>

            {/* Categorização */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorização</h3>
              {client && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-500">Tipo de Cliente:</span> <span className="ml-2 font-medium">{getClientTypeLabel(client.client_type)}</span></div>
                  <div><span className="text-gray-500">Área de Atuação:</span> <span className="ml-2 font-medium">{getWorkAreaLabel(client.work_area)}</span></div>
                  <div><span className="text-gray-500">Tipo de Obra:</span> <span className="ml-2 font-medium">{getWorkTypeLabel(client.work_type)}</span></div>
                  <div><span className="text-gray-500">Empresa Responsável:</span> <span className="ml-2 font-medium">{client.responsible_company || '-'}</span></div>
                  <div><span className="text-gray-500">Volume Estimado:</span> <span className="ml-2 font-medium">{client.estimated_volume || '-'}</span></div>
                </div>
              )}
            </div>

            {/* Preferências de Equipamentos */}
            {client?.equipment_preferences && client.equipment_preferences.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Equipamentos</h3>
                <div className="flex flex-wrap gap-2">
                  {client.equipment_preferences.map((equipment, index) => (
                    <Badge key={index} variant="secondary" size="sm">{equipment}</Badge>
                  ))}
                </div>
              </div>
            )}


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
              <Button onClick={() => navigate(`/works/new?client_id=${id}`)}>
                + Nova Obra
              </Button>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : works.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhuma obra encontrada para este cliente.</p>
                <Button className="mt-4" onClick={() => navigate(`/works/new?client_id=${id}`)}>
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
                        <span className="ml-2 font-medium">{work.responsible_company}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Início:</span>
                        <span className="ml-2 font-medium">{work.start_date ? formatDateToBR(work.start_date) : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Estimado:</span>
                        <span className="ml-2 font-medium">{currency(work.estimated_value)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Realizado:</span>
                        <span className="ml-2 font-medium">{currency(work.realized_value)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{work.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${work.progress}%` }}
                        ></div>
                      </div>
                    </div>
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
                        <Badge variant="secondary" size="sm">
                          {workReports.length} relatório(s)
                        </Badge>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2">Nº</th>
                              <th className="text-left py-2">Data</th>
                              <th className="text-left py-2">Bomba</th>
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
                                <td className="py-2">{report.pump_prefix ?? '-'}</td>
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
              <Button onClick={() => navigate(`/contracts/new?client_id=${id}`)}>
                + Novo Contrato
              </Button>
            </div>
            
            {loading ? (
              <div className="animate-pulse h-24 bg-gray-100 rounded" />
            ) : contracts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Nenhum contrato encontrado para este cliente.</p>
                <Button className="mt-4" onClick={() => navigate(`/contracts/new?client_id=${id}`)}>
                  Criar primeiro contrato
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
                      </div>
                      <Badge variant={getContractStatusBadge(contract.status)} size="sm">
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
                    
                    {contract.file_path && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          📄 Visualizar Documento
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentation' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Documentação e NRS</h3>
              
              {client?.documentation_requirements ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Documentação e NRS que a empresa geralmente pede:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {client.documentation_requirements}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Dica:</h4>
                    <p className="text-sm text-blue-800">
                      Esta lista pode ser atualizada a qualquer momento. Mantenha-a sempre atualizada com as 
                      documentações e NRS que cada cliente costuma solicitar para agilizar o processo de 
                      preparação dos serviços.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma documentação cadastrada</h4>
                  <p className="text-gray-600 mb-4">
                    Este cliente ainda não possui documentações e NRS cadastradas.
                  </p>
                  <Button variant="outline" onClick={() => navigate(`/clients/${id}/edit`)}>
                    ✏️ Editar Cliente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'scheduling' && (
          <div className="space-y-6">
            <WorkScheduling 
              clientId={client?.company_name || undefined}
              onWorkSelect={(work) => {
                console.log('Obra selecionada:', work)
                // Aqui você pode implementar a lógica para selecionar uma obra
                // Por exemplo, navegar para a página de detalhes da obra
              }}
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
