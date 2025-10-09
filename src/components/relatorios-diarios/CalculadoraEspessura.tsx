import React, { useEffect, useState } from 'react'
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react'
import { calcularEspessura, validarEspessura } from '../../utils/relatorios-diarios-utils'
import { Input } from '../ui/input'

interface CalculadoraEspessuraProps {
  metragem: number
  toneladas: number
  onChange?: (espessura: number) => void
}

export function CalculadoraEspessura({ metragem, toneladas, onChange }: CalculadoraEspessuraProps) {
  const [espessura, setEspessura] = useState(0)
  const [validacao, setValidacao] = useState<{ valida: boolean; mensagem?: string }>({ valida: true })

  useEffect(() => {
    const espessuraCalculada = calcularEspessura(metragem, toneladas)
    setEspessura(espessuraCalculada)
    
    const resultadoValidacao = validarEspessura(espessuraCalculada)
    setValidacao(resultadoValidacao)
    
    if (onChange) {
      onChange(espessuraCalculada)
    }
  }, [metragem, toneladas, onChange])

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Espessura Calculada</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metragem (m²)
            </label>
            <div className="px-4 py-3 bg-white rounded-lg border border-gray-300">
              <span className="text-lg font-semibold text-gray-900">
                {metragem.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Toneladas (ton)
            </label>
            <div className="px-4 py-3 bg-white rounded-lg border border-gray-300">
              <span className="text-lg font-semibold text-gray-900">
                {toneladas.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espessura (cm)
            </label>
            <div className={`px-4 py-3 rounded-lg border-2 ${
              !validacao.valida 
                ? 'bg-red-50 border-red-400' 
                : 'bg-green-50 border-green-400'
            }`}>
              <span className={`text-lg font-bold ${
                !validacao.valida ? 'text-red-700' : 'text-green-700'
              }`}>
                {espessura.toFixed(2)} cm
              </span>
            </div>
          </div>
        </div>

        {/* Fórmula */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Fórmula:</strong> Espessura (cm) = (Toneladas ÷ Metragem ÷ 2,4) × 100
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Densidade do asfalto: 2,4 ton/m³ | Média padrão: 3,5 cm
          </p>
          {metragem > 0 && toneladas > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ({toneladas} ÷ {metragem} ÷ 2,4) × 100 = {espessura.toFixed(2)} cm
            </p>
          )}
        </div>
      </div>

      {/* Validação */}
      {!validacao.valida && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Atenção</p>
            <p className="text-sm text-yellow-700 mt-1">{validacao.mensagem}</p>
          </div>
        </div>
      )}

      {validacao.valida && espessura > 0 && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">Espessura Válida</p>
            <p className="text-sm text-green-700 mt-1">
              A espessura está dentro do intervalo aceitável (2-8 cm).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

