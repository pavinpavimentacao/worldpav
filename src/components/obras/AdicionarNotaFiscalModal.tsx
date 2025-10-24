import React, { useState } from 'react'
import { X, Upload, FileText, Trash2 } from 'lucide-react'
import { Button } from "../shared/Button"
import { Input } from '../ui/input'
import { CurrencyInput } from '../ui/currency-input'
import { useToast } from '../../lib/toast-hooks'
import { createNotaFiscal } from '../../lib/obrasNotasFiscaisApi'
import { uploadToSupabaseStorage } from '../../utils/file-upload-utils'
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
  
  const [formData, setFormData] = useState({
    numero_nota: '',
    valor_nota: 0,
    vencimento: '',
    desconto_inss: 0,
    desconto_iss: 0,
    outro_desconto: 0,
    observacoes: ''
  })
  
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arquivoUrl, setArquivoUrl] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Calcular valor líquido em tempo real
  const valorBruto = formData.valor_nota || 0
  const descontoInss = formData.desconto_inss || 0
  const descontoIss = formData.desconto_iss || 0
  const outroDesconto = formData.outro_desconto || 0
  const valorLiquido = calcularValorLiquido(valorBruto, descontoInss, descontoIss, outroDesconto)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      addToast({
        type: 'error',
        message: 'Apenas imagens (JPG, PNG) ou PDF são permitidos'
      });
      e.target.value = '';
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        message: 'Arquivo muito grande. Máximo 5MB'
      });
      e.target.value = '';
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
        'obras-notas-fiscais',
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

  const handleRemoverArquivo = () => {
    setArquivo(null);
    setArquivoUrl('');
    setPreviewUrl(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações básicas
    if (!obraId || obraId.trim() === '') {
      addToast({
        type: 'error',
        message: 'ID da obra é obrigatório'
      })
      return
    }
    
    if (!formData.numero_nota.trim()) {
      addToast({
        type: 'error',
        message: 'Número da nota é obrigatório'
      })
      return
    }

    if (!formData.valor_nota || formData.valor_nota <= 0) {
      addToast({
        type: 'error',
        message: 'Valor da nota deve ser maior que zero'
      })
      return
    }

    if (!formData.vencimento) {
      addToast({
        type: 'error',
        message: 'Data de vencimento é obrigatória'
      })
      return
    }

    // Validar descontos
    const validacaoDescontos = validarDescontos(valorBruto, descontoInss, descontoIss, outroDesconto)
    if (!validacaoDescontos.valido) {
      addToast({
        type: 'error',
        message: validacaoDescontos.mensagem || 'Valores de desconto inválidos'
      })
      return
    }

    try {
      setLoading(true)
      
      const input: CreateNotaFiscalInput = {
        obra_id: obraId,
        numero_nota: formData.numero_nota.trim(),
        valor_nota: formData.valor_nota,
        vencimento: formData.vencimento,
        desconto_inss: formData.desconto_inss,
        desconto_iss: formData.desconto_iss,
        outro_desconto: formData.outro_desconto,
        arquivo_nota_url: arquivoUrl || undefined,
        observacoes: formData.observacoes.trim() || undefined
      }

      console.log('🔍 Criando nota fiscal com dados:', input)
      console.log('🔍 Obra ID:', obraId)
      console.log('🔍 Arquivo URL:', arquivoUrl)
      
      const resultado = await createNotaFiscal(input)
      console.log('✅ Resultado da criação:', resultado)
      
      addToast({
        type: 'success',
        message: 'Nota fiscal cadastrada com sucesso!'
      })
      
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('❌ Erro detalhado ao criar nota fiscal:', error)
      
      let mensagemErro = 'Erro ao cadastrar nota fiscal'
      
      if (error instanceof Error) {
        mensagemErro = error.message
        console.error('❌ Mensagem de erro:', error.message)
        console.error('❌ Stack trace:', error.stack)
      }
      
      addToast({
        type: 'error',
        message: mensagemErro
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      numero_nota: '',
      valor_nota: 0,
      vencimento: '',
      desconto_inss: 0,
      desconto_iss: 0,
      outro_desconto: 0,
      observacoes: ''
    })
    setArquivo(null)
    setArquivoUrl('')
    setPreviewUrl(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nova Nota Fiscal
              </h2>
              <p className="text-sm text-gray-500">
                Cadastre uma nova nota fiscal para esta obra
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número da Nota *
              </label>
              <Input
                value={formData.numero_nota}
                onChange={(e) => handleInputChange('numero_nota', e.target.value)}
                placeholder="Ex: 12345"
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
                onChange={(e) => handleInputChange('vencimento', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Bruto (R$) *
              </label>
              <CurrencyInput
                value={formData.valor_nota}
                onChange={(value) => handleInputChange('valor_nota', value)}
                placeholder="R$ 0,00"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Líquido (R$)
              </label>
              <Input
                type="text"
                value={valorLiquido.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 2,
                  style: 'currency',
                  currency: 'BRL'
                })}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Descontos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Descontos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  INSS (R$)
                </label>
                <CurrencyInput
                  value={formData.desconto_inss}
                  onChange={(value) => handleInputChange('desconto_inss', value)}
                  placeholder="R$ 0,00"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISS (R$)
                </label>
                <CurrencyInput
                  value={formData.desconto_iss}
                  onChange={(value) => handleInputChange('desconto_iss', value)}
                  placeholder="R$ 0,00"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outros (R$)
                </label>
                <CurrencyInput
                  value={formData.outro_desconto}
                  onChange={(value) => handleInputChange('outro_desconto', value)}
                  placeholder="R$ 0,00"
                  min={0}
                />
              </div>
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Arquivo da Nota Fiscal</h3>
            
            {arquivo ? (
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
                            {arquivo.name}
                          </p>
                          <p className="text-xs text-blue-700">
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
                  ✓ Arquivo selecionado. Será enviado junto com a nota fiscal.
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                  disabled={loading || uploadingFile}
                />
                <div className="mt-3 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar ou arraste aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG ou PDF até 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Salvando...' : 'Salvar Nota'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
