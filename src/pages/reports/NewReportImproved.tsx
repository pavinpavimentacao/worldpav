import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { DatePicker } from '../../components/ui/date-picker'
import { getAllObrasWithProgress } from '../../types/obras'
import { 
  ArrowLeft, 
  Plus, 
  Building, 
  Truck, 
  Users, 
  DollarSign, 
  FileText,
  Calendar,
  MapPin
} from 'lucide-react'

// Schema de validação
const schema = z.object({
  obra_id: z.string().min(1, 'Selecione uma obra'),
  rua_id: z.string().min(1, 'Selecione uma rua'),
  data: z.string().min(1, 'A data é obrigatória'),
  bomba_id: z.string().min(1, 'Selecione uma bomba'),
  volume_realizado: z.number().min(0.1, 'O volume deve ser maior que 0'),
  valor_total: z.number().min(0, 'O valor deve ser maior que 0'),
  motorista: z.string().min(1, 'O motorista é obrigatório'),
  auxiliar1: z.string().min(1, 'Pelo menos um auxiliar é obrigatório'),
  auxiliar2: z.string().optional(),
  observacoes: z.string().optional()
})

type FormValues = z.infer<typeof schema>

const mockBombas = [
  { id: '1', prefix: 'WP-001', model: 'Vibroacabadora CAT AP1055F', status: 'active' },
  { id: '2', prefix: 'WP-002', model: 'Vibroacabadora Dynapac CA2500', status: 'active' },
  { id: '3', prefix: 'WP-003', model: 'Vibroacabadora Volvo ABG 7820', status: 'maintenance' },
  { id: '4', prefix: 'PAV-001', model: 'Vibroacabadora Pavin P-200', status: 'active' }
]

// Mock data para colaboradores
const mockColaboradores = [
  { id: '1', nome: 'João Silva', funcao: 'Motorista' },
  { id: '2', nome: 'Maria Santos', funcao: 'Auxiliar' },
  { id: '3', nome: 'Pedro Costa', funcao: 'Auxiliar' },
  { id: '4', nome: 'Ana Oliveira', funcao: 'Motorista' },
  { id: '5', nome: 'Carlos Lima', funcao: 'Auxiliar' }
]

export default function NewReportImproved() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const obraIdFromUrl = searchParams.get('obra_id')

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      obra_id: obraIdFromUrl || '',
      rua_id: '',
      data: new Date().toISOString().split('T')[0],
      bomba_id: '',
      volume_realizado: 0,
      valor_total: 0,
      motorista: '',
      auxiliar1: '',
      auxiliar2: '',
      observacoes: ''
    }
  })

  const obraSelecionada = watch('obra_id')
  const volumeRealizado = watch('volume_realizado')

  // Obter obras disponíveis
  const obras = getAllObrasWithProgress().filter(o => o.status === 'em_andamento')

  // Obter obra selecionada
  const obra = obras.find(o => o.id === obraSelecionada)

  // Obter ruas liberadas da obra selecionada
  const ruasDisponiveis = obra?.ruas?.filter(rua => 
    rua.status === 'liberada' || rua.status === 'em_andamento'
  ) || []

  // Calcular valor baseado no volume (R$ 250/m³)
  useEffect(() => {
    if (volumeRealizado > 0) {
      const valorCalculado = volumeRealizado * 250
      setValue('valor_total', valorCalculado)
    }
  }, [volumeRealizado, setValue])

  const onSubmit = async (values: FormValues) => {
    try {
      console.log('Novo Relatório:', values)
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Relatório criado com sucesso!')
      
      // Redirecionar para a obra se veio de lá
      if (obraIdFromUrl) {
        navigate(`/obras/${obraIdFromUrl}`)
      } else {
        navigate('/reports')
      }
    } catch (err: any) {
      console.error('Erro ao criar relatório:', err)
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
              Novo Relatório
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Registre um novo relatório de aplicação de massa asfáltica.
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
          {/* Seção: Obra e Data */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Obra e Data
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleção de Obra */}
              <Controller
                name="obra_id"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Obra *"
                      value={field.value || ''}
                      onChange={(value) => {
                        field.onChange(value)
                        setValue('rua_id', '') // Reset rua selection when obra changes
                      }}
                      placeholder="Selecione uma obra"
                      options={[
                        { value: '', label: 'Selecione uma obra' },
                        ...obras.map(obra => ({
                          value: obra.id,
                          label: `${obra.nome} - ${obra.cliente_nome}`
                        }))
                      ]}
                      error={errors.obra_id?.message}
                    />
                  </div>
                )}
              />

              {/* Seleção de Rua */}
              <Controller
                name="rua_id"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Rua *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione uma rua"
                      disabled={!obraSelecionada || ruasDisponiveis.length === 0}
                      options={[
                        { value: '', label: ruasDisponiveis.length === 0 ? 'Nenhuma rua liberada' : 'Selecione uma rua' },
                        ...ruasDisponiveis.map(rua => ({
                          value: rua.id,
                          label: `${rua.nome_rua} - ${rua.status === 'em_andamento' ? 'Em Andamento' : 'Liberada'}`
                        }))
                      ]}
                      error={errors.rua_id?.message}
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Data */}
              <Controller
                name="data"
                control={control}
                render={({ field }) => (
                  <div>
                    <DatePicker
                      label="Data da Aplicação"
                      value={field.value || ''}
                      onChange={field.onChange}
                      required
                      placeholder="Selecione a data"
                      error={errors.data?.message}
                    />
                  </div>
                )}
              />
            </div>

            {/* Informações da Obra Selecionada */}
            {obra && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Informações da Obra</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Cliente:</span>
                    <p className="text-blue-800">{obra.cliente_nome}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Região:</span>
                    <p className="text-blue-800">{obra.regiao}, {obra.cidade}/{obra.estado}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Progresso:</span>
                    <p className="text-blue-800">{obra.progresso_percentual}% concluído</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seção: Equipamento e Equipe */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Truck className="h-5 w-5 mr-2 text-green-600" />
              Equipamento e Equipe
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <Controller
                name="bomba_id"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Bomba Espargidora *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione uma bomba"
                      options={[
                        { value: '', label: 'Selecione uma bomba' },
                        ...mockBombas
                          .filter(bomba => bomba.status === 'active')
                          .map(bomba => ({
                            value: bomba.id,
                            label: `${bomba.prefix} - ${bomba.model}`
                          }))
                      ]}
                      error={errors.bomba_id?.message}
                    />
                  </div>
                )}
              />

              {/* Motorista */}
              <Controller
                name="motorista"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Motorista *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione o motorista"
                      options={[
                        { value: '', label: 'Selecione o motorista' },
                        ...mockColaboradores
                          .filter(col => col.funcao === 'Motorista')
                          .map(col => ({
                            value: col.id,
                            label: col.nome
                          }))
                      ]}
                      error={errors.motorista?.message}
                    />
                  </div>
                )}
              />

              {/* Auxiliar 1 */}
              <Controller
                name="auxiliar1"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Auxiliar 1 *"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione o auxiliar"
                      options={[
                        { value: '', label: 'Selecione o auxiliar' },
                        ...mockColaboradores
                          .filter(col => col.funcao === 'Auxiliar')
                          .map(col => ({
                            value: col.id,
                            label: col.nome
                          }))
                      ]}
                      error={errors.auxiliar1?.message}
                    />
                  </div>
                )}
              />

              {/* Auxiliar 2 */}
              <Controller
                name="auxiliar2"
                control={control}
                render={({ field }) => (
                  <div>
                    <Select
                      label="Auxiliar 2 (Opcional)"
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder="Selecione o auxiliar"
                      options={[
                        { value: '', label: 'Não selecionar' },
                        ...mockColaboradores
                          .filter(col => col.funcao === 'Auxiliar')
                          .map(col => ({
                            value: col.id,
                            label: col.nome
                          }))
                      ]}
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Seção: Volume e Valor */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
              Volume e Valor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Volume Realizado */}
              <Controller
                name="volume_realizado"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume Realizado (m³) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="input"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                      placeholder="Ex: 45.5"
                    />
                    {errors.volume_realizado && (
                      <p className="mt-1 text-sm text-red-600">{errors.volume_realizado.message}</p>
                    )}
                  </div>
                )}
              />

              {/* Valor Total */}
              <Controller
                name="valor_total"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Total *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onBlur={field.onBlur}
                      placeholder="Ex: 11250.00"
                    />
                    {errors.valor_total && (
                      <p className="mt-1 text-sm text-red-600">{errors.valor_total.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Valor calculado automaticamente: {formatCurrency(volumeRealizado * 250)}
                    </p>
                  </div>
                )}
              />
            </div>
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
                    placeholder="Adicione observações sobre a aplicação..."
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Relatório</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-6">
              <div>
                <p className="text-gray-500">Obra</p>
                <p className="font-medium text-gray-900">
                  {obra ? obra.nome : 'Não selecionada'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Rua</p>
                <p className="font-medium text-gray-900">
                  {watch('rua_id') ? 
                    ruasDisponiveis.find(r => r.id === watch('rua_id'))?.nome_rua || 'Não selecionada' 
                    : 'Não selecionada'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-500">Volume</p>
                <p className="font-medium text-gray-900">
                  {volumeRealizado.toFixed(1)} m³
                </p>
              </div>
              <div>
                <p className="text-gray-500">Valor</p>
                <p className="font-medium text-gray-900">
                  {formatCurrency(watch('valor_total') || 0)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Relatório'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}


