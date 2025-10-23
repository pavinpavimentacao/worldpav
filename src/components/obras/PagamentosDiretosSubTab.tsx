import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Calendar, 
  DollarSign,
  Smartphone,
  Banknote,
  CheckSquare,
  Receipt,
  FileText
} from 'lucide-react'
import { Button } from "../shared/Button"
import { useToast } from '../../lib/toast-hooks'
import { getPagamentosDiretosByObra, deletePagamentoDireto } from '../../lib/obrasPagamentosDiretosApi'
import { formatDateToBR } from '../../utils/date-utils'
import { AdicionarPagamentoDiretoModal } from './AdicionarPagamentoDiretoModal'
import type { ObraPagamentoDireto, FormaPagamento } from '../../types/obras-pagamentos'

// ⚙️ MODO MOCK - Altere para false quando o banco estiver configurado
const USE_MOCK = false

const mockPagamentosDiretos: ObraPagamentoDireto[] = [
  {
    id: '1',
    obra_id: '1',
    descricao: 'PIX - Avanço de Pagamento',
    valor: 15000.00,
    data_pagamento: '2025-01-15',
    forma_pagamento: 'pix',
    comprovante_url: 'https://exemplo.com/comprovantes/pix-avancao.pdf',
    observacoes: 'Avanço de 30% do valor total',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    obra_id: '1',
    descricao: 'Transferência - Pagamento Final',
    valor: 25000.00,
    data_pagamento: '2025-01-20',
    forma_pagamento: 'transferencia',
    comprovante_url: 'https://exemplo.com/comprovantes/transferencia-final.pdf',
    observacoes: 'Pagamento final da obra',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    obra_id: '1',
    descricao: 'PIX - Pagamento Mensal',
    valor: 12000.00,
    data_pagamento: '2025-01-25',
    forma_pagamento: 'pix',
    observacoes: 'Pagamento mensal de janeiro',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
]

interface PagamentosDiretosSubTabProps {
  obraId: string
}

export function PagamentosDiretosSubTab({ obraId }: PagamentosDiretosSubTabProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [pagamentos, setPagamentos] = useState<ObraPagamentoDireto[]>([])
  const [modalAdicionar, setModalAdicionar] = useState(false)

  useEffect(() => {
    loadPagamentos()
  }, [obraId])

  const loadPagamentos = async () => {
    try {
      setLoading(true)
      
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setPagamentos(mockPagamentosDiretos.filter(p => p.obra_id === obraId))
      } else {
        const data = await getPagamentosDiretosByObra(obraId)
        setPagamentos(data)
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao carregar pagamentos',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (pagamento: ObraPagamentoDireto) => {
    if (!confirm(`Tem certeza que deseja excluir o pagamento "${pagamento.descricao}"?`)) {
      return
    }

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setPagamentos(prev => prev.filter(p => p.id !== pagamento.id))
      } else {
        await deletePagamentoDireto(pagamento.id)
        await loadPagamentos()
      }
      
      addToast({
        type: 'success',
        title: 'Pagamento excluído',
        message: 'Pagamento direto excluído com sucesso'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir pagamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  const getFormaPagamentoInfo = (forma: FormaPagamento) => {
    const formas = {
      'pix': { label: 'PIX', icon: <Smartphone className="h-4 w-4" />, color: 'text-green-600' },
      'transferencia': { label: 'Transferência', icon: <CreditCard className="h-4 w-4" />, color: 'text-blue-600' },
      'dinheiro': { label: 'Dinheiro', icon: <Banknote className="h-4 w-4" />, color: 'text-yellow-600' },
      'cheque': { label: 'Cheque', icon: <CheckSquare className="h-4 w-4" />, color: 'text-purple-600' },
      'outro': { label: 'Outro', icon: <Receipt className="h-4 w-4" />, color: 'text-gray-600' }
    }
    return formas[forma] || formas.outro
  }

  const totalPagamentos = pagamentos.reduce((sum, p) => sum + p.valor, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header com Total */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pagamentos Diretos
            </h3>
            <p className="text-sm text-gray-500">
              PIX, transferências e outros pagamentos sem nota fiscal
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPagamentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">
              Total recebido
            </div>
          </div>
        </div>

        {/* Botão Adicionar */}
        <div className="flex justify-end">
          <Button
            onClick={() => setModalAdicionar(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Pagamento
          </Button>
        </div>

        {/* Lista de Pagamentos */}
        {pagamentos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum pagamento direto
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione pagamentos PIX, transferências ou outros sem nota fiscal
            </p>
            <Button
              onClick={() => setModalAdicionar(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Pagamento
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Forma de Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comprovante
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagamentos.map((pagamento) => {
                    const formaInfo = getFormaPagamentoInfo(pagamento.forma_pagamento)
                    
                    return (
                      <tr key={pagamento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pagamento.descricao}
                            </div>
                            {pagamento.observacoes && (
                              <div className="text-sm text-gray-500">
                                {pagamento.observacoes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={formaInfo.color}>
                              {formaInfo.icon}
                            </span>
                            <span className="text-sm text-gray-900">
                              {formaInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatDateToBR(pagamento.data_pagamento)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {pagamento.comprovante_url ? (
                            <a
                              href={pagamento.comprovante_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">Ver</span>
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(pagamento)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir pagamento"
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
          </div>
        )}
      </div>

      {/* Modal Adicionar */}
      <AdicionarPagamentoDiretoModal
        isOpen={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        obraId={obraId}
        onSuccess={loadPagamentos}
      />
    </>
  )
}





