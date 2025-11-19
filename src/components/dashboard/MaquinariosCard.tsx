import { Truck, HardHat, Drill } from 'lucide-react'
import type { MaquinarioUso } from '../../types/dashboard-pavimentacao'

interface MaquinariosCardProps {
  maquinarios: MaquinarioUso[]
  loading?: boolean
}

export function MaquinariosCard({ maquinarios, loading }: MaquinariosCardProps) {
  const getTipoIcon = (tipo: string) => {
    const tipoLower = tipo.toLowerCase()
    if (tipoLower.includes('rolo') || tipoLower.includes('compactador')) {
      return <HardHat className="w-5 h-5 text-orange-600" />
    }
    if (tipoLower.includes('vibro') || tipoLower.includes('acabadora')) {
      return <Drill className="w-5 h-5 text-purple-600" />
    }
    return <Truck className="w-5 h-5 text-blue-600" />
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maquinários Mais Usados</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!maquinarios || maquinarios.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Maquinários Mais Usados</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Truck className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum maquinário registrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Maquinários Mais Usados</h3>
        <span className="ml-auto text-xs text-gray-500">Este mês</span>
      </div>

      <div className="space-y-2">
        {maquinarios.map((maq, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0">
              {getTipoIcon(maq.tipo)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {maq.maquinario_nome}
              </p>
              <p className="text-xs text-gray-500">{maq.tipo}</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {maq.dias_uso_mes} dias
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {maq.obras_utilizadas} obras
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}





