import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatDateToBR } from '../../utils/date-utils'
import { ObraWithProgress, formatVolume, formatValorPorUnidade, getUnidadeLabel } from '../../types/obras'
import { 
  MapPin, 
  Calendar, 
  Building, 
  Map, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText
} from 'lucide-react'

interface ObraCardProps {
  obra: ObraWithProgress
  showClient?: boolean
  compact?: boolean
}

export const ObraCard: React.FC<ObraCardProps> = ({ 
  obra, 
  showClient = false, 
  compact = false 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'planejada': { label: 'Planejada', className: 'bg-blue-100 text-blue-800' },
      'em_andamento': { label: 'Em Andamento', className: 'bg-yellow-100 text-yellow-800' },
      'concluida': { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      'cancelada': { label: 'Cancelada', className: 'bg-red-100 text-red-800' }
    }
    return variants[status as keyof typeof variants] || variants.planejada
  }

  const getAlertIcon = () => {
    switch (obra.status_alertas) {
      case 'atraso':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'atencao':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getAlertText = () => {
    switch (obra.status_alertas) {
      case 'atraso':
        return 'Atrasada'
      case 'atencao':
        return 'Atenção'
      default:
        return 'No prazo'
    }
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {obra.nome}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(obra.status).className}`}>
                {getStatusBadge(obra.status).label}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {obra.cidade}/{obra.estado}
              </span>
              <span className="flex items-center">
                <Building className="h-3 w-3 mr-1" />
                {obra.empresa_responsavel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${obra.progresso_percentual}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{obra.progresso_percentual}%</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {getAlertIcon()}
                <span className="text-xs text-gray-500">{getAlertText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {obra.nome}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(obra.status).className}`}>
              {getStatusBadge(obra.status).label}
            </span>
          </div>
          
          {showClient && (
            <p className="text-sm text-gray-600 mb-2">
              Cliente: <span className="font-medium">{obra.cliente_nome}</span>
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {obra.regiao}, {obra.cidade}/{obra.estado}
            </span>
            <span className="flex items-center">
              <Building className="h-4 w-4 mr-1" />
              {obra.empresa_responsavel}
            </span>
          </div>
          
          {obra.cnpj_obra && (
            <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-800">
                  CNPJ Específico: {obra.cnpj_obra}
                </span>
              </div>
              {obra.razao_social_obra && (
                <p className="text-xs text-purple-700 mt-1">
                  {obra.razao_social_obra}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {getAlertIcon()}
          <span className="text-sm text-gray-600">{getAlertText()}</span>
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
          <span className="text-sm text-gray-600">{obra.progresso_percentual}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${obra.progresso_percentual}%` }}
          />
        </div>
      </div>

      {/* Ruas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            <Map className="h-4 w-4 mr-1" />
            Controle de Ruas
          </span>
          <span className="text-sm text-gray-600">
            {obra.ruas_pavimentadas}/{obra.total_ruas} pavimentadas
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${obra.progresso_ruas_percentual}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{obra.ruas_liberadas} liberadas</span>
          <span>{obra.ruas_pavimentadas} pavimentadas</span>
        </div>
      </div>

      {/* Informações Financeiras */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Valor Total</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(obra.valor_total_previsto)}
          </p>
          <p className="text-xs text-gray-400">
            {formatValorPorUnidade(obra.valor_por_unidade, obra.unidade_cobranca)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Valor Realizado</p>
          <p className="text-sm font-semibold text-green-600">
            {formatCurrency(obra.valor_realizado)}
          </p>
          <p className="text-xs text-gray-400">
            {formatVolume(obra.volume_realizado, obra.unidade_cobranca)} de {formatVolume(obra.volume_total_previsto, obra.unidade_cobranca)}
          </p>
        </div>
      </div>

      {/* Datas */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Início: {formatDateToBR(obra.data_inicio_prevista)}
        </span>
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Conclusão: {formatDateToBR(obra.data_conclusao_prevista)}
        </span>
        {obra.dias_restantes > 0 && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {obra.dias_restantes} dias restantes
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Link to={`/obras/${obra.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </Link>
          <Link to={`/relatorios/new?obra_id=${obra.id}`}>
            <Button variant="primary" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Novo Relatório
            </Button>
          </Link>
        </div>
        
        <div className="text-xs text-gray-500">
          Atualizado em {formatDateToBR(obra.updated_at)}
        </div>
      </div>
    </div>
  )
}


