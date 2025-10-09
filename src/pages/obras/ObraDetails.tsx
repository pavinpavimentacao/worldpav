import React, { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, DollarSign, Building2, TrendingUp, Edit, AlertTriangle } from 'lucide-react'
import { ObraRuasTab } from '../../components/obras/ObraRuasTab'
import { ObraFinanceiroTab } from '../../components/obras/ObraFinanceiroTab'

type TabType = 'visao-geral' | 'ruas' | 'financeiro'

const ObraDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<TabType>('visao-geral')

  // Mock data - substituir por dados reais
  const obra = {
    id: id || '1',
    nome: 'Pavimentação Rua das Flores - Osasco',
    cliente: 'Prefeitura de Osasco',
    status: 'em_andamento',
    empresa: 'WorldPav',
    endereco: 'Rua das Flores, 123 - Osasco/SP',
    previsaoConclusao: '2024-02-15',
    valorTotal: 125000,
    // Métricas técnicas da obra (seguindo regra: 1000m² = 100t, espessura média 3,5cm)
    metragemFeita: 3250,
    metragemPlanejada: 5000,
    toneladasAplicadas: 325,      // 3250 m² ÷ 10 = 325 ton
    toneladasPlanejadas: 500,     // 5000 m² ÷ 10 = 500 ton
    espessuraMedia: 3.5,          // Base padrão: 3,5 cm
    ruasFeitas: 4,
    totalRuas: 6,
    faturamentoBruto: 81250
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'planejada': { label: 'Planejada', className: 'bg-gray-100 text-gray-800' },
      'em_andamento': { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      'concluida': { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    }
    return badges[status as keyof typeof badges] || badges.planejada
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
                {obra.nome}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {obra.cliente}
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
                  <span className="text-blue-600 text-sm font-bold">M²</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Metragem Feita</p>
                <p className="text-xl font-semibold text-gray-900">
                  {obra.metragemFeita.toLocaleString('pt-BR')} m²
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">T</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Toneladas</p>
                <p className="text-xl font-semibold text-gray-900">
                  {obra.toneladasAplicadas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">CM</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Espessura Média</p>
                <p className="text-xl font-semibold text-gray-900">
                  {obra.espessuraMedia} cm
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
                  Faturamento <span className="text-xs text-gray-400">(realizado)</span>
                </p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(obra.faturamentoBruto)}
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
                  <p className="text-sm font-medium text-gray-500">Empresa Responsável</p>
                  <p className="text-sm text-gray-900">{obra.empresa}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Endereço</p>
                  <p className="text-sm text-gray-900">{obra.endereco}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Previsão de Conclusão</p>
                  <p className="text-sm text-gray-900">{formatDate(obra.previsaoConclusao)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor Total</p>
                  <p className="text-sm text-gray-900">{formatCurrency(obra.valorTotal)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progresso Técnico */}
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Progresso Técnico da Obra
                </h3>
                <p className="text-xs text-gray-500 mt-1">Baseado em métricas de execução</p>
              </div>
            </div>

            {/* Aviso de Previsão */}
            <div className="mb-5 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">⚠️ Valores de Previsão</p>
                  <p className="mt-1">
                    Os valores planejados são estimativas iniciais. O volume real executado e o faturamento final podem ser <strong>maiores ou menores</strong> que o previsto, dependendo das condições da obra.
                  </p>
                  <p className="mt-2 text-xs bg-yellow-100 p-2 rounded border border-yellow-300">
                    <strong>Base de cálculo:</strong> 1.000 m² = 100 toneladas | Espessura média base: 3,5 cm
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Ruas Concluídas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Ruas Concluídas</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {obra.ruasFeitas} de {obra.totalRuas} <span className="text-xs text-gray-500 font-normal">(previstas)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${obra.totalRuas > 0 ? (obra.ruasFeitas / obra.totalRuas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Metragem Executada */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Metragem Executada</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {obra.metragemFeita.toLocaleString('pt-BR')} m² de {obra.metragemPlanejada.toLocaleString('pt-BR')} m² <span className="text-xs text-gray-500 font-normal">(previstos)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${obra.metragemPlanejada > 0 ? (obra.metragemFeita / obra.metragemPlanejada) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Toneladas Aplicadas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Toneladas Aplicadas</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {obra.toneladasAplicadas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t de {obra.toneladasPlanejadas.toLocaleString('pt-BR')} t <span className="text-xs text-gray-500 font-normal">(previstas)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${obra.toneladasPlanejadas > 0 ? (obra.toneladasAplicadas / obra.toneladasPlanejadas) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Espessura Média */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Espessura Média Aplicada</span>
                  <span className="text-lg font-bold text-gray-900">
                    {obra.espessuraMedia} cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white shadow-sm rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/relatorios-diarios?obra=${id}`)}
            >
              Ver Relatórios Diários
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/notas-fiscais?obra=${id}`)}
            >
              Ver Notas Fiscais
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/obras/${id}/edit`)}
            >
              Editar Informações
            </Button>
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
                onClick={() => setActiveTab('financeiro')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'financeiro'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Financeiro
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {activeTab === 'visao-geral' && (
              <div className="text-center py-8 text-gray-500">
                <p>O conteúdo da Visão Geral continua sendo exibido acima nas seções de informações.</p>
                <p className="mt-2 text-sm">Use as abas "Ruas" e "Financeiro" para gerenciar aspectos específicos da obra.</p>
              </div>
            )}

            {activeTab === 'ruas' && (
              <ObraRuasTab 
                obraId={id || ''} 
                precoPorM2={25} 
              />
            )}

            {activeTab === 'financeiro' && (
              <ObraFinanceiroTab obraId={id || ''} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ObraDetails


