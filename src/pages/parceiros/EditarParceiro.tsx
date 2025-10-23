import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
import { Select } from "../../components/shared/Select"
import { ArrowLeft, Save, AlertCircle, CheckCircle, X, Plus, Trash2 } from 'lucide-react'
import { getParceiroById } from '../../lib/parceirosApi'
import { 
  ParceiroCompleto, 
  NichoParceiro, 
  nichoLabels, 
  FaixaAsfalto, 
  faixaAsfaltoLabels,
  PrecoFaixa 
} from '../../types/parceiros'

// Schema de validação
const parceiroSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nicho: z.string().min(1, 'Nicho é obrigatório'),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cnpj: z.string().optional(),
  capacidade_tanque: z.number().optional()
})

type ParceiroFormData = z.infer<typeof parceiroSchema>

export function EditarParceiro() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucessoMensagem, setSucessoMensagem] = useState('')
  const [erroMensagem, setErroMensagem] = useState('')
  const [parceiro, setParceiro] = useState<ParceiroCompleto | null>(null)
  
  // Estados para usina de asfalto
  const [precosFaixas, setPrecosFaixas] = useState<PrecoFaixa[]>([])
  const [novaFaixa, setNovaFaixa] = useState<FaixaAsfalto | ''>('')
  const [novoPreco, setNovoPreco] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ParceiroFormData>({
    resolver: zodResolver(parceiroSchema)
  })

  useEffect(() => {
    if (id) {
      loadParceiro(id)
    }
  }, [id])

  async function loadParceiro(parceiroId: string) {
    try {
      setLoading(true)
      const data = await getParceiroById(parceiroId)
      setParceiro(data)
      
      // Preencher formulário
      setValue('nome', data.nome)
      setValue('nicho', data.nicho)
      setValue('contato', data.contato || '')
      setValue('telefone', data.telefone || '')
      setValue('email', data.email || '')
      setValue('endereco', data.endereco || '')
      setValue('cnpj', data.cnpj || '')
      
      if (data.nicho === 'usina_rr2c' && data.capacidade_tanque) {
        setValue('capacidade_tanque', data.capacidade_tanque)
      }
      
      if (data.nicho === 'usina_asfalto' && data.precos_faixas) {
        setPrecosFaixas(data.precos_faixas)
      }
    } catch (error) {
      console.error('Erro ao carregar parceiro:', error)
      setErroMensagem('Erro ao carregar dados do parceiro')
    } finally {
      setLoading(false)
    }
  }

  const nichoSelecionado = watch('nicho') as NichoParceiro

  // Funções para gerenciar faixas de asfalto
  const faixasDisponiveis = Object.entries(faixaAsfaltoLabels).filter(
    ([key]) => !precosFaixas.some(p => p.faixa === key)
  )

  function adicionarFaixa() {
    if (novaFaixa && novoPreco) {
      setPrecosFaixas([...precosFaixas, {
        faixa: novaFaixa as FaixaAsfalto,
        preco_tonelada: parseFloat(novoPreco)
      }])
      setNovaFaixa('')
      setNovoPreco('')
    }
  }

  function removerFaixa(faixa: FaixaAsfalto) {
    setPrecosFaixas(precosFaixas.filter(p => p.faixa !== faixa))
  }

  function atualizarPrecoFaixa(faixa: FaixaAsfalto, novoPreco: number) {
    setPrecosFaixas(precosFaixas.map(p => 
      p.faixa === faixa ? { ...p, preco_tonelada: novoPreco } : p
    ))
  }

  async function onSubmit(data: ParceiroFormData) {
    try {
      setSaving(true)
      setErroMensagem('')
      setSucessoMensagem('')

      const dadosAtualizados = {
        ...data,
        precos_faixas: nichoSelecionado === 'usina_asfalto' ? precosFaixas : undefined,
        capacidade_tanque: nichoSelecionado === 'usina_rr2c' ? data.capacidade_tanque : undefined
      }

      // TODO: Implementar API de atualização
      console.log('Dados atualizados:', dadosAtualizados)

      setSucessoMensagem('Parceiro atualizado com sucesso!')

      setTimeout(() => {
        navigate(`/parceiros/${id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao atualizar parceiro:', error)
      setErroMensagem(error.message || 'Erro ao atualizar parceiro. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Carregando dados do parceiro...</p>
        </div>
      </Layout>
    )
  }

  if (!parceiro) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-500">Parceiro não encontrado</p>
          <Button onClick={() => navigate('/parceiros')} className="mt-4">
            Voltar para Listagem
          </Button>
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
            onClick={() => navigate(`/parceiros/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Parceiro</h1>
            <p className="text-gray-600 mt-1">
              Atualize as informações de {parceiro.nome}
            </p>
          </div>
        </div>

        {/* Mensagens */}
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
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Básicas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Nome do Parceiro"
                  placeholder="Ex: Usina Central Asfalto"
                  {...register('nome')}
                  error={errors.nome?.message}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nicho do Parceiro
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {nichoLabels[parceiro.nicho]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    O nicho do parceiro não pode ser alterado
                  </p>
                </div>
              </div>

              <Input
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                {...register('cnpj')}
                error={errors.cnpj?.message}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados de Contato</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Contato"
                placeholder="Ex: João Silva"
                {...register('contato')}
                error={errors.contato?.message}
              />

              <Input
                label="Telefone"
                placeholder="(11) 98765-4321"
                {...register('telefone')}
                error={errors.telefone?.message}
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="contato@empresa.com.br"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Endereço"
                placeholder="Rua, número - Cidade/UF"
                {...register('endereco')}
                error={errors.endereco?.message}
              />
            </div>
          </div>

          {/* Campos específicos para Usina de Asfalto */}
          {nichoSelecionado === 'usina_asfalto' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tabela de Preços por Faixa</h2>

              {/* Faixas existentes */}
              {precosFaixas.length > 0 && (
                <div className="space-y-3 mb-6">
                  {precosFaixas.map((item) => (
                    <div key={item.faixa} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.faixa.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.preco_tonelada}
                        onChange={(e) => atualizarPrecoFaixa(item.faixa, parseFloat(e.target.value))}
                        className="w-32"
                        placeholder="R$"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removerFaixa(item.faixa)}
                        className="gap-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar nova faixa */}
              {faixasDisponiveis.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-3">Adicionar Nova Faixa</p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Select
                        value={novaFaixa}
                        onChange={(value) => setNovaFaixa(value as FaixaAsfalto)}
                        options={[
                          { value: '', label: 'Selecione a faixa' },
                          ...faixasDisponiveis.map(([key, label]) => ({
                            value: key,
                            label: label
                          }))
                        ]}
                        label="Faixa"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Preço (R$/ton)"
                        type="number"
                        step="0.01"
                        value={novoPreco}
                        onChange={(e) => setNovoPreco(e.target.value)}
                        placeholder="380.00"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={adicionarFaixa}
                      disabled={!novaFaixa || !novoPreco}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campos específicos para Usina RR2C */}
          {nichoSelecionado === 'usina_rr2c' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Usina RR2C</h2>

              <Input
                label="Capacidade do Estoque (kg)"
                type="number"
                step="1"
                {...register('capacidade_tanque', { valueAsNumber: true })}
                error={errors.capacidade_tanque?.message}
                placeholder="8000"
              />
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/parceiros/${id}`)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={saving}
            >
              <Save className="h-5 w-5" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default EditarParceiro


