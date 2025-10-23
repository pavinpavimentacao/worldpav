import React, { useState, useCallback, useEffect } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { Select } from "../shared/Select"
import { useToast } from '../../lib/toast-hooks'
import { createMedicao } from '../../lib/obrasMedicoesApi'
import { getNotasFiscaisByObra } from '../../lib/obrasNotasFiscaisApi'
import { uploadToSupabaseStorage, validateExcelOrPDF, formatFileSize } from '../../utils/file-upload-utils'
import type { CreateMedicaoInput, ObraNotaFiscal } from '../../types/obras-financeiro'

interface AdicionarMedicaoModalProps {
  isOpen: boolean
  onClose: () => void
  obraId: string
  onSuccess: () => void
}

export function AdicionarMedicaoModal({
  isOpen,
  onClose,
  obraId,
  onSuccess
}: AdicionarMedicaoModalProps) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [notasFiscais, setNotasFiscais] = useState<ObraNotaFiscal[]>([])
  const [loadingNotas, setLoadingNotas] = useState(false)
  
  const [formData, setFormData] = useState({
    descricao: '',
    nota_fiscal_id: '',
    data_medicao: new Date().toISOString().split('T')[0]
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')

  // Carregar notas fiscais da obra
  useEffect(() => {
    if (isOpen && obraId) {
      loadNotasFiscais()
    }
  }, [isOpen, obraId])

  const loadNotasFiscais = async () => {
    try {
      setLoadingNotas(true)
      const notas = await getNotasFiscaisByObra(obraId)
      setNotasFiscais(notas)
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error)
    } finally {
      setLoadingNotas(false)
    }
  }

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
    const validation = validateExcelOrPDF(file)
    
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
      'obras-medicoes',
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
    if (!formData.descricao.trim()) {
      addToast({
        type: 'error',
        message: 'Informe uma descrição para a medição'
      })
      return
    }
    
    if (!arquivoUrl) {
      addToast({
        type: 'error',
        message: 'É necessário fazer upload do arquivo da medição'
      })
      return
    }
    
    try {
      setLoading(true)
      
      const input: CreateMedicaoInput = {
        obra_id: obraId,
        nota_fiscal_id: formData.nota_fiscal_id || undefined,
        descricao: formData.descricao.trim(),
        arquivo_medicao_url: arquivoUrl,
        data_medicao: formData.data_medicao
      }
      
      await createMedicao(input)
      
      addToast({
        type: 'success',
        message: 'Medição cadastrada com sucesso'
      })
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erro ao criar medição:', error)
      addToast({
        type: 'error',
        message: 'Erro ao cadastrar medição'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      descricao: '',
      nota_fiscal_id: '',
      data_medicao: new Date().toISOString().split('T')[0]
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
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Nova Medição
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
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <Input
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Medição referente ao mês de Janeiro/2025"
              required
            />
          </div>

          {/* Data da Medição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data da Medição *
            </label>
            <Input
              type="date"
              value={formData.data_medicao}
              onChange={(e) => setFormData({ ...formData, data_medicao: e.target.value })}
              required
            />
          </div>

          {/* Vincular Nota Fiscal (Opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vincular a Nota Fiscal (Opcional)
            </label>
            {loadingNotas ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 p-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Carregando notas...
              </div>
            ) : notasFiscais.length === 0 ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                Nenhuma nota fiscal cadastrada para esta obra
              </div>
            ) : (
              <Select
                value={formData.nota_fiscal_id}
                onChange={(e) => setFormData({ ...formData, nota_fiscal_id: e.target.value })}
              >
                <option value="">Selecione uma nota fiscal</option>
                {notasFiscais.map((nota) => (
                  <option key={nota.id} value={nota.id}>
                    Nota {nota.numero_nota} - R$ {nota.valor_nota.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </Select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Você pode vincular esta medição a uma nota fiscal específica
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo da Medição (XLSX ou PDF) *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadingFile ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                  <p className="text-sm text-gray-600">Enviando arquivo...</p>
                </div>
              ) : arquivo ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet className="h-12 w-12 text-green-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">{arquivo.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(arquivo.size)}</p>
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
                  <p className="text-xs text-gray-500">Excel (XLSX/XLS) ou PDF até 10MB</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={handleFileInput}
                    className="hidden"
                    id="medicao-file-upload"
                  />
                  <label
                    htmlFor="medicao-file-upload"
                    className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Selecionar arquivo
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Alerta */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Após cadastrar a medição, você poderá visualizá-la e fazer download do arquivo quando necessário.
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
              disabled={loading || uploadingFile || !arquivoUrl}
            >
              {loading ? 'Salvando...' : 'Cadastrar Medição'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

