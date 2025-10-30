import React from 'react'
import { X, MapPin, Calendar, Ruler, Weight, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from "../shared/Button"
import { ObraRua } from '../../lib/obrasRuasApi'
import { formatarEspessura } from '../../utils/financeiro-obras-utils'

interface ObraRuaDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  rua: ObraRua | null
}

export function ObraRuaDetailsModal({ isOpen, onClose, rua }: ObraRuaDetailsModalProps) {
  if (!isOpen || !rua) return null

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planejada':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'em_execucao':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'planejada':
        return 'Planejada'
      case 'em_execucao':
        return 'Em Execução'
      case 'concluida':
        return 'Concluída'
      default:
        return status
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number | null): string => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatArea = (value: number | null): string => {
    if (!value) return '-'
    return `${value.toLocaleString('pt-BR')} m²`
  }

  const formatWeight = (value: number | null): string => {
    if (!value) return '-'
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} t`
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
              <h3 className="text-xl font-semibold text-gray-900">{rua.name}</h3>
              <p className="text-sm text-gray-500">Detalhes da Rua</p>
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
          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(rua.status)}`}>
              {getStatusLabel(rua.status)}
            </span>
          </div>

          {/* Informações de Planejamento */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Ruler className="h-5 w-5 text-blue-600 mr-2" />
              Planejamento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-blue-700 mb-1">Metragem Planejada</h5>
                <p className="text-lg font-semibold text-blue-900">
                  {formatArea(rua.metragem_planejada)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-orange-700 mb-1">Toneladas Previstas</h5>
                <p className="text-lg font-semibold text-orange-900">
                  {formatWeight(rua.toneladas_utilizadas)}
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Execução */}
          {rua.status === 'concluida' && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Execução
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-green-700 mb-1">Metragem Executada</h5>
                  <p className="text-lg font-semibold text-green-900">
                    {formatArea(rua.metragem_executada)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-purple-700 mb-1">Toneladas Utilizadas</h5>
                  <p className="text-lg font-semibold text-purple-900">
                    {formatWeight(rua.toneladas_utilizadas)}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-indigo-700 mb-1">Espessura Calculada</h5>
                  <p className="text-lg font-semibold text-indigo-900">
                    {rua.espessura_calculada ? formatarEspessura(rua.espessura_calculada) : '-'}
                  </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-cyan-700 mb-1">Preço por m²</h5>
                  <p className="text-lg font-semibold text-cyan-900">
                    {rua.preco_por_m2 ? formatCurrency(rua.preco_por_m2) : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações Financeiras */}
          {rua.valor_total && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                Financeiro
              </h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-green-700 mb-1">Valor Total</h5>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(rua.valor_total)}
                </p>
              </div>
            </div>
          )}

          {/* Datas */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              Cronograma
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-gray-600">Criada em:</span>
                <span className="font-medium text-gray-900 ml-2">{formatDate(rua.created_at)}</span>
              </div>
              {rua.start_date && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-600">Início:</span>
                  <span className="font-medium text-gray-900 ml-2">{formatDate(rua.start_date)}</span>
                </div>
              )}
              {rua.data_finalizacao && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-600">Finalizada em:</span>
                  <span className="font-medium text-gray-900 ml-2">{formatDate(rua.data_finalizacao)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {rua.observations && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Observações</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{rua.observations}</p>
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

