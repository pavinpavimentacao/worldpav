import React, { useState, useCallback } from 'react'
import { X, Upload, FileText, AlertCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { useToast } from '../../lib/toast-hooks'
import { createNotaFiscal } from '../../lib/obrasNotasFiscaisApi'
import { uploadToSupabaseStorage, validatePDF } from '../../utils/file-upload-utils'
import { calcularValorLiquido, validarDescontos } from '../../utils/notas-fiscais-utils'
import type { CreateNotaFiscalInput } from '../../types/obras-financeiro'

interface AdicionarNotaFiscalModalProps {
  isOpen: boolean
  onClose: () => void
  obraId: string
  onSuccess: () => void
}

export function AdicionarNotaFiscalModal({
  isOpen,
  onClose,
  obraId,
  onSuccess
}: AdicionarNotaFiscalModalProps) {
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
    status: 'pendente' as 'pendente' | 'pago' | 'vencido' | 'renegociado',
    observacoes: ''
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')

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
  }, [])

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
      obraId
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
      
      const input: CreateNotaFiscalInput = {
        obra_id: obraId,
        numero_nota: formData.numero_nota.trim(),
        valor_nota: valorNota,
        vencimento: formData.vencimento,
        desconto_inss: Number(formData.desconto_inss) || 0,
        desconto_iss: Number(formData.desconto_iss) || 0,
        outro_desconto: Number(formData.outro_desconto) || 0,
        arquivo_nota_url: arquivoUrl || undefined,
        observacoes: formData.observacoes.trim() || undefined
      }
      
      await createNotaFiscal(input)
      
      addToast({
        type: 'success',
        message: 'Nota fiscal cadastrada com sucesso'
      })
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error)
      addToast({
        type: 'error',
        message: 'Erro ao cadastrar nota fiscal'
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
      status: 'pendente',
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Nova Nota Fiscal
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
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_nota}
                onChange={(e) => setFormData({ ...formData, valor_nota: e.target.value })}
                placeholder="R$ 0,00"
                required
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
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.desconto_inss}
                  onChange={(e) => setFormData({ ...formData, desconto_inss: e.target.value })}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto ISS
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.desconto_iss}
                  onChange={(e) => setFormData({ ...formData, desconto_iss: e.target.value })}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outro Desconto
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.outro_desconto}
                  onChange={(e) => setFormData({ ...formData, outro_desconto: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pendente' | 'pago' | 'vencido' | 'renegociado' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
              <option value="renegociado">Renegociado</option>
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
                    Arraste o arquivo aqui ou clique para selecionar
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Informações adicionais sobre a nota fiscal..."
            />
          </div>

          {/* Alerta */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Após criar a nota fiscal, ela aparecerá automaticamente na página de Recebimentos.
            </p>
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
              {loading ? 'Salvando...' : 'Cadastrar Nota Fiscal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

