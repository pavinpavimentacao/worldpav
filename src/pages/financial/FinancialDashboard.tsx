import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Wallet } from 'lucide-react'
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { DatePicker } from '../../components/ui/date-picker'
import { Input } from '../../components/ui/input'
import { ResumoGeralTab } from '../../components/financial/ResumoGeralTab'
import { ReceitasTab } from '../../components/financial/ReceitasTab'
import { DespesasTab } from '../../components/financial/DespesasTab'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

type TabType = 'resumo' | 'receitas' | 'despesas'

interface ResumoFinanceiro {
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
  saldoAtual: number
}

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('resumo')
  const [mesAno, setMesAno] = useState({ 
    mes: new Date().getMonth() + 1, 
    ano: new Date().getFullYear() 
  })
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null)
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  
  // Estados dos filtros avançados
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tipoTransacao, setTipoTransacao] = useState('')
  const [obraFiltro, setObraFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [valorMinimo, setValorMinimo] = useState('')

  // Gerar opções de meses (últimos 12 meses)
  const getMesesOptions = () => {
    const options = []
    const hoje = new Date()
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = data.getMonth() + 1
      const ano = data.getFullYear()
      const label = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      options.push({ value: `${ano}-${mes}`, label })
    }
    return options
  }

  // Carregar dados do mês
  useEffect(() => {
    loadFinancialData()
  }, [mesAno])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Dados mockados
        setResumo({
          totalReceitas: 66250.00,
          totalDespesas: 15450.00,
          lucroLiquido: 50800.00,
          saldoAtual: 50800.00
        })
      } else {
        // TODO: Implementar chamada real da API
        // const data = await getFinancialConsolidado(mesAno)
        // setResumo(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </Layout>
    )
  }

  const lucroPositivo = (resumo?.lucroLiquido || 0) >= 0

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro WorldPav</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestão financeira consolidada - {mesAno.mes.toString().padStart(2, '0')}/{mesAno.ano}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Seletor de Mês/Ano */}
            <div className="w-64">
              <Select
                value={`${mesAno.ano}-${mesAno.mes}`}
                onChange={(value) => {
                  const [ano, mes] = value.split('-')
                  setMesAno({ ano: parseInt(ano), mes: parseInt(mes) })
                }}
                options={getMesesOptions()}
                label=""
                placeholder="Selecione o período"
              />
            </div>
            <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Painel de Filtros Avançados */}
        {mostrarFiltros && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
              <button
                onClick={() => setMostrarFiltros(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Período Customizado */}
              <DatePicker
                value={dataInicio}
                onChange={setDataInicio}
                label="Data Início"
                placeholder="Selecione a data inicial"
              />

              <DatePicker
                value={dataFim}
                onChange={setDataFim}
                label="Data Fim"
                placeholder="Selecione a data final"
                minDate={dataInicio}
              />

              {/* Tipo de Transação */}
              <Select
                value={tipoTransacao}
                onChange={setTipoTransacao}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'receitas', label: 'Apenas Receitas' },
                  { value: 'despesas', label: 'Apenas Despesas' }
                ]}
                label="Tipo"
                placeholder="Selecione o tipo"
              />

              {/* Obra */}
              <Select
                value={obraFiltro}
                onChange={setObraFiltro}
                options={[
                  { value: '', label: 'Todas as Obras' },
                  { value: 'obra1', label: 'Pavimentação Rua das Flores - Osasco' },
                  { value: 'obra2', label: 'Avenida Central - Barueri' }
                ]}
                label="Obra"
                placeholder="Selecione a obra"
              />

              {/* Categoria de Despesa */}
              <Select
                value={categoriaFiltro}
                onChange={setCategoriaFiltro}
                options={[
                  { value: '', label: 'Todas as Categorias' },
                  { value: 'diesel', label: 'Diesel' },
                  { value: 'materiais', label: 'Materiais' },
                  { value: 'manutencao', label: 'Manutenção' },
                  { value: 'mao_obra', label: 'Mão de Obra' },
                  { value: 'outros', label: 'Outros' }
                ]}
                label="Categoria"
                placeholder="Selecione a categoria"
              />

              {/* Valor Mínimo */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Valor Mínimo
                </label>
                <Input
                  type="number"
                  value={valorMinimo}
                  onChange={(e) => setValorMinimo(e.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  // Limpar filtros
                  setDataInicio('')
                  setDataFim('')
                  setTipoTransacao('')
                  setObraFiltro('')
                  setCategoriaFiltro('')
                  setValorMinimo('')
                  setMostrarFiltros(false)
                }}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Aplicar filtros (lógica futura)
                  console.log('Filtros aplicados:', {
                    dataInicio,
                    dataFim,
                    tipoTransacao,
                    obraFiltro,
                    categoriaFiltro,
                    valorMinimo
                  })
                  setMostrarFiltros(false)
                }}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Cards KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Receitas */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Receitas</p>
                <p className="text-xl font-bold text-green-600">
                  R$ {(resumo?.totalReceitas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Total Despesas */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Despesas</p>
                <p className="text-xl font-bold text-red-600">
                  R$ {(resumo?.totalDespesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Lucro Líquido - cor dinâmica */}
          <div className={`p-4 rounded-lg border ${lucroPositivo ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${lucroPositivo ? 'bg-blue-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <DollarSign className={`h-5 w-5 ${lucroPositivo ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${lucroPositivo ? 'text-blue-700' : 'text-red-700'}`}>Lucro Líquido</p>
                <p className={`text-xl font-bold ${lucroPositivo ? 'text-blue-900' : 'text-red-900'}`}>
                  R$ {(resumo?.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Saldo Atual */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saldo Atual</p>
                <p className="text-xl font-bold text-purple-600">
                  R$ {(resumo?.saldoAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema de Abas */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Navegação das Abas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('resumo')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'resumo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resumo Geral
              </button>
              <button
                onClick={() => setActiveTab('receitas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'receitas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setActiveTab('despesas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'despesas'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Despesas
              </button>
            </nav>
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {activeTab === 'resumo' && (
              <ResumoGeralTab mesAno={mesAno} />
            )}

            {activeTab === 'receitas' && (
              <ReceitasTab mesAno={mesAno} />
            )}

            {activeTab === 'despesas' && (
              <DespesasTab mesAno={mesAno} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

