import React, { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { PhotoModal } from '../../components/PhotoModal'
import { Plus, Search, Eye, Edit, Trash2, Settings } from 'lucide-react'

// Dados mock para demonstração
const mockMaquinarios = [
  {
    id: '1',
    prefixo: 'WP-001',
    nome: 'Vibroacabadora CAT AP1055F',
    tipo: 'Vibroacabadora (Pavimentadora de Asfalto)',
    funcao: 'Aplicação de asfalto quente em camadas uniformes com vibração integrada',
    etapaUso: 'Aplicação (CBUQ / Pavimentação)',
    observacoes: 'Equipamento principal para pavimentação de vias urbanas',
    status: 'disponivel',
    empresa: 'WorldPav',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH8lPk9uukiNplQ2sgoCUkBKkZ2WAfYIVaSA&s'
  },
  {
    id: '2',
    prefixo: 'WP-002',
    nome: 'Espargidor de Emulsão Volvo FMX',
    tipo: 'Caminhão Espargidor de Emulsão (Carrega a Cola)',
    funcao: 'Aplicação de emulsão asfáltica para imprimação e pintura de ligação',
    etapaUso: 'Pré-aplicação (Imprimação / Pintura de ligação)',
    observacoes: 'Capacidade de 8.000L, sistema de aquecimento integrado',
    status: 'em_uso',
    empresa: 'WorldPav',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8BvdsKY0mP26GMVkvpBqdqQuw2bkX1IHeog&s'
  },
  {
    id: '3',
    prefixo: 'PV-001',
    nome: 'Rolo Compactador Chapa Dynapac CA2500',
    tipo: 'Rolo Compactador Chapa (Chapa-Chapa)',
    funcao: 'Compactação inicial e final do asfalto aplicado',
    etapaUso: 'Compactação inicial',
    observacoes: 'Peso operacional de 10 toneladas',
    status: 'disponivel',
    empresa: 'Pavin',
    foto: 'https://www.ecivilnet.com/dicionario/images/rolo-compactador-tandem.jpg'
  },
  {
    id: '4',
    prefixo: 'PV-002',
    nome: 'Rolo Pneumático Bomag BW213',
    tipo: 'Rolo Compactador Pneumático (Pneu-Pneu)',
    funcao: 'Compactação final e acabamento da superfície asfáltica',
    etapaUso: 'Compactação final',
    observacoes: '8 pneus, sistema de vibração opcional',
    status: 'manutencao',
    empresa: 'Pavin',
    foto: 'https://tratorex.net/equipamentos/24G426/1.jpg'
  },
  {
    id: '5',
    prefixo: 'WP-003',
    nome: 'Motoniveladora Caterpillar 140M',
    tipo: 'Motoniveladora',
    funcao: 'Nivelamento e acabamento da base antes da aplicação de asfalto',
    etapaUso: 'Preparação de Base',
    observacoes: 'Lâmina de 4,2m, essencial para nivelamento preciso',
    status: 'disponivel',
    empresa: 'WorldPav',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZxY5Z5_6XmKJKxQKFgY8YqL8vKxQZ5Z5_6w&s'
  },
  {
    id: '6',
    prefixo: 'PV-003',
    nome: 'Escavadeira Hidráulica Komatsu PC200',
    tipo: 'Escavadeira',
    funcao: 'Escavação e movimentação de terra na preparação do terreno',
    etapaUso: 'Preparação de Base',
    observacoes: 'Peso operacional de 20 toneladas',
    status: 'disponivel',
    empresa: 'Pavin',
    foto: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8BvdsKY0mP26GMVkvpBqdqQuw2bkX1IHeog&s'
  }
]

const tiposMaquinario = [
  'Caminhão Espargidor de Emulsão (Carrega a Cola)',
  'Vibroacabadora (Pavimentadora de Asfalto)',
  'Rolo Compactador Chapa (Chapa-Chapa)',
  'Rolo Compactador Pneumático (Pneu-Pneu)',
  'Motoniveladora',
  'Escavadeira'
]

const etapasUso = [
  'Preparação de Base',
  'Pré-aplicação (Imprimação / Pintura de ligação)',
  'Aplicação (CBUQ / Pavimentação)',
  'Compactação inicial',
  'Compactação final'
]

const MaquinariosList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEtapa, setFilterEtapa] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterEmpresa, setFilterEmpresa] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, title: string} | null>(null)

  // Filtrar maquinários
  const filteredMaquinarios = mockMaquinarios.filter(maquinario => {
    const matchesSearch = maquinario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maquinario.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maquinario.prefixo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maquinario.funcao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEtapa = !filterEtapa || maquinario.etapaUso === filterEtapa
    const matchesTipo = !filterTipo || maquinario.tipo === filterTipo
    const matchesEmpresa = !filterEmpresa || maquinario.empresa === filterEmpresa
    const matchesStatus = !filterStatus || maquinario.status === filterStatus
    
    return matchesSearch && matchesEtapa && matchesTipo && matchesEmpresa && matchesStatus
  })

  const getEtapaBadgeColor = (etapa: string) => {
    switch (etapa) {
      case 'Preparação de Base':
        return 'bg-purple-100 text-purple-800'
      case 'Pré-aplicação (Imprimação / Pintura de ligação)':
        return 'bg-orange-100 text-orange-800'
      case 'Aplicação (CBUQ / Pavimentação)':
        return 'bg-blue-100 text-blue-800'
      case 'Compactação inicial':
        return 'bg-yellow-100 text-yellow-800'
      case 'Compactação final':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return { label: 'Disponível', className: 'bg-green-100 text-green-800' }
      case 'em_uso':
        return { label: 'Em Uso', className: 'bg-blue-100 text-blue-800' }
      case 'manutencao':
        return { label: 'Manutenção', className: 'bg-yellow-100 text-yellow-800' }
      case 'indisponivel':
        return { label: 'Indisponível', className: 'bg-red-100 text-red-800' }
      default:
        return { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' }
    }
  }

  const getEmpresaBadge = (empresa: string) => {
    return empresa === 'WorldPav' 
      ? { label: 'WorldPav', className: 'bg-indigo-100 text-indigo-800' }
      : { label: 'Pavin', className: 'bg-purple-100 text-purple-800' }
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Maquinários
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os equipamentos utilizados em pavimentação
            </p>
          </div>
          <div className="mt-4 md:ml-4 md:mt-0">
            <Link to="/maquinarios/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Maquinário
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
                <p className="text-sm font-medium text-gray-500">Disponíveis</p>
                <p className="text-lg font-semibold text-green-600">
                  {filteredMaquinarios.filter(m => m.status === 'disponivel').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">⚙</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Em Uso</p>
                <p className="text-lg font-semibold text-blue-600">
                  {filteredMaquinarios.filter(m => m.status === 'em_uso').length}
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
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, prefixo ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="em_uso">Em Uso</option>
              <option value="manutencao">Manutenção</option>
            </select>

            {/* Filtro Empresa */}
            <select
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as empresas</option>
              <option value="WorldPav">WorldPav</option>
              <option value="Pavin">Pavin</option>
            </select>

            {/* Filtro Etapa */}
            <select
              value={filterEtapa}
              onChange={(e) => setFilterEtapa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as etapas</option>
              {etapasUso.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de Cards */}
        {filteredMaquinarios.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg border p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">
              <Settings className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum maquinário encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterEtapa || filterTipo || filterEmpresa || filterStatus
                ? 'Tente ajustar os filtros para encontrar o que procura.'
                : 'Comece cadastrando seu primeiro maquinário.'}
            </p>
            {(searchTerm || filterEtapa || filterTipo || filterEmpresa || filterStatus) && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setFilterEtapa('')
                  setFilterTipo('')
                  setFilterEmpresa('')
                  setFilterStatus('')
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaquinarios.map((maquinario) => {
              const statusBadge = getStatusBadge(maquinario.status)
              const empresaBadge = getEmpresaBadge(maquinario.empresa)
              
              return (
                <div 
                  key={maquinario.id} 
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Imagem */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {maquinario.foto ? (
                      <button
                        onClick={() => setSelectedPhoto({url: maquinario.foto, title: maquinario.nome})}
                        className="w-full h-full cursor-pointer"
                      >
                        <img
                          src={maquinario.foto}
                          alt={maquinario.nome}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Settings className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Prefixo Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex px-3 py-1 text-sm font-bold rounded-full bg-white text-gray-900 shadow-lg">
                        {maquinario.prefixo}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusBadge.className} shadow-lg`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {/* Nome e Empresa */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {maquinario.nome}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${empresaBadge.className}`}>
                        {empresaBadge.label}
                      </span>
                    </div>

                    {/* Tipo */}
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Tipo:</span> {maquinario.tipo}
                    </p>

                    {/* Etapa */}
                    <div className="mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtapaBadgeColor(maquinario.etapaUso)}`}>
                        {maquinario.etapaUso}
                      </span>
                    </div>

                    {/* Função */}
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2" title={maquinario.funcao}>
                      {maquinario.funcao}
                    </p>

                    {/* Observações */}
                    {maquinario.observacoes && (
                      <p className="text-xs text-gray-500 mb-4 line-clamp-2" title={maquinario.observacoes}>
                        {maquinario.observacoes}
                      </p>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                      <Link
                        to={`/maquinarios/${maquinario.id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/maquinarios/${maquinario.id}/edit`}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Foto */}
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photoUrl={selectedPhoto?.url || ''}
          title={selectedPhoto?.title || ''}
        />
      </div>
    </Layout>
  )
}

export default MaquinariosList
