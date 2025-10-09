import React, { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { DatePicker } from '../../components/ui/date-picker'
import { Input } from '../../components/ui/input'
import { CurrencyInput } from '../../components/ui/currency-input'
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { ServicoSelector } from '../../components/ServicoSelector'
import { ServicoObra } from '../../types/servicos'

// Schema de validação
const schema = z.object({
  nome: z.string().min(1, 'O nome da obra é obrigatório'),
  descricao: z.string().optional(),
  cliente_id: z.string().min(1, 'Selecione um cliente'),
  regiao: z.string().min(1, 'A região é obrigatória'),
  cidade: z.string().min(1, 'A cidade é obrigatória'),
  estado: z.string().min(1, 'O estado é obrigatório'),
  cep_base: z.string().optional(),
  empresa_responsavel: z.string().min(1, 'Selecione a empresa responsável'),
  unidade_cobranca: z.enum(['m2', 'm3', 'diaria', 'servico'], {
    required_error: 'Selecione a unidade de cobrança'
  }),
  volume_total_previsto: z.number().min(0.1, 'O volume deve ser maior que 0'),
  data_inicio_prevista: z.string().min(1, 'A data de início é obrigatória'),
  data_conclusao_prevista: z.string().min(1, 'A data de conclusão é obrigatória'),
  total_ruas: z.number().min(1, 'O número de ruas deve ser maior que 0'),
  observacoes: z.string().optional(),
  
  // CNPJ separado
  tem_cnpj_separado: z.boolean().default(false),
  cnpj_obra: z.string().optional(),
  razao_social_obra: z.string().optional(),
  
  // Serviços
  servicos: z.array(z.object({
    id: z.string(),
    servico_id: z.string(),
    servico_nome: z.string(),
    quantidade: z.number(),
    preco_unitario: z.number(),
    valor_total: z.number(),
    unidade: z.string(),
    observacoes: z.string().optional(),
    obra_id: z.string().optional(),
    created_at: z.string().optional()
  })).default([])
}).refine((data) => {
  // Se tem CNPJ separado, os campos são obrigatórios
  if (data.tem_cnpj_separado) {
    return data.cnpj_obra && data.cnpj_obra.length > 0 && 
           data.razao_social_obra && data.razao_social_obra.length > 0
  }
  return true
}, {
  message: "CNPJ e Razão Social são obrigatórios quando 'CNPJ separado' está marcado",
  path: ["cnpj_obra"]
})

type FormValues = z.infer<typeof schema>

// Tipo para serviços no formulário
type ServicoFormulario = Omit<ServicoObra, 'obra_id' | 'created_at'> & {
  obra_id?: string
  created_at?: string
}

// Mock data para clientes
const mockClientes = [
  { id: '1', nome: 'Prefeitura de Osasco', tipo: 'prefeitura' },
  { id: '2', nome: 'Construtora ABC Ltda', tipo: 'construtora' },
  { id: '3', nome: 'Empresa XYZ', tipo: 'empresa_privada' }
]

// Opções de empresa responsável
const empresasResponsaveis = [
  { value: 'WorldPav', label: 'WorldPav' },
  { value: 'Pavin', label: 'Pavin' }
]

// Opções de unidade de cobrança
const unidadesCobranca = [
  { value: 'm2', label: 'Metro Quadrado (m²)' },
  { value: 'm3', label: 'Metro Cúbico (m³)' },
  { value: 'diaria', label: 'Por Diária (R$)' },
  { value: 'servico', label: 'Por Serviço (R$)' }
]

// Estados do Brasil - Atualmente apenas São Paulo
// TODO: Quando expandir para outros estados, adicionar aqui e no banco de dados
const estadosBrasil = [
  { value: 'SP', label: 'São Paulo' }
  // Futuro: Adicionar outros estados conforme expansão da empresa
  // { value: 'RJ', label: 'Rio de Janeiro' },
  // { value: 'MG', label: 'Minas Gerais' },
  // { value: 'PR', label: 'Paraná' },
  // { value: 'RS', label: 'Rio Grande do Sul' }
]

export default function NovaObra() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientIdFromUrl = searchParams.get('clientId')

  // Cache key para salvar dados do formulário
  const CACHE_KEY = 'nova-obra-form-data'

  // Função para carregar dados do cache
  const loadFromCache = (): Partial<FormValues> => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  }

  // Função para salvar dados no cache
  const saveToCache = (data: Partial<FormValues>) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch {
      // Ignorar erros de localStorage
    }
  }

  // Função para limpar cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // Ignorar erros de localStorage
    }
  }

  const cachedData = loadFromCache()

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nome: cachedData.nome || '',
      descricao: cachedData.descricao || '',
      cliente_id: cachedData.cliente_id || clientIdFromUrl || '',
      regiao: cachedData.regiao || '',
      cidade: cachedData.cidade || '',
      estado: cachedData.estado || 'SP',
      cep_base: cachedData.cep_base || '',
      empresa_responsavel: cachedData.empresa_responsavel || '',
      unidade_cobranca: cachedData.unidade_cobranca || 'm2' as const,
      volume_total_previsto: cachedData.volume_total_previsto || 0,
      data_inicio_prevista: cachedData.data_inicio_prevista || '',
      data_conclusao_prevista: cachedData.data_conclusao_prevista || '',
      total_ruas: cachedData.total_ruas || 0,
      observacoes: cachedData.observacoes || '',
      tem_cnpj_separado: cachedData.tem_cnpj_separado || false,
      cnpj_obra: cachedData.cnpj_obra || '',
      razao_social_obra: cachedData.razao_social_obra || '',
      servicos: cachedData.servicos || []
    }
  })

  const temCnpjSeparado = watch('tem_cnpj_separado')
  const volumePrevisto = watch('volume_total_previsto')
  const unidadeCobranca = watch('unidade_cobranca')
  const servicosObra = watch('servicos')

  // Função para obter o label da unidade
  const getUnidadeLabel = (unidade: string) => {
    switch (unidade) {
      case 'm2': return 'm²'
      case 'm3': return 'm³'
      case 'diaria': return 'dia(s)'
      case 'servico': return 'serviço(s)'
      default: return 'unidade(s)'
    }
  }

  // Função estável para atualizar serviços
  const onServicosChange = useCallback((servicos: ServicoFormulario[]) => {
    setValue('servicos', servicos as any, { shouldDirty: true })
  }, [setValue])

  // Salvar dados no cache automaticamente
  useEffect(() => {
    const subscription = watch((data) => {
      saveToCache(data as Partial<FormValues>)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const onSubmit = async (values: FormValues) => {
    try {
      console.log('Nova Obra:', values)
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Obra criada com sucesso!')
      
      // Limpar cache após sucesso
      clearCache()
      
      // Redirecionar para a lista de obras
      navigate('/obras')
    } catch (err: any) {
      console.error('Erro ao criar obra:', err)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }


  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Nova Obra
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Cadastre uma nova obra de pavimentação.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onKeyDown={(e) => {
          // Prevenir submit do formulário quando Enter é pressionado em campos que não são o botão de submit
          if (e.key === 'Enter' && e.target !== e.currentTarget.querySelector('button[type="submit"]')) {
            e.preventDefault()
          }
        }}>
          {/* Seção: Informações Básicas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Obra */}
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Obra *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Pavimentação Região Centro - Osasco"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.nome && (
                      <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Cliente */}
              <Controller
                name="cliente_id"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Cliente *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione um cliente"
                      options={[
                        { value: '', label: 'Selecione um cliente' },
                        ...mockClientes.map(cliente => ({
                          value: cliente.id,
                          label: `${cliente.nome} (${cliente.tipo})`
                        }))
                      ]}
                      error={errors.cliente_id?.message}
                    />
                  </div>
                )}
              />

              {/* Empresa Responsável */}
              <Controller
                name="empresa_responsavel"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Empresa Responsável *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione a empresa"
                      options={[
                        { value: '', label: 'Selecione a empresa' },
                        ...empresasResponsaveis
                      ]}
                      error={errors.empresa_responsavel?.message}
                    />
                  </div>
                )}
              />

              {/* Região */}
              <Controller
                name="regiao"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Centro - Osasco"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.regiao && (
                      <p className="mt-1 text-sm text-red-600">{errors.regiao.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Cidade */}
              <Controller
                name="cidade"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Ex: Osasco"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.cidade && (
                      <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Estado */}
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="input bg-gray-50 text-gray-700 cursor-not-allowed"
                        value="São Paulo"
                        readOnly
                        disabled
                      />
                      <input
                        type="hidden"
                        value="SP"
                        onChange={field.onChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Atualmente atendemos apenas São Paulo
                    </p>
                  </div>
                )}
              />

            </div>
          </div>

          {/* Seção: Unidade de Cobrança */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Unidade de Cobrança
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unidade de Cobrança */}
              <Controller
                name="unidade_cobranca"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Unidade de Cobrança *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione a unidade"
                      options={[
                        { value: '', label: 'Selecione a unidade' },
                        ...unidadesCobranca
                      ]}
                      error={errors.unidade_cobranca?.message}
                    />
                  </div>
                )}
              />

              {/* Volume Total Previsto */}
              <Controller
                name="volume_total_previsto"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume Total Previsto ({getUnidadeLabel(unidadeCobranca)}) *
                    </label>
                    <input
                      type="number"
                      step={unidadeCobranca === 'diaria' || unidadeCobranca === 'servico' ? '1' : '0.1'}
                      min="0"
                      className="input"
                      placeholder={unidadeCobranca === 'diaria' || unidadeCobranca === 'servico' ? 'Ex: 10' : 'Ex: 500.5'}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                    />
                    {errors.volume_total_previsto && (
                      <p className="mt-1 text-sm text-red-600">{errors.volume_total_previsto.message}</p>
                    )}
                  </div>
                )}
              />

            </div>

            {/* Informações sobre a unidade selecionada */}
            {unidadeCobranca && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Cobrança por {getUnidadeLabel(unidadeCobranca)}</p>
                    <p className="mt-1">
                      {unidadeCobranca === 'm2' && 'Metro quadrado - Para cálculo de previsão de metragem de superfícies'}
                      {unidadeCobranca === 'm3' && 'Metro cúbico - Para cálculo de previsão de volume de massa asfáltica'}
                      {unidadeCobranca === 'diaria' && 'Por diária - Para serviços de longa duração'}
                      {unidadeCobranca === 'servico' && 'Por serviço - Para serviços específicos'}
                    </p>
                    <p className="mt-2 text-xs">
                      <strong>Nota:</strong> O valor total da obra será calculado pela soma de todos os serviços adicionados.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção: CNPJ Separado */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              CNPJ da Obra
            </h3>
            
            <div className="space-y-4">
              {/* Checkbox para CNPJ separado */}
              <Controller
                name="tem_cnpj_separado"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tem_cnpj_separado"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <label htmlFor="tem_cnpj_separado" className="ml-2 block text-sm text-gray-900">
                      <span className="font-medium">Esta obra tem um CNPJ separado?</span>
                      <span className="text-gray-500 ml-1">(Geralmente para consórcios entre empresas)</span>
                    </label>
                  </div>
                )}
              />

              {/* Campos de CNPJ separado (aparecem apenas se checkbox marcado) */}
              {temCnpjSeparado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="md:col-span-2">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">
                        CNPJ Específico da Obra
                      </span>
                    </div>
                  </div>

                  {/* CNPJ */}
                  <Controller
                    name="cnpj_obra"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CNPJ da Obra *
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Ex: 98.765.432/0001-10"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        {errors.cnpj_obra && (
                          <p className="mt-1 text-sm text-red-600">{errors.cnpj_obra.message}</p>
                        )}
                      </div>
                    )}
                  />

                  {/* Razão Social */}
                  <Controller
                    name="razao_social_obra"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Razão Social da Obra *
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="Ex: Consórcio ABC/DEF Pavimentação Ltda"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                        {errors.razao_social_obra && (
                          <p className="mt-1 text-sm text-red-600">{errors.razao_social_obra.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <div className="md:col-span-2">
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Informação Importante:</p>
                        <p>Este CNPJ será usado para faturamento e documentação específica desta obra, independente do CNPJ do cliente principal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção: Planejamento */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Planejamento da Obra
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data de Início */}
              <Controller
                name="data_inicio_prevista"
                control={control}
                render={({ field }) => (
                  <div>
                    <DatePicker
                      label="Data de Início Prevista *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      required
                      placeholder="Selecione a data"
                      error={errors.data_inicio_prevista?.message}
                    />
                  </div>
                )}
              />

              {/* Data de Conclusão */}
              <Controller
                name="data_conclusao_prevista"
                control={control}
                render={({ field }) => (
                  <div>
                    <DatePicker
                      label="Data de Conclusão Prevista *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      required
                      placeholder="Selecione a data"
                      error={errors.data_conclusao_prevista?.message}
                    />
                  </div>
                )}
              />

              {/* Total de Ruas */}
              <Controller
                name="total_ruas"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total de Ruas *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input"
                      placeholder="Ex: 10"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      onBlur={field.onBlur}
                    />
                    {errors.total_ruas && (
                      <p className="mt-1 text-sm text-red-600">{errors.total_ruas.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Volume Total Previsto */}
              <Controller
                name="volume_total_previsto"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume Total Previsto (m³) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      placeholder="Ex: 500"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                    />
                    {errors.volume_total_previsto && (
                      <p className="mt-1 text-sm text-red-600">{errors.volume_total_previsto.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Seção: Valores */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-yellow-600" />
              Valores da Obra
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Informação:</strong> O valor total da obra será calculado automaticamente pela soma de todos os serviços adicionados.
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Serviços */}
          <div className="card p-6">
            <ServicoSelector
              servicosObra={servicosObra as ServicoFormulario[]}
              unidadeCobrancaObra={unidadeCobranca}
              onServicosChange={onServicosChange}
              errors={errors.servicos}
            />
          </div>

          {/* Seção: Observações */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              Observações
            </h3>
            
            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Adicione observações sobre a obra..."
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </div>
              )}
            />
          </div>

          {/* Resumo e Botões */}
          <div className="card bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Obra</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-gray-500">Nome</p>
                <p className="font-medium text-gray-900">
                  {watch('nome') || 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Região</p>
                <p className="font-medium text-gray-900">
                  {watch('regiao') && watch('cidade') && watch('estado') 
                    ? `${watch('regiao')}, ${watch('cidade')}/${watch('estado')}`
                    : 'Não informado'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500">Volume</p>
                <p className="font-medium text-gray-900">
                  {watch('volume_total_previsto')?.toFixed(1) || 0} m³
                </p>
              </div>
              {(() => {
                const servicosM2M3 = servicosObra.filter(s => s.unidade === 'm2' || s.unidade === 'm3')
                const servicosMobilizacao = servicosObra.filter(s => s.unidade === 'servico' || s.unidade === 'viagem')
                
                // Calcular valor total por M²/M³
                const valorPorM2M3 = servicosM2M3.reduce((total, servico) => total + servico.preco_unitario, 0)
                
                // Multiplicar pelo volume previsto
                const previsaoFaturamentoM2M3 = valorPorM2M3 * volumePrevisto
                
                // Valor das mobilizações (fixo)
                const totalMobilizacao = servicosMobilizacao.reduce((total, servico) => total + servico.valor_total, 0)
                
                // Total previsto da obra
                const totalPrevistoObra = previsaoFaturamentoM2M3 + totalMobilizacao
                
                return (
                  <>
                    {previsaoFaturamentoM2M3 > 0 && (
                      <div>
                        <p className="text-gray-500">Previsão M²/M³</p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(previsaoFaturamentoM2M3)}
                        </p>
                      </div>
                    )}
                    {totalMobilizacao > 0 && (
                      <div>
                        <p className="text-gray-500">Mobilização</p>
                        <p className="font-medium text-orange-600">
                          {formatCurrency(totalMobilizacao)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Previsão Total</p>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(totalPrevistoObra)}
                      </p>
                    </div>
                  </>
                )
              })()}
              {temCnpjSeparado && (
                <>
                  <div>
                    <p className="text-gray-500">CNPJ da Obra</p>
                    <p className="font-medium text-purple-900">
                      {watch('cnpj_obra') || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Razão Social da Obra</p>
                    <p className="font-medium text-purple-900">
                      {watch('razao_social_obra') || 'Não informado'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Resumo da Obra */}
            <div className="card p-6 bg-gray-50 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Resumo da Obra
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Informações Básicas</h4>
                  <div>
                    <p className="text-sm text-gray-600">Nome da Obra</p>
                    <p className="font-medium text-gray-900">{watch('nome') || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="font-medium text-gray-900">
                      {mockClientes.find(c => c.id === watch('cliente_id'))?.nome || 'Não selecionado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Região</p>
                    <p className="font-medium text-gray-900">{watch('regiao') || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unidade de Cobrança</p>
                    <p className="font-medium text-gray-900">
                      {getUnidadeLabel(watch('unidade_cobranca') || 'm2')}
                    </p>
                  </div>
                </div>

                {/* Serviços */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Serviços e Valores</h4>
                  <div>
                    <p className="text-sm text-gray-600">Volume Previsto</p>
                    <p className="font-medium text-gray-900">
                      {volumePrevisto} {getUnidadeLabel(unidadeCobranca)}
                    </p>
                  </div>
                  
                  {/* Serviços */}
                  {servicosObra.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Serviços Adicionados</p>
                      <div className="space-y-2">
                        {servicosObra.map((servico) => (
                          <div key={servico.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                            <div>
                              <span className="font-medium">{servico.servico_nome}</span>
                              <span className="text-gray-500 ml-2">({servico.unidade.toUpperCase()})</span>
                            </div>
                            <span className="font-medium text-green-600">
                              R$ {servico.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                        {/* Cálculo de Previsão de Faturamento */}
                        {(() => {
                          const servicosM2M3 = servicosObra.filter(s => s.unidade === 'm2' || s.unidade === 'm3')
                          const servicosMobilizacao = servicosObra.filter(s => s.unidade === 'servico' || s.unidade === 'viagem')
                          
                          // Calcular valor total por M²/M³
                          const valorPorM2M3 = servicosM2M3.reduce((total, servico) => total + servico.preco_unitario, 0)
                          
                          // Multiplicar pelo volume previsto
                          const previsaoFaturamentoM2M3 = valorPorM2M3 * volumePrevisto
                          
                          // Valor das mobilizações (fixo)
                          const totalMobilizacao = servicosMobilizacao.reduce((total, servico) => total + servico.valor_total, 0)
                          
                          // Total previsto da obra
                          const totalPrevistoObra = previsaoFaturamentoM2M3 + totalMobilizacao
                          
                          return (
                            <>
                              {/* Volume e Valor por Unidade */}
                              <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-3">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">Volume Previsto:</span>
                                  <span className="font-medium">{volumePrevisto} {getUnidadeLabel(unidadeCobranca)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-1">
                                  <span className="text-gray-600">Valor por {getUnidadeLabel(unidadeCobranca)}:</span>
                                  <span className="font-medium">
                                    R$ {valorPorM2M3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>

                              {/* Previsão de Faturamento por M²/M³ */}
                              {previsaoFaturamentoM2M3 > 0 && (
                                <div className="flex justify-between items-center text-sm font-semibold bg-green-50 p-2 rounded border border-green-200">
                                  <span>Previsão Faturamento M²/M³</span>
                                  <span className="text-green-600">
                                    R$ {previsaoFaturamentoM2M3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}

                              {/* Valor Mobilização/Imobilização */}
                              {totalMobilizacao > 0 && (
                                <div className="flex justify-between items-center text-sm font-semibold bg-orange-50 p-2 rounded border border-orange-200">
                                  <span>Mobilização/Imobilização</span>
                                  <span className="text-orange-600">
                                    R$ {totalMobilizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              )}

                              {/* Total Previsto da Obra */}
                              <div className="flex justify-between items-center text-lg font-bold bg-blue-50 p-3 rounded border border-blue-200">
                                <span>Previsão Total da Obra</span>
                                <span className="text-blue-600">
                                  R$ {totalPrevistoObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>

                              {/* Nota sobre Previsão */}
                              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <p className="text-xs text-yellow-800">
                                  <strong>⚠️ Previsão:</strong> Este é o valor previsto de faturamento caso tudo ocorra conforme planejado.
                                  Valores finais podem variar conforme volume real executado.
                                </p>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Obra'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
