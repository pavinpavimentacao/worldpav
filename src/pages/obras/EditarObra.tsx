import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { DatePicker } from '../../components/ui/date-picker'
import { NumberInput } from '../../components/ui/number-input'
import { CnpjInput } from '../../components/ui/cnpj-input'
import { 
  ArrowLeft, 
  Building, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { ServicoSelector } from "../../components/shared/ServicoSelector"
import { ServicoObra } from '../../types/servicos'
import { getObraById, updateObra, ObraUpdateData } from '../../lib/obrasApi'
import { getClientesSimples } from '../../lib/clientesApi'
import { useToast } from '../../lib/toast-hooks'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import { createServicosObra, getServicosObra, updateServicoObra, deleteServicoObra } from '../../lib/obrasServicosApi'

// Tipo para serviços no formulário (sem obra_id obrigatório)
type ServicoFormulario = Omit<ServicoObra, 'obra_id' | 'created_at'> & {
  obra_id?: string
  created_at?: string
}

// Schema de validação completo
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
  unidade_cobranca: z.string().optional(),
  volume_total_previsto: z.number().optional(),
  volume_planejamento: z.number().optional(),
  total_ruas: z.number().optional(),
  previsao_dias: z.number().optional(),
  tem_cnpj_separado: z.boolean().optional(),
  cnpj_obra: z.string().optional(),
  razao_social_obra: z.string().optional(),
  observacoes: z.string().optional()
})

type FormData = z.infer<typeof schema>

export default function EditarObra() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clientes, setClientes] = useState<Array<{ id: string; name: string }>>([])
  const [servicos, setServicos] = useState<ServicoFormulario[]>([])
  const [servicosExistentes, setServicosExistentes] = useState<ServicoObra[]>([])

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tem_cnpj_separado: false
    }
  })

  const temCnpjSeparado = watch('tem_cnpj_separado')

  // Carregar dados da obra
  useEffect(() => {
    async function loadObra() {
      if (!id) return

      try {
        setLoading(true)
        
        // Carregar obra
        const obra = await getObraById(id)
        if (!obra) {
          addToast({ message: 'Obra não encontrada', type: 'error' })
          navigate('/obras')
          return
        }

        // Preencher formulário com dados da obra
        setValue('nome', obra.name)
        setValue('descricao', obra.description || '')
        setValue('cliente_id', obra.client_id || '')
        setValue('cidade', obra.city || '')
        setValue('estado', obra.state || '')
        setValue('location', obra.location || '')
        setValue('data_inicio_prevista', obra.start_date || '')
        setValue('data_conclusao_prevista', obra.expected_end_date || '')
        setValue('valor_contrato', obra.contract_value || 0)
        setValue('unidade_cobranca', obra.unidade_cobranca || '')
        setValue('volume_total_previsto', obra.volume_total_previsto || 0)
        setValue('volume_planejamento', obra.volume_planejamento || 0)
        setValue('total_ruas', obra.total_ruas || 0)
        setValue('previsao_dias', obra.previsao_dias || 0)
        setValue('tem_cnpj_separado', obra.tem_cnpj_separado || false)
        setValue('cnpj_obra', obra.cnpj_obra || '')
        setValue('razao_social_obra', obra.razao_social_obra || '')
        setValue('observacoes', obra.observations || '')

        // Carregar clientes
        const clientesData = await getClientesSimples()
        setClientes(clientesData)

        // Carregar serviços existentes
        const servicosData = await getServicosObra(id)
        setServicosExistentes(servicosData)

      } catch (error) {
        console.error('Erro ao carregar obra:', error)
        addToast({ message: 'Erro ao carregar obra', type: 'error' })
        navigate('/obras')
      } finally {
        setLoading(false)
      }
    }

    loadObra()
  }, [id, setValue, addToast, navigate])

  const onSubmit = async (data: FormData) => {
    if (!id) return

    try {
      setSaving(true)

      // Preparar dados para atualização
      const obraData: ObraUpdateData = {
        name: data.nome,
        description: data.descricao,
        client_id: data.cliente_id || null,
        city: data.cidade,
        state: data.estado,
        location: data.location,
        start_date: data.data_inicio_prevista,
        expected_end_date: data.data_conclusao_prevista,
        contract_value: data.valor_contrato,
        unidade_cobranca: data.unidade_cobranca,
        volume_total_previsto: data.volume_total_previsto,
        volume_planejamento: data.volume_planejamento,
        total_ruas: data.total_ruas,
        previsao_dias: data.previsao_dias,
        tem_cnpj_separado: data.tem_cnpj_separado,
        cnpj_obra: data.cnpj_obra,
        razao_social_obra: data.razao_social_obra,
        observations: data.observacoes
      }

      // Atualizar obra
      await updateObra(id, obraData)

      // Atualizar serviços
      await updateServicos()

      addToast({ 
        message: 'Obra atualizada com sucesso!', 
        type: 'success' 
      })
      
      navigate(`/obras/${id}`)

    } catch (error) {
      console.error('Erro ao atualizar obra:', error)
      addToast({ 
        message: 'Erro ao atualizar obra', 
        type: 'error' 
      })
    } finally {
      setSaving(false)
    }
  }

  const updateServicos = async () => {
    if (!id) return

    try {
      // Remover serviços que não estão mais na lista
      const servicosParaRemover = servicosExistentes.filter(
        servicoExistente => !servicos.some(servico => servico.id === servicoExistente.id)
      )

      for (const servico of servicosParaRemover) {
        await deleteServicoObra(servico.id)
      }

      // Atualizar ou criar serviços
      for (const servico of servicos) {
        if (servico.id) {
          // Atualizar serviço existente
          await updateServicoObra(servico.id, {
            servico_id: servico.servico_id,
            quantidade: servico.quantidade,
            preco_unitario: servico.preco_unitario,
            observacoes: servico.observacoes
          })
        } else {
          // Criar novo serviço
          await createServicosObra(id, [{
            servico_id: servico.servico_id,
            quantidade: servico.quantidade,
            preco_unitario: servico.preco_unitario,
            observacoes: servico.observacoes
          }])
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar serviços:', error)
      throw error
    }
  }

  const handleServicosChange = (novosServicos: ServicoFormulario[]) => {
    setServicos(novosServicos)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando obra...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/obras/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Obra</h1>
              <p className="text-gray-600">Atualize as informações da obra</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Obra */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Obra *
                </label>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Pavimentação da Rua Principal"
                    />
                  )}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descrição detalhada da obra..."
                    />
                  )}
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <Controller
                  name="cliente_id"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value="">Selecione um cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {/* Localização */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <Controller
                  name="cidade"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: São Paulo"
                    />
                  )}
                />
                {errors.cidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value="">Selecione o estado</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="RS">Rio Grande do Sul</option>
                    </Select>
                  )}
                />
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro/Região
                </label>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Centro"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Planejamento */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Planejamento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data de Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Início Prevista
                </label>
                <Controller
                  name="data_inicio_prevista"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione a data"
                    />
                  )}
                />
              </div>

              {/* Data de Conclusão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Conclusão Prevista
                </label>
                <Controller
                  name="data_conclusao_prevista"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione a data"
                    />
                  )}
                />
              </div>

              {/* Valor do Contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Contrato (R$)
                </label>
                <Controller
                  name="valor_contrato"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0,00"
                      min={0}
                    />
                  )}
                />
              </div>

              {/* Unidade de Cobrança */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade de Cobrança
                </label>
                <Controller
                  name="unidade_cobranca"
                  control={control}
                  render={({ field }) => (
                    <Select {...field}>
                      <option value="">Selecione a unidade</option>
                      <option value="m2">m² (metro quadrado)</option>
                      <option value="m3">m³ (metro cúbico)</option>
                      <option value="km">km (quilômetro)</option>
                      <option value="unidade">Unidade</option>
                    </Select>
                  )}
                />
              </div>

              {/* Volume Total Previsto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Total Previsto
                </label>
                <Controller
                  name="volume_total_previsto"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0"
                      min={0}
                    />
                  )}
                />
              </div>

              {/* Volume de Planejamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume de Planejamento
                </label>
                <Controller
                  name="volume_planejamento"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0"
                      min={0}
                    />
                  )}
                />
              </div>

              {/* Total de Ruas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Ruas
                </label>
                <Controller
                  name="total_ruas"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0"
                      min={0}
                    />
                  )}
                />
              </div>

              {/* Previsão de Dias */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previsão de Dias
                </label>
                <Controller
                  name="previsao_dias"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value || 0}
                      onChange={field.onChange}
                      placeholder="0"
                      min={0}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* CNPJ Separado */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              Dados Fiscais
            </h2>

            <div className="space-y-6">
              {/* Checkbox CNPJ Separado */}
              <div className="flex items-center">
                <Controller
                  name="tem_cnpj_separado"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={field.onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  )}
                />
                <label className="ml-2 block text-sm text-gray-900">
                  A obra possui CNPJ separado
                </label>
              </div>

              {/* Campos condicionais */}
              {temCnpjSeparado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ da Obra
                    </label>
                    <Controller
                      name="cnpj_obra"
                      control={control}
                      render={({ field }) => (
                        <CnpjInput
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="00.000.000/0000-00"
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razão Social da Obra
                    </label>
                    <Controller
                      name="razao_social_obra"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nome da empresa"
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              Serviços da Obra
            </h2>

            <ServicoSelector
              servicos={servicos}
              servicosExistentes={servicosExistentes}
              onChange={handleServicosChange}
            />
          </div>

          {/* Observações */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Observações
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Adicionais
              </label>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações importantes sobre a obra..."
                  />
                )}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/obras/${id}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}