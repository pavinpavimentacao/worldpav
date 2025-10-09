import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Package,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import { 
  getServicosAtivos,
  formatPrecoServico,
  getTipoServicoLabel,
  getTipoServicoColor,
  getUnidadeServicoLabel,
  Servico,
  TipoServico
} from '../../types/servicos'

const ServicosList: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<TipoServico | ''>('')
  const [filterStatus, setFilterStatus] = useState<'ativo' | 'inativo' | ''>('')

  const servicos = getServicosAtivos()

  // Filtrar serviços
  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (servico.descricao?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTipo = filterTipo === '' || servico.tipo === filterTipo
    const matchesStatus = filterStatus === '' || 
                         (filterStatus === 'ativo' && servico.ativo) ||
                         (filterStatus === 'inativo' && !servico.ativo)
    return matchesSearch && matchesTipo && matchesStatus
  })

  const formatCurrency = (value?: number) => {
    if (!value) return 'Sob consulta'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Serviços
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie os serviços oferecidos pela empresa (pavimentação, imprimação, etc).
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button 
              variant="primary"
              onClick={() => navigate('/servicos/novo')}
            >
              <Plus className="h-5 w-5 mr-2" /> 
              Novo Serviço
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{servicos.length}</div>
            <div className="text-sm text-gray-500">Total de Serviços</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {servicos.filter(s => s.ativo).length}
            </div>
            <div className="text-sm text-gray-500">Serviços Ativos</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {servicos.filter(s => s.tipo === 'pavimentacao').length}
            </div>
            <div className="text-sm text-gray-500">Pavimentação</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {servicos.filter(s => s.tipo === 'imprimacao').length}
            </div>
            <div className="text-sm text-gray-500">Imprimação</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <input
                type="text"
                id="search"
                className="input pl-12"
                placeholder="Nome ou descrição do serviço"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Select
              label="Tipo de Serviço"
              value={filterTipo}
              onChange={(value) => setFilterTipo(value as TipoServico | '')}
              placeholder="Todos os tipos"
              options={[
                { value: '', label: 'Todos os tipos' },
                { value: 'pavimentacao', label: 'Pavimentação' },
                { value: 'imprimacao', label: 'Imprimação' },
                { value: 'impermeabilizante', label: 'Impermeabilizante' },
                { value: 'mobilizacao', label: 'Mobilização' },
                { value: 'imobilizacao', label: 'Imobilização' },
                { value: 'outros', label: 'Outros' }
              ]}
            />
          </div>

          <div>
            <Select
              label="Status"
              value={filterStatus}
              onChange={(value) => setFilterStatus(value as 'ativo' | 'inativo' | '')}
              placeholder="Todos os status"
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' }
              ]}
            />
          </div>
        </div>

        {/* Lista de Serviços */}
        {filteredServicos.length === 0 ? (
          <div className="card text-center py-10">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum serviço encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar seus filtros ou adicione um novo serviço.
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={() => navigate('/servicos/novo')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServicos.map((servico) => (
              <div key={servico.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{servico.nome}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {servico.descricao || 'Sem descrição'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getTipoServicoColor(servico.tipo)}`}>
                      {getTipoServicoLabel(servico.tipo)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      servico.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {servico.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs">Preço Base:</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {servico.preco_base 
                          ? formatPrecoServico(servico.preco_base, servico.unidade_padrao)
                          : 'Sob consulta'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Unidade:</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {getUnidadeServicoLabel(servico.unidade_padrao)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/servicos/${servico.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => navigate(`/servicos/${servico.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
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

export default ServicosList


