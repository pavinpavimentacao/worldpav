import React, { useState, useEffect } from 'react'
import { Plus, Fuel, Edit, Trash2, TrendingDown } from 'lucide-react'
import { Button } from "../shared/Button"
import { AdicionarDieselModal } from './AdicionarDieselModal'
import { useToast } from '../../lib/toast-hooks'
import type { MaquinarioDiesel, DieselStats } from '../../types/maquinarios-diesel'
import { formatarLitros, formatarPrecoPorLitro } from '../../utils/diesel-calculations'
import { 
  getMaquinarioDiesel, 
  createAbastecimentoDiesel, 
  deleteAbastecimentoDiesel,
  getMaquinarioDieselStats 
} from '../../lib/maquinariosDieselApi'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = true

const mockAbastecimentos: MaquinarioDiesel[] = [
  {
    id: '1',
    maquinario_id: '1',
    maquinario: {
      id: '1',
      nome: 'Vibroacabadora CAT'
    },
    obra_id: '1',
    obra: {
      id: '1',
      nome: 'Pavimentação Rua das Flores - Osasco'
    },
    quantidade_litros: 120,
    preco_por_litro: 5.50,
    valor_total: 660.00,
    data_abastecimento: '2025-01-20',
    posto: 'Posto Shell',
    km_hodometro: 12500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    maquinario_id: '1',
    maquinario: {
      id: '1',
      nome: 'Vibroacabadora CAT'
    },
    obra_id: '1',
    obra: {
      id: '1',
      nome: 'Pavimentação Rua das Flores - Osasco'
    },
    quantidade_litros: 100,
    preco_por_litro: 5.45,
    valor_total: 545.00,
    data_abastecimento: '2025-01-15',
    posto: 'Posto Ipiranga',
    km_hodometro: 12350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    maquinario_id: '1',
    maquinario: {
      id: '1',
      nome: 'Vibroacabadora CAT'
    },
    quantidade_litros: 80,
    preco_por_litro: 5.60,
    valor_total: 448.00,
    data_abastecimento: '2025-01-10',
    posto: 'Posto BR',
    km_hodometro: 12200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockStats: DieselStats = {
  total_litros: 300,
  total_gasto: 1653.00,
  media_preco_litro: 5.51,
  consumo_medio: 2.5,
  abastecimentos_count: 3
}

interface DieselTabProps {
  maquinarioId: string
}

export function DieselTab({ maquinarioId }: DieselTabProps) {
  const [abastecimentos, setAbastecimentos] = useState<MaquinarioDiesel[]>([])
  const [stats, setStats] = useState<DieselStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    loadData()
  }, [maquinarioId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setAbastecimentos(mockAbastecimentos)
        setStats(mockStats)
      } else {
        const [abastecimentosData, statsData] = await Promise.all([
          getMaquinarioDiesel(maquinarioId),
          getMaquinarioDieselStats(maquinarioId)
        ])
        setAbastecimentos(abastecimentosData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erro ao carregar diesel:', error)
      addToast({ message: 'Erro ao carregar dados de diesel', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionar = async (data: any) => {
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        const novoAbastecimento: MaquinarioDiesel = {
          id: String(Date.now()),
          maquinario_id: maquinarioId,
          quantidade_litros: data.quantidade_litros,
          preco_por_litro: data.preco_por_litro,
          valor_total: data.quantidade_litros * data.preco_por_litro,
          data_abastecimento: data.data_abastecimento,
          posto: data.posto,
          km_hodometro: data.km_hodometro,
          obra_id: data.obra_id,
          observacoes: data.observacoes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setAbastecimentos([novoAbastecimento, ...abastecimentos])
      } else {
        await createAbastecimentoDiesel({
          maquinario_id: maquinarioId,
          ...data
        })
        loadData()
      }
      addToast({ message: 'Abastecimento adicionado com sucesso!', type: 'success' })
    } catch (error) {
      console.error('Erro ao adicionar abastecimento:', error)
      throw error
    }
  }

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este abastecimento?')) return

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setAbastecimentos(abastecimentos.filter(a => a.id !== id))
      } else {
        await deleteAbastecimentoDiesel(id)
        loadData()
      }
      addToast({ message: 'Abastecimento deletado', type: 'success' })
    } catch (error) {
      console.error('Erro ao deletar:', error)
      addToast({ message: 'Erro ao deletar abastecimento', type: 'error' })
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
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Fuel className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Litros</p>
              <p className="text-xl font-bold text-gray-900">
                {formatarLitros(stats?.total_litros || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">R$</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gasto Total</p>
              <p className="text-xl font-bold text-green-600">
                R$ {(stats?.total_gasto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Média R$/L</p>
              <p className="text-xl font-bold text-purple-600">
                {formatarPrecoPorLitro(stats?.media_preco_litro || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">#</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Abastecimentos</p>
              <p className="text-xl font-bold text-orange-600">
                {stats?.abastecimentos_count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Adicionar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Histórico de Abastecimentos</h3>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Abastecimento
        </Button>
      </div>

      {/* Tabela de Abastecimentos */}
      {abastecimentos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Fuel className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum abastecimento registrado
          </h3>
          <p className="text-gray-500 mb-4">
            Comece registrando os abastecimentos deste maquinário
          </p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Abastecimento
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Litros
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    R$/Litro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Obra
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {abastecimentos.map((abastecimento) => (
                  <tr key={abastecimento.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(abastecimento.data_abastecimento).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatarLitros(abastecimento.quantidade_litros)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatarPrecoPorLitro(abastecimento.preco_por_litro)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        R$ {abastecimento.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{abastecimento.posto}</span>
                    </td>
                    <td className="px-4 py-4">
                      {abastecimento.obra ? (
                        <span className="text-sm text-blue-600">{abastecimento.obra.nome}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeletar(abastecimento.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AdicionarDieselModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdicionar}
        maquinarioId={maquinarioId}
      />
    </div>
  )
}

