import React, { useState, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from "../shared/Button"

interface AdicionarRuaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nome: string
    metragem_planejada?: number
    toneladas_previstas?: number
    observacoes?: string
    imagem_trecho?: File
  }) => Promise<void>
}

export function AdicionarRuaModal({ isOpen, onClose, onSubmit }: AdicionarRuaModalProps) {
  const [nome, setNome] = useState('')
  const [metragemPlanejada, setMetragemPlanejada] = useState('')
  const [toneladasPrevistas, setToneladasPrevistas] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [imagemTrecho, setImagemTrecho] = useState<File | null>(null)
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem')
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB')
        return
      }

      setImagemTrecho(file)
      setError('')
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagemPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagemTrecho(null)
    setImagemPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
        toneladas_previstas: toneladasPrevistas ? parseFloat(toneladasPrevistas) : undefined,
        observacoes: observacoes.trim() || undefined,
        imagem_trecho: imagemTrecho || undefined
      })

      // Limpar formulário
      setNome('')
      setMetragemPlanejada('')
      setToneladasPrevistas('')
      setObservacoes('')
      setImagemTrecho(null)
      setImagemPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
      setToneladasPrevistas('')
      setObservacoes('')
      setImagemTrecho(null)
      setImagemPreview(null)
      setError('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

          {/* Toneladas Previstas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toneladas Previstas (t)
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={toneladasPrevistas}
              onChange={(e) => setToneladasPrevistas(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ex: 50.5"
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

          {/* Upload de Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto do Trecho
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            
            {!imagemPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Clique para selecionar uma imagem
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, GIF até 5MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagemPreview}
                    alt="Preview do trecho"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {imagemTrecho?.name} ({(imagemTrecho?.size! / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
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


