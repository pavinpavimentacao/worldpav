import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  FileText, 
  Save, 
  X, 
  Upload,
  Calendar,
  DollarSign,
  User,
  Tag,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { CurrencyInput } from '../../components/ui/currency-input'
import { supabase } from '../../lib/supabase'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import { 
  getContaPagarById, 
  createContaPagar, 
  updateContaPagar,
  updateAnexoUrl 
} from '../../lib/contas-pagar-api'
import { formatCurrency } from '../../utils/format'
import { toast } from '../../lib/toast'
import type { ContaPagar, ContaPagarFormData, StatusContaPagar } from '../../types/contas-pagar'
import { CATEGORIAS_CONTA_PAGAR, FORMAS_PAGAMENTO, validarDatas } from '../../types/contas-pagar'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'

export default function ContaPagarForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(isEditing)
  const [uploading, setUploading] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [anexoExistenteUrl, setAnexoExistenteUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ContaPagarFormData>({
    numero_nota: '',
    valor: 0,
    data_emissao: '',
    data_vencimento: '',
    status: 'Pendente',
    fornecedor: '',
    descricao: '',
    categoria: '',
    data_pagamento: '',
    valor_pago: 0,
    forma_pagamento: '',
    observacoes: '',
    anexo: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar company_id e user_id ao montar
  useEffect(() => {
    loadCompanyIdAndUserId()
  }, [])

  // Carregar conta se estiver editando
  useEffect(() => {
    if (isEditing && id && companyId) {
      carregarConta(id)
    }
  }, [id, isEditing, companyId])

  const loadCompanyIdAndUserId = async () => {
    try {
      console.log('🏢 [ContaPagarForm] Carregando company ID e user ID...')
      
      // Carregar company_id
      const id = await getOrCreateDefaultCompany()
      setCompanyId(id)
      console.log('✅ [ContaPagarForm] Company ID carregado:', id)
      
      // Carregar user_id
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.warn('⚠️  [ContaPagarForm] Usuário não autenticado')
      } else {
        setUserId(user.id)
        console.log('✅ [ContaPagarForm] User ID carregado:', user.id)
      }
    } catch (error) {
      console.error('❌ [ContaPagarForm] Erro ao carregar IDs:', error)
      toast.error('Erro ao carregar dados do sistema')
    }
  }

  const carregarConta = async (contaId: string) => {
    try {
      setLoadingData(true)
      console.log('🔍 [ContaPagarForm] Carregando conta:', contaId)

      const conta = await getContaPagarById(contaId)

      if (!conta) {
        toast.error('Conta não encontrada')
        navigate('/contas-pagar')
        return
      }

      // Preencher formulário com dados da conta
      setFormData({
        numero_nota: conta.numero_nota || '',
        valor: Number(conta.valor) || 0,
        data_emissao: conta.data_emissao || '',
        data_vencimento: conta.data_vencimento || '',
        status: conta.status,
        fornecedor: conta.fornecedor || '',
        descricao: conta.descricao || '',
        categoria: conta.categoria || '',
        data_pagamento: conta.data_pagamento || '',
        valor_pago: conta.valor_pago ? Number(conta.valor_pago) : 0,
        forma_pagamento: conta.forma_pagamento || '',
        observacoes: conta.observacoes || '',
        anexo: null,
      })

      // Configurar anexo existente
      if (conta.anexo_url) {
        setAnexoExistenteUrl(conta.anexo_url)
      }

      console.log('✅ [ContaPagarForm] Conta carregada:', conta.numero_nota)
    } catch (error: any) {
      console.error('❌ [ContaPagarForm] Erro ao carregar conta:', error)
      toast.error(error.message || 'Erro ao carregar dados da conta')
      navigate('/contas-pagar')
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro do campo ao editar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleValorChange = (value: number) => {
    setFormData(prev => ({ ...prev, valor: value }))
    if (errors.valor) {
      setErrors(prev => ({ ...prev, valor: '' }))
    }
  }

  // Função para criar despesa no financeiro quando a conta for paga
  const criarDespesaFinanceira = async (conta: ContaPagar) => {
    try {
      // Mapear categoria da conta a pagar para categoria de despesa
      const mapearCategoria = (cat: string | null): 'Mão de obra' | 'Diesel' | 'Manutenção' | 'Imposto' | 'Outros' => {
        if (!cat) return 'Outros'
        const catLower = cat.toLowerCase()
        if (catLower.includes('salário') || catLower.includes('mão')) return 'Mão de obra'
        if (catLower.includes('combustível') || catLower.includes('diesel')) return 'Diesel'
        if (catLower.includes('manutenção')) return 'Manutenção'
        if (catLower.includes('imposto')) return 'Imposto'
        return 'Outros'
      }

      const despesaData = {
        descricao: `Conta a Pagar: ${conta.numero_nota} - ${conta.fornecedor || 'Sem fornecedor'}`,
        categoria: mapearCategoria(conta.categoria),
        valor: -(conta.valor_pago || conta.valor), // Negativo para despesa
        tipo_custo: 'fixo' as const,
        data_despesa: conta.data_pagamento || new Date().toISOString().split('T')[0], // Será necessário ter um pump padrão ou pegar do usuário
        company_id: '', // Será necessário ter uma company padrão ou pegar do usuário
        status: 'pago' as const,
        payment_method: conta.forma_pagamento?.toLowerCase().includes('pix') ? 'pix' as const : 'cartao' as const,
        observacoes: `Gerado automaticamente de Contas a Pagar. ${conta.descricao || ''}`,
        nota_fiscal_id: null
      }

      // Tentar obter pump_id e company_id padrão do usuário
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        // Por enquanto, só registrar. Você pode implementar lógica para pegar pump/company padrão
        console.log('✅ Despesa deveria ser criada:', despesaData)
        // await createExpense(despesaData) // Descomentar quando tiver pump_id e company_id
      }
    } catch (error) {
      console.error('Erro ao criar despesa financeira:', error)
      // Não vamos bloquear a criação da conta se falhar a despesa
      toast.error('Conta criada, mas não foi possível registrar a despesa no financeiro')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB')
        return
      }

      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, JPG ou PNG são permitidos')
        return
      }

      setArquivoSelecionado(file)
      setFormData(prev => ({ ...prev, anexo: file }))
    }
  }

  const handleRemoverAnexo = () => {
    setArquivoSelecionado(null)
    setFormData(prev => ({ ...prev, anexo: null }))
  }

  // Drag & Drop handler
  const handleDropFiles = useCallback((files: FileList | File[]) => {
    const file = files[0] as File
    if (file) {
      // Validar tamanho (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 10MB')
        return
      }

      // Validar tipo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, JPG ou PNG são permitidos')
        return
      }

      setArquivoSelecionado(file)
      setFormData(prev => ({ ...prev, anexo: file }))
    }
  }, [])

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleDropFiles,
    disabled: loading || uploading,
    multiple: false
  })

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero_nota.trim()) {
      newErrors.numero_nota = 'Número da nota é obrigatório'
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero'
    }

    if (!formData.data_emissao) {
      newErrors.data_emissao = 'Data de emissão é obrigatória'
    }

    if (!formData.data_vencimento) {
      newErrors.data_vencimento = 'Data de vencimento é obrigatória'
    }

    if (formData.data_emissao && formData.data_vencimento) {
      if (!validarDatas(formData.data_emissao, formData.data_vencimento)) {
        newErrors.data_vencimento = 'Data de vencimento deve ser posterior à data de emissão'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadAnexo = async (file: File): Promise<string> => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado')
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${formData.numero_nota.replace(/\s+/g, '_')}-${Date.now()}.${fileExt}`
      const filePath = `contas-pagar/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('obras-comprovantes')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('obras-comprovantes')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error: any) {
      console.error('Erro no upload:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    if (!companyId) {
      toast.error('Erro: Empresa não carregada. Por favor, recarregue a página.')
      return
    }

    try {
      setLoading(true)
      console.log('💾 [ContaPagarForm] Salvando conta...')
      
      let anexoUrl = anexoExistenteUrl

      // Upload do anexo se houver arquivo novo
      if (formData.anexo && formData.anexo instanceof File) {
        setUploading(true)
        console.log('📤 [ContaPagarForm] Fazendo upload do anexo...')
        anexoUrl = await uploadAnexo(formData.anexo)
        setUploading(false)
        console.log('✅ [ContaPagarForm] Anexo enviado:', anexoUrl)
      }

      // Preparar dados do formulário
      const formDataToSave: ContaPagarFormData = {
        numero_nota: formData.numero_nota.trim(),
        valor: formData.valor,
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        status: formData.status,
        fornecedor: formData.fornecedor?.trim() || undefined,
        descricao: formData.descricao?.trim() || undefined,
        categoria: formData.categoria || undefined,
        data_pagamento: formData.status === 'Paga' 
          ? (formData.data_pagamento || new Date().toISOString().split('T')[0]) 
          : undefined,
        valor_pago: formData.status === 'Paga' 
          ? (formData.valor_pago || formData.valor) 
          : undefined,
        forma_pagamento: formData.status === 'Paga' 
          ? (formData.forma_pagamento || undefined) 
          : undefined,
        observacoes: formData.observacoes?.trim() || undefined,
        anexo: null, // Não enviar arquivo aqui, será tratado separadamente
      }

      let contaSalva: ContaPagar

      if (isEditing && id) {
        // Atualizar conta existente
        console.log('✏️  [ContaPagarForm] Atualizando conta:', id)
        contaSalva = await updateContaPagar(id, formDataToSave, userId)
        
        // Atualizar anexo se houver URL
        if (anexoUrl && anexoUrl !== anexoExistenteUrl) {
          await updateAnexoUrl(id, anexoUrl, formData.anexo?.name)
        }
        
        toast.success('Conta atualizada com sucesso!')
      } else {
        // Criar nova conta
        console.log('➕ [ContaPagarForm] Criando nova conta...')
        contaSalva = await createContaPagar(formDataToSave, companyId, userId)
        
        // Atualizar anexo se houver URL
        if (anexoUrl) {
          await updateAnexoUrl(contaSalva.id, anexoUrl, formData.anexo?.name)
        }

        // Se o status for "Paga", criar uma despesa no financeiro
        if (formData.status === 'Paga') {
          await criarDespesaFinanceira(contaSalva)
        }

        toast.success('Conta criada com sucesso!')
      }

      console.log('✅ [ContaPagarForm] Conta salva com sucesso:', contaSalva.numero_nota)
      navigate('/contas-pagar')
    } catch (error: any) {
      console.error('❌ [ContaPagarForm] Erro ao salvar conta:', error)
      toast.error(error.message || 'Erro ao salvar conta')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary-600" />
            {isEditing ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Atualize as informações da conta a pagar'
              : 'Adicione uma nova conta a pagar com nota fiscal'
            }
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Informações da Nota Fiscal */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary-600" />
              Informações da Nota Fiscal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número da Nota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Nota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero_nota"
                  value={formData.numero_nota}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.numero_nota ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: NF-001234"
                />
                {errors.numero_nota && (
                  <p className="mt-1 text-sm text-red-600">{errors.numero_nota}</p>
                )}
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor <span className="text-red-500">*</span>
                </label>
                <CurrencyInput
                  value={formData.valor}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  className={errors.valor ? 'border-red-300' : ''}
                />
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
                )}
              </div>

              {/* Data de Emissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Emissão <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="data_emissao"
                    value={formData.data_emissao}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.data_emissao ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.data_emissao && (
                  <p className="mt-1 text-sm text-red-600">{errors.data_emissao}</p>
                )}
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="data_vencimento"
                    value={formData.data_vencimento}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.data_vencimento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.data_vencimento && (
                  <p className="mt-1 text-sm text-red-600">{errors.data_vencimento}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Paga">Paga</option>
                  <option value="Atrasada">Atrasada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento (apenas se status for "Paga") */}
          {formData.status === 'Paga' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Informações de Pagamento
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="data_pagamento"
                      value={formData.data_pagamento}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Valor Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Pago
                  </label>
                  <CurrencyInput
                    value={formData.valor_pago || formData.valor}
                    onChange={(val) => setFormData(prev => ({ ...prev, valor_pago: val }))}
                    placeholder="R$ 0,00"
                  />
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    name="forma_pagamento"
                    value={formData.forma_pagamento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {FORMAS_PAGAMENTO.map((forma) => (
                      <option key={forma} value={forma}>
                        {forma}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary-600" />
              Informações Adicionais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fornecedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fornecedor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nome do fornecedor"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {CATEGORIAS_CONTA_PAGAR.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Descrição do produto ou serviço"
                />
              </div>

              {/* Observações */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
          </div>

          {/* Upload de Anexo */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-600" />
              Anexo da Nota Fiscal
            </h2>

            {/* Anexo Existente */}
            {anexoExistenteUrl && !arquivoSelecionado && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-900">Anexo já carregado</span>
                  </div>
                  <a
                    href={anexoExistenteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Ver anexo
                  </a>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (!loading && !uploading) fileInputRef.current?.click()
              }}
              {...dragHandlers}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={loading || uploading}
              />
              {arquivoSelecionado ? (
                <div className="space-y-3 pointer-events-none">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileCheck className="h-6 w-6" />
                    <span className="text-sm font-medium">{arquivoSelecionado.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoverAnexo()
                    }}
                    className="text-sm text-red-600 hover:text-red-700 underline pointer-events-auto"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <Upload className={`h-10 w-10 mx-auto ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-primary-600 hover:text-primary-700 font-medium">
                      Clique para fazer upload
                    </p>
                    <p className="text-gray-500">ou arraste o arquivo</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG ou PNG até 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alertas */}
          {uploading && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-900">Fazendo upload do anexo...</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/contas-pagar')}
              disabled={loading || uploading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  {isEditing ? 'Atualizar Conta' : 'Criar Conta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

