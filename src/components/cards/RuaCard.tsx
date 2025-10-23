import { MapPin, Calendar, TrendingUp, Eye, Edit2, Image as ImageIcon } from 'lucide-react'
import { Rua, RuaStatus } from '../../types/obras'
import { formatDateToBR } from '../../utils/date-utils'

interface RuaCardProps {
  rua: Rua
  onEdit?: (rua: Rua) => void
  onView?: (rua: Rua) => void
}

export function RuaCard({ rua, onEdit, onView }: RuaCardProps) {
  const getStatusColor = (status: RuaStatus): string => {
    switch (status) {
      case 'planejada':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'liberada':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'pavimentada':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'concluida':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: RuaStatus): string => {
    switch (status) {
      case 'planejada':
        return 'Planejada'
      case 'liberada':
        return 'Liberada'
      case 'em_andamento':
        return 'Em Andamento'
      case 'pavimentada':
        return 'Pavimentada'
      case 'concluida':
        return 'Concluída'
      default:
        return status
    }
  }

  const getProgressPercentage = (): number => {
    if (rua.volume_previsto === 0) return 0
    return Math.min((rua.volume_realizado / rua.volume_previsto) * 100, 100)
  }

  const formatVolume = (value: number): string => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {rua.nome_rua}
          </h4>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{rua.endereco_completo}</span>
          </div>
        </div>
      </div>

      {/* Imagem do Trecho */}
      {rua.imagem_trecho && (
        <div className="mb-3">
          <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={rua.imagem_trecho}
              alt={`Foto do trecho - ${rua.nome_rua}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              <ImageIcon className="w-3 h-3 inline mr-1" />
              Trecho
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(rua.status)}`}>
          {getStatusLabel(rua.status)}
        </span>
        {rua.cep && (
          <span className="text-xs text-gray-500">
            CEP: {rua.cep}
          </span>
        )}
      </div>

      {/* Progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progresso</span>
          <span className="font-medium">{getProgressPercentage().toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Volume */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Volume Previsto:</span>
          <span className="font-medium text-gray-900">{formatVolume(rua.volume_previsto)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Volume Realizado:</span>
          <span className="font-medium text-green-600">{formatVolume(rua.volume_realizado)}</span>
        </div>
        {rua.metragem_planejada && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Metragem Planejada:</span>
            <span className="font-medium text-blue-600">{rua.metragem_planejada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²</span>
          </div>
        )}
        {rua.toneladas_previstas && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Toneladas Previstas:</span>
            <span className="font-medium text-orange-600">{rua.toneladas_previstas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t</span>
          </div>
        )}
      </div>

      {/* Datas */}
      {(rua.data_liberacao || rua.data_inicio || rua.data_conclusao) && (
        <div className="space-y-1 mb-3 pt-3 border-t border-gray-200">
          {rua.data_liberacao && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Liberação: {formatDateToBR(rua.data_liberacao)}</span>
            </div>
          )}
          {rua.data_inicio && (
            <div className="flex items-center text-xs text-gray-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Início: {formatDateToBR(rua.data_inicio)}</span>
            </div>
          )}
          {rua.data_conclusao && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Conclusão: {formatDateToBR(rua.data_conclusao)}</span>
            </div>
          )}
        </div>
      )}

      {/* Observações */}
      {rua.observacoes && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <p className="line-clamp-2">{rua.observacoes}</p>
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
        {onView && (
          <button
            onClick={() => onView(rua)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalhes"
          >
            <Eye className="w-3 h-3 mr-1" />
            Ver
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(rua)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
            title="Editar"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Editar
          </button>
        )}
      </div>
    </div>
  )
}


