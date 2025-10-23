import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Link, useParams } from 'react-router-dom'
import { Button } from "../../components/shared/Button"
import { PhotoModal } from "../../components/modals/PhotoModal"
import { DieselTab } from '../../components/maquinarios/DieselTab'
import { SeguroTab } from '../../components/maquinarios/SeguroTab'
import { LicencasTab } from '../../components/maquinarios/LicencasTab'
import { 
  ArrowLeft, 
  Edit, 
  Settings, 
  User, 
  Calendar, 
  Fuel, 
  MapPin, 
  DollarSign,
  Plus,
  Eye,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Shield,
  FileText,
  FileCheck
} from 'lucide-react'

type TabType = 'informacoes' | 'obras' | 'diesel' | 'seguro' | 'licencas' | 'cola';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

// Dados mock para demonstração - diferentes maquinários por ID
const mockMaquinarios = {
  '1': {
    id: '1',
    nome: 'Vibroacabadora CAT AP1055F',
    tipo: 'Vibroacabadora (Pavimentadora de Asfalto)',
    funcao: 'Aplicação de asfalto quente em camadas uniformes com vibração integrada',
    etapaUso: 'Aplicação (CBUQ / Pavimentação)',
    observacoes: 'Equipamento principal para pavimentação de vias urbanas',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH8lPk9uukiNplQ2sgoCUkBKkZ2WAfYIVaSA&s',
    operador: 'João Silva',
    operadorSecundario: 'Maria Santos',
    tipoOperadorSecundario: 'Mesista',
    dataCadastro: '2024-01-15',
    ultimaManutencao: '2024-01-20',
    proximaManutencao: '2024-02-20',
    status: 'ativo'
  },
  '2': {
    id: '2',
    nome: 'Espargidor de Emulsão Volvo FMX',
    tipo: 'Caminhão Espargidor de Emulsão (Carrega a Cola)',
    funcao: 'Aplicação de emulsão asfáltica para imprimação e pintura de ligação',
    etapaUso: 'Pré-aplicação (Imprimação / Pintura de ligação)',
    observacoes: 'Capacidade de 8.000L, sistema de aquecimento integrado',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8BvdsKY0mP26GMVkvpBqdqQuw2bkX1IHeog&s',
    operador: 'Carlos Mendes',
    operadorSecundario: 'Ana Costa',
    tipoOperadorSecundario: 'Mangueirista',
    dataCadastro: '2024-01-10',
    ultimaManutencao: '2024-01-18',
    proximaManutencao: '2024-02-18',
    status: 'ativo'
  },
  '3': {
    id: '3',
    nome: 'Rolo Compactador Chapa Dynapac CA2500',
    tipo: 'Rolo Compactador Chapa (Chapa-Chapa)',
    funcao: 'Compactação inicial e final do asfalto aplicado',
    etapaUso: 'Compactação inicial',
    observacoes: 'Peso operacional de 10 toneladas',
    foto: 'https://www.ecivilnet.com/dicionario/images/rolo-compactador-tandem.jpg',
    operador: 'Pedro Santos',
    operadorSecundario: '',
    tipoOperadorSecundario: '',
    dataCadastro: '2024-01-05',
    ultimaManutencao: '2024-01-25',
    proximaManutencao: '2024-02-25',
    status: 'ativo'
  },
  '4': {
    id: '4',
    nome: 'Rolo Pneumático Bomag BW213',
    tipo: 'Rolo Compactador Pneumático (Pneu-Pneu)',
    funcao: 'Compactação final e acabamento da superfície asfáltica',
    etapaUso: 'Compactação final',
    observacoes: '8 pneus, sistema de vibração opcional',
    foto: 'https://tratorex.net/equipamentos/24G426/1.jpg',
    operador: 'Roberto Lima',
    operadorSecundario: '',
    tipoOperadorSecundario: '',
    dataCadastro: '2024-01-12',
    ultimaManutencao: '2024-01-22',
    proximaManutencao: '2024-02-22',
    status: 'ativo'
  }
}

const mockObras = [
  {
    id: '1',
    nome: 'Pavimentação Rua das Flores - Osasco',
    cliente: 'Prefeitura de Osasco',
    dataInicio: '2024-01-20',
    dataFim: '2024-01-25',
    status: 'concluida',
    valorUtilizado: 15000,
    diasTrabalhados: 5
  },
  {
    id: '2',
    nome: 'Recapeamento Avenida Central',
    cliente: 'FBS',
    dataInicio: '2024-02-01',
    dataFim: null,
    status: 'em_andamento',
    valorUtilizado: 8500,
    diasTrabalhados: 3
  }
]

const mockCarregamentosCola = [
  {
    id: '1',
    data: '2024-01-15',
    parceiro: 'Usina Asfáltica São Paulo',
    produto: 'RR-2C (Emulsão)',
    quantidade: 8000,
    precoKG: 2.50,
    valorTotal: 20000,
    operador: 'Carlos Mendes'
  },
  {
    id: '2',
    data: '2024-01-10',
    parceiro: 'Asfalto & Cia Ltda',
    produto: 'Impermeabilizante',
    quantidade: 2000,
    precoKG: 3.20,
    valorTotal: 6400,
    operador: 'Carlos Mendes'
  },
  {
    id: '3',
    data: '2024-01-05',
    parceiro: 'Usina Asfáltica São Paulo',
    produto: 'RR-2C (Emulsão)',
    quantidade: 6000,
    precoKG: 2.45,
    valorTotal: 14700,
    operador: 'Carlos Mendes'
  }
]

const mockConsumoCola = [
  {
    id: '1',
    data: '2024-01-20',
    obra: 'Pavimentação Rua das Flores - Osasco',
    m2Imprimados: 1500,
    kgConsumidos: 1500,
    produto: 'RR-2C (Emulsão)',
    operador: 'Carlos Mendes'
  },
  {
    id: '2',
    data: '2024-01-21',
    obra: 'Pavimentação Rua das Flores - Osasco',
    m2Imprimados: 800,
    kgConsumidos: 800,
    produto: 'RR-2C (Emulsão)',
    operador: 'Carlos Mendes'
  },
  {
    id: '3',
    data: '2024-02-01',
    obra: 'Recapeamento Avenida Central',
    m2Imprimados: 1200,
    kgConsumidos: 1200,
    produto: 'RR-2C (Emulsão)',
    operador: 'Carlos Mendes'
  }
]

const DetalhesMaquinario = () => {
  const { id } = useParams<{ id: string }>()
  const [maquinario, setMaquinario] = useState(mockMaquinarios['1'])
  const [obras, setObras] = useState(mockObras)
  const [carregamentosCola, setCarregamentosCola] = useState(mockCarregamentosCola)
  const [consumoCola, setConsumoCola] = useState(mockConsumoCola)
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, title: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('informacoes')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Carregar maquinário baseado no ID
      setMaquinario(mockMaquinarios[id as keyof typeof mockMaquinarios] || mockMaquinarios['1'])
      
      setIsLoading(false)
    }

    loadData()
  }, [id])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800'
      case 'manutencao':
        return 'bg-yellow-100 text-yellow-800'
      case 'inativo':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getObraStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'planejada':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Cálculos para controle de cola (apenas para espargidor)
  const totalCarregamentosCola = carregamentosCola.reduce((total, item) => total + item.quantidade, 0)
  const totalConsumoCola = consumoCola.reduce((total, item) => total + item.kgConsumidos, 0)
  const estoqueAtualCola = totalCarregamentosCola - totalConsumoCola
  const totalM2Imprimados = consumoCola.reduce((total, item) => total + item.m2Imprimados, 0)
  
  // Alerta de estoque baixo (menos de 20% da capacidade ou menos de 1000kg)
  const isEspargidor = maquinario.tipo.includes('Espargidor')
  const alertaEstoqueBaixo = isEspargidor && (estoqueAtualCola < 1000 || estoqueAtualCola < (totalCarregamentosCola * 0.2))

  // Definir tabs baseado no tipo de maquinário
  const tabs: Tab[] = [
    { id: 'informacoes', label: 'Informações', icon: <Settings className="h-4 w-4" /> },
    { id: 'obras', label: 'Obras', icon: <MapPin className="h-4 w-4" /> },
    { id: 'diesel', label: 'Diesel', icon: <Fuel className="h-4 w-4" /> },
    { id: 'seguro', label: 'Seguro', icon: <Shield className="h-4 w-4" /> },
    { id: 'licencas', label: 'Licenças', icon: <FileCheck className="h-4 w-4" /> },
  ]
  
  // Adicionar aba de cola apenas para espargidor
  if (isEspargidor) {
    tabs.push({ id: 'cola', label: 'Controle de Cola', icon: <Droplets className="h-4 w-4" /> })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <Link to="/maquinarios" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Maquinários
            </Link>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {maquinario.nome}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {maquinario.tipo}
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
            <Link to={`/maquinarios/${id}/edit`}>
              <Button variant="outline">
                <Edit className="h-5 w-5 mr-2" />
                Editar
              </Button>
            </Link>
            <Button variant="primary">
              <Plus className="h-5 w-5 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`mr-2 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Aba Informações */}
            {activeTab === 'informacoes' && (
              <div className="space-y-6">
                {/* Informações Principais */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foto e Informações Básicas */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary-600" />
                  Informações do Maquinário
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-start space-x-6">
                  {maquinario.foto && (
                    <button
                      onClick={() => setSelectedPhoto({url: maquinario.foto, title: maquinario.nome})}
                      className="flex-shrink-0"
                    >
                      <img
                        src={maquinario.foto}
                        alt={maquinario.nome}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      />
                    </button>
                  )}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{maquinario.nome}</h4>
                      <p className="text-sm text-gray-600 mt-1">{maquinario.tipo}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusBadgeColor(maquinario.status)}`}>
                        {maquinario.status.charAt(0).toUpperCase() + maquinario.status.slice(1)}
                      </span>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Função</h5>
                      <p className="text-sm text-gray-600">{maquinario.funcao}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Etapa de Uso</h5>
                      <p className="text-sm text-gray-600">{maquinario.etapaUso}</p>
                    </div>
                    
                    {maquinario.observacoes && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Observações</h5>
                        <p className="text-sm text-gray-600">{maquinario.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operadores e Status */}
          <div className="space-y-6">
            {/* Operadores */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Operadores
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Operador Principal</p>
                    <p className="text-sm text-gray-600">{maquinario.operador}</p>
                  </div>
                </div>
                
                {maquinario.operadorSecundario && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{maquinario.tipoOperadorSecundario}</p>
                      <p className="text-sm text-gray-600">{maquinario.operadorSecundario}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manutenção */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary-600" />
                  Manutenção
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Última Manutenção</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatDate(maquinario.ultimaManutencao)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Próxima Manutenção</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatDate(maquinario.proximaManutencao)}</span>
                </div>
              </div>
            </div>
          </div>
                </div>
              </div>
            )}

            {/* Aba Obras */}
            {activeTab === 'obras' && (
              <div className="space-y-6">
                {/* Obras que Participa */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                Obras que Participa
              </h3>
              <span className="text-sm text-gray-500">{obras.length} obra(s)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias Trabalhados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Utilizado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {obras.map((obra) => (
                  <tr key={obra.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{obra.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{obra.cliente}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(obra.dataInicio)} - {obra.dataFim ? formatDate(obra.dataFim) : 'Em andamento'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getObraStatusColor(obra.status)}`}>
                        {obra.status.replace('_', ' ').charAt(0).toUpperCase() + obra.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{obra.diasTrabalhados} dias</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(obra.valorUtilizado)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
                </div>
              </div>
            )}

            {/* Aba Diesel */}
            {activeTab === 'diesel' && (
              <DieselTab maquinarioId={id || '1'} />
            )}

            {/* Aba Seguro */}
            {activeTab === 'seguro' && (
              <SeguroTab maquinarioId={id || '1'} maquinarioNome={maquinario.nome} />
            )}

            {/* Aba Licenças */}
            {activeTab === 'licencas' && (
              <LicencasTab 
                maquinarioId={id || '1'} 
                maquinarioNome={maquinario.nome}
                maquinarioTipo={maquinario.tipo}
              />
            )}

            {/* Aba Controle de Cola - Apenas para Espargidor */}
            {activeTab === 'cola' && isEspargidor && (
              <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Droplets className="h-5 w-5 mr-2 text-primary-600" />
                  Controle de Cola (Emulsão)
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Estoque Atual: <span className="font-medium text-gray-900">{estoqueAtualCola.toLocaleString()}kg</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    M² Imprimados: <span className="font-medium text-gray-900">{totalM2Imprimados.toLocaleString()}m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de Estoque Baixo */}
            {alertaEstoqueBaixo && (
              <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Alerta: Estoque de cola baixo!
                    </p>
                    <p className="text-sm text-red-700">
                      Estoque atual: {estoqueAtualCola.toLocaleString()}kg. Recomendamos recarregar o tanque.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carregamentos de Cola */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Histórico de Carregamentos</h4>
                  <div className="space-y-3">
                    {carregamentosCola.map((carregamento) => (
                      <div key={carregamento.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{formatDate(carregamento.data)}</span>
                          <span className="text-sm font-medium text-green-600">{formatCurrency(carregamento.valorTotal)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Parceiro:</strong> {carregamento.parceiro}</p>
                          <p><strong>Produto:</strong> {carregamento.produto}</p>
                          <p><strong>Quantidade:</strong> {carregamento.quantidade.toLocaleString()}kg</p>
                          <p><strong>Preço/kg:</strong> {formatCurrency(carregamento.precoKG)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consumo de Cola por Obra */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Consumo por Obra</h4>
                  <div className="space-y-3">
                    {consumoCola.map((consumo) => (
                      <div key={consumo.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{formatDate(consumo.data)}</span>
                          <span className="text-sm font-medium text-blue-600">{consumo.kgConsumidos.toLocaleString()}kg</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><strong>Obra:</strong> {consumo.obra}</p>
                          <p><strong>M² Imprimados:</strong> {consumo.m2Imprimados.toLocaleString()}m²</p>
                          <p><strong>Produto:</strong> {consumo.produto}</p>
                          <p><strong>Operador:</strong> {consumo.operador}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Droplets className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Carregado</p>
                      <p className="text-2xl font-bold text-blue-600">{totalCarregamentosCola.toLocaleString()}kg</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Total Consumido</p>
                      <p className="text-2xl font-bold text-orange-600">{totalConsumoCola.toLocaleString()}kg</p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 ${alertaEstoqueBaixo ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="flex items-center">
                    <div className={`h-8 w-8 mr-3 ${alertaEstoqueBaixo ? 'text-red-600' : 'text-green-600'}`}>
                      {alertaEstoqueBaixo ? <AlertTriangle className="h-8 w-8" /> : <CheckCircle className="h-8 w-8" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${alertaEstoqueBaixo ? 'text-red-900' : 'text-green-900'}`}>
                        Estoque Atual
                      </p>
                      <p className={`text-2xl font-bold ${alertaEstoqueBaixo ? 'text-red-600' : 'text-green-600'}`}>
                        {estoqueAtualCola.toLocaleString()}kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Foto */}
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto?.url || ''}
          title={selectedPhoto?.title || ''}
        />
      </div>
    </Layout>
  )
}

export default DetalhesMaquinario
