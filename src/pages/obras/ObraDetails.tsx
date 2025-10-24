import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, DollarSign, Building2, TrendingUp, Edit, FileText, Settings } from 'lucide-react'
import { ObraRuasTab } from '../../components/obras/ObraRuasTab'
import { ObraFinanceiroTab } from '../../components/obras/ObraFinanceiroTab'
import { NotasMedicoesTab } from '../../components/obras/NotasMedicoesTab'
import { ObraVisaoGeralTab } from '../../components/obras/ObraVisaoGeralTab'
import { ObraServicosTab } from '../../components/obras/ObraServicosTab'
import { getObraById, Obra } from '../../lib/obrasApi'
import { calcularValorTotalServicos, calcularPrecoPorM2 } from '../../lib/obrasServicosApi'
import { getFaturamentoBrutoTotal } from '../../lib/obrasNotasFiscaisApi'
import { useToast } from '../../lib/toast-hooks'

type TabType = 'visao-geral' | 'ruas' | 'financeiro' | 'notas-medicoes' | 'servicos'

const ObraDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('visao-geral')
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [faturamentoPrevisto, setFaturamentoPrevisto] = useState<number>(0)
  const [valorExecutado, setValorExecutado] = useState<number>(0)
  const [precoPorM2Calculado, setPrecoPorM2Calculado] = useState<number>(0)

  // Carregar dados da obra
  useEffect(() => {
    async function loadObra() {
      if (!id) return

      try {
        setLoading(true)
        const obraData = await getObraById(id)
        
        if (!obraData) {
          addToast({ message: 'Obra não encontrada', type: 'error' })
          navigate('/obras')
          return
        }

        setObra(obraData)
        
        // Carregar o valor total dos serviços
        const valorServicos = await calcularValorTotalServicos(id)
        setFaturamentoPrevisto(valorServicos)
        
        // Carregar o preço por m² calculado dos serviços
        const precoPorM2 = await calcularPrecoPorM2(id)
        setPrecoPorM2Calculado(precoPorM2)
        
        // Carregar o valor executado (faturamento bruto total)
        const faturamentoBruto = await getFaturamentoBrutoTotal(id)
        setValorExecutado(faturamentoBruto)
      } catch (error) {
        console.error('Erro ao carregar obra:', error)
        addToast({ message: 'Erro ao carregar obra', type: 'error' })
        navigate('/obras')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadObra()
    }
  }, [id, addToast, navigate])

  if (loading || !obra) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p>Carregando obra...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'planejamento': { label: 'Planejamento', className: 'bg-gray-100 text-gray-800' },
      'andamento': { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      'concluida': { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    }
    return badges[status as keyof typeof badges] || badges.planejamento
  }

  const statusBadge = getStatusBadge(obra.status)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/obras')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                {obra.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {obra.client?.name || 'Cliente não informado'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            <Button
              variant="primary"
              onClick={() => navigate(`/obras/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Obra
            </Button>
          </div>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Faturamento Previsto</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(faturamentoPrevisto || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Previsão Início</p>
                <p className="text-xl font-semibold text-gray-900">
                  {obra.start_date ? formatDate(obra.start_date) : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Previsão Conclusão</p>
                <p className="text-xl font-semibold text-gray-900">
                  {obra.expected_end_date ? formatDate(obra.expected_end_date) : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Executado
                </p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(valorExecutado)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Gerais */}
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Gerais
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Cliente</p>
                  <p className="text-sm text-gray-900">{obra.client?.name || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Região/Bairro</p>
                  <p className="text-sm text-gray-900">{obra.location || obra.city || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Cidade/Estado</p>
                  <p className="text-sm text-gray-900">{obra.city}/{obra.state}</p>
                </div>
              </div>

              {obra.description && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Descrição</p>
                    <p className="text-sm text-gray-900">{obra.description}</p>
                  </div>
                </div>
              )}

              {obra.observations && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Observações</p>
                    <p className="text-sm text-gray-900">{obra.observations}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status e Datas */}
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status e Cronograma
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Status Atual</p>
                  <span className={`inline-flex mt-1 px-3 py-1 text-sm font-semibold rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {obra.start_date && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Início</p>
                    <p className="text-sm text-gray-900">{formatDate(obra.start_date)}</p>
                  </div>
                </div>
              )}

              {obra.expected_end_date && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Previsão de Conclusão</p>
                    <p className="text-sm text-gray-900">{formatDate(obra.expected_end_date)}</p>
                  </div>
                </div>
              )}

              {obra.end_date && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data de Conclusão</p>
                    <p className="text-sm text-gray-900">{formatDate(obra.end_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Sistema de Abas */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Navegação das Abas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('visao-geral')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'visao-geral'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('ruas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'ruas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ruas
              </button>
              <button
                onClick={() => setActiveTab('servicos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'servicos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 mr-1 inline-block" />
                Serviços
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'financeiro'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Financeiro
              </button>
              <button
                onClick={() => setActiveTab('notas-medicoes')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notas-medicoes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notas e Medições
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {activeTab === 'visao-geral' && (
              <ObraVisaoGeralTab 
                obraId={id || ''} 
                obra={obra}
              />
            )}

            {activeTab === 'ruas' && (
              <ObraRuasTab 
                obraId={id || ''} 
                precoPorM2={precoPorM2Calculado || 25} 
              />
            )}

            {activeTab === 'financeiro' && (
              <ObraFinanceiroTab obraId={id || ''} />
            )}

            {activeTab === 'notas-medicoes' && (
              <NotasMedicoesTab 
                obraId={id || ''} 
                precoPorM2={precoPorM2Calculado || 25}
              />
            )}
            
            {activeTab === 'servicos' && (
              <ObraServicosTab 
                obraId={id || ''} 
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ObraDetails


