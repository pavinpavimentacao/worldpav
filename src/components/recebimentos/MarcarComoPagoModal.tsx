import React, { useState } from 'react'
import { X, Calendar, CheckCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { useToast } from '../../lib/toast-hooks'
import { marcarNotaComoPaga } from '../../lib/obrasNotasFiscaisApi'
import type { ObraNotaFiscal } from '../../types/obras-financeiro'

interface MarcarComoPagoModalProps {
  isOpen: boolean
  onClose: () => void
  nota: ObraNotaFiscal | null
  onSuccess: () => void
}

export function MarcarComoPagoModal({
  isOpen,
  onClose,
  nota,
  onSuccess
}: MarcarComoPagoModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split('T')[0]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nota) return
    
    if (!dataPagamento) {
      addToast({
        type: 'error',
        message: 'Informe a data de pagamento'
      })
      return
    }
    
    try {
      setLoading(true)
      
      await marcarNotaComoPaga(nota.id, dataPagamento)
      
      addToast({
        type: 'success',
        message: 'Nota fiscal marcada como paga com sucesso'
      })
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erro ao marcar nota como paga:', error)
      addToast({
        type: 'error',
        message: 'Erro ao marcar nota como paga'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDataPagamento(new Date().toISOString().split('T')[0])
    onClose()
  }

  if (!isOpen || !nota) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Marcar como Pago
              </h2>
              <p className="text-sm text-gray-500">
                Nota {nota.numero_nota}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações da Nota */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Valor Bruto:</span>
              <span className="font-medium text-gray-900">
                R$ {nota.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Descontos:</span>
              <span className="font-medium text-red-600">
                - R$ {(nota.desconto_inss + nota.desconto_iss + nota.outro_desconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-900">Valor Líquido:</span>
              <span className="font-bold text-green-600">
                R$ {nota.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Data de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Pagamento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <Input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Alerta */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              Ao confirmar, o status da nota será alterado para <strong>PAGO</strong> e o valor será contabilizado no faturamento.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

