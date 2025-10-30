import React, { useState, useEffect } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Link } from 'react-router-dom'
import { Button } from "../../components/shared/Button"
import { PhotoModal } from "../../components/modals/PhotoModal"
import { Plus, Search, Eye, Edit, Trash2, Settings, Loader2 } from 'lucide-react'
import { MaquinariosAPI } from '../../lib/maquinariosApi'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import type { Maquinario } from '../../types/maquinarios'
import { getStatusColor, getStatusLabel, tiposMaquinario } from '../../types/maquinarios'

const MaquinariosList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [maquinarios, setMaquinarios] = useState<Maquinario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyId, setCompanyId] = useState<string>('')

  // Carregar company ID e maquinários
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        const id = await getOrCreateDefaultCompany()
        setCompanyId(id)
        
        const maquinariosData = await MaquinariosAPI.list({ company_id: id })
        setMaquinarios(maquinariosData)
      } catch (err) {
        console.error('Erro ao carregar maquinários:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar maquinários')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  // Filtrar maquinários
  const filteredMaquinarios = maquinarios.filter(maquinario => {
    const matchesSearch = !searchTerm || 
      maquinario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maquinario.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      maquinario.type?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || maquinario.type === selectedType
    const matchesStatus = !selectedStatus || maquinario.status === selectedStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este maquinário?')) {
      try {
        await MaquinariosAPI.delete(id)
        setMaquinarios(prev => prev.filter(m => m.id !== id))
      } catch (err) {
        console.error('Erro ao remover maquinário:', err)
        alert('Erro ao remover maquinário')
      }
    }
  }

  const handlePhotoClick = (photoUrl: string) => {
    setSelectedPhoto(photoUrl)
    setShowPhotoModal(true)
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Carregando maquinários...</span>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar maquinários</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
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
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Equipamentos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os equipamentos utilizados em pavimentação
            </p>
          </div>
          <div className="mt-4 md:ml-4 md:mt-0">
            <Link to="/maquinarios/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Equipamento
              </Button>
            </Link>
          </div>
        </div>

        {/* Resumo Estatístico */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">
                  {filteredMaquinarios.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-lg font-semibold text-green-600">
                  {filteredMaquinarios.filter(m => m.status === 'ativo').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm font-bold">⚠</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Manutenção</p>
                <p className="text-lg font-semibold text-yellow-600">
                  {filteredMaquinarios.filter(m => m.status === 'manutencao').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">✗</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inativos</p>
                <p className="text-lg font-semibold text-red-600">
                  {filteredMaquinarios.filter(m => m.status === 'inativo').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, placa ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Tipo */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              {tiposMaquinario.map(tipo => (
                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
              ))}
            </select>

            {/* Filtro Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        {/* Lista de Maquinários */}
        <div className="bg-white shadow-sm rounded-lg border">
          {filteredMaquinarios.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum equipamento encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {maquinarios.length === 0 
                  ? 'Comece adicionando um novo equipamento.'
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {maquinarios.length === 0 && (
                <div className="mt-6">
                  <Link to="/maquinarios/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Equipamento
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMaquinarios.map((maquinario) => {
                const statusColors = getStatusColor(maquinario.status)
                return (
                  <div key={maquinario.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Foto */}
                        <div className="flex-shrink-0">
                          {maquinario.photo_url ? (
                            <img
                              src={maquinario.photo_url}
                              alt={maquinario.name}
                              className="h-16 w-16 rounded-lg object-cover cursor-pointer"
                              onClick={() => handlePhotoClick(maquinario.photo_url!)}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Settings className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {maquinario.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                              {getStatusLabel(maquinario.status)}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            {maquinario.type && (
                              <span className="flex items-center">
                                <span className="font-medium">Tipo:</span>
                                <span className="ml-1">{maquinario.type}</span>
                              </span>
                            )}
                            {maquinario.plate && (
                              <span className="flex items-center">
                                <span className="font-medium">Placa:</span>
                                <span className="ml-1 font-mono">{maquinario.plate}</span>
                              </span>
                            )}
                            {maquinario.year && (
                              <span className="flex items-center">
                                <span className="font-medium">Ano:</span>
                                <span className="ml-1">{maquinario.year}</span>
                              </span>
                            )}
                          </div>

                          {maquinario.observations && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {maquinario.observations}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2">
                        <Link to={`/maquinarios/${maquinario.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/maquinarios/${maquinario.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(maquinario.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Foto */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        photoUrl={selectedPhoto}
        title="Foto do Maquinário"
      />
    </Layout>
  )
}

export default MaquinariosList