import React, { useState, useEffect, useCallback } from 'react'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { CurrencyInput } from '../ui/currency-input'
import { useToast } from '../../lib/toast-hooks'
import { updateNotaFiscal } from '../../lib/obrasNotasFiscaisApi'
import { uploadToSupabaseStorage, validatePDF } from '../../utils/file-upload-utils'
import { calcularValorLiquido, validarDescontos } from '../../utils/notas-fiscais-utils'
import type { ObraNotaFiscal, UpdateNotaFiscalInput } from '../../types/obras-financeiro'

interface EditarNotaFiscalModalProps {
  isOpen: boolean
  onClose: () => void
  nota: ObraNotaFiscal | null
  onSuccess: () => void
}

export function EditarNotaFiscalModal({
  isOpen,
  onClose,
  nota,
  onSuccess
}: EditarNotaFiscalModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const [formData, setFormData] = useState({
    numero_nota: '',
    valor_nota: '',
    vencimento: '',
    desconto_inss: '',
    desconto_iss: '',
    outro_desconto: '',
    status: 'emitida' as 'emitida' | 'enviada' | 'paga',
    observacoes: ''
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')

  // Inicializar form com dados da nota
  useEffect(() => {
    if (nota) {
      setFormData({
        numero_nota: nota.numero_nota || '',
        valor_nota: String(nota.valor_nota || 0),
        vencimento: nota.vencimento || '',
        desconto_inss: String(nota.desconto_inss || 0),
        desconto_iss: String(nota.desconto_iss || 0),
        outro_desconto: String(nota.outro_desconto || 0),
        status: nota.status || 'emitida',
        observacoes: nota.observacoes || ''
      })
      setArquivoUrl(nota.arquivo_nota_url || '')
    }
  }, [nota])

  const valorLiquido = calcularValorLiquido(
    Number(formData.valor_nota) || 0,
    Number(formData.desconto_inss) || 0,
    Number(formData.desconto_iss) || 0,
    Number(formData.outro_desconto) || 0
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [nota])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!nota) return
    
    const validation = validatePDF(file)
    
    if (!validation.valido) {
      addToast({
        type: 'error',
        message: validation.mensagem || 'Arquivo inválido'
      })
      return
    }
    
    setArquivo(file)
    
    // Fazer upload imediatamente
    setUploadingFile(true)
    const { url, error } = await uploadToSupabaseStorage(
      file,
      'obras-notas-fiscais',
      nota.obra_id
    )
    setUploadingFile(false)
    
    if (error) {
      addToast({
        type: 'error',
        message: 'Erro ao fazer upload do arquivo'
      })
      setArquivo(null)
      return
    }
    
    if (url) {
      setArquivoUrl(url)
      addToast({
        type: 'success',
        message: 'Arquivo enviado com sucesso'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nota) return
    
    // Validações
    if (!formData.numero_nota.trim()) {
      addToast({
        type: 'error',
        message: 'Informe o número da nota fiscal'
      })
      return
    }
    
    const valorNota = Number(formData.valor_nota)
    if (!valorNota || valorNota <= 0) {
      addToast({
        type: 'error',
        message: 'Informe um valor válido para a nota'
      })
      return
    }
    
    if (!formData.vencimento) {
      addToast({
        type: 'error',
        message: 'Informe a data de vencimento'
      })
      return
    }
    
    // Validar descontos
    const descontosValidacao = validarDescontos(
      valorNota,
      Number(formData.desconto_inss) || 0,
      Number(formData.desconto_iss) || 0,
      Number(formData.outro_desconto) || 0
    )
    
    if (!descontosValidacao.valido) {
      addToast({
        type: 'error',
        message: descontosValidacao.mensagem || 'Descontos inválidos'
      })
      return
    }
    
    try {
      setLoading(true)
      
      const input: UpdateNotaFiscalInput = {
        numero_nota: formData.numero_nota.trim(),
        valor_nota: valorNota,
        vencimento: formData.vencimento,
        desconto_inss: Number(formData.desconto_inss) || 0,
        desconto_iss: Number(formData.desconto_iss) || 0,
        outro_desconto: Number(formData.outro_desconto) || 0,
        status: formData.status, // ✅ Incluir o status do formulário
        arquivo_nota_url: arquivoUrl || undefined,
        observacoes: formData.observacoes.trim() || undefined
      }
      
      await updateNotaFiscal(nota.id, input)
      
      addToast({
        type: 'success',
        message: `Nota fiscal atualizada com sucesso (Status: ${formData.status.toUpperCase()})`
      })
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error)
      addToast({
        type: 'error',
        message: 'Erro ao atualizar nota fiscal'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      numero_nota: '',
      valor_nota: '',
      vencimento: '',
      desconto_inss: '',
      desconto_iss: '',
      outro_desconto: '',
      status: 'emitida',
      observacoes: ''
    })
    setArquivo(null)
    setArquivoUrl('')
    onClose()
  }

  if (!isOpen || !nota) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Nota Fiscal
              </h2>
              <p className="text-sm text-gray-500">
                Nota {nota.numero_nota}
              </p>
            </div>
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
          {/* Alerta de Renegociação */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Ao salvar, o status da nota será alterado automaticamente para <strong>RENEGOCIADO</strong>.
            </p>
          </div>

          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Nota *
              </label>
              <Input
                value={formData.numero_nota}
                onChange={(e) => setFormData({ ...formData, numero_nota: e.target.value })}
                placeholder="Ex: 12345"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Nota *
              </label>
              <CurrencyInput
                value={Number(formData.valor_nota) || 0}
                onChange={(value) => setFormData({ ...formData, valor_nota: value.toString() })}
                placeholder="R$ 0,00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Vencimento *
              </label>
              <Input
                type="date"
                value={formData.vencimento}
                onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Descontos */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Descontos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto INSS
                </label>
                <CurrencyInput
                  value={Number(formData.desconto_inss) || 0}
                  onChange={(value) => setFormData({ ...formData, desconto_inss: value.toString() })}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto ISS
                </label>
                <CurrencyInput
                  value={Number(formData.desconto_iss) || 0}
                  onChange={(value) => setFormData({ ...formData, desconto_iss: value.toString() })}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outro Desconto
                </label>
                <CurrencyInput
                  value={Number(formData.outro_desconto) || 0}
                  onChange={(value) => setFormData({ ...formData, outro_desconto: value.toString() })}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status da Nota *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'emitida' | 'enviada' | 'paga' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="emitida">Emitida</option>
              <option value="enviada">Enviada</option>
              <option value="paga">Paga</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecione o status atual da nota fiscal
            </p>
          </div>

          {/* Valor Líquido (Calculado) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Valor Líquido</span>
              <span className="text-xl font-bold text-blue-900">
                R$ {valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Valor da nota - descontos
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo da Nota Fiscal (PDF)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadingFile ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-gray-600">Enviando arquivo...</p>
                </div>
              ) : arquivo || arquivoUrl ? (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    {arquivo ? arquivo.name : 'Arquivo atual'}
                  </p>
                  {arquivoUrl && !arquivo && (
                    <a
                      href={arquivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      Visualizar arquivo atual
                    </a>
                  )}
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
                    Arraste o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">PDF até 10MB</p>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <label
                    htmlFor="file-upload-edit"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informações adicionais sobre a nota fiscal..."
            />
          </div>

          {/* Actions */}
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
              disabled={loading || uploadingFile}
            >
              {loading ? 'Salvando...' : 'Atualizar Nota'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

