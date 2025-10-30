import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
import { DatePicker } from '../../components/ui/date-picker'
import { SelecionarClienteObraRua } from '../../components/relatorios-diarios/SelecionarClienteObraRua'
import { EquipeSelector } from '../../components/relatorios-diarios/EquipeSelector'
import { MaquinariosSelector } from '../../components/relatorios-diarios/MaquinariosSelector'
import { CalculadoraEspessura } from '../../components/relatorios-diarios/CalculadoraEspessura'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { getRelatorioDiarioById, updateRelatorioDiario } from '../../lib/relatoriosDiariosApi'
import { validarDataNaoFutura, validarEspessura } from '../../utils/relatorios-diarios-utils'
import { FaixaAsfalto, faixaAsfaltoLabels, faixaAsfaltoDescricoes } from '../../types/parceiros'
import { Select } from "../../components/shared/Select"
import { toast } from '../../lib/toast'

// Schema de validação
const relatorioSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  obra_id: z.string().min(1, 'Obra é obrigatória'),
  rua_id: z.string().min(1, 'Rua é obrigatória'),
  equipe_id: z.string().optional(),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().optional(),
  horario_inicio: z.string().min(1, 'Horário de início é obrigatório'),
  metragem_feita: z.number().min(1, 'Metragem deve ser maior que 0'),
  toneladas_aplicadas: z.number().min(1, 'Toneladas devem ser maior que 0'),
  faixa_utilizada: z.string().optional(),
  observacoes: z.string().optional()
})

type RelatorioFormData = z.infer<typeof relatorioSchema>

export function EditarRelatorioDiario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingRelatorio, setLoadingRelatorio] = useState(true)
  const [equipeIsTerceira, setEquipeIsTerceira] = useState(false)
  const [tipoEquipe, setTipoEquipe] = useState<string>('')
  const [maquinariosSelecionados, setMaquinariosSelecionados] = useState<string[]>([])
  const [espessuraCalculada, setEspessuraCalculada] = useState(0)
  const [sucessoMensagem, setSucessoMensagem] = useState('')
  const [erroMensagem, setErroMensagem] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RelatorioFormData>({
    resolver: zodResolver(relatorioSchema)
  })

  // Watch dos valores para a calculadora
  const metragem = watch('metragem_feita') || 0
  const toneladas = watch('toneladas_aplicadas') || 0
  const dataInicio = watch('data_inicio')
  const dataFim = watch('data_fim')

  // Calcular espessura automaticamente
  useEffect(() => {
    if (metragem > 0 && toneladas > 0) {
      const espessura = (toneladas / metragem / 2.4) * 100
      setEspessuraCalculada(espessura)
    } else {
      setEspessuraCalculada(0)
    }
  }, [metragem, toneladas])

  // Carregar relatório existente
  useEffect(() => {
    if (id) {
      loadRelatorio(id)
    }
  }, [id])

  async function loadRelatorio(relatorioId: string) {
    try {
      setLoadingRelatorio(true)
      const relatorio = await getRelatorioDiarioById(relatorioId)
      
      if (!relatorio) {
        toast.error('Relatório não encontrado')
        navigate('/relatorios-diarios')
        return
      }

      // Preencher formulário com dados do relatório
      setValue('cliente_id', relatorio.cliente_id)
      setValue('obra_id', relatorio.obra_id)
      setValue('rua_id', relatorio.rua_id)
      setValue('equipe_id', relatorio.equipe_id || '')
      setValue('data_inicio', relatorio.data_inicio)
      setValue('data_fim', relatorio.data_fim || '')
      setValue('horario_inicio', relatorio.horario_inicio)
      setValue('metragem_feita', relatorio.metragem_feita)
      setValue('toneladas_aplicadas', relatorio.toneladas_aplicadas)
      setValue('faixa_utilizada', relatorio.faixa_utilizada || '')
      setValue('observacoes', relatorio.observacoes || '')

      setEquipeIsTerceira(relatorio.equipe_is_terceira || false)
      setMaquinariosSelecionados(relatorio.maquinarios.map(m => m.maquinario_id))
      
      console.log('✅ Relatório carregado:', relatorio)
    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error)
      toast.error(error.message || 'Erro ao carregar relatório')
      navigate('/relatorios-diarios')
    } finally {
      setLoadingRelatorio(false)
    }
  }

  async function onSubmit(data: RelatorioFormData) {
    if (!id) return

    try {
      setLoading(true)
      setErroMensagem('')
      setSucessoMensagem('')

      // Validar data não futura
      if (!validarDataNaoFutura(data.data_inicio)) {
        setErroMensagem('A data de início não pode ser futura')
        return
      }

      if (data.data_fim && !validarDataNaoFutura(data.data_fim)) {
        setErroMensagem('A data de fim não pode ser futura')
        return
      }

      // Validar espessura
      const validacaoEspessura = validarEspessura(espessuraCalculada)
      if (!validacaoEspessura.valida) {
        setErroMensagem(validacaoEspessura.mensagem || 'Espessura inválida')
        return
      }

      // Validar se pelo menos 1 maquinário foi selecionado
      if (maquinariosSelecionados.length === 0) {
        setErroMensagem('Selecione pelo menos 1 maquinário')
        return
      }

      // Atualizar relatório
      await updateRelatorioDiario(id, {
        cliente_id: data.cliente_id,
        obra_id: data.obra_id,
        rua_id: data.rua_id,
        equipe_id: data.equipe_id,
        tipo_equipe: tipoEquipe,
        equipe_is_terceira: equipeIsTerceira,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        horario_inicio: data.horario_inicio,
        metragem_feita: data.metragem_feita,
        toneladas_aplicadas: data.toneladas_aplicadas,
        observacoes: data.observacoes
      })

      toast.success('Relatório atualizado com sucesso!')
      setSucessoMensagem('Relatório atualizado com sucesso!')
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/relatorios-diarios')
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao atualizar relatório:', error)
      setErroMensagem(error.message || 'Erro ao atualizar relatório')
      toast.error(error.message || 'Erro ao atualizar relatório')
    } finally {
      setLoading(false)
    }
  }

  if (loadingRelatorio) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Carregando relatório...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/relatorios-diarios')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Relatório Diário</h1>
            <p className="text-gray-600 mt-1">Atualize os dados do relatório</p>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {sucessoMensagem && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5" />
            <p>{sucessoMensagem}</p>
          </div>
        )}

        {erroMensagem && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p>{erroMensagem}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção 1: Informações da Obra */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Obra</h2>

            <SelecionarClienteObraRua
              onClienteChange={(clienteId) => setValue('cliente_id', clienteId)}
              onObraChange={(obraId) => setValue('obra_id', obraId)}
              onRuaChange={(ruaId) => setValue('rua_id', ruaId)}
              selectedClienteId={watch('cliente_id')}
              selectedObraId={watch('obra_id')}
              selectedRuaId={watch('rua_id')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Data Início *
                </label>
                <DatePicker
                  value={dataInicio}
                  onChange={(date) => setValue('data_inicio', date)}
                  placeholder="Selecione a data"
                />
                {errors.data_inicio && (
                  <p className="text-sm text-red-600">{errors.data_inicio.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Data Fim (Opcional)
                </label>
                <DatePicker
                  value={dataFim}
                  onChange={(date) => setValue('data_fim', date)}
                  placeholder="Selecione a data"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Horário de Início *
                </label>
                <Input
                  {...register('horario_inicio')}
                  type="time"
                  placeholder="00:00"
                />
                {errors.horario_inicio && (
                  <p className="text-sm text-red-600">{errors.horario_inicio.message}</p>
                )}
              </div>
            </div>

            {/* Equipe */}
            <div className="mt-4">
              <EquipeSelector
                equipeId={watch('equipe_id') || ''}
                onChange={(equipeId, isTerceira, tipoEquipeValue) => {
                  setValue('equipe_id', equipeId)
                  setEquipeIsTerceira(isTerceira)
                  setTipoEquipe(tipoEquipeValue || '')
                }}
              />
            </div>
          </div>

          {/* Seção 2: Metragem, Toneladas e Faixa */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metragem, Toneladas e Faixa</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Metragem Feita (m²) *
                </label>
                <Input
                  {...register('metragem_feita', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.metragem_feita && (
                  <p className="text-sm text-red-600">{errors.metragem_feita.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Toneladas Aplicadas *
                </label>
                <Input
                  {...register('toneladas_aplicadas', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.toneladas_aplicadas && (
                  <p className="text-sm text-red-600">{errors.toneladas_aplicadas.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Faixa Utilizada
                </label>
                <Select
                  value={watch('faixa_utilizada') || ''}
                  onChange={(value) => setValue('faixa_utilizada', value)}
                  options={[
                    { value: '', label: 'Selecione a faixa' },
                    ...Object.entries(faixaAsfaltoLabels).map(([value, label]) => ({
                      value,
                      label
                    }))
                  ]}
                  placeholder="Selecione a faixa"
                />
              </div>
            </div>

            {/* Calculadora de Espessura */}
            <CalculadoraEspessura
              metragem={metragem}
              toneladas={toneladas}
              espessuraCalculada={espessuraCalculada}
            />
          </div>

          {/* Seção 3: Maquinários */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Maquinários Utilizados</h2>
            <MaquinariosSelector
              maquinariosSelecionados={maquinariosSelecionados}
              onMaquinariosChange={setMaquinariosSelecionados}
            />
          </div>

          {/* Observações */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Observações</h2>
            <textarea
              {...register('observacoes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adicione observações sobre o trabalho realizado (opcional)..."
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/relatorios-diarios')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default EditarRelatorioDiario


