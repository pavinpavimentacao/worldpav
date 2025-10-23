import React from 'react'
import { X, MapPin, Calendar, TrendingUp, Image as ImageIcon, FileText } from 'lucide-react'
import { Button } from "../shared/Button"
import { Rua, RuaStatus } from '../../types/obras'
import { formatDateToBR } from '../../utils/date-utils'

interface RuaDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  rua: Rua | null
}

export function RuaDetailsModal({ isOpen, onClose, rua }: RuaDetailsModalProps) {
  if (!isOpen || !rua) return null

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

  const formatVolume = (value: number): string => {
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`
  }

  const getProgressPercentage = (): number => {
    if (rua.volume_previsto === 0) return 0
    return Math.min((rua.volume_realizado / rua.volume_previsto) * 100, 100)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{rua.nome_rua}</h3>
              <p className="text-sm text-gray-500">{rua.endereco_completo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status e Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(rua.status)}`}>
                {getStatusLabel(rua.status)}
              </span>
            </div>
            {rua.cep && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">CEP</h4>
                <p className="text-sm text-gray-900">{rua.cep}</p>
              </div>
            )}
          </div>

          {/* Progresso */}
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso da Obra</span>
              <span className="font-medium">{getProgressPercentage().toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Volumes e Medidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Volume Previsto</h4>
              <p className="text-lg font-semibold text-gray-900">{formatVolume(rua.volume_previsto)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Volume Realizado</h4>
              <p className="text-lg font-semibold text-green-600">{formatVolume(rua.volume_realizado)}</p>
            </div>
            {rua.metragem_planejada && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Metragem Planejada</h4>
                <p className="text-lg font-semibold text-blue-900">
                  {rua.metragem_planejada.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                </p>
              </div>
            )}
            {rua.toneladas_previstas && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-orange-700 mb-1">Toneladas Previstas</h4>
                <p className="text-lg font-semibold text-orange-900">
                  {rua.toneladas_previstas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t
                </p>
              </div>
            )}
          </div>

          {/* Imagem do Trecho */}
          {rua.imagem_trecho && (
            <div>
              <div className="flex items-center mb-3">
                <ImageIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Foto do Trecho</h4>
              </div>
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={rua.imagem_trecho}
                  alt={`Foto do trecho - ${rua.nome_rua}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Observações */}
          {rua.observacoes && (
            <div>
              <div className="flex items-center mb-3">
                <FileText className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Observações</h4>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{rua.observacoes}</p>
              </div>
            </div>
          )}

          {/* Datas */}
          {(rua.data_liberacao || rua.data_inicio || rua.data_conclusao) && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Cronograma</h4>
              <div className="space-y-3">
                {rua.data_liberacao && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Liberação:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDateToBR(rua.data_liberacao)}</span>
                  </div>
                )}
                {rua.data_inicio && (
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Início:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDateToBR(rua.data_inicio)}</span>
                  </div>
                )}
                {rua.data_conclusao && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <span className="text-gray-600">Conclusão:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDateToBR(rua.data_conclusao)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}

