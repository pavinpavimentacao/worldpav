import React, { useState, useEffect } from 'react'
import { Plus, CheckCircle, Clock, Circle, Trash2, Eye } from 'lucide-react'
import { Button } from "../shared/Button"
import { AdicionarRuaModal } from './AdicionarRuaModal'
import { FinalizarRuaModal } from './FinalizarRuaModal'
import { ObraRuaDetailsModal } from './ObraRuaDetailsModal'
import { useToast } from '../../lib/toast-hooks'
import { 
  getRuasByObra,
  createRua,
  deleteRua,
  ObraRua,
  ObraRuaInsertData
} from '../../lib/obrasRuasApi'
import { updateObraStatus } from '../../lib/obrasApi'


interface ObraRuasTabProps {
  obraId: string
  precoPorM2: number
  obraStatus?: string
  onObraStatusChange?: () => void
}

export function ObraRuasTab({ obraId, precoPorM2, obraStatus, onObraStatusChange }: ObraRuasTabProps) {
  const [ruas, setRuas] = useState<ObraRua[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAdicionarOpen, setModalAdicionarOpen] = useState(false)
  const [modalFinalizarOpen, setModalFinalizarOpen] = useState(false)
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false)
  const [ruaSelecionada, setRuaSelecionada] = useState<ObraRua | null>(null)
  const [ruaParaDetalhes, setRuaParaDetalhes] = useState<ObraRua | null>(null)
  const [statusCounts, setStatusCounts] = useState({ pendente: 0, em_andamento: 0, finalizada: 0 })
  const { addToast } = useToast()

  useEffect(() => {
    loadRuas()
  }, [obraId])

  const loadRuas = async () => {
    try {
      setLoading(true)
      
      const ruasData = await getRuasByObra(obraId)
      setRuas(ruasData)
      
      // Calcular contadores
      const counts = {
        pendente: ruasData.filter(r => r.status === 'planejada').length,
        em_andamento: ruasData.filter(r => r.status === 'em_execucao').length,
        finalizada: ruasData.filter(r => r.status === 'concluida').length
      }
      setStatusCounts(counts)
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
    toneladas_previstas?: number
    observacoes?: string
    imagem_trecho?: File
  }) => {
    try {
      // Calcular área baseado na metragem planejada
      const area = data.metragem_planejada || null

      const ruaData: ObraRuaInsertData = {
        obra_id: obraId,
        name: data.nome,
        area: area,
        metragem_planejada: data.metragem_planejada || null,
        toneladas_utilizadas: data.toneladas_previstas || null,
        observations: data.observacoes || null,
        status: 'planejada'
      }

      await createRua(ruaData)
      
      // Se a obra está em planejamento, mudar para andamento
      if (obraStatus === 'planejamento') {
        await updateObraStatus(obraId, 'andamento')
        console.log('✅ Status da obra atualizado de "Planejamento" para "Em andamento"')
        onObraStatusChange?.()
      }
      
      await loadRuas()
      
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
      // Calcular espessura baseada na metragem e toneladas
      const espessuraCalculada = data.toneladas_utilizadas / data.metragem_executada / 2.4 // Densidade do asfalto
      
      // Calcular valor total baseado na metragem executada e preço por m²
      const valorTotal = data.metragem_executada * precoPorM2

      // Atualizar rua com todos os dados de execução
      const { updateRua } = await import('../../lib/obrasRuasApi')
      await updateRua(ruaSelecionada.id, {
        metragem_executada: data.metragem_executada,
        toneladas_utilizadas: data.toneladas_utilizadas,
        espessura_calculada: espessuraCalculada,
        preco_por_m2: precoPorM2,
        valor_total: valorTotal,
        data_finalizacao: new Date().toISOString(),
        status: 'concluida',
        observations: data.observacoes || ruaSelecionada.observations
      })
      
      await loadRuas()
      
      addToast({ message: 'Rua finalizada com sucesso!', type: 'success' })
      setRuaSelecionada(null)
    } catch (error) {
      console.error('Erro ao finalizar rua:', error)
      throw error
    }
  }


  const handleDeletarRua = async (rua: ObraRua) => {
    // Confirmação diferente para ruas finalizadas
    const isRuaFinalizada = rua.status === 'concluida'
    const message = isRuaFinalizada 
      ? `⚠️ ATENÇÃO: Esta rua está FINALIZADA!\n\nTem certeza que deseja deletar a rua "${rua.name}"?\n\nEsta ação irá remover todos os dados de execução da rua.`
      : `Tem certeza que deseja deletar a rua "${rua.name}"?`
    
    if (!confirm(message)) return

    try {
      await deleteRua(rua.id)
      await loadRuas()
      addToast({ 
        message: isRuaFinalizada 
          ? 'Rua finalizada deletada com sucesso!' 
          : 'Rua deletada com sucesso', 
        type: 'success' 
      })
    } catch (error) {
      console.error('Erro ao deletar rua:', error)
      addToast({ message: 'Erro ao deletar rua', type: 'error' })
    }
  }

  const handleVerDetalhes = (rua: ObraRua) => {
    setRuaParaDetalhes(rua)
    setModalDetalhesOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejada':
        return <Circle className="h-5 w-5 text-gray-400" />
      case 'em_execucao':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'concluida':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejada':
        return { label: 'Planejada', className: 'bg-gray-100 text-gray-800' }
      case 'em_execucao':
        return { label: 'Em Execução', className: 'bg-blue-100 text-blue-800' }
      case 'concluida':
        return { label: 'Concluída', className: 'bg-green-100 text-green-800' }
      default:
        return { label: 'Planejada', className: 'bg-gray-100 text-gray-800' }
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
                  Metragem Executada
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
                const statusInfo = getStatusBadge(rua.status)
                return (
                  <tr key={rua.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{index + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(rua.status)}
                        <span className="text-sm font-medium text-gray-900">{rua.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rua.metragem_planejada ? `${rua.metragem_planejada.toLocaleString('pt-BR')} m²` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {rua.metragem_executada ? `${rua.metragem_executada.toLocaleString('pt-BR')} m²` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerDetalhes(rua)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Ver detalhes da rua"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {rua.status !== 'concluida' && (
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
                        {(rua.status === 'planejada' || rua.status === 'concluida') && (
                          <button
                            onClick={() => handleDeletarRua(rua)}
                            className={`p-1 ${
                              rua.status === 'concluida' 
                                ? 'text-red-700 hover:text-red-900' 
                                : 'text-red-600 hover:text-red-800'
                            }`}
                            title={rua.status === 'concluida' ? 'Deletar rua finalizada' : 'Deletar rua'}
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
        ruaNome={ruaSelecionada?.name || ''}
        precoPorM2={precoPorM2}
      />

      <ObraRuaDetailsModal
        isOpen={modalDetalhesOpen}
        onClose={() => {
          setModalDetalhesOpen(false)
          setRuaParaDetalhes(null)
        }}
        rua={ruaParaDetalhes}
      />
    </div>
  )
}

