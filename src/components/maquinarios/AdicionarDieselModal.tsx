import React, { useState, useEffect } from 'react'
import { X, AlertCircle, Info } from 'lucide-react'
import { Button } from '../Button'
import { Select } from '../Select'
import { DatePicker } from '../ui/date-picker'
import { calcularValorAbastecimento } from '../../utils/diesel-calculations'
import { supabase } from '../../lib/supabase'

interface AdicionarDieselModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    quantidade_litros: number
    preco_por_litro: number
    data_abastecimento: string
    posto: string
    km_hodometro?: number
    obra_id?: string
    observacoes?: string
  }) => Promise<void>
  maquinarioId: string
}

interface ObraAtiva {
  id: string
  nome: string
}

export function AdicionarDieselModal({
  isOpen,
  onClose,
  onSubmit,
  maquinarioId
}: AdicionarDieselModalProps) {
  const [quantidadeLitros, setQuantidadeLitros] = useState('')
  const [precoPorLitro, setPrecoPorLitro] = useState('')
  const [dataAbastecimento, setDataAbastecimento] = useState(new Date().toISOString().split('T')[0])
  const [posto, setPosto] = useState('')
  const [kmHodometro, setKmHodometro] = useState('')
  const [obraId, setObraId] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [obrasAtivas, setObrasAtivas] = useState<ObraAtiva[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingObras, setLoadingObras] = useState(false)

  // Cálculo automático do valor total
  const valorTotal = quantidadeLitros && precoPorLitro
    ? calcularValorAbastecimento(parseFloat(quantidadeLitros), parseFloat(precoPorLitro))
    : 0

  // Carregar obras ativas
  useEffect(() => {
    if (isOpen) {
      loadObrasAtivas()
    }
  }, [isOpen])

  const loadObrasAtivas = async () => {
    setLoadingObras(true)
    try {
      const { data, error } = await supabase
        .from('obras')
        .select('id, nome')
        .in('status', ['planejada', 'em_andamento'])
        .order('nome')

      if (error) throw error
      setObrasAtivas(data || [])
    } catch (err) {
      console.error('Erro ao carregar obras:', err)
    } finally {
      setLoadingObras(false)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const litros = parseFloat(quantidadeLitros)
    const preco = parseFloat(precoPorLitro)

    if (isNaN(litros) || litros <= 0) {
      setError('Quantidade de litros deve ser maior que zero')
      return
    }

    if (isNaN(preco) || preco <= 0) {
      setError('Preço por litro deve ser maior que zero')
      return
    }

    if (!dataAbastecimento) {
      setError('Data do abastecimento é obrigatória')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        quantidade_litros: litros,
        preco_por_litro: preco,
        data_abastecimento: dataAbastecimento,
        posto: posto.trim() || 'Não informado',
        km_hodometro: kmHodometro ? parseFloat(kmHodometro) : undefined,
        obra_id: obraId || undefined,
        observacoes: observacoes.trim() || undefined
      })

      // Limpar formulário
      setQuantidadeLitros('')
      setPrecoPorLitro('')
      setDataAbastecimento(new Date().toISOString().split('T')[0])
      setPosto('')
      setKmHodometro('')
      setObraId('')
      setObservacoes('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar abastecimento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setQuantidadeLitros('')
      setPrecoPorLitro('')
      setDataAbastecimento(new Date().toISOString().split('T')[0])
      setPosto('')
      setKmHodometro('')
      setObraId('')
      setObservacoes('')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Abastecimento</h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantidade de Litros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Litros *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantidadeLitros}
                onChange={(e) => setQuantidadeLitros(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: 100"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Preço por Litro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço por Litro (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={precoPorLitro}
                onChange={(e) => setPrecoPorLitro(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: 5.50"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Valor Total Calculado */}
          {valorTotal > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-medium">Valor Total:</span>{' '}
                <span className="text-lg font-bold">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data do Abastecimento */}
            <div>
              <DatePicker
                label="Data do Abastecimento *"
                value={dataAbastecimento}
                onChange={(value) => setDataAbastecimento(value)}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* KM/Horímetro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KM/Horímetro
                <span className="text-gray-500 text-xs ml-1">(opcional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={kmHodometro}
                onChange={(e) => setKmHodometro(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: 12500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Posto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posto/Fornecedor
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={posto}
              onChange={(e) => setPosto(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: Posto Shell"
              disabled={isSubmitting}
            />
          </div>

          {/* Obra */}
          <div>
            <Select
              label="Obra"
              value={obraId}
              onChange={setObraId}
              options={[
                { value: '', label: loadingObras ? 'Carregando...' : 'Nenhuma (uso geral)' },
                ...obrasAtivas.map(obra => ({
                  value: obra.id,
                  label: obra.nome
                }))
              ]}
              disabled={isSubmitting || loadingObras}
            />
            {obraId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Uma despesa de diesel será criada automaticamente na obra selecionada e no financeiro principal
                </p>
              </div>
            )}
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
              placeholder="Informações adicionais..."
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
              {isSubmitting ? 'Salvando...' : 'Adicionar Abastecimento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

