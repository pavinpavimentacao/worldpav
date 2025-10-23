import React, { useState, useEffect } from 'react'
import { FileText, Eye, Edit2, Trash2, Download, Calendar, DollarSign, Info } from 'lucide-react'
import { Button } from "../shared/Button"
import { useToast } from '../../lib/toast-hooks'
import { getNotasFiscaisByObra, deleteNotaFiscal, verificarNotasVencidas } from '../../lib/obrasNotasFiscaisApi'
import { formatarStatusNota, diasParaVencimento } from '../../utils/notas-fiscais-utils'
import { formatDateToBR } from '../../utils/date-utils'
import { AdicionarNotaFiscalModal } from './AdicionarNotaFiscalModal'
import { EditarNotaFiscalModal } from './EditarNotaFiscalModal'
import { DetalhesNotaFiscalModal } from './DetalhesNotaFiscalModal'
import type { ObraNotaFiscal } from '../../types/obras-financeiro'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = false

const mockNotasFiscais: ObraNotaFiscal[] = [
  {
    id: '1',
    obra_id: '1',
    numero_nota: 'NF-2025-001',
    valor_nota: 45000.00,
    vencimento: '2025-02-15',
    desconto_inss: 1350.00,
    desconto_iss: 900.00,
    outro_desconto: 0,
    valor_liquido: 42750.00,
    status: 'pendente',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-001.pdf',
    observacoes: 'Primeira medição da obra - Ruas A e B',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    numero_nota: 'NF-2025-002',
    valor_nota: 38500.00,
    vencimento: '2025-01-28',
    desconto_inss: 1155.00,
    desconto_iss: 770.00,
    outro_desconto: 200.00,
    valor_liquido: 36375.00,
    status: 'pago',
    data_pagamento: '2025-01-25',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-002.pdf',
    observacoes: 'Pagamento antecipado - desconto negociado',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    numero_nota: 'NF-2024-098',
    valor_nota: 52000.00,
    vencimento: '2025-01-10',
    desconto_inss: 1560.00,
    desconto_iss: 1040.00,
    outro_desconto: 0,
    valor_liquido: 49400.00,
    status: 'vencido',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2024-098.pdf',
    observacoes: 'Aguardando regularização do cliente',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    obra_id: '1',
    numero_nota: 'NF-2025-003',
    valor_nota: 41000.00,
    vencimento: '2025-02-28',
    desconto_inss: 1230.00,
    desconto_iss: 820.00,
    outro_desconto: 500.00,
    valor_liquido: 38450.00,
    status: 'renegociado',
    arquivo_nota_url: 'https://exemplo.com/notas/nf-2025-003.pdf',
    observacoes: 'Valores ajustados conforme reunião do dia 20/01',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

interface NotasFiscaisSubTabProps {
  obraId: string
}

export function NotasFiscaisSubTab({ obraId }: NotasFiscaisSubTabProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [notas, setNotas] = useState<ObraNotaFiscal[]>([])
  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<ObraNotaFiscal | null>(null)

  useEffect(() => {
    loadNotas()
  }, [obraId])

  const loadNotas = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setNotas(mockNotasFiscais)
      } else {
        // Verificar notas vencidas antes de carregar
        await verificarNotasVencidas(obraId)
        
        const data = await getNotasFiscaisByObra(obraId)
        setNotas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error)
      addToast({
        type: 'error',
        message: 'Erro ao carregar notas fiscais'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (nota: ObraNotaFiscal) => {
    if (!confirm(`Tem certeza que deseja excluir a nota fiscal ${nota.numero_nota}?`)) {
      return
    }

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setNotas(notas.filter(n => n.id !== nota.id))
        addToast({
          type: 'success',
          message: 'Nota fiscal excluída com sucesso'
        })
      } else {
        await deleteNotaFiscal(nota.id)
        addToast({
          type: 'success',
          message: 'Nota fiscal excluída com sucesso'
        })
        loadNotas()
      }
    } catch (error: any) {
      console.error('Erro ao excluir nota fiscal:', error)
      addToast({
        type: 'error',
        message: error.message || 'Erro ao excluir nota fiscal'
      })
    }
  }

  const handleEdit = (nota: ObraNotaFiscal) => {
    setNotaSelecionada(nota)
    setModalEditar(true)
  }

  const handleVerDetalhes = (nota: ObraNotaFiscal) => {
    setNotaSelecionada(nota)
    setModalDetalhes(true)
  }

  const totalDescontos = (nota: ObraNotaFiscal) => {
    return nota.desconto_inss + nota.desconto_iss + nota.outro_desconto
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notas Fiscais</h3>
            <p className="text-sm text-gray-500">
              {notas.length} {notas.length === 1 ? 'nota cadastrada' : 'notas cadastradas'}
            </p>
          </div>
          <Button onClick={() => setModalAdicionar(true)}>
            Nova Nota Fiscal
          </Button>
        </div>

        {/* Lista de Notas */}
        {notas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Nenhuma nota fiscal cadastrada
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Comece adicionando a primeira nota fiscal desta obra
            </p>
            <Button onClick={() => setModalAdicionar(true)} variant="outline">
              Adicionar Nota Fiscal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nº Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Bruto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descontos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Líquido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notas.map((nota) => {
                  const statusInfo = formatarStatusNota(nota.status)
                  const diasVencimento = diasParaVencimento(nota.vencimento)
                  
                  return (
                    <tr key={nota.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {nota.numero_nota}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          R$ {nota.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-red-600">
                          - R$ {totalDescontos(nota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          R$ {nota.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900">
                            {formatDateToBR(nota.vencimento)}
                          </span>
                          {nota.status === 'pendente' && diasVencimento >= 0 && diasVencimento <= 7 && (
                            <span className="text-xs text-orange-600">
                              Vence em {diasVencimento} {diasVencimento === 1 ? 'dia' : 'dias'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.cor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerDetalhes(nota)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          {nota.arquivo_nota_url && (
                            <a
                              href={nota.arquivo_nota_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                              title="Visualizar PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(nota)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar nota"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(nota)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir nota"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modais */}
      <AdicionarNotaFiscalModal
        isOpen={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        obraId={obraId}
        onSuccess={loadNotas}
      />

      <EditarNotaFiscalModal
        isOpen={modalEditar}
        onClose={() => {
          setModalEditar(false)
          setNotaSelecionada(null)
        }}
        nota={notaSelecionada}
        onSuccess={loadNotas}
      />

      <DetalhesNotaFiscalModal
        isOpen={modalDetalhes}
        onClose={() => {
          setModalDetalhes(false)
          setNotaSelecionada(null)
        }}
        nota={notaSelecionada}
      />
    </>
  )
}

