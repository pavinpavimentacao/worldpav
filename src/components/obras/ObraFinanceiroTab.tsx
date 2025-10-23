import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, TrendingDown, AlertCircle, X, Download, Calendar, Tag, Building, User, Eye } from 'lucide-react'
import { Button } from "../shared/Button"
import { Select } from "../shared/Select"
import { AdicionarDespesaModal } from './AdicionarDespesaModal'
import { useToast } from '../../lib/toast-hooks'
import type { ObraFaturamento, ObraDespesa, ObraResumoFinanceiro } from '../../types/obras-financeiro'
import { formatarCategoriaDespesa, formatarEspessura } from '../../utils/financeiro-obras-utils'
import {
  getObraFaturamentos,
  getObraDespesas,
  getObraResumoFinanceiro,
  createDespesaObra,
  deleteDespesaObra
} from '../../lib/obrasFinanceiroApi'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = false

const mockFaturamentos: ObraFaturamento[] = [
  {
    id: '1',
    obra_id: '1',
    rua_id: '1',
    rua: {
      id: '1',
      obra_id: '1',
      nome: 'Rua das Flores - Trecho A',
      metragem_planejada: 1500,
      status: 'finalizada',
      ordem: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    metragem_executada: 1450,
    toneladas_utilizadas: 145,
    espessura_calculada: 4.17,
    preco_por_m2: 25,
    valor_total: 36250,
    data_finalizacao: '2025-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    rua_id: '2',
    rua: {
      id: '2',
      obra_id: '1',
      nome: 'Rua das Flores - Trecho B',
      metragem_planejada: 1200,
      status: 'finalizada',
      ordem: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    metragem_executada: 1200,
    toneladas_utilizadas: 120,
    espessura_calculada: 4.17,
    preco_por_m2: 25,
    valor_total: 30000,
    data_finalizacao: '2025-01-25',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockDespesas: ObraDespesa[] = [
  {
    id: '1',
    obra_id: '1',
    categoria: 'diesel',
    descricao: 'Abastecimento - Posto Shell',
    valor: 550.00,
    data_despesa: '2025-01-18',
    maquinario_id: '1',
    maquinario: {
      id: '1',
      nome: 'Vibroacabadora CAT'
    },
    fornecedor: 'Posto Shell',
    comprovante_url: 'https://exemplo.com/notas/nota-diesel-shell.pdf',
    sincronizado_financeiro_principal: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    categoria: 'materiais',
    descricao: 'Compra de areia para nivelamento',
    valor: 1200.00,
    data_despesa: '2025-01-20',
    fornecedor: 'Casa de Construção ABC',
    comprovante_url: 'https://exemplo.com/notas/nota-areia.jpg',
    sincronizado_financeiro_principal: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    categoria: 'manutencao',
    descricao: 'Manutenção preventiva rolo compactador',
    valor: 850.00,
    data_despesa: '2025-01-22',
    fornecedor: 'Oficina TecMaq',
    sincronizado_financeiro_principal: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockResumo: ObraResumoFinanceiro = {
  total_faturado: 66250,
  total_pendente: 0,
  total_despesas: 2600,
  lucro_liquido: 63650,
  despesas_por_categoria: {
    diesel: 550,
    materiais: 1200,
    manutencao: 850,
    outros: 0
  }
}

interface ObraFinanceiroTabProps {
  obraId: string
}

export function ObraFinanceiroTab({ obraId }: ObraFinanceiroTabProps) {
  const [faturamentos, setFaturamentos] = useState<ObraFaturamento[]>([])
  const [despesas, setDespesas] = useState<ObraDespesa[]>([])
  const [resumo, setResumo] = useState<ObraResumoFinanceiro | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalDespesaOpen, setModalDespesaOpen] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())
  const { addToast } = useToast()
  
  // Estados para modal de detalhes da despesa
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [despesaSelecionada, setDespesaSelecionada] = useState<ObraDespesa | null>(null)

  useEffect(() => {
    loadData()
  }, [obraId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setFaturamentos(mockFaturamentos)
        setDespesas(mockDespesas)
        setResumo(mockResumo)
      } else {
        const [faturamentosData, despesasData, resumoData] = await Promise.all([
          getObraFaturamentos(obraId),
          getObraDespesas(obraId),
          getObraResumoFinanceiro(obraId)
        ])
        setFaturamentos(faturamentosData)
        setDespesas(despesasData)
        setResumo(resumoData)
      }
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error)
      addToast({ message: 'Erro ao carregar dados financeiros', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionarDespesa = async (data: any) => {
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const novaDespesa: ObraDespesa = {
          id: String(Date.now()),
          obra_id: obraId,
          categoria: data.categoria,
          descricao: data.descricao,
          valor: data.valor,
          data_despesa: data.data_despesa,
          fornecedor: data.fornecedor,
          sincronizado_financeiro_principal: data.sincronizado_financeiro_principal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setDespesas([...despesas, novaDespesa])
      } else {
        await createDespesaObra({
          obra_id: obraId,
          ...data
        })
        loadData()
      }
      addToast({ message: 'Despesa adicionada com sucesso!', type: 'success' })
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error)
      throw error
    }
  }

  const handleDeletarDespesa = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) return

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setDespesas(despesas.filter(d => d.id !== id))
      } else {
        await deleteDespesaObra(id)
        loadData()
      }
      addToast({ message: 'Despesa deletada', type: 'success' })
    } catch (error) {
      console.error('Erro ao deletar despesa:', error)
      addToast({ message: 'Erro ao deletar despesa', type: 'error' })
    }
  }

  const handleVerDetalhes = (despesa: ObraDespesa) => {
    setDespesaSelecionada(despesa)
    setShowDetalhesModal(true)
  }

  const despesasFiltradas = filtroCategoria === 'todas'
    ? despesas
    : despesas.filter(d => d.categoria === filtroCategoria)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  const lucroPositivo = (resumo?.lucro_liquido || 0) >= 0

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Faturado</p>
              <p className="text-xl font-bold text-green-600">
                R$ {(resumo?.total_faturado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-xl font-bold text-red-600">
                R$ {(resumo?.total_despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-lg border ${lucroPositivo ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${lucroPositivo ? 'bg-blue-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
              <TrendingUp className={`h-5 w-5 ${lucroPositivo ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${lucroPositivo ? 'text-blue-700' : 'text-red-700'}`}>Lucro Líquido</p>
              <p className={`text-xl font-bold ${lucroPositivo ? 'text-blue-900' : 'text-red-900'}`}>
                R$ {(resumo?.lucro_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Faturamentos */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Faturamentos por Rua</h3>
          <p className="text-sm text-gray-500">
            Total: R$ {(resumo?.total_faturado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        {faturamentos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum faturamento registrado ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rua</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Finalização</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metragem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toneladas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Espessura</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faturamentos.map((fat) => {
                  return (
                    <tr key={fat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">{fat.rua?.nome}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(fat.data_finalizacao).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {fat.metragem_executada.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {fat.toneladas_utilizadas.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ton
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatarEspessura(fat.espessura_calculada)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-green-600">
                          R$ {fat.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Despesas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Despesas</h3>
          <div className="flex items-center gap-3">
            <Select
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              options={[
                { value: 'todas', label: 'Todas as Categorias' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'materiais', label: 'Materiais' },
                { value: 'manutencao', label: 'Manutenção' },
                { value: 'outros', label: 'Outros' }
              ]}
              className="text-sm"
            />
            <Button onClick={() => setModalDespesaOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Despesa
            </Button>
          </div>
        </div>

        {despesasFiltradas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma despesa registrada ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nota</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {despesasFiltradas.map((desp) => (
                  <tr key={desp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(desp.data_despesa).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {formatarCategoriaDespesa(desp.categoria)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{desp.descricao}</span>
                      {desp.maquinario && (
                        <span className="text-xs text-gray-500 ml-2">({desp.maquinario.nome})</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600">
                        R$ {desp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {desp.comprovante_url ? (
                        <button
                          onClick={() => handleVerDetalhes(desp)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                          title="Ver detalhes e comprovante"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {desp.categoria !== 'diesel' && (
                        <button
                          onClick={() => handleDeletarDespesa(desp.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Deletar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adicionar Despesa */}
      <AdicionarDespesaModal
        isOpen={modalDespesaOpen}
        onClose={() => setModalDespesaOpen(false)}
        onSubmit={handleAdicionarDespesa}
      />

      {/* Modal de Detalhes da Despesa */}
      {showDetalhesModal && despesaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 rounded-lg p-2">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalhes da Despesa
                  </h3>
                  <p className="text-sm text-gray-600">
                    Informações completas e comprovante
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetalhesModal(false)
                  setDespesaSelecionada(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">Categoria</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatarCategoriaDespesa(despesaSelecionada.categoria)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Descrição</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {despesaSelecionada.descricao}
                    </p>
                  </div>

                  {despesaSelecionada.fornecedor && (
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">Fornecedor</span>
                      </div>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {despesaSelecionada.fornecedor}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Data da Despesa</span>
                    </div>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(despesaSelecionada.data_despesa).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Valor</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 bg-red-50 p-3 rounded-lg">
                      R$ {despesaSelecionada.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {despesaSelecionada.maquinario && (
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Maquinário</span>
                      </div>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {despesaSelecionada.maquinario.nome}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comprovante / Nota Fiscal */}
              {despesaSelecionada.comprovante_url && (
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Comprovante / Nota Fiscal</span>
                  </div>
                  
                  {/* Verificar se é imagem ou PDF */}
                  {despesaSelecionada.comprovante_url.match(/\.(jpg|jpeg|png)$/i) ? (
                    // Preview de imagem
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={despesaSelecionada.comprovante_url}
                        alt="Nota fiscal"
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                  ) : (
                    // Card para PDF
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-100 rounded-lg p-3">
                            <FileText className="h-8 w-8 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Comprovante em PDF
                            </p>
                            <p className="text-sm text-gray-500">
                              Documento armazenado
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(despesaSelecionada.comprovante_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => window.open(despesaSelecionada.comprovante_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Arquivo Original
                    </Button>
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Informações do Sistema
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Sincronizado com financeiro: {despesaSelecionada.sincronizado_financeiro_principal ? 'Sim' : 'Não'}</p>
                        <p>• Cadastrado em: {new Date(despesaSelecionada.created_at).toLocaleString('pt-BR')}</p>
                        {despesaSelecionada.updated_at !== despesaSelecionada.created_at && (
                          <p>• Última atualização: {new Date(despesaSelecionada.updated_at).toLocaleString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => handleDeletarDespesa(despesaSelecionada.id)}
                className="text-red-600 hover:text-red-700"
              >
                Excluir Despesa
              </Button>
              <div className="flex gap-3">
                {despesaSelecionada.comprovante_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(despesaSelecionada.comprovante_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setShowDetalhesModal(false)
                    setDespesaSelecionada(null)
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

