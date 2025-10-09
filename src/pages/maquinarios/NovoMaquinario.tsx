import React, { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { PhotoUpload } from '../../components/PhotoUpload'
import { ArrowLeft, Save, Plus, Settings, AlertCircle } from 'lucide-react'

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
}

const NovoMaquinario = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    tipoMaquinario: '',
    tipoPersonalizado: '',
    funcao: '',
    etapaUso: '',
    observacoes: '',
    foto: null
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      console.log('Dados do maquinário:', {
        ...formData,
        tipo: formData.tipoMaquinario || formData.tipoPersonalizado
      })
      
      // Redirecionar para lista após sucesso
      window.location.href = '/maquinarios'
    } catch (error) {
      console.error('Erro ao salvar maquinário:', error)
    } finally {
      setIsSubmitting(false)
    }
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
              Cadastrar Novo Maquinário
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Preencha os dados do equipamento utilizado em pavimentação asfáltica.
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
                  Salvar Maquinário
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
                  {formData.funcao && <p><strong>Função:</strong> {formData.funcao}</p>}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  )
}

export default NovoMaquinario
