import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '../Button'
import { Select } from '../Select'
import { DatePicker } from '../ui/date-picker'
import type { DespesaCategoria } from '../../types/obras-financeiro'

interface AdicionarDespesaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    categoria: DespesaCategoria
    descricao: string
    valor: number
    data_despesa: string
    fornecedor?: string
    sincronizado_financeiro_principal: boolean
  }) => Promise<void>
}

const categorias: Array<{ value: DespesaCategoria; label: string }> = [
  { value: 'materiais', label: 'Materiais' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' }
]

export function AdicionarDespesaModal({ isOpen, onClose, onSubmit }: AdicionarDespesaModalProps) {
  const [categoria, setCategoria] = useState<DespesaCategoria>('materiais')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [dataDespesa, setDataDespesa] = useState(new Date().toISOString().split('T')[0])
  const [fornecedor, setFornecedor] = useState('')
  const [sincronizado, setSincronizado] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!descricao.trim()) {
      setError('Descrição é obrigatória')
      return
    }

    const valorNum = parseFloat(valor)
    if (isNaN(valorNum) || valorNum <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }

    if (!dataDespesa) {
      setError('Data da despesa é obrigatória')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        categoria,
        descricao: descricao.trim(),
        valor: valorNum,
        data_despesa: dataDespesa,
        fornecedor: fornecedor.trim() || undefined,
        sincronizado_financeiro_principal: sincronizado
      })

      // Limpar formulário
      setCategoria('materiais')
      setDescricao('')
      setValor('')
      setDataDespesa(new Date().toISOString().split('T')[0])
      setFornecedor('')
      setSincronizado(true)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar despesa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCategoria('materiais')
      setDescricao('')
      setValor('')
      setDataDespesa(new Date().toISOString().split('T')[0])
      setFornecedor('')
      setSincronizado(true)
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Despesa</h3>
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Categoria */}
          <div>
            <Select
              label="Categoria *"
              value={categoria}
              onChange={(value) => setCategoria(value as DespesaCategoria)}
              options={[
                { value: '', label: 'Selecione a categoria' },
                ...categorias
              ]}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Nota: Despesas de diesel devem ser adicionadas através dos maquinários
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Compra de areia"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: 1500.00"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Data da Despesa */}
          <div>
            <DatePicker
              label="Data da Despesa *"
              value={dataDespesa}
              onChange={(value) => setDataDespesa(value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Fornecedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fornecedor
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Casa de Construção ABC"
              disabled={isSubmitting}
            />
          </div>

          {/* Sincronizar com Financeiro Principal */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="sincronizado"
                checked={sincronizado}
                onChange={(e) => setSincronizado(e.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label
                  htmlFor="sincronizado"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Sincronizar com Financeiro Principal
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Se marcado, esta despesa também aparecerá no dashboard financeiro geral do sistema
                </p>
              </div>
            </div>
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
              {isSubmitting ? 'Salvando...' : 'Adicionar Despesa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


