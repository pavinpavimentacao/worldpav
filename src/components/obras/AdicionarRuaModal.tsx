import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../Button'

interface AdicionarRuaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nome: string
    metragem_planejada?: number
    observacoes?: string
  }) => Promise<void>
}

export function AdicionarRuaModal({ isOpen, onClose, onSubmit }: AdicionarRuaModalProps) {
  const [nome, setNome] = useState('')
  const [metragemPlanejada, setMetragemPlanejada] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nome.trim()) {
      setError('Nome da rua é obrigatório')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        nome: nome.trim(),
        metragem_planejada: metragemPlanejada ? parseFloat(metragemPlanejada) : undefined,
        observacoes: observacoes.trim() || undefined
      })

      // Limpar formulário
      setNome('')
      setMetragemPlanejada('')
      setObservacoes('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar rua')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setNome('')
      setMetragemPlanejada('')
      setObservacoes('')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Rua</h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Nome da Rua */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Rua *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Rua Principal"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Metragem Planejada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metragem Planejada (m²)
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={metragemPlanejada}
              onChange={(e) => setMetragemPlanejada(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: 1000"
              disabled={isSubmitting}
            />
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
              placeholder="Informações adicionais sobre a rua..."
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
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
              {isSubmitting ? 'Salvando...' : 'Adicionar Rua'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


