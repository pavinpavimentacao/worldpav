import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { 
  ArrowLeft, 
  Building, 
  Calendar
} from 'lucide-react'
import { createObra, ObraInsertData } from '../../lib/obrasApi'
import { getClientesSimples } from '../../lib/clientesApi'
import { useToast } from '../../lib/toast-hooks'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'

// Schema de validação simplificado para a API
const schema = z.object({
  nome: z.string().min(1, 'O nome da obra é obrigatório'),
  descricao: z.string().optional(),
  cliente_id: z.string().optional(),
  cidade: z.string().min(1, 'A cidade é obrigatória'),
  estado: z.string().min(1, 'O estado é obrigatório'),
  location: z.string().optional(),
  data_inicio_prevista: z.string().optional(),
  data_conclusao_prevista: z.string().optional(),
  valor_contrato: z.number().optional(),
  observacoes: z.string().optional()
})

type FormValues = z.infer<typeof schema>

// Estados do Brasil
const estadosBrasil = [
  { value: 'SP', label: 'São Paulo' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PR', label: 'Paraná' },
  { value: 'RS', label: 'Rio Grande do Sul' }
]

export default function NovaObra() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const clientIdFromUrl = searchParams.get('clientId')

  // Estados
  const [clientes, setClientes] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cliente_id: clientIdFromUrl || '',
      estado: 'SP'
    }
  })

  // Carregar company ID
  useEffect(() => {
    loadCompanyId()
  }, [])

  // Carregar clientes quando companyId mudar
  useEffect(() => {
    if (companyId) {
      loadClientes()
    }
  }, [companyId])

  async function loadCompanyId() {
    try {
      const id = await getOrCreateDefaultCompany()
      setCompanyId(id)
    } catch (err) {
      console.error('Erro ao carregar company ID:', err)
      addToast({ message: 'Erro ao carregar empresa', type: 'error' })
    }
  }

  async function loadClientes() {
    try {
      const clientesData = await getClientesSimples(companyId)
      setClientes(clientesData)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      addToast({ message: 'Erro ao carregar clientes', type: 'error' })
    }
  }

  const onSubmit = async (data: FormValues) => {
    if (!companyId) {
      addToast({ message: 'Empresa não identificada', type: 'error' })
      return
    }

    try {
      setLoading(true)

      const obraData: ObraInsertData = {
        company_id: companyId,
        client_id: data.cliente_id || null,
        name: data.nome,
        description: data.descricao || null,
        status: 'planejamento',
        start_date: data.data_inicio_prevista || null,
        expected_end_date: data.data_conclusao_prevista || null,
        contract_value: data.valor_contrato || null,
        location: data.location || null,
        city: data.cidade,
        state: data.estado,
        observations: data.observacoes || null
      }

      const obra = await createObra(obraData)
      
      addToast({ message: 'Obra criada com sucesso!', type: 'success' })
      navigate(`/obras/${obra.id}`)
    } catch (error) {
      console.error('Erro ao criar obra:', error)
      addToast({ message: 'Erro ao criar obra', type: 'error' })
    } finally {
      setLoading(false)
    }
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção: Informações Básicas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      label="Cliente"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione um cliente (opcional)"
                      options={[
                        { value: '', label: 'Selecione um cliente (opcional)' },
                        ...clientes.map(cliente => ({
                          value: cliente.id,
                          label: cliente.name
                        }))
                      ]}
                      error={errors.cliente_id?.message}
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      Estado *
                    </label>
                    <Select
                      value={field.value || ''}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'Selecione o estado' },
                        ...estadosBrasil
                      ]}
                    />
                    {errors.estado && (
                      <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Região/Bairro */}
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região/Bairro
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Centro, Jardim das Flores, Região Sul"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      💡 Informe a região/bairro da obra, pois ela engloba várias ruas
                    </p>
                  </div>
                )}
              />

              {/* Descrição */}
              <Controller
                name="descricao"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                        </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descrição da obra (opcional)"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                    {errors.descricao && (
                      <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                        )}
                      </div>
                    )}
                  />
            </div>
          </div>

          {/* Seção: Datas e Valores */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Datas e Valores
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data de Início */}
              <Controller
                name="data_inicio_prevista"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início Prevista
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.data_inicio_prevista && (
                      <p className="mt-1 text-sm text-red-600">{errors.data_inicio_prevista.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Data de Conclusão */}
              <Controller
                name="data_conclusao_prevista"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Conclusão Prevista
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.data_conclusao_prevista && (
                      <p className="mt-1 text-sm text-red-600">{errors.data_conclusao_prevista.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Valor do Contrato */}
              <Controller
                name="valor_contrato"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do Contrato (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 125000.00"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                    />
                    {errors.valor_contrato && (
                      <p className="mt-1 text-sm text-red-600">{errors.valor_contrato.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Observações */}
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Observações adicionais (opcional)"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.observacoes && (
                      <p className="mt-1 text-sm text-red-600">{errors.observacoes.message}</p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/obras')}
            >
                Cancelar
              </Button>
            <Button
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading ? 'Criando...' : 'Criar Obra'}
              </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

