import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/shared/Button'
import { FileUpload, useFileUpload } from '../../components/shared/FileUpload'
import { useToast } from '../../lib/toast-hooks'
import { DocumentacaoAPI, type DocumentacaoFormData } from '../../lib/documentacao-api'
import { getObras, type Obra } from '../../lib/obrasApi'
import { getClienteById, type Cliente } from '../../lib/clientesApi'

export default function NewDocumentacao() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const { uploadedFile, handleFileUploaded, clearFile } = useFileUpload()
  
  const clientId = searchParams.get('client_id')
  
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState<Cliente | null>(null)
  const [obras, setObras] = useState<Obra[]>([])
  
  const [formData, setFormData] = useState<DocumentacaoFormData>({
    client_id: clientId || '',
    obra_id: '',
    name: '',
    type: 'nrs',
    category: '',
    valid_from: '',
    valid_until: '',
    file_path: '',
    file_name: '',
    status: 'ativo',
    observations: ''
  })

  useEffect(() => {
    if (clientId) {
      loadClientData()
    }
  }, [clientId])

  async function loadClientData() {
    if (!clientId) return
    
    try {
      const [clientData, obrasResponse] = await Promise.all([
        getClienteById(clientId),
        getObras(clientId, { client_id: clientId })
      ])
      
      setClient(clientData)
      // getObras retorna { data: Obra[] }, então precisamos acessar a propriedade data
      setObras(obrasResponse?.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error)
      addToast({ message: 'Erro ao carregar dados do cliente', type: 'error' })
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      addToast({ message: 'Nome da documentação é obrigatório', type: 'error' })
      return
    }
    
    setLoading(true)
    
    try {
      // Incluir dados do arquivo se foi feito upload
      const documentData = {
        ...formData,
        file_path: uploadedFile?.path || formData.file_path,
        file_name: uploadedFile?.name || formData.file_name
      }
      
      await DocumentacaoAPI.create(documentData)
      addToast({ message: 'Documentação criada com sucesso!', type: 'success' })
      navigate(`/clients/${clientId}`)
    } catch (error: any) {
      console.error('Erro ao criar documentação:', error)
      addToast({ message: error?.message || 'Erro ao criar documentação', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (!client) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-center">
            <div className="text-gray-500">Carregando dados do cliente...</div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Nova Documentação
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Cliente: {client.representante || client.name || 'Cliente'}
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
            <Button variant="outline" onClick={() => navigate(`/clients/${clientId}`)}>
              ← Voltar
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Documentação */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Documentação *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: NRS 12 - Segurança no Trabalho em Máquinas e Equipamentos"
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="nrs">NRS</option>
                  <option value="licenca">Licença</option>
                  <option value="certificado">Certificado</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Segurança do Trabalho"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="vencido">Vencido</option>
                  <option value="proximo_vencimento">Próximo do Vencimento</option>
                </select>
              </div>

              {/* Obra */}
              <div>
                <label htmlFor="obra_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Obra (Opcional)
                </label>
                <select
                  id="obra_id"
                  name="obra_id"
                  value={formData.obra_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Selecione uma obra</option>
                  {obras.map((obra) => (
                    <option key={obra.id} value={obra.id}>
                      {obra.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Válido de */}
              <div>
                <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 mb-2">
                  Válido de
                </label>
                <input
                  type="date"
                  id="valid_from"
                  name="valid_from"
                  value={formData.valid_from || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Válido até */}
              <div>
                <label htmlFor="valid_until" className="block text-sm font-medium text-gray-700 mb-2">
                  Válido até
                </label>
                <input
                  type="date"
                  id="valid_until"
                  name="valid_until"
                  value={formData.valid_until || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Upload de Arquivo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo da Documentação
                </label>
                <FileUpload
                  onFileUploaded={handleFileUploaded}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  maxSize={10}
                  folder="documentacao"
                  disabled={loading}
                />
                {uploadedFile && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-green-800">{uploadedFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                id="observations"
                name="observations"
                value={formData.observations || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Observações adicionais sobre a documentação..."
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/clients/${clientId}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Documentação'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
