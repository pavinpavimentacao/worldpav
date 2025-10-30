import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { MaquinariosAPI } from '../../lib/maquinariosApi'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import { tiposMaquinario } from '../../types/maquinarios'

// Schema de validação
const maquinarioSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  plate: z.string().optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional().or(z.literal('')),
  status: z.enum(['ativo', 'manutencao', 'inativo']).default('ativo'),
  observations: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal(''))
})

type MaquinarioFormData = z.infer<typeof maquinarioSchema>

const NovoMaquinario: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<MaquinarioFormData>({
    resolver: zodResolver(maquinarioSchema),
    defaultValues: {
      status: 'ativo'
    }
  })

  const year = watch('year')

  // Carregar company ID
  useEffect(() => {
    const carregarCompanyId = async () => {
      try {
        const id = await getOrCreateDefaultCompany()
        setCompanyId(id)
      } catch (err) {
        console.error('Erro ao carregar company ID:', err)
        setError('Erro ao carregar empresa')
      }
    }

    carregarCompanyId()
  }, [])

  const onSubmit = async (data: MaquinarioFormData) => {
    if (!companyId) {
      setError('Empresa não carregada')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Converter year para number se for string
      const yearNumber = data.year === '' ? undefined : Number(data.year)
      
      const maquinarioData = {
        ...data,
        year: yearNumber,
        photo_url: data.photo_url === '' ? undefined : data.photo_url
      }

      await MaquinariosAPI.create(maquinarioData, companyId)
      
      navigate('/maquinarios', { 
        state: { message: 'Maquinário criado com sucesso!' }
      })
    } catch (err) {
      console.error('Erro ao criar maquinário:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar maquinário')
    } finally {
      setLoading(false)
    }
  }

  if (!companyId) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/maquinarios')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Novo Equipamento</h1>
          </div>
          <p className="text-gray-600">
            Cadastre um novo equipamento para uso em pavimentação
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Maquinário *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Ex: Vibroacabadora CAT AP1055F"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  {tiposMaquinario.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutencao">Em Manutenção</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <Input
                  {...register('brand')}
                  placeholder="Ex: Caterpillar, Volvo, Dynapac"
                />
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <Input
                  {...register('model')}
                  placeholder="Ex: AP1055F, FMX, CA2500"
                />
              </div>

              {/* Placa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa
                </label>
                <Input
                  {...register('plate')}
                  placeholder="Ex: ABC-1234"
                  className="uppercase"
                />
              </div>

              {/* Ano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano
                </label>
                <Input
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  placeholder="Ex: 2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>

              {/* URL da Foto */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Foto
                </label>
                <Input
                  {...register('photo_url')}
                  placeholder="https://exemplo.com/foto.jpg"
                  type="url"
                />
                {errors.photo_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.photo_url.message}</p>
                )}
              </div>

              {/* Observações */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  {...register('observations')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre o maquinário..."
                />
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erro</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/maquinarios')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Maquinário
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default NovoMaquinario