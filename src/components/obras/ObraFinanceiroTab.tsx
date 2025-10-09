import React, { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../Button'
import { Select } from '../Select'
import { AdicionarDespesaModal } from './AdicionarDespesaModal'
import { useToast } from '../../lib/toast-hooks'
import type { ObraFaturamento, ObraDespesa, ObraResumoFinanceiro } from '../../types/obras-financeiro'
import { formatarStatusFaturamento, formatarCategoriaDespesa, formatarEspessura } from '../../utils/financeiro-obras-utils'
import {
  getObraFaturamentos,
  getObraDespesas,
  getObraResumoFinanceiro,
  updateFaturamentoStatus,
  createDespesaObra,
  deleteDespesaObra
} from '../../lib/obrasFinanceiroApi'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

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
    status: 'pago',
    data_finalizacao: '2025-01-15',
    data_pagamento: '2025-01-20',
    nota_fiscal: 'NF-2025001',
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
    status: 'pendente',
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
  total_faturado: 36250,
  total_pendente: 30000,
  total_despesas: 2600,
  lucro_liquido: 33650,
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

  const handleMarcarComoPago = async (faturamento: ObraFaturamento) => {
    const notaFiscal = prompt('Número da Nota Fiscal:')
    if (notaFiscal === null) return

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const faturamentosAtualizados = faturamentos.map(f =>
          f.id === faturamento.id
            ? { ...f, status: 'pago' as const, nota_fiscal: notaFiscal, data_pagamento: new Date().toISOString().split('T')[0] }
            : f
        )
        setFaturamentos(faturamentosAtualizados)
      } else {
        await updateFaturamentoStatus(faturamento.id, {
          status: 'pago',
          nota_fiscal: notaFiscal || undefined
        })
        loadData()
      }
      addToast({ message: 'Faturamento marcado como pago!', type: 'success' })
    } catch (error) {
      console.error('Erro ao atualizar faturamento:', error)
      addToast({ message: 'Erro ao atualizar faturamento', type: 'error' })
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendente</p>
              <p className="text-xl font-bold text-yellow-600">
                R$ {(resumo?.total_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Faturamentos</h3>
        
        {faturamentos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum faturamento registrado ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rua</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metragem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Espessura</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {faturamentos.map((fat) => {
                  const statusInfo = formatarStatusFaturamento(fat.status)
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
                        <span className="text-sm text-gray-900">{formatarEspessura(fat.espessura_calculada)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          R$ {fat.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {fat.status === 'pendente' && (
                          <Button
                            variant="primary"
                            onClick={() => handleMarcarComoPago(fat)}
                            className="text-xs"
                          >
                            Marcar como Pago
                          </Button>
                        )}
                        {fat.status === 'pago' && fat.nota_fiscal && (
                          <span className="text-xs text-gray-500">NF: {fat.nota_fiscal}</span>
                        )}
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

      {/* Modal */}
      <AdicionarDespesaModal
        isOpen={modalDespesaOpen}
        onClose={() => setModalDespesaOpen(false)}
        onSubmit={handleAdicionarDespesa}
      />
    </div>
  )
}

