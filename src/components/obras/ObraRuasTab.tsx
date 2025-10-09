import React, { useState, useEffect } from 'react'
import { Plus, CheckCircle, Clock, Circle, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../Button'
import { AdicionarRuaModal } from './AdicionarRuaModal'
import { FinalizarRuaModal } from './FinalizarRuaModal'
import { useToast } from '../../lib/toast-hooks'
import type { ObraRua } from '../../types/obras-financeiro'
import { formatarStatusRua, formatarMetragem } from '../../utils/financeiro-obras-utils'
import { 
  getObrasRuas, 
  createRua, 
  deleteRua, 
  reordenarRuas,
  contarRuasPorStatus 
} from '../../lib/obrasRuasApi'
import { createFaturamentoRua } from '../../lib/obrasFinanceiroApi'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

const mockRuas: ObraRua[] = [
  {
    id: '1',
    obra_id: '1',
    nome: 'Rua das Flores - Trecho A',
    metragem_planejada: 1500,
    status: 'finalizada',
    ordem: 0,
    observacoes: 'Primeira rua executada',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    nome: 'Rua das Flores - Trecho B',
    metragem_planejada: 1200,
    status: 'em_andamento',
    ordem: 1,
    observacoes: 'Em execução',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    nome: 'Rua Principal',
    metragem_planejada: 2000,
    status: 'pendente',
    ordem: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    obra_id: '1',
    nome: 'Avenida Central',
    metragem_planejada: 2500,
    status: 'pendente',
    ordem: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface ObraRuasTabProps {
  obraId: string
  precoPorM2: number
}

export function ObraRuasTab({ obraId, precoPorM2 }: ObraRuasTabProps) {
  const [ruas, setRuas] = useState<ObraRua[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAdicionarOpen, setModalAdicionarOpen] = useState(false)
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false)
  const [ruaSelecionada, setRuaSelecionada] = useState<ObraRua | null>(null)
  const [statusCounts, setStatusCounts] = useState({ pendente: 0, em_andamento: 0, finalizada: 0 })
  const { addToast } = useToast()

  useEffect(() => {
    loadRuas()
  }, [obraId])

  const loadRuas = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 500))
        setRuas(mockRuas)
        
        // Calcular contadores
        const counts = {
          pendente: mockRuas.filter(r => r.status === 'pendente').length,
          em_andamento: mockRuas.filter(r => r.status === 'em_andamento').length,
          finalizada: mockRuas.filter(r => r.status === 'finalizada').length
        }
        setStatusCounts(counts)
      } else {
        const [ruasData, counts] = await Promise.all([
          getObrasRuas(obraId),
          contarRuasPorStatus(obraId)
        ])
        setRuas(ruasData)
        setStatusCounts(counts)
      }
    } catch (error) {
      console.error('Erro ao carregar ruas:', error)
      addToast({ message: 'Erro ao carregar ruas', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionarRua = async (data: {
    nome: string
    metragem_planejada?: number
    observacoes?: string
  }) => {
    try {
      if (USE_MOCK) {
        // Simular criação mock
        await new Promise(resolve => setTimeout(resolve, 300))
        const novaRua: ObraRua = {
          id: String(Date.now()),
          obra_id: obraId,
          nome: data.nome,
          metragem_planejada: data.metragem_planejada,
          status: 'pendente',
          ordem: ruas.length,
          observacoes: data.observacoes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setRuas([...ruas, novaRua])
      } else {
        await createRua({
          obra_id: obraId,
          ...data
        })
        loadRuas()
      }
      addToast({ message: 'Rua adicionada com sucesso!', type: 'success' })
    } catch (error) {
      console.error('Erro ao adicionar rua:', error)
      throw error
    }
  }

  const handleFinalizarRua = async (data: {
    metragem_executada: number
    toneladas_utilizadas: number
    observacoes?: string
  }) => {
    if (!ruaSelecionada) return

    try {
      if (USE_MOCK) {
        // Simular finalização mock
        await new Promise(resolve => setTimeout(resolve, 300))
        const ruasAtualizadas = ruas.map(r =>
          r.id === ruaSelecionada.id ? { ...r, status: 'finalizada' as const } : r
        )
        setRuas(ruasAtualizadas)
      } else {
        await createFaturamentoRua({
          obra_id: obraId,
          rua_id: ruaSelecionada.id,
          metragem_executada: data.metragem_executada,
          toneladas_utilizadas: data.toneladas_utilizadas,
          preco_por_m2: precoPorM2,
          observacoes: data.observacoes
        })
        loadRuas()
      }
      addToast({ message: 'Rua finalizada com sucesso!', type: 'success' })
      setRuaSelecionada(null)
    } catch (error) {
      console.error('Erro ao finalizar rua:', error)
      throw error
    }
  }

  const handleDeletarRua = async (rua: ObraRua) => {
    if (!confirm(`Tem certeza que deseja deletar a rua "${rua.nome}"?`)) return

    try {
      if (USE_MOCK) {
        // Simular deleção mock
        await new Promise(resolve => setTimeout(resolve, 300))
        setRuas(ruas.filter(r => r.id !== rua.id))
      } else {
        await deleteRua(rua.id)
        loadRuas()
      }
      addToast({ message: 'Rua deletada com sucesso', type: 'success' })
    } catch (error) {
      console.error('Erro ao deletar rua:', error)
      addToast({ message: 'Erro ao deletar rua', type: 'error' })
    }
  }

  const handleMoverRua = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === ruas.length - 1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newRuas = [...ruas]
    const [movedRua] = newRuas.splice(index, 1)
    newRuas.splice(newIndex, 0, movedRua)

    // Atualizar ordens localmente primeiro para feedback visual
    setRuas(newRuas)

    if (!USE_MOCK) {
      // Atualizar no backend
      try {
        await reordenarRuas(
          newRuas.map((rua, idx) => ({ id: rua.id, ordem: idx }))
        )
      } catch (error) {
        console.error('Erro ao reordenar ruas:', error)
        addToast({ message: 'Erro ao reordenar ruas', type: 'error' })
        loadRuas() // Recarregar em caso de erro
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Circle className="h-5 w-5 text-gray-400" />
      case 'em_andamento':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'finalizada':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Circle className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pendente}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-blue-700">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-900">{statusCounts.em_andamento}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-green-700">Finalizadas</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts.finalizada}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Ruas</h3>
        <Button onClick={() => setModalAdicionarOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Rua
        </Button>
      </div>

      {/* Lista de Ruas */}
      {ruas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Circle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma rua cadastrada
          </h3>
          <p className="text-gray-500 mb-4">
            Comece adicionando as ruas que serão pavimentadas nesta obra
          </p>
          <Button onClick={() => setModalAdicionarOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Rua
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ordem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Metragem Planejada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ruas.map((rua, index) => {
                const statusInfo = formatarStatusRua(rua.status)
                return (
                  <tr key={rua.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-900">{index + 1}</span>
                        <div className="flex flex-col gap-1 ml-2">
                          <button
                            onClick={() => handleMoverRua(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMoverRua(index, 'down')}
                            disabled={index === ruas.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(rua.status)}
                        <span className="text-sm font-medium text-gray-900">{rua.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rua.metragem_planejada ? formatarMetragem(rua.metragem_planejada) : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rua.status !== 'finalizada' && (
                          <Button
                            variant="primary"
                            onClick={() => {
                              setRuaSelecionada(rua)
                              setModalFinalizarOpen(true)
                            }}
                            className="text-xs"
                          >
                            Finalizar
                          </Button>
                        )}
                        {rua.status === 'pendente' && (
                          <button
                            onClick={() => handleDeletarRua(rua)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      <AdicionarRuaModal
        isOpen={modalAdicionarOpen}
        onClose={() => setModalAdicionarOpen(false)}
        onSubmit={handleAdicionarRua}
      />

      <FinalizarRuaModal
        isOpen={modalFinalizarOpen}
        onClose={() => {
          setModalFinalizarOpen(false)
          setRuaSelecionada(null)
        }}
        onSubmit={handleFinalizarRua}
        ruaNome={ruaSelecionada?.nome || ''}
        precoPorM2={precoPorM2}
      />
    </div>
  )
}

