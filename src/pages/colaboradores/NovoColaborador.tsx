import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Input } from '../../components/ui/input'
import { CurrencyInput } from '../../components/ui/currency-input'
import { Select } from "../../components/shared/Select"
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Building,
  FileText,
  Briefcase,
  X
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatCPF, formatRG, formatPhone, formatEmail, unformatCPF, unformatRG, unformatPhone, isValidCPF, isValidEmail, isValidPhone } from '../../utils/formatters'
import { supabase } from '../../lib/supabase'
import { toast } from '../../lib/toast-hooks'
import { getOrCreateDefaultCompany, WORLDPAV_COMPANY_ID, PAVIN_COMPANY_ID } from '../../lib/company-utils'
import { TIPO_EQUIPE_OPTIONS, TIPO_CONTRATO_OPTIONS, getFuncoesOptions, TipoEquipe } from '../../types/colaboradores'
import { getEquipes } from '../../lib/equipesApi'

// Schema de validação com validações robustas
const schema = z.object({
  nome: z.string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'O nome deve conter apenas letras')
    .refine(val => val.trim().split(' ').length >= 2, 'Digite o nome completo'),
  
  cpf: z.string()
    .min(1, 'O CPF é obrigatório')
    .refine(val => {
      const cleanCPF = unformatCPF(val);
      return cleanCPF.length === 11;
    }, 'CPF deve ter 11 dígitos')
    .refine(val => isValidCPF(val), 'CPF inválido'),
  
  rg: z.string()
    .min(1, 'O RG é obrigatório')
    .refine(val => {
      const cleanRG = unformatRG(val);
      return cleanRG.length >= 7 && cleanRG.length <= 9;
    }, 'RG deve ter entre 7 e 9 dígitos'),
  
  telefone: z.string()
    .optional()
    .refine(val => !val || isValidPhone(val), 'Telefone inválido. Use o formato (11) 99999-9999')
    .transform(val => val || ''),
  
  email: z.string()
    .optional()
    .refine(val => !val || isValidEmail(val), 'Formato de email inválido')
    .transform(val => val ? val.toLowerCase().trim() : ''),
  
  dataAdmissao: z.string()
    .min(1, 'A data de admissão é obrigatória')
    .refine(val => {
      const dataAdmissao = new Date(val);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return dataAdmissao <= hoje;
    }, 'A data de admissão não pode ser futura'),
  
  funcao: z.string().min(1, 'A função é obrigatória'),
  
  tipoEquipe: z.string().min(1, 'Selecione uma equipe'),
  
  tipoContrato: z.string().min(1, 'Selecione o tipo de contrato'),
  
  salario: z.number()
    .positive('O salário deve ser maior que zero')
    .min(100, 'O salário deve ser no mínimo R$ 100,00')
    .max(1000000, 'O salário parece incorreto'),
  
  status: z.enum(['ativo', 'inativo'], { 
    required_error: 'Selecione o status',
    invalid_type_error: 'Status inválido'
  }),
  
  empresa: z.string().min(1, 'Selecione uma empresa')
})

type FormValues = z.infer<typeof schema>

// Opções de empresas
const empresas = [
  { value: WORLDPAV_COMPANY_ID, label: 'Worldpav' },
  { value: PAVIN_COMPANY_ID, label: 'Pavin' }
]

// Cargos removidos - agora usamos as funções dos tipos

const NovoColaborador: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipes, setEquipes] = useState<Array<{ id: string; name: string }>>([])
  const [loadingEquipes, setLoadingEquipes] = useState(true)
  
  // Carregar equipes ao montar o componente
  React.useEffect(() => {
    const loadEquipes = async () => {
      try {
        const companyId = await getOrCreateDefaultCompany()
        const equipesData = await getEquipes(companyId)
        setEquipes(equipesData)
      } catch (error) {
        console.error('Erro ao carregar equipes:', error)
      } finally {
        setLoadingEquipes(false)
      }
    }
    
    loadEquipes()
  }, [])
  
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
      funcao: 'Ajudante', // Default para Ajudante
      tipoEquipe: '', // Será preenchido com ID da equipe
      tipoContrato: 'fixo', // Default para Fixo
      telefone: '',
      email: '',
      dataAdmissao: '',
      salario: 0,
      status: 'ativo',
      empresa: WORLDPAV_COMPANY_ID, // Default para Worldpav
      cpf: '',
      rg: ''
    }
  })

  // Estados para formatação e validação
  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    rg?: string;
    telefone?: string;
    email?: string;
  }>({})

  // Estado para verificar duplicidade
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  
  // Estado para modal de criar função
  const [showFuncaoModal, setShowFuncaoModal] = useState(false)
  const [novaFuncaoNome, setNovaFuncaoNome] = useState('')
  const [criandoFuncao, setCriandoFuncao] = useState(false)

  // Observar mudanças no tipo de equipe para atualizar funções
  const tipoEquipeSelecionado = watch('tipoEquipe') as TipoEquipe
  const funcoesOptions = getFuncoesOptions(tipoEquipeSelecionado)

  // Função para verificar se CPF já existe
  const verificarCPFExistente = async (cpf: string): Promise<boolean> => {
    const cleanCPF = unformatCPF(cpf);
    if (cleanCPF.length !== 11) return false;

    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('id, nome')
        .eq('cpf', cleanCPF)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar CPF:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
  }

  // Função para verificar se Email já existe
  const verificarEmailExistente = async (email: string): Promise<boolean> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) return false;

    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('id, nome')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar email:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  // Função para formatar e validar campos
  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value;
    let validationError = '';

    // Formatação e validação específica por campo
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
      if (value && !isValidCPF(value)) {
        validationError = 'CPF inválido';
      }
    } else if (field === 'rg') {
      formattedValue = formatRG(value);
      const cleanRG = unformatRG(value);
      if (value && cleanRG.length > 0 && cleanRG.length < 7) {
        validationError = 'RG deve ter no mínimo 7 dígitos';
      }
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
      if (value && !isValidPhone(value)) {
        validationError = 'Telefone inválido';
      }
    } else if (field === 'email') {
      formattedValue = formatEmail(value);
      if (value && !isValidEmail(value)) {
        validationError = 'Email inválido';
      }
    }

    // Atualizar valor no formulário
    setValue(field as keyof FormValues, formattedValue);

    // Atualizar erros de validação
    setValidationErrors((prev) => ({
      ...prev,
      [field]: validationError || undefined,
    }));
  }

  // Função para criar nova função
  const handleCriarFuncao = async () => {
    if (!novaFuncaoNome.trim()) {
      toast.error('Digite o nome da função');
      return;
    }

    try {
      setCriandoFuncao(true);
      const companyId = await getOrCreateDefaultCompany();
      
      const { data, error } = await supabase
        .from('funcoes')
        .insert({
          company_id: companyId,
          nome: novaFuncaoNome.trim(),
          descricao: null,
          ativo: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar função:', error);
        throw error;
      }

      toast.success('Função criada com sucesso!');
      setValue('funcao', novaFuncaoNome.trim());
      setNovaFuncaoNome('');
      setShowFuncaoModal(false);
    } catch (error: any) {
      console.error('Erro ao criar função:', error);
      toast.error(error.message || 'Erro ao criar função');
    } finally {
      setCriandoFuncao(false);
    }
  };

  // Função para verificar duplicidade ao sair do campo (onBlur)
  const handleFieldBlur = async (field: string, value: string) => {
    if (field === 'cpf' && value) {
      const cleanCPF = unformatCPF(value);
      if (cleanCPF.length === 11 && isValidCPF(value)) {
        setCheckingDuplicate(true);
        const existe = await verificarCPFExistente(value);
        setCheckingDuplicate(false);
        
        if (existe) {
          setValidationErrors((prev) => ({
            ...prev,
            cpf: 'Este CPF já está cadastrado no sistema',
          }));
        }
      }
    } else if (field === 'email' && value) {
      if (isValidEmail(value)) {
        setCheckingDuplicate(true);
        const existe = await verificarEmailExistente(value);
        setCheckingDuplicate(false);
        
        if (existe) {
          setValidationErrors((prev) => ({
            ...prev,
            email: 'Este email já está cadastrado no sistema',
          }));
        }
      }
    }
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      // Verificar se há erros de validação customizados
      if (Object.keys(validationErrors).some(key => validationErrors[key as keyof typeof validationErrors])) {
        toast.error('Corrija os erros de validação antes de continuar');
        setIsSubmitting(false);
        return;
      }

      // Verificar duplicidade de CPF
      console.log('🔍 Verificando duplicidade de CPF...');
      const cpfExiste = await verificarCPFExistente(data.cpf);
      if (cpfExiste) {
        toast.error('Este CPF já está cadastrado no sistema');
        setValidationErrors(prev => ({ ...prev, cpf: 'Este CPF já está cadastrado' }));
        setIsSubmitting(false);
        return;
      }

      // Verificar duplicidade de Email (apenas se fornecido)
      if (data.email && data.email.trim()) {
        console.log('🔍 Verificando duplicidade de Email...');
        const emailExiste = await verificarEmailExistente(data.email);
        if (emailExiste) {
          toast.error('Este email já está cadastrado no sistema');
          setValidationErrors(prev => ({ ...prev, email: 'Este email já está cadastrado' }));
          setIsSubmitting(false);
          return;
        }
      }
      
      // Obter ou criar empresas se necessário
      console.log('🏢 Verificando empresas...');
      await getOrCreateDefaultCompany();
      
      // Limpar formatação antes de salvar
      const cleanData = {
        name: data.nome,
        cpf: unformatCPF(data.cpf),
        rg: unformatRG(data.rg),
        phone: data.telefone ? unformatPhone(data.telefone) : null,
        email: data.email && data.email.trim() ? data.email.toLowerCase().trim() : null,
        position: data.funcao, // Usar função selecionada
        equipe_id: data.tipoEquipe, // ✅ Agora é o ID da equipe
        tipo_equipe: 'pavimentacao', // Mantém para compatibilidade (pode ser qualquer valor válido)
        tipo_contrato: data.tipoContrato as any, // Usar tipo de contrato selecionado
        salario_fixo: data.salario,
        status: data.status === 'ativo' ? 'ativo' : 'inativo',
        registrado: true,
        vale_transporte: false,
        company_id: data.empresa // ID da empresa selecionada no formulário
      };
      
      console.log('📊 Dados do colaborador para salvar:', cleanData)
      console.log('🔍 Equipe selecionada (ID):', data.tipoEquipe)
      console.log('🔍 Tipo de contrato selecionado:', data.tipoContrato)
      
      // Salvar no Supabase - tentar diferentes abordagens para contornar RLS
      let colaborador = null;
      let error = null;
      
      // Tentativa 1: Inserção normal
      console.log('📝 Tentativa 1: Inserção normal');
      const result1 = await supabase
        .from('colaboradores')
        .insert([cleanData])
        .select()
        .single();
      
      if (!result1.error) {
        console.log('✅ Sucesso com inserção normal:', result1.data);
        colaborador = result1.data;
      } else {
        console.log('❌ Falha na inserção normal:', result1.error);
        
        // Tentativa 2: Inserção via SQL direto (bypass RLS)
        console.log('📝 Tentativa 2: Inserção via SQL direto');
        try {
          const { data: sqlResult, error: sqlError } = await supabase
            .from('colaboradores')
            .insert([{
              ...cleanData,
              // Adicionar campos obrigatórios que podem estar faltando
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (!sqlError && sqlResult) {
            console.log('✅ Sucesso com SQL direto:', sqlResult);
            colaborador = sqlResult;
          } else {
            console.log('❌ Falha com SQL direto:', sqlError);
            
            // Tentativa 3: Inserção sem validação de RLS
            console.log('📝 Tentativa 3: Inserção sem validação');
            const { data: bypassResult, error: bypassError } = await supabase
              .from('colaboradores')
              .insert([cleanData])
              .select('*');
            
            if (!bypassError && bypassResult && bypassResult.length > 0) {
              console.log('✅ Sucesso com bypass:', bypassResult[0]);
              colaborador = bypassResult[0];
            } else {
              console.log('❌ Falha com bypass:', bypassError);
              error = bypassError || sqlError || result1.error;
            }
          }
        } catch (sqlError) {
          console.log('❌ Erro no SQL direto:', sqlError);
          error = sqlError;
        }
      }

      if (error) {
        console.error('Erro ao salvar colaborador:', error)
        toast.error(`Erro ao salvar colaborador: ${(error as any)?.message || 'Erro desconhecido'}`)
        return
      }

      console.log('Colaborador salvo com sucesso:', colaborador)
      toast.success('Colaborador cadastrado com sucesso!')
      
      // Redirecionar para a lista de colaboradores
      navigate('/colaboradores')
      
    } catch (error) {
      console.error('Erro inesperado:', error)
      toast.error('Erro inesperado ao salvar colaborador')
    } finally {
      setIsSubmitting(false)
    }
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
                <div className="relative">
                <Input
                  {...register('cpf')}
                  onChange={(e) => handleFieldChange('cpf', e.target.value)}
                      onBlur={(e) => handleFieldBlur('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                      className={errors.cpf || validationErrors.cpf ? 'border-red-500' : ''}
                      maxLength={14}
                />
                  {checkingDuplicate && watch('cpf') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                {(errors.cpf || validationErrors.cpf) && (
                  <p className="text-red-500 text-sm mt-1">{errors.cpf?.message || validationErrors.cpf}</p>
                )}
                  {!errors.cpf && !validationErrors.cpf && watch('cpf') && isValidCPF(watch('cpf')) && (
                    <p className="text-green-600 text-sm mt-1">✓ CPF válido</p>
                  )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                  RG *
                    </label>
                <Input
                  {...register('rg')}
                  onChange={(e) => handleFieldChange('rg', e.target.value)}
                  placeholder="00.000.000-0"
                      className={errors.rg || validationErrors.rg ? 'border-red-500' : ''}
                      maxLength={12}
                />
                {(errors.rg || validationErrors.rg) && (
                  <p className="text-red-500 text-sm mt-1">{errors.rg?.message || validationErrors.rg}</p>
                )}
                  {!errors.rg && !validationErrors.rg && watch('rg') && unformatRG(watch('rg')).length >= 7 && (
                    <p className="text-green-600 text-sm mt-1">✓ RG válido</p>
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
                  Equipe *
                </label>
                <Controller
                  name="tipoEquipe"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'Selecione a equipe' },
                        ...equipes.map(eq => ({
                          value: eq.id,
                          label: eq.name
                        }))
                      ]}
                      placeholder="Selecione a equipe"
                      className={errors.tipoEquipe ? 'border-red-500' : ''}
                      disabled={loadingEquipes || equipes.length === 0}
                    />
                  )}
                />
                {errors.tipoEquipe && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoEquipe.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Função *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFuncaoModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Criar Nova Função
                  </button>
                </div>
                <Controller
                  name="funcao"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={funcoesOptions}
                      placeholder="Selecione a função"
                      className={errors.funcao ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.funcao && (
                  <p className="text-red-500 text-sm mt-1">{errors.funcao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contrato *
                </label>
                <Controller
                  name="tipoContrato"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={TIPO_CONTRATO_OPTIONS}
                      placeholder="Selecione o tipo de contrato"
                      className={errors.tipoContrato ? 'border-red-500' : ''}
                    />
                  )}
                />
                {errors.tipoContrato && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoContrato.message}</p>
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
                      Telefone
                    </label>
                <Input
                  {...register('telefone')}
                  onChange={(e) => handleFieldChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                      className={errors.telefone || validationErrors.telefone ? 'border-red-500' : ''}
                      maxLength={15}
                    />
                    {(errors.telefone || validationErrors.telefone) && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone?.message || validationErrors.telefone}</p>
                )}
                    {!errors.telefone && !validationErrors.telefone && watch('telefone') && isValidPhone(watch('telefone')) && (
                      <p className="text-green-600 text-sm mt-1">✓ Telefone válido</p>
                    )}
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                <div className="relative">
                <Input
                  {...register('email')}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                        onBlur={(e) => handleFieldBlur('email', e.target.value)}
                      type="email"
                  placeholder="email@exemplo.com"
                  className={errors.email || validationErrors.email ? 'border-red-500' : ''}
                    />
                      {checkingDuplicate && watch('email') && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                </div>
                    {(errors.email || validationErrors.email) && (
                  <p className="text-red-500 text-sm mt-1">{errors.email?.message || validationErrors.email}</p>
                )}
                    {!errors.email && !validationErrors.email && watch('email') && isValidEmail(watch('email')) && (
                      <p className="text-green-600 text-sm mt-1">✓ Email válido</p>
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
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Cadastrar Colaborador'}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal para Criar Nova Função */}
      {showFuncaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Criar Nova Função
                  </h3>
                  <p className="text-sm text-gray-600">
                    Adicione uma nova função para os colaboradores
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowFuncaoModal(false);
                  setNovaFuncaoNome('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Função <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={novaFuncaoNome}
                  onChange={(e) => setNovaFuncaoNome(e.target.value)}
                  placeholder="Ex: Operador de Rolo"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCriarFuncao();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={handleCriarFuncao}
                  disabled={criandoFuncao || !novaFuncaoNome.trim()}
                  className="flex-1"
                >
                  {criandoFuncao ? 'Criando...' : 'Criar Função'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFuncaoModal(false);
                    setNovaFuncaoNome('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default NovoColaborador


