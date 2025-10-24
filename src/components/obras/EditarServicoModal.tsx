import React, { useState } from 'react'
import { Dialog } from '../ui/dialog'
import { Button } from '../shared/Button'
import { ServicoObra } from '../../types/servicos'
import { updateServicoObra } from '../../lib/obrasServicosApi'
import { useToast } from '../../lib/toast-hooks'
import { CurrencyInput } from '../ui/currency-input'
import { NumberInput } from '../ui/number-input-fixed'
import { X } from 'lucide-react'

interface EditarServicoModalProps {
  servico: ServicoObra
  onClose: () => void
  onSuccess: () => void
}

export function EditarServicoModal({ servico, onClose, onSuccess }: EditarServicoModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [quantidade, setQuantidade] = useState<number>(servico.quantidade)
  const [precoUnitario, setPrecoUnitario] = useState<number>(servico.preco_unitario)
  const [observacoes, setObservacoes] = useState<string>(servico.observacoes || '')

  // Calcular valor total
  const valorTotal = quantidade * precoUnitario

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      await updateServicoObra(servico.id, {
        quantidade,
        preco_unitario: precoUnitario,
        valor_total: valorTotal,
        observacoes
      })
      
      addToast({ message: 'Serviço atualizado com sucesso!', type: 'success' })
      onSuccess()
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
      addToast({ message: 'Erro ao atualizar serviço', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Editar Serviço</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              {/* Nome do Serviço (não editável) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serviço
                </label>
                <input
                  type="text"
                  className="input bg-gray-50 cursor-not-allowed"
                  value={servico.servico_nome}
                  readOnly
                  disabled
                />
              </div>
              
              {/* Unidade (não editável) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade
                </label>
                <input
                  type="text"
                  className="input bg-gray-50 cursor-not-allowed"
                  value={servico.unidade.toUpperCase()}
                  readOnly
                  disabled
                />
              </div>
              
              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade *
                </label>
                <NumberInput
                  value={quantidade}
                  onChange={setQuantidade}
                  placeholder="0,00"
                  min={0.01}
                  decimals={2}
                  required
                />
              </div>
              
              {/* Preço Unitário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Unitário *
                </label>
                <CurrencyInput
                  value={precoUnitario}
                  onChange={setPrecoUnitario}
                  placeholder="R$ 0,00"
                />
              </div>
              
              {/* Valor Total (calculado) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Total
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input bg-gray-50 cursor-not-allowed"
                    value={`R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    readOnly
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Calculado automaticamente: Quantidade × Preço Unitário
                </p>
              </div>
              
              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  className="input min-h-[80px]"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre este serviço..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
}

