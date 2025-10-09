import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '../Button'
import { Select } from '../Select'
import { Input } from '../ui/input'
import { FaixaAsfalto, faixaAsfaltoLabels, PrecoFaixa } from '../../types/parceiros'

interface ModalAdicionarFaixaProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (novaFaixa: PrecoFaixa) => void
  faixasExistentes: FaixaAsfalto[]
}

export function ModalAdicionarFaixa({ isOpen, onClose, onAdd, faixasExistentes }: ModalAdicionarFaixaProps) {
  const [faixaSelecionada, setFaixaSelecionada] = useState<FaixaAsfalto | ''>('')
  const [preco, setPreco] = useState('')

  const faixasDisponiveis = Object.entries(faixaAsfaltoLabels).filter(
    ([key]) => !faixasExistentes.includes(key as FaixaAsfalto)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (faixaSelecionada && preco) {
      onAdd({
        faixa: faixaSelecionada as FaixaAsfalto,
        preco_tonelada: parseFloat(preco)
      })
      setFaixaSelecionada('')
      setPreco('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Faixa de Asfalto</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {faixasDisponiveis.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Todas as faixas já foram adicionadas</p>
            </div>
          ) : (
            <>
              <Select
                value={faixaSelecionada}
                onChange={(value) => setFaixaSelecionada(value as FaixaAsfalto)}
                options={[
                  { value: '', label: 'Selecione a faixa' },
                  ...faixasDisponiveis.map(([key, label]) => ({
                    value: key,
                    label: label
                  }))
                ]}
                label="Faixa de Asfalto"
                placeholder="Selecione"
                required
              />

              <Input
                label="Preço por Tonelada (R$)"
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="380.00"
                required
              />
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            {faixasDisponiveis.length > 0 && (
              <Button
                type="submit"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}


