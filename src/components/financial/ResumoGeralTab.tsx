import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Building2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

interface ObraResumo {
  id: string
  nome: string
  status: string
  totalFaturado: number
  totalDespesas: number
  lucro: number
}

interface ResumoGeralTabProps {
  mesAno: { mes: number; ano: number }
}

interface DadosGraficoLinha {
  dia: string
  receitas: number
  despesas: number
}

interface DadosGraficoPizza {
  nome: string
  valor: number
  cor: string
  [key: string]: string | number
}

// Cores para o gráfico de pizza
const CORES_PIZZA = [
  '#FBBF24', // Amarelo (Diesel)
  '#3B82F6', // Azul (Materiais)
  '#F97316', // Laranja (Manutenção)
  '#A855F7', // Roxo (Mão de Obra)
  '#6B7280', // Cinza (Outros)
]

export function ResumoGeralTab({ mesAno }: ResumoGeralTabProps) {
  const [obras, setObras] = useState<ObraResumo[]>([])
  const [dadosLinha, setDadosLinha] = useState<DadosGraficoLinha[]>([])
  const [dadosPizza, setDadosPizza] = useState<DadosGraficoPizza[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadObrasResumo()
  }, [mesAno])

  const loadObrasResumo = async () => {
    try {
      setLoading(true)

      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Dados mockados - Obras
        setObras([
          {
            id: '1',
            nome: 'Pavimentação Rua das Flores - Osasco',
            status: 'em_andamento',
            totalFaturado: 36250.00,
            totalDespesas: 8500.00,
            lucro: 27750.00
          },
          {
            id: '2',
            nome: 'Avenida Central - Barueri',
            status: 'em_andamento',
            totalFaturado: 30000.00,
            totalDespesas: 6950.00,
            lucro: 23050.00
          }
        ])

        // Dados mockados - Gráfico de Linha (Receitas vs Despesas por dia)
        setDadosLinha([
          { dia: '01', receitas: 0, despesas: 0 },
          { dia: '05', receitas: 0, despesas: 1200 },
          { dia: '10', receitas: 0, despesas: 850 },
          { dia: '15', receitas: 0, despesas: 550 },
          { dia: '18', receitas: 0, despesas: 450 },
          { dia: '20', receitas: 18500, despesas: 980 },
          { dia: '22', receitas: 17750, despesas: 0 },
          { dia: '25', receitas: 30000, despesas: 320 },
          { dia: '30', receitas: 0, despesas: 0 },
        ])

        // Dados mockados - Gráfico de Pizza (Distribuição de Despesas)
        setDadosPizza([
          { nome: 'Diesel', valor: 1400, cor: CORES_PIZZA[0] },
          { nome: 'Materiais', valor: 2180, cor: CORES_PIZZA[1] },
          { nome: 'Manutenção', valor: 450, cor: CORES_PIZZA[2] },
          { nome: 'Mão de Obra', valor: 11100, cor: CORES_PIZZA[3] },
          { nome: 'Outros', valor: 320, cor: CORES_PIZZA[4] },
        ])
      } else {
        // TODO: Implementar chamada real da API
        // const data = await getObrasComResumoFinanceiro(mesAno)
        // setObras(data)
        // setDadosLinha(gerarDadosLinha(data))
        // setDadosPizza(gerarDadosPizza(data))
      }
    } catch (error) {
      console.error('Erro ao carregar resumo de obras:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando resumo...</div>
      </div>
    )
  }

  // Formatador customizado para valores em R$
  const formatarValor = (valor: number) => {
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  // Formatador para tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-2">Dia {payload[0].payload.dia}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatarValor(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Label customizado para o gráfico de pizza
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / dadosPizza.reduce((sum, d) => sum + d.valor, 0)) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <div className="space-y-6">
      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Receitas vs Despesas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Receitas vs Despesas ao Longo do Mês
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="dia" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                name="Receitas"
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                name="Despesas"
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Distribuição de Despesas */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Distribuição de Despesas por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dadosPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="valor"
              >
                {dadosPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatarValor(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, entry: any) => {
                  const item = dadosPizza.find(d => d.nome === value)
                  return `${value}: ${formatarValor(item?.valor || 0)}`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Obras com Lucro Individual */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Desempenho por Obra
        </h3>

        {obras.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">Nenhuma obra com movimentação financeira neste período</p>
          </div>
        ) : (
          <div className="space-y-3">
            {obras.map(obra => {
              const lucroPositivo = obra.lucro >= 0
              const margemLucro = obra.totalFaturado > 0 
                ? ((obra.lucro / obra.totalFaturado) * 100).toFixed(1) 
                : '0'

              return (
                <div 
                  key={obra.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{obra.nome}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-green-600">
                          Receita: R$ {obra.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-red-600">
                          Despesas: R$ {obra.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center gap-2 ${lucroPositivo ? 'text-blue-600' : 'text-red-600'}`}>
                        {lucroPositivo ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                        <div>
                          <p className="text-lg font-bold">
                            R$ {Math.abs(obra.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs">
                            Margem: {margemLucro}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

