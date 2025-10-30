import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../lib/toast-hooks'
import { getEquipeById, updateEquipe, type EquipeUpdate } from '../../lib/equipesApi'

export default function EditarEquipe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    prefixo: '',
    descricao: '',
    ativo: true
  })

  useEffect(() => {
    if (id) {
      loadEquipe()
    }
  }, [id])

  const loadEquipe = async () => {
    try {
      setLoadingData(true)
      const equipe = await getEquipeById(id!)
      
      if (!equipe) {
        addToast({ message: 'Equipe não encontrada', type: 'error' })
        navigate('/equipes')
        return
      }

      setFormData({
        name: equipe.name,
        prefixo: equipe.prefixo || '',
        descricao: equipe.descricao || '',
        ativo: equipe.ativo
      })
    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
      addToast({ message: 'Erro ao carregar equipe', type: 'error' })
      navigate('/equipes')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      addToast({ message: 'Nome da equipe é obrigatório', type: 'error' })
      return
    }

    try {
      setLoading(true)
      
      const updateData: EquipeUpdate = {
        name: formData.name,
        prefixo: formData.prefixo || null,
        descricao: formData.descricao || null,
        ativo: formData.ativo
      }

      await updateEquipe(id!, updateData)
      addToast({ message: 'Equipe atualizada com sucesso!', type: 'success' })
      navigate('/equipes')
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error)
      addToast({ message: 'Erro ao atualizar equipe', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Carregando equipe...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/equipes')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Equipe</h1>
            <p className="text-gray-500 mt-1">Atualize os dados da equipe</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Equipe <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Equipe Alpha"
                required
              />
            </div>

            {/* Prefixo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefixo
              </label>
              <Input
                type="text"
                value={formData.prefixo}
                onChange={(e) => setFormData({ ...formData, prefixo: e.target.value })}
                placeholder="Ex: EAL"
                maxLength={10}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva as responsabilidades desta equipe..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Equipe ativa
                </span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/equipes')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}



