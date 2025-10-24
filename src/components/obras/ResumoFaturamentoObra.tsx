import React, { useState, useEffect } from 'react'
import { DollarSign, MapPin, Building2, Calculator } from 'lucide-react'
import { calcularFaturamentoTotalObra } from '../../lib/obrasFinanceiroApi'

interface ResumoFaturamentoObraProps {
  obraId: string
}

export function ResumoFaturamentoObra({ obraId }: ResumoFaturamentoObraProps) {
  const [resumo, setResumo] = useState<{
    faturamentoRuas: number
    servicosObraInteira: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarResumo() {
      try {
        setLoading(true)
        const dados = await calcularFaturamentoTotalObra(obraId)
        setResumo(dados)
      } catch (error) {
        console.error('Erro ao carregar resumo do faturamento:', error)
      } finally {
        setLoading(false)
      }
    }

    if (obraId) {
      carregarResumo()
    }
  }, [obraId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!resumo) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <p className="text-gray-500">Erro ao carregar resumo do faturamento</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Calculator className="h-5 w-5 mr-2 text-blue-600" />
        Resumo do Faturamento da Obra
      </h3>

      <div className="space-y-4">
        {/* Faturamento das Ruas */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Faturamento das Ruas</p>
              <p className="text-xs text-blue-700">Inclui serviços por m²/m³ + serviços por viagem</p>
            </div>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(resumo.faturamentoRuas)}
          </p>
        </div>

        {/* Serviços por Obra Inteira */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Serviços por Obra Inteira</p>
              <p className="text-xs text-green-700">Mobilização/Imobilização por obra (cobrado no fechamento)</p>
            </div>
          </div>
          <p className="text-lg font-bold text-green-900">
            {formatCurrency(resumo.servicosObraInteira)}
          </p>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-gray-700 mr-3" />
            <div>
              <p className="text-lg font-semibold text-gray-900">Total da Obra</p>
              <p className="text-sm text-gray-600">Faturamento total incluindo todos os serviços</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(resumo.total)}
          </p>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">ℹ️ Como Funciona a Contabilização:</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• <strong>Serviços por m²/m³:</strong> Contabilizados a cada rua finalizada</li>
          <li>• <strong>Serviços por viagem:</strong> Contabilizados a cada rua finalizada (mobilização/imobilização por viagem)</li>
          <li>• <strong>Serviços por obra inteira:</strong> Contabilizados apenas no fechamento da obra (mobilização/imobilização por obra)</li>
        </ul>
      </div>
    </div>
  )
}
