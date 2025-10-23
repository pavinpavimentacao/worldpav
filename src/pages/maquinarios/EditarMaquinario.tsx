import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Link, useParams } from 'react-router-dom'
import { Button } from "../../components/shared/Button"
import { PhotoUpload } from "../../components/shared/PhotoUpload"
import { ArrowLeft, Save, Settings, AlertCircle } from 'lucide-react'

// Tipos de maquinário pré-definidos com suas configurações
const tiposMaquinarioPredefinidos = [
  {
    nome: 'Caminhão Espargidor de Emulsão (Carrega a Cola)',
    funcao: 'Aplicação de emulsão asfáltica para imprimação e pintura de ligação',
    etapaUso: 'Pré-aplicação (Imprimação / Pintura de ligação)'
  },
  {
    nome: 'Vibroacabadora (Pavimentadora de Asfalto)',
    funcao: 'Aplicação de asfalto quente em camadas uniformes com vibração integrada',
    etapaUso: 'Aplicação (CBUQ / Pavimentação)'
  },
  {
    nome: 'Rolo Compactador Chapa (Chapa-Chapa)',
    funcao: 'Compactação inicial e final do asfalto aplicado',
    etapaUso: 'Compactação inicial'
  },
  {
    nome: 'Rolo Compactador Pneumático (Pneu-Pneu)',
    funcao: 'Compactação final e acabamento da superfície asfáltica',
    etapaUso: 'Compactação final'
  }
]

const etapasUso = [
  'Pré-aplicação (Imprimação / Pintura de ligação)',
  'Aplicação (CBUQ / Pavimentação)',
  'Compactação inicial',
  'Compactação final'
]

interface FormData {
  nome: string
  tipoMaquinario: string
  tipoPersonalizado: string
  funcao: string
  etapaUso: string
  observacoes: string
  foto: string | null
  operador: string
  operadorSecundario: string
  tipoOperadorSecundario: string
}

const EditarMaquinario = () => {
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    tipoMaquinario: '',
    tipoPersonalizado: '',
    funcao: '',
    etapaUso: '',
    observacoes: '',
    foto: null,
    operador: '',
    operadorSecundario: '',
    tipoOperadorSecundario: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simular carregamento dos dados do maquinário
  useEffect(() => {
    const loadMaquinario = async () => {
      setIsLoading(true)
      
      // Simular busca no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mock para demonstração - simular diferentes maquinários baseado no ID
      const maquinariosMock = {
        '1': {
          nome: 'Vibroacabadora CAT AP1055F',
          tipoMaquinario: 'Vibroacabadora (Pavimentadora de Asfalto)',
          tipoPersonalizado: '',
          funcao: 'Aplicação de asfalto quente em camadas uniformes com vibração integrada',
          etapaUso: 'Aplicação (CBUQ / Pavimentação)',
          observacoes: 'Equipamento principal para pavimentação de vias urbanas',
          foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH8lPk9uukiNplQ2sgoCUkBKkZ2WAfYIVaSA&s',
          operador: 'João Silva',
          operadorSecundario: 'Maria Santos',
          tipoOperadorSecundario: 'Mesista'
        },
        '2': {
          nome: 'Espargidor de Emulsão Volvo FMX',
          tipoMaquinario: 'Caminhão Espargidor de Emulsão (Carrega a Cola)',
          tipoPersonalizado: '',
          funcao: 'Aplicação de emulsão asfáltica para imprimação e pintura de ligação',
          etapaUso: 'Pré-aplicação (Imprimação / Pintura de ligação)',
          observacoes: 'Capacidade de 8.000L, sistema de aquecimento integrado',
          foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8BvdsKY0mP26GMVkvpBqdqQuw2bkX1IHeog&s',
          operador: 'Carlos Mendes',
          operadorSecundario: 'Ana Costa',
          tipoOperadorSecundario: 'Mangueirista'
        },
        '3': {
          nome: 'Rolo Compactador Chapa Dynapac CA2500',
          tipoMaquinario: 'Rolo Compactador Chapa (Chapa-Chapa)',
          tipoPersonalizado: '',
          funcao: 'Compactação inicial e final do asfalto aplicado',
          etapaUso: 'Compactação inicial',
          observacoes: 'Peso operacional de 10 toneladas',
          foto: 'https://www.ecivilnet.com/dicionario/images/rolo-compactador-tandem.jpg',
          operador: 'Pedro Santos',
          operadorSecundario: '',
          tipoOperadorSecundario: ''
        },
        '4': {
          nome: 'Rolo Pneumático Bomag BW213',
          tipoMaquinario: 'Rolo Compactador Pneumático (Pneu-Pneu)',
          tipoPersonalizado: '',
          funcao: 'Compactação final e acabamento da superfície asfáltica',
          etapaUso: 'Compactação final',
          observacoes: '8 pneus, sistema de vibração opcional',
          foto: 'https://tratorex.net/equipamentos/24G426/1.jpg',
          operador: 'Roberto Lima',
          operadorSecundario: '',
          tipoOperadorSecundario: ''
        }
      }
      
      setFormData(maquinariosMock[id as keyof typeof maquinariosMock] || maquinariosMock['1'])
      
      setIsLoading(false)
    }

    loadMaquinario()
  }, [id])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Se selecionou um tipo predefinido, preencher automaticamente
    if (field === 'tipoMaquinario' && value) {
      const tipoSelecionado = tiposMaquinarioPredefinidos.find(tipo => tipo.nome === value)
      if (tipoSelecionado) {
        setFormData(prev => ({
          ...prev,
          funcao: tipoSelecionado.funcao,
          etapaUso: tipoSelecionado.etapaUso
        }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do maquinário é obrigatório'
    }

    if (!formData.tipoMaquinario && !formData.tipoPersonalizado.trim()) {
      newErrors.tipoMaquinario = 'Tipo de maquinário é obrigatório'
    }

    if (!formData.funcao.trim()) {
      newErrors.funcao = 'Função/Descrição é obrigatória'
    }

    if (!formData.etapaUso) {
      newErrors.etapaUso = 'Etapa de uso é obrigatória'
    }

    if (!formData.operador.trim()) {
      newErrors.operador = 'Operador é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Aqui seria a chamada para a API
      console.log('Dados do maquinário atualizados:', {
        ...formData,
        tipo: formData.tipoMaquinario || formData.tipoPersonalizado
      })
      
      // Redirecionar para detalhes após sucesso
      window.location.href = `/maquinarios/${id}`
    } catch (error) {
      console.error('Erro ao atualizar maquinário:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <Link to="/maquinarios" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para Maquinários
            </Link>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Editar Maquinário
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Atualize as informações do equipamento de pavimentação.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                Informações do Maquinário
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Dados básicos e funcionais do equipamento.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 space-y-8">
              {/* Nome do Maquinário */}
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome do Maquinário *
                </label>
                <input
                  type="text"
                  id="nome"
                  className={`input py-3 px-4 ${errors.nome ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Vibroacabadora CAT AP1055F"
                />
                {errors.nome && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.nome}
                  </p>
                )}
              </div>

              {/* Tipo de Maquinário */}
              <div className="space-y-3">
                <label htmlFor="tipoMaquinario" className="block text-sm font-medium text-gray-700">
                  Tipo de Maquinário *
                </label>
                <select
                  id="tipoMaquinario"
                  className={`input py-3 px-4 ${errors.tipoMaquinario ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.tipoMaquinario}
                  onChange={(e) => handleInputChange('tipoMaquinario', e.target.value)}
                >
                  <option value="">Selecione um tipo predefinido</option>
                  {tiposMaquinarioPredefinidos.map((tipo) => (
                    <option key={tipo.nome} value={tipo.nome}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
                
                {/* Opção de tipo personalizado */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>ou</span>
                  </div>
                  <input
                    type="text"
                    className="input py-3 px-4"
                    placeholder="Digite um tipo personalizado"
                    value={formData.tipoPersonalizado}
                    onChange={(e) => handleInputChange('tipoPersonalizado', e.target.value)}
                  />
                </div>
                
                {errors.tipoMaquinario && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tipoMaquinario}
                  </p>
                )}
              </div>

              {/* Função / Descrição */}
              <div className="space-y-2">
                <label htmlFor="funcao" className="block text-sm font-medium text-gray-700">
                  Função / Descrição *
                </label>
                <textarea
                  id="funcao"
                  rows={4}
                  className={`input py-3 px-4 ${errors.funcao ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.funcao}
                  onChange={(e) => handleInputChange('funcao', e.target.value)}
                  placeholder="Descreva a função principal do maquinário"
                />
                {errors.funcao && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.funcao}
                  </p>
                )}
              </div>

              {/* Etapa de Uso */}
              <div className="space-y-2">
                <label htmlFor="etapaUso" className="block text-sm font-medium text-gray-700">
                  Etapa de Uso *
                </label>
                <select
                  id="etapaUso"
                  className={`input py-3 px-4 ${errors.etapaUso ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.etapaUso}
                  onChange={(e) => handleInputChange('etapaUso', e.target.value)}
                >
                  <option value="">Selecione a etapa de uso</option>
                  {etapasUso.map((etapa) => (
                    <option key={etapa} value={etapa}>
                      {etapa}
                    </option>
                  ))}
                </select>
                {errors.etapaUso && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.etapaUso}
                  </p>
                )}
              </div>

              {/* Foto do Maquinário */}
              <PhotoUpload
                value={formData.foto}
                onChange={(file, preview) => {
                  setFormData(prev => ({ ...prev, foto: preview }))
                }}
              />

              {/* Observações */}
              <div className="space-y-2">
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  rows={4}
                  className="input py-3 px-4"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Informações adicionais, características especiais, etc."
                />
                <p className="text-sm text-gray-500">
                  Campo opcional para informações complementares.
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Operadores */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary-600" />
                Operadores
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Defina os operadores responsáveis pelo equipamento.
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6 space-y-6">
              {/* Operador Principal */}
              <div className="space-y-2">
                <label htmlFor="operador" className="block text-sm font-medium text-gray-700">
                  Operador Principal *
                </label>
                <input
                  type="text"
                  id="operador"
                  className={`input py-3 px-4 ${errors.operador ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  value={formData.operador}
                  onChange={(e) => handleInputChange('operador', e.target.value)}
                  placeholder="Nome do operador principal"
                />
                {errors.operador && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.operador}
                  </p>
                )}
              </div>

              {/* Operador Secundário (se aplicável) */}
              {(formData.tipoMaquinario.includes('Vibroacabadora') || 
                formData.tipoMaquinario.includes('Espargidor')) && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="tipoOperadorSecundario" className="block text-sm font-medium text-gray-700">
                      Tipo de Operador Secundário
                    </label>
                    <select
                      id="tipoOperadorSecundario"
                      className="input py-3 px-4"
                      value={formData.tipoOperadorSecundario}
                      onChange={(e) => handleInputChange('tipoOperadorSecundario', e.target.value)}
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="Mesista">Mesista</option>
                      <option value="Mangueirista">Mangueirista</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="operadorSecundario" className="block text-sm font-medium text-gray-700">
                      Operador Secundário
                    </label>
                    <input
                      type="text"
                      id="operadorSecundario"
                      className="input py-3 px-4"
                      value={formData.operadorSecundario}
                      onChange={(e) => handleInputChange('operadorSecundario', e.target.value)}
                      placeholder="Nome do operador secundário"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo */}
          {(formData.nome || formData.tipoMaquinario || formData.tipoPersonalizado) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Pré-visualização</h4>
              <div className="flex items-start space-x-4">
                {formData.foto && (
                  <div className="flex-shrink-0">
                    <img
                      src={formData.foto}
                      alt="Preview do maquinário"
                      className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200"
                    />
                  </div>
                )}
                <div className="text-sm text-blue-800 space-y-1 flex-1">
                  <p><strong>Nome:</strong> {formData.nome || 'Não informado'}</p>
                  <p><strong>Tipo:</strong> {formData.tipoMaquinario || formData.tipoPersonalizado || 'Não informado'}</p>
                  <p><strong>Etapa:</strong> {formData.etapaUso || 'Não informada'}</p>
                  <p><strong>Operador:</strong> {formData.operador || 'Não informado'}</p>
                  {formData.operadorSecundario && (
                    <p><strong>{formData.tipoOperadorSecundario}:</strong> {formData.operadorSecundario}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  )
}

export default EditarMaquinario
