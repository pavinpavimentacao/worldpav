import React, { useState, useCallback, useRef } from 'react'
import { X, AlertCircle, Upload, FileText, Trash2, Eye } from 'lucide-react'
import { Button } from "../shared/Button"
import { Select } from "../shared/Select"
import { DatePicker } from '../ui/date-picker'
import { CurrencyInput } from '../ui/currency-input'
import type { DespesaCategoria } from '../../types/obras-financeiro'
import { toast } from '../../lib/toast-hooks'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { supabase } from '../../lib/supabase'

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
    comprovante_url?: string
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
  const [valor, setValor] = useState(0)
  const [dataDespesa, setDataDespesa] = useState(new Date().toISOString().split('T')[0])
  const [fornecedor, setFornecedor] = useState('')
  const [sincronizado, setSincronizado] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Estados para upload de nota fiscal
  const [arquivoNota, setArquivoNota] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & Drop handler - DEVE estar ANTES do return early
  const handleDropFiles = useCallback((files: FileList | File[]) => {
    const file = files[0] as File
    if (!file) return

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Apenas imagens (JPG, PNG) ou PDF são permitidos')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB')
      return
    }

    setArquivoNota(file)

    // Criar preview se for imagem
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }, [])

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleDropFiles,
    disabled: isSubmitting,
    multiple: false
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!descricao.trim()) {
      setError('Descrição é obrigatória')
      return
    }

    if (valor <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }

    if (!dataDespesa) {
      setError('Data da despesa é obrigatória')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload real da nota fiscal para o Supabase Storage
      let urlNota: string | undefined = undefined;
      
      if (arquivoNota) {
        console.log('📤 Iniciando upload do comprovante para Supabase Storage...')
        
        const fileExt = arquivoNota.name.split('.').pop()
        const fileName = `despesa-${categoria}-${Date.now()}.${fileExt}`
        const filePath = `obras-despesas/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('obras-comprovantes')
          .upload(filePath, arquivoNota)

        if (uploadError) {
          console.error('Erro no upload:', uploadError)
          throw new Error(`Erro ao enviar comprovante: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('obras-comprovantes')
          .getPublicUrl(filePath)

        urlNota = publicUrl
        console.log('✅ Comprovante enviado:', urlNota)
        toast.success('Comprovante enviado com sucesso!')
      }

      await onSubmit({
        categoria,
        descricao: descricao.trim(),
        valor: valor,
        data_despesa: dataDespesa,
        fornecedor: fornecedor.trim() || undefined,
        sincronizado_financeiro_principal: sincronizado,
        comprovante_url: urlNota
      })

      // Limpar formulário
      setCategoria('materiais')
      setDescricao('')
      setValor(0)
      setDataDespesa(new Date().toISOString().split('T')[0])
      setFornecedor('')
      setSincronizado(true)
      setArquivoNota(null)
      setPreviewUrl(null)
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
      setValor(0)
      setDataDespesa(new Date().toISOString().split('T')[0])
      setFornecedor('')
      setSincronizado(true)
      setArquivoNota(null)
      setPreviewUrl(null)
      setError('')
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Apenas imagens (JPG, PNG) ou PDF são permitidos');
      e.target.value = '';
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB');
      e.target.value = '';
      return;
    }

    setArquivoNota(file);

    // Criar preview se for imagem
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }

  const handleRemoverArquivo = () => {
    setArquivoNota(null);
    setPreviewUrl(null);
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
            <CurrencyInput
              value={valor}
              onChange={setValor}
              placeholder="R$ 0,00"
              disabled={isSubmitting}
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

          {/* Upload de Nota Fiscal / Comprovante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Fiscal / Comprovante
              <span className="text-gray-500 text-xs ml-1">(opcional)</span>
            </label>
            
            {arquivoNota ? (
              <div className="space-y-3">
                {/* Preview da imagem ou ícone de PDF */}
                {previewUrl ? (
                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview da nota fiscal"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoverArquivo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                      title="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900 text-sm">
                            {arquivoNota.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            {(arquivoNota.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoverArquivo}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-600">
                  ✓ Arquivo selecionado. Será enviado junto com a despesa.
                </p>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isSubmitting) fileInputRef.current?.click()
                }}
                {...dragHandlers}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className="text-center pointer-events-none">
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600">
                    {isDragging ? 'Solte o arquivo aqui' : 'Clique para selecionar ou arraste aqui'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou PDF até 5MB
                  </p>
                </div>
              </div>
            )}
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


