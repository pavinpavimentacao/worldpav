import React, { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { calcularEspessura, formatarEspessura, formatarMetragem, formatarToneladas } from '../../utils/financeiro-obras-utils'

interface FinalizarRuaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    metragem_executada: number
    toneladas_utilizadas: number
    observacoes?: string
  }) => Promise<void>
  ruaNome: string
  precoPorM2: number
}

export function FinalizarRuaModal({
  isOpen,
  onClose,
  onSubmit,
  ruaNome,
  precoPorM2
}: FinalizarRuaModalProps) {
  const [metragemExecutada, setMetragemExecutada] = useState('')
  const [toneladasUtilizadas, setToneladasUtilizadas] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Cálculos automáticos
  const espessuraCalculada = metragemExecutada && toneladasUtilizadas
    ? calcularEspessura(parseFloat(toneladasUtilizadas), parseFloat(metragemExecutada))
    : 0

  const valorTotal = metragemExecutada
    ? parseFloat(metragemExecutada) * precoPorM2
    : 0

  useEffect(() => {
    if (!isOpen) {
      // Limpar campos quando modal fecha
      setMetragemExecutada('')
      setToneladasUtilizadas('')
      setObservacoes('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const metragem = parseFloat(metragemExecutada)
    const toneladas = parseFloat(toneladasUtilizadas)

    if (isNaN(metragem) || metragem <= 0) {
      setError('Metragem executada deve ser maior que zero')
      return
    }

    if (isNaN(toneladas) || toneladas <= 0) {
      setError('Toneladas utilizadas devem ser maior que zero')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        metragem_executada: metragem,
        toneladas_utilizadas: toneladas,
        observacoes: observacoes.trim() || undefined
      })

      // Limpar formulário
      setMetragemExecutada('')
      setToneladasUtilizadas('')
      setObservacoes('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar rua')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Finalizar Rua</h3>
            <p className="text-sm text-gray-500 mt-1">{ruaNome}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Metragem Executada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metragem Executada (m²) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={metragemExecutada}
                onChange={(e) => setMetragemExecutada(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: 1000"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Toneladas Utilizadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toneladas Utilizadas *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={toneladasUtilizadas}
                onChange={(e) => setToneladasUtilizadas(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: 100"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Cálculos Automáticos */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Cálculos Automáticos</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Espessura */}
              <div>
                <p className="text-xs text-blue-700 mb-1">Espessura Calculada</p>
                <p className="text-lg font-bold text-blue-900">
                  {espessuraCalculada > 0 ? formatarEspessura(espessuraCalculada) : '-'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Fórmula: Ton / m² / 2.4
                </p>
              </div>

              {/* Preço por m² */}
              <div>
                <p className="text-xs text-blue-700 mb-1">Preço por m²</p>
                <p className="text-lg font-bold text-blue-900">
                  R$ {precoPorM2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Valor Total */}
              <div>
                <p className="text-xs text-blue-700 mb-1">Valor Total</p>
                <p className="text-lg font-bold text-green-700">
                  {valorTotal > 0
                    ? `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Informações adicionais sobre a execução..."
              disabled={isSubmitting}
            />
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Atenção</p>
              <p>Ao finalizar a rua, um faturamento será gerado com status "Pendente". A rua será marcada como finalizada e não poderá ser editada.</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Rua'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


