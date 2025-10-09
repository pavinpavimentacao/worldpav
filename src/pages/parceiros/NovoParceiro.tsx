import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/Select'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { createParceiro } from '../../lib/parceirosApi'
import { NichoParceiro, nichoLabels } from '../../types/parceiros'

// Schema de validação
const parceiroSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  nicho: z.string().min(1, 'Nicho é obrigatório'),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cnpj: z.string().optional()
})

type ParceiroFormData = z.infer<typeof parceiroSchema>

export function NovoParceiro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [sucessoMensagem, setSucessoMensagem] = useState('')
  const [erroMensagem, setErroMensagem] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ParceiroFormData>({
    resolver: zodResolver(parceiroSchema)
  })

  async function onSubmit(data: ParceiroFormData) {
    try {
      setLoading(true)
      setErroMensagem('')
      setSucessoMensagem('')

      const novoParceiro = await createParceiro({
        nome: data.nome,
        nicho: data.nicho as NichoParceiro,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        cnpj: data.cnpj,
        ativo: true
      })

      setSucessoMensagem(`Parceiro ${novoParceiro.nome} criado com sucesso!`)

      setTimeout(() => {
        navigate(`/parceiros/${novoParceiro.id}`)
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao criar parceiro:', error)
      setErroMensagem(error.message || 'Erro ao criar parceiro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/parceiros')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Parceiro</h1>
            <p className="text-gray-600 mt-1">
              Cadastre uma nova usina ou empreiteiro parceiro
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

              <Select
                value={watch('nicho') || ''}
                onChange={(value) => setValue('nicho', value)}
                options={[
                  { value: '', label: 'Selecione o nicho' },
                  { value: 'usina_asfalto', label: nichoLabels.usina_asfalto },
                  { value: 'usina_rr2c', label: nichoLabels.usina_rr2c },
                  { value: 'empreiteiro', label: nichoLabels.empreiteiro }
                ]}
                label="Nicho do Parceiro"
                placeholder="Selecione o nicho"
                required
              />

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


          {/* Ações */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-lg border border-gray-200 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/parceiros')}
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
              {loading ? 'Salvando...' : 'Salvar Parceiro'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default NovoParceiro

