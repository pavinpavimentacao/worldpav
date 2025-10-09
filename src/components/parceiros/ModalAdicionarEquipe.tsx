import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '../Button'
import { Input } from '../ui/input'
import { ParceiroEquipe } from '../../types/parceiros'

interface ModalAdicionarEquipeProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (novaEquipe: Omit<ParceiroEquipe, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>) => void
}

export function ModalAdicionarEquipe({ isOpen, onClose, onAdd }: ModalAdicionarEquipeProps) {
  const [nome, setNome] = useState('')
  const [quantidadePessoas, setQuantidadePessoas] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nome && quantidadePessoas && valorDiaria) {
      onAdd({
        nome,
        quantidade_pessoas: parseInt(quantidadePessoas),
        especialidade: especialidade || undefined,
        valor_diaria: parseFloat(valorDiaria),
        ativo: true
      })
      // Limpar campos
      setNome('')
      setQuantidadePessoas('')
      setEspecialidade('')
      setValorDiaria('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Adicionar Equipe</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome da Equipe"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Equipe Pavimentação Alpha"
            required
          />

          <Input
            label="Quantidade de Pessoas"
            type="number"
            value={quantidadePessoas}
            onChange={(e) => setQuantidadePessoas(e.target.value)}
            placeholder="8"
            required
          />

          <Input
            label="Especialidade"
            type="text"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            placeholder="Ex: Pavimentação, Sinalização, etc."
          />

          <Input
            label="Valor da Diária (R$)"
            type="number"
            step="0.01"
            value={valorDiaria}
            onChange={(e) => setValorDiaria(e.target.value)}
            placeholder="3200.00"
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


