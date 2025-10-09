import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  Ruler, 
  Weight, 
  Users,
  Building,
  ChevronRight
} from 'lucide-react'
import { RelatorioDiario } from '../../types/relatorios-diarios'
import { faixaAsfaltoLabels } from '../../types/parceiros'

interface RelatorioDiarioCardProps {
  relatorio: RelatorioDiario
}

export function RelatorioDiarioCard({ relatorio }: RelatorioDiarioCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/relatorios-diarios/${relatorio.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{relatorio.numero}</h3>
            <p className="text-sm text-gray-500">Relatório Diário</p>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Informações Principais */}
      <div className="space-y-3">
        {/* Cliente e Obra */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700">
            {relatorio.cliente_nome} • {relatorio.obra_nome}
          </span>
        </div>

        {/* Rua */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700">{relatorio.rua_nome}</span>
        </div>

        {/* Data e Horário */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">
              {new Date(relatorio.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">{relatorio.horario_inicio}</span>
          </div>
        </div>

        {/* Equipe */}
        <div className="flex items-center gap-2 text-sm">
          {relatorio.equipe_is_terceira ? (
            <>
              <Building className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="text-gray-700">
                {relatorio.equipe_nome || 'Equipe não informada'}
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                  Terceira
                </span>
              </span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-gray-700">
                {relatorio.equipe_nome || 'Equipe não informada'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-100"></div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Ruler className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {relatorio.metragem_feita.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">m²</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Weight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {relatorio.toneladas_aplicadas.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">ton</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="h-4 w-4 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">cm</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {relatorio.espessura_calculada.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">espessura</p>
        </div>
      </div>

      {/* Faixa Utilizada */}
      {relatorio.faixa_utilizada && (
        <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-900 text-center">
            <strong>Faixa:</strong> {faixaAsfaltoLabels[relatorio.faixa_utilizada]}
          </p>
        </div>
      )}

      {/* Observações (se houver) */}
      {relatorio.observacoes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 line-clamp-2">
            <strong>Obs:</strong> {relatorio.observacoes}
          </p>
        </div>
      )}
    </div>
  )
}

