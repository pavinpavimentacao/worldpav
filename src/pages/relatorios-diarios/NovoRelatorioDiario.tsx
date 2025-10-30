import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { createRelatorioDiario, finalizarRua, criarFaturamentoRua } from '../../lib/relatoriosDiariosApi'
import { validarDataNaoFutura, validarEspessura } from '../../utils/relatorios-diarios-utils'
import { FaixaAsfalto, faixaAsfaltoLabels, faixaAsfaltoDescricoes } from '../../types/parceiros'
import { Select } from "../../components/shared/Select"

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

export function NovoRelatorioDiario() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [equipeIsTerceira, setEquipeIsTerceira] = useState(false)
  const [tipoEquipe, setTipoEquipe] = useState<string>('') // ✅ Adicionar estado para tipo_equipe
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

  async function onSubmit(data: RelatorioFormData) {
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

      // Criar relatório
      const relatorio = await createRelatorioDiario({
        cliente_id: data.cliente_id,
        obra_id: data.obra_id,
        rua_id: data.rua_id,
        equipe_id: data.equipe_id,
        tipo_equipe: tipoEquipe, // ✅ Incluir tipo_equipe
        equipe_is_terceira: equipeIsTerceira,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        horario_inicio: data.horario_inicio,
        metragem_feita: data.metragem_feita,
        toneladas_aplicadas: data.toneladas_aplicadas,
        observacoes: data.observacoes,
        maquinarios: maquinariosSelecionados.map(id => ({
          id,
          is_terceiro: false, // TODO: Verificar se é terceiro
          parceiro_id: undefined
        }))
      })

      // Finalizar rua (comentado - o trigger já faz isso automaticamente)
      // await finalizarRua(
      //   data.rua_id,
      //   relatorio.id,
      //   data.data_fim || data.data_inicio,
      //   data.metragem_feita,
      //   data.toneladas_aplicadas
      // )

      // Criar faturamento (assumindo R$ 25/m² como padrão - TODO: buscar da obra)
      await criarFaturamentoRua(
        data.obra_id,
        data.rua_id,
        data.metragem_feita,
        25
      )

      setSucessoMensagem(
        `Relatório ${relatorio.numero} criado com sucesso! Rua finalizada e faturamento gerado.`
      )

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/relatorios-diarios/${relatorio.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Erro ao criar relatório:', error)
      setErroMensagem(error.message || 'Erro ao criar relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">Novo Relatório Diário</h1>
            <p className="text-gray-600 mt-1">
              Preencha os dados do trabalho realizado
            </p>
          </div>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {sucessoMensagem && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Sucesso!</p>
              <p className="text-sm text-green-700 mt-1">{sucessoMensagem}</p>
            </div>
          </div>
        )}

        {erroMensagem && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Erro</p>
              <p className="text-sm text-red-700 mt-1">{erroMensagem}</p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção 1: Informações da Obra */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Obra</h2>

            <div className="space-y-4">
              {/* Cliente, Obra, Rua */}
              <SelecionarClienteObraRua
                clienteId={watch('cliente_id') || ''}
                obraId={watch('obra_id') || ''}
                ruaId={watch('rua_id') || ''}
                onClienteChange={(value) => setValue('cliente_id', value)}
                onObraChange={(value) => setValue('obra_id', value)}
                onRuaChange={(value) => setValue('rua_id', value)}
              />
              {(errors.cliente_id || errors.obra_id || errors.rua_id) && (
                <p className="text-sm text-red-600">
                  {errors.cliente_id?.message || errors.obra_id?.message || errors.rua_id?.message}
                </p>
              )}

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePicker
                  value={dataInicio || ''}
                  onChange={(value) => setValue('data_inicio', value)}
                  label="Data Início"
                  placeholder="Selecione a data"
                  required
                />

                <DatePicker
                  value={dataFim || ''}
                  onChange={(value) => setValue('data_fim', value)}
                  label="Data Fim (Opcional)"
                  placeholder="Selecione a data"
                  minDate={dataInicio}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Horário de Início <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    {...register('horario_inicio')}
                    className={errors.horario_inicio ? 'border-red-500' : ''}
                  />
                  {errors.horario_inicio && (
                    <p className="text-sm text-red-600">{errors.horario_inicio.message}</p>
                  )}
                </div>
              </div>

              {/* Equipe */}
              <EquipeSelector
                equipeId={watch('equipe_id') || ''}
                onChange={(equipeId, isTerceira, tipoEquipe) => {
                  setValue('equipe_id', equipeId)
                  setEquipeIsTerceira(isTerceira)
                  setTipoEquipe(tipoEquipe || '') // ✅ Salvar tipo_equipe
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
                  Metragem Feita (m²) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('metragem_feita', { valueAsNumber: true })}
                  className={errors.metragem_feita ? 'border-red-500' : ''}
                  placeholder="Ex: 450.00"
                />
                {errors.metragem_feita && (
                  <p className="text-sm text-red-600">{errors.metragem_feita.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Toneladas Aplicadas <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('toneladas_aplicadas', { valueAsNumber: true })}
                  className={errors.toneladas_aplicadas ? 'border-red-500' : ''}
                  placeholder="Ex: 45.00"
                />
                {errors.toneladas_aplicadas && (
                  <p className="text-sm text-red-600">{errors.toneladas_aplicadas.message}</p>
                )}
              </div>

              <div>
                <Select
                  value={watch('faixa_utilizada') || ''}
                  onChange={(value) => setValue('faixa_utilizada', value)}
                  options={[
                    { value: '', label: 'Selecione a faixa' },
                    ...Object.entries(faixaAsfaltoLabels).map(([key, label]) => ({
                      value: key,
                      label: label
                    }))
                  ]}
                  label="Faixa Utilizada"
                  placeholder="Selecione a faixa de asfalto"
                />
                {watch('faixa_utilizada') && (
                  <p className="text-xs text-gray-500 mt-1">
                    {faixaAsfaltoDescricoes[watch('faixa_utilizada') as FaixaAsfalto]}
                  </p>
                )}
              </div>
            </div>

            {/* Calculadora de Espessura */}
            <CalculadoraEspessura
              metragem={metragem}
              toneladas={toneladas}
              onChange={setEspessuraCalculada}
            />
          </div>

          {/* Seção 3: Maquinários */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Maquinários Utilizados</h2>
            <MaquinariosSelector
              maquinariosSelecionados={maquinariosSelecionados}
              onChange={setMaquinariosSelecionados}
            />
          </div>

          {/* Seção 4: Observações */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Observações</h2>
            <textarea
              {...register('observacoes')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adicione observações sobre o trabalho realizado (opcional)..."
            />
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/relatorios-diarios')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={loading}
            >
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : 'Salvar Relatório'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default NovoRelatorioDiario

