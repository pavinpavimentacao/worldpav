import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { ObraCard } from "../../components/cards/ObraCard"
import { formatDateToBR } from '../../utils/date-utils'
import { getObrasByCliente, getAllObrasWithProgress } from '../../types/obras'
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  Map
} from 'lucide-react'

// Tipos para cliente (simplificados)
type Client = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  client_type?: 'construtora' | 'prefeitura' | 'empresa_privada' | 'incorporadora' | null
  work_area?: 'residencial' | 'comercial' | 'industrial' | 'publico' | null
  work_type?: 'pavimentacao_nova' | 'recapeamento' | 'manutencao' | null
  responsible_company?: 'WorldPav' | 'Pavin' | null
  estimated_volume?: string | null
  payment_terms?: '30' | '60' | '90' | null
  technical_contact?: string | null
  financial_contact?: string | null
  notes?: string | null
}

// Mock data para cliente
const mockClient: Client = {
  id: '1',
  name: 'Prefeitura de Osasco',
  email: 'contato@osasco.sp.gov.br',
  phone: '(11) 3456-7890',
  address: 'Rua Antonio Agu, 300 - Centro',
  city: 'Osasco',
  state: 'SP',
  client_type: 'prefeitura',
  work_area: 'publico',
  work_type: 'pavimentacao_nova',
  responsible_company: 'WorldPav',
  estimated_volume: '1200m³',
  payment_terms: '30',
  technical_contact: 'Eng. Carlos Silva',
  financial_contact: 'Maria Santos',
  notes: 'Cliente preferencial com histórico de pagamentos em dia'
}

export default function ClientDetailsNew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'obras' | 'relatorios' | 'documentos'>('overview')
  const [client] = useState<Client>(mockClient)
  const [loading] = useState(false)

  // Obter obras do cliente
  const obras = useMemo(() => {
    return getObrasByCliente(id || '1')
  }, [id])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const obrasAtivas = obras.filter(o => o.status === 'em_andamento').length
    const obrasConcluidas = obras.filter(o => o.status === 'concluida').length
    const obrasPlanejadas = obras.filter(o => o.status === 'planejada').length
    
    const valorTotalPrevisto = obras.reduce((sum, o) => sum + o.valor_total_previsto, 0)
    const valorTotalRealizado = obras.reduce((sum, o) => sum + o.valor_realizado, 0)
    
    const totalRuas = obras.reduce((sum, o) => sum + o.total_ruas, 0)
    const ruasLiberadas = obras.reduce((sum, o) => sum + o.ruas_liberadas, 0)
    const ruasPavimentadas = obras.reduce((sum, o) => sum + o.ruas_pavimentadas, 0)

    return {
      obrasAtivas,
      obrasConcluidas,
      obrasPlanejadas,
      valorTotalPrevisto,
      valorTotalRealizado,
      totalRuas,
      ruasLiberadas,
      ruasPavimentadas
    }
  }, [obras])

  // Alertas
  const alertas = useMemo(() => {
    const alertasList = []
    
    // Obras atrasadas
    const obrasAtrasadas = obras.filter(o => o.status_alertas === 'atraso')
    if (obrasAtrasadas.length > 0) {
      alertasList.push({
        tipo: 'atraso',
        titulo: 'Obras Atrasadas',
        descricao: `${obrasAtrasadas.length} obra(s) com atraso na conclusão`,
        icon: AlertTriangle,
        className: 'bg-red-50 border-red-200 text-red-800'
      })
    }

    // Ruas não liberadas
    const obrasComRuasPendentes = obras.filter(o => 
      o.status === 'em_andamento' && o.ruas_liberadas < o.total_ruas
    )
    if (obrasComRuasPendentes.length > 0) {
      const totalRuasPendentes = obrasComRuasPendentes.reduce((sum, o) => 
        sum + (o.total_ruas - o.ruas_liberadas), 0
      )
      alertasList.push({
        tipo: 'atencao',
        titulo: 'Ruas Aguardando Liberação',
        descricao: `${totalRuasPendentes} rua(s) aguardando liberação do cliente`,
        icon: Clock,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      })
    }

    return alertasList
  }, [obras])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/clients')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-sm text-gray-500">
                {client.client_type === 'prefeitura' ? 'Prefeitura' : 
                 client.client_type === 'construtora' ? 'Construtora' :
                 client.client_type === 'empresa_privada' ? 'Empresa Privada' : 'Incorporadora'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/clients/${id}/edit`)}
            >
              Editar Cliente
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/obras/new?cliente_id=${id}`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
          </div>
        </div>

        {/* Informações do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato</h3>
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    {client.address}, {client.city}/{client.state}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Técnicas</h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Área de Atuação</span>
                <p className="text-sm font-medium text-gray-900">
                  {client.work_area === 'publico' ? 'Público' :
                   client.work_area === 'residencial' ? 'Residencial' :
                   client.work_area === 'comercial' ? 'Comercial' : 'Industrial'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Tipo de Obra</span>
                <p className="text-sm font-medium text-gray-900">
                  {client.work_type === 'pavimentacao_nova' ? 'Pavimentação Nova' :
                   client.work_type === 'recapeamento' ? 'Recapeamento' : 'Manutenção'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Empresa Responsável</span>
                <p className="text-sm font-medium text-gray-900">{client.responsible_company}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatos</h3>
            <div className="space-y-2">
              {client.technical_contact && (
                <div>
                  <span className="text-xs text-gray-500">Contato Técnico</span>
                  <p className="text-sm font-medium text-gray-900">{client.technical_contact}</p>
                </div>
              )}
              {client.financial_contact && (
                <div>
                  <span className="text-xs text-gray-500">Contato Financeiro</span>
                  <p className="text-sm font-medium text-gray-900">{client.financial_contact}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">Prazo de Pagamento</span>
                <p className="text-sm font-medium text-gray-900">{client.payment_terms} dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
              { id: 'obras', label: 'Obras', icon: Building },
              { id: 'relatorios', label: 'Relatórios', icon: FileText },
              { id: 'documentos', label: 'Documentos', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.obrasAtivas}</div>
                <div className="text-sm text-gray-500">Obras Ativas</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{stats.obrasConcluidas}</div>
                <div className="text-sm text-gray-500">Obras Concluídas</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.obrasPlanejadas}</div>
                <div className="text-sm text-gray-500">Obras Planejadas</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.valorTotalRealizado)}
                </div>
                <div className="text-sm text-gray-500">Valor Realizado</div>
              </div>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
                {alertas.map((alerta, index) => {
                  const Icon = alerta.icon
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${alerta.className}`}>
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{alerta.titulo}</h4>
                          <p className="text-sm">{alerta.descricao}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Obras em Andamento */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Obras em Andamento</h3>
              {obras.filter(o => o.status === 'em_andamento').length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {obras
                    .filter(o => o.status === 'em_andamento')
                    .map(obra => (
                      <ObraCard key={obra.id} obra={obra} />
                    ))
                  }
                </div>
              ) : (
                <div className="card text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma obra em andamento</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comece criando uma nova obra para este cliente.
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/obras/new?cliente_id=${id}`)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Obra
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'obras' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Todas as Obras</h3>
              <Button
                variant="primary"
                onClick={() => navigate(`/obras/new?cliente_id=${id}`)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </Button>
            </div>

            {obras.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {obras.map(obra => (
                  <ObraCard key={obra.id} obra={obra} />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma obra cadastrada</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando uma nova obra para este cliente.
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/obras/new?cliente_id=${id}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Obra
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'relatorios' && (
          <div className="card text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Relatórios em desenvolvimento</h3>
            <p className="mt-1 text-sm text-gray-500">
              Os relatórios serão exibidos em breve.
            </p>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="card text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Documentos em desenvolvimento</h3>
            <p className="mt-1 text-sm text-gray-500">
              Os documentos serão exibidos em breve.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}


