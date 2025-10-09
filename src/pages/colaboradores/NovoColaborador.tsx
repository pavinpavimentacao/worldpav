import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Input } from '../../components/ui/input'
import { CurrencyInput } from '../../components/ui/currency-input'
import { Select } from '../../components/Select'
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  Building,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Schema de validação
const schema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  cargo: z.string().min(1, 'O cargo é obrigatório'),
  telefone: z.string().min(1, 'O telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  endereco: z.string().min(1, 'O endereço é obrigatório'),
  dataAdmissao: z.string().min(1, 'A data de admissão é obrigatória'),
  salario: z.number().min(0, 'O salário deve ser maior que 0'),
  status: z.enum(['ativo', 'inativo'], { required_error: 'Selecione o status' }),
  empresa: z.string().min(1, 'A empresa é obrigatória'),
  cpf: z.string().min(1, 'O CPF é obrigatório'),
  rg: z.string().min(1, 'O RG é obrigatório')
})

type FormValues = z.infer<typeof schema>

// Mock data para empresas
const empresas = [
  { value: 'Pavin', label: 'Pavin' }
]

const cargos = [
  { value: 'Operador de Máquina', label: 'Operador de Máquina' },
  { value: 'Supervisora', label: 'Supervisora' },
  { value: 'Motorista', label: 'Motorista' },
  { value: 'Ajudante', label: 'Ajudante' },
  { value: 'Encarregado', label: 'Encarregado' }
]

const NovoColaborador: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      cargo: '',
      telefone: '',
      email: '',
      endereco: '',
      dataAdmissao: '',
      salario: 0,
      status: 'ativo',
      empresa: 'Pavin',
      cpf: '',
      rg: ''
    }
  })

  const onSubmit = (data: FormValues) => {
    console.log('Dados do colaborador:', data)
    // Aqui você implementaria a lógica para salvar o colaborador
    alert('Colaborador cadastrado com sucesso!')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/colaboradores">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Novo Colaborador
              </h1>
              <p className="text-gray-600 mt-1">
                Cadastre um novo colaborador no sistema
            </p>
          </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção: Dados Pessoais */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Dados Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                <Input
                  {...register('nome')}
                  placeholder="Digite o nome completo"
                  className={errors.nome ? 'border-red-500' : ''}
                    />
                    {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF *
                    </label>
                <Input
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  className={errors.cpf ? 'border-red-500' : ''}
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf.message}</p>
                )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG *
                    </label>
                <Input
                  {...register('rg')}
                  placeholder="00.000.000-0"
                  className={errors.rg ? 'border-red-500' : ''}
                />
                {errors.rg && (
                  <p className="text-red-500 text-sm mt-1">{errors.rg.message}</p>
                )}
              </div>

                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Admissão *
                </label>
                <Input
                  {...register('dataAdmissao')}
                  type="date"
                  className={errors.dataAdmissao ? 'border-red-500' : ''}
                />
                {errors.dataAdmissao && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataAdmissao.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Dados Profissionais */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Dados Profissionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                    </label>
              <Controller
                name="cargo"
                control={control}
                render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={cargos}
                      placeholder="Selecione o cargo"
                      className={errors.cargo ? 'border-red-500' : ''}
                    />
                  )}
                />
                    {errors.cargo && (
                  <p className="text-red-500 text-sm mt-1">{errors.cargo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
              <Controller
                  name="empresa"
                control={control}
                render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={empresas}
                      placeholder="Selecione a empresa"
                      className={errors.empresa ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.empresa && (
                  <p className="text-red-500 text-sm mt-1">{errors.empresa.message}</p>
                )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salário *
                    </label>
              <Controller
                name="salario"
                control={control}
                render={({ field }) => (
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="R$ 0,00"
                      className={errors.salario ? 'border-red-500' : ''}
                    />
                  )}
                    />
                    {errors.salario && (
                  <p className="text-red-500 text-sm mt-1">{errors.salario.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'ativo', label: 'Ativo' },
                        { value: 'inativo', label: 'Inativo' }
                      ]}
                      placeholder="Selecione o status"
                      className={errors.status ? 'border-red-500' : ''}
                    />
                  )}
                />
                    {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Dados de Contato */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Dados de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                <Input
                  {...register('telefone')}
                  placeholder="(11) 99999-9999"
                  className={errors.telefone ? 'border-red-500' : ''}
                    />
                    {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                <Input
                  {...register('email')}
                      type="email"
                  placeholder="email@exemplo.com"
                  className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
          </div>

              <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço *
                    </label>
                <Input
                  {...register('endereco')}
                  placeholder="Rua, número, bairro, cidade/estado"
                  className={errors.endereco ? 'border-red-500' : ''}
                />
                {errors.endereco && (
                  <p className="text-red-500 text-sm mt-1">{errors.endereco.message}</p>
                    )}
                  </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Link to="/colaboradores">
              <Button type="button" variant="outline">
              Cancelar
            </Button>
            </Link>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Colaborador
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default NovoColaborador


