import React, { useState, useEffect } from 'react'
import { 
  Edit, 
  Trash2, 
  Plus, 
  DollarSign,
  Search,
  AlertCircle
} from 'lucide-react'
import { Button } from '../shared/Button'
import { ServicoObra } from '../../types/servicos'
import { getServicosObra, deleteServicoObra, updateServicoObra } from '../../lib/obrasServicosApi'
import { getRuasByObra } from '../../lib/obrasRuasApi'
import { ObraRua } from '../../types/rua'
import { useToast } from '../../lib/toast-hooks'
import { EditarServicoModal } from './EditarServicoModal'
import { AdicionarServicoModal } from './AdicionarServicoModal'

interface ObraServicosTabProps {
  obraId: string
}

export function ObraServicosTab({ obraId }: ObraServicosTabProps) {
  const { addToast } = useToast()
  const [servicos, setServicos] = useState<ServicoObra[]>([])
  const [ruas, setRuas] = useState<ObraRua[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [servicoParaEditar, setServicoParaEditar] = useState<ServicoObra | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar serviços e ruas da obra
  useEffect(() => {
    carregarDados()
  }, [obraId])

  async function carregarDados() {
    try {
      setLoading(true)
      // Buscar serviços e ruas em paralelo
      const [servicosData, ruasData] = await Promise.all([
        getServicosObra(obraId),
        getRuasByObra(obraId)
      ])
      
      setServicos(servicosData)
      setRuas(ruasData)
      
      // Recalcular quantidades dos serviços baseado nas ruas finalizadas
      await atualizarQuantidadesServicos(servicosData, ruasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      addToast({ message: 'Erro ao carregar dados', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // Calcular quantidade total de ruas finalizadas
  async function atualizarQuantidadesServicos(servicos: ServicoObra[], ruas: ObraRua[]) {
    // Somar metragem de todas as ruas finalizadas (status = 'concluida')
    const metragemTotal = ruas
      .filter(rua => rua.status === 'concluida' && rua.metragem_executada)
      .reduce((total, rua) => total + (rua.metragem_executada || 0), 0)

    console.log('📏 Metragem total das ruas finalizadas:', metragemTotal)

    // Atualizar cada serviço com a quantidade real
    for (const servico of servicos) {
      const novoValorTotal = metragemTotal * servico.preco_unitario
      
      // Se a quantidade ou valor mudou, atualizar no banco
      if (servico.quantidade !== metragemTotal || servico.valor_total !== novoValorTotal) {
        try {
          await updateServicoObra(servico.id, {
            quantidade: metragemTotal,
            valor_total: novoValorTotal
          })
          console.log(`✅ Serviço ${servico.servico_nome} atualizado: ${metragemTotal} m² = R$ ${novoValorTotal}`)
        } catch (error) {
          console.error(`Erro ao atualizar serviço ${servico.servico_nome}:`, error)
        }
      }
    }
    
    // Recarregar serviços para mostrar valores atualizados
    const servicosAtualizados = await getServicosObra(obraId)
    setServicos(servicosAtualizados)
  }

  // Abrir modal para editar serviço
  const handleEditarServico = (servico: ServicoObra) => {
    setServicoParaEditar(servico)
    setModalEditarAberto(true)
  }

  // Confirmar exclusão de serviço
  const handleConfirmarExclusao = async (id: string) => {
    try {
      await deleteServicoObra(id)
      setServicos(servicos.filter(s => s.id !== id))
      addToast({ message: 'Serviço excluído com sucesso', type: 'success' })
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      addToast({ message: 'Erro ao excluir serviço', type: 'error' })
    } finally {
      setConfirmandoExclusao(null)
    }
  }

  // Filtrar serviços pelo termo de busca
  const servicosFiltrados = servicos.filter(servico => 
    servico.servico_nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular valor total dos serviços
  const valorTotal = servicos.reduce((total, servico) => total + servico.valor_total, 0)

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Serviços da Obra</h2>
          <p className="text-sm text-gray-500">
            Gerencie todos os serviços associados a esta obra
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setModalAdicionarAberto(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Total de Serviços</p>
            <p className="text-lg font-bold text-gray-900">{servicos.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(valorTotal)}</p>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando serviços...</p>
        </div>
      ) : servicosFiltrados.length > 0 ? (
        <div className="bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Unitário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servicosFiltrados.map((servico) => (
                <tr key={servico.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{servico.servico_nome}</div>
                    <div className="text-xs text-gray-500">Unidade: {servico.unidade.toUpperCase()}</div>
                    {servico.observacoes && (
                      <div className="text-xs text-gray-500 mt-1 italic">{servico.observacoes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{servico.quantidade}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(servico.preco_unitario)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{formatCurrency(servico.valor_total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {confirmandoExclusao === servico.id ? (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleConfirmarExclusao(servico.id)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmandoExclusao(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarServico(servico)}
                          title="Editar Serviço"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmandoExclusao(servico.id)}
                          title="Excluir Serviço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Nenhum serviço corresponde à sua busca.' : 'Ainda não há serviços cadastrados para esta obra.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setModalAdicionarAberto(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Serviço
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modais */}
      {modalAdicionarAberto && (
        <AdicionarServicoModal
          obraId={obraId}
          onClose={() => setModalAdicionarAberto(false)}
          onSuccess={() => {
            carregarDados()
            setModalAdicionarAberto(false)
          }}
        />
      )}

      {modalEditarAberto && servicoParaEditar && (
        <EditarServicoModal
          servico={servicoParaEditar}
          onClose={() => {
            setModalEditarAberto(false)
            setServicoParaEditar(null)
          }}
          onSuccess={() => {
            carregarDados()
            setModalEditarAberto(false)
            setServicoParaEditar(null)
          }}
        />
      )}
    </div>
  )
}

