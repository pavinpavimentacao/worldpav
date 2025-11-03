import React, { useState, useCallback, useEffect } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { Select } from "../shared/Select"
import { useToast } from '../../lib/toast-hooks'
import { createMedicao } from '../../lib/obrasMedicoesApi'
import { getNotasFiscaisByObra } from '../../lib/obrasNotasFiscaisApi'
import { uploadToSupabaseStorage } from '../../utils/file-upload-utils'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
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
  const [notasFiscais, setNotasFiscais] = useState<ObraNotaFiscal[]>([])
  const [loadingNotas, setLoadingNotas] = useState(false)
  
  const [formData, setFormData] = useState({
    descricao: '',
    nota_fiscal_id: '',
    data_medicao: new Date().toISOString().split('T')[0]
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleFile = async (file: File) => {
    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!tiposPermitidos.includes(file.type)) {
      addToast({
        type: 'error',
        message: 'Apenas imagens (JPG, PNG), PDF ou Excel são permitidos'
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        message: 'Arquivo muito grande. Máximo 5MB'
      });
      return;
    }

    setArquivo(file);
    setUploadingFile(true);

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

    try {
      // Fazer upload real para o Supabase Storage
      const { url, error } = await uploadToSupabaseStorage(
        file,
        'obras-medicoes',
        obraId
      );

      if (error) {
        throw new Error(error);
      }

      if (url) {
        setArquivoUrl(url);
        addToast({
          type: 'success',
          message: 'Arquivo enviado com sucesso!'
        });
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      addToast({
        type: 'error',
        message: 'Erro ao enviar arquivo'
      });
      setArquivo(null);
      setPreviewUrl(null);
    } finally {
      setUploadingFile(false);
    }
  }

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

  const handleRemoverArquivo = () => {
    setArquivo(null);
    setArquivoUrl('');
    setPreviewUrl(null);
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
    setPreviewUrl(null)
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
                onChange={(value) => setFormData({ ...formData, nota_fiscal_id: value })}
                options={[
                  { value: '', label: 'Selecione uma nota fiscal' },
                  ...notasFiscais.map((nota) => ({
                    value: nota.id,
                    label: `Nota ${nota.numero_nota || 'N/A'} - R$ ${(nota.valor_nota || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }))
                ]}
                placeholder="Selecione uma nota fiscal"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Você pode vincular esta medição a uma nota fiscal específica
            </p>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo da Medição *
            </label>
            
            {arquivo ? (
              <div className="space-y-3">
                {/* Preview da imagem ou ícone de arquivo */}
                {previewUrl ? (
                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview da medição"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoverArquivo}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg"
                      title="Remover arquivo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900 text-sm">
                            {arquivo.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {(arquivo.size / 1024).toFixed(2)} KB
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
                  ✓ Arquivo selecionado. Será enviado junto com a medição.
                </p>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 transition-colors bg-gray-50 ${
                  isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
                }`}
                {...dragHandlers}
              >
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept="image/jpeg,image/jpg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                  disabled={loading || uploadingFile}
                />
                <div className="mt-3 text-center">
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-green-600' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, PDF ou Excel até 5MB
                  </p>
                </div>
              </div>
            )}
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
