import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/ui/textarea'
import { 
  ArrowLeft, 
  Plus, 
  Wrench, 
  DollarSign, 
  Settings,
  Info,
  CheckCircle
} from 'lucide-react'
import { 
  TipoServico, 
  UnidadeServico, 
  getTipoServicoLabel, 
  getUnidadeServicoLabel,
  formatPrecoServico,
  mockServicos 
} from '../../types/servicos'

// Schema de validação
const schema = z.object({
  nome: z.string().min(1, 'O nome do serviço é obrigatório'),
  descricao: z.string().min(1, 'A descrição é obrigatória'),
  tipo: z.enum(['pavimentacao', 'imprimacao', 'impermeabilizante', 'mobilizacao', 'imobilizacao', 'outros'], {
    required_error: 'Selecione o tipo de serviço'
  }),
  unidade_base: z.enum(['m2', 'm3', 'diaria', 'servico'], {
    required_error: 'Selecione a unidade base'
  }),
  preco_por_unidade: z.number().min(0.01, 'O preço deve ser maior que 0'),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo')
})

type FormValues = z.infer<typeof schema>

// Opções para os selects
const opcoesTipo: { value: TipoServico; label: string }[] = [
  { value: 'pavimentacao', label: 'Pavimentação' },
  { value: 'imprimacao', label: 'Imprimação' },
  { value: 'impermeabilizante', label: 'Impermeabilizante' },
  { value: 'mobilizacao', label: 'Mobilização' },
  { value: 'imobilizacao', label: 'Imobilização' },
  { value: 'outros', label: 'Outros' }
]

const opcoesUnidade: { value: UnidadeServico; label: string }[] = [
  { value: 'm2', label: 'Metro Quadrado (m²)' },
  { value: 'm3', label: 'Metro Cúbico (m³)' },
  { value: 'diaria', label: 'Por Diária' },
  { value: 'servico', label: 'Por Serviço' }
]

const opcoesStatus = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' }
]

export default function NovoServico() {
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'pavimentacao',
      unidade_base: 'm2',
      preco_por_unidade: 0,
      observacoes: '',
      status: 'ativo'
    }
  })

  const tipoSelecionado = watch('tipo')
  const unidadeSelecionada = watch('unidade_base')
  const precoSelecionado = watch('preco_por_unidade')

  const onSubmit = async (values: FormValues) => {
    try {
      console.log('Novo Serviço:', values)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Adicionar ao mock (em produção, seria uma chamada à API)
      const novoServico = {
        id: (mockServicos.length + 1).toString(),
        ...values,
        company_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      mockServicos.push(novoServico)
      
      console.log('Serviço criado com sucesso:', novoServico)
      navigate('/servicos')
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
    }
  }

  const getTipoDescription = (tipo: TipoServico) => {
    switch (tipo) {
      case 'pavimentacao':
        return 'Serviços de pavimentação asfáltica, incluindo recap, asfalto novo ou ambos'
      case 'imprimacao':
        return 'Aplicação de imprimação asfáltica para preparação da superfície'
      case 'impermeabilizante':
        return 'Aplicação de impermeabilizante asfáltico'
      case 'mobilizacao':
        return 'Mobilização de equipamentos e equipe para o local da obra'
      case 'imobilizacao':
        return 'Imobilização de equipamentos e equipe após conclusão da obra'
      case 'outros':
        return 'Outros serviços específicos da empresa'
      default:
        return ''
    }
  }

  const getUnidadeDescription = (unidade: UnidadeServico) => {
    switch (unidade) {
      case 'm2':
        return 'Ideal para serviços de superfície (pavimentação, imprimação, etc.)'
      case 'm3':
        return 'Ideal para aplicação de massa asfáltica e volume de material'
      case 'diaria':
        return 'Ideal para serviços de mobilização, imobilização e trabalhos contínuos'
      case 'servico':
        return 'Ideal para serviços específicos e pontuais'
      default:
        return ''
    }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <h2 className="text-3xl font-bold text-gray-900">Novo Serviço</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção: Informações Básicas */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome do Serviço *"
                {...register('nome')}
                error={errors.nome?.message}
                placeholder="Ex: Aplicação de Massa Asfáltica C.B.U.Q."
              />

              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tipo de Serviço *"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: '', label: 'Selecione o tipo' },
                      ...opcoesTipo
                    ]}
                    placeholder="Selecione o tipo"
                    error={errors.tipo?.message}
                  />
                )}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Descrição do Serviço *"
                  {...register('descricao')}
                  error={errors.descricao?.message}
                  rows={4}
                  placeholder="Descreva detalhadamente o serviço oferecido..."
                />
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Status"
                    value={field.value}
                    onChange={field.onChange}
                    options={opcoesStatus}
                    placeholder="Selecione o status"
                    error={errors.status?.message}
                  />
                )}
              />
            </div>

            {/* Informações sobre o tipo selecionado */}
            {tipoSelecionado && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">{getTipoServicoLabel(tipoSelecionado)}</p>
                    <p className="mt-1">{getTipoDescription(tipoSelecionado)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Preços e Unidades */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Preços e Unidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Controller
                name="unidade_base"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Unidade Base *"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: '', label: 'Selecione a unidade' },
                      ...opcoesUnidade
                    ]}
                    placeholder="Selecione a unidade"
                    error={errors.unidade_base?.message}
                  />
                )}
              />

              <Controller
                name="preco_por_unidade"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço por {getUnidadeServicoLabel(unidadeSelecionada)} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      placeholder="Ex: 7.50"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                    />
                    {errors.preco_por_unidade && (
                      <p className="mt-1 text-sm text-red-600">{errors.preco_por_unidade.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Preview do preço */}
            {unidadeSelecionada && precoSelecionado > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">Preço configurado:</p>
                    <p className="text-lg font-semibold">
                      {formatPrecoServico(precoSelecionado, unidadeSelecionada)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações sobre a unidade selecionada */}
            {unidadeSelecionada && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2">
                  <Settings className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">Unidade: {getUnidadeServicoLabel(unidadeSelecionada)}</p>
                    <p className="mt-1">{getUnidadeDescription(unidadeSelecionada)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Observações */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-purple-600" />
              Observações Adicionais
            </h3>
            <Textarea
              label="Observações"
              {...register('observacoes')}
              error={errors.observacoes?.message}
              rows={4}
              placeholder="Adicione observações importantes sobre este serviço..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Criar Serviço'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}



