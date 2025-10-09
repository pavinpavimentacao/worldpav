import { Truck, Calendar, MapPin, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProximaBomba {
  id: string
  bomba_prefix: string
  data_programada: string
  hora_inicio: string
  obra_nome: string
  endereco_obra: string
  volume_previsto: number
  status: string
}

interface NextBombaCardProps {
  proximaBomba: ProximaBomba | null
  loading?: boolean
}

export function NextBombaCard({ proximaBomba, loading }: NextBombaCardProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!proximaBomba) {
    return (
      <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
        <div className="text-center py-6">
          <Truck className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nenhuma bomba programada
          </h3>
          <p className="text-sm text-gray-500">
            Não há bombas agendadas para os próximos dias.
          </p>
          <Link 
            to="/programacao/nova"
            className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Criar Programação
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmada':
        return 'Confirmada'
      case 'pendente':
        return 'Pendente'
      case 'em_andamento':
        return 'Em Andamento'
      default:
        return status
    }
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Bomba Programada
            </h3>
            <p className="text-sm text-gray-600">
              Bomba {proximaBomba.bomba_prefix}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proximaBomba.status)}`}>
          {getStatusLabel(proximaBomba.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start space-x-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Data</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {formatDate(proximaBomba.data_programada)}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Horário</p>
            <p className="text-sm font-medium text-gray-900">
              {proximaBomba.hora_inicio || 'Não definido'}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 md:col-span-2">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Obra</p>
            <p className="text-sm font-medium text-gray-900">{proximaBomba.obra_nome}</p>
            <p className="text-xs text-gray-600">{proximaBomba.endereco_obra}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-blue-200">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">Volume Previsto</p>
          <p className="text-lg font-bold text-blue-600">
            {proximaBomba.volume_previsto} m³
          </p>
        </div>
        <Link
          to={`/programacao/${proximaBomba.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  )
}


