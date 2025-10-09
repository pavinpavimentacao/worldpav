import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  DollarSign,
  Layers,
  Truck, 
  Users,
  Edit,
  Package,
  Plus
} from 'lucide-react'
import { getParceiroById, getCarregamentosRR2C, getConsumosRR2C } from '../../lib/parceirosApi'
import { ParceiroCompleto, nichoLabels, PrecoFaixa, ParceiroMaquinario, ParceiroEquipe } from '../../types/parceiros'
import { CarregamentoRR2C, ConsumoRR2C } from '../../types/carregamento-rr2c'
import { ModalAdicionarFaixa } from '../../components/parceiros/ModalAdicionarFaixa'
import { ModalAdicionarMaquinario } from '../../components/parceiros/ModalAdicionarMaquinario'
import { ModalAdicionarEquipe } from '../../components/parceiros/ModalAdicionarEquipe'

const ParceiroDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [parceiro, setParceiro] = useState<ParceiroCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos modais
  const [modalFaixaOpen, setModalFaixaOpen] = useState(false)
  const [modalMaquinarioOpen, setModalMaquinarioOpen] = useState(false)
  const [modalEquipeOpen, setModalEquipeOpen] = useState(false)
  
  // Estados para RR2C
  const [carregamentosRR2C, setCarregamentosRR2C] = useState<CarregamentoRR2C[]>([])
  const [consumosRR2C, setConsumosRR2C] = useState<ConsumoRR2C[]>([])

  useEffect(() => {
    if (id) {
      loadParceiro(id)
    }
  }, [id])

  async function loadParceiro(parceiroId: string) {
    try {
      setLoading(true)
      const data = await getParceiroById(parceiroId)
      setParceiro(data)
      
      // Se for usina RR2C, carregar dados adicionais
      if (data && data.nicho === 'usina_rr2c') {
        const [carregamentos, consumos] = await Promise.all([
          getCarregamentosRR2C(parceiroId),
          getConsumosRR2C(parceiroId)
        ])
        setCarregamentosRR2C(carregamentos)
        setConsumosRR2C(consumos)
      }
    } catch (error) {
      console.error('Erro ao carregar parceiro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handlers para adicionar itens
  function handleAdicionarFaixa(novaFaixa: PrecoFaixa) {
    if (!parceiro) return
    
    const precosAtualizados = [...(parceiro.precos_faixas || []), novaFaixa]
    setParceiro({
      ...parceiro,
      precos_faixas: precosAtualizados
    })
    // TODO: Salvar no backend
    console.log('Nova faixa adicionada:', novaFaixa)
  }

  function handleAdicionarMaquinario(novoMaquinario: Omit<ParceiroMaquinario, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>) {
    if (!parceiro) return
    
    const novoMaquinarioCompleto: ParceiroMaquinario = {
      ...novoMaquinario,
      id: `maq-${Date.now()}`,
      parceiro_id: parceiro.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const maquinariosAtualizados = [...(parceiro.maquinarios || []), novoMaquinarioCompleto]
    setParceiro({
      ...parceiro,
      maquinarios: maquinariosAtualizados
    })
    // TODO: Salvar no backend
    console.log('Novo maquinário adicionado:', novoMaquinarioCompleto)
  }

  function handleAdicionarEquipe(novaEquipe: Omit<ParceiroEquipe, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>) {
    if (!parceiro) return
    
    const novaEquipeCompleta: ParceiroEquipe = {
      ...novaEquipe,
      id: `eq-${Date.now()}`,
      parceiro_id: parceiro.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const equipesAtualizadas = [...(parceiro.equipes || []), novaEquipeCompleta]
    setParceiro({
      ...parceiro,
      equipes: equipesAtualizadas
    })
    // TODO: Salvar no backend
    console.log('Nova equipe adicionada:', novaEquipeCompleta)
  }

  const getNichoBadgeColor = (nicho: string) => {
    switch (nicho) {
      case 'usina_asfalto':
        return 'bg-blue-100 text-blue-800'
      case 'usina_rr2c':
        return 'bg-purple-100 text-purple-800'
      case 'empreiteiro':
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

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Carregando parceiro...</p>
        </div>
      </Layout>
    )
  }

  if (!parceiro) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-500">Parceiro não encontrado</p>
          <Button
            onClick={() => navigate('/parceiros')}
            className="mt-4"
          >
            Voltar para Listagem
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/parceiros')}
                className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
                Voltar
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{parceiro.nome}</h1>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getNichoBadgeColor(parceiro.nicho)}`}>
                  {nichoLabels[parceiro.nicho]}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate(`/parceiros/${id}/editar`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados de Contato */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
            
            <div className="space-y-3">
              {parceiro.contato && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contato</p>
                    <p className="font-medium text-gray-900">{parceiro.contato}</p>
                  </div>
                </div>
              )}

              {parceiro.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-900">{parceiro.telefone}</p>
                  </div>
                </div>
              )}

              {parceiro.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-medium text-gray-900">{parceiro.email}</p>
                  </div>
                </div>
              )}

              {parceiro.endereco && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Endereço</p>
                    <p className="font-medium text-gray-900">{parceiro.endereco}</p>
                  </div>
                </div>
              )}
            </div>
                </div>

          {/* Dados Fiscais */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Fiscais</h3>
            
            <div className="space-y-3">
              {parceiro.cnpj && (
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                <div>
                    <p className="text-sm text-gray-500">CNPJ</p>
                    <p className="font-medium text-gray-900">{parceiro.cnpj}</p>
                </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de Parceiro</p>
                  <p className="font-medium text-gray-900">{nichoLabels[parceiro.nicho]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Específicas por Nicho */}

        {/* USINA DE ASFALTO */}
        {parceiro.nicho === 'usina_asfalto' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  Tabela de Preços por Faixa de Asfalto
                </h3>
                <Button
                  onClick={() => setModalFaixaOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Faixa
                </Button>
              </div>

              {parceiro.precos_faixas && parceiro.precos_faixas.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Faixa
                      </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Preço por Tonelada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {parceiro.precos_faixas.map((item, index) => (
                        <tr key={item.faixa} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {item.faixa.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(item.preco_tonelada)}
                            </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Nenhum preço cadastrado</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Adicione faixas e preços clicando em "Editar"
                  </p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Layers className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Sobre os Preços</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Os preços variam de acordo com a faixa de asfalto. Faixas mais especializadas (SMA) têm valores superiores.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica de Edição */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Edit className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Gerenciar Tabela de Preços</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Para adicionar, editar ou remover faixas e preços, clique em "Editar" no canto superior direito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EMPREITEIRO */}
        {parceiro.nicho === 'empreiteiro' && (
          <div className="space-y-6">
            {/* Maquinários */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="h-6 w-6 text-orange-600" />
                    Maquinários Disponíveis
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    {parceiro.maquinarios?.length || 0}
                  </span>
                </div>
                <Button
                  onClick={() => setModalMaquinarioOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Maquinário
                </Button>
              </div>

              {parceiro.maquinarios && parceiro.maquinarios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parceiro.maquinarios.map(maq => (
                    <div key={maq.id} className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Truck className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{maq.nome}</p>
                          <p className="text-sm text-gray-600 mt-1">{maq.tipo}</p>
                          {maq.placa && (
                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              {maq.placa}
                            </p>
                          )}
                          {maq.valor_diaria && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(maq.valor_diaria)}
                                <span className="text-sm font-normal text-gray-500">/dia</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
              </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum maquinário cadastrado</p>
                  <p className="text-sm text-gray-500 mt-1">Adicione maquinários na edição</p>
                </div>
              )}
            </div>

            {/* Equipes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-6 w-6 text-orange-600" />
                    Equipes Disponíveis
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    {parceiro.equipes?.length || 0}
                  </span>
                </div>
                <Button
                  onClick={() => setModalEquipeOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Equipe
                </Button>
              </div>

              {parceiro.equipes && parceiro.equipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parceiro.equipes.map(eq => (
                    <div key={eq.id} className="p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{eq.nome}</p>
                          <div className="mt-3 space-y-2">
                            {eq.quantidade_pessoas && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 uppercase">Pessoas:</span>
                                <span className="text-sm font-medium text-gray-900">{eq.quantidade_pessoas}</span>
                  </div>
                            )}
                            {eq.especialidade && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 uppercase">Especialidade:</span>
                                <span className="text-sm font-medium text-gray-900">{eq.especialidade}</span>
                  </div>
                            )}
                            {eq.valor_diaria && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xl font-bold text-green-600">
                                  {formatCurrency(eq.valor_diaria)}
                                  <span className="text-sm font-normal text-gray-500">/dia</span>
                                </p>
                </div>
                            )}
              </div>
            </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhuma equipe cadastrada</p>
                  <p className="text-sm text-gray-500 mt-1">Adicione equipes na edição</p>
                </div>
              )}
            </div>
                  </div>
        )}

        {/* USINA RR2C - CONTROLE DE ESTOQUE */}
        {parceiro.nicho === 'usina_rr2c' && (
          <div className="space-y-6">
            {/* Estoque Atual */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  Controle de Estoque RR2C
                </h3>
                <Button
                  onClick={() => navigate(`/parceiros/${id}/novo-carregamento`)}
                  className="gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Novo Carregamento
                </Button>
              </div>

              {/* KPIs de Estoque */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-1">Capacidade</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {(parceiro.capacidade_tanque || 0).toLocaleString('pt-BR')} kg
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1">Estoque Atual</p>
                  <p className="text-3xl font-bold text-green-900">
                    {(parceiro.estoque_atual || 0).toLocaleString('pt-BR')} kg
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {parceiro.capacidade_tanque
                      ? `${((parceiro.estoque_atual! / parceiro.capacidade_tanque) * 100).toFixed(1)}% da capacidade`
                      : ''}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Consumido</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {consumosRR2C.reduce((sum, c) => sum + c.quantidade_consumida, 0).toLocaleString('pt-BR')} kg
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {consumosRR2C.reduce((sum, c) => sum + c.metragem_aplicada, 0).toLocaleString('pt-BR')} m² aplicados
                  </p>
                </div>
              </div>

              {/* Barra de Progresso do Estoque */}
              {parceiro.capacidade_tanque && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Nível do Estoque</span>
                    <span className="text-sm text-gray-600">
                      {parceiro.estoque_atual} / {parceiro.capacidade_tanque} kg
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        (parceiro.estoque_atual! / parceiro.capacidade_tanque) > 0.5
                          ? 'bg-green-500'
                          : (parceiro.estoque_atual! / parceiro.capacidade_tanque) > 0.2
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((parceiro.estoque_atual! / parceiro.capacidade_tanque) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  💡 <strong>Consumo padrão:</strong> 1 kg de RR2C por 1 m² de pavimentação
                </p>
              </div>
            </div>

            {/* Últimos Carregamentos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-purple-600" />
                Últimos Carregamentos
              </h3>

              {carregamentosRR2C.length > 0 ? (
                <div className="space-y-3">
                  {carregamentosRR2C.slice(0, 5).map(carr => (
                    <div key={carr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {carr.quantidade_kg.toLocaleString('pt-BR')} kg
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(carr.data_carregamento).toLocaleDateString('pt-BR')}
                          {carr.numero_nota_fiscal && ` • NF: ${carr.numero_nota_fiscal}`}
                        </p>
                        {carr.observacoes && (
                          <p className="text-xs text-gray-500 mt-1">{carr.observacoes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(carr.valor_total)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(carr.valor_total / carr.quantidade_kg)}/kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum carregamento registrado</p>
                </div>
              )}
            </div>

            {/* Últimos Consumos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Últimos Consumos
              </h3>

              {consumosRR2C.length > 0 ? (
                <div className="space-y-3">
                  {consumosRR2C.slice(0, 5).map(cons => (
                    <div key={cons.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cons.obra_nome}</p>
                        <p className="text-sm text-gray-600">{cons.rua_nome}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cons.data_consumo).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-blue-600">
                          {cons.quantidade_consumida.toLocaleString('pt-BR')} kg
                        </p>
                        <p className="text-xs text-gray-500">
                          {cons.metragem_aplicada.toLocaleString('pt-BR')} m²
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum consumo registrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalAdicionarFaixa
        isOpen={modalFaixaOpen}
        onClose={() => setModalFaixaOpen(false)}
        onAdd={handleAdicionarFaixa}
        faixasExistentes={parceiro?.precos_faixas?.map(p => p.faixa) || []}
      />

      <ModalAdicionarMaquinario
        isOpen={modalMaquinarioOpen}
        onClose={() => setModalMaquinarioOpen(false)}
        onAdd={handleAdicionarMaquinario}
      />

      <ModalAdicionarEquipe
        isOpen={modalEquipeOpen}
        onClose={() => setModalEquipeOpen(false)}
        onAdd={handleAdicionarEquipe}
      />
    </Layout>
  )
}

export default ParceiroDetails


