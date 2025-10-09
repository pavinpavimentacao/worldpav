import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { KpiCard } from '../components/KpiCard'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Construction, 
  Users, 
  DollarSign, 
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  FileText,
  Settings
} from 'lucide-react'

// Dados mock para demonstração
const mockStats = {
  obrasAtivas: 8,
  obrasConcluidas: 23,
  clientesAtivos: 15,
  faturamentoMes: 485000,
  m2Pavimentados: 1250,
  equipamentosAtivos: 12
}

const mockObrasRecentes = [
  {
    id: '1',
    nome: 'Pavimentação Rua das Flores - Osasco',
    cliente: 'Prefeitura de Osasco',
    status: 'em_andamento',
    progresso: 65,
    previsao: '2024-02-15',
    valor: 125000
  },
  {
    id: '2',
    nome: 'Recapeamento Avenida Central',
    cliente: 'FBS',
    status: 'planejada',
    progresso: 0,
    previsao: '2024-03-01',
    valor: 89000
  },
  {
    id: '3',
    nome: 'Pavimentação Condomínio Residencial',
    cliente: 'Construtora ABC',
    status: 'concluida',
    progresso: 100,
    previsao: '2024-01-20',
    valor: 45000
  }
]

const mockRelatoriosRecentes = [
  {
    id: '1',
    numero: 'RD-001',
    obra: 'Pavimentação Rua das Flores',
    data: '2024-01-15',
    rua: 'Rua das Flores, 123',
    metragem: 150,
    unidade: 'm²'
  },
  {
    id: '2',
    numero: 'RD-002',
    obra: 'Recapeamento Avenida Central',
    data: '2024-01-16',
    rua: 'Avenida Central',
    metragem: 200,
    unidade: 'm²'
  }
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    planejada: { label: 'Planejada', className: 'status-planejada' },
    em_andamento: { label: 'Em Andamento', className: 'status-em-andamento' },
    concluida: { label: 'Concluída', className: 'status-concluida' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig]
  return <span className={config.className}>{config.label}</span>
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value)
}

export default function DashboardWorldPav() {
  const [activeTab, setActiveTab] = useState<'obras' | 'relatorios'>('obras')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              WorldPav - Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Sistema de gestão para pavimentação asfáltica
            </p>
          </div>
          <div className="mt-4 md:ml-4 md:mt-0 flex space-x-3">
            <Link to="/obras/new">
              <button className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Nova Obra
              </button>
            </Link>
            <Link to="/relatorios-diarios/new">
              <button className="btn-outline flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Novo Relatório
              </button>
            </Link>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Obras Ativas"
            value={mockStats.obrasAtivas}
            icon={<Construction className="h-6 w-6" />}
            subtitle="Em andamento"
            trend={{ value: 12, isPositive: true }}
          />
          <KpiCard
            title="Obras Concluídas"
            value={mockStats.obrasConcluidas}
            icon={<CheckCircle className="h-6 w-6" />}
            subtitle="Este ano"
            trend={{ value: 8, isPositive: true }}
          />
          <KpiCard
            title="Clientes Ativos"
            value={mockStats.clientesAtivos}
            icon={<Users className="h-6 w-6" />}
            subtitle="Com obras ativas"
          />
          <KpiCard
            title="Faturamento"
            value={formatCurrency(mockStats.faturamentoMes)}
            icon={<DollarSign className="h-6 w-6" />}
            subtitle="Este mês"
            trend={{ value: 15, isPositive: true }}
          />
          <KpiCard
            title="m² Pavimentados"
            value={`${mockStats.m2Pavimentados.toLocaleString()} m²`}
            icon={<MapPin className="h-6 w-6" />}
            subtitle="Este mês"
          />
          <KpiCard
            title="Equipamentos"
            value={mockStats.equipamentosAtivos}
            icon={<Construction className="h-6 w-6" />}
            subtitle="Disponíveis"
          />
        </div>

        {/* Tabs de Conteúdo */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('obras')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'obras'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Construction className="h-4 w-4 inline mr-2" />
                Obras Recentes
              </button>
              <button
                onClick={() => setActiveTab('relatorios')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'relatorios'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Relatórios Diários
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'obras' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Obras Recentes</h3>
                  <Link 
                    to="/obras" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver todas →
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {mockObrasRecentes.map((obra) => (
                    <div key={obra.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{obra.nome}</h4>
                            <p className="text-sm text-gray-500">{obra.cliente}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(obra.valor)}</div>
                            <div className="text-xs text-gray-500">{obra.previsao}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Progresso</span>
                              <span>{obra.progresso}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${obra.progresso}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            {getStatusBadge(obra.status)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/obras/${obra.id}`}
                          className="text-primary-600 hover:text-primary-700 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Relatórios Diários Recentes</h3>
                  <Link 
                    to="/relatorios-diarios" 
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver todos →
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {mockRelatoriosRecentes.map((relatorio) => (
                    <div key={relatorio.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{relatorio.numero}</h4>
                            <p className="text-sm text-gray-500">{relatorio.obra}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{relatorio.metragem} {relatorio.unidade}</div>
                            <div className="text-xs text-gray-500">{relatorio.data}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{relatorio.rua}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link
                          to={`/relatorios-diarios/${relatorio.id}`}
                          className="text-primary-600 hover:text-primary-700 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/obras/new" className="group">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Nova Obra</h3>
                  <p className="text-sm text-gray-500">Cadastrar projeto</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/relatorios-diarios/new" className="group">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                  <FileText className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Novo Relatório</h3>
                  <p className="text-sm text-gray-500">Relatório diário</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/clients" className="group">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Clientes</h3>
                  <p className="text-sm text-gray-500">Gerenciar clientes</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/financial" className="group">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Financeiro</h3>
                  <p className="text-sm text-gray-500">Controle financeiro</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/maquinarios" className="group">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Maquinários</h3>
                  <p className="text-sm text-gray-500">Equipamentos de pavimentação</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
