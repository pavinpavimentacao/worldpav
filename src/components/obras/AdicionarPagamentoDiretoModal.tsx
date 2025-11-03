import React, { useState, useCallback } from 'react'
import { X, Upload, FileText, AlertCircle, CreditCard, Smartphone, Banknote, CheckSquare, Receipt } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { CurrencyInput } from '../ui/currency-input'
import { useToast } from '../../lib/toast-hooks'
import { createPagamentoDireto } from '../../lib/obrasPagamentosDiretosApi'
import { uploadToSupabaseStorage, validatePDF } from '../../utils/file-upload-utils'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import type { CreatePagamentoDiretoInput, FormaPagamento } from '../../types/obras-pagamentos'

interface AdicionarPagamentoDiretoModalProps {
  isOpen: boolean
  onClose: () => void
  obraId: string
  onSuccess: () => void
}

const formasPagamento: { value: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { value: 'pix', label: 'PIX', icon: <Smartphone className="h-5 w-5" /> },
  { value: 'transferencia', label: 'Transferência', icon: <CreditCard className="h-5 w-5" /> },
  { value: 'dinheiro', label: 'Dinheiro', icon: <Banknote className="h-5 w-5" /> },
  { value: 'cheque', label: 'Cheque', icon: <CheckSquare className="h-5 w-5" /> },
  { value: 'outro', label: 'Outro', icon: <Receipt className="h-5 w-5" /> }
]

export function AdicionarPagamentoDiretoModal({
  isOpen,
  onClose,
  obraId,
  onSuccess
}: AdicionarPagamentoDiretoModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    data_pagamento: new Date().toISOString().split('T')[0], // Data atual
    forma_pagamento: 'pix' as FormaPagamento,
    observacoes: ''
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')

  const handleDropFiles = useCallback((files: FileList | File[]) => {
    const file = files[0] as File
    if (file) {
      handleFile(file)
    }
  }, [])

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleDropFiles,
    disabled: loading || uploadingFile,
    multiple: false
  })

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    const validation = validatePDF(file)
    
    if (!validation.valido) {
      addToast({
        type: 'error',
        title: 'Arquivo inválido',
        message: validation.mensagem || 'Por favor, selecione um arquivo PDF válido (máximo 10MB)'
      })
      return
    }

    setUploadingFile(true)
    try {
      const { url, error } = await uploadToSupabaseStorage(
        file, 
        'obras-comprovantes',
        obraId
      )
      
      if (error) {
        throw new Error(error)
      }
      
      if (url) {
        setArquivo(file)
        setArquivoUrl(url)
        addToast({
          type: 'success',
          title: 'Arquivo enviado',
          message: 'Comprovante enviado com sucesso'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no upload',
        message: error instanceof Error ? error.message : 'Erro ao enviar comprovante'
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.descricao.trim()) {
      addToast({
        type: 'error',
        title: 'Campo obrigatório',
        message: 'Descrição é obrigatória'
      })
      return
    }

    if (!formData.valor || formData.valor <= 0) {
      addToast({
        type: 'error',
        title: 'Valor inválido',
        message: 'Valor deve ser maior que zero'
      })
      return
    }

    setLoading(true)
    try {
      const input: CreatePagamentoDiretoInput = {
        obra_id: obraId,
        descricao: formData.descricao.trim(),
        valor: Number(formData.valor),
        data_pagamento: formData.data_pagamento,
        forma_pagamento: formData.forma_pagamento,
        comprovante_url: arquivoUrl || undefined,
        observacoes: formData.observacoes.trim() || undefined
      }

      await createPagamentoDireto(input)
      
      addToast({
        type: 'success',
        title: 'Pagamento registrado',
        message: 'Pagamento direto registrado com sucesso'
      })
      
      handleClose()
      onSuccess()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao registrar pagamento',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      descricao: '',
      valor: 0,
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'pix',
      observacoes: ''
    })
    setArquivo(null)
    setArquivoUrl('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Novo Pagamento Direto
            </h2>
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
          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Pagamento *
              </label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: PIX - Janeiro 2025, Transferência - Avanço"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <CurrencyInput
                value={formData.valor}
                onChange={(value) => setFormData({ ...formData, valor: value })}
                placeholder="R$ 0,00"
                min={0}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data do Pagamento *
              </label>
              <Input
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formasPagamento.map((forma) => (
                <button
                  key={forma.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, forma_pagamento: forma.value })}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    formData.forma_pagamento === forma.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {forma.icon}
                  <span className="text-sm font-medium">{forma.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload de Comprovante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprovante de Pagamento (PDF)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
              {...dragHandlers}
            >
              {uploadingFile ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                  <p className="text-sm text-gray-600">Enviando arquivo...</p>
                </div>
              ) : arquivo ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">{arquivo.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setArquivo(null)
                      setArquivoUrl('')
                    }}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Arraste o comprovante aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">PDF até 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Selecionar arquivo
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre o pagamento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
            />
          </div>

          {/* Botões */}
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
              {loading ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}





