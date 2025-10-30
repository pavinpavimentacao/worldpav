import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/shared/Button'
import { useToast } from '../../lib/toast-hooks'
import { getEquipeById, updateEquipe, deleteEquipe, type EquipeUpdate } from '../../lib/equipesApi'
import { getColaboradoresByEquipe } from '../../lib/equipesApi'
import type { Equipe } from '../../lib/equipesApi'

export default function EquipeDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [equipe, setEquipe] = useState<Equipe | null>(null)
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const [equipeData, colaboradoresData] = await Promise.all([
        getEquipeById(id!),
        getColaboradoresByEquipe(id!)
      ])
      
      setEquipe(equipeData)
      setColaboradores(colaboradoresData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      addToast({ message: 'Erro ao carregar equipe', type: 'error' })
      navigate('/equipes')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAtivo = async () => {
    if (!equipe) return

    try {
      const update: EquipeUpdate = { ativo: !equipe.ativo }
      await updateEquipe(equipe.id, update)
      addToast({ 
        message: `Equipe ${equipe.ativo ? 'desativada' : 'ativada'} com sucesso!`, 
        type: 'success' 
      })
      loadData()
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error)
      addToast({ message: 'Erro ao atualizar equipe', type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!equipe) return

    if (!confirm(`Tem certeza que deseja deletar a equipe "${equipe.name}"?`)) {
      return
    }

    try {
      await deleteEquipe(equipe.id)
      addToast({ message: 'Equipe deletada com sucesso!', type: 'success' })
      navigate('/equipes')
    } catch (error) {
      console.error('Erro ao deletar equipe:', error)
      addToast({ message: 'Erro ao deletar equipe', type: 'error' })
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Carregando...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!equipe) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Equipe não encontrada</p>
            <Button onClick={() => navigate('/equipes')} className="mt-4">
              Voltar para Equipes
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/equipes')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipe.name}</h1>
              <p className="text-gray-500 mt-1">Detalhes da equipe</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = `/equipes/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleToggleAtivo}
              className={equipe.ativo ? 'text-orange-600' : 'text-green-600'}
            >
              {equipe.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card de Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded ${
                equipe.ativo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {equipe.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          {/* Card de Prefixo */}
          {equipe.prefixo && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Prefixo</h3>
              <p className="text-2xl font-bold text-gray-900">{equipe.prefixo}</p>
            </div>
          )}
        </div>

        {/* Descrição */}
        {equipe.descricao && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Descrição</h3>
            <p className="text-gray-900">{equipe.descricao}</p>
          </div>
        )}

        {/* Colaboradores */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Colaboradores ({colaboradores.length})
            </h3>
          </div>

          {colaboradores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum colaborador vinculado a esta equipe
            </p>
          ) : (
            <div className="space-y-2">
              {colaboradores.map(colab => (
                <div
                  key={colab.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">{colab.name}</p>
                    {colab.position && (
                      <p className="text-sm text-gray-500">{colab.position}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">ID: {colab.id.substring(0, 8)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

