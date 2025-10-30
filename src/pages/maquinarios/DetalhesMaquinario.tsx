import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Link, useParams } from 'react-router-dom'
import { Button } from "../../components/shared/Button"
import { PhotoModal } from "../../components/modals/PhotoModal"
import { DieselTab } from '../../components/maquinarios/DieselTab'
import { SeguroTab } from '../../components/maquinarios/SeguroTab'
import { LicencasTab } from '../../components/maquinarios/LicencasTab'
import { MaquinariosAPI } from '../../lib/maquinariosApi'
import type { Maquinario } from '../../types/maquinarios'
import { getStatusColor, getStatusLabel } from '../../types/maquinarios'
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
  FileCheck,
  Loader2
} from 'lucide-react'

type TabType = 'informacoes' | 'obras' | 'diesel' | 'seguro' | 'licencas' | 'cola';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

interface Obra {
  id: string;
  nome: string;
  cliente: string;
  dataInicio: string;
  dataFim?: string;
  status: string;
  valorUtilizado: number;
  diasTrabalhados: number;
}

interface CarregamentoCola {
  id: string;
  data: string;
  parceiro: string;
  produto: string;
  quantidade: number;
  precoKG: number;
  valorTotal: number;
  operador: string;
}

interface ConsumoCola {
  id: string;
  data: string;
  obra: string;
  m2Imprimados: number;
  kgConsumidos: number;
  produto: string;
  operador: string;
}

const DetalhesMaquinario = () => {
  const { id } = useParams<{ id: string }>()
  const [maquinario, setMaquinario] = useState<Maquinario | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  const [carregamentosCola, setCarregamentosCola] = useState<CarregamentoCola[]>([])
  const [consumoCola, setConsumoCola] = useState<ConsumoCola[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, title: string} | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('informacoes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tabs: Tab[] = [
    { id: 'informacoes', label: 'Informações', icon: <Settings className="h-4 w-4" /> },
    { id: 'obras', label: 'Obras', icon: <MapPin className="h-4 w-4" /> },
    { id: 'diesel', label: 'Diesel', icon: <Fuel className="h-4 w-4" /> },
    { id: 'seguro', label: 'Seguro', icon: <Shield className="h-4 w-4" /> },
    { id: 'licencas', label: 'Licenças', icon: <FileText className="h-4 w-4" /> },
    { id: 'cola', label: 'Cola', icon: <Droplets className="h-4 w-4" /> }
  ]

  // Carregar dados do maquinário
  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;

      try {
        setLoading(true)
        setError(null)

        const maquinarioData = await MaquinariosAPI.getById(id)
        
        if (!maquinarioData) {
          setError('Maquinário não encontrado')
          return
        }

        setMaquinario(maquinarioData)

        // TODO: Carregar dados relacionados (obras, diesel, etc.)
        // Por enquanto, manter arrays vazios
        setObras([])
        setCarregamentosCola([])
        setConsumoCola([])

      } catch (err) {
        console.error('Erro ao carregar maquinário:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar maquinário')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id])

  const handlePhotoClick = (url: string, title: string) => {
    setSelectedPhoto({ url, title })
    setShowPhotoModal(true)
  }

  const handleDelete = async () => {
    if (!maquinario) return;

    if (window.confirm('Tem certeza que deseja remover este maquinário?')) {
      try {
        await MaquinariosAPI.delete(maquinario.id)
        // Redirecionar para a listagem
        window.location.href = '/maquinarios'
      } catch (err) {
        console.error('Erro ao remover maquinário:', err)
        alert('Erro ao remover maquinário')
      }
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando maquinário...</span>
        </div>
      </Layout>
    )
  }

  if (error || !maquinario) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <p className="mt-1 text-sm text-red-700">{error || 'Maquinário não encontrado'}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/maquinarios">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Lista
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const statusColors = getStatusColor(maquinario.status)

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link to="/maquinarios">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{maquinario.name}</h1>
                <p className="text-gray-600">{maquinario.type || 'Tipo não especificado'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link to={`/maquinarios/${maquinario.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
              {getStatusLabel(maquinario.status)}
            </span>
            {maquinario.plate && (
              <span className="text-sm text-gray-600 font-mono">
                Placa: {maquinario.plate}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'informacoes' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Foto */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Foto do Maquinário</h3>
                  {maquinario.photo_url ? (
                    <img
                      src={maquinario.photo_url}
                      alt={maquinario.name}
                      className="w-full h-64 object-cover rounded-lg cursor-pointer"
                      onClick={() => handlePhotoClick(maquinario.photo_url!, maquinario.name)}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Settings className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Informações Básicas */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-sm text-gray-900">{maquinario.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo</label>
                      <p className="text-sm text-gray-900">{maquinario.type || 'Não especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Marca</label>
                      <p className="text-sm text-gray-900">{maquinario.brand || 'Não especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Modelo</label>
                      <p className="text-sm text-gray-900">{maquinario.model || 'Não especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Placa</label>
                      <p className="text-sm text-gray-900 font-mono">{maquinario.plate || 'Não especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ano</label>
                      <p className="text-sm text-gray-900">{maquinario.year || 'Não especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                        {getStatusLabel(maquinario.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Cadastro</label>
                      <p className="text-sm text-gray-900">
                        {new Date(maquinario.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {maquinario.observations && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-500">Observações</label>
                      <p className="text-sm text-gray-900 mt-1">{maquinario.observations}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obras' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Obras Realizadas</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Obra
                </Button>
              </div>
              
              {obras.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma obra encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Este maquinário ainda não foi utilizado em nenhuma obra.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {obras.map((obra) => (
                    <div key={obra.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{obra.nome}</h4>
                          <p className="text-sm text-gray-500">{obra.cliente}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            R$ {obra.valorUtilizado.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-500">{obra.diasTrabalhados} dias</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'diesel' && (
            <div className="p-6">
              <DieselTab maquinarioId={maquinario.id} />
            </div>
          )}

          {activeTab === 'seguro' && (
            <div className="p-6">
              <SeguroTab maquinarioId={maquinario.id} />
            </div>
          )}

          {activeTab === 'licencas' && (
            <div className="p-6">
              <LicencasTab 
                maquinarioId={maquinario.id} 
                maquinarioNome={maquinario.name}
                maquinarioTipo={maquinario.type || ''}
              />
            </div>
          )}

          {activeTab === 'cola' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Controle de Cola</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Carregamento
                </Button>
              </div>
              
              {carregamentosCola.length === 0 ? (
                <div className="text-center py-8">
                  <Droplets className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum carregamento encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Este maquinário ainda não teve carregamentos de cola registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {carregamentosCola.map((carregamento) => (
                    <div key={carregamento.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{carregamento.produto}</h4>
                          <p className="text-sm text-gray-500">{carregamento.parceiro}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            R$ {carregamento.valorTotal.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-sm text-gray-500">{carregamento.quantidade}kg</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Foto */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        photoUrl={selectedPhoto?.url}
        title={selectedPhoto?.title || 'Foto do Maquinário'}
      />
    </Layout>
  )
}

export default DetalhesMaquinario