import { useState } from 'react'
import { AlertTriangle, AlertCircle, Info, Wrench, FileText, CreditCard, Shield } from 'lucide-react'
import type { Alerta } from '../../types/dashboard-pavimentacao'
import { AlertaDetailsModal } from './AlertaDetailsModal'

interface AlertasCardProps {
  alertas: Alerta[]
  loading?: boolean
}

export function AlertasCard({ alertas, loading }: AlertasCardProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const [alertaSelecionado, setAlertaSelecionado] = useState<Alerta | null>(null)

  const abrirModal = (alerta: Alerta) => {
    setAlertaSelecionado(alerta)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAlertaSelecionado(null)
  }
  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'manutencao':
        return <Wrench className="w-5 h-5" />
      case 'conta':
        return <CreditCard className="w-5 h-5" />
      case 'documento':
        return <FileText className="w-5 h-5" />
      case 'licenca':
        return <Shield className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStyleByUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'media':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'baixa':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getIconStyleByUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return 'text-red-600'
      case 'media':
        return 'text-yellow-600'
      case 'baixa':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alertas & Pendências</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!alertas || alertas.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Alertas & Pendências</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Info className="w-12 h-12 mx-auto mb-2 text-green-300" />
          <p className="text-sm font-medium text-green-600">Tudo em dia!</p>
          <p className="text-xs text-gray-500 mt-1">Nenhuma pendência no momento</p>
        </div>
      </div>
    )
  }

  const totalAlertas = alertas.reduce((sum, a) => sum + a.quantidade, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Alertas & Pendências</h3>
        <span className="ml-auto bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {totalAlertas}
        </span>
      </div>

      <div className="space-y-2">
        {alertas.map((alerta, index) => (
          <div 
            key={index} 
            onClick={() => abrirModal(alerta)}
            className={`flex items-center gap-3 p-3 border rounded-lg ${getStyleByUrgencia(alerta.urgencia)} transition-all hover:shadow-md cursor-pointer`}
          >
            <div className={`flex-shrink-0 ${getIconStyleByUrgencia(alerta.urgencia)}`}>
              {getIconByTipo(alerta.tipo)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {alerta.mensagem}
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white/50">
                {alerta.quantidade}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalhes */}
      {alertaSelecionado && (
        <AlertaDetailsModal
          isOpen={modalAberto}
          onClose={fecharModal}
          tipo={alertaSelecionado.tipo}
          mensagem={alertaSelecionado.mensagem}
          urgencia={alertaSelecionado.urgencia}
        />
      )}
    </div>
  )
}

