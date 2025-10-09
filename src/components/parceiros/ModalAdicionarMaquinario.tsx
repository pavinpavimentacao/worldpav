import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '../Button'
import { Input } from '../ui/input'
import { ParceiroMaquinario } from '../../types/parceiros'

interface ModalAdicionarMaquinarioProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (novoMaquinario: Omit<ParceiroMaquinario, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>) => void
}

export function ModalAdicionarMaquinario({ isOpen, onClose, onAdd }: ModalAdicionarMaquinarioProps) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [placa, setPlaca] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nome && tipo && valorDiaria) {
      onAdd({
        nome,
        tipo,
        placa: placa || undefined,
        valor_diaria: parseFloat(valorDiaria),
        ativo: true
      })
      // Limpar campos
      setNome('')
      setTipo('')
      setPlaca('')
      setValorDiaria('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Maquinário</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome do Maquinário"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Caminhão Basculante Mercedes 2726"
            required
          />

          <Input
            label="Tipo"
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Ex: Caminhão Basculante, Rolo Compactador, etc."
            required
          />

          <Input
            label="Placa (opcional)"
            type="text"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            placeholder="ABC-1234"
            maxLength={8}
          />

          <Input
            label="Valor da Diária (R$)"
            type="number"
            step="0.01"
            value={valorDiaria}
            onChange={(e) => setValorDiaria(e.target.value)}
            placeholder="800.00"
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


