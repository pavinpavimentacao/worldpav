import { useEffect, useMemo, useRef, useState } from 'react'
import { Layout } from "../../components/layout/Layout"
import { Button } from "../../components/shared/Button"
import { Select } from "../../components/shared/Select"
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, Edit2 } from 'lucide-react'
import { useToast } from '../../lib/toast-hooks'
import { getOrCreateDefaultCompany } from '../../lib/company-utils'
import { 
  getClientes, 
  getEstatisticasClientes, 
  type Cliente,
  type ClienteFilters 
} from '../../lib/clientesApi'

const PAGE_SIZE = 20

export default function ClientsList() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Cliente[]>([])
  const [allClients, setAllClients] = useState<Cliente[]>([])
  const [companyId, setCompanyId] = useState<string>('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [empresaFilter, setEmpresaFilter] = useState('')

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    worldpav: 0,
    pavin: 0
  })

  // debounce 350ms
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setDebounced(query.trim()), 350)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [query])

  // Carregar company ID
  useEffect(() => {
    loadCompanyId()
  }, [])

  // Carregar clientes quando company ID mudar
  useEffect(() => {
    if (companyId) {
      fetchClientes()
      fetchStats()
    }
  }, [companyId])

  async function loadCompanyId() {
    try {
      const id = await getOrCreateDefaultCompany()
      setCompanyId(id)
    } catch (err) {
      console.error('Erro ao carregar company ID:', err)
      addToast({ message: 'Erro ao carregar empresa', type: 'error' })
    }
  }

  async function fetchClientes() {
    try {
      setLoading(true)
      setError(null)

      const filters: ClienteFilters = {
        searchTerm: debounced || undefined,
        client_type: tipoFilter && tipoFilter !== 'todos' ? tipoFilter as any : undefined,
        responsible_company: empresaFilter && empresaFilter !== 'todos' ? empresaFilter as any : undefined
      }

      const data = await getClientes(companyId, filters)
      setAllClients(data)
      setLoading(false)
    } catch (err: any) {
      console.error('Erro ao buscar clientes:', err)
      setError(err?.message || 'Falha ao carregar clientes')
      setLoading(false)
      addToast({ message: 'Erro ao carregar clientes', type: 'error' })
    }
  }

  async function fetchStats() {
    try {
      const data = await getEstatisticasClientes(companyId)
      setStats({
        total: data.total,
        worldpav: data.worldpav,
        pavin: data.pavin
      })
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
    }
  }

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (companyId) {
      fetchClientes()
    }
  }, [debounced, tipoFilter, empresaFilter])

  // Aplicar paginação local
  const paginatedClients = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE
    const endIndex = startIndex + PAGE_SIZE
    return allClients.slice(startIndex, endIndex)
  }, [allClients, page])

  useEffect(() => {
    setClients(paginatedClients)
  }, [paginatedClients])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(allClients.length / PAGE_SIZE)), [allClients.length])

  function formatPhone(value?: string | null) {
    const digits = (value || '').replace(/\D/g, '')
    if (digits.length === 11) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`
    }
    if (digits.length === 10) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6,10)}`
    }
    return value || '-'
  }

  function formatEmail(value?: string | null) {
    if (!value) return '-'
    return value
  }

  function getClientStatusBadge(client: ClientRow) {
    const hasContact = client.phone || client.email
    if (hasContact) {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Contato Completo
        </span>
      )
    }
    return (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Contato Incompleto
      </span>
    )
  }

  function getClientTypeLabel(type?: string | null) {
    const labels = {
      'construtora': 'Construtora',
      'prefeitura': 'Prefeitura',
      'empresa_privada': 'Empresa Privada',
      'incorporadora': 'Incorporadora'
    }
    return labels[type as keyof typeof labels] || '-'
  }

  function getWorkAreaLabel(area?: string | null) {
    const labels = {
      'residencial': 'Residencial',
      'comercial': 'Comercial',
      'industrial': 'Industrial',
      'publico': 'Público'
    }
    return labels[area as keyof typeof labels] || '-'
  }

  function getWorkTypeLabel(type?: string | null) {
    const labels = {
      'pavimentacao_nova': 'Pavimentação Nova',
      'recapeamento': 'Recapeamento',
      'manutencao': 'Manutenção'
    }
    return labels[type as keyof typeof labels] || '-'
  }

  function getCompanyBadge(company?: string | null) {
    if (company === 'WorldPav') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          WorldPav
        </span>
      )
    }
    if (company === 'Pavin') {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Pavin
        </span>
      )
    }
    return <span className="text-gray-500">-</span>
  }

  function exportCsv() {
    const headers = ['rep_name', 'company_name', 'phone', 'email']
    const rows = clients.map((c) => [c.rep_name ?? '', c.company_name ?? '', c.phone ?? '', c.email ?? ''])
    const csv = [headers.join(','), ...rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar clientes</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchClientes()}>Tentar Novamente</Button>
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
              Clientes
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os clientes e suas informações de pavimentação
            </p>
          </div>
          <div className="mt-4 md:ml-4 md:mt-0">
            <Link to="/clients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
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
                  <span className="text-blue-600 text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total de Clientes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-bold">WP</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">WorldPav</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.worldpav}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">PV</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pavin</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.pavin}
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
                  {allClients.filter(c => c.phone || c.email).length}
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
                placeholder="Buscar por representante ou empresa..."
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value) }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro Tipo */}
            <Select
              value={tipoFilter}
              onChange={(value) => { setPage(1); setTipoFilter(value) }}
              placeholder="Todos os tipos"
              options={[
                { value: '', label: 'Todos os tipos' },
                { value: 'construtora', label: 'Construtora' },
                { value: 'prefeitura', label: 'Prefeitura' },
                { value: 'empresa_privada', label: 'Empresa Privada' },
                { value: 'incorporadora', label: 'Incorporadora' }
              ]}
            />

            {/* Filtro Empresa */}
            <Select
              value={empresaFilter}
              onChange={(value) => { setPage(1); setEmpresaFilter(value) }}
              placeholder="Todas as empresas"
              options={[
                { value: '', label: 'Todas as empresas' },
                { value: 'WorldPav', label: 'WorldPav' },
                { value: 'Pavin', label: 'Pavin' }
              ]}
            />
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa Resp.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.representante || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.empresa || '-'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {client.tipo_cliente || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {client.area_atuacao || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {client.empresa_responsavel?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatPhone(client.phone)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={client.email || ''}>
                          {formatEmail(client.email)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Paginação */}
        {!loading && clients.length > 0 && totalPages > 1 && (
          <div className="bg-white shadow-sm rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Nenhum Resultado */}
        {!loading && allClients.length === 0 && (
          <div className="bg-white shadow-sm rounded-lg border p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {debounced || tipoFilter || empresaFilter
                ? 'Tente ajustar os filtros para encontrar o que procura.'
                : 'Comece cadastrando seu primeiro cliente.'}
            </p>
            {(debounced || tipoFilter || empresaFilter) && (
              <Button
                onClick={() => {
                  setQuery('')
                  setTipoFilter('')
                  setEmpresaFilter('')
                  setPage(1)
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
