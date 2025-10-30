import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/shared/Button'
import { Input } from '../../components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../lib/toast-hooks'
import { getEquipes, deleteEquipe, type Equipe } from '../../lib/equipesApi'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'

export default function EquipesList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [companyId, setCompanyId] = useState<string>('')

  useEffect(() => {
    loadCompanyId()
  }, [])

  useEffect(() => {
    if (companyId) {
      loadEquipes()
    }
  }, [companyId])

  const loadCompanyId = async () => {
    try {
      const id = await getOrCreateDefaultCompany()
      setCompanyId(id)
    } catch (error) {
      console.error('Erro ao carregar company ID:', error)
      addToast({ message: 'Erro ao carregar empresa', type: 'error' })
    }
  }

  const loadEquipes = async () => {
    try {
      setLoading(true)
      const data = await getEquipes(companyId)
      setEquipes(data)
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
      addToast({ message: 'Erro ao carregar equipes', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (equipe: Equipe) => {
    if (!confirm(`Tem certeza que deseja deletar a equipe "${equipe.name}"?`)) {
      return
    }

    try {
      await deleteEquipe(equipe.id)
      addToast({ message: 'Equipe deletada com sucesso!', type: 'success' })
      loadEquipes()
    } catch (error) {
      console.error('Erro ao deletar equipe:', error)
      addToast({ message: 'Erro ao deletar equipe', type: 'error' })
    }
  }

  const equipesFiltradas = equipes.filter(equipe =>
    equipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipes</h1>
            <p className="text-gray-500 mt-1">Gerencie as equipes da sua empresa</p>
          </div>
          <Button onClick={() => window.location.href = '/equipes/new'}>
            <Plus className="h-5 w-5 mr-2" />
            Nova Equipe
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar equipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Carregando equipes...</p>
          </div>
        )}

        {/* Lista de equipes */}
        {!loading && equipesFiltradas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma equipe encontrada</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? 'Tente buscar com outro termo' : 'Comece criando sua primeira equipe'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/equipes/new')} className="mt-6">
                <Plus className="h-5 w-5 mr-2" />
                Nova Equipe
              </Button>
            )}
          </div>
        )}

        {/* Grid de equipes */}
        {!loading && equipesFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipesFiltradas.map((equipe) => (
              <div
                key={equipe.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{equipe.name}</h3>
                    {equipe.prefixo && (
                      <p className="text-sm text-gray-500 mt-1">Prefix: {equipe.prefixo}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      equipe.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {equipe.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {equipe.descricao && (
                  <p className="text-sm text-gray-600 mb-4">{equipe.descricao}</p>
                )}

                <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = `/equipes/${equipe.id}`}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(equipe)}
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

