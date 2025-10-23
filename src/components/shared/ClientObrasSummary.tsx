import { useEffect, useState } from 'react'
import { Building2, Calendar, TrendingUp } from 'lucide-react'

interface Obra {
  id: string
  nome: string
  status: string
  data_inicio: string
  valor_total?: number
}

interface ClientObrasSummaryProps {
  clienteId: string
  clienteNome: string
  compact?: boolean
}

export function ClientObrasSummary({ clienteId, clienteNome, compact = false }: ClientObrasSummaryProps) {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de obras do cliente
    // TODO: Integrar com API real
    const loadObras = async () => {
      try {
        setLoading(true)
        // Mock data - substituir por chamada real à API
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Simular dados baseados no clienteId
        const mockObras: Obra[] = []
        const numObras = Math.floor(Math.random() * 5) // 0 a 4 obras por cliente
        
        for (let i = 0; i < numObras; i++) {
          mockObras.push({
            id: `${clienteId}-${i}`,
            nome: `Obra ${i + 1} - ${clienteNome}`,
            status: ['em_andamento', 'concluida', 'pausada'][Math.floor(Math.random() * 3)],
            data_inicio: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            valor_total: Math.random() * 500000
          })
        }
        
        setObras(mockObras)
      } catch (error) {
        console.error('Erro ao carregar obras:', error)
        setObras([])
      } finally {
        setLoading(false)
      }
    }

    loadObras()
  }, [clienteId, clienteNome])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'concluida':
        return 'bg-green-100 text-green-800'
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento'
      case 'concluida':
        return 'Concluída'
      case 'pausada':
        return 'Pausada'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        <span className="text-xs text-gray-500">Carregando...</span>
      </div>
    )
  }

  // Modo compacto (para tabela)
  if (compact) {
    if (obras.length === 0) {
      return (
        <div className="flex items-center space-x-2 text-gray-400">
          <Building2 className="w-4 h-4" />
          <span className="text-xs">Sem obras</span>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">{obras.length}</span>
        {obras.length === 1 && (
          <span className="text-xs text-gray-500">obra</span>
        )}
        {obras.length > 1 && (
          <span className="text-xs text-gray-500">obras</span>
        )}
      </div>
    )
  }

  // Modo completo (para página de detalhes)
  if (obras.length === 0) {
    return (
      <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nenhuma obra cadastrada
          </h3>
          <p className="text-sm text-gray-500">
            Este cliente ainda não possui obras vinculadas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Obras do Cliente ({obras.length})
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {obras.map((obra) => (
          <div key={obra.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 text-sm">{obra.nome}</h4>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(obra.status)}`}>
                {getStatusLabel(obra.status)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Início: {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              {obra.valor_total && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(obra.valor_total)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


