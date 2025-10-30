import React, { useState } from 'react'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/ui/input'
import { useToast } from '../../lib/toast-hooks'
import { createEquipe, type EquipeInsert } from '../../lib/equipesApi'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'

export default function NovaEquipe() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    prefixo: '',
    descricao: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      addToast({ message: 'Nome da equipe é obrigatório', type: 'error' })
      return
    }

    try {
      setLoading(true)
      
      const companyId = await getOrCreateDefaultCompany()
      
      const equipeData: EquipeInsert = {
        company_id: companyId,
        name: formData.name,
        prefixo: formData.prefixo || null,
        descricao: formData.descricao || null,
        ativo: true
      }

      await createEquipe(equipeData)
      addToast({ message: 'Equipe criada com sucesso!', type: 'success' })
      navigate('/equipes')
    } catch (error) {
      console.error('Erro ao criar equipe:', error)
      addToast({ message: 'Erro ao criar equipe', type: 'error' })
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Nova Equipe</h1>
            <p className="text-gray-500 mt-1">Cadastre uma nova equipe</p>
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
                {loading ? 'Salvando...' : 'Salvar Equipe'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}

